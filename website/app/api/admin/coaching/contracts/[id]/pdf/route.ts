import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/firebase-admin";
import { readSignedPdf } from "@/lib/coaching/contract-pdf";

// GET /api/admin/coaching/contracts/[id]/pdf
// Streams the signed PDF binary (admin-only).
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
  const pdfUrl = typeof data.signedContractPdfUrl === "string" ? data.signedContractPdfUrl : "";
  if (!pdfUrl) {
    return NextResponse.json({ error: "No signed PDF on file" }, { status: 404 });
  }

  const buffer = await readSignedPdf(pdfUrl, id);
  if (!buffer) {
    return NextResponse.json({ error: "PDF could not be read" }, { status: 500 });
  }

  // Wrap the Buffer in a Uint8Array view to satisfy NextResponse BodyInit typing.
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${request.nextUrl.searchParams.get("inline") === "1" ? "inline" : "attachment"}; filename="defi-university-contract-${id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
