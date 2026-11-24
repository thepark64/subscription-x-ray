import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("cancel-nach-mandate")!;

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
    q: "What is a NACH mandate or UMRN?",
    a: "NACH (National Automated Clearing House) is NPCI's bank-to-bank recurring debit system used for SIPs, loans, insurance premiums, and utility bills. Every registered mandate carries a unique UMRN (Unique Mandate Reference Number).",
  },
  {
    q: "Can I cancel a NACH mandate linked to an active loan EMI or credit obligation?",
    a: "Loan, EMI, and financing mandates typically cannot be cancelled arbitrarily while an active repayment obligation exists, or doing so may trigger bounced-mandate penalties. Always settle or close the underlying facility or shift your repayment account with the lender first.",
  },
  {
    q: "How long does NACH mandate cancellation take?",
    a: "Processing timelines vary across banks and sponsor institutions. Submit your stop/cancellation request well ahead of the next scheduled debit date and keep written acknowledgement until your statement confirms debits have stopped.",
  },
  {
    q: "Can Subscription X-Ray cancel my NACH mandate?",
    a: "No. Subscription X-Ray detects NACH or eMandate patterns from your uploaded statement locally in your browser. Only you, your bank, or the registering institution can cancel an active NACH mandate.",
  },
];

export default function CancelNachMandatePage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>What a NACH or eMandate debit means on your bank statement</h2>
      <p>
        NACH (National Automated Clearing House), managed by NPCI, is an
        account-to-account clearing rail used across India for mutual fund SIPs,
        insurance renewals, utility bills, memberships, and loan EMIs. On bank
        statements it commonly appears with codes like <code>NACH</code>,{" "}
        <code>ACH</code>, <code>ECS</code>, or <code>EMANDATE</code> alongside
        a sponsor or utility reference.
      </p>
      <p>
        Unlike a{" "}
        <Link href="/guides/cancel-upi-autopay">UPI AutoPay mandate</Link>{" "}
        inside a mobile wallet app, NACH sits directly on your savings or
        current bank account. Exact cancellation menus and documentation rules
        vary by bank, merchant/lender, and mandate type.
      </p>

      <h2>Step-by-step: how to cancel a NACH or eMandate</h2>
      <ol>
        <li>
          <strong>Identify the debit and merchant clearly:</strong> Check the
          statement narration, date, and amount for the NACH/ACH/eMandate entry.
          Look for the <strong>UMRN</strong> (Unique Mandate Reference Number)
          in your NetBanking mandate list, e-mandate confirmation email, or
          statement remarks.
        </li>
        <li>
          <strong>Locate the active mandate in your bank portal:</strong> Sign
          in to NetBanking or mobile banking and look under sections typically
          named <em>Mandates</em>, <em>e-Mandate / NACH</em>,{" "}
          <em>Standing Instructions</em>, or <em>Auto Debit</em>. Some older
          paper mandates may not have an online cancel button and require a
          service request or branch visit.
        </li>
        <li>
          <strong>Confirm whether the underlying agreement is discretionary or contractual:</strong>{" "}
          Discretionary memberships, donations, or SIPs can usually be paused or
          cancelled cleanly. By contrast, active loans, EMIs, or legally binding
          installments carry contractual obligations — coordinate directly with
          the lender before revoking a debit rail so you do not incur bounce
          fees or late marks.
        </li>
        <li>
          <strong>Submit a cancellation / stop request with both the bank and merchant:</strong>{" "}
          Cancel or pause the plan inside the merchant, mutual fund AMC, or
          insurer portal, and submit the NACH mandate cancellation request
          through your bank&apos;s online mandate portal, customer care, or home
          branch with your UMRN.
        </li>
        <li>
          <strong>Keep confirmation and audit your next cycle:</strong> Save the
          service request number, email confirmation, or stamped branch form, and
          verify the following month&apos;s statement shows zero debits under
          that UMRN.
        </li>
      </ol>

      <h2>Common problems &amp; solutions</h2>
      <ul>
        <li>
          <strong>No online &ldquo;Cancel&rdquo; option in NetBanking:</strong>{" "}
          Contact your bank&apos;s customer care or branch with the UMRN and
          sponsor merchant name to submit a formal NACH mandate withdrawal
          request, and ask the registered merchant/AMC to send an entity-side
          cancellation instruction.
        </li>
        <li>
          <strong>You do not recognize the NACH recipient code:</strong>{" "}
          Corporate codes in NACH narrations are often abbreviated. Compare the
          exact amount and billing day against insurance policies, SIPs, and
          loans, or review{" "}
          <Link href="/guides/identify-nach-emandate">
            how to identify NACH and eMandate transactions
          </Link>{" "}
          and{" "}
          <Link href="/guides/identify-unknown-bank-debits">
            identifying unknown bank debits
          </Link>
          .
        </li>
        <li>
          <strong>Debit happened days after submitting cancellation:</strong>{" "}
          NACH batches are queued ahead of settlement. Keep your dated
          acknowledgement reference; if an unauthorized debit occurs after the
          bank&apos;s notice period, escalate to your bank&apos;s grievance desk
          or through{" "}
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
