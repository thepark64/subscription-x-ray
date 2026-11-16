import { describe, expect, it } from "vitest";
import {
  deriveStatementName,
  formatScanTimestamp,
  formatSubscriptionCountLabel,
  isMissingColumnError,
  normalizeFileName,
  normalizeStatementName,
} from "../lib/scanHistory";

describe("scanHistory helpers", () => {
  it("derives readable statement names from filenames when no custom label is provided", () => {
    expect(deriveStatementName("hdfc_savings_oct_2026.csv")).toBe(
      "hdfc savings oct 2026"
    );
    expect(deriveStatementName("  My   Card Statement.CSV  ")).toBe(
      "My Card Statement"
    );
    expect(deriveStatementName("icici_statement_2026.pdf")).toBe(
      "icici statement 2026"
    );
    expect(deriveStatementName(".pdf")).toBe("Statement scan");
    expect(deriveStatementName(".csv")).toBe("Statement scan");
  });

  it("prefers custom statement label over filename", () => {
    expect(
      deriveStatementName("raw_export_123.csv", "  HDFC Personal Card  ")
    ).toBe("HDFC Personal Card");
  });

  it("normalizes and caps long statement names", () => {
    const long = "A ".repeat(60);
    const normalized = normalizeStatementName(long);
    expect(normalized.length).toBeLessThanOrEqual(80);
  });

  it("normalizes CSV file names, timestamps, and subscription count labels", () => {
    expect(normalizeFileName("C:\\fakepath\\hdfc_oct_2026.csv")).toBe(
      "hdfc_oct_2026.csv"
    );
    expect(normalizeFileName("/Users/demo/Downloads/card.csv")).toBe("card.csv");

    const formatted = formatScanTimestamp("2026-11-15T11:48:00.000Z");
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Nov");
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);

    expect(formatSubscriptionCountLabel(0)).toBe("0 subscriptions found");
    expect(formatSubscriptionCountLabel(1)).toBe("1 subscription found");
    expect(formatSubscriptionCountLabel(4)).toBe("4 subscriptions found");
  });

  it("detects PostgREST/Postgres missing column errors", () => {
    expect(
      isMissingColumnError(
        { code: "PGRST204", message: "Could not find the 'statement_name' column" },
        "statement_name"
      )
    ).toBe(true);
    expect(
      isMissingColumnError(
        { code: "42703", message: 'column "full_name" does not exist' },
        "full_name"
      )
    ).toBe(true);
    expect(
      isMissingColumnError({ code: "42501", message: "permission denied" }, "full_name")
    ).toBe(false);
  });
});
