import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("cancel-upi-autopay")!;

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
    q: "Why do I need my UPI PIN to cancel an AutoPay mandate?",
    a: "UPI apps typically require UPI PIN authentication on revocation actions so someone else with temporary access to your phone cannot tamper with your active mandates without authorization.",
  },
  {
    q: "Can I delete the UPI app instead of cancelling the mandate?",
    a: "No. Uninstalling Google Pay, PhonePe, or Paytm does not revoke the mandate stored with your bank and NPCI. Always revoke the mandate first and verify its status changes to Revoked or Cancelled.",
  },
  {
    q: "What if a charge still goes through after cancellation?",
    a: "Check whether the payment happened over a credit card Standing Instruction or NACH eMandate instead of UPI AutoPay, or whether the cycle had already entered settlement before revocation. Contact your bank and merchant with your cancellation reference.",
  },
  {
    q: "How do I see UPI AutoPay mandates created in an app I deleted?",
    a: "Reinstall the UPI app with the same bank-linked mobile number, check your bank mobile app or NetBanking mandate management tab, or review NPCI's official MyUPI information portal for unified mandate awareness options.",
  },
];

export default function CancelUpiAutopayPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>What cancelling a UPI AutoPay mandate actually does</h2>
      <p>
        Under NPCI&apos;s UPI AutoPay lifecycle rules, cancelling (revoking) an
        AutoPay mandate instructs your bank and the UPI network to stop
        processing future automated debit requests under that mandate ID. You
        typically confirm revocation with your UPI PIN so no third party can
        silently alter your authorization.
      </p>
      <ul>
        <li>
          <strong>Revoking stops future debits, not past settlements:</strong>{" "}
          If a charge already settled before you revoked the mandate,
          cancelling AutoPay does not automatically issue a refund — request any
          eligible refund directly from the merchant.
        </li>
        <li>
          <strong>Revoking is separate from merchant cancellation:</strong>{" "}
          Stopping the payment rail blocks future UPI debits, whereas closing
          your plan inside the merchant account ends the underlying subscription
          agreement so the merchant does not retry another saved card or mark an
          invoice past-due.
        </li>
      </ul>

      <h2>Pause vs Cancel: which option should you choose?</h2>
      <p>
        Most NPCI-compliant UPI apps support pausing an eligible AutoPay mandate
        in addition to permanent cancellation. Choose <strong>Pause</strong> if
        you are taking a short break (such as pausing a publication or fitness
        plan for a defined period) and want to resume later. Choose{" "}
        <strong>Cancel / Revoke</strong> when you want recurring UPI debits
        stopped permanently.
      </p>

      <h2>How to check and revoke mandates in major UPI apps</h2>
      <p>
        Exact button names and menu positions vary across app versions, banks,
        Android, and iOS. Use the steps below as general guidance and confirm the
        live status inside your own app:
      </p>

      <h3>Google Pay</h3>
      <ol>
        <li>
          Open Google Pay and tap your profile picture in the top-right corner.
        </li>
        <li>
          Select <strong>Autopay</strong> and review active mandates under the{" "}
          <strong>Live</strong> tab.
        </li>
        <li>Tap the merchant mandate you want to end.</li>
        <li>
          Choose <strong>Cancel autopay</strong> (or Pause if temporary) and
          enter your UPI PIN to confirm.
        </li>
      </ol>

      <h3>PhonePe</h3>
      <ol>
        <li>Open PhonePe and tap your profile icon in the top-left corner.</li>
        <li>
          Go to payment management settings and select <strong>AutoPay</strong>{" "}
          (or Automatic Payments).
        </li>
        <li>Open the active mandate for the merchant you want to stop.</li>
        <li>
          Tap <strong>Remove AutoPay</strong> or <strong>Cancel Mandate</strong>
          , then confirm with your UPI PIN.
        </li>
      </ol>

      <h3>Paytm</h3>
      <ol>
        <li>Open Paytm and tap your profile icon in the top-left corner.</li>
        <li>
          Open <strong>UPI &amp; Payment Settings</strong> and choose{" "}
          <strong>Automatic Payments</strong>.
        </li>
        <li>Select the active recurring payment you no longer want.</li>
        <li>
          Tap <strong>Cancel Automatic Payment</strong> and verify with your UPI
          PIN.
        </li>
      </ol>

      <h3>BHIM (NPCI) &amp; NPCI MyUPI</h3>
      <ol>
        <li>
          Open the BHIM app and navigate to <strong>Mandates</strong> / My
          Mandates from the home screen or menu.
        </li>
        <li>
          Filter for active mandates, select the merchant, and choose{" "}
          <strong>Revoke</strong> or Cancel, then confirm with your UPI PIN.
        </li>
        <li>
          To learn about NPCI&apos;s central UPI user tools and mandate support,
          review official documentation on{" "}
          <a
            href="https://www.npci.org.in/product/myupi.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            NPCI MyUPI
          </a>{" "}
          and NPCI&apos;s{" "}
          <a
            href="https://upihelp.npci.org.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            official UPI Help portal
          </a>
          .
        </li>
      </ol>

      <h2>Common problems &amp; solutions</h2>
      <ul>
        <li>
          <strong>Mandate missing from your main UPI app:</strong> UPI AutoPay
          mandates live in the specific app where you originally approved them
          (Google Pay, PhonePe, Paytm, BHIM, or bank UPI). Check any secondary
          UPI apps on your phone and your issuing bank&apos;s NetBanking / mobile
          app mandate menu.
        </li>
        <li>
          <strong>Cancel button greyed out or returning an error:</strong> Wait
          until a pending execution window clears (if a renewal is already
          within its 24-hour pre-debit window) or contact your issuing bank
          customer support with the mandate UMN / reference number. Note that
          certain loan or EMI-linked obligations cannot be unilaterally stopped
          until closed with the lender.
        </li>
        <li>
          <strong>Merchant switches to a saved debit/credit card:</strong> After
          revoking UPI AutoPay, sign in to the merchant account and turn off
          auto-renewal there too. Check{" "}
          <Link href="/guides/cancel-credit-card-subscriptions">
            how to cancel credit card subscriptions
          </Link>{" "}
          if a backup card took over.
        </li>
      </ul>

      <h2>How to verify cancellation is complete</h2>
      <ul>
        <li>
          <strong>Confirm status change:</strong> After entering your UPI PIN,
          verify the mandate leaves the Active/Live list and shows as Revoked or
          Cancelled.
        </li>
        <li>
          <strong>Keep the SMS or push confirmation:</strong> Save the bank or
          UPI confirmation notification with the date and merchant reference.
        </li>
        <li>
          <strong>Audit your next statement:</strong> Run a quick statement check
          after the old billing date to ensure no fallback{" "}
          <Link href="/guides/cancel-nach-mandate">NACH eMandate</Link> or{" "}
          <Link href="/guides/stop-recurring-card-payments">
            recurring card payment
          </Link>{" "}
          took over.
        </li>
      </ul>

      <p>
        Need to locate all your recurring mandates first? Read{" "}
        <Link href="/guides/find-upi-autopay-mandates">
          how to find UPI AutoPay mandates in India
        </Link>{" "}
        or browse the{" "}
        <Link href="/help">Forgotten Subscription Help Center</Link>.
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
