import type { FlowType } from "@/lib/crm/types";

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;
export const SMART_SENDING_MS = 16 * HOUR_MS;

export const LEAD_MARKETING_FLOWS: FlowType[] = [
  "lead_nurture",
  "sample_nurture",
  "coaching_nurture",
  "coaching_post_call",
  "du_welcome",
];

export interface FlowStepDef {
  stepId: string;
  delayMs: number;
}

export const FLOW_DEFINITIONS: Record<FlowType, FlowStepDef[]> = {
  onboarding: [
    { stepId: "welcome", delayMs: 0 },
    { stepId: "skool_orientation", delayMs: 12 * HOUR_MS },
    { stepId: "university_cta", delayMs: 24 * HOUR_MS },
    { stepId: "engagement_check", delayMs: 48 * HOUR_MS },
  ],
  winback: [
    { stepId: "cancel_confirm", delayMs: 0 },
    { stepId: "what_you_missed", delayMs: 3 * DAY_MS },
    { stepId: "final_nudge", delayMs: 7 * DAY_MS },
  ],
  lead_nurture: [
    { stepId: "intro_course_nudge", delayMs: 1 * DAY_MS },
    { stepId: "newsletter_upsell", delayMs: 3 * DAY_MS },
    { stepId: "learn_library_nudge", delayMs: 5 * DAY_MS },
    { stepId: "lead_final_subscribe", delayMs: 7 * DAY_MS },
  ],
  coaching_nurture: [
    { stepId: "coaching_reminder", delayMs: 1 * DAY_MS },
    { stepId: "coaching_newsletter_bridge", delayMs: 4 * DAY_MS },
    { stepId: "coaching_foundations_offer", delayMs: 7 * DAY_MS },
    { stepId: "coaching_testimonial_social_proof", delayMs: 11 * DAY_MS },
    { stepId: "coaching_institutional_positioning", delayMs: 14 * DAY_MS },
    { stepId: "coaching_final_discovery_nudge", delayMs: 18 * DAY_MS },
  ],
  coaching_post_call: [
    { stepId: "coaching_post_call_thanks", delayMs: 2 * HOUR_MS },
    { stepId: "coaching_post_call_recap", delayMs: 1 * DAY_MS },
    { stepId: "coaching_post_call_proposal", delayMs: 3 * DAY_MS },
  ],
  sample_nurture: [
    { stepId: "sample_subscribe_nudge", delayMs: 1 * DAY_MS },
    { stepId: "sample_social_proof", delayMs: 3 * DAY_MS },
    { stepId: "sample_final_nudge", delayMs: 5 * DAY_MS },
  ],
  du_welcome: [
    { stepId: "du_welcome_d0", delayMs: 0 },
    { stepId: "du_welcome_d2", delayMs: 2 * DAY_MS },
    { stepId: "du_welcome_d5", delayMs: 5 * DAY_MS },
    { stepId: "du_welcome_d8", delayMs: 8 * DAY_MS },
    { stepId: "du_welcome_d12", delayMs: 12 * DAY_MS },
    { stepId: "du_welcome_d16", delayMs: 16 * DAY_MS },
    { stepId: "du_welcome_d21", delayMs: 21 * DAY_MS },
  ],
  reengagement: [
    { stepId: "watchlist_waiting", delayMs: 0 },
  ],
};

export const FLOW_CONFLICTS: Partial<
  Record<FlowType, { exitFlows: FlowType[] }>
> = {
  onboarding: {
    exitFlows: ["winback", ...LEAD_MARKETING_FLOWS],
  },
  winback: {
    exitFlows: ["onboarding", "reengagement", ...LEAD_MARKETING_FLOWS],
  },
  coaching_post_call: {
    exitFlows: ["du_welcome", "coaching_nurture"],
  },
};

export const FLOW_TEMPLATE_IDS = [
  "welcome",
  "skool_orientation",
  "university_cta",
  "engagement_check",
  "cancel_confirm",
  "what_you_missed",
  "final_nudge",
  "watchlist_waiting",
  "intro_course_nudge",
  "newsletter_upsell",
  "learn_library_nudge",
  "lead_final_subscribe",
  "sample_subscribe_nudge",
  "sample_social_proof",
  "sample_final_nudge",
  "coaching_reminder",
  "coaching_newsletter_bridge",
  "coaching_foundations_offer",
  "coaching_testimonial_social_proof",
  "coaching_institutional_positioning",
  "coaching_final_discovery_nudge",
  "coaching_post_call_thanks",
  "coaching_post_call_recap",
  "coaching_post_call_proposal",
  "du_welcome_d0",
  "du_welcome_d2",
  "du_welcome_d5",
  "du_welcome_d8",
  "du_welcome_d12",
  "du_welcome_d16",
  "du_welcome_d21",
] as const;
