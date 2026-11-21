import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, LockSimple } from "@phosphor-icons/react/ssr";
import AuthCallbackHandler from "@/components/AuthCallbackHandler";
import InteractiveDemo from "@/components/InteractiveDemo";
import { RevealSection, TaglineReveal } from "@/components/MotionPrimitives";
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
                    </Link>
                    .
                  </p>
                </div>
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

        <section id="guides" className="landing-section">
          <div className="wrap">
            <RevealSection>
              <div className="guides-section-head">
                <div>
                  <p className="eyebrow caption-3">Statement guides</p>
                  <h2 className="heading-3">
                    Decode automatic bank payments before you cancel
                  </h2>
                </div>
                <Link href="/guides" className="text-link title-4">
                  View all {GUIDES.length} guides
                </Link>
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
