import { createHash } from "crypto";
import { getDb } from "@/lib/firebase-admin";
import { getSiteOrigin } from "@/lib/env";
import { renderContract } from "@/lib/coaching/contract-templates";
import {
  generateSignedPdf,
  storeSignedPdf,
} from "@/lib/coaching/contract-pdf";
import type { PaymentPlan } from "@/lib/coaching/packages";

const TOKEN_TTL_DAYS = Number(process.env.CONTRACT_SIGN_TOKEN_TTL_DAYS || 7);

export interface AuditEnvelope {
  signatureId: string;
  clientId: string;
  packageId: string;
  contractHashSha256: string;
  signerTypedName: string;
  signatureImageDataUri: string | null;
  signedAt: string;
  signerIpAddress: string;
  signerUserAgent: string;
  signerEmail: string;
  requestIssuedAt: string;
  requestIpAddress: string;
  integrityHash: string;
}

export interface SignatureRequestInput {
  clientId: string; // client email, lowercased
  packageId: string;
  planId: PaymentPlan["id"];
  signerName: string;
  signerEmail: string;
  requestIpAddress?: string;
  /** Checkout session id or crypto notice id. Used to send the agreement once. */
  grantKey?: string;
}

export interface SignatureRequestResult {
  ok: boolean;
  signatureId?: string;
  token?: string;
  signUrl?: string;
  contractHtml?: string;
  packageName?: string;
  error?: string;
}

export interface CaptureSignatureInput {
  token: string;
  typedName: string;
  signatureDataUri: string | null;
  ipAddress: string;
  userAgent: string;
}

export interface CaptureSignatureResult {
  ok: boolean;
  signatureId?: string;
  clientId?: string;
  signedPdfUrl?: string;
  error?: string;
}

function generateToken(): string {
  return createHash("sha256")
    .update(`${Date.now()}-${Math.random().toString(36).slice(2)}`)
    .digest("hex")
    .slice(0, 40);
}

function computeIntegrityHash(
  envelope: Omit<AuditEnvelope, "integrityHash">
): string {
  const fields = [
    envelope.signatureId,
    envelope.clientId,
    envelope.packageId,
    envelope.contractHashSha256,
    envelope.signerTypedName,
    envelope.signatureImageDataUri || "",
    envelope.signedAt,
    envelope.signerIpAddress,
    envelope.signerUserAgent,
    envelope.signerEmail,
    envelope.requestIssuedAt,
    envelope.requestIpAddress,
  ].join("|");
  return createHash("sha256").update(fields).digest("hex");
}

export async function createSignatureRequest(
  input: SignatureRequestInput
): Promise<SignatureRequestResult> {
  const clientId = input.clientId.trim().toLowerCase();
  if (!clientId || !input.packageId) {
    return { ok: false, error: "clientId and packageId are required" };
  }

  try {
    const rendered = await renderContract({
      clientName: input.signerName,
      clientEmail: input.signerEmail,
      packageId: input.packageId,
      planId: input.planId,
    });

    const db = getDb();
    const token = generateToken();
    const now = new Date().toISOString();
    const expiresAt = new Date(
      Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();
    const signUrl = `${getSiteOrigin()}/coaching/sign/${token}`;

    const ref = await db.collection("contract_signatures").add({
      clientId,
      packageId: input.packageId,
      planId: input.planId,
      signerName: input.signerName,
      signerEmail: input.signerEmail.toLowerCase(),
      token,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      status: "pending",
      contractMarkdown: rendered.markdown,
      contractHtml: rendered.html,
      contractHashSha256: rendered.hash,
      packageName: rendered.packageName,
      signUrl,
      grantKey: input.grantKey || null,
      requestIssuedAt: now,
      requestIpAddress: input.requestIpAddress || "",
      expiresAt,
      signedAt: null,
      auditEnvelope: null,
      signedContractPdfUrl: null,
      createdAt: now,
      updatedAt: now,
    });

    return {
      ok: true,
      signatureId: ref.id,
      token,
      signUrl,
      contractHtml: rendered.html,
      packageName: rendered.packageName,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[createSignatureRequest] failed", msg);
    return { ok: false, error: msg };
  }
}

export async function getSignatureByToken(
  token: string
): Promise<
  | { ok: true; signatureId: string; status: string; contractHtml: string; packageName: string; clientId: string; signerName: string; expiresAt: string }
  | { ok: false; error: string }
> {
  if (!token) return { ok: false, error: "token required" };
  const db = getDb();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const snap = await db
    .collection("contract_signatures")
    .where("tokenHash", "==", tokenHash)
    .limit(1)
    .get();

  if (snap.empty) return { ok: false, error: "Signature request not found" };
  const doc = snap.docs[0]!;
  const data = doc.data() as Record<string, unknown>;

  const expiresAt = String(data.expiresAt || "");
  if (new Date(expiresAt).getTime() < Date.now()) {
    return { ok: false, error: "This signing link has expired" };
  }

  return {
    ok: true,
    signatureId: doc.id,
    status: String(data.status || "pending"),
    contractHtml: String(data.contractHtml || ""),
    packageName: String(data.packageName || ""),
    clientId: String(data.clientId || ""),
    signerName: String(data.signerName || ""),
    expiresAt,
  };
}

export async function captureSignature(
  input: CaptureSignatureInput
): Promise<CaptureSignatureResult> {
  const lookup = await getSignatureByToken(input.token);
  if (!lookup.ok) {
    return { ok: false, error: lookup.error };
  }
  if (lookup.status === "signed") {
    return { ok: false, error: "This contract has already been signed" };
  }

  if (!input.typedName.trim()) {
    return { ok: false, error: "Typed name is required" };
  }

  const db = getDb();
  const ref = db.collection("contract_signatures").doc(lookup.signatureId);
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: "Signature record missing" };
  const data = doc.data() as Record<string, unknown>;

  const signedAt = new Date().toISOString();

  const envelopeBase: Omit<AuditEnvelope, "integrityHash"> = {
    signatureId: lookup.signatureId,
    clientId: lookup.clientId,
    packageId: String(data.packageId || ""),
    contractHashSha256: String(data.contractHashSha256 || ""),
    signerTypedName: input.typedName.trim(),
    signatureImageDataUri: input.signatureDataUri,
    signedAt,
    signerIpAddress: input.ipAddress || "",
    signerUserAgent: input.userAgent || "",
    signerEmail: String(data.signerEmail || lookup.clientId),
    requestIssuedAt: String(data.requestIssuedAt || ""),
    requestIpAddress: String(data.requestIpAddress || ""),
  };

  const integrityHash = computeIntegrityHash(envelopeBase);
  const auditEnvelope: AuditEnvelope = { ...envelopeBase, integrityHash };

  // Generate the signed PDF.
  const pdfBuffer = await generateSignedPdf({
    contractHtml: lookup.contractHtml,
    packageName: lookup.packageName,
    signerName: input.typedName.trim(),
    signatureImageDataUri: input.signatureDataUri,
    auditEnvelope,
  });

  const signedPdfUrl = await storeSignedPdf(lookup.signatureId, pdfBuffer);

  await ref.update({
    status: "signed",
    signedAt,
    auditEnvelope,
    signedContractPdfUrl: signedPdfUrl,
    updatedAt: signedAt,
  });

  // Update the client record so the portal unlocks.
  await db
    .collection("client_records")
    .doc(lookup.clientId)
    .set(
      {
        status: "onboarded",
        contractSignedAt: signedAt,
        signatureId: lookup.signatureId,
        signedContractPdfUrl: signedPdfUrl,
        updatedAt: signedAt,
      },
      { merge: true }
    );

  return {
    ok: true,
    signatureId: lookup.signatureId,
    clientId: lookup.clientId,
    signedPdfUrl,
  };
}

export async function verifySignatureIntegrity(
  signatureId: string
): Promise<{ ok: boolean; valid: boolean; error?: string }> {
  const db = getDb();
  const doc = await db.collection("contract_signatures").doc(signatureId).get();
  if (!doc.exists) return { ok: false, valid: false, error: "Signature not found" };
  const data = doc.data() as Record<string, unknown>;
  const envelope = data.auditEnvelope as AuditEnvelope | undefined;
  if (!envelope) return { ok: false, valid: false, error: "No audit envelope present" };

  const recomputed = computeIntegrityHash({
    signatureId: envelope.signatureId,
    clientId: envelope.clientId,
    packageId: envelope.packageId,
    contractHashSha256: envelope.contractHashSha256,
    signerTypedName: envelope.signerTypedName,
    signatureImageDataUri: envelope.signatureImageDataUri,
    signedAt: envelope.signedAt,
    signerIpAddress: envelope.signerIpAddress,
    signerUserAgent: envelope.signerUserAgent,
    signerEmail: envelope.signerEmail,
    requestIssuedAt: envelope.requestIssuedAt,
    requestIpAddress: envelope.requestIpAddress,
  });

  return { ok: true, valid: recomputed === envelope.integrityHash };
}
