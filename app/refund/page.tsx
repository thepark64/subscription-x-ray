import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/config";

const REFUND_TITLE = "Refund Policy — Subscription X-Ray";
const REFUND_DESCRIPTION =
  "Review the Subscription X-Ray Refund Policy for ₹69 one-time 12-scan credit packs, duplicate charges, failed payments, and Cashfree verification.";

export const metadata: Metadata = {
  title: REFUND_TITLE,
  description: REFUND_DESCRIPTION,
  alternates: {
    canonical: "/refund",
  },
  openGraph: {
    title: REFUND_TITLE,
    siteName: "Subscription X-Ray",
    description: REFUND_DESCRIPTION,
    type: "website",
    url: "/refund",
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
    title: REFUND_TITLE,
    description: REFUND_DESCRIPTION,
    images: ["/twitter-image.png"],
  },
};

export default function RefundPage() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <div className="glass-panel legal-sheet">
          <Link href="/" className="back">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Subscription X-Ray</span>
          </Link>
          <h1>Refund Policy</h1>
          <p className="legal-updated">Last updated: 18 November 2026</p>

          <section>
            <h2>Digital product, used credits</h2>
            <p>
              Scan credits are a digital product delivered immediately on
              payment confirmation. Once credits are added to your account,
              completed pack purchases are generally non-refundable.
            </p>
          </section>

          <section>
            <h2>Exceptions</h2>
            <ul>
              <li>
                If you were charged but no credits were added to your account (a
                failed or stuck payment), contact us with your payment ID for a
                full refund or credit correction.
              </li>
              <li>
                If you were charged twice for the same purchase due to a
                technical error, the duplicate charge will be refunded in full.
              </li>
            </ul>
          </section>

          <section>
            <h2>Zero-subscription scans and unused credits</h2>
            <p>
              If you upload a valid bank or card statement and Subscription
              X-Ray detects zero recurring charges, no scan credit is deducted
              from your balance. Your 12-scan pack does not expire and carries
              no recurring billing on our side, so unused scans remain
              available for future statements.
            </p>
          </section>

          <section>
            <h2>How to request a refund</h2>
            <p>
              Email {SUPPORT_EMAIL} from your registered account email address
              and include your Cashfree payment ID or order reference. Our team
              verifies payment records against your credit ledger and responds
              promptly. Approved refunds for failed credit delivery or duplicate
              transactions are initiated via Cashfree Payments within 5-7
              business days back to the original UPI app, card, or bank account.
            </p>
            <p>
              Need to review our privacy guarantees or scan terms before
              purchasing? Check our browser-only statement handling policy or
              open your statement scanner dashboard using the links below.
            </p>
          </section>

          <nav className="legal-related-links" aria-label="Related pages">
            <Link href="/">Home</Link>
            <Link href="/scanner">Statement scanner</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
