import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("calculate-monthly-subscription-spending")!;

const FAQ_ITEMS: GuideFaqItem[] = [
  {
    q: "Should ₹1 or ₹2 mandate verification debits count toward monthly spend?",
    a: "No. Payment processors and banks routinely debit and reverse ₹1–₹5 to register an AutoPay or card mandate. Subscription X-Ray filters small verification holds and reversals out of your recurring total.",
  },
  {
    q: "How many months of statements do I need to include annual subscriptions?",
    a: "You need at least two charges to detect an interval automatically—so catching annual renewals requires exporting 13 to 15 months of history, whereas 3 to 6 months catches weekly, monthly, and quarterly plans.",
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

export default function CalculateMonthlySubscriptionSpendingPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>Why adding raw renewal bills distorts your monthly total</h2>
      <p>
        If you total only the subscriptions that hit in a single 30-day window,
        you miss quarterly fitness packs and annual cloud, software, or Prime
        renewals—or overcount when an annual bill happens to land that month.
        The accurate way to measure recurring spend is to convert every detected
        plan into a <strong>monthly equivalent</strong>.
      </p>

      <h2>Standard monthly equivalent formulas</h2>
      <div className="guide-table-wrap">
        <table className="guide-table">
          <thead>
            <tr>
              <th>Billing frequency</th>
              <th>Formula</th>
              <th>Illustrative example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Weekly (~7 days)</td>
              <td>
                <code>amount × 52 ÷ 12</code>
              </td>
              <td>₹199/week = ₹862.33/month</td>
            </tr>
            <tr>
              <td>Monthly (~30 days)</td>
              <td>
                <code>amount × 1</code>
              </td>
              <td>₹649/month = ₹649.00/month</td>
            </tr>
            <tr>
              <td>Quarterly (~90 days)</td>
              <td>
                <code>amount ÷ 3</code>
              </td>
              <td>₹1,497/quarter = ₹499.00/month</td>
            </tr>
            <tr>
              <td>Annual (~365 days)</td>
              <td>
                <code>amount ÷ 12</code>
              </td>
              <td>₹3,600/year = ₹300.00/month</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Why small recurring charges add up over twelve months</h2>
      <p>
        Individual subscriptions priced at ₹99, ₹130, or ₹199 look trivial next
        to rent or grocery bills. Multiplied across 12 months and combined
        across OTT, cloud storage, AI tools, and dormant mobile apps, small
        forgetting gaps compound cleanly:
      </p>
      <ul>
        <li>
          Three small unused apps averaging ₹199/month cost ₹597/month, or{" "}
          <strong>₹7,164/year</strong>.
        </li>
        <li>
          One forgotten quarterly membership (₹999/quarter) adds{" "}
          <strong>₹3,996/year</strong>.
        </li>
        <li>
          Adding a forgotten ₹1,499/year software renewal turns those five
          unused plans into <strong>₹12,659/year</strong> leaving quietly.
        </li>
      </ul>

      <h2>How to review subscriptions before they renew</h2>
      <ol>
        <li>
          <strong>Build a complete list once a quarter:</strong> Scan your
          savings and credit card statements in{" "}
          <Link href="/scanner">Subscription X-Ray</Link> to normalize weekly,
          monthly, quarterly, and annual charges into one monthly equivalent and
          12-month run-rate.
        </li>
        <li>
          <strong>Separate essential fixed debits from discretionary apps:</strong>{" "}
          Leave loan EMIs, insurance, and SIPs intact; mark unused OTT, SaaS,
          or memberships in the scanner savings checklist to see exact monthly
          and annual savings before cancelling.
        </li>
        <li>
          <strong>Export a CSV or PDF audit trail:</strong> Download your list so
          you can verify cancellations on your next month&apos;s statement using
          our{" "}
          <Link href="/guides/cancel-upi-autopay">
            UPI AutoPay cancellation checklist
          </Link>{" "}
          and{" "}
          <Link href="/guides/find-hidden-subscriptions">
            hidden subscription audit steps
          </Link>
          .
        </li>
      </ol>

      <h2>Frequently asked questions</h2>
      <div className="guide-faq-list">
        <div className="guide-faq-item">
          <h3>Should ₹1 or ₹2 mandate verification debits count toward monthly spend?</h3>
          <p>
            No. Payment processors and banks routinely debit and reverse ₹1–₹5
            to register an AutoPay or card mandate. Subscription X-Ray filters
            small verification holds and reversals out of your recurring total.
          </p>
        </div>
        <div className="guide-faq-item">
          <h3>How many months of statements do I need to include annual subscriptions?</h3>
          <p>
            You need at least two charges to detect an interval automatically—so
            catching annual renewals requires exporting 13 to 15 months of
            history, whereas 3 to 6 months catches weekly, monthly, and
            quarterly plans.
          </p>
        </div>
      </div>
    </GuideLayout>
  );
}
