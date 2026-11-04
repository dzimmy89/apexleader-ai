import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Firestore } from "firebase-admin/firestore";
import { setDbForTests } from "../lib/firebase-admin";
import { setSendEmailForTests } from "../lib/gmail";
import { getPackage, getPackages, isPublicPlan, paymentPlanAddsUp } from "../lib/coaching/packages";
import { renderContract } from "../lib/coaching/contract-templates";
import { logManualPayment } from "../lib/coaching/manual-payments";
import { createMemoryFirestore, type MemoryFirestore } from "./fixtures/memory-firestore";

// Private packages (content/site-fallback.ts privatePackages) are sold by
// proposal: never listed on the site, but loggable by hand in the admin.

let mem: MemoryFirestore;

beforeEach(() => {
  mem = createMemoryFirestore();
  setDbForTests(mem as unknown as Firestore);
  setSendEmailForTests(async () => ({ ok: true, messageId: "m1", threadId: "t1" }));
  process.env.JWT_SECRET = "test-private-packages";
  process.env.NEXT_PUBLIC_SITE_URL = "https://fromaitobusiness.com";
  process.env.SENDER_EMAIL = "hello@fromaitobusiness.com";
});

afterEach(() => {
  setDbForTests(undefined);
  setSendEmailForTests(undefined);
});

describe("Build and Launch private package", () => {
  it("is hidden from public listings but found by id", async () => {
    const publicIds = (await getPackages()).map((p) => p.id);
    assert.ok(!publicIds.includes("build_launch"));
    const pkg = await getPackage("build_launch");
    assert.ok(pkg);
    assert.equal(pkg.name, "Build and Launch");
    assert.equal(pkg.price, 2500);
    assert.equal(pkg.sessionCount, 16);
    assert.equal(pkg.durationWeeks, 16);
    assert.deepEqual(
      pkg.paymentPlans.map((p) => [p.id, p.installments, p.perPayment, p.total]),
      [
        ["full", 1, 2500, 2500],
        ["2pay", 2, 1250, 2500],
      ]
    );
    assert.ok(pkg.paymentPlans.every(paymentPlanAddsUp));
    assert.equal(pkg.paymentPlans.filter(isPublicPlan).length, 1, "2pay never reaches public checkout");
  });

  it("renders its own agreement with 16 sessions and the 2-payment plan", async () => {
    const c = await renderContract({
      clientName: "Randy Client",
      clientEmail: "randy@example.com",
      packageId: "build_launch",
      planId: "2pay",
    });
    assert.match(c.markdown, /Build and Launch Coaching Agreement/);
    assert.match(c.markdown, /16 private 1-on-1 sessions of 60 minutes/);
    assert.match(c.markdown, /Coaching duration: 16 weeks/);
    assert.match(c.markdown, /\$2,500/);
    assert.match(c.markdown, /2 payments of \$1,250 \(total \$2,500\)/);
    assert.doesNotMatch(c.markdown, /\{\{/);
  });

  it("logs a first installment: client record, won card and a 2-payment schedule", async () => {
    const result = await logManualPayment(
      {
        email: "randy@example.com",
        name: "Randy Client",
        amountUsd: 1250,
        reference: "USDC tx 0xabc",
        note: "",
        paidAt: "2026-11-03",
        packageId: "build_launch",
        planId: "2pay",
        installmentNumber: 1,
        idempotencyKey: "k1",
      },
      "david"
    );
    assert.equal(result.ok, true, JSON.stringify(result));
    const client = mem.store.get("client_records/randy@example.com");
    assert.equal(client?.packageName, "Build and Launch");
    assert.equal(client?.sessionsTotal, 16);
    assert.equal(client?.planId, "2pay");
    assert.equal(mem.store.get("coaching_applications/paid_randy@example.com")?.status, "won");
    const schedule = mem.store.get("payment_schedules/randy@example.com__build_launch");
    const installments = schedule?.installments as Array<Record<string, unknown>>;
    assert.equal(installments.length, 2);
    assert.deepEqual(installments.map((i) => i.dueDate), ["2026-11-03", "2026-12-03"]);
    assert.equal(typeof installments[0]?.paidAt, "string");
    assert.equal(installments[1]?.paidAt, null);
  });
});
