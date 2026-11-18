import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("find-hidden-subscriptions")!;

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

export default function FindHiddenSubscriptionsPage() {
  return (
    <GuideLayout guide={guide}>
      <h2>Why subscriptions stay invisible in day-to-day banking</h2>
      <p>
        Most people only notice a forgotten subscription when a large annual
        renewal hits or an SMS alert catches them off guard. Smaller monthly
        plans blend into dozens of routine grocery, food-delivery, and UPI
        transfers. Even worse, recurring bills in India rarely sit inside a
        single dashboard: one service pulls via UPI AutoPay, another charges
        through Google Play or Apple Services, a third runs as a credit card
        Standing Instruction, and an older membership sits on a bank NACH
        e-Mandate.
      </p>
      <p>
        Auditing your exported bank and card statements side by side is the most
        reliable way to uncover hidden subscriptions because every real rupee
        leaving your account eventually shows up on those statements.
      </p>

      <h2>Common recurring transaction patterns to watch for</h2>
      <p>
        Instead of scanning line by line for brand names you recognize, look for
        time and amount geometry across multiple months:
      </p>
      <ul>
        <li>
          <strong>Monthly plans (~26 to 35 day gaps):</strong> Streaming apps,
          music plans, cloud storage, AI subscriptions, gym apps, and broadband
          top-ups. Because billing months vary between 28 and 31 days—and bank
          holidays shift settlement dates slightly—the debit date often drifts by
          a few days.
        </li>
        <li>
          <strong>Quarterly plans (~81 to 101 day gaps):</strong> Fitness packs,
          news memberships, and regional OTT quarterly bundles frequently go
          unnoticed in 1-month or 2-month statement downloads.
        </li>
        <li>
          <strong>Annual renewals (~350 to 380 day gaps):</strong> Domain
          registrars, productivity suites, antivirus software, cloud storage, and
          annual Prime or travel memberships require exporting 13 to 15 months
          of transactions to see two consecutive renewals.
        </li>
        <li>
          <strong>Weekly debits (~5 to 9 day gaps):</strong> Meal or micro-app
          subscriptions repeat four times a month and add up quickly even when
          each ticket looks tiny.
        </li>
      </ul>

      <h2>Why merchant names change across statements</h2>
      <p>
        Text matching alone often misses recurring charges because Indian bank
        narrations wrap the merchant name in transaction metadata that changes on
        every debit:
      </p>
      <ul>
        <li>
          <strong>Changing reference numbers and IFSC codes:</strong> Banks
          embed 12-digit UPI RRNs, batch IDs, dates, or 11-character IFSC codes
          into the narration string.
        </li>
        <li>
          <strong>Legal corporate names vs consumer brands:</strong> A consumer
          app you know under one brand may bill under its parent private-limited
          entity, payment aggregator descriptor (such as Razorpay, Cashfree, or
          BillDesk), or Apple/Google Play billing header.
        </li>
        <li>
          <strong>Slight amount variance:</strong> International software billed
          in USD fluctuates slightly on Indian cards each month due to exchange
          rates and bank forex markups, so exact-rupee sorting misses it unless
          you allow small percentage spread.
        </li>
      </ul>

      <p>
        Need help decoding raw codes inside narration strings? Read{" "}
        <Link href="/guides/read-bank-statements">
          how to read bank statement narrations in India
        </Link>{" "}
        or check{" "}
        <Link href="/guides/find-upi-autopay-mandates">
          how to find UPI AutoPay mandates
        </Link>
        .
      </p>

      <h2>Step-by-step checklist to review possible subscriptions</h2>
      <ol>
        <li>
          <strong>Export 6 to 13 months as CSV or digital PDF:</strong> Download
          statements for both your primary savings account and every active
          credit card. Avoid scanned photo PDFs—use selectable digital PDFs or
          CSV downloads from NetBanking.
        </li>
        <li>
          <strong>Normalize and group repeating debits:</strong> Strip digits,
          UPI handles, and channel keywords (like <code>UPI</code>,{" "}
          <code>NACH</code>, <code>POS</code>, <code>SI</code>) so multiple
          charges from the same merchant group together.
        </li>
        <li>
          <strong>Ignore failed attempts and verification pings:</strong> Cross
          off reversed charges, refunds, and ₹1–₹5 mandate registration holds so
          you only audit actual recurring costs.
        </li>
        <li>
          <strong>Classify the payment rail before cancelling:</strong> A charge
          via{" "}
          <Link href="/guides/recurring-card-payments">
            card Standing Instruction
          </Link>{" "}
          is managed differently from a{" "}
          <Link href="/guides/identify-nach-emandate">
            NACH e-Mandate
          </Link>{" "}
          or UPI AutoPay mandate.
        </li>
        <li>
          <strong>Verify unfamiliar descriptors independently:</strong> Never
          blindly revoke a NACH mandate tied to a loan EMI, insurance policy, or
          active SIP—confirm the merchant identity in your email receipts or
          with your bank first.
        </li>
      </ol>

      <h2>How Subscription X-Ray speeds up statement audits</h2>
      <p>
        <Link href="/scanner">Subscription X-Ray</Link> performs this exact
        normalization and cadence matching locally inside your browser. It scans
        CSV files (up to 100,000 rows) and digital or password-protected PDFs,
        surfaces unrecognized recurring descriptors alongside known Indian and
        global services, labels confidence levels (<em>High</em>,{" "}
        <em>Medium</em>, or <em>Possible</em>), and exports a clean CSV or PDF
        summary checklist while keeping your raw statement off external servers.
      </p>

      <h2>Frequently asked questions</h2>
      <div className="guide-faq-list">
        <div className="guide-faq-item">
          <h3>Why didn&apos;t a single trial charge show up as a subscription?</h3>
          <p>
            A charge that occurred only once—such as a one-time purchase or a
            brand-new subscription in its first month—has no second cycle yet.
            Automatic interval detection needs at least two debits (four for
            weekly) to confirm a repeating pattern.
          </p>
        </div>
        <div className="guide-faq-item">
          <h3>Could my house rent or regular vendor payments appear as subscriptions?</h3>
          <p>
            Yes. Any recurring debit of a consistent amount on a monthly or
            quarterly rhythm—including rent, tuition, or SIPs—can match the
            interval rule. Review every flagged item before cancelling.
          </p>
        </div>
      </div>
    </GuideLayout>
  );
}
