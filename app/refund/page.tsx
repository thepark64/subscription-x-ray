import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy — Subscription X-Ray",
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
          <p className="legal-updated">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <div className="legal-disclaimer">
            This is a starting draft. Decide your actual refund window and
            conditions, then have this reviewed before going live — Razorpay
            requires a clear refund policy to be publicly visible before
            approving a merchant account.
          </div>

          <section>
            <h2>Digital product, used credits</h2>
            <p>
              Scan credits are a digital product delivered immediately on
              payment. Because of this, we generally don&apos;t offer refunds
              once a payment has successfully added credits to your account.
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
            <h2>How to request one</h2>
            <p>
              Email support@subscriptionxray.jo3.org with your account email and
              the Razorpay payment ID. Valid refund requests are processed
              within 5-7 business days back to the original payment method.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
