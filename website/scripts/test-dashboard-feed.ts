import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FEED_SCHEMA_VERSION,
  coachingBlock,
  followUpsBlock,
  funnelBlock,
  isDashboardTestEmail,
  leadBlocks,
  leadSource,
  moneyBlocks,
  needsOwnerBlock,
  receivablesBlock,
  safeLabel,
} from "../lib/crm/dashboard-feed";

// Mon 2026-11-16 18:00 UTC (13:00 in New York)
const NOW = Date.parse("2026-11-16T18:00:00Z");
const DAY = 86_400_000;
const WEEK_START = NOW - 7 * DAY;
const iso = (ms: number) => new Date(ms).toISOString();

const PERSONAL = ["ada@example.com", "+14155550123", "@ada_builds", "Ada Lovelace", "doc_secret_id"];

function assertNoPersonalData(value: unknown) {
  const text = JSON.stringify(value);
  for (const p of PERSONAL) assert.ok(!text.includes(p), `leaked ${p}`);
  assert.ok(!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text), "an email address leaked");
}

describe("test and owner accounts", () => {
  it("leaves out the owner login, +test addresses and the existing exclusion list", () => {
    assert.equal(isDashboardTestEmail("hello@fromaitobusiness.com"), true);
    assert.equal(isDashboardTestEmail("Hello+TestClient@fromaitobusiness.com"), true);
    assert.equal(isDashboardTestEmail("someone@apexleader.com"), true);
    assert.equal(isDashboardTestEmail("loop-test-1@example.com"), true);
    assert.equal(isDashboardTestEmail("ada@example.com"), false);
    assert.equal(isDashboardTestEmail(undefined), false);
  });
});

describe("safeLabel", () => {
  it("never passes a handle or email, and cleans odd characters", () => {
    assert.equal(safeLabel("x/dm/@ada_builds"), "other");
    assert.equal(safeLabel("ada@example.com"), "other");
    assert.equal(safeLabel("X/DM/Launch Week"), "x/dm/launch-week");
    assert.equal(safeLabel("", "direct"), "direct");
  });
});

describe("funnel", () => {
  const docs = [
    { day: "2026-11-16", courseId: "ai-marketing", lessonSlug: "l1", campaign: "x", counts: { lesson_view: 10, ask_seen: 8, email_given: 3, mobile_given: 2, exercise_view: 2, call_booked: 1 } },
    { day: "2026-11-01", courseId: "ai-marketing", lessonSlug: "l1", campaign: "x", counts: { lesson_view: 5, email_given: 1 } },
    { day: "2026-11-12", courseId: "ai-sales", lessonSlug: "l2", campaign: "x/dm/@ada_builds", counts: { lesson_view: 4 } },
    { day: "2026-09-01", courseId: "ai-sales", lessonSlug: "old", campaign: "x", counts: { lesson_view: 99 } },
  ];
  const f = funnelBlock(docs, NOW);

  it("adds up the last 7 and 30 days and drops older days", () => {
    assert.equal(f.last7Days.lesson_view, 14);
    assert.equal(f.last30Days.lesson_view, 19);
    assert.equal(f.last30Days.email_given, 4);
    assert.equal(f.last7Days.call_booked, 1);
    assert.equal(f.byLesson.find((l) => l.lessonSlug === "old"), undefined);
  });

  it("groups by lesson and by cleaned campaign", () => {
    assert.equal(f.byLesson[0].key, "ai-marketing/l1");
    assert.equal(f.byLesson[0].last30Days.lesson_view, 15);
    assert.deepEqual(
      f.byCampaign.map((c) => c.key).sort(),
      ["other", "x"]
    );
    assertNoPersonalData(f);
  });
});

describe("leads", () => {
  const leads = [
    { email: "ada@example.com", createdAt: iso(NOW - DAY), utm: { source: "x", content: "@ada_builds" }, phone: "+14155550123", smsConsent: { given: true }, status: "confirmed", firstLesson: { courseId: "ai-marketing", lessonSlug: "l1", title: "Ada Lovelace" } },
    { email: "bo@example.com", createdAt: { toMillis: () => NOW - 2 * DAY }, referrer: "https://t.co/abc", status: "pending" },
    { email: "cy@example.com", createdAt: iso(NOW - 30 * DAY), referrer: "https://news.example.org/x", status: "unsubscribed", phone: "+14155550999", smsConsent: { given: true }, smsOptOutAt: iso(NOW) },
    { email: "hello+testclient@fromaitobusiness.com", createdAt: iso(NOW), status: "confirmed" },
  ];
  const { leads: l, leadsDetail: d } = leadBlocks(leads, WEEK_START);

  it("counts real leads only, new ones by source and first course", () => {
    assert.equal(l.total, 3);
    assert.equal(l.newInWindow, 2);
    assert.deepEqual(d.newBySource, { x: 2, direct: 0, referral: 0, other: 0 });
    assert.deepEqual(d.newByFirstCourse, { "ai-marketing": 1, none: 1 });
    assert.equal(d.withMobile, 2);
    assert.equal(d.textConsent, 1, "an opted-out number does not count");
    assert.equal(d.emailConfirmed, 1);
    assert.equal(d.unsubscribedOrBounced, 1);
    assertNoPersonalData({ l, d });
  });

  it("reads the source from utm first, then the referrer", () => {
    assert.equal(leadSource({ utm: { source: "newsletter" } }), "other");
    assert.equal(leadSource({ referrer: "https://www.google.com/" }), "referral");
    assert.equal(leadSource({}), "direct");
  });
});

describe("follow-ups", () => {
  const flows = [
    { email: "ada@example.com", flowType: "lesson_marketing", status: "active", steps: [{ sendAt: iso(NOW - 3 * 3600_000), sentAt: null, skipped: false }] },
    { email: "bo@example.com", flowType: "lesson_marketing", status: "active", steps: [{ sendAt: iso(NOW + DAY), sentAt: null, skipped: false }] },
    { email: "cy@example.com", flowType: "lesson_marketing", status: "exited", exitReason: "booked_discovery_call", steps: [] },
    { email: "dee@example.com", flowType: "lesson_sales", status: "completed", steps: [] },
    { email: "hello@fromaitobusiness.com", flowType: "lesson_sales", status: "active", steps: [] },
  ];
  const block = followUpsBlock({
    flows,
    emailLog: [
      { to: "ada@example.com", source: "flow", status: "sent", sentAt: iso(NOW - DAY) },
      { to: "ada@example.com", source: "flow", status: "failed", sentAt: iso(NOW - DAY) },
      { to: "bo@example.com", source: "Lead Alert!", sentAt: iso(NOW - DAY) },
    ],
    smsLog: [{ to: "+14155550123", status: "sent", sentAt: iso(NOW - DAY) }, { status: "skipped", sentAt: iso(NOW) }],
    windowStart: WEEK_START,
    now: NOW,
    textsEnabled: false,
    lastJobRunAt: iso(NOW - 10 * 60_000),
  });

  it("counts each series, overdue steps and bookings that stopped a series", () => {
    assert.deepEqual(block.bySeries.lesson_marketing, { active: 2, completed: 0, exited: 1, exitedBooked: 1, overdue: 1 });
    assert.deepEqual(block.bySeries.lesson_sales, { active: 0, completed: 1, exited: 0, exitedBooked: 0, overdue: 0 });
    assert.equal(block.active, 2);
    assert.equal(block.overdue, 1);
  });

  it("counts sent emails by kind and sent texts", () => {
    assert.deepEqual(block.emailsSentInWindowBySource, { flow: 1, "lead-alert": 1 });
    assert.equal(block.textsSentInWindow, 1);
    assertNoPersonalData(block);
  });
});

describe("money", () => {
  const payments = [
    { id: "pay_stripe", data: { email: "ada@example.com", method: "stripe", amount: 75000, paidAt: iso(NOW - 2 * DAY) } },
    { id: "doc_secret_id", data: { email: "randy@example.com", method: "manual", amount: 125000, paidAt: "2026-11-03T15:00:00Z", reference: "evm tx 0xabc" } },
    { id: "pay_wire", data: { email: "bo@example.com", method: "manual", amount: 50000, paidAt: "2026-10-10T15:00:00Z", amountRefunded: 10000 } },
    { id: "pay_test", data: { email: "hello@fromaitobusiness.com", method: "stripe", amount: 99900, paidAt: iso(NOW - DAY) } },
  ];
  const m = moneyBlocks({ payments, cryptoPaymentIds: new Set(["doc_secret_id"]), windowStart: WEEK_START, now: NOW });

  it("splits the window by method and leaves out test logins", () => {
    assert.equal(m.payments.countInWindow, 1);
    assert.equal(m.payments.amountInWindowUsd, 750);
    assert.deepEqual(m.payments.inWindowByMethod.stripe, { count: 1, amountUsd: 750 });
  });

  it("gives 13 months by method with crypto counted once, as crypto", () => {
    assert.equal(m.revenue.months.length, 13 * 3);
    const cell = (month: string, method: string) => m.revenue.months.find((r) => r.month === month && r.method === method)!;
    assert.deepEqual(cell("2026-11", "crypto"), { month: "2026-11", method: "crypto", payments: 1, grossUsd: 1250, refundsUsd: 0, netUsd: 1250 });
    assert.equal(cell("2026-11", "manual").payments, 0);
    assert.equal(cell("2026-11", "stripe").grossUsd, 750);
    assert.deepEqual(cell("2026-10", "manual"), { month: "2026-10", method: "manual", payments: 1, grossUsd: 500, refundsUsd: 100, netUsd: 400 });
    assert.equal(m.revenue.months[0].month, "2025-11");
    assertNoPersonalData(m);
  });

  it("finds installments due, overdue and unconfirmed crypto notices", () => {
    const r = receivablesBlock({
      now: NOW,
      schedules: [
        { email: "randy@example.com", installments: [
          { number: 1, amount: 125000, dueDate: "2026-11-03", paidAt: "2026-11-03T15:00:00Z" },
          { number: 2, amount: 125000, dueDate: "2026-12-03", paidAt: null },
        ] },
        { email: "bo@example.com", installments: [{ number: 2, amount: 50000, dueDate: "2026-11-10", paidAt: null }] },
        { email: "hello+test@fromaitobusiness.com", installments: [{ number: 2, amount: 1, dueDate: "2026-11-01", paidAt: null }] },
      ],
      cryptoNotices: [
        { email: "ada@example.com", status: "unconfirmed", amountUsd: 750, createdAt: iso(NOW - DAY) },
        { email: "randy@example.com", status: "confirmed", amountUsd: 1250, createdAt: iso(NOW - 13 * DAY) },
      ],
    });
    assert.deepEqual(r.dueNext30Days, { count: 1, amountUsd: 1250 });
    assert.deepEqual(r.overdue, { count: 1, amountUsd: 500, oldestDueDate: "2026-11-10" });
    assert.deepEqual(r.cryptoNoticesUnconfirmed, { count: 1, amountUsd: 750, oldestAt: iso(NOW - DAY) });
    assertNoPersonalData(r);
  });
});

describe("coaching and the needs-you list", () => {
  const coaching = coachingBlock({
    now: NOW,
    clients: [
      { id: "randy@example.com", data: { status: "active", packageId: "build-and-launch", name: "Ada Lovelace" } },
      { id: "ada@example.com", data: { status: "paid_pending_contract", packageId: "foundations" } },
      { id: "bo@example.com", data: { status: "completed", packageId: "foundations" } },
      { id: "hello@fromaitobusiness.com", data: { status: "active", packageId: "mastery" } },
    ],
    signatures: [
      { status: "pending", signerEmail: "ada@example.com", createdAt: iso(NOW - 4 * DAY), expiresAt: iso(NOW + 10 * DAY) },
      { status: "pending", signerEmail: "old@example.com", createdAt: iso(NOW - 40 * DAY), expiresAt: iso(NOW - DAY) },
    ],
    intakeLinks: [
      { email: "ada@example.com", submittedAt: null, expiresAt: iso(NOW + DAY) },
      { email: "bo@example.com", submittedAt: iso(NOW), expiresAt: iso(NOW + DAY) },
    ],
  });

  it("counts clients by status and active ones by package, without the test login", () => {
    assert.deepEqual(coaching.clientsByStatus, { active: 1, paid_pending_contract: 1, completed: 1 });
    assert.deepEqual(coaching.activeByPackage, { "build-and-launch": 1, foundations: 1 });
    assert.deepEqual(coaching.agreementsPending, { count: 1, oldestAt: iso(NOW - 4 * DAY) });
    assert.equal(coaching.intakeFormsWaiting, 1);
    assertNoPersonalData(coaching);
  });

  const base = {
    coaching,
    receivables: {
      dueNext30Days: { count: 0, amountUsd: 0 },
      overdue: { count: 1, amountUsd: 1250, oldestDueDate: "2026-11-10" },
      cryptoNoticesUnconfirmed: { count: 2, amountUsd: 1500, oldestAt: iso(NOW - DAY) },
    },
    followUps: {
      bySeries: {}, active: 0, overdue: 0, emailsSentInWindowBySource: {}, textsSentInWindow: 0,
      textsEnabled: false, lastJobRunAt: iso(NOW - 3 * 3600_000),
    },
    now: NOW,
  };

  it("lists what only the owner can clear, with fixed ids", () => {
    const items = needsOwnerBlock({ ...base, calendarAlertAt: iso(NOW - 30 * 60_000) });
    assert.deepEqual(items.map((i) => [i.id, i.level]), [
      ["fatb-crypto-unconfirmed", "act"],
      ["fatb-installment-overdue", "act"],
      ["fatb-agreement-unsigned", "act"],
      ["fatb-booking-calendar", "act"],
      ["fatb-followup-job", "act"],
      ["fatb-texts-off", "watch"],
    ]);
    assert.match(items[1].item, /\$1,250/);
    assertNoPersonalData(items);
  });

  it("stays quiet when the job ran recently, texts are on and the calendar alert is old", () => {
    const items = needsOwnerBlock({
      ...base,
      receivables: { ...base.receivables, overdue: { count: 0, amountUsd: 0, oldestDueDate: null }, cryptoNoticesUnconfirmed: { count: 0, amountUsd: 0, oldestAt: null } },
      coaching: { ...coaching, agreementsPending: { count: 0, oldestAt: null } },
      followUps: { ...base.followUps, textsEnabled: true, lastJobRunAt: iso(NOW - 10 * 60_000) },
      calendarAlertAt: iso(NOW - 5 * 3600_000),
    });
    assert.deepEqual(items, []);
  });

  it("reports schema version 2", () => {
    assert.equal(FEED_SCHEMA_VERSION, 2);
  });
});
