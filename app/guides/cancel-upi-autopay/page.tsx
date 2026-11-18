import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";
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

export default function CancelUpiAutopayPage() {
  return (
    <GuideLayout guide={guide}>
      <h2>What cancelling a UPI AutoPay mandate actually does</h2>
      <p>
        Under NPCI&apos;s UPI AutoPay lifecycle rules, cancelling (revoking) an
        AutoPay mandate permanently instructs your bank and UPI network to stop
        processing future automated debit requests under that mandate ID. You
        typically confirm the revocation with your UPI PIN so no third party can
        quietly pause or alter your standing authorization.
      </p>
      <p>
        Two practical distinctions prevent billing surprises:
      </p>
      <ul>
        <li>
          <strong>Revoking stops future debits, not past settlements:</strong>{" "}
          If a charge already settled yesterday or right before you revoked the
          mandate, cancelling the AutoPay entry does not trigger an automatic
          refund—you must request refunds directly from the merchant.
        </li>
        <li>
          <strong>Revoking is separate from merchant cancellation:</strong>{" "}
          Stopping the payment rail blocks auto-debits, whereas closing your
          plan inside Netflix, Spotify, or a SaaS billing dashboard ends the
          underlying subscription agreement so the merchant does not mark your
          account past-due or retry another saved card.
        </li>
      </ul>

      <div className="guide-note">
        <h3>Important note about Subscription X-Ray</h3>
        <p>
          Subscription X-Ray is a statement analysis tool, not a bank-connected
          cancellation agent. It cannot access your UPI app or revoke mandates
          automatically. After a scan identifies a recurring charge, use the
          merchant link and revocation checklist below inside your own UPI app.
        </p>
      </div>

      <h2>Pause vs Cancel: which option should you choose?</h2>
      <p>
        NPCI mandates require UPI apps and merchants to support pausing a UPI
        AutoPay mandate in addition to cancelling it. Choose <strong>Pause</strong>{" "}
        if you are taking a short break (such as pausing a gym membership or news
        subscription for a fixed window) and want to resume later without
        re-registering. Choose <strong>Cancel / Revoke</strong> when you want
        automatic debits stopped permanently.
      </p>

      <h2>How to check and revoke mandates in major UPI apps</h2>
      <p>
        Exact button labels and screen positions change occasionally across app
        updates on Android and iOS. Use the paths below as general navigation
        guidance based on standard UPI app layouts, and confirm inside the live
        app version installed on your phone:
      </p>

      <h3>Google Pay</h3>
      <ol>
        <li>Open Google Pay and tap your profile picture in the top-right corner.</li>
        <li>Select <strong>Autopay</strong> and review active mandates under the <strong>Live</strong> tab.</li>
        <li>Tap the merchant mandate you want to end.</li>
        <li>Choose <strong>Cancel autopay</strong> (or Pause if temporary) and enter your UPI PIN to confirm.</li>
      </ol>
      <p>
        If a mandate option does not appear or returns an error, open Google
        Pay&apos;s in-app <strong>Settings → Help &amp; feedback</strong> to
        contact support directly. Notice that exact menu labels can vary
        slightly across Android, iOS, and newer app versions.
      </p>

      <h3>PhonePe</h3>
      <ol>
        <li>Open PhonePe and tap your profile icon in the top-left corner.</li>
        <li>Scroll to payment management settings and select <strong>AutoPay</strong> (or Automatic Payments).</li>
        <li>Open the active mandate for the merchant you want to stop.</li>
        <li>Tap <strong>Remove AutoPay</strong> or <strong>Cancel Mandate</strong>, then confirm with your UPI PIN.</li>
      </ol>

      <h3>Paytm</h3>
      <ol>
        <li>Open Paytm and tap your profile icon in the top-left corner.</li>
        <li>Open <strong>UPI &amp; Payment Settings</strong> and choose <strong>Automatic Payments</strong>.</li>
        <li>Select the active recurring payment you no longer want.</li>
        <li>Tap <strong>Cancel Automatic Payment</strong> and verify with your UPI PIN.</li>
      </ol>

      <h3>BHIM (NPCI)</h3>
      <ol>
        <li>Open the BHIM app and navigate to <strong>Mandates</strong> / My Mandates from the home screen or menu.</li>
        <li>Filter for active mandates, choose the relevant merchant, and select <strong>Revoke</strong> or Cancel.</li>
        <li>Confirm the action with your UPI PIN.</li>
      </ol>

      <h3>If you cannot find the mandate or use a bank-branded UPI app</h3>
      <p>
        Active mandates normally sit inside the specific UPI app where you
        originally approved them, though many bank mobile apps (such as HDFC,
        SBI YONO, ICICI iMobile, or Axis) also expose UPI Mandates or Standing
        Instructions in NetBanking or mobile banking. If a third-party app fails
        to revoke a mandate, contact your issuing bank&apos;s customer support—your
        bank maintains the account-level mandate—or use NPCI&apos;s official UPI
        Help redressal portal (<code>upihelp.npci.org.in</code>). Note that
        certain loan or EMI-linked mandates may carry lender restrictions until
        the underlying obligation is closed.
      </p>

      <h2>How to verify whether a mandate is actually cancelled</h2>
      <p>
        Do not assume a tap worked without verifying the final state:
      </p>
      <ul>
        <li>
          <strong>Confirm status change in the UPI app:</strong> After entering
          your UPI PIN, the mandate should move out of the Active/Live list into
          a Revoked, Cancelled, or Completed section.
        </li>
        <li>
          <strong>Keep the confirmation SMS or notification:</strong> Banks and
          UPI apps normally send an SMS or push confirmation referencing the
          mandate or merchant name.
        </li>
        <li>
          <strong>Check the merchant billing page:</strong> Log into the
          streaming service, software tool, or app store (Google Play or Apple
          Subscriptions) and verify auto-renew shows as turned off.
        </li>
        <li>
          <strong>Inspect your next bank statement:</strong> A quick follow-up
          check after the old renewal date passes confirms no fallback card or{" "}
          <Link href="/guides/identify-nach-emandate">
            NACH e-Mandate
          </Link>{" "}
          billed the same service through another rail.
        </li>
      </ul>

      <p>
        Still unsure which recurring UPI entries exist across your accounts? Start
        by learning{" "}
        <Link href="/guides/find-upi-autopay-mandates">
          how to find UPI AutoPay mandates in India
        </Link>{" "}
        or check{" "}
        <Link href="/guides/recurring-card-payments">
          how to identify recurring card payments
        </Link>{" "}
        if a subscription switches to your debit or credit card.
      </p>

      <h2>Frequently asked questions</h2>
      <div className="guide-faq-list">
        <div className="guide-faq-item">
          <h3>Why do I need my UPI PIN to cancel an AutoPay mandate?</h3>
          <p>
            UPI apps require UPI PIN authentication on revocation actions in
            eligible flows so someone else cannot tamper with your active
            mandates without authorization.
          </p>
        </div>
        <div className="guide-faq-item">
          <h3>Can I delete the UPI app instead of cancelling the mandate?</h3>
          <p>
            No. Uninstalling Google Pay, PhonePe, or Paytm does not revoke the
            mandate stored with your bank and NPCI. You must explicitly revoke the
            mandate before removing an app.
          </p>
        </div>
        <div className="guide-faq-item">
          <h3>What if a charge still goes through after cancellation?</h3>
          <p>
            Check whether the payment happened over a credit card Standing
            Instruction or NACH e-Mandate instead of UPI AutoPay, or whether the
            cycle was already in settlement before revocation. Contact your bank
            and merchant with the confirmation reference.
          </p>
        </div>
      </div>
    </GuideLayout>
  );
}
