import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/firebase-admin";
import { readSignedPdf } from "@/lib/coaching/contract-pdf";
import { verifySignatureIntegrity } from "@/lib/coaching/signatures";

// GET /api/admin/coaching/contracts
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status");
  const limit = Math.min(Number(url.searchParams.get("limit") || 100), 200);

  const db = getDb();
  let query: FirebaseFirestore.Query = db
    .collection("contract_signatures")
    .orderBy("createdAt", "desc")
    .limit(limit);
  if (statusFilter && ["pending", "signed", "expired", "voided"].includes(statusFilter)) {
    query = db
      .collection("contract_signatures")
      .where("status", "==", statusFilter)
      .orderBy("createdAt", "desc")
      .limit(limit);
  }

  const snap = await query.get();
  return NextResponse.json({
    contracts: snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      // Strip the heavy markdown/HTML/pdf base64 from list responses.
      const {
        contractMarkdown: _m,
        contractHtml: _h,
        signedPdfBase64: _b,
        ...rest
      } = data;
      return { id: d.id, ...rest };
    }),
  });
}

// PATCH /api/admin/coaching/contracts
// Body: { id, action: "void" | "resend" }
export async function PATCH(request: NextRequest) {
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

  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";
  if (!id || !["void", "resend"].includes(action)) {
    return NextResponse.json(
      { error: "id and action (void|resend) required" },
      { status: 400 }
    );
  }

  const db = getDb();
  if (action === "void") {
    await db.collection("contract_signatures").doc(id).update({
      status: "voided",
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, action: "voided" });
  }

  // resend — caller can re-derive the sign URL from the existing token.
  const doc = await db.collection("contract_signatures").doc(id).get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    action: "resend",
    token: (doc.data() as Record<string, unknown>).token,
  });
}
