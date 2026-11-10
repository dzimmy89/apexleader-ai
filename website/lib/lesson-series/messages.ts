import { URLS } from "@/content/site";
import { BRAND } from "@/lib/brand";
import { emailShell, marketingPlaintext } from "@/lib/email-layout";
import { getSiteOrigin } from "@/lib/env";
import { escapeHtml } from "@/lib/html";
import { findLesson, getCourse, type LearnCourse, type LearnLesson } from "@/lib/learn/catalog";
import {
  LESSON_TRACK_IDS,
  LESSON_TRACKS,
  type LessonTrack,
  type LessonTrackId,
} from "@/lib/lesson-series/tracks";

/**
 * The lesson follow-up series: five emails and three texts over twelve days,
 * keyed to the lesson the lead came in through. Every step id is
 * lesson_<track>_<key>, and the flow type is lesson_<track>.
 */

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export type LessonStepKey = "e1" | "s1" | "e2" | "e3" | "s2" | "e4" | "s3" | "e5";
export type LessonChannel = "email" | "sms";

export const LESSON_SERIES_SCHEDULE: { key: LessonStepKey; channel: LessonChannel; delayMs: number }[] = [
  { key: "e1", channel: "email", delayMs: 0 },
  { key: "s1", channel: "sms", delayMs: 5 * 60 * 1000 },
  { key: "e2", channel: "email", delayMs: 2 * DAY_MS },
  { key: "e3", channel: "email", delayMs: 4 * DAY_MS },
  { key: "s2", channel: "sms", delayMs: 5 * DAY_MS },
  { key: "e4", channel: "email", delayMs: 7 * DAY_MS },
  { key: "s3", channel: "sms", delayMs: 9 * DAY_MS },
  { key: "e5", channel: "email", delayMs: 12 * DAY_MS },
];

export type LessonFlowType = `lesson_${LessonTrackId}`;

export const LESSON_FLOW_TYPES = LESSON_TRACK_IDS.map((t) => `lesson_${t}` as LessonFlowType);

export function lessonFlowType(track: LessonTrackId): LessonFlowType {
  return `lesson_${track}`;
}

export function isLessonFlowType(flowType: string): flowType is LessonFlowType {
  return (LESSON_FLOW_TYPES as string[]).includes(flowType);
}

export function lessonStepId(track: LessonTrackId, key: LessonStepKey): string {
  return `lesson_${track}_${key}`;
}

/** lesson_get_found_e2 → { track: "get_found", key: "e2", channel: "email" }. */
export function parseLessonStepId(
  stepId: string
): { track: LessonTrackId; key: LessonStepKey; channel: LessonChannel } | null {
  const m = /^lesson_([a-z_]+)_([es][1-5])$/.exec(stepId);
  if (!m) return null;
  const track = m[1] as LessonTrackId;
  if (!(LESSON_TRACK_IDS as readonly string[]).includes(track)) return null;
  const step = LESSON_SERIES_SCHEDULE.find((s) => s.key === m[2]);
  if (!step) return null;
  return { track, key: step.key, channel: step.channel };
}

export function lessonStepChannel(stepId: string): LessonChannel | null {
  return parseLessonStepId(stepId)?.channel ?? null;
}

/** Email step ids for every track (admin template previews). */
export function lessonEmailStepIds(): string[] {
  return LESSON_TRACK_IDS.flatMap((t) =>
    LESSON_SERIES_SCHEDULE.filter((s) => s.channel === "email").map((s) => lessonStepId(t, s.key))
  );
}

/** The lesson a series was started from, as stored on the flow doc. */
export interface SeriesLesson {
  courseId: string;
  lessonSlug: string;
  title?: string;
}

interface ResolvedLesson {
  course: LearnCourse;
  lesson: LearnLesson;
  next: LearnLesson | null;
}

function resolveLesson(track: LessonTrack, lesson?: SeriesLesson | null): ResolvedLesson | null {
  const tries: SeriesLesson[] = [];
  if (lesson) tries.push(lesson);
  // Sample lesson for previews, or when a lesson was renamed since enrolling.
  for (const courseId of track.courses) {
    const c = getCourse(courseId);
    const first = c?.modules[0]?.lessons[0];
    if (c && first) tries.push({ courseId, lessonSlug: first.slug });
  }
  for (const t of tries) {
    const course = getCourse(t.courseId);
    const found = course ? findLesson(course, t.lessonSlug) : null;
    if (course && found) return { course, lesson: found.lesson, next: found.next };
  }
  return null;
}

function relatedCourse(track: LessonTrack, own: string): LearnCourse | null {
  for (const id of track.related) {
    if (id === own) continue;
    const c = getCourse(id);
    if (c) return c;
  }
  return null;
}

function link(path: string, track: LessonTrackId, key: LessonStepKey): string {
  const u = new URL(path, getSiteOrigin());
  u.searchParams.set("utm_source", "email");
  u.searchParams.set("utm_medium", "lesson_series");
  u.searchParams.set("utm_campaign", track);
  u.searchParams.set("utm_content", key);
  return u.toString();
}

function lessonPath(courseId: string, lesson: LearnLesson): string {
  return `/university/${courseId}/lessons/${lesson.slug}`;
}

function exercisePath(courseId: string, lesson: LearnLesson): string {
  return lesson.exercise
    ? `/university/${courseId}/exercises/${lesson.exercise}`
    : lessonPath(courseId, lesson);
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 24px;background:#c9a227;color:#0f0f0f;text-decoration:none;font-weight:bold;border-radius:4px;">${escapeHtml(label)}</a></p>`;
}

function paras(lines: string[]): string {
  return lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("\n");
}

function signoff(): string {
  return `<p>${escapeHtml(BRAND.coachFirstName)}</p>`;
}

export interface SeriesEmailContext {
  firstName?: string;
  unsubscribeUrl: string;
  lesson?: SeriesLesson | null;
}

export interface SeriesEmail {
  subject: string;
  html: string;
  text: string;
}

/** Render one email of a lesson series. Throws on an unknown or non-email step id. */
export function renderLessonEmail(stepId: string, ctx: SeriesEmailContext): SeriesEmail {
  const parsed = parseLessonStepId(stepId);
  if (!parsed || parsed.channel !== "email") throw new Error(`Unknown lesson email: ${stepId}`);
  const { track: trackId, key } = parsed;
  const track = LESSON_TRACKS[trackId];
  const resolved = resolveLesson(track, ctx.lesson);
  if (!resolved) throw new Error(`No lesson for series ${trackId}`);
  const { course, lesson, next } = resolved;
  const hi = `<p>Hi ${ctx.firstName ? escapeHtml(ctx.firstName) : "there"},</p>`;
  // Booking links stay bare (no query string), like every other flow email.
  const discovery = `${getSiteOrigin()}${URLS.coachingDiscovery}`;
  const nextLesson = next ?? null;

  let subject: string;
  let preview: string;
  let body: string;

  switch (key) {
    case "e1": {
      subject = lesson.exercise ? `Your exercise: ${lesson.title}` : `Your lesson: ${lesson.title}`;
      preview = "Saved here so you can come back to it.";
      const minutes = lesson.exercise && lesson.exerciseMinutes ? ` It takes about ${lesson.exerciseMinutes} minutes.` : "";
      body = `${hi}
<p>Here's the ${lesson.exercise ? "exercise" : "lesson"} from “${escapeHtml(lesson.title)}”, saved so you can come back to it.${minutes}</p>
${button(link(exercisePath(course.id, lesson), trackId, key), lesson.exercise ? "Open the exercise" : "Open the lesson")}
${paras([track.exerciseHint, `Over the next two weeks I'll send you a few short notes about ${track.label}: one idea per email, all things one person can run with Claude and a couple of other tools.`])}
${signoff()}`;
      break;
    }
    case "e2": {
      subject = track.play.subject;
      preview = `One play from ${course.title} you can run this week.`;
      const nextBlock = nextLesson
        ? `<p>The next lesson builds on it: “${escapeHtml(nextLesson.title)}”.</p>
${button(link(lessonPath(course.id, nextLesson), trackId, key), "Read the next lesson")}`
        : `${button(link(`/university/${course.id}`, trackId, key), `See all of ${course.title}`)}`;
      body = `${hi}
${paras(track.play.paragraphs)}
${nextBlock}
${signoff()}`;
      break;
    }
    case "e3": {
      subject = track.mistake.subject;
      preview = `The ${track.label} mistake I see most.`;
      const rel = relatedCourse(track, course.id);
      const relBlock = rel
        ? `<p>If you want to go deeper, ${escapeHtml(rel.title)} is free to read.</p>
${button(link(`/university/${rel.id}`, trackId, key), `Open ${rel.title}`)}`
        : "";
      body = `${hi}
${paras(track.mistake.paragraphs)}
${relBlock}
${signoff()}`;
      break;
    }
    case "e4": {
      subject = track.offerSubject;
      preview = "The lessons stay free. This is the other way to do it.";
      body = `${hi}
${paras([
  "A quick note on the other way to do this. The lessons are free, and you can do every exercise on your own.",
  `If you'd rather have it built with you, private coaching starts with Kickstart: two 1-on-1 sessions where we build ${track.offer}. If you move up to Operator within 30 days, the whole Kickstart fee counts toward it.`,
  "If it isn't right for you, you get a full refund within 14 days of signing, as long as it's before your first session.",
  "The first step is a free 30-minute call. We look at your business and I tell you honestly whether coaching is worth it for you.",
])}
${button(discovery, "Book a free call")}
<p>Or <a href="${escapeHtml(link("/coaching", trackId, key))}" style="color:#c9a227;">see the packages first</a>.</p>
${signoff()}
<p style="font-size:13px;color:#999;">Individual results vary.</p>`;
      break;
    }
    case "e5": {
      subject = `Last note on ${track.label}`;
      preview = "Reply with the one thing you're stuck on.";
      const keepGoing = nextLesson
        ? `<p>Pick up where you left off: “${escapeHtml(nextLesson.title)}”.</p>
${button(link(lessonPath(course.id, nextLesson), trackId, key), "Read the next lesson")}`
        : button(link(`/university/${course.id}`, trackId, key), `Back to ${course.title}`);
      body = `${hi}
${paras([
  "This is the last email in this short series.",
  `If one thing about ${track.label} has you stuck, reply to this email and tell me what it is. I read every reply and answer them myself.`,
])}
${keepGoing}
<p>And if you'd like it built with you, the free call is <a href="${escapeHtml(discovery)}" style="color:#c9a227;">here</a>.</p>
${signoff()}`;
      break;
    }
    default:
      throw new Error(`Unknown lesson email: ${stepId}`);
  }

  const html = emailShell({
    purpose: "marketing",
    bodyHtml: body,
    previewText: preview,
    unsubscribeUrl: ctx.unsubscribeUrl,
    receivingReason: `You're receiving this because you opened a lesson exercise in ${escapeHtml(course.title)} at ${BRAND.domain}.`,
  });
  const text = marketingPlaintext({ bodyHtml: body, unsubscribeUrl: ctx.unsubscribeUrl });
  return { subject, html, text };
}

export const SMS_STOP_LINE = "Reply STOP to opt out.";

function shortTitle(title: string, max = 48): string {
  return title.length <= max ? title : `${title.slice(0, max - 1).trimEnd()}…`;
}

/** Render one text of a lesson series. Every text names the sender and ends with the STOP line. */
export function renderLessonSms(stepId: string, ctx: { firstName?: string; lesson?: SeriesLesson | null }): string {
  const parsed = parseLessonStepId(stepId);
  if (!parsed || parsed.channel !== "sms") throw new Error(`Unknown lesson text: ${stepId}`);
  const track = LESSON_TRACKS[parsed.track];
  const resolved = resolveLesson(track, ctx.lesson);
  if (!resolved) throw new Error(`No lesson for series ${parsed.track}`);
  const origin = getSiteOrigin();
  const hi = `Hi ${ctx.firstName?.trim() || "there"}`;
  switch (parsed.key) {
    case "s1":
      return `${hi}, it's ${BRAND.coachFirstName} from ${BRAND.name}. Your exercise for "${shortTitle(resolved.lesson.title)}" is here: ${origin}${exercisePath(resolved.course.id, resolved.lesson)} ${SMS_STOP_LINE}`;
    case "s2":
      return `${hi}, ${BRAND.coachFirstName} from ${BRAND.name} here: ${track.checkInText} ${SMS_STOP_LINE}`;
    case "s3":
      return `${BRAND.coachFirstName} from ${BRAND.name}: if you'd rather have ${track.offerShort} set up with me on your own accounts, a free 30-min call is the first step: ${origin}${URLS.coachingDiscovery} ${SMS_STOP_LINE}`;
    default:
      throw new Error(`Unknown lesson text: ${stepId}`);
  }
}
