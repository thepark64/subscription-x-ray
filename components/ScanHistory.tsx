"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  LayoutGrid,
  LayoutList,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  formatScanTimestamp,
  formatSubscriptionCountLabel,
} from "@/lib/scanHistory";
import { classifySubscriptionCategory } from "@/lib/services";

export type PastScan = {
  id: string;
  scanned_at: string;
  statement_name?: string | null;
  file_name?: string | null;
  subscription_count: number;
  monthly_total: number;
};

export type SavedSubscriptionRow = {
  id: string;
  merchant: string;
  amount: number;
  frequency: string;
  occurrences: number;
  monthly_equivalent: number;
};

type ViewMode = "grid" | "list";

type ScanHistoryProps = {
  scans: PastScan[];
  loading: boolean;
  locked: boolean;
  expandedScanId: string | null;
  renamingScanId: string | null;
  renameDraft: string;
  loadingDetailsId: string | null;
  busyScanId: string | null;
  scanDetails: Record<string, SavedSubscriptionRow[]>;
  onRenameDraftChange: (value: string) => void;
  onStartRename: (scanId: string, currentName: string) => void;
  onCancelRename: () => void;
  onSaveRename: (
    e: React.FormEvent<HTMLFormElement>,
    scanId: string
  ) => void;
  onToggleExpand: (scanId: string) => void;
  onDeleteScan: (scanId: string) => void;
  onOpenInViewer: (scan: PastScan, details: SavedSubscriptionRow[]) => void;
  onRequestScan?: () => void;
};

export default function ScanHistory({
  scans,
  loading,
  locked,
  expandedScanId,
  renamingScanId,
  renameDraft,
  loadingDetailsId,
  busyScanId,
  scanDetails,
  onRenameDraftChange,
  onStartRename,
  onCancelRename,
  onSaveRename,
  onToggleExpand,
  onDeleteScan,
  onOpenInViewer,
  onRequestScan,
}: ScanHistoryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <section
      className="history-section"
      aria-labelledby="scan-history-heading"
    >
      <div className="history-head">
        <div>
          <p className="eyebrow">Past activity</p>
          <div className="history-title-row">
            <h2 id="scan-history-heading">Scan History</h2>
            {!loading && scans.length > 0 && (
              <span className="history-count-meta">
                · {scans.length}{" "}
                {scans.length === 1 ? "successful scan" : "successful scans"}
              </span>
            )}
          </div>
        </div>

        {!loading && scans.length > 0 && (
          <div
            className="history-view-toggle"
            role="group"
            aria-label="Scan history layout"
          >
            <button
              type="button"
              className={`history-view-btn${viewMode === "grid" ? " is-active" : ""}`}
              aria-pressed={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid size={14} aria-hidden="true" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              className={`history-view-btn${viewMode === "list" ? " is-active" : ""}`}
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
            >
              <LayoutList size={14} aria-hidden="true" />
              <span>List</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div
          className={`history-cards is-${viewMode}`}
          role="status"
          aria-live="polite"
          aria-label="Loading scan history"
        >
          {[0, 1, 2].map((idx) => (
            <div className="glass-panel history-card is-skeleton" key={idx}>
              <div className="history-card-top">
                <div className="history-card-heading">
                  <div className="skeleton-bar skeleton-bar-lg" style={{ marginTop: 0, height: 18, width: "68%" }} />
                  <div className="skeleton-bar skeleton-bar-sm" style={{ marginTop: 8, width: "52%" }} />
                </div>
              </div>
              <div className="history-card-file">
                <div className="skeleton-bar skeleton-bar-sm" style={{ width: "60%" }} />
              </div>
              <div className="history-card-summary">
                <div className="history-summary-stat">
                  <div className="skeleton-bar skeleton-bar-sm" style={{ width: "70%" }} />
                  <div className="skeleton-bar skeleton-bar-lg" style={{ height: 20, width: "55%" }} />
                </div>
                <div className="history-summary-stat is-right">
                  <div className="skeleton-bar skeleton-bar-sm" style={{ width: "60%", marginLeft: "auto" }} />
                  <div className="skeleton-bar skeleton-bar-lg" style={{ height: 20, width: "72%", marginLeft: "auto" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : scans.length === 0 ? (
        <div className="glass-panel history-empty-card">
          <div>
            <strong>No successful scans yet</strong>
            <p>
              Upload a bank or card CSV statement above to detect recurring
              charges. Each completed scan appears here with its timestamp,
              source file name, and detected monthly spend.
            </p>
          </div>
          {!locked && onRequestScan && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onRequestScan}
            >
              <Upload size={15} aria-hidden="true" />
              <span>Scan a CSV</span>
            </button>
          )}
        </div>
      ) : (
        <div className={`history-cards is-${viewMode}`}>
          {scans.map((s) => {
            const displayName =
              s.statement_name?.trim() ||
              s.file_name?.trim() ||
              "Statement scan";
            const fileLabel = s.file_name?.trim() || "";
            const isExpanded = expandedScanId === s.id;
            const isRenaming = renamingScanId === s.id;
            const isRowBusy = busyScanId === s.id;
            const details = scanDetails[s.id];

            return (
              <article
                className={`glass-panel history-card${isExpanded ? " is-expanded" : ""}`}
                key={s.id}
              >
                <div className="history-card-top">
                  <div className="history-card-heading">
                    {isRenaming ? (
                      <form
                        className="history-rename-form"
                        onSubmit={(e) => onSaveRename(e, s.id)}
                      >
                        <input
                          type="text"
                          value={renameDraft}
                          onChange={(e) => onRenameDraftChange(e.target.value)}
                          aria-label="Scan history name"
                          maxLength={80}
                          autoFocus
                          disabled={isRowBusy}
                        />
                        <button
                          type="submit"
                          className="icon-action-btn"
                          aria-label="Save scan name"
                          disabled={isRowBusy || !renameDraft.trim()}
                        >
                          <Check size={14} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="icon-action-btn"
                          aria-label="Cancel rename"
                          onClick={onCancelRename}
                          disabled={isRowBusy}
                        >
                          <X size={14} aria-hidden="true" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <h3 className="history-card-title" title={displayName}>
                          {displayName}
                        </h3>
                        <div className="history-card-timestamp">
                          <Clock size={12} aria-hidden="true" />
                          <time dateTime={s.scanned_at}>
                            {formatScanTimestamp(s.scanned_at)}
                          </time>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="history-actions">
                    <button
                      type="button"
                      className="icon-action-btn"
                      aria-label={`Rename ${displayName}`}
                      title="Rename scan"
                      onClick={() => onStartRename(s.id, displayName)}
                      disabled={isRowBusy}
                    >
                      <Pencil size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="icon-action-btn"
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded
                          ? `Hide charges for ${displayName}`
                          : `Review charges for ${displayName}`
                      }
                      title={isExpanded ? "Hide details" : "Inspect breakdown"}
                      onClick={() => onToggleExpand(s.id)}
                      disabled={isRowBusy}
                    >
                      {isExpanded ? (
                        <ChevronUp size={15} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={15} aria-hidden="true" />
                      )}
                    </button>
                    <button
                      type="button"
                      className="icon-action-btn is-danger"
                      aria-label={`Delete ${displayName}`}
                      title="Delete scan"
                      onClick={() => onDeleteScan(s.id)}
                      disabled={isRowBusy}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="history-card-file">
                  <FileText size={13} aria-hidden="true" />
                  <span
                    className={`history-card-filename${fileLabel ? "" : " is-fallback"}`}
                    title={fileLabel ? `Uploaded file: ${fileLabel}` : undefined}
                  >
                    {fileLabel || "CSV file name unavailable"}
                  </span>
                </div>

                <div className="history-card-summary">
                  <div className="history-summary-stat">
                    <span className="history-stat-label">Result summary</span>
                    <strong className="history-stat-count">
                      {formatSubscriptionCountLabel(s.subscription_count)}
                    </strong>
                  </div>
                  <div className="history-summary-stat is-right">
                    <span className="history-stat-label">Monthly spend</span>
                    <strong className="history-stat-amount">
                      ₹
                      {Number(s.monthly_total).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                      <small>/mo</small>
                    </strong>
                  </div>
                </div>

                {isExpanded && (
                  <div className="history-details">
                    {loadingDetailsId === s.id ? (
                      <p className="history-detail-empty">
                        Loading saved charges…
                      </p>
                    ) : details && details.length > 0 ? (
                      <>
                        <div className="history-detail-list">
                          {details.map((item) => (
                            <div
                              className="history-detail-row"
                              key={item.id}
                            >
                              <div>
                                <strong>{item.merchant}</strong>
                                <span className="history-detail-meta">
                                  {item.frequency} · {item.occurrences} charges ·{" "}
                                  {classifySubscriptionCategory(item.merchant)}
                                </span>
                              </div>
                              <span className="history-detail-amount">
                                ₹
                                {Number(
                                  item.monthly_equivalent
                                ).toLocaleString("en-IN", {
                                  maximumFractionDigits: 2,
                                })}
                                /mo
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="history-detail-footer">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => onOpenInViewer(s, details)}
                          >
                            <span>Open in results viewer</span>
                            <ArrowUpRight size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="history-detail-empty">
                        No recurring charges were saved for this scan.
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
