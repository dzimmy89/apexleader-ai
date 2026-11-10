import type { FlowStatus, FlowType } from "@/lib/crm/types";
import { getDb } from "@/lib/firebase-admin";
import { enrollFlow, triggerFlow, exitFlowsForUser } from "@/lib/flows";
import { isLessonFlowType, lessonFlowType, type SeriesLesson } from "@/lib/lesson-series/messages";
import { parseLessonMagnet, trackForCourse } from "@/lib/lesson-series/tracks";
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

export type LessonSeriesDecision =
  | { action: "enroll"; flowType: FlowType }
  | { action: "skip"; reason: "coaching_flow_active" | "same_series_active" | "series_already_done" };

/**
 * Whether a lead who came in through a lesson should start that lesson's
 * series. A lead talking to David (an active coaching flow) gets no series;
 * a lead already on, or done with, this topic's series is not restarted; a
 * lead on another topic's series switches to the new one (the conflict rule
 * exits the old one), because the newest link they clicked is what they
 * care about now.
 */
export function decideLessonSeries(
  lesson: { courseId: string },
  existing: Array<{ flowType: string; status: FlowStatus }>
): LessonSeriesDecision {
  const flowType = lessonFlowType(trackForCourse(lesson.courseId));
  if (existing.some((f) => f.status === "active" && !isLessonFlowType(f.flowType))) {
    return { action: "skip", reason: "coaching_flow_active" };
  }
  const same = existing.filter((f) => f.flowType === flowType);
  if (same.some((f) => f.status === "active")) return { action: "skip", reason: "same_series_active" };
  if (same.some((f) => f.status === "completed")) return { action: "skip", reason: "series_already_done" };
  return { action: "enroll", flowType };
}

/** Start the follow-up series for the lesson a lead came in through. */
export async function enrollLessonSeries(
  email: string,
  lesson: SeriesLesson
): Promise<{ flowType?: FlowType; flowDocId?: string | null; skipped?: string }> {
  const userId = leadFlowUserId(email);
  const snap = await getDb().collection("flows").where("userId", "==", userId).get();
  const decision = decideLessonSeries(
    lesson,
    snap.docs.map((d) => ({ flowType: String(d.data().flowType), status: d.data().status as FlowStatus }))
  );
  if (decision.action === "skip") return { skipped: decision.reason };
  const result = await enrollFlow(decision.flowType, userId, email, {
    lesson: { courseId: lesson.courseId, lessonSlug: lesson.lessonSlug, ...(lesson.title ? { title: lesson.title } : {}) },
  });
  if (result.blocked) return { flowType: decision.flowType, flowDocId: null, skipped: result.blocked };
  return { flowType: decision.flowType, flowDocId: result.id };
}

export async function enrollForLeadMagnet(
  email: string,
  leadMagnet: string,
  lesson?: SeriesLesson | null
): Promise<{ flowType?: FlowType; flowDocId?: string | null }> {
  const fromMagnet = parseLessonMagnet(leadMagnet);
  if (fromMagnet || lesson) {
    const { flowType, flowDocId } = await enrollLessonSeries(email, lesson ?? fromMagnet!);
    return { flowType, flowDocId };
  }
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
