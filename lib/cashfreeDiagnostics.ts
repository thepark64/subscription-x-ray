import crypto from "crypto";
import {
  buildCashfreeOrderPayload,
  CASHFREE_API_VERSION,
  cashfreeHeaders,
  cleanEnvValue,
  getCashfreeConfig,
  verifyCashfreeWebhookSignature,
  type CashfreeMode,
  type CashfreeOrderPayload,
} from "@/lib/cashfree";
import { SITE_URL } from "@/lib/config";

export type DiagnosticStepStatus = "pass" | "warn" | "fail" | "skipped";

export type DiagnosticStep = {
  step: number;
  id:
    | "env_vars"
    | "endpoint_resolution"
    | "payload_schema"
    | "webhook_signature"
    | "live_api_probe";
  title: string;
  status: DiagnosticStepStatus;
  summary: string;
  details: Record<string, unknown>;
  remediation?: string;
};

export type CashfreeDiagnosticsReport = {
  ok: boolean;
  checkedAt: string;
  apiVersion: string;
  steps: DiagnosticStep[];
};

const ORDER_ID_RE = /^[a-zA-Z0-9_-]{1,50}$/;
const CUSTOMER_ID_RE = /^[a-zA-Z0-9_-]{1,50}$/;
const PHONE_RE = /^\d{10}$/;
const CURRENCY_RE = /^[A-Z]{3}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function maskCredential(value: string): string {
  if (!value) return "(missing)";
  if (value.length <= 8) return `${"*".repeat(value.length)} (${value.length} chars)`;
  return `****${value.slice(-4)} (${value.length} chars)`;
}

function hasWrappingQuotesOrWhitespace(raw: string | undefined): boolean {
  if (!raw) return false;
  return raw !== raw.trim() || /^["']|["']$/.test(raw.trim());
}

/**
 * Validates a Cashfree PG v3 (2023-08-01) order creation payload against
 * Cashfree's documented field constraints.
 */
export function validateCashfreeOrderPayload(
  payload: CashfreeOrderPayload,
  mode: CashfreeMode
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!ORDER_ID_RE.test(payload.order_id)) {
    errors.push(
      "order_id must be 1–50 characters matching [a-zA-Z0-9_-]."
    );
  }

  if (
    typeof payload.order_amount !== "number" ||
    !Number.isFinite(payload.order_amount) ||
    payload.order_amount <= 0
  ) {
    errors.push("order_amount must be a positive finite number.");
  } else if (Math.round(payload.order_amount * 100) !== payload.order_amount * 100) {
    errors.push("order_amount must have at most 2 decimal places.");
  }

  if (!CURRENCY_RE.test(payload.order_currency)) {
    errors.push("order_currency must be a 3-letter uppercase ISO currency code (e.g. INR).");
  }

  const cd = payload.customer_details;
  if (!cd || typeof cd !== "object") {
    errors.push("customer_details object is required.");
  } else {
    if (!CUSTOMER_ID_RE.test(cd.customer_id)) {
      errors.push(
        "customer_details.customer_id must be 1–50 characters matching [a-zA-Z0-9_-]."
      );
    }
    if (!PHONE_RE.test(cd.customer_phone)) {
      errors.push(
        "customer_details.customer_phone is required and must be a 10-digit numeric string."
      );
    }
    if (cd.customer_email !== undefined && !EMAIL_RE.test(cd.customer_email)) {
      errors.push("customer_details.customer_email must be a valid email address.");
    }
  }

  const meta = payload.order_meta;
  if (!meta?.return_url) {
    errors.push("order_meta.return_url is required.");
  } else {
    try {
      const parsed = new URL(meta.return_url);
      if (mode === "production" && parsed.protocol !== "https:") {
        errors.push("order_meta.return_url must use https:// in production mode.");
      }
      if (!meta.return_url.includes("{order_id}")) {
        warnings.push(
          "order_meta.return_url does not include the {order_id} Cashfree placeholder."
        );
      }
    } catch {
      errors.push("order_meta.return_url is not a valid URL.");
    }
  }

  if (meta?.notify_url) {
    try {
      const parsed = new URL(meta.notify_url);
      if (mode === "production" && parsed.protocol !== "https:") {
        errors.push("order_meta.notify_url must use https:// in production mode.");
      }
    } catch {
      errors.push("order_meta.notify_url is not a valid URL.");
    }
  }

  const tagEntries = Object.entries(payload.order_tags ?? {});
  if (tagEntries.length > 10) {
    errors.push("order_tags supports at most 10 key-value pairs.");
  }
  for (const [k, v] of tagEntries) {
    if (typeof v !== "string" || v.length > 255) {
      errors.push(`order_tags["${k}"] must be a string <= 255 characters.`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Runs a detailed, step-by-step server-side diagnostic of the Cashfree PG v3
 * integration: env loading, mode/endpoint resolution, order payload structure,
 * webhook HMAC signature verification, and an optional live Cashfree API check.
 */
export async function runCashfreeDiagnostics(options?: {
  origin?: string;
  liveProbe?: boolean;
}): Promise<CashfreeDiagnosticsReport> {
  const steps: DiagnosticStep[] = [];
  const rawAppId = process.env.CASHFREE_APP_ID;
  const rawSecret = process.env.CASHFREE_SECRET_KEY;
  const rawEnv = process.env.CASHFREE_ENV;

  const appId = cleanEnvValue(rawAppId);
  const secretKey = cleanEnvValue(rawSecret);
  const envMode = cleanEnvValue(rawEnv).toLowerCase();

  // Step 1: Server-side environment variables
  const appIdIsTest = appId.startsWith("TEST");
  const secretIsTest = secretKey.startsWith("cfsk_ma_test_");
  const secretIsProd = secretKey.startsWith("cfsk_ma_prod_");

  const envIssues: string[] = [];
  const envWarnings: string[] = [];

  if (!appId) envIssues.push("CASHFREE_APP_ID is missing or empty.");
  if (!secretKey) envIssues.push("CASHFREE_SECRET_KEY is missing or empty.");
  if (!envMode) {
    envWarnings.push(
      "CASHFREE_ENV is not explicitly set; mode will be inferred from key prefix."
    );
  } else if (!["sandbox", "test", "production", "prod"].includes(envMode)) {
    envWarnings.push(
      `CASHFREE_ENV="${envMode}" is non-standard (expected "sandbox" or "production").`
    );
  }

  if (
    hasWrappingQuotesOrWhitespace(rawAppId) ||
    hasWrappingQuotesOrWhitespace(rawSecret) ||
    hasWrappingQuotesOrWhitespace(rawEnv)
  ) {
    envWarnings.push(
      "One or more Cashfree env vars contain leading/trailing whitespace or quotes (sanitized at runtime)."
    );
  }

  if (appId && secretKey) {
    if ((appIdIsTest && secretIsProd) || (!appIdIsTest && secretIsTest)) {
      envIssues.push(
        "Mismatch between CASHFREE_APP_ID and CASHFREE_SECRET_KEY (one is test, one is production)."
      );
    }
    if (
      (appIdIsTest || secretIsTest) &&
      (envMode === "production" || envMode === "prod")
    ) {
      envWarnings.push(
        'CASHFREE_ENV is "production" while using test credentials; runtime auto-binds to sandbox.'
      );
    }
    if (
      !appIdIsTest &&
      secretIsProd &&
      (envMode === "sandbox" || envMode === "test")
    ) {
      envWarnings.push(
        'CASHFREE_ENV is "sandbox" while using production credentials; runtime auto-binds to production.'
      );
    }
  }

  steps.push({
    step: 1,
    id: "env_vars",
    title: "Server Environment Variables",
    status: envIssues.length > 0 ? "fail" : envWarnings.length > 0 ? "warn" : "pass",
    summary:
      envIssues.length > 0
        ? envIssues.join(" ")
        : envWarnings.length > 0
          ? envWarnings.join(" ")
          : "CASHFREE_APP_ID, CASHFREE_SECRET_KEY, and CASHFREE_ENV are loaded and consistent.",
    details: {
      CASHFREE_APP_ID: {
        loaded: Boolean(appId),
        masked: maskCredential(appId),
        detectedType: appId ? (appIdIsTest ? "sandbox" : "live_or_custom") : null,
      },
      CASHFREE_SECRET_KEY: {
        loaded: Boolean(secretKey),
        length: secretKey.length,
        detectedType: secretKey
          ? secretIsTest
            ? "sandbox (cfsk_ma_test_*)"
            : secretIsProd
              ? "production (cfsk_ma_prod_*)"
              : "custom"
          : null,
      },
      CASHFREE_ENV: envMode || "(unset)",
    },
    ...(envIssues.length > 0
      ? {
          remediation:
            "Set CASHFREE_APP_ID, CASHFREE_SECRET_KEY, and CASHFREE_ENV in .env.local (or your deployment environment) and restart the server.",
        }
      : {}),
  });

  // Step 2: Endpoint & mode resolution
  const cf = getCashfreeConfig();
  const resolvedOrigin = (options?.origin || SITE_URL).replace(/\/+$/, "");
  const isHttpsOrigin = resolvedOrigin.startsWith("https://");

  if (!cf) {
    steps.push({
      step: 2,
      id: "endpoint_resolution",
      title: "Cashfree Endpoint & API Version Resolution",
      status: "fail",
      summary: "Skipped endpoint resolution because Cashfree credentials are missing.",
      details: { apiVersion: CASHFREE_API_VERSION, origin: resolvedOrigin },
    });
  } else {
    const endpointWarnings: string[] = [];
    if (cf.mode === "production" && !isHttpsOrigin) {
      endpointWarnings.push(
        `Origin "${resolvedOrigin}" is not HTTPS; Cashfree production requires https:// return_url and notify_url.`
      );
    }
    steps.push({
      step: 2,
      id: "endpoint_resolution",
      title: "Cashfree Endpoint & API Version Resolution",
      status: endpointWarnings.length > 0 ? "warn" : "pass",
      summary:
        endpointWarnings.length > 0
          ? endpointWarnings.join(" ")
          : `Resolved ${cf.mode} mode (${cf.baseUrl}) using x-api-version ${CASHFREE_API_VERSION}.`,
      details: {
        mode: cf.mode,
        baseUrl: cf.baseUrl,
        apiVersion: CASHFREE_API_VERSION,
        origin: resolvedOrigin,
      },
    });
  }

  // Step 3: Order Creation Payload Structure Validation
  const sampleOrderId = `xray_diag_${Date.now()}`;
  const samplePayload = buildCashfreeOrderPayload({
    orderId: sampleOrderId,
    userId: "00000000-0000-4000-8000-000000000001",
    email: "diagnostic@example.com",
    origin: resolvedOrigin,
  });
  const payloadMode: CashfreeMode = cf?.mode ?? "sandbox";
  const payloadValidation = validateCashfreeOrderPayload(
    samplePayload,
    payloadMode
  );

  steps.push({
    step: 3,
    id: "payload_schema",
    title: "Order Creation Payload Schema (PG 2023-08-01)",
    status: !payloadValidation.valid
      ? "fail"
      : payloadValidation.warnings.length > 0
        ? "warn"
        : "pass",
    summary: !payloadValidation.valid
      ? payloadValidation.errors.join(" ")
      : payloadValidation.warnings.length > 0
        ? payloadValidation.warnings.join(" ")
        : "Order payload matches Cashfree PG 2023-08-01 required fields and constraints.",
    details: {
      errors: payloadValidation.errors,
      warnings: payloadValidation.warnings,
      samplePayload,
    },
  });

  // Step 4: Webhook Signature Verification Self-Test
  if (!cf) {
    steps.push({
      step: 4,
      id: "webhook_signature",
      title: "Webhook HMAC-SHA256 Verification Self-Test",
      status: "skipped",
      summary: "Skipped because CASHFREE_SECRET_KEY is not configured.",
      details: {},
    });
  } else {
    const testTimestamp = String(Date.now());
    const testBody = JSON.stringify({
      type: "PAYMENT_SUCCESS_WEBHOOK",
      event_time: new Date().toISOString(),
      data: {
        order: {
          order_id: sampleOrderId,
          order_amount: samplePayload.order_amount,
          order_currency: samplePayload.order_currency,
        },
        payment: {
          cf_payment_id: 123456789,
          payment_status: "SUCCESS",
          payment_amount: samplePayload.order_amount,
          payment_currency: samplePayload.order_currency,
        },
      },
    });
    const generatedSig = crypto
      .createHmac("sha256", cf.secretKey)
      .update(`${testTimestamp}${testBody}`)
      .digest("base64");
    const validMatch = verifyCashfreeWebhookSignature(
      testBody,
      testTimestamp,
      generatedSig,
      cf.secretKey
    );
    const tamperedRejected = !verifyCashfreeWebhookSignature(
      testBody,
      testTimestamp,
      `${generatedSig.slice(0, -1)}A`,
      cf.secretKey
    );

    steps.push({
      step: 4,
      id: "webhook_signature",
      title: "Webhook HMAC-SHA256 Verification Self-Test",
      status: validMatch && tamperedRejected ? "pass" : "fail",
      summary:
        validMatch && tamperedRejected
          ? "Webhook HMAC-SHA256 signing and timing-safe verification passed."
          : "Webhook signature verification self-test failed.",
      details: {
        validMatch,
        tamperedRejected,
        webhookVersionSupported: "2022-09-01+",
      },
    });
  }

  // Step 5: Live Cashfree API Probe (optional)
  if (!options?.liveProbe) {
    steps.push({
      step: 5,
      id: "live_api_probe",
      title: "Live Cashfree API Order Probe",
      status: "skipped",
      summary: "Skipped (pass liveProbe: true or ?live=1 to execute an API call).",
      details: {},
    });
  } else if (!cf) {
    steps.push({
      step: 5,
      id: "live_api_probe",
      title: "Live Cashfree API Order Probe",
      status: "fail",
      summary: "Cannot run live API probe without Cashfree credentials.",
      details: {},
    });
  } else {
    try {
      if (cf.mode === "sandbox") {
        const res = await fetch(`${cf.baseUrl}/orders`, {
          method: "POST",
          headers: cashfreeHeaders(cf.appId, cf.secretKey),
          body: JSON.stringify(samplePayload),
          cache: "no-store",
        });
        const text = await res.text();
        let parsed: Record<string, unknown> = {};
        try {
          parsed = text ? JSON.parse(text) : {};
        } catch {
          parsed = { rawPreview: text.slice(0, 160) };
        }

        const hasSession = typeof parsed.payment_session_id === "string";
        steps.push({
          step: 5,
          id: "live_api_probe",
          title: "Live Cashfree Sandbox Order Probe",
          status: res.ok && hasSession ? "pass" : "fail",
          summary:
            res.ok && hasSession
              ? `Sandbox order created (HTTP ${res.status}) with payment_session_id.`
              : `Cashfree Sandbox returned HTTP ${res.status}: ${String(parsed.message || "Unexpected response")}.`,
          details: {
            httpStatus: res.status,
            orderId: parsed.order_id ?? sampleOrderId,
            cfOrderId: parsed.cf_order_id ?? null,
            orderStatus: parsed.order_status ?? null,
            hasPaymentSessionId: hasSession,
            errorCode: parsed.code ?? null,
            errorType: parsed.type ?? null,
          },
          ...(res.status === 401
            ? {
                remediation:
                  "Verify CASHFREE_APP_ID and CASHFREE_SECRET_KEY belong to the same Cashfree Sandbox account.",
              }
            : {}),
        });
      } else {
        // In production mode, probe auth cleanly with a read-only GET (no spurious live orders).
        const res = await fetch(
          `${cf.baseUrl}/orders/diag_nonexistent_order_check`,
          {
            headers: cashfreeHeaders(cf.appId, cf.secretKey),
            cache: "no-store",
          }
        );
        const authOk = res.status !== 401 && res.status !== 403;
        steps.push({
          step: 5,
          id: "live_api_probe",
          title: "Live Cashfree Production Auth Probe (Read-Only)",
          status: authOk ? "pass" : "fail",
          summary: authOk
            ? `Production API authenticated successfully (HTTP ${res.status} on read-only probe).`
            : `Production API authentication failed (HTTP ${res.status}).`,
          details: { httpStatus: res.status, mode: cf.mode },
        });
      }
    } catch (err) {
      steps.push({
        step: 5,
        id: "live_api_probe",
        title: "Live Cashfree API Order Probe",
        status: "fail",
        summary:
          err instanceof Error
            ? `Network error contacting Cashfree: ${err.message}`
            : "Network error contacting Cashfree.",
        details: {},
      });
    }
  }

  const ok = steps.every((s) => s.status !== "fail");

  return {
    ok,
    checkedAt: new Date().toISOString(),
    apiVersion: CASHFREE_API_VERSION,
    steps,
  };
}
