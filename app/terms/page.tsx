import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/config";

const TERMS_TITLE = "Terms of Service — Subscription X-Ray";
const TERMS_DESCRIPTION =
  "Read the Subscription X-Ray Terms of Service covering browser-only CSV and PDF statement scanning, ₹69 non-expiring 12-scan packs, and Cashfree.";

export const metadata: Metadata = {
  title: TERMS_TITLE,
  description: TERMS_DESCRIPTION,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: TERMS_TITLE,
    siteName: "Subscription X-Ray",
    description: TERMS_DESCRIPTION,
    type: "website",
    url: "/terms",
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
    title: TERMS_TITLE,
    description: TERMS_DESCRIPTION,
    images: ["/twitter-image.png"],
  },
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <div className="glass-panel legal-sheet">
          <Link href="/" className="back">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Subscription X-Ray</span>
          </Link>
          <h1>Terms of Service</h1>
          <p className="legal-updated">Last updated: 18 November 2026</p>

          <section>
            <h2>1. What this service is</h2>
            <p>
              Subscription X-Ray (&quot;we&quot;, &quot;the service&quot;) lets
              you analyze a bank or card statement (CSV or PDF format) inside
              your browser to detect recurring charges and payment mandates.
              Raw statement files and PDF passwords are never transmitted to or
              stored on our servers.
            </p>
          </section>

          <section>
            <h2>2. Accounts</h2>
            <p>
              You need an account to purchase and use scan credits. You&apos;re
              responsible for keeping your login credentials secure and for all
              activity under your account.
            </p>
          </section>

          <section>
            <h2>3. Payment and scan credits</h2>
            <p>
              Each ₹69 one-time purchase adds 12 scan credits to your account.
              Credits do not expire and are not transferable between accounts.
              One credit is deducted when a valid statement yields one or more
              detected recurring charges; valid scans with zero recurring
              charges do not deduct a credit. Payments are processed by Cashfree
              Payments; we do not store your card or UPI credentials.
            </p>
          </section>

          <section>
            <h2>4. Accuracy of results</h2>
            <p>
              Recurring-charge detection is automated and provided &quot;as
              is.&quot; It may miss charges or flag non-subscription
              transactions incorrectly. Always verify independently before
              cancelling anything based solely on these results.
            </p>
          </section>

          <section>
            <h2>5. Acceptable use</h2>
            <p>
              Don&apos;t use the service to analyze statements you&apos;re not
              authorized to access, or attempt to circumvent scan-credit limits
              through technical means.
            </p>
          </section>

          <section>
            <h2>6. Limitation of liability</h2>
            <p>
              The service is provided without warranties of any kind. We&apos;re
              not liable for financial decisions made based on scan results, or
              for indirect or consequential losses arising from use of the
              service.
            </p>
          </section>

          <section>
            <h2>7. Changes</h2>
            <p>
              We may update these terms from time to time. Continued use after
              changes are posted means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2>8. Contact</h2>
            <p>
              Questions about these terms: {SUPPORT_EMAIL}.
            </p>
          </section>

          <nav className="legal-related-links" aria-label="Related pages">
            <Link href="/">Home</Link>
            <Link href="/scanner">Statement scanner</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/refund">Refund Policy</Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
