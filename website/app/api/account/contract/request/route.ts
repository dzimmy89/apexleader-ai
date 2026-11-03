import { NextRequest, NextResponse } from "next/server";
import { crossSiteRejection, isSameOriginRequest } from "@/lib/account/request-guard";
import { getAccountEmail } from "@/lib/account/session";
import { getAccess } from "@/lib/account/access";
import { coachingEnded, findCoachingClient } from "@/lib/account/coaching-client";
import { getDb } from "@/lib/firebase-admin";
import { createSignatureRequest } from "@/lib/coaching/signatures";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * POST /api/account/contract/request: the signed-in client wants to sign
 * their coaching agreement now. Reuses the pending signing link from the
 * agreement email when it is still valid, otherwise issues a fresh one.
 * Returns { ok, signUrl } or { ok, signed: true } when already signed.
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return crossSiteRejection();
  const email = await getAccountEmail();
  if (!email) return NextResponse.json({ error: "Sign in first" }, { status: 401, headers: NO_STORE });
  const access = await getAccess(email);
  const client = await findCoachingClient(access);
  if (!client) return NextResponse.json({ error: "No coaching package on this account" }, { status: 404, headers: NO_STORE });
  if (client.contractSignedAt) return NextResponse.json({ ok: true, signed: true }, { headers: NO_STORE });
  if (coachingEnded(client)) {
    return NextResponse.json({ error: `This coaching package has ended. Email ${BRAND.email} to start again.` }, { status: 409, headers: NO_STORE });
  }
  if (!client.packageId) {
    return NextResponse.json(
      { error: `Your package is not on file yet. Email ${BRAND.email} and we will send the agreement.` },
      { status: 409, headers: NO_STORE }
    );
  }

  const now = Date.now();
  const snap = await getDb().collection("contract_signatures").where("clientId", "==", client.email).get();
  const pending = snap.docs
    .map((d) => d.data() as Record<string, unknown>)
    .filter(
      (d) =>
        d.status === "pending" &&
        String(d.packageId || "") === client.packageId &&
        typeof d.signUrl === "string" &&
        d.signUrl &&
        new Date(String(d.expiresAt || "")).getTime() > now
    )
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))[0];
  if (pending) return NextResponse.json({ ok: true, signUrl: String(pending.signUrl) }, { headers: NO_STORE });

  const created = await createSignatureRequest({
    clientId: client.email,
    packageId: client.packageId,
    planId: client.planId,
    signerName: client.name || client.email,
    signerEmail: client.email,
    requestIpAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
  });
  if (!created.ok || !created.signUrl) {
    console.error("[account/contract/request] failed", created.error);
    return NextResponse.json(
      { error: `We could not prepare the agreement. Email ${BRAND.email}.` },
      { status: 502, headers: NO_STORE }
    );
  }
  return NextResponse.json({ ok: true, signUrl: created.signUrl }, { headers: NO_STORE });
}
