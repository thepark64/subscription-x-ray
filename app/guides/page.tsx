import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CANONICAL_SITE_URL, PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";
import { GUIDES } from "@/lib/guides";

const GUIDES_TITLE = "Bank Statement & AutoPay Guides | Subscription X-Ray";
const GUIDES_DESCRIPTION =
  "Practical Indian banking guides on finding UPI AutoPay mandates, reading bank narrations, spotting NACH eMandates, and auditing recurring card charges.";

export const metadata: Metadata = {
  title: GUIDES_TITLE,
  description: GUIDES_DESCRIPTION,
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    title: GUIDES_TITLE,
    siteName: "Subscription X-Ray",
    description: GUIDES_DESCRIPTION,
    type: "website",
    url: "/guides",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Subscription X-Ray — Bank Statement & UPI AutoPay Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: GUIDES_TITLE,
    description: GUIDES_DESCRIPTION,
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
          name: "Guides",
          item: `${CANONICAL_SITE_URL}/guides`,
        },
      ],
    },
    {
      "@type": "CollectionPage",
      name: "Subscription X-Ray Statement & Mandate Guides",
      description: GUIDES_DESCRIPTION,
      url: `${CANONICAL_SITE_URL}/guides`,
      inLanguage: "en-IN",
    },
  ],
};

export default function GuidesIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <SiteHeader mode="content" />

      <main className="guide-page guide-index-page">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">Guides</span>
          </nav>

          <div className="guides-hero">
            <p className="eyebrow">Practical Indian banking guides</p>
            <h1>Recurring Payments, UPI AutoPay &amp; Statement Guides</h1>
            <p className="lede">
              Clear explanations of how UPI AutoPay, NACH e-Mandates, and card
              Standing Instructions show up on Indian bank statements — and how
              to verify or revoke them directly with your bank or UPI app.
            </p>
          </div>

          <section aria-label="Guide directory">
            <div className="guides-grid">
              {GUIDES.map((guide) => (
                <article className="glass-panel guide-card" key={guide.slug}>
                  <div className="guide-card-meta">
                    <span>{guide.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{guide.readTime}</span>
                  </div>
                  <h2>
                    <Link href={guide.href}>{guide.title}</Link>
                  </h2>
                  <p>{guide.summary}</p>
                  <Link href={guide.href} className="guide-card-link">
                    <span>Read guide</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <aside className="guide-cta-box" style={{ marginTop: 40 }}>
            <div className="guide-cta-copy">
              <h2>Prefer scanning your CSV or PDF automatically?</h2>
              <p>
                Subscription X-Ray parses CSV and PDF statements strictly inside
                your browser without uploading raw files or PDF passwords; only
                accounts, Cashfree credit purchases, and saved scan summaries use
                server storage. {PACK_PRICE_LABEL} one-time grants {PACK_SIZE}{" "}
                non-expiring scans, and valid zero-subscription statements
                deduct zero credits.
              </p>
            </div>
            <div className="guide-cta-actions">
              <Link className="btn btn-primary" href="/scanner">
                <span>Open scanner — {PACK_PRICE_LABEL}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link className="btn btn-ghost" href="/about">
                How it works &amp; limits
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
