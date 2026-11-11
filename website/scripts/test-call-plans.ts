/**
 * The written one-page plan after a discovery call: when the site looks for
 * the transcript, which doc it trusts, what the model's answer is trimmed to,
 * the email, and the cron step end to end with Google and Gemini faked out.
 *   npx tsx scripts/test-call-plans.ts
 */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Firestore } from "firebase-admin/firestore";
import { setDbForTests } from "../lib/firebase-admin";
import { setSendEmailForTests, type SendEmailOptions } from "../lib/gmail";
import { setAiForTests } from "../lib/coaching/ai";
import {
  APPLICATIONS,
  MIN_TRANSCRIPT_CHARS,
  cleanCallPlan,
  decideCallPlan,
  pickTranscript,
  processCallPlans,
  renderCallPlanEmail,
  type PendingApplication,
} from "../lib/coaching/call-plans";
import { AUTO_ARTIFACTS, conferenceDataForSpace } from "../lib/coaching/meet-space";
import { RECORDING_NOTICE, getDiscoveryEmailContent } from "../lib/coaching/discovery-content";
import type { TranscriptCandidate } from "../lib/coaching/meet-transcripts";
import { createMemoryFirestore, type MemoryFirestore } from "./fixtures/memory-firestore";

const PROSPECT = "pat@example.com";
const COACH = "hello@fromaitobusiness.com";
const CALL_AT = "2026-11-12T15:00:00.000Z";
const BOOKED_AT = "2026-11-10T12:00:00.000Z";
const H = 3_600_000;

const RAW_PLAN = {
  usable: true,
  headline: "Start with invoice follow-up",
  situation: "You run a two-person bakery and chase late invoices by hand every Friday.",
  firstJob: { title: "Chase overdue invoices", why: "It repeats weekly and nothing ships without your OK." },
  tools: [{ name: "Claude", job: "Drafts each reminder from your invoice list" }],
  steps: ["Export this month's unpaid invoices.", "Ask Claude to draft a reminder for each.", "Review and send."],
  next: ["Weekly cash summary"],
  watchOuts: ["Check the tool's terms before pasting customer details."],
  coaching: "",
};

function app(over: Partial<PendingApplication> = {}): PendingApplication {
  return { id: "a1", email: PROSPECT, name: "Pat Lee", createdAt: BOOKED_AT, discoveryCallAt: CALL_AT, ...over };
}

function candidate(over: Partial<TranscriptCandidate> = {}): TranscriptCandidate {
  return {
    docId: "doc_transcript_1",
    title: "Discovery Call - Transcript",
    url: "https://docs.google.com/document/d/doc_transcript_1/edit",
    callStart: CALL_AT,
    match: "event",
    eventSummary: "Discovery Call",
    ...over,
  };
}

let mem: MemoryFirestore;
let sent: SendEmailOptions[] = [];
let aiCalls = 0;

beforeEach(() => {
  mem = createMemoryFirestore();
  setDbForTests(mem as unknown as Firestore);
  sent = [];
  aiCalls = 0;
  setSendEmailForTests(async (opts) => {
    sent.push(opts);
    return { ok: true, messageId: "m1", threadId: "t1" };
  });
  setAiForTests(async <T,>() => {
    aiCalls++;
    return RAW_PLAN as unknown as T;
  });
  process.env.SENDER_EMAIL = COACH;
  process.env.NEXT_PUBLIC_SITE_URL = "https://fromaitobusiness.com";
  delete process.env.CALL_PLAN_MODE;
});

afterEach(() => {
  setAiForTests(undefined);
  setSendEmailForTests(undefined);
});

async function seed(over: Record<string, unknown> = {}) {
  await mem.collection(APPLICATIONS).doc("a1").set({
    email: PROSPECT,
    name: "Pat Lee",
    status: "scheduled",
    createdAt: BOOKED_AT,
    discoveryCallAt: CALL_AT,
    callPlanState: "pending",
    ...over,
  });
}
const row = async () => (await mem.collection(APPLICATIONS).doc("a1").get()).data() as Record<string, unknown>;
const longTranscript = "Pat: we chase invoices by hand every Friday. ".repeat(60);
const deps = (text = longTranscript, cands = [candidate()]) => ({
  findCandidates: async () => cands,
  readDoc: async () => ({ title: "t", text, url: "https://docs.google.com/document/d/x/edit" }),
});

describe("when to look for the transcript", () => {
  const call = Date.parse(CALL_AT);
  it("waits until the call is over and Google has had time to write it", () => {
    assert.equal(decideCallPlan(app(), call - H), "wait");
    assert.equal(decideCallPlan(app(), call + 0.5 * H), "wait");
    assert.equal(decideCallPlan(app(), call + H), "look");
  });
  it("does not ask Google again within 25 minutes", () => {
    const checked = new Date(call + H).toISOString();
    assert.equal(decideCallPlan(app({ callPlanCheckedAt: checked }), call + H + 10 * 60_000), "wait");
    assert.equal(decideCallPlan(app({ callPlanCheckedAt: checked }), call + 2 * H), "look");
  });
  it("gives up after two weeks, on a cancelled call, or a bad date", () => {
    assert.equal(decideCallPlan(app(), call + 15 * 24 * H), "give_up");
    assert.equal(decideCallPlan(app({ status: "cancelled" }), call + H), "give_up");
    assert.equal(decideCallPlan(app({ discoveryCallAt: "soon" }), call + H), "give_up");
  });
});

describe("which doc is trusted", () => {
  it("only docs tied to the prospect's own call, never the recent-docs guesses", () => {
    assert.equal(pickTranscript([candidate({ match: "recent" })], app()), null);
    assert.equal(pickTranscript([candidate({ match: "folder-time" })], app())?.docId, "doc_transcript_1");
  });
  it("ignores a call from before this booking", () => {
    assert.equal(pickTranscript([candidate({ callStart: "2026-10-01T15:00:00.000Z" })], app()), null);
  });
  it("prefers the transcript doc over the notes doc, and the newest call", () => {
    const notes = candidate({ docId: "notes", title: "Discovery Call - Notes by Gemini" });
    assert.equal(pickTranscript([notes, candidate()], app())?.docId, "doc_transcript_1");
    const later = candidate({ docId: "later", callStart: "2026-11-13T15:00:00.000Z" });
    assert.equal(pickTranscript([candidate(), later], app())?.docId, "later");
  });
});

describe("the plan is kept to one page", () => {
  it("trims lists and long text", () => {
    const plan = cleanCallPlan({
      ...RAW_PLAN,
      steps: Array.from({ length: 12 }, (_, i) => `Step ${i} ${"x".repeat(400)}`),
      tools: Array.from({ length: 9 }, (_, i) => ({ name: `Tool ${i}`, job: "does a job" })),
    })!;
    assert.equal(plan.steps.length, 6);
    assert.ok(plan.steps.every((s) => s.length <= 220));
    assert.equal(plan.tools.length, 4);
  });
  it("is no plan when the model says the call was not usable, or left it empty", () => {
    assert.equal(cleanCallPlan({ ...RAW_PLAN, usable: false }), null);
    assert.equal(cleanCallPlan({ ...RAW_PLAN, steps: ["one"] }), null);
    assert.equal(cleanCallPlan({ ...RAW_PLAN, headline: "" }), null);
  });
});

describe("the email", () => {
  it("carries every part of the plan, escaped, in html and text", () => {
    const plan = cleanCallPlan({ ...RAW_PLAN, headline: "Start with <invoices>" })!;
    const mail = renderCallPlanEmail(plan, { name: "Pat Lee" });
    assert.match(mail.subject, /^Your one-page AI plan: /);
    assert.ok(mail.html.includes("Start with &lt;invoices&gt;"));
    assert.ok(!mail.html.includes("<invoices>"));
    for (const part of ["Hi Pat,", "Chase overdue invoices", "Export this month", "Weekly cash summary", "nothing here is a guarantee"]) {
      assert.ok(mail.text.includes(part), `text has ${part}`);
    }
    assert.ok(mail.html.includes("Claude"));
  });
  it("the review copy says it was not sent", () => {
    const mail = renderCallPlanEmail(cleanCallPlan(RAW_PLAN)!, { name: "Pat Lee", reviewOnly: true });
    assert.match(mail.subject, /^Plan to review for Pat Lee/);
    assert.ok(mail.text.includes("has not been sent to them"));
  });
});

describe("the cron step", () => {
  const after = new Date(Date.parse(CALL_AT) + H);

  it("sends the plan to the prospect, a copy to David, and saves it", async () => {
    await seed();
    const run = await processCallPlans({ now: after, deps: deps() });
    assert.equal(run.sent, 1);
    assert.deepEqual(sent.map((m) => m.to), [PROSPECT, COACH]);
    assert.equal(sent[0].log.source, "coaching_call_plan");
    assert.match(sent[1].subject, /^Sent to Pat Lee/);
    const saved = await row();
    assert.equal(saved.callPlanState, "sent");
    assert.equal((saved.callPlan as { headline: string }).headline, "Start with invoice follow-up");
    assert.equal(saved.callPlanDocId, "doc_transcript_1");
  });

  it("never sends twice", async () => {
    await seed();
    await processCallPlans({ now: after, deps: deps() });
    const again = await processCallPlans({ now: new Date(after.getTime() + H), deps: deps() });
    assert.equal(again.sent, 0);
    assert.equal(sent.length, 2);
    assert.equal(aiCalls, 1);
  });

  it("does nothing before the call, and nothing for bookings made before this feature", async () => {
    await seed();
    await mem.collection(APPLICATIONS).doc("old").set({ email: "old@example.com", discoveryCallAt: CALL_AT, status: "scheduled" });
    const run = await processCallPlans({ now: new Date(Date.parse(CALL_AT) - H), deps: deps() });
    assert.equal(run.checked, 0);
    assert.equal(sent.length, 0);
    const later = await processCallPlans({ now: after, deps: deps() });
    assert.equal(later.sent, 1);
    assert.ok(!sent.some((m) => m.to === "old@example.com"));
  });

  it("waits when there is no transcript yet or it is too short to be a real call", async () => {
    await seed();
    const none = await processCallPlans({ now: after, deps: deps(longTranscript, []) });
    assert.equal(none.waiting, 1);
    await mem.collection(APPLICATIONS).doc("a1").set({ callPlanCheckedAt: null }, { merge: true });
    const short = await processCallPlans({ now: after, deps: deps("x".repeat(MIN_TRANSCRIPT_CHARS - 1)) });
    assert.equal(short.waiting, 1);
    assert.equal(sent.length, 0);
    assert.equal(aiCalls, 0);
    assert.equal((await row()).callPlanState, "pending");
  });

  it("tells David once when a day passes with no transcript, and still sends if one turns up", async () => {
    await seed();
    const nextDay = new Date(Date.parse(CALL_AT) + 26 * H);
    const first = await processCallPlans({ now: nextDay, deps: deps(longTranscript, []) });
    assert.equal(first.alerted, 1);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].to, COACH);
    assert.match(sent[0].subject, /No transcript for Pat Lee/);
    const second = await processCallPlans({ now: new Date(nextDay.getTime() + H), deps: deps(longTranscript, []) });
    assert.equal(second.alerted, 0);
    assert.equal(sent.length, 1);
    const found = await processCallPlans({ now: new Date(nextDay.getTime() + 2 * H), deps: deps() });
    assert.equal(found.sent, 1);
  });

  it("closes the row without an email when the call was a no-show", async () => {
    await seed();
    setAiForTests(async <T,>() => ({ ...RAW_PLAN, usable: false }) as unknown as T);
    const run = await processCallPlans({ now: after, deps: deps() });
    assert.equal(run.closed, 1);
    assert.equal(sent.length, 0);
    assert.equal((await row()).callPlanState, "skipped");
  });

  it("review mode sends the plan to David only", async () => {
    await seed();
    process.env.CALL_PLAN_MODE = "review";
    const run = await processCallPlans({ now: after, deps: deps() });
    assert.equal(run.review, 1);
    assert.deepEqual(sent.map((m) => m.to), [COACH]);
    assert.equal((await row()).callPlanState, "review");
  });

  it("hands the plan to David when the prospect's email can't be sent", async () => {
    await seed();
    setSendEmailForTests(async (opts) => {
      sent.push(opts);
      return opts.to === PROSPECT ? { ok: false, error: "suppressed" } : { ok: true };
    });
    const run = await processCallPlans({ now: after, deps: deps() });
    assert.equal(run.review, 1);
    assert.match(sent[1].subject, /^Plan to review/);
    const saved = await row();
    assert.equal(saved.callPlanState, "review");
    assert.equal(saved.callPlanError, "suppressed");
  });

  it("a Google or Gemini error leaves the row pending for the next run", async () => {
    await seed();
    const run = await processCallPlans({
      now: after,
      deps: { findCandidates: async () => { throw new Error("drive down"); }, readDoc: deps().readDoc },
    });
    assert.equal(run.errors, 1);
    const saved = await row();
    assert.equal(saved.callPlanState, "pending");
    assert.equal(saved.callPlanError, "drive down");
  });
});

describe("recording", () => {
  it("the Meet room is asked to record, transcribe and take notes", () => {
    assert.equal(AUTO_ARTIFACTS.recordingConfig.autoRecordingGeneration, "ON");
    assert.equal(AUTO_ARTIFACTS.transcriptionConfig.autoTranscriptionGeneration, "ON");
    assert.equal(AUTO_ARTIFACTS.smartNotesConfig.autoSmartNotesGeneration, "ON");
  });
  it("the calendar event points at that room", () => {
    const data = conferenceDataForSpace({ name: "spaces/x", meetingCode: "abc-defg-hij", meetingUri: "https://meet.google.com/abc-defg-hij" });
    assert.equal(data.conferenceId, "abc-defg-hij");
    assert.equal(data.entryPoints?.[0].uri, "https://meet.google.com/abc-defg-hij");
    assert.equal(data.conferenceSolution?.key?.type, "hangoutsMeet");
  });
  it("the confirmation email tells the prospect the call is recorded and how to opt out", () => {
    const mail = getDiscoveryEmailContent({
      name: "Pat",
      packageContext: { id: null, name: "", priceDisplay: "", durationWeeks: 0, sessionCount: 0, summaryLine: "" } as never,
      start: new Date(CALL_AT),
      prepUrl: "https://fromaitobusiness.com/coaching/discovery-prep",
    });
    assert.ok(mail.html.includes(RECORDING_NOTICE));
    assert.ok(mail.text.includes(RECORDING_NOTICE));
    assert.match(RECORDING_NOTICE, /recorded/);
    assert.match(RECORDING_NOTICE, /rather it wasn't recorded/);
  });
});
