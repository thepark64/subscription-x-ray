"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Check, Lock, Pencil, X } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { isMissingColumnError, normalizeStatementName } from "@/lib/scanHistory";
import Scanner from "@/components/Scanner";
import PayButton from "@/components/PayButton";
import AccountActions from "@/components/AccountActions";
import BrandMark from "@/components/BrandMark";
import { PACK_PRICE_LABEL, PACK_SIZE } from "@/lib/config";

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

  async function spendCredit(): Promise<boolean> {
    const { data: remaining, error } = await supabase.rpc(
      "consume_scan_credit"
    );
    if (error) return false;
    setCredits(remaining);
    return true;
  }

  if (gate === "checking") {
    return (
      <main className="gate-wrap">
        <div className="glass-panel gate-card">
          <p className="lede" style={{ marginBottom: 0 }}>
            Checking your account…
          </p>
        </div>
      </main>
    );
  }

  if (gate === "not-configured") {
    return (
      <main className="gate-wrap">
        <div className="glass-panel gate-card">
          <Link href="/" className="back" style={{ marginBottom: 20 }}>
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
      <main className="gate-wrap">
        <div className="glass-panel gate-card">
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
      <main className="gate-wrap">
        <div className="glass-panel gate-card">
          <Link href="/" className="back" style={{ marginBottom: 20 }}>
            <ArrowLeft size={16} aria-hidden="true" />
            <BrandMark size={22} />
            <span>Subscription X-Ray</span>
          </Link>
          <h1>Sign in to scan your statements</h1>
          <p className="lede">
            {PACK_PRICE_LABEL} unlocks {PACK_SIZE} scans on your account — sign
            in or create an account to continue.
          </p>
          <Link className="btn btn-primary" href="/login">
            Sign in / create account
          </Link>
        </div>
      </main>
    );
  }

  const locked = credits <= 0;

  return (
    <main className="scanner-page">
      <div className="wrap wrap-dashboard">
        <header className="glass-panel scanner-top">
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
                <Pencil size={13} aria-hidden="true" />
                <span>{fullName ? "Edit name" : "Add name"}</span>
              </button>
            )}
            <AccountActions />
          </div>
        </header>
        {paymentNotice && (
          <div className="notice-box" style={{ marginBottom: 20 }} role="status">
            {paymentNotice}
          </div>
        )}
        {paymentError && (
          <div className="error-box" style={{ marginBottom: 20 }} role="alert">
            <AlertCircle
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
          spendCredit={spendCredit}
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
