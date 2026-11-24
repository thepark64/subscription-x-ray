import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { NarrationNormalizationDiagram } from "@/components/SeoIllustrations";
import TrackedLink from "@/components/TrackedLink";
import { PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";
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

const FAQ_ITEMS: GuideFaqItem[] = [
  {
    q: "Why didn't a single trial charge show up as a recurring subscription?",
    a: "A charge that occurred only once—such as a one-time purchase or a brand-new subscription in its first month—has no second cycle yet. Automatic interval detection needs at least two debits (four for weekly) to confirm a repeating pattern.",
  },
  {
    q: "Could my house rent or regular vendor payments appear as subscriptions?",
    a: "Yes. Any recurring debit of a consistent amount on a monthly or quarterly rhythm—including rent, tuition, or SIPs—can match the interval rule. Review every flagged item before cancelling.",
  },
  {
    q: "How is auditing a bank statement different from checking Google Pay or PhonePe AutoPay?",
    a: "Checking one UPI app only displays mandates approved inside that app. Your bank and credit card statements show settled charges across every UPI app, NACH eMandates, card Standing Instructions, Apple Services, and Google Play in one place.",
  },
  {
    q: "Does Subscription X-Ray upload my raw bank statement or PDF password?",
    a: "No. CSV parsing and password-protected PDF decoding run strictly in browser memory. Only your email account, credit balance, and detected recurring summary records are stored on our servers.",
  },
];

export default function FindHiddenSubscriptionsPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
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
        leaving your account eventually shows up on those statements. Looking
        for a quick 15-minute cross-app audit across email, UPI apps, and app
        stores? Start with our{" "}
        <Link href="/guides/find-forgotten-subscriptions">
          checklist to find forgotten subscriptions
        </Link>
        , or export a 13-month file using our{" "}
        <Link href="/guides/find-hidden-subscriptions-bank-statement">
          multi-month statement audit workflow
        </Link>
        .
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

      <h2>Why merchant names change across statements (with examples)</h2>
      <p>
        Text matching alone often misses recurring charges because Indian bank
        narrations wrap the merchant name in transaction metadata that changes on
        every debit:
      </p>

      <NarrationNormalizationDiagram />

      <div className="guide-table-wrap">
        <table className="guide-table">
          <thead>
            <tr>
              <th>Representative statement entry</th>
              <th>Why Ctrl+F misses it</th>
              <th>How to verify &amp; act</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>UPI/403699182745/NETFLIX@OKAXIS</code> vs{" "}
                <code>UPI/406644209188/NETFLIX@OKAXIS</code>
              </td>
              <td>Changing 12-digit UPI RRN breaks exact string matching</td>
              <td>
                Strip RRN &amp; VPA handle; revoke inside{" "}
                <Link href="/guides/cancel-upi-autopay">UPI AutoPay</Link>
              </td>
            </tr>
            <tr>
              <td>
                <code>RAZORPAY*CLOUDAPP MUMBAI</code> or{" "}
                <code>BILLDESK*MEDIA</code>
              </td>
              <td>Payment gateway hides consumer app name</td>
              <td>
                Match exact rupee amount in email/SMS; see{" "}
                <Link href="/guides/identify-unknown-bank-debits">
                  unknown bank debits
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <code>APPLE.COM/BILL</code> or <code>GOOGLE PLAY APPS</code>
              </td>
              <td>Consolidated app-store billing descriptor</td>
              <td>
                Cancel inside{" "}
                <Link href="/guides/cancel-apple-subscription">Apple</Link> or{" "}
                <Link href="/guides/cancel-google-play-subscription">
                  Google Play
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <code>OPENAI CHATGPT SUBSCRIPTION</code> (₹1,962 → ₹1,994)
              </td>
              <td>USD-to-INR rate &amp; forex markup shift monthly totals</td>
              <td>
                Group small variance (~15% spread); cancel on merchant +{" "}
                <Link href="/guides/cancel-credit-card-subscriptions">
                  check card billing
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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

      <div className="guide-inline-cta">
        <div className="guide-inline-cta-copy">
          <strong>Find hidden recurring charges in your CSV or PDF</strong>
          <span>
            Parsing stays inside browser memory — raw statements and PDF
            passwords never upload. {PACK_PRICE_LABEL} unlocks {PACK_SIZE}{" "}
            non-expiring scans (0 credits used if 0 charges found).
          </span>
        </div>
        <TrackedLink
          className="btn btn-primary button-sm"
          href="/scanner"
          trackLocation="guide_find_hidden_inline"
          trackLabel="Scan my statement"
        >
          <span>Open statement scanner</span>
          <ArrowRight size={15} aria-hidden="true" />
        </TrackedLink>
      </div>

      <h2>Step-by-step checklist to review possible subscriptions</h2>
      <ol>
        <li>
          <strong>Export 6 to 13 months as CSV or digital PDF:</strong> Download
          statements for both your primary savings account and every active
          credit card (see{" "}
          <Link href="/guides/hdfc-sbi-icici-automatic-payments">
            HDFC, SBI &amp; ICICI statement export tips
          </Link>
          ). Avoid scanned photo PDFs—use selectable digital PDFs or CSV
          downloads from NetBanking.
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
          <strong>Classify the payment rail before cancelling:</strong> Cancel
          with the merchant first, then revoke the matching{" "}
          <Link href="/guides/cancel-upi-autopay">UPI AutoPay mandate</Link>,{" "}
          <Link href="/guides/cancel-nach-mandate">NACH e-Mandate</Link>, or{" "}
          <Link href="/guides/cancel-credit-card-subscriptions">
            card Standing Instruction (SI Hub)
          </Link>{" "}
          because deleting an app never cancels billing.
        </li>
        <li>
          <strong>Verify unfamiliar descriptors independently:</strong> Never
          blindly revoke a NACH mandate tied to a loan EMI, insurance policy, or
          active SIP—confirm the merchant identity in your email receipts or
          with your bank first. For unresolved unauthorized debits in India,
          refer to{" "}
          <a
            href="https://upihelp.npci.org.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            NPCI UPI Help
          </a>{" "}
          or the{" "}
          <a
            href="https://cms.rbi.org.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            RBI Complaint Management System (CMS)
          </a>
          .
        </li>
      </ol>

      <h2>How Subscription X-Ray speeds up statement audits</h2>
      <p>
        <Link href="/scanner">Subscription X-Ray</Link> performs this exact
        normalization and cadence matching locally inside your browser. It scans
        CSV files (up to 10 MB and 100,000 rows) and digital or
        password-protected PDFs (up to 10 MB), surfaces unrecognized recurring
        descriptors alongside known Indian and global services, labels
        confidence levels (<em>High</em>, <em>Medium</em>, or <em>Possible</em>),
        and exports a clean CSV or PDF summary checklist while keeping your raw
        statement off external servers.
      </p>

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
