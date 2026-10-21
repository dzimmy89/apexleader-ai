import { NextRequest, NextResponse } from "next/server";
import { requireAdminCookie } from "@/lib/admin-auth";
import { originMatchesSite } from "@/lib/auth/admin-login-request-guards";
import { logManualPayment } from "@/lib/coaching/manual-payments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

// POST /api/admin/contacts/:email/payments  (log a manual payment by hand)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const auth = await requireAdminCookie(request);
  if (!auth.ok) {
    return json({ error: "Unauthorized" }, auth.status);
  }
  if (!originMatchesSite(request)) {
    return json({ error: "Forbidden" }, 403);
  }
  const { email } = await params;
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const result = await logManualPayment(
    { ...body, email: decodeURIComponent(email) } as Parameters<typeof logManualPayment>[0],
    auth.username
  );
  if (!result.ok) {
    return json({ error: result.error }, result.status);
  }
  return json(result);
}
