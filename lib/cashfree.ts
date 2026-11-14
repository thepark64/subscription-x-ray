import crypto from "crypto";
import { PACK_PRICE_RUPEES, PACK_SIZE } from "@/lib/config";

export const CASHFREE_API_VERSION = "2023-08-01";

export type CashfreeMode = "sandbox" | "production";

export type CashfreeOrderPayload = {
  order_id: string;
  order_amount: number;
  order_currency: "INR";
  customer_details: {
    customer_id: string;
    customer_email?: string;
    customer_phone: string;
  };
  order_meta: {
    return_url: string;
    notify_url: string;
  };
  order_tags: Record<string, string>;
  order_note: string;
};

export function cleanEnvValue(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "").trim();
}

export function getCashfreeConfig(): {
  appId: string;
  secretKey: string;
  mode: CashfreeMode;
  baseUrl: string;
} | null {
  const appId = cleanEnvValue(process.env.CASHFREE_APP_ID);
  const secretKey = cleanEnvValue(process.env.CASHFREE_SECRET_KEY);
  if (!appId || !secretKey) return null;

  const envMode = cleanEnvValue(process.env.CASHFREE_ENV).toLowerCase();

  // Cashfree test/prod keys are strictly bound to their respective environments:
  // TEST* / cfsk_ma_test_* only authenticate against sandbox.cashfree.com,
  // while cfsk_ma_prod_* only authenticates against api.cashfree.com.
  const isTestCreds =
    appId.startsWith("TEST") || secretKey.startsWith("cfsk_ma_test_");
  const isProdCreds =
    !appId.startsWith("TEST") && secretKey.startsWith("cfsk_ma_prod_");

  const mode: CashfreeMode = isTestCreds
    ? "sandbox"
    : isProdCreds
      ? "production"
      : envMode === "production" || envMode === "prod"
        ? "production"
        : "sandbox";

  const baseUrl =
    mode === "sandbox"
      ? "https://sandbox.cashfree.com/pg"
      : "https://api.cashfree.com/pg";

  return { appId, secretKey, mode, baseUrl };
}

export function buildCashfreeOrderPayload(params: {
  orderId: string;
  userId: string;
  email?: string;
  origin: string;
}): CashfreeOrderPayload {
  const cleanOrigin = params.origin.replace(/\/+$/, "");
  return {
    order_id: params.orderId,
    order_amount: PACK_PRICE_RUPEES,
    order_currency: "INR",
    customer_details: {
      customer_id: params.userId,
      ...(params.email ? { customer_email: params.email } : {}),
      customer_phone: "9999999999",
    },
    order_meta: {
      return_url: `${cleanOrigin}/scanner?cf_order_id={order_id}`,
      notify_url: `${cleanOrigin}/api/webhooks/cashfree`,
    },
    order_tags: {
      user_id: params.userId,
      pack_size: String(PACK_SIZE),
    },
    order_note: `Subscription X-Ray ${PACK_SIZE}-scan pack`,
  };
}

export function cashfreeHeaders(appId: string, secretKey: string) {
  return {
    "Content-Type": "application/json",
    "x-api-version": CASHFREE_API_VERSION,
    "x-client-id": appId,
    "x-client-secret": secretKey,
  };
}

export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
  secretKey: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(`${timestamp}${rawBody}`)
    .digest("base64");
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
