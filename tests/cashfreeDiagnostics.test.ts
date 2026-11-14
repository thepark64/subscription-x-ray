import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildCashfreeOrderPayload } from "@/lib/cashfree";
import {
  runCashfreeDiagnostics,
  validateCashfreeOrderPayload,
} from "@/lib/cashfreeDiagnostics";

describe("validateCashfreeOrderPayload", () => {
  it("accepts a valid Cashfree PG 2023-08-01 order payload", () => {
    const payload = buildCashfreeOrderPayload({
      orderId: "xray_123456_abcd",
      userId: "550e8400-e29b-41d4-a716-446655440000",
      email: "user@example.com",
      origin: "https://subscription-x-ray.vercel.app",
    });

    const result = validateCashfreeOrderPayload(payload, "production");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("rejects invalid order_id, non-10-digit phone, and http return_url in production", () => {
    const payload = buildCashfreeOrderPayload({
      orderId: "bad order id!",
      userId: "user_1",
      origin: "http://example.com",
    });
    payload.customer_details.customer_phone = "12345";

    const result = validateCashfreeOrderPayload(payload, "production");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe("runCashfreeDiagnostics", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("fails env_vars step when Cashfree env vars are missing", async () => {
    delete process.env.CASHFREE_APP_ID;
    delete process.env.CASHFREE_SECRET_KEY;
    delete process.env.CASHFREE_ENV;

    const report = await runCashfreeDiagnostics({
      origin: "https://subscription-x-ray.vercel.app",
      liveProbe: false,
    });

    expect(report.ok).toBe(false);
    expect(report.steps[0].id).toBe("env_vars");
    expect(report.steps[0].status).toBe("fail");
  });

  it("passes steps 1-4 when valid sandbox env vars are loaded", async () => {
    process.env.CASHFREE_APP_ID = "TEST1234567890";
    process.env.CASHFREE_SECRET_KEY = "cfsk_ma_test_example_secret_key_12345";
    process.env.CASHFREE_ENV = "sandbox";

    const report = await runCashfreeDiagnostics({
      origin: "https://subscription-x-ray.vercel.app",
      liveProbe: false,
    });

    expect(report.ok).toBe(true);
    expect(report.steps.find((s) => s.id === "env_vars")?.status).toBe("pass");
    expect(report.steps.find((s) => s.id === "endpoint_resolution")?.status).toBe("pass");
    expect(report.steps.find((s) => s.id === "payload_schema")?.status).toBe("pass");
    expect(report.steps.find((s) => s.id === "webhook_signature")?.status).toBe("pass");
  });

  it("warns when CASHFREE_ENV=production conflicts with TEST credentials", async () => {
    process.env.CASHFREE_APP_ID = "TEST1234567890";
    process.env.CASHFREE_SECRET_KEY = "cfsk_ma_test_example_secret_key_12345";
    process.env.CASHFREE_ENV = "production";

    const report = await runCashfreeDiagnostics({
      origin: "https://subscription-x-ray.vercel.app",
      liveProbe: false,
    });

    const envStep = report.steps.find((s) => s.id === "env_vars");
    const endpointStep = report.steps.find((s) => s.id === "endpoint_resolution");
    expect(envStep?.status).toBe("warn");
    expect(endpointStep?.details.mode).toBe("sandbox");
  });
});
