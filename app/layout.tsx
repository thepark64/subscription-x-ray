import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { CANONICAL_SITE_URL } from "@/lib/config";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
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
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="app-shell">{children}</div>
        <Analytics />
        <Script
          src="https://www.googletagmanager.com/gtm.js?id=GTM-K3DK3S7M"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
