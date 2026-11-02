// Product configuration shared by the UI and server routes.
export const PACK_SIZE = 12;
export const PACK_PRICE_RUPEES = 69;
export const PACK_PRICE_PAISE = PACK_PRICE_RUPEES * 100;
export const PACK_PRICE_LABEL = `₹${PACK_PRICE_RUPEES}`;
export const SUPPORT_EMAIL = "support@subscriptionxray.jo3.org";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://subscriptionxray.jo3.org";
