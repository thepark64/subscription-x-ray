import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CaretRight } from "@phosphor-icons/react/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TrackedLink from "@/components/TrackedLink";
import { CANONICAL_SITE_URL, PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";

const TITLE = "Compare Recurring Payment Trackers — Subscription X-Ray";
const DESCRIPTION =
  "Compare browser-local bank statement scanners against UPI AutoPay tabs, bank-login aggregators, SMS expense apps, and manual CSV spreadsheets.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/compare",
  },
  openGraph: {
    title: TITLE,
    siteName: "Subscription X-Ray",
    description: DESCRIPTION,
    type: "website",
    url: "/compare",
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
          name: "Compare",
          item: `${CANONICAL_SITE_URL}/compare`,
        },
      ],
    },
    {
      "@type": "WebPage",
      name: TITLE,
      description: DESCRIPTION,
      url: `${CANONICAL_SITE_URL}/compare`,
      inLanguage: "en-IN",
    },
  ],
};

export default function ComparePage() {
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
            <span aria-current="page">Compare approaches</span>
          </nav>

          <article className="surface-card guide-article">
            <header className="guide-header">
              <div className="guide-kicker caption-3">
                <span>Factual comparison</span>
                <span aria-hidden="true">·</span>
                <span>India recurring payment tools</span>
              </div>
              <h1 className="heading-3">
                Comparing ways to find recurring subscriptions in India
              </h1>
              <p className="guide-summary body-3">
                Different tools trade off bank access, multi-rail coverage, and
                ongoing cost. Here is how browser-local statement scanning
                compares against native UPI app tabs, bank-login aggregators,
                SMS expense apps, and spreadsheets.
              </p>
            </header>

            <div className="guide-prose">
              <h2>Side-by-side comparison across five approaches</h2>
              <div className="guide-table-wrap">
                <table className="guide-table">
                  <thead>
                    <tr>
                      <th>Criteria</th>
                      <th>Subscription X-Ray</th>
                      <th>Single UPI App AutoPay Tab</th>
                      <th>Bank-Login / Aggregator Apps</th>
                      <th>On-Device SMS Trackers</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Bank login or AA consent</td>
                      <td>Never required</td>
                      <td>Only uses that UPI app</td>
                      <td>Required for syncing</td>
                      <td>Requires Android SMS read access</td>
                    </tr>
                    <tr>
                      <td>Raw file destination</td>
                      <td>Stays in browser memory</td>
                      <td>Processed inside app ecosystem</td>
                      <td>Synced to provider cloud servers</td>
                      <td>Varies (local or cloud sync)</td>
                    </tr>
                    <tr>
                      <td>UPI AutoPay + NACH + Cards</td>
                      <td>All in one statement scan</td>
                      <td>UPI AutoPay on that app only</td>
                      <td>Multi-account if linked</td>
                      <td>Depends on SMS arrival &amp; formats</td>
                    </tr>
                    <tr>
                      <td>Annual &amp; multi-month visibility</td>
                      <td>Covers full exported PDF/CSV history</td>
                      <td>Active mandates in that app</td>
                      <td>Historical once linked</td>
                      <td>Limited to SMS history on phone</td>
                    </tr>
                    <tr>
                      <td>Automatic mandate revocation</td>
                      <td>No (shows revoke steps &amp; links)</td>
                      <td>Yes, for that UPI app only</td>
                      <td>Supported on select US/EU cards</td>
                      <td>No (alerting only)</td>
                    </tr>
                    <tr>
                      <td>Pricing model</td>
                      <td>₹69 once for 12 non-expiring scans</td>
                      <td>Free inside payment app</td>
                      <td>Typically monthly SaaS subscription</td>
                      <td>Ad-supported / loan cross-sell / Pro</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2>When native UPI app AutoPay tabs are enough</h2>
              <p>
                If every subscription you pay for was approved inside a single
                UPI app—for instance, Google Pay or PhonePe—you can check and
                revoke those mandates directly inside that app&apos;s AutoPay
                settings at zero cost. See our{" "}
                <Link href="/guides/cancel-upi-autopay">
                  guide to cancelling UPI AutoPay mandates
                </Link>
                .
              </p>
              <p>
                However, UPI app tabs miss charges billed via{" "}
                <Link href="/guides/identify-nach-emandate">
                  bank NACH e-Mandates
                </Link>
                ,{" "}
                <Link href="/guides/recurring-card-payments">
                  credit or debit card Standing Instructions
                </Link>
                , Apple/Google Play billing, and mandates approved through a
                second UPI app you rarely open.
              </p>

              <h2>Why many Indian users avoid bank-login aggregators</h2>
              <p>
                International trackers built around US/EU open-banking connectors
                (or automated scraping) request live bank credentials and sync
                every transaction continuously. Most do not understand Indian bank
                narration formats like <code>UPI/123456789012/MERCHANT@OKAXIS</code>{" "}
                or <code>NACH DR</code>, and require another recurring monthly
                fee just to audit subscriptions.
              </p>

              <h2>Why SMS trackers miss multi-month and card audits</h2>
              <p>
                SMS expense apps depend on consistent bank SMS delivery across
                SIM changes and device upgrades, and Android permissions cannot
                inspect past 12-month statements sitting in an inbox or PDF
                archive. By contrast, analyzing exported CSV or selectable PDF
                statements reads the actual settled bank ledger.
              </p>

              <h2>When a manual spreadsheet works best</h2>
              <p>
                If you only have one bank account with fewer than 50 lines a
                month, sorting a CSV in Excel or Google Sheets by narration works
                well. When statements span thousands of mixed UPI rows across 6
                to 12 months with changing RRN numbers, IFSC codes, and small
                verification holds,{" "}
                <Link href="/how-it-works">automated local normalization</Link>{" "}
                saves hours without sending raw data off your device.
              </p>
            </div>

            <aside className="guide-cta-box" aria-label="Scanner tool">
              <div className="guide-cta-copy">
                <h2 className="title-2">
                  Audit your full statement across UPI, NACH, and cards
                </h2>
                <p className="body-6">
                  {PACK_PRICE_LABEL} one-time payment grants {PACK_SIZE}{" "}
                  non-expiring scan credits. Zero-subscription statements never
                  use a credit.
                </p>
              </div>
              <div className="guide-cta-actions">
                <TrackedLink
                  className="btn btn-primary button-md"
                  href="/scanner"
                  trackLocation="compare_page_cta"
                  trackLabel="Scan my statement for ₹69"
                >
                  <span>Scan my statement for {PACK_PRICE_LABEL}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </TrackedLink>
                <Link className="btn btn-ghost button-md" href="/#demo">
                  Try synthetic demo
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
