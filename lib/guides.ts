export type GuideMeta = {
  slug: string;
  href: string;
  title: string;
  shortTitle: string;
  description: string;
  summary: string;
  category: string;
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  relatedSlugs: string[];
};

export const GUIDES: GuideMeta[] = [
  {
    slug: "find-upi-autopay-mandates",
    href: "/guides/find-upi-autopay-mandates",
    title: "How to Find UPI AutoPay Mandates in India",
    shortTitle: "Find UPI AutoPay Mandates",
    description:
      "Learn how UPI AutoPay works in India, how to spot AutoPay debits in bank statements, and how Subscription X-Ray flags recurring mandates.",
    summary:
      "Understand NPCI UPI AutoPay limits, statement narration clues, and how to separate live recurring mandates from ₹1–₹5 verification pings.",
    category: "UPI AutoPay",
    readTime: "6 min read",
    publishedAt: "2026-11-18",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "cancel-upi-autopay",
      "hdfc-sbi-icici-automatic-payments",
      "find-hidden-subscriptions",
    ],
  },
  {
    slug: "cancel-upi-autopay",
    href: "/guides/cancel-upi-autopay",
    title: "How to Cancel UPI AutoPay Mandates",
    shortTitle: "Cancel UPI AutoPay Mandates",
    description:
      "Step-by-step guidance to review, pause, or revoke UPI AutoPay mandates in Google Pay, PhonePe, Paytm, and BHIM, and verify cancellation.",
    summary:
      "Know what revoking an AutoPay mandate stops, general steps across major UPI apps, official NPCI support options, and how to confirm closure.",
    category: "UPI AutoPay",
    readTime: "6 min read",
    publishedAt: "2026-11-18",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "find-upi-autopay-mandates",
      "identify-nach-emandate",
      "recurring-card-payments",
    ],
  },
  {
    slug: "find-hidden-subscriptions",
    href: "/guides/find-hidden-subscriptions",
    title: "How to Find Hidden Subscriptions in Your Bank Statement",
    shortTitle: "Find Hidden Subscriptions",
    description:
      "Spot forgotten monthly, quarterly, and annual subscriptions in Indian bank and card statements despite changing merchant reference numbers.",
    summary:
      "Identify forgotten renewals, aggregator billing descriptors, and recurring UPI, NACH, or card charges across a multi-month statement.",
    category: "Statement Audit",
    readTime: "7 min read",
    publishedAt: "2026-11-18",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "calculate-monthly-subscription-spending",
      "find-upi-autopay-mandates",
      "read-bank-statements",
    ],
  },
  {
    slug: "identify-nach-emandate",
    href: "/guides/identify-nach-emandate",
    title: "How to Identify NACH and eMandate Transactions",
    shortTitle: "Identify NACH & eMandates",
    description:
      "Decode NACH, ACH, ECS, and eMandate bank statement entries in India, separate active debits from setup entries, and verify unfamiliar UMRNs.",
    summary:
      "Recognize NPCI NACH and eMandate narrations for EMIs, SIPs, insurance, and utilities, and learn how bank cancellation works.",
    category: "Bank Mandates",
    readTime: "6 min read",
    publishedAt: "2026-11-18",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "read-bank-statements",
      "cancel-upi-autopay",
      "hdfc-sbi-icici-automatic-payments",
    ],
  },
  {
    slug: "recurring-card-payments",
    href: "/guides/recurring-card-payments",
    title: "How to Identify Recurring Card Payments",
    shortTitle: "Recurring Card Payments",
    description:
      "Understand RBI card Standing Instructions, SI Hub portals, recurring merchant billing descriptors, and how to verify unfamiliar card debits.",
    summary:
      "Distinguish RBI e-mandate Standing Instructions from repeat manual card purchases and review mandates using your issuing bank's SI Hub.",
    category: "Cards & SI Hub",
    readTime: "6 min read",
    publishedAt: "2026-11-18",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "debit-card-recurring-payments",
      "find-hidden-subscriptions",
      "identify-nach-emandate",
    ],
  },
  {
    slug: "read-bank-statements",
    href: "/guides/read-bank-statements",
    title: "How to Read Bank Statement Narrations in India",
    shortTitle: "Read Bank Statements",
    description:
      "Decode UPI references, NEFT, IMPS, NACH, POS, and card abbreviations in Indian bank statements and spot why narration alone has limits.",
    summary:
      "A clear reference for Dr/Cr columns, UPI/RRN strings, NEFT/IMPS/NACH codes, and why multi-month context matters for detection.",
    category: "Banking Basics",
    readTime: "7 min read",
    publishedAt: "2026-11-18",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "hdfc-sbi-icici-automatic-payments",
      "find-upi-autopay-mandates",
      "identify-nach-emandate",
    ],
  },
  {
    slug: "debit-card-recurring-payments",
    href: "/guides/debit-card-recurring-payments",
    title: "Find Recurring Payments on Your Debit Card in India",
    shortTitle: "Debit Card Subscriptions",
    description:
      "Spot recurring debit card Standing Instructions, RBI e-mandates, and app subscriptions across HDFC, SBI, ICICI, and Axis statements in India.",
    summary:
      "Separate debit card Standing Instructions from bank account UPI AutoPay or NACH debits and inspect issuer SI Hub portals safely.",
    category: "Cards & SI Hub",
    readTime: "6 min read",
    publishedAt: "2026-11-21",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "recurring-card-payments",
      "find-hidden-subscriptions",
      "bank-statement-privacy-security",
    ],
  },
  {
    slug: "hdfc-sbi-icici-automatic-payments",
    href: "/guides/hdfc-sbi-icici-automatic-payments",
    title: "Find AutoPay in HDFC, SBI & ICICI Bank Statements",
    shortTitle: "HDFC, SBI & ICICI AutoPay",
    description:
      "Learn how HDFC, SBI, and ICICI label UPI AutoPay, NACH debits, and recurring card charges in CSV and PDF statements, plus how to export data.",
    summary:
      "Compare CSV and selectable PDF export formats across major Indian banks and recognize how narration strings wrap AutoPay and NACH metadata.",
    category: "Bank Statements",
    readTime: "7 min read",
    publishedAt: "2026-11-21",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "read-bank-statements",
      "find-upi-autopay-mandates",
      "identify-nach-emandate",
    ],
  },
  {
    slug: "calculate-monthly-subscription-spending",
    href: "/guides/calculate-monthly-subscription-spending",
    title: "Calculate Monthly Subscription Expenses Accurately",
    shortTitle: "Calculate Monthly Spend",
    description:
      "Convert weekly, monthly, quarterly, and annual subscriptions into an accurate monthly baseline and catch small recurring debits before renewal.",
    summary:
      "Normalize mixed billing cycles into a single monthly run-rate and see how overlooked ₹99 to ₹499 plans compound over twelve months.",
    category: "Spending Audit",
    readTime: "6 min read",
    publishedAt: "2026-11-21",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "find-hidden-subscriptions",
      "cancel-upi-autopay",
      "debit-card-recurring-payments",
    ],
  },
  {
    slug: "bank-statement-privacy-security",
    href: "/guides/bank-statement-privacy-security",
    title: "Protect Financial Data When Scanning Bank Statements",
    shortTitle: "Statement Privacy Guide",
    description:
      "Learn why browser-local CSV and PDF parsing avoids sharing NetBanking passwords, how to safeguard PDF passwords, and what metadata is stored.",
    summary:
      "Compare local in-browser statement parsing with bank-login aggregators and understand what data Subscription X-Ray keeps off external servers.",
    category: "Privacy & Safety",
    readTime: "6 min read",
    publishedAt: "2026-11-21",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "find-hidden-subscriptions",
      "read-bank-statements",
      "hdfc-sbi-icici-automatic-payments",
    ],
  },
];

export function getGuideBySlug(slug: string): GuideMeta | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getRelatedGuides(slug: string): GuideMeta[] {
  const current = getGuideBySlug(slug);
  if (!current) return GUIDES.slice(0, 3);
  return current.relatedSlugs
    .map((relSlug) => getGuideBySlug(relSlug))
    .filter((g): g is GuideMeta => Boolean(g));
}
