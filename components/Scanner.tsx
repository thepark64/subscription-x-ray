"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowUpRight,
  Loader2,
  Lock,
  Search,
  Upload,
  X,
} from "lucide-react";
import { analyzeCsv, type ScanResult } from "@/lib/detection";
import {
  buildCategoryOptions,
  filterSubscriptions,
  getSubscriptionCategory,
  type CategoryFilter,
} from "@/lib/subscriptionFilter";
import { supabase } from "@/lib/supabaseClient";
import SpendingTrendChart from "@/components/SpendingTrendChart";

type PastScan = {
  id: string;
  scanned_at: string;
  subscription_count: number;
  monthly_total: number;
};

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
  locked,
  paywall,
  spendCredit,
}: {
  userId: string;
  locked: boolean;
  paywall: ReactNode;
  spendCredit: () => Promise<boolean>;
}) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [pastScans, setPastScans] = useState<PastScan[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [dragging, setDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    let active = true;
    setHistoryLoading(true);
    supabase
      .from("scans")
      .select("id, scanned_at, subscription_count, monthly_total")
      .eq("user_id", userId)
      .order("scanned_at", { ascending: false })
      .then(
        ({ data }) => {
          if (!active) return;
          setPastScans(data ?? []);
          setHistoryLoading(false);
        },
        () => {
          if (!active) return;
          setHistoryLoading(false);
        }
      );
    return () => {
      active = false;
    };
  }, [userId]);

  async function saveScan(data: ScanResult) {
    setSaveNotice("");

    const { data: scanRow, error: scanError } = await supabase
      .from("scans")
      .insert({
        user_id: userId,
        subscription_count: data.subscriptions.length,
        monthly_total: data.monthlyTotal,
        annual_total: data.monthlyTotal * 12,
      })
      .select()
      .single();

    if (scanError || !scanRow) {
      setSaveNotice(
        "Result shown below, but couldn't be saved to your history."
      );
      return;
    }

    if (data.subscriptions.length) {
      const { error: subsError } = await supabase
        .from("detected_subscriptions")
        .insert(
          data.subscriptions.map((sub) => ({
            scan_id: scanRow.id,
            user_id: userId,
            merchant: sub.merchant,
            amount: sub.amount,
            frequency: sub.frequency,
            occurrences: sub.occurrences,
            monthly_equivalent: sub.monthlyEquivalent,
          }))
        );
      if (subsError)
        setSaveNotice(
          "Result shown below, but the details couldn't be saved to your history."
        );
    }

    setPastScans((prev) => [
      {
        id: scanRow.id,
        scanned_at: scanRow.scanned_at,
        subscription_count: data.subscriptions.length,
        monthly_total: data.monthlyTotal,
      },
      ...prev,
    ]);
  }

  async function handleFile(file: File) {
    if (busy || locked) return;
    setError("");
    setSaveNotice("");
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
      const spent = await spendCredit();
      if (!spent) {
        setResult(null);
        setError(
          "Couldn't use a scan credit. Please refresh the page and try again."
        );
        return;
      }

      setResult(data);
      setSearchQuery("");
      setSelectedCategory("All");
      await saveScan(data);
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

  return (
    <div className="scanner" aria-busy={busy}>
      <div className="scanner-header">
        <div>
          <p className="eyebrow">Statement scan</p>
          <h1>Find the recurring charges hiding in your CSV.</h1>
          <p className="lede">
            Your file stays on this device — only the results below are saved to
            your account.
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

      {locked ? (
        <div className="glass-panel dropzone">
          <div className="dropzone-icon" aria-hidden="true">
            <Lock size={22} />
          </div>
          <h2>You&apos;re out of scans</h2>
          <p>
            Buy another pack to scan more statements. Your results below stay on
            screen.
          </p>
          {paywall}
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
            Analysed {result.transactionsAnalyzed.toLocaleString("en-IN")}{" "}
            spending transactions over {result.periodDays} days.
          </p>
          {result.periodDays < 45 && (
            <div className="notice-box">
              This statement covers under 45 days, so monthly charges seen only
              once can&apos;t be detected. Try a statement covering 3 months or
              more.
            </div>
          )}

          <div className="result-heading">
            <p className="eyebrow">Detected subscriptions</p>
            <h2>Your recurring charges</h2>
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

      <SpendingTrendChart
        scans={pastScans}
        loading={historyLoading}
        locked={locked}
        onRequestScan={() => fileInputRef.current?.click()}
      />

      {pastScans.length > 0 && (
        <div className="history">
          <p className="eyebrow">Your scan history</p>
          <div className="glass-panel history-list">
            {pastScans.map((s) => (
              <div className="history-row" key={s.id}>
                <span>
                  {new Date(s.scanned_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>{s.subscription_count} recurring charges</span>
                <span className="history-amount">
                  ₹{Number(s.monthly_total).toLocaleString("en-IN")}/mo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
