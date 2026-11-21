"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import {
  ArrowUpRight,
  CaretDown,
  CaretUp,
  Check,
  CircleNotch,
  DownloadSimple,
  FileText,
  LockSimple,
  MagnifyingGlass,
  Question,
  UploadSimple,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import {
  analyzeCsv,
  formatConfidenceLabel,
  formatPaymentRailLabel,
  type ConfidenceLevel,
  type Frequency,
  type PaymentRail,
  type ScanResult,
} from "@/lib/detection";
import { analyzePdfFile, PdfPasswordError } from "@/lib/pdfStatement";
import { trackScanCompleted } from "@/lib/analytics";
import {
  buildCsvExportFilename,
  subscriptionsToCsv,
} from "@/lib/csvExport";
import { exportSubscriptionsToPdf } from "@/lib/pdfExport";
import {
  deriveStatementName,
  formatScanTimestamp,
  isMissingColumnError,
  normalizeFileName,
  normalizeStatementName,
} from "@/lib/scanHistory";
import {
  classifySubscriptionCategory,
  findKnownService,
  getCancellationGuidance,
} from "@/lib/services";
import {
  buildCategoryOptions,
  filterSubscriptions,
  getSubscriptionCategory,
  type CategoryFilter,
} from "@/lib/subscriptionFilter";
import {
  buildSubscriptionSelectionKey,
} from "@/lib/savingsSummary";
import { PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";
import { supabase } from "@/lib/supabaseClient";
import SavingsShareCard from "@/components/SavingsShareCard";
import ScanHistory, {
  type PastScan,
  type SavedSubscriptionRow,
} from "@/components/ScanHistory";

const SpendingTrendChart = dynamic(
  () => import("@/components/SpendingTrendChart"),
  {
    ssr: false,
    loading: () => (
      <section className="trend-section" aria-label="6-month spending trend">
        <div className="trend-head">
          <div>
            <p className="eyebrow">6-month spending trend</p>
            <h2>Monthly recurring spend</h2>
          </div>
        </div>
        <div className="glass-panel trend-card" aria-busy="true">
          <div className="trend-skeleton">
            <div className="skeleton-bar skeleton-bar-sm" />
            <div className="skeleton-bar trend-skeleton-chart" />
          </div>
        </div>
      </section>
    ),
  }
);

function normalizeFrequency(freq: string): Frequency {
  if (
    freq === "weekly" ||
    freq === "monthly" ||
    freq === "quarterly" ||
    freq === "annual"
  ) {
    return freq;
  }
  return "monthly";
}

type ScanPhase = "idle" | "reading" | "parsing" | "saving";

const PHASE_COPY: Record<Exclude<ScanPhase, "idle">, { title: string; detail: string }> = {
  reading: {
    title: "Reading statement file…",
    detail: "Loading your CSV or PDF locally in the browser.",
  },
  parsing: {
    title: "Detecting recurring charges…",
    detail: "Grouping merchants and checking billing intervals on your device.",
  },
  saving: {
    title: "Finalizing scan results…",
    detail: "Updating your scan credit and saving the summary to your history.",
  },
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function yieldToPaint(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
      window.requestAnimationFrame(() => window.setTimeout(resolve, 0));
    } else {
      setTimeout(resolve, 0);
    }
  });
}

function readFallbackMap(storageKey: string): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeFallbackEntry(storageKey: string, scanId: string, value: string) {
  try {
    const map = readFallbackMap(storageKey);
    if (value) map[scanId] = value;
    else delete map[scanId];
    window.localStorage.setItem(storageKey, JSON.stringify(map));
  } catch {
    // ignore storage quota errors
  }
}

export default function Scanner({
  userId,
  credits = 0,
  locked,
  paywall,
  onCreditsUpdated,
}: {
  userId: string;
  credits?: number;
  locked: boolean;
  paywall: ReactNode;
  onCreditsUpdated?: (remaining: number) => void;
}) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");
  const [statementLabel, setStatementLabel] = useState("");
  const [activeScanLabel, setActiveScanLabel] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [pastScans, setPastScans] = useState<PastScan[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [expandedScanId, setExpandedScanId] = useState<string | null>(null);
  const [scanDetails, setScanDetails] = useState<
    Record<string, SavedSubscriptionRow[]>
  >({});
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);
  const [renamingScanId, setRenamingScanId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [historyActionBusyId, setHistoryActionBusyId] = useState<string | null>(
    null
  );
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [dragging, setDragging] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);
  const [pdfPassword, setPdfPassword] = useState("");
  const [pdfPasswordError, setPdfPasswordError] = useState("");
  const [reviewingHistoryAt, setReviewingHistoryAt] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [expandedGuideKey, setExpandedGuideKey] = useState<string | null>(null);
  const [selectedSavingsKeys, setSelectedSavingsKeys] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const busy = phase !== "idle";

  const annual = useMemo(
    () => (result ? result.monthlyTotal * 12 : 0),
    [result]
  );

  const categoryOptions = useMemo(
    () => (result ? buildCategoryOptions(result.subscriptions) : []),
    [result]
  );

  const filteredSubscriptions = useMemo(
    () =>
      result
        ? filterSubscriptions(result.subscriptions, searchQuery, selectedCategory)
        : [],
    [result, searchQuery, selectedCategory]
  );

  const filteredEntries = useMemo(() => {
    if (!result) return [];
    const allowed = new Set(filteredSubscriptions);
    return result.subscriptions
      .map((sub, originalIndex) => ({
        sub,
        selectionKey: buildSubscriptionSelectionKey(sub, originalIndex),
      }))
      .filter((entry) => allowed.has(entry.sub));
  }, [result, filteredSubscriptions]);

  const filteredMonthlyTotal = useMemo(
    () => filteredSubscriptions.reduce((sum, s) => sum + s.monthlyEquivalent, 0),
    [filteredSubscriptions]
  );

  const isFiltered =
    searchQuery.trim().length > 0 || selectedCategory !== "All";

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategory("All");
    setExpandedGuideKey(null);
  }

  function toggleSavingsSelection(selectionKey: string) {
    setSelectedSavingsKeys((prev) =>
      prev.includes(selectionKey)
        ? prev.filter((k) => k !== selectionKey)
        : [...prev, selectionKey]
    );
  }

  function handleDownloadCsv() {
    if (!filteredSubscriptions.length) return;
    const csv = subscriptionsToCsv(filteredSubscriptions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildCsvExportFilename(activeScanLabel || filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleExportPdf() {
    if (!result || !filteredSubscriptions.length || exportingPdf) return;
    setExportingPdf(true);
    try {
      const filterParts: string[] = [];
      if (selectedCategory !== "All") {
        filterParts.push(`Category: ${selectedCategory}`);
      }
      if (searchQuery.trim()) {
        filterParts.push(`Search: "${searchQuery.trim()}"`);
      }

      await exportSubscriptionsToPdf({
        subscriptions: filteredSubscriptions,
        statementName: activeScanLabel || filename,
        transactionsAnalyzed: reviewingHistoryAt
          ? undefined
          : result.transactionsAnalyzed,
        periodDays: reviewingHistoryAt ? undefined : result.periodDays,
        filterSummary:
          filterParts.length > 0
            ? `Filtered view (${filterParts.join(" · ")})`
            : undefined,
      });
    } catch {
      setError("Could not generate the PDF report. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  }

  function writeFallbackLabel(scanId: string, name: string) {
    writeFallbackEntry(`xray_scan_names_${userId}`, scanId, name);
  }

  function writeFallbackFileName(scanId: string, name: string) {
    writeFallbackEntry(`xray_scan_files_${userId}`, scanId, name);
  }

  useEffect(() => {
    let active = true;
    setHistoryLoading(true);

    (async () => {
      try {
        const res = await supabase
          .from("scans")
          .select(
            "id, scanned_at, statement_name, file_name, subscription_count, monthly_total"
          )
          .eq("user_id", userId)
          .order("scanned_at", { ascending: false });

        if (!active) return;

        const labels = readFallbackMap(`xray_scan_names_${userId}`);
        const fileNames = readFallbackMap(`xray_scan_files_${userId}`);

        if (
          res.error &&
          (isMissingColumnError(res.error, "file_name") ||
            isMissingColumnError(res.error, "statement_name"))
        ) {
          const withLabel = await supabase
            .from("scans")
            .select(
              "id, scanned_at, statement_name, subscription_count, monthly_total"
            )
            .eq("user_id", userId)
            .order("scanned_at", { ascending: false });

          if (!active) return;

          if (
            withLabel.error &&
            isMissingColumnError(withLabel.error, "statement_name")
          ) {
            const legacy = await supabase
              .from("scans")
              .select("id, scanned_at, subscription_count, monthly_total")
              .eq("user_id", userId)
              .order("scanned_at", { ascending: false });

            if (!active) return;
            setPastScans(
              (legacy.data ?? []).map((row) => ({
                ...row,
                statement_name: labels[row.id] ?? null,
                file_name: fileNames[row.id] ?? null,
              }))
            );
          } else {
            setPastScans(
              (withLabel.data ?? []).map((row) => ({
                ...row,
                statement_name: row.statement_name ?? labels[row.id] ?? null,
                file_name: fileNames[row.id] ?? null,
              }))
            );
          }
        } else {
          setPastScans(
            (res.data ?? []).map((row) => ({
              ...row,
              statement_name: row.statement_name ?? labels[row.id] ?? null,
              file_name: row.file_name ?? fileNames[row.id] ?? null,
            }))
          );
        }
      } finally {
        if (active) setHistoryLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  async function saveScanAndSpendCredit(
    data: ScanResult,
    sourceFilename: string
  ): Promise<boolean> {
    setSaveNotice("");
    const scanName = deriveStatementName(sourceFilename, statementLabel);
    const cleanFileName = normalizeFileName(sourceFilename);
    setActiveScanLabel(scanName);

    const hasSubscriptions = data.subscriptions.length > 0;
    const fullSubPayload = data.subscriptions.map((sub) => ({
      merchant: sub.merchant,
      amount: sub.amount,
      frequency: sub.frequency,
      occurrences: sub.occurrences,
      monthly_equivalent: sub.monthlyEquivalent,
      confidence: sub.confidence ?? null,
      payment_rail:
        sub.paymentRail && sub.paymentRail !== "unknown"
          ? sub.paymentRail
          : null,
      detection_reason: sub.detectionReason ?? null,
    }));

    // Single atomic Postgres transaction via SECURITY DEFINER RPC:
    // saves scan + detected subscriptions, and deducts 1 credit iff >= 1 subscription.
    const rpcRes = await supabase.rpc("save_scan_and_spend_credit", {
      p_statement_name: scanName,
      p_file_name: cleanFileName || null,
      p_subscription_count: data.subscriptions.length,
      p_monthly_total: hasSubscriptions ? data.monthlyTotal : 0,
      p_annual_total: hasSubscriptions ? data.monthlyTotal * 12 : 0,
      p_subscriptions: fullSubPayload,
    });

    if (rpcRes.error) {
      const msg = (rpcRes.error.message ?? "").toLowerCase();
      if (msg.includes("no scan credits")) {
        onCreditsUpdated?.(0);
        setError(
          `You have no scan credits remaining. Unlock ${PACK_SIZE} scans for ${PACK_PRICE_LABEL} to continue.`
        );
      } else {
        setError(
          "Could not save your scan or use a scan credit. No credit was deducted — please try again."
        );
      }
      return false;
    }

    if (!rpcRes.data || typeof rpcRes.data !== "object") {
      setError(
        "Unexpected response while saving your scan. No credit was deducted — please try again."
      );
      return false;
    }

    const payload = rpcRes.data as {
      remaining?: number;
      credit_used?: boolean;
      scan?: PastScan;
    };

    if (typeof payload.remaining === "number") {
      onCreditsUpdated?.(payload.remaining);
    }

    if (payload.credit_used === false || !hasSubscriptions) {
      setSaveNotice("No recurring charges found. No credit used.");
    }

    if (!payload.scan?.id) {
      setError(
        "Could not confirm saved scan record. Please refresh and check your scan history."
      );
      return false;
    }

    writeFallbackLabel(payload.scan.id, scanName);
    if (cleanFileName) {
      writeFallbackFileName(payload.scan.id, cleanFileName);
    }

    setStatementLabel("");
    setPastScans((prev) => [
      {
        id: payload.scan!.id,
        scanned_at: payload.scan!.scanned_at,
        statement_name: payload.scan!.statement_name ?? scanName,
        file_name: payload.scan!.file_name ?? (cleanFileName || null),
        subscription_count:
          typeof payload.scan?.subscription_count === "number"
            ? payload.scan.subscription_count
            : hasSubscriptions
              ? data.subscriptions.length
              : 0,
        monthly_total:
          typeof payload.scan?.monthly_total === "number"
            ? payload.scan.monthly_total
            : hasSubscriptions
              ? data.monthlyTotal
              : 0,
      },
      ...prev,
    ]);
    return true;
  }

  async function toggleExpandScan(scanId: string) {
    if (expandedScanId === scanId) {
      setExpandedScanId(null);
      return;
    }
    setExpandedScanId(scanId);
    if (scanDetails[scanId]) return;

    setLoadingDetailsId(scanId);
    try {
      const res = await supabase
        .from("detected_subscriptions")
        .select(
          "id, merchant, amount, frequency, occurrences, monthly_equivalent, confidence, payment_rail, detection_reason"
        )
        .eq("scan_id", scanId)
        .eq("user_id", userId)
        .order("monthly_equivalent", { ascending: false });

      if (
        res.error &&
        (isMissingColumnError(res.error, "confidence") ||
          isMissingColumnError(res.error, "payment_rail") ||
          isMissingColumnError(res.error, "detection_reason"))
      ) {
        const legacy = await supabase
          .from("detected_subscriptions")
          .select(
            "id, merchant, amount, frequency, occurrences, monthly_equivalent"
          )
          .eq("scan_id", scanId)
          .eq("user_id", userId)
          .order("monthly_equivalent", { ascending: false });
        setScanDetails((prev) => ({
          ...prev,
          [scanId]: (legacy.data ?? []) as SavedSubscriptionRow[],
        }));
      } else {
        setScanDetails((prev) => ({
          ...prev,
          [scanId]: (res.data ?? []) as SavedSubscriptionRow[],
        }));
      }
    } finally {
      setLoadingDetailsId(null);
    }
  }

  async function saveScanRename(
    e: React.FormEvent<HTMLFormElement>,
    scanId: string
  ) {
    e.preventDefault();
    const cleaned = normalizeStatementName(renameDraft);
    if (!cleaned) return;

    setHistoryActionBusyId(scanId);
    try {
      const { error: updateErr } = await supabase
        .from("scans")
        .update({ statement_name: cleaned })
        .eq("id", scanId)
        .eq("user_id", userId);

      if (!updateErr || isMissingColumnError(updateErr, "statement_name")) {
        writeFallbackLabel(scanId, cleaned);
        setPastScans((prev) =>
          prev.map((row) =>
            row.id === scanId ? { ...row, statement_name: cleaned } : row
          )
        );
        setRenamingScanId(null);
      } else {
        setSaveNotice("Could not rename this scan right now.");
      }
    } finally {
      setHistoryActionBusyId(null);
    }
  }

  async function deletePastScan(scanId: string) {
    const confirmed = window.confirm(
      "Remove this scan from your history? Your remaining scan credits will not change."
    );
    if (!confirmed) return;

    setHistoryActionBusyId(scanId);
    try {
      const { error: delError } = await supabase
        .from("scans")
        .delete()
        .eq("id", scanId)
        .eq("user_id", userId);

      if (delError) {
        setSaveNotice("Could not delete this scan from your history.");
        return;
      }

      writeFallbackLabel(scanId, "");
      writeFallbackFileName(scanId, "");
      setPastScans((prev) => prev.filter((row) => row.id !== scanId));
      if (expandedScanId === scanId) setExpandedScanId(null);
      if (renamingScanId === scanId) setRenamingScanId(null);
    } finally {
      setHistoryActionBusyId(null);
    }
  }

  function openPastScanInViewer(
    scan: PastScan,
    details: SavedSubscriptionRow[]
  ) {
    const mapped = details.map((item) => {
      const service = findKnownService(item.merchant) ?? undefined;
      const validRail =
        item.payment_rail === "upi_autopay" ||
        item.payment_rail === "nach_emandate" ||
        item.payment_rail === "card_si" ||
        item.payment_rail === "upi"
          ? (item.payment_rail as PaymentRail)
          : undefined;
      const validConf =
        item.confidence === "high" ||
        item.confidence === "medium" ||
        item.confidence === "possible"
          ? (item.confidence as ConfidenceLevel)
          : undefined;
      return {
        merchant: item.merchant,
        amount: Number(item.amount),
        frequency: normalizeFrequency(item.frequency),
        occurrences: Number(item.occurrences),
        monthlyEquivalent: Number(item.monthly_equivalent),
        category: classifySubscriptionCategory(item.merchant, service?.category),
        confidence: validConf,
        paymentRail: validRail,
        detectionReason: item.detection_reason ?? undefined,
        service,
      };
    });
    const label =
      scan.statement_name?.trim() || scan.file_name?.trim() || "Statement scan";
    setError("");
    setSaveNotice("");
    setFilename(scan.file_name?.trim() || label);
    setActiveScanLabel(label);
    setReviewingHistoryAt(scan.scanned_at);
    setSearchQuery("");
    setSelectedCategory("All");
    setExpandedGuideKey(null);
    setSelectedSavingsKeys([]);
    setResult({
      subscriptions: mapped,
      monthlyTotal: Number(scan.monthly_total),
      transactionsAnalyzed: 0,
      periodDays: 0,
    });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleFile(file: File, password?: string) {
    if (busy || locked) return;
    setError("");
    setSaveNotice("");
    setPdfPasswordError("");
    setReviewingHistoryAt(null);
    setFilename(file.name);

    const lower = file.name.toLowerCase();
    const isPdf = lower.endsWith(".pdf") || file.type === "application/pdf";
    const isCsv = lower.endsWith(".csv") || file.type === "text/csv";

    if (!isPdf && !isCsv) {
      setPendingPdfFile(null);
      setPdfPassword("");
      setError("Please choose a CSV or PDF bank/card statement.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setPendingPdfFile(null);
      setPdfPassword("");
      setError(
        "That file is over 10 MB. Export a shorter date range and try again."
      );
      return;
    }

    if (!password) {
      setPendingPdfFile(null);
      setPdfPassword("");
    }

    setPhase("reading");
    try {
      await yieldToPaint();
      let data: ScanResult;

      if (isPdf) {
        setPhase("parsing");
        await yieldToPaint();
        data = await analyzePdfFile(file, password);
      } else {
        const csvText = await file.text();
        setPhase("parsing");
        await yieldToPaint();
        data = analyzeCsv(csvText);
      }

      setPendingPdfFile(null);
      setPdfPassword("");
      setPdfPasswordError("");

      setPhase("saving");
      const saveTimeout = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Saving took too long. Check your connection and try again — no scan credit was lost."
              )
            ),
          25_000
        )
      );
      const saved = await Promise.race([
        saveScanAndSpendCredit(data, file.name),
        saveTimeout,
      ]);
      if (!saved) {
        setResult(null);
        return;
      }

      trackScanCompleted({
        fileType: isPdf ? "pdf" : "csv",
        recurringCount: data.subscriptions.length,
        creditUsed: data.subscriptions.length > 0,
      });

      setResult(data);
      setSearchQuery("");
      setSelectedCategory("All");
      setExpandedGuideKey(null);
      setSelectedSavingsKeys([]);
    } catch (e) {
      setResult(null);
      setSelectedSavingsKeys([]);
      if (e instanceof PdfPasswordError) {
        setPendingPdfFile(file);
        setPdfPasswordError(e.reason === "incorrect" ? e.message : "");
        return;
      }
      setPendingPdfFile(null);
      setPdfPassword("");
      setError(
        e instanceof Error
          ? e.message
          : isPdf
            ? "Could not read this PDF statement."
            : "Could not read this CSV."
      );
    } finally {
      setPhase("idle");
    }
  }

  function handlePdfPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingPdfFile || busy) return;
    if (!pdfPassword.trim()) {
      setPdfPasswordError("Enter the PDF password to unlock this statement.");
      return;
    }
    void handleFile(pendingPdfFile, pdfPassword);
  }

  function onInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void handleFile(file);
  }

  function onDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (busy || locked) return;
    event.preventDefault();
    setDragging(true);
  }

  function onDragLeave(event: React.DragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDragging(false);
    }
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (busy || locked) return;
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const phaseInfo = phase !== "idle" ? PHASE_COPY[phase] : null;
  const overviewMonthly = result
    ? result.monthlyTotal
    : pastScans.length > 0
      ? Number(pastScans[0].monthly_total)
      : null;
  const overviewAnnual =
    overviewMonthly !== null ? overviewMonthly * 12 : null;

  return (
    <LazyMotion features={domAnimation}>
      <div className="scanner" aria-busy={busy}>
      <div className="scanner-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Statement scan</h1>
          <p className="lede">
            Find the recurring charges hiding in your CSV or PDF statement. Your
            raw file stays on this device — only detected summaries are saved to
            your account.
          </p>
        </div>
        {!locked && (
          <label
            className="btn btn-primary upload-btn"
            aria-disabled={busy}
          >
            {busy ? (
              <CircleNotch size={16} className="spin-icon" aria-hidden="true" />
            ) : (
              <UploadSimple size={16} aria-hidden="true" />
            )}
            <span>{busy ? "Scanning…" : "Choose CSV / PDF"}</span>
            <input
              type="file"
              accept=".csv,.pdf,text/csv,text/comma-separated-values,application/csv,application/pdf,application/vnd.ms-excel"
              onChange={onInput}
              disabled={busy}
            />
          </label>
        )}
      </div>

      <section className="glass-panel kpi-strip" aria-label="Account summary">
        <div className="kpi-cell">
          <span className="kpi-label">Available scans</span>
          <strong className={`kpi-value${locked ? " is-muted" : " is-teal"}`}>
            {credits} {credits === 1 ? "scan" : "scans"}
          </strong>
          <span className="kpi-sub">
            {locked
              ? `${PACK_SIZE}-scan pack · ${PACK_PRICE_LABEL} one-time`
              : "Credits never expire"}
          </span>
        </div>
        <div className="kpi-cell">
          <span className="kpi-label">Monthly recurring</span>
          <strong className="kpi-value">
            {overviewMonthly !== null
              ? `₹${overviewMonthly.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
              : "—"}
          </strong>
          <span className="kpi-sub">
            {result
              ? "Active statement view"
              : pastScans.length > 0
                ? "From latest scan"
                : "No scans yet"}
          </span>
        </div>
        <div className="kpi-cell">
          <span className="kpi-label">Annual run-rate</span>
          <strong className="kpi-value">
            {overviewAnnual !== null
              ? `₹${overviewAnnual.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
              : "—"}
          </strong>
          <span className="kpi-sub">Projected 12-month spend</span>
        </div>
        <div className="kpi-cell">
          <span className="kpi-label">Scan history</span>
          <strong className="kpi-value">
            {historyLoading ? "…" : pastScans.length}
          </strong>
          <span className="kpi-sub">
            {pastScans.length === 1 ? "Saved statement" : "Saved statements"}
          </span>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-primary">
          {locked ? (
            <div className="glass-panel scan-stage-locked">
              <div className="scan-locked-copy">
                <div className="scan-locked-title">
                  <LockSimple size={16} aria-hidden="true" />
                  <h2>You&apos;re out of scans</h2>
                </div>
                <p>
                  Unlock {PACK_SIZE} scans for {PACK_PRICE_LABEL}, one-time.
                  Nothing repeats automatically — buy a pack to scan new
                  statements.
                </p>
              </div>
              <div className="scan-locked-cta">{paywall}</div>
            </div>
          ) : (
            <div
              className={`glass-panel dropzone${dragging ? " is-dragging" : ""}${busy ? " is-busy" : ""}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={(event) => {
                if (busy || locked) return;
                const target = event.target as HTMLElement;
                if (
                  target.closest("input, button, label, a")
                ) {
                  return;
                }
                fileInputRef.current?.click();
              }}
            >
              <div className="dropzone-reticle" aria-hidden="true">
                <span className="reticle-corner is-tl" />
                <span className="reticle-corner is-tr" />
                <span className="reticle-corner is-bl" />
                <span className="reticle-corner is-br" />
              </div>

              {(dragging || busy) && (
                <m.div
                  className="dropzone-scan-beam"
                  aria-hidden="true"
                  initial={{ opacity: 0, y: "-10%" }}
                  animate={{
                    opacity: [0.35, 0.95, 0.35],
                    y: ["0%", "260%", "0%"],
                  }}
                  transition={{
                    duration: busy ? 1.5 : 1.9,
                    repeat: Infinity,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              )}

              <m.div
                className={`dropzone-icon${busy ? " is-busy" : ""}${dragging ? " is-dragging" : ""}`}
                aria-hidden="true"
                animate={
                  busy
                    ? { scale: [1, 1.06, 1] }
                    : dragging
                      ? { y: -4, scale: 1.08 }
                      : { y: [0, -3, 0] }
                }
                transition={
                  busy || !dragging
                    ? {
                        duration: busy ? 1.1 : 2.8,
                        repeat: Infinity,
                        ease: [0.22, 1, 0.36, 1],
                      }
                    : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }
                }
              >
                {busy ? (
                  <CircleNotch size={22} className="spin-icon" />
                ) : (
                  <UploadSimple size={22} />
                )}
              </m.div>

              <AnimatePresence mode="wait">
                <m.div
                  key={busy ? phase : dragging ? "dragging" : "idle"}
                  className="dropzone-copy"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2>
                    {busy
                      ? phaseInfo?.title
                      : dragging
                        ? "Release to scan statement"
                        : "Drop your statement here"}
                  </h2>
                  <p>
                    {busy
                      ? phaseInfo?.detail
                      : "Supports CSV and digital bank/card PDFs. Password-protected PDFs are unlocked locally in your browser."}
                  </p>
                </m.div>
              </AnimatePresence>

              {busy && (
                <div className="dropzone-steps" aria-hidden="true">
                  {(
                    [
                      { id: "reading", label: "Read file" },
                      { id: "parsing", label: "Detect charges" },
                      { id: "saving", label: "Save summary" },
                    ] as const
                  ).map((step, index) => {
                    const phaseOrder = {
                      idle: -1,
                      reading: 0,
                      parsing: 1,
                      saving: 2,
                    } as const;
                    const currentIdx = phaseOrder[phase];
                    const isDone = currentIdx > index;
                    const isActive = currentIdx === index;
                    return (
                      <span
                        key={step.id}
                        className={`dropzone-step${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}
                      >
                        {isDone ? (
                          <Check size={12} aria-hidden="true" />
                        ) : (
                          <span className="dropzone-step-num">{index + 1}.</span>
                        )}
                        <span>{step.label}</span>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="dropzone-controls">
                <input
                  type="text"
                  className="statement-name-input"
                  value={statementLabel}
                  onChange={(e) => setStatementLabel(e.target.value)}
                  placeholder="Optional scan name (e.g. HDFC Savings Oct)"
                  aria-label="Optional name for this statement scan"
                  maxLength={80}
                  disabled={busy}
                />
                <label className="btn btn-primary" aria-disabled={busy}>
                  {busy && (
                    <CircleNotch size={16} className="spin-icon" aria-hidden="true" />
                  )}
                  <span>
                    {busy ? "Processing statement…" : "Select CSV or PDF"}
                  </span>
                  <input
                    ref={fileInputRef}
                    className="hidden-input"
                    type="file"
                    accept=".csv,.pdf,text/csv,text/comma-separated-values,application/csv,application/pdf,application/vnd.ms-excel"
                    onChange={onInput}
                    disabled={busy}
                  />
                </label>
              </div>
              {filename && <div className="file-name">Loaded: {filename}</div>}
            </div>
          )}

          {pendingPdfFile && !busy && (
            <form
              className="glass-panel pdf-password-card"
              onSubmit={handlePdfPasswordSubmit}
            >
              <div className="pdf-password-head">
                <LockSimple size={16} aria-hidden="true" />
                <div>
                  <strong>Password-protected PDF</strong>
                  <span>
                    Enter the password for {pendingPdfFile.name} to unlock and
                    scan it locally on your device.
                  </span>
                </div>
              </div>
              <div className="pdf-password-row">
                <input
                  type="password"
                  value={pdfPassword}
                  onChange={(e) => {
                    setPdfPassword(e.target.value);
                    if (pdfPasswordError) setPdfPasswordError("");
                  }}
                  placeholder="Enter PDF password"
                  aria-label="PDF statement password"
                  autoFocus
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Unlock &amp; scan
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setPendingPdfFile(null);
                    setPdfPassword("");
                    setPdfPasswordError("");
                    setFilename("");
                  }}
                >
                  Cancel
                </button>
              </div>
              {pdfPasswordError && (
                <p className="pdf-password-error" role="alert">
                  {pdfPasswordError}
                </p>
              )}
            </form>
          )}

          {busy && phaseInfo && (
            <div className="results" role="status" aria-live="polite">
              <div className="glass-panel scan-progress-banner">
                <CircleNotch
                  size={20}
                  className="spin-icon"
                  style={{ color: "var(--teal)", flexShrink: 0 }}
                  aria-hidden="true"
                />
                <div className="scan-progress-text">
                  <strong>{phaseInfo.title}</strong>
                  <span>
                    {filename ? `${filename} · ` : ""}
                    {phaseInfo.detail}
                  </span>
                </div>
              </div>

              <div className="glass-panel result-grid" style={{ marginTop: 16 }}>
                <div className="metric">
                  <div className="skeleton-bar skeleton-bar-sm" />
                  <div className="skeleton-bar skeleton-bar-lg" />
                </div>
                <div className="metric">
                  <div className="skeleton-bar skeleton-bar-sm" />
                  <div className="skeleton-bar skeleton-bar-lg" />
                </div>
                <div className="metric">
                  <div className="skeleton-bar skeleton-bar-sm" />
                  <div className="skeleton-bar skeleton-bar-lg" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="error-box" role="alert">
              <WarningCircle
                size={16}
                style={{ flexShrink: 0, marginTop: 2 }}
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          )}
          {saveNotice && <div className="notice-box">{saveNotice}</div>}

      {!busy && result && (
        <m.div
          ref={resultsRef}
          className="results"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="glass-panel result-grid">
            <div className="metric">
              <span>Monthly recurring</span>
              <strong>
                ₹
                {result.monthlyTotal.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
            <div className="metric">
              <span>Annual projection</span>
              <strong>
                ₹
                {annual.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
            <div className="metric">
              <span>Recurring charges</span>
              <strong>{result.subscriptions.length}</strong>
            </div>
          </div>

          <p className="scan-meta">
            {reviewingHistoryAt ? (
              <>
                Reviewing saved scan from{" "}
                {formatScanTimestamp(reviewingHistoryAt)} ·{" "}
                {activeScanLabel || filename} (no credit used).
              </>
            ) : (
              <>
                Analysed {result.transactionsAnalyzed.toLocaleString("en-IN")}{" "}
                spending transactions over {result.periodDays} days.
              </>
            )}
          </p>
          {!reviewingHistoryAt && result.periodDays < 45 && (
            <div className="notice-box">
              This statement covers under 45 days, so monthly charges seen only
              once can&apos;t be detected. Try a statement covering 3 months or
              more.
            </div>
          )}

          <div className="result-heading">
            <div>
              <p className="eyebrow">Detected subscriptions</p>
              <h2>Your recurring charges</h2>
            </div>
            {result.subscriptions.length > 0 && (
              <div className="result-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleExportPdf}
                  disabled={filteredSubscriptions.length === 0 || exportingPdf}
                >
                  {exportingPdf ? (
                    <CircleNotch size={15} className="spin-icon" aria-hidden="true" />
                  ) : (
                    <FileText size={15} aria-hidden="true" />
                  )}
                  <span>{exportingPdf ? "Exporting…" : "Export to PDF"}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleDownloadCsv}
                  disabled={filteredSubscriptions.length === 0}
                >
                  <DownloadSimple size={15} aria-hidden="true" />
                  <span>Download CSV</span>
                </button>
              </div>
            )}
          </div>

          {result.subscriptions.length > 0 ? (
            <>
              <div className="results-toolbar">
                <div className="results-search">
                  <MagnifyingGlass
                    size={16}
                    className="results-search-icon"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by merchant, category, or cadence…"
                    aria-label="Search detected subscriptions"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="results-search-clear"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div
                  className="results-categories"
                  role="group"
                  aria-label="Filter by subscription category"
                >
                  {categoryOptions.map((opt) => {
                    const active = selectedCategory === opt.category;
                    return (
                      <button
                        key={opt.category}
                        type="button"
                        className={`filter-tab${active ? " is-active" : ""}`}
                        aria-pressed={active}
                        onClick={() => setSelectedCategory(opt.category)}
                      >
                        <span>{opt.category}</span>
                        <span className="filter-tab-count">{opt.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {isFiltered && (
                <div className="results-filter-summary" role="status" aria-live="polite">
                  <span>
                    Showing {filteredSubscriptions.length} of{" "}
                    {result.subscriptions.length} charges · ₹
                    {filteredMonthlyTotal.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                    /mo
                  </span>
                  <button
                    type="button"
                    className="results-clear-btn"
                    onClick={resetFilters}
                  >
                    Reset filters
                  </button>
                </div>
              )}

              {filteredEntries.length > 0 ? (
                <div className="glass-panel subscription-list">
                  {filteredEntries.map(({ sub, selectionKey }) => {
                    const rowKey = selectionKey;
                    const railLabel = formatPaymentRailLabel(sub.paymentRail);
                    const confLabel = formatConfidenceLabel(sub.confidence);
                    const guideOpen = expandedGuideKey === rowKey;
                    const isMarked = selectedSavingsKeys.includes(selectionKey);
                    const guidance = guideOpen
                      ? getCancellationGuidance(sub.merchant, sub.paymentRail)
                      : null;

                    return (
                      <div
                        className={`subscription${isMarked ? " is-marked" : ""}`}
                        key={rowKey}
                      >
                        <div className="subscription-check-col">
                          <input
                            type="checkbox"
                            className="savings-checkbox"
                            checked={isMarked}
                            onChange={() => toggleSavingsSelection(selectionKey)}
                            aria-label={`Mark ${sub.merchant} to cancel for savings estimate`}
                          />
                        </div>
                        <div className="subscription-main">
                          <div className="subscription-title-row">
                            <strong>{sub.merchant}</strong>
                            {confLabel && (
                              <span
                                className={`sub-badge sub-conf is-${sub.confidence ?? "medium"}`}
                              >
                                {confLabel}
                              </span>
                            )}
                            {railLabel && (
                              <span
                                className={`sub-badge sub-rail is-${sub.paymentRail ?? "upi"}`}
                              >
                                {railLabel}
                              </span>
                            )}
                            {isMarked && (
                              <span className="sub-badge sub-marked">
                                Marked to cancel
                              </span>
                            )}
                          </div>
                          <span className="subscription-meta">
                            {sub.frequency} · {sub.occurrences} charges ·{" "}
                            {getSubscriptionCategory(sub)}
                            {sub.detectionReason ? ` · ${sub.detectionReason}` : ""}
                          </span>
                          <div className="subscription-action-row">
                            {sub.service && (
                              <a
                                className="manage-link"
                                href={sub.service.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span>{sub.service.label}</span>
                                <ArrowUpRight size={13} aria-hidden="true" />
                              </a>
                            )}
                            <button
                              type="button"
                              className="guide-toggle-btn"
                              aria-expanded={guideOpen}
                              onClick={() =>
                                setExpandedGuideKey(guideOpen ? null : rowKey)
                              }
                            >
                              <Question size={14} aria-hidden="true" />
                              <span>
                                {sub.paymentRail === "upi_autopay" ||
                                sub.paymentRail === "upi"
                                  ? "How to cancel / revoke AutoPay"
                                  : "How to cancel"}
                              </span>
                              {guideOpen ? (
                                <CaretUp size={14} aria-hidden="true" />
                              ) : (
                                <CaretDown size={14} aria-hidden="true" />
                              )}
                            </button>
                          </div>

                          {guideOpen && guidance && (
                            <div className="cancel-guide-box">
                              <strong className="cancel-guide-title">
                                {guidance.title}
                              </strong>
                              <ul className="cancel-guide-steps">
                                {guidance.steps.map((step, stepIdx) => (
                                  <li key={stepIdx}>{step}</li>
                                ))}
                              </ul>
                              {guidance.appShortcuts && (
                                <div className="cancel-guide-apps">
                                  {guidance.appShortcuts.map((item) => (
                                    <div
                                      key={item.app}
                                      className="cancel-guide-app"
                                    >
                                      <strong>{item.app}:</strong>{" "}
                                      <span>{item.path}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="subscription-price">
                          ₹
                          {sub.monthlyEquivalent.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                          <small>/mo</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="glass-panel empty-state results-no-match">
                  <p>
                    No subscriptions match
                    {searchQuery.trim()
                      ? ` "${searchQuery.trim()}"`
                      : " this category"}
                    {selectedCategory !== "All" && searchQuery.trim()
                      ? ` in ${selectedCategory}`
                      : ""}
                    .
                  </p>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={resetFilters}
                  >
                    Reset filters
                  </button>
                </div>
              )}

              <SavingsShareCard
                subscriptions={result.subscriptions}
                selectedKeys={selectedSavingsKeys}
                onClearSelection={() => setSelectedSavingsKeys([])}
              />
            </>
          ) : (
            <div className="glass-panel empty-state">
              <strong>No recurring charges found. No credit used.</strong>
              <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
                No recurring payments were identified in this statement. Try
                another CSV or PDF statement covering multiple months — your
                scan credit balance was not charged.
              </p>
            </div>
          )}

          <div className="glass-panel privacy-card">
            <strong>Privacy note</strong>
            <p>
              Your raw statement was never uploaded — only the merchant names
              and amounts shown above are saved to your account, so you can look
              back at this scan later. Detection is automatic: check each charge
              before you cancel anything.
            </p>
          </div>
        </m.div>
      )}

        </div>

        <aside className="dashboard-sidebar">
          <SpendingTrendChart
            scans={pastScans}
            loading={historyLoading}
            locked={locked}
            onRequestScan={() => fileInputRef.current?.click()}
          />

          <div className="glass-panel rail-privacy-note">
            <div className="rail-privacy-head">
              <LockSimple size={14} aria-hidden="true" />
              <strong>Browser-only statement parsing</strong>
            </div>
            <p>
              Raw CSV and PDF statements never leave your device. Only detected
              merchant totals are stored for your scan history.
            </p>
          </div>
        </aside>
      </div>

      <ScanHistory
        scans={pastScans}
        loading={historyLoading}
        locked={locked}
        expandedScanId={expandedScanId}
        renamingScanId={renamingScanId}
        renameDraft={renameDraft}
        loadingDetailsId={loadingDetailsId}
        busyScanId={historyActionBusyId}
        scanDetails={scanDetails}
        onRenameDraftChange={setRenameDraft}
        onStartRename={(scanId, currentName) => {
          setRenameDraft(currentName);
          setRenamingScanId(scanId);
        }}
        onCancelRename={() => setRenamingScanId(null)}
        onSaveRename={saveScanRename}
        onToggleExpand={toggleExpandScan}
        onDeleteScan={deletePastScan}
        onOpenInViewer={openPastScanInViewer}
        onRequestScan={() => fileInputRef.current?.click()}
      />
      </div>
    </LazyMotion>
  );
}
