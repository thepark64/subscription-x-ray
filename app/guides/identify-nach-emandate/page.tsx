import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("identify-nach-emandate")!;

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

export default function IdentifyNachEmandatePage() {
  return (
    <GuideLayout guide={guide}>
      <h2>What NACH and e-Mandate mean in Indian banking</h2>
      <p>
        <strong>NACH (National Automated Clearing House)</strong> is a
        centralized interbank clearing system operated by NPCI that handles bulk
        and recurring bank-to-bank payments across India, having largely replaced
        older Electronic Clearing Service (ECS) workflows. An{" "}
        <strong>e-Mandate</strong> is the digital authorization you approve—via
        NetBanking, debit card, or Aadhaar e-Sign—allowing a biller, lender,
        insurer, or investment platform to pull recurring debits directly from
        your savings or current account under a{" "}
        <strong>Unique Mandate Reference Number (UMRN)</strong>.
      </p>
      <p>
        Unlike <Link href="/guides/find-upi-autopay-mandates">UPI AutoPay</Link>{" "}
        (which lives inside UPI apps) or{" "}
        <Link href="/guides/recurring-card-payments">
          card Standing Instructions
        </Link>{" "}
        (which sit on your debit or credit card), NACH mandates sit directly on
        your bank account. They are commonly used for loan EMIs, mutual fund
        SIPs, insurance premiums, credit card auto-debit, telecom/broadband
        bills, and recurring club or fitness memberships.
      </p>

      <h2>Common NACH and e-Mandate narration patterns</h2>
      <p>
        Bank narration templates vary across public-sector, private, and
        payments banks, so exact wording differs by institution. However,
        NACH-linked entries in India typically contain one or more of these
        identifiers:
      </p>

      <div className="guide-table-wrap">
        <table className="guide-table">
          <thead>
            <tr>
              <th>Code or narration clue</th>
              <th>Typical meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>NACH DR / NACH-DR / ACH DR</code>
              </td>
              <td>
                A NACH debit execution pulled from your account by an
                authorized sponsor bank or biller
              </td>
            </tr>
            <tr>
              <td>
                <code>ECS DR / ECS-DEBIT</code>
              </td>
              <td>
                Legacy ECS label still used on older bank exports for automated
                clearing house debits
              </td>
            </tr>
            <tr>
              <td>
                <code>EMANDATE / E-MANDATE</code>
              </td>
              <td>
                Transaction or setup event tied to an electronically approved
                bank mandate
              </td>
            </tr>
            <tr>
              <td>
                <code>UMRN</code> (20-character reference)
              </td>
              <td>
                Unique Mandate Reference Number identifying the exact NACH
                registration on file with your bank
              </td>
            </tr>
            <tr>
              <td>
                <code>NACH RTN / CHRG / BOUNCE</code>
              </td>
              <td>
                Mandate debit failure, return notification, or bank dishonour
                penalty—not an active subscription delivery
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>How to distinguish actual debits from registration entries</h2>
      <p>
        A frequent source of confusion when auditing bank statements is
        separating genuine recurring pulls from administrative mandate events:
      </p>
      <ul>
        <li>
          <strong>Check the Debit vs Credit columns first:</strong> Refunds or
          NACH credit payouts (dividends, subsidies, rebates) sometimes appear
          with <code>NACH CR</code> or <code>ACH CR</code>—make sure you only
          audit outflows in the Debit / Withdrawal column.
        </li>
        <li>
          <strong>Look out for registration or verification entries:</strong>{" "}
          Narration text containing terms like <em>mandate registration</em>,{" "}
          <em>setup</em>, or <em>revocation</em>, or a tiny ₹1–₹5 verification
          charge, indicates mandate lifecycle administration rather than a
          recurring monthly fee.
        </li>
        <li>
          <strong>Watch for return/bounce fees:</strong> Entries marked{" "}
          <em>reversed</em>, <em>dishonoured</em>, or <em>bounced</em> signal
          that an automated pull failed (often alongside a separate bank fee),
          not that a merchant bill succeeded cleanly.
        </li>
      </ul>

      <h2>How NPCI NACH e-Mandate cancellation rules work</h2>
      <p>
        Under NPCI guidelines, participating banks, corporates, and aggregators
        must offer customers transparent ways to cancel or suspend eligible NACH
        e-Mandates online or offline:
      </p>
      <ul>
        <li>
          <strong>Via your destination bank:</strong> Log into NetBanking or
          your bank&apos;s mobile app and open <em>E-Mandates</em>,{" "}
          <em>Standing Instructions</em>, or <em>Service Requests</em> to locate
          and cancel eligible mandates with an OTP.
        </li>
        <li>
          <strong>Via the corporate / biller portal or bank branch:</strong>{" "}
          Many insurers, NBFCs, and investment platforms host online mandate
          cancellation pages, or you can submit a stop/cancellation request
          with the UMRN at your home bank branch.
        </li>
        <li>
          <strong>Loan exceptions and settlement timing:</strong> For active
          loan EMIs, banks and lenders typically restrict direct online NACH
          cancellation unless a loan closure or No-Dues update is recorded,
          because stopping a payment rail never cancels a legal repayment
          obligation. Even on regular memberships, submit cancellations ahead of
          your billing date (requests submitted before bank cut-off windows are
          generally processed same day or next working day) and cancel with the
          merchant directly too.
        </li>
      </ul>

      <h2>How to verify an unfamiliar NACH or e-Mandate transaction</h2>
      <p>
        Because NACH narrations sometimes show only a short corporate code,
        aggregator name, or UMRN, never guess blindly:
      </p>
      <ol>
        <li>
          Copy the <strong>UMRN</strong> or corporate identifier from your bank
          statement line.
        </li>
        <li>
          Open your bank&apos;s <strong>Active Mandates / e-Mandate</strong>{" "}
          dashboard in NetBanking—banks usually display the full utility/lender
          name, maximum mandate cap, and start/end dates alongside the UMRN.
        </li>
        <li>
          Search your email inbox for that exact amount, mandate confirmation,
          or policy/loan number.
        </li>
        <li>
          If the entry remains unfamiliar, call your bank&apos;s customer care or
          visit your branch with the transaction date and UMRN so they can share
          the sponsor entity details.
        </li>
      </ol>

      <p>
        To inspect your full multi-month statement quickly, run a local browser
        scan in <Link href="/scanner">Subscription X-Ray</Link>, which
        separates <code>NACH / e-Mandate</code> labels from{" "}
        <code>UPI AutoPay</code> and filters failed or registration entries
        automatically. You can also learn how NACH compares with card mandates in{" "}
        <Link href="/guides/recurring-card-payments">
          our recurring card payments guide
        </Link>
        .
      </p>

      <h2>Frequently asked questions</h2>
      <div className="guide-faq-list">
        <div className="guide-faq-item">
          <h3>Is NACH the same as UPI AutoPay?</h3>
          <p>
            No. Both are operated by NPCI, but UPI AutoPay executes over UPI
            handles inside UPI apps, whereas NACH / e-Mandates operate directly
            between bank accounts using an account-level UMRN.
          </p>
        </div>
        <div className="guide-faq-item">
          <h3>Does cancelling a NACH e-Mandate cancel my loan or subscription?</h3>
          <p>
            No. Cancelling a NACH mandate only stops automatic bank debits. Any
            active loan EMI, insurance policy, or service contract remains valid
            until closed with the lender or merchant.
          </p>
        </div>
      </div>
    </GuideLayout>
  );
}
