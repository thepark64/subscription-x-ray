import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { MultiAppUpiDiagram } from "@/components/SeoIllustrations";
import TrackedLink from "@/components/TrackedLink";
import { PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("find-upi-autopay-mandates")!;

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
    q: "Why did I see a ₹1 or ₹2 UPI AutoPay entry that did not repeat?",
    a: "Merchants often trigger a small ₹1–₹5 registration or penny-drop authentication check when you authorize a UPI AutoPay mandate. It is a setup ping rather than your recurring subscription fee.",
  },
  {
    q: "Does Subscription X-Ray connect directly to Google Pay or PhonePe?",
    a: "No. Subscription X-Ray never connects to your UPI apps, bank logins, or NPCI APIs. It analyzes CSV and digital PDF bank statements locally in browser memory.",
  },
  {
    q: "How many months of bank statements should I export?",
    a: "Export at least 3 to 6 months to detect monthly subscriptions accurately, and 13+ months if you want to catch forgotten annual memberships.",
  },
  {
    q: "Where do I find a UPI AutoPay mandate created in an app I already uninstalled?",
    a: "Uninstalling Google Pay, PhonePe, or Paytm does not stop the mandate. Reinstall the app with your bank-linked mobile number, inspect your bank mobile app's UPI mandate tab, or check NPCI's official MyUPI portal information.",
  },
];

export default function FindUpiAutopayMandatesPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>What UPI AutoPay is</h2>
      <p>
        <strong>UPI AutoPay</strong> is a recurring-payment feature built by the
        National Payments Corporation of India (NPCI) on top of Unified Payments
        Interface (UPI). Instead of manually approving every renewal with your
        UPI PIN, you approve a one-time mandate when starting an OTT plan, music
        app, SaaS tool, utility bill, insurance premium, or mutual fund SIP. Once
        active, future debits run automatically on the agreed schedule until you
        pause, revoke, or reach the mandate end date.
      </p>
      <p>
        Under NPCI and Reserve Bank of India (RBI) rules, general subscription
        and merchant AutoPay mandates up to <strong>₹15,000 per debit</strong>{" "}
        can execute without prompting for your UPI PIN on every billing cycle.
        For specified high-value categories—mutual fund SIPs, insurance
        premiums, and credit card bill payments—automated execution without
        per-cycle UPI PIN applies up to <strong>₹1,00,000</strong>. In
        addition, NPCI rules require a pre-debit notification at least 24 hours
        before funds leave your account.
      </p>

      <h2>How recurring UPI payments actually appear on your bank account</h2>
      <p>
        When a user approves a UPI AutoPay mandate in Google Pay, PhonePe,
        Paytm, BHIM, or a bank UPI app, the merchant normally triggers a tiny
        setup or authorization check—typically ₹1 to ₹5—before full subscription
        billing begins. Later, actual cycle debits execute through the same
        mandate ID, but your bank statement line looks different every single
        month because banks append a new UPI Reference Number (RRN) or settlement
        timestamp to each debit.
      </p>
      <p>
        Checking only one UPI app leaves blind spots: mandates created in an
        older app continue debiting your underlying bank account even if you no
        longer open that app daily.
      </p>

      <MultiAppUpiDiagram />

      <h2>How to spot UPI AutoPay entries in Indian bank statements</h2>
      <p>
        While each Indian bank formats its CSV and PDF columns slightly
        differently, AutoPay transactions usually carry recognizable markers
        within the narration or description field. Here are representative
        patterns to look for (exact wording varies by bank and payment
        aggregator):
      </p>

      <div className="guide-table-wrap">
        <table className="guide-table">
          <thead>
            <tr>
              <th>Representative statement text</th>
              <th>What it usually means</th>
              <th>Subscription status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>UPI-AUTOPAY-NETFLIX@OKAXIS-408112233445</code>
              </td>
              <td>Recurring UPI AutoPay execution debit with merchant VPA</td>
              <td>Active recurring charge</td>
            </tr>
            <tr>
              <td>
                <code>UPI MANDATE CREATION NETFLIX@OKAXIS · ₹2.00</code>
              </td>
              <td>Low-value mandate registration or verification ping</td>
              <td>Setup event, not ongoing monthly cost</td>
            </tr>
            <tr>
              <td>
                <code>UPI/409771122888/GOOGLE ONE@OKICICI</code>
              </td>
              <td>Regular merchant debit over UPI without explicit AutoPay tag</td>
              <td>Possible recurring charge if interval &amp; amount match</td>
            </tr>
            <tr>
              <td>
                <code>PAYMANDATE / MANDATEEXEC / UPI-SI</code>
              </td>
              <td>Bank settlement code for a scheduled UPI mandate debit</td>
              <td>Active recurring charge</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Notice that plain UPI strings sometimes omit the word{" "}
        <code>AUTOPAY</code> even when a recurring mandate triggered the debit.
        See our{" "}
        <Link href="/guides/hdfc-sbi-icici-automatic-payments">
          HDFC, SBI &amp; ICICI statement export guide
        </Link>{" "}
        or{" "}
        <Link href="/guides/read-bank-statements">
          reading Indian bank statement narrations
        </Link>{" "}
        for exact column and prefix breakdowns.
      </p>

      <h2>Where to check active AutoPay inside major UPI apps</h2>
      <p>
        Exact button wording varies slightly by app version and bank, so check
        every UPI app linked to your savings account:
      </p>
      <ul>
        <li>
          <strong>Google Pay:</strong> Profile photo → <em>Autopay</em> → review{" "}
          <em>Live</em> mandates.
        </li>
        <li>
          <strong>PhonePe:</strong> Profile icon → <em>AutoPay</em> (or{" "}
          <em>Automatic Payments</em>).
        </li>
        <li>
          <strong>Paytm:</strong> Profile icon → <em>UPI &amp; Payment Settings</em>{" "}
          → <em>Automatic Payments</em>.
        </li>
        <li>
          <strong>BHIM (NPCI):</strong> Home → <em>My Mandates</em> →{" "}
          <em>Active</em>.
        </li>
      </ul>
      <p>
        For official NPCI UPI user awareness tools and mandate complaint paths,
        consult{" "}
        <a
          href="https://www.npci.org.in/product/myupi.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          NPCI MyUPI
        </a>{" "}
        and{" "}
        <a
          href="https://upihelp.npci.org.in/"
          target="_blank"
          rel="noopener noreferrer"
        >
          NPCI UPI Help
        </a>
        .
      </p>

      <h2>How to audit UPI AutoPay manually vs with Subscription X-Ray</h2>
      <p>
        Exporting 3 to 12 months of bank statements as CSV or digital PDF lets
        you inspect actual debits regardless of which app originally set up the
        mandate. <Link href="/scanner">Subscription X-Ray</Link> parses that
        statement strictly inside browser memory—raw files and PDF passwords
        never leave your device—and automates the cleanup:
      </p>
      <ul>
        <li>
          <strong>Strips changing reference numbers:</strong> Removes RRN digits,
          IFSC codes, and UPI handles like <code>@okaxis</code> or{" "}
          <code>@oksbi</code> before grouping transactions by merchant.
        </li>
        <li>
          <strong>Separates real debits from noise:</strong> Filters out
          reversals, failed/declined entries, mandate revocation rows, and
          ₹1–₹5 verification pings so registration holds do not inflate totals.
        </li>
        <li>
          <strong>Labels payment rails &amp; confidence:</strong> Flags explicit{" "}
          <code>UPI AutoPay</code> markers separately from plain{" "}
          <code>UPI</code> patterns and assigns high, medium, or possible
          confidence ratings based on cadence consistency.
        </li>
      </ul>

      <div className="guide-inline-cta">
        <div className="guide-inline-cta-copy">
          <strong>Spot every UPI AutoPay &amp; hidden debit in one scan</strong>
          <span>
            {PACK_PRICE_LABEL} once unlocks {PACK_SIZE} non-expiring browser-local
            scans. Valid statements with zero recurring charges spend zero
            credits.
          </span>
        </div>
        <TrackedLink
          className="btn btn-primary button-sm"
          href="/scanner"
          trackLocation="guide_upi_autopay_inline"
          trackLabel="Scan bank statement"
        >
          <span>Scan bank statement</span>
          <ArrowRight size={15} aria-hidden="true" />
        </TrackedLink>
      </div>

      <h2>Limitations and possible false positives</h2>
      <p>
        Statement pattern matching is a diagnostic aid, not a live bank mandate
        registry. Keep these realistic limits in mind when reviewing results:
      </p>
      <ul>
        <li>
          <strong>Manual monthly UPI transfers can look recurring:</strong>{" "}
          Sending the same amount via UPI to your house help, milk vendor,
          tuition teacher, or landlord around the first week of every month
          creates a 30-day cadence that automated grouping can flag as a
          possible recurring payment.
        </li>
        <li>
          <strong>Variable utility bills may miss tight spread checks:</strong>{" "}
          Postpaid mobile or electricity bills whose rupee amounts swing widely
          month to month may not pass fixed-amount tolerance thresholds.
        </li>
        <li>
          <strong>Label differences across banks:</strong> Some banks print{" "}
          <code>UPI-P2M</code> without writing <code>AUTOPAY</code>. When a
          charge repeats cleanly for Netflix, Spotify, or Google One without
          mandate text, Subscription X-Ray flags it under <code>UPI</code> with
          service context rather than claiming an explicit AutoPay tag that was
          not in your file.
        </li>
        <li>
          <strong>Annual mandates need 12+ months of data:</strong> A 3-month
          CSV export cannot reveal an annual AutoPay renewal that only hit once
          in the window.
        </li>
      </ul>

      <h2>Next step once you locate an unwanted mandate</h2>
      <p>
        Finding a recurring UPI debit is half the job—always close the plan with
        the merchant and revoke the mandate inside your UPI app (requiring your
        UPI PIN) so no future cycle fires. Follow our companion guide on{" "}
        <Link href="/guides/cancel-upi-autopay">
          how to cancel UPI AutoPay mandates
        </Link>
        , catch upcoming{" "}
        <Link href="/guides/stop-forgotten-free-trials">
          free trial renewals
        </Link>
        , or compare bank-level debits in{" "}
        <Link href="/guides/identify-nach-emandate">
          our NACH and eMandate guide
        </Link>
        .
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
