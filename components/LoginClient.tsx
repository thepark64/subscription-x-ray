"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";

type Mode = "signin" | "signup" | "forgot";

export default function LoginClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("signup");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return;

    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session) {
        router.replace("/scanner");
        router.refresh();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (active && event === "SIGNED_IN" && session) {
          router.replace("/scanner");
          router.refresh();
        }
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!supabaseConfigured) {
      setError(
        "Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables."
      );
      return;
    }

    setError("");
    setNotice("");
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error: resetError } =
          await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/reset-password`,
          });

        if (resetError) {
          setError(resetError.message);
          return;
        }

        setNotice("Check your email for a link to reset your password.");
        return;
      }

      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        if (!data.session) {
          setNotice(
            "Account created successfully! Check your inbox and click the confirmation link before signing in."
          );
          setMode("signin");
          return;
        }

        router.push("/scanner");
        router.refresh();
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("email not confirmed")) {
          setError(
            "Your email is not confirmed yet. Please check your inbox and click the confirmation link."
          );
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push("/scanner");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      if (msg.includes("is not valid JSON") || msg.includes("<!doctype")) {
        setError(
          "Authentication received an HTML page instead of JSON. Verify NEXT_PUBLIC_SUPABASE_URL is your API URL (https://<project-ref>.supabase.co) and redeploy."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function changeMode(newMode: Mode) {
    setMode(newMode);
    setError("");
    setNotice("");
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

        <h1>
          {mode === "signup" && "Create your account"}
          {mode === "signin" && "Sign in"}
          {mode === "forgot" && "Reset your password"}
        </h1>

        <p className="lede">
          {mode === "signup" && "One payment unlocks 12 scans on your account."}
          {mode === "signin" && "Welcome back."}
          {mode === "forgot" && "Enter your email and we'll send a reset link."}
        </p>

        {!supabaseConfigured && (
          <div className="error-box" role="alert">
            <AlertCircle
              size={16}
              style={{ flexShrink: 0, marginTop: 2 }}
              aria-hidden="true"
            />
            <span>
              Authentication is not connected yet. Add{" "}
              <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment
              variables and apply <code>supabase/schema.sql</code>.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || !supabaseConfigured}
            />
          </div>

          {mode !== "forgot" && (
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !supabaseConfigured}
              />
            </div>
          )}

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

          {notice && (
            <div className="notice-box" role="status">
              {notice}
            </div>
          )}

          <button
            className="btn btn-primary full"
            type="submit"
            disabled={loading || !supabaseConfigured}
          >
            {loading
              ? "Please wait…"
              : mode === "signup"
                ? "Create account"
                : mode === "signin"
                  ? "Sign in"
                  : "Send reset link"}
          </button>
        </form>

        <div className="auth-links">
          {mode !== "signup" && (
            <button
              type="button"
              className="link-btn"
              onClick={() => changeMode("signup")}
              disabled={loading}
            >
              New here? Create an account
            </button>
          )}

          {mode !== "signin" && (
            <button
              type="button"
              className="link-btn"
              onClick={() => changeMode("signin")}
              disabled={loading}
            >
              Already have an account? Sign in
            </button>
          )}

          {mode !== "forgot" && (
            <button
              type="button"
              className="link-btn"
              onClick={() => changeMode("forgot")}
              disabled={loading}
            >
              Forgot password?
            </button>
          )}
        </div>
      </motion.div>
    </main>
  );
}
