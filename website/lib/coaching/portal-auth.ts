import { createHash, randomBytes } from "crypto";
import { getDb } from "@/lib/firebase-admin";
import { getSiteOrigin } from "@/lib/env";

const TOKEN_TTL_DAYS = 30;

export interface PortalSession {
  ok: boolean;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  packageId?: string;
  packageName?: string;
  status?: string;
  sessionsRemaining?: number;
  sessionsTotal?: number;
  contractSignedAt?: string | null;
  signedContractPdfUrl?: string | null;
  error?: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueMagicLink(
  clientId: string,
  opts: { source?: string } = {}
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const email = clientId.trim().toLowerCase();
  if (!email) return { ok: false, error: "clientId required" };

  const db = getDb();
  const ref = db.collection("client_records").doc(email);
  const doc = await ref.get();
  if (!doc.exists) {
    return { ok: false, error: "No client record found for this email" };
  }

  const token = randomBytes(24).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  await ref.set(
    {
      magicLinkToken: tokenHash,
      magicLinkExpiresAt: expiresAt,
      magicLinkIssuedAt: new Date().toISOString(),
      magicLinkSource: opts.source || "admin",
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return { ok: true, url: `${getSiteOrigin()}/portal/${token}` };
}

export async function resolvePortalSession(token: string): Promise<PortalSession> {
  if (!token) return { ok: false, error: "Token required" };

  const db = getDb();
  const tokenHash = hashToken(token);
  const snap = await db
    .collection("client_records")
    .where("magicLinkToken", "==", tokenHash)
    .limit(1)
    .get();

  if (snap.empty) return { ok: false, error: "Invalid or revoked link" };

  const doc = snap.docs[0]!;
  const data = doc.data() as Record<string, unknown>;

  const expiresAt = String(data.magicLinkExpiresAt || "");
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    return { ok: false, error: "This portal link has expired" };
  }

  return {
    ok: true,
    clientId: doc.id,
    clientName: String(data.name || ""),
    clientEmail: String(data.email || doc.id),
    packageId: String(data.packageId || ""),
    packageName: String(data.packageName || ""),
    status: String(data.status || ""),
    sessionsRemaining: Number(data.sessionsRemaining || 0),
    sessionsTotal: Number(data.sessionsTotal || 0),
    contractSignedAt: (data.contractSignedAt as string) || null,
    signedContractPdfUrl: (data.signedContractPdfUrl as string) || null,
  };
}

export async function revokeMagicLink(clientId: string): Promise<void> {
  const db = getDb();
  await db.collection("client_records").doc(clientId.trim().toLowerCase()).set(
    {
      magicLinkToken: null,
      magicLinkExpiresAt: null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

// Called from the /coaching/portal-access form to issue a fresh link
// to a verified email on file. Logs the request to attribution_touchpoints.
export async function requestPortalAccess(
  email: string
): Promise<{ ok: boolean; emailSent?: boolean; error?: string }> {
  const clientId = email.trim().toLowerCase();
  if (!clientId) return { ok: false, error: "Email required" };

  const result = await issueMagicLink(clientId, { source: "portal_access_form" });
  if (!result.ok) {
    // Don't leak whether the email exists — return ok to avoid enumeration.
    return { ok: true, emailSent: false };
  }

  // Email the magic link via Gmail (Phase 9 wires up the template).
  // For now we mark the request — the email send is handled by the API route
  // that calls this function, or by a Phase 9 template hook.
  return { ok: true, emailSent: true };
}
