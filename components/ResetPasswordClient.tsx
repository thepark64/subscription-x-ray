"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";

type LinkStatus = "checking" | "valid" | "invalid";

export default function ResetPasswordClient() {
  const router = useRouter();
  const [linkStatus, setLinkStatus] = useState<LinkStatus>(
    supabaseConfigured ? "checking" : "invalid"
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return;

    const hasCode =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("code");

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "PASSWORD_RECOVERY" ||
        (hasCode && event === "SIGNED_IN")
      ) {
        setLinkStatus("valid");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setLinkStatus("valid");
    });

    const timeout = setTimeout(() => {
      setLinkStatus((current) => (current === "checking" ? "invalid" : current));
    }, 8000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
  }

  if (linkStatus === "checking") {
    return (
      <main className="auth-page">
        <div className="glass-panel auth-card">
          <p className="lede">Checking your reset link…</p>
        </div>
      </main>
    );
  }

  if (linkStatus === "invalid") {
    return (
      <main className="auth-page">
        <div className="glass-panel auth-card">
          <h1>This link didn&apos;t work</h1>
          <p className="lede" style={{ marginBottom: 24 }}>
            It may have expired (reset links are time-limited) or already been
            used. Request a fresh one from the sign-in page.
          </p>
          <button
            className="btn btn-primary full"
            onClick={() => router.push("/login")}
          >
            Back to sign in
          </button>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="auth-page">
        <div className="glass-panel auth-card">
          <h1>Password updated</h1>
          <p className="lede" style={{ marginBottom: 24 }}>
            You can now sign in with your new password.
          </p>
          <button
            className="btn btn-primary full"
            onClick={() => router.push("/login")}
          >
            Go to sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <motion.div
        className="glass-panel auth-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link href="/" className="back">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Subscription X-Ray</span>
        </Link>
        <h1>Set a new password</h1>
        <p className="lede">Choose a new password for your account.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <div className="error-box" role="alert">
              <AlertCircle
                size={16}
                style={{ flexShrink: 0, marginTop: 2 }}
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          )}
          <button
            className="btn btn-primary full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Please wait…" : "Update password"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
