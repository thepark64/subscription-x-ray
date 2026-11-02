import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\\s+/i, "");
  if (!token) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Account service is not configured." }, { status: 500 });

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ error: "Your session has expired." }, { status: 401 });

  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) {
    console.error("Account deletion failed:", deleteError.message);
    return NextResponse.json({ error: "We couldn't delete your account. Please contact support." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
