import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CaretRight } from "@phosphor-icons/react/ssr";
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

      <main id="main-content" className="guide-page guide-index-page">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <CaretRight size={14} aria-hidden="true" />
            <span aria-current="page">Guides</span>
          </nav>

          <div className="guides-hero">
            <p className="eyebrow caption-3">Practical Indian banking guides</p>
            <h1 className="heading-3">
              Recurring Payments, UPI AutoPay &amp; Statement Guides
            </h1>
            <p className="lede body-3">
              Clear explanations of how UPI AutoPay, NACH eMandates, and card
              Standing Instructions appear on Indian bank statements and how to
              verify or revoke them directly with your bank or UPI app. Looking
              for quick cancellation help? Open our searchable{" "}
              <Link href="/help" className="text-link">
                Forgotten Subscription Help Center
              </Link>
              , or read our{" "}
              <Link href="/how-it-works" className="text-link">architecture</Link>,{" "}
              <Link href="/compare" className="text-link">comparison</Link>, and{" "}
              <Link href="/faq" className="text-link">FAQ</Link>.
            </p>
          </div>

          <section aria-label="Guide directory">
            <div className="guides-grid">
              {GUIDES.map((guide) => (
                <article className="surface-card guide-card" key={guide.slug}>
                  <div className="guide-card-meta caption-4">
                    <span>{guide.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{guide.readTime}</span>
                  </div>
                  <h2 className="title-2">
                    <Link href={guide.href}>{guide.title}</Link>
                  </h2>
                  <p className="body-6">{guide.summary}</p>
                  <Link href={guide.href} className="guide-card-link title-4">
                    <span>Read guide</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <aside className="guide-cta-box guides-index-cta">
            <div className="guide-cta-copy">
              <h2 className="title-2">
                Prefer scanning your CSV or PDF automatically?
              </h2>
              <p className="body-6">
                Subscription X-Ray parses CSV and PDF statements strictly inside
                your browser without uploading raw files or PDF passwords; only
                accounts, Cashfree credit purchases, and saved scan summaries use
                server storage. {PACK_PRICE_LABEL} once grants {PACK_SIZE} non
                expiring scans, and valid zero subscription statements deduct
                zero credits.
              </p>
            </div>
            <div className="guide-cta-actions">
              <Link className="btn btn-primary button-md" href="/scanner">
                <span>Scan my statement for {PACK_PRICE_LABEL}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link className="btn btn-ghost button-md" href="/how-it-works">
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
