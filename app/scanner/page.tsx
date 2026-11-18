import type { Metadata } from "next";
import ScannerClient from "@/components/ScannerClient";

const SCANNER_TITLE = "Statement Scanner — Privacy-First Subscription X-Ray";
const SCANNER_DESCRIPTION =
  "Analyze Indian bank and card CSV or PDF statements locally in your browser to detect UPI AutoPay mandates, NACH debits, and hidden subscriptions.";

export const metadata: Metadata = {
  title: SCANNER_TITLE,
  description: SCANNER_DESCRIPTION,
  alternates: {
    canonical: "/scanner",
  },
  openGraph: {
    title: SCANNER_TITLE,
    siteName: "Subscription X-Ray",
    description: SCANNER_DESCRIPTION,
    type: "website",
    url: "/scanner",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Subscription X-Ray — Find recurring charges and UPI AutoPay mandates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SCANNER_TITLE,
    description: SCANNER_DESCRIPTION,
    images: ["/twitter-image.png"],
  },
};

export default function ScannerPage() {
  return <ScannerClient />;
}
