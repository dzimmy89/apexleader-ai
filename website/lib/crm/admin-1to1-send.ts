import { createHash } from "node:crypto";
import { getDb } from "@/lib/firebase-admin";
import { unsubscribeUrlFor } from "@/lib/email-tokens";
import { sendEmail } from "@/lib/gmail";
import { isSuppressed } from "@/lib/suppression";
import { isValidEmail } from "@/lib/html";
import {
  crmContactDocId,
  getCrmContactByEmail,
  CRM_CONTACTS_COLLECTION,
  type CrmPipelineStatus,
} from "@/lib/crm/contacts";
import { addTouchpoint } from "@/lib/crm/touchpoints";
import { isExcludedCrmEmail } from "@/lib/crm/excluded-accounts";
import { isKnownContact, knownContactSources } from "@/lib/crm/known-contact";
import {
  ADMIN_1TO1_FOOTER_TEXT,
  ADMIN_1TO1_IDEMPOTENCY_COLLECTION,
  ADMIN_1TO1_LOCK_COLLECTION,
  ADMIN_1TO1_MIN_INTERVAL_MS,
  ADMIN_1TO1_SEND_SOURCE,
  admin1to1HardBlockReason,
  appendAdmin1to1Footer,
  duSenderOrBlockReason,
  holdingsLanguageHits,
  holdingsLanguageWarning,
  isAdmin1to1AdKind,
  isForbiddenThreadSubject,
  personalOfferHits,
  pipelineStatusAfterAdmin1to1Send,
  type Admin1to1AdKind,
} from "@/lib/crm/admin-1to1-email";
import { headerValueHasCtl } from "@/lib/email-mime";

export { ADMIN_1TO1_FOOTER_TEXT };

export type Admin1to1Mode = "preview" | "send";

export interface Admin1to1Options {
  /**
   * Also allow an address with no crm_contacts row when the site already
   * knows it (client record, member, lead, account, or pipeline card). Used
   * by the contact page. Every send guard below still applies.
   */
  allowKnownNonCrmContact?: boolean;
}

/** The recipient as the send guards see it, from crm_contacts or another record. */
interface Admin1to1Recipient {
  email: string;
  /** crm_contacts doc id, or null for a non-HubSpot contact. */
  crmContactId: string | null;
  touchpointContactId: string;
  pipelineStatus: CrmPipelineStatus | null;
  outreachCount: number;
  doNotContact: boolean;
  hubspotBounced: boolean;
  hubspotOptedOut: boolean;
  internal: boolean;
}

async function resolveAdmin1to1Recipient(
  email: string,
  options: Admin1to1Options
): Promise<Admin1to1Recipient | null> {
  const loaded = await getCrmContactByEmail(email);
  if (loaded) {
    const { contact, id } = loaded;
    return {
      email: contact.email,
      crmContactId: id,
      touchpointContactId: contact.canonicalEmail || contact.email,
      pipelineStatus: contact.pipelineStatus,
      outreachCount: contact.outreachCount ?? 0,
      doNotContact: contact.doNotContact,
      hubspotBounced: contact.hubspotBounced,
      hubspotOptedOut: contact.hubspotOptedOut,
      internal: contact.internal,
    };
  }
  if (!options.allowKnownNonCrmContact) return null;
  const sources = await knownContactSources(email);
  if (!isKnownContact(sources)) return null;
  return {
    email,
    crmContactId: null,
    touchpointContactId: email,
    pipelineStatus: null,
    outreachCount: 0,
    doNotContact: false,
    hubspotBounced: false,
    // An unsubscribed lead counts as opted out even before email_suppressions catches up.
    hubspotOptedOut: sources.leadUnsubscribed,
    internal: isExcludedCrmEmail(email),
  };
}

export interface Admin1to1RequestBody {
  mode?: unknown;
  subject?: unknown;
  body?: unknown;
  text?: unknown;
  html?: unknown;
  footer?: unknown;
  cc?: unknown;
  bcc?: unknown;
  to?: unknown;
  approvedByDavid?: unknown;
  holdingsEducationAck?: unknown;
  personalOfferAck?: unknown;
  adKind?: unknown;
  idempotencyKey?: unknown;
}

export type Admin1to1Result =
  | {
      ok: true;
      mode: "preview";
      to: string;
      subject: string;
      text: string;
      html: string;
      footer: string;
      warnings: string[];
      holdingsHits: string[];
      requiresHoldingsAck: boolean;
      personalOfferHits: string[];
      requiresPersonalOfferAck: boolean;
      adKind?: Admin1to1AdKind;
      promotionalIdentification: boolean;
    }
  | {
      ok: true;
      mode: "send";
      to: string;
      subject: string;
      text: string;
      html: string;
      footer: string;
      warnings: string[];
      holdingsHits: string[];
      approvedByDavid: true;
      holdingsEducationAck: boolean;
      personalOfferAck: boolean;
      personalOfferHits: string[];
      adKind: Admin1to1AdKind;
      promotionalIdentification: boolean;
      sentAt: string;
      messageId?: string;
      threadId?: string;
      /** crm_contacts pipeline status after the send; null when there is no crm_contacts row. */
      pipelineStatus: CrmPipelineStatus | null;
      idempotent: boolean;
    }
  | { ok: false; error: string; status: number; warnings?: string[]; holdingsHits?: string[]; personalOfferHits?: string[] };

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function idempotencyDocId(email: string, key: string): string {
  return createHash("sha256").update(`${email}\0${key}`).digest("hex");
}

export async function handleAdmin1to1Email(
  emailParam: string,
  body: Admin1to1RequestBody,
  actor: string,
  options: Admin1to1Options = {}
): Promise<Admin1to1Result> {
  const sender = duSenderOrBlockReason();
  if (!sender.ok) {
    return { ok: false, error: sender.error, status: 500 };
  }
  const email = emailParam.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { ok: false, error: "Invalid email", status: 400 };
  }
  if (body.cc != null || body.bcc != null) {
    return { ok: false, error: "CC and BCC are not allowed", status: 400 };
  }
  if (typeof body.to === "string" && body.to.trim() && body.to.trim().toLowerCase() !== email) {
    return { ok: false, error: "Recipient must be this contact", status: 400 };
  }

  const modeRaw = asTrimmedString(body.mode) || "send";
  const mode: Admin1to1Mode = modeRaw === "preview" ? "preview" : "send";
  if (modeRaw !== "preview" && modeRaw !== "send") {
    return { ok: false, error: "Invalid mode", status: 400 };
  }

  const subject = asTrimmedString(body.subject);
  const composed = asTrimmedString(body.body) || asTrimmedString(body.text);
  if (!subject || !composed) {
    return { ok: false, error: "Subject and body are required", status: 400 };
  }
  if (isForbiddenThreadSubject(subject)) {
    return { ok: false, error: "reply_subject_not_allowed", status: 400 };
  }
  if (headerValueHasCtl(subject) || headerValueHasCtl(email)) {
    return { ok: false, error: "header_injection", status: 400 };
  }

  const contact = await resolveAdmin1to1Recipient(email, options);
  if (!contact) {
    return { ok: false, error: "Not found", status: 404 };
  }
  const contactId = contact.crmContactId;
  const suppressed = await isSuppressed(contact.email);
  const blocked = admin1to1HardBlockReason({
    doNotContact: contact.doNotContact,
    hubspotBounced: contact.hubspotBounced,
    hubspotOptedOut: contact.hubspotOptedOut,
    internal: contact.internal,
    suppressed,
  });
  const holdingsHits = holdingsLanguageHits(composed);
  const warning = holdingsLanguageWarning(composed);
  const warnings = warning ? [warning] : [];
  const adKindRaw = asTrimmedString(body.adKind);
  const adKind = isAdmin1to1AdKind(adKindRaw) ? adKindRaw : undefined;
  const personalHits = adKind === "personal" ? personalOfferHits(subject, composed) : [];
  const promotionalIdentification = adKind === "promotional";
  const unsubscribeUrl = await unsubscribeUrlFor(contact.email);
  const rendered = appendAdmin1to1Footer({
    body: composed,
    unsubscribeUrl,
    promotionalIdentification,
  });

  if (mode === "preview") {
    if (!adKind) {
      return { ok: false, error: "ad_kind_required", status: 400, warnings, holdingsHits, personalOfferHits: personalHits };
    }
    return {
      ok: true,
      mode: "preview",
      to: contact.email,
      subject,
      text: rendered.text,
      html: rendered.html,
      footer: ADMIN_1TO1_FOOTER_TEXT,
      warnings,
      holdingsHits,
      requiresHoldingsAck: holdingsHits.length > 0,
      personalOfferHits: personalHits,
      requiresPersonalOfferAck: personalHits.length > 0,
      adKind,
      promotionalIdentification,
    };
  }

  if (blocked) {
    return { ok: false, error: blocked, status: 403, warnings, holdingsHits, personalOfferHits: personalHits };
  }
  if (body.approvedByDavid !== true) {
    return { ok: false, error: "David approval is required", status: 400, warnings, holdingsHits, personalOfferHits: personalHits };
  }
  if (!adKind) {
    return { ok: false, error: "ad_kind_required", status: 400, warnings, holdingsHits, personalOfferHits: personalHits };
  }
  if (holdingsHits.length > 0 && body.holdingsEducationAck !== true) {
    return {
      ok: false,
      error: "holdings_education_ack_required",
      status: 400,
      warnings,
      holdingsHits,
      personalOfferHits: personalHits,
    };
  }
  if (personalHits.length > 0 && body.personalOfferAck !== true) {
    return {
      ok: false,
      error: "personal_offer_ack_required",
      status: 400,
      warnings,
      holdingsHits,
      personalOfferHits: personalHits,
    };
  }

  const idempotencyKey = asTrimmedString(body.idempotencyKey);
  if (!idempotencyKey) {
    return { ok: false, error: "idempotencyKey is required", status: 400, warnings, holdingsHits, personalOfferHits: personalHits };
  }

  const db = getDb();
  const idemRef = db
    .collection(ADMIN_1TO1_IDEMPOTENCY_COLLECTION)
    .doc(idempotencyDocId(contact.email, idempotencyKey));
  const lockRef = db.collection(ADMIN_1TO1_LOCK_COLLECTION).doc(contact.email);

  type ReserveKind =
    | { kind: "replay"; payload: Extract<Admin1to1Result, { ok: true; mode: "send" }> }
    | { kind: "reserved" }
    | { kind: "rate_limited" }
    | { kind: "in_flight" };

  const reserved = await db.runTransaction(async (tx): Promise<ReserveKind> => {
    const idemSnap = await tx.get(idemRef);
    const lockSnap = await tx.get(lockRef);
    if (idemSnap.exists) {
      const prior = idemSnap.data() as Record<string, unknown>;
      if (prior.status === "sent" && prior.ok === true) {
        return {
          kind: "replay",
          payload: prior as Extract<Admin1to1Result, { ok: true; mode: "send" }>,
        };
      }
      if (prior.status === "reserved") {
        return { kind: "in_flight" };
      }
    }
    if (lockSnap.exists) {
      const until = (lockSnap.data() as { lockedUntil?: string } | undefined)?.lockedUntil;
      if (until && new Date(until).getTime() > Date.now()) {
        return { kind: "rate_limited" };
      }
    }
    const reservedAt = new Date().toISOString();
    const lockedUntil = new Date(Date.now() + ADMIN_1TO1_MIN_INTERVAL_MS).toISOString();
    const stub = {
      status: "reserved",
      email: contact.email,
      createdAt: reservedAt,
      actor,
    };
    if (idemSnap.exists) {
      tx.set(idemRef, stub);
    } else {
      tx.create(idemRef, stub);
    }
    tx.set(lockRef, {
      email: contact.email,
      lockedUntil,
      idempotencyKey,
      createdAt: reservedAt,
    });
    return { kind: "reserved" };
  });

  if (reserved.kind === "replay") {
    return { ...reserved.payload, idempotent: true };
  }
  if (reserved.kind === "in_flight") {
    return { ok: false, error: "in_flight", status: 409, warnings, holdingsHits, personalOfferHits: personalHits };
  }
  if (reserved.kind === "rate_limited") {
    return { ok: false, error: "rate_limited_24h", status: 429, warnings, holdingsHits, personalOfferHits: personalHits };
  }

  const now = new Date().toISOString();
  const nextStatus = contact.pipelineStatus
    ? pipelineStatusAfterAdmin1to1Send(contact.pipelineStatus)
    : null;
  const holdingsAck = body.holdingsEducationAck === true;
  const offerAck = body.personalOfferAck === true;
  const result = await sendEmail({
    to: contact.email,
    subject,
    html: rendered.html,
    text: rendered.text,
    fromEmail: sender.email,
    unsubscribeUrl,
    purpose: "marketing",
    allowManualOnlyContact: true,
    log: {
      source: ADMIN_1TO1_SEND_SOURCE,
      crmContactId: contactId ?? undefined,
      actor,
      bodyText: rendered.text,
      approvedByDavid: true,
      holdingsEducationAck: holdingsAck,
      holdingsHits,
      personalOfferAck: offerAck,
      personalOfferHits: personalHits,
      adKind,
    },
  });

  if (!result.ok) {
    await idemRef.set({
      status: "failed",
      error: result.error || "send_failed",
      email: contact.email,
      updatedAt: new Date().toISOString(),
    });
    await lockRef.delete();
    return {
      ok: false,
      error: result.error || "send_failed",
      status: result.skipped ? 403 : 502,
      warnings,
      holdingsHits,
      personalOfferHits: personalHits,
    };
  }

  await addTouchpoint({
    crmContactId: contact.touchpointContactId,
    channel: "email",
    direction: "outbound",
    at: now,
    from: sender.email,
    subject,
    summary: composed.slice(0, 500),
    status: "sent",
    source: ADMIN_1TO1_SEND_SOURCE,
    actor,
    externalId: `admin_1to1:${idempotencyKey}`,
  });

  if (contactId && nextStatus) {
    await db
      .collection(CRM_CONTACTS_COLLECTION)
      .doc(contactId)
      .update({
        lastContactedAt: now,
        lastContactedChannel: "email",
        outreachCount: contact.outreachCount + 1,
        pipelineStatus: nextStatus,
        updatedAt: now,
      });
  }

  const payload: Extract<Admin1to1Result, { ok: true; mode: "send" }> = {
    ok: true,
    mode: "send",
    to: contact.email,
    subject,
    text: rendered.text,
    html: rendered.html,
    footer: ADMIN_1TO1_FOOTER_TEXT,
    warnings,
    holdingsHits,
    approvedByDavid: true,
    holdingsEducationAck: holdingsAck,
    personalOfferAck: offerAck,
    personalOfferHits: personalHits,
    adKind,
    promotionalIdentification,
    sentAt: now,
    messageId: result.messageId,
    threadId: result.threadId,
    pipelineStatus: nextStatus,
    idempotent: false,
  };
  await idemRef.set({
    ...payload,
    status: "sent",
    createdAt: now,
    email: contact.email,
    actor,
  });
  return payload;
}

export async function markCrmContactOptedOut(
  email: string,
  options: Admin1to1Options = {}
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    return { ok: false, error: "Invalid email", status: 400 };
  }
  const recipient = await resolveAdmin1to1Recipient(normalized, options);
  if (!recipient) {
    return { ok: false, error: "Not found", status: 404 };
  }
  const now = new Date().toISOString();
  await getDb()
    .collection("email_suppressions")
    .doc(crmContactDocId(recipient.email))
    .set({
      reason: "replied_stop",
      source: "admin_mark_opted_out",
      updatedAt: now,
    });
  return { ok: true };
}
