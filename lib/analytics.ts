"use client";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type ScanFileType = "csv" | "pdf";

function emitAnalyticsEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | unknown[]>
) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params ?? {});
      return;
    }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...(params ?? {}),
      });
    }
  } catch {
    // Analytics must never interrupt checkout, auth, or statement scanning.
  }
}

export function trackCtaClick(
  location: string,
  label: string,
  destination: string
) {
  emitAnalyticsEvent("cta_click", {
    cta_location: location,
    cta_label: label,
    link_url: destination,
  });
}

export function trackDemoInteraction(
  action: "preset_select" | "cancel_guide_open" | "demo_cta_click",
  detail: string
) {
  emitAnalyticsEvent("demo_interaction", {
    demo_action: action,
    demo_detail: detail,
  });
}

export function trackSignupCompleted(method: "email" = "email") {
  emitAnalyticsEvent("sign_up", {
    method,
  });
}

export function trackBeginCheckout() {
  emitAnalyticsEvent("begin_checkout", {
    currency: "INR",
    value: 69,
    items: [
      {
        item_id: "scan_pack_12",
        item_name: "12 Statement Scan Credits",
        price: 69,
        quantity: 1,
      },
    ],
  });
}

export function trackPurchaseSuccess(orderId: string) {
  emitAnalyticsEvent("purchase", {
    transaction_id: orderId,
    currency: "INR",
    value: 69,
    items: [
      {
        item_id: "scan_pack_12",
        item_name: "12 Statement Scan Credits",
        price: 69,
        quantity: 1,
      },
    ],
  });
}

export function trackScanCompleted({
  fileType,
  recurringCount,
  creditUsed,
}: {
  fileType: ScanFileType;
  recurringCount: number;
  creditUsed: boolean;
}) {
  // Strictly send aggregate flags/counts only — never file names, merchant names, or rupee totals.
  emitAnalyticsEvent("scan_completed", {
    file_type: fileType,
    recurring_count: Math.max(0, Math.trunc(recurringCount)),
    credit_used: creditUsed,
  });
}
