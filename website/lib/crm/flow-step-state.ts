import type { FlowDoc, FlowStatus, FlowStep, FlowType } from "./types";

/** Flows that must never enroll the same user twice, including after complete/exit. */
export const ONE_SHOT_FLOWS: readonly FlowType[] = [];

/** How long a send claim may block retries after a crash before send. */
export const SEND_CLAIM_TTL_MS = 60 * 60 * 1000;

export const MAX_SEND_ATTEMPTS = 5;

export const FLOW_SEND_RECEIPTS_COLLECTION = "flow_send_receipts";

export function isOneShotFlow(flowType: FlowType): boolean {
  return (ONE_SHOT_FLOWS as readonly FlowType[]).includes(flowType);
}

export function sendReceiptDocId(flowDocId: string, stepIndex: number): string {
  return `${flowDocId}_${stepIndex}`;
}

/** Durable proof a Gmail send already succeeded for this step. */
export interface FlowSendReceipt {
  flowDocId: string;
  stepIndex: number;
  sentAt: string;
  claimId: string;
  gmailMessageId?: string | null;
}

export type ClaimStepFailure =
  | "missing_flow"
  | "not_active"
  | "missing_step"
  | "already_sent"
  | "skipped"
  | "already_claimed";

export type ClaimStepResult =
  | { ok: true; data: FlowDoc; claimId: string }
  | { ok: false; reason: ClaimStepFailure };

export type MarkStepSentFailure =
  | "missing_step"
  | "claim_mismatch"
  | "not_claimed";

export type MarkStepSentResult =
  | { ok: true; data: FlowDoc; alreadySent: boolean }
  | { ok: false; reason: MarkStepSentFailure };

export type PrepareStepForSendResult =
  | { kind: "already_sent" }
  | { kind: "finalize_receipt"; data: FlowDoc }
  | { kind: "claim"; data: FlowDoc; claimId: string }
  | { kind: "blocked"; reason: ClaimStepFailure };

export function claimIsExpired(
  sendClaimedAt: string | null | undefined,
  nowMs: number,
  ttlMs = SEND_CLAIM_TTL_MS
): boolean {
  if (!sendClaimedAt) return true;
  const claimedMs = Date.parse(sendClaimedAt);
  if (!Number.isFinite(claimedMs)) return true;
  return nowMs - claimedMs >= ttlMs;
}

export function sendBackoffMs(attemptCount: number): number {
  const base = 30 * 60 * 1000;
  return Math.min(base * 2 ** Math.max(0, attemptCount - 1), 8 * 60 * 60 * 1000);
}

function ownsClaim(step: FlowStep, claimId: string | undefined): boolean {
  if (!step.sendClaimId) return !claimId;
  return Boolean(claimId) && step.sendClaimId === claimId;
}

export function applyClaimStep(
  data: FlowDoc,
  stepIndex: number,
  claimedAtIso: string,
  claimId: string,
  nowMs: number
): ClaimStepResult {
  const step = data.steps[stepIndex];
  if (!step) return { ok: false, reason: "missing_step" };
  if (step.sentAt) return { ok: false, reason: "already_sent" };
  if (step.skipped) return { ok: false, reason: "skipped" };
  if (data.status !== "active") {
    return { ok: false, reason: "not_active" };
  }
  if (step.sendClaimedAt && !claimIsExpired(step.sendClaimedAt, nowMs)) {
    return { ok: false, reason: "already_claimed" };
  }
  const steps = [...data.steps];
  steps[stepIndex] = {
    ...step,
    sendClaimedAt: claimedAtIso,
    sendClaimId: claimId,
  };
  return { ok: true, data: { ...data, steps }, claimId };
}

export function applyMarkStepSentFromReceipt(
  data: FlowDoc,
  stepIndex: number,
  receipt: FlowSendReceipt
): MarkStepSentResult {
  const step = data.steps[stepIndex];
  if (!step) return { ok: false, reason: "missing_step" };
  if (step.sentAt) {
    return { ok: true, data, alreadySent: true };
  }
  const sentAtIso = receipt.sentAt;
  const steps = [...data.steps];
  steps[stepIndex] = {
    ...step,
    sentAt: sentAtIso,
    skipped: false,
    sendClaimedAt: null,
    sendClaimId: null,
    gmailMessageId: receipt.gmailMessageId ?? null,
  };
  const allDone = steps.every((s) => s.sentAt || s.skipped);
  return {
    ok: true,
    alreadySent: false,
    data: {
      ...data,
      steps,
      lastFlowEmailSentAt: sentAtIso,
      ...(allDone ? { status: "completed" as FlowStatus } : {}),
    },
  };
}

export function prepareStepForSend(
  data: FlowDoc,
  stepIndex: number,
  claimedAtIso: string,
  claimId: string,
  nowMs: number,
  receipt: FlowSendReceipt | null
): PrepareStepForSendResult {
  const step = data.steps[stepIndex];
  if (!step) return { kind: "blocked", reason: "missing_step" };
  if (step.sentAt) return { kind: "already_sent" };
  if (receipt) {
    const marked = applyMarkStepSentFromReceipt(data, stepIndex, receipt);
    if (!marked.ok) return { kind: "blocked", reason: "missing_step" };
    return { kind: "finalize_receipt", data: marked.data };
  }
  const claimed = applyClaimStep(data, stepIndex, claimedAtIso, claimId, nowMs);
  if (!claimed.ok) return { kind: "blocked", reason: claimed.reason };
  return { kind: "claim", data: claimed.data, claimId: claimed.claimId };
}

export function applyReleaseStepClaim(
  data: FlowDoc,
  stepIndex: number,
  claimId: string
): FlowDoc {
  const step = data.steps[stepIndex];
  if (!step || !step.sendClaimedAt) return data;
  if (step.sendClaimId && step.sendClaimId !== claimId) return data;
  if (!step.sendClaimId) return data;
  const steps = [...data.steps];
  steps[stepIndex] = { ...step, sendClaimedAt: null, sendClaimId: null };
  return { ...data, steps };
}

export function applyMarkStepSent(
  data: FlowDoc,
  stepIndex: number,
  sentAtIso: string,
  claimId: string
): MarkStepSentResult {
  const step = data.steps[stepIndex];
  if (!step) return { ok: false, reason: "missing_step" };
  if (step.sentAt) {
    return { ok: true, data, alreadySent: true };
  }
  const heldId = step.sendClaimId;
  if (heldId) {
    if (heldId !== claimId) return { ok: false, reason: "claim_mismatch" };
  } else if (!step.sendClaimedAt) {
    return { ok: false, reason: "not_claimed" };
  }
  const steps = [...data.steps];
  steps[stepIndex] = {
    ...step,
    sentAt: sentAtIso,
    skipped: false,
    sendClaimedAt: null,
    sendClaimId: null,
  };
  const allDone = steps.every((s) => s.sentAt || s.skipped);
  return {
    ok: true,
    alreadySent: false,
    data: {
      ...data,
      steps,
      lastFlowEmailSentAt: sentAtIso,
      ...(allDone ? { status: "completed" as FlowStatus } : {}),
    },
  };
}

export function applyMarkStepSkipped(
  data: FlowDoc,
  stepIndex: number,
  claimId?: string
): { applied: boolean; data: FlowDoc } {
  const step = data.steps[stepIndex];
  if (!step) return { applied: false, data };
  if (step.sentAt) return { applied: false, data };
  if (!ownsClaim(step, claimId)) return { applied: false, data };
  if (step.skipped) return { applied: true, data };
  const steps = [...data.steps];
  steps[stepIndex] = {
    ...step,
    skipped: true,
    sentAt: null,
    sendClaimedAt: null,
    sendClaimId: null,
  };
  const allDone = steps.every((s) => s.sentAt || s.skipped);
  return {
    applied: true,
    data: {
      ...data,
      steps,
      ...(allDone ? { status: "completed" as FlowStatus } : {}),
    },
  };
}

export function applyMarkStepAttemptFailed(
  data: FlowDoc,
  stepIndex: number,
  error: string,
  nowMs: number,
  opts?: { retryable?: boolean; claimId?: string }
): {
  applied: boolean;
  data: FlowDoc;
  outcome: "retried" | "exhausted" | "ignored";
} {
  const step = data.steps[stepIndex];
  if (!step) return { applied: false, data, outcome: "ignored" };
  if (step.sentAt) return { applied: false, data, outcome: "ignored" };
  if (!ownsClaim(step, opts?.claimId)) {
    return { applied: false, data, outcome: "ignored" };
  }
  const attemptCount = (step.attemptCount ?? 0) + 1;
  const retryable = opts?.retryable !== false;
  const exhausted = !retryable || attemptCount >= MAX_SEND_ATTEMPTS;
  const nowIso = new Date(nowMs).toISOString();
  const steps = [...data.steps];
  if (exhausted) {
    steps[stepIndex] = {
      ...step,
      skipped: true,
      sentAt: null,
      sendClaimedAt: null,
      sendClaimId: null,
      attemptCount,
      lastAttemptAt: nowIso,
      lastError: error,
    };
    const allDone = steps.every((s) => s.sentAt || s.skipped);
    return {
      applied: true,
      outcome: "exhausted",
      data: {
        ...data,
        steps,
        ...(allDone ? { status: "completed" as FlowStatus } : {}),
      },
    };
  }
  steps[stepIndex] = {
    ...step,
    attemptCount,
    lastAttemptAt: nowIso,
    lastError: error,
    sendAt: new Date(nowMs + sendBackoffMs(attemptCount)).toISOString(),
    skipped: false,
    sentAt: null,
    sendClaimedAt: null,
    sendClaimId: null,
  };
  return { applied: true, outcome: "retried", data: { ...data, steps } };
}

export function applyExitFlow(data: FlowDoc, reason: string): FlowDoc {
  return {
    ...data,
    status: "exited",
    exitReason: reason,
  };
}

export function isStepDueForSend(step: FlowStep, nowMs: number): boolean {
  if (step.skipped || step.sentAt) return false;
  if (step.sendClaimedAt && !claimIsExpired(step.sendClaimedAt, nowMs)) {
    return false;
  }
  const sendAt = new Date(step.sendAt).getTime();
  if (!Number.isFinite(sendAt)) return false;
  return sendAt <= nowMs;
}

export function existingFlowBlocksEnroll(
  flowType: FlowType,
  statuses: FlowStatus[]
): boolean {
  if (isOneShotFlow(flowType)) {
    return statuses.length > 0;
  }
  return statuses.includes("active");
}
