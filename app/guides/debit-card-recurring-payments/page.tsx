import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("debit-card-recurring-payments")!;

const FAQ_ITEMS: GuideFaqItem[] = [
  {
    q: "Why do some debit card subscriptions not show SI in the narration?",
    a: "Many bank statement formats only print the card prefix (such as ECOM or POS) plus the merchant descriptor. Checking multiple months of date intervals (~30 days or ~365 days) identifies repeating card debits even when SI is omitted.",
  },
  {
    q: "Does blocking a debit card stop recurring NACH or UPI AutoPay debits?",
    a: "No. Blocking or replacing a debit card stops future charges billed to that card number, but NACH mandates and UPI AutoPay pull directly from your bank account. Revoke each mandate on its respective rail.",
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

export default function DebitCardRecurringPaymentsPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>Where debit card subscriptions appear in India</h2>
      <p>
        Unlike credit cards, recurring debit card subscriptions pull funds
        directly from your linked savings account—so every automatic charge
        appears inside your regular bank account passbook or CSV/PDF statement
        rather than a separate card bill. Because savings statements mix ATM
        cash withdrawals, NEFT transfers, UPI QR checkouts, and debit card
        debits on the same ledger, recurring debit card charges are easy to
        overlook.
      </p>
      <p>
        To inspect them reliably, you need to recognize both RBI e-mandate
        Standing Instructions on your debit card and savings-account debits
        routed through merchant payment aggregators.
      </p>

      <h2>How to separate debit card mandates from UPI and NACH</h2>
      <div className="guide-table-wrap">
        <table className="guide-table">
          <thead>
            <tr>
              <th>Statement cue</th>
              <th>Underlying rail</th>
              <th>Where you manage it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>POS</code>, <code>ECOM</code>, <code>DEBIT CARD</code>, or{" "}
                <code>SI</code>
              </td>
              <td>Debit card purchase or RBI card Standing Instruction</td>
              <td>Issuing bank SI Hub portal + merchant billing settings</td>
            </tr>
            <tr>
              <td>
                <code>UPI-AUTOPAY</code>, <code>MANDATE</code>, or{" "}
                <code>UPI/</code> handle
              </td>
              <td>NPCI UPI AutoPay mandate</td>
              <td>Google Pay, PhonePe, Paytm, or BHIM AutoPay menu</td>
            </tr>
            <tr>
              <td>
                <code>NACH DR</code>, <code>ACH DR</code>, or <code>ECS</code>
              </td>
              <td>Bank account NACH / e-Mandate</td>
              <td>NetBanking mandate cancellation or lender/biller desk</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Step-by-step: audit debit card recurring charges safely</h2>
      <ol>
        <li>
          <strong>Download 6 to 12 months of savings statements:</strong> Use a
          CSV export or selectable digital PDF from NetBanking so quarterly and
          annual debit card renewals both appear.
        </li>
        <li>
          <strong>Check your issuing bank&apos;s SI Hub portal:</strong> Under
          RBI recurring card rules, major Indian issuers maintain a Standing
          Instruction Hub (accessible from your bank&apos;s official NetBanking
          or cards portal) listing active debit and credit card e-mandates.
        </li>
        <li>
          <strong>Compare SI Hub entries with actual debits:</strong> International
          SaaS apps, Apple/Google Play billing, or legacy international card
          charges sometimes bill outside domestic SI Hub dashboards—scanning
          your raw savings statement catches them both.
        </li>
        <li>
          <strong>Watch for exchange-rate drift on USD plans:</strong> A $10
          software plan billed on an Indian debit card settles at slightly
          different INR totals each month due to FX rates and bank cross-currency
          markups.
        </li>
      </ol>

      <h2>Checking your savings statement locally</h2>
      <p>
        <Link href="/scanner">Subscription X-Ray</Link> strips changing reference
        numbers inside browser memory, allows minor amount drift for FX-billed
        tools, labels likely <code>Card SI</code> debits alongside{" "}
        <Link href="/guides/find-upi-autopay-mandates">UPI AutoPay</Link> and{" "}
        <Link href="/guides/identify-nach-emandate">NACH</Link>, and leaves raw
        statement lines on your device. See also{" "}
        <Link href="/guides/recurring-card-payments">
          how to identify recurring card payments
        </Link>{" "}
        and{" "}
        <Link href="/guides/hdfc-sbi-icici-automatic-payments">
          how HDFC, SBI, and ICICI label automatic debits
        </Link>
        .
      </p>

      <h2>Frequently asked questions</h2>
      <div className="guide-faq-list">
        <div className="guide-faq-item">
          <h3>Why do some debit card subscriptions not show SI in the narration?</h3>
          <p>
            Many bank statement formats only print the card prefix (such as{" "}
            <code>ECOM</code> or <code>POS</code>) plus the merchant descriptor.
            Checking multiple months of date intervals (~30 days or ~365 days)
            identifies repeating card debits even when <code>SI</code> is omitted.
          </p>
        </div>
        <div className="guide-faq-item">
          <h3>Does blocking a debit card stop recurring NACH or UPI AutoPay debits?</h3>
          <p>
            No. Blocking or replacing a debit card stops future charges billed
            to that card number, but NACH mandates and UPI AutoPay pull directly
            from your bank account. Revoke each mandate on its respective rail.
          </p>
        </div>
      </div>
    </GuideLayout>
  );
}
