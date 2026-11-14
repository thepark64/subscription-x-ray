import { describe, expect, it } from "vitest";
import {
  createMockCashfreeOrderPayload,
  debugCompareCashfreeOrderImplementation,
} from "@/lib/cashfree-debug";

describe("debugCompareCashfreeOrderImplementation", () => {
  it("confirms current buildCashfreeOrderPayload has zero structural errors against Cashfree docs", () => {
    const report = debugCompareCashfreeOrderImplementation({
      origin: "https://subscription-x-ray.vercel.app",
      mode: "production",
    });

    expect(report.compatible).toBe(true);
    expect(report.mismatches.filter((m) => m.severity === "error")).toEqual([]);
    expect(report.referencePayload.order_currency).toBe("INR");
    expect(report.currentPayload.order_currency).toBe("INR");
    expect(
      report.mismatches.some(
        (m) =>
          m.path === "headers.x-api-version" &&
          m.category === "version_or_header"
      )
    ).toBe(true);
  });

  it("flags missing required fields, type mismatches, bad constraints, and extra fields", () => {
    const broken = createMockCashfreeOrderPayload(
      "http://insecure-example.com"
    ) as unknown as Record<string, unknown>;
    broken.order_amount = "69"; // wrong type: should be number
    broken.unexpected_extra = true; // undocumented field
    (broken.customer_details as Record<string, unknown>).customer_phone = "123"; // bad phone
    delete (broken.customer_details as Record<string, unknown>).customer_id; // missing required

    const report = debugCompareCashfreeOrderImplementation({
      origin: "http://insecure-example.com",
      mode: "production",
      overridePayload: broken,
    });

    expect(report.compatible).toBe(false);
    const paths = report.mismatches.map((m) => `${m.severity}:${m.path}`);
    expect(paths).toContain("error:order_amount");
    expect(paths).toContain("error:customer_details.customer_id");
    expect(paths).toContain("error:customer_details.customer_phone");
    expect(paths).toContain("error:order_meta.return_url");
    expect(paths).toContain("warning:unexpected_extra");
  });
});
