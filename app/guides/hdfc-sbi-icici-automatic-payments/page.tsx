import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";
import { getGuideBySlug } from "@/lib/guides";

const guide = getGuideBySlug("hdfc-sbi-icici-automatic-payments")!;

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

export default function HdfcSbiIciciAutomaticPaymentsPage() {
  return (
    <GuideLayout guide={guide}>
      <h2>Why HDFC, SBI, and ICICI statements look different</h2>
      <p>
        Every major Indian bank formats downloaded statements differently. Column
        names shift between <em>Narration</em>, <em>Description</em>, and{" "}
        <em>Particulars</em>; some exports separate <em>Withdrawal Amt</em> from{" "}
        <em>Deposit Amt</em>, while others use a single <em>Amount</em> column
        paired with a <code>Dr</code> / <code>Cr</code> marker. Understanding
        your bank&apos;s export format helps ensure you don&apos;t miss quiet
        recurring debits.
      </p>

      <h2>Recommended download formats before scanning</h2>
      <div className="guide-table-wrap">
        <table className="guide-table">
          <thead>
            <tr>
              <th>Export choice</th>
              <th>Why it works well</th>
              <th>Watch out for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Delimited CSV / Excel-saved CSV</td>
              <td>Cleanest column separation up to 100,000 rows</td>
              <td>Multi-line header banners above column titles (stripped automatically by Subscription X-Ray)</td>
            </tr>
            <tr>
              <td>Digital NetBanking PDF</td>
              <td>Preserves selectable text across 6–12 month statements</td>
              <td>Password locks (unlock locally in browser; never use scanned image PDFs)</td>
            </tr>
            <tr>
              <td>Credit Card monthly PDF</td>
              <td>Shows card Standing Instructions and USD SaaS charges</td>
              <td>Single-month PDFs lack a second cycle; combine or audit 3+ months</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Common automatic payment narration clues</h2>
      <p>
        While exact templates vary across savings accounts, salary accounts, and
        credit card tiers, watch for these common components in HDFC, SBI, ICICI,
        Axis, and Kotak statements:
      </p>
      <ul>
        <li>
          <strong>UPI AutoPay rows:</strong> Typically start with{" "}
          <code>UPI/</code> or <code>UPI-</code> followed by a 12-digit RRN,
          merchant short name, UPI handle (e.g., <code>@okaxis</code>,{" "}
          <code>@ybl</code>, <code>@okicici</code>), and sometimes{" "}
          <code>AUTOPAY</code>, <code>MANDATE</code>, or <code>REC</code>. Note
          that some banks omit <code>AUTOPAY</code> and print standard UPI strings
          for recurring pulls.
        </li>
        <li>
          <strong>NACH / ECS debits:</strong> Frequently include{" "}
          <code>NACH</code>, <code>ACH DR</code>, or <code>ECS</code> along
          with the corporate biller code for loans, SIPs, insurance, or gym
          memberships. See our{" "}
          <Link href="/guides/identify-nach-emandate">
            NACH and e-Mandate guide
          </Link>{" "}
          for UMRN verification tips.
        </li>
        <li>
          <strong>Standing Instructions &amp; card e-mandates:</strong> Card
          statements or debit card lines may contain <code>SI</code>,{" "}
          <code>STANDING INST</code>, or merchant aggregator prefixes such as
          Razorpay or BillDesk.
        </li>
      </ul>

      <h2>How to inspect multi-month statements privately</h2>
      <ol>
        <li>
          Sign in to HDFC NetBanking, SBI YONO / OnlineSBI, ICICI iMobile /
          NetBanking, Axis, or Kotak and download at least 3 to 12 months as{" "}
          <strong>CSV</strong> or <strong>selectable PDF</strong>.
        </li>
        <li>
          Avoid screenshotting or printing-to-image, because image PDFs have no
          selectable text layer.
        </li>
        <li>
          Drop the exported file into{" "}
          <Link href="/scanner">Subscription X-Ray</Link>—our parser detects both
          separate Withdrawal/Deposit columns and single Dr/Cr columns, unlocks
          password-protected PDFs inside browser memory, and flags repeating
          charges across cycles without uploading your raw bank file.
        </li>
      </ol>

      <h2>Frequently asked questions</h2>
      <div className="guide-faq-list">
        <div className="guide-faq-item">
          <h3>My bank PDF is password-protected. Is it safe to open in Subscription X-Ray?</h3>
          <p>
            Yes. Password unlocking runs locally via our browser PDF worker (
            <code>pdf.worker.min.mjs</code>). Neither your PDF file nor your PDF
            password is sent to external servers. Read{" "}
            <Link href="/how-it-works">how local parsing works</Link>.
          </p>
        </div>
        <div className="guide-faq-item">
          <h3>What if my bank export is in `.xls` or `.xlsx` instead of `.csv`?</h3>
          <p>
            Open the spreadsheet locally in Excel, LibreOffice Calc, or Numbers
            and save/export it as <strong>CSV (Comma delimited)</strong> before
            scanning.
          </p>
        </div>
      </div>
    </GuideLayout>
  );
}
