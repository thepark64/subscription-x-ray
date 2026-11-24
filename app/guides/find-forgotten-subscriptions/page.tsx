import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("find-forgotten-subscriptions")!;

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
    q: "Why do forgotten subscriptions rarely show up in one single place?",
    a: "In India, subscriptions can sit across multiple billing rails at the same time: Google Pay AutoPay, PhonePe or Paytm AutoPay, bank NACH eMandates, credit card Standing Instructions, Google Play, and Apple App Store billing.",
  },
  {
    q: "How many months of bank statements do I need to spot forgotten annual plans?",
    a: "Export 3 to 6 months to catch monthly and quarterly subscriptions reliably. Export 13 months if you want to confirm annual plans or spot renewals that billed just over a year ago.",
  },
  {
    q: "Can a recurring debit in my statement be something other than a subscription?",
    a: "Yes. Repeated transfers such as monthly rent, domestic help, SIPs, utility bills, or regular transfers to family members can repeat on similar dates. Always check the merchant or recipient before cancelling.",
  },
  {
    q: "What if I see a small ₹1 or ₹2 charge first?",
    a: "Small ₹1 to ₹5 transactions are often temporary mandate verification or pre-debit validation checks rather than the actual subscription price. The full renewal amount usually follows after the trial or billing cycle starts.",
  },
];

export default function FindForgottenSubscriptionsPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>Why subscriptions get forgotten so easily</h2>
      <p>
        Most unwanted subscriptions are not expensive standalone purchases —
        they are small ₹99 to ₹649 renewals spread across different payment
        methods. You might sign up for an OTT bundle on UPI AutoPay, start a
        cloud storage upgrade inside Google Play or Apple Account, and approve a
        software trial on a credit card.
      </p>
      <p>
        Checking only one payment app will miss charges flowing through your
        other bank accounts, credit cards, or app stores. A structured 15-minute
        audit catches all of them.
      </p>

      <h2>Step-by-step checklist to find forgotten subscriptions</h2>
      <ol>
        <li>
          <strong>Audit your bank and credit card statements first:</strong>{" "}
          Your statement is the single ledger where every debited rupee must
          appear, regardless of which app initiated it. Download 3 to 13 months
          of CSV or selectable digital PDF statements from NetBanking and{" "}
          <Link href="/scanner">scan them locally in Subscription X-Ray</Link>{" "}
          to cluster repeating merchants automatically.
        </li>
        <li>
          <strong>Check every UPI app you have used:</strong> Open AutoPay /
          Automatic Payments inside Google Pay, PhonePe, Paytm, BHIM, and your
          bank&apos;s UPI app. A mandate created inside an older app stays
          active until revoked, even if you stopped opening that app.
        </li>
        <li>
          <strong>Review Apple and Google Play billing menus:</strong> App
          stores often bill under generic descriptors like{" "}
          <code>APPLE.COM/BILL</code> or <code>GOOGLE PLAY</code> rather than
          the underlying app name. Inspect{" "}
          <Link href="/guides/cancel-google-play-subscription">
            Google Play Subscriptions
          </Link>{" "}
          and{" "}
          <Link href="/guides/cancel-apple-subscription">
            Apple Account Subscriptions
          </Link>{" "}
          on every active email ID.
        </li>
        <li>
          <strong>Inspect your card issuer&apos;s SI Hub &amp; bank NACH list:</strong>{" "}
          Log in to NetBanking or your bank&apos;s Standing Instructions / SI
          Hub portal to view active recurring card mandates and account-level{" "}
          <Link href="/guides/cancel-nach-mandate">NACH eMandates</Link>.
        </li>
        <li>
          <strong>Search your email inbox for renewal clues:</strong> Search for
          terms like <code>auto-renew</code>, <code>mandate</code>,{" "}
          <code>pre-debit notification</code>, <code>subscription</code>, and{" "}
          <code>invoice</code> across personal and work email accounts.
        </li>
      </ol>

      <h2>How to separate recurring patterns from active subscriptions</h2>
      <p>
        Seeing a repeated transaction in a statement tells you a payment pattern
        occurred across dates — it does not prove a subscription is still active
        or scheduled to renew next month. Check these three signals before
        acting:
      </p>
      <ul>
        <li>
          <strong>Last charge date:</strong> Confirm whether the latest debit
          matches your current billing window or was already cancelled earlier.
        </li>
        <li>
          <strong>Payment rail:</strong> Look for UPI AutoPay, NACH, or card
          Standing Instruction clues versus regular manual transfers.
        </li>
        <li>
          <strong>Mandate status in your bank or app:</strong> Confirm whether
          the live mandate shows Active, Paused, or Cancelled inside your UPI
          app or bank portal.
        </li>
      </ul>

      <h2>Common problems &amp; solutions</h2>
      <ul>
        <li>
          <strong>I see Razorpay, BillDesk, PayU, or Cashfree instead of a brand name:</strong>{" "}
          Payment gateways sometimes obscure the underlying service. Match the
          exact debit amount and date against your SMS alerts or email receipts,
          or see our{" "}
          <Link href="/guides/identify-unknown-bank-debits">
            guide to identifying unknown bank debits
          </Link>
          .
        </li>
        <li>
          <strong>I closed an account or deleted an app, but the charge returned:</strong>{" "}
          Deleting an app never cancels billing. Revoke the mandate inside the
          billing store or UPI/card portal directly.
        </li>
        <li>
          <strong>Annual subscriptions did not appear in a 3-month statement:</strong>{" "}
          Export a 12-to-13-month statement CSV or PDF from NetBanking so annual
          renewals appear in your review. Read{" "}
          <Link href="/guides/find-hidden-subscriptions-bank-statement">
            how to find hidden subscriptions in bank statements
          </Link>{" "}
          for date-range tips.
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
