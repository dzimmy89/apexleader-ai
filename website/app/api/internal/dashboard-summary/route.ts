import { NextRequest, NextResponse } from "next/server";
import { verifyDashboardCaller } from "@/lib/dashboard-auth";
import { getDashboardSummary } from "@/lib/crm/dashboard-summary";
import { getPackages } from "@/lib/coaching/packages";
import { DEFAULT_PACKAGE_PRICES } from "@/lib/crm/pipeline-utils";

export const dynamic = "force-dynamic";

const BUSINESS = "fromaitobusiness";

/**
 * GET /api/internal/dashboard-summary?days=7
 * Authorization: Bearer <GitHub Actions identity token>
 * Answers only the "Dashboard collect" workflow of the GTM repository
 * (lib/dashboard-auth.ts). Totals only (no names, emails or ids) for the
 * all-business dashboard.
 */
export async function GET(request: NextRequest) {
  if (!(await verifyDashboardCaller(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const raw = Number(request.nextUrl.searchParams.get("days") ?? "7");
  const windowDays = Number.isFinite(raw) ? Math.min(Math.max(Math.round(raw), 1), 90) : 7;

  const packages = await getPackages({ activeOnly: false }).catch(() => []);
  const packagePrices: Record<string, number> = { ...DEFAULT_PACKAGE_PRICES };
  for (const p of packages) packagePrices[p.id] = p.price;

  try {
    const summary = await getDashboardSummary({ business: BUSINESS, windowDays, packagePrices });
    return NextResponse.json(summary, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[dashboard-summary]", err);
    return NextResponse.json({ error: "summary_failed" }, { status: 500 });
  }
}
