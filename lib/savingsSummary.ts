import type { Subscription } from "@/lib/detection";

export type SavingsSummary = {
  totalCount: number;
  selectedCount: number;
  totalMonthlyRecurring: number;
  totalAnnualRecurring: number;
  selectedMonthlySavings: number;
  selectedAnnualSavings: number;
};

export type PrivacySafeCardData = {
  brand: string;
  headline: string;
  subline: string;
  stats: Array<{ label: string; value: string }>;
  savingsCallout: string | null;
  footer: string;
};

export function buildSubscriptionSelectionKey(
  sub: Pick<Subscription, "merchant" | "amount" | "frequency">,
  index: number
): string {
  return `${index}::${sub.merchant.toLowerCase()}::${sub.frequency}::${sub.amount.toFixed(2)}`;
}

function roundInr(value: number): number {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

export function formatInrAmount(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `₹${safe.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function calculateSavingsSummary(
  subscriptions: Subscription[],
  selectedKeys: Iterable<string>
): SavingsSummary {
  const selected = new Set(selectedKeys);
  let totalMonthly = 0;
  let selectedMonthly = 0;
  let selectedCount = 0;

  subscriptions.forEach((sub, index) => {
    const monthly = Number.isFinite(sub.monthlyEquivalent)
      ? Math.max(0, sub.monthlyEquivalent)
      : 0;
    totalMonthly += monthly;

    const key = buildSubscriptionSelectionKey(sub, index);
    if (selected.has(key)) {
      selectedMonthly += monthly;
      selectedCount += 1;
    }
  });

  const roundedTotalMonthly = roundInr(totalMonthly);
  const roundedSelectedMonthly = roundInr(selectedMonthly);

  return {
    totalCount: subscriptions.length,
    selectedCount,
    totalMonthlyRecurring: roundedTotalMonthly,
    totalAnnualRecurring: roundInr(roundedTotalMonthly * 12),
    selectedMonthlySavings: roundedSelectedMonthly,
    selectedAnnualSavings: roundInr(roundedSelectedMonthly * 12),
  };
}

// Strictly excludes merchant names, filenames, bank names, UPI IDs, and dates.
export function buildPrivacySafeShareText(summary: SavingsSummary): string {
  const chargeWord = summary.totalCount === 1 ? "charge" : "charges";
  const lines = [
    `I scanned my statement locally with Subscription X-Ray and found ${summary.totalCount} recurring ${chargeWord} (${formatInrAmount(summary.totalMonthlyRecurring)}/mo · ${formatInrAmount(summary.totalAnnualRecurring)}/yr).`,
  ];

  if (summary.selectedCount > 0 && summary.selectedMonthlySavings > 0) {
    const itemWord = summary.selectedCount === 1 ? "subscription" : "subscriptions";
    lines.push(
      `Marked ${summary.selectedCount} ${itemWord} to cancel — potential savings of ${formatInrAmount(summary.selectedMonthlySavings)}/mo (${formatInrAmount(summary.selectedAnnualSavings)}/yr).`
    );
  }

  lines.push("Scanned in-browser (no raw file uploaded): https://subscription-x-ray.vercel.app");
  return lines.join("\n");
}

// Strictly high-level anonymous totals for client-side canvas summary image export.
export function buildPrivacySafeCardData(
  summary: SavingsSummary
): PrivacySafeCardData {
  const chargeWord = summary.totalCount === 1 ? "charge" : "charges";
  const stats = [
    {
      label: "Recurring charges found",
      value: String(summary.totalCount),
    },
    {
      label: "Monthly recurring spend",
      value: `${formatInrAmount(summary.totalMonthlyRecurring)}/mo`,
    },
    {
      label: "Projected 12-month spend",
      value: `${formatInrAmount(summary.totalAnnualRecurring)}/yr`,
    },
  ];

  const hasSavings = summary.selectedCount > 0 && summary.selectedMonthlySavings > 0;

  return {
    brand: "SUBSCRIPTION X-RAY",
    headline: `Found ${summary.totalCount} recurring ${chargeWord}`,
    subline: "Privacy-safe totals only · No merchants, banks, or account details shown",
    stats,
    savingsCallout: hasSavings
      ? `Potential savings (${summary.selectedCount} selected): ${formatInrAmount(summary.selectedMonthlySavings)}/mo · ${formatInrAmount(summary.selectedAnnualSavings)}/yr`
      : null,
    footer: "subscription-x-ray.vercel.app · Browser-only CSV & PDF scanner",
  };
}
