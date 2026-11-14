import { describe, expect, it } from "vitest";
import { buildSixMonthTrend, type ScanHistoryItem } from "../lib/spendingTrends";

describe("buildSixMonthTrend", () => {
  const now = new Date("2026-11-14T12:00:00.000Z");

  it("builds 6 consecutive empty months when no scans exist", () => {
    const summary = buildSixMonthTrend([], now);
    expect(summary.points).toHaveLength(6);
    expect(summary.points.map((p) => p.key)).toEqual([
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
      "2026-11",
    ]);
    expect(summary.points.map((p) => p.label)).toEqual([
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
    ]);
    expect(summary.monthsWithData).toBe(0);
    expect(summary.latestMonthlyTotal).toBeNull();
    expect(summary.deltaAmount).toBeNull();
  });

  it("uses the latest scan snapshot when multiple scans occur in the same month", () => {
    const scans: ScanHistoryItem[] = [
      {
        id: "1",
        scanned_at: "2026-11-02T10:00:00.000Z",
        subscription_count: 4,
        monthly_total: 1800,
      },
      {
        id: "2",
        scanned_at: "2026-11-14T09:30:00.000Z",
        subscription_count: 5,
        monthly_total: "2450.50",
      },
      {
        id: "3",
        scanned_at: "2026-09-18T14:00:00.000Z",
        subscription_count: 3,
        monthly_total: 2000,
      },
    ];

    const summary = buildSixMonthTrend(scans, now);
    const sep = summary.points.find((p) => p.key === "2026-09");
    const nov = summary.points.find((p) => p.key === "2026-11");

    expect(sep?.monthlyTotal).toBe(2000);
    expect(sep?.scanCount).toBe(1);

    expect(nov?.monthlyTotal).toBe(2450.5);
    expect(nov?.subscriptionCount).toBe(5);
    expect(nov?.scanCount).toBe(2);

    expect(summary.monthsWithData).toBe(2);
    expect(summary.totalScansInWindow).toBe(3);
    expect(summary.latestMonthlyTotal).toBe(2450.5);
    expect(summary.previousMonthlyTotal).toBe(2000);
    expect(summary.deltaAmount).toBeCloseTo(450.5);
    expect(summary.deltaPercent).toBeCloseTo(22.525);
    expect(summary.peakMonthlyTotal).toBe(2450.5);
  });

  it("ignores scans older than the 6-month window and marks year boundaries cleanly", () => {
    const earlyYearNow = new Date("2026-02-10T00:00:00.000Z");
    const scans: ScanHistoryItem[] = [
      {
        id: "old",
        scanned_at: "2025-08-15T00:00:00.000Z",
        subscription_count: 2,
        monthly_total: 999,
      },
      {
        id: "dec",
        scanned_at: "2025-12-20T00:00:00.000Z",
        subscription_count: 4,
        monthly_total: 1500,
      },
      {
        id: "jan",
        scanned_at: "2026-01-12T00:00:00.000Z",
        subscription_count: 3,
        monthly_total: 1200,
      },
    ];

    const summary = buildSixMonthTrend(scans, earlyYearNow);
    expect(summary.points.map((p) => p.label)).toEqual([
      "Sep '25",
      "Oct",
      "Nov",
      "Dec",
      "Jan '26",
      "Feb",
    ]);
    expect(summary.totalScansInWindow).toBe(2);
    expect(summary.deltaAmount).toBe(-300);
    expect(summary.deltaPercent).toBeCloseTo(-20);
  });
});
