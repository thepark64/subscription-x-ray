import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { PACK_PRICE_PAISE, PACK_SIZE } from "@/lib/config";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function signatureMatches(rawBody: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false, message: "Webhook secret is not configured." }, { status: 500 });

  const rawBody = await req.text();
  if (rawBody.length > 1_000_000) return NextResponse.json({ ok: false, message: "Payload too large." }, { status: 413 });

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature || !signatureMatches(rawBody, signature, secret)) {
    return NextResponse.json({ ok: false, message: "Invalid or missing signature." }, { status: 400 });
  }

  let event: any;
  try { event = JSON.parse(rawBody); }
  catch { return NextResponse.json({ ok: false, message: "Invalid JSON." }, { status: 400 }); }

  if (event.event !== "payment.captured") {
    return NextResponse.json({ ok: true, message: "Event ignored." });
  }

  const payment = event.payload?.payment?.entity;
  const paymentId = typeof payment?.id === "string" ? payment.id : "";
  const orderId = typeof payment?.order_id === "string" ? payment.order_id : "";
  const amountPaise = Number(payment?.amount);
  const currency = payment?.currency;

  if (!paymentId || !orderId || !Number.isSafeInteger(amountPaise)) {
    return NextResponse.json({ ok: false, message: "Payment payload is incomplete." }, { status: 400 });
  }

  // This is a fixed-price pack. Do not credit underpayments OR overpayments.
  if (currency !== "INR" || amountPaise !== PACK_PRICE_PAISE) {
    console.error(`Payment ${paymentId} rejected: amount/currency mismatch.`);
    return NextResponse.json({ ok: true, message: "Payment does not match the configured scan pack." });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const admin = getSupabaseAdmin();
  if (!keyId || !keySecret || !admin) {
    return NextResponse.json({ ok: false, message: "Payment or database configuration is missing." }, { status: 500 });
  }

  // Read order metadata from Razorpay itself, not from user-controlled browser data
  // or an assumed payment.notes field.
  const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64") },
    cache: "no-store",
  });
  if (!orderResponse.ok) {
    console.error(`Could not verify Razorpay order ${orderId}: ${orderResponse.status}`);
    return NextResponse.json({ ok: false, message: "Could not verify order; retry later." }, { status: 500 });
  }

  const order = await orderResponse.json();
  const userId = order?.notes?.user_id;
  const packSize = Number(order?.notes?.pack_size);
  if (
    order?.id !== orderId ||
    order?.status !== "paid" ||
    order?.currency !== "INR" ||
    Number(order?.amount) !== PACK_PRICE_PAISE ||
    Number(order?.amount_paid) < PACK_PRICE_PAISE ||
    packSize !== PACK_SIZE ||
    typeof userId !== "string" ||
    !UUID_RE.test(userId)
  ) {
    console.error(`Order ${orderId} failed Subscription X-Ray validation.`);
    return NextResponse.json({ ok: true, message: "Order metadata or amount did not match." });
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles").select("id").eq("id", userId).maybeSingle();
  if (profileError) {
    console.error("Profile lookup failed:", profileError.message);
    return NextResponse.json({ ok: false, message: "Could not resolve account; retry later." }, { status: 500 });
  }
  if (!profile) {
    console.error(`UNMATCHED PAYMENT ${paymentId}: profile ${userId} not found.`);
    return NextResponse.json({ ok: false, message: "Account not found; retry after account repair." }, { status: 500 });
  }

  // The SQL function inserts the payment and adds credits in one transaction.
  // Unique payment IDs make webhook retries safe and prevent duplicate credits.
  const { data: remaining, error } = await admin.rpc("process_payment", {
    p_user: userId,
    p_payment_id: paymentId,
    p_order_id: orderId,
    p_amount: amountPaise / 100,
    p_credits: PACK_SIZE,
  });

  if (error) {
    console.error(`process_payment failed for ${paymentId}:`, error.message);
    return NextResponse.json({ ok: false, message: "Could not record payment; Razorpay may retry." }, { status: 500 });
  }
  if (remaining === null) return NextResponse.json({ ok: true, message: "Duplicate event already processed." });
  return NextResponse.json({ ok: true, scanCreditsRemaining: remaining });
}
