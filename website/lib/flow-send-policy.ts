import type { FlowType } from "@/lib/crm/types";
import { isExcludedCrmEmail } from "@/lib/crm/excluded-accounts";
import {
  confirmIsBlocked,
  isEligibleForMarketing,
  type LeadRecord,
} from "@/lib/crm/lead-lifecycle";
import { LEAD_MARKETING_FLOWS } from "@/lib/flow-definitions";

export type FlowCronAction =
  | "defer"
  | "skip_ineligible"
  | "skip_manual_only"
  | "send"
  | "exit_excluded"
  | "exit_suppressed";

export function decideFlowCronAction(args: {
  globalBlock: string | null;
  flowType: FlowType;
  lead: LeadRecord | undefined;
  email: string;
  suppressed?: boolean;
  manualOnly?: boolean;
}): FlowCronAction {
  if (args.globalBlock) return "defer";
  if (args.manualOnly) return "skip_manual_only";
  if (isExcludedCrmEmail(args.email)) return "exit_excluded";
  if (args.suppressed) return "exit_suppressed";
  if (confirmIsBlocked(args.lead?.status) || args.lead?.emailOptIn === false) {
    return "exit_suppressed";
  }
  const isLeadFlow = (LEAD_MARKETING_FLOWS as readonly string[]).includes(
    args.flowType
  );
  if (isLeadFlow && !isEligibleForMarketing(args.lead)) {
    return "skip_ineligible";
  }
  return "send";
}

export function isGlobalSendSkip(error?: string): boolean {
  return (
    error === "marketing_sends_disabled" ||
    error === "postal_address_placeholder" ||
    error === "missing_email_token_secret"
  );
}

export function isManualOnlySendSkip(error?: string): boolean {
  return (
    error === "manual_only_contact" ||
    error === "manual_only_contact_lookup_failed"
  );
}

export function isOptOutSendSkip(error?: string): boolean {
  return error === "suppressed";
}

/** Thrown send errors: missing token secret must not burn the step. */
export function decideFlowSendExceptionAction(
  error: string
): "defer" | "fail_retryable" {
  if (isGlobalSendSkip(error) || error.includes("missing_email_token_secret")) {
    return "defer";
  }
  return "fail_retryable";
}
