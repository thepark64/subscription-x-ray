import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Refund Policy — Subscription X-Ray",
  description:
    "Refund Policy for Subscription X-Ray ₹69 one-time 12-scan credit packs processed via Cashfree Payments.",
  alternates: {
    canonical: "/refund",
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
            <h2>How to request one</h2>
            <p>
              Email {SUPPORT_EMAIL} with your account email and
              the Cashfree payment or order ID. Valid refund requests are
              processed within 5-7 business days back to the original payment
              method.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
