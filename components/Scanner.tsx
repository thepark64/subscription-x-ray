"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowUpRight,
  Download,
  FileText,
  Loader2,
  Lock,
  Search,
  Upload,
  X,
} from "lucide-react";
import { analyzeCsv, type Frequency, type ScanResult } from "@/lib/detection";
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
} from "@/lib/services";
import {
  buildCategoryOptions,
  filterSubscriptions,
  getSubscriptionCategory,
  type CategoryFilter,
} from "@/lib/subscriptionFilter";
import { PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";
import { supabase } from "@/lib/supabaseClient";
import SpendingTrendChart from "@/components/SpendingTrendChart";
import ScanHistory, {
  type PastScan,
  type SavedSubscriptionRow,
} from "@/components/ScanHistory";

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
    title: "Reading CSV file…",
    detail: "Loading your statement locally in the browser.",
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

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function yieldToPaint(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
      window.requestAnimationFrame(() => window.setTimeout(resolve, 0));
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export default function Scanner({
  userId,
  credits = 0,
  locked,
  paywall,
  spendCredit,
  onCreditsUpdated,
}: {
  userId: string;
  credits?: number;
  locked: boolean;
  paywall: ReactNode;
  spendCredit: () => Promise<boolean>;
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
  const [reviewingHistoryAt, setReviewingHistoryAt] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
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

  const filteredMonthlyTotal = useMemo(
    () => filteredSubscriptions.reduce((sum, s) => sum + s.monthlyEquivalent, 0),
    [filteredSubscriptions]
  );

  const isFiltered =
    searchQuery.trim().length > 0 || selectedCategory !== "All";

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategory("All");
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

  function readFallbackLabels(): Record<string, string> {
    return readFallbackMap(`xray_scan_names_${userId}`);
  }

  function writeFallbackLabel(scanId: string, name: string) {
    writeFallbackEntry(`xray_scan_names_${userId}`, scanId, name);
  }

  function readFallbackFileNames(): Record<string, string> {
    return readFallbackMap(`xray_scan_files_${userId}`);
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

        const labels = readFallbackLabels();
        const fileNames = readFallbackFileNames();

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

  function isMissingSaveScanRpc(err: { code?: string; message?: string } | null) {
    if (!err) return false;
    const msg = (err.message ?? "").toLowerCase();
    return (
      err.code === "PGRST202" ||
      err.code === "42883" ||
      msg.includes("save_scan_and_spend_credit")
    );
  }

  async function saveScanAndSpendCredit(
    data: ScanResult,
    sourceFilename: string
  ): Promise<boolean> {
    setSaveNotice("");
    const scanName = deriveStatementName(sourceFilename, statementLabel);
    const cleanFileName = normalizeFileName(sourceFilename);
    setActiveScanLabel(scanName);

    const subPayload = data.subscriptions.map((sub) => ({
      merchant: sub.merchant,
      amount: sub.amount,
      frequency: sub.frequency,
      occurrences: sub.occurrences,
      monthly_equivalent: sub.monthlyEquivalent,
    }));

    // Preferred path: single atomic Postgres transaction (saves scan + details + spends 1 credit).
    const rpcRes = await supabase.rpc("save_scan_and_spend_credit", {
      p_statement_name: scanName,
      p_file_name: cleanFileName || null,
      p_subscription_count: data.subscriptions.length,
      p_monthly_total: data.monthlyTotal,
      p_annual_total: data.monthlyTotal * 12,
      p_subscriptions: subPayload,
    });

    if (!rpcRes.error && rpcRes.data && typeof rpcRes.data === "object") {
      const payload = rpcRes.data as {
        remaining?: number;
        scan?: PastScan;
      };
      if (typeof payload.remaining === "number") {
        onCreditsUpdated?.(payload.remaining);
      }
      if (payload.scan?.id) {
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
            subscription_count: data.subscriptions.length,
            monthly_total: data.monthlyTotal,
          },
          ...prev,
        ]);
        return true;
      }
    }

    if (rpcRes.error && !isMissingSaveScanRpc(rpcRes.error)) {
      const msg = (rpcRes.error.message ?? "").toLowerCase();
      setError(
        msg.includes("no scan credits")
          ? "You have no scan credits remaining. Buy a pack to continue."
          : "Could not save your scan or use a scan credit. No credit was deducted — please try again."
      );
      return false;
    }

    // Safe fallback for older schemas without save_scan_and_spend_credit:
    // Save scan + details FIRST, then deduct 1 credit, rolling back the scan row if deduction fails.
    let insertResult = await supabase
      .from("scans")
      .insert({
        user_id: userId,
        statement_name: scanName,
        file_name: cleanFileName || null,
        subscription_count: data.subscriptions.length,
        monthly_total: data.monthlyTotal,
        annual_total: data.monthlyTotal * 12,
      })
      .select()
      .single();

    if (
      insertResult.error &&
      isMissingColumnError(insertResult.error, "file_name")
    ) {
      insertResult = await supabase
        .from("scans")
        .insert({
          user_id: userId,
          statement_name: scanName,
          subscription_count: data.subscriptions.length,
          monthly_total: data.monthlyTotal,
          annual_total: data.monthlyTotal * 12,
        })
        .select()
        .single();
    }

    if (
      insertResult.error &&
      isMissingColumnError(insertResult.error, "statement_name")
    ) {
      insertResult = await supabase
        .from("scans")
        .insert({
          user_id: userId,
          subscription_count: data.subscriptions.length,
          monthly_total: data.monthlyTotal,
          annual_total: data.monthlyTotal * 12,
        })
        .select()
        .single();
    }

    const { data: scanRow, error: scanError } = insertResult;

    if (scanError || !scanRow) {
      setError(
        "Could not save your scan to history. No scan credit was used — please try again."
      );
      return false;
    }

    if (subPayload.length) {
      const { error: subsError } = await supabase
        .from("detected_subscriptions")
        .insert(
          subPayload.map((sub) => ({
            scan_id: scanRow.id,
            user_id: userId,
            ...sub,
          }))
        );
      if (subsError) {
        await supabase
          .from("scans")
          .delete()
          .eq("id", scanRow.id)
          .eq("user_id", userId);
        setError(
          "Could not save detected subscriptions to history. No scan credit was used — please try again."
        );
        return false;
      }
    }

    const spent = await spendCredit();
    if (!spent) {
      await supabase
        .from("scans")
        .delete()
        .eq("id", scanRow.id)
        .eq("user_id", userId);
      setError(
        "Couldn't use a scan credit, so this scan wasn't saved. Please refresh the page and try again."
      );
      return false;
    }

    writeFallbackLabel(scanRow.id, scanName);
    if (cleanFileName) {
      writeFallbackFileName(scanRow.id, cleanFileName);
    }

    setStatementLabel("");
    setPastScans((prev) => [
      {
        id: scanRow.id,
        scanned_at: scanRow.scanned_at,
        statement_name: scanRow.statement_name ?? scanName,
        file_name: scanRow.file_name ?? (cleanFileName || null),
        subscription_count: data.subscriptions.length,
        monthly_total: data.monthlyTotal,
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
      const { data } = await supabase
        .from("detected_subscriptions")
        .select(
          "id, merchant, amount, frequency, occurrences, monthly_equivalent"
        )
        .eq("scan_id", scanId)
        .eq("user_id", userId)
        .order("monthly_equivalent", { ascending: false });
      setScanDetails((prev) => ({
        ...prev,
        [scanId]: data ?? [],
      }));
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
      return {
        merchant: item.merchant,
        amount: Number(item.amount),
        frequency: normalizeFrequency(item.frequency),
        occurrences: Number(item.occurrences),
        monthlyEquivalent: Number(item.monthly_equivalent),
        category: classifySubscriptionCategory(item.merchant, service?.category),
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
    setResult({
      subscriptions: mapped,
      monthlyTotal: Number(scan.monthly_total),
      transactionsAnalyzed: 0,
      periodDays: 0,
    });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleFile(file: File) {
    if (busy || locked) return;
    setError("");
    setSaveNotice("");
    setReviewingHistoryAt(null);
    setFilename(file.name);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a CSV file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(
        "That file is over 5 MB. Export a shorter date range and try again."
      );
      return;
    }

    setPhase("reading");
    try {
      const csvText = await file.text();

      setPhase("parsing");
      // Yield a frame so the loading indicator paints before synchronous CSV parsing.
      await yieldToPaint();
      const data = analyzeCsv(csvText);

      setPhase("saving");
      const saved = await saveScanAndSpendCredit(data, file.name);
      if (!saved) {
        setResult(null);
        return;
      }

      setResult(data);
      setSearchQuery("");
      setSelectedCategory("All");
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Could not read this CSV.");
    } finally {
      setPhase("idle");
    }
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
    <div className="scanner" aria-busy={busy}>
      <div className="scanner-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Statement scan</h1>
          <p className="lede">
            Find the recurring charges hiding in your CSV. Your raw file stays on
            this device — only detected summaries are saved to your account.
          </p>
        </div>
        {!locked && (
          <label
            className="btn btn-primary upload-btn"
            aria-disabled={busy}
          >
            {busy ? (
              <Loader2 size={16} className="spin-icon" aria-hidden="true" />
            ) : (
              <Upload size={16} aria-hidden="true" />
            )}
            <span>{busy ? "Scanning…" : "Choose CSV"}</span>
            <input
              type="file"
              accept=".csv,text/csv"
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
                  <Lock size={16} aria-hidden="true" />
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
            >
              <div
                className={`dropzone-icon${busy ? " is-busy" : ""}`}
                aria-hidden="true"
              >
                {busy ? (
                  <Loader2 size={22} className="spin-icon" />
                ) : (
                  <Upload size={22} />
                )}
              </div>
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
                  : "CSV files with date, description/narration and amount (or debit) columns work best."}
              </p>
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
                    <Loader2 size={16} className="spin-icon" aria-hidden="true" />
                  )}
                  <span>{busy ? "Processing CSV…" : "Select statement"}</span>
                  <input
                    ref={fileInputRef}
                    className="hidden-input"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={onInput}
                    disabled={busy}
                  />
                </label>
              </div>
              {filename && <div className="file-name">Loaded: {filename}</div>}
            </div>
          )}

          {busy && phaseInfo && (
            <div className="results" role="status" aria-live="polite">
              <div className="glass-panel scan-progress-banner">
                <Loader2
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
              <AlertCircle
                size={16}
                style={{ flexShrink: 0, marginTop: 2 }}
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          )}
          {saveNotice && <div className="notice-box">{saveNotice}</div>}

      {!busy && result && (
        <motion.div
          ref={resultsRef}
          className="results"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
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
                    <Loader2 size={15} className="spin-icon" aria-hidden="true" />
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
                  <Download size={15} aria-hidden="true" />
                  <span>Download CSV</span>
                </button>
              </div>
            )}
          </div>

          {result.subscriptions.length > 0 ? (
            <>
              <div className="results-toolbar">
                <div className="results-search">
                  <Search
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

              {filteredSubscriptions.length > 0 ? (
                <div className="glass-panel subscription-list">
                  {filteredSubscriptions.map((sub, i) => (
                    <div
                      className="subscription"
                      key={`${i}-${sub.merchant}-${sub.amount}`}
                    >
                      <div>
                        <strong>{sub.merchant}</strong>
                        <span className="subscription-meta">
                          {sub.frequency} · {sub.occurrences} charges ·{" "}
                          {getSubscriptionCategory(sub)}
                        </span>
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
                      </div>
                      <div className="subscription-price">
                        ₹
                        {sub.monthlyEquivalent.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                        <small>/mo</small>
                      </div>
                    </div>
                  ))}
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
            </>
          ) : (
            <div className="glass-panel empty-state">
              No recurring charges were confidently detected. Try a CSV with
              multiple months of transactions.
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
        </motion.div>
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
              <Lock size={14} aria-hidden="true" />
              <strong>Browser-only CSV parsing</strong>
            </div>
            <p>
              Raw bank or card statements never leave your device. Only detected
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
  );
}
