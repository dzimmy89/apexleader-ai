import { getDb, leadDocId } from "@/lib/firebase-admin";
import {
  isSelfSignupProvenance,
  resolveSelfSignupAt,
  resolveSelfSignupSource,
  resolveSignupOrigin,
  SIGNUP_ORIGIN_CHECKOUT,
  SIGNUP_ORIGIN_PUBLIC_FORM,
  type SelfSignupProvenance,
  type SignupOrigin,
} from "@/lib/crm/signup-provenance";

export const CRM_CONTACTS_COLLECTION = "crm_contacts";
export const CRM_IMPORT_BATCHES_COLLECTION = "crm_import_batches";

export const CRM_CONTACT_SOURCE_HUBSPOT_IMPORT = "hubspot_import";
export const CRM_SALES_LIST_HUBSPOT = "hubspot";

export const PIPELINE_STATUSES = [
  "new",
  "drafted",
  "contacted",
  "replied",
  "call_booked",
  "client",
  "passed",
  "do_not_contact",
] as const;

export type CrmPipelineStatus = (typeof PIPELINE_STATUSES)[number];

export function isCrmPipelineStatus(value: string): value is CrmPipelineStatus {
  return (PIPELINE_STATUSES as readonly string[]).includes(value);
}

export interface CrmContactNote {
  at: string;
  text: string;
  actor: string;
}

export interface CrmContactEnrichment {
  confidence: string;
  basis: string;
  sources: string[];
  notes: string;
  pass: string;
  updatedAt: string;
}

export interface CrmContact {
  email: string;
  name: string;
  company?: string;
  title?: string;
  phone?: string;
  industry?: string;
  location?: string;
  linkedinUrl?: string;
  xHandle?: string;
  pipelineStatus: CrmPipelineStatus;
  rank: number;
  fitScore: number;
  packageFit: string;
  skoolMatch?: boolean;
  skoolTier?: string;
  topRank?: number | null;
  nextStep?: string;
  enrichment?: CrmContactEnrichment;
  lastContactedAt?: string;
  lastContactedChannel?: string;
  outreachCount?: number;
  notes?: CrmContactNote[];
  enrichmentBatchId?: string;
  revisitAfter?: string;
  passedReason?: string;
  doNotContact: boolean;
  hubspotOptedOut: boolean;
  hubspotBounced: boolean;
  hubspotId: string;
  hubspotLifecycleStage: string;
  hubspotLeadStatus: string;
  canonicalEmail: string;
  source: typeof CRM_CONTACT_SOURCE_HUBSPOT_IMPORT;
  importBatchId: string;
  salesList: typeof CRM_SALES_LIST_HUBSPOT;
  manualOnly: true;
  internal: boolean;
  createdAt: string;
  updatedAt: string;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asNotes(value: unknown): CrmContactNote[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const notes: CrmContactNote[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const at = asString(rec.at);
    const text = asString(rec.text);
    const actor = asString(rec.actor);
    if (!at && !text && !actor) continue;
    notes.push({ at, text, actor });
  }
  return notes;
}

function asEnrichment(value: unknown): CrmContactEnrichment | undefined {
  if (!value || typeof value !== "object") return undefined;
  const rec = value as Record<string, unknown>;
  return {
    confidence: asString(rec.confidence),
    basis: asString(rec.basis),
    sources: asStringArray(rec.sources),
    notes: asString(rec.notes),
    pass: asString(rec.pass),
    updatedAt: asString(rec.updatedAt),
  };
}

function asTopRank(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return undefined;
}

/**
 * Read a crm_contacts document. Missing optional enrichment fields stay
 * omitted so pre-enrichment HubSpot import docs deserialize without errors.
 */
export function crmContactFromData(
  data: Record<string, unknown> | undefined,
  docId: string
): CrmContact {
  const email = asString(data?.email, docId).trim().toLowerCase() || docId;
  const pipelineRaw = asString(data?.pipelineStatus, "new");
  const pipelineStatus = isCrmPipelineStatus(pipelineRaw) ? pipelineRaw : "new";
  const contact: CrmContact = {
    email,
    name: asString(data?.name),
    pipelineStatus,
    rank: asNumber(data?.rank, 0),
    fitScore: asNumber(data?.fitScore, 0),
    packageFit: asString(data?.packageFit),
    doNotContact: asBoolean(data?.doNotContact, false),
    hubspotOptedOut: asBoolean(data?.hubspotOptedOut, false),
    hubspotBounced: asBoolean(data?.hubspotBounced, false),
    hubspotId: asString(data?.hubspotId),
    hubspotLifecycleStage: asString(data?.hubspotLifecycleStage),
    hubspotLeadStatus: asString(data?.hubspotLeadStatus),
    canonicalEmail: asString(data?.canonicalEmail, canonicalEmail(email)),
    source: CRM_CONTACT_SOURCE_HUBSPOT_IMPORT,
    importBatchId: asString(data?.importBatchId),
    salesList: CRM_SALES_LIST_HUBSPOT,
    manualOnly: true,
    internal: asBoolean(data?.internal, false),
    createdAt: asString(data?.createdAt),
    updatedAt: asString(data?.updatedAt),
  };
  const company = asString(data?.company);
  if (company) contact.company = company;
  const title = asString(data?.title);
  if (title) contact.title = title;
  const phone = asString(data?.phone);
  if (phone) contact.phone = phone;
  const industry = asString(data?.industry);
  if (industry) contact.industry = industry;
  const location = asString(data?.location);
  if (location) contact.location = location;
  const linkedinUrl = asString(data?.linkedinUrl);
  if (linkedinUrl) contact.linkedinUrl = linkedinUrl;
  const xHandle = asString(data?.xHandle);
  if (xHandle) contact.xHandle = xHandle;
  if (typeof data?.skoolMatch === "boolean") contact.skoolMatch = data.skoolMatch;
  const skoolTier = asString(data?.skoolTier);
  if (skoolTier) contact.skoolTier = skoolTier;
  const topRank = asTopRank(data?.topRank);
  if (topRank !== undefined) contact.topRank = topRank;
  const nextStep = asString(data?.nextStep);
  if (nextStep) contact.nextStep = nextStep;
  const enrichment = asEnrichment(data?.enrichment);
  if (enrichment) contact.enrichment = enrichment;
  const lastContactedAt = asString(data?.lastContactedAt);
  if (lastContactedAt) contact.lastContactedAt = lastContactedAt;
  const lastContactedChannel = asString(data?.lastContactedChannel);
  if (lastContactedChannel) contact.lastContactedChannel = lastContactedChannel;
  if (typeof data?.outreachCount === "number" && Number.isFinite(data.outreachCount)) {
    contact.outreachCount = data.outreachCount;
  }
  const notes = asNotes(data?.notes);
  if (notes) contact.notes = notes;
  const enrichmentBatchId = asString(data?.enrichmentBatchId);
  if (enrichmentBatchId) contact.enrichmentBatchId = enrichmentBatchId;
  const revisitAfter = asString(data?.revisitAfter);
  if (revisitAfter) contact.revisitAfter = revisitAfter;
  const passedReason = asString(data?.passedReason);
  if (passedReason) contact.passedReason = passedReason;
  return contact;
}

export function crmContactDocId(email: string): string {
  return leadDocId(email);
}

/**
 * Match key for sales-list lookups. Lowercase, strip plus-tags, and treat
 * gmail.com / googlemail.com as the same address with dots removed.
 */
export function canonicalEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at <= 0) return normalized;
  let local = normalized.slice(0, at);
  let domain = normalized.slice(at + 1);
  const plus = local.indexOf("+");
  if (plus >= 0) local = local.slice(0, plus);
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  return `${local}@${domain}`;
}

export function maskEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  const at = normalized.indexOf("@");
  if (at <= 0) return "***";
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  const first = local.charAt(0) || "*";
  return `${first}***@${domain}`;
}

function contactBlocksSends(data: { manualOnly?: unknown } | undefined): boolean {
  return data?.manualOnly !== false;
}

export function crmContactFlagsSuppressSends(data: {
  doNotContact?: unknown;
  hubspotOptedOut?: unknown;
  hubspotBounced?: unknown;
} | undefined): boolean {
  if (!data) return false;
  return (
    data.doNotContact === true ||
    data.hubspotOptedOut === true ||
    data.hubspotBounced === true
  );
}

export function crmContactIsTop100(topRank: number | null | undefined): boolean {
  return typeof topRank === "number" && topRank >= 1 && topRank <= 100;
}

export function crmContactNotYetContacted(lastContactedAt: unknown): boolean {
  return typeof lastContactedAt !== "string" || lastContactedAt.trim().length === 0;
}

/** Emailable for 1:1 outreach: not DNC/bounced/opted-out/internal, and not suppressed. */
export function crmContactIsEmailable(
  data: {
    doNotContact?: unknown;
    hubspotOptedOut?: unknown;
    hubspotBounced?: unknown;
    internal?: unknown;
  },
  suppressed: boolean
): boolean {
  if (suppressed) return false;
  if (data.internal === true) return false;
  return !crmContactFlagsSuppressSends(data);
}

type ExistingSignupStamp = {
  selfSignup?: unknown;
  signupOrigin?: unknown;
  selfSignupSource?: unknown;
  selfSignupAt?: unknown;
};

/** Fields stamped only by public form capture and paid checkout webhooks. */
export function selfSignupWriteFields(
  email: string,
  requestedOrigin: SignupOrigin,
  args: {
    source: string;
    nowIso: string;
    existing?: ExistingSignupStamp;
  }
): SelfSignupProvenance {
  return {
    selfSignup: true,
    signupOrigin: resolveSignupOrigin(
      requestedOrigin,
      args.existing?.signupOrigin
    ),
    selfSignupSource: resolveSelfSignupSource(args.source, args.existing),
    selfSignupAt: resolveSelfSignupAt(args.nowIso, args.existing),
    canonicalEmail: canonicalEmail(email),
  };
}

export function publicFormSignupFields(
  email: string,
  args: {
    source: string;
    nowIso: string;
    existing?: ExistingSignupStamp;
  }
): SelfSignupProvenance {
  return selfSignupWriteFields(email, SIGNUP_ORIGIN_PUBLIC_FORM, args);
}

export function checkoutSignupFields(
  email: string,
  args: {
    nowIso: string;
    existing?: ExistingSignupStamp;
  }
): SelfSignupProvenance {
  return selfSignupWriteFields(email, SIGNUP_ORIGIN_CHECKOUT, {
    source: "checkout",
    nowIso: args.nowIso,
    existing: args.existing,
  });
}

type ContactSnap = {
  id: string;
  exists: boolean;
  data: () => Record<string, unknown> | undefined;
};

export async function getCrmContactByEmail(
  email: string
): Promise<{ id: string; contact: CrmContact } | null> {
  const snaps = await matchedCrmContactSnaps(email);
  const snap = snaps[0];
  if (!snap?.exists) return null;
  return {
    id: snap.id,
    contact: crmContactFromData(snap.data(), snap.id),
  };
}

async function matchedCrmContactSnaps(email: string): Promise<ContactSnap[]> {
  const id = crmContactDocId(email);
  if (!id.includes("@")) return [];
  const db = getDb();
  const snap = await db.collection(CRM_CONTACTS_COLLECTION).doc(id).get();
  if (snap.exists) return [snap];

  const canonical = canonicalEmail(email);
  if (!canonical.includes("@")) return [];
  const matches = await db
    .collection(CRM_CONTACTS_COLLECTION)
    .where("canonicalEmail", "==", canonical)
    .get();
  return matches.docs;
}

/**
 * True when a crm_contacts match exists and manualOnly is not explicitly
 * boolean false. Missing, null, or malformed flags block. Throws if the
 * Firestore read fails so callers can fail closed.
 */
export async function isManualOnlyContact(email: string): Promise<boolean> {
  const snaps = await matchedCrmContactSnaps(email);
  if (snaps.length === 0) return false;
  return snaps.some((doc) => contactBlocksSends(doc.data()));
}

/**
 * Imported bounce / DNC / opt-out on a matched crm_contacts row. Evaluated at
 * send time; does not copy into email_suppressions.
 */
export async function crmContactSuppressesAddress(email: string): Promise<boolean> {
  const snaps = await matchedCrmContactSnaps(email);
  return snaps.some((doc) => crmContactFlagsSuppressSends(doc.data()));
}

function recipientIdsToCheck(email: string): string[] {
  const normalized = leadDocId(email);
  const canonical = canonicalEmail(email);
  const ids = [normalized];
  if (canonical !== normalized) ids.push(canonical);
  return ids.filter((id) => id.includes("@"));
}

/**
 * True when a leads or members doc for this address (or Gmail canonical twin)
 * was stamped selfSignup === true by a server capture/checkout path.
 * Absence of that boolean is not provenance.
 */
export async function recipientHasSelfSignup(email: string): Promise<boolean> {
  const db = getDb();
  for (const id of recipientIdsToCheck(email)) {
    const [lead, member] = await Promise.all([
      db.collection("leads").doc(id).get(),
      db.collection("members").doc(id).get(),
    ]);
    if (isSelfSignupProvenance(lead.data()) || isSelfSignupProvenance(member.data())) {
      return true;
    }
  }

  const canonical = canonicalEmail(email);
  if (!canonical.includes("@")) return false;
  const [leadMatches, memberMatches] = await Promise.all([
    db.collection("leads").where("canonicalEmail", "==", canonical).get(),
    db.collection("members").where("canonicalEmail", "==", canonical).get(),
  ]);
  return (
    leadMatches.docs.some((doc) => isSelfSignupProvenance(doc.data())) ||
    memberMatches.docs.some((doc) => isSelfSignupProvenance(doc.data()))
  );
}

function hasConfirmedConsent(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const consent = (data as { consent?: { confirmedAt?: unknown } }).consent;
  const at = consent?.confirmedAt;
  return typeof at === "string" && at.trim().length > 0;
}

function hasPaidCheckoutStamp(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const at = (data as { paidCheckoutAt?: unknown }).paidCheckoutAt;
  return typeof at === "string" && at.trim().length > 0;
}

/**
 * Recorded affirmative email consent (consent.confirmedAt), not paid checkout.
 */
export async function recipientHasAffirmativeEmailConsent(
  email: string
): Promise<boolean> {
  const db = getDb();
  for (const id of recipientIdsToCheck(email)) {
    const [lead, member] = await Promise.all([
      db.collection("leads").doc(id).get(),
      db.collection("members").doc(id).get(),
    ]);
    if (hasConfirmedConsent(lead.data()) || hasConfirmedConsent(member.data())) {
      return true;
    }
  }
  const canonical = canonicalEmail(email);
  if (!canonical.includes("@")) return false;
  const [leadMatches, memberMatches] = await Promise.all([
    db.collection("leads").where("canonicalEmail", "==", canonical).get(),
    db.collection("members").where("canonicalEmail", "==", canonical).get(),
  ]);
  return (
    leadMatches.docs.some((doc) => hasConfirmedConsent(doc.data())) ||
    memberMatches.docs.some((doc) => hasConfirmedConsent(doc.data()))
  );
}

export type ManualOnlyGuardMode = "self_signup" | "confirmed_or_paid";

async function recipientAllowsManualOnlyMode(
  email: string,
  mode: ManualOnlyGuardMode
): Promise<boolean> {
  if (!(await recipientHasSelfSignup(email))) return false;
  switch (mode) {
    case "self_signup":
      return true;
    case "confirmed_or_paid":
      return await recipientHasConfirmedConsentOrPaidCheckout(email);
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown manual-only guard mode: ${_exhaustive}`);
    }
  }
}

/**
 * True when a self-created lead has consent.confirmedAt or a self-created
 * member was stamped paidCheckoutAt by the checkout webhook.
 */
export async function recipientHasConfirmedConsentOrPaidCheckout(
  email: string
): Promise<boolean> {
  const db = getDb();
  for (const id of recipientIdsToCheck(email)) {
    const [lead, member] = await Promise.all([
      db.collection("leads").doc(id).get(),
      db.collection("members").doc(id).get(),
    ]);
    if (hasConfirmedConsent(lead.data()) || hasPaidCheckoutStamp(member.data())) {
      return true;
    }
  }

  const canonical = canonicalEmail(email);
  if (!canonical.includes("@")) return false;
  const [leadMatches, memberMatches] = await Promise.all([
    db.collection("leads").where("canonicalEmail", "==", canonical).get(),
    db.collection("members").where("canonicalEmail", "==", canonical).get(),
  ]);
  return (
    leadMatches.docs.some((doc) => hasConfirmedConsent(doc.data())) ||
    memberMatches.docs.some((doc) => hasPaidCheckoutStamp(doc.data()))
  );
}

/**
 * Automated send/enroll block for a listed sales-list address, unless a
 * self-created lead/member exists. The crm_contacts row itself is never
 * treated as a sendable recipient. Missing provenance fails closed.
 *
 * `confirmed_or_paid` (flows, nurture, reengagement, broadcasts): also
 * requires consent.confirmedAt or a paid-checkout stamp.
 */
export async function automatedSendBlockedByManualOnly(
  email: string,
  mode: ManualOnlyGuardMode = "self_signup"
): Promise<boolean> {
  if (!(await isManualOnlyContact(email))) return false;
  if (await recipientAllowsManualOnlyMode(email, mode)) return false;
  return true;
}

/**
 * Fail-closed send/enroll block. Returns manual_only_contact when the
 * contact is listed and the recipient is not a self-created lead/member,
 * or manual_only_contact_lookup_failed when the read throws.
 */
export async function manualOnlyBlockReason(
  email: string,
  mode: ManualOnlyGuardMode = "self_signup"
): Promise<"manual_only_contact" | "manual_only_contact_lookup_failed" | null> {
  try {
    if (await automatedSendBlockedByManualOnly(email, mode)) {
      return "manual_only_contact";
    }
    return null;
  } catch (e) {
    console.error("[crm_contacts] automatedSendBlockedByManualOnly failed", email, e);
    return "manual_only_contact_lookup_failed";
  }
}
