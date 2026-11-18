import { describe, expect, it } from "vitest";
import type { Subscription } from "../lib/detection";
import {
  buildPdfExportFilename,
  buildPdfReportModel,
  formatPdfInr,
  sanitizePdfText,
} from "../lib/pdfExport";

const sampleSubscriptions: Subscription[] = [
  {
    merchant: "Netflix — Standard Plan…",
    amount: 649,
    frequency: "monthly",
    occurrences: 3,
    monthlyEquivalent: 649,
    category: "Streaming & Media",
  },
  {
    merchant: "Adobe Creative Cloud",
    amount: 4230,
    frequency: "annual",
    occurrences: 2,
    monthlyEquivalent: 352.5,
    category: "Software & Apps",
  },
];

describe("pdfExport helpers", () => {
  it("formats INR values cleanly for WinAnsi PDF standard fonts", () => {
    expect(formatPdfInr(649)).toBe("INR 649.00");
    expect(formatPdfInr(3847.5)).toBe("INR 3,847.50");
    expect(sanitizePdfText("₹649 — Netflix…")).toBe("INR 649 - Netflix...");
  });

  it("builds a complete report model with KPIs, sanitized rows, and filename", () => {
    const now = new Date("2026-11-15T12:00:00.000Z");
    const model = buildPdfReportModel({
      subscriptions: sampleSubscriptions,
      statementName: "HDFC_Savings_Oct.csv",
      transactionsAnalyzed: 142,
      periodDays: 91,
      filterSummary: "Filtered by Streaming & Media",
      now,
    });

    expect(model.filename).toBe(
      "subscriptions-report-hdfc-savings-oct-2026-11-15.pdf"
    );
    expect(model.statementName).toBe("HDFC_Savings_Oct.csv");
    expect(model.monthlyTotalFormatted).toBe("INR 1,001.50");
    expect(model.annualTotalFormatted).toBe("INR 12,018.00");
    expect(model.subscriptionCount).toBe(2);
    expect(model.coverageLabel).toBe(
      "Analysed 142 spending transactions over 91 days"
    );
    expect(model.filterSummary).toBe("Filtered by Streaming & Media");
    expect(model.rows[0].merchant).toBe("Netflix - Standard Plan...");
    expect(model.rows[1].monthlyFormatted).toBe("INR 352.50");
  });

  it("uses fallback filename and strips .pdf extensions cleanly", () => {
    const now = new Date("2026-11-15T12:00:00.000Z");
    expect(buildPdfExportFilename("", now)).toBe(
      "subscriptions-report-2026-11-15.pdf"
    );
    expect(buildPdfExportFilename("Axis_Card_Statement.pdf", now)).toBe(
      "subscriptions-report-axis-card-statement-2026-11-15.pdf"
    );
  });
});
