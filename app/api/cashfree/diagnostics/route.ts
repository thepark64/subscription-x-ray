import { NextRequest, NextResponse } from "next/server";
import { runCashfreeDiagnostics } from "@/lib/cashfreeDiagnostics";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const liveProbe = req.nextUrl.searchParams.get("live") === "1";
  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.nextUrl.origin;

  const report = await runCashfreeDiagnostics({ origin, liveProbe });
  return NextResponse.json(report, { status: report.ok ? 200 : 500 });
}
