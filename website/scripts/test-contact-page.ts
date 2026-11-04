import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import type { Firestore } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { setDbForTests } from "../lib/firebase-admin";
import { setSendEmailForTests, type SendEmailOptions } from "../lib/gmail";
import { COOKIE_NAME, createAdminSession } from "../lib/auth/admin-session-cookie";
import { ADMIN_1TO1_FOOTER_TEXT, duSenderOrBlockReason } from "../lib/crm/admin-1to1-email";
import { CRM_CONTACTS_COLLECTION } from "../lib/crm/contacts";
import { getContactDetail } from "../lib/crm/contact-detail";
import {
  CONTACT_EMAIL_TEMPLATE_IDS,
  contactEmailTemplate,
} from "../lib/crm/contact-email-templates";
import { adminNav, adminNavGroups } from "../lib/admin/navigation";
import { buildInstallmentSchedule, markInstallmentPaid } from "../lib/coaching/payments";
import { POST as postContactSend } from "../app/api/admin/contacts/[email]/send/route";
import { POST as postContactOptOut } from "../app/api/admin/contacts/[email]/opt-out/route";
import { POST as postContactNote } from "../app/api/admin/contacts/[email]/notes/route";
import { GET as getContact } from "../app/api/admin/contacts/[email]/route";
import { createMemoryFirestore, rows, type MemoryFirestore } from "./fixtures/memory-firestore";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://fromaitobusiness.com";

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
  process.env.JWT_SECRET = "test-contact-page";
  process.env.NEXT_PUBLIC_SITE_URL = ORIGIN;
  process.env.SENDER_EMAIL = "hello@fromaitobusiness.com";
});

afterEach(() => {
  setDbForTests(undefined);
  setSendEmailForTests(undefined);
});

async function request(
  url: string,
  body: unknown,
  opts: { cookie?: boolean; bearer?: boolean; origin?: string | null; method?: string } = {}
) {
  const token = await createAdminSession("david");
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opts.cookie !== false) headers.cookie = `${COOKIE_NAME}=${token}`;
  if (opts.bearer) headers.authorization = `Bearer ${token}`;
  if (opts.origin !== null) headers.origin = opts.origin ?? ORIGIN;
  return new NextRequest(url, {
    method: opts.method || "POST",
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function params(email: string) {
  return { params: Promise.resolve({ email: encodeURIComponent(email) }) };
}

function sendBody(extra: Record<string, unknown> = {}) {
  return {
    mode: "send",
    subject: "Checking in",
    body: "Hi Ada, how is the first week going?",
    adKind: "personal",
    approvedByDavid: true,
    idempotencyKey: "key-1",
    ...extra,
  };
}

async function contactSend(email: string, body: Record<string, unknown>, opts = {}) {
  const req = await request(
    `http://localhost/api/admin/contacts/${encodeURIComponent(email)}/send`,
    body,
    opts
  );
  return postContactSend(req, params(email));
}

async function seedClient(email = "ada@example.com", extra: Record<string, unknown> = {}) {
  await mem.collection("client_records").doc(email).set({
    email,
    name: "Ada Client",
    packageId: "mastery",
    planId: "3pay",
    status: "onboarded",
    sessionsRemaining: 8,
    sessionsTotal: 8,
    ...extra,
  });
}

describe("contact page 1:1 send (any known contact)", () => {
  it("sends to a client with no crm_contacts row, with the locked footer, log, and touchpoint", async () => {
    await seedClient();
    const res = await contactSend("ada@example.com", sendBody());
    assert.equal(res.status, 200);
    const payload = (await res.json()) as { text: string; pipelineStatus: unknown };
    assert.equal(payload.pipelineStatus, null);
    assert.ok(payload.text.includes(ADMIN_1TO1_FOOTER_TEXT));
    assert.match(payload.text, /Unsubscribe: https:\/\/fromaitobusiness\.com\//);
    assert.equal(sent.length, 1);
    assert.equal(sent[0]?.purpose, "marketing");
    assert.equal(sent[0]?.log.source, "admin_1to1");
    assert.equal(sent[0]?.log.approvedByDavid, true);
    assert.ok(sent[0]?.unsubscribeUrl);
    const logs = rows(mem.store, "emailLog").map(([, r]) => r);
    assert.equal(logs.length, 1);
    assert.equal(logs[0]?.status, "sent");
    assert.equal(logs[0]?.crmContactId, null);
    assert.equal(rows(mem.store, "touchpoints").length, 1);
    assert.equal(rows(mem.store, CRM_CONTACTS_COLLECTION).length, 0, "no crm_contacts row is created");
  });

  it("returns 404 for an address the site does not know", async () => {
    const unknown = await contactSend("stranger@example.com", sendBody());
    assert.equal(unknown.status, 404);
    assert.equal(sent.length, 0);
  });

  it("blocks suppressed, unsubscribed, internal, and DNC contacts", async () => {
    await seedClient();
    await mem.collection("email_suppressions").doc("ada@example.com").set({ reason: "unsubscribe" });
    assert.equal((await contactSend("ada@example.com", sendBody())).status, 403);

    await mem.collection("leads").doc("lead@example.com").set({ email: "lead@example.com", status: "unsubscribed" });
    const lead = await contactSend("lead@example.com", sendBody({ idempotencyKey: "k-lead" }));
    assert.equal(lead.status, 403);
    assert.equal(((await lead.json()) as { error: string }).error, "opted_out");

    await seedClient("ops@apexleader.com");
    const internal = await contactSend("ops@apexleader.com", sendBody({ idempotencyKey: "k-int" }));
    assert.equal(((await internal.json()) as { error: string }).error, "internal");

    await mem.collection(CRM_CONTACTS_COLLECTION).doc("dnc@example.com").set({
      email: "dnc@example.com",
      canonicalEmail: "dnc@example.com",
      name: "Dee",
      pipelineStatus: "new",
      doNotContact: true,
      hubspotOptedOut: false,
      hubspotBounced: false,
      manualOnly: true,
      internal: false,
    });
    const dnc = await contactSend("dnc@example.com", sendBody({ idempotencyKey: "k-dnc" }));
    assert.equal(((await dnc.json()) as { error: string }).error, "do_not_contact");
    assert.equal(sent.length, 0);
  });

  it("keeps approval, ad kind, holdings ack, idempotency, and the 24h limit", async () => {
    await seedClient();
    const noApproval = await contactSend("ada@example.com", sendBody({ approvedByDavid: false }));
    assert.equal(noApproval.status, 400);
    const noKind = await contactSend("ada@example.com", sendBody({ adKind: "" }));
    assert.equal(((await noKind.json()) as { error: string }).error, "ad_kind_required");
    const holdings = await contactSend(
      "ada@example.com",
      sendBody({ body: "Payment 2 of 3 ($834) is due." })
    );
    assert.equal(((await holdings.json()) as { error: string }).error, "holdings_education_ack_required");

    const ok = await contactSend("ada@example.com", sendBody());
    assert.equal(ok.status, 200);
    const replay = await contactSend("ada@example.com", sendBody());
    assert.equal(replay.status, 200);
    assert.equal(((await replay.json()) as { idempotent: boolean }).idempotent, true);
    const second = await contactSend("ada@example.com", sendBody({ idempotencyKey: "key-2" }));
    assert.equal(second.status, 429);
    assert.equal(sent.length, 1);
  });

  it("requires an admin cookie (not bearer) and a same-site Origin", async () => {
    await seedClient();
    assert.equal((await contactSend("ada@example.com", sendBody(), { cookie: false, bearer: true })).status, 401);
    assert.equal((await contactSend("ada@example.com", sendBody(), { origin: null })).status, 403);
    assert.equal((await contactSend("ada@example.com", sendBody(), { origin: "https://evil.example" })).status, 403);
    assert.equal(sent.length, 0);
  });

  it("marks a non-HubSpot contact opted out and then blocks sends", async () => {
    await seedClient();
    const req = await request("http://localhost/api/admin/contacts/ada%40example.com/opt-out", undefined);
    const res = await postContactOptOut(req, params("ada@example.com"));
    assert.equal(res.status, 200);
    assert.equal(mem.store.get("email_suppressions/ada@example.com")?.reason, "replied_stop");
    assert.equal((await contactSend("ada@example.com", sendBody())).status, 403);
  });
});

describe("contact detail", () => {
  it("joins pipeline, client, payments, schedule, access, and timeline", async () => {
    await seedClient("ada@example.com", { paymentFailed: true, paymentFailedAt: "2026-10-02T00:00:00.000Z" });
    await mem.collection("coaching_applications").doc("app1").set({
      email: "ada@example.com",
      name: "Ada Client",
      status: "won",
      packageId: "mastery",
      closeValue: 2502,
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-15T00:00:00.000Z",
    });
    await mem.collection("client_payments").doc("manual_x").set({
      email: "ada@example.com",
      method: "manual",
      amount: 83400,
      currency: "usd",
      paidAt: "2026-09-15T16:00:00.000Z",
      packageId: "mastery",
      planId: "3pay",
      installmentNumber: 1,
    });
    const schedule = markInstallmentPaid(
      buildInstallmentSchedule({
        email: "ada@example.com",
        packageId: "mastery",
        packageName: "Operator",
        planId: "3pay",
        installments: 3,
        perPayment: 83400,
        startDate: "2026-09-15",
      }),
      { paidAt: "2026-09-15T16:00:00.000Z", paymentId: "manual_x" }
    ).schedule;
    await mem.collection("payment_schedules").doc("ada@example.com__mastery").set(
      schedule as unknown as Record<string, unknown>
    );
    await mem.collection("learn_accounts").doc("ada@example.com").set({
      email: "ada@example.com",
      grants: [{ source: "coaching", grantedAt: "2026-09-15T00:00:00.000Z", expiresAt: "2099-01-01T00:00:00.000Z" }],
    });
    await mem.collection("activity_log").add({
      email: "ada@example.com",
      type: "payment",
      title: "Crypto payment $834",
      at: "2026-09-15T16:00:00.000Z",
    });

    const detail = await getContactDetail("ADA@example.com");
    assert.ok(detail);
    if (!detail) return;
    assert.equal(detail.name, "Ada Client");
    assert.equal(detail.pipeline?.status, "won");
    assert.equal(detail.packageName, "Operator");
    assert.equal(detail.planId, "3pay");
    assert.equal(detail.money.paid, 83400);
    assert.equal(detail.money.owed, 166800);
    assert.deepEqual(detail.money.nextDue, { dueDate: "2026-10-15", amount: 83400, source: "schedule" });
    assert.equal(detail.access.hasMembership, true);
    assert.equal(detail.access.hasCourseAccess, true);
    assert.equal(detail.access.membershipExpiresAt, "2099-01-01T00:00:00.000Z");
    assert.equal(detail.client?.paymentFailed, true);
    assert.equal(detail.emailable, true);
    assert.equal(detail.payments.length, 1);
    assert.ok(detail.timeline.some((e) => e.type === "payment"));
    assert.equal(detail.packages.length, 3);
  });

  it("GET returns 404 for an unknown address and the notes route writes a timeline note", async () => {
    const getReq = await request("http://localhost/api/admin/contacts/x%40example.com", undefined, {
      method: "GET",
    });
    assert.equal((await getContact(getReq, params("x@example.com"))).status, 404);

    await seedClient();
    const noteReq = await request("http://localhost/api/admin/contacts/ada%40example.com/notes", {
      text: "Prefers Tuesday calls",
    });
    assert.equal((await postContactNote(noteReq, params("ada@example.com"))).status, 200);
    const detail = await getContactDetail("ada@example.com");
    assert.ok(detail?.timeline.some((e) => e.type === "note" && e.description === "Prefers Tuesday calls"));
  });
});

describe("contact page UI contract", () => {
  it("templates fill the payment reminder with facts and avoid em dashes and reply subjects", () => {
    for (const id of CONTACT_EMAIL_TEMPLATE_IDS) {
      const t = contactEmailTemplate(id, {
        name: "Ada Client",
        packageName: "Operator",
        packagePrice: 2500,
        amountDue: 83400,
        dueDate: "2026-10-15",
        installmentNumber: 2,
        installments: 3,
        payUrl: "https://fromaitobusiness.com/coaching/pay",
      });
      assert.equal(`${t.subject}${t.body}`.includes("—"), false, id);
      assert.equal(/^\s*(re|fwd|fw)\s*:/i.test(t.subject), false, id);
      assert.match(t.body, /^Hi Ada,/, id);
    }
    const reminder = contactEmailTemplate("payment_reminder", {
      name: "Ada",
      packageName: "Operator",
      amountDue: 83400,
      dueDate: "2026-10-15",
      installmentNumber: 2,
      installments: 3,
      payUrl: "https://fromaitobusiness.com/coaching/pay",
    });
    assert.match(reminder.body, /Payment 2 of 3 for Operator \(\$834\) is due on October 15, 2026\./);
    assert.match(reminder.body, /https:\/\/fromaitobusiness\.com\/coaching\/pay/);
  });

  it("renders Intake, Syllabus and Recordings through ContactClientArea", () => {
    const area = join(root, "components/admin/crm/ContactClientArea.tsx");
    assert.ok(existsSync(area));
    const areaSrc = readFileSync(area, "utf8");
    assert.match(areaSrc, /export function ContactClientArea/);
    assert.match(areaSrc, /<SyllabusEditor email=\{email\} \/>/);
    assert.match(areaSrc, /<ClientIntake /);
    assert.match(areaSrc, /\/files`/);
    assert.match(readFileSync(join(root, "components/admin/crm/SyllabusEditor.tsx"), "utf8"), /\/syllabus`/);
    assert.match(readFileSync(join(root, "components/admin/crm/ClientIntake.tsx"), "utf8"), /\/intake`/);
    const page = readFileSync(join(root, "app/admin/(crm)/contacts/[email]/page.tsx"), "utf8");
    assert.match(page, /<ContactClientArea email=\{data\.email\} section="intake"/);
    assert.match(page, /<ContactClientArea email=\{data\.email\} section="syllabus" \/>/);
    assert.match(page, /<ContactClientArea email=\{data\.email\} section="recordings" \/>/);
  });

  it("links pipeline cards, the client page, People rows, and nav to the new pages", () => {
    const pipeline = readFileSync(join(root, "app/admin/(crm)/coaching/page.tsx"), "utf8");
    assert.match(pipeline, /\/admin\/contacts\/\$\{encodeURIComponent/);
    assert.match(pipeline, /\/admin\/coaching\/payments-due/);
    const client = readFileSync(join(root, "app/admin/(crm)/coaching/[clientId]/page.tsx"), "utf8");
    assert.match(client, /\/admin\/contacts\//);
    const people = readFileSync(join(root, "components/admin/SubscribersTab.tsx"), "utf8");
    assert.match(people, /router\.push\(`\/admin\/contacts\//);
    assert.ok(adminNav.some((item) => item.href === "/admin/coaching/payments-due"));
    assert.ok(
      adminNavGroups
        .find((g) => g.id === "pipeline")
        ?.items.some((item) => item.href === "/admin/coaching/payments-due")
    );
    const composer = readFileSync(join(root, "components/admin/crm/ContactEmailComposer.tsx"), "utf8");
    assert.match(composer, /\/api\/admin\/contacts\/\$\{encodeURIComponent\(email\)\}\/send/);
    assert.match(composer, /ADMIN_1TO1_PERSONAL_OFFER_ACK_TEXT/);
    assert.match(composer, /Approved by David/);
  });
});

describe("1:1 sender domain", () => {
  afterEach(() => {
    process.env.SENDER_EMAIL = "hello@fromaitobusiness.com";
    delete process.env.SENDER_DOMAINS;
  });

  it("refuses a mailbox outside the brand's domain by default", () => {
    process.env.SENDER_EMAIL = "coach@example.org";
    assert.deepEqual(duSenderOrBlockReason(), { ok: false, error: "sender_not_du_domain" });
  });

  it("allows the production mailbox when SENDER_DOMAINS names its domain", () => {
    process.env.SENDER_EMAIL = "coach@example.org";
    process.env.SENDER_DOMAINS = "example.org";
    assert.deepEqual(duSenderOrBlockReason(), { ok: true, email: "coach@example.org" });
  });
});
