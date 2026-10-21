/**
 * Member accounts: Google sign-in, linked emails, "Your plans and billing"
 * on /account, the Stripe customer portal, portal links that sign the
 * client in, booking from /account, the agreement link and Telegram.
 *   npx tsx scripts/test-account-billing.ts
 */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Firestore } from "firebase-admin/firestore";
import type Stripe from "stripe";
import { NextRequest } from "next/server";
import { setDbForTests } from "../lib/firebase-admin";
import { setSendEmailForTests, type SendEmailOptions } from "../lib/gmail";
import { getAccess, grantAccess } from "../lib/account/access";
import { setGoogleVerifierForTests } from "../lib/account/google";
import { linkEmail, primaryEmailFor, unlinkEmail } from "../lib/account/links";
import { redeemLoginToken } from "../lib/account/login";
import { setAccountEmailForTests, verifyAccountSession } from "../lib/account/session";
import { getBillingSummary } from "../lib/account/billing";
import { setStripeForTests } from "../lib/coaching/stripe";
import { POST as googleLogin } from "../app/api/account/login/google/route";
import { DELETE as unlinkRoute, POST as linkRoute } from "../app/api/account/link/route";
import { POST as billingPortal } from "../app/api/account/billing-portal/route";
import { GET as coachingPortal } from "../app/api/account/coaching-portal/route";
import { GET as portalLink } from "../app/portal/[token]/route";
import { POST as contractRequest } from "../app/api/account/contract/request/route";
import { DELETE as telegramDelete, POST as telegramPost } from "../app/api/account/telegram/route";
import { POST as bookSession } from "../app/api/coaching/sessions/book/route";
import { issueMagicLink } from "../lib/coaching/portal-auth";
import { getAccountOverview } from "../lib/account/overview";
import { createMemoryFirestore, type MemoryFirestore } from "./fixtures/memory-firestore";

const ORIGIN = "https://defiuniversity.xyz";
const ADA = "ada@gmail.com";
const ADA_SKOOL = "ada@work.example";
const DAY = 86_400_000;

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
  process.env.JWT_SECRET = "test-account-billing";
  process.env.NEXT_PUBLIC_SITE_URL = ORIGIN;
  process.env.SENDER_EMAIL = "hello@defiuniversity.xyz";
});

afterEach(() => {
  setGoogleVerifierForTests(null);
  setAccountEmailForTests(undefined);
  setStripeForTests(undefined);
  setSendEmailForTests(undefined);
});

function jsonPost(path: string, body: unknown, method = "POST", origin = ORIGIN): NextRequest {
  return new NextRequest(`${ORIGIN}${path}`, {
    method,
    headers: { "content-type": "application/json", origin, "x-forwarded-for": `10.0.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` },
    body: JSON.stringify(body),
  });
}

function tokenFromEmail(mail: SendEmailOptions): string {
  const match = /token=([a-f0-9]{64})/.exec(String(mail.text));
  assert.ok(match, "email carries a sign-in token");
  return match[1]!;
}

async function doc(path: string): Promise<Record<string, unknown> | undefined> {
  return mem.store.get(path);
}

describe("Google sign-in", () => {
  it("creates the account and signs in with a verified Google email", async () => {
    setGoogleVerifierForTests(async () => ({ email: "Ada@Gmail.com", email_verified: true, name: "Ada Lovelace" }));
    const res = await googleLogin(jsonPost("/api/account/login/google", { idToken: "tok", next: "/university" }));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, next: "/university" });
    const cookie = res.cookies.get("du_account");
    assert.equal(cookie?.httpOnly, true);
    assert.deepEqual(await verifyAccountSession(cookie?.value), { valid: true, email: ADA });
    assert.equal(res.cookies.get("du_signed_in")?.value, "1");
    const account = await doc(`learn_accounts/${ADA}`);
    assert.equal(account?.lastSignInMethod, "google");
    assert.ok(account?.createdAt);
  });

  it("refuses unverified emails, bad tokens and other sites", async () => {
    setGoogleVerifierForTests(async () => ({ email: ADA, email_verified: false }));
    assert.equal((await googleLogin(jsonPost("/api/account/login/google", { idToken: "tok" }))).status, 401);
    setGoogleVerifierForTests(async () => {
      throw new Error("expired");
    });
    assert.equal((await googleLogin(jsonPost("/api/account/login/google", { idToken: "tok" }))).status, 401);
    setGoogleVerifierForTests(async () => ({ email: ADA, email_verified: true }));
    const cross = await googleLogin(jsonPost("/api/account/login/google", { idToken: "tok" }, "POST", "https://evil.example"));
    assert.equal(cross.status, 403);
    assert.equal(mem.store.has(`learn_accounts/${ADA}`), false);
  });

  it("never sends someone to another site or to admin after sign-in", async () => {
    setGoogleVerifierForTests(async () => ({ email: ADA, email_verified: true }));
    const res = await googleLogin(jsonPost("/api/account/login/google", { idToken: "tok", next: "//evil.example" }));
    assert.equal((await res.json()).next, "/account");
  });
});

describe("Linked emails", () => {
  it("adds a Skool email by confirmation link and merges access", async () => {
    await grantAccess(ADA_SKOOL, { source: "skool" });
    setAccountEmailForTests(ADA);
    const res = await linkRoute(jsonPost("/api/account/link", { email: ADA_SKOOL }));
    assert.equal(res.status, 200);
    assert.equal(sent.length, 1);
    assert.equal(sent[0]!.to, ADA_SKOOL);
    assert.match(String(sent[0]!.subject), /Confirm this email/);
    // Not linked until the link in that inbox is opened.
    assert.equal((await getAccess(ADA)).hasCourseAccess, false);

    const redeemed = await redeemLoginToken(tokenFromEmail(sent[0]!));
    assert.deepEqual(redeemed, { email: ADA, next: "/account", linked: ADA_SKOOL });
    const access = await getAccess(ADA);
    assert.deepEqual(access.emails, [ADA, ADA_SKOOL]);
    assert.equal(access.hasMembership, true);
    assert.equal(access.hasCourseAccess, true);
    assert.equal(await primaryEmailFor(ADA_SKOOL), ADA);
  });

  it("signs in with a linked email as the primary account", async () => {
    await linkEmail(ADA, ADA_SKOOL);
    setGoogleVerifierForTests(async () => ({ email: ADA_SKOOL, email_verified: true }));
    const res = await googleLogin(jsonPost("/api/account/login/google", { idToken: "tok" }));
    assert.deepEqual(await verifyAccountSession(res.cookies.get("du_account")?.value), { valid: true, email: ADA });
  });

  it("refuses emails already on this or another account", async () => {
    setAccountEmailForTests(ADA);
    assert.equal((await linkRoute(jsonPost("/api/account/link", { email: ADA }))).status, 409);
    await linkEmail("bob@example.com", ADA_SKOOL);
    assert.equal((await linkRoute(jsonPost("/api/account/link", { email: ADA_SKOOL }))).status, 409);
    assert.equal(sent.length, 0);
    setAccountEmailForTests(null);
    assert.equal((await linkRoute(jsonPost("/api/account/link", { email: "new@example.com" }))).status, 401);
  });

  it("a stale link token reports failure instead of stealing an email", async () => {
    setAccountEmailForTests(ADA);
    await linkRoute(jsonPost("/api/account/link", { email: ADA_SKOOL }));
    await linkEmail("bob@example.com", ADA_SKOOL);
    const redeemed = await redeemLoginToken(tokenFromEmail(sent[0]!));
    assert.equal(redeemed?.email, ADA);
    assert.ok(redeemed?.linkError);
    assert.equal(await primaryEmailFor(ADA_SKOOL), "bob@example.com");
  });

  it("removes a linked email", async () => {
    await linkEmail(ADA, ADA_SKOOL);
    setAccountEmailForTests(ADA);
    assert.equal((await unlinkRoute(jsonPost("/api/account/link", { email: ADA_SKOOL }, "DELETE"))).status, 200);
    assert.deepEqual((await getAccess(ADA)).emails, [ADA]);
    assert.equal(await primaryEmailFor(ADA_SKOOL), ADA_SKOOL);
    assert.equal(await unlinkEmail(ADA, ADA_SKOOL), false);
  });
});

async function seedClient(email: string, extra: Record<string, unknown>) {
  await mem.collection("client_records").doc(email).set({
    email,
    packageId: "mastery",
    packageName: "Operator",
    status: "onboarded",
    sessionsRemaining: 8,
    sessionsTotal: 12,
    paidAt: "2026-10-01T15:00:00.000Z",
    ...extra,
  });
}

async function seedPayment(id: string, row: Record<string, unknown>) {
  await mem.collection("client_payments").doc(id).set({
    email: ADA,
    currency: "usd",
    packageId: "mastery",
    planId: "3pay",
    note: "",
    source: "stripe_webhook",
    actor: null,
    createdAt: String(row.paidAt),
    ...row,
  });
}

describe("Plans and billing", () => {
  it("shows a card installment plan with the next charge and the card button", async () => {
    await seedClient(ADA, { planId: "3pay", stripeCustomerId: "cus_1" });
    await grantAccess(ADA, { source: "coaching", expiresAt: "2027-01-01T15:00:00.000Z" });
    await seedPayment("p1", { method: "stripe", amount: 83400, paidAt: "2026-10-01T15:00:00.000Z", installmentNumber: 1 });
    const billing = await getBillingSummary(await getAccess(ADA));
    const c = billing.coaching!;
    assert.equal(c.packageName, "Operator");
    assert.equal(c.statusLabel, "Active");
    assert.equal(c.installments, 3);
    assert.equal(c.installmentsPaid, 1);
    assert.deepEqual(c.nextDue, { amount: 83400, dueDate: "2026-11-01", estimated: true });
    assert.equal(c.accessEndsAt, "2027-01-01T15:00:00.000Z");
    assert.equal(c.hasStripeCustomer, true);
    assert.equal(c.method, "stripe");
    assert.equal(billing.skool, null);
  });

  it("shows the next crypto installment from the schedule", async () => {
    await seedClient(ADA, { planId: "3pay", paymentSource: "crypto" });
    await seedPayment("p1", { method: "crypto", amount: 83400, paidAt: "2026-10-01T15:00:00.000Z", installmentNumber: 1, source: "crypto_notice" });
    await mem.collection("payment_schedules").doc(`${ADA}__mastery`).set({
      email: ADA,
      packageId: "mastery",
      planId: "3pay",
      installments: [
        { number: 1, amount: 83400, dueDate: "2026-10-01", paidAt: "2026-10-01T15:00:00.000Z", paymentId: "p1" },
        { number: 2, amount: 83400, dueDate: "2026-11-01", paidAt: null, paymentId: null },
        { number: 3, amount: 83400, dueDate: "2026-12-01", paidAt: null, paymentId: null },
      ],
    });
    const c = (await getBillingSummary(await getAccess(ADA))).coaching!;
    assert.equal(c.method, "crypto");
    assert.equal(c.installmentsPaid, 1);
    assert.deepEqual(c.nextDue, { amount: 83400, dueDate: "2026-11-01", estimated: false });
    assert.equal(c.hasStripeCustomer, false);
  });

  it("finds coaching and Skool under a linked email", async () => {
    await linkEmail(ADA, ADA_SKOOL);
    await grantAccess(ADA_SKOOL, { source: "skool" });
    await mem.collection("client_records").doc(ADA_SKOOL).set({ email: ADA_SKOOL, packageId: "foundations", packageName: "Kickstart", status: "paid_pending_contract" });
    const access = await getAccess(ADA);
    assert.equal(access.clientEmail, ADA_SKOOL);
    const billing = await getBillingSummary(access);
    assert.equal(billing.skool?.paying, true);
    assert.equal(billing.coaching?.packageName, "Kickstart");
    assert.equal(billing.coaching?.statusLabel, "Paid, agreement to sign");
  });

  it("shows the Skool seat that comes with coaching", async () => {
    const now = Date.now();
    await mem.collection("skool_access").doc(ADA).set({
      email: ADA,
      packageId: "mastery",
      startsAt: new Date(now - DAY).toISOString(),
      endsAt: new Date(now + 30 * DAY).toISOString(),
      status: "invited",
    });
    const billing = await getBillingSummary(await getAccess(ADA), now);
    assert.equal(billing.skool?.paying, false);
    assert.equal(billing.skool?.coachingSeat?.status, "invited");
  });

  it("shows nothing to manage for a free account and a never-ending manual grant as full access", async () => {
    assert.deepEqual(await getBillingSummary(await getAccess(ADA)), { skool: null, coaching: null, manual: null });
    await grantAccess(ADA, { source: "manual", expiresAt: null });
    assert.deepEqual((await getBillingSummary(await getAccess(ADA))).manual, { endsAt: null });
  });
});

function fakeStripe(calls: Record<string, unknown[]>, opts: { failConfig?: boolean } = {}): Stripe {
  const push = (k: string, v: unknown) => (calls[k] ||= []).push(v);
  return {
    customers: {
      list: async (args: unknown) => {
        push("customers.list", args);
        return { data: [{ id: "cus_found" }] };
      },
    },
    billingPortal: {
      configurations: {
        create: async (args: unknown) => {
          push("configurations.create", args);
          if (opts.failConfig) throw new Error("restricted key");
          return { id: "bpc_1" };
        },
      },
      sessions: {
        create: async (args: unknown) => {
          push("sessions.create", args);
          return { url: "https://billing.stripe.com/p/session/test" };
        },
      },
    },
  } as unknown as Stripe;
}

describe("Stripe customer portal", () => {
  it("opens the portal for the client's customer with cancelling turned off", async () => {
    await seedClient(ADA, { stripeCustomerId: "cus_1" });
    const calls: Record<string, unknown[]> = {};
    setStripeForTests(fakeStripe(calls));
    setAccountEmailForTests(ADA);
    const res = await billingPortal(jsonPost("/api/account/billing-portal", {}));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { url: "https://billing.stripe.com/p/session/test" });
    const config = calls["configurations.create"]![0] as { features: Record<string, { enabled: boolean }> };
    assert.equal(config.features.subscription_cancel!.enabled, false);
    assert.equal(config.features.payment_method_update!.enabled, true);
    assert.deepEqual(calls["sessions.create"]![0], { customer: "cus_1", return_url: `${ORIGIN}/account`, configuration: "bpc_1" });
    assert.equal(calls["customers.list"], undefined);

    // The portal settings are made once and reused.
    await billingPortal(jsonPost("/api/account/billing-portal", {}));
    assert.equal(calls["configurations.create"]!.length, 1);
  });

  it("falls back to the customer found by email and to Stripe's default settings", async () => {
    const calls: Record<string, unknown[]> = {};
    setStripeForTests(fakeStripe(calls, { failConfig: true }));
    setAccountEmailForTests(ADA);
    const res = await billingPortal(jsonPost("/api/account/billing-portal", {}));
    assert.equal(res.status, 200);
    assert.deepEqual(calls["sessions.create"]![0], { customer: "cus_found", return_url: `${ORIGIN}/account` });
  });

  it("needs a signed-in account and a same-site request", async () => {
    setStripeForTests(fakeStripe({}));
    setAccountEmailForTests(null);
    assert.equal((await billingPortal(jsonPost("/api/account/billing-portal", {}))).status, 401);
    setAccountEmailForTests(ADA);
    assert.equal((await billingPortal(jsonPost("/api/account/billing-portal", {}, "POST", "https://evil.example"))).status, 403);
  });
});

describe("One login for coaching clients", () => {
  it("sends old coaching-portal links to the coaching section of the account", async () => {
    await seedClient(ADA, {});
    setAccountEmailForTests(ADA);
    const res = await coachingPortal();
    assert.equal(res.status, 307);
    assert.equal(res.headers.get("location"), `${ORIGIN}/account#coaching`);
    setAccountEmailForTests(null);
    assert.equal((await coachingPortal()).headers.get("location"), `${ORIGIN}/login?next=/account`);
  });

  it("signs the client in from an emailed portal link and lands on /account", async () => {
    await seedClient(ADA, { name: "Ada Lovelace" });
    const link = await issueMagicLink(ADA, { source: "admin" });
    const token = link.url!.split("/portal/")[1]!;
    const res = await portalLink(new NextRequest(`${ORIGIN}/portal/${token}`), { params: Promise.resolve({ token }) });
    assert.equal(res.status, 307);
    assert.equal(res.headers.get("location"), `${ORIGIN}/account`);
    assert.deepEqual(await verifyAccountSession(res.cookies.get("du_account")?.value), { valid: true, email: ADA });
    assert.equal((await doc(`learn_accounts/${ADA}`))?.lastSignInMethod, "portal_link");
  });

  it("opens the primary account when the coaching email is a linked one", async () => {
    await seedClient(ADA_SKOOL, {});
    await linkEmail(ADA, ADA_SKOOL);
    const link = await issueMagicLink(ADA_SKOOL, { source: "admin" });
    const token = link.url!.split("/portal/")[1]!;
    const res = await portalLink(new NextRequest(`${ORIGIN}/portal/${token}`), { params: Promise.resolve({ token }) });
    assert.deepEqual(await verifyAccountSession(res.cookies.get("du_account")?.value), { valid: true, email: ADA });
  });

  it("works once: a second click on the same link goes to sign in", async () => {
    await seedClient(ADA, {});
    const link = await issueMagicLink(ADA, { source: "admin" });
    const token = link.url!.split("/portal/")[1]!;
    const first = await portalLink(new NextRequest(`${ORIGIN}/portal/${token}`), { params: Promise.resolve({ token }) });
    assert.equal(first.headers.get("location"), `${ORIGIN}/account`);
    const again = await portalLink(new NextRequest(`${ORIGIN}/portal/${token}`), { params: Promise.resolve({ token }) });
    assert.equal(again.headers.get("location"), `${ORIGIN}/login?next=/account&expired=1`);
    assert.equal(again.cookies.get("du_account"), undefined);
  });

  it("keeps a past client's coaching area, agreement and messages, but not booking", async () => {
    await seedClient(ADA, { status: "completed", sessionsRemaining: 0, contractSignedAt: "2026-04-02T15:00:00.000Z", signedContractPdfUrl: "firestore:sig_1" });
    setAccountEmailForTests(ADA);
    const access = await getAccess(ADA);
    assert.equal(access.clientEmail, null, "a completed package is not a live client");
    const overview = await getAccountOverview({ email: ADA, access });
    assert.equal(overview.coaching?.client.status, "completed");
    assert.deepEqual(await (await contractRequest(jsonPost("/api/account/contract/request", {}))).json(), { ok: true, signed: true });
    const booking = await bookSession(jsonPost("/api/coaching/sessions/book", { startTime: "2026-11-02T15:00:00.000Z" }));
    assert.equal(booking.status, 403);
    assert.match(String((await booking.json()).error), /has ended/);
    assert.equal((await telegramPost(jsonPost("/api/account/telegram", { handle: "@ada_lovelace" }))).status, 200);
  });

  it("sends an expired or unknown portal link to sign in", async () => {
    await seedClient(ADA, {});
    const link = await issueMagicLink(ADA, { source: "admin" });
    const token = link.url!.split("/portal/")[1]!;
    await mem.collection("client_records").doc(ADA).set({ magicLinkExpiresAt: new Date(Date.now() - DAY).toISOString() }, { merge: true });
    const res = await portalLink(new NextRequest(`${ORIGIN}/portal/${token}`), { params: Promise.resolve({ token }) });
    assert.equal(res.headers.get("location"), `${ORIGIN}/login?next=/account&expired=1`);
    assert.equal(res.cookies.get("du_account"), undefined);
    const bad = await portalLink(new NextRequest(`${ORIGIN}/portal/nope`), { params: Promise.resolve({ token: "nope" }) });
    assert.equal(bad.headers.get("location"), `${ORIGIN}/login?next=/account&expired=1`);
  });
});

describe("Booking from the account", () => {
  it("needs a signed-in coaching client with a signed agreement and sessions left", async () => {
    setAccountEmailForTests(null);
    assert.equal((await bookSession(jsonPost("/api/coaching/sessions/book", { startTime: "2026-11-02T15:00:00.000Z" }))).status, 401);
    setAccountEmailForTests(ADA);
    assert.equal((await bookSession(jsonPost("/api/coaching/sessions/book", { startTime: "2026-11-02T15:00:00.000Z" }))).status, 403);
    await seedClient(ADA, { status: "paid_pending_contract" });
    const unsigned = await bookSession(jsonPost("/api/coaching/sessions/book", { startTime: "2026-11-02T15:00:00.000Z" }));
    assert.equal(unsigned.status, 403);
    assert.match(String((await unsigned.json()).error), /Sign your coaching agreement/);
    await seedClient(ADA, { contractSignedAt: "2026-10-02T15:00:00.000Z", sessionsRemaining: 0 });
    const spent = await bookSession(jsonPost("/api/coaching/sessions/book", { startTime: "2026-11-02T15:00:00.000Z" }));
    assert.equal(spent.status, 403);
    assert.match(String((await spent.json()).error), /all the sessions/);
    assert.equal((await bookSession(jsonPost("/api/coaching/sessions/book", {}))).status, 400);
  });
});

describe("Agreement link from the account", () => {
  it("reuses the pending signing link from the agreement email", async () => {
    await seedClient(ADA, { status: "paid_pending_contract", planId: "3pay" });
    await mem.collection("contract_signatures").doc("sig1").set({
      clientId: ADA,
      packageId: "mastery",
      status: "pending",
      signUrl: `${ORIGIN}/coaching/sign/abc123`,
      expiresAt: new Date(Date.now() + 3 * DAY).toISOString(),
      createdAt: "2026-10-02T15:00:00.000Z",
    });
    setAccountEmailForTests(ADA);
    const res = await contractRequest(jsonPost("/api/account/contract/request", {}));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, signUrl: `${ORIGIN}/coaching/sign/abc123` });
  });

  it("says so when the agreement is already signed, and refuses strangers", async () => {
    await seedClient(ADA, { contractSignedAt: "2026-10-02T15:00:00.000Z" });
    setAccountEmailForTests(ADA);
    assert.deepEqual(await (await contractRequest(jsonPost("/api/account/contract/request", {}))).json(), { ok: true, signed: true });
    setAccountEmailForTests("nobody@example.com");
    assert.equal((await contractRequest(jsonPost("/api/account/contract/request", {}))).status, 404);
    setAccountEmailForTests(null);
    assert.equal((await contractRequest(jsonPost("/api/account/contract/request", {}))).status, 401);
  });
});

describe("Telegram username", () => {
  it("refuses a cross-site request before touching anything", async () => {
    await seedClient(ADA, {});
    setAccountEmailForTests(ADA);
    const foreign = await telegramPost(jsonPost("/api/account/telegram", { handle: "@ada_lovelace" }, "POST", "https://evil.example"));
    assert.equal(foreign.status, 403);
    assert.equal((await doc(`client_records/${ADA}`))?.telegramHandle, undefined);
    const booking = await bookSession(jsonPost("/api/coaching/sessions/book", { startTime: "2026-11-02T15:00:00.000Z" }, "POST", "https://evil.example"));
    assert.equal(booking.status, 403);
    assert.equal((await contractRequest(jsonPost("/api/account/contract/request", {}, "POST", "https://evil.example"))).status, 403);
  });

  it("saves a normalised username on the client record and can forget it", async () => {
    await seedClient(ADA, {});
    setAccountEmailForTests(ADA);
    const res = await telegramPost(jsonPost("/api/account/telegram", { handle: "@Ada_Lovelace " }));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, handle: "ada_lovelace" });
    assert.equal((await doc(`client_records/${ADA}`))?.telegramHandle, "ada_lovelace");
    assert.equal((await telegramPost(jsonPost("/api/account/telegram", { handle: "https://t.me/AdaLove" }))).status, 200);
    assert.equal((await doc(`client_records/${ADA}`))?.telegramHandle, "adalove");
    assert.equal((await telegramPost(jsonPost("/api/account/telegram", { handle: "ab" }))).status, 400);
    assert.equal((await telegramPost(jsonPost("/api/account/telegram", { handle: "bad handle!" }))).status, 400);
    assert.equal((await telegramDelete(jsonPost("/api/account/telegram", {}, "DELETE"))).status, 200);
    assert.equal((await doc(`client_records/${ADA}`))?.telegramHandle, null);
  });

  it("is for coaching clients only", async () => {
    setAccountEmailForTests(ADA);
    assert.equal((await telegramPost(jsonPost("/api/account/telegram", { handle: "ada" }))).status, 403);
    setAccountEmailForTests(null);
    assert.equal((await telegramPost(jsonPost("/api/account/telegram", { handle: "ada" }))).status, 401);
  });
});
