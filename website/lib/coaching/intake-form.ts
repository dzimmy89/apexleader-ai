import { createHash, randomBytes } from "crypto";
import { getDb } from "@/lib/firebase-admin";
import { getSiteOrigin, SENDER_EMAIL } from "@/lib/env";
import { sendEmail } from "@/lib/gmail";
import { escapeHtml } from "@/lib/html";
import { BRAND } from "@/lib/brand";
import { aiConfigured } from "@/lib/coaching/ai";
import { draftSyllabus } from "@/lib/coaching/coaching-ai";
import { cleanForm, clientContext, getIntake, saveIntake, type IntakeForm } from "@/lib/coaching/intake";
import { buildCourseList, clampInputs, getSyllabus, planCourseIds, saveSyllabus, type SyllabusInputs } from "@/lib/coaching/syllabus";
import { planFromCourses } from "@/lib/coaching/syllabus-plan";

/**
 * The self-serve intake form: David emails a new client a private link, the
 * client answers the intake questions themselves, and their answers fill
 * client_intake/{email} and build a draft syllabus for David to review.
 *
 * intake_form_links/{sha256(token)}: one row per emailed link. Only the hash
 * is stored, so the database never holds a working link.
 */
export const INTAKE_FORM_LINKS = "intake_form_links";
const LINK_TTL_DAYS = 30;

/** The fields a client fills in. coachNotes and evidence stay David's. */
export const CLIENT_FIELDS = [
  "goals",
  "targetOutcome",
  "targetDate",
  "hoursPerWeek",
  "level",
  "business",
  "tools",
  "technical",
  "focusStageIds",
  "knownCourseIds",
  "concerns",
  "learningStyle",
] as const satisfies readonly (keyof IntakeForm)[];

export class IntakeLinkError extends Error {
  constructor(
    message: string,
    readonly code: "not_found" | "expired"
  ) {
    super(message);
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function intakeFormUrl(token: string): string {
  return `${getSiteOrigin()}/coaching/intake/${token}`;
}

/** Emails the client a fresh link to the intake form, from hello@. */
export async function sendIntakeFormEmail(rawEmail: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const email = rawEmail.trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, error: "Bad email" };
  const { clientName, pkg } = await clientContext(email);
  const token = randomBytes(24).toString("base64url");
  const now = new Date();
  await getDb()
    .collection(INTAKE_FORM_LINKS)
    .doc(hashToken(token))
    .set({
      email,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + LINK_TTL_DAYS * 86_400_000).toISOString(),
      submittedAt: null,
    });

  const url = intakeFormUrl(token);
  const first = clientName.split(" ")[0] || "";
  const hello = first ? `Hi ${first},` : "Hi,";
  const what = pkg ? `your ${pkg.name} coaching` : "your coaching";
  const sent = await sendEmail({
    to: email,
    purpose: "transactional",
    subject: `A few questions before ${what} starts`,
    text: `${hello}\n\nBefore we start ${what}, please answer a few questions about your business and what you want from it. It takes about 10 minutes, and I use your answers to build your syllabus.\n\n${url}\n\nThe link is just for you and works for ${LINK_TTL_DAYS} days.\n\n${BRAND.coachFirstName}\n${BRAND.name}`,
    html: `<p>${escapeHtml(hello)}</p><p>Before we start ${escapeHtml(what)}, please answer a few questions about your business and what you want from it. It takes about 10 minutes, and I use your answers to build your syllabus.</p><p><a href="${escapeHtml(url)}">Answer the intake questions</a></p><p>The link is just for you and works for ${LINK_TTL_DAYS} days.</p><p>${escapeHtml(BRAND.coachFirstName)}<br>${escapeHtml(BRAND.name)}</p>`,
    log: { source: "coaching_intake_form", flowType: "coaching_intake_form" },
  });
  if (!sent.ok) return { ok: false, error: sent.error || "The email did not send" };
  await saveIntake(email, { formSentAt: now.toISOString() });
  return { ok: true, url };
}

async function linkFor(token: string): Promise<{ ref: FirebaseFirestore.DocumentReference; email: string; submittedAt: string | null }> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) throw new IntakeLinkError("This link isn't valid.", "not_found");
  const ref = getDb().collection(INTAKE_FORM_LINKS).doc(hashToken(token));
  const snap = await ref.get();
  if (!snap.exists) throw new IntakeLinkError("This link isn't valid.", "not_found");
  const data = snap.data() as Record<string, unknown>;
  if (Date.parse(String(data.expiresAt || "")) < Date.now()) {
    throw new IntakeLinkError(`This link has expired. Email ${BRAND.email} for a new one.`, "expired");
  }
  return { ref, email: String(data.email), submittedAt: typeof data.submittedAt === "string" ? data.submittedAt : null };
}

/** What the form page needs: who it is for and what they already answered. */
export async function loadIntakeForm(token: string) {
  const link = await linkFor(token);
  const ctx = await clientContext(link.email);
  const intake = await getIntake(link.email, ctx.packageId);
  const answers: Partial<IntakeForm> = {};
  for (const field of CLIENT_FIELDS) (answers as Record<string, unknown>)[field] = intake.form[field];
  return {
    name: ctx.clientName,
    packageName: ctx.pkg?.name || "",
    answers,
    submittedAt: link.submittedAt || intake.clientSubmittedAt,
  };
}

function inputsFromIntake(form: IntakeForm): SyllabusInputs {
  return clampInputs({
    goals: [...form.goals, form.targetOutcome].filter(Boolean).join("\n"),
    level: form.level,
    focusStageIds: form.focusStageIds,
    timelineWeeks: form.timelineWeeks,
    hoursPerWeek: form.hoursPerWeek,
  });
}

/**
 * A draft syllabus from the confirmed intake: Gemini's draft when it is set
 * up, otherwise the rule-based plan. Never touches a published syllabus;
 * David changes that one himself.
 */
export async function buildSyllabusFromIntake(email: string): Promise<"ai" | "rules" | "skipped_published"> {
  const existing = await getSyllabus(email);
  if (existing?.status === "published") return "skipped_published";
  const intake = await getIntake(email);
  const inputs = inputsFromIntake(intake.form);
  const startDate = existing?.startDate || new Date().toISOString().slice(0, 10);
  const base = { inputs, startDate, status: "draft" as const, publishedAt: null };
  if (aiConfigured()) {
    try {
      const ctx = await clientContext(email);
      const draft = await draftSyllabus(intake.form, { clientName: ctx.clientName, pkg: ctx.pkg, startDate });
      await saveSyllabus(email, {
        ...base,
        plan: draft.plan,
        courseIds: planCourseIds(draft.plan),
        laterCourseIds: [],
        note: intake.form.goalsSummary,
        source: "ai",
        summary: draft.summary,
        reasons: draft.reasons,
      });
      return "ai";
    } catch (e) {
      console.error("[intake-form] AI syllabus draft failed, using the rule-based plan", e);
    }
  }
  const { courseIds, laterCourseIds } = buildCourseList(inputs, { skipCourseIds: intake.form.knownCourseIds });
  await saveSyllabus(email, {
    ...base,
    plan: planFromCourses(courseIds, inputs.hoursPerWeek),
    courseIds,
    laterCourseIds,
    note: intake.form.goalsSummary,
    source: "rules",
    summary: "",
    reasons: [],
  });
  return "rules";
}

/**
 * The client's answers: they fill the intake (David's notes are kept), the
 * intake is marked confirmed, a draft syllabus is built and David is told.
 */
export async function submitIntakeForm(token: string, raw: unknown): Promise<{ syllabus: "ai" | "rules" | "skipped_published" | "failed" }> {
  const link = await linkFor(token);
  const email = link.email;
  const ctx = await clientContext(email);
  const existing = await getIntake(email, ctx.packageId);
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const picked: Record<string, unknown> = {};
  for (const field of CLIENT_FIELDS) if (field in r) picked[field] = r[field];
  const form = cleanForm({ ...existing.form, ...picked, coachNotes: existing.form.coachNotes }, existing.form);
  if (!form.goals.length) throw new Error("Tell us at least one goal.");
  if (!form.goalsSummary) form.goalsSummary = form.goals.join("; ").slice(0, 1200);

  const now = new Date().toISOString();
  await saveIntake(email, { form, status: "confirmed", confirmedAt: now, clientSubmittedAt: now });
  await link.ref.set({ submittedAt: now }, { merge: true });

  let syllabus: "ai" | "rules" | "skipped_published" | "failed";
  try {
    syllabus = await buildSyllabusFromIntake(email);
  } catch (e) {
    console.error("[intake-form] syllabus build failed", e);
    syllabus = "failed";
  }

  const who = ctx.clientName || email;
  const contactUrl = `${getSiteOrigin()}/admin/contacts/${encodeURIComponent(email)}`;
  const next =
    syllabus === "skipped_published"
      ? "Their syllabus is already published, so it was left as it is."
      : syllabus === "failed"
        ? "The syllabus draft could not be built. Open Syllabus and draft it there."
        : "A draft syllabus is ready for you to review and publish.";
  await sendEmail({
    to: SENDER_EMAIL,
    purpose: "transactional",
    subject: `${who} filled in their intake form`,
    text: `${who} answered the intake questions. ${next}\n\n${contactUrl}`,
    html: `<p>${escapeHtml(who)} answered the intake questions. ${escapeHtml(next)}</p><p><a href="${escapeHtml(contactUrl)}">Open their contact record</a></p>`,
    log: { source: "coaching_intake_form", flowType: "coaching_intake_form" },
  }).catch((e) => console.error("[intake-form] coach notice failed", e));

  return { syllabus };
}
