import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Subscription X-Ray — find recurring charges",
  description: "Privately scan a bank or card CSV to find recurring charges. Your raw statement stays in your browser.",
  applicationName: "Subscription X-Ray",
  openGraph: {
    title: "Subscription X-Ray",
    description: "Find recurring charges in your bank or card statement. Your raw CSV stays on your device.",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Subscription X-Ray",
    description: "Find recurring charges in your bank or card statement.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
