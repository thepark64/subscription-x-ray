"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CaretDown,
  CaretUp,
  Play,
  Question,
} from "@phosphor-icons/react";
import {
  analyzeCsv,
  formatConfidenceLabel,
  formatPaymentRailLabel,
} from "@/lib/detection";
import { DEMO_PRESETS } from "@/lib/demoStatement";
import { getCancellationGuidance } from "@/lib/services";
import { getSubscriptionCategory } from "@/lib/subscriptionFilter";

export default function InteractiveDemo() {
  const [presetId, setPresetId] = useState<string>(DEMO_PRESETS[0].id);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const preset = useMemo(
    () => DEMO_PRESETS.find((p) => p.id === presetId) ?? DEMO_PRESETS[0],
    [presetId]
  );

  const scanResult = useMemo(() => analyzeCsv(preset.csv), [preset]);
  const annual = scanResult.monthlyTotal * 12;

  return (
    <div className="surface-card demo-shell">
      <div className="demo-top">
        <div>
          <p className="caption-3 demo-kicker">
            Interactive sample · Synthetic data only · No credit used
          </p>
          <h3 className="title-1">
            Try the detection engine on sample Indian statements
          </h3>
          <p className="demo-sub body-6">{preset.subtitle}</p>
        </div>

        <div
          className="demo-preset-tabs"
          role="tablist"
          aria-label="Sample statement presets"
        >
          {DEMO_PRESETS.map((item) => {
            const active = item.id === preset.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`filter-tab${active ? " is-active" : ""}`}
                onClick={() => {
                  setPresetId(item.id);
                  setExpandedRow(null);
                }}
              >
                <Play size={12} weight="fill" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="demo-kpis">
        <div className="demo-kpi">
          <span>Monthly recurring</span>
          <strong>
            ₹
            {scanResult.monthlyTotal.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </strong>
        </div>
        <div className="demo-kpi">
          <span>Annual projection</span>
          <strong>
            ₹
            {annual.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </strong>
        </div>
        <div className="demo-kpi">
          <span>Detected charges</span>
          <strong>{scanResult.subscriptions.length}</strong>
        </div>
        <div className="demo-kpi">
          <span>Transactions parsed</span>
          <strong>{scanResult.transactionsAnalyzed}</strong>
        </div>
      </div>

      <div className="demo-noise-strip">
        {preset.filteredNotes.map((note) => (
          <span key={note} className="demo-noise-note">
            {note}
          </span>
        ))}
      </div>

      <div className="subscription-list demo-list">
        {scanResult.subscriptions.map((sub, i) => {
          const rowKey = `${preset.id}-${i}-${sub.merchant}`;
          const railLabel = formatPaymentRailLabel(sub.paymentRail);
          const confLabel = formatConfidenceLabel(sub.confidence);
          const open = expandedRow === rowKey;
          const guidance = open
            ? getCancellationGuidance(sub.merchant, sub.paymentRail)
            : null;

          return (
            <div className="subscription" key={rowKey}>
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
                    aria-expanded={open}
                    onClick={() => setExpandedRow(open ? null : rowKey)}
                  >
                    <Question size={14} aria-hidden="true" />
                    <span>
                      {sub.paymentRail === "upi_autopay" ||
                      sub.paymentRail === "upi"
                        ? "How to revoke UPI AutoPay"
                        : "Cancellation steps"}
                    </span>
                    {open ? (
                      <CaretUp size={14} aria-hidden="true" />
                    ) : (
                      <CaretDown size={14} aria-hidden="true" />
                    )}
                  </button>
                </div>

                {open && guidance && (
                  <div className="cancel-guide-box">
                    <strong className="cancel-guide-title">
                      {guidance.title}
                    </strong>
                    <ul className="cancel-guide-steps">
                      {guidance.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                    {guidance.appShortcuts && (
                      <div className="cancel-guide-apps">
                        {guidance.appShortcuts.map((item) => (
                          <div key={item.app} className="cancel-guide-app">
                            <strong>{item.app}:</strong> <span>{item.path}</span>
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

      <div className="demo-footer">
        <p className="body-6">
          Ready to scan your own bank or card statement? ₹69 unlocks 12 browser
          only scans and zero subscription scans never cost a credit.
        </p>
        <Link className="btn btn-primary button-sm" href="/scanner">
          Scan my statement for ₹69
        </Link>
      </div>
    </div>
  );
}
