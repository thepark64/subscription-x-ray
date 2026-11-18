"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  area,
  axisBottom,
  axisLeft,
  curveMonotoneX,
  easeCubicOut,
  line,
  max,
  scaleLinear,
  scalePoint,
  select,
  transition,
} from "d3";
import { TrendingDown, TrendingUp, Minus, Upload } from "lucide-react";
import {
  buildSixMonthTrend,
  type MonthlyTrendPoint,
  type ScanHistoryItem,
} from "@/lib/spendingTrends";

type SpendingTrendChartProps = {
  scans: ScanHistoryItem[];
  loading?: boolean;
  locked?: boolean;
  onRequestScan?: () => void;
};

type TooltipCoords = {
  x: number;
  y: number;
  alignRight: boolean;
};

function formatInrExact(value: number): string {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatInrAxis(value: number): string {
  if (value === 0) return "₹0";
  if (value >= 100000) {
    const lakhs = value / 100000;
    return `₹${Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(1)}L`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return `₹${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `₹${Math.round(value)}`;
}

export default function SpendingTrendChart({
  scans,
  loading = false,
  locked = false,
  onRequestScan,
}: SpendingTrendChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gradientId = useId().replace(/:/g, "");

  const [width, setWidth] = useState(0);
  const [activePoint, setActivePoint] = useState<MonthlyTrendPoint | null>(null);
  const [tooltipCoords, setTooltipCoords] = useState<TooltipCoords | null>(null);

  const summary = useMemo(() => buildSixMonthTrend(scans), [scans]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const next = Math.floor(el.getBoundingClientRect().width);
      if (next > 0) setWidth(next);
    };

    updateWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateWidth());
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [loading, summary.monthsWithData]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || width <= 0 || loading || summary.monthsWithData === 0) return;

    const height = width < 520 ? 228 : 264;
    const margin = {
      top: 18,
      right: width < 520 ? 16 : 24,
      bottom: 34,
      left: width < 520 ? 48 : 58,
    };
    const innerWidth = Math.max(120, width - margin.left - margin.right);
    const innerHeight = Math.max(100, height - margin.top - margin.bottom);

    void transition;
    const svg = select(svgEl);
    svg.selectAll("*").remove();
    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", width)
      .attr("height", height);

    const defs = svg.append("defs");
    const areaGradient = defs
      .append("linearGradient")
      .attr("id", `trend-area-${gradientId}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    areaGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "var(--teal)")
      .attr("stop-opacity", 0.28);

    areaGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "var(--teal)")
      .attr("stop-opacity", 0.01);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = scalePoint<string>()
      .domain(summary.points.map((p) => p.key))
      .range([0, innerWidth])
      .padding(0.28);

    const observed = summary.points.filter(
      (p): p is MonthlyTrendPoint & { monthlyTotal: number } =>
        p.hasData && p.monthlyTotal !== null
    );

    const rawMax = max(observed, (d) => d.monthlyTotal) ?? 0;
    const yMax = rawMax > 0 ? rawMax * 1.18 : 1000;

    const yScale = scaleLinear()
      .domain([0, yMax])
      .nice(4)
      .range([innerHeight, 0]);

    // Horizontal hairline gridlines
    const yTicks = yScale.ticks(4);
    g.append("g")
      .attr("class", "trend-grid")
      .selectAll("line")
      .data(yTicks)
      .join("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "var(--glass-divider)")
      .attr("stroke-dasharray", (d) => (d === 0 ? "none" : "3,4"))
      .attr("stroke-width", 1);

    // Y-axis labels
    const yAxis = axisLeft(yScale)
      .tickValues(yTicks)
      .tickSize(0)
      .tickPadding(10)
      .tickFormat((d) => formatInrAxis(Number(d)));

    const yAxisGroup = g.append("g").attr("class", "trend-axis").call(yAxis);
    yAxisGroup.select(".domain").remove();
    yAxisGroup
      .selectAll("text")
      .attr("fill", "var(--muted)")
      .style("font-family", "var(--font-mono), monospace")
      .style("font-size", "11.5px")
      .style("font-variant-numeric", "tabular-nums");

    // X-axis 6-month ticks
    const labelByKey = new Map(summary.points.map((p) => [p.key, p.label]));
    const xAxis = axisBottom(xScale)
      .tickSize(0)
      .tickPadding(12)
      .tickFormat((key) => labelByKey.get(String(key)) ?? String(key));

    const xAxisGroup = g
      .append("g")
      .attr("class", "trend-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select(".domain").remove();
    xAxisGroup
      .selectAll("text")
      .attr("fill", (key) => {
        const pt = summary.points.find((p) => p.key === String(key));
        return pt?.hasData ? "var(--ink)" : "var(--subtle)";
      })
      .style("font-family", "var(--font-sans), sans-serif")
      .style("font-size", "12px")
      .style("font-weight", (key) => {
        const pt = summary.points.find((p) => p.key === String(key));
        return pt?.hasData ? "500" : "400";
      });

    // Crosshair line (visible on hover / keyboard focus)
    const crosshair = g
      .append("line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "var(--teal)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0)
      .style("pointer-events", "none");

    // Area + Line when >= 2 months have scans; reference line when 1 month
    if (observed.length >= 2) {
      const areaGenerator = area<MonthlyTrendPoint & { monthlyTotal: number }>()
        .x((d) => xScale(d.key) ?? 0)
        .y0(innerHeight)
        .y1((d) => yScale(d.monthlyTotal))
        .curve(curveMonotoneX);

      g.append("path")
        .datum(observed)
        .attr("fill", `url(#trend-area-${gradientId})`)
        .attr("d", areaGenerator);

      const lineGenerator = line<MonthlyTrendPoint & { monthlyTotal: number }>()
        .x((d) => xScale(d.key) ?? 0)
        .y((d) => yScale(d.monthlyTotal))
        .curve(curveMonotoneX);

      const linePath = g
        .append("path")
        .datum(observed)
        .attr("fill", "none")
        .attr("stroke", "var(--teal)")
        .attr("stroke-width", 2.5)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("d", lineGenerator);

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const node = linePath.node();
      if (node && !prefersReducedMotion) {
        const totalLength = node.getTotalLength();
        linePath
          .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(360)
          .ease(easeCubicOut)
          .attr("stroke-dashoffset", 0)
          .on("end", () => {
            linePath.attr("stroke-dasharray", null);
          });
      }
    } else if (observed.length === 1) {
      const singleY = yScale(observed[0].monthlyTotal);
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", singleY)
        .attr("y2", singleY)
        .attr("stroke", "var(--teal)")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,4")
        .attr("opacity", 0.55);
    }

    // Subtle baseline markers for months without scans
    const emptyMonths = summary.points.filter((p) => !p.hasData);
    g.selectAll("circle.trend-dot-empty")
      .data(emptyMonths)
      .join("circle")
      .attr("class", "trend-dot-empty")
      .attr("cx", (d) => xScale(d.key) ?? 0)
      .attr("cy", innerHeight)
      .attr("r", 2.5)
      .attr("fill", "var(--glass-divider)");

    // Active focus/hover halo
    const focusHalo = g
      .append("circle")
      .attr("r", 9)
      .attr("fill", "var(--teal-soft)")
      .attr("opacity", 0)
      .style("pointer-events", "none");

    function showPoint(pt: MonthlyTrendPoint) {
      const cx = (xScale(pt.key) ?? 0) + margin.left;
      const cy =
        pt.hasData && pt.monthlyTotal !== null
          ? yScale(pt.monthlyTotal) + margin.top
          : innerHeight + margin.top;

      crosshair
        .attr("x1", xScale(pt.key) ?? 0)
        .attr("x2", xScale(pt.key) ?? 0)
        .attr("opacity", 0.75);

      if (pt.hasData && pt.monthlyTotal !== null) {
        focusHalo
          .attr("cx", xScale(pt.key) ?? 0)
          .attr("cy", yScale(pt.monthlyTotal))
          .attr("opacity", 1);
      } else {
        focusHalo.attr("opacity", 0);
      }

      setActivePoint(pt);
      setTooltipCoords({
        x: cx,
        y: cy,
        alignRight: cx > width * 0.62,
      });
    }

    function clearPoint() {
      crosshair.attr("opacity", 0);
      focusHalo.attr("opacity", 0);
      setActivePoint(null);
      setTooltipCoords(null);
    }

    // Interactive hover columns across all 6 months
    const step = xScale.step();
    const colWidth = Math.max(28, step);
    g.selectAll("rect.trend-hover-col")
      .data(summary.points)
      .join("rect")
      .attr("class", "trend-hover-col")
      .attr("x", (d) => (xScale(d.key) ?? 0) - colWidth / 2)
      .attr("y", 0)
      .attr("width", colWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("mouseenter", (_event, d) => showPoint(d))
      .on("mouseleave", () => clearPoint());

    // Focusable data nodes for scanned months
    g.selectAll("circle.trend-dot")
      .data(observed)
      .join("circle")
      .attr("class", "trend-dot")
      .attr("cx", (d) => xScale(d.key) ?? 0)
      .attr("cy", (d) => yScale(d.monthlyTotal))
      .attr("r", 4.75)
      .attr("fill", "var(--glass-bg-strong)")
      .attr("stroke", "var(--teal)")
      .attr("stroke-width", 2.25)
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr(
        "aria-label",
        (d) =>
          `${d.fullLabel}: ${formatInrExact(d.monthlyTotal)} per month across ${d.subscriptionCount} recurring charges`
      )
      .style("cursor", "pointer")
      .on("mouseenter", (_event, d) => showPoint(d))
      .on("focus", (_event, d) => showPoint(d))
      .on("blur", () => clearPoint());
  }, [gradientId, loading, summary, width]);

  const deltaLabel = useMemo(() => {
    if (summary.deltaAmount === null) return null;
    const absAmount = formatInrExact(Math.abs(summary.deltaAmount));
    const pct =
      summary.deltaPercent !== null
        ? ` (${summary.deltaPercent > 0 ? "+" : ""}${summary.deltaPercent.toFixed(1)}%)`
        : "";
    if (Math.abs(summary.deltaAmount) < 0.01) {
      return { text: "No change vs prior scan", dir: "flat" as const };
    }
    return {
      text: `${summary.deltaAmount > 0 ? "+" : "-"}${absAmount}${pct} vs prior scan`,
      dir: summary.deltaAmount > 0 ? ("up" as const) : ("down" as const),
    };
  }, [summary.deltaAmount, summary.deltaPercent]);

  if (loading) {
    return (
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
    );
  }

  return (
    <section className="trend-section" aria-label="6-month spending trend">
      <div className="trend-head">
        <div>
          <p className="eyebrow">6-month spending trend</p>
          <h2>Monthly recurring spend</h2>
        </div>

        {summary.monthsWithData > 0 && summary.latestMonthlyTotal !== null && (
          <div className="trend-stats">
            <span>
              Latest{" "}
              <strong className="trend-stat-num">
                {formatInrExact(summary.latestMonthlyTotal)}/mo
              </strong>
            </span>
            {summary.averageMonthlyTotal !== null && summary.monthsWithData > 1 && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  6-mo avg{" "}
                  <strong className="trend-stat-num">
                    {formatInrExact(summary.averageMonthlyTotal)}/mo
                  </strong>
                </span>
              </>
            )}
            {deltaLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className={`trend-delta is-${deltaLabel.dir}`}>
                  {deltaLabel.dir === "up" && (
                    <TrendingUp size={14} aria-hidden="true" />
                  )}
                  {deltaLabel.dir === "down" && (
                    <TrendingDown size={14} aria-hidden="true" />
                  )}
                  {deltaLabel.dir === "flat" && (
                    <Minus size={14} aria-hidden="true" />
                  )}
                  <span>{deltaLabel.text}</span>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {summary.monthsWithData === 0 ? (
        <div className="glass-panel trend-empty">
          <div>
            <h3>No monthly trend data yet</h3>
            <p>
              Scan a bank or card CSV or PDF statement to plot your monthly
              recurring subscription spend across the last 6 months.
            </p>
          </div>
          {onRequestScan && !locked && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onRequestScan}
            >
              <Upload size={15} aria-hidden="true" />
              <span>Choose CSV / PDF</span>
            </button>
          )}
        </div>
      ) : (
        <div className="glass-panel trend-card">
          <div className="trend-chart-wrap" ref={containerRef}>
            <svg
              ref={svgRef}
              className="trend-svg"
              role="img"
              aria-label="Line chart of monthly recurring subscription spending over the last 6 months"
            />
            {activePoint && tooltipCoords && (
              <div
                className={`trend-tooltip${tooltipCoords.alignRight ? " is-right" : ""}`}
                style={{
                  left: tooltipCoords.x,
                  top: Math.max(12, tooltipCoords.y - 12),
                }}
                role="status"
                aria-live="polite"
              >
                <div className="trend-tooltip-month">
                  {activePoint.fullLabel}
                </div>
                {activePoint.hasData && activePoint.monthlyTotal !== null ? (
                  <>
                    <div className="trend-tooltip-amount">
                      {formatInrExact(activePoint.monthlyTotal)}
                      <small>/mo</small>
                    </div>
                    <div className="trend-tooltip-meta">
                      {activePoint.subscriptionCount}{" "}
                      {activePoint.subscriptionCount === 1
                        ? "charge"
                        : "charges"}{" "}
                      · {activePoint.scanCount}{" "}
                      {activePoint.scanCount === 1 ? "scan" : "scans"}
                    </div>
                  </>
                ) : (
                  <div className="trend-tooltip-meta">
                    No scan recorded this month
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="trend-footnote">
            <span>
              {summary.monthsWithData === 1
                ? "Showing 1 scanned month so far — run scans in additional months to plot a multi-month curve."
                : `Based on the latest scan snapshot per month across ${summary.monthsWithData} active months (${summary.totalScansInWindow} ${summary.totalScansInWindow === 1 ? "scan" : "scans"} in 6 months).`}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
