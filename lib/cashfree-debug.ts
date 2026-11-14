import {
  buildCashfreeOrderPayload,
  CASHFREE_API_VERSION,
  cashfreeHeaders,
  type CashfreeMode,
  type CashfreeOrderPayload,
} from "@/lib/cashfree";
import { PACK_PRICE_RUPEES, PACK_SIZE, SITE_URL } from "@/lib/config";

export const LATEST_CASHFREE_DOC_API_VERSION = "2025-01-01";

export type CashfreeDocOrderPayload = {
  order_id: string;
  order_amount: number;
  order_currency: string;
  customer_details: {
    customer_id: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone: string;
  };
  order_meta?: {
    return_url?: string;
    notify_url?: string;
    payment_methods?: string;
  };
  order_tags?: Record<string, string>;
  order_note?: string;
};

export type StructuralMismatchSeverity = "error" | "warning" | "info";

export type StructuralMismatchCategory =
  | "missing_required"
  | "missing_optional"
  | "type_mismatch"
  | "extra_field"
  | "constraint"
  | "version_or_header";

export type StructuralMismatch = {
  path: string;
  severity: StructuralMismatchSeverity;
  category: StructuralMismatchCategory;
  expected: string;
  actual: string;
  message: string;
};

export type CashfreePayloadComparisonReport = {
  compatible: boolean;
  implementedApiVersion: string;
  latestDocApiVersion: string;
  mode: CashfreeMode;
  referencePayload: CashfreeDocOrderPayload;
  currentPayload: Record<string, unknown>;
  mismatches: StructuralMismatch[];
  summary: string;
};

type FieldRule = {
  required: boolean;
  type: "string" | "number" | "object";
  children?: Record<string, FieldRule>;
};

/**
 * Schema rules derived from Cashfree Payment Gateway Create Order documentation
 * (PG API v2023-08-01 / v2025-01-01).
 */
const CASHFREE_ORDER_SCHEMA: Record<string, FieldRule> = {
  order_id: { required: false, type: "string" },
  order_amount: { required: true, type: "number" },
  order_currency: { required: true, type: "string" },
  customer_details: {
    required: true,
    type: "object",
    children: {
      customer_id: { required: true, type: "string" },
      customer_phone: { required: true, type: "string" },
      customer_name: { required: false, type: "string" },
      customer_email: { required: false, type: "string" },
    },
  },
  order_meta: {
    required: false,
    type: "object",
    children: {
      return_url: { required: false, type: "string" },
      notify_url: { required: false, type: "string" },
      payment_methods: { required: false, type: "string" },
    },
  },
  order_tags: { required: false, type: "object" },
  order_note: { required: false, type: "string" },
};

/**
 * Generates a canonical mock order payload matching the latest Cashfree PG API
 * documentation (2025-01-01).
 */
export function createMockCashfreeOrderPayload(
  origin = SITE_URL
): CashfreeDocOrderPayload {
  const cleanOrigin = origin.replace(/\/+$/, "");
  return {
    order_id: "order_mock_1700000000_abcd",
    order_amount: PACK_PRICE_RUPEES,
    order_currency: "INR",
    customer_details: {
      customer_id: "550e8400-e29b-41d4-a716-446655440000",
      customer_name: "Demo Customer",
      customer_email: "customer@example.com",
      customer_phone: "9876543210",
    },
    order_meta: {
      return_url: `${cleanOrigin}/scanner?cf_order_id={order_id}`,
      notify_url: `${cleanOrigin}/api/webhooks/cashfree`,
      payment_methods: "cc,dc,upi,nb",
    },
    order_tags: {
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      pack_size: String(PACK_SIZE),
    },
    order_note: `Subscription X-Ray ${PACK_SIZE}-scan pack`,
  };
}

function describeType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function compareNode(
  pathPrefix: string,
  schema: Record<string, FieldRule>,
  actualObj: Record<string, unknown>,
  referenceObj: Record<string, unknown>,
  mismatches: StructuralMismatch[]
) {
  for (const [key, rule] of Object.entries(schema)) {
    const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    const hasKey = Object.prototype.hasOwnProperty.call(actualObj, key);
    const actualVal = actualObj[key];

    if (!hasKey || actualVal === undefined) {
      if (rule.required) {
        mismatches.push({
          path: fullPath,
          severity: "error",
          category: "missing_required",
          expected: `${rule.type} (required)`,
          actual: "missing",
          message: `Required Cashfree field "${fullPath}" is missing.`,
        });
      } else if (Object.prototype.hasOwnProperty.call(referenceObj, key)) {
        mismatches.push({
          path: fullPath,
          severity: "info",
          category: "missing_optional",
          expected: `${rule.type} (optional in docs)`,
          actual: "omitted",
          message: `Optional Cashfree field "${fullPath}" from reference payload is omitted in current implementation.`,
        });
      }
      continue;
    }

    const actualType = describeType(actualVal);
    if (actualType !== rule.type) {
      mismatches.push({
        path: fullPath,
        severity: "error",
        category: "type_mismatch",
        expected: rule.type,
        actual: actualType,
        message: `Field "${fullPath}" has type "${actualType}" instead of "${rule.type}".`,
      });
      continue;
    }

    if (
      rule.type === "object" &&
      rule.children &&
      actualVal &&
      typeof actualVal === "object" &&
      !Array.isArray(actualVal)
    ) {
      const refChild =
        referenceObj[key] && typeof referenceObj[key] === "object"
          ? (referenceObj[key] as Record<string, unknown>)
          : {};
      compareNode(
        fullPath,
        rule.children,
        actualVal as Record<string, unknown>,
        refChild,
        mismatches
      );
    }
  }

  for (const actualKey of Object.keys(actualObj)) {
    if (!Object.prototype.hasOwnProperty.call(schema, actualKey)) {
      const fullPath = pathPrefix ? `${pathPrefix}.${actualKey}` : actualKey;
      mismatches.push({
        path: fullPath,
        severity: "warning",
        category: "extra_field",
        expected: "not in documented schema",
        actual: describeType(actualObj[actualKey]),
        message: `Unexpected field "${fullPath}" is not part of the standard Cashfree Create Order schema.`,
      });
    }
  }
}

/**
 * Diagnostic test function that mocks an order creation payload according to
 * the latest Cashfree PG documentation and compares it against the current
 * `buildCashfreeOrderPayload` + `cashfreeHeaders` implementation to identify
 * structural, type, header, and constraint mismatches.
 */
export function debugCompareCashfreeOrderImplementation(options?: {
  origin?: string;
  mode?: CashfreeMode;
  overridePayload?: Record<string, unknown>;
}): CashfreePayloadComparisonReport {
  const origin = (options?.origin || SITE_URL).replace(/\/+$/, "");
  const mode: CashfreeMode = options?.mode ?? "production";

  const referencePayload = createMockCashfreeOrderPayload(origin);
  const generatedPayload: CashfreeOrderPayload = buildCashfreeOrderPayload({
    orderId: "xray_1700000000_abcd1234",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    email: "customer@example.com",
    origin,
  });

  const currentPayload: Record<string, unknown> =
    options?.overridePayload ??
    (generatedPayload as unknown as Record<string, unknown>);

  const mismatches: StructuralMismatch[] = [];

  // 1. Deep structural & type comparison against latest Cashfree schema
  compareNode(
    "",
    CASHFREE_ORDER_SCHEMA,
    currentPayload,
    referencePayload as unknown as Record<string, unknown>,
    mismatches
  );

  // 2. Documented value constraints
  if (typeof currentPayload.order_id === "string") {
    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(currentPayload.order_id)) {
      mismatches.push({
        path: "order_id",
        severity: "error",
        category: "constraint",
        expected: "1-50 chars matching [a-zA-Z0-9_-]",
        actual: currentPayload.order_id,
        message: "order_id violates Cashfree's 1-50 alphanumeric/_/- constraint.",
      });
    }
  }

  const cd = currentPayload.customer_details as
    | Record<string, unknown>
    | undefined;
  if (cd && typeof cd === "object") {
    if (
      typeof cd.customer_id === "string" &&
      !/^[a-zA-Z0-9_-]{1,50}$/.test(cd.customer_id)
    ) {
      mismatches.push({
        path: "customer_details.customer_id",
        severity: "error",
        category: "constraint",
        expected: "1-50 chars matching [a-zA-Z0-9_-]",
        actual: cd.customer_id,
        message: "customer_id violates Cashfree's 1-50 character constraint.",
      });
    }
    if (
      typeof cd.customer_phone === "string" &&
      !/^(\+\d{1,3})?\d{10}$/.test(cd.customer_phone)
    ) {
      mismatches.push({
        path: "customer_details.customer_phone",
        severity: "error",
        category: "constraint",
        expected: "10-digit phone (optionally with country code)",
        actual: cd.customer_phone,
        message: "customer_phone does not match Cashfree's phone format.",
      });
    }
  }

  const meta = currentPayload.order_meta as
    | Record<string, unknown>
    | undefined;
  if (meta && typeof meta === "object") {
    for (const urlField of ["return_url", "notify_url"] as const) {
      const val = meta[urlField];
      if (typeof val === "string") {
        if (mode === "production" && !val.startsWith("https://")) {
          mismatches.push({
            path: `order_meta.${urlField}`,
            severity: "error",
            category: "constraint",
            expected: "https:// URL in production mode",
            actual: val,
            message: `order_meta.${urlField} must use HTTPS in production mode.`,
          });
        }
        if (urlField === "return_url" && !val.includes("{order_id}")) {
          mismatches.push({
            path: "order_meta.return_url",
            severity: "warning",
            category: "constraint",
            expected: "contains {order_id} placeholder",
            actual: val,
            message:
              "order_meta.return_url is missing Cashfree's {order_id} dynamic placeholder.",
          });
        }
      }
    }
  }

  const tags = currentPayload.order_tags as Record<string, unknown> | undefined;
  if (tags && typeof tags === "object") {
    const entries = Object.entries(tags);
    if (entries.length > 10) {
      mismatches.push({
        path: "order_tags",
        severity: "error",
        category: "constraint",
        expected: "<= 10 tag entries",
        actual: `${entries.length} entries`,
        message: "order_tags exceeds Cashfree's 10-tag limit.",
      });
    }
    for (const [k, v] of entries) {
      if (typeof v !== "string" || v.length > 255) {
        mismatches.push({
          path: `order_tags.${k}`,
          severity: "error",
          category: "constraint",
          expected: "string <= 255 chars",
          actual: `${describeType(v)}`,
          message: `order_tags.${k} must be a string <= 255 characters.`,
        });
      }
    }
  }

  // 3. Header & API version comparison against latest 2025-01-01 docs
  const headers = cashfreeHeaders("sample_id", "sample_secret") as Record<
    string,
    string
  >;
  if (headers["x-api-version"] !== LATEST_CASHFREE_DOC_API_VERSION) {
    mismatches.push({
      path: "headers.x-api-version",
      severity: "info",
      category: "version_or_header",
      expected: LATEST_CASHFREE_DOC_API_VERSION,
      actual: headers["x-api-version"] ?? "(missing)",
      message: `Implementation targets Cashfree API "${headers["x-api-version"]}" while the latest documented version is "${LATEST_CASHFREE_DOC_API_VERSION}". Both support the same core order schema.`,
    });
  }
  if (!Object.prototype.hasOwnProperty.call(headers, "Accept")) {
    mismatches.push({
      path: "headers.Accept",
      severity: "info",
      category: "version_or_header",
      expected: "application/json",
      actual: "(omitted)",
      message:
        'Latest Cashfree docs recommend sending "Accept: application/json" alongside "Content-Type: application/json".',
    });
  }

  const errors = mismatches.filter((m) => m.severity === "error");
  const warnings = mismatches.filter((m) => m.severity === "warning");
  const infos = mismatches.filter((m) => m.severity === "info");

  const summary =
    errors.length === 0
      ? `Payload structure is compatible (${warnings.length} warnings, ${infos.length} informational differences vs ${LATEST_CASHFREE_DOC_API_VERSION} docs).`
      : `Found ${errors.length} structural error(s), ${warnings.length} warning(s), and ${infos.length} informational note(s).`;

  return {
    compatible: errors.length === 0,
    implementedApiVersion: CASHFREE_API_VERSION,
    latestDocApiVersion: LATEST_CASHFREE_DOC_API_VERSION,
    mode,
    referencePayload,
    currentPayload,
    mismatches,
    summary,
  };
}
