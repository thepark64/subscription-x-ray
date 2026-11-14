import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/config";

const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body>
        <div className="ambient-canvas" aria-hidden="true">
          <div className="ambient-glow ambient-glow-primary" />
          <div className="ambient-glow ambient-glow-secondary" />
        </div>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
