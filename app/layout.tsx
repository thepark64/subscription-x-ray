import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_URL } from "@/lib/config";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap"
        />
      </head>
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
