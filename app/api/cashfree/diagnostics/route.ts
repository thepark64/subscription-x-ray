import { NextRequest, NextResponse } from "next/server";
import { runCashfreeDiagnostics } from "@/lib/cashfreeDiagnostics";
import { SITE_URL } from "@/lib/config";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const liveProbe = req.nextUrl.searchParams.get("live") === "1";
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    req.headers.get("origin") ||
    SITE_URL ||
    req.nextUrl.origin;

  const report = await runCashfreeDiagnostics({ origin, liveProbe });
  return NextResponse.json(report, { status: report.ok ? 200 : 500 });
}
