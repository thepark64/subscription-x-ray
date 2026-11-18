import type { Metadata } from "next";
import LoginClient from "@/components/LoginClient";

const LOGIN_TITLE = "Sign In or Create Account — Subscription X-Ray";
const LOGIN_DESCRIPTION =
  "Sign in or create a Subscription X-Ray account to unlock 12 non-expiring browser statement scans for ₹69 and manage your saved scan history.";

export const metadata: Metadata = {
  title: LOGIN_TITLE,
  description: LOGIN_DESCRIPTION,
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: LOGIN_TITLE,
    siteName: "Subscription X-Ray",
    description: LOGIN_DESCRIPTION,
    type: "website",
    url: "/login",
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
    title: LOGIN_TITLE,
    description: LOGIN_DESCRIPTION,
    images: ["/twitter-image.png"],
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
