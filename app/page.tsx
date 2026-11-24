import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, LockSimple } from "@phosphor-icons/react/ssr";
import AuthCallbackHandler from "@/components/AuthCallbackHandler";
import InteractiveDemo from "@/components/InteractiveDemo";
import { RevealSection, TaglineReveal } from "@/components/MotionPrimitives";
import { LocalPrivacyBoundaryDiagram } from "@/components/SeoIllustrations";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TrackedLink from "@/components/TrackedLink";
import {
  CANONICAL_SITE_URL,
  PACK_PRICE_LABEL,
  PACK_SIZE,
  SUPPORT_EMAIL,
} from "@/lib/config";
import { GUIDES } from "@/lib/guides";

const HOME_TITLE = "Find Recurring Payments & AutoPay | Subscription X-Ray";
const HOME_DESCRIPTION =
  "See what's quietly leaving your account every month. Scan Indian bank CSV & PDF statements in your browser for AutoPay & NACH — ₹69 for 12 scans.";

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
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: HOME_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/twitter-image.png"],
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
    q: "How do I find recurring subscriptions in my bank statement?",
    a: "Export 3 to 12 months of CSV or digital PDF statements from your bank or card portal and scan them inside your browser. Subscription X-Ray strips changing UPI RRNs and transaction noise, clusters repeating weekly, monthly, quarterly, or annual debits, and flags every likely recurring charge with its payment rail.",
  },
  {
    q: "Is my bank statement actually private?",
    a: "Yes. CSV and PDF parsing, including unlocking password protected bank PDFs, happens strictly inside your browser. Your raw statement file and PDF password are never uploaded to or stored on any server.",
  },
  {
    q: "Which Indian banks, file formats, and payment rails are supported?",
    a: "Delimited CSV exports up to 10 MB and 100,000 rows plus digital or password protected PDFs from HDFC, SBI, ICICI, Axis, Kotak, and major credit cards. It labels UPI AutoPay mandates, NACH debits, recurring card standing instructions, and OTT or SaaS charges while filtering failed attempts, reversals, refunds, and ₹1 to ₹5 mandate holds.",
  },
  {
    q: "What are the scanner limitations I should know?",
    a: "Scanned image PDFs without selectable text cannot be read; export a digital PDF or CSV from NetBanking instead. Detection uses interval and amount matching over multiple cycles to surface likely subscriptions and possible recurring transfers, so a single 30 day export will not confirm monthly or annual plans, and repeated manual UPI transfers can match recurring rules. Always verify before cancelling.",
  },
  {
    q: "What do I get for ₹69?",
    a: "A single ₹69 payment adds 12 scan credits to your account. Credits never expire and there is no recurring subscription on our side. If a valid statement has zero recurring charges, no credit is deducted.",
  },
  {
    q: "Can Subscription X-Ray cancel UPI AutoPay mandates or subscriptions?",
    a: "No. We do not connect to your bank login or revoke mandates on your behalf. For detected charges, you get direct merchant account links plus step by step Google Pay, PhonePe, Paytm, BHIM, NACH, and card SI Hub cancellation instructions.",
  },
  {
    q: "What happens if my uploaded statement shows zero recurring charges?",
    a: "Your empty scan summary is still saved in history for reference and zero scan credits are deducted from your balance. Only valid scans that surface at least one recurring charge consume a credit.",
  },
  {
    q: "How is this different from checking my UPI app AutoPay tab?",
    a: "A single UPI app only shows mandates created inside that specific app. Auditing your actual bank and credit card statements reveals UPI AutoPay mandates from any app alongside bank NACH eMandates, card Standing Instructions, and forgotten annual renewals.",
  },
];

const FEATURED_GUIDES = GUIDES.slice(0, 6);

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${CANONICAL_SITE_URL}/#organization`,
      name: "Subscription X-Ray",
      url: CANONICAL_SITE_URL,
      logo: `${CANONICAL_SITE_URL}/icon-96x96.png`,
      email: SUPPORT_EMAIL,
    },
    {
      "@type": "WebSite",
      "@id": `${CANONICAL_SITE_URL}/#website`,
      name: "Subscription X-Ray",
      url: CANONICAL_SITE_URL,
      inLanguage: "en-IN",
      publisher: {
        "@id": `${CANONICAL_SITE_URL}/#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Subscription X-Ray",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: CANONICAL_SITE_URL,
      inLanguage: "en-IN",
      publisher: {
        "@id": `${CANONICAL_SITE_URL}/#organization`,
      },
      screenshot: `${CANONICAL_SITE_URL}/opengraph-image.png`,
      description:
        "Browser-local Indian bank and credit card CSV and PDF statement scanner that uncovers recurring payments, UPI AutoPay mandates, NACH debits, and recurring card standing instructions.",
      featureList: [
        "Browser-local CSV parsing (up to 10 MB and 100,000 rows)",
        "Browser-local digital and password-protected PDF decoding (up to 10 MB)",
        "UPI AutoPay, NACH eMandate, and Card Standing Instruction rail classification",
        "Weekly, monthly, quarterly, and annual cadence detection with High, Medium, and Possible confidence scoring",
        "Automatic filtering of failed payments, refunds, reversals, and ₹1–₹5 mandate holds",
        "Official cancellation steps for Google Pay, PhonePe, Paytm, BHIM, NACH, and RBI SI Hub",
      ],
      offers: {
        "@type": "Offer",
        price: "69",
        priceCurrency: "INR",
        description:
          "12 never-expiring statement scan credits (single payment; zero credit used if zero subscriptions found)",
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

      <main id="main-content">
        <section className="hero-section">
          <div className="wrap">
            <div className="hero">
              <div className="hero-copy">
                <h1 className="hero-heading heading-1">
                  See what&rsquo;s quietly leaving
                  <br />
                  your account every month
                </h1>
                <p className="hero-lede body-3">
                  Scan your bank statement inside browser memory to uncover
                  forgotten subscriptions, UPI AutoPay mandates, NACH debits,
                  and recurring card charges — and take control of your money.
                </p>
                <div className="cta-row">
                  <TrackedLink
                    className="btn btn-primary button-md"
                    href="/scanner"
                    trackLocation="hero"
                    trackLabel="Scan my statement for ₹69"
                  >
                    <span>Scan my statement for {PACK_PRICE_LABEL}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </TrackedLink>
                  <a className="btn btn-ghost button-md" href="#demo">
                    Try interactive sample
                  </a>
                </div>
                <div className="trust-note caption-1">
                  <LockSimple size={16} weight="bold" aria-hidden="true" />
                  <span>
                    CSV and PDF parsing stays in your browser. Raw statements
                    never upload to any server.
                  </span>
                </div>
              </div>

              <div className="surface-card hero-card">
                <div className="statline">
                  <div className="caption-4 hero-card-kicker">
                    Sample statement breakdown
                  </div>
                  <div className="figure heading-3">
                    ₹3,896
                    <small className="caption-2">
                      synthetic sample monthly recurring total
                    </small>
                  </div>
                </div>
                <div className="preview-rows">
                  {SAMPLE_CHARGES.map((item) => (
                    <div className="preview-row" key={item.name}>
                      <span className="row-name body-5">
                        <span>{item.name}</span>
                        {item.note && (
                          <span className="meta-inline caption-4">
                            · {item.note}
                          </span>
                        )}
                      </span>
                      <span className="row-amount body-4">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="landing-section">
          <div className="wrap">
            <RevealSection>
              <div className="guides-section-head">
                <div className="section-header">
                  <p className="eyebrow caption-3">How it works</p>
                  <h2 className="heading-3">
                    Built for Indian bank statements, UPI AutoPay, and NACH
                    debits
                  </h2>
                  <p className="lede body-3">
                    Checking one UPI app misses credit card standing
                    instructions and bank account NACH mandates. Auditing your
                    statement lines brings every recurring debit into one place.
                  </p>
                </div>
                <Link href="/how-it-works" className="text-link title-4">
                  Full technical &amp; privacy architecture
                </Link>
              </div>

              <div className="steps-grid">
                <div className="surface-card step-card">
                  <div className="step-num caption-3">
                    01 · Account and pack
                  </div>
                  <h3 className="title-2">Create an account and pay once</h3>
                  <p className="body-6">
                    {PACK_PRICE_LABEL} unlocks {PACK_SIZE} scan credits that
                    never expire. Audit savings accounts and credit cards across
                    months without adding another subscription.
                  </p>
                </div>

                <div className="surface-card step-card">
                  <div className="step-num caption-3">02 · Local parse</div>
                  <h3 className="title-2">Drop in your CSV or PDF</h3>
                  <p className="body-6">
                    CSV exports and encrypted bank PDFs are parsed directly in
                    browser memory to surface hidden recurring debits without
                    transmitting raw rows.
                  </p>
                </div>

                <div className="surface-card step-card">
                  <div className="step-num caption-3">
                    03 · Review and cancel
                  </div>
                  <h3 className="title-2">Inspect rails and revoke steps</h3>
                  <p className="body-6">
                    Results label{" "}
                    <Link href="/guides/find-upi-autopay-mandates">
                      UPI AutoPay mandates
                    </Link>
                    ,{" "}
                    <Link href="/guides/identify-nach-emandate">
                      NACH transactions
                    </Link>
                    , and{" "}
                    <Link href="/guides/recurring-card-payments">
                      card standing instructions
                    </Link>{" "}
                    with confidence scores and cancel links.
                  </p>
                </div>
              </div>

              <div className="formats-grid">
                <div className="surface-card formats-card">
                  <h3 className="title-2">
                    Supported file formats and billing cycles
                  </h3>
                  <p className="body-6">
                    Reads delimited CSV exports (comma, semicolon, tab, or pipe
                    up to 10 MB and 100,000 rows) plus digital and password
                    protected PDF statements (up to 10 MB) from major Indian
                    banks and credit cards. Detects weekly, monthly, quarterly,
                    and annual cycles while filtering reversals, refunds, and ₹1
                    to ₹5 setup holds. See our{" "}
                    <Link href="/guides/hdfc-sbi-icici-automatic-payments">
                      HDFC, SBI &amp; ICICI export guide
                    </Link>{" "}
                    or{" "}
                    <Link href="/compare">approach comparison</Link>.
                  </p>
                </div>
                <div className="surface-card formats-card">
                  <h3 className="title-2">Important detection limitations</h3>
                  <p className="body-6">
                    Image only scanned PDFs without selectable text are not
                    supported; export a CSV or digital PDF instead. Matching
                    relies on date intervals and amounts across two or more
                    cycles (scoring items as High, Medium, or Possible), so
                    export 3 to 12 months and confirm each merchant before
                    following{" "}
                    <Link href="/guides/cancel-upi-autopay">
                      UPI AutoPay cancellation steps
                    </Link>{" "}
                    or{" "}
                    <Link href="/guides/find-hidden-subscriptions">
                      hidden subscription audit checks
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="home-diagram-wrap">
                <LocalPrivacyBoundaryDiagram />
              </div>

              <div className="surface-card home-examples-card">
                <h3 className="title-2">
                  Representative Indian statement lines vs. detected output
                </h3>
                <p className="body-6">
                  Indian banks wrap recurring charges inside changing 12-digit
                  UPI RRNs, IFSC codes, and gateway descriptors. Here is how
                  Subscription X-Ray normalizes representative lines locally:
                </p>
                <div className="guide-table-wrap">
                  <table className="guide-table">
                    <thead>
                      <tr>
                        <th>Representative statement text</th>
                        <th>Detected merchant</th>
                        <th>Rail &amp; action guidance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <code>UPI-AUTOPAY-403699182745-NETFLIX@OKAXIS</code>
                        </td>
                        <td>Netflix · ₹649/mo</td>
                        <td>
                          <code>UPI AutoPay</code> · Cancel plan + revoke in UPI app
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <code>NACH-DR-CULTFIT INDIA-SBIN0001234</code>
                        </td>
                        <td>Cult.fit · ₹999/mo</td>
                        <td>
                          <code>NACH / eMandate</code> · Stop via bank UMRN &amp; merchant
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <code>SI AMAZON PRIME MUMBAI IN</code>
                        </td>
                        <td>Amazon Prime · ₹1,499/yr</td>
                        <td>
                          <code>Card SI</code> · Turn off renewal + check bank SI Hub
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <code>UPI MANDATE CREATION NETFLIX@OKAXIS · ₹2</code>
                        </td>
                        <td>Filtered out automatically</td>
                        <td>Excluded as ≤ ₹5 mandate setup ping</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="home-official-refs">
                  For official mandate governance and escalation channels in India,
                  refer to{" "}
                  <a
                    href="https://www.npci.org.in/product/myupi.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    NPCI MyUPI
                  </a>
                  ,{" "}
                  <a
                    href="https://upihelp.npci.org.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    NPCI UPI Help
                  </a>
                  , and the{" "}
                  <a
                    href="https://cms.rbi.org.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    RBI Complaint Management System (CMS)
                  </a>
                  .
                </p>
              </div>
            </RevealSection>
          </div>
        </section>

        <section className="tagline-section" aria-label="Core value statement">
          <div className="wrap">
            <TaglineReveal
              eyebrow="Built for privacy"
              lines={[
                "See every active AutoPay mandate",
                "without handing over your bank login.",
              ]}
            />
          </div>
        </section>

        <section id="demo" className="landing-section">
          <div className="wrap">
            <RevealSection>
              <div className="section-header">
                <p className="eyebrow caption-3">Interactive preview</p>
                <h2 className="heading-3">
                  Test recurring payment detection on synthetic Indian
                  statements
                </h2>
              </div>
              <InteractiveDemo />
            </RevealSection>
          </div>
        </section>

        <section id="pricing" className="landing-section">
          <div className="wrap">
            <RevealSection>
              <div className="pricing-grid">
                <div className="pricing-copy">
                  <p className="eyebrow caption-3">Pricing</p>
                  <h2 className="heading-3">One payment. Twelve scans.</h2>
                  <p className="lede body-3">
                    No subscription and nothing recurring on our side. Pay{" "}
                    {PACK_PRICE_LABEL} once to add {PACK_SIZE} scan credits that
                    never expire. Finding forgotten subscriptions should never
                    create another monthly bill.
                  </p>
                </div>

                <div className="surface-card surface-warm plan-card">
                  <div className="title-4 plan-title">12 scan pack</div>
                  <div className="price heading-3">
                    {PACK_PRICE_LABEL}
                    <span className="body-6"> single payment</span>
                  </div>
                  <ul>
                    <li className="body-6">
                      <Check
                        size={16}
                        weight="bold"
                        className="plan-check"
                        aria-hidden="true"
                      />
                      <span>
                        {PACK_SIZE} statement scans usable anytime with no
                        expiry
                      </span>
                    </li>
                    <li className="body-6">
                      <Check
                        size={16}
                        weight="bold"
                        className="plan-check"
                        aria-hidden="true"
                      />
                      <span>
                        Supports Indian bank CSVs, digital PDFs, and encrypted
                        PDFs
                      </span>
                    </li>
                    <li className="body-6">
                      <Check
                        size={16}
                        weight="bold"
                        className="plan-check"
                        aria-hidden="true"
                      />
                      <span>
                        Confidence ratings, UPI AutoPay / NACH / Card SI labels,
                        and revoke steps
                      </span>
                    </li>
                    <li className="body-6">
                      <Check
                        size={16}
                        weight="bold"
                        className="plan-check"
                        aria-hidden="true"
                      />
                      <span>
                        CSV and PDF files parse strictly in browser memory with
                        raw rows never uploaded
                      </span>
                    </li>
                    <li className="body-6">
                      <Check
                        size={16}
                        weight="bold"
                        className="plan-check"
                        aria-hidden="true"
                      />
                      <span>
                        Zero recurring charges found? No scan credit is deducted
                      </span>
                    </li>
                  </ul>
                  <TrackedLink
                    className="btn btn-primary button-md full"
                    href="/scanner"
                    trackLocation="pricing_card"
                    trackLabel="Scan my statement for ₹69"
                  >
                    <span>Scan my statement for {PACK_PRICE_LABEL}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </TrackedLink>
                  <p className="small-note caption-2">
                    Each Cashfree verified pack adds {PACK_SIZE} non expiring
                    scans to your account.
                  </p>
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

        <section id="forgotten-subscriptions" className="landing-section">
          <div className="wrap">
            <RevealSection>
              <div className="surface-card surface-warm discovery-banner">
                <div className="discovery-banner-copy">
                  <p className="eyebrow caption-3">
                    Forgotten subscription finder
                  </p>
                  <h2 className="heading-3">
                    Still Paying for Something You Forgot?
                  </h2>
                  <p className="body-3">
                    Old subscriptions, forgotten free trials and automatic
                    payments can quietly drain your bank account. Find recurring
                    charges before they cost you another month.
                  </p>
                </div>
                <div className="discovery-banner-actions">
                  <TrackedLink
                    className="btn btn-primary button-md"
                    href="/scanner"
                    trackLocation="discovery_banner"
                    trackLabel="Find My Forgotten Subscriptions"
                  >
                    <span>Find My Forgotten Subscriptions</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </TrackedLink>
                  <Link className="btn btn-ghost button-md" href="/help">
                    Open Cancellation Help Center
                  </Link>
                </div>
              </div>

              <div className="education-grid">
                <article className="surface-card education-card">
                  <h3 className="title-2">Forgotten subscriptions explained</h3>
                  <p className="body-6">
                    Small OTT plans, cloud storage upgrades, and annual trials
                    often renew across separate UPI apps, cards, and app stores.
                    See{" "}
                    <Link href="/guides/find-forgotten-subscriptions">
                      how to find forgotten subscriptions
                    </Link>{" "}
                    and{" "}
                    <Link href="/guides/stop-forgotten-free-trials">
                      stop forgotten free trials
                    </Link>
                    .
                  </p>
                </article>

                <article className="surface-card education-card">
                  <h3 className="title-2">
                    How to identify recurring bank debits
                  </h3>
                  <p className="body-6">
                    Statement lines often show payment gateways or parent legal
                    entities rather than app names. Learn{" "}
                    <Link href="/guides/identify-unknown-bank-debits">
                      how to identify unknown bank debits
                    </Link>{" "}
                    and audit 6–13 months via{" "}
                    <Link href="/guides/find-hidden-subscriptions-bank-statement">
                      hidden bank statement subscriptions
                    </Link>
                    .
                  </p>
                </article>

                <article className="surface-card education-card">
                  <h3 className="title-2">
                    How to cancel unwanted automatic payments
                  </h3>
                  <p className="body-6">
                    Deleting an app never cancels billing. End your plan with
                    the merchant or{" "}
                    <Link href="/guides/cancel-google-play-subscription">
                      Google Play
                    </Link>{" "}
                    /{" "}
                    <Link href="/guides/cancel-apple-subscription">
                      Apple Account
                    </Link>
                    , then verify the underlying mandate in{" "}
                    <Link href="/help">the Help Center</Link>.
                  </p>
                </article>

                <article className="surface-card education-card">
                  <h3 className="title-2">
                    Credit card recurring payments, UPI AutoPay &amp; NACH
                  </h3>
                  <p className="body-6">
                    Each rail has a different stop path: revoke{" "}
                    <Link href="/guides/cancel-upi-autopay">UPI AutoPay</Link>{" "}
                    inside your UPI app, withdraw{" "}
                    <Link href="/guides/cancel-credit-card-subscriptions">
                      credit card mandates
                    </Link>{" "}
                    in SI Hub, or cancel{" "}
                    <Link href="/guides/cancel-nach-mandate">
                      NACH eMandates
                    </Link>{" "}
                    with your bank.
                  </p>
                </article>
              </div>
            </RevealSection>
          </div>
        </section>

        <section id="guides" className="landing-section">
          <div className="wrap">
            <RevealSection>
              <div className="guides-section-head">
                <div>
                  <p className="eyebrow caption-3">Help center &amp; guides</p>
                  <h2 className="heading-3">
                    Decode and cancel automatic payments safely
                  </h2>
                </div>
                <div className="guides-head-links">
                  <Link href="/help" className="text-link title-4">
                    Search Help Center
                  </Link>
                  <Link href="/guides" className="text-link title-4">
                    View all {GUIDES.length} guides
                  </Link>
                </div>
              </div>
              <div className="guides-grid">
                {FEATURED_GUIDES.map((guide) => (
                  <article className="surface-card guide-card" key={guide.slug}>
                    <div className="guide-card-meta caption-4">
                      <span>{guide.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{guide.readTime}</span>
                    </div>
                    <h3 className="title-2">
                      <Link href={guide.href}>{guide.title}</Link>
                    </h3>
                    <p className="body-6">{guide.summary}</p>
                    <Link href={guide.href} className="guide-card-link title-4">
                      <span>Read guide</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </article>
                ))}
              </div>
            </RevealSection>
          </div>
        </section>

        <section id="faq" className="landing-section">
          <div className="wrap">
            <RevealSection>
              <div className="guides-section-head">
                <div className="section-header">
                  <p className="eyebrow caption-3">FAQ</p>
                  <h2 className="heading-3">Common questions</h2>
                </div>
                <Link href="/faq" className="text-link title-4">
                  Open full FAQ &amp; answer hub
                </Link>
              </div>
              <div className="faq-list">
                {FAQ_ITEMS.map((item) => (
                  <div className="surface-card faq-card" key={item.q}>
                    <h3 className="title-3">{item.q}</h3>
                    <p className="body-6">{item.a}</p>
                  </div>
                ))}
              </div>
              <p className="home-safety-footnote caption-2">
                Subscription X-Ray identifies recurring payment patterns from
                your uploaded statement. It does not access your bank account,
                cancel subscriptions, revoke mandates or reverse payments.
              </p>
            </RevealSection>
          </div>
        </section>

        <section className="landing-section">
          <div className="wrap">
            <RevealSection>
              <div className="surface-card surface-warm final-cta-card">
                <div className="final-cta-copy">
                  <p className="eyebrow caption-3">Ready to check</p>
                  <h2 className="heading-4">
                    Audit your statements privately in minutes
                  </h2>
                  <p className="body-6">
                    Pay {PACK_PRICE_LABEL} once for {PACK_SIZE} scans. Valid
                    statements with zero recurring charges never spend a credit.
                  </p>
                </div>
                <div className="final-cta-actions">
                  <TrackedLink
                    className="btn btn-primary button-md"
                    href="/scanner"
                    trackLocation="final_cta"
                    trackLabel="Scan my statement for ₹69"
                  >
                    <span>Scan my statement for {PACK_PRICE_LABEL}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </TrackedLink>
                </div>
              </div>
            </RevealSection>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
