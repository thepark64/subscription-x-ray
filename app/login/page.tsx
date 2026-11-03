
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Mode = "signin" | "signup" | "forgot";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("signup");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setNotice("");
    setLoading(true);

    try {
      // FORGOT PASSWORD
      if (mode === "forgot") {
        const { error: resetError } =
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

        if (resetError) {
          setError(resetError.message);
          return;
        }

        setNotice("Check your email for a link to reset your password.");
        return;
      }

      // SIGN UP
      if (mode === "signup") {
        const { data, error: authError } =
          await supabase.auth.signUp({
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

        // Email confirmation required
        if (!data.session) {
          setNotice(
            "Account created successfully! Check your inbox and click the confirmation link before signing in."
          );

          setMode("signin");
          return;
        }

        // Email confirmation disabled
        router.push("/scanner");
        router.refresh();
        return;
      }

      // SIGN IN
      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        if (
          authError.message.toLowerCase().includes("email not confirmed")
        ) {
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
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
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
      <div className="wrap auth-wrap">
        <a href="/" className="back">
          ← Subscription X-Ray
        </a>

        <h1>
          {mode === "signup" && "Create your account"}
          {mode === "signin" && "Sign in"}
          {mode === "forgot" && "Reset your password"}
        </h1>

        <p className="lede">
          {mode === "signup" &&
            "One payment unlocks 12 scans on your account."}

          {mode === "signin" && "Welcome back."}

          {mode === "forgot" &&
            "Enter your email and we'll send a reset link."}
        </p>

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
              disabled={loading}
            />
          </div>

          {mode !== "forgot" && (
            <div className="field">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                autoComplete={
                  mode === "signup"
                    ? "new-password"
                    : "current-password"
                }
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <div className="error-box" role="alert">
              {error}
            </div>
          )}

          {notice && (
            <div className="notice-box" role="status">
              {notice}
            </div>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: "100%" }}
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
    </main>
  );
}
