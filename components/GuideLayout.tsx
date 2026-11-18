import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CANONICAL_SITE_URL, PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";
import { getRelatedGuides, type GuideMeta } from "@/lib/guides";

export default function GuideLayout({
  guide,
  children,
}: {
  guide: GuideMeta;
  children: React.ReactNode;
}) {
  const related = getRelatedGuides(guide.slug);
  const canonicalUrl = `${CANONICAL_SITE_URL}${guide.href}`;

  const structuredData = {
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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteHeader mode="content" />

      <main className="guide-page">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/guides">Guides</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">{guide.shortTitle}</span>
          </nav>

          <article className="glass-panel guide-article">
            <header className="guide-header">
              <div className="guide-kicker">
                <span>{guide.category}</span>
                <span aria-hidden="true">·</span>
                <span>{guide.readTime}</span>
                <span aria-hidden="true">·</span>
                <span>Updated 18 Nov 2026</span>
              </div>
              <h1>{guide.title}</h1>
              <p className="guide-summary">{guide.summary}</p>
            </header>

            <div className="guide-prose">{children}</div>

            <aside className="guide-cta-box" aria-label="Scanner tool">
              <div className="guide-cta-copy">
                <h2>Check your own statement in browser memory</h2>
                <p>
                  Upload an Indian bank or card CSV or digital PDF (including
                  password-protected PDFs). Parsing stays strictly in your
                  browser — nothing raw is uploaded. {PACK_PRICE_LABEL} one-time
                  unlocks {PACK_SIZE} non-expiring scans, and zero-subscription
                  scans never use a credit.
                </p>
              </div>
              <div className="guide-cta-actions">
                <Link className="btn btn-primary" href="/scanner">
                  <span>Open scanner — {PACK_PRICE_LABEL}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link className="btn btn-ghost" href="/#demo">
                  Try interactive sample
                </Link>
              </div>
            </aside>
          </article>

          <section
            className="related-guides-section"
            aria-labelledby="related-guides-heading"
          >
            <div className="related-guides-head">
              <h2 id="related-guides-heading">Related statement guides</h2>
              <Link href="/guides" className="text-link">
                Browse all guides
              </Link>
            </div>
            <div className="guides-grid">
              {related.map((item) => (
                <article className="glass-panel guide-card" key={item.slug}>
                  <div className="guide-card-meta">
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.readTime}</span>
                  </div>
                  <h3>
                    <Link href={item.href}>{item.title}</Link>
                  </h3>
                  <p>{item.summary}</p>
                  <Link href={item.href} className="guide-card-link">
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
