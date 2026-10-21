import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { originMatchesSite } from "@/lib/auth/admin-login-request-guards";
import { markCrmContactOptedOut } from "@/lib/crm/admin-1to1-send";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

// POST /api/admin/contacts/:email/opt-out
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return json({ error: "Unauthorized" }, auth.status);
  }
  if (!originMatchesSite(request)) {
    return json({ error: "Forbidden" }, 403);
  }
  const { email } = await params;
  const result = await markCrmContactOptedOut(decodeURIComponent(email), {
    allowKnownNonCrmContact: true,
  });
  if (!result.ok) {
    return json({ error: result.error }, result.status);
  }
  return json({ ok: true });
}
