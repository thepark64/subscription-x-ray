import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CaretRight } from "@phosphor-icons/react/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TrackedLink from "@/components/TrackedLink";
import { CANONICAL_SITE_URL, PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";

const TITLE = "Subscription Tracking & AutoPay FAQ — Subscription X-Ray";
const DESCRIPTION =
  "Clear answers on finding hidden subscriptions, spotting UPI AutoPay and NACH debits, browser-only statement privacy, and our ₹69 12-scan pack.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: TITLE,
    siteName: "Subscription X-Ray",
    description: DESCRIPTION,
    type: "website",
    url: "/faq",
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

type FaqItem = {
  question: string;
  answer: string;
  linkHref?: string;
  linkLabel?: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How can I find recurring subscriptions in my bank statement?",
    answer:
      "Export 3 to 12 months of bank or card statements in CSV or digital PDF format, ignore refunds and reversals, and group similar merchant narrations by repeating weekly, monthly, quarterly, or annual intervals. Subscription X-Ray automates this normalization and interval clustering inside your browser so even small debits with changing UPI RRNs surface in one checklist.",
    linkHref: "/guides/find-hidden-subscriptions",
    linkLabel: "Read how to find hidden subscriptions",
  },
  {
    question: "How do I identify hidden recurring payments across multiple apps?",
    answer:
      "Auditing raw bank and credit card statements is the most complete method because every settled rupee leaves a statement line regardless of which UPI app, card network, or app store triggered it. Checking only Google Pay or PhonePe misses bank NACH e-Mandates and credit card Standing Instructions billed elsewhere.",
    linkHref: "/compare",
    linkLabel: "Compare UPI apps vs statement scanning",
  },
  {
    question: "How do I find automatic payments in India across UPI, NACH, and cards?",
    answer:
      "Automatic payments in India run over three main rails: UPI AutoPay mandates managed inside UPI apps, bank account NACH / ACH e-Mandates tied to a UMRN reference, and RBI-regulated card Standing Instructions visible on your card issuer's SI Hub portal. Scanning your bank and card statements together labels all three rails side by side.",
    linkHref: "/guides/read-bank-statements",
    linkLabel: "Learn bank narration abbreviations",
  },
  {
    question: "How do I detect UPI AutoPay transactions on an Indian statement?",
    answer:
      "Look for narration fragments such as UPI-AUTOPAY, MANDATE, or RECURRING alongside repeated identical or capped monthly debits, while filtering ₹1–₹5 initial mandate setup pings. Where banks omit AutoPay flags in plain UPI lines, matching 26–35 day debit intervals reveals the recurring charge.",
    linkHref: "/guides/find-upi-autopay-mandates",
    linkLabel: "Read the UPI AutoPay mandate guide",
  },
  {
    question: "How do I identify recurring debit or credit card charges?",
    answer:
      "Recurring card bills typically show SI, STANDING INST, AUTOPAY, or consistent merchant descriptors billed on a fixed monthly or annual date—sometimes with slight INR variance for USD SaaS due to forex markups. You can inspect active card mandates in your bank's RBI SI Hub portal and scan exported card statements for missed aggregator charges.",
    linkHref: "/guides/debit-card-recurring-payments",
    linkLabel: "Read the debit card recurring guide",
  },
  {
    question: "How can I find forgotten subscriptions without sharing my banking password?",
    answer:
      "Download your CSV or digital PDF statement directly from NetBanking on your own device and analyze it with a browser-local tool that parses files in client memory. Subscription X-Ray never asks for NetBanking credentials or Account Aggregator access, and raw statement files and PDF unlock passwords never leave your browser.",
    linkHref: "/how-it-works",
    linkLabel: "Inspect our browser-local architecture",
  },
  {
    question: "Is it safe to upload a bank statement online?",
    answer:
      "Privacy depends entirely on whether a service uploads your raw statement ledger to external servers or parses the file strictly in browser memory. In Subscription X-Ray, CSV parsing and password-protected PDF decoding happen locally inside browser memory; only your account metadata, Cashfree purchase status, and detected recurring item summaries are stored in Supabase.",
    linkHref: "/guides/bank-statement-privacy-security",
    linkLabel: "Read statement privacy best practices",
  },
  {
    question: "How do I calculate my monthly subscription spending accurately?",
    answer:
      "Convert every recurring billing cycle into a monthly equivalent by dividing quarterly charges by 3, dividing annual renewals by 12, and multiplying weekly debits by 52/12 (4.33), then adding standard monthly charges. Normalizing cycles prevents annual domain, Prime, or SaaS renewals from distorting your true monthly run-rate.",
    linkHref: "/guides/calculate-monthly-subscription-spending",
    linkLabel: "See the monthly calculation breakdown",
  },
  {
    question: "Can Subscription X-Ray automatically cancel UPI AutoPay or card subscriptions?",
    answer:
      "No. Because Subscription X-Ray never connects to your bank login or UPI provider, it cannot pause or revoke mandates automatically. Once a scan finishes, you receive direct merchant billing links and verified cancellation steps for Google Pay, PhonePe, Paytm, BHIM, NACH, and bank card SI Hub portals.",
    linkHref: "/guides/cancel-upi-autopay",
    linkLabel: "Follow official UPI AutoPay revoke steps",
  },
  {
    question: "What does ₹69 include, and what if my statement has zero subscriptions?",
    answer:
      "A single ₹69 Cashfree payment adds 12 scan credits to your account that never expire, with zero subscription or renewal on our side. Each qualifying scan spends 1 credit, and if a valid statement shows zero recurring charges, your empty summary saves without deducting any credit.",
    linkHref: "/scanner",
    linkLabel: "Open statement scanner",
  },
];

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
          name: "FAQ",
          item: `${CANONICAL_SITE_URL}/faq`,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

export default function FaqPage() {
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
            <span aria-current="page">FAQ</span>
          </nav>

          <article className="surface-card guide-article">
            <header className="guide-header">
              <div className="guide-kicker caption-3">
                <span>Answers &amp; AEO hub</span>
                <span aria-hidden="true">·</span>
                <span>Indian bank statements &amp; AutoPay</span>
              </div>
              <h1 className="heading-3">
                Frequently asked questions about finding recurring payments
              </h1>
              <p className="guide-summary body-3">
                Direct, factual answers on spotting hidden subscriptions,
                identifying UPI AutoPay and NACH mandates, calculating monthly
                run-rates, and analyzing bank CSV and PDF statements privately.
              </p>
            </header>

            <div className="guide-faq-list">
              {FAQ_ITEMS.map((item) => (
                <section className="guide-faq-item" key={item.question}>
                  <h2 className="title-3">{item.question}</h2>
                  <p className="body-6">{item.answer}</p>
                  {item.linkHref && item.linkLabel && (
                    <p className="body-6 faq-link-row">
                      <Link href={item.linkHref} className="text-link">
                        {item.linkLabel}
                      </Link>
                    </p>
                  )}
                </section>
              ))}
            </div>

            <aside className="guide-cta-box" aria-label="Scanner tool">
              <div className="guide-cta-copy">
                <h2 className="title-2">
                  Audit your bank or card CSV and PDF locally
                </h2>
                <p className="body-6">
                  {PACK_PRICE_LABEL} once grants {PACK_SIZE} never-expiring scan
                  credits. Zero-subscription scans never cost a credit.
                </p>
              </div>
              <div className="guide-cta-actions">
                <TrackedLink
                  className="btn btn-primary button-md"
                  href="/scanner"
                  trackLocation="faq_page_cta"
                  trackLabel="Scan my statement for ₹69"
                >
                  <span>Scan my statement for {PACK_PRICE_LABEL}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </TrackedLink>
                <Link className="btn btn-ghost button-md" href="/guides">
                  Browse all guides
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
