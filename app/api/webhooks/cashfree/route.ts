import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  cashfreeHeaders,
  getCashfreeConfig,
  verifyCashfreeWebhookSignature,
} from "@/lib/cashfree";
import { PACK_PRICE_RUPEES, PACK_SIZE } from "@/lib/config";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "webhooks/cashfree" });
}

export async function POST(req: NextRequest) {
  const cf = getCashfreeConfig();
  if (!cf) {
    return NextResponse.json(
      { ok: false, message: "Cashfree configuration is missing." },
      { status: 500 }
    );
  }

  const rawBody = await req.text();
  if (rawBody.length > 1_000_000) {
    return NextResponse.json(
      { ok: false, message: "Payload too large." },
      { status: 413 }
    );
  }

  // Handle empty reachability pings from dashboard endpoint checks.
  if (!rawBody.trim()) {
    return NextResponse.json({ ok: true, message: "Webhook endpoint ready." });
  }

  let event: {
    type?: string;
    data?: {
      test_object?: Record<string, unknown>;
      order?: { order_id?: string };
      payment?: {
        cf_payment_id?: number | string;
        payment_status?: string;
        payment_amount?: number;
        payment_currency?: string;
      };
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON." },
      { status: 400 }
    );
  }

  const signature = req.headers.get("x-webhook-signature") ?? "";
  const timestamp = req.headers.get("x-webhook-timestamp") ?? "";

  // Cashfree Dashboard "Test" sends a test_object payload; acknowledge without
  // mutating database state.
  if (event.data?.test_object && event.type !== "PAYMENT_SUCCESS_WEBHOOK") {
    if (
      signature &&
      timestamp &&
      !verifyCashfreeWebhookSignature(rawBody, timestamp, signature, cf.secretKey)
    ) {
      return NextResponse.json(
        { ok: false, message: "Invalid test signature." },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, message: "Test webhook received." });
  }

  if (
    !signature ||
    !timestamp ||
    !verifyCashfreeWebhookSignature(rawBody, timestamp, signature, cf.secretKey)
  ) {
    return NextResponse.json(
      { ok: false, message: "Invalid or missing signature." },
      { status: 400 }
    );
  }

  if (event.type !== "PAYMENT_SUCCESS_WEBHOOK") {
    return NextResponse.json({ ok: true, message: "Event ignored." });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { ok: false, message: "Database configuration is missing." },
      { status: 500 }
    );
  }

  const orderId = event.data?.order?.order_id?.trim() ?? "";
  const cfPaymentId = event.data?.payment?.cf_payment_id;
  const paymentStatus = event.data?.payment?.payment_status;
  const paymentAmount = Number(event.data?.payment?.payment_amount);
  const paymentCurrency = event.data?.payment?.payment_currency;

  if (
    !orderId ||
    cfPaymentId === undefined ||
    cfPaymentId === null ||
    paymentStatus !== "SUCCESS"
  ) {
    return NextResponse.json(
      { ok: false, message: "Payment payload is incomplete." },
      { status: 400 }
    );
  }

  if (paymentCurrency !== "INR" || paymentAmount !== PACK_PRICE_RUPEES) {
    console.error("Cashfree webhook payment mismatch:", {
      orderId,
      cfPaymentId: String(cfPaymentId),
      expectedAmount: PACK_PRICE_RUPEES,
      receivedAmount: paymentAmount,
      expectedCurrency: "INR",
      receivedCurrency: paymentCurrency,
    });
    return NextResponse.json(
      {
        ok: false,
        error: "Payment amount or currency does not match the configured scan pack.",
      },
      { status: 422 }
    );
  }

  // Always verify order directly with Cashfree PG API before crediting.
  const orderRes = await fetch(
    `${cf.baseUrl}/orders/${encodeURIComponent(orderId)}`,
    {
      headers: cashfreeHeaders(cf.appId, cf.secretKey),
      cache: "no-store",
    }
  );
  if (!orderRes.ok) {
    console.error(
      `Could not verify Cashfree order ${orderId}: ${orderRes.status}`
    );
    return NextResponse.json(
      { ok: false, message: "Could not verify order; retry later." },
      { status: 500 }
    );
  }

  let order: {
    order_id?: string;
    order_status?: string;
    order_currency?: string;
    order_amount?: number;
    order_tags?: { user_id?: string; pack_size?: string };
  };
  try {
    order = JSON.parse(await orderRes.text());
  } catch {
    console.error(`Cashfree order ${orderId} lookup returned non-JSON.`);
    return NextResponse.json(
      { ok: false, message: "Invalid order verification response." },
      { status: 502 }
    );
  }

  const userId = order?.order_tags?.user_id;
  const packSize = Number(order?.order_tags?.pack_size);

  if (order?.order_status !== "PAID") {
    console.error("Cashfree webhook order not yet PAID:", {
      orderId,
      cfPaymentId: String(cfPaymentId),
      orderStatus: order?.order_status ?? null,
    });
    return NextResponse.json(
      {
        ok: false,
        error: "Order is not in PAID status yet; retry later.",
      },
      { status: 503 }
    );
  }

  if (
    order?.order_id !== orderId ||
    order?.order_currency !== "INR" ||
    Number(order?.order_amount) !== PACK_PRICE_RUPEES ||
    packSize !== PACK_SIZE ||
    typeof userId !== "string" ||
    !UUID_RE.test(userId)
  ) {
    console.error("Cashfree webhook order validation mismatch:", {
      orderId,
      cfPaymentId: String(cfPaymentId),
      orderCurrency: order?.order_currency ?? null,
      orderAmount: order?.order_amount ?? null,
      packSize,
      userId: userId ?? null,
    });
    return NextResponse.json(
      {
        ok: false,
        error: "Order metadata, currency, or amount did not match.",
      },
      { status: 422 }
    );
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Profile lookup failed:", profileError.message);
    return NextResponse.json(
      { ok: false, message: "Could not resolve account; retry later." },
      { status: 500 }
    );
  }
  if (!profile) {
    console.error(
      `UNMATCHED PAYMENT ${cfPaymentId}: profile ${userId} not found.`
    );
    return NextResponse.json(
      { ok: false, message: "Account not found; retry after account repair." },
      { status: 500 }
    );
  }

  const { data: remaining, error } = await admin.rpc("process_payment", {
    p_user: userId,
    p_payment_id: `cf_${String(cfPaymentId)}`,
    p_order_id: orderId,
    p_amount: PACK_PRICE_RUPEES,
    p_credits: PACK_SIZE,
  });

  if (error) {
    console.error(`process_payment failed for ${cfPaymentId}:`, error.message);
    return NextResponse.json(
      { ok: false, message: "Could not record payment; Cashfree may retry." },
      { status: 500 }
    );
  }
  if (remaining === null) {
    return NextResponse.json({
      ok: true,
      message: "Duplicate event already processed.",
    });
  }
  return NextResponse.json({ ok: true, scanCreditsRemaining: remaining });
}
