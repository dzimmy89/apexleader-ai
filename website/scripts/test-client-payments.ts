import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Firestore } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { setDbForTests } from "../lib/firebase-admin";
import { setSendEmailForTests, type SendEmailOptions } from "../lib/gmail";
import { COOKIE_NAME, createAdminSession } from "../lib/auth/admin-session-cookie";
import {
  addMonthsToDate,
  buildInstallmentSchedule,
  dateInTimezone,
  hourInTimezone,
  markInstallmentPaid,
  scheduleDueItems,
  summarizeContactPayments,
  type PaymentSchedule,
} from "../lib/coaching/payments";
import { logManualPayment, manualPaymentDocId } from "../lib/coaching/manual-payments";
import { maybeSendPaymentDigest, buildPaymentDigestEmail } from "../lib/coaching/payment-digest";
import { POST as postPayment } from "../app/api/admin/contacts/[email]/payments/route";
import { createMemoryFirestore, rows, type MemoryFirestore } from "./fixtures/memory-firestore";

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
  process.env.JWT_SECRET = "test-client-payments";
  process.env.NEXT_PUBLIC_SITE_URL = "https://fromaitobusiness.com";
  process.env.SENDER_EMAIL = "hello@fromaitobusiness.com";
});

afterEach(() => {
  setDbForTests(undefined);
  setSendEmailForTests(undefined);
});

function scheduleFixture(overrides: Partial<PaymentSchedule> = {}): PaymentSchedule {
  return {
    ...buildInstallmentSchedule({
      email: "ada@example.com",
      name: "Ada Client",
      packageId: "mastery",
      packageName: "Operator",
      planId: "3pay",
      installments: 3,
      perPayment: 83400,
      startDate: "2026-09-15",
      nowIso: "2026-09-15T12:00:00.000Z",
    }),
    ...overrides,
  };
}

describe("schedule math", () => {
  it("adds months and clamps the day to the end of short months", () => {
    assert.equal(addMonthsToDate("2026-01-31", 1), "2026-02-28");
    assert.equal(addMonthsToDate("2028-01-31", 1), "2028-02-29");
    assert.equal(addMonthsToDate("2026-11-15", 2), "2027-01-15");
    assert.equal(addMonthsToDate("2026-03-15", -2), "2026-01-15");
    assert.equal(addMonthsToDate("2026-01-15", -1), "2025-12-15");
  });

  it("builds monthly due dates from the first payment date", () => {
    const schedule = scheduleFixture();
    assert.deepEqual(
      schedule.installments.map((i) => [i.number, i.amount, i.dueDate, i.paidAt]),
      [
        [1, 83400, "2026-09-15", null],
        [2, 83400, "2026-10-15", null],
        [3, 83400, "2026-11-15", null],
      ]
    );
  });

  it("marks the requested installment, then the next unpaid one, and ignores a replay", () => {
    const first = markInstallmentPaid(scheduleFixture(), {
      installmentNumber: 1,
      paidAt: "2026-09-15T16:00:00.000Z",
      paymentId: "p1",
    });
    assert.equal(first.marked, 1);
    const next = markInstallmentPaid(first.schedule, {
      installmentNumber: 1,
      paidAt: "2026-10-14T16:00:00.000Z",
      paymentId: "p2",
    });
    assert.equal(next.marked, 2, "an already paid number falls through to the next unpaid");
    const replay = markInstallmentPaid(next.schedule, {
      paidAt: "2026-10-14T16:00:00.000Z",
      paymentId: "p2",
    });
    assert.equal(replay.replay, true);
    assert.equal(replay.schedule.installments.filter((i) => i.paidAt).length, 2);
    const skip = markInstallmentPaid(next.schedule, {
      installmentNumber: 3,
      paidAt: "2026-11-01T16:00:00.000Z",
      paymentId: "p3",
    });
    assert.equal(skip.marked, 3);
    const none = markInstallmentPaid(skip.schedule, { paidAt: "2026-11-02T00:00:00.000Z", paymentId: "p4" });
    assert.equal(none.marked, null);
  });

  it("lists overdue and due-within-7-days installments only", () => {
    const paidFirst = markInstallmentPaid(scheduleFixture(), {
      paidAt: "2026-09-15T16:00:00.000Z",
      paymentId: "p1",
    }).schedule;
    const items = scheduleDueItems([{ id: "s1", schedule: paidFirst }], "2026-10-20");
    assert.equal(items.length, 1);
    assert.equal(items[0]?.installmentNumber, 2);
    assert.equal(items[0]?.status, "overdue");
    assert.equal(items[0]?.daysLate, 5);

    const soon = scheduleDueItems([{ id: "s1", schedule: paidFirst }], "2026-10-09");
    assert.equal(soon.length, 1);
    assert.equal(soon[0]?.status, "due_soon");
    assert.equal(soon[0]?.daysLate, -6);

    assert.equal(scheduleDueItems([{ id: "s1", schedule: paidFirst }], "2026-10-07").length, 0);
    assert.equal(
      scheduleDueItems([{ id: "s1", schedule: paidFirst }], "2026-10-15")[0]?.status,
      "due_soon",
      "due today is not overdue yet"
    );
  });

  it("summarizes paid, owed, and next due", () => {
    const schedule = markInstallmentPaid(scheduleFixture(), {
      paidAt: "2026-09-15T16:00:00.000Z",
      paymentId: "p1",
    }).schedule;
    const manual = summarizeContactPayments({
      payments: [{ amount: 83400, packageId: "mastery", method: "manual", paidAt: "2026-09-15T16:00:00.000Z" }],
      packageId: "mastery",
      planId: "3pay",
      planTotal: 250200,
      perPayment: 83400,
      schedule,
    });
    assert.equal(manual.paid, 83400);
    assert.equal(manual.owed, 166800);
    assert.deepEqual(manual.nextDue, { dueDate: "2026-10-15", amount: 83400, source: "schedule" });

    const stripe = summarizeContactPayments({
      payments: [
        { amount: 83400, packageId: "mastery", method: "stripe", paidAt: "2026-09-02T15:00:00.000Z" },
        { amount: 75000, packageId: "foundations", method: "stripe", paidAt: "2026-08-01T15:00:00.000Z" },
      ],
      packageId: "mastery",
      planId: "3pay",
      planTotal: 250200,
      perPayment: 83400,
      schedule: null,
    });
    assert.equal(stripe.paid, 83400, "other packages do not count");
    assert.equal(stripe.nextDue?.source, "stripe_estimate");
    assert.equal(stripe.nextDue?.dueDate, "2026-10-02");

    const full = summarizeContactPayments({
      payments: [{ amount: 75000, packageId: "foundations", method: "manual", paidAt: "2026-09-02T15:00:00.000Z" }],
      packageId: "foundations",
      planId: "full",
      planTotal: 75000,
      perPayment: 75000,
      schedule: null,
    });
    assert.equal(full.owed, 0);
    assert.equal(full.nextDue, null);
  });

  it("reads New York dates and hours", () => {
    // 2026-10-20 03:30 UTC is 23:30 on Oct 19 in New York (EDT).
    const late = new Date("2026-10-20T03:30:00.000Z");
    assert.equal(dateInTimezone(late), "2026-10-19");
    assert.equal(hourInTimezone(late), 23);
    assert.equal(hourInTimezone(new Date("2026-10-20T11:05:00.000Z")), 7);
    assert.equal(hourInTimezone(new Date("2026-12-20T11:05:00.000Z")), 6, "EST in December");
  });
});

function logInput(extra: Record<string, unknown> = {}) {
  return {
    email: "Ada@Example.com",
    name: "Ada Client",
    amountUsd: 834,
    reference: "INV-1001",
    paidAt: "2026-09-15",
    packageId: "mastery",
    planId: "3pay",
    installmentNumber: 1,
    idempotencyKey: "k1",
    ...extra,
  };
}

const FIRST_ID = manualPaymentDocId("ada@example.com", "k1");

describe("log manual payment", () => {
  it("first payment grants the package, writes the ledger, schedule, pipeline, course access, and timeline", async () => {
    await mem.collection("coaching_applications").doc("app1").set({
      email: "ada@example.com",
      name: "Ada Client",
      status: "proposal_sent",
      createdAt: "2026-09-01T00:00:00.000Z",
    });
    const result = await logManualPayment(logInput(), "david");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.created, true);
    assert.equal(result.granted, "granted");
    assert.equal(result.installmentNumber, 1);

    const client = mem.store.get("client_records/ada@example.com");
    assert.equal(client?.status, "paid_pending_contract");
    assert.equal(client?.sessionsRemaining, 8);
    assert.equal(client?.paymentSource, "manual");
    assert.deepEqual(client?.processedCheckoutSessionIds, ["manual:ada@example.com:mastery"]);

    const payments = rows(mem.store, "client_payments");
    assert.equal(payments.length, 1);
    const [paymentKey, payment] = payments[0]!;
    assert.equal(paymentKey, `client_payments/${FIRST_ID}`);
    assert.equal(payment.method, "manual");
    assert.equal(payment.amount, 83400);
    assert.equal(payment.currency, "usd");
    assert.equal(payment.reference, "INV-1001");
    assert.equal(payment.installmentNumber, 1);
    assert.equal(payment.planId, "3pay");
    assert.equal(payment.actor, "david");

    const schedule = mem.store.get("payment_schedules/ada@example.com__mastery");
    const installments = schedule?.installments as Array<Record<string, unknown>>;
    assert.equal(installments.length, 3);
    assert.deepEqual(
      installments.map((i) => i.dueDate),
      ["2026-09-15", "2026-10-15", "2026-11-15"]
    );
    assert.equal(typeof installments[0]?.paidAt, "string");
    assert.equal(installments[1]?.paidAt, null);

    const app = mem.store.get("coaching_applications/app1");
    assert.equal(app?.status, "won");
    assert.equal(app?.packageId, "mastery");
    assert.equal(app?.closeValue, 2502);
    assert.equal(app?.wonSource, "manual");

    const account = mem.store.get("learn_accounts/ada@example.com");
    const grants = account?.grants as Array<Record<string, unknown>>;
    assert.equal(grants[0]?.source, "coaching");
    assert.ok(String(grants[0]?.expiresAt).startsWith("2026-12-15"), "3 months from the first payment");

    const activity = rows(mem.store, "activity_log").map(([, r]) => r);
    assert.ok(activity.some((r) => r.type === "payment" && String(r.title).includes("$834")));
    assert.ok(activity.some((r) => r.type === "stage_change" && r.title === "Stage changed to won"));

    assert.ok(sent.some((m) => m.log.source === "coaching_contract"), "agreement email");
  });

  it("a later installment marks the next unpaid one and never grants twice", async () => {
    await logManualPayment(logInput(), "david");
    const second = await logManualPayment(
      logInput({ installmentNumber: "", idempotencyKey: "k2", paidAt: "2026-10-16" }),
      "david"
    );
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.equal(second.granted, "replay");
    assert.equal(second.installmentNumber, 2);
    const client = mem.store.get("client_records/ada@example.com");
    assert.equal(client?.sessionsRemaining, 8);

    const again = await logManualPayment(
      logInput({ installmentNumber: "", idempotencyKey: "k2", paidAt: "2026-10-16" }),
      "david"
    );
    assert.equal(again.ok && again.created, false, "same idempotency key writes no second row");
    assert.equal(rows(mem.store, "client_payments").length, 2);
    const installments = mem.store.get("payment_schedules/ada@example.com__mastery")
      ?.installments as Array<Record<string, unknown>>;
    assert.equal(installments.filter((i) => i.paidAt).length, 2);
    assert.equal(
      rows(mem.store, "activity_log").filter(([, r]) => r.type === "payment").length,
      2
    );
    assert.equal(rows(mem.store, "coaching_applications").length, 1, "one card created for a new client");
    assert.equal(mem.store.get("coaching_applications/paid_ada@example.com")?.status, "won");
  });

  it("validates input", async () => {
    const cases: Array<[Record<string, unknown>, string]> = [
      [{ email: "nope" }, "Invalid email"],
      [{ packageId: "gold" }, "Unknown package"],
      [{ planId: "12pay" }, "Unknown payment plan"],
      [{ amountUsd: 0 }, "Amount must be a positive number of dollars"],
      [{ paidAt: "" }, "Date paid is required"],
      [{ paidAt: "2099-01-01" }, "Date paid is in the future"],
      [{ installmentNumber: 4 }, "Installment must be between 1 and 3"],
      [{ idempotencyKey: "" }, "idempotencyKey is required"],
    ];
    for (const [extra, error] of cases) {
      const result = await logManualPayment(logInput(extra), "david");
      assert.equal(result.ok, false, JSON.stringify(extra));
      if (!result.ok) assert.equal(result.error, error);
    }
    assert.equal(rows(mem.store, "client_payments").length, 0);
    assert.equal(mem.store.has("client_records/ada@example.com"), false);
  });

  it("the payments route needs an admin cookie and a same-site Origin", async () => {
    const token = await createAdminSession("david");
    const call = (headers: Record<string, string>) =>
      postPayment(
        new NextRequest("http://localhost/api/admin/contacts/ada%40example.com/payments", {
          method: "POST",
          headers: { "content-type": "application/json", ...headers },
          body: JSON.stringify(logInput()),
        }),
        { params: Promise.resolve({ email: "ada%40example.com" }) }
      );
    assert.equal((await call({ authorization: `Bearer ${token}`, origin: "https://fromaitobusiness.com" })).status, 401);
    assert.equal((await call({ cookie: `${COOKIE_NAME}=${token}`, origin: "https://evil.example" })).status, 403);
    const ok = await call({ cookie: `${COOKIE_NAME}=${token}`, origin: "https://fromaitobusiness.com" });
    assert.equal(ok.status, 200);
    assert.ok(mem.store.has(`client_payments/${FIRST_ID}`));
  });
});

describe("payment digest", () => {
  async function seedDue() {
    const schedule = markInstallmentPaid(scheduleFixture(), {
      paidAt: "2026-09-15T16:00:00.000Z",
      paymentId: "p1",
    }).schedule;
    await mem.collection("payment_schedules").doc("ada@example.com__mastery").set(
      schedule as unknown as Record<string, unknown>
    );
  }

  it("waits until 7am New York time", async () => {
    await seedDue();
    const result = await maybeSendPaymentDigest({ now: new Date("2026-10-20T10:30:00.000Z") });
    assert.equal(result.status, "too_early");
    assert.equal(sent.length, 0);
    assert.equal(mem.store.has("app_state/payment_digest"), false);
  });

  it("sends once per day to the owner only and lists overdue items", async () => {
    await seedDue();
    const morning = new Date("2026-10-20T11:30:00.000Z");
    const first = await maybeSendPaymentDigest({ now: morning });
    assert.equal(first.status, "sent");
    assert.equal(first.count, 1);
    assert.equal(sent.length, 1);
    assert.equal(sent[0]?.to, "hello@fromaitobusiness.com");
    assert.equal(sent[0]?.purpose, "transactional");
    assert.equal(sent[0]?.log.source, "payment_digest");
    assert.match(sent[0]?.subject || "", /1 overdue/);
    assert.match(sent[0]?.text || "", /Ada Client \(ada@example\.com\): Operator payment 2 of 3, \$834, due October 15, 2026/);
    assert.match(sent[0]?.text || "", /\/admin\/contacts\/ada%40example\.com/);

    const again = await maybeSendPaymentDigest({ now: new Date("2026-10-20T17:00:00.000Z") });
    assert.equal(again.status, "already_ran");
    assert.equal(sent.length, 1);
    assert.equal(mem.store.get("app_state/payment_digest")?.lastSentDate, "2026-10-20");

    const nextDay = await maybeSendPaymentDigest({ now: new Date("2026-10-21T11:30:00.000Z") });
    assert.equal(nextDay.status, "sent");
    assert.equal(sent.length, 2);
  });

  it("skips the email when nothing is due", async () => {
    const result = await maybeSendPaymentDigest({ now: new Date("2026-10-20T12:00:00.000Z") });
    assert.equal(result.status, "nothing_due");
    assert.equal(sent.length, 0);
  });

  it("retries later the same day after a retryable send failure", async () => {
    await seedDue();
    let attempts = 0;
    const failing = async () => {
      attempts += 1;
      return { ok: false, error: "network", retryable: true };
    };
    const failed = await maybeSendPaymentDigest({ now: new Date("2026-10-20T11:30:00.000Z"), send: failing });
    assert.equal(failed.status, "send_failed");
    const retried = await maybeSendPaymentDigest({ now: new Date("2026-10-20T12:00:00.000Z") });
    assert.equal(retried.status, "sent");
    assert.equal(attempts, 1);
    assert.equal(sent.length, 1);
  });

  it("builds plain copy without em dashes", () => {
    const email = buildPaymentDigestEmail(
      scheduleDueItems(
        [{ id: "s1", schedule: scheduleFixture() }],
        "2026-10-20"
      ),
      "2026-10-20",
      "https://fromaitobusiness.com"
    );
    assert.equal(email.text.includes("—"), false);
    assert.equal(email.html.includes("—"), false);
    assert.match(email.subject, /2 overdue, 0 due this week/);
  });
});
