import { NextRequest, NextResponse } from "next/server";
import { requireAdminCookie } from "@/lib/admin-auth";
import { originMatchesSite } from "@/lib/auth/admin-login-request-guards";
import { handleAdmin1to1Email } from "@/lib/crm/admin-1to1-send";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

// POST /api/admin/contacts/:email/send
// Same guards as every admin 1:1 send, for any contact the site knows.
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
  const decoded = decodeURIComponent(email);
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const result = await handleAdmin1to1Email(decoded, body, auth.username, {
    allowKnownNonCrmContact: true,
  });
  if (!result.ok) {
    return json({ error: result.error, warnings: result.warnings }, result.status);
  }
  return json(result);
}
