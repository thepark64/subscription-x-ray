"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, MagnifyingGlass, X } from "@phosphor-icons/react";
import {
  HELP_CENTER_CATEGORIES,
  type GuideMeta,
  type HelpCenterCategory,
} from "@/lib/guides";

type RouteCard = {
  rail: string;
  cue: string;
  href: string;
  label: string;
};

const QUICK_ROUTES: RouteCard[] = [
  {
    rail: "UPI AutoPay",
    cue: "Approved inside Google Pay, PhonePe, Paytm, BHIM, or bank UPI",
    href: "/guides/cancel-upi-autopay",
    label: "Revoke UPI AutoPay mandate",
  },
  {
    rail: "Credit or Debit Card",
    cue: "Billed on card statement or bank SI Hub / recurring e-mandate",
    href: "/guides/cancel-credit-card-subscriptions",
    label: "Cancel card subscription",
  },
  {
    rail: "NACH / eMandate",
    cue: "Debited directly from savings account via NPCI UMRN",
    href: "/guides/cancel-nach-mandate",
    label: "Cancel NACH mandate",
  },
  {
    rail: "Google Play",
    cue: "Android app or in-app plan billed through Play Store",
    href: "/guides/cancel-google-play-subscription",
    label: "Stop Google Play billing",
  },
  {
    rail: "Apple / App Store",
    cue: "Shows as APPLE.COM/BILL on statement or Apple Account",
    href: "/guides/cancel-apple-subscription",
    label: "Stop Apple subscription",
  },
  {
    rail: "Unknown Bank Debit",
    cue: "Unfamiliar merchant code or aggregator payment string",
    href: "/guides/identify-unknown-bank-debits",
    label: "Investigate unknown debit",
  },
];

export default function HelpCenterClient({ guides }: { guides: GuideMeta[] }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | HelpCenterCategory
  >("All");

  const categoryCounts = useMemo(() => {
    const counts = new Map<HelpCenterCategory, number>();
    for (const cat of HELP_CENTER_CATEGORIES) {
      counts.set(
        cat,
        guides.filter((g) => g.helpCategories.includes(cat)).length
      );
    }
    return counts;
  }, [guides]);

  const filteredGuides = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter((guide) => {
      const matchesCat =
        selectedCategory === "All" ||
        guide.helpCategories.includes(selectedCategory);
      if (!matchesCat) return false;
      if (!q) return true;
      const haystack = [
        guide.title,
        guide.shortTitle,
        guide.description,
        guide.summary,
        guide.category,
        ...guide.helpCategories,
        ...guide.searchKeywords,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [guides, query, selectedCategory]);

  const hasFilters = query.trim().length > 0 || selectedCategory !== "All";

  function resetAll() {
    setQuery("");
    setSelectedCategory("All");
  }

  return (
    <div className="help-center-flow">
      <section className="help-search-panel surface-card" aria-label="Search help guides">
        <div className="results-search">
          <MagnifyingGlass
            size={18}
            className="results-search-icon"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by topic: UPI AutoPay, NACH, credit card, Google Play, Apple, free trial, unknown debit…"
            aria-label="Search forgotten subscription and cancellation guides"
          />
          {query && (
            <button
              type="button"
              className="results-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search query"
            >
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        <div
          className="results-categories help-category-tabs"
          role="group"
          aria-label="Filter help guides by category"
        >
          <button
            type="button"
            className={`filter-tab${selectedCategory === "All" ? " is-active" : ""}`}
            aria-pressed={selectedCategory === "All"}
            onClick={() => setSelectedCategory("All")}
          >
            <span>All topics</span>
            <span className="filter-tab-count">{guides.length}</span>
          </button>
          {HELP_CENTER_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                className={`filter-tab${active ? " is-active" : ""}`}
                aria-pressed={active}
                onClick={() => setSelectedCategory(category)}
              >
                <span>{category}</span>
                <span className="filter-tab-count">
                  {categoryCounts.get(category) ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="help-filter-status" role="status" aria-live="polite">
          <span className="caption-2">
            Showing {filteredGuides.length} of {guides.length} guides
            {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
            {query.trim() ? ` matching "${query.trim()}"` : ""}
          </span>
          {hasFilters && (
            <button
              type="button"
              className="results-clear-btn"
              onClick={resetAll}
            >
              Reset filters
            </button>
          )}
        </div>
      </section>

      <section aria-label="Filtered cancellation and discovery guides">
        {filteredGuides.length > 0 ? (
          <div className="guides-grid">
            {filteredGuides.map((guide) => (
              <article className="surface-card guide-card" key={guide.slug}>
                <div className="guide-card-meta caption-4">
                  <span>{guide.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{guide.readTime}</span>
                </div>
                <h2 className="title-2">
                  <Link href={guide.href}>{guide.title}</Link>
                </h2>
                <p className="body-6">{guide.summary}</p>
                <Link href={guide.href} className="guide-card-link title-4">
                  <span>Open guide</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="surface-card empty-state results-no-match">
            <p>
              No guides matched
              {query.trim() ? ` "${query.trim()}"` : " your selected category"}.
              Clear filters or browse all {guides.length} guides.
            </p>
            <button type="button" className="btn btn-ghost" onClick={resetAll}>
              Show all guides
            </button>
          </div>
        )}
      </section>

      <section className="help-routes-section" aria-labelledby="help-routes-heading">
        <div className="help-routes-head">
          <p className="eyebrow caption-3">Cancellation by payment method</p>
          <h2 id="help-routes-heading" className="heading-4">
            Start with how the payment was billed
          </h2>
          <p className="body-6">
            Exact screens and menu labels vary by bank, UPI app, merchant, and
            account type. Stopping future charges usually works best when you
            cancel with the merchant and verify the underlying payment mandate.
          </p>
        </div>

        <div className="help-quick-grid">
          {QUICK_ROUTES.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className="surface-card help-quick-card"
            >
              <strong className="title-3">{route.rail}</strong>
              <span className="body-6">{route.cue}</span>
              <span className="guide-card-link title-4">
                <span>{route.label}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <aside className="guide-disclaimer-box" aria-label="Safety and accuracy notice">
        <strong className="title-4">Trust &amp; Safety Notice</strong>
        <p className="body-6">
          Subscription X-Ray identifies recurring payment patterns from your
          uploaded statement. It does not access your bank account, cancel
          subscriptions, revoke mandates or reverse payments. Never share your
          UPI PIN, OTP, ATM/card PIN, or banking password with anyone offering
          cancellation help, and always verify closure directly with your bank,
          payment app, or merchant.
        </p>
      </aside>
    </div>
  );
}
