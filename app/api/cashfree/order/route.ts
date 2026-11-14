import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildCashfreeOrderPayload,
  cashfreeHeaders,
  getCashfreeConfig,
} from "@/lib/cashfree";

export const runtime = "nodejs";

/**
 * Creates a Cashfree PG order for one scan pack, tagged with the signed-in
 * user's id. The amount is fixed here on the server.
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

  const { error: profileError } = await admin.from("profiles").upsert(
    { id: user.id, email: user.email?.toLowerCase() ?? null },
    { onConflict: "id", ignoreDuplicates: true }
  );
  if (profileError) {
    console.error("Profile check failed:", profileError.message);
    return NextResponse.json(
      {
        error:
          "Database schema is not initialized yet. Run supabase/schema.sql first.",
      },
      { status: 500 }
    );
  }

  const orderId = `xray_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.nextUrl.origin;

  const payload = buildCashfreeOrderPayload({
    orderId,
    userId: user.id,
    email: user.email ?? undefined,
    origin,
  });

  const res = await fetch(`${cf.baseUrl}/orders`, {
    method: "POST",
    headers: cashfreeHeaders(cf.appId, cf.secretKey),
    body: JSON.stringify(payload),
  });

  const rawText = await res.text();
  if (!res.ok) {
    console.error(`Cashfree order creation failed (${cf.mode}):`, res.status, rawText);
    return NextResponse.json(
      {
        error:
          res.status === 401
            ? `Cashfree authentication failed (${cf.mode} mode). Check CASHFREE_APP_ID and CASHFREE_SECRET_KEY.`
            : "Could not start the payment. Please try again.",
      },
      { status: 502 }
    );
  }

  let order: {
    order_id?: string;
    payment_session_id?: string;
    order_amount?: number;
    order_currency?: string;
  };
  try {
    order = JSON.parse(rawText);
  } catch {
    console.error("Cashfree returned non-JSON:", rawText.slice(0, 200));
    return NextResponse.json(
      { error: "Unexpected response from payment gateway." },
      { status: 502 }
    );
  }
  if (!order?.payment_session_id) {
    console.error("Cashfree order missing payment_session_id:", order);
    return NextResponse.json(
      { error: "Payment session could not be created." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    orderId: order.order_id,
    paymentSessionId: order.payment_session_id,
    mode: cf.mode,
    amount: order.order_amount,
    currency: order.order_currency,
  });
}
