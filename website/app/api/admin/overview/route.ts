import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getOverviewStats } from "@/lib/crm/overview-stats";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const stats = await getOverviewStats();
  return NextResponse.json(stats);
}
