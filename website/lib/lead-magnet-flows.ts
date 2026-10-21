import {
  CHECKLIST_MAGNETS,
  COACHING_NURTURE_MAGNETS,
  COACHING_POST_CALL_MAGNETS,
  LEAD_NURTURE_MAGNETS,
  SAMPLE_NURTURE_MAGNETS,
} from "@/lib/lead-magnet-constants";

export type LeadMagnetFlowType =
  | "du_welcome"
  | "lead_nurture"
  | "sample_nurture"
  | "coaching_post_call"
  | "coaching_nurture";

/** Confirm and magnet enrollment never map to the unreviewed legacy lead welcome. */
export function flowTypeForLeadMagnet(
  leadMagnet: string
): LeadMagnetFlowType | undefined {
  if (CHECKLIST_MAGNETS.has(leadMagnet)) return "du_welcome";
  if (LEAD_NURTURE_MAGNETS.has(leadMagnet)) return "lead_nurture";
  if (SAMPLE_NURTURE_MAGNETS.has(leadMagnet)) return "sample_nurture";
  if (COACHING_POST_CALL_MAGNETS.has(leadMagnet)) return "coaching_post_call";
  if (COACHING_NURTURE_MAGNETS.has(leadMagnet)) return "coaching_nurture";
  return undefined;
}
