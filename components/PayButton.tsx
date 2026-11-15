"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { PACK_PRICE_LABEL, PACK_SIZE, SUPPORT_EMAIL } from "@/lib/config";

type CashfreeCheckoutResult = {
  error?: { message?: string };
  redirect?: boolean;
  paymentDetails?: { paymentMessage?: string };
};

type CashfreeInstance = {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget?: "_modal" | "_self" | "_blank" | "_top";
  }) => Promise<CashfreeCheckoutResult>;
};

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => CashfreeInstance;
  }
}

function loadCashfreeScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Cashfree) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PayButton({
  currentCredits,
  onCreditsChanged,
}: {
  currentCredits: number;
  onCreditsChanged: () => Promise<number>;
}) {
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [hasSavedPhone, setHasSavedPhone] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active || !session) return;
      const saved =
        typeof session.user.phone === "string" && session.user.phone.trim()
          ? session.user.phone
          : typeof session.user.user_metadata?.phone === "string"
            ? session.user.user_metadata.phone
            : "";
      const digits = saved.replace(/\D/g, "");
      if (digits.length >= 10) {
        setHasSavedPhone(true);
      } else {
        setHasSavedPhone(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function waitForCredits(accessToken: string, orderId: string) {
    setWaiting(true);
    try {
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const verifyRes = await fetch("/api/cashfree/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ orderId }),
        });
        if (verifyRes.status === 200) {
          await onCreditsChanged();
          setWaiting(false);
          setBusy(false);
          return;
        }
        if (verifyRes.status === 202) {
          const latest = await onCreditsChanged();
          if (latest > currentCredits) {
            setWaiting(false);
            setBusy(false);
            return;
          }
          continue;
        }
        const latest = await onCreditsChanged();
        if (latest > currentCredits) {
          setWaiting(false);
          setBusy(false);
          return;
        }
      }
    } catch {
      // Keep the customer informed; webhook may still complete asynchronously.
    }
    setWaiting(false);
    setBusy(false);
    setError(
      `Your payment is taking a moment to confirm. Refresh in a minute, or email ${SUPPORT_EMAIL} with order ID ${orderId}.`
    );
  }

  async function verifyOrder(accessToken: string, orderId: string) {
    setWaiting(true);
    try {
      const verifyRes = await fetch("/api/cashfree/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ orderId }),
      });

      if (verifyRes.status === 200) {
        await onCreditsChanged();
        setWaiting(false);
        setBusy(false);
        return;
      }

      if (verifyRes.status === 202) {
        await waitForCredits(accessToken, orderId);
        return;
      }

      const payload = await verifyRes.json().catch(() => ({}));
      setError(
        payload.error ||
          `Could not verify payment automatically. Email ${SUPPORT_EMAIL} with order ID ${orderId}.`
      );
      setWaiting(false);
      setBusy(false);
    } catch {
      await waitForCredits(accessToken, orderId);
    }
  }

  async function pay() {
    setError("");
    setBusy(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in first.");

      const ok = await loadCashfreeScript();
      if (!ok || !window.Cashfree) {
        throw new Error(
          "Could not load the Cashfree checkout window. Check your connection."
        );
      }

      const cleanDigits = phone.replace(/\D/g, "");
      if (cleanDigits.length > 0 && cleanDigits.length < 10) {
        throw new Error("Enter a valid 10-digit mobile number, or leave it blank.");
      }
      const normalizedPhone =
        cleanDigits.length >= 10 ? cleanDigits.slice(-10) : undefined;
      if (normalizedPhone) {
        await supabase.auth
          .updateUser({ data: { phone: normalizedPhone } })
          .catch(() => null);
        setHasSavedPhone(true);
      }

      const res = await fetch("/api/cashfree/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(
          normalizedPhone ? { phone: normalizedPhone } : {}
        ),
      });
      const raw = await res.text();
      let order: {
        error?: string;
        orderId?: string;
        paymentSessionId?: string;
        mode?: string;
      } = {};
      try {
        order = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          `Payment endpoint returned HTML instead of JSON (HTTP ${res.status}). Deploy the updated /api/cashfree routes to your host.`
        );
      }
      if (!res.ok || !order.paymentSessionId || !order.orderId) {
        throw new Error(order.error ?? "Could not start the payment.");
      }

      const cashfree = window.Cashfree({
        mode: order.mode === "production" ? "production" : "sandbox",
      });

      const result = await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_modal",
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Payment was cancelled or could not be completed."
        );
        setBusy(false);
        return;
      }

      if (result.redirect) {
        // Redirect flows return to /scanner?cf_order_id=...
        return;
      }

      await verifyOrder(session.access_token, order.orderId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="pay-cta-stack">
      {!hasSavedPhone && (
        <input
          type="tel"
          inputMode="numeric"
          className="pay-phone-input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="10-digit mobile (optional for Cashfree)"
          aria-label="10-digit mobile number for Cashfree checkout"
          maxLength={15}
          disabled={busy || waiting}
        />
      )}
      <button
        className="btn btn-primary"
        onClick={pay}
        disabled={busy || waiting}
      >
        {waiting
          ? "Confirming payment…"
          : busy
            ? "Opening Cashfree…"
            : `Pay ${PACK_PRICE_LABEL} for ${PACK_SIZE} scans`}
      </button>
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
    </div>
  );
}
