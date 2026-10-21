import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Firestore } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { setDbForTests } from "../lib/firebase-admin";
import { sendEmail, setSendEmailForTests, type SendEmailOptions } from "../lib/gmail";
import { COOKIE_NAME, createAdminSession } from "../lib/auth/admin-session-cookie";
import {
  buildInstallmentSchedule,
  markInstallmentPaid,
  rebuildCryptoSchedule,
  scheduleDueItems,
  scheduleUpcomingItems,
} from "../lib/coaching/payments";
import { logCryptoPayment } from "../lib/coaching/crypto-notices";
import {
  countUsedSessions,
  mergeCalendarEvents,
  planSessionFromEvent,
  recountClientSessions,
  syncCoachingCalendar,
  type CoachEvent,
  type SyncedSession,
} from "../lib/coaching/session-sync";
import { recordingFromAttachments } from "../lib/coaching/meet-recordings";
import { coachReadCalendarIds } from "../lib/coaching/coach-calendars";
import { bodiesFromPayload, getSentEmail, setGmailFetchForTests } from "../lib/crm/email-view";
import { buildPersonTimeline } from "../lib/crm/timeline";
import { POST as addToPipeline } from "../app/api/admin/coaching/route";
import { POST as changePlan } from "../app/api/admin/contacts/[email]/payment-plan/route";
import { createMemoryFirestore, rows, type MemoryFirestore } from "./fixtures/memory-firestore";

const COACH = "hello@defiuniversity.xyz";
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
  process.env.JWT_SECRET = "test-coaching-delivery";
  process.env.NEXT_PUBLIC_SITE_URL = "https://defiuniversity.xyz";
  process.env.SENDER_EMAIL = COACH;
});

afterEach(() => {
  setDbForTests(undefined);
  setSendEmailForTests(undefined);
  setGmailFetchForTests(undefined);
});

async function adminRequest(url: string, body: unknown): Promise<NextRequest> {
  const token = await createAdminSession("david");
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: `${COOKIE_NAME}=${token}`,
      authorization: `Bearer ${token}`,
      origin: "https://defiuniversity.xyz",
    },
    body: JSON.stringify(body),
  });
}

describe("Payments due: upcoming installments", () => {
  const schedule = () =>
    markInstallmentPaid(
      buildInstallmentSchedule({
        email: CLIENT,
        name: "Ada",
        packageId: "mastery",
        packageName: "Operator",
        planId: "3pay",
        installments: 3,
        perPayment: 83400,
        startDate: "2026-10-20",
        nowIso: "2026-10-20T12:00:00.000Z",
      }),
      { paidAt: "2026-10-20T16:00:00.000Z", paymentId: "p1" }
    ).schedule;

  it("shows the next installment a month out, which the 7-day list hides", () => {
    const list = [{ id: "s1", schedule: schedule() }];
    assert.equal(scheduleDueItems(list, "2026-10-21").length, 0, "the due list stays at 7 days");
    const upcoming = scheduleUpcomingItems(list, "2026-10-21");
    assert.equal(upcoming.length, 1);
    assert.equal(upcoming[0]?.installmentNumber, 2);
    assert.equal(upcoming[0]?.dueDate, "2026-11-20");
    assert.equal(upcoming[0]?.status, "upcoming");
  });

  it("does not repeat an installment that is already in the due list", () => {
    const list = [{ id: "s1", schedule: schedule() }];
    assert.equal(scheduleDueItems(list, "2026-11-15").length, 1);
    assert.equal(scheduleUpcomingItems(list, "2026-11-15").length, 0);
  });
});

describe("Change plan rebuilds the schedule", () => {
  it("turns a payment logged as paid in full into installment 1 of 3", async () => {
    const logged = await logCryptoPayment(
      {
        email: CLIENT,
        name: "Ada",
        amountUsd: 834,
        asset: "USDC",
        network: "evm",
        paidAt: "2026-10-20",
        packageId: "mastery",
        planId: "full",
        idempotencyKey: "k1",
      },
      "david"
    );
    assert.equal(logged.ok, true);
    assert.equal(rows(mem.store, "payment_schedules").length, 0, "a full plan makes no schedule");

    const res = await changePlan(
      await adminRequest(`http://localhost/api/admin/contacts/${encodeURIComponent(CLIENT)}/payment-plan`, {
        packageId: "mastery",
        planId: "3pay",
      }),
      { params: Promise.resolve({ email: encodeURIComponent(CLIENT) }) }
    );
    assert.equal(res.status, 200);
    const schedules = rows(mem.store, "payment_schedules");
    assert.equal(schedules.length, 1);
    const installments = schedules[0]![1].installments as Array<{ number: number; paidAt: string | null; dueDate: string }>;
    assert.equal(installments.length, 3);
    assert.ok(installments[0]!.paidAt);
    assert.equal(installments[1]!.paidAt, null);
    assert.equal(installments[1]!.dueDate, "2026-11-20");
    const payment = rows(mem.store, "client_payments")[0]![1];
    assert.equal(payment.planId, "3pay");
    assert.equal(payment.installmentNumber, 1);

    const direct = await rebuildCryptoSchedule(mem as unknown as Firestore, {
      email: CLIENT,
      packageId: "mastery",
      planId: "full",
      installments: 1,
      perPayment: 250000,
    });
    assert.equal(direct.schedule, null);
    assert.equal(rows(mem.store, "payment_schedules").length, 0, "back to full removes the schedule");
  });
});

describe("Add client to the pipeline", () => {
  it("creates one card per person and returns the open card on a repeat", async () => {
    const first = await addToPipeline(
      await adminRequest("http://localhost/api/admin/coaching", {
        email: "New@Example.com",
        name: "New Person",
        packageId: "mastery",
        status: "qualified",
      })
    );
    const firstBody = (await first.json()) as { id: string; existing: boolean };
    assert.equal(first.status, 200);
    assert.equal(firstBody.existing, false);
    const card = rows(mem.store, "coaching_applications")[0]![1];
    assert.equal(card.email, "new@example.com");
    assert.equal(card.status, "qualified");
    assert.equal(card.source, "manual");

    const again = await addToPipeline(
      await adminRequest("http://localhost/api/admin/coaching", { email: "new@example.com", status: "won" })
    );
    const againBody = (await again.json()) as { id: string; existing: boolean };
    assert.equal(againBody.existing, true);
    assert.equal(againBody.id, firstBody.id);
    assert.equal(rows(mem.store, "coaching_applications").length, 1);

    const bad = await addToPipeline(await adminRequest("http://localhost/api/admin/coaching", { email: "nope" }));
    assert.equal(bad.status, 400);
  });

  it("never adds a card straight to won", async () => {
    await addToPipeline(await adminRequest("http://localhost/api/admin/coaching", { email: "w@example.com", status: "won" }));
    assert.equal(rows(mem.store, "coaching_applications")[0]![1].status, "new");
  });
});

function event(overrides: Partial<CoachEvent> = {}): CoachEvent {
  return {
    id: "evt1",
    status: "confirmed",
    summary: "Coaching session: Ada",
    start: "2026-10-22T15:00:00.000Z",
    end: "2026-10-22T16:00:00.000Z",
    attendees: [
      { email: COACH, responseStatus: "accepted" },
      { email: CLIENT, responseStatus: "accepted" },
    ],
    meetUrl: "https://meet.google.com/abc-defg-hij",
    attachments: [],
    ...overrides,
  };
}

const NOW = Date.parse("2026-10-20T12:00:00.000Z");

describe("Sessions from calendar events", () => {
  it("creates a scheduled session for a client event", () => {
    const plan = planSessionFromEvent(event(), null, CLIENT, NOW);
    assert.equal(plan.kind, "create");
    if (plan.kind !== "create") return;
    assert.equal(plan.id, "cal_evt1");
    assert.equal(plan.doc.status, "scheduled");
    assert.equal(plan.doc.durationMins, 60);
  });

  it("skips discovery calls, short events and declined invites", () => {
    assert.equal(planSessionFromEvent(event({ summary: "Operator Coaching Discovery Call — Ada" }), null, CLIENT, NOW).kind, "none");
    assert.equal(planSessionFromEvent(event({ end: "2026-10-22T15:15:00.000Z" }), null, CLIENT, NOW).kind, "none");
    assert.equal(
      planSessionFromEvent(event({ attendees: [{ email: CLIENT, responseStatus: "declined" }] }), null, CLIENT, NOW).kind,
      "none"
    );
  });

  const existing = (over: Partial<SyncedSession> = {}): SyncedSession => ({
    id: "cal_evt1",
    clientId: CLIENT,
    scheduledAt: "2026-10-22T15:00:00.000Z",
    durationMins: 60,
    status: "scheduled",
    calendarEventId: "evt1",
    statusSource: "calendar",
    title: "Coaching session: Ada",
    meetUrl: "https://meet.google.com/abc-defg-hij",
    ...over,
  });

  it("moves, cancels and completes with the event", () => {
    const moved = planSessionFromEvent(
      event({ start: "2026-10-23T15:00:00.000Z", end: "2026-10-23T16:00:00.000Z" }),
      existing(),
      CLIENT,
      NOW
    );
    assert.equal(moved.kind, "update");
    if (moved.kind === "update") assert.equal(moved.patch.scheduledAt, "2026-10-23T15:00:00.000Z");

    const early = planSessionFromEvent(event({ status: "cancelled" }), existing(), CLIENT, NOW);
    assert.equal(early.kind === "update" && early.patch.status, "cancelled");
    assert.equal(early.kind === "update" && early.patch.lateCancel, false, "two days ahead is not late");

    const late = planSessionFromEvent(event({ status: "cancelled" }), existing(), CLIENT, Date.parse("2026-10-22T10:00:00.000Z"));
    assert.equal(late.kind === "update" && late.patch.lateCancel, true);

    const done = planSessionFromEvent(event(), existing(), CLIENT, Date.parse("2026-10-22T17:00:00.000Z"));
    assert.equal(done.kind === "update" && done.patch.status, "completed");
  });

  it("leaves a status David set by hand, and ignored sessions entirely", () => {
    const noShow = planSessionFromEvent(
      event(),
      existing({ status: "no-show", statusSource: "admin" }),
      CLIENT,
      Date.parse("2026-10-22T17:00:00.000Z")
    );
    assert.equal(noShow.kind, "none");
    assert.equal(planSessionFromEvent(event({ status: "cancelled" }), existing({ ignored: true }), CLIENT, NOW).kind, "none");
  });

  it("counts booked, completed and no-show sessions and late cancellations only", () => {
    assert.equal(
      countUsedSessions([
        { status: "scheduled" },
        { status: "completed" },
        { status: "no-show" },
        { status: "cancelled", lateCancel: false },
        { status: "cancelled", lateCancel: true },
        { status: "completed", ignored: true },
      ]),
      4
    );
  });
});

describe("Calendar sync", () => {
  async function seedClient() {
    await mem.collection("client_records").doc(CLIENT).set({ email: CLIENT, name: "Ada Client", sessionsTotal: 6, sessionsRemaining: 6 });
    await mem.collection("client_records").doc(COACH).set({ email: COACH, fullAccess: true });
  }

  it("writes sessions, updates the count, and adds the recording once", async () => {
    await seedClient();
    const events = [
      event(),
      event({ id: "evt0", start: "2026-10-19T15:00:00.000Z", end: "2026-10-19T16:00:00.000Z" }),
      event({ id: "other", attendees: [{ email: "stranger@example.com", responseStatus: "accepted" }] }),
    ];
    const published: string[] = [];
    const opts = {
      now: new Date(NOW),
      listEvents: async () => events,
      findRecording: async ({ event: e }: { event: CoachEvent }) => (e.id === "evt0" ? { fileId: "drive123", title: "rec" } : null),
      publishRecording: async ({ session, sessionNumber }: { session: SyncedSession; sessionNumber: number }) => {
        published.push(`${session.id}#${sessionNumber}`);
        return `rec_${session.id}`;
      },
    };
    const first = await syncCoachingCalendar(opts);
    assert.equal(first.created, 2);
    assert.equal(first.recordings, 1);
    assert.deepEqual(published, ["cal_evt0#1"]);
    const sessions = rows(mem.store, "coaching_sessions");
    assert.equal(sessions.length, 2, "the stranger's event is not a session");
    assert.equal(mem.store.get("coaching_sessions/cal_evt0")?.status, "completed");
    assert.equal(mem.store.get("client_records/" + CLIENT)?.sessionsRemaining, 4);

    const second = await syncCoachingCalendar(opts);
    assert.equal(second.created, 0);
    assert.equal(second.recordings, 0, "a recording is added once");

    events[0] = event({ status: "cancelled" });
    const third = await syncCoachingCalendar(opts);
    assert.equal(third.updated, 1);
    assert.equal(mem.store.get("coaching_sessions/cal_evt1")?.status, "cancelled");
    assert.equal(mem.store.get("client_records/" + CLIENT)?.sessionsRemaining, 5, "an early cancel gives the session back");
  });

  it("recount leaves clients without a session total alone", async () => {
    await mem.collection("client_records").doc("x@example.com").set({ email: "x@example.com" });
    assert.equal(await recountClientSessions(mem as unknown as Firestore, "x@example.com"), null);
  });

  it("finds a Meet recording attached to the event", () => {
    assert.deepEqual(
      recordingFromAttachments(
        event({
          attachments: [
            { fileId: "doc1", title: "Notes by Gemini", mimeType: "application/vnd.google-apps.document", fileUrl: "" },
            { fileId: "vid1", title: "Coaching session - Recording", mimeType: "video/mp4", fileUrl: "" },
          ],
        })
      ),
      { fileId: "vid1", title: "Coaching session - Recording" }
    );
  });
});

describe("Sent email viewer", () => {
  it("keeps the body of each sent email and links the timeline to it", async () => {
    const result = await sendEmail({
      to: CLIENT,
      subject: "Your payment reminder",
      html: "<p>Hi Ada, installment 2 is due.</p>",
      text: "Hi Ada, installment 2 is due.",
      allowManualOnlyContact: true,
      log: { source: "admin_1to1" },
    });
    assert.equal(result.ok, true);
    const [logId] = rows(mem.store, "emailLog")[0]!;
    const id = logId.split("/")[1]!;
    const view = await getSentEmail(id);
    assert.equal(view?.bodyFrom, "stored");
    assert.equal(view?.html, "<p>Hi Ada, installment 2 is due.</p>");

    const timeline = buildPersonTimeline({
      emailLog: [{ id, subject: "Your payment reminder", sentAt: "2026-10-20T12:00:00.000Z", status: "sent" }],
    });
    assert.equal(timeline[0]?.meta?.emailLogId, id);
  });

  it("reads older emails back from Gmail, or says the scope is missing", async () => {
    await mem.collection("emailLog").doc("old1").set({ to: CLIENT, subject: "Old", status: "sent", messageId: "gm1", sentAt: "2026-09-01T00:00:00.000Z" });
    setGmailFetchForTests(async () => ({ html: "<p>old body</p>", text: "old body" }));
    const fetched = await getSentEmail("old1");
    assert.equal(fetched?.bodyFrom, "gmail");
    assert.equal(fetched?.html, "<p>old body</p>");
    assert.ok(mem.store.get("email_bodies/old1"), "saved after the first fetch");

    await mem.collection("emailLog").doc("old2").set({ to: CLIENT, subject: "Old 2", status: "sent", messageId: "gm2" });
    setGmailFetchForTests(async () => {
      throw new Error("unauthorized_client: Client is unauthorized to retrieve access tokens");
    });
    assert.equal((await getSentEmail("old2"))?.bodyFrom, "gmail_access_needed");
    assert.equal(await getSentEmail("../bad"), null);
  });

  it("pulls html and text out of a multipart Gmail payload", () => {
    const enc = (s: string) => Buffer.from(s).toString("base64url");
    const out = bodiesFromPayload({
      mimeType: "multipart/alternative",
      parts: [
        { mimeType: "text/plain", body: { data: enc("plain") } },
        { mimeType: "text/html", body: { data: enc("<b>html</b>") } },
      ],
    });
    assert.deepEqual(out, { html: "<b>html</b>", text: "plain" });
  });
});

describe("coach calendars", () => {
  const saved = { write: process.env.COACH_CALENDAR_ID, read: process.env.COACH_READ_CALENDAR_IDS };
  afterEach(() => {
    if (saved.write === undefined) delete process.env.COACH_CALENDAR_ID;
    else process.env.COACH_CALENDAR_ID = saved.write;
    if (saved.read === undefined) delete process.env.COACH_READ_CALENDAR_IDS;
    else process.env.COACH_READ_CALENDAR_IDS = saved.read;
  });

  it("reads hello@'s primary calendar plus the booking calendar", () => {
    delete process.env.COACH_READ_CALENDAR_IDS;
    process.env.COACH_CALENDAR_ID = "group123@group.calendar.google.com";
    assert.deepEqual(coachReadCalendarIds(), ["hello@defiuniversity.xyz", "group123@group.calendar.google.com"]);
    delete process.env.COACH_CALENDAR_ID;
    assert.deepEqual(coachReadCalendarIds(), ["hello@defiuniversity.xyz"]);
    process.env.COACH_READ_CALENDAR_IDS = " a@x.com, b@x.com ,a@x.com,";
    assert.deepEqual(coachReadCalendarIds(), ["a@x.com", "b@x.com"]);
  });

  it("merges events found on two calendars, a live copy beating a cancelled one", () => {
    const merged = mergeCalendarEvents([
      [event({ status: "cancelled" }), event({ id: "evt2" })],
      [event(), event({ id: "evt3" })],
    ]);
    assert.deepEqual(merged.map((e) => `${e.id}:${e.status}`).sort(), ["evt1:confirmed", "evt2:confirmed", "evt3:confirmed"]);
  });
});
