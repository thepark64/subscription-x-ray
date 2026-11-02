import { createClient } from "@supabase/supabase-js";

// The public anon key is safe to expose; Row Level Security is the boundary.
// Placeholders let `next build` run before deployment environment variables are
// configured. The app will not authenticate successfully until real values are set.
const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(configuredUrl && configuredKey);

export const supabase = createClient(
  configuredUrl || "https://not-configured.supabase.co",
  configuredKey || "missing-supabase-anon-key"
);
