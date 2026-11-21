import type { Metadata } from "next";
import Link from "next/link";
import { CaretRight, EnvelopeSimple } from "@phosphor-icons/react/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  CANONICAL_SITE_URL,
  PACK_PRICE_LABEL,
  PACK_SIZE,
  SUPPORT_EMAIL,
} from "@/lib/config";

const CONTACT_TITLE = "Contact & Support — Subscription X-Ray";
const CONTACT_DESCRIPTION =
  "Contact Subscription X-Ray support for Cashfree ₹69 payment verification, scan credit queries, refund requests, or account deletion assistance.";

export const metadata: Metadata = {
  title: CONTACT_TITLE,
  description: CONTACT_DESCRIPTION,
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: CONTACT_TITLE,
    siteName: "Subscription X-Ray",
    description: CONTACT_DESCRIPTION,
    type: "website",
    url: "/contact",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Contact & Support — Subscription X-Ray",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
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
          name: "Contact",
          item: `${CANONICAL_SITE_URL}/contact`,
        },
      ],
    },
    {
      "@type": "ContactPage",
      name: CONTACT_TITLE,
      description: CONTACT_DESCRIPTION,
      url: `${CANONICAL_SITE_URL}/contact`,
      inLanguage: "en-IN",
      mainEntity: {
        "@id": `${CANONICAL_SITE_URL}/#organization`,
      },
    },
  ],
};

export default function ContactPage() {
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
            <span aria-current="page">Contact</span>
          </nav>

          <article className="surface-card guide-article">
            <header className="guide-header">
              <div className="guide-kicker">
                <span>Support</span>
                <span aria-hidden="true">·</span>
                <span>Payments &amp; account help</span>
              </div>
              <h1>Contact Subscription X-Ray</h1>
              <p className="guide-summary">
                Need help with a {PACK_PRICE_LABEL} scan-pack payment, credit
                balance, CSV/PDF formatting question, or account deletion? Reach
                us directly by email using the details below.
              </p>
            </header>

            <div className="guide-prose">
              <div className="contact-grid">
                <section className="contact-card">
                  <h2>Email support</h2>
                  <p>
                    Send support requests from the email address registered on
                    your Subscription X-Ray account.
                  </p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}?subject=Subscription%20X-Ray%20Support`}
                    className="contact-email-link"
                  >
                    <EnvelopeSimple size={16} aria-hidden="true" />
                    <span>{SUPPORT_EMAIL}</span>
                  </a>
                </section>

                <section className="contact-card">
                  <h2>Self-service account actions</h2>
                  <p>
                    Signed-in users can delete saved scan records or permanently
                    delete their entire account anytime directly inside{" "}
                    <Link href="/scanner">the scanner dashboard</Link>.
                  </p>
                  <Link href="/scanner" className="text-link">
                    Open statement scanner
                  </Link>
                </section>
              </div>

              <h2>What to include for payment or credit queries</h2>
              <p>
                If you completed a {PACK_PRICE_LABEL} one-time purchase for{" "}
                {PACK_SIZE} scan credits and credits have not appeared after
                refreshing <Link href="/scanner">/scanner</Link>, please include:
              </p>
              <ul>
                <li>
                  Your registered account email address on Subscription X-Ray
                </li>
                <li>
                  Your Cashfree order ID or payment reference from the checkout
                  receipt or UPI app confirmation
                </li>
                <li>
                  Approximate date and time of the transaction (and whether a
                  duplicate debit occurred)
                </li>
              </ul>

              <h2>Bank statement parsing issues</h2>
              <p>
                Please do <strong>not</strong> attach your full unredacted bank
                statement PDF or CSV or share your PDF password by email. If a
                particular bank&apos;s export headers failed to parse, tell us
                the bank name, file type (CSV or digital PDF), and the exact
                error text shown in the browser. Before writing, you can also
                check our{" "}
                <Link href="/guides/read-bank-statements">
                  guide to reading Indian bank statements
                </Link>{" "}
                for export tips.
              </p>

              <h2>Policies &amp; product documentation</h2>
              <p>
                You can review our full policies and technical background before
                reaching out:
              </p>
              <ul>
                <li>
                  <Link href="/refund">Refund Policy</Link> — eligibility for
                  failed credit delivery and duplicate Cashfree charges
                </li>
                <li>
                  <Link href="/privacy">Privacy Policy</Link> — what stays in
                  browser memory versus what is stored in Supabase
                </li>
                <li>
                  <Link href="/terms">Terms of Service</Link> — scan credit
                  rules and result disclaimers
                </li>
                <li>
                  <Link href="/about">About Subscription X-Ray</Link> — product
                  architecture and known limitations
                </li>
              </ul>
            </div>
          </article>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
