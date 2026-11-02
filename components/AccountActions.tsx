"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { SUPPORT_EMAIL } from "@/lib/config";

export default function AccountActions() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function signOut() {
    setBusy(true);
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  async function deleteAccount() {
    const confirmed = window.confirm(
      "Permanently delete your account, scan history and saved scan results? This cannot be undone."
    );
    if (!confirmed) return;

    setBusy(true);
    setMessage("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setBusy(false);
      router.replace("/login");
      return;
    }

    const response = await fetch("/api/account/delete", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.error || `Deletion failed. Contact ${SUPPORT_EMAIL}.`);
      setBusy(false);
      return;
    }

    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="account-actions">
      {message && <span className="small-note" role="alert">{message}</span>}
      <button className="link-btn" type="button" onClick={signOut} disabled={busy}>Sign out</button>
      <button className="link-btn danger-link" type="button" onClick={deleteAccount} disabled={busy}>Delete account</button>
    </div>
  );
}
