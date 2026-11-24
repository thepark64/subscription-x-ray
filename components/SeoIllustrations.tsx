import type { ReactNode } from "react";

function FigureFrame({
  titleId,
  title,
  caption,
  viewBox,
  children,
}: {
  titleId: string;
  title: string;
  caption: string;
  viewBox: string;
  children: ReactNode;
}) {
  return (
    <figure className="seo-figure">
      <svg
        viewBox={viewBox}
        role="img"
        aria-labelledby={titleId}
        className="seo-diagram-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id={titleId}>{title}</title>
        {children}
      </svg>
      <figcaption className="caption-2">{caption}</figcaption>
    </figure>
  );
}

export function LocalPrivacyBoundaryDiagram() {
  return (
    <FigureFrame
      titleId="diagram-local-privacy"
      title="Browser-local statement scanning privacy boundary diagram"
      caption="Raw CSV and password-protected PDF files execute strictly inside browser memory. Only email auth, ₹69 Cashfree credit verification, and saved recurring summaries touch the server."
      viewBox="0 0 880 260"
    >
      <rect x="8" y="8" width="540" height="244" rx="14" fill="#141414" stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="6 5" />
      <text x="28" y="34" fill="#2dd4bf" fontSize="12" fontWeight="600" fontFamily="var(--font-mono), monospace">
        YOUR BROWSER MEMORY · RAW DATA NEVER LEAVES DEVICE
      </text>

      <rect x="28" y="54" width="150" height="174" rx="10" fill="#1c1c1c" stroke="#313131" />
      <text x="42" y="80" fill="#ffffff" fontSize="14" fontWeight="600">1. Statement File</text>
      <text x="42" y="104" fill="#9b9b9b" fontSize="12">CSV up to 10 MB</text>
      <text x="42" y="124" fill="#9b9b9b" fontSize="12">Digital PDF / Unlock</text>
      <text x="42" y="144" fill="#9b9b9b" fontSize="12">via local PDF worker</text>
      <rect x="42" y="168" width="122" height="42" rx="6" fill="#131209" stroke="#272727" />
      <text x="50" y="186" fill="#fca5a5" fontSize="11" fontFamily="var(--font-mono), monospace">PDF Password</text>
      <text x="50" y="201" fill="#9b9b9b" fontSize="11">Never uploaded</text>

      <path d="M184 140 L206 140" stroke="#2dd4bf" strokeWidth="2" />
      <polygon points="204,135 214,140 204,145" fill="#2dd4bf" />

      <rect x="216" y="54" width="156" height="174" rx="10" fill="#1c1c1c" stroke="#313131" />
      <text x="230" y="80" fill="#ffffff" fontSize="14" fontWeight="600">2. Local Engine</text>
      <text x="230" y="104" fill="#9b9b9b" fontSize="12">Strip RRNs &amp; IFSC</text>
      <text x="230" y="124" fill="#9b9b9b" fontSize="12">Skip ₹1–₹5 holds</text>
      <text x="230" y="144" fill="#9b9b9b" fontSize="12">Skip reversals &amp; failed</text>
      <text x="230" y="168" fill="#2dd4bf" fontSize="12" fontFamily="var(--font-mono), monospace">26-35d · 81-101d</text>
      <text x="230" y="186" fill="#2dd4bf" fontSize="12" fontFamily="var(--font-mono), monospace">350-380d cycles</text>
      <text x="230" y="206" fill="#9b9b9b" fontSize="11">Non-recurring dropped</text>

      <path d="M378 140 L400 140" stroke="#2dd4bf" strokeWidth="2" />
      <polygon points="398,135 408,140 398,145" fill="#2dd4bf" />

      <rect x="410" y="54" width="122" height="174" rx="10" fill="#1c1c1c" stroke="#313131" />
      <text x="422" y="80" fill="#ffffff" fontSize="14" fontWeight="600">3. Results</text>
      <text x="422" y="104" fill="#9b9b9b" fontSize="12">UPI AutoPay</text>
      <text x="422" y="124" fill="#9b9b9b" fontSize="12">NACH / eMandate</text>
      <text x="422" y="144" fill="#9b9b9b" fontSize="12">Card SI labels</text>
      <text x="422" y="172" fill="#ffffff" fontSize="12">CSV &amp; PDF export</text>
      <text x="422" y="192" fill="#9b9b9b" fontSize="11">0 credits spent if</text>
      <text x="422" y="208" fill="#9b9b9b" fontSize="11">0 charges found</text>

      <path d="M552 140 L586 140" stroke="#767676" strokeWidth="2" strokeDasharray="4 4" />
      <polygon points="584,135 594,140 584,145" fill="#767676" />

      <rect x="598" y="8" width="274" height="244" rx="14" fill="#181818" stroke="#272727" />
      <text x="618" y="34" fill="#9b9b9b" fontSize="12" fontWeight="600" fontFamily="var(--font-mono), monospace">
        ACCOUNT &amp; BILLING ONLY
      </text>
      <rect x="618" y="54" width="234" height="84" rx="10" fill="#1f1f1f" stroke="#313131" />
      <text x="632" y="78" fill="#ffffff" fontSize="13" fontWeight="600">Supabase Account History</text>
      <text x="632" y="99" fill="#9b9b9b" fontSize="12">Email auth &amp; credit balance</text>
      <text x="632" y="119" fill="#9b9b9b" fontSize="12">Detected merchant summaries</text>

      <rect x="618" y="152" width="234" height="76" rx="10" fill="#1f1f1f" stroke="#313131" />
      <text x="632" y="176" fill="#ffffff" fontSize="13" fontWeight="600">Cashfree Checkout</text>
      <text x="632" y="197" fill="#9b9b9b" fontSize="12">₹69 once → 12 scan credits</text>
      <text x="632" y="215" fill="#9b9b9b" fontSize="11">Order ID &amp; verification only</text>
    </FigureFrame>
  );
}

export function DetectionPipelineDiagram() {
  return (
    <FigureFrame
      titleId="diagram-detection-pipeline"
      title="Four-stage recurring charge detection pipeline"
      caption="Each statement goes through four deterministic browser steps: header detection, non-billing noise removal, RRN/IFSC normalization, and multi-cycle cadence clustering."
      viewBox="0 0 880 210"
    >
      <rect x="8" y="14" width="198" height="182" rx="12" fill="#181818" stroke="#272727" />
      <text x="24" y="42" fill="#2dd4bf" fontSize="12" fontFamily="var(--font-mono), monospace">STAGE 01</text>
      <text x="24" y="66" fill="#ffffff" fontSize="15" fontWeight="600">Parse CSV / PDF</text>
      <text x="24" y="92" fill="#9b9b9b" fontSize="12">Detect DD/MM/YYYY dates</text>
      <text x="24" y="112" fill="#9b9b9b" fontSize="12">Withdrawal vs Dr/Cr cols</text>
      <text x="24" y="132" fill="#9b9b9b" fontSize="12">Skip opening/closing lines</text>
      <text x="24" y="168" fill="#767676" fontSize="11" fontFamily="var(--font-mono), monospace">Up to 10 MB · 100k rows</text>

      <path d="M210 105 L228 105" stroke="#2dd4bf" strokeWidth="2" />
      <polygon points="226,100 236,105 226,110" fill="#2dd4bf" />

      <rect x="238" y="14" width="198" height="182" rx="12" fill="#181818" stroke="#272727" />
      <text x="254" y="42" fill="#2dd4bf" fontSize="12" fontFamily="var(--font-mono), monospace">STAGE 02</text>
      <text x="254" y="66" fill="#ffffff" fontSize="15" fontWeight="600">Filter Noise</text>
      <text x="254" y="92" fill="#9b9b9b" fontSize="12">Drop failed &amp; declined rows</text>
      <text x="254" y="112" fill="#9b9b9b" fontSize="12">Drop UPI/REV &amp; refunds</text>
      <text x="254" y="132" fill="#9b9b9b" fontSize="12">Drop mandate setup rows</text>
      <text x="254" y="168" fill="#fca5a5" fontSize="11" fontFamily="var(--font-mono), monospace">Excludes ≤ ₹5 pings</text>

      <path d="M440 105 L458 105" stroke="#2dd4bf" strokeWidth="2" />
      <polygon points="456,100 466,105 456,110" fill="#2dd4bf" />

      <rect x="468" y="14" width="198" height="182" rx="12" fill="#181818" stroke="#272727" />
      <text x="484" y="42" fill="#2dd4bf" fontSize="12" fontFamily="var(--font-mono), monospace">STAGE 03</text>
      <text x="484" y="66" fill="#ffffff" fontSize="15" fontWeight="600">Normalize Keys</text>
      <text x="484" y="92" fill="#9b9b9b" fontSize="12">Strip 12-digit UPI RRNs</text>
      <text x="484" y="112" fill="#9b9b9b" fontSize="12">Strip @okaxis / @ybl</text>
      <text x="484" y="132" fill="#9b9b9b" fontSize="12">Strip 11-char IFSC codes</text>
      <text x="484" y="168" fill="#767676" fontSize="11" fontFamily="var(--font-mono), monospace">Matches 25+ known brands</text>

      <path d="M670 105 L688 105" stroke="#2dd4bf" strokeWidth="2" />
      <polygon points="686,100 696,105 686,110" fill="#2dd4bf" />

      <rect x="698" y="14" width="174" height="182" rx="12" fill="#131209" stroke="#313131" />
      <text x="714" y="42" fill="#2dd4bf" fontSize="12" fontFamily="var(--font-mono), monospace">STAGE 04</text>
      <text x="714" y="66" fill="#ffffff" fontSize="15" fontWeight="600">Score &amp; Label</text>
      <text x="714" y="92" fill="#9b9b9b" fontSize="12">High / Medium / Possible</text>
      <text x="714" y="112" fill="#9b9b9b" fontSize="12">UPI AutoPay · NACH</text>
      <text x="714" y="132" fill="#9b9b9b" fontSize="12">Card SI · Plain UPI</text>
      <text x="714" y="168" fill="#2dd4bf" fontSize="11" fontFamily="var(--font-mono), monospace">Monthly / Annual total</text>
    </FigureFrame>
  );
}

export function NarrationNormalizationDiagram() {
  return (
    <FigureFrame
      titleId="diagram-narration-normalization"
      title="How changing Indian bank narration strings collapse into one recurring subscription"
      caption="Every monthly debit arrives with a different 12-digit UPI RRN or IFSC code. Stripping rotating reference metadata groups separate rows into one recurring charge."
      viewBox="0 0 880 230"
    >
      <rect x="10" y="18" width="420" height="52" rx="8" fill="#181818" stroke="#272727" />
      <text x="26" y="39" fill="#9b9b9b" fontSize="11" fontFamily="var(--font-mono), monospace">05 Jan · ₹649.00</text>
      <text x="26" y="57" fill="#ffffff" fontSize="12" fontFamily="var(--font-mono), monospace">UPI-AUTOPAY-400512891001-NETFLIX@OKAXIS</text>

      <rect x="10" y="88" width="420" height="52" rx="8" fill="#181818" stroke="#272727" />
      <text x="26" y="109" fill="#9b9b9b" fontSize="11" fontFamily="var(--font-mono), monospace">05 Feb · ₹649.00</text>
      <text x="26" y="127" fill="#ffffff" fontSize="12" fontFamily="var(--font-mono), monospace">UPI-AUTOPAY-403699182745-NETFLIX@OKAXIS</text>

      <rect x="10" y="158" width="420" height="52" rx="8" fill="#181818" stroke="#272727" />
      <text x="26" y="179" fill="#9b9b9b" fontSize="11" fontFamily="var(--font-mono), monospace">06 Mar · ₹649.00</text>
      <text x="26" y="197" fill="#ffffff" fontSize="12" fontFamily="var(--font-mono), monospace">UPI-AUTOPAY-406644209188-NETFLIX@OKAXIS</text>

      <path d="M438 44 L518 114" stroke="#2dd4bf" strokeWidth="1.5" />
      <path d="M438 114 L518 114" stroke="#2dd4bf" strokeWidth="2" />
      <path d="M438 184 L518 114" stroke="#2dd4bf" strokeWidth="1.5" />
      <polygon points="516,108 528,114 516,120" fill="#2dd4bf" />

      <rect x="532" y="34" width="338" height="162" rx="12" fill="#131209" stroke="#2dd4bf" strokeWidth="1.5" />
      <text x="554" y="64" fill="#2dd4bf" fontSize="12" fontFamily="var(--font-mono), monospace">GROUPED RECURRING CHARGE</text>
      <text x="554" y="94" fill="#ffffff" fontSize="18" fontWeight="600">Netflix · ₹649 / month</text>
      <text x="554" y="122" fill="#9b9b9b" fontSize="13">Rail: UPI AutoPay · Confidence: High</text>
      <text x="554" y="144" fill="#9b9b9b" fontSize="13">Occurrences: 3 · Interval: ~30 days</text>
      <text x="554" y="172" fill="#ffffff" fontSize="12" fontFamily="var(--font-mono), monospace">Action: Cancel + Revoke Mandate</text>
    </FigureFrame>
  );
}

export function MultiAppUpiDiagram() {
  return (
    <FigureFrame
      titleId="diagram-multi-app-upi"
      title="Multiple UPI apps settling into a single savings account statement"
      caption="Each UPI app only displays AutoPay mandates created inside that specific app. All settled debits still converge on your underlying bank account statement."
      viewBox="0 0 880 236"
    >
      <rect x="10" y="14" width="230" height="44" rx="8" fill="#181818" stroke="#272727" />
      <text x="26" y="41" fill="#ffffff" fontSize="13" fontWeight="600">Google Pay · Netflix ₹649</text>

      <rect x="10" y="68" width="230" height="44" rx="8" fill="#181818" stroke="#272727" />
      <text x="26" y="95" fill="#ffffff" fontSize="13" fontWeight="600">PhonePe · JioHotstar ₹299</text>

      <rect x="10" y="122" width="230" height="44" rx="8" fill="#181818" stroke="#272727" />
      <text x="26" y="149" fill="#ffffff" fontSize="13" fontWeight="600">Paytm · Spotify ₹119</text>

      <rect x="10" y="176" width="230" height="44" rx="8" fill="#181818" stroke="#272727" />
      <text x="26" y="203" fill="#ffffff" fontSize="13" fontWeight="600">BHIM / Old App · Newspaper</text>

      <path d="M248 36 L342 118" stroke="#2dd4bf" strokeWidth="1.5" />
      <path d="M248 90 L342 118" stroke="#2dd4bf" strokeWidth="1.5" />
      <path d="M248 144 L342 118" stroke="#2dd4bf" strokeWidth="1.5" />
      <path d="M248 198 L342 118" stroke="#2dd4bf" strokeWidth="1.5" />
      <polygon points="340,112 352,118 340,124" fill="#2dd4bf" />

      <rect x="356" y="24" width="514" height="188" rx="12" fill="#181818" stroke="#2dd4bf" strokeWidth="1.5" />
      <text x="378" y="54" fill="#2dd4bf" fontSize="12" fontFamily="var(--font-mono), monospace">UNDERLYING SAVINGS BANK STATEMENT (CSV / PDF)</text>
      <text x="378" y="84" fill="#ffffff" fontSize="15" fontWeight="600">Every settled mandate appears in one ledger</text>
      <text x="378" y="112" fill="#9b9b9b" fontSize="13">• Catches mandates approved in deleted or secondary UPI apps</text>
      <text x="378" y="136" fill="#9b9b9b" fontSize="13">• Surfaces NACH eMandates &amp; debit card Standing Instructions too</text>
      <text x="378" y="160" fill="#9b9b9b" fontSize="13">• Filters ₹1–₹5 setup pings while separating UPI AutoPay vs UPI</text>
      <text x="378" y="190" fill="#ffffff" fontSize="12" fontFamily="var(--font-mono), monospace">Then revoke each mandate inside the app where it was created</text>
    </FigureFrame>
  );
}

export function BankStatementFormatsDiagram() {
  return (
    <FigureFrame
      titleId="diagram-bank-formats"
      title="How HDFC, SBI, and ICICI statement export columns map into Subscription X-Ray"
      caption="HDFC, SBI, and ICICI label columns differently across CSV and digital PDF downloads. Browser-local header detection normalizes separate Withdrawal/Deposit and single Dr/Cr formats automatically."
      viewBox="0 0 880 226"
    >
      <rect x="10" y="14" width="268" height="58" rx="8" fill="#181818" stroke="#272727" />
      <text x="26" y="38" fill="#ffffff" fontSize="13" fontWeight="600">HDFC NetBanking CSV / PDF</text>
      <text x="26" y="57" fill="#9b9b9b" fontSize="11" fontFamily="var(--font-mono), monospace">Date · Narration · Withdrawal Amt</text>

      <rect x="10" y="84" width="268" height="58" rx="8" fill="#181818" stroke="#272727" />
      <text x="26" y="108" fill="#ffffff" fontSize="13" fontWeight="600">SBI OnlineSBI / YONO CSV / PDF</text>
      <text x="26" y="127" fill="#9b9b9b" fontSize="11" fontFamily="var(--font-mono), monospace">Txn Date · Description · Debit / Dr</text>

      <rect x="10" y="154" width="268" height="58" rx="8" fill="#181818" stroke="#272727" />
      <text x="26" y="178" fill="#ffffff" fontSize="13" fontWeight="600">ICICI Bank &amp; Card CSV / PDF</text>
      <text x="26" y="197" fill="#9b9b9b" fontSize="11" fontFamily="var(--font-mono), monospace">Particulars · Amount · Type (Dr/Cr)</text>

      <path d="M286 43 L370 113" stroke="#2dd4bf" strokeWidth="1.5" />
      <path d="M286 113 L370 113" stroke="#2dd4bf" strokeWidth="2" />
      <path d="M286 183 L370 113" stroke="#2dd4bf" strokeWidth="1.5" />
      <polygon points="368,107 380,113 368,119" fill="#2dd4bf" />

      <rect x="384" y="20" width="486" height="186" rx="12" fill="#131209" stroke="#313131" />
      <text x="406" y="48" fill="#2dd4bf" fontSize="12" fontFamily="var(--font-mono), monospace">UNIFIED LOCAL PARSING &amp; RAIL OUTPUT</text>
      <text x="406" y="78" fill="#ffffff" fontSize="14" fontWeight="600">Automatic column + PDF password handling</text>
      <text x="406" y="106" fill="#9b9b9b" fontSize="12">• Strips summary banners &amp; multi-line wraps automatically</text>
      <text x="406" y="128" fill="#9b9b9b" fontSize="12">• Unlocks encrypted bank PDFs locally in browser worker</text>
      <text x="406" y="150" fill="#9b9b9b" fontSize="12">• Tags UPI AutoPay, NACH / eMandate, Card SI &amp; plain UPI</text>
      <text x="406" y="182" fill="#ffffff" fontSize="12" fontFamily="var(--font-mono), monospace">Export 3–12 months CSV or digital PDF for best results</text>
    </FigureFrame>
  );
}
