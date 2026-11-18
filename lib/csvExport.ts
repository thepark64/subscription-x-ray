import {
  formatConfidenceLabel,
  formatPaymentRailLabel,
  type Subscription,
} from "@/lib/detection";
import { getSubscriptionCategory } from "@/lib/subscriptionFilter";

const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

export function escapeCsvCell(
  value: string | number | null | undefined,
  guardFormula = true
): string {
  if (value === null || value === undefined) return "";
  let str = String(value);
  if (guardFormula && FORMULA_TRIGGER.test(str)) {
    str = `'${str}`;
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function subscriptionsToCsv(subscriptions: Subscription[]): string {
  const headers = [
    "Merchant",
    "Category",
    "Billing Frequency",
    "Occurrences",
    "Charge Amount (INR)",
    "Monthly Equivalent (INR)",
    "Annual Projection (INR)",
    "Confidence",
    "Payment Rail",
    "Manage URL",
  ];

  const rows = subscriptions.map((sub) => [
    escapeCsvCell(sub.merchant, true),
    escapeCsvCell(getSubscriptionCategory(sub), true),
    escapeCsvCell(sub.frequency, true),
    escapeCsvCell(sub.occurrences, false),
    escapeCsvCell(sub.amount.toFixed(2), false),
    escapeCsvCell(sub.monthlyEquivalent.toFixed(2), false),
    escapeCsvCell((sub.monthlyEquivalent * 12).toFixed(2), false),
    escapeCsvCell(formatConfidenceLabel(sub.confidence) ?? "", true),
    escapeCsvCell(formatPaymentRailLabel(sub.paymentRail) ?? "", true),
    escapeCsvCell(sub.service?.url ?? "", true),
  ]);

  const lines = [headers.map((h) => escapeCsvCell(h, false)).join(","), ...rows.map((r) => r.join(","))];
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

export function buildCsvExportFilename(
  sourceName?: string,
  now: Date = new Date()
): string {
  const dateStamp = now.toISOString().slice(0, 10);
  const slug = (sourceName ?? "")
    .replace(/\.(csv|pdf)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return slug
    ? `subscriptions-${slug}-${dateStamp}.csv`
    : `subscriptions-${dateStamp}.csv`;
}
