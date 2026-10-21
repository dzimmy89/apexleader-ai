import { getDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/gmail";
import { createSignatureRequest } from "@/lib/coaching/signatures";
import type { PaymentPlan } from "@/lib/coaching/packages";

export interface AgreementEmailInput {
  email: string;
  name: string;
  packageId: string;
  planId: PaymentPlan["id"];
  grantKey: string;
}

export interface AgreementEmailResult {
  ok: boolean;
  retryable?: boolean;
  error?: string;
}

export async function ensureCoachingAgreementEmail(
  input: AgreementEmailInput
): Promise<AgreementEmailResult> {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@") || !input.grantKey || !input.packageId) {
    return { ok: false, retryable: false, error: "Agreement email is missing a recipient" };
  }

  const db = getDb();
  const existing = await db
    .collection("contract_signatures")
    .where("grantKey", "==", input.grantKey)
    .limit(1)
    .get();

  let signUrl = "";
  let packageName = input.packageId;
  let signatureId = "";

  if (!existing.empty) {
    const doc = existing.docs[0]!;
    const data = doc.data() as Record<string, unknown>;
    signatureId = doc.id;
    packageName = String(data.packageName || packageName);
    signUrl = typeof data.signUrl === "string" ? data.signUrl : "";
    if (typeof data.agreementEmailSentAt === "string" && data.agreementEmailSentAt) {
      return { ok: true };
    }
  }

  if (!signUrl) {
    const created = await createSignatureRequest({
      clientId: email,
      packageId: input.packageId,
      planId: input.planId,
      signerName: input.name || email,
      signerEmail: email,
      grantKey: input.grantKey,
    });
    if (!created.ok || !created.signUrl || !created.signatureId) {
      return {
        ok: false,
        retryable: true,
        error: created.error || "Could not create the coaching agreement",
      };
    }
    signUrl = created.signUrl;
    signatureId = created.signatureId;
    packageName = created.packageName || packageName;
  }

  const sent = await sendEmail({
    to: email,
    purpose: "transactional",
    subject: `Sign your ${packageName} coaching agreement`,
    text: `Your ${packageName} coaching payment is recorded. Sign the agreement to start: ${signUrl}\n\nEducation only. This is not financial advice.`,
    html: `<p>Your ${escapeHtml(packageName)} coaching payment is recorded. Sign the agreement to start.</p><p><a href="${escapeHtml(signUrl)}">${escapeHtml(signUrl)}</a></p><p>Education only. This is not financial advice.</p>`,
    log: { source: "coaching_contract", flowType: "coaching_contract" },
  });

  if (!sent.ok) {
    return {
      ok: false,
      retryable: sent.retryable !== false,
      error: sent.error || "Could not email the coaching agreement",
    };
  }

  if (signatureId) {
    await db.collection("contract_signatures").doc(signatureId).set(
      { agreementEmailSentAt: new Date().toISOString(), signUrl },
      { merge: true }
    );
  }
  return { ok: true };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
