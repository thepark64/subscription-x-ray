import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SUPPORT_EMAIL } from "@/lib/config";

const PRIVACY_TITLE = "Privacy Policy — Subscription X-Ray";
const PRIVACY_DESCRIPTION =
  "Learn how Subscription X-Ray parses CSV and PDF bank statements strictly in browser memory without ever uploading raw files or PDF passwords.";

export const metadata: Metadata = {
  title: PRIVACY_TITLE,
  description: PRIVACY_DESCRIPTION,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: PRIVACY_TITLE,
    siteName: "Subscription X-Ray",
    description: PRIVACY_DESCRIPTION,
    type: "website",
    url: "/privacy",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Subscription X-Ray — Find recurring charges and UPI AutoPay mandates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PRIVACY_TITLE,
    description: PRIVACY_DESCRIPTION,
    images: ["/twitter-image.png"],
  },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader mode="content" />
      <main id="main-content" className="legal-page">
        <div className="wrap">
          <div className="surface-card legal-sheet">
            <Link href="/" className="back">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Subscription X-Ray</span>
            </Link>
            <h1>Privacy Policy</h1>
            <p className="legal-updated">Last updated: 21 November 2026</p>

          <section>
            <h2>1. What we never upload or collect</h2>
            <p>
              Your raw bank or card CSV or PDF statement — and any password you
              enter to unlock an encrypted PDF — is processed strictly inside
              your browser memory. Raw statement bytes, full transaction
              ledgers, account balances, and PDF passwords are never uploaded to
              or stored on our servers.
            </p>
          </section>

          <section>
            <h2>2. What we store in your account</h2>
            <ul>
              <li>
                Your email address, optional display name, and authentication
                metadata (via Supabase Auth)
              </li>
              <li>
                Completed scan summaries: scan timestamp, your optional scan
                label and uploaded filename, and detected recurring items
                (merchant name, average charge amount, billing frequency,
                occurrences, monthly equivalent, and optional confidence or
                payment rail classification when supported by statement text)
              </li>
              <li>
                Payment records (amount, Cashfree order/payment ID, status, and
                timestamp) — card numbers and UPI PINs/credentials are handled
                directly by Cashfree Payments
              </li>
              <li>Your remaining scan credit balance</li>
            </ul>
          </section>

          <section>
            <h2>3. How we use stored data</h2>
            <p>
              Solely to operate Subscription X-Ray: authenticating your account,
              enforcing scan credit balances, displaying your scan history and
              6-month recurring spend trend, and verifying Cashfree payments.
            </p>
          </section>

          <section>
            <h2>4. Third-party processors</h2>
            <p>
              We use Supabase for authentication and encrypted PostgreSQL
              storage, Cashfree Payments for ₹69 pack checkout verification, and
              Vercel for hosting and privacy-friendly web analytics. We also use
              Google Tag Manager and Google Analytics 4 to measure anonymous
              product-funnel events (such as button clicks, interactive synthetic
              demo usage, sign-up completion, checkout initiation, verified pack
              purchases, and aggregate scan completion flags like file format,
              detected item count, and credit usage).
            </p>
            <p>
              Bank statement contents, transaction descriptions, merchant names,
              uploaded filenames, PDF passwords, and personal financial totals
              are never sent through these analytics events. Standard page URL
              and browser request metadata handled by each provider is governed
              by that provider&apos;s own privacy policy.
            </p>
          </section>

          <section>
            <h2>5. Data deletion</h2>
            <p>
              You can delete individual saved scans at any time, or permanently
              delete your account and associated scan history directly inside
              the scanner via Delete account or by emailing {SUPPORT_EMAIL}.
            </p>
          </section>

          <section>
            <h2>6. Updates</h2>
            <p>
              Material updates to this policy will be posted on this page with a
              revised update date.
            </p>
          </section>

            <nav className="legal-related-links" aria-label="Related pages">
              <Link href="/">Home</Link>
              <Link href="/scanner">Statement scanner</Link>
              <Link href="/guides">Guides</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/login">Sign in</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/refund">Refund Policy</Link>
            </nav>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
