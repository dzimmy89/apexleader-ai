import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { listCryptoNotices } from "@/lib/coaching/crypto-notices";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/admin/coaching/crypto-notices
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const notices = await listCryptoNotices();
  return NextResponse.json({ notices }, { headers: { "Cache-Control": "no-store" } });
}
