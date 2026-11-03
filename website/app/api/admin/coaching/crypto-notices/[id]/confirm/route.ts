import { NextRequest, NextResponse } from "next/server";
import { requireAdminCookie } from "@/lib/admin-auth";
import { originMatchesSite } from "@/lib/auth/admin-login-request-guards";
import { confirmCryptoNotice } from "@/lib/coaching/crypto-notices";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

// POST /api/admin/coaching/crypto-notices/:id/confirm
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminCookie(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status, headers: NO_STORE });
  }
  if (!originMatchesSite(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: NO_STORE });
  }
  const { id } = await context.params;
  const result = await confirmCryptoNotice(id, auth.username);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: NO_STORE });
  }
  return NextResponse.json(result, { headers: NO_STORE });
}
