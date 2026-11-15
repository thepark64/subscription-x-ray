"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";
import { extractAuthErrorFromLocation } from "@/lib/authRedirect";

/**
 * Handles Supabase Auth email callbacks if Supabase redirects to the root
 * Site URL (`https://subscription-x-ray.vercel.app/`) instead of `/login` or
 * `/reset-password`.
 */
export default function AuthCallbackHandler() {
  const router = useRouter();

  useEffect(() => {
    if (!supabaseConfigured || typeof window === "undefined") return;

    const search = window.location.search;
    const hash = window.location.hash;

    const authError = extractAuthErrorFromLocation(search, hash);
    if (authError) {
      router.replace(`/login${search}${hash}`);
      return;
    }

    const hasAuthParams =
      hash.includes("access_token=") ||
      hash.includes("type=recovery") ||
      search.includes("code=") ||
      search.includes("type=recovery");

    if (!hasAuthParams) return;

    if (hash.includes("type=recovery") || search.includes("type=recovery")) {
      router.replace(`/reset-password${search}${hash}`);
      return;
    }

    let active = true;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;
        if (event === "PASSWORD_RECOVERY") {
          router.replace("/reset-password");
          return;
        }
        if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
          router.replace("/scanner");
          router.refresh();
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session) {
        router.replace("/scanner");
        router.refresh();
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
