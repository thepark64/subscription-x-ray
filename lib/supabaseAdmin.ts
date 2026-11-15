import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cleanEnvValue } from "@/lib/cashfree";

// SERVER-ONLY. Uses the service-role key, which bypasses Row Level Security.
// Never import this from a client component.
let cached: SupabaseClient | null = null;
let cachedKey = "";

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = cleanEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  );
  const key = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) return null;

  const cacheSignature = `${url}::${key}`;
  if (cached && cachedKey === cacheSignature) return cached;

  cached = createClient(url, key, { auth: { persistSession: false } });
  cachedKey = cacheSignature;
  return cached;
}
