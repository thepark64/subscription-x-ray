import { NextResponse } from "next/server";
import { getCashfreeConfig } from "@/lib/cashfree";

export async function GET() {
  const cf = getCashfreeConfig();
  return NextResponse.json({
    ok: true,
    service: "subscription-xray",
    configured: {
      supabase: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
      supabaseAdmin: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
      cashfree: Boolean(cf),
      cashfreeMode: cf?.mode ?? null,
    },
  });
}
