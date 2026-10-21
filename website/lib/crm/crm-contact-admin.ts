import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase-admin";
import {
  CRM_CONTACTS_COLLECTION,
  canonicalEmail,
  crmContactIsEmailable,
  getCrmContactByEmail,
  type CrmContact,
  type CrmContactEnrichment,
  type CrmContactNote,
  type CrmPipelineStatus,
} from "@/lib/crm/contacts";
import { listTouchpointsByCrmContactId, type Touchpoint } from "@/lib/crm/touchpoints";
import { buildPersonTimeline, type TimelineEvent } from "@/lib/crm/timeline";
import { isSuppressed } from "@/lib/suppression";

const SENSITIVE_ADMIN_KEYS = new Set([
  "phone",
  "capital",
  "applicationText",
  "applicationData",
  "application",
]);

export interface CrmContactAdminProfile {
  email: string;
  canonicalEmail: string;
  name: string;
  company: string;
  title: string;
  industry: string;
  location: string;
  linkedinUrl: string;
  xHandle: string;
  pipelineStatus: CrmPipelineStatus;
  rank: number;
  fitScore: number;
  packageFit: string;
  skoolMatch: boolean;
  skoolTier: string;
  topRank: number | null;
  nextStep: string;
  lastContactedAt: string;
  lastContactedChannel: string;
  outreachCount: number;
  revisitAfter: string;
  passedReason: string;
  doNotContact: boolean;
  hubspotBounced: boolean;
  hubspotOptedOut: boolean;
  internal: boolean;
  importBatchId: string;
  signedUp: boolean;
  emailable: boolean;
  notes: CrmContactNote[];
  enrichment: CrmContactEnrichment | null;
}

export interface CrmContactAdminDetail {
  contact: CrmContactAdminProfile;
  timeline: TimelineEvent[];
}

function omitSensitive<T extends Record<string, unknown>>(value: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (SENSITIVE_ADMIN_KEYS.has(key)) continue;
    out[key] = item;
  }
  return out as T;
}

export function toAdminCrmContactProfile(
  contact: CrmContact,
  args: { signedUp: boolean; emailable: boolean }
): CrmContactAdminProfile {
  return omitSensitive({
    email: contact.email,
    canonicalEmail: contact.canonicalEmail,
    name: contact.name,
    company: contact.company || "",
    title: contact.title || "",
    industry: contact.industry || "",
    location: contact.location || "",
    linkedinUrl: contact.linkedinUrl || "",
    xHandle: contact.xHandle || "",
    pipelineStatus: contact.pipelineStatus,
    rank: contact.rank,
    fitScore: contact.fitScore,
    packageFit: contact.packageFit,
    skoolMatch: contact.skoolMatch === true,
    skoolTier: contact.skoolTier || "",
    topRank: contact.topRank ?? null,
    nextStep: contact.nextStep || "",
    lastContactedAt: contact.lastContactedAt || "",
    lastContactedChannel: contact.lastContactedChannel || "",
    outreachCount: contact.outreachCount ?? 0,
    revisitAfter: contact.revisitAfter || "",
    passedReason: contact.passedReason || "",
    doNotContact: contact.doNotContact,
    hubspotBounced: contact.hubspotBounced,
    hubspotOptedOut: contact.hubspotOptedOut,
    internal: contact.internal,
    importBatchId: contact.importBatchId,
    signedUp: args.signedUp,
    emailable: args.emailable,
    notes: contact.notes || [],
    enrichment: contact.enrichment || null,
  });
}

async function recipientSignedUp(email: string, canonical: string): Promise<boolean> {
  const db = getDb();
  const ids = [...new Set([email, canonical].filter((id) => id.includes("@")))];
  const refs = ids.flatMap((id) => [
    db.collection("leads").doc(id),
    db.collection("members").doc(id),
  ]);
  const snaps = await db.getAll(...refs);
  return snaps.some((snap) => snap.exists);
}

function touchpointToTimeline(touch: Touchpoint): TimelineEvent {
  const title =
    touch.subject ||
    `${touch.direction} ${touch.channel}${touch.source ? ` (${touch.source})` : ""}`;
  const description = [touch.status, touch.summary, touch.actor]
    .filter((part) => part && part.trim())
    .join(" · ");
  return {
    id: `touch-${touch.id}`,
    type: "email",
    title,
    description: description || undefined,
    at: touch.at,
    meta: {
      channel: touch.channel,
      direction: touch.direction,
      source: touch.source,
    },
  };
}

export async function getCrmContactAdminDetail(
  email: string
): Promise<CrmContactAdminDetail | null> {
  const loaded = await getCrmContactByEmail(email);
  if (!loaded) return null;
  const { contact } = loaded;
  const canonical = contact.canonicalEmail || canonicalEmail(contact.email);
  const [signedUp, suppressed, emailLogs, touchpoints] = await Promise.all([
    recipientSignedUp(contact.email, canonical),
    isSuppressed(contact.email),
    loadEmailLogs(contact.email, canonical),
    listTouchpointsByCrmContactId(canonical),
  ]);
  const emailTimeline = buildPersonTimeline({ emailLog: emailLogs });
  const touchTimeline = touchpoints.map(touchpointToTimeline);
  const timeline = [...emailTimeline, ...touchTimeline].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
  return {
    contact: toAdminCrmContactProfile(contact, {
      signedUp,
      emailable: crmContactIsEmailable(contact, suppressed),
    }),
    timeline,
  };
}

async function loadEmailLogs(
  email: string,
  canonical: string
): Promise<Array<{ id: string; subject?: string; status?: string; source?: string; sentAt?: string; flowType?: string }>> {
  const db = getDb();
  const addresses = [...new Set([email, canonical].filter((id) => id.includes("@")))];
  const snaps = await Promise.all(
    addresses.map((to) => db.collection("emailLog").where("to", "==", to).limit(100).get())
  );
  const seen = new Set<string>();
  const logs: Array<{
    id: string;
    subject?: string;
    status?: string;
    source?: string;
    sentAt?: string;
    flowType?: string;
  }> = [];
  for (const snap of snaps) {
    for (const doc of snap.docs) {
      if (seen.has(doc.id)) continue;
      seen.add(doc.id);
      const data = doc.data() as Record<string, unknown>;
      logs.push({
        id: doc.id,
        subject: typeof data.subject === "string" ? data.subject : undefined,
        status: typeof data.status === "string" ? data.status : undefined,
        source: typeof data.source === "string" ? data.source : undefined,
        sentAt: typeof data.sentAt === "string" ? data.sentAt : undefined,
        flowType: typeof data.flowType === "string" ? data.flowType : undefined,
      });
    }
  }
  return logs;
}

export async function appendCrmContactNote(
  email: string,
  text: string,
  actor: string
): Promise<CrmContactNote> {
  const loaded = await getCrmContactByEmail(email);
  if (!loaded) {
    throw new Error("not_found");
  }
  const note: CrmContactNote = {
    at: new Date().toISOString(),
    text: text.trim(),
    actor: actor.trim(),
  };
  if (!note.text) {
    throw new Error("empty_note");
  }
  if (note.text.length > 2000) {
    throw new Error("note_too_long");
  }
  await getDb()
    .collection(CRM_CONTACTS_COLLECTION)
    .doc(loaded.id)
    .update({
      notes: FieldValue.arrayUnion(note),
      updatedAt: note.at,
    });
  return note;
}
