import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("cancel-google-play-subscription")!;

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
    q: "Does uninstalling an Android app cancel my Google Play subscription?",
    a: "No. Uninstalling an app from your Android phone never cancels an active subscription. You must explicitly cancel inside Google Play under Payments & subscriptions > Subscriptions.",
  },
  {
    q: "What if I see Google Play charges on my statement, but my Play Store shows no active plans?",
    a: "Many Android users have more than one Google account on their phone or family devices. Switch profiles in Google Play (top-right avatar) or check play.google.com/store/account/subscriptions on each Gmail account.",
  },
  {
    q: "Should I also cancel UPI AutoPay after cancelling inside Google Play?",
    a: "Once Google Play confirms your subscription shows Cancelled with an end date, automatic renewal stops. Checking your UPI AutoPay list as a follow-up confirms no separate direct mandate remains.",
  },
];

export default function CancelGooglePlaySubscriptionPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>Before you begin: uninstalling an app will not stop billing</h2>
      <p>
        One of the most common causes of forgotten subscriptions on Android is
        deleting an app after trying it out. Google Play keeps billing the
        linked payment method (UPI AutoPay, debit/credit card, or Play balance)
        until you explicitly cancel the subscription on the Google account that
        purchased it.
      </p>

      <h2>Step-by-step: cancel a subscription in Google Play</h2>
      <p>
        Exact screen wording varies slightly across Android versions and Play
        Store updates, so follow the official path below:
      </p>
      <ol>
        <li>
          <strong>Open the Google Play Store app</strong> (or sign in via web at{" "}
          <a
            href="https://play.google.com/store/account/subscriptions"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Play Subscriptions
          </a>
          ).
        </li>
        <li>
          <strong>Confirm the right Google account:</strong> Tap your profile
          icon in the top-right corner and verify the Gmail address matches the
          one that receives Play Store receipts.
        </li>
        <li>
          <strong>Open Payments &amp; subscriptions → Subscriptions:</strong>{" "}
          Browse all active recurring Android apps, Google One storage plans,
          YouTube memberships, and game passes linked to that account.
        </li>
        <li>
          <strong>Select the subscription you want to stop</strong> and tap{" "}
          <strong>Cancel subscription</strong>.
        </li>
        <li>
          <strong>Complete the confirmation prompt</strong> and verify the status
          now displays a cancellation end date instead of a next renewal date.
        </li>
      </ol>
      <p>
        For official edge cases — including refunds, paused plans, and
        troubleshooting — consult{" "}
        <a
          href="https://support.google.com/googleplay/answer/7018481"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Play&apos;s official subscription cancellation guide
        </a>
        .
      </p>

      <h2>Common problems &amp; solutions</h2>
      <ul>
        <li>
          <strong>&ldquo;No subscriptions found&rdquo;, even though my bank debited Google:</strong>{" "}
          Switch between every Gmail account logged into your phone, tablet, or
          household devices. Each Google account maintains an independent
          Subscriptions list.
        </li>
        <li>
          <strong>Charged directly by the app instead of Google Play:</strong>{" "}
          Some apps use external web checkout rather than Play billing. If the
          plan is missing from Google Play, sign in to the app&apos;s own
          website or check your{" "}
          <Link href="/guides/cancel-upi-autopay">UPI AutoPay mandates</Link>{" "}
          and{" "}
          <Link href="/guides/cancel-credit-card-subscriptions">
            card Standing Instructions
          </Link>
          .
        </li>
        <li>
          <strong>Free trial about to convert:</strong> Cancel at least 24 hours
          before the trial end timestamp shown inside Google Play. Learn more in{" "}
          <Link href="/guides/stop-forgotten-free-trials">
            how to stop forgotten free trial renewals
          </Link>
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
