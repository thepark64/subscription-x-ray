import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { CANONICAL_SITE_URL } from "@/lib/config";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_URL),
  title: "Subscription X-Ray — Find Recurring Charges",
  description:
    "Scan Indian bank or card CSV & PDF statements privately in your browser. Spot UPI AutoPay mandates and recurring charges — ₹69 for 12 scans.",
  applicationName: "Subscription X-Ray",
  icons: {
    icon: [
      { url: "/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Subscription X-Ray — Find Recurring Charges",
    siteName: "Subscription X-Ray",
    description:
      "Scan Indian bank or card CSV & PDF statements privately in your browser. Spot UPI AutoPay mandates and recurring charges — ₹69 for 12 scans.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subscription X-Ray — Find Recurring Charges",
    description:
      "Scan Indian bank or card CSV & PDF statements privately in your browser. Spot UPI AutoPay mandates and recurring charges — ₹69 for 12 scans.",
  },
  verification: {
    google: "lN8dgPoNm_qnJNyMdtCZ-paNz2XToPhWJpec5qVXbyA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <div className="ambient-canvas" aria-hidden="true">
          <div className="ambient-glow ambient-glow-primary" />
          <div className="ambient-glow ambient-glow-secondary" />
        </div>
        <div className="app-shell">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
