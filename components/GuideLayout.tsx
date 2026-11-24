import Link from "next/link";
import { ArrowRight, CaretRight } from "@phosphor-icons/react/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TrackedLink from "@/components/TrackedLink";
import { CANONICAL_SITE_URL, PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";
import { getRelatedGuides, type GuideMeta } from "@/lib/guides";

const GUIDE_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatGuideDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return isoDate;
  const [, year, monthStr, dayStr] = match;
  const monthIndex = Number(monthStr) - 1;
  const monthLabel = GUIDE_MONTHS[monthIndex];
  if (!monthLabel) return isoDate;
  return `${Number(dayStr)} ${monthLabel} ${year}`;
}

export type GuideFaqItem = {
  q: string;
  a: string;
};

export default function GuideLayout({
  guide,
  faqItems,
  children,
}: {
  guide: GuideMeta;
  faqItems?: GuideFaqItem[];
  children: React.ReactNode;
}) {
  const related = getRelatedGuides(guide.slug);
  const canonicalUrl = `${CANONICAL_SITE_URL}${guide.href}`;
  const formattedUpdatedDate = formatGuideDate(guide.updatedAt);

  const graph: Record<string, unknown>[] = [
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
        {
          "@type": "ListItem",
          position: 3,
          name: guide.shortTitle,
          item: canonicalUrl,
        },
      ],
    },
    {
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
      url: canonicalUrl,
      image: `${CANONICAL_SITE_URL}/opengraph-image.png`,
      datePublished: guide.publishedAt,
      dateModified: guide.updatedAt,
      inLanguage: "en-IN",
      author: {
        "@type": "Organization",
        name: "Subscription X-Ray",
        url: CANONICAL_SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "Subscription X-Ray",
        url: CANONICAL_SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${CANONICAL_SITE_URL}/icon-96x96.png`,
        },
      },
    },
  ];

  if (faqItems && faqItems.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    });
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteHeader mode="content" />

      <main id="main-content" className="guide-page">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <CaretRight size={14} aria-hidden="true" />
            <Link href="/help">Help Center</Link>
            <CaretRight size={14} aria-hidden="true" />
            <Link href="/guides">Guides</Link>
            <CaretRight size={14} aria-hidden="true" />
            <span aria-current="page">{guide.shortTitle}</span>
          </nav>

          <article className="surface-card guide-article">
            <header className="guide-header">
              <div className="guide-kicker">
                <span>{guide.category}</span>
                <span aria-hidden="true">·</span>
                <span>{guide.readTime}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={guide.updatedAt}>
                  Updated {formattedUpdatedDate}
                </time>
              </div>
              <h1 className="heading-3">{guide.title}</h1>
              <p className="guide-summary body-3">{guide.summary}</p>
            </header>

            <div className="guide-prose">{children}</div>

            <div className="guide-disclaimer-box">
              <p className="body-6">
                <strong>Trust &amp; safety reminder:</strong> Subscription X-Ray
                identifies recurring payment patterns from your uploaded
                statement. It does not access your bank account, cancel
                subscriptions, revoke mandates or reverse payments. Cancellation
                steps vary by bank, payment app, merchant, and account type—never
                share your UPI PIN, OTP, card PIN, or banking password, and
                confirm cancellation directly with your bank or merchant.
              </p>
            </div>

            <aside className="guide-cta-box" aria-label="Scanner tool">
              <div className="guide-cta-copy">
                <h2 className="title-2">
                  Check your own statement in browser memory
                </h2>
                <p className="body-6">
                  Upload an Indian bank or card CSV or digital PDF (including
                  password protected PDFs). Parsing stays strictly in your
                  browser and raw files are never uploaded. {PACK_PRICE_LABEL}{" "}
                  one time unlocks {PACK_SIZE} non expiring scans, and zero
                  subscription scans never use a credit.
                </p>
              </div>
              <div className="guide-cta-actions">
                <TrackedLink
                  className="btn btn-primary button-md"
                  href="/scanner"
                  trackLocation={`guide_${guide.slug}`}
                  trackLabel="Scan my statement for ₹69"
                >
                  <span>Scan my statement for {PACK_PRICE_LABEL}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </TrackedLink>
                <Link className="btn btn-ghost button-md" href="/help">
                  Search Help Center
                </Link>
              </div>
            </aside>
          </article>

          <section
            className="related-guides-section"
            aria-labelledby="related-guides-heading"
          >
            <div className="related-guides-head">
              <h2 id="related-guides-heading" className="heading-6">
                Related statement guides
              </h2>
              <div className="related-guides-links">
                <Link href="/help" className="text-link title-4">
                  Help Center
                </Link>
                <span aria-hidden="true" className="muted-sep">
                  ·
                </span>
                <Link href="/guides" className="text-link title-4">
                  Browse all guides
                </Link>
              </div>
            </div>
            <div className="guides-grid">
              {related.map((item) => (
                <article className="surface-card guide-card" key={item.slug}>
                  <div className="guide-card-meta caption-4">
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.readTime}</span>
                  </div>
                  <h3 className="title-2">
                    <Link href={item.href}>{item.title}</Link>
                  </h3>
                  <p className="body-6">{item.summary}</p>
                  <Link href={item.href} className="guide-card-link title-4">
                    <span>Read guide</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
