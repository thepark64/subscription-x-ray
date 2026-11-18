"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Lock,
  RotateCcw,
  Share2,
} from "lucide-react";
import type { Subscription } from "@/lib/detection";
import {
  buildPrivacySafeCardData,
  buildPrivacySafeShareText,
  calculateSavingsSummary,
  formatInrAmount,
} from "@/lib/savingsSummary";

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function SavingsShareCard({
  subscriptions,
  selectedKeys,
  onClearSelection,
}: {
  subscriptions: Subscription[];
  selectedKeys: string[];
  onClearSelection: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);

  const summary = useMemo(
    () => calculateSavingsSummary(subscriptions, selectedKeys),
    [subscriptions, selectedKeys]
  );

  const shareText = useMemo(
    () => buildPrivacySafeShareText(summary),
    [summary]
  );

  const cardData = useMemo(
    () => buildPrivacySafeCardData(summary),
    [summary]
  );

  if (subscriptions.length === 0) return null;

  async function handleCopySummary() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard blocked in restricted browser contexts; user can still select or download card.
    }
  }

  async function handleShareSummary() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Subscription X-Ray Summary",
          text: shareText,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }
    await handleCopySummary();
  }

  async function handleDownloadSummaryCard() {
    if (downloadingCard) return;
    setDownloadingCard(true);
    try {
      const width = 1200;
      const height = 630;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark slate background with subtle teal & indigo glow
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#0b1220");
      bgGrad.addColorStop(0.55, "#111b2e");
      bgGrad.addColorStop(1, "#0f172a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const tealGlow = ctx.createRadialGradient(220, 120, 20, 220, 120, 420);
      tealGlow.addColorStop(0, "rgba(20, 184, 166, 0.22)");
      tealGlow.addColorStop(1, "rgba(20, 184, 166, 0)");
      ctx.fillStyle = tealGlow;
      ctx.fillRect(0, 0, width, height);

      const blueGlow = ctx.createRadialGradient(980, 520, 20, 980, 520, 420);
      blueGlow.addColorStop(0, "rgba(59, 130, 246, 0.20)");
      blueGlow.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = blueGlow;
      ctx.fillRect(0, 0, width, height);

      // Outer glass frame
      drawRoundedRect(ctx, 48, 48, width - 96, height - 96, 22);
      ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(148, 163, 184, 0.26)";
      ctx.stroke();

      // Brand header
      ctx.fillStyle = "#2dd4bf";
      ctx.font = "700 18px system-ui, -apple-system, sans-serif";
      ctx.fillText(cardData.brand, 88, 112);

      // Headline
      ctx.fillStyle = "#f8fafc";
      ctx.font = "700 42px system-ui, -apple-system, sans-serif";
      ctx.fillText(cardData.headline, 88, 174);

      // Subline
      ctx.fillStyle = "#94a3b8";
      ctx.font = "400 20px system-ui, -apple-system, sans-serif";
      ctx.fillText(cardData.subline, 88, 212);

      // 3 KPI tiles
      const tileY = 258;
      const tileGap = 20;
      const tileW = (width - 176 - tileGap * 2) / 3;
      const tileH = 148;

      cardData.stats.forEach((stat, idx) => {
        const tileX = 88 + idx * (tileW + tileGap);
        drawRoundedRect(ctx, tileX, tileY, tileW, tileH, 14);
        ctx.fillStyle = "rgba(30, 41, 59, 0.78)";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "500 17px system-ui, -apple-system, sans-serif";
        ctx.fillText(stat.label, tileX + 24, tileY + 46);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "700 32px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText(stat.value, tileX + 24, tileY + 104);
      });

      // Optional user-selected potential savings banner
      if (cardData.savingsCallout) {
        drawRoundedRect(ctx, 88, 434, width - 176, 68, 12);
        ctx.fillStyle = "rgba(13, 148, 136, 0.20)";
        ctx.fill();
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = "rgba(45, 212, 191, 0.45)";
        ctx.stroke();

        ctx.fillStyle = "#5eead4";
        ctx.font = "600 22px system-ui, -apple-system, sans-serif";
        ctx.fillText(cardData.savingsCallout, 112, 476);
      }

      // Footer
      ctx.fillStyle = "#64748b";
      ctx.font = "500 17px system-ui, -apple-system, sans-serif";
      ctx.fillText(cardData.footer, 88, height - 80);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((result) => resolve(result), "image/png")
      );
      const href = blob ? URL.createObjectURL(blob) : canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = href;
      link.download = "subscription-x-ray-summary.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (blob) {
        window.setTimeout(() => URL.revokeObjectURL(href), 1000);
      }
    } finally {
      setDownloadingCard(false);
    }
  }

  return (
    <section
      className="glass-panel savings-share-card"
      aria-label="Savings planner and privacy-safe share summary"
    >
      <div className="savings-share-top">
        <div>
          <p className="eyebrow">Action &amp; savings planner</p>
          <h3>
            {summary.selectedCount > 0
              ? `Potential savings from ${summary.selectedCount} selected ${summary.selectedCount === 1 ? "charge" : "charges"}`
              : "Tick any charges you plan to cancel or revoke"}
          </h3>
          <p className="savings-share-sub">
            {summary.selectedCount > 0
              ? "Estimated savings if you cancel the checked subscriptions or AutoPay mandates above."
              : "Use the checkboxes beside any recurring charge above to calculate your monthly and annual savings."}
          </p>
        </div>

        <div className="savings-share-metrics">
          <div className="savings-kpi">
            <span>Potential monthly savings</span>
            <strong className={summary.selectedCount > 0 ? "is-teal" : ""}>
              {formatInrAmount(summary.selectedMonthlySavings)}
              <small>/mo</small>
            </strong>
          </div>
          <div className="savings-kpi">
            <span>Projected 12-month savings</span>
            <strong className={summary.selectedCount > 0 ? "is-teal" : ""}>
              {formatInrAmount(summary.selectedAnnualSavings)}
              <small>/yr</small>
            </strong>
          </div>
        </div>
      </div>

      <div className="savings-share-footer">
        <div className="savings-privacy-pill">
          <Lock size={13} aria-hidden="true" />
          <span>
            Share text &amp; PNG card include only totals — never merchant
            names, banks, filenames, or UPI IDs.
          </span>
        </div>

        <div className="savings-share-actions">
          {summary.selectedCount > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClearSelection}
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>Clear selection</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleCopySummary}
          >
            {copied ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <Copy size={14} aria-hidden="true" />
            )}
            <span>{copied ? "Copied summary" : "Copy summary"}</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleShareSummary}
          >
            <Share2 size={14} aria-hidden="true" />
            <span>Share</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleDownloadSummaryCard}
            disabled={downloadingCard}
          >
            <Download size={14} aria-hidden="true" />
            <span>{downloadingCard ? "Rendering…" : "Download card PNG"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
