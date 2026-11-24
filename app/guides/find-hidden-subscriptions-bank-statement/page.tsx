import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("find-hidden-subscriptions-bank-statement")!;

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
    q: "Should I upload a CSV or PDF bank statement to audit subscriptions?",
    a: "CSV exports from NetBanking are usually cleanest because column boundaries are exact. Selectable digital PDFs (including password-protected bank PDFs) also work locally in your browser, whereas scanned image-only PDFs without selectable text cannot be parsed.",
  },
  {
    q: "Why don't single-month statements catch quarterly or annual subscriptions?",
    a: "A 30-day statement only captures a charge once. Pattern detection needs two or more occurrences to confirm cadence across monthly, quarterly, or annual intervals.",
  },
  {
    q: "Why does Subscription X-Ray ignore ₹1 and ₹2 charges?",
    a: "Indian payment rails often trigger ₹1 to ₹5 verification pings when registering or modifying an AutoPay or card mandate. Filtering out ₹1–₹5 mandate holds stops them from inflating your recurring cost total.",
  },
];

export default function FindHiddenSubscriptionsBankStatementPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>Why annual and aggregator subscriptions hide inside statements</h2>
      <p>
        Scanning the last two weeks of transactions catches daily UPI coffee
        spends, but subscriptions hide in longer timelines. Quarterly software
        plans, annual cloud storage renewals, domain registrations, and gym
        memberships only appear a few times a year — buried inside hundreds of
        groceries and peer-to-peer UPI transfers with rotating reference IDs.
      </p>

      <h2>Step-by-step bank statement audit workflow</h2>
      <ol>
        <li>
          <strong>Export 6 to 13 months from NetBanking:</strong> Download a
          CSV export (or selectable digital PDF) for your primary savings
          account and each active credit card. See bank export notes in our{" "}
          <Link href="/guides/hdfc-sbi-icici-automatic-payments">
            HDFC, SBI &amp; ICICI statement guide
          </Link>
          .
        </li>
        <li>
          <strong>Parse statements locally without sharing bank logins:</strong>{" "}
          Drop your exported file into{" "}
          <Link href="/scanner">Subscription X-Ray</Link>. Files up to 10 MB are
          decoded inside your browser — raw rows and PDF passwords never upload
          to any server.
        </li>
        <li>
          <strong>Review High, Medium, and Possible matches carefully:</strong>{" "}
          Check the merchant name, transaction amount, monthly/annual run-rate,
          last charge date, and payment rail. Treat <em>Possible</em> matches as
          prompts to inspect rather than automatic proof of an active plan.
        </li>
        <li>
          <strong>Spot indirect billing channels:</strong> Look closely for
          aggregator names (<code>APPLE.COM/BILL</code>,{" "}
          <code>GOOGLE PLAY</code>, Razorpay, PayU, Stripe) and cross-check
          against{" "}
          <Link href="/guides/cancel-apple-subscription">Apple</Link> or{" "}
          <Link href="/guides/cancel-google-play-subscription">Google Play</Link>{" "}
          receipts.
        </li>
        <li>
          <strong>Follow the rail-specific cancellation checklist:</strong>{" "}
          Close unwanted accounts with the merchant and verify the matching{" "}
          <Link href="/guides/cancel-upi-autopay">UPI AutoPay</Link>,{" "}
          <Link href="/guides/cancel-nach-mandate">NACH</Link>, or{" "}
          <Link href="/guides/cancel-credit-card-subscriptions">card SI</Link>{" "}
          mandate is revoked.
        </li>
      </ol>

      <h2>Common problems &amp; solutions</h2>
      <ul>
        <li>
          <strong>My bank PDF fails with a scanned-image error:</strong> Mobile
          screenshots or flat scanned PDFs contain pictures instead of text
          characters. Log in to NetBanking on desktop or mobile web and export
          an original e-statement PDF or CSV instead.
        </li>
        <li>
          <strong>Monthly expenses looked higher than expected due to annual plans:</strong>{" "}
          Review annual-to-monthly normalization in{" "}
          <Link href="/guides/calculate-monthly-subscription-spending">
            how to calculate monthly subscription expenses
          </Link>{" "}
          so quarterly and yearly renewals stay budgeted accurately.
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
