import type { LeadRecord } from "@/lib/crm/lead-lifecycle";
import { previewProcessFlowsDryRun } from "@/lib/crm/cron-dry-run";
import type { PendingEmail } from "@/lib/flows";
import type { SendEmailOptions, SendEmailResult } from "@/lib/gmail";
import {
  decideFlowCronAction,
  decideFlowSendExceptionAction,
  isGlobalSendSkip,
  isManualOnlySendSkip,
  isOptOutSendSkip,
} from "@/lib/flow-send-policy";

const MARK_SENT_ATTEMPTS = 3;

export interface ProcessFlowsEffects {
  sendEmail: (opts: SendEmailOptions) => Promise<SendEmailResult>;
  unsubscribeUrlFor: (email: string) => Promise<string>;
  getTemplate: (
    stepId: string,
    ctx: { email: string; firstName: string; unsubscribeUrl: string }
  ) => { subject: string; html: string; text?: string };
  claimStepForSend: (
    flowDocId: string,
    stepIndex: number
  ) => Promise<{ ok: boolean; claimId?: string; finalizedFromReceipt?: boolean }>;
  recordSendReceipt: (args: {
    flowDocId: string;
    stepIndex: number;
    claimId: string;
    gmailMessageId?: string | null;
    sentAt?: string;
  }) => Promise<void>;
  releaseStepClaim: (
    flowDocId: string,
    stepIndex: number,
    claimId: string
  ) => Promise<void>;
  markStepSent: (
    flowDocId: string,
    stepIndex: number,
    claimId: string
  ) => Promise<void>;
  markStepSkipped: (
    flowDocId: string,
    stepIndex: number,
    claimId?: string
  ) => Promise<void>;
  markStepAttemptFailed: (
    flowDocId: string,
    stepIndex: number,
    error: string,
    opts?: { retryable?: boolean; claimId?: string }
  ) => Promise<unknown>;
  exitFlow: (flowDocId: string, reason: string) => Promise<void>;
}

export interface ProcessFlowsLiveResult {
  dryRun: false;
  marketingBlocked: string | null;
  pending: number;
  sent: number;
  skipped: number;
  failed: number;
  deferred: number;
  exited: number;
}

export async function executeProcessFlows(args: {
  dryRun: boolean;
  blocked: string | null;
  pending: PendingEmail[];
  loadLead: (email: string) => Promise<LeadRecord | undefined>;
  loadSuppressed?: (email: string) => Promise<boolean>;
  loadManualOnly?: (email: string) => Promise<boolean>;
  loadFirstName: (
    userId: string,
    lead: LeadRecord | undefined
  ) => Promise<string>;
  effects: ProcessFlowsEffects;
}): Promise<
  | ReturnType<typeof previewProcessFlowsDryRun>
  | ProcessFlowsLiveResult
> {
  const loadSuppressed = args.loadSuppressed ?? (async () => false);
  if (!args.loadManualOnly) {
    throw new Error(
      "executeProcessFlows requires loadManualOnly (fail closed)"
    );
  }
  const loadManualOnly = args.loadManualOnly;

  async function manualOnlyOrFailClosed(email: string): Promise<boolean> {
    try {
      return await loadManualOnly(email);
    } catch (e) {
      console.error("[process-flows] manualOnly lookup failed", email, e);
      return true;
    }
  }

  if (args.dryRun) {
    const leadByEmail = new Map<string, LeadRecord | undefined>();
    const suppressedByEmail = new Map<string, boolean>();
    const manualOnlyByEmail = new Map<string, boolean>();
    for (const item of args.pending) {
      const key = item.email.trim().toLowerCase();
      if (!leadByEmail.has(key)) {
        leadByEmail.set(key, await args.loadLead(key));
      }
      if (!suppressedByEmail.has(key)) {
        suppressedByEmail.set(key, await loadSuppressed(key));
      }
      if (!manualOnlyByEmail.has(key)) {
        manualOnlyByEmail.set(key, await manualOnlyOrFailClosed(key));
      }
    }
    return previewProcessFlowsDryRun({
      pending: args.pending,
      marketingBlock: args.blocked,
      leadByEmail,
      suppressedByEmail,
      manualOnlyByEmail,
    });
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  let deferred = 0;
  let exited = 0;
  const fx = args.effects;

  for (const item of args.pending) {
    const email = item.email.trim().toLowerCase();
    const leadData = await args.loadLead(email);
    const suppressed = await loadSuppressed(email);
    const manualOnly = await manualOnlyOrFailClosed(email);
    const firstName = await args.loadFirstName(item.userId, leadData);
    const action = decideFlowCronAction({
      globalBlock: args.blocked,
      flowType: item.flowType,
      lead: leadData,
      email,
      suppressed,
      manualOnly,
    });
    switch (action) {
      case "defer":
        deferred++;
        continue;
      case "skip_ineligible":
      case "skip_manual_only":
        await fx.markStepSkipped(item.flowDocId, item.stepIndex);
        skipped++;
        continue;
      case "exit_excluded":
        await fx.exitFlow(item.flowDocId, "excluded_account");
        exited++;
        continue;
      case "exit_suppressed":
        await fx.exitFlow(item.flowDocId, "suppressed");
        exited++;
        continue;
      case "send":
        break;
      default: {
        const _exhaustive: never = action;
        throw new Error(`Unknown flow cron action: ${_exhaustive}`);
      }
    }

    const claimed = await fx.claimStepForSend(item.flowDocId, item.stepIndex);
    if (claimed.finalizedFromReceipt) {
      continue;
    }
    if (!claimed.ok || !claimed.claimId) continue;
    const claimId = claimed.claimId;

    let sendSucceeded = false;
    let gmailMessageId: string | undefined;
    try {
      const unsubscribeUrl = await fx.unsubscribeUrlFor(item.email);
      const rendered = fx.getTemplate(item.step.stepId, {
        email: item.email,
        firstName,
        unsubscribeUrl,
      });
      const result = await fx.sendEmail({
        to: item.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        unsubscribeUrl,
        purpose: "marketing",
        log: {
          source: "flow",
          stepId: item.step.stepId,
          flowType: item.flowType,
          flowDocId: item.flowDocId,
          userId: item.userId,
        },
      });

      if (result.skipped && isGlobalSendSkip(result.error)) {
        await fx.releaseStepClaim(item.flowDocId, item.stepIndex, claimId);
        deferred++;
      } else if (result.skipped && isOptOutSendSkip(result.error)) {
        await fx.exitFlow(item.flowDocId, "suppressed");
        exited++;
      } else if (result.skipped && isManualOnlySendSkip(result.error)) {
        await fx.markStepSkipped(item.flowDocId, item.stepIndex, claimId);
        skipped++;
      } else if (result.skipped) {
        await fx.markStepSkipped(item.flowDocId, item.stepIndex, claimId);
        skipped++;
      } else if (result.ok) {
        sendSucceeded = true;
        gmailMessageId = result.messageId;
        await persistSuccessfulSend(fx, item, claimId, gmailMessageId);
        sent++;
      } else {
        await fx.markStepAttemptFailed(
          item.flowDocId,
          item.stepIndex,
          result.error ?? "send_failed",
          { retryable: result.retryable !== false, claimId }
        );
        failed++;
      }
    } catch (e) {
      console.error("[process-flows]", item.step.stepId, e);
      if (sendSucceeded) {
        try {
          await persistSuccessfulSend(fx, item, claimId, gmailMessageId);
        } catch (persistErr) {
          console.error("[process-flows] persist after send", persistErr);
        }
        sent++;
        continue;
      }
      const msg = e instanceof Error ? e.message : String(e);
      if (decideFlowSendExceptionAction(msg) === "defer") {
        await fx.releaseStepClaim(item.flowDocId, item.stepIndex, claimId);
        deferred++;
        continue;
      }
      await fx.markStepAttemptFailed(item.flowDocId, item.stepIndex, msg, {
        retryable: true,
        claimId,
      });
      failed++;
    }
  }

  return {
    dryRun: false,
    marketingBlocked: args.blocked,
    pending: args.pending.length,
    sent,
    skipped,
    failed,
    deferred,
    exited,
  };
}

async function persistSuccessfulSend(
  fx: ProcessFlowsEffects,
  item: PendingEmail,
  claimId: string,
  gmailMessageId: string | undefined
): Promise<void> {
  await fx.recordSendReceipt({
    flowDocId: item.flowDocId,
    stepIndex: item.stepIndex,
    claimId,
    gmailMessageId: gmailMessageId ?? null,
  });
  let lastError: unknown;
  for (let attempt = 0; attempt < MARK_SENT_ATTEMPTS; attempt++) {
    try {
      await fx.markStepSent(item.flowDocId, item.stepIndex, claimId);
      return;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError ?? "markStepSent failed"));
}
