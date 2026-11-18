import type { Metadata } from "next";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import AuthCallbackHandler from "@/components/AuthCallbackHandler";
import BrandMark from "@/components/BrandMark";
import InteractiveDemo from "@/components/InteractiveDemo";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Subscription X-Ray — Find recurring charges & UPI AutoPay mandates",
  description:
    "Scan HDFC, SBI, ICICI, Axis, Kotak, or credit card CSV and PDF statements privately in your browser. Spot UPI AutoPay mandates and recurring subscriptions for ₹69 (12 scans).",
  alternates: {
    canonical: "/",
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
    q: "Which Indian banks and file formats work?",
    a: "Standard CSV and digital PDF statements from HDFC, SBI, ICICI, Axis, Kotak, and major credit cards. Failed attempts, reversals, refunds, and ₹1–₹2 mandate setup holds are filtered automatically.",
  },
  {
    q: "What do I get for ₹69?",
    a: "One-time ₹69 adds 12 scan credits to your account. Credits never expire and there is no recurring subscription on our side. If a valid statement has zero recurring charges, no credit is deducted.",
  },
  {
    q: "Can it cancel UPI AutoPay mandates or subscriptions?",
    a: "We don't connect to your bank login or auto-cancel on your behalf. For each detected charge, you get direct merchant manage links plus step-by-step Google Pay, PhonePe, Paytm, BHIM, and bank e-Mandate cancellation steps.",
  },
];

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Subscription X-Ray",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description:
        "Browser-only Indian bank CSV and PDF statement scanner for recurring subscriptions, UPI AutoPay mandates, and NACH debits.",
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
      <header className="topbar-wrap">
        <div className="wrap navrow">
          <Link
            href="/"
            className="brand-wordmark"
            aria-label="Subscription X-Ray home"
          >
            <BrandMark size={32} />
            <span>Subscription X-Ray</span>
          </Link>

          <nav className="navlinks" aria-label="Primary navigation">
            <a href="#how">How it works</a>
            <a href="#demo">Sample scan</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="nav-action">
            <Link className="btn btn-primary btn-sm" href="/scanner">
              Open scanner
            </Link>
          </div>
        </div>
      </header>

      <main>
        <div className="wrap">
          <div className="hero">
            <div className="hero-copy">
              <h1>See what&apos;s quietly leaving your account every month.</h1>
              <p className="lede">
                Drop in an Indian bank or card CSV or PDF statement.
                Subscription X-Ray detects recurring charges, UPI AutoPay
                mandates, and NACH debits in seconds — entirely in your browser.
              </p>
              <div className="cta-row">
                <Link className="btn btn-primary" href="/scanner">
                  Scan my statements — ₹69
                </Link>
                <a className="btn btn-ghost" href="#demo">
                  Try interactive sample
                </a>
              </div>
              <div className="trust-note">
                <Lock size={14} strokeWidth={2.2} aria-hidden="true" />
                <span>
                  CSV &amp; PDF files (including encrypted PDFs) stay on your
                  device — never uploaded to a server.
                </span>
              </div>
            </div>

            <div className="glass-panel hero-card">
              <div className="statline">
                <div className="figure">
                  ₹3,896
                  <small>found leaving your account monthly</small>
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
              <h2>Three steps to see everything recurring</h2>
            </div>
            <div className="glass-panel steps-glass">
              <div className="step">
                <div className="n">01. Account & pack</div>
                <h3>Create an account & pay once</h3>
                <p>
                  ₹69 unlocks 12 scans — check every card, bank account, or PDF
                  statement whenever you want.
                </p>
              </div>
              <div className="step">
                <div className="n">02. Local parse</div>
                <h3>Drop in your CSV or PDF</h3>
                <p>
                  Your statement (even password-protected PDFs) is parsed
                  locally in your browser. Nothing raw is ever uploaded.
                </p>
              </div>
              <div className="step">
                <div className="n">03. Review & act</div>
                <h3>See mandates & cancel steps</h3>
                <p>
                  Recurring charges show confidence scores, UPI AutoPay or NACH
                  labels, and step-by-step revocation guidance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="demo" className="landing-section">
          <div className="wrap">
            <div className="section-header">
              <p className="eyebrow">Interactive preview</p>
              <h2>See how detection works before you pay</h2>
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
                  No subscription, nothing recurring on our side — pay ₹69 once
                  and get 12 scans that never expire. Zero-subscription scans
                  never use a credit.
                </p>
              </div>

              <div className="glass-panel plan">
                <div className="plan-title">12-scan pack</div>
                <div className="price">
                  ₹69<span> one-time</span>
                </div>
                <ul>
                  <li>
                    <Check size={16} className="plan-check" aria-hidden="true" />
                    <span>
                      12 statement scans, use anytime — this month, next month,
                      whenever
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
                      Confidence badges, UPI AutoPay detection &amp; revoke
                      guides
                    </span>
                  </li>
                  <li>
                    <Check size={16} className="plan-check" aria-hidden="true" />
                    <span>Runs entirely in your browser — nothing uploaded</span>
                  </li>
                  <li>
                    <Check size={16} className="plan-check" aria-hidden="true" />
                    <span>
                      0 recurring charges found? No credit is deducted
                    </span>
                  </li>
                </ul>
                <Link className="btn btn-primary full" href="/scanner">
                  Create account & pay ₹69
                </Link>
                <p className="small-note">
                  Each payment adds 12 scans to your account — they don&apos;t
                  expire.
                </p>
              </div>
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

      <footer>
        <div className="footer-inner">
          <span>
            Subscription X-Ray · Built to find money you forgot you were
            spending.
          </span>
          <div className="footer-links">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/refund">Refunds</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
