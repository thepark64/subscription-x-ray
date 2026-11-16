import Link from "next/link";
import { Check, Lock } from "lucide-react";
import AuthCallbackHandler from "@/components/AuthCallbackHandler";
import BrandMark from "@/components/BrandMark";

const SAMPLE_CHARGES = [
  { name: "Netflix", amount: "₹649/mo", note: "" },
  { name: "Cult.fit", amount: "₹999/mo", note: "" },
  { name: "Unnamed SaaS tool", amount: "₹1,999/mo", note: "unrecognised" },
  { name: "Spotify", amount: "₹119/mo", note: "" },
  { name: "Google One", amount: "₹130/mo", note: "" },
];

export default function Home() {
  return (
    <>
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
                Upload a bank or card statement. Subscription X-Ray looks for
                likely recurring charges, the ones you remember and the ones you
                forgot, in seconds, entirely in your browser.
              </p>
              <div className="cta-row">
                <Link className="btn btn-primary" href="/scanner">
                  Scan my statements — ₹69
                </Link>
                <a className="btn btn-ghost" href="#pricing">
                  See pricing
                </a>
              </div>
              <div className="trust-note">
                <Lock size={14} strokeWidth={2.2} aria-hidden="true" />
                <span>
                  Your statement is never uploaded to a server — it&apos;s read
                  locally in your browser.
                </span>
              </div>
            </div>

            <div className="glass-panel hero-card">
              <div className="statline">
                <div className="figure">
                  ₹3,847
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
                  ₹69 unlocks 12 scans — check every card, every month, whenever
                  you want.
                </p>
              </div>
              <div className="step">
                <div className="n">02. Local parse</div>
                <h3>Drop in your statement</h3>
                <p>
                  Your CSV or PDF statement is parsed locally in your browser.
                  The raw file is never sent anywhere.
                </p>
              </div>
              <div className="step">
                <div className="n">03. Review & act</div>
                <h3>See what&apos;s recurring</h3>
                <p>
                  Likely recurring charges are listed with an estimated monthly
                  cost, frequency, and a management link when recognised.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="landing-section">
          <div className="wrap">
            <div className="pricing-grid">
              <div>
                <p className="eyebrow">Pricing</p>
                <h2>One payment. Twelve scans.</h2>
                <p className="lede">
                  No subscription, nothing recurring on our side — pay once, get
                  a pack of 12 scans to use whenever you need them.
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
                      Check every card and account you have, not just one
                    </span>
                  </li>
                  <li>
                    <Check size={16} className="plan-check" aria-hidden="true" />
                    <span>Cancellation and help links for known services</span>
                  </li>
                  <li>
                    <Check size={16} className="plan-check" aria-hidden="true" />
                    <span>Runs entirely in your browser — nothing uploaded</span>
                  </li>
                  <li>
                    <Check size={16} className="plan-check" aria-hidden="true" />
                    <span>
                      Out of scans? Buy another 12-pack for ₹69, any time
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
              <div className="faq-item">
                <h3>Is my statement actually private?</h3>
                <p>
                  CSV and PDF parsing happen entirely in your browser. The raw
                  file is never sent to a server.
                </p>
              </div>
              <div className="faq-item">
                <h3>What do I get for ₹69?</h3>
                <p>
                  12 scans on your account, usable whenever — check your own
                  cards, a family member&apos;s statement, or the same account
                  again next month. They don&apos;t expire.
                </p>
              </div>
              <div className="faq-item">
                <h3>Can it cancel subscriptions automatically?</h3>
                <p>
                  Not yet. It estimates recurring charges and can show
                  management or help links for recognised services.
                </p>
              </div>
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
