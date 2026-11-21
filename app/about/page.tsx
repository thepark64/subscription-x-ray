import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CaretRight } from "@phosphor-icons/react/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CANONICAL_SITE_URL, PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";

const ABOUT_TITLE = "About Subscription X-Ray — Browser Statement Scanner";
const ABOUT_DESCRIPTION =
  "Learn how Subscription X-Ray detects recurring payments locally in your browser, our ₹69 12-scan credit model, privacy safeguards, and key limitations.";

export const metadata: Metadata = {
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: ABOUT_TITLE,
    siteName: "Subscription X-Ray",
    description: ABOUT_DESCRIPTION,
    type: "website",
    url: "/about",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "About Subscription X-Ray — Browser Statement Scanner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    images: ["/twitter-image.png"],
  },
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: CANONICAL_SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "About",
          item: `${CANONICAL_SITE_URL}/about`,
        },
      ],
    },
    {
      "@type": "AboutPage",
      name: ABOUT_TITLE,
      description: ABOUT_DESCRIPTION,
      url: `${CANONICAL_SITE_URL}/about`,
      inLanguage: "en-IN",
      about: {
        "@id": `${CANONICAL_SITE_URL}/#organization`,
      },
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <SiteHeader mode="content" />

      <main id="main-content" className="guide-page">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <CaretRight size={14} aria-hidden="true" />
            <span aria-current="page">About</span>
          </nav>

          <article className="surface-card guide-article">
            <header className="guide-header">
              <div className="guide-kicker">
                <span>Product overview</span>
                <span aria-hidden="true">·</span>
                <span>Privacy &amp; methodology</span>
              </div>
              <h1>About Subscription X-Ray</h1>
              <p className="guide-summary">
                Subscription X-Ray is a privacy-first Indian bank and credit
                card statement analyzer built to help people find recurring
                charges, UPI AutoPay mandates, and NACH debits without
                connecting bank logins or uploading raw financial files.
              </p>
            </header>

            <div className="guide-prose">
              <h2>What Subscription X-Ray does</h2>
              <p>
                Many households pay for services across multiple payment rails
                at the same time: UPI AutoPay inside Google Pay or PhonePe,
                recurring debit or credit card Standing Instructions, Apple App
                Store or Google Play billing, and bank NACH e-Mandates for
                memberships, loans, or SIPs. Looking inside a single UPI app
                often misses card and NACH debits, while forgotten annual plans
                hide across months of normal spending.
              </p>
              <p>
                Subscription X-Ray lets you inspect an exported CSV or digital
                PDF bank or credit card statement directly in your browser. It
                groups normalized merchant narrations, detects weekly, monthly,
                quarterly, and annual intervals, filters out failed payments,
                reversals, refunds, and ₹1–₹5 mandate verification holds, and
                surfaces structured results with payment-rail labels and
                confidence ratings.
              </p>

              <h2>Why we built a browser-only scanner</h2>
              <p>
                Finding recurring subscriptions should not require handing over
                NetBanking passwords, granting ongoing third-party account
                aggregator access, or emailing full transaction ledgers to an
                external server. By performing CSV parsing and PDF text
                extraction—including unlocking password-protected bank PDFs via
                the local PDF worker—strictly inside browser memory, your raw
                statement file and PDF password stay on your device.
              </p>

              <h2>How the ₹69 scan-credit model works</h2>
              <p>
                Our pricing is intentionally simple and avoids adding another
                subscription to your monthly expenses:
              </p>
              <ul>
                <li>
                  <strong>One-time pack:</strong> {PACK_PRICE_LABEL} processed
                  via Cashfree Payments adds {PACK_SIZE} scan credits to your
                  account.
                </li>
                <li>
                  <strong>Credits never expire:</strong> Use scans across
                  different bank accounts, credit cards, or quarterly checkups
                  whenever you want. There is no recurring billing or auto-renew
                  on our side.
                </li>
                <li>
                  <strong>No free tier for real scans:</strong> You can try the{" "}
                  <Link href="/#demo">interactive synthetic demo</Link> on the
                  homepage without paying or signing in. Real statement scans
                  require an account and at least 1 credit.
                </li>
                <li>
                  <strong>Zero-subscription protection:</strong> If a valid
                  statement contains zero detected recurring charges, your scan
                  summary is saved for reference and zero credits are deducted.
                </li>
              </ul>

              <h2>Privacy approach (verified against source behaviour)</h2>
              <p>
                Only the data needed to run your account, enforce credit
                balances, and preserve your scan history is stored on our
                backend (Supabase Auth and PostgreSQL):
              </p>
              <ul>
                <li>
                  <strong>Stored in your account:</strong> Your email, optional
                  display name, credit balance, Cashfree order/payment verification
                  records, and saved scan summaries (detected merchant names,
                  average amount, frequency, occurrences, monthly equivalent,
                  and optional payment rail/confidence/reason fields).
                </li>
                <li>
                  <strong>Never sent to servers:</strong> Raw CSV/PDF statement
                  bytes, non-recurring transactions, opening/closing account
                  balances, and PDF unlock passwords remain in browser memory.
                </li>
                <li>
                  <strong>User-controlled deletion:</strong> You can delete
                  individual scan records anytime or permanently delete your
                  account directly inside <Link href="/scanner">the scanner</Link>
                  . Full details are documented in our{" "}
                  <Link href="/privacy">Privacy Policy</Link>.
                </li>
              </ul>

              <h2>Honest limitations</h2>
              <p>
                Understanding what automated statement scanning cannot do is
                important before acting on results:
              </p>
              <ul>
                <li>
                  <strong>Digital statements only:</strong> Scanned image-only
                  PDFs without selectable text cannot be parsed. Download a
                  digital PDF or CSV export from NetBanking instead.
                </li>
                <li>
                  <strong>No automatic cancellation:</strong> Subscription X-Ray
                  never logs into your bank or UPI app and cannot revoke
                  mandates for you. We show direct merchant management links and
                  manual cancellation steps.
                </li>
                <li>
                  <strong>Heuristic matching across cycles:</strong>{" "}
                  Detection looks for repeating intervals and similar amounts (2+
                  charges for monthly/quarterly/annual, 4+ for weekly). A 1-month
                  export cannot confirm monthly or annual cycles, and repeated
                  manual transfers (such as monthly rent or regular vendor UPI
                  payments) can look like subscriptions. Always verify before
                  cancelling.
                </li>
              </ul>

              <h2>Learn how Indian recurring rails work</h2>
              <p>
                Explore our{" "}
                <Link href="/guides">statement and mandate guides</Link> for
                practical help reading Indian bank narrations, checking{" "}
                <Link href="/guides/find-upi-autopay-mandates">
                  UPI AutoPay mandates
                </Link>
                , distinguishing{" "}
                <Link href="/guides/identify-nach-emandate">
                  NACH e-Mandates
                </Link>
                , and cancelling unwanted debits safely. You can also inspect
                our <Link href="/how-it-works">technical architecture</Link>,{" "}
                <Link href="/compare">compare tracker approaches</Link>, read our{" "}
                <Link href="/faq">FAQ</Link>, or visit the{" "}
                <Link href="/contact">Contact page</Link>.
              </p>
            </div>

            <aside className="guide-cta-box">
              <div className="guide-cta-copy">
                <h2>Ready to audit your statements?</h2>
                <p>
                  Try the synthetic preview first or create an account to scan
                  your own bank CSV and PDF statements locally.
                </p>
              </div>
              <div className="guide-cta-actions">
                <Link className="btn btn-primary button-md" href="/scanner">
                  <span>Scan my statement for {PACK_PRICE_LABEL}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link className="btn btn-ghost button-md" href="/guides">
                  Read guides
                </Link>
              </div>
            </aside>
          </article>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
