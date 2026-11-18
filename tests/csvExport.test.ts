import { describe, expect, it } from "vitest";
import type { Subscription } from "../lib/detection";
import {
  buildCsvExportFilename,
  escapeCsvCell,
  subscriptionsToCsv,
} from "../lib/csvExport";

const sampleSubs: Subscription[] = [
  {
    merchant: 'Netflix, "Standard"',
    amount: 649,
    frequency: "monthly",
    occurrences: 3,
    monthlyEquivalent: 649,
    category: "Streaming & Media",
    confidence: "high",
    paymentRail: "upi_autopay",
    service: {
      name: "Netflix",
      url: "https://www.netflix.com/cancelplan",
      label: "Manage / cancel",
      category: "Streaming & Media",
    },
  },
  {
    merchant: "=HYPERLINK(\"http://bad.example\")",
    amount: 1200,
    frequency: "annual",
    occurrences: 2,
    monthlyEquivalent: 100,
    category: "Other",
  },
];

describe("escapeCsvCell", () => {
  it("quotes commas, quotes, and newlines properly", () => {
    expect(escapeCsvCell('A, "B"')).toBe('"A, ""B"""');
    expect(escapeCsvCell("line1\nline2")).toBe('"line1\nline2"');
  });

  it("prefixes potential spreadsheet formula triggers with an apostrophe", () => {
    expect(escapeCsvCell("=1+1")).toBe("'=1+1");
    expect(escapeCsvCell("+SUM(A1)")).toBe("'+SUM(A1)");
    expect(escapeCsvCell("@cmd")).toBe("'@cmd");
  });
});

describe("subscriptionsToCsv", () => {
  it("generates UTF-8 BOM CSV with spreadsheet-friendly numeric columns", () => {
    const csv = subscriptionsToCsv(sampleSubs);
    expect(csv.startsWith("\uFEFFMerchant,Category,Billing Frequency")).toBe(true);
    const lines = csv.slice(1).trim().split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe(
      '"Netflix, ""Standard""",Streaming & Media,monthly,3,649.00,649.00,7788.00,High confidence,UPI AutoPay,https://www.netflix.com/cancelplan'
    );
    expect(lines[2]).toContain("\"'=HYPERLINK(\"\"http://bad.example\"\")\"");
    expect(lines[2]).toContain(",1200.00,100.00,1200.00,");
  });
});

describe("buildCsvExportFilename", () => {
  it("formats sanitized export filenames with ISO date for CSV and PDF inputs", () => {
    const d = new Date("2026-11-14T12:00:00.000Z");
    expect(buildCsvExportFilename("HDFC_Savings_Oct.csv", d)).toBe(
      "subscriptions-hdfc-savings-oct-2026-11-14.csv"
    );
    expect(buildCsvExportFilename("ICICI_Card_Oct.pdf", d)).toBe(
      "subscriptions-icici-card-oct-2026-11-14.csv"
    );
    expect(buildCsvExportFilename("", d)).toBe("subscriptions-2026-11-14.csv");
  });
});
