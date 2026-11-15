import crypto from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

describe("security and webhook fixes", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("/api/health returns minimal status without leaking config or Cashfree mode", async () => {
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      service: "subscription-xray",
    });
    expect("configured" in json).toBe(false);
    expect("missing" in json).toBe(false);
  });

  it("/api/cashfree/diagnostics returns 404 outside development", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    const { GET } = await import("@/app/api/cashfree/diagnostics/route");
    const req = new NextRequest(
      "https://subscription-x-ray.vercel.app/api/cashfree/diagnostics"
    );
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it("/api/webhooks/cashfree returns 422 instead of 200 on amount or currency mismatch", async () => {
    process.env.CASHFREE_APP_ID = "TEST1234567890";
    process.env.CASHFREE_SECRET_KEY = "cfsk_ma_test_secret_key_for_tests";
    process.env.CASHFREE_ENV = "sandbox";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service_role_key_for_tests";

    const payload = JSON.stringify({
      type: "PAYMENT_SUCCESS_WEBHOOK",
      data: {
        order: { order_id: "xray_12345_test" },
        payment: {
          cf_payment_id: "987654",
          payment_status: "SUCCESS",
          payment_amount: 10, // wrong amount (expected 69)
          payment_currency: "INR",
        },
      },
    });
    const timestamp = String(Date.now());
    const signature = crypto
      .createHmac("sha256", process.env.CASHFREE_SECRET_KEY)
      .update(`${timestamp}${payload}`)
      .digest("base64");

    const { POST } = await import("@/app/api/webhooks/cashfree/route");
    const req = new NextRequest(
      "https://subscription-x-ray.vercel.app/api/webhooks/cashfree",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-timestamp": timestamp,
          "x-webhook-signature": signature,
        },
        body: payload,
      }
    );

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(422);
    expect(json.ok).toBe(false);
  });
});
