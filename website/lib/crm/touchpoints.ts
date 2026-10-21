import { createHash } from "node:crypto";
import type { WriteBatch } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase-admin";
import { canonicalEmail } from "@/lib/crm/contacts";

export const TOUCHPOINTS_COLLECTION = "touchpoints";

export const TOUCHPOINT_CHANNELS = [
  "email",
  "sms",
  "skool_dm",
  "call",
  "other",
] as const;

export type TouchpointChannel = (typeof TOUCHPOINT_CHANNELS)[number];

export const TOUCHPOINT_DIRECTIONS = ["outbound", "inbound"] as const;
export type TouchpointDirection = (typeof TOUCHPOINT_DIRECTIONS)[number];

export interface Touchpoint {
  id: string;
  crmContactId: string;
  channel: TouchpointChannel;
  direction: TouchpointDirection;
  at: string;
  from: string;
  subject: string;
  summary: string;
  status: string;
  source: string;
  actor: string;
  externalId: string;
  createdAt: string;
}

export function touchpointDocId(externalId: string): string {
  return createHash("sha256").update(externalId).digest("hex");
}

export function isTouchpointChannel(value: string): value is TouchpointChannel {
  return (TOUCHPOINT_CHANNELS as readonly string[]).includes(value);
}

export function parseTouchpointChannel(raw: string): TouchpointChannel {
  const key = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const aliases: Record<string, TouchpointChannel> = {
    email: "email",
    e_mail: "email",
    sms: "sms",
    text: "sms",
    skool_dm: "skool_dm",
    skool: "skool_dm",
    call: "call",
    phone: "call",
    other: "other",
  };
  const mapped = aliases[key];
  if (mapped) {
    switch (mapped) {
      case "email":
      case "sms":
      case "skool_dm":
      case "call":
      case "other":
        return mapped;
      default: {
        const exhaustive: never = mapped;
        return exhaustive;
      }
    }
  }
  return "other";
}

export type AddTouchpointInput = {
  crmContactId: string;
  channel: TouchpointChannel;
  direction: TouchpointDirection;
  at: string;
  from?: string;
  subject?: string;
  summary?: string;
  status?: string;
  source: string;
  actor?: string;
  externalId: string;
  createdAt?: string;
};

function toTouchpoint(id: string, data: Record<string, unknown>): Touchpoint {
  const channelRaw = typeof data.channel === "string" ? data.channel : "other";
  const channel = isTouchpointChannel(channelRaw) ? channelRaw : "other";
  const directionRaw = typeof data.direction === "string" ? data.direction : "outbound";
  const direction: TouchpointDirection =
    directionRaw === "inbound" || directionRaw === "outbound"
      ? directionRaw
      : "outbound";
  return {
    id,
    crmContactId: typeof data.crmContactId === "string" ? data.crmContactId : "",
    channel,
    direction,
    at: typeof data.at === "string" ? data.at : "",
    from: typeof data.from === "string" ? data.from : "",
    subject: typeof data.subject === "string" ? data.subject : "",
    summary: typeof data.summary === "string" ? data.summary : "",
    status: typeof data.status === "string" ? data.status : "",
    source: typeof data.source === "string" ? data.source : "",
    actor: typeof data.actor === "string" ? data.actor : "",
    externalId: typeof data.externalId === "string" ? data.externalId : "",
    createdAt: typeof data.createdAt === "string" ? data.createdAt : "",
  };
}

export function normalizeCrmContactId(email: string): string {
  return canonicalEmail(email.trim().toLowerCase());
}

/**
 * Idempotent write: document id is sha256(externalId). Existing docs are left
 * unchanged and returned. Pass a WriteBatch to queue the set on that batch
 * instead of writing immediately (still skips when the hashed id exists).
 */
export async function addTouchpoint(
  input: AddTouchpointInput,
  batch?: WriteBatch
): Promise<{ touchpoint: Touchpoint; created: boolean }> {
  const db = getDb();
  const id = touchpointDocId(input.externalId);
  const ref = db.collection(TOUCHPOINTS_COLLECTION).doc(id);
  const existing = await ref.get();
  if (existing.exists) {
    return {
      touchpoint: toTouchpoint(id, (existing.data() || {}) as Record<string, unknown>),
      created: false,
    };
  }
  const createdAt = input.createdAt ?? new Date().toISOString();
  const data: Omit<Touchpoint, "id"> = {
    crmContactId: normalizeCrmContactId(input.crmContactId),
    channel: input.channel,
    direction: input.direction,
    at: input.at,
    from: input.from?.trim() || "",
    subject: input.subject?.trim() || "",
    summary: input.summary?.trim() || "",
    status: input.status?.trim() || "",
    source: input.source,
    actor: input.actor?.trim() || "",
    externalId: input.externalId,
    createdAt,
  };
  if (batch) {
    batch.create(ref, data);
  } else {
    await ref.create(data);
  }
  return { touchpoint: { id, ...data }, created: true };
}

export async function listTouchpointsByCrmContactId(
  crmContactId: string
): Promise<Touchpoint[]> {
  const db = getDb();
  const id = normalizeCrmContactId(crmContactId);
  const snap = await db
    .collection(TOUCHPOINTS_COLLECTION)
    .where("crmContactId", "==", id)
    .get();
  return snap.docs
    .map((doc) => toTouchpoint(doc.id, (doc.data() || {}) as Record<string, unknown>))
    .sort((a, b) => a.at.localeCompare(b.at) || a.externalId.localeCompare(b.externalId));
}
