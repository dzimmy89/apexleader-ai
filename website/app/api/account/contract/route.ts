import { NextRequest, NextResponse } from "next/server";
import { getAccountEmail } from "@/lib/account/session";
import { getAccess } from "@/lib/account/access";
import { findCoachingClient } from "@/lib/account/coaching-client";
import { getDb } from "@/lib/firebase-admin";
import { readSignedPdf } from "@/lib/coaching/contract-pdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** GET /api/account/contract[?inline=1]: the signed-in client's signed coaching agreement (PDF). */
export async function GET(request: NextRequest) {
  const email = await getAccountEmail();
  if (!email) return NextResponse.json({ error: "Sign in first" }, { status: 401, headers: NO_STORE });
  const access = await getAccess(email);
  const client = await findCoachingClient(access);
  if (!client?.signedContractPdfUrl) {
    return NextResponse.json({ error: "No signed agreement on file" }, { status: 404, headers: NO_STORE });
  }
  let signatureId = client.signatureId || "";
  if (!signatureId && client.signedContractPdfUrl.startsWith("firestore:")) {
    signatureId = client.signedContractPdfUrl.slice("firestore:".length);
  }
  if (!signatureId) {
    const snap = await getDb().collection("contract_signatures").where("clientId", "==", client.email).get();
    signatureId =
      snap.docs
        .filter((d) => d.get("status") === "signed")
        .sort((a, b) => String(b.get("signedAt") || "").localeCompare(String(a.get("signedAt") || "")))[0]?.id || "";
  }
  const buffer = await readSignedPdf(client.signedContractPdfUrl, signatureId).catch((e) => {
    console.error("[account/contract] read failed", e);
    return null;
  });
  if (!buffer) {
    return NextResponse.json({ error: "The agreement could not be read right now." }, { status: 502, headers: NO_STORE });
  }
  const inline = request.nextUrl.searchParams.get("inline") === "1";
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="apexleader-coaching-agreement.pdf"`,
      "X-Content-Type-Options": "nosniff",
      ...NO_STORE,
    },
  });
}
