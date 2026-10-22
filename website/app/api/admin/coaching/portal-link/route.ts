import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { issueMagicLink } from "@/lib/coaching/portal-auth";
import { sendEmail } from "@/lib/gmail";

// POST /api/admin/coaching/portal-link
// Admin-protected: issues a fresh magic link and emails it to the client.
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const clientId = typeof body.clientId === "string" ? body.clientId.trim().toLowerCase() : "";
  if (!clientId) {
    return NextResponse.json({ error: "clientId required" }, { status: 400 });
  }

  const link = await issueMagicLink(clientId, { source: "admin" });
  if (!link.ok || !link.url) {
    return NextResponse.json({ error: link.error || "Failed" }, { status: 400 });
  }

  const html = `
    <div style="font-family: 'Libre Baskerville', Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #1a1814;">Your ApexLeader.ai portal link</h2>
      <p style="color: #444; line-height: 1.6;">
        Here is your coaching client portal access link. It expires in 30 days.
      </p>
      <p style="margin: 32px 0;">
        <a href="${link.url}"
           style="background: #b8934a; color: #1a1814; padding: 14px 28px; text-decoration: none; font-weight: bold; display: inline-block;">
          Open client portal
        </a>
      </p>
    </div>
  `;

  await sendEmail({
    to: clientId,
    subject: "Your ApexLeader.ai portal link",
    html,
    text: `Open your portal: ${link.url}`,
    log: { source: "admin_portal_link", userId: `client:${clientId}` },
  });

  return NextResponse.json({ ok: true });
}
