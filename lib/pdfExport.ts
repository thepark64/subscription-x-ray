import type { Subscription } from "@/lib/detection";
import { getSubscriptionCategory } from "@/lib/subscriptionFilter";

export type PdfExportInput = {
  subscriptions: Subscription[];
  statementName?: string;
  transactionsAnalyzed?: number;
  periodDays?: number;
  filterSummary?: string;
  now?: Date;
};

export type PdfReportRow = {
  merchant: string;
  category: string;
  frequency: string;
  occurrences: string;
  amountFormatted: string;
  monthlyFormatted: string;
};

export type PdfReportModel = {
  filename: string;
  statementName: string;
  generatedLabel: string;
  coverageLabel: string;
  filterSummary: string | null;
  monthlyTotalFormatted: string;
  annualTotalFormatted: string;
  subscriptionCount: number;
  rows: PdfReportRow[];
};

export function formatPdfInr(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `INR ${safe.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function sanitizePdfText(value: string): string {
  // Built-in PDF standard fonts use WinAnsi; replace unsupported Unicode symbols cleanly.
  return value
    .replace(/₹/g, "INR ")
    .replace(/…/g, "...")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildPdfExportFilename(
  sourceName?: string,
  now: Date = new Date()
): string {
  const dateStamp = now.toISOString().slice(0, 10);
  const slug = (sourceName ?? "")
    .replace(/\.csv$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return slug
    ? `subscriptions-report-${slug}-${dateStamp}.pdf`
    : `subscriptions-report-${dateStamp}.pdf`;
}

export function buildPdfReportModel(input: PdfExportInput): PdfReportModel {
  const now = input.now ?? new Date();
  const monthlyTotal = input.subscriptions.reduce(
    (sum, s) => sum + s.monthlyEquivalent,
    0
  );
  const annualTotal = monthlyTotal * 12;

  const statementName =
    sanitizePdfText(input.statementName ?? "") || "Statement Scan";

  const generatedLabel = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const coverageParts: string[] = [];
  if (typeof input.transactionsAnalyzed === "number") {
    coverageParts.push(
      `${input.transactionsAnalyzed.toLocaleString("en-IN")} spending transactions`
    );
  }
  if (typeof input.periodDays === "number") {
    coverageParts.push(`${input.periodDays} days`);
  }

  const coverageLabel =
    coverageParts.length > 0
      ? `Analysed ${coverageParts.join(" over ")}`
      : "Detected recurring charges";

  const rows: PdfReportRow[] = input.subscriptions.map((sub) => ({
    merchant: sanitizePdfText(sub.merchant) || "Recurring charge",
    category: sanitizePdfText(getSubscriptionCategory(sub)),
    frequency: sanitizePdfText(sub.frequency),
    occurrences: String(sub.occurrences),
    amountFormatted: formatPdfInr(sub.amount),
    monthlyFormatted: formatPdfInr(sub.monthlyEquivalent),
  }));

  return {
    filename: buildPdfExportFilename(input.statementName, now),
    statementName,
    generatedLabel,
    coverageLabel,
    filterSummary: input.filterSummary
      ? sanitizePdfText(input.filterSummary)
      : null,
    monthlyTotalFormatted: formatPdfInr(monthlyTotal),
    annualTotalFormatted: formatPdfInr(annualTotal),
    subscriptionCount: input.subscriptions.length,
    rows,
  };
}

export async function exportSubscriptionsToPdf(
  input: PdfExportInput
): Promise<string> {
  const { jsPDF } = await import("jspdf");
  const model = buildPdfReportModel(input);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const footerLimit = pageHeight - 62;

  let y = 44;

  // Report Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 118, 110);
  doc.text("SUBSCRIPTION X-RAY", margin, y);

  y += 20;
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text("Recurring Charges Report", margin, y);

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Statement: ${model.statementName}   |   Generated: ${model.generatedLabel}`,
    margin,
    y
  );

  y += 14;
  doc.text(model.coverageLabel, margin, y);

  if (model.filterSummary) {
    y += 14;
    doc.setTextColor(15, 118, 110);
    doc.text(model.filterSummary, margin, y);
  }

  // Summary KPI Strip
  y += 18;
  const boxWidth = contentWidth / 3;
  const boxHeight = 56;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 6, 6, "FD");

  doc.line(margin + boxWidth, y, margin + boxWidth, y + boxHeight);
  doc.line(margin + boxWidth * 2, y, margin + boxWidth * 2, y + boxHeight);

  const kpis = [
    { label: "Monthly recurring", value: model.monthlyTotalFormatted },
    { label: "Annual projection", value: model.annualTotalFormatted },
    { label: "Recurring charges", value: String(model.subscriptionCount) },
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * boxWidth + 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x, y + 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, x, y + 40);
  });

  y += boxHeight + 24;

  function drawTableHeader(topY: number): number {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, topY, contentWidth, 24, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const textY = topY + 15;
    doc.text("Merchant", margin + 8, textY);
    doc.text("Category", margin + 180, textY);
    doc.text("Cadence", margin + 284, textY);
    doc.text("Charges", margin + 380, textY, { align: "right" });
    doc.text("Avg Charge", margin + 448, textY, { align: "right" });
    doc.text("Monthly Eq.", margin + contentWidth - 8, textY, { align: "right" });

    return topY + 24;
  }

  y = drawTableHeader(y);

  // Table Rows
  model.rows.forEach((row, index) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    const merchantLines = doc.splitTextToSize(row.merchant, 164) as string[];
    const rowHeight = Math.max(24, merchantLines.length * 12 + 10);

    if (y + rowHeight > footerLimit) {
      doc.addPage();
      y = 44;
      y = drawTableHeader(y);
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    const baseLineY = y + 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(merchantLines, margin + 8, baseLineY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(row.category, margin + 180, baseLineY);
    doc.text(row.frequency, margin + 284, baseLineY);
    doc.text(row.occurrences, margin + 380, baseLineY, { align: "right" });
    doc.text(row.amountFormatted, margin + 448, baseLineY, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(row.monthlyFormatted, margin + contentWidth - 8, baseLineY, {
      align: "right",
    });

    y += rowHeight;
  });

  // Page Footers
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    const footerY = pageHeight - 36;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY - 12, margin + contentWidth, footerY - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Generated locally in your browser - raw statement CSV never uploaded.",
      margin,
      footerY
    );
    doc.text(
      `Page ${page} of ${pageCount}`,
      margin + contentWidth,
      footerY,
      { align: "right" }
    );
  }

  doc.save(model.filename);
  return model.filename;
}
