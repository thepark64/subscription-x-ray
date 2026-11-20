import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  buildTrustedTypesReportOnlyPolicy,
} from "@/lib/securityHeaders";

describe("security headers", () => {
  it("builds a CSP preserving Cashfree, Supabase, PDF.js worker, and self-hosted fonts", () => {
    const csp = buildContentSecurityPolicy({
      isProduction: true,
      isVercelDeployment: true,
      supabaseUrl: "https://demo-proj.supabase.co",
    });

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline' https://sdk.cashfree.com https://va.vercel-scripts.com https://www.googletagmanager.com");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("connect-src 'self' https://*.supabase.co wss://*.supabase.co");
    expect(csp).toContain("https://demo-proj.supabase.co");
    expect(csp).toContain("wss://demo-proj.supabase.co");
    expect(csp).toContain("https://sdk.cashfree.com");
    expect(csp).toContain("https://api.cashfree.com");
    expect(csp).toContain("https://www.googletagmanager.com");
    expect(csp).toContain("https://www.google-analytics.com");
    expect(csp).toContain("https://*.analytics.google.com");
    expect(csp).toContain("frame-src 'self' https://sdk.cashfree.com https://*.cashfree.com");
    expect(csp).toContain("worker-src 'self' blob:");
    expect(csp).toContain("form-action 'self' https://sdk.cashfree.com https://*.cashfree.com");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("includes COOP, X-Frame-Options, HSTS, and Trusted Types Report-Only in production", () => {
    const headers = buildSecurityHeaders({
      isProduction: true,
      isVercelDeployment: true,
    });
    const byKey = new Map(headers.map((h) => [h.key, h.value]));

    expect(byKey.get("Cross-Origin-Opener-Policy")).toBe(
      "same-origin-allow-popups"
    );
    expect(byKey.get("X-Frame-Options")).toBe("DENY");
    expect(byKey.get("X-Content-Type-Options")).toBe("nosniff");
    expect(byKey.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(byKey.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=()"
    );
    expect(byKey.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload"
    );
    expect(byKey.get("Content-Security-Policy-Report-Only")).toBe(
      buildTrustedTypesReportOnlyPolicy()
    );
    expect(byKey.get("Content-Security-Policy-Report-Only")).toContain(
      "require-trusted-types-for 'script'"
    );
  });

  it("omits frame-ancestors 'none' and HSTS outside production so local preview keeps working", () => {
    const headers = buildSecurityHeaders({
      isProduction: false,
      isVercelDeployment: false,
    });
    const byKey = new Map(headers.map((h) => [h.key, h.value]));

    expect(byKey.has("X-Frame-Options")).toBe(false);
    expect(byKey.has("Strict-Transport-Security")).toBe(false);
    expect(byKey.get("Content-Security-Policy")).toContain("'unsafe-eval'");
    expect(byKey.get("Content-Security-Policy")).not.toContain(
      "frame-ancestors 'none'"
    );
    expect(byKey.get("Content-Security-Policy")).not.toContain(
      "upgrade-insecure-requests"
    );
  });
});
