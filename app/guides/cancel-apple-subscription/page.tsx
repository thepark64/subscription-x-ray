import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("cancel-apple-subscription")!;

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
    q: "What does APPLE.COM/BILL mean on an Indian bank or card statement?",
    a: "APPLE.COM/BILL (or Apple Services) is Apple's consolidated billing descriptor for App Store app subscriptions, Apple Music, Apple TV+, iCloud+ storage upgrades, and Apple One bundles.",
  },
  {
    q: "How do I cancel an Apple subscription if I no longer own an iPhone or iPad?",
    a: "You can manage and cancel active Apple subscriptions on a Mac via the App Store, inside Apple Music on Android/Windows, or online through Apple's subscription portal at apps.apple.com/account/subscriptions.",
  },
  {
    q: "Why don't I see a Cancel button under my Apple Account Subscriptions?",
    a: "If there is no Cancel button and you see an expiration message in red text, the subscription is already cancelled. Alternatively, if you are on Family Sharing, the subscription may be managed on the family organizer's or another family member's Apple Account.",
  },
];

export default function CancelAppleSubscriptionPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>Recognizing Apple &amp; App Store debits on your statement</h2>
      <p>
        Subscriptions billed through Apple&apos;s App Store, iCloud+, Apple
        Music, Apple TV+, or third-party iOS apps generally appear on credit
        card, debit card, or UPI AutoPay statements under consolidated names
        such as <code>APPLE.COM/BILL</code>, <code>APPLE SERVICES</code>, or{" "}
        <code>ITUNES</code> rather than the individual app developer&apos;s
        name.
      </p>
      <p>
        Deleting an app from your iPhone or iPad will never end its App Store
        billing cycle. Exact menus vary slightly across iOS, iPadOS, macOS, and
        account regions.
      </p>

      <h2>Step-by-step: cancel an Apple subscription</h2>
      <ol>
        <li>
          <strong>On iPhone or iPad:</strong> Open the <strong>Settings</strong>{" "}
          app, tap your <strong>Apple Account</strong> name at the very top, and
          tap <strong>Subscriptions</strong>.
        </li>
        <li>
          <strong>Select the active subscription</strong> you want to end (for
          example, an OTT app, photo editor, or iCloud+ upgrade).
        </li>
        <li>
          <strong>Tap Cancel Subscription</strong> (or{" "}
          <em>Cancel Free Trial</em>). Follow the prompt until it confirms the
          plan will expire on the end date rather than renew.
        </li>
        <li>
          <strong>No iOS device nearby?</strong> Visit{" "}
          <a
            href="https://apps.apple.com/account/subscriptions"
            target="_blank"
            rel="noopener noreferrer"
          >
            Apple Account Subscriptions
          </a>{" "}
          from a browser or manage plans inside the App Store on a Mac.
        </li>
      </ol>
      <p>
        For complete device-by-device steps (including Apple Watch, Apple TV,
        and Mac App Store), check{" "}
        <a
          href="https://support.apple.com/en-in/118428"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apple Support&apos;s official India subscription cancellation guide
        </a>
        .
      </p>

      <h2>Common problems &amp; solutions</h2>
      <ul>
        <li>
          <strong>Multiple Apple charges in one month:</strong> Apple sometimes
          groups multiple app renewals or adds App Store purchases together,
          making a familiar total suddenly look unfamiliar. Open{" "}
          <strong>Settings → Apple Account → Media &amp; Purchases → View Account → Purchase History</strong>{" "}
          to match the exact rupee figure.
        </li>
        <li>
          <strong>Subscription missing under your Apple Account:</strong> If
          another household member uses the same card via Family Sharing or a
          secondary Apple ID, check their Subscriptions menu or verify whether
          the app billed directly over{" "}
          <Link href="/guides/cancel-credit-card-subscriptions">
            credit card web checkout
          </Link>{" "}
          or <Link href="/guides/cancel-upi-autopay">UPI AutoPay</Link>.
        </li>
        <li>
          <strong>Free trial ending tomorrow:</strong> Cancel Apple free trials
          at least 24 hours before the renewal window closes. Read{" "}
          <Link href="/guides/stop-forgotten-free-trials">
            stopping forgotten free trials
          </Link>{" "}
          for a prevention checklist.
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
