import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/firebase-admin";
import { readSignedPdf } from "@/lib/coaching/contract-pdf";
import { verifySignatureIntegrity } from "@/lib/coaching/signatures";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/coaching/contracts/[id]
// Returns full contract record + audit envelope + integrity verification.
export async function GET(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  const { id } = await params;
  const db = getDb();
  const doc = await db.collection("contract_signatures").doc(id).get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const data = doc.data() as Record<string, unknown>;
  const integrity = await verifySignatureIntegrity(id);

  // Strip large base64 from response.
  const { signedPdfBase64: _b, ...rest } = data;
  return NextResponse.json({
    contract: { id: doc.id, ...rest },
    integrity,
  });
}

// GET /api/admin/coaching/contracts/[id]/pdf — alternate handler not used;
// PDF binary download handled by /pdf subroute below.
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const action = typeof body.action === "string" ? body.action : "";
  if (action !== "void") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }
  const db = getDb();
  await db.collection("contract_signatures").doc(id).update({
    status: "voided",
    updatedAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
