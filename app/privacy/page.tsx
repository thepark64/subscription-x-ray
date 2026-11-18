import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy — Subscription X-Ray",
  description:
    "How Subscription X-Ray processes CSV and PDF statements locally in your browser without uploading raw files or PDF passwords.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <div className="glass-panel legal-sheet">
          <Link href="/" className="back">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Subscription X-Ray</span>
          </Link>
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: 18 November 2026</p>

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
              Vercel for hosting and privacy-friendly web analytics. Each
              provider processes data under its own privacy policy solely to
              deliver these functions.
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
        </div>
      </div>
    </main>
  );
}
