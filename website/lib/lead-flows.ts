import type { FlowType } from "@/lib/crm/types";
import { triggerFlow, exitFlowsForUser } from "@/lib/flows";
import { LEAD_MARKETING_FLOWS } from "@/lib/flow-definitions";
import { flowTypeForLeadMagnet } from "@/lib/lead-magnet-flows";

export { flowTypeForLeadMagnet } from "@/lib/lead-magnet-flows";

export function leadFlowUserId(email: string): string {
  return `lead:${encodeURIComponent(email.trim().toLowerCase())}`;
}

export async function enrollCoachingNurture(
  email: string
): Promise<string | null> {
  return triggerFlow("coaching_nurture", leadFlowUserId(email), email);
}

export async function enrollCoachingPostCall(
  email: string
): Promise<string | null> {
  return triggerFlow("coaching_post_call", leadFlowUserId(email), email);
}

export async function enrollForLeadMagnet(
  email: string,
  leadMagnet: string
): Promise<{ flowType?: FlowType; flowDocId?: string | null }> {
  const flowType = flowTypeForLeadMagnet(leadMagnet);
  switch (flowType) {
    case "coaching_post_call":
      return { flowType, flowDocId: await enrollCoachingPostCall(email) };
    case "coaching_nurture":
      return { flowType, flowDocId: await enrollCoachingNurture(email) };
    case undefined:
      return {};
    default: {
      const _exhaustive: never = flowType;
      throw new Error(`unhandled lead magnet flow: ${_exhaustive}`);
    }
  }
}

export async function exitAllLeadMarketingFlows(
  email: string,
  reason: string
): Promise<void> {
  const userId = leadFlowUserId(email);
  for (const flowType of LEAD_MARKETING_FLOWS) {
    await exitFlowsForUser(userId, flowType, reason);
  }
}
