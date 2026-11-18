import { describe, expect, it } from "vitest";
import type { Subscription } from "@/lib/detection";
import {
  buildPrivacySafeCardData,
  buildPrivacySafeShareText,
  buildSubscriptionSelectionKey,
  calculateSavingsSummary,
} from "@/lib/savingsSummary";

const SAMPLE_SUBS: Subscription[] = [
  {
    merchant: "Netflix",
    amount: 649,
    frequency: "monthly",
    occurrences: 3,
    monthlyEquivalent: 649,
    category: "Streaming & Media",
    confidence: "high",
    paymentRail: "upi_autopay",
  },
  {
    merchant: "Cult.fit",
    amount: 999,
    frequency: "monthly",
    occurrences: 3,
    monthlyEquivalent: 999,
    category: "Membership",
    confidence: "high",
    paymentRail: "nach_emandate",
  },
  {
    merchant: "Secret Corp VPN hdfc_oct_2026_user@okaxis",
    amount: 1200,
    frequency: "quarterly",
    occurrences: 2,
    monthlyEquivalent: 400,
    category: "Software & Apps",
    confidence: "medium",
    paymentRail: "card_si",
  },
];

describe("savingsSummary & privacy-safe share output", () => {
  it("calculates total and selected savings accurately", () => {
    const netflixKey = buildSubscriptionSelectionKey(SAMPLE_SUBS[0], 0);
    const vpnKey = buildSubscriptionSelectionKey(SAMPLE_SUBS[2], 2);

    const summary = calculateSavingsSummary(SAMPLE_SUBS, [netflixKey, vpnKey]);

    expect(summary.totalCount).toBe(3);
    expect(summary.selectedCount).toBe(2);
    expect(summary.totalMonthlyRecurring).toBe(2048);
    expect(summary.totalAnnualRecurring).toBe(24576);
    expect(summary.selectedMonthlySavings).toBe(1049);
    expect(summary.selectedAnnualSavings).toBe(12588);
  });

  it("handles zero selected items cleanly without inventing savings", () => {
    const summary = calculateSavingsSummary(SAMPLE_SUBS, []);
    const text = buildPrivacySafeShareText(summary);
    const card = buildPrivacySafeCardData(summary);

    expect(summary.selectedCount).toBe(0);
    expect(summary.selectedMonthlySavings).toBe(0);
    expect(text).toContain("3 recurring charges");
    expect(text).toContain("₹2,048/mo");
    expect(text).not.toContain("potential savings");
    expect(card.savingsCallout).toBeNull();
  });

  it("never leaks merchant names, bank names, filenames, or UPI IDs into share text or PNG card data", () => {
    const keys = SAMPLE_SUBS.map((sub, i) => buildSubscriptionSelectionKey(sub, i));
    const summary = calculateSavingsSummary(SAMPLE_SUBS, keys);

    const text = buildPrivacySafeShareText(summary);
    const card = buildPrivacySafeCardData(summary);
    const combined = [
      text,
      card.brand,
      card.headline,
      card.subline,
      card.savingsCallout ?? "",
      card.footer,
      ...card.stats.flatMap((s) => [s.label, s.value]),
    ].join("\n");

    expect(combined).toContain("₹2,048");
    expect(combined).toContain("₹24,576");
    expect(combined).not.toMatch(/netflix/i);
    expect(combined).not.toMatch(/cult\.?fit/i);
    expect(combined).not.toMatch(/secret corp/i);
    expect(combined).not.toMatch(/hdfc/i);
    expect(combined).not.toMatch(/okaxis/i);
    expect(combined).not.toMatch(/\.csv|\.pdf/i);
  });
});
