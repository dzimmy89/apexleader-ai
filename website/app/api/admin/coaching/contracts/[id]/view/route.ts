import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/firebase-admin";
import { getSiteOrigin } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// GET /api/admin/coaching/contracts/:id/view
// The contract as it was sent: the signed PDF when there is one, otherwise
// the exact text saved when the signing request was created.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }
  const doc = await getDb().collection("contract_signatures").doc(id).get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }
  const data = (doc.data() || {}) as Record<string, unknown>;
  if (typeof data.signedContractPdfUrl === "string" && data.signedContractPdfUrl) {
    return NextResponse.redirect(`${getSiteOrigin()}/api/admin/coaching/contracts/${id}/pdf?inline=1`, 302);
  }
  const html = typeof data.contractHtml === "string" ? data.contractHtml : "";
  const status = String(data.status || "pending");
  const sentAt = String(data.agreementEmailSentAt || data.requestIssuedAt || data.createdAt || "");
  const page = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(String(data.packageName || "Coaching"))} agreement</title>
<style>body{font-family:Georgia,serif;max-width:760px;margin:32px auto;padding:0 16px;line-height:1.6;color:#1b1b1b}
.meta{font:13px/1.5 system-ui,sans-serif;color:#555;border:1px solid #ddd;padding:10px 14px;margin-bottom:24px}</style></head>
<body><div class="meta">Sent to ${escapeHtml(String(data.signerEmail || data.clientId || ""))}${
    sentAt ? ` on ${escapeHtml(new Date(sentAt).toUTCString())}` : ""
  } · Status: ${escapeHtml(status)}${status === "pending" ? " (not signed yet)" : ""}</div>${
    html || "<p>The contract text was not saved for this request.</p>"
  }</body></html>`;
  return new Response(page, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      // The saved contract is our own rendered HTML; still never let it run script.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data: https:; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
