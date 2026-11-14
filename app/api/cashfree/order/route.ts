import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { cashfreeHeaders, getCashfreeConfig } from "@/lib/cashfree";
import { PACK_PRICE_RUPEES, PACK_SIZE } from "@/lib/config";

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
  const cleanOrigin = origin.replace(/\/+$/, "");

  const res = await fetch(`${cf.baseUrl}/orders`, {
    method: "POST",
    headers: cashfreeHeaders(cf.appId, cf.secretKey),
    body: JSON.stringify({
      order_id: orderId,
      order_amount: PACK_PRICE_RUPEES,
      order_currency: "INR",
      customer_details: {
        customer_id: user.id,
        customer_email: user.email || undefined,
        customer_phone: "9999999999",
      },
      order_meta: {
        return_url: `${cleanOrigin}/scanner?cf_order_id={order_id}`,
        notify_url: `${cleanOrigin}/api/cashfree/webhook`,
      },
      order_tags: {
        user_id: user.id,
        pack_size: String(PACK_SIZE),
      },
      order_note: `Subscription X-Ray ${PACK_SIZE}-scan pack`,
    }),
  });

  if (!res.ok) {
    console.error("Cashfree order creation failed:", res.status, await res.text());
    return NextResponse.json(
      { error: "Could not start the payment. Please try again." },
      { status: 502 }
    );
  }

  const order = await res.json();
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
