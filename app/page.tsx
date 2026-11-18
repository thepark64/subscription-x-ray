import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Lock } from "lucide-react";
import AuthCallbackHandler from "@/components/AuthCallbackHandler";
import InteractiveDemo from "@/components/InteractiveDemo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CANONICAL_SITE_URL, PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";
import { GUIDES } from "@/lib/guides";

const HOME_TITLE = "Find Recurring Payments & AutoPay | Subscription X-Ray";
const HOME_DESCRIPTION =
  "Scan Indian bank or card CSV & PDF statements in your browser to find recurring payments, UPI AutoPay mandates, and NACH debits — ₹69 for 12 scans.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: HOME_TITLE,
    siteName: "Subscription X-Ray",
    description: HOME_DESCRIPTION,
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

const SAMPLE_CHARGES = [
  { name: "Netflix · UPI AutoPay", amount: "₹649/mo", note: "" },
  { name: "Cult.fit · NACH", amount: "₹999/mo", note: "" },
  { name: "Unnamed SaaS tool", amount: "₹1,999/mo", note: "unrecognised" },
  { name: "Spotify · UPI AutoPay", amount: "₹119/mo", note: "" },
  { name: "Google One", amount: "₹130/mo", note: "" },
];

const FAQ_ITEMS = [
  {
    q: "Is my statement actually private?",
    a: "Yes. CSV and PDF parsing — including unlocking password-protected bank PDFs — happens strictly inside your browser. Your raw statement file and PDF password are never uploaded to or stored on any server.",
  },
  {
    q: "Which Indian banks, file formats, and payment rails are supported?",
    a: "Delimited CSV exports (up to 10 MB and 100,000 rows) and digital or password-protected PDFs from HDFC, SBI, ICICI, Axis, Kotak, and major credit cards. It labels UPI AutoPay mandates, NACH e-mandates, recurring card standing instructions, and regular OTT or SaaS charges while filtering failed attempts, reversals, refunds, and ₹1–₹5 mandate verification holds.",
  },
  {
    q: "What are the scanner's limitations?",
    a: "Scanned image-only PDFs without selectable text cannot be read — export a digital PDF or CSV from NetBanking instead. Detection uses interval and amount heuristics over multiple cycles to surface likely subscriptions and possible recurring transfers, so a single 30-day export will not confirm monthly or annual plans, and repeated manual UPI transfers can match recurring rules. Always verify before cancelling.",
  },
  {
    q: "What do I get for ₹69?",
    a: "One-time ₹69 adds 12 scan credits to your account. Credits never expire and there is no recurring subscription on our side. If a valid statement has zero recurring charges, no credit is deducted.",
  },
  {
    q: "Can Subscription X-Ray cancel UPI AutoPay mandates or subscriptions?",
    a: "No. We do not connect to your bank login or auto-cancel mandates on your behalf. For detected charges, you get direct merchant account links plus step-by-step Google Pay, PhonePe, Paytm, BHIM, NACH, and RBI SI Hub revocation guidance.",
  },
];

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Subscription X-Ray",
      url: CANONICAL_SITE_URL,
      inLanguage: "en-IN",
    },
    {
      "@type": "SoftwareApplication",
      name: "Subscription X-Ray",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: CANONICAL_SITE_URL,
      description:
        "Browser-only Indian bank and card CSV and PDF statement scanner to find recurring payments, UPI AutoPay mandates, NACH debits, and recurring card standing instructions.",
      offers: {
        "@type": "Offer",
        price: "69",
        priceCurrency: "INR",
        description: "12 non-expiring statement scan credits (one-time payment)",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <AuthCallbackHandler />
      <SiteHeader mode="home" />

      <main>
        <div className="wrap">
          <div className="hero">
            <div className="hero-copy">
              <h1>
                Find Recurring Payments and UPI AutoPay Mandates in India
              </h1>
              <p className="lede">
                Scan your bank statement to identify recurring subscriptions,
                UPI AutoPay mandates and automatic payments you may have
                forgotten.
              </p>
              <div className="cta-row">
                <Link className="btn btn-primary" href="/scanner">
                  Scan my statements — {PACK_PRICE_LABEL}
                </Link>
                <a className="btn btn-ghost" href="#demo">
                  Try interactive sample
                </a>
              </div>
              <div className="trust-note">
                <Lock size={14} strokeWidth={2.2} aria-hidden="true" />
                <span>
                  CSV &amp; PDF files (including encrypted PDFs) stay in browser
                  memory — never uploaded to a server.
                </span>
              </div>
            </div>

            <div className="glass-panel hero-card">
              <div className="statline">
                <div className="figure">
                  ₹3,896
                  <small>synthetic sample monthly recurring total</small>
                </div>
              </div>
              <div className="preview-rows">
                {SAMPLE_CHARGES.map((item) => (
                  <div className="row" key={item.name}>
                    <span className="row-name">
                      <span>{item.name}</span>
                      {item.note && (
                        <span className="meta-inline">· {item.note}</span>
                      )}
                    </span>
                    <span className="row-amount">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section id="how" className="landing-section">
          <div className="wrap">
            <div className="section-header">
              <p className="eyebrow">How it works</p>
              <h2>
                Built for Indian bank statements, UPI AutoPay &amp; NACH debits
              </h2>
            </div>
            <div className="glass-panel steps-glass">
              <div className="step">
                <div className="n">01. Account &amp; pack</div>
                <h3>Create an account &amp; pay once</h3>
                <p>
                  {PACK_PRICE_LABEL} unlocks {PACK_SIZE} non-expiring scan
                  credits — check bank accounts and credit card statements
                  whenever you need without a recurring subscription.
                </p>
              </div>
              <div className="step">
                <div className="n">02. Local parse</div>
                <h3>Drop in your CSV or PDF</h3>
                <p>
                  Your statement (including password-protected bank PDFs) is
                  parsed locally in your browser to surface hidden subscriptions
                  in bank statements without uploading raw rows.
                </p>
              </div>
              <div className="step">
                <div className="n">03. Review &amp; act</div>
                <h3>Inspect mandates &amp; cancel steps</h3>
                <p>
                  Detected entries label{" "}
                  <Link href="/guides/find-upi-autopay-mandates">
                    UPI AutoPay detection
                  </Link>
                  ,{" "}
                  <Link href="/guides/identify-nach-emandate">
                    NACH and eMandate transactions
                  </Link>
                  , or{" "}
                  <Link href="/guides/recurring-card-payments">
                    recurring card payments
                  </Link>{" "}
                  with confidence scores and cancellation links.
                </p>
              </div>
            </div>

            <div className="glass-panel formats-panel">
              <div className="formats-col">
                <h3>Supported file formats &amp; billing cycles</h3>
                <p>
                  Reads delimited CSV files (comma, semicolon, tab, or pipe up
                  to 10 MB and 100,000 rows) plus digital and
                  password-protected PDF statements (up to 10 MB) from major
                  Indian banks and credit cards. Detects weekly, monthly,
                  quarterly, and annual billing cycles while filtering reversals,
                  refunds, and ₹1–₹5 setup holds.
                </p>
              </div>
              <div className="formats-col">
                <h3>Important detection limitations</h3>
                <p>
                  Image-only scanned PDFs without selectable text are not
                  supported — export a CSV or digital PDF instead. Because
                  matching relies on date intervals and amounts across 2+ cycles
                  (scoring results as High, Medium, or Possible recurring),
                  export 3–12 months of history and verify every flagged merchant
                  before following{" "}
                  <Link href="/guides/cancel-upi-autopay">
                    UPI AutoPay cancellation steps
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="demo" className="landing-section">
          <div className="wrap">
            <div className="section-header">
              <p className="eyebrow">Interactive preview</p>
              <h2>
                Test recurring payment detection on synthetic Indian statements
              </h2>
            </div>
            <InteractiveDemo />
          </div>
        </section>

        <section id="pricing" className="landing-section">
          <div className="wrap">
            <div className="pricing-grid">
              <div>
                <p className="eyebrow">Pricing</p>
                <h2>One payment. Twelve scans.</h2>
                <p className="lede">
                  No subscription, nothing recurring on our side — pay{" "}
                  {PACK_PRICE_LABEL} once and get {PACK_SIZE} scans that never
                  expire. A lightweight subscription tracker in India should not
                  add another monthly charge.
                </p>
              </div>

              <div className="glass-panel plan">
                <div className="plan-title">12-scan pack</div>
                <div className="price">
                  {PACK_PRICE_LABEL}
                  <span> one-time</span>
                </div>
                <ul>
                  <li>
                    <Check size={16} className="plan-check" aria-hidden="true" />
                    <span>
                      {PACK_SIZE} statement scans, use anytime — this month,
                      next month, whenever
                    </span>
                  </li>
                  <li>
                    <Check size={16} className="plan-check" aria-hidden="true" />
                    <span>
                      Supports Indian bank CSVs, digital PDFs &amp; encrypted
                      PDFs
                    </span>
                  </li>
                  <li>
                    <Check size={16} className="plan-check" aria-hidden="true" />
                    <span>
                      Confidence ratings, UPI AutoPay / NACH / Card SI labels
                      &amp; revoke steps
                    </span>
                  </li>
                  <li>
                    <Check size={16} className="plan-check" aria-hidden="true" />
                    <span>
                      CSV &amp; PDF files are parsed strictly in your browser —
                      raw statements never uploaded
                    </span>
                  </li>
                  <li>
                    <Check size={16} className="plan-check" aria-hidden="true" />
                    <span>
                      0 recurring charges found? No credit is deducted
                    </span>
                  </li>
                </ul>
                <Link className="btn btn-primary full" href="/scanner">
                  Create account &amp; pay {PACK_PRICE_LABEL}
                </Link>
                <p className="small-note">
                  Each payment adds {PACK_SIZE} scans to your account — they
                  don&apos;t expire.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="guides" className="landing-section">
          <div className="wrap">
            <div className="guides-section-head">
              <div>
                <p className="eyebrow">Statement guides</p>
                <h2>Decode automatic bank payments before you cancel</h2>
              </div>
              <Link href="/guides" className="text-link">
                View all {GUIDES.length} guides
              </Link>
            </div>
            <div className="guides-grid">
              {GUIDES.map((guide) => (
                <article className="glass-panel guide-card" key={guide.slug}>
                  <div className="guide-card-meta">
                    <span>{guide.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{guide.readTime}</span>
                  </div>
                  <h3>
                    <Link href={guide.href}>{guide.title}</Link>
                  </h3>
                  <p>{guide.summary}</p>
                  <Link href={guide.href} className="guide-card-link">
                    <span>Read guide</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="landing-section">
          <div className="wrap">
            <div className="section-header">
              <p className="eyebrow">FAQ</p>
              <h2>Common questions</h2>
            </div>
            <div className="glass-panel faq-panel">
              {FAQ_ITEMS.map((item) => (
                <div className="faq-item" key={item.q}>
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
