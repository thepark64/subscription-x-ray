import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import GuideLayout, { type GuideFaqItem } from "@/components/GuideLayout";
import { BankStatementFormatsDiagram } from "@/components/SeoIllustrations";
import TrackedLink from "@/components/TrackedLink";
import { PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";
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

const FAQ_ITEMS: GuideFaqItem[] = [
  {
    q: "My bank PDF is password-protected. Is it safe to open in Subscription X-Ray?",
    a: "Yes. Password unlocking runs locally via our browser PDF worker (pdf.worker.min.mjs). Neither your PDF file nor your PDF password leaves your browser or gets sent to external servers.",
  },
  {
    q: "What if my HDFC, SBI, or ICICI export is in .xls or .xlsx instead of .csv?",
    a: "Open the spreadsheet locally in Excel, LibreOffice Calc, or Apple Numbers and save or export it as CSV (Comma delimited) before uploading it into the browser scanner.",
  },
  {
    q: "Why did my scanned bank passbook PDF fail to parse?",
    a: "Scanned paper PDFs and mobile screenshots are image layers without selectable text. Download an original digital statement PDF or CSV directly from HDFC NetBanking, OnlineSBI / YONO, or ICICI NetBanking.",
  },
  {
    q: "Can I use Subscription X-Ray to cancel an HDFC, SBI, or ICICI AutoPay mandate?",
    a: "No. Subscription X-Ray identifies recurring payment patterns from your exported statement locally in browser memory. Revoke UPI AutoPay inside your UPI app, NACH mandates via bank NetBanking or branch UMRN request, and card mandates via your bank's SI Hub.",
  },
];

export default function HdfcSbiIciciAutomaticPaymentsPage() {
  return (
    <GuideLayout guide={guide} faqItems={FAQ_ITEMS}>
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

      <BankStatementFormatsDiagram />

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
              <td>Cleanest column separation up to 100,000 rows (10 MB max)</td>
              <td>
                Multi-line header banners above column titles (stripped
                automatically by Subscription X-Ray)
              </td>
            </tr>
            <tr>
              <td>Digital NetBanking PDF</td>
              <td>Preserves selectable text across 6–12 month statements</td>
              <td>
                Password locks (unlock locally in browser; never use scanned
                image PDFs)
              </td>
            </tr>
            <tr>
              <td>Credit Card monthly PDF</td>
              <td>Shows card Standing Instructions and USD SaaS charges</td>
              <td>
                Single-month PDFs lack a second cycle; combine or audit 3+
                months
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Common automatic payment narration clues (representative examples)</h2>
      <p>
        Exact statement wording varies across savings accounts, salary accounts,
        and credit card tiers, so treat these lines as representative format
        examples across HDFC, SBI, ICICI, Axis, and Kotak exports:
      </p>

      <div className="guide-table-wrap">
        <table className="guide-table">
          <thead>
            <tr>
              <th>Payment rail</th>
              <th>Representative statement pattern</th>
              <th>How to verify &amp; stop</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>UPI AutoPay</td>
              <td>
                <code>UPI-AUTOPAY-SPOTIFY@OKAXIS-408112233445</code>
              </td>
              <td>
                Cancel with merchant, then revoke inside{" "}
                <Link href="/guides/cancel-upi-autopay">your UPI app</Link>
              </td>
            </tr>
            <tr>
              <td>Plain UPI recurring</td>
              <td>
                <code>WDL TFR UPI/DR/409988776655/CANVA/SBIN0001234</code>
              </td>
              <td>
                Check 26–35d interval; inspect{" "}
                <Link href="/guides/find-upi-autopay-mandates">
                  UPI AutoPay vs manual transfers
                </Link>
              </td>
            </tr>
            <tr>
              <td>NACH / ECS eMandate</td>
              <td>
                <code>NACH-DR-CULTFIT INDIA-HDFC0000240</code>
              </td>
              <td>
                Locate UMRN in NetBanking; follow{" "}
                <Link href="/guides/cancel-nach-mandate">
                  NACH cancellation steps
                </Link>
              </td>
            </tr>
            <tr>
              <td>Card Standing Instruction</td>
              <td>
                <code>SI NETFLIX MUMBAI IN</code> or <code>APPLE.COM/BILL</code>
              </td>
              <td>
                Cancel with merchant + inspect issuer{" "}
                <Link href="/guides/cancel-credit-card-subscriptions">
                  SI Hub portal
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Need deeper guidance on decoding Indian narration prefixes or debit card
        Standing Instructions? Read{" "}
        <Link href="/guides/read-bank-statements">
          how to read bank statement narrations in India
        </Link>{" "}
        and{" "}
        <Link href="/guides/debit-card-recurring-payments">
          find recurring payments on your debit card
        </Link>
        .
      </p>

      <div className="guide-inline-cta">
        <div className="guide-inline-cta-copy">
          <strong>Scan your HDFC, SBI, or ICICI CSV/PDF locally</strong>
          <span>
            Supports password-protected bank PDFs and delimited CSVs up to 10 MB
            inside browser memory. {PACK_PRICE_LABEL} once unlocks {PACK_SIZE}{" "}
            non-expiring scans.
          </span>
        </div>
        <TrackedLink
          className="btn btn-primary button-sm"
          href="/scanner"
          trackLocation="guide_bank_exports_inline"
          trackLabel="Scan statement now"
        >
          <span>Scan statement now</span>
          <ArrowRight size={15} aria-hidden="true" />
        </TrackedLink>
      </div>

      <h2>How to inspect multi-month statements privately</h2>
      <ol>
        <li>
          Sign in directly to HDFC NetBanking, SBI YONO / OnlineSBI, ICICI
          iMobile / NetBanking, Axis, or Kotak and download at least 3 to 12
          months (or 13 months to catch annual plans) as <strong>CSV</strong> or{" "}
          <strong>selectable PDF</strong>.
        </li>
        <li>
          Avoid screenshotting or printing-to-image, because image PDFs have no
          selectable text layer.
        </li>
        <li>
          Drop the exported file into{" "}
          <Link href="/scanner">Subscription X-Ray</Link>—our parser detects both
          separate Withdrawal/Deposit columns and single Dr/Cr columns, filters
          failed attempts, reversals, and ₹1–₹5 mandate holds, unlocks
          password-protected PDFs inside browser memory, and flags repeating
          charges across cycles without uploading your raw bank file.
        </li>
      </ol>

      <h2>Official escalation &amp; mandate resources</h2>
      <p>
        Subscription X-Ray never connects to NetBanking or revokes mandates for
        you. After reviewing your scan results, always verify live mandate status
        in your bank portal or UPI app. For official NPCI UPI guidance, consult{" "}
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
        ; if an unauthorized bank or card debit goes unresolved by your bank,
        escalate through the{" "}
        <a
          href="https://cms.rbi.org.in/"
          target="_blank"
          rel="noopener noreferrer"
        >
          RBI Complaint Management System (CMS)
        </a>
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
