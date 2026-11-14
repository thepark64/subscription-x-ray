import crypto from "crypto";

export const CASHFREE_API_VERSION = "2023-08-01";

export type CashfreeMode = "sandbox" | "production";

export function getCashfreeConfig(): {
  appId: string;
  secretKey: string;
  mode: CashfreeMode;
  baseUrl: string;
} | null {
  const appId = process.env.CASHFREE_APP_ID?.trim();
  const secretKey = process.env.CASHFREE_SECRET_KEY?.trim();
  if (!appId || !secretKey) return null;

  const envMode = process.env.CASHFREE_ENV?.trim().toLowerCase();
  const mode: CashfreeMode =
    envMode === "production" || envMode === "prod"
      ? "production"
      : envMode === "sandbox" || envMode === "test"
        ? "sandbox"
        : appId.startsWith("TEST")
          ? "sandbox"
          : "production";

  const baseUrl =
    mode === "sandbox"
      ? "https://sandbox.cashfree.com/pg"
      : "https://api.cashfree.com/pg";

  return { appId, secretKey, mode, baseUrl };
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
