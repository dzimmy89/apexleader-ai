import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSentEmail } from "@/lib/crm/email-view";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

// GET /api/admin/emails/:id  (one sent email from emailLog, with its body)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status, headers: NO_STORE });
  const email = await getSentEmail((await params).id);
  if (!email) return NextResponse.json({ error: "Email not found" }, { status: 404, headers: NO_STORE });
  return NextResponse.json(email, { headers: NO_STORE });
}
