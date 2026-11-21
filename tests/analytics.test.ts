import { afterEach, describe, expect, it, vi } from "vitest";
import {
  trackBeginCheckout,
  trackCtaClick,
  trackDemoInteraction,
  trackPurchaseSuccess,
  trackScanCompleted,
  trackSignupCompleted,
} from "@/lib/analytics";

describe("privacy-safe analytics helpers", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    if (originalWindow === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      globalThis.window = originalWindow;
    }
    vi.restoreAllMocks();
  });

  it("silently no-ops when window is undefined", () => {
    delete (globalThis as { window?: unknown }).window;
    expect(() => trackCtaClick("hero", "Scan", "/scanner")).not.toThrow();
    expect(() =>
      trackScanCompleted({ fileType: "csv", recurringCount: 3, creditUsed: true })
    ).not.toThrow();
  });

  it("emits anonymous events to window.gtag and strips any non-aggregate fields", () => {
    const gtag = vi.fn();
    (globalThis as { window?: unknown }).window = { gtag };

    trackCtaClick("hero", "Scan my statement for ₹69", "/scanner");
    expect(gtag).toHaveBeenCalledWith("event", "cta_click", {
      cta_location: "hero",
      cta_label: "Scan my statement for ₹69",
      link_url: "/scanner",
    });

    trackDemoInteraction("preset_select", "streaming");
    expect(gtag).toHaveBeenCalledWith("event", "demo_interaction", {
      demo_action: "preset_select",
      demo_detail: "streaming",
    });

    trackSignupCompleted("email");
    expect(gtag).toHaveBeenCalledWith("event", "sign_up", { method: "email" });

    trackBeginCheckout();
    expect(gtag).toHaveBeenCalledWith("event", "begin_checkout", {
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

    trackPurchaseSuccess("order_123");
    expect(gtag).toHaveBeenCalledWith("event", "purchase", {
      transaction_id: "order_123",
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

    trackScanCompleted({
      fileType: "pdf",
      recurringCount: 4.9,
      creditUsed: true,
    });
    expect(gtag).toHaveBeenLastCalledWith("event", "scan_completed", {
      file_type: "pdf",
      recurring_count: 4,
      credit_used: true,
    });
  });

  it("falls back to window.dataLayer when gtag is not registered and swallows gtag errors", () => {
    const dataLayer: unknown[] = [];
    (globalThis as { window?: unknown }).window = { dataLayer };

    trackScanCompleted({
      fileType: "csv",
      recurringCount: -3,
      creditUsed: false,
    });
    expect(dataLayer).toEqual([
      {
        event: "scan_completed",
        file_type: "csv",
        recurring_count: 0,
        credit_used: false,
      },
    ]);

    (globalThis as { window?: unknown }).window = {
      gtag: () => {
        throw new Error("blocked");
      },
    };
    expect(() => trackBeginCheckout()).not.toThrow();
  });
});
