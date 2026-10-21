import type { LeadRecord } from "@/lib/crm/lead-lifecycle";
import type { FlowStatus } from "@/lib/crm/types";
import { crmTestAccountFlagReasons } from "@/lib/crm/excluded-accounts";
import {
  evaluateReengagementMember,
  INACTIVE_MS,
} from "@/lib/crm/reengagement-eligibility";
import { existingFlowBlocksEnroll } from "@/lib/crm/flow-step-state";
import { decideFlowCronAction } from "@/lib/flow-send-policy";
import type { PendingEmail } from "@/lib/flows";

export type DryRunAction = "send" | "defer" | "enroll" | "exit";

export interface DryRunRecipient {
  email: string;
  userId: string;
  flow: string;
  step: string;
  dueAt: string;
  action: DryRunAction;
  flaggedTestAccount: boolean;
  flagReasons: string[];
}

export interface ProcessFlowsDryRunReport {
  dryRun: true;
  writes: false;
  sends: false;
  marketingBlock: string | null;
  counts: {
    pending: number;
    wouldSend: number;
    deferred: number;
    skipIneligible: number;
    wouldExit: number;
    flaggedTestAccount: number;
  };
  recipients: DryRunRecipient[];
}

export interface ReengagementDryRunReport {
  dryRun: true;
  writes: false;
  sends: false;
  inactivityMs: number;
  counts: {
    scanned: number;
    wouldEnroll: number;
    skippedTestOrLoop: number;
    flaggedTestAccount: number;
  };
  recipients: DryRunRecipient[];
  skippedTestRecipients: DryRunRecipient[];
}

export function previewProcessFlowsDryRun(args: {
  pending: PendingEmail[];
  marketingBlock: string | null;
  leadByEmail: Map<string, LeadRecord | undefined>;
  suppressedByEmail?: Map<string, boolean>;
  manualOnlyByEmail?: Map<string, boolean>;
}): ProcessFlowsDryRunReport {
  const recipients: DryRunRecipient[] = [];
  let wouldSend = 0;
  let deferred = 0;
  let skipIneligible = 0;
  let wouldExit = 0;

  for (const item of args.pending) {
    const key = item.email.trim().toLowerCase();
    const lead = args.leadByEmail.get(key);
    const suppressed = args.suppressedByEmail?.get(key) ?? false;
    const manualOnly = args.manualOnlyByEmail?.get(key) ?? false;
    const cronAction = decideFlowCronAction({
      globalBlock: args.marketingBlock,
      flowType: item.flowType,
      lead,
      email: key,
      suppressed,
      manualOnly,
    });
    switch (cronAction) {
      case "skip_ineligible":
      case "skip_manual_only":
        skipIneligible++;
        break;
      case "exit_excluded":
      case "exit_suppressed": {
        wouldExit++;
        const flags = crmTestAccountFlagReasons(item.email);
        recipients.push({
          email: item.email,
          userId: item.userId,
          flow: item.flowType,
          step: item.step.stepId,
          dueAt: item.step.sendAt,
          action: "exit",
          flaggedTestAccount: flags.length > 0,
          flagReasons: flags,
        });
        break;
      }
      case "defer":
      case "send": {
        const flags = crmTestAccountFlagReasons(item.email);
        const action: DryRunAction = cronAction;
        if (action === "send") wouldSend++;
        else deferred++;
        recipients.push({
          email: item.email,
          userId: item.userId,
          flow: item.flowType,
          step: item.step.stepId,
          dueAt: item.step.sendAt,
          action,
          flaggedTestAccount: flags.length > 0,
          flagReasons: flags,
        });
        break;
      }
      default: {
        const _exhaustive: never = cronAction;
        throw new Error(`Unknown flow cron action: ${_exhaustive}`);
      }
    }
  }

  return {
    dryRun: true,
    writes: false,
    sends: false,
    marketingBlock: args.marketingBlock,
    counts: {
      pending: args.pending.length,
      wouldSend,
      deferred,
      skipIneligible,
      wouldExit,
      flaggedTestAccount: recipients.filter((r) => r.flaggedTestAccount).length,
    },
    recipients,
  };
}

export function previewReengagementDryRun(args: {
  members: Array<{ id: string; data: Record<string, unknown> }>;
  existingReengagementStatuses: Map<string, FlowStatus[]>;
  nowMs: number;
  manualOnlyEmails?: Set<string>;
}): ReengagementDryRunReport {
  const recipients: DryRunRecipient[] = [];
  const skippedTestRecipients: DryRunRecipient[] = [];
  for (const member of args.members) {
    const decision = evaluateReengagementMember(
      member.id,
      member.data,
      args.nowMs
    );
    if (
      decision.enroll &&
      args.manualOnlyEmails?.has(decision.email)
    ) {
      continue;
    }
    if (!decision.enroll) {
      if (
        decision.reason === "excluded_email" ||
        decision.reason === "excluded_source"
      ) {
        const emailRaw = (member.data.email || member.id) as unknown;
        const email =
          typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
        const flags = crmTestAccountFlagReasons(email, member.data.metadata);
        skippedTestRecipients.push({
          email,
          userId: email,
          flow: "reengagement",
          step: "watchlist_waiting",
          dueAt: new Date(args.nowMs).toISOString(),
          action: "enroll",
          flaggedTestAccount: true,
          flagReasons: flags.length ? flags : [decision.reason],
        });
      }
      continue;
    }
    const statuses = args.existingReengagementStatuses.get(decision.userId) ?? [];
    if (existingFlowBlocksEnroll("reengagement", statuses)) {
      continue;
    }
    const flags = crmTestAccountFlagReasons(
      decision.email,
      member.data.metadata
    );
    recipients.push({
      email: decision.email,
      userId: decision.userId,
      flow: "reengagement",
      step: "watchlist_waiting",
      dueAt: new Date(args.nowMs).toISOString(),
      action: "enroll",
      flaggedTestAccount: flags.length > 0,
      flagReasons: flags,
    });
  }

  return {
    dryRun: true,
    writes: false,
    sends: false,
    inactivityMs: INACTIVE_MS,
    counts: {
      scanned: args.members.length,
      wouldEnroll: recipients.length,
      skippedTestOrLoop: skippedTestRecipients.length,
      flaggedTestAccount: recipients.filter((r) => r.flaggedTestAccount).length,
    },
    recipients,
    skippedTestRecipients,
  };
}
