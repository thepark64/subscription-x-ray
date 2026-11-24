import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("identify-unknown-bank-debits")!;

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
    q: "Why does a recurring bank debit show a weird legal name instead of the app name?",
    a: "Merchants often bill under a registered parent private-limited company, an Indian payment gateway (such as Razorpay, Cashfree, BillDesk, or PayU), or a global aggregator like APPLE.COM/BILL instead of the consumer brand name.",
  },
  {
    q: "How can I tell if an unknown debit is a subscription or a one-off purchase?",
    a: "Compare at least 3 to 6 months of statements to see whether the same or similar rupee amount repeats near the same calendar date or interval, or carries UPI AutoPay, NACH, or SI narration codes.",
  },
  {
    q: "What should I do immediately if a debit is genuinely unauthorized?",
    a: "Contact your bank's fraud or customer-care helpline right away to report the unauthorized debit, freeze/replace compromised credentials if needed, revoke any unknown mandate, and keep the complaint ticket number.",
  },
  {
    q: "Can Subscription X-Ray tell me for sure if a merchant still has an active subscription?",
    a: "No. Statement analysis identifies recurring transaction patterns across past dates. It cannot look inside a private merchant account or guarantee a plan is still active — always confirm directly with your bank, UPI app, or merchant.",
  },
];

export default function IdentifyUnknownBankDebitsPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>Why bank narrations look unfamiliar at first glance</h2>
      <p>
        Finding an unrecognised debit on a bank or credit card statement does
        not automatically mean fraud — though it should always be investigated
        promptly. In India, statement narration fields are short and frequently
        truncate company names, combine 12-digit UPI RRN reference codes, or
        display the payment processor or parent company instead of the brand you
        remember signing up for.
      </p>

      <h2>Step-by-step: how to investigate an unknown bank debit</h2>
      <ol>
        <li>
          <strong>Read the rail prefix first:</strong> Check whether the
          statement line begins with <code>UPI</code>, <code>NACH</code> /{" "}
          <code>ACH</code> / <code>ECS</code>, <code>SI</code> /{" "}
          <code>ECOM</code> / <code>POS</code>, or <code>IMPS/NEFT</code>. Our{" "}
          <Link href="/guides/read-bank-statements">
            bank statement narration guide
          </Link>{" "}
          breaks down each Indian prefix.
        </li>
        <li>
          <strong>Compare repeated amounts and calendar dates:</strong> Look back
          across 3 to 12 months of statements. Does ₹199, ₹649, or ₹1,499 leave
          around the same date every month or quarter?{" "}
          <Link href="/scanner">Scan your statement CSV or PDF locally</Link> to
          cluster identical or near-identical amounts automatically.
        </li>
        <li>
          <strong>Search your email and SMS for that exact amount:</strong>{" "}
          Search Gmail or SMS for the exact rupee figure (for example,{" "}
          <code>649</code> or <code>499</code>) on that transaction date. Order
          receipts, e-mandate alerts, and GST invoices almost always show the
          consumer-facing service name alongside the legal entity.
        </li>
        <li>
          <strong>Inspect active mandates across all apps and portals:</strong>{" "}
          Check AutoPay inside Google Pay, PhonePe, Paytm, and BHIM; check{" "}
          <Link href="/guides/cancel-apple-subscription">Apple</Link> and{" "}
          <Link href="/guides/cancel-google-play-subscription">Google Play</Link>{" "}
          Subscriptions; and inspect your bank&apos;s NetBanking{" "}
          <Link href="/guides/cancel-nach-mandate">NACH Mandates</Link> and{" "}
          <Link href="/guides/cancel-credit-card-subscriptions">SI Hub</Link>.
        </li>
        <li>
          <strong>Contact your bank immediately if the debit is unauthorized:</strong>{" "}
          If neither you nor a family member authorized the merchant or mandate,
          notify your bank&apos;s official helpline at once, file a transaction
          dispute, and save the reference number. If a bank complaint remains
          unresolved, you can escalate through the{" "}
          <a
            href="https://cms.rbi.org.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            RBI Complaint Management System (CMS)
          </a>{" "}
          or NPCI&apos;s{" "}
          <a
            href="https://upihelp.npci.org.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            UPI Help portal
          </a>
          .
        </li>
      </ol>

      <h2>Common safety rules while investigating charges</h2>
      <div className="guide-note">
        <h3>Protect your banking credentials</h3>
        <ul>
          <li>
            <strong>Never share your UPI PIN, OTP, card PIN, or password:</strong>{" "}
            Genuine bank support, NPCI, and merchants never ask for an OTP or
            UPI PIN to &ldquo;cancel&rdquo; or &ldquo;refund&rdquo; a charge.
          </li>
          <li>
            <strong>Use official apps and helpline numbers only:</strong> Do not
            click unverified refund links or call customer care numbers found in
            random social media replies.
          </li>
        </ul>
      </div>

      <h2>Common problems &amp; solutions</h2>
      <ul>
        <li>
          <strong>Repeated UPI transfer turns out to be rent or a relative:</strong>{" "}
          Automated statement scanners match cadence and amount, so personal
          transfers can show up as <em>Possible</em> recurring items. Verify the
          payee name and leave legitimate personal transfers untouched.
        </li>
        <li>
          <strong>NACH debit has an opaque corporate code:</strong> Check your
          bank&apos;s NACH mandate dashboard for the UMRN and full sponsor name,
          or call your bank&apos;s branch desk to identify the sponsoring
          utility/lender/insurer.
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
