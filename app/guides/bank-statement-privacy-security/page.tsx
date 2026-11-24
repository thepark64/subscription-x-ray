import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("bank-statement-privacy-security")!;

const FAQ_ITEMS: GuideFaqItem[] = [
  {
    q: "Can I remove a saved scan or delete my entire account later?",
    a: "Yes. Signed-in users can delete individual scans directly from Scan History or permanently delete their account and saved summaries inside the scanner top bar.",
  },
  {
    q: "Does Subscription X-Ray store my card number or UPI PIN when I pay ₹69?",
    a: "No. Checkout runs directly inside Cashfree Payments. Subscription X-Ray stores only payment verification metadata (Cashfree order and payment reference, amount, and status) to grant your 12 credits.",
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

export default function BankStatementPrivacySecurityPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
      <h2>Why sharing bank logins or raw statements carries risk</h2>
      <p>
        Bank statements expose far more than software subscriptions: they
        contain salary inflows, family transfers, opening and closing account
        balances, customer IDs, addresses, and full financial history. Many
        automated trackers ask for NetBanking credentials or upload raw CSV and
        PDF files—plus PDF unlock passwords—onto remote servers for parsing.
      </p>
      <p>
        Before using any statement tool, verify what leaves your browser, how
        PDF passwords are handled, and what data remains stored in your user
        account.
      </p>

      <h2>What to check before analyzing a bank statement online</h2>
      <ul>
        <li>
          <strong>Zero bank-password requirement:</strong> Legitimate
          statement-only analyzers read files you export yourself and never ask
          for your bank login, PIN, or OTP.
        </li>
        <li>
          <strong>In-browser parsing vs server upload:</strong> When CSV parsing
          and PDF text extraction execute locally in browser memory, your raw
          statement bytes and non-recurring transactions never travel over the
          network.
        </li>
        <li>
          <strong>Local PDF decryption:</strong> Password-protected bank PDFs
          should unlock on your device inside the local PDF worker rather than
          submitting your PAN/birth-date PDF password to an external API.
        </li>
        <li>
          <strong>Transparent deletion controls:</strong> You should be able to
          delete saved scan summaries or erase your entire account immediately.
        </li>
      </ul>

      <h2>Exactly what Subscription X-Ray keeps local vs stores</h2>
      <p>
        Verified against our application source code:
      </p>
      <div className="guide-table-wrap">
        <table className="guide-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Subscription X-Ray behaviour</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Raw CSV / PDF file</td>
              <td>Parsed in browser memory; never uploaded to servers</td>
            </tr>
            <tr>
              <td>PDF unlock password</td>
              <td>Processed locally by browser PDF worker; never sent</td>
            </tr>
            <tr>
              <td>Non-recurring transactions &amp; balances</td>
              <td>Ignored and discarded in browser memory</td>
            </tr>
            <tr>
              <td>Saved recurring summaries</td>
              <td>Stored in Supabase (merchant, amount, frequency, rail, reason)</td>
            </tr>
            <tr>
              <td>Account, credits &amp; payment verification</td>
              <td>Stored in Supabase Auth / DB; payments handled by Cashfree</td>
            </tr>
            <tr>
              <td>Privacy-safe analytics</td>
              <td>Counts file type &amp; scan completion only—no merchants or amounts</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Practical habits when exporting and reviewing statements</h2>
      <ol>
        <li>
          Download statements strictly from official bank websites or mobile
          apps—never over untrusted public Wi-Fi without HTTPS.
        </li>
        <li>
          Give scans neutral nicknames (like <code>Personal Checking Q3</code>)
          if you want extra separation when saving history.
        </li>
        <li>
          Use our privacy-safe share summary export or CSV checklist when sharing
          totals, and review our{" "}
          <Link href="/privacy">Privacy Policy</Link> or{" "}
          <Link href="/how-it-works">How It Works architecture</Link> anytime.
        </li>
      </ol>

      <h2>Frequently asked questions</h2>
      <div className="guide-faq-list">
        <div className="guide-faq-item">
          <h3>Can I remove a saved scan or delete my entire account later?</h3>
          <p>
            Yes. Signed-in users can delete individual scans directly from Scan
            History or permanently delete their account and saved summaries
            inside the scanner top bar.
          </p>
        </div>
        <div className="guide-faq-item">
          <h3>Does Subscription X-Ray store my card number or UPI PIN when I pay ₹69?</h3>
          <p>
            No. Checkout runs directly inside Cashfree Payments. Subscription
            X-Ray stores only payment verification metadata (Cashfree order and
            payment reference, amount, and status) to grant your 12 credits.
          </p>
        </div>
      </div>
    </GuideLayout>
  );
}
