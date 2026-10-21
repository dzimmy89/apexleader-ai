import { FieldValue } from "firebase-admin/firestore";
import {
  FLOW_CONFLICTS,
  FLOW_DEFINITIONS,
  SMART_SENDING_MS,
  type FlowStepDef,
} from "@/lib/flow-definitions";
import { getDb } from "@/lib/firebase-admin";
import { triggerFlowBlockReason } from "@/lib/crm/excluded-accounts";
import { manualOnlyBlockReason } from "@/lib/crm/contacts";
import type { FlowDoc, FlowStatus, FlowStep, FlowType } from "@/lib/crm/types";
import {
  applyExitFlow,
  applyMarkStepAttemptFailed,
  applyMarkStepSent,
  applyMarkStepSkipped,
  applyReleaseStepClaim,
  existingFlowBlocksEnroll,
  FLOW_SEND_RECEIPTS_COLLECTION,
  isOneShotFlow,
  isStepDueForSend,
  prepareStepForSend,
  sendReceiptDocId,
  type FlowSendReceipt,
} from "@/lib/crm/flow-step-state";

export {
  applyClaimStep,
  applyExitFlow,
  applyMarkStepAttemptFailed,
  applyMarkStepSent,
  applyMarkStepSentFromReceipt,
  applyMarkStepSkipped,
  applyReleaseStepClaim,
  existingFlowBlocksEnroll,
  isOneShotFlow,
  isStepDueForSend,
  MAX_SEND_ATTEMPTS,
  ONE_SHOT_FLOWS,
  prepareStepForSend,
  sendBackoffMs,
  sendReceiptDocId,
  SEND_CLAIM_TTL_MS,
} from "@/lib/crm/flow-step-state";
export type {
  ClaimStepFailure,
  ClaimStepResult,
  FlowSendReceipt,
  MarkStepSentResult,
} from "@/lib/crm/flow-step-state";

function buildSteps(triggeredAt: Date, defs: FlowStepDef[]): FlowStep[] {
  const base = triggeredAt.getTime();
  return defs.map((d) => ({
    stepId: d.stepId,
    sendAt: new Date(base + d.delayMs).toISOString(),
    sentAt: null,
    skipped: false,
  }));
}

export async function exitFlowsForUser(
  userId: string,
  flowType: FlowType,
  reason: string
): Promise<void> {
  const db = getDb();
  const snap = await db
    .collection("flows")
    .where("userId", "==", userId)
    .where("flowType", "==", flowType)
    .where("status", "==", "active")
    .get();
  const batch = db.batch();
  snap.docs.forEach((doc) => {
    batch.update(doc.ref, {
      status: "exited" as FlowStatus,
      exitReason: reason,
    });
  });
  if (!snap.empty) await batch.commit();
}

async function exitConflictingFlows(
  userId: string,
  enrolling: FlowType
): Promise<void> {
  const conflicts = FLOW_CONFLICTS[enrolling]?.exitFlows ?? [];
  for (const ft of conflicts) {
    await exitFlowsForUser(userId, ft, `conflict:${enrolling}`);
  }
}

export async function enrollFlow(
  flowType: FlowType,
  userId: string,
  email: string
): Promise<{
  id: string;
  created: boolean;
  blocked?: "excluded_email" | "manual_only_contact";
}> {
  const normalized = email.trim().toLowerCase();
  const blocked = triggerFlowBlockReason(normalized);
  if (blocked) {
    return { id: "", created: false, blocked };
  }
  const manualBlock = await manualOnlyBlockReason(normalized, "confirmed_or_paid");
  if (manualBlock) {
    return { id: "", created: false, blocked: "manual_only_contact" };
  }
  const db = getDb();
  const existing = await db
    .collection("flows")
    .where("userId", "==", userId)
    .where("flowType", "==", flowType)
    .get();

  const statuses = existing.docs.map((d) => d.data().status as FlowStatus);
  if (existingFlowBlocksEnroll(flowType, statuses)) {
    const preferred =
      existing.docs.find((d) => d.data().status === "active") ??
      existing.docs[0]!;
    return { id: preferred.id, created: false };
  }

  await exitConflictingFlows(userId, flowType);

  const triggeredAt = new Date();
  const defs = FLOW_DEFINITIONS[flowType];
  const payload: Omit<FlowDoc, "id"> = {
    userId,
    email: normalized,
    flowType,
    status: "active",
    triggeredAt: triggeredAt.toISOString(),
    lastFlowEmailSentAt: null,
    steps: buildSteps(triggeredAt, defs),
  };

  if (isOneShotFlow(flowType)) {
    const ref = db.collection("flows").doc(`${flowType}:${userId}`);
    try {
      await ref.create(payload);
      return { id: ref.id, created: true };
    } catch {
      const raced = await ref.get();
      if (raced.exists) return { id: ref.id, created: false };
      throw new Error(`Failed to create one-shot flow ${flowType} for ${userId}`);
    }
  }

  const ref = await db.collection("flows").add(payload);
  return { id: ref.id, created: true };
}

export async function triggerFlow(
  flowType: FlowType,
  userId: string,
  email: string
): Promise<string | null> {
  const result = await enrollFlow(flowType, userId, email);
  if (result.blocked) return null;
  return result.id;
}

export interface PendingEmail {
  flowDocId: string;
  flowType: FlowType;
  userId: string;
  email: string;
  stepIndex: number;
  step: FlowStep;
}

export async function getPendingEmails(): Promise<PendingEmail[]> {
  const db = getDb();
  const now = Date.now();
  const snap = await db
    .collection("flows")
    .where("status", "==", "active")
    .get();
  const pending = collectPendingEmails(
    snap.docs.map((doc) => ({ id: doc.id, data: doc.data() as FlowDoc })),
    now
  );
  const kept: PendingEmail[] = [];
  for (const item of pending) {
    const blocked = await manualOnlyBlockReason(item.email, "confirmed_or_paid");
    if (blocked) continue;
    kept.push(item);
  }
  return kept;
}

export function collectPendingEmails(
  docs: Array<{ id: string; data: FlowDoc }>,
  nowMs: number
): PendingEmail[] {
  const pending: PendingEmail[] = [];

  for (const doc of docs) {
    const data = doc.data;
    const lastSent = data.lastFlowEmailSentAt
      ? new Date(data.lastFlowEmailSentAt).getTime()
      : 0;
    if (lastSent && nowMs - lastSent < SMART_SENDING_MS) continue;

    const idx = data.steps.findIndex((s) => isStepDueForSend(s, nowMs));
    if (idx < 0) continue;

    pending.push({
      flowDocId: doc.id,
      flowType: data.flowType,
      userId: data.userId,
      email: data.email,
      stepIndex: idx,
      step: data.steps[idx]!,
    });
  }

  return pending;
}

export async function markStepSent(
  flowDocId: string,
  stepIndex: number,
  claimId: string
): Promise<void> {
  const db = getDb();
  const ref = db.collection("flows").doc(flowDocId);
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) return;
    const marked = applyMarkStepSent(
      doc.data() as FlowDoc,
      stepIndex,
      new Date().toISOString(),
      claimId
    );
    if (!marked.ok) {
      throw new Error(`markStepSent failed: ${marked.reason}`);
    }
    if (marked.alreadySent) return;
    tx.update(ref, {
      steps: marked.data.steps,
      lastFlowEmailSentAt: marked.data.lastFlowEmailSentAt,
      ...(marked.data.status === "completed"
        ? { status: "completed" as FlowStatus }
        : {}),
    });
  });
}

export async function claimStepForSend(
  flowDocId: string,
  stepIndex: number
): Promise<{ ok: boolean; claimId?: string; finalizedFromReceipt?: boolean }> {
  const db = getDb();
  const ref = db.collection("flows").doc(flowDocId);
  const receiptRef = db
    .collection(FLOW_SEND_RECEIPTS_COLLECTION)
    .doc(sendReceiptDocId(flowDocId, stepIndex));
  const claimId = crypto.randomUUID();
  const now = new Date();
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) return { ok: false };
    const receiptSnap = await tx.get(receiptRef);
    const receipt = receiptSnap.exists
      ? (receiptSnap.data() as FlowSendReceipt)
      : null;
    const prepared = prepareStepForSend(
      doc.data() as FlowDoc,
      stepIndex,
      now.toISOString(),
      claimId,
      now.getTime(),
      receipt
    );
    switch (prepared.kind) {
      case "already_sent":
        return { ok: false };
      case "blocked":
        return { ok: false };
      case "finalize_receipt": {
        tx.update(ref, {
          steps: prepared.data.steps,
          lastFlowEmailSentAt: prepared.data.lastFlowEmailSentAt,
          ...(prepared.data.status === "completed"
            ? { status: "completed" as FlowStatus }
            : {}),
        });
        return { ok: false, finalizedFromReceipt: true };
      }
      case "claim":
        tx.update(ref, { steps: prepared.data.steps });
        return { ok: true, claimId: prepared.claimId };
      default: {
        const _exhaustive: never = prepared;
        throw new Error(`Unknown claim prepare: ${JSON.stringify(_exhaustive)}`);
      }
    }
  });
}

export async function recordSendReceipt(args: {
  flowDocId: string;
  stepIndex: number;
  claimId: string;
  gmailMessageId?: string | null;
  sentAt?: string;
}): Promise<void> {
  const db = getDb();
  const ref = db
    .collection(FLOW_SEND_RECEIPTS_COLLECTION)
    .doc(sendReceiptDocId(args.flowDocId, args.stepIndex));
  const sentAt = args.sentAt ?? new Date().toISOString();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) return;
    tx.set(ref, {
      flowDocId: args.flowDocId,
      stepIndex: args.stepIndex,
      claimId: args.claimId,
      gmailMessageId: args.gmailMessageId ?? null,
      sentAt,
    } satisfies FlowSendReceipt);
  });
}

export async function exitFlowDoc(
  flowDocId: string,
  reason: string
): Promise<void> {
  const db = getDb();
  const ref = db.collection("flows").doc(flowDocId);
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) return;
    const data = doc.data() as FlowDoc;
    if (data.status !== "active") return;
    const next = applyExitFlow(data, reason);
    tx.update(ref, {
      status: next.status,
      exitReason: next.exitReason,
    });
  });
}

export async function releaseStepClaim(
  flowDocId: string,
  stepIndex: number,
  claimId: string
): Promise<void> {
  const db = getDb();
  const ref = db.collection("flows").doc(flowDocId);
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) return;
    const data = doc.data() as FlowDoc;
    const next = applyReleaseStepClaim(data, stepIndex, claimId);
    if (next === data) return;
    tx.update(ref, { steps: next.steps });
  });
}

export async function markStepSkipped(
  flowDocId: string,
  stepIndex: number,
  claimId?: string
): Promise<void> {
  const db = getDb();
  const ref = db.collection("flows").doc(flowDocId);
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) return;
    const skipped = applyMarkStepSkipped(doc.data() as FlowDoc, stepIndex, claimId);
    if (!skipped.applied) return;
    tx.update(ref, {
      steps: skipped.data.steps,
      ...(skipped.data.status === "completed"
        ? { status: "completed" as FlowStatus }
        : {}),
    });
  });
}

/**
 * Record a failed send attempt. Retries with backoff until MAX_SEND_ATTEMPTS,
 * then permanently skips the step so cron stops requeueing.
 */
export async function markStepAttemptFailed(
  flowDocId: string,
  stepIndex: number,
  error: string,
  opts?: { retryable?: boolean; claimId?: string }
): Promise<"retried" | "exhausted" | "ignored"> {
  const db = getDb();
  const ref = db.collection("flows").doc(flowDocId);
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) return "ignored";
    const next = applyMarkStepAttemptFailed(
      doc.data() as FlowDoc,
      stepIndex,
      error,
      Date.now(),
      opts
    );
    if (!next.applied) return "ignored";
    tx.update(ref, {
      steps: next.data.steps,
      ...(next.data.status === "completed"
        ? { status: "completed" as FlowStatus }
        : {}),
    });
    return next.outcome === "ignored" ? "ignored" : next.outcome;
  });
}

export async function isAlreadyCustomer(email: string): Promise<boolean> {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const member = await db.collection("members").doc(normalized).get();
  if (!member.exists) return false;
  const tier = member.data()?.tier as string | undefined;
  return ["skool", "coaching", "paid", "admin"].includes(tier || "");
}

export async function syncUserFromMember(
  email: string,
  userId?: string
): Promise<void> {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const member = await db.collection("members").doc(normalized).get();
  if (!member.exists) return;
  const m = member.data()!;
  const uid = userId || m.firebaseUid || normalized;
  const name = (m.name as string) || "";
  const firstName = name.split(" ")[0] || "";
  const token =
    (m.unsubscribeToken as string) ||
    crypto.randomUUID().replace(/-/g, "");

  await db
    .collection("users")
    .doc(uid)
    .set(
      {
        email: normalized,
        firstName,
        unsubscribeToken: token,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}
