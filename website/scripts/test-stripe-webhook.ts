import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { NextRequest } from "next/server";
import type { Firestore } from "firebase-admin/firestore";
import type Stripe from "stripe";
import { POST } from "../app/api/webhooks/stripe/route";
import { setDbForTests } from "../lib/firebase-admin";
import {
  handleStripeWebhookEvent,
  processStripeEvent,
  setStripeForTests,
  STRIPE_EVENT_CLAIM_TTL_MS,
  StripeWebhookInFlightError,
} from "../lib/coaching/stripe";

type Stored = Record<string, unknown>;

class AlreadyExistsError extends Error {
  code = 6;
  constructor() {
    super("ALREADY_EXISTS: Document already exists");
  }
}

function createMemoryFirestore(opts?: {
  throwOnClientSetTimes?: number;
  throwOnMemberSetTimes?: number;
  gateClientSet?: () => Promise<void>;
}) {
  const store = new Map<string, Stored>();
  let clientSetThrowsLeft = opts?.throwOnClientSetTimes ?? 0;
  let memberSetThrowsLeft = opts?.throwOnMemberSetTimes ?? 0;
  const docMutex = new Map<string, Promise<void>>();

  async function lockDoc(key: string): Promise<() => void> {
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const prev = docMutex.get(key) || Promise.resolve();
    docMutex.set(key, prev.then(() => held));
    await prev;
    return release;
  }

  const collection = (name: string) => ({
    doc(id: string) {
      const key = `${name}/${id}`;
      const ref = {
        id,
        path: key,
        async get() {
          const data = store.get(key);
          return {
            id,
            exists: data !== undefined,
            data: () => data,
          };
        },
        async set(data: Stored, options?: { merge?: boolean }) {
          if (name === "client_records" && opts?.gateClientSet) {
            await opts.gateClientSet();
          }
          if (name === "client_records" && clientSetThrowsLeft > 0) {
            clientSetThrowsLeft -= 1;
            throw new Error("simulated firestore write failure");
          }
          if (name === "members" && memberSetThrowsLeft > 0) {
            memberSetThrowsLeft -= 1;
            throw new Error("simulated member write failure");
          }
          const next = options?.merge
            ? { ...(store.get(key) || {}), ...data }
            : data;
          store.set(key, JSON.parse(JSON.stringify(next)) as Stored);
        },
        async create(data: Stored) {
          if (store.has(key)) throw new AlreadyExistsError();
          store.set(key, JSON.parse(JSON.stringify(data)) as Stored);
        },
        async delete() {
          store.delete(key);
        },
      };
      return ref;
    },
    async add(data: Stored) {
      const id = `auto_${store.size + 1}`;
      store.set(`${name}/${id}`, JSON.parse(JSON.stringify(data)) as Stored);
      return { id };
    },
    async get() {
      const docs: Array<{ id: string; data: () => Stored }> = [];
      for (const [docKey, data] of store) {
        if (!docKey.startsWith(`${name}/`)) continue;
        docs.push({
          id: docKey.slice(name.length + 1),
          data: () => data,
        });
      }
      return { empty: docs.length === 0, docs, size: docs.length };
    },
    where(field: string, op: string, value: unknown) {
      if (op !== "==") throw new Error(`unsupported where ${op}`);
      const q = {
        limit() {
          return q;
        },
        async get() {
          const docs: Array<{
            id: string;
            exists: boolean;
            data: () => Stored;
          }> = [];
          for (const [docKey, data] of store) {
            if (!docKey.startsWith(`${name}/`)) continue;
            if (data[field] === value) {
              docs.push({
                id: docKey.slice(name.length + 1),
                exists: true,
                data: () => data,
              });
            }
          }
          return { empty: docs.length === 0, docs, size: docs.length };
        },
      };
      return q;
    },
  });

  return {
    collection,
    store,
    async runTransaction<T>(
      fn: (tx: {
        get: (ref: {
          path?: string;
          get: () => Promise<{ exists: boolean; data: () => Stored | undefined }>;
        }) => Promise<{ exists: boolean; data: () => Stored | undefined }>;
        set: (
          ref: {
            path?: string;
            set: (data: Stored, options?: { merge?: boolean }) => Promise<void>;
          },
          data: Stored,
          options?: { merge?: boolean }
        ) => void;
      }) => Promise<T>
    ): Promise<T> {
      const unlocks: Array<() => void> = [];
      const acquired = new Set<string>();
      const writes: Array<() => Promise<void>> = [];

      const acquire = async (ref: { path?: string }) => {
        const key = ref.path || "";
        if (!key || acquired.has(key)) return;
        acquired.add(key);
        unlocks.push(await lockDoc(key));
      };

      const tx = {
        async get(ref: {
          path?: string;
          get: () => Promise<{ exists: boolean; data: () => Stored | undefined }>;
        }) {
          await acquire(ref);
          return ref.get();
        },
        set(
          ref: {
            path?: string;
            set: (data: Stored, options?: { merge?: boolean }) => Promise<void>;
          },
          data: Stored,
          options?: { merge?: boolean }
        ) {
          writes.push(async () => {
            await acquire(ref);
            await ref.set(data, options);
          });
        },
      };

      try {
        const result = await fn(tx);
        for (const write of writes) await write();
        return result;
      } finally {
        for (const unlock of unlocks.reverse()) unlock();
      }
    },
  };
}

function checkoutEvent(
  id: string,
  overrides?: {
    email?: string;
    packageId?: string;
    packageName?: string;
    customerId?: string;
    subscriptionId?: string;
    paymentIntentId?: string;
    clientName?: string;
    sessionId?: string;
  }
): Stripe.Event {
  const email = overrides?.email ?? "client@example.com";
  const packageId = overrides?.packageId ?? "foundations";
  return {
    id,
    type: "checkout.session.completed",
    data: {
      object: {
        id: overrides?.sessionId ?? `cs_${id}`,
        object: "checkout.session",
        client_reference_id: `${packageId}:${email}`,
        customer: overrides?.customerId ?? "cus_test_1",
        subscription: overrides?.subscriptionId ?? null,
        payment_intent: overrides?.paymentIntentId ?? "pi_test_1",
        amount_total: 9700,
        metadata: {
          planId: "full",
          packageName: overrides?.packageName ?? "Foundations",
          clientName: overrides?.clientName ?? "Ada Client",
        },
      },
    },
  } as unknown as Stripe.Event;
}

function invoiceEvent(
  type: "invoice.paid" | "invoice.payment_failed",
  id: string,
  overrides?: {
    email?: string;
    customerId?: string;
    subscriptionId?: string;
    amount?: number;
  }
): Stripe.Event {
  return {
    id,
    type,
    data: {
      object: {
        id: "in_test_1",
        object: "invoice",
        customer: overrides?.customerId ?? "cus_test_1",
        customer_email: overrides?.email ?? "",
        subscription: overrides?.subscriptionId ?? "sub_test_1",
        amount_paid: overrides?.amount ?? 9700,
        amount_due: overrides?.amount ?? 9700,
        parent: {
          subscription_details: {
            subscription: overrides?.subscriptionId ?? "sub_test_1",
            metadata: { packageId: "foundations", planId: "3pay" },
          },
        },
      },
    },
  } as unknown as Stripe.Event;
}

function subscriptionDeletedEvent(
  id: string,
  overrides?: {
    customerId?: string;
    subscriptionId?: string;
    priceId?: string;
    productId?: string;
    packageId?: string;
  }
): Stripe.Event {
  const subscriptionId = overrides?.subscriptionId ?? "sub_test_1";
  const metadata: Record<string, string> = {};
  if (overrides?.packageId) metadata.packageId = overrides.packageId;
  return {
    id,
    type: "customer.subscription.deleted",
    data: {
      object: {
        id: subscriptionId,
        object: "subscription",
        customer: overrides?.customerId ?? "cus_test_1",
        metadata,
        items: {
          data: overrides?.priceId
            ? [
                {
                  price: {
                    id: overrides.priceId,
                    product: overrides.productId ?? "prod_other",
                  },
                },
              ]
            : [],
        },
      },
    },
  } as unknown as Stripe.Event;
}

function webhookLogs(store: Map<string, Stored>): Array<[string, Stored]> {
  return [...store.entries()].filter(([key]) => key.startsWith("webhook_logs/"));
}

function processedEvent(store: Map<string, Stored>, eventId: string): Stored | undefined {
  return store.get(`stripe_processed_events/${eventId}`);
}

async function waitForClaim(
  store: Map<string, Stored>,
  eventId: string
): Promise<void> {
  for (let i = 0; i < 80; i++) {
    if (processedEvent(store, eventId)?.status === "claimed") return;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw new Error(`timed out waiting for claim ${eventId}`);
}

afterEach(() => {
  setDbForTests(undefined);
  setStripeForTests(undefined);
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_PRICE_MASTERY_3PAY;
});

describe("stripe webhook replay safety", () => {
  it("processes the same event once and returns duplicate on the second delivery", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const event = checkoutEvent("evt_once");

    const first = await handleStripeWebhookEvent(event);
    assert.equal(first.duplicate, false);
    if (!first.duplicate) assert.equal(first.handled, true);
    assert.equal(processedEvent(mem.store, "evt_once")?.status, "done");

    const second = await handleStripeWebhookEvent(event);
    assert.equal(second.duplicate, true);

    const client = (await mem.collection("client_records").doc("client@example.com").get())
      .data();
    assert.equal(client?.status, "paid_pending_contract");
    assert.equal(webhookLogs(mem.store).length, 1);
    assert.ok(mem.store.get("webhook_logs/evt_once"));
  });

  it("returns 5xx while a fresh claimed event is in flight", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const now = new Date().toISOString();
    await mem.collection("stripe_processed_events").doc("evt_inflight").create({
      eventId: "evt_inflight",
      type: "checkout.session.completed",
      status: "claimed",
      claimedAt: now,
    });

    await assert.rejects(
      () => handleStripeWebhookEvent(checkoutEvent("evt_inflight")),
      (err: unknown) => err instanceof StripeWebhookInFlightError
    );
    assert.equal(processedEvent(mem.store, "evt_inflight")?.status, "claimed");
    assert.equal(mem.store.has("client_records/client@example.com"), false);
  });

  it("steals a stale claimed event transactionally and reprocesses it", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const stale = new Date(Date.now() - STRIPE_EVENT_CLAIM_TTL_MS - 1000).toISOString();
    await mem.collection("stripe_processed_events").doc("evt_stale").create({
      eventId: "evt_stale",
      type: "checkout.session.completed",
      status: "claimed",
      claimedAt: stale,
    });

    const result = await handleStripeWebhookEvent(checkoutEvent("evt_stale"));
    assert.equal(result.duplicate, false);
    const claim = processedEvent(mem.store, "evt_stale");
    assert.equal(claim?.status, "done");
    assert.equal(typeof claim?.stolenAt, "string");
    const client = (
      await mem.collection("client_records").doc("client@example.com").get()
    ).data();
    assert.equal(client?.status, "paid_pending_contract");
  });

  it("two concurrent deliveries: one proceeds, the in-flight duplicate is 5xx", async () => {
    let releaseGate: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      releaseGate = resolve;
    });
    const mem = createMemoryFirestore({ gateClientSet: () => gate });
    setDbForTests(mem as unknown as Firestore);
    const event = checkoutEvent("evt_concurrent");

    const first = handleStripeWebhookEvent(event);
    await waitForClaim(mem.store, "evt_concurrent");
    await assert.rejects(
      () => handleStripeWebhookEvent(event),
      (err: unknown) => err instanceof StripeWebhookInFlightError
    );
    releaseGate?.();
    const firstResult = await first;
    assert.equal(firstResult.duplicate, false);
    assert.equal(processedEvent(mem.store, "evt_concurrent")?.status, "done");
    assert.equal(webhookLogs(mem.store).length, 1);
  });

  it("uses Stripe Checkout email when the reference has no email", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const event = checkoutEvent("evt_hosted_email", { email: "" });
    const object = event.data.object as unknown as Record<string, unknown>;
    object.client_reference_id = "foundations";
    object.customer_details = { email: "hosted@example.com" };
    object.metadata = {
      planId: "full",
      packageId: "foundations",
      packageName: "Foundations",
      clientName: "Hosted Buyer",
    };
    await processStripeEvent(event);
    const client = (
      await mem.collection("client_records").doc("hosted@example.com").get()
    ).data();
    assert.equal(client?.status, "paid_pending_contract");
    assert.equal(client?.packageId, "foundations");
    assert.equal(client?.name, "Hosted Buyer");
  });

  it("refuses a checkout session with no buyer email", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const event = checkoutEvent("evt_no_email", { email: "" });
    const object = event.data.object as unknown as Record<string, unknown>;
    object.client_reference_id = "foundations";
    await assert.rejects(() => processStripeEvent(event));
    assert.equal(mem.store.has("client_records/"), false);
    assert.equal(mem.store.has("client_records/hosted@example.com"), false);
  });

  it("replays the same checkout session after contract signing without resetting or double-granting", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const email = "signed@example.com";
    const sessionId = "cs_signed_once";

    await handleStripeWebhookEvent(
      checkoutEvent("evt_checkout_1", { email, sessionId })
    );

    const signedAt = "2026-09-01T12:00:00.000Z";
    const createdAt = "2026-08-01T12:00:00.000Z";
    const paidAt = "2026-08-01T12:00:00.000Z";
    await mem.collection("client_records").doc(email).set(
      {
        status: "onboarded",
        contractSignedAt: signedAt,
        createdAt,
        paidAt,
        magicLinkToken: "hash-token",
        magicLinkExpiresAt: "2026-12-01T00:00:00.000Z",
        sessionsRemaining: 7,
        sessionsTotal: 7,
      },
      { merge: true }
    );

    await processStripeEvent(
      checkoutEvent("evt_checkout_replay", {
        email,
        sessionId,
        customerId: "cus_new",
        paymentIntentId: "pi_replay",
      })
    );

    const client = (await mem.collection("client_records").doc(email).get()).data();
    assert.equal(client?.status, "onboarded");
    assert.equal(client?.contractSignedAt, signedAt);
    assert.equal(client?.createdAt, createdAt);
    assert.equal(client?.paidAt, paidAt);
    assert.equal(client?.magicLinkToken, "hash-token");
    assert.equal(client?.magicLinkExpiresAt, "2026-12-01T00:00:00.000Z");
    assert.equal(client?.sessionsRemaining, 7);
    assert.equal(client?.stripeCustomerId, "cus_test_1");
  });

  it("a second real package purchase grants sessions and updates packageId without resetting onboarding", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const email = "upgrade@example.com";
    await handleStripeWebhookEvent(
      checkoutEvent("evt_first_pkg", {
        email,
        sessionId: "cs_foundations",
        packageId: "foundations",
      })
    );
    const signedAt = "2026-09-02T00:00:00.000Z";
    await mem.collection("client_records").doc(email).set(
      {
        status: "onboarded",
        contractSignedAt: signedAt,
        magicLinkToken: "keep-me",
      },
      { merge: true }
    );

    await handleStripeWebhookEvent(
      checkoutEvent("evt_second_pkg", {
        email,
        sessionId: "cs_mastery",
        packageId: "mastery",
        packageName: "Mastery",
        customerId: "cus_upgrade",
      })
    );

    const client = (await mem.collection("client_records").doc(email).get()).data();
    assert.equal(client?.status, "onboarded");
    assert.equal(client?.contractSignedAt, signedAt);
    assert.equal(client?.magicLinkToken, "keep-me");
    assert.equal(client?.packageId, "mastery");
    // Kickstart (2) + Operator (8) from the fallback package config.
    assert.equal(client?.sessionsRemaining, 10);
    assert.equal(client?.sessionsTotal, 10);
    assert.deepEqual(client?.processedCheckoutSessionIds, [
      "cs_foundations",
      "cs_mastery",
    ]);
    assert.equal(typeof client?.paidAt, "string");
  });

  it("two concurrent distinct checkout sessions for the same email both grant", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const email = "concurrent-buy@example.com";

    const [a, b] = await Promise.all([
      handleStripeWebhookEvent(
        checkoutEvent("evt_conc_a", {
          email,
          sessionId: "cs_conc_foundations",
          packageId: "foundations",
          packageName: "Foundations",
        })
      ),
      handleStripeWebhookEvent(
        checkoutEvent("evt_conc_b", {
          email,
          sessionId: "cs_conc_mastery",
          packageId: "mastery",
          packageName: "Mastery",
        })
      ),
    ]);
    assert.equal(a.duplicate, false);
    assert.equal(b.duplicate, false);

    const client = (await mem.collection("client_records").doc(email).get()).data();
    const ids = [...((client?.processedCheckoutSessionIds as string[]) || [])].sort();
    assert.deepEqual(ids, ["cs_conc_foundations", "cs_conc_mastery"]);
    // Kickstart (2) + Operator (8) from the fallback package config.
    assert.equal(client?.sessionsRemaining, 10);
    assert.equal(client?.sessionsTotal, 10);
  });

  it("first-time checkout writes paid_pending_contract and grants sessions from package config", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    await processStripeEvent(checkoutEvent("evt_first", { sessionId: "cs_first" }));
    const client = (
      await mem.collection("client_records").doc("client@example.com").get()
    ).data();
    assert.equal(client?.status, "paid_pending_contract");
    assert.equal(client?.contractSignedAt, null);
    assert.equal(client?.magicLinkToken, null);
    assert.equal(client?.sessionsRemaining, 2);
    assert.equal(client?.sessionsTotal, 2);
    assert.deepEqual(client?.processedCheckoutSessionIds, ["cs_first"]);
    assert.equal(typeof client?.paidAt, "string");
    assert.equal(typeof client?.createdAt, "string");
    const member = (await mem.collection("members").doc("client@example.com").get())
      .data();
    assert.equal(member?.status, "active");
    assert.equal(member?.tier, "coaching");
  });

  it("subscription.deleted sets cancelled status when the stored DU stripeSubscriptionId matches", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const email = "installment@example.com";
    await mem.collection("client_records").doc(email).set({
      email,
      status: "onboarded",
      stripeSubscriptionId: "sub_alive",
      stripeCustomerId: "cus_alive",
      contractSignedAt: "2026-09-15T00:00:00.000Z",
    });
    await mem.collection("members").doc(email).set({
      email,
      status: "active",
      stripeSubscriptionId: "sub_alive",
      stripeCustomerId: "cus_alive",
    });

    const result = await handleStripeWebhookEvent(
      subscriptionDeletedEvent("evt_sub_del", {
        subscriptionId: "sub_alive",
        customerId: "cus_alive",
      })
    );
    assert.equal(result.duplicate, false);

    const client = (await mem.collection("client_records").doc(email).get()).data();
    const member = (await mem.collection("members").doc(email).get()).data();
    assert.equal(client?.status, "subscription_cancelled");
    assert.equal(client?.contractSignedAt, "2026-09-15T00:00:00.000Z");
    assert.equal(member?.status, "cancelled");
  });

  it("does not cancel a Runway (or other non-DU) subscription for the same email or customer", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const email = "shared@example.com";
    await mem.collection("client_records").doc(email).set({
      email,
      status: "onboarded",
      stripeSubscriptionId: "sub_du_coaching",
      stripeCustomerId: "cus_shared",
    });
    await mem.collection("members").doc(email).set({
      email,
      status: "active",
      stripeSubscriptionId: "sub_du_coaching",
      stripeCustomerId: "cus_shared",
    });

    await processStripeEvent(
      subscriptionDeletedEvent("evt_runway", {
        subscriptionId: "sub_runway_pro",
        customerId: "cus_shared",
        priceId: "price_runway_pro",
        productId: "prod_runway",
      })
    );

    const client = (await mem.collection("client_records").doc(email).get()).data();
    const member = (await mem.collection("members").doc(email).get()).data();
    assert.equal(client?.status, "onboarded");
    assert.equal(member?.status, "active");
  });

  it("cancels when the deleted sub is a DU coaching price even if stripeSubscriptionId was not stored", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    process.env.STRIPE_PRICE_MASTERY_3PAY = "price_du_mastery_3pay";
    const email = "allowlist@example.com";
    await mem.collection("client_records").doc(email).set({
      email,
      status: "onboarded",
      packageId: "mastery",
      stripeCustomerId: "cus_allow",
    });
    await mem.collection("members").doc(email).set({
      email,
      status: "active",
      packageId: "mastery",
      stripeCustomerId: "cus_allow",
    });

    await processStripeEvent(
      subscriptionDeletedEvent("evt_du_price", {
        subscriptionId: "sub_unrecorded",
        customerId: "cus_allow",
        priceId: "price_du_mastery_3pay",
        packageId: "mastery",
      })
    );

    const client = (await mem.collection("client_records").doc(email).get()).data();
    const member = (await mem.collection("members").doc(email).get()).data();
    assert.equal(client?.status, "subscription_cancelled");
    assert.equal(member?.status, "cancelled");
  });

  it("does not cancel a DU-priced sub when metadata.packageId disagrees with the client packageId", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    process.env.STRIPE_PRICE_MASTERY_3PAY = "price_du_mastery_3pay";
    const email = "pkg-mismatch@example.com";
    await mem.collection("client_records").doc(email).set({
      email,
      status: "onboarded",
      packageId: "foundations",
      stripeCustomerId: "cus_mismatch",
    });
    await mem.collection("members").doc(email).set({
      email,
      status: "active",
      packageId: "foundations",
      stripeCustomerId: "cus_mismatch",
    });

    await processStripeEvent(
      subscriptionDeletedEvent("evt_pkg_mismatch", {
        subscriptionId: "sub_unrecorded_mastery",
        customerId: "cus_mismatch",
        priceId: "price_du_mastery_3pay",
        packageId: "mastery",
      })
    );

    const client = (await mem.collection("client_records").doc(email).get()).data();
    const member = (await mem.collection("members").doc(email).get()).data();
    assert.equal(client?.status, "onboarded");
    assert.equal(member?.status, "active");
  });

  it("subscription.deleted with no matching DU client logs and does not throw", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const result = await processStripeEvent(
      subscriptionDeletedEvent("evt_sub_none", {
        subscriptionId: "sub_ghost",
        customerId: "cus_ghost",
      })
    );
    assert.equal(result.handled, true);
    assert.equal(mem.store.has("client_records/"), false);
    assert.equal(webhookLogs(mem.store).length, 1);
  });

  it("does not cancel via Stripe customer email fallback", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const email = "from-stripe@example.com";
    await mem.collection("client_records").doc(email).set({
      email,
      status: "onboarded",
    });
    setStripeForTests({
      customers: {
        retrieve: async () => ({
          id: "cus_fallback",
          deleted: false,
          email,
        }),
      },
    } as unknown as Stripe);

    await processStripeEvent(
      subscriptionDeletedEvent("evt_sub_fallback", {
        subscriptionId: "sub_missing",
        customerId: "cus_fallback",
      })
    );
    const client = (await mem.collection("client_records").doc(email).get()).data();
    assert.equal(client?.status, "onboarded");
  });

  it("invoice.paid records last paid timestamp on the matched client", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const email = "payer@example.com";
    await mem.collection("client_records").doc(email).set({
      email,
      status: "onboarded",
      stripeSubscriptionId: "sub_pay",
      contractSignedAt: "2026-09-01T00:00:00.000Z",
    });
    await mem.collection("members").doc(email).set({
      email,
      status: "active",
      stripeSubscriptionId: "sub_pay",
    });

    await processStripeEvent(
      invoiceEvent("invoice.paid", "evt_inv_paid", {
        subscriptionId: "sub_pay",
        customerId: "cus_pay",
        amount: 3300,
      })
    );

    const client = (await mem.collection("client_records").doc(email).get()).data();
    const member = (await mem.collection("members").doc(email).get()).data();
    assert.equal(client?.status, "onboarded");
    assert.equal(client?.contractSignedAt, "2026-09-01T00:00:00.000Z");
    assert.equal(client?.lastPaymentStatus, "paid");
    assert.equal(client?.lastInvoicePaidAmount, 3300);
    assert.equal(typeof client?.lastInvoicePaidAt, "string");
    assert.equal(member?.lastPaymentStatus, "paid");
    assert.equal(webhookLogs(mem.store).length, 1);
    assert.equal(mem.store.get("webhook_logs/evt_inv_paid")?.label, "invoice_paid");
  });

  it("invoice.payment_failed stamps failure without revoking access", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const email = "fail@example.com";
    await mem.collection("client_records").doc(email).set({
      email,
      status: "onboarded",
      stripeCustomerId: "cus_fail",
      sessionsRemaining: 4,
    });

    await processStripeEvent(
      invoiceEvent("invoice.payment_failed", "evt_inv_fail", {
        customerId: "cus_fail",
        subscriptionId: "sub_fail",
      })
    );

    const client = (await mem.collection("client_records").doc(email).get()).data();
    assert.equal(client?.status, "onboarded");
    assert.equal(client?.sessionsRemaining, 4);
    assert.equal(client?.lastPaymentStatus, "failed");
    assert.equal(typeof client?.lastInvoicePaymentFailedAt, "string");
  });

  it("does not duplicate webhook_logs rows when the same invoice event is processed twice", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const event = invoiceEvent("invoice.paid", "evt_inv_dup", {
      email: "nobody@example.com",
    });
    await processStripeEvent(event);
    await processStripeEvent(event);
    assert.equal(webhookLogs(mem.store).length, 1);
  });

  it("leaves a failed attempt claimed (not done) so a stale steal can retry", async () => {
    const mem = createMemoryFirestore({ throwOnClientSetTimes: 1 });
    setDbForTests(mem as unknown as Firestore);
    const event = checkoutEvent("evt_retry", { email: "retry@example.com" });

    await assert.rejects(
      () => handleStripeWebhookEvent(event),
      /simulated firestore write failure/
    );
    assert.equal(processedEvent(mem.store, "evt_retry")?.status, "claimed");

    await assert.rejects(
      () => handleStripeWebhookEvent(event),
      (err: unknown) => err instanceof StripeWebhookInFlightError
    );

    await mem.collection("stripe_processed_events").doc("evt_retry").set(
      {
        claimedAt: new Date(Date.now() - STRIPE_EVENT_CLAIM_TTL_MS - 5).toISOString(),
      },
      { merge: true }
    );

    const second = await handleStripeWebhookEvent(event);
    assert.equal(second.duplicate, false);
    if (!second.duplicate) assert.equal(second.handled, true);
    const client = (
      await mem.collection("client_records").doc("retry@example.com").get()
    ).data();
    assert.equal(client?.status, "paid_pending_contract");
    assert.equal(processedEvent(mem.store, "evt_retry")?.status, "done");
  });

  it("replay after a failed members write does not double-grant sessions", async () => {
    const mem = createMemoryFirestore({ throwOnMemberSetTimes: 1 });
    setDbForTests(mem as unknown as Firestore);
    const email = "member-retry@example.com";
    const event = checkoutEvent("evt_member_retry", {
      email,
      sessionId: "cs_member_retry",
    });

    await assert.rejects(
      () => handleStripeWebhookEvent(event),
      /simulated member write failure/
    );
    const afterGrant = (await mem.collection("client_records").doc(email).get()).data();
    assert.equal(afterGrant?.sessionsRemaining, 2);
    assert.deepEqual(afterGrant?.processedCheckoutSessionIds, ["cs_member_retry"]);
    assert.equal(mem.store.has(`members/${email}`), false);
    assert.equal(processedEvent(mem.store, "evt_member_retry")?.status, "claimed");

    await mem.collection("stripe_processed_events").doc("evt_member_retry").set(
      {
        claimedAt: new Date(Date.now() - STRIPE_EVENT_CLAIM_TTL_MS - 5).toISOString(),
      },
      { merge: true }
    );

    const stolen = await handleStripeWebhookEvent(event);
    assert.equal(stolen.duplicate, false);
    const client = (await mem.collection("client_records").doc(email).get()).data();
    const member = (await mem.collection("members").doc(email).get()).data();
    assert.equal(client?.sessionsRemaining, 2);
    assert.deepEqual(client?.processedCheckoutSessionIds, ["cs_member_retry"]);
    assert.equal(member?.status, "active");
    assert.equal(member?.tier, "coaching");
    assert.equal(member?.email, email);
  });

  it("POST /api/webhooks/stripe returns 2xx duplicate without a second write", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const event = checkoutEvent("evt_http_dup");
    setStripeForTests({
      webhooks: {
        constructEvent: () => event,
      },
    } as unknown as Stripe);
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock";

    const request = () =>
      new NextRequest("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=fake" },
        body: JSON.stringify({ id: event.id }),
      });

    const first = await POST(request());
    assert.equal(first.status, 200);
    assert.deepEqual(await first.json(), { received: true, handled: true });

    const second = await POST(request());
    assert.equal(second.status, 200);
    assert.deepEqual(await second.json(), { received: true, duplicate: true });
    assert.equal(webhookLogs(mem.store).length, 1);
  });

  it("POST /api/webhooks/stripe returns 500 for a fresh in-flight claim", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const event = checkoutEvent("evt_http_inflight");
    await mem.collection("stripe_processed_events").doc(event.id).create({
      eventId: event.id,
      type: event.type,
      status: "claimed",
      claimedAt: new Date().toISOString(),
    });
    setStripeForTests({
      webhooks: {
        constructEvent: () => event,
      },
    } as unknown as Stripe);
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock";

    const res = await POST(
      new NextRequest("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=fake" },
        body: JSON.stringify({ id: event.id }),
      })
    );
    assert.equal(res.status, 500);
    assert.equal(processedEvent(mem.store, event.id)?.status, "claimed");
  });

  it("unsigned or bad-signature POST creates no stripe_processed_events doc", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    setStripeForTests({
      webhooks: {
        constructEvent: () => {
          throw new Error("No signatures found matching the expected signature");
        },
      },
    } as unknown as Stripe);
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock";

    const unsigned = await POST(
      new NextRequest("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: JSON.stringify({ id: "evt_unsigned" }),
      })
    );
    assert.equal(unsigned.status, 400);

    const bad = await POST(
      new NextRequest("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=not-valid" },
        body: JSON.stringify({ id: "evt_bad_sig" }),
      })
    );
    assert.equal(bad.status, 400);

    for (const key of mem.store.keys()) {
      assert.equal(key.startsWith("stripe_processed_events/"), false);
    }
  });
});

function coachingInvoiceEvent(
  type: "invoice.paid" | "invoice.payment_failed",
  id: string,
  args: {
    invoiceId: string;
    email: string;
    subscriptionId: string;
    packageId?: string;
    planId?: string;
    amount?: number;
    clientName?: string;
  }
): Stripe.Event {
  return {
    id,
    type,
    data: {
      object: {
        id: args.invoiceId,
        object: "invoice",
        customer: "cus_coach",
        customer_email: args.email,
        amount_paid: args.amount ?? 83400,
        amount_due: args.amount ?? 83400,
        parent: {
          subscription_details: {
            subscription: args.subscriptionId,
            metadata: {
              packageId: args.packageId ?? "mastery",
              planId: args.planId ?? "3pay",
              clientName: args.clientName ?? "Ada Client",
            },
          },
        },
      },
    },
  } as unknown as Stripe.Event;
}

/** Stripe stand-in whose subscription schedule is already bounded to `months`. */
function boundedScheduleStripe(months: number): Stripe {
  const start = Math.floor(Date.UTC(2026, 9, 1) / 1000);
  const end = new Date(start * 1000);
  end.setUTCMonth(end.getUTCMonth() + months);
  const schedule = {
    id: "sched_coach",
    end_behavior: "cancel",
    phases: [{ start_date: start, end_date: Math.floor(end.getTime() / 1000) }],
  };
  return {
    subscriptions: {
      retrieve: async () => ({
        id: "sub_coach",
        schedule: "sched_coach",
        items: { data: [{ price: { id: "price_coach" } }] },
      }),
    },
    subscriptionSchedules: {
      retrieve: async () => schedule,
      update: async () => schedule,
      create: async () => schedule,
    },
  } as unknown as Stripe;
}

function storeRows(store: Map<string, Stored>, name: string): Stored[] {
  return [...store.entries()]
    .filter(([key]) => key.startsWith(`${name}/`))
    .map(([, row]) => row);
}

describe("stripe payments update the contact", () => {
  it("a paid full checkout writes one payment row, moves the pipeline card to won, and logs it once", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const email = "won@example.com";
    await mem.collection("coaching_applications").doc("app_won").set({
      email,
      name: "Won Client",
      status: "proposal_sent",
      createdAt: "2026-09-01T00:00:00.000Z",
    });

    await handleStripeWebhookEvent(checkoutEvent("evt_pay_full", { email, sessionId: "cs_full" }));
    await handleStripeWebhookEvent(checkoutEvent("evt_pay_full_redelivered", { email, sessionId: "cs_full" }));

    const payments = storeRows(mem.store, "client_payments");
    assert.equal(payments.length, 1);
    const payment = mem.store.get("client_payments/stripe_cs_cs_full");
    assert.equal(payment?.email, email);
    assert.equal(payment?.method, "stripe");
    assert.equal(payment?.amount, 9700);
    assert.equal(payment?.currency, "usd");
    assert.equal(payment?.packageId, "foundations");
    assert.equal(payment?.planId, "full");
    assert.equal(payment?.installmentNumber, 1);
    assert.equal(payment?.stripeSessionId, "cs_full");

    const app = mem.store.get("coaching_applications/app_won");
    assert.equal(app?.status, "won");
    assert.equal(app?.packageId, "foundations");
    assert.equal(app?.closeValue, 750);
    assert.equal(app?.wonSource, "stripe");
    assert.match(String(app?.wonNote), /Stripe checkout cs_full/);
    assert.equal(storeRows(mem.store, "coaching_applications").length, 1);

    const activity = storeRows(mem.store, "activity_log");
    assert.equal(activity.filter((r) => r.type === "payment").length, 1);
    assert.equal(activity.filter((r) => r.type === "stage_change").length, 1);
    assert.equal(webhookLogs(mem.store).length, 2);
  });

  it("creates a won pipeline card when the buyer has none, and grants the package membership", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const email = "new-buyer@example.com";
    await processStripeEvent(
      checkoutEvent("evt_new_buyer", {
        email,
        sessionId: "cs_mastery_full",
        packageId: "mastery",
        packageName: "Operator",
        clientName: "New Buyer",
      })
    );
    const app = mem.store.get(`coaching_applications/paid_${email}`);
    assert.equal(app?.status, "won");
    assert.equal(app?.email, email);
    assert.equal(app?.name, "New Buyer");
    assert.equal(app?.source, "stripe_checkout");
    assert.equal(app?.packageId, "mastery");

    const account = mem.store.get(`learn_accounts/${email}`);
    const grants = (account?.grants || []) as Array<Record<string, unknown>>;
    assert.equal(grants.length, 1);
    assert.equal(grants[0]?.source, "coaching");
    const months =
      (new Date(String(grants[0]?.expiresAt)).getTime() - Date.now()) / (30 * 86400000);
    assert.ok(months > 2.8 && months < 3.2, `Operator includes 3 months, got ${months}`);
  });

  it("installments: the first invoice is not counted twice and later invoices number up", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    setStripeForTests(boundedScheduleStripe(3));
    const email = "installments@example.com";

    // invoice.paid for the first invoice can arrive before the checkout event.
    await handleStripeWebhookEvent(
      coachingInvoiceEvent("invoice.paid", "evt_inv_1", {
        invoiceId: "in_first",
        email,
        subscriptionId: "sub_coach",
      })
    );
    const checkout = checkoutEvent("evt_inst_checkout", {
      email,
      sessionId: "cs_inst",
      packageId: "mastery",
      packageName: "Operator",
      subscriptionId: "sub_coach",
    });
    const session = checkout.data.object as unknown as Record<string, unknown>;
    session.invoice = "in_first";
    session.amount_total = 83400;
    session.metadata = { planId: "3pay", packageId: "mastery", packageName: "Operator", clientName: "Ada" };
    await handleStripeWebhookEvent(checkout);

    assert.equal(storeRows(mem.store, "client_payments").length, 1, "one row for the first invoice");
    assert.equal(mem.store.get("client_payments/stripe_inv_in_first")?.installmentNumber, 1);

    await handleStripeWebhookEvent(
      coachingInvoiceEvent("invoice.paid", "evt_inv_2", {
        invoiceId: "in_second",
        email,
        subscriptionId: "sub_coach",
      })
    );
    await handleStripeWebhookEvent(
      coachingInvoiceEvent("invoice.paid", "evt_inv_2_again", {
        invoiceId: "in_second",
        email,
        subscriptionId: "sub_coach",
      })
    );
    const second = mem.store.get("client_payments/stripe_inv_in_second");
    assert.equal(second?.installmentNumber, 2);
    assert.equal(second?.amount, 83400);
    assert.equal(second?.stripeSubscriptionId, "sub_coach");
    assert.equal(storeRows(mem.store, "client_payments").length, 2);
    assert.equal(
      storeRows(mem.store, "activity_log").filter((r) => r.type === "payment").length,
      2
    );
    assert.equal(mem.store.get(`coaching_applications/paid_${email}`)?.status, "won");
    assert.equal(mem.store.get(`coaching_applications/paid_${email}`)?.closeValue, 2502);
    assert.equal(
      mem.store.get(`payment_schedules/${email}__mastery`),
      undefined,
      "Stripe bills its own installments, so no crypto schedule"
    );
  });

  it("a failed invoice flags the contact; the next paid invoice clears it", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const email = "flag@example.com";
    await mem.collection("client_records").doc(email).set({
      email,
      status: "onboarded",
      stripeSubscriptionId: "sub_flag",
      sessionsRemaining: 8,
    });
    await processStripeEvent(
      coachingInvoiceEvent("invoice.payment_failed", "evt_flag_fail", {
        invoiceId: "in_flag_2",
        email,
        subscriptionId: "sub_flag",
      })
    );
    let client = mem.store.get(`client_records/${email}`);
    assert.equal(client?.paymentFailed, true);
    assert.equal(typeof client?.paymentFailedAt, "string");
    assert.equal(client?.status, "onboarded");
    assert.equal(client?.sessionsRemaining, 8);
    const notes = storeRows(mem.store, "activity_log").filter((r) => r.title === "Stripe payment failed");
    assert.equal(notes.length, 1);
    assert.match(String(notes[0]?.description), /Stripe could not collect \$834/);
    assert.equal(storeRows(mem.store, "client_payments").length, 0);

    await processStripeEvent(
      coachingInvoiceEvent("invoice.paid", "evt_flag_paid", {
        invoiceId: "in_flag_2",
        email,
        subscriptionId: "sub_flag",
      })
    );
    client = mem.store.get(`client_records/${email}`);
    assert.equal(client?.paymentFailed, false);
    assert.equal(client?.paymentFailedAt, null);
  });

  it("subscription.deleted adds a timeline note", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const email = "ended@example.com";
    await mem.collection("client_records").doc(email).set({
      email,
      status: "onboarded",
      stripeSubscriptionId: "sub_ended",
    });
    await processStripeEvent(subscriptionDeletedEvent("evt_ended", { subscriptionId: "sub_ended" }));
    const notes = storeRows(mem.store, "activity_log").filter(
      (r) => r.email === email && r.title === "Stripe subscription ended"
    );
    assert.equal(notes.length, 1);
    assert.equal(notes[0]?.type, "note");
  });

  it("ignores invoices that are not for a coaching package", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    await processStripeEvent(
      coachingInvoiceEvent("invoice.paid", "evt_other_product", {
        invoiceId: "in_other",
        email: "other@example.com",
        subscriptionId: "sub_other",
        packageId: "runway_pro",
      })
    );
    assert.equal(storeRows(mem.store, "client_payments").length, 0);
    assert.equal(storeRows(mem.store, "coaching_applications").length, 0);
  });
});
