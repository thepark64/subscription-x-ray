export const HELP_CENTER_CATEGORIES = [
  "Find Forgotten Subscriptions",
  "Cancel Credit Card Subscriptions",
  "Stop UPI AutoPay",
  "Cancel NACH Mandates",
  "Cancel Google Play Subscriptions",
  "Cancel Apple Subscriptions",
  "Identify Unknown Bank Charges",
  "Stop Free Trial Renewals",
] as const;

export type HelpCenterCategory = (typeof HELP_CENTER_CATEGORIES)[number];

export type GuideMeta = {
  slug: string;
  href: string;
  title: string;
  shortTitle: string;
  description: string;
  summary: string;
  category: string;
  helpCategories: HelpCenterCategory[];
  searchKeywords: string[];
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
    helpCategories: ["Stop UPI AutoPay", "Find Forgotten Subscriptions"],
    searchKeywords: [
      "upi autopay",
      "mandate",
      "google pay",
      "phonepe",
      "paytm",
      "bhim",
      "npci",
    ],
    readTime: "6 min read",
    publishedAt: "2026-11-18",
    updatedAt: "2026-11-23",
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
      "Know what revoking an AutoPay mandate stops, general steps across major UPI apps, official NPCI MyUPI links, and how to confirm closure.",
    category: "UPI AutoPay",
    helpCategories: ["Stop UPI AutoPay", "Stop Free Trial Renewals"],
    searchKeywords: [
      "cancel upi autopay",
      "revoke mandate",
      "stop autopay",
      "google pay",
      "phonepe",
      "paytm",
      "bhim",
      "myupi",
    ],
    readTime: "7 min read",
    publishedAt: "2026-11-18",
    updatedAt: "2026-11-23",
    relatedSlugs: [
      "find-upi-autopay-mandates",
      "cancel-nach-mandate",
      "cancel-credit-card-subscriptions",
    ],
  },
  {
    slug: "find-forgotten-subscriptions",
    href: "/guides/find-forgotten-subscriptions",
    title: "How to Find Forgotten Subscriptions Fast",
    shortTitle: "Find Forgotten Subscriptions",
    description:
      "Discover forgotten subscriptions draining your bank account or card using inbox checks, UPI app audits, and local statement scans.",
    summary:
      "A practical checklist to uncover forgotten monthly and annual subscriptions across bank statements, credit cards, Google Play, Apple, and UPI apps.",
    category: "Forgotten Subscriptions",
    helpCategories: ["Find Forgotten Subscriptions", "Stop Free Trial Renewals"],
    searchKeywords: [
      "forgotten subscriptions",
      "find subscriptions",
      "unused ott",
      "annual renewal",
      "unused membership",
    ],
    readTime: "6 min read",
    publishedAt: "2026-11-23",
    updatedAt: "2026-11-23",
    relatedSlugs: [
      "find-hidden-subscriptions-bank-statement",
      "stop-forgotten-free-trials",
      "identify-unknown-bank-debits",
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
    helpCategories: [
      "Find Forgotten Subscriptions",
      "Identify Unknown Bank Charges",
    ],
    searchKeywords: [
      "hidden subscriptions",
      "aggregator",
      "razorpay",
      "billdesk",
      "quarterly",
      "annual",
    ],
    readTime: "7 min read",
    publishedAt: "2026-11-18",
    updatedAt: "2026-11-23",
    relatedSlugs: [
      "find-hidden-subscriptions-bank-statement",
      "find-upi-autopay-mandates",
      "identify-unknown-bank-debits",
    ],
  },
  {
    slug: "find-hidden-subscriptions-bank-statement",
    href: "/guides/find-hidden-subscriptions-bank-statement",
    title: "Find Hidden Subscriptions in Bank Statements",
    shortTitle: "Hidden Bank Statement Charges",
    description:
      "Audit 6 to 13 months of bank and card statements to catch hidden monthly, quarterly, and annual subscriptions behind payment aggregators.",
    summary:
      "Use statement date ranges, CSV exports, and browser-local scanning to expose low-frequency annual plans and quiet aggregator charges.",
    category: "Statement Audit",
    helpCategories: [
      "Find Forgotten Subscriptions",
      "Identify Unknown Bank Charges",
    ],
    searchKeywords: [
      "bank statement subscriptions",
      "hidden bank charges",
      "csv statement",
      "13 months",
      "annual renewal",
    ],
    readTime: "7 min read",
    publishedAt: "2026-11-23",
    updatedAt: "2026-11-23",
    relatedSlugs: [
      "find-forgotten-subscriptions",
      "identify-unknown-bank-debits",
      "hdfc-sbi-icici-automatic-payments",
    ],
  },
  {
    slug: "cancel-credit-card-subscriptions",
    href: "/guides/cancel-credit-card-subscriptions",
    title: "How to Cancel Credit Card Subscriptions in India",
    shortTitle: "Cancel Credit Card Subscriptions",
    description:
      "Identify recurring credit card charges, cancel with merchants, withdraw bank SI Hub mandates, and handle unwanted international renewals.",
    summary:
      "Separate RBI card Standing Instructions from saved-card renewals, cancel with merchants, revoke bank SI mandates, and audit your next card bill.",
    category: "Cards & SI Hub",
    helpCategories: [
      "Cancel Credit Card Subscriptions",
      "Stop Free Trial Renewals",
    ],
    searchKeywords: [
      "credit card subscription",
      "cancel credit card autopay",
      "si hub",
      "standing instruction",
      "international recurring",
    ],
    readTime: "7 min read",
    publishedAt: "2026-11-23",
    updatedAt: "2026-11-23",
    relatedSlugs: [
      "stop-recurring-card-payments",
      "recurring-card-payments",
      "identify-unknown-bank-debits",
    ],
  },
  {
    slug: "stop-recurring-card-payments",
    href: "/guides/stop-recurring-card-payments",
    title: "How to Stop Recurring Card Payments Permanently",
    shortTitle: "Stop Recurring Card Payments",
    description:
      "Stop recurring debit and credit card payments by cancelling merchant billing, revoking RBI e-mandates, and preventing card-updater charges.",
    summary:
      "Learn why blocking a card does not always end merchant billing agreements, and follow the complete merchant plus bank SI Hub workflow.",
    category: "Cards & SI Hub",
    helpCategories: [
      "Cancel Credit Card Subscriptions",
      "Stop Free Trial Renewals",
    ],
    searchKeywords: [
      "stop recurring card",
      "e-mandate",
      "card updater",
      "credit card",
      "debit card",
      "si hub",
    ],
    readTime: "6 min read",
    publishedAt: "2026-11-23",
    updatedAt: "2026-11-23",
    relatedSlugs: [
      "cancel-credit-card-subscriptions",
      "debit-card-recurring-payments",
      "recurring-card-payments",
    ],
  },
  {
    slug: "cancel-nach-mandate",
    href: "/guides/cancel-nach-mandate",
    title: "How to Cancel a NACH Mandate or eMandate Online",
    shortTitle: "Cancel NACH Mandate",
    description:
      "Learn what NACH debits mean, find your registered UMRN in NetBanking, submit a bank stop request, and retain written mandate confirmation.",
    summary:
      "Step-by-step instructions to identify NACH or eMandate debits, locate the UMRN, request cancellation through your bank or sponsor merchant, and handle loan caveats.",
    category: "Bank Mandates",
    helpCategories: ["Cancel NACH Mandates", "Identify Unknown Bank Charges"],
    searchKeywords: [
      "cancel nach",
      "emandate",
      "umrn",
      "ecs",
      "netbanking mandate",
      "npci nach",
    ],
    readTime: "7 min read",
    publishedAt: "2026-11-23",
    updatedAt: "2026-11-23",
    relatedSlugs: [
      "identify-nach-emandate",
      "cancel-upi-autopay",
      "identify-unknown-bank-debits",
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
    helpCategories: ["Cancel NACH Mandates", "Identify Unknown Bank Charges"],
    searchKeywords: [
      "nach",
      "emandate",
      "ach",
      "ecs",
      "umrn",
      "emi",
      "sip",
    ],
    readTime: "6 min read",
    publishedAt: "2026-11-18",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "cancel-nach-mandate",
      "read-bank-statements",
      "hdfc-sbi-icici-automatic-payments",
    ],
  },
  {
    slug: "cancel-google-play-subscription",
    href: "/guides/cancel-google-play-subscription",
    title: "How to Cancel a Google Play Subscription Safely",
    shortTitle: "Cancel Google Play",
    description:
      "Cancel Google Play subscriptions under Payments & subscriptions, understand why uninstalling apps will not stop billing, and verify renewal end.",
    summary:
      "Follow Google Play > Payments & subscriptions > Subscriptions, check linked Google accounts, revoke UPI AutoPay backups, and confirm closure.",
    category: "App Store Billing",
    helpCategories: [
      "Cancel Google Play Subscriptions",
      "Stop Free Trial Renewals",
    ],
    searchKeywords: [
      "google play",
      "play store",
      "android subscription",
      "payments and subscriptions",
      "google play billing",
    ],
    readTime: "6 min read",
    publishedAt: "2026-11-23",
    updatedAt: "2026-11-23",
    relatedSlugs: [
      "stop-forgotten-free-trials",
      "cancel-upi-autopay",
      "cancel-apple-subscription",
    ],
  },
  {
    slug: "cancel-apple-subscription",
    href: "/guides/cancel-apple-subscription",
    title: "How to Cancel an Apple or App Store Subscription",
    shortTitle: "Cancel Apple Subscription",
    description:
      "Cancel iPhone, iPad, Mac, and Apple Account subscriptions in Settings, decode APPLE.COM/BILL debits, and stop App Store auto-renewals.",
    summary:
      "Navigate Settings > Apple Account > Subscriptions on iOS or web, identify APPLE.COM/BILL card or UPI debits, and verify Family Sharing plans.",
    category: "App Store Billing",
    helpCategories: [
      "Cancel Apple Subscriptions",
      "Stop Free Trial Renewals",
    ],
    searchKeywords: [
      "apple subscription",
      "app store",
      "apple.com/bill",
      "iphone subscription",
      "icloud",
      "itunes",
    ],
    readTime: "6 min read",
    publishedAt: "2026-11-23",
    updatedAt: "2026-11-23",
    relatedSlugs: [
      "cancel-google-play-subscription",
      "stop-forgotten-free-trials",
      "cancel-credit-card-subscriptions",
    ],
  },
  {
    slug: "identify-unknown-bank-debits",
    href: "/guides/identify-unknown-bank-debits",
    title: "Identify Unknown Bank Debits & Recurring Charges",
    shortTitle: "Identify Unknown Debits",
    description:
      "Decode unfamiliar bank statement debits by comparing repeated dates and amounts, checking UPI or card mandates, and alerting your bank.",
    summary:
      "Step-by-step investigation workflow when you see an unrecognised merchant code, payment aggregator string, or repeated debit in your statement.",
    category: "Unknown Charges",
    helpCategories: [
      "Identify Unknown Bank Charges",
      "Find Forgotten Subscriptions",
    ],
    searchKeywords: [
      "unknown bank debit",
      "unrecognised charge",
      "unknown merchant",
      "rbi cms",
      "unauthorized debit",
    ],
    readTime: "7 min read",
    publishedAt: "2026-11-23",
    updatedAt: "2026-11-23",
    relatedSlugs: [
      "read-bank-statements",
      "find-hidden-subscriptions-bank-statement",
      "cancel-nach-mandate",
    ],
  },
  {
    slug: "stop-forgotten-free-trials",
    href: "/guides/stop-forgotten-free-trials",
    title: "Stop Forgotten Free Trial Renewals Before Billing",
    shortTitle: "Stop Free Trial Renewals",
    description:
      "Catch free trials before they convert into paid subscriptions across UPI AutoPay, RBI card mandates, Google Play, and Apple billing.",
    summary:
      "Audit ₹1–₹5 trial setup pings, understand trial conversion rules under UPI AutoPay and app stores, and end unwanted trials on time.",
    category: "Free Trials",
    helpCategories: [
      "Stop Free Trial Renewals",
      "Find Forgotten Subscriptions",
    ],
    searchKeywords: [
      "free trial",
      "trial renewal",
      "₹2 mandate",
      "introductory offer",
      "auto renewal",
    ],
    readTime: "6 min read",
    publishedAt: "2026-11-23",
    updatedAt: "2026-11-23",
    relatedSlugs: [
      "find-forgotten-subscriptions",
      "cancel-upi-autopay",
      "cancel-google-play-subscription",
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
    helpCategories: [
      "Cancel Credit Card Subscriptions",
      "Identify Unknown Bank Charges",
    ],
    searchKeywords: [
      "recurring card",
      "si hub",
      "standing instruction",
      "credit card debit",
    ],
    readTime: "6 min read",
    publishedAt: "2026-11-18",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "cancel-credit-card-subscriptions",
      "stop-recurring-card-payments",
      "debit-card-recurring-payments",
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
    helpCategories: [
      "Identify Unknown Bank Charges",
      "Find Forgotten Subscriptions",
    ],
    searchKeywords: [
      "bank narration",
      "rrn",
      "neft",
      "imps",
      "nach",
      "pos",
      "dr cr",
    ],
    readTime: "7 min read",
    publishedAt: "2026-11-18",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "identify-unknown-bank-debits",
      "hdfc-sbi-icici-automatic-payments",
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
    helpCategories: [
      "Cancel Credit Card Subscriptions",
      "Find Forgotten Subscriptions",
    ],
    searchKeywords: [
      "debit card",
      "standing instruction",
      "si hub",
      "visa",
      "mastercard",
      "rupay",
    ],
    readTime: "6 min read",
    publishedAt: "2026-11-21",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "stop-recurring-card-payments",
      "recurring-card-payments",
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
    helpCategories: [
      "Find Forgotten Subscriptions",
      "Stop UPI AutoPay",
      "Cancel NACH Mandates",
    ],
    searchKeywords: [
      "hdfc",
      "sbi",
      "icici",
      "netbanking",
      "yono",
      "imobile",
      "csv export",
    ],
    readTime: "7 min read",
    publishedAt: "2026-11-21",
    updatedAt: "2026-11-23",
    relatedSlugs: [
      "read-bank-statements",
      "find-upi-autopay-mandates",
      "cancel-nach-mandate",
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
    helpCategories: ["Find Forgotten Subscriptions"],
    searchKeywords: [
      "monthly spending",
      "annual run-rate",
      "quarterly renewal",
      "subscription budget",
    ],
    readTime: "6 min read",
    publishedAt: "2026-11-21",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "find-forgotten-subscriptions",
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
    helpCategories: ["Identify Unknown Bank Charges"],
    searchKeywords: [
      "privacy",
      "security",
      "browser-local",
      "pdf password",
      "upi pin",
      "otp",
    ],
    readTime: "6 min read",
    publishedAt: "2026-11-21",
    updatedAt: "2026-11-21",
    relatedSlugs: [
      "identify-unknown-bank-debits",
      "find-hidden-subscriptions-bank-statement",
      "read-bank-statements",
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
