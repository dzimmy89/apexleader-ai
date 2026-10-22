import { inflateRawSync } from "node:zlib";
import { getDb } from "@/lib/firebase-admin";
import { getCourse, getStages } from "@/lib/learn/catalog";
import { LEVELS, type ExperienceLevel } from "@/lib/coaching/syllabus";
import { getPackage } from "@/lib/coaching/packages";
import type { PackageContext } from "@/lib/coaching/coaching-ai";

/**
 * client_intake/{email}: what David learned on a client's discovery call.
 *
 * The transcript comes from the call's Gemini notes doc in Drive
 * (meet-transcripts.ts), a paste or an uploaded file. Gemini fills the form
 * from it with a quote for each answer (intake-ai.ts), David corrects and
 * confirms it, and the syllabus draft is built from the confirmed form.
 * Admin only: the client never sees the transcript; only goalsSummary and
 * targetDate are shown in their account, once a syllabus is published.
 */
export const INTAKE = "client_intake";

/** Firestore documents stop at 1 MiB; a one-hour call is far smaller. */
export const MAX_TRANSCRIPT_CHARS = 300_000;

/** How comfortable the client is setting tools up themselves: no-code only, some scripting, or writes code. */
export type TechnicalComfort = "" | "low" | "medium" | "high";

export interface IntakeForm {
  goals: string[];
  targetOutcome: string;
  /** YYYY-MM-DD or "". */
  targetDate: string;
  timelineWeeks: number;
  hoursPerWeek: number;
  level: ExperienceLevel;
  /** What the business does, team size, and the processes they want AI to help with. */
  business: string;
  tools: string;
  technical: TechnicalComfort;
  focusStageIds: string[];
  knownCourseIds: string[];
  concerns: string;
  learningStyle: string;
  coachNotes: string;
  /** Shown to the client as "Your goals". */
  goalsSummary: string;
}

export type IntakeField = keyof IntakeForm;

export interface IntakeEvidence {
  field: IntakeField;
  quote: string;
  /** Where in the call, as the transcript shows it, e.g. "00:12:40". */
  at: string;
}

export interface IntakeTranscript {
  text: string;
  source: "drive" | "paste" | "upload";
  docId: string | null;
  docTitle: string;
  docUrl: string | null;
  callDate: string | null;
  importedAt: string;
}

export interface Intake {
  email: string;
  transcript: IntakeTranscript | null;
  form: IntakeForm;
  evidence: IntakeEvidence[];
  /** Fields Gemini could not answer from the call. */
  missing: IntakeField[];
  status: "empty" | "draft" | "confirmed";
  filledByAiAt: string | null;
  confirmedAt: string | null;
  updatedAt: string;
}

export const INTAKE_FIELDS: IntakeField[] = [
  "goals",
  "targetOutcome",
  "targetDate",
  "timelineWeeks",
  "hoursPerWeek",
  "level",
  "business",
  "tools",
  "technical",
  "focusStageIds",
  "knownCourseIds",
  "concerns",
  "learningStyle",
  "coachNotes",
  "goalsSummary",
];

/** Weeks of coaching each package runs, used as the default timeline. */
export const PACKAGE_WEEKS: Record<string, number> = { foundations: 4, mastery: 12, institutional: 26 };

export function emptyForm(packageId?: string): IntakeForm {
  return {
    goals: [],
    targetOutcome: "",
    targetDate: "",
    timelineWeeks: PACKAGE_WEEKS[packageId || ""] || 12,
    hoursPerWeek: 3,
    level: "beginner",
    business: "",
    tools: "",
    technical: "",
    focusStageIds: [],
    knownCourseIds: [],
    concerns: "",
    learningStyle: "",
    coachNotes: "",
    goalsSummary: "",
  };
}

function str(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

export function cleanForm(raw: unknown, fallback: IntakeForm = emptyForm()): IntakeForm {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const stageIds = new Set(getStages().map((s) => s.id));
  const goals = (Array.isArray(r.goals) ? r.goals : typeof r.goals === "string" ? [r.goals] : fallback.goals)
    .map((g) => str(g, 500))
    .filter(Boolean)
    .slice(0, 3);
  const date = str(r.targetDate, 10);
  return {
    goals,
    targetOutcome: str(r.targetOutcome ?? fallback.targetOutcome, 600),
    targetDate: /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) ? date : "",
    timelineWeeks: Math.min(104, Math.max(1, Math.round(Number(r.timelineWeeks) || fallback.timelineWeeks))),
    hoursPerWeek: Math.min(40, Math.max(0.5, Number(r.hoursPerWeek) || fallback.hoursPerWeek)),
    level: LEVELS.some((l) => l.id === r.level) ? (r.level as ExperienceLevel) : fallback.level,
    business: str(r.business ?? fallback.business, 2000),
    tools: str(r.tools ?? fallback.tools, 1000),
    technical: r.technical === "low" || r.technical === "medium" || r.technical === "high" ? r.technical : "",
    focusStageIds: (Array.isArray(r.focusStageIds) ? r.focusStageIds : fallback.focusStageIds)
      .map(String)
      .filter((id) => stageIds.has(id)),
    knownCourseIds: (Array.isArray(r.knownCourseIds) ? r.knownCourseIds : fallback.knownCourseIds)
      .map(String)
      .filter((id) => getCourse(id)),
    concerns: str(r.concerns ?? fallback.concerns, 2000),
    learningStyle: str(r.learningStyle ?? fallback.learningStyle, 600),
    coachNotes: str(r.coachNotes ?? fallback.coachNotes, 4000),
    goalsSummary: str(r.goalsSummary ?? fallback.goalsSummary, 1200),
  };
}

function readIntake(email: string, data: Record<string, unknown> | undefined): Intake {
  const d = data || {};
  const t = d.transcript as Record<string, unknown> | null | undefined;
  return {
    email,
    transcript:
      t && typeof t.text === "string"
        ? {
            text: t.text,
            source: t.source === "drive" || t.source === "upload" ? t.source : "paste",
            docId: typeof t.docId === "string" ? t.docId : null,
            docTitle: String(t.docTitle || ""),
            docUrl: typeof t.docUrl === "string" ? t.docUrl : null,
            callDate: typeof t.callDate === "string" ? t.callDate : null,
            importedAt: String(t.importedAt || ""),
          }
        : null,
    form: cleanForm(d.form),
    evidence: Array.isArray(d.evidence)
      ? (d.evidence as Record<string, unknown>[])
          .filter((e) => e && INTAKE_FIELDS.includes(e.field as IntakeField))
          .map((e) => ({ field: e.field as IntakeField, quote: str(e.quote, 600), at: str(e.at, 20) }))
      : [],
    missing: Array.isArray(d.missing) ? (d.missing as string[]).filter((f): f is IntakeField => INTAKE_FIELDS.includes(f as IntakeField)) : [],
    status: d.status === "draft" || d.status === "confirmed" ? d.status : "empty",
    filledByAiAt: typeof d.filledByAiAt === "string" ? d.filledByAiAt : null,
    confirmedAt: typeof d.confirmedAt === "string" ? d.confirmedAt : null,
    updatedAt: String(d.updatedAt || ""),
  };
}

export async function getIntake(email: string, packageId?: string): Promise<Intake> {
  const id = email.trim().toLowerCase();
  const snap = await getDb().collection(INTAKE).doc(id).get();
  const intake = readIntake(id, snap.exists ? snap.data() : undefined);
  if (!snap.exists) intake.form = emptyForm(packageId);
  return intake;
}

export async function saveIntake(email: string, patch: Partial<Omit<Intake, "email" | "updatedAt">>): Promise<Intake> {
  const id = email.trim().toLowerCase();
  await getDb()
    .collection(INTAKE)
    .doc(id)
    .set({ ...patch, email: id, updatedAt: new Date().toISOString() }, { merge: true });
  return getIntake(id);
}

/** Tidy a pasted or uploaded transcript: WebVTT/SRT cue numbers and arrows go, timestamps stay. */
export function cleanTranscript(raw: string): string {
  let text = raw.replace(/\r\n?/g, "\n").replace(/\u0000/g, "");
  if (/^WEBVTT/.test(text.trimStart()) || /\d{2}:\d{2}:\d{2}[.,]\d{3} --> /.test(text)) {
    const out: string[] = [];
    for (const block of text.split(/\n{2,}/)) {
      const lines = block.split("\n").filter((l) => l.trim() && !/^WEBVTT|^NOTE\b|^\d+$/.test(l.trim()));
      const cue = lines.findIndex((l) => l.includes("-->"));
      if (cue < 0) {
        if (lines.length) out.push(lines.join(" "));
        continue;
      }
      const stamp = lines[cue]!.split("-->")[0]!.trim().replace(/[.,]\d{3}$/, "");
      const words = lines.slice(cue + 1).join(" ").replace(/<[^>]+>/g, "").trim();
      if (words) out.push(`${stamp} ${words}`);
    }
    text = out.join("\n");
  }
  return text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_TRANSCRIPT_CHARS);
}

/**
 * The text of a .docx (word/document.xml), without a zip library: walk the
 * local file headers, inflate the one entry we need, and keep the text runs
 * with a line break per paragraph.
 */
export function docxText(buffer: Buffer): string {
  let offset = 0;
  while (offset + 30 <= buffer.length && buffer.readUInt32LE(offset) === 0x04034b50) {
    const flags = buffer.readUInt16LE(offset + 6);
    const method = buffer.readUInt16LE(offset + 8);
    let compressed = buffer.readUInt32LE(offset + 18);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const name = buffer.toString("utf8", offset + 30, offset + 30 + nameLength);
    const start = offset + 30 + nameLength + extraLength;
    if (flags & 0x08 && compressed === 0) {
      // Size lives in the data descriptor after the data; find the next header.
      const next = buffer.indexOf(Buffer.from([0x50, 0x4b, 0x07, 0x08]), start);
      compressed = next < 0 ? buffer.length - start : next - start;
    }
    if (name === "word/document.xml") {
      const data = buffer.subarray(start, start + compressed);
      const xml = (method === 8 ? inflateRawSync(data) : data).toString("utf8");
      return xml
        .replace(/<w:tab\/>/g, "\t")
        .replace(/<w:br\/>|<\/w:p>/g, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&");
    }
    offset = start + compressed + (flags & 0x08 ? 16 : 0);
  }
  throw new Error("Could not read that .docx file. Paste the transcript instead.");
}

/** Who the client is and what they bought, for the Gemini prompts. */
export async function clientContext(email: string): Promise<{ clientName: string; packageId: string; pkg: PackageContext | null }> {
  const id = email.trim().toLowerCase();
  const snap = await getDb().collection("client_records").doc(id).get().catch(() => null);
  const record = (snap?.exists ? snap.data() : null) as Record<string, unknown> | null;
  const packageId = String(record?.packageId || "");
  const pkg = packageId ? await getPackage(packageId).catch(() => null) : null;
  return {
    clientName: String(record?.name || ""),
    packageId,
    pkg: pkg
      ? {
          id: pkg.id,
          name: pkg.name,
          sessions: Number(record?.sessionsTotal) || pkg.sessionCount,
          weeks: PACKAGE_WEEKS[pkg.id] || pkg.durationWeeks || 12,
        }
      : null,
  };
}
