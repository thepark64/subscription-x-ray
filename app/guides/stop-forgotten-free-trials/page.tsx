import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("stop-forgotten-free-trials")!;

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
    q: "Why did a free trial ask for ₹2 via UPI AutoPay or my card?",
    a: "Under Indian mandate workflows, a small ₹1 to ₹5 authorization check validates your payment method and establishes the recurring mandate that automatically charges full price when the free or ₹2 introductory period ends.",
  },
  {
    q: "If I cancel a free trial right away, do I lose access immediately?",
    a: "It varies by merchant. Many apps and Apple/Google Play plans preserve access until the end of the trial period, while a few merchants end access immediately upon cancellation. Check the confirmation dialog before clicking confirm.",
  },
  {
    q: "Can a reminder save me if a merchant sends a pre-debit alert?",
    a: "Under RBI e-mandate guidelines for domestic transactions, issuers/merchants generally send pre-debit notifications (typically 24 hours ahead) before charging recurring mandates. Acting immediately when that SMS/email arrives helps catch unwanted conversions — though checking earlier is safer.",
  },
];

export default function StopForgottenFreeTrialsPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>How ₹2 and 7-day free trials quietly turn into full renewals</h2>
      <p>
        Streaming apps, AI tools, PDF editors, and fitness platforms commonly
        market 7-day, 14-day, or ₹2 introductory trials. At checkout, you
        approve a{" "}
        <Link href="/guides/find-upi-autopay-mandates">UPI AutoPay mandate</Link>
        , an RBI card Standing Instruction, or an app store billing pass. When
        the trial expires, billing transitions smoothly into a ₹299, ₹649, or
        ₹4,999 recurring charge without requiring a fresh UPI PIN or OTP for
        mandated amounts.
      </p>

      <h2>Step-by-step: find and stop unwanted trials before billing</h2>
      <ol>
        <li>
          <strong>Audit active mandates across all four billing hubs:</strong>
          <ul>
            <li>
              <strong>UPI apps:</strong> Open AutoPay / Automatic Payments in
              Google Pay, PhonePe, Paytm, BHIM, or your bank UPI app and inspect
              mandates showing ₹1/₹2 initial payments or upcoming renewal dates.
            </li>
            <li>
              <strong>Google Play:</strong> Go to{" "}
              <em>Payments &amp; subscriptions → Subscriptions</em> (see{" "}
              <Link href="/guides/cancel-google-play-subscription">
                Google Play cancellation steps
              </Link>
              ).
            </li>
            <li>
              <strong>Apple Account:</strong> Open{" "}
              <em>Settings → Apple Account → Subscriptions</em> (see{" "}
              <Link href="/guides/cancel-apple-subscription">
                Apple subscription cancellation steps
              </Link>
              ).
            </li>
            <li>
              <strong>Credit &amp; debit cards:</strong> Open your issuing
              bank&apos;s SI Hub portal and verify active recurring mandates.
            </li>
          </ul>
        </li>
        <li>
          <strong>Cancel at least 24 to 48 hours before trial expiry:</strong>{" "}
          Wait until the final hour and a pre-authorized settlement batch may
          already be queued.
        </li>
        <li>
          <strong>Search SMS &amp; email for ₹1–₹5 trial clues:</strong> Search
          your SMS inbox for <code>mandate created</code>,{" "}
          <code>AutoPay</code>, or <code>pre-debit</code> to uncover trials you
          started weeks ago before the first full charge hits.
        </li>
        <li>
          <strong>Scan multi-month statements for converted trials:</strong> If
          a past trial already slipped into monthly or annual billing,{" "}
          <Link href="/scanner">scan your statement locally</Link> to spot every
          active deduction at once.
        </li>
      </ol>

      <h2>Common problems &amp; solutions</h2>
      <ul>
        <li>
          <strong>Cancelled on the merchant site, but the UPI AutoPay mandate still shows Live:</strong>{" "}
          Revoke the AutoPay mandate separately inside your UPI app with your
          UPI PIN so no stray renewal attempt can settle.
        </li>
        <li>
          <strong>Trial already converted into a 1-year charge today:</strong>{" "}
          Cancel auto-renewal immediately so it does not repeat next year, then
          contact merchant support (or{" "}
          <a
            href="https://support.apple.com/en-in/118428"
            target="_blank"
            rel="noopener noreferrer"
          >
            Apple
          </a>{" "}
          /{" "}
          <a
            href="https://support.google.com/googleplay/answer/7018481"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Play
          </a>{" "}
          support) promptly to check whether you qualify for a goodwill refund.
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
