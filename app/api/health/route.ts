import { NextResponse } from "next/server";
import { getCashfreeConfig, getMissingPaymentEnvVars } from "@/lib/cashfree";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const cf = getCashfreeConfig();
  const admin = getSupabaseAdmin();
  const missing = getMissingPaymentEnvVars();

  return NextResponse.json({
    ok: true,
    service: "subscription-xray",
    configured: {
      supabase: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
      supabaseAdmin: Boolean(admin),
      cashfree: Boolean(cf),
      cashfreeMode: cf?.mode ?? null,
    },
    missing,
  });
}
