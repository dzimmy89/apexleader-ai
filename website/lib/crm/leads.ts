import { getDb, leadDocId } from "@/lib/firebase-admin";
import { stripUndefined } from "@/lib/firestore-sanitize";
import type { DocumentData } from "firebase-admin/firestore";
import { enrollForLeadMagnet, exitAllLeadMarketingFlows } from "@/lib/lead-flows";
import { isAlreadyCustomer } from "@/lib/flows";
import { sendEmail } from "@/lib/gmail";
import { recordAttributionTouch } from "@/lib/crm/attribution";
import { CONSENT_TEXT_VERSION, LEAD_CONFIRM_SUBJECT } from "@/lib/consent";
import {
  applyConfirm,
  applyUnsubscribe,
  confirmIsBlocked,
  isEligibleForMarketing,
  mergeCaptureFields,
  nextCaptureAction,
  shouldClearSuppressionOnConfirm,
  type LeadRecord,
  type LeadUtm,
  type UnsubscribeMethod,
} from "@/lib/crm/lead-lifecycle";
import { buildLeadConfirmEmail } from "@/lib/email-templates";
import { confirmUrlFor } from "@/lib/email-tokens";
import { publicFormSignupFields } from "@/lib/crm/contacts";

export interface CaptureLeadInput {
  email: string;
  source?: string;
  leadMagnet?: string;
  persona?: string;
  name?: string;
  firstName?: string;
  utm?: LeadUtm;
  referrer?: string;
  landingPath?: string;
  ip?: string;
  userAgent?: string;
  consentTextVersion?: string;
}

export interface CaptureLeadResult {
  ok: boolean;
  docId: string;
  status?: string;
  emailSent?: boolean;
  flowType?: string;
  flowDocId?: string | null;
  alreadyCustomer?: boolean;
  fallback?: boolean;
  confirmThrottled?: boolean;
  statusBlocked?: boolean;
}

function asLeadRecord(data: DocumentData | undefined): LeadRecord | undefined {
  if (!data) return undefined;
  return data as LeadRecord;
}

export async function captureLead(
  input: CaptureLeadInput
): Promise<CaptureLeadResult> {
  const email = input.email.trim().toLowerCase();
  const docId = leadDocId(email);

  try {
    const db = getDb();
    const ref = db.collection("leads").doc(docId);
    const existingSnap = await ref.get();
    const existing = asLeadRecord(existingSnap.data());
    const token =
      existing?.unsubscribeToken || crypto.randomUUID().replace(/-/g, "");
    const now = new Date();
    const nowIso = now.toISOString();
    const source = input.source || "direct";
    const leadMagnet = input.leadMagnet || "";
    const firstName =
      (input.firstName || input.name || "").trim().split(" ")[0] || "";

    const merged = mergeCaptureFields({
      existing,
      email,
      firstName,
      source,
      leadMagnet,
      persona: input.persona,
      utm: input.utm,
      referrer: input.referrer,
      landingPath: input.landingPath,
      unsubscribeToken: token,
      consent: {
        given: true,
        textVersion: input.consentTextVersion || CONSENT_TEXT_VERSION,
        formSource: source,
        ip: input.ip,
        userAgent: input.userAgent,
        requestedAt: nowIso,
      },
    });

    const alreadyCustomer = await isAlreadyCustomer(email);
    const action = nextCaptureAction(existing, alreadyCustomer, now.getTime());

    await ref.set(
      stripUndefined({
        ...merged,
        ...publicFormSignupFields(email, {
          source,
          nowIso,
          existing,
        }),
        lastSeenAt: nowIso,
        ...(existingSnap.exists ? {} : { createdAt: nowIso }),
      }),
      { merge: true }
    );

    try {
      await recordAttributionTouch({
        email,
        source,
        leadMagnet,
        utm: input.utm,
        referrer: input.referrer,
        landingPath: input.landingPath,
      });
    } catch (e) {
      console.error("[captureLead] attribution", e);
    }

    let emailSent = false;
    let flowType: string | undefined;
    let flowDocId: string | null | undefined;

    if (action === "send_confirm") {
      try {
        const confirmUrl = await confirmUrlFor(email);
        const rendered = buildLeadConfirmEmail({
          email,
          firstName: merged.firstName,
          confirmUrl,
        });
        const result = await sendEmail({
          to: email,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
          purpose: "transactional",
          log: { source: "lead_confirm", userId: `lead:${encodeURIComponent(email)}` },
        });
        emailSent = result.ok;
        if (result.ok) {
          await ref.set(
            {
              lastConfirmAttemptAt: nowIso,
              lastConfirmEmailSentAt: nowIso,
              lastConfirmEmailAt: nowIso,
              lastConfirmError: null,
            },
            { merge: true }
          );
        } else {
          const reason = result.error ?? "unknown";
          console.error("[captureLead] confirm send failed", docId, reason);
          await ref.set(
            { lastConfirmAttemptAt: nowIso, lastConfirmError: reason },
            { merge: true }
          );
        }
      } catch (e) {
        const reason = e instanceof Error ? e.message : String(e);
        console.error("[captureLead] confirm send failed", docId, reason);
        try {
          await ref.set(
            { lastConfirmAttemptAt: nowIso, lastConfirmError: reason },
            { merge: true }
          );
        } catch {
          console.error(
            "[captureLead] confirm cooldown stamp failed",
            docId
          );
        }
        try {
          await db.collection("emailLog").add({
            to: email,
            subject: LEAD_CONFIRM_SUBJECT,
            status: "failed",
            source: "lead_confirm",
            sentAt: nowIso,
            stepId: null,
            flowType: null,
            flowDocId: null,
            userId: `lead:${encodeURIComponent(email)}`,
            error: reason,
          });
        } catch {
          console.error(
            "[captureLead] confirm send failed",
            docId,
            "emailLog write failed"
          );
        }
      }
    }

    if (input.leadMagnet === "coaching_qualifier") {
      await db.collection("coaching_applications").add({
        email,
        name: firstName || input.name || "",
        status: "new",
        source,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }

    return {
      ok: true,
      docId,
      status: merged.status,
      emailSent,
      flowType,
      flowDocId,
      alreadyCustomer,
      confirmThrottled: action === "throttle_confirm",
      statusBlocked: action === "blocked_status",
    };
  } catch (e) {
    console.error("[captureLead] persist failed", docId, e);
    return { ok: false, docId };
  }
}

export async function stampLeadPublicFormSignup(args: {
  email: string;
  source: string;
  name?: string;
}): Promise<void> {
  const email = args.email.trim().toLowerCase();
  const db = getDb();
  const nowIso = new Date().toISOString();
  const ref = db.collection("leads").doc(leadDocId(email));
  const existing = asLeadRecord((await ref.get()).data());
  await ref.set(
    stripUndefined({
      email,
      name: args.name || existing?.name || "",
      source: existing?.source || args.source,
      lastSeenAt: nowIso,
      ...(existing ? {} : { createdAt: nowIso }),
      ...publicFormSignupFields(email, {
        source: args.source,
        nowIso,
        existing,
      }),
    }),
    { merge: true }
  );
}

export async function confirmLeadByEmail(
  email: string
): Promise<{ ok: boolean; alreadyConfirmed?: boolean; blocked?: boolean; flowDocId?: string | null; flowType?: string }> {
  const normalized = email.trim().toLowerCase();
  const db = getDb();
  const ref = db.collection("leads").doc(leadDocId(normalized));
  const snap = await ref.get();
  if (!snap.exists) {
    return { ok: false };
  }
  const existing = asLeadRecord(snap.data())!;
  if (confirmIsBlocked(existing.status)) {
    return { ok: false, blocked: true };
  }
  const nowIso = new Date().toISOString();
  const alreadyConfirmed = existing.status === "confirmed";
  const next = applyConfirm(existing, nowIso);
  if (confirmIsBlocked(next.status)) {
    return { ok: false, blocked: true };
  }
  await ref.set(next, { merge: true });

  const suppression = await db.collection("email_suppressions").doc(normalized).get();
  if (suppression.exists) {
    const reason = suppression.data()?.reason as string | undefined;
    if (shouldClearSuppressionOnConfirm(reason)) {
      await suppression.ref.delete();
    }
  }

  let flowType: string | undefined;
  let flowDocId: string | null | undefined;
  if (!alreadyConfirmed) {
    const alreadyCustomer = await isAlreadyCustomer(normalized);
    if (!alreadyCustomer && existing.leadMagnet) {
      const enrolled = await enrollForLeadMagnet(normalized, existing.leadMagnet);
      flowType = enrolled.flowType;
      flowDocId = enrolled.flowDocId;
    }
  }

  return { ok: true, alreadyConfirmed, flowDocId, flowType };
}

export async function unsubscribeLeadByEmail(
  email: string,
  method: UnsubscribeMethod
): Promise<{ ok: boolean }> {
  const normalized = email.trim().toLowerCase();
  const db = getDb();
  const ref = db.collection("leads").doc(leadDocId(normalized));
  const snap = await ref.get();
  const nowIso = new Date().toISOString();
  const next = applyUnsubscribe(asLeadRecord(snap.data()), normalized, method, nowIso);
  await ref.set(next, { merge: true });
  await db.collection("email_suppressions").doc(normalized).set({
    reason: "unsubscribe",
    method,
    suppressedUntil: null,
    updatedAt: nowIso,
  });
  await exitAllLeadMarketingFlows(normalized, "unsubscribed");
  return { ok: true };
}

export { isEligibleForMarketing };
