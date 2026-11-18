import { describe, expect, it } from "vitest";
import { analyzeCsv } from "@/lib/detection";
import { DEMO_PRESETS } from "@/lib/demoStatement";
import { metadata as homeMetadata } from "@/app/page";
import { metadata as loginMetadata } from "@/app/login/page";
import { metadata as scannerMetadata } from "@/app/scanner/page";
import { metadata as termsMetadata } from "@/app/terms/page";
import { metadata as privacyMetadata } from "@/app/privacy/page";
import { metadata as refundMetadata } from "@/app/refund/page";

describe("Interactive demo synthetic statements", () => {
  it("parses the HDFC/UPI AutoPay synthetic preset accurately and excludes noise", () => {
    const preset = DEMO_PRESETS.find((p) => p.id === "hdfc-upi");
    expect(preset).toBeDefined();

    const res = analyzeCsv(preset!.csv);
    const names = res.subscriptions.map((s) => s.merchant);

    expect(names).toContain("Netflix");
    expect(names).toContain("Spotify");
    expect(names).toContain("Cult.fit");
    expect(names).toContain("Google One");
    expect(res.subscriptions.some((s) => /swiggy|salary|amazon/i.test(s.merchant))).toBe(
      false
    );

    const netflix = res.subscriptions.find((s) => s.merchant === "Netflix");
    const cult = res.subscriptions.find((s) => s.merchant === "Cult.fit");
    expect(netflix?.paymentRail).toBe("upi_autopay");
    expect(netflix?.occurrences).toBe(3);
    expect(cult?.paymentRail).toBe("nach_emandate");
    expect(res.monthlyTotal).toBe(649 + 119 + 999 + 130);
  });

  it("parses the Credit Card / SaaS synthetic preset with Debit/Credit markers", () => {
    const preset = DEMO_PRESETS.find((p) => p.id === "card-si");
    expect(preset).toBeDefined();

    const res = analyzeCsv(preset!.csv);
    const names = res.subscriptions.map((s) => s.merchant);

    expect(names).toContain("ChatGPT / OpenAI");
    expect(names).toContain("JioHotstar / Disney+ Hotstar");
    expect(names).toContain("Apple");
    expect(res.subscriptions.some((s) => /indigo|autopay thank you/i.test(s.merchant))).toBe(
      false
    );

    const openai = res.subscriptions.find((s) => s.merchant === "ChatGPT / OpenAI");
    expect(openai?.paymentRail).toBe("card_si");
    expect(openai?.occurrences).toBe(3);
    expect(res.monthlyTotal).toBe(1950 + 299 + 195);
  });
});

describe("Public route canonical metadata", () => {
  it("declares explicit canonical paths on public SEO routes", () => {
    expect(homeMetadata.alternates?.canonical).toBe("/");
    expect(loginMetadata.alternates?.canonical).toBe("/login");
    expect(scannerMetadata.alternates?.canonical).toBe("/scanner");
    expect(termsMetadata.alternates?.canonical).toBe("/terms");
    expect(privacyMetadata.alternates?.canonical).toBe("/privacy");
    expect(refundMetadata.alternates?.canonical).toBe("/refund");
  });
});
