import type { FlowType } from "@/lib/crm/types";

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;
export const SMART_SENDING_MS = 16 * HOUR_MS;

/** Automated email flows for coaching leads. Both stop when the lead pays. */
export const LEAD_MARKETING_FLOWS: FlowType[] = ["coaching_nurture", "coaching_post_call"];

export interface FlowStepDef {
  stepId: string;
  delayMs: number;
}

export const FLOW_DEFINITIONS: Record<FlowType, FlowStepDef[]> = {
  coaching_nurture: [
    { stepId: "coaching_reminder", delayMs: 1 * DAY_MS },
    { stepId: "coaching_foundations_offer", delayMs: 4 * DAY_MS },
    { stepId: "coaching_what_clients_build", delayMs: 8 * DAY_MS },
    { stepId: "coaching_final_discovery_nudge", delayMs: 14 * DAY_MS },
  ],
  coaching_post_call: [
    { stepId: "coaching_post_call_thanks", delayMs: 2 * HOUR_MS },
    { stepId: "coaching_post_call_recap", delayMs: 1 * DAY_MS },
    { stepId: "coaching_post_call_proposal", delayMs: 3 * DAY_MS },
  ],
};

export const FLOW_CONFLICTS: Partial<
  Record<FlowType, { exitFlows: FlowType[] }>
> = {
  coaching_post_call: {
    exitFlows: ["coaching_nurture"],
  },
};

export const FLOW_TEMPLATE_IDS = [
  "coaching_reminder",
  "coaching_foundations_offer",
  "coaching_what_clients_build",
  "coaching_final_discovery_nudge",
  "coaching_post_call_thanks",
  "coaching_post_call_recap",
  "coaching_post_call_proposal",
] as const;
