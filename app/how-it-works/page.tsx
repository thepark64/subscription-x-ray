import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CaretRight } from "@phosphor-icons/react/ssr";
import { DetectionPipelineDiagram } from "@/components/SeoIllustrations";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TrackedLink from "@/components/TrackedLink";
import { CANONICAL_SITE_URL, PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";

const TITLE = "How Subscription X-Ray Works — Local Bank Scanner";
const DESCRIPTION =
  "See how Subscription X-Ray parses bank CSV and PDF files in browser memory to detect UPI AutoPay and NACH mandates without uploading raw data.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/how-it-works",
  },
  openGraph: {
    title: TITLE,
    siteName: "Subscription X-Ray",
    description: DESCRIPTION,
    type: "website",
    url: "/how-it-works",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
          name: "How It Works",
          item: `${CANONICAL_SITE_URL}/how-it-works`,
        },
      ],
    },
    {
      "@type": "WebPage",
      name: TITLE,
      description: DESCRIPTION,
      url: `${CANONICAL_SITE_URL}/how-it-works`,
      inLanguage: "en-IN",
      isPartOf: {
        "@id": `${CANONICAL_SITE_URL}/#website`,
      },
    },
  ],
};

export default function HowItWorksPage() {
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
            <span aria-current="page">How it works</span>
          </nav>

          <article className="surface-card guide-article">
            <header className="guide-header">
              <div className="guide-kicker caption-3">
                <span>Product architecture</span>
                <span aria-hidden="true">·</span>
                <span>Browser-local verification</span>
              </div>
              <h1 className="heading-3">How Subscription X-Ray works</h1>
              <p className="guide-summary body-3">
                Scan your bank statement inside browser memory. Discover
                recurring payments, UPI AutoPay mandates, NACH debits, and
                standing instructions without sharing NetBanking logins or
                uploading raw files.
              </p>
            </header>

            <div className="guide-prose">
              <h2>1. Export a multi-month statement from your bank or card</h2>
              <p>
                Log in to your bank&apos;s NetBanking portal or credit card
                portal directly on your device and download an account statement
                covering 3 to 12 months. Subscription X-Ray accepts:
              </p>
              <ul>
                <li>
                  <strong>Delimited CSV exports (up to 10 MB and 100,000 rows):</strong>{" "}
                  Comma, semicolon, tab, or pipe separated files, handling both
                  separate Debit/Credit columns and single Amount + Dr/Cr
                  indicator columns.
                </li>
                <li>
                  <strong>Digital and encrypted PDF statements (up to 10 MB):</strong>{" "}
                  Selectable-text bank and card PDFs—including password-protected
                  PDFs unlocked locally via our browser PDF worker without
                  uploading your password.
                </li>
              </ul>

              <h2>2. Local parsing, noise filtering, and interval matching</h2>
              <p>
                When you drop a file into{" "}
                <Link href="/scanner">the statement scanner</Link>, parsing runs
                strictly inside browser memory:
              </p>
              <ol>
                <li>
                  <strong>Header and Indian date normalization:</strong> Reads
                  Indian <code>DD/MM/YYYY</code> dates cleanly alongside ISO and
                  text month formats while stripping opening/closing balance
                  rows and summary footers.
                </li>
                <li>
                  <strong>Transaction noise removal:</strong> Filters out salary
                  credits, refunds, reversals, failed debit attempts, and ₹1–₹5
                  mandate verification holds so temporary setup pings do not
                  inflate recurring spend.
                </li>
                <li>
                  <strong>Merchant normalization &amp; cadence clustering:</strong>{" "}
                  Strips changing 12-digit UPI RRNs, IFSC codes, and card noise
                  to group repeating debits across weekly (~5–9 days, 4+
                  charges), monthly (~26–35 days), quarterly (~81–101 days), and
                  annual (~350–380 days) schedules.
                </li>
                <li>
                  <strong>Rail classification &amp; confidence rating:</strong>{" "}
                  Labels <code>UPI AutoPay</code>, <code>NACH / eMandate</code>,{" "}
                  <code>Card Standing Instruction</code>, or recurring{" "}
                  <code>UPI</code> transfers where narration supports it, and
                  assigns <code>High</code>, <code>Medium</code>, or{" "}
                  <code>Possible</code> confidence.
                </li>
              </ol>

              <DetectionPipelineDiagram />

              <h3>Worked example: raw bank lines to normalized results</h3>
              <p>
                Here is how the local detection rules treat representative Indian
                statement rows (your actual bank narration text stays in browser
                memory and is discarded after grouping):
              </p>
              <div className="guide-table-wrap">
                <table className="guide-table">
                  <thead>
                    <tr>
                      <th>Raw statement row</th>
                      <th>Local engine treatment</th>
                      <th>Final result</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <code>UPI/401234567890/SPOTIFY/SBIN0001234/SPOTIFY@OKSBI</code>
                      </td>
                      <td>Strips 12-digit RRN, IFSC code, and <code>@oksbi</code> handle</td>
                      <td>Grouped as <strong>Spotify</strong> (<code>UPI</code>)</td>
                    </tr>
                    <tr>
                      <td>
                        <code>UPI MANDATE CREATION NETFLIX@OKAXIS · ₹2.00</code>
                      </td>
                      <td>Matched as mandate creation + <code>≤ ₹5</code> setup ping</td>
                      <td>Filtered out automatically</td>
                    </tr>
                    <tr>
                      <td>
                        <code>UPI/REV/412345678901/NETFLIX · ₹649.00</code>
                      </td>
                      <td>Matched by reversal marker (<code>REV</code>)</td>
                      <td>Filtered out automatically</td>
                    </tr>
                    <tr>
                      <td>
                        <code>NACH-DR-CULTFIT INDIA-SBIN0001234 · ₹999.00</code>
                      </td>
                      <td>Matched <code>NACH</code> rail + ~30d interval</td>
                      <td><strong>Cult.fit</strong> · <code>NACH / eMandate</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="guide-inline-cta">
                <div className="guide-inline-cta-copy">
                  <strong>Test your statement CSV or digital PDF privately</strong>
                  <span>
                    Browser-local parsing with zero raw file uploads. Need bank
                    export tips first? Check our{" "}
                    <Link href="/guides/hdfc-sbi-icici-automatic-payments">
                      HDFC, SBI &amp; ICICI statement guide
                    </Link>
                    .
                  </span>
                </div>
                <TrackedLink
                  className="btn btn-primary button-sm"
                  href="/scanner"
                  trackLocation="how_it_works_inline"
                  trackLabel="Scan statement for ₹69"
                >
                  <span>Scan statement ({PACK_PRICE_LABEL})</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </TrackedLink>
              </div>

              <h2>3. What stays on your device vs stored in your account</h2>
              <p>
                Privacy boundaries are enforced in source code—not just policy
                text:
              </p>

              <div className="guide-table-wrap">
                <table className="guide-table">
                  <thead>
                    <tr>
                      <th>Data type</th>
                      <th>Where processed</th>
                      <th>Stored on servers?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Raw CSV or PDF statement file</td>
                      <td>Browser memory only</td>
                      <td>Never uploaded or stored</td>
                    </tr>
                    <tr>
                      <td>PDF unlock password</td>
                      <td>Browser PDF worker only</td>
                      <td>Never sent or logged</td>
                    </tr>
                    <tr>
                      <td>Non-recurring transactions &amp; balances</td>
                      <td>Discarded in browser</td>
                      <td>Never saved</td>
                    </tr>
                    <tr>
                      <td>Detected recurring summaries</td>
                      <td>Saved via Supabase RPC</td>
                      <td>Yes (merchant, amount, cycle, rail, reason)</td>
                    </tr>
                    <tr>
                      <td>Account &amp; credit pack ledger</td>
                      <td>Supabase Auth &amp; Cashfree</td>
                      <td>Yes (email, credits, Cashfree order ID)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2>4. Pricing: ₹69 once for 12 non-expiring scan credits</h2>
              <p>
                There is no monthly subscription and no free tier for real
                statement scans. A single {PACK_PRICE_LABEL} Cashfree payment
                adds {PACK_SIZE} scan credits that never expire:
              </p>
              <ul>
                <li>
                  <strong>One credit per qualifying scan:</strong> Valid scans
                  that uncover recurring debits consume 1 credit and save to
                  your history.
                </li>
                <li>
                  <strong>Zero-subscription protection:</strong> If a valid bank
                  or card statement shows zero recurring charges, your summary is
                  still recorded and <strong>zero credits are deducted</strong>.
                </li>
                <li>
                  <strong>Interactive sample free for everyone:</strong> Test the
                  real detection algorithm on synthetic Indian datasets anytime on{" "}
                  <Link href="/#demo">the homepage demo</Link> without paying or
                  signing in.
                </li>
              </ul>

              <h2>5. Honest technical limitations</h2>
              <ul>
                <li>
                  <strong>Scanned image PDFs:</strong> Paper scans or
                  screenshot PDFs without selectable text cannot be parsed;
                  export a CSV or digital PDF from NetBanking instead.
                </li>
                <li>
                  <strong>No automatic mandate revocation:</strong>{" "}
                  Subscription X-Ray never logs into your bank or UPI app and
                  cannot cancel subscriptions for you. Instead, you get direct
                  merchant links plus app-specific cancellation steps for Google
                  Pay, PhonePe, Paytm, BHIM, NACH, and RBI SI Hub portals.
                </li>
                <li>
                  <strong>Heuristic matching caveats:</strong> A single 30-day
                  export cannot confirm monthly or annual intervals, and
                  regular manual transfers (such as monthly rent) can match
                  interval rules. Always verify each flagged item before revoking
                  any mandate.
                </li>
              </ul>

              <p>
                Official cancellation and escalation guidance is always anchored
                directly to primary Indian payment bodies: review{" "}
                <a
                  href="https://www.npci.org.in/product/myupi.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NPCI MyUPI
                </a>{" "}
                and{" "}
                <a
                  href="https://upihelp.npci.org.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NPCI UPI Help
                </a>{" "}
                for UPI mandate lifecycle rules, or escalate unresolved bank
                disputes through the{" "}
                <a
                  href="https://cms.rbi.org.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  RBI Complaint Management System (CMS)
                </a>
                .
              </p>

              <p>
                Still have questions? Read our{" "}
                <Link href="/faq">complete AEO &amp; product FAQ</Link>, browse
                our{" "}
                <Link href="/help">Forgotten Subscription Help Center</Link>,
                compare{" "}
                <Link href="/compare">statement scanners vs other trackers</Link>
                , or read our{" "}
                <Link href="/guides/bank-statement-privacy-security">
                  statement privacy guide
                </Link>
                .
              </p>
            </div>

            <aside className="guide-cta-box" aria-label="Scanner tool">
              <div className="guide-cta-copy">
                <h2 className="title-2">
                  Ready to inspect your own statement privately?
                </h2>
                <p className="body-6">
                  {PACK_PRICE_LABEL} once unlocks {PACK_SIZE} non-expiring scans
                  on your account. Valid statements with zero recurring charges
                  use zero credits.
                </p>
              </div>
              <div className="guide-cta-actions">
                <TrackedLink
                  className="btn btn-primary button-md"
                  href="/scanner"
                  trackLocation="how_it_works_cta"
                  trackLabel="Scan my statement for ₹69"
                >
                  <span>Scan my statement for {PACK_PRICE_LABEL}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </TrackedLink>
                <Link className="btn btn-ghost button-md" href="/#demo">
                  Try synthetic sample
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
