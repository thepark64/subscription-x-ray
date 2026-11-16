import { describe, expect, it } from "vitest";
import {
  analyzePdfPages,
  PdfPasswordError,
  type PdfTextItem,
  type PdfTextPage,
} from "@/lib/pdfStatement";

function row(y: number, cols: [number, string, number?][]): PdfTextItem[] {
  return cols.map(([x, str, width]) => ({ x, y, str, width }));
}

describe("analyzePdfPages", () => {
  it("extracts debit subscriptions across multi-line narrations and skips deposits", () => {
    const pages: PdfTextPage[] = [
      {
        items: [
          ...row(760, [[40, "HDFC BANK STATEMENT", 140]]),
          ...row(742, [[40, "Account Number: XXXX1234", 160]]),
          ...row(715, [
            [40, "Txn Date", 50],
            [105, "Value Date", 55],
            [175, "Narration", 110],
            [355, "Withdrawal", 60],
            [435, "Deposit", 55],
            [515, "Balance", 55],
          ]),
          // Netflix Jan (multi-line narration)
          ...row(690, [
            [40, "05/01/2024", 50],
            [105, "05/01/2024", 55],
            [175, "UPI-NETFLIX COM INDIA", 120],
            [365, "649.00", 50],
            [510, "49,351.00", 60],
          ]),
          ...row(678, [[175, "NETFLIX@OKAXIS-111111", 120]]),
          // Spotify Jan
          ...row(658, [
            [40, "10/01/2024", 50],
            [105, "10/01/2024", 55],
            [175, "SPOTIFY INDIA 101", 110],
            [365, "119.00", 50],
            [510, "49,232.00", 60],
          ]),
          // Salary credit (should be skipped)
          ...row(636, [
            [40, "01/02/2024", 50],
            [105, "01/02/2024", 55],
            [175, "NEFT SALARY ACME LTD", 120],
            [430, "50,000.00", 60],
            [505, "99,232.00", 65],
          ]),
          // One-off Swiggy charge
          ...row(614, [
            [40, "03/02/2024", 50],
            [105, "03/02/2024", 55],
            [175, "SWIGGY ORDER 998", 110],
            [365, "310.00", 50],
            [505, "98,922.00", 65],
          ]),
          ...row(50, [[250, "Page 1 of 2", 60]]),
        ],
      },
      {
        items: [
          ...row(760, [[40, "HDFC BANK STATEMENT", 140]]),
          ...row(715, [
            [40, "Txn Date", 50],
            [105, "Value Date", 55],
            [175, "Narration", 110],
            [355, "Withdrawal", 60],
            [435, "Deposit", 55],
            [515, "Balance", 55],
          ]),
          // Netflix Feb & Mar
          ...row(690, [
            [40, "05/02/2024", 50],
            [105, "05/02/2024", 55],
            [175, "UPI-NETFLIX COM INDIA", 120],
            [365, "649.00", 50],
            [505, "98,273.00", 65],
          ]),
          ...row(678, [[175, "NETFLIX@OKAXIS-222222", 120]]),
          ...row(658, [
            [40, "10/02/2024", 50],
            [105, "10/02/2024", 55],
            [175, "SPOTIFY INDIA 102", 110],
            [365, "119.00", 50],
            [505, "98,154.00", 65],
          ]),
          ...row(636, [
            [40, "01/03/2024", 50],
            [105, "01/03/2024", 55],
            [175, "NEFT SALARY ACME LTD", 120],
            [430, "50,000.00", 60],
            [500, "1,48,154.00", 70],
          ]),
          ...row(614, [
            [40, "06/03/2024", 50],
            [105, "06/03/2024", 55],
            [175, "UPI-NETFLIX COM INDIA", 120],
            [365, "649.00", 50],
            [500, "1,47,505.00", 70],
          ]),
          ...row(602, [[175, "NETFLIX@OKAXIS-333333", 120]]),
          ...row(582, [
            [40, "10/03/2024", 50],
            [105, "10/03/2024", 55],
            [175, "SPOTIFY INDIA 103", 110],
            [365, "119.00", 50],
            [500, "1,47,386.00", 70],
          ]),
          ...row(550, [[40, "Closing Balance: 1,47,386.00", 180]]),
        ],
      },
    ];

    const result = analyzePdfPages(pages);
    const merchants = result.subscriptions.map((s) => s.merchant);
    expect(merchants).toContain("Netflix");
    expect(merchants).toContain("Spotify");
    expect(merchants.some((m) => /salary/i.test(m))).toBe(false);
    expect(merchants.some((m) => /swiggy/i.test(m))).toBe(false);
    expect(result.monthlyTotal).toBeCloseTo(649 + 119, 0);
  });

  it("handles credit card PDFs with Cr payment markers and single Amount column", () => {
    const pages: PdfTextPage[] = [
      {
        items: [
          ...row(740, [
            [40, "Date", 40],
            [120, "Description", 120],
            [440, "Amount", 55],
          ]),
          ...row(710, [
            [40, "15 Jan 2024", 60],
            [120, "GOOGLE ONE STORAGE", 120],
            [445, "130.00", 50],
          ]),
          ...row(690, [
            [40, "02 Feb 2024", 60],
            [120, "AUTOPAY THANK YOU", 120],
            [435, "5,000.00 Cr", 60],
          ]),
          ...row(670, [
            [40, "15 Feb 2024", 60],
            [120, "GOOGLE ONE STORAGE", 120],
            [445, "130.00", 50],
          ]),
          ...row(650, [
            [40, "16 Mar 2024", 60],
            [120, "GOOGLE ONE STORAGE", 120],
            [445, "130.00", 50],
          ]),
        ],
      },
    ];

    const result = analyzePdfPages(pages);
    expect(result.subscriptions).toHaveLength(1);
    expect(result.subscriptions[0].merchant).toBe("Google One");
    expect(result.subscriptions[0].monthlyEquivalent).toBeCloseTo(130, 0);
  });

  it("uses running-balance math on headerless reverse-chronological statements", () => {
    const pages: PdfTextPage[] = [
      {
        items: [
          // Newest-first (descending dates), no header row, concatenated right-aligned columns
          ...row(720, [
            [40, "05/03/2024", 55],
            [120, "NETFLIX INDIA", 110],
            [390, "649.00", 50],
            [480, "59,351.00", 65],
          ]),
          ...row(695, [
            [40, "01/03/2024", 55],
            [120, "ACME SALARY DEPOSIT", 120],
            [390, "50,000.00", 60],
            [480, "60,000.00", 65],
          ]),
          ...row(670, [
            [40, "05/02/2024", 55],
            [120, "NETFLIX INDIA", 110],
            [390, "649.00", 50],
            [480, "10,000.00", 65],
          ]),
          ...row(645, [
            [40, "05/01/2024", 55],
            [120, "NETFLIX INDIA", 110],
            [390, "649.00", 50],
            [480, "10,649.00", 65],
          ]),
        ],
      },
    ];

    const result = analyzePdfPages(pages);
    expect(result.subscriptions).toHaveLength(1);
    expect(result.subscriptions[0].merchant).toBe("Netflix");
    expect(result.subscriptions[0].occurrences).toBe(3);
  });

  it("rejects image-only scanned PDFs cleanly", () => {
    expect(() => analyzePdfPages([{ items: [] }])).toThrow(/scanned image/i);
  });

  it("exposes clear password error reasons", () => {
    const reqErr = new PdfPasswordError("required");
    const badErr = new PdfPasswordError("incorrect");
    expect(reqErr.reason).toBe("required");
    expect(reqErr.message).toMatch(/password-protected/i);
    expect(badErr.reason).toBe("incorrect");
    expect(badErr.message).toMatch(/didn't match/i);
  });
});
