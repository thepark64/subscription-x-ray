export type ScanHistoryItem = {
  id: string;
  scanned_at: string;
  subscription_count: number;
  monthly_total: number | string;
};

export type MonthlyTrendPoint = {
  key: string;
  label: string;
  fullLabel: string;
  monthIndex: number;
  monthlyTotal: number | null;
  subscriptionCount: number;
  scanCount: number;
  latestScannedAt: string | null;
  hasData: boolean;
};

export type TrendSummary = {
  points: MonthlyTrendPoint[];
  monthsWithData: number;
  totalScansInWindow: number;
  latestMonthlyTotal: number | null;
  previousMonthlyTotal: number | null;
  deltaAmount: number | null;
  deltaPercent: number | null;
  peakMonthlyTotal: number;
  averageMonthlyTotal: number | null;
};

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toMonthKey(year: number, monthZeroBased: number): string {
  return `${year}-${String(monthZeroBased + 1).padStart(2, "0")}`;
}

export function buildSixMonthTrend(
  scans: ScanHistoryItem[],
  now: Date = new Date(),
  monthsCount: number = 6
): TrendSummary {
  const windowSize = Math.max(1, Math.floor(monthsCount));
  const endYear = now.getUTCFullYear();
  const endMonth = now.getUTCMonth();

  const buckets = new Map<
    string,
    {
      latestTs: number;
      latestScannedAt: string;
      monthlyTotal: number;
      subscriptionCount: number;
      scanCount: number;
    }
  >();

  for (const scan of scans) {
    const ts = Date.parse(scan.scanned_at);
    if (Number.isNaN(ts)) continue;
    const d = new Date(ts);
    const key = toMonthKey(d.getUTCFullYear(), d.getUTCMonth());
    const numericTotal = Number(scan.monthly_total);
    const safeTotal = Number.isFinite(numericTotal) && numericTotal >= 0 ? numericTotal : 0;
    const numericSubs = Number(scan.subscription_count);
    const safeSubs = Number.isFinite(numericSubs) && numericSubs >= 0 ? Math.round(numericSubs) : 0;

    const existing = buckets.get(key);
    if (!existing) {
      buckets.set(key, {
        latestTs: ts,
        latestScannedAt: scan.scanned_at,
        monthlyTotal: safeTotal,
        subscriptionCount: safeSubs,
        scanCount: 1,
      });
    } else {
      existing.scanCount += 1;
      if (ts >= existing.latestTs) {
        existing.latestTs = ts;
        existing.latestScannedAt = scan.scanned_at;
        existing.monthlyTotal = safeTotal;
        existing.subscriptionCount = safeSubs;
      }
    }
  }

  const rawMonths: Array<{ year: number; month: number }> = [];
  for (let offset = windowSize - 1; offset >= 0; offset--) {
    const dt = new Date(Date.UTC(endYear, endMonth - offset, 1));
    rawMonths.push({ year: dt.getUTCFullYear(), month: dt.getUTCMonth() });
  }

  const spansYears =
    rawMonths.length > 1 &&
    rawMonths[0].year !== rawMonths[rawMonths.length - 1].year;

  const points: MonthlyTrendPoint[] = rawMonths.map(({ year, month }, idx) => {
    const key = toMonthKey(year, month);
    const bucket = buckets.get(key);
    const showYearSuffix = spansYears && (idx === 0 || month === 0);
    const shortName = SHORT_MONTHS[month];
    const label = showYearSuffix
      ? `${shortName} '${String(year).slice(-2)}`
      : shortName;

    return {
      key,
      label,
      fullLabel: `${FULL_MONTHS[month]} ${year}`,
      monthIndex: idx,
      monthlyTotal: bucket ? bucket.monthlyTotal : null,
      subscriptionCount: bucket ? bucket.subscriptionCount : 0,
      scanCount: bucket ? bucket.scanCount : 0,
      latestScannedAt: bucket ? bucket.latestScannedAt : null,
      hasData: Boolean(bucket),
    };
  });

  const observed = points.filter(
    (p): p is MonthlyTrendPoint & { monthlyTotal: number } =>
      p.hasData && p.monthlyTotal !== null
  );

  const totalScansInWindow = points.reduce((sum, p) => sum + p.scanCount, 0);
  const latestPoint = observed.length > 0 ? observed[observed.length - 1] : null;
  const previousPoint = observed.length > 1 ? observed[observed.length - 2] : null;

  const latestMonthlyTotal = latestPoint ? latestPoint.monthlyTotal : null;
  const previousMonthlyTotal = previousPoint ? previousPoint.monthlyTotal : null;

  const deltaAmount =
    latestMonthlyTotal !== null && previousMonthlyTotal !== null
      ? latestMonthlyTotal - previousMonthlyTotal
      : null;

  const deltaPercent =
    deltaAmount !== null && previousMonthlyTotal !== null && previousMonthlyTotal > 0
      ? (deltaAmount / previousMonthlyTotal) * 100
      : null;

  const peakMonthlyTotal =
    observed.length > 0
      ? Math.max(...observed.map((p) => p.monthlyTotal))
      : 0;

  const averageMonthlyTotal =
    observed.length > 0
      ? observed.reduce((sum, p) => sum + p.monthlyTotal, 0) / observed.length
      : null;

  return {
    points,
    monthsWithData: observed.length,
    totalScansInWindow,
    latestMonthlyTotal,
    previousMonthlyTotal,
    deltaAmount,
    deltaPercent,
    peakMonthlyTotal,
    averageMonthlyTotal,
  };
}
