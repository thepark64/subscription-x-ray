import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CaretRight } from "@phosphor-icons/react/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HelpCenterClient from "@/components/HelpCenterClient";
import { CANONICAL_SITE_URL, PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";
import { GUIDES, HELP_CENTER_CATEGORIES } from "@/lib/guides";

const HELP_TITLE = "Forgotten Subscription Help Center | Subscription X-Ray";
const HELP_DESCRIPTION =
  "Discover forgotten subscriptions, understand recurring bank debits, and learn how to cancel unwanted UPI AutoPay, NACH, and card payments.";

export const metadata: Metadata = {
  title: HELP_TITLE,
  description: HELP_DESCRIPTION,
  alternates: {
    canonical: "/help",
  },
  openGraph: {
    title: HELP_TITLE,
    siteName: "Subscription X-Ray",
    description: HELP_DESCRIPTION,
    type: "website",
    url: "/help",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: HELP_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HELP_TITLE,
    description: HELP_DESCRIPTION,
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
          name: "Help Center",
          item: `${CANONICAL_SITE_URL}/help`,
        },
      ],
    },
    {
      "@type": "CollectionPage",
      name: "Forgotten Subscription Finder & Cancellation Help Center",
      description: HELP_DESCRIPTION,
      url: `${CANONICAL_SITE_URL}/help`,
      inLanguage: "en-IN",
      about: HELP_CENTER_CATEGORIES,
    },
  ],
};

export default function HelpCenterPage() {
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
            <span aria-current="page">Help Center</span>
          </nav>

          <div className="guides-hero help-hero">
            <p className="eyebrow caption-3">Forgotten subscription help center</p>
            <h1 className="heading-3">
              Forgotten a Subscription? Find It and Stop Unwanted Charges.
            </h1>
            <p className="lede body-3">
              Discover forgotten subscriptions, understand recurring bank debits
              and learn how to cancel unwanted automatic payments.
            </p>
          </div>

          <HelpCenterClient guides={GUIDES} />

          <aside className="guide-cta-box guides-index-cta">
            <div className="guide-cta-copy">
              <h2 className="title-2">
                Want to find every recurring debit on your statement first?
              </h2>
              <p className="body-6">
                Scan your bank or card CSV/PDF locally inside your browser
                without uploading raw statement rows. {PACK_PRICE_LABEL} once
                grants {PACK_SIZE} non-expiring scans, and valid statements with
                zero recurring charges spend zero credits.
              </p>
            </div>
            <div className="guide-cta-actions">
              <Link className="btn btn-primary button-md" href="/scanner">
                <span>Find My Forgotten Subscriptions</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link className="btn btn-ghost button-md" href="/faq">
                Read product FAQ
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
