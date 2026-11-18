// Strictly synthetic Indian bank & card statement samples for the public interactive demo.
// Never connects to Supabase, never grants/consumes scan credits, never handles real user files.

export type DemoPreset = {
  id: string;
  label: string;
  subtitle: string;
  filteredNotes: string[];
  csv: string;
};

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "hdfc-upi",
    label: "Bank Savings + UPI AutoPay (Sample)",
    subtitle: "90-day synthetic HDFC-style savings statement with UPI mandates & noise rows",
    filteredNotes: [
      "Skipped ₹2.00 UPI Mandate Creation auth hold",
      "Excluded FAILED UPI AutoPay & UPI/REV/ reversal rows",
      "Ignored monthly salary deposits & one-off food delivery orders",
    ],
    csv: [
      "Txn Date,Value Date,Narration,Withdrawal Amt.,Deposit Amt.,Closing Balance",
      "02/08/2026,02/08/2026,UPI MANDATE CREATION NETFLIX@OKAXIS,2.00,,142000.00",
      "05/08/2026,05/08/2026,UPI-AUTOPAY-NETFLIX@OKAXIS-408112233445,649.00,,141351.00",
      "10/08/2026,10/08/2026,UPI-AUTOPAY-SPOTIFY@OKSBI-408998877665,119.00,,141232.00",
      "12/08/2026,12/08/2026,NACH-DR-CULTFIT INDIA-HDFC0000240,999.00,,140233.00",
      "15/08/2026,15/08/2026,SWIGGY ORDER 992184,385.00,,139848.00",
      "20/08/2026,20/08/2026,UPI/408771122334/GOOGLE ONE@OKICICI,130.00,,139718.00",
      "01/09/2026,01/09/2026,NEFT SALARY ACME TECH PVT LTD,,85000.00,224718.00",
      "05/09/2026,05/09/2026,FAILED UPI AUTOPAY NETFLIX,649.00,,224718.00",
      "06/09/2026,06/09/2026,UPI-AUTOPAY-NETFLIX@OKAXIS-409112233999,649.00,,224069.00",
      "10/09/2026,10/09/2026,UPI-AUTOPAY-SPOTIFY@OKSBI-409998877111,119.00,,223950.00",
      "12/09/2026,12/09/2026,NACH-DR-CULTFIT INDIA-HDFC0000240,999.00,,222951.00",
      "20/09/2026,20/09/2026,UPI/409771122888/GOOGLE ONE@OKICICI,130.00,,222821.00",
      "24/09/2026,24/09/2026,UPI/REV/409771122999/AMAZON PRIME,299.00,,223120.00",
      "01/10/2026,01/10/2026,NEFT SALARY ACME TECH PVT LTD,,85000.00,308120.00",
      "05/10/2026,05/10/2026,UPI-AUTOPAY-NETFLIX@OKAXIS-410112233777,649.00,,307471.00",
      "10/10/2026,10/10/2026,UPI-AUTOPAY-SPOTIFY@OKSBI-410998877333,119.00,,307352.00",
      "12/10/2026,12/10/2026,NACH-DR-CULTFIT INDIA-HDFC0000240,999.00,,306353.00",
      "21/10/2026,21/10/2026,UPI/410771122444/GOOGLE ONE@OKICICI,130.00,,306223.00",
    ].join("\n"),
  },
  {
    id: "card-si",
    label: "Credit Card + SaaS Tools (Sample)",
    subtitle: "Synthetic credit card statement with Card Standing Instructions & Cr payments",
    filteredNotes: [
      "Skipped monthly Credit Card bill payment (Cr marker)",
      "Ignored one-off flight & shopping spends",
    ],
    csv: [
      "Date,Description,Amount,Debit/Credit",
      "03/08/2026,SI OPENAI CHATGPT SUBSCRIPTION MUMBAI,1950.00,D",
      "08/08/2026,CARD SI JIOHOTSTAR PREMIUM,299.00,D",
      "14/08/2026,APPLE.COM/BILL ITUNES INDIA,195.00,D",
      "25/08/2026,AUTOPAY THANK YOU BILL PAYMENT,18500.00,C",
      "03/09/2026,SI OPENAI CHATGPT SUBSCRIPTION MUMBAI,1950.00,D",
      "08/09/2026,CARD SI JIOHOTSTAR PREMIUM,299.00,D",
      "14/09/2026,APPLE.COM/BILL ITUNES INDIA,195.00,D",
      "19/09/2026,INDIGO AIRLINES BOOKING,6420.00,D",
      "25/09/2026,AUTOPAY THANK YOU BILL PAYMENT,12400.00,C",
      "04/10/2026,SI OPENAI CHATGPT SUBSCRIPTION MUMBAI,1950.00,D",
      "08/10/2026,CARD SI JIOHOTSTAR PREMIUM,299.00,D",
      "15/10/2026,APPLE.COM/BILL ITUNES INDIA,195.00,D",
    ].join("\n"),
  },
];
