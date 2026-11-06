import type { FlowType } from "@/lib/crm/types";
import {
  LESSON_FLOW_TYPES,
  LESSON_SERIES_SCHEDULE,
  lessonStepId,
  type LessonFlowType,
} from "@/lib/lesson-series/messages";
import { LESSON_TRACK_IDS } from "@/lib/lesson-series/tracks";

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;
export const SMART_SENDING_MS = 16 * HOUR_MS;

/**
 * Automated flows for leads: the coaching flows and the lesson follow-up
 * series. All need a confirmed email and stop on unsubscribe.
 */
export const LEAD_MARKETING_FLOWS: FlowType[] = ["coaching_nurture", "coaching_post_call", ...LESSON_FLOW_TYPES];

export interface FlowStepDef {
  stepId: string;
  delayMs: number;
}

const LESSON_FLOW_DEFINITIONS = Object.fromEntries(
  LESSON_TRACK_IDS.map((track) => [
    `lesson_${track}`,
    LESSON_SERIES_SCHEDULE.map((s) => ({ stepId: lessonStepId(track, s.key), delayMs: s.delayMs })),
  ])
) as Record<LessonFlowType, FlowStepDef[]>;

export const FLOW_DEFINITIONS: Record<FlowType, FlowStepDef[]> = {
  ...LESSON_FLOW_DEFINITIONS,
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
  // A booked call or an application replaces the lesson series: the lead is
  // talking to David now. A new lesson series replaces the old one.
  coaching_post_call: {
    exitFlows: ["coaching_nurture", ...LESSON_FLOW_TYPES],
  },
  coaching_nurture: {
    exitFlows: [...LESSON_FLOW_TYPES],
  },
  ...Object.fromEntries(
    LESSON_FLOW_TYPES.map((ft) => [ft, { exitFlows: LESSON_FLOW_TYPES.filter((o) => o !== ft) }])
  ),
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
