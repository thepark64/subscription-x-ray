import type { Metadata } from "next";
import LoginClient from "@/components/LoginClient";

export const metadata: Metadata = {
  title: "Sign in — Subscription X-Ray",
  description:
    "Sign in or create an account to manage your Subscription X-Ray scan pack and scan bank or card statements privately.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
