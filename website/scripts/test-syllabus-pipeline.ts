/**
 * Coaching syllabus pipeline: course access for the coaching period, the
 * week-by-week plan, transcript intake, and the intake and syllabus admin
 * routes with Gemini faked out.
 *   npx tsx scripts/test-syllabus-pipeline.ts
 */
import assert from "node:assert/strict";
import { deflateRawSync } from "node:zlib";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Firestore } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { setDbForTests } from "../lib/firebase-admin";
import { setSendEmailForTests, type SendEmailOptions } from "../lib/gmail";
import { COOKIE_NAME, createAdminSession } from "../lib/auth/admin-session-cookie";
import { coachingAccessEnds, getAccess, grantCoachingMembership } from "../lib/account/access";
import { AI_MODEL, aiConfigured, setAiForTests, vertexSetupError } from "../lib/coaching/ai";
import { toOp } from "../lib/coaching/coaching-ai";
import { cleanForm, cleanTranscript, docxText, emptyForm } from "../lib/coaching/intake";
import { candidatesFromEvents, transcriptFromDocument } from "../lib/coaching/meet-transcripts";
import { getClientSyllabus } from "../lib/coaching/syllabus";
import {
  applyOps,
  courseItems,
  keepFinished,
  packWeeks,
  pausePlan,
  planFromCourses,
  planStatus,
  planWarnings,
  respreadPlan,
  sanitizePlan,
  type PlanItem,
  type PlanWeek,
} from "../lib/coaching/syllabus-plan";
import { EMPTY_PROGRESS, type LearnProgress } from "../lib/learn/progress";
import { GET as getIntakeRoute, POST as postIntake } from "../app/api/admin/contacts/[email]/intake/route";
import { GET as getSyllabusRoute, POST as postSyllabus } from "../app/api/admin/contacts/[email]/syllabus/route";
import { GET as getQueue } from "../app/api/admin/coaching/syllabi/route";
import { createMemoryFirestore, type MemoryFirestore } from "./fixtures/memory-firestore";

const ORIGIN = "https://fromaitobusiness.com";
const CLIENT = "ada@example.com";

let mem: MemoryFirestore;
let sent: SendEmailOptions[] = [];

beforeEach(() => {
  mem = createMemoryFirestore();
  setDbForTests(mem as unknown as Firestore);
  sent = [];
  setSendEmailForTests(async (opts) => {
    sent.push(opts);
    return { ok: true, messageId: "m1", threadId: "t1" };
  });
  process.env.JWT_SECRET = "test-syllabus-pipeline";
  process.env.NEXT_PUBLIC_SITE_URL = ORIGIN;
  process.env.SENDER_EMAIL = "hello@fromaitobusiness.com";
});

afterEach(() => {
  setDbForTests(undefined);
  setSendEmailForTests(undefined);
  setAiForTests(undefined);
});

async function adminRequest(url: string, body?: unknown, method = "POST") {
  const token = await createAdminSession("david");
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json", cookie: `${COOKIE_NAME}=${token}`, origin: ORIGIN },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

const params = (email: string) => ({ params: Promise.resolve({ email: encodeURIComponent(email) }) });
const intakeUrl = `${ORIGIN}/api/admin/contacts/${encodeURIComponent(CLIENT)}/intake`;
const syllabusUrl = `${ORIGIN}/api/admin/contacts/${encodeURIComponent(CLIENT)}/syllabus`;

async function intake(body: unknown) {
  const res = await postIntake(await adminRequest(intakeUrl, body), params(CLIENT));
  return { status: res.status, json: await res.json() };
}

async function syllabus(body: unknown) {
  const res = await postSyllabus(await adminRequest(syllabusUrl, body), params(CLIENT));
  return { status: res.status, json: await res.json() };
}

function doneProgress(items: PlanItem[]): LearnProgress {
  const p: LearnProgress = { ...EMPTY_PROGRESS, lessons: {}, exercises: {}, quizzes: {} };
  for (const i of items) {
    const key = `${i.courseId}/${i.slug}`;
    if (i.kind === "lesson") p.lessons[key] = "2026-11-03";
    else if (i.kind === "exercise") p.exercises[key] = "2026-11-03";
    else if (i.kind === "quiz") p.quizzes[key] = { best: 90, last: 90, at: "2026-11-03" };
  }
  return p;
}

const task = (id: string, title: string, minutes = 20): PlanItem => ({
  id,
  kind: "task",
  courseId: null,
  slug: null,
  title,
  detail: "",
  minutes,
  skipped: false,
});
const milestone = (id: string, title: string): PlanItem => ({ ...task(id, title, 0), kind: "milestone" });

describe("coaching access period", () => {
  it("lasts 30 days for Kickstart, 3 months for Operator, 6 for Inner Circle", () => {
    const from = new Date("2026-01-15T00:00:00Z");
    assert.equal(coachingAccessEnds("foundations", from)?.slice(0, 10), "2026-02-14");
    assert.equal(coachingAccessEnds("mastery", from)?.slice(0, 10), "2026-04-15");
    assert.equal(coachingAccessEnds("institutional", from)?.slice(0, 10), "2026-07-15");
  });

  it("grants course access from the first payment and ends with the period", async () => {
    await mem.collection("client_records").doc(CLIENT).set({ email: CLIENT, packageId: "foundations", status: "active" });
    await grantCoachingMembership(CLIENT, "foundations", { from: new Date() } as never);
    assert.equal((await getAccess(CLIENT)).hasCourseAccess, true);

    await mem.collection("client_records").doc("old@example.com").set({ email: "old@example.com", packageId: "foundations", status: "active", paidAt: "2025-01-01T00:00:00Z" });
    assert.equal((await getAccess("old@example.com")).hasCourseAccess, false, "an old Kickstart without a grant has ended");

    await mem.collection("client_records").doc("new@example.com").set({ email: "new@example.com", packageId: "mastery", status: "active", paidAt: new Date().toISOString() });
    assert.equal((await getAccess("new@example.com")).hasCourseAccess, true, "a current client paid before grants keeps access");
  });
});

describe("plan", () => {
  const items = courseItems("one-person-company");

  it("lists each lesson with its exercise and the module quiz", () => {
    assert.ok(items.length > 3);
    const exIndex = items.findIndex((i) => i.kind === "exercise");
    if (exIndex > 0) assert.equal(items[exIndex - 1]!.kind, "lesson");
    assert.ok(items.some((i) => i.kind === "quiz"));
    assert.equal(new Set(items.map((i) => i.id)).size, items.length);
  });

  it("packs weeks to the hours without splitting a lesson from its exercise", () => {
    const weeks = packWeeks(items, 1);
    assert.deepEqual(
      weeks.flatMap((w) => w.items.map((i) => i.id)),
      items.map((i) => i.id)
    );
    for (const w of weeks) {
      const first = w.items[0];
      assert.notEqual(first?.kind, "exercise", "an exercise never opens a week away from its lesson");
    }
  });

  it("drops items that are not in the library and keeps tasks", () => {
    const { plan, dropped } = sanitizePlan([
      { goal: "Start", items: [{ kind: "lesson", courseId: "one-person-company", slug: "nope" }, { kind: "task", title: "Start a shared prompt doc", minutes: 15 }, items[0]] },
    ]);
    assert.deepEqual(dropped, ["lesson one-person-company/nope"]);
    assert.equal(plan[0]!.items.length, 2);
    assert.match(plan[0]!.items[0]!.id, /^task:[0-9a-f]{12}$/);
  });

  it("tracks tasks, milestones and pace", () => {
    const plan: PlanWeek[] = [
      { goal: "Week one", note: "", sessionPlan: "", paused: false, items: [items[0]!, task("task:a", "Start a shared prompt doc")] },
      { goal: "", note: "", sessionPlan: "", paused: false, items: [items[1]!, milestone("milestone:m", "Prompt library started")] },
      { goal: "", note: "", sessionPlan: "", paused: false, items: [items[2]!] },
    ];
    const inWeek3 = new Date("2026-11-17T12:00:00Z");
    const behind = planStatus(plan, "2026-11-02", EMPTY_PROGRESS, {}, inWeek3);
    assert.equal(behind.pace, "behind");
    assert.equal(behind.total, 4, "milestones do not count");
    assert.equal(behind.milestones[0]!.done, false);

    const status = planStatus(plan, "2026-11-02", doneProgress([items[0]!, items[1]!]), { "task:a": "2026-11-04" }, inWeek3);
    assert.equal(status.pace, "on-track");
    assert.equal(status.milestones[0]!.done, true, "a milestone is done once everything before it is");
    assert.equal(status.next?.id, items[2]!.id);
  });

  it("warns about overloaded weeks", () => {
    const plan = [{ goal: "", note: "", sessionPlan: "", paused: false, items: items.slice(0, 6) }];
    assert.ok(planWarnings(plan, 0.5).some((w) => /Week 1/.test(w)));
  });

  it("never loses finished work", () => {
    const old = planFromCourses(["one-person-company"], 2);
    const isDone = (i: PlanItem) => i.id === items[0]!.id;
    const kept = keepFinished(old, [{ goal: "", note: "", sessionPlan: "", paused: false, items: [] }], isDone);
    assert.ok(kept.flatMap((w) => w.items).some((i) => i.id === items[0]!.id));

    const removed = applyOps(old, [{ op: "remove", itemId: items[0]!.id }], isDone);
    assert.ok(removed.flatMap((w) => w.items).some((i) => i.id === items[0]!.id));
    const removedOpen = applyOps(old, [{ op: "remove", itemId: items[1]!.id }], isDone);
    assert.ok(!removedOpen.flatMap((w) => w.items).some((i) => i.id === items[1]!.id));
  });

  it("applies suggested changes without touching the original", () => {
    const old = planFromCourses(["one-person-company"], 2);
    const next = applyOps(
      old,
      [
        { op: "skip", itemId: items[0]!.id },
        { op: "move", itemId: items[1]!.id, toWeek: old.length + 1 },
        { op: "add", week: 1, item: { kind: "task", title: "Time this week's client emails", minutes: 20 } },
        { op: "setGoal", week: 1, goal: "Get set up" },
      ],
      () => false
    );
    assert.equal(old[0]!.items[0]!.skipped, false, "the original plan is not mutated");
    assert.equal(next[0]!.items.find((i) => i.id === items[0]!.id)?.skipped, true);
    assert.equal(next.length, old.length + 1);
    assert.equal(next[0]!.goal, "Get set up");
    assert.ok(next[0]!.items.some((i) => i.kind === "task"));
    assert.equal(toOp({ op: "add", week: 1, item: { kind: "lesson", courseId: "one-person-company", slug: "nope" } }), null);
  });

  it("pauses and re-paces from a week on", () => {
    const old = planFromCourses(["one-person-company"], 2);
    const paused = pausePlan(old, 2, 2);
    assert.equal(paused.length, old.length + 2);
    assert.equal(paused[1]!.paused, true);
    const isDone = (i: PlanItem) => i.id === items[0]!.id;
    const slower = respreadPlan(old, 1, 0.5, isDone);
    assert.ok(slower.length > old.length);
    assert.equal(slower[0]!.items[0]!.id, items[0]!.id, "finished items stay in their week");
  });
});

describe("transcripts", () => {
  it("cleans WebVTT and keeps the timestamps", () => {
    const vtt = "WEBVTT\n\n1\n00:00:01.000 --> 00:00:04.000\n<v David>Hi Ada\n\n2\n00:00:05.000 --> 00:00:09.000\n<v Ada>I want to automate my client emails\n";
    assert.equal(cleanTranscript(vtt), "00:00:01 Hi Ada\n00:00:05 I want to automate my client emails");
  });

  it("reads the text of a .docx", () => {
    const xml = '<w:document><w:body><w:p><w:r><w:t>David: hi</w:t></w:r></w:p><w:p><w:r><w:t>Ada: time &amp; privacy</w:t></w:r></w:p></w:body></w:document>';
    const data = deflateRawSync(Buffer.from(xml));
    const name = Buffer.from("word/document.xml");
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(8, 8);
    header.writeUInt32LE(data.length, 18);
    header.writeUInt32LE(xml.length, 22);
    header.writeUInt16LE(name.length, 26);
    const docx = Buffer.concat([header, name, data]);
    assert.equal(docxText(docx).trim(), "David: hi\nAda: time & privacy");
  });

  it("prefers the Transcript tab of a Gemini notes doc", () => {
    const para = (t: string) => ({ paragraph: { elements: [{ textRun: { content: t } }] } });
    const doc = {
      tabs: [
        { tabProperties: { title: "Notes" }, documentTab: { body: { content: [para("Summary\n")] } } },
        { tabProperties: { title: "Transcript" }, documentTab: { body: { content: [para("00:00:01 Ada: hello\n")] } } },
      ],
    };
    assert.deepEqual(transcriptFromDocument(doc), { text: "00:00:01 Ada: hello", fromTab: true });
  });

  it("takes notes docs attached to the client's calls", () => {
    const found = candidatesFromEvents(
      [
        {
          summary: "Discovery call",
          start: { dateTime: "2026-10-01T15:00:00Z" },
          attendees: [{ email: "Ada@Example.com" }],
          attachments: [{ fileId: "doc1234567890", title: "Notes by Gemini", mimeType: "application/vnd.google-apps.document" }],
        },
        { summary: "Someone else", attendees: [{ email: "bob@example.com" }], attachments: [{ fileId: "x", mimeType: "application/vnd.google-apps.document" }] },
      ],
      CLIENT
    );
    assert.equal(found.length, 1);
    assert.equal(found[0]!.docId, "doc1234567890");
    assert.equal(found[0]!.match, "event");
  });

  it("keeps only real stages and courses in the form", () => {
    const form = cleanForm({ goals: ["a", "b", "c", "d"], focusStageIds: ["tool-mastery", "nope"], knownCourseIds: ["one-person-company", "nope"], targetDate: "soon" }, emptyForm("mastery"));
    assert.equal(form.goals.length, 3);
    assert.deepEqual(form.focusStageIds, ["tool-mastery"]);
    assert.deepEqual(form.knownCourseIds, ["one-person-company"]);
    assert.equal(form.targetDate, "");
    assert.equal(form.timelineWeeks, 12);
  });
});

describe("intake and syllabus routes", () => {
  beforeEach(async () => {
    await mem.collection("client_records").doc(CLIENT).set({ email: CLIENT, name: "Ada Lovelace", packageId: "mastery", status: "active", sessionsTotal: 6 });
  });

  it("refuses without an admin session", async () => {
    const res = await postIntake(new NextRequest(intakeUrl, { method: "POST", body: "{}" }), params(CLIENT));
    assert.equal(res.status, 401);
  });

  it("goes from a pasted transcript to a published Gemini syllabus", async () => {
    const first = await getIntakeRoute(await adminRequest(intakeUrl, undefined, "GET"), params(CLIENT));
    assert.equal((await first.json()).intake.form.timelineWeeks, 12, "Operator defaults to 12 weeks");

    let r = await intake({ action: "paste", text: "00:01 Ada: I want to stop spending Mondays writing client update emails within three months." });
    assert.equal(r.status, 200);
    assert.equal(r.json.intake.status, "draft");

    let aiPrompt = "";
    setAiForTests(async <T>(opts: { prompt: string }) => {
      aiPrompt = opts.prompt;
      return {
        goals: ["Automate client update emails"],
        targetOutcome: "Client updates drafted by AI and reviewed in 15 minutes",
        targetDate: "2027-01-31",
        timelineWeeks: 12,
        hoursPerWeek: 2,
        level: "beginner",
        business: "Five-person bookkeeping firm; weekly client updates take most of Monday",
        tools: "Google Workspace, QuickBooks",
        technical: "low",
        focusStageIds: ["tool-mastery"],
        knownCourseIds: ["one-person-company"],
        concerns: "Client data privacy",
        learningStyle: "",
        coachNotes: "",
        goalsSummary: "You want your weekly client updates drafted by AI so Mondays are free again.",
        evidence: [{ field: "goals", quote: "I want to stop spending Mondays writing client update emails", at: "00:01" }],
        missing: ["learningStyle"],
      } as T;
    });
    r = await intake({ action: "fill" });
    assert.equal(r.status, 200, JSON.stringify(r.json));
    assert.match(aiPrompt, /client update emails/);
    assert.match(aiPrompt, /Operator|mastery/i);
    assert.deepEqual(r.json.intake.form.goals, ["Automate client update emails"]);
    assert.equal(r.json.intake.form.technical, "low");
    assert.match(r.json.intake.form.business, /bookkeeping/);
    assert.equal(r.json.intake.evidence[0].quote, "I want to stop spending Mondays writing client update emails");
    assert.deepEqual(r.json.intake.missing, ["learningStyle"]);

    r = await syllabus({ action: "draft" });
    assert.equal(r.status, 400, "drafting needs a confirmed intake");

    r = await intake({ action: "confirm" });
    assert.equal(r.json.intake.status, "confirmed");

    const items = courseItems("claude-code");
    setAiForTests(async <T>() =>
      ({
        summary: "Pick the workflow first, then map it.",
        weeks: [
          {
            goal: "Pick your first workflow",
            note: "",
            sessionPlan: "Score the three workflows together",
            items: [
              { kind: items[0]!.kind, courseId: "claude-code", slug: items[0]!.slug, title: "", detail: "", minutes: 0 },
              { kind: "lesson", courseId: "claude-code", slug: "made-up", title: "", detail: "", minutes: 0 },
              { kind: "task", courseId: "", slug: "", title: "Time last week's client updates", detail: "Write down the minutes per client", minutes: 30 },
            ],
          },
          { goal: "First milestone", note: "", sessionPlan: "", items: [{ kind: "milestone", courseId: "", slug: "", title: "First workflow chosen", detail: "", minutes: 0 }] },
        ],
        reasons: [{ courseId: "claude-code", reason: "Automating updates is the goal" }],
      }) as T
    );
    r = await syllabus({ action: "draft", startDate: "2026-11-02" });
    assert.equal(r.status, 200, JSON.stringify(r.json));
    assert.equal(r.json.syllabus.source, "ai");
    assert.deepEqual(r.json.dropped, ["lesson claude-code/made-up"]);
    assert.equal(r.json.syllabus.note, "You want your weekly client updates drafted by AI so Mondays are free again.");
    const taskId = r.json.syllabus.plan[0].items.find((i: PlanItem) => i.kind === "task").id;
    assert.equal(await getClientSyllabus(CLIENT), null, "nothing is shown before publishing");

    r = await syllabus({ action: "publish", changeNote: "", emailClient: true });
    assert.equal(r.json.syllabus.version, 1);
    assert.equal(sent.length, 1);
    assert.equal(sent[0]!.to, CLIENT);
    assert.match(sent[0]!.subject, /ready/);

    // David edits after publishing: the client keeps version 1 until he publishes again.
    const plan = r.json.syllabus.plan as PlanWeek[];
    r = await syllabus({ action: "savePlan", plan: [{ ...plan[0]!, goal: "Changed" }, ...plan.slice(1)] });
    assert.equal(r.json.syllabus.unpublishedChanges, true);
    assert.equal((await getClientSyllabus(CLIENT))!.plan![0]!.goal, "Pick your first workflow");

    r = await syllabus({ action: "toggleTask", itemId: taskId, done: true });
    assert.ok(r.json.syllabus.tasksDone[taskId]);
    r = await syllabus({ action: "toggleTask", itemId: taskId, done: false });
    assert.equal(r.json.syllabus.tasksDone[taskId], undefined, "unticking removes the key");

    setAiForTests(async <T>() =>
      ({
        summary: "Add a week on data privacy.",
        changes: [
          { op: "addWeeks", reason: "More time", itemId: "", week: 0, toWeek: 0, goal: "", count: 1, item: { kind: "task", courseId: "", slug: "", title: "", detail: "", minutes: 0 } },
          { op: "remove", reason: "Unknown", itemId: "lesson:nope/nope", week: 0, toWeek: 0, goal: "", count: 0, item: { kind: "task", courseId: "", slug: "", title: "", detail: "", minutes: 0 } },
        ],
      }) as T
    );
    r = await syllabus({ action: "suggest", instruction: "She is worried about client data privacy" });
    assert.equal(r.status, 200, JSON.stringify(r.json));
    assert.equal(r.json.suggestions.length, 1, "changes that do nothing are dropped");
    r = await syllabus({ action: "applyOps", ops: r.json.suggestions.map((s: { op: unknown }) => s.op) });
    assert.equal(r.json.syllabus.plan.length, plan.length + 1);

    r = await syllabus({ action: "publish", changeNote: "Added a week on data privacy", emailClient: false });
    assert.equal(r.json.syllabus.version, 2);
    assert.equal(r.json.versions.length, 2);
    assert.equal(sent.length, 1, "no email when unticked");
    const client = await getClientSyllabus(CLIENT);
    assert.equal(client!.plan![0]!.goal, "Changed");
    assert.equal(client!.changeNote, "Added a week on data privacy");

    const queue = await getQueue(await adminRequest(`${ORIGIN}/api/admin/coaching/syllabi`, undefined, "GET"));
    const row = (await queue.json()).clients.find((c: { email: string }) => c.email === CLIENT);
    assert.ok(["on-track", "behind", "done"].includes(row.group), row.group);
  });

  it("plans by rules from the confirmed intake when Gemini is not set up", async () => {
    await intake({ action: "save", form: { ...emptyForm("mastery"), goals: ["Automate client emails"], level: "new", focusStageIds: ["tool-mastery"], knownCourseIds: ["one-person-company"] } });
    await intake({ action: "confirm" });
    const r = await syllabus({ action: "plan", startDate: "2026-11-02" });
    assert.equal(r.status, 200, JSON.stringify(r.json));
    assert.equal(r.json.ai, aiConfigured());
    assert.equal(r.json.syllabus.source, "rules");
    assert.ok(!r.json.syllabus.courseIds.includes("one-person-company"), "known courses are left out");
    assert.ok(r.json.syllabus.plan.length > 0);

    const view = await getSyllabusRoute(await adminRequest(syllabusUrl, undefined, "GET"), params(CLIENT));
    const json = await view.json();
    assert.ok(json.courses[0].items.length > 0, "the editor gets the catalog items");
    assert.equal(json.intake.status, "confirmed");
  });

  it("says how to turn Gemini on in Google Cloud when Vertex refuses", () => {
    const saved = process.env.GCP_PROJECT_ID;
    process.env.GCP_PROJECT_ID = "apexleader-prod";
    const message = vertexSetupError({ status: 404 })!.message;
    assert.match(message, /apexleader-prod/);
    assert.match(message, /Vertex AI User/);
    assert.match(vertexSetupError(Object.assign(new Error("Permission 'aiplatform.endpoints.predict' denied"), { status: 403 }))!.message, /Google said: Permission/);
    assert.equal(vertexSetupError({ status: 500 }), null);
    assert.equal(aiConfigured(), true, "the site's own project is enough; no API key needed");
    if (!process.env.GEMINI_MODEL) assert.equal(AI_MODEL, "gemini-3.1-flash-lite");
    if (saved === undefined) delete process.env.GCP_PROJECT_ID;
    else process.env.GCP_PROJECT_ID = saved;
  });

  it("says when Drive access is missing", async () => {
    const saved = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const r = await intake({ action: "find" });
    if (saved) process.env.GOOGLE_SERVICE_ACCOUNT_KEY = saved;
    assert.equal(r.status, 409);
    assert.equal(r.json.code, "drive_access");
    assert.match(r.json.error, /Domain-wide delegation/);
  });
});
