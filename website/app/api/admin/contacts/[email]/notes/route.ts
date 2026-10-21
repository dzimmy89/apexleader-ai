import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logActivity } from "@/lib/crm/activity-log";
import { isValidEmail } from "@/lib/html";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };
const MAX_NOTE = 5000;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

// POST /api/admin/contacts/:email/notes  { text }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return json({ error: "Unauthorized" }, auth.status);
  }
  const { email } = await params;
  const decoded = decodeURIComponent(email).trim().toLowerCase();
  if (!isValidEmail(decoded)) {
    return json({ error: "Invalid email" }, 400);
  }
  let text = "";
  try {
    const body = (await request.json()) as { text?: unknown };
    text = typeof body.text === "string" ? body.text.trim() : "";
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (!text) return json({ error: "Note text is required" }, 400);
  if (text.length > MAX_NOTE) return json({ error: "Note text is too long" }, 400);
  await logActivity({
    email: decoded,
    type: "note",
    title: "Note",
    description: text,
    meta: { actor: auth.username },
  });
  return json({ ok: true });
}
