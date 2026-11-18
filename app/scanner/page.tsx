import type { Metadata } from "next";
import ScannerClient from "@/components/ScannerClient";

export const metadata: Metadata = {
  title: "Statement Scanner — Subscription X-Ray",
  description:
    "Scan your bank or card CSV and PDF statements locally in your browser to uncover UPI AutoPay mandates and recurring subscriptions.",
  alternates: {
    canonical: "/scanner",
  },
};

export default function ScannerPage() {
  return <ScannerClient />;
}
