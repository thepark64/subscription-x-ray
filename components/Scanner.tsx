"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowUpRight, Lock, Upload } from "lucide-react";
import { analyzeCsv, type ScanResult } from "@/lib/detection";
import { supabase } from "@/lib/supabaseClient";

type PastScan = {
  id: string;
  scanned_at: string;
  subscription_count: number;
  monthly_total: number;
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;

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
  const [busy, setBusy] = useState(false);

  const annual = useMemo(
    () => (result ? result.monthlyTotal * 12 : 0),
    [result]
  );

  useEffect(() => {
    supabase
      .from("scans")
      .select("id, scanned_at, subscription_count, monthly_total")
      .eq("user_id", userId)
      .order("scanned_at", { ascending: false })
      .then(({ data }) => setPastScans(data ?? []));
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

    setBusy(true);
    try {
      const data = analyzeCsv(await file.text());

      const spent = await spendCredit();
      if (!spent) {
        setResult(null);
        setError(
          "Couldn't use a scan credit. Please refresh the page and try again."
        );
        return;
      }

      setResult(data);
      await saveScan(data);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Could not read this CSV.");
    } finally {
      setBusy(false);
    }
  }

  function onInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void handleFile(file);
  }

  return (
    <div className="scanner">
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
          <label className="btn btn-primary upload-btn">
            <Upload size={16} aria-hidden="true" />
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
        <div className="glass-panel dropzone">
          <div className="dropzone-icon" aria-hidden="true">
            <Upload size={22} />
          </div>
          <h2>Drop your statement here</h2>
          <p>
            CSV files with date, description/narration and amount (or debit)
            columns work best.
          </p>
          <label className="btn btn-primary">
            {busy ? "Scanning…" : "Select statement"}
            <input
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

      {error && (
        <div className="error-box" role="alert">
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {saveNotice && <div className="notice-box">{saveNotice}</div>}

      {result && (
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
            <div className="glass-panel subscription-list">
              {result.subscriptions.map((sub, i) => (
                <div
                  className="subscription"
                  key={`${i}-${sub.merchant}-${sub.amount}`}
                >
                  <div>
                    <strong>{sub.merchant}</strong>
                    <span className="subscription-meta">
                      {sub.frequency} · {sub.occurrences} charges
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
