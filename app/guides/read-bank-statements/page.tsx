import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("read-bank-statements")!;

const FAQ_ITEMS: GuideFaqItem[] = [
  {
    q: "Should I download CSV or PDF from NetBanking when auditing subscriptions?",
    a: "CSV is the cleanest format because column boundaries never wrap across lines. A digital PDF (including password-protected bank PDFs) also works well as long as the text is selectable—avoid scanned image PDFs.",
  },
  {
    q: "What is the difference between Transaction Date and Value Date?",
    a: "Transaction Date records when the debit took place, whereas Value Date records when funds settled for bank interest accounting. Use Transaction Date when checking subscription billing cycles.",
  },
];

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

export default function ReadBankStatementsPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>The core columns on every Indian bank statement</h2>
      <p>
        Whether you download a CSV export or a password-protected PDF from HDFC,
        SBI, ICICI, Axis, Kotak, or another Indian bank, nearly every account
        statement contains the same five core building blocks (though column
        names vary):
      </p>
      <ul>
        <li>
          <strong>Transaction Date vs Value Date:</strong> Transaction Date
          (often labelled <em>Txn Date</em>) is when the payment was initiated;
          Value Date is when funds cleared for interest calculation. Recurring
          billing calendars track Transaction Date closely.
        </li>
        <li>
          <strong>Narration / Particulars / Description:</strong> The dense
          text string containing the payment rail, merchant or recipient name,
          UPI VPA, IFSC code, and transaction reference number.
        </li>
        <li>
          <strong>Ref / Chq No / UTR:</strong> Cheque number, UPI RRN, or UTR
          settlement ID—unique per transaction.
        </li>
        <li>
          <strong>Debit (Withdrawal) vs Credit (Deposit) or Dr/Cr flag:</strong>{" "}
          Debits (<code>DR</code>) represent money leaving your account; Credits (
          <code>CR</code>) represent money arriving (salary, refunds, payouts).
          Some card statements put everything in a single <em>Amount</em> column
          with <code>Cr</code> next to refunds and payments.
        </li>
        <li>
          <strong>Closing / Running Balance:</strong> Account balance left
          immediately after that transaction settled.
        </li>
      </ul>

      <h2>Common Indian bank narration abbreviations explained</h2>
      <p>
        Banks pack several pieces of clearing metadata into one narration line
        using short slashes or hyphens. Here is what the most frequent codes
        mean:
      </p>

      <div className="guide-table-wrap">
        <table className="guide-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Stands for</th>
              <th>Where you see it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>UPI / P2M / P2A</code>
              </td>
              <td>Unified Payments Interface (Person-to-Merchant / Person-to-Account)</td>
              <td>Merchant checkouts, QR scans, and app payments</td>
            </tr>
            <tr>
              <td>
                <code>UPI-AUTOPAY / MANDATE</code>
              </td>
              <td>NPCI recurring UPI mandate execution</td>
              <td>Streaming, SaaS, SIPs, and utility mandates approved via UPI</td>
            </tr>
            <tr>
              <td>
                <code>NEFT / IMPS / RTGS</code>
              </td>
              <td>National Electronic Funds Transfer / Immediate Payment Service / Real Time Gross Settlement</td>
              <td>Bank-to-bank transfers, salaries, rent, and vendor payouts</td>
            </tr>
            <tr>
              <td>
                <code>NACH / ACH / ECS</code>
              </td>
              <td>National Automated Clearing House / Electronic Clearing Service</td>
              <td>Loan EMIs, mutual fund SIPs, insurance, and bank e-Mandates</td>
            </tr>
            <tr>
              <td>
                <code>POS / ECOM / SI</code>
              </td>
              <td>Point of Sale / E-Commerce / Standing Instruction</td>
              <td>Physical swipe, online card transaction, or recurring card SI</td>
            </tr>
            <tr>
              <td>
                <code>WDL / TFR / INFT / BIL</code>
              </td>
              <td>Withdrawal / Transfer / Internal Fund Transfer / Bill Payment</td>
              <td>ATM cash withdrawals, intra-bank transfers, and NetBanking billers</td>
            </tr>
            <tr>
              <td>
                <code>REV / CHRG</code>
              </td>
              <td>Reversal / Bank Charge</td>
              <td>Refunded failed debits, SMS fees, or debit-card annual fees</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>How UPI, NEFT, IMPS, NACH, and card descriptions look in practice</h2>
      <p>
        Exact string templates vary by bank and product type, so treat these as
        illustrative formats rather than fixed bank specifications:
      </p>
      <ul>
        <li>
          <strong>UPI transaction:</strong> Often begins with <code>UPI/</code>{" "}
          or <code>UPI-</code> followed by a 12-digit RRN, merchant name, UPI
          handle (like <code>@okaxis</code> or <code>@ybl</code>), and a note
          such as <code>AUTOPAY</code> or <code>MANDATE</code> when recurring.
        </li>
        <li>
          <strong>NEFT or IMPS transfer:</strong> Typically opens with{" "}
          <code>NEFT CR-</code>, <code>NEFT DR-</code>, or <code>IMPS/</code>{" "}
          followed by a UTR reference, remitter or beneficiary name, and an
          11-character IFSC code (e.g., 4 letters, a zero, then 6 characters).
        </li>
        <li>
          <strong>NACH / e-Mandate debit:</strong> Usually contains{" "}
          <code>NACH DR</code> or <code>ACH DR</code>, the biller/lender short
          name, and sometimes a UMRN mandate identifier. See{" "}
          <Link href="/guides/identify-nach-emandate">
            how to identify NACH and e-Mandate transactions
          </Link>{" "}
          for detailed examples.
        </li>
        <li>
          <strong>Card payment:</strong> Credit and debit card lines typically
          list the merchant billing descriptor, city or country code, and
          occasionally <code>SI</code> or <code>STANDING INST</code> when billed
          via an RBI Standing Instruction.
        </li>
      </ul>

      <h2>Why narration alone cannot always confirm a subscription</h2>
      <p>
        Many users assume a single line of text tells the full story. In
        practice, statement narrations often stay ambiguous on their own for
        four reasons:
      </p>
      <ol>
        <li>
          <strong>Missing AutoPay labels on plain UPI rows:</strong> Some bank
          exports print <code>UPI/123456789012/MERCHANT@OKICICI</code> for both
          one-off QR checkouts and recurring mandates.
        </li>
        <li>
          <strong>Aggregator masking:</strong> A payment routed through an
          aggregator may show the processor prefix or corporate holding name
          instead of the app logo you remember signing up with.
        </li>
        <li>
          <strong>Single-month snapshots hide cadence:</strong> You cannot tell
          from one 30-day statement whether a ₹999 debit is a one-time buy or a
          recurring quarterly or monthly plan.
        </li>
        <li>
          <strong>Bank fees vs merchant plans:</strong> Annual debit-card fees,
          SMS alert charges, or bounce penalties repeat periodically from your
          own bank and should not be mistaken for third-party apps.
        </li>
      </ol>

      <h2>Putting it together cleanly</h2>
      <p>
        When reviewing your statements, export at least 3 to 12 months in CSV or
        digital PDF format, ignore credit/reversal rows, and group normalized
        merchant strings by date interval. If you prefer an automated browser-only
        pass that parses Indian date formats, strips UPI/IFSC noise, and flags
        recurring intervals without uploading your raw statement, try{" "}
        <Link href="/scanner">Subscription X-Ray</Link> or explore{" "}
        <Link href="/guides/find-hidden-subscriptions">
          our guide to finding hidden subscriptions
        </Link>
        .
      </p>

      <h2>Frequently asked questions</h2>
      <div className="guide-faq-list">
        <div className="guide-faq-item">
          <h3>Should I download CSV or PDF from NetBanking when auditing subscriptions?</h3>
          <p>
            CSV is the cleanest format because column boundaries never wrap
            across lines. A digital PDF (including password-protected bank PDFs)
            also works well as long as the text is selectable—avoid scanned image
            PDFs.
          </p>
        </div>
        <div className="guide-faq-item">
          <h3>What is the difference between Transaction Date and Value Date?</h3>
          <p>
            Transaction Date records when the debit took place, whereas Value
            Date records when funds settled for bank interest accounting. Use
            Transaction Date when checking subscription billing cycles.
          </p>
        </div>
      </div>
    </GuideLayout>
  );
}
