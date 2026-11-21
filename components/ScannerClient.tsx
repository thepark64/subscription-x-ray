"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  PencilSimple,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { isMissingColumnError, normalizeStatementName } from "@/lib/scanHistory";
import AccountActions from "@/components/AccountActions";
import BrandMark from "@/components/BrandMark";
import { trackPurchaseSuccess } from "@/lib/analytics";
import { PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";

const Scanner = dynamic(() => import("@/components/Scanner"), {
  ssr: false,
  loading: () => (
    <div className="glass-panel scan-progress-banner" style={{ marginTop: 24 }}>
      <div className="scan-progress-text">
        <strong>Loading statement scanner…</strong>
        <span>Preparing your workspace locally in your browser.</span>
      </div>
    </div>
  ),
});

const PayButton = dynamic(() => import("@/components/PayButton"), {
  ssr: false,
});

type Gate =
  | "checking"
  | "not-configured"
  | "needs-login"
  | "ready"
  | "error";

export default function ScannerClient() {
  const [gate, setGate] = useState<Gate>(
    supabaseConfigured ? "checking" : "not-configured"
  );
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [userId, setUserId] = useState("");
  const [credits, setCredits] = useState(0);
  const [paymentNotice, setPaymentNotice] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const refreshProfile = useCallback(
    async (id: string, fallbackName = ""): Promise<number> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("scan_credits, full_name")
        .eq("id", id)
        .maybeSingle();

      if (error && isMissingColumnError(error, "full_name")) {
        const legacy = await supabase
          .from("profiles")
          .select("scan_credits")
          .eq("id", id)
          .maybeSingle();
        if (legacy.error) throw legacy.error;
        const remaining = legacy.data?.scan_credits ?? 0;
        setCredits(remaining);
        setFullName(fallbackName);
        return remaining;
      }

      if (error) throw error;
      const remaining = data?.scan_credits ?? 0;
      setCredits(remaining);
      setFullName(
        typeof data?.full_name === "string" && data.full_name.trim()
          ? data.full_name.trim()
          : fallbackName
      );
      return remaining;
    },
    []
  );

  useEffect(() => {
    if (!supabaseConfigured) return;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setGate("needs-login");
        return;
      }
      const metaName =
        typeof session.user.user_metadata?.full_name === "string"
          ? session.user.user_metadata.full_name.trim()
          : "";
      setEmail(session.user.email ?? "");
      setUserId(session.user.id);
      try {
        const params = new URLSearchParams(window.location.search);
        const cfOrderId = params.get("cf_order_id");
        if (cfOrderId) {
          const verifyRes = await fetch("/api/cashfree/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ orderId: cfOrderId }),
          });
          if (verifyRes.status === 200) {
            trackPurchaseSuccess(cfOrderId);
            setPaymentNotice(
              `Payment confirmed — ${PACK_SIZE} scan credits added to your account.`
            );
          } else if (verifyRes.status === 202) {
            setPaymentError(
              "Your payment is still confirming. Please refresh in a few moments."
            );
          } else {
            const payload = await verifyRes.json().catch(() => ({}));
            setPaymentError(
              payload.error || "Could not confirm your payment automatically."
            );
          }
          window.history.replaceState({}, "", "/scanner");
        }

        await refreshProfile(session.user.id, metaName);
        setGate("ready");
      } catch {
        setGate("error");
      }
    })();
  }, [refreshProfile]);

  async function saveProfileName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleaned = normalizeStatementName(nameDraft);
    setSavingName(true);
    try {
      await supabase.auth.updateUser({
        data: { full_name: cleaned || null },
      });
      await supabase.rpc("update_profile_name", {
        p_full_name: cleaned,
      });
      setFullName(cleaned);
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  }

  if (gate === "checking") {
    return (
      <main id="main-content" className="gate-wrap">
        <div className="surface-card gate-card gate-card-wide">
          <Link href="/" className="back">
            <ArrowLeft size={16} aria-hidden="true" />
            <BrandMark size={22} />
            <span>Subscription X-Ray</span>
          </Link>
          <h1>Statement scanner</h1>
          <p className="lede" role="status">
            Checking your account… If you already have an account, your scan
            workspace will load automatically.
          </p>
          <Link className="btn btn-primary" href="/login">
            Sign in / create account
          </Link>
          <section
            className="gate-info-section"
            aria-labelledby="scanner-checking-overview"
          >
            <h2 id="scanner-checking-overview">
              How browser-only scanning works
            </h2>
            <p className="gate-info-lede body-6">
              Subscription X-Ray runs statement parsing and recurring charge
              analysis locally inside your browser so sensitive financial files
              and PDF passwords never leave your device.
            </p>
            <ul className="gate-info-list">
              <li>
                <strong>Supported banks &amp; file formats:</strong> Upload CSV
                exports, digital bank PDFs, or password-protected PDF statements
                from HDFC, SBI, ICICI, Axis, Kotak, and major credit card
                issuers.
              </li>
              <li>
                <strong>Smart noise filtering &amp; mandate labels:</strong>{" "}
                Automatically excludes failed attempts, UPI reversals, salary
                credits, and ₹1–₹5 mandate holds while labeling UPI AutoPay,
                NACH e-mandates, and card standing instructions with confidence
                scores.
              </li>
              <li>
                <strong>{PACK_PRICE_LABEL} one-time pack:</strong> Unlocks{" "}
                {PACK_SIZE} non-expiring scan credits with CSV/PDF export and
                cancellation guides. Valid statements with zero recurring charges
                never deduct a credit.
              </li>
            </ul>
          </section>
          <nav className="legal-related-links" aria-label="Scanner navigation">
            <Link href="/">Home</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/refund">Refunds</Link>
          </nav>
        </div>
      </main>
    );
  }

  if (gate === "not-configured") {
    return (
      <main id="main-content" className="gate-wrap">
        <div className="surface-card gate-card">
          <Link href="/" className="back">
            <ArrowLeft size={16} aria-hidden="true" />
            <BrandMark size={22} />
            <span>Subscription X-Ray</span>
          </Link>
          <h1>Connect Supabase to enable accounts</h1>
          <p className="lede">
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> to <code>.env.local</code>,
            then run <code>supabase/schema.sql</code> in your Supabase SQL
            Editor.
          </p>
          <Link className="btn btn-primary" href="/">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  if (gate === "error") {
    return (
      <main id="main-content" className="gate-wrap">
        <div className="surface-card gate-card">
          <h1>Couldn&apos;t load your account</h1>
          <p className="lede">
            Check your connection and ensure <code>supabase/schema.sql</code>{" "}
            has been applied in Supabase.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (gate === "needs-login") {
    return (
      <main id="main-content" className="gate-wrap">
        <div className="surface-card gate-card gate-card-wide">
          <Link href="/" className="back">
            <ArrowLeft size={16} aria-hidden="true" />
            <BrandMark size={22} />
            <span>Subscription X-Ray</span>
          </Link>
          <h1>Sign in to scan your statements</h1>
          <p className="lede">
            {PACK_PRICE_LABEL} unlocks {PACK_SIZE} non-expiring scans on your
            account — sign in or create an account to open the scanner.
          </p>
          <Link className="btn btn-primary" href="/login">
            Sign in / create account
          </Link>
          <section
            className="gate-info-section"
            aria-labelledby="scanner-login-overview"
          >
            <h2 id="scanner-login-overview">
              How browser-only scanning works
            </h2>
            <p className="gate-info-lede body-6">
              Sign in or create an account to manage your 12-scan credit pack,
              unlock browser-side CSV and PDF statement scanning, and save scan
              summaries across visits.
            </p>
            <ul className="gate-info-list">
              <li>
                <strong>Supported banks &amp; file formats:</strong> CSV
                exports, digital PDFs, and encrypted bank PDFs from HDFC, SBI,
                ICICI, Axis, Kotak, and credit cards stay strictly in browser
                memory.
              </li>
              <li>
                <strong>Mandate rails &amp; revoke guidance:</strong> Surfaces
                recurring OTT, SaaS, UPI AutoPay mandates, NACH debits, and
                card standing instructions with Google Pay, PhonePe, Paytm, and
                bank cancellation steps.
              </li>
              <li>
                <strong>Zero-credit guarantee:</strong> Valid statements with
                zero detected recurring charges never spend a credit, and your
                ₹69 scan credits never expire.
              </li>
            </ul>
          </section>
          <nav className="legal-related-links" aria-label="Scanner navigation">
            <Link href="/">Home</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/refund">Refunds</Link>
          </nav>
        </div>
      </main>
    );
  }

  const locked = credits <= 0;

  return (
    <main id="main-content" className="scanner-page">
      <div className="wrap wrap-dashboard">
        <header className="surface-card scanner-top">
          <div className="scanner-brand-group">
            <Link href="/" className="back">
              <ArrowLeft size={15} aria-hidden="true" />
              <BrandMark size={26} />
              <span>Subscription X-Ray</span>
            </Link>
            <span className="topbar-sep" aria-hidden="true">
              /
            </span>
            <span className="topbar-context">Statement scanner</span>
          </div>

          <div className="scanner-account">
            <span className="account-meta">
              {fullName && <strong>{fullName}</strong>}
              {fullName && email && <span aria-hidden="true">·</span>}
              {email && <span>{email}</span>}
            </span>
            {editingName ? (
              <form className="name-edit-form" onSubmit={saveProfileName}>
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="Your name"
                  aria-label="Your display name"
                  maxLength={80}
                  disabled={savingName}
                />
                <button
                  type="submit"
                  className="icon-action-btn"
                  aria-label="Save name"
                  disabled={savingName}
                >
                  <Check size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-action-btn"
                  aria-label="Cancel editing name"
                  onClick={() => setEditingName(false)}
                  disabled={savingName}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setNameDraft(fullName);
                  setEditingName(true);
                }}
              >
                <PencilSimple size={14} aria-hidden="true" />
                <span>{fullName ? "Edit name" : "Add name"}</span>
              </button>
            )}
            <AccountActions />
          </div>
        </header>
        {paymentNotice && (
          <div className="notice-box" style={{ marginBottom: 24 }} role="status">
            {paymentNotice}
          </div>
        )}
        {paymentError && (
          <div className="error-box" style={{ marginBottom: 24 }} role="alert">
            <WarningCircle
              size={16}
              style={{ flexShrink: 0, marginTop: 2 }}
              aria-hidden="true"
            />
            <span>{paymentError}</span>
          </div>
        )}
        <Scanner
          userId={userId}
          credits={credits}
          locked={locked}
          onCreditsUpdated={setCredits}
          paywall={
            <PayButton
              currentCredits={credits}
              onCreditsChanged={() => refreshProfile(userId, fullName)}
            />
          }
        />
      </div>
    </main>
  );
}
