import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Firestore } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { setDbForTests } from "../lib/firebase-admin";
import { setSendEmailForTests, type SendEmailOptions } from "../lib/gmail";
import { COOKIE_NAME, createAdminSession } from "../lib/auth/admin-session-cookie";
import {
  BUFFER_MS,
  filterFreeSlots,
  fitsBusinessHours,
  generateCandidateSlots,
  holdBlockIds,
  normalizeDurationMins,
  overlapsBusy,
} from "../lib/coaching/availability";
import {
  SLOT_TAKEN_MESSAGE,
  bookingErrorStatus,
  checkSlotFree,
  fetchBusyIntervals,
  withSlotHold,
} from "../lib/coaching/calendar";
import { DELETE as cancelRoute, PATCH as moveRoute } from "../app/api/coaching/calendar/[eventId]/route";
import { createMemoryFirestore, type MemoryFirestore } from "./fixtures/memory-firestore";

const COACH = "hello@defiuniversity.xyz";
const GROUP = "group123@group.calendar.google.com";
const TZ = "America/New_York";

let mem: MemoryFirestore;
let sent: SendEmailOptions[] = [];
const savedEnv = { write: process.env.COACH_CALENDAR_ID, read: process.env.COACH_READ_CALENDAR_IDS };

beforeEach(() => {
  mem = createMemoryFirestore();
  setDbForTests(mem as unknown as Firestore);
  sent = [];
  setSendEmailForTests(async (opts) => {
    sent.push(opts);
    return { ok: true, messageId: "m1", threadId: "t1" };
  });
  process.env.JWT_SECRET = "test-coaching-availability";
  process.env.NEXT_PUBLIC_SITE_URL = "https://defiuniversity.xyz";
  process.env.SENDER_EMAIL = COACH;
  process.env.COACH_CALENDAR_ID = GROUP;
  delete process.env.COACH_READ_CALENDAR_IDS;
});

afterEach(() => {
  setDbForTests(undefined);
  setSendEmailForTests(undefined);
  if (savedEnv.write === undefined) delete process.env.COACH_CALENDAR_ID;
  else process.env.COACH_CALENDAR_ID = savedEnv.write;
  if (savedEnv.read === undefined) delete process.env.COACH_READ_CALENDAR_IDS;
  else process.env.COACH_READ_CALENDAR_IDS = savedEnv.read;
});

type FreeBusyCalendars = Record<string, { busy?: { start: string; end: string }[]; errors?: { reason: string }[] }>;

/** A stand-in for calendar.freebusy that records which calendars were asked. */
function fakeFreebusy(calendars: FreeBusyCalendars | Error) {
  const asked: string[][] = [];
  const client = {
    freebusy: {
      query: async (params: { requestBody: { items: { id: string }[] } }) => {
        asked.push(params.requestBody.items.map((i) => i.id));
        if (calendars instanceof Error) throw calendars;
        return { data: { calendars } };
      },
    },
  };
  return { client: client as unknown as Parameters<typeof fetchBusyIntervals>[0], asked };
}

// Wed Nov 4 2026, Eastern (UTC-5 after the Nov 1 clock change).
const at = (hhmm: string, day = "2026-11-04", offset = "-05:00") => new Date(`${day}T${hhmm}:00${offset}`);
const NOW = new Date("2026-10-28T12:00:00Z");

describe("slot rules", () => {
  it("drops slots that touch a busy block or its 30-minute buffer", () => {
    const candidates = generateCandidateSlots(at("09:00"), at("18:00"), 30, NOW, TZ);
    assert.equal(candidates.length, 18);
    const busy = [{ start: at("10:30").toISOString(), end: at("11:30").toISOString() }];
    const free = filterFreeSlots(candidates, busy).map((s) => new Date(s.start).toISOString());
    // 10:00, 10:30, 11:00 and 11:30 are hidden; 9:30 ends at 10:00, which is exactly the buffer edge.
    assert.ok(free.includes(at("09:30").toISOString()));
    for (const t of ["10:00", "10:30", "11:00", "11:30"]) assert.ok(!free.includes(at(t).toISOString()), t);
    assert.ok(free.includes(at("12:00").toISOString()));
  });

  it("checks the whole length of a 60-minute session", () => {
    const busy = [{ start: at("14:30").toISOString(), end: at("15:00").toISOString() }];
    assert.equal(overlapsBusy(at("13:00"), at("14:00"), busy, 0), false);
    assert.equal(overlapsBusy(at("14:00"), at("15:00"), busy, 0), true);
    assert.equal(overlapsBusy(at("13:30"), at("14:30"), busy, 0), false);
    assert.equal(overlapsBusy(at("13:30"), at("14:30"), busy, BUFFER_MS), true);
  });

  it("keeps the whole call inside 9am to 6pm on a weekday", () => {
    assert.equal(fitsBusinessHours(at("17:30"), at("18:00"), TZ), true);
    assert.equal(fitsBusinessHours(at("17:30"), at("18:30"), TZ), false);
    assert.equal(fitsBusinessHours(at("08:30"), at("09:00"), TZ), false);
    assert.equal(fitsBusinessHours(at("10:00", "2026-11-07"), at("10:30", "2026-11-07"), TZ), false);
    const sixty = generateCandidateSlots(at("09:00"), at("18:00"), 60, NOW, TZ);
    assert.equal(sixty.at(-1)?.start, at("17:00").toISOString());
  });

  it("follows the daylight saving change", () => {
    // Fri Oct 30 is still EDT (UTC-4): 9am Eastern is 13:00 UTC.
    const before = generateCandidateSlots(new Date("2026-10-30T04:00:00Z"), new Date("2026-10-31T04:00:00Z"), 30, new Date("2026-10-28T00:00:00Z"), TZ);
    assert.equal(before[0].start, "2026-10-30T13:00:00.000Z");
    // Mon Nov 2 is EST (UTC-5): 9am Eastern is 14:00 UTC.
    const after = generateCandidateSlots(new Date("2026-11-02T05:00:00Z"), new Date("2026-11-03T05:00:00Z"), 30, new Date("2026-10-31T00:00:00Z"), TZ);
    assert.equal(after[0].start, "2026-11-02T14:00:00.000Z");
  });

  it("only accepts sensible call lengths", () => {
    assert.equal(normalizeDurationMins("60", 30), 60);
    assert.equal(normalizeDurationMins(600, 30), 30);
    assert.equal(normalizeDurationMins(undefined, 30), 30);
  });

  it("holds every 30-minute block a call covers", () => {
    assert.deepEqual(holdBlockIds(at("14:00"), at("15:00")), [at("14:00").toISOString(), at("14:30").toISOString()]);
  });

  it("maps booking failures to HTTP statuses", () => {
    assert.equal(bookingErrorStatus("slot_taken"), 409);
    assert.equal(bookingErrorStatus("calendar_unavailable"), 503);
    assert.equal(bookingErrorStatus(undefined), 400);
  });
});

describe("free/busy across calendars", () => {
  it("asks hello@'s primary calendar and the bookings calendar, and merges their busy time", async () => {
    const { client, asked } = fakeFreebusy({
      [COACH]: { busy: [{ start: at("10:00").toISOString(), end: at("11:00").toISOString() }] },
      [GROUP]: { busy: [{ start: at("15:00").toISOString(), end: at("15:30").toISOString() }] },
    });
    const busy = await fetchBusyIntervals(client, at("09:00"), at("18:00"));
    assert.deepEqual(asked, [[COACH, GROUP]]);
    assert.equal(busy.length, 2);
  });

  it("uses COACH_READ_CALENDAR_IDS when it is set", async () => {
    process.env.COACH_READ_CALENDAR_IDS = `${COACH}, david@thenode.pro`;
    const { client, asked } = fakeFreebusy({ [COACH]: { busy: [] }, "david@thenode.pro": { busy: [] } });
    await fetchBusyIntervals(client, at("09:00"), at("18:00"));
    assert.deepEqual(asked, [[COACH, "david@thenode.pro"]]);
  });

  it("fails the whole check when Google can't read one calendar", async () => {
    const { client } = fakeFreebusy({ [COACH]: { busy: [] }, [GROUP]: { errors: [{ reason: "notFound" }] } });
    await assert.rejects(fetchBusyIntervals(client, at("09:00"), at("18:00")), /notFound/);
  });
});

describe("booking-time check", () => {
  it("refuses a time that became busy after the page loaded", async () => {
    const { client } = fakeFreebusy({
      [COACH]: { busy: [{ start: at("14:00").toISOString(), end: at("14:30").toISOString() }] },
      [GROUP]: { busy: [] },
    });
    const result = await checkSlotFree(client, at("14:00"), at("14:30"));
    assert.deepEqual(result, { ok: false, code: "slot_taken", error: SLOT_TAKEN_MESSAGE });
    const clear = await checkSlotFree(client, at("16:00"), at("16:30"));
    assert.deepEqual(clear, { ok: true });
  });

  it("ignores the event's own time when rescheduling", async () => {
    const own = { start: at("14:00").toISOString(), end: at("14:30").toISOString() };
    const { client } = fakeFreebusy({ [COACH]: { busy: [] }, [GROUP]: { busy: [own] } });
    assert.deepEqual(await checkSlotFree(client, at("14:30"), at("15:00"), own), { ok: true });
  });

  it("fails closed and emails hello@ once an hour when Google is down", async () => {
    const { client } = fakeFreebusy(new Error("socket hang up"));
    const first = await checkSlotFree(client, at("14:00"), at("14:30"));
    const second = await checkSlotFree(client, at("15:00"), at("15:30"));
    assert.equal(first.ok, false);
    assert.equal(!first.ok && first.code, "calendar_unavailable");
    assert.equal(second.ok, false);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].to, COACH);
  });

  it("lets only one of two simultaneous bookings hold a slot", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => (release = r));
    const first = withSlotHold(at("14:00"), at("15:00"), async () => {
      await gate;
      return { ok: true };
    });
    // Overlaps the first call's 14:30 block.
    const second = await withSlotHold(at("14:30"), at("15:00"), async () => ({ ok: true }));
    assert.deepEqual(second, { ok: false, code: "slot_taken", error: SLOT_TAKEN_MESSAGE });
    release();
    assert.deepEqual(await first, { ok: true });
    // Released afterwards, so the time can be booked again.
    const third = await withSlotHold(at("14:30"), at("15:00"), async () => ({ ok: true }));
    assert.deepEqual(third, { ok: true });
  });
});

describe("cancel and move routes", () => {
  const params = { params: Promise.resolve({ eventId: "evt1" }) };

  it("refuse visitors without an admin session", async () => {
    const del = await cancelRoute(new NextRequest("https://defiuniversity.xyz/api/coaching/calendar/evt1", { method: "DELETE" }), params);
    assert.equal(del.status, 401);
    const move = await moveRoute(
      new NextRequest("https://defiuniversity.xyz/api/coaching/calendar/evt1", {
        method: "PATCH",
        body: JSON.stringify({ newStart: at("14:00").toISOString() }),
      }),
      { params: Promise.resolve({ eventId: "evt1" }) }
    );
    assert.equal(move.status, 401);
  });

  it("let an admin through", async () => {
    const token = await createAdminSession("david");
    const res = await cancelRoute(
      new NextRequest("https://defiuniversity.xyz/api/coaching/calendar/evt1", {
        method: "DELETE",
        headers: { cookie: `${COOKIE_NAME}=${token}` },
      }),
      params
    );
    assert.notEqual(res.status, 401);
  });
});
