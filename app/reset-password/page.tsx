import type { Metadata } from "next";
import ResetPasswordClient from "@/components/ResetPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password — Subscription X-Ray",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
