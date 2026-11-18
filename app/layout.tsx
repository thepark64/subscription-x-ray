import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_URL } from "@/lib/config";

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
  metadataBase: new URL(SITE_URL),
  title: "Subscription X-Ray — find recurring charges",
  description:
    "Privately scan a bank or card CSV to find recurring charges. Your raw statement stays in your browser.",
  applicationName: "Subscription X-Ray",
  openGraph: {
    title: "Subscription X-Ray",
    description:
      "Find recurring charges in your bank or card statement. Your raw CSV stays on your device.",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Subscription X-Ray",
    description: "Find recurring charges in your bank or card statement.",
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
