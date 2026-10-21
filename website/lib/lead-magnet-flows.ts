import {
  COACHING_NURTURE_MAGNETS,
  COACHING_POST_CALL_MAGNETS,
} from "@/lib/lead-magnet-constants";

export type LeadMagnetFlowType = "coaching_post_call" | "coaching_nurture";

export function flowTypeForLeadMagnet(
  leadMagnet: string
): LeadMagnetFlowType | undefined {
  if (COACHING_POST_CALL_MAGNETS.has(leadMagnet)) return "coaching_post_call";
  if (COACHING_NURTURE_MAGNETS.has(leadMagnet)) return "coaching_nurture";
  return undefined;
}
