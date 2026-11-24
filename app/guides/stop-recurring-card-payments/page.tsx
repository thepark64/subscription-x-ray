import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("stop-recurring-card-payments")!;

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: {
    canonical: guide.href,
  },
  openGraph: {
    title: guide.title,
    siteName: "Subscription X-Ray",
    description: guide.description,
    type: "article",
    url: guide.href,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: guide.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: guide.title,
    description: guide.description,
    images: ["/twitter-image.png"],
  },
};

const FAQ_ITEMS: GuideFaqItem[] = [
  {
    q: "Should I turn off international or online transactions temporarily to stop a charge?",
    a: "Disabling international usage or online card controls in your bank app can act as a temporary safeguard for unauthorized charges, but it is not a replacement for proper merchant cancellation and SI mandate revocation.",
  },
  {
    q: "Does blocking and reissuing a card stop every recurring payment?",
    a: "Not always. Card networks offer credential-on-file and updater mechanisms that can migrate eligible recurring tokens to replacement cards. Always cancel with the merchant and revoke the SI mandate as well.",
  },
  {
    q: "How do debit card recurring payments differ from credit card ones?",
    a: "Both debit and credit cards use RBI e-mandates / SI Hub for domestic subscriptions, though debit card charges withdraw immediately from your savings balance. Review our debit card guide for issuer-specific steps.",
  },
];

export default function StopRecurringCardPaymentsPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>The two-layer rule for stopping card subscriptions</h2>
      <p>
        Many cardholders either delete a card inside a merchant website or ask
        their bank to block a card without closing the billing agreement. Both
        shortcuts fail in common edge cases: a merchant may fall back to a
        secondary card on file, or network tokenization may carry billing across
        to a replacement card.
      </p>
      <p>
        Stopping recurring card debits permanently requires clearing both layers:
        ending the commercial subscription with the merchant (or app store) and
        revoking the standing payment instruction with your issuing bank.
      </p>

      <h2>Step-by-step workflow for credit and debit cards</h2>
      <ol>
        <li>
          <strong>Identify all recurring card descriptors:</strong> Export your
          credit card or savings account statement and look for repeated card
          POS/ECOM/SI lines. You can{" "}
          <Link href="/scanner">scan your CSV or PDF locally</Link> to spot
          quarterly and annual renewals you may have overlooked.
        </li>
        <li>
          <strong>End the subscription at the merchant source:</strong> Log in to
          the merchant&apos;s billing portal (or{" "}
          <Link href="/guides/cancel-apple-subscription">Apple</Link> /{" "}
          <Link href="/guides/cancel-google-play-subscription">
            Google Play
          </Link>{" "}
          if billed through an app store) and cancel auto-renewal. Save a
          screenshot or confirmation email with the reference number and date.
        </li>
        <li>
          <strong>Revoke Standing Instructions via bank SI Hub:</strong> Open
          your bank&apos;s SI Hub / Recurring Mandates portal via NetBanking or
          mobile banking (exact portal names vary by bank and card variant) and
          cancel the active e-mandate.
        </li>
        <li>
          <strong>Review card control toggles carefully:</strong> If an
          unfamiliar foreign merchant keeps attempting unauthorized debits while
          a dispute is active, use your bank app&apos;s card controls to restrict
          international/recurring usage and report the charge to your bank
          immediately.
        </li>
        <li>
          <strong>Check whether UPI AutoPay or NACH is also linked:</strong>{" "}
          Some merchants ask for a backup UPI or NACH mandate during checkout.
          Inspect{" "}
          <Link href="/guides/cancel-upi-autopay">UPI AutoPay mandates</Link>{" "}
          and <Link href="/guides/cancel-nach-mandate">NACH mandates</Link> too.
        </li>
      </ol>

      <h2>Common problems &amp; solutions</h2>
      <ul>
        <li>
          <strong>Charges resumed after my expired card was renewed:</strong>{" "}
          Contact the merchant to terminate the agreement and call your card
          issuer to revoke any carried-over recurring token or merchant billing
          authorization.
        </li>
        <li>
          <strong>A small recurring debit appears on a debit card statement instead of credit card:</strong>{" "}
          Check your savings account statement alongside your card issuer&apos;s
          SI Hub; read{" "}
          <Link href="/guides/debit-card-recurring-payments">
            find recurring payments on your debit card
          </Link>
          .
        </li>
        <li>
          <strong>Charges continued after written merchant cancellation:</strong>{" "}
          Gather your cancellation confirmation, raise a formal dispute with
          your bank before the reporting deadline, and keep the ticket ID. If
          unresolved by the bank, escalate through{" "}
          <a
            href="https://cms.rbi.org.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            RBI CMS
          </a>
          .
        </li>
      </ul>

      <h2>Frequently asked questions</h2>
      <div className="guide-faq-list">
        {FAQ_ITEMS.map((item) => (
          <div className="guide-faq-item" key={item.q}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </div>
    </GuideLayout>
  );
}
