export type HeaderEntry = {
  key: string;
  value: string;
};

export type SecurityHeaderOptions = {
  isProduction?: boolean;
  isVercelDeployment?: boolean;
  supabaseUrl?: string;
};

function getOrigin(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}

export function buildContentSecurityPolicy(
  options: SecurityHeaderOptions = {}
): string {
  const isProduction = options.isProduction ?? process.env.NODE_ENV === "production";
  const isVercelDeployment =
    options.isVercelDeployment ?? Boolean(process.env.VERCEL);
  const supabaseOrigin = getOrigin(
    options.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const supabaseWsOrigin = supabaseOrigin
    ? supabaseOrigin.replace(/^https:/, "wss:").replace(/^http:/, "ws:")
    : null;

  const scriptSrc = [
    "'self'",
    // Next.js App Router emits inline RSC payload/bootstrap scripts on static routes.
    "'unsafe-inline'",
    "https://sdk.cashfree.com",
    "https://va.vercel-scripts.com",
  ];
  if (!isProduction) {
    // Next.js development mode relies on eval for Fast Refresh and source maps.
    scriptSrc.push("'unsafe-eval'");
  }

  const connectSrc = [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://api.cashfree.com",
    "https://sandbox.cashfree.com",
    "https://sdk.cashfree.com",
    "https://payments.cashfree.com",
    "https://payments-test.cashfree.com",
    "https://vitals.vercel-insights.com",
  ];
  if (supabaseOrigin && !connectSrc.includes(supabaseOrigin)) {
    connectSrc.push(supabaseOrigin);
  }
  if (supabaseWsOrigin && !connectSrc.includes(supabaseWsOrigin)) {
    connectSrc.push(supabaseWsOrigin);
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://sdk.cashfree.com https://*.cashfree.com",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src 'self' https://sdk.cashfree.com https://*.cashfree.com",
    "child-src 'self' blob: https://sdk.cashfree.com https://*.cashfree.com",
    "worker-src 'self' blob:",
    "form-action 'self' https://sdk.cashfree.com https://*.cashfree.com",
    "base-uri 'self'",
    "object-src 'none'",
  ];

  if (isProduction) {
    directives.push("frame-ancestors 'none'");
  }

  if (isVercelDeployment) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function buildTrustedTypesReportOnlyPolicy(): string {
  // Report-Only avoids breaking Next.js internal script injection and Cashfree's external SDK
  // while still auditing DOM XSS sinks for future Trusted Types enforcement.
  return "require-trusted-types-for 'script'; trusted-types default nextjs nextjs#bundler cashfree#sdk 'allow-duplicates'";
}

export function buildSecurityHeaders(
  options: SecurityHeaderOptions = {}
): HeaderEntry[] {
  const isProduction = options.isProduction ?? process.env.NODE_ENV === "production";
  const headers: HeaderEntry[] = [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(options),
    },
    {
      key: "Content-Security-Policy-Report-Only",
      value: buildTrustedTypesReportOnlyPolicy(),
    },
    {
      key: "Cross-Origin-Opener-Policy",
      // Preserves popup/redirect handoffs required by Cashfree 3DS/UPI checkout flows.
      value: "same-origin-allow-popups",
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
  ];

  if (isProduction) {
    headers.push({
      key: "X-Frame-Options",
      value: "DENY",
    });
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}
