import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { cashfreeHeaders, getCashfreeConfig } from "@/lib/cashfree";
import { PACK_PRICE_RUPEES, PACK_SIZE } from "@/lib/config";

export const runtime = "nodejs";

type CashfreePayment = {
  cf_payment_id?: number | string;
  payment_status?: string;
  payment_amount?: number;
  payment_currency?: string;
};

/**
 * Verifies a Cashfree order server-side directly against Cashfree's PG API
 * and credits scan packs idempotently via `process_payment`.
 */
export async function POST(req: NextRequest) {
  const cf = getCashfreeConfig();
  const admin = getSupabaseAdmin();
  if (!cf || !admin) {
    return NextResponse.json(
      { error: "Payments are not configured yet." },
      { status: 500 }
    );
  }

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json(
      { error: "Please sign in first." },
      { status: 401 }
    );
  }

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  let body: { orderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  if (!orderId || !/^[a-zA-Z0-9_-]{4,64}$/.test(orderId)) {
    return NextResponse.json(
      { error: "Invalid Cashfree order ID." },
      { status: 400 }
    );
  }

  const headers = cashfreeHeaders(cf.appId, cf.secretKey);

  const orderRes = await fetch(
    `${cf.baseUrl}/orders/${encodeURIComponent(orderId)}`,
    { headers, cache: "no-store" }
  );
  if (!orderRes.ok) {
    return NextResponse.json(
      { error: "Could not verify Cashfree order." },
      { status: 502 }
    );
  }

  const order = await orderRes.json();
  if (
    order?.order_id !== orderId ||
    order?.order_currency !== "INR" ||
    Number(order?.order_amount) !== PACK_PRICE_RUPEES ||
    order?.order_tags?.user_id !== user.id ||
    Number(order?.order_tags?.pack_size) !== PACK_SIZE
  ) {
    return NextResponse.json(
      { error: "Order details did not match this account." },
      { status: 400 }
    );
  }

  if (order.order_status !== "PAID") {
    return NextResponse.json(
      {
        pending: true,
        status: order.order_status,
        message: "Payment is still processing.",
      },
      { status: 202 }
    );
  }

  const paymentsRes = await fetch(
    `${cf.baseUrl}/orders/${encodeURIComponent(orderId)}/payments`,
    { headers, cache: "no-store" }
  );
  if (!paymentsRes.ok) {
    return NextResponse.json(
      { error: "Could not fetch payment confirmation from Cashfree." },
      { status: 502 }
    );
  }

  const payments = (await paymentsRes.json()) as CashfreePayment[];
  const paidAttempt = Array.isArray(payments)
    ? payments.find(
        (p) =>
          p.payment_status === "SUCCESS" &&
          p.payment_currency === "INR" &&
          Number(p.payment_amount) === PACK_PRICE_RUPEES &&
          p.cf_payment_id !== undefined &&
          p.cf_payment_id !== null
      )
    : undefined;

  if (!paidAttempt) {
    return NextResponse.json(
      {
        pending: true,
        status: "PENDING",
        message: "Payment confirmation is pending.",
      },
      { status: 202 }
    );
  }

  const { error: profileUpsertError } = await admin.from("profiles").upsert(
    { id: user.id, email: user.email?.toLowerCase() ?? null },
    { onConflict: "id", ignoreDuplicates: true }
  );
  if (profileUpsertError) {
    console.error("Profile check failed:", profileUpsertError.message);
    return NextResponse.json(
      {
        error:
          "Could not load your profile. Make sure supabase/schema.sql has been run.",
      },
      { status: 500 }
    );
  }

  const { data: remaining, error: rpcError } = await admin.rpc(
    "process_payment",
    {
      p_user: user.id,
      p_payment_id: `cf_${String(paidAttempt.cf_payment_id)}`,
      p_order_id: orderId,
      p_amount: PACK_PRICE_RUPEES,
      p_credits: PACK_SIZE,
    }
  );

  if (rpcError) {
    console.error("process_payment failed:", rpcError.message);
    return NextResponse.json(
      {
        error:
          "Could not credit scans. Please contact support with your order ID.",
      },
      { status: 500 }
    );
  }

  if (remaining === null) {
    const { data: profile } = await admin
      .from("profiles")
      .select("scan_credits")
      .eq("id", user.id)
      .maybeSingle();
    return NextResponse.json({
      ok: true,
      scanCreditsRemaining: profile?.scan_credits ?? 0,
    });
  }

  return NextResponse.json({ ok: true, scanCreditsRemaining: remaining });
}
