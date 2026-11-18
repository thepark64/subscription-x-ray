// Well-known services and the page where the user manages or cancels them.
// A link is shown ONLY when a detected merchant matches one of these patterns.
// `label` says honestly what the link is: a manage page, or just the help page.

export type ServiceCategory =
  | "Streaming & Media"
  | "Software & Apps"
  | "Cloud & Storage"
  | "Membership"
  | "Other";

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Streaming & Media",
  "Software & Apps",
  "Cloud & Storage",
  "Membership",
  "Other",
];

export type KnownService = {
  name: string;
  pattern: RegExp;
  url: string;
  label: "Manage / cancel" | "Open help page" | "Open site";
  category: Exclude<ServiceCategory, "Other">;
  cancelTip?: string;
};

export const KNOWN_SERVICES: KnownService[] = [
  { name: "Netflix", pattern: /netflix/, url: "https://www.netflix.com/cancelplan", label: "Manage / cancel", category: "Streaming & Media", cancelTip: "Account -> Membership & Billing -> Cancel Membership." },
  { name: "Spotify", pattern: /spotify/, url: "https://www.spotify.com/account/subscription/", label: "Manage / cancel", category: "Streaming & Media", cancelTip: "Account overview -> Your plan -> Change or cancel plan." },
  { name: "YouTube Premium", pattern: /youtube|google youtube/, url: "https://www.youtube.com/paid_memberships", label: "Manage / cancel", category: "Streaming & Media", cancelTip: "Purchases & memberships -> Manage membership -> Deactivate." },
  { name: "Google One", pattern: /google one|googleone/, url: "https://one.google.com/settings", label: "Manage / cancel", category: "Cloud & Storage", cancelTip: "Settings -> Cancel membership." },
  { name: "Google Play", pattern: /google play|googleplay|play google/, url: "https://play.google.com/store/account/subscriptions", label: "Manage / cancel", category: "Software & Apps", cancelTip: "Play Store -> Payments & subscriptions -> Subscriptions -> Cancel." },
  { name: "Apple", pattern: /apple\.com|itunes|apple services|apple media/, url: "https://apps.apple.com/account/subscriptions", label: "Manage / cancel", category: "Software & Apps", cancelTip: "Settings -> Apple Account -> Subscriptions -> Cancel Subscription." },
  { name: "Amazon Prime", pattern: /amazon prime|prime video|primevideo|amzn prime/, url: "https://www.amazon.in/gp/primecentral", label: "Manage / cancel", category: "Membership", cancelTip: "Prime Central -> Manage Membership -> Update, cancel and more." },
  { name: "Audible", pattern: /audible/, url: "https://www.audible.in/account/overview", label: "Manage / cancel", category: "Streaming & Media", cancelTip: "Account Details -> Cancel membership." },
  { name: "JioHotstar / Disney+ Hotstar", pattern: /hotstar|jiohotstar|disney/, url: "https://www.hotstar.com/in/mypage", label: "Manage / cancel", category: "Streaming & Media", cancelTip: "My Space -> Help & Settings -> Cancel subscription (or revoke the UPI AutoPay mandate if billed via UPI)." },
  { name: "SonyLIV", pattern: /sony ?liv|sonyliv/, url: "https://help.sonyliv.com/categories/cat-subscription/articles/how-can-i-cancel-my-subscription", label: "Open help page", category: "Streaming & Media", cancelTip: "My Account -> My Subscriptions -> Cancel Auto Renewal." },
  { name: "ZEE5", pattern: /zee ?5|zee5/, url: "https://helpcenter.zee5.com/", label: "Open help page", category: "Streaming & Media", cancelTip: "My Profile -> My Subscription -> Cancel Renewal." },
  { name: "JioSaavn", pattern: /jiosaavn|saavn/, url: "https://www.jiosaavn.com/pro", label: "Open site", category: "Streaming & Media", cancelTip: "Settings -> Pro Status -> Manage Subscription or revoke UPI AutoPay." },
  { name: "Cult.fit", pattern: /cult\.?fit|cultfit|curefit/, url: "https://www.cult.fit/me", label: "Manage / cancel", category: "Membership", cancelTip: "Profile -> Active Packs / Subscriptions -> Manage auto-renewal." },
  { name: "Swiggy One", pattern: /swiggy one|swiggyone/, url: "https://www.swiggy.com/swiggy-one", label: "Open site", category: "Membership", cancelTip: "Swiggy App -> Account -> Swiggy One -> Manage auto-renewal." },
  { name: "Zomato Gold", pattern: /zomato gold|zomatogold/, url: "https://www.zomato.com/", label: "Open site", category: "Membership", cancelTip: "Zomato App -> Profile -> Gold -> Manage Membership." },
  { name: "Times Prime", pattern: /times ?prime|timesprime/, url: "https://www.timesprime.com/", label: "Open site", category: "Membership", cancelTip: "My Account -> Membership Settings -> Turn off auto-renew." },
  { name: "Microsoft", pattern: /microsoft|msft|xbox|office 365|microsoft 365/, url: "https://account.microsoft.com/services", label: "Manage / cancel", category: "Software & Apps", cancelTip: "Services & subscriptions -> Manage -> Cancel subscription." },
  { name: "Adobe", pattern: /adobe/, url: "https://account.adobe.com/plans", label: "Manage / cancel", category: "Software & Apps", cancelTip: "Plans -> Manage plan -> Cancel your plan (check early-termination terms)." },
  { name: "ChatGPT / OpenAI", pattern: /openai|chatgpt/, url: "https://chatgpt.com/#settings/Subscription", label: "Manage / cancel", category: "Software & Apps", cancelTip: "Settings -> Subscription -> Manage." },
  { name: "Claude / Anthropic", pattern: /anthropic|claude\.ai/, url: "https://claude.ai/settings/billing", label: "Manage / cancel", category: "Software & Apps", cancelTip: "Settings -> Billing -> Cancel subscription." },
  { name: "Notion", pattern: /notion/, url: "https://www.notion.so/my-account", label: "Manage / cancel", category: "Software & Apps", cancelTip: "Settings & members -> Billing -> Downgrade plan." },
  { name: "Figma", pattern: /figma/, url: "https://www.figma.com/settings", label: "Manage / cancel", category: "Software & Apps", cancelTip: "Admin / Billing -> Manage plan." },
  { name: "LinkedIn Premium", pattern: /linkedin/, url: "https://www.linkedin.com/premium/manage", label: "Manage / cancel", category: "Software & Apps", cancelTip: "Premium subscription settings -> Cancel subscription." },
  { name: "Dropbox", pattern: /dropbox/, url: "https://www.dropbox.com/account/plan", label: "Manage / cancel", category: "Cloud & Storage", cancelTip: "Settings -> Plan -> Cancel plan." },
  { name: "Canva", pattern: /canva/, url: "https://www.canva.com/settings/billing-and-teams", label: "Manage / cancel", category: "Software & Apps", cancelTip: "Billing & plans -> Request cancellation." },
];

export function findKnownService(merchant: string): KnownService | null {
  const text = merchant.toLowerCase().replace(/[^a-z0-9. ]+/g, " ");
  return KNOWN_SERVICES.find((s) => s.pattern.test(text)) ?? null;
}

const KEYWORD_CATEGORIES: Array<{ category: Exclude<ServiceCategory, "Other">; pattern: RegExp }> = [
  {
    category: "Streaming & Media",
    pattern: /\b(stream|music|podcast|cinema|ott|gaana|jiosaavn|wynk|sonyliv|zee5|mubi|crunchyroll|playstation|nintendo)\b/i,
  },
  {
    category: "Cloud & Storage",
    pattern: /\b(icloud|onedrive|cloud|storage|backup|aws|amazon web services|cloudflare|digitalocean|hosting)\b/i,
  },
  {
    category: "Software & Apps",
    pattern: /\b(openai|chatgpt|anthropic|claude|notion|figma|github|vercel|jetbrains|slack|zoom|grammarly|1password|bitwarden|vpn)\b/i,
  },
  {
    category: "Membership",
    pattern: /\b(prime|membership|cult\.?fit|cultfit|gym|fitness|swiggy one|zomato|club|airtel|times ?prime)\b/i,
  },
];

export function classifySubscriptionCategory(merchant: string, knownCategory?: ServiceCategory): ServiceCategory {
  if (knownCategory) return knownCategory;
  const known = findKnownService(merchant);
  if (known) return known.category;
  for (const rule of KEYWORD_CATEGORIES) {
    if (rule.pattern.test(merchant)) return rule.category;
  }
  return "Other";
}

export type CancellationGuidance = {
  title: string;
  steps: string[];
  appShortcuts?: Array<{ app: string; path: string }>;
};

export const UPI_AUTOPAY_SHORTCUTS: Array<{ app: string; path: string }> = [
  { app: "Google Pay", path: "Profile photo -> Autopay -> Select mandate -> Cancel autopay" },
  { app: "PhonePe", path: "Profile -> AutoPay / Automatic Payments -> Select merchant -> Delete" },
  { app: "Paytm", path: "Profile -> UPI & Payment Settings -> Automatic Payments -> Cancel" },
  { app: "BHIM", path: "Home -> My Mandates -> Active -> Revoke" },
];

export function getCancellationGuidance(
  merchant: string,
  paymentRail?: string | null
): CancellationGuidance {
  const known = findKnownService(merchant);
  const steps: string[] = [];

  if (known?.cancelTip) {
    steps.push(`${known.name}: ${known.cancelTip}`);
  } else {
    steps.push(
      `Sign in to your ${merchant} account billing/subscription settings and turn off auto-renewal.`
    );
  }

  if (paymentRail === "upi_autopay" || paymentRail === "upi") {
    steps.push(
      "Also revoke the UPI AutoPay mandate inside the UPI app you approved it with so no further debits can run."
    );
    return {
      title: "Cancel merchant & revoke UPI AutoPay",
      steps,
      appShortcuts: UPI_AUTOPAY_SHORTCUTS,
    };
  }

  if (paymentRail === "nach_emandate") {
    steps.push(
      "For NACH / bank e-Mandates, open your bank NetBanking -> BillPay / e-Mandates / Standing Instructions and cancel the active mandate (banks usually apply changes 2–3 working days before debit)."
    );
    return {
      title: "Cancel merchant & NACH e-Mandate",
      steps,
    };
  }

  if (paymentRail === "card_si") {
    steps.push(
      "For recurring card charges, check your issuing bank's Card Standing Instruction Hub (RBI SI Hub portal linked in your bank app/NetBanking) to revoke card-on-file auto-debits."
    );
    return {
      title: "Cancel merchant & card Standing Instruction",
      steps,
    };
  }

  steps.push(
    "If you billed via Apple App Store, Google Play, or UPI AutoPay, cancel inside that store or UPI app's Autopay section as well."
  );

  return {
    title: "Cancellation checklist",
    steps,
  };
}
