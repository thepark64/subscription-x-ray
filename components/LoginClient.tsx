"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, WarningCircle } from "@phosphor-icons/react";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import {
  extractAuthErrorFromLocation,
  getEmailConfirmationRedirectUrl,
  getPasswordResetRedirectUrl,
} from "@/lib/authRedirect";
import { trackSignupCompleted } from "@/lib/analytics";
import BrandMark from "@/components/BrandMark";

type Mode = "signin" | "signup" | "forgot";

export default function LoginClient() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("signup");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return;

    const urlError = extractAuthErrorFromLocation(
      window.location.search,
      window.location.hash
    );
    if (urlError) {
      setError(urlError);
    }

    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session) {
        router.replace("/scanner");
        router.refresh();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          active &&
          session &&
          (event === "SIGNED_IN" || event === "INITIAL_SESSION")
        ) {
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

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address before submitting.");
      return;
    }
    if (mode !== "forgot" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setNotice("");
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error: resetError } =
          await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: getPasswordResetRedirectUrl(),
          });

        if (resetError) {
          setError(resetError.message);
          return;
        }

        setNotice("Check your email for a link to reset your password.");
        return;
      }

      if (mode === "signup") {
        const cleanName = fullName.trim().slice(0, 80);
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: getEmailConfirmationRedirectUrl(),
            ...(cleanName ? { data: { full_name: cleanName } } : {}),
          },
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        trackSignupCompleted("email");

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
    <main id="main-content" className="auth-page">
      <div className="surface-card auth-card auth-card-enter">
        <Link href="/" className="back">
          <ArrowLeft size={16} aria-hidden="true" />
          <BrandMark size={22} />
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
            <WarningCircle
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
          {mode === "signup" && (
            <div className="field">
              <label htmlFor="full-name">Full name</label>
              <input
                id="full-name"
                type="text"
                autoComplete="name"
                maxLength={80}
                placeholder="e.g. Rayyan Khan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading || !supabaseConfigured}
              />
            </div>
          )}

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
              <WarningCircle
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
      </div>

      <section
        className="glass-panel auth-info-card"
        aria-labelledby="login-account-overview"
      >
        <h2 id="login-account-overview">
          What your Subscription X-Ray account includes
        </h2>
        <p className="gate-info-lede body-6">
          Your account syncs your non-expiring scan credit balance, saved scan
          summaries, and 6-month recurring spend history across devices — while
          keeping your raw bank statements strictly in your browser.
        </p>
        <ul className="gate-info-list">
          <li>
            <strong>₹69 one-time for 12 scans:</strong> Credits never expire,
            have no renewal fee, and are added automatically after Cashfree
            verification.
          </li>
          <li>
            <strong>Browser-local statement parsing:</strong> Indian bank and credit
            card CSV or PDF statements (including password-protected bank PDFs)
            are decoded locally in browser memory. Raw transaction rows and PDF
            passwords are never uploaded.
          </li>
          <li>
            <strong>Zero-subscription protection:</strong> If a valid bank or
            card statement yields zero recurring charges, no scan credit is
            deducted.
          </li>
          <li>
            <strong>UPI AutoPay, NACH &amp; Card SI detection:</strong> View
            confidence ratings, payment rail badges, merchant cancellation
            links, step-by-step UPI revoke guides, CSV/PDF exports, and
            6-month spending trends.
          </li>
        </ul>
        <nav
          className="legal-related-links"
          aria-label="Explore Subscription X-Ray"
        >
          <Link href="/">Home</Link>
          <Link href="/scanner">Statement scanner</Link>
          <Link href="/guides">Guides</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refund">Refunds</Link>
        </nav>
      </section>
    </main>
  );
}
