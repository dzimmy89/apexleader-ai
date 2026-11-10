import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { Firestore } from "firebase-admin/firestore";
import { setDbForTests } from "../lib/firebase-admin";
import { sendEmail, setSendEmailForTests } from "../lib/gmail";
import { enrollFlow, triggerFlow, type PendingEmail } from "../lib/flows";
import { captureLead, confirmLeadByEmail } from "../lib/crm/leads";
import { executeProcessFlows } from "../lib/crm/process-flows-runner";
import { CRM_CONTACTS_COLLECTION, canonicalEmail, isManualOnlyContact } from "../lib/crm/contacts";
import { calendarGuestNotifyMode } from "../lib/coaching/calendar";
import { MARKETING_SENDS_ENV } from "../lib/marketing-sends";

type Stored = Record<string, unknown>;

function createMemoryFirestore() {
  const store = new Map<string, Stored>();
  const collection = (name: string) => ({
    doc(id: string) {
      const key = `${name}/${id}`;
      return {
        id,
        async get() {
          const data = store.get(key);
          return { exists: data !== undefined, data: () => data, id };
        },
        async set(data: Stored, options?: { merge?: boolean }) {
          const next = options?.merge ? { ...(store.get(key) || {}), ...data } : data;
          store.set(key, JSON.parse(JSON.stringify(next)) as Stored);
        },
        async create(data: Stored) {
          if (store.has(key)) throw new Error("already exists");
          store.set(key, JSON.parse(JSON.stringify(data)) as Stored);
        },
      };
    },
    async add(data: Stored) {
      const id = `auto_${store.size + 1}`;
      store.set(`${name}/${id}`, JSON.parse(JSON.stringify(data)) as Stored);
      return { id };
    },
    where(field: string, op: string, value: unknown) {
      const filters: Array<{ field: string; value: unknown }> = [{ field, value }];
      if (op !== "==") throw new Error(`unsupported ${op}`);
      const q = {
        where(f: string, o: string, v: unknown) {
          if (o !== "==") throw new Error(`unsupported ${o}`);
          filters.push({ field: f, value: v });
          return q;
        },
        async get() {
          const docs: Array<{ id: string; data: () => Stored }> = [];
          for (const [docKey, data] of store) {
            if (!docKey.startsWith(`${name}/`)) continue;
            const ok = filters.every((flt) => data[flt.field] === flt.value);
            if (!ok) continue;
            docs.push({
              id: docKey.slice(name.length + 1),
              data: () => data,
            });
          }
          return { empty: docs.length === 0, docs, size: docs.length };
        },
      };
      return q;
    },
  });
  return { collection, store };
}

function logsFor(store: Map<string, Stored>, email: string): Stored[] {
  const out: Stored[] = [];
  for (const [key, value] of store) {
    if (key.startsWith("emailLog/") && value.to === email) out.push(value);
  }
  return out;
}

function flowCount(store: Map<string, Stored>): number {
  let n = 0;
  for (const key of store.keys()) {
    if (key.startsWith("flows/")) n++;
  }
  return n;
}

const MANUAL = "sales-list@example.com";

async function seedManual(mem: ReturnType<typeof createMemoryFirestore>) {
  setDbForTests(mem as unknown as Firestore);
  await mem.collection(CRM_CONTACTS_COLLECTION).doc(MANUAL).set({
    email: MANUAL,
    manualOnly: true,
    salesList: "hubspot",
    source: "hubspot_import",
  });
}

describe("manual-only sales list guard", () => {
  afterEach(() => {
    setDbForTests(undefined);
    setSendEmailForTests(undefined);
  });

  it("isManualOnlyContact blocks unless manualOnly is explicitly false", async () => {
    const mem = createMemoryFirestore();
    await seedManual(mem);
    await mem.collection(CRM_CONTACTS_COLLECTION).doc("open@example.com").set({
      email: "open@example.com",
      manualOnly: false,
    });
    await mem.collection(CRM_CONTACTS_COLLECTION).doc("missing-flag@example.com").set({
      email: "missing-flag@example.com",
    });
    await mem.collection(CRM_CONTACTS_COLLECTION).doc("null-flag@example.com").set({
      email: "null-flag@example.com",
      manualOnly: null,
    });
    await mem.collection(CRM_CONTACTS_COLLECTION).doc("malformed-flag@example.com").set({
      email: "malformed-flag@example.com",
      manualOnly: "yes",
    });
    assert.equal(await isManualOnlyContact(MANUAL), true);
    assert.equal(await isManualOnlyContact("open@example.com"), false);
    assert.equal(await isManualOnlyContact("missing@example.com"), false);
    assert.equal(await isManualOnlyContact("missing-flag@example.com"), true);
    assert.equal(await isManualOnlyContact("null-flag@example.com"), true);
    assert.equal(await isManualOnlyContact("malformed-flag@example.com"), true);
  });

  it("canonical gmail keys match dotted, plus-tagged, and googlemail aliases", async () => {
    const mem = createMemoryFirestore();
    setDbForTests(mem as unknown as Firestore);
    const listed = "j.smith@gmail.com";
    await mem.collection(CRM_CONTACTS_COLLECTION).doc(listed).set({
      email: listed,
      canonicalEmail: canonicalEmail(listed),
      manualOnly: true,
      salesList: "hubspot",
    });
    assert.equal(canonicalEmail("j.smith@gmail.com"), "jsmith@gmail.com");
    assert.equal(canonicalEmail("jsmith@gmail.com"), "jsmith@gmail.com");
    assert.equal(canonicalEmail("j.smith+x@gmail.com"), "jsmith@gmail.com");
    assert.equal(canonicalEmail("j.smith@googlemail.com"), "jsmith@gmail.com");
    assert.equal(await isManualOnlyContact("j.smith@gmail.com"), true);
    assert.equal(await isManualOnlyContact("jsmith@gmail.com"), true);
    assert.equal(await isManualOnlyContact("j.smith+x@gmail.com"), true);
    assert.equal(await isManualOnlyContact("j.smith@googlemail.com"), true);
  });

  it("calendar guest notify mode omits attendees and sendUpdates for manual-only", () => {
    assert.deepEqual(calendarGuestNotifyMode(true), {
      sendUpdates: "none",
      includeAttendee: false,
    });
    assert.deepEqual(calendarGuestNotifyMode(false), {
      sendUpdates: "all",
      includeAttendee: true,
    });
  });

  it("sendEmail skips with emailLog skipped/manual_only_contact and never calls the provider hook", async () => {
    const mem = createMemoryFirestore();
    await seedManual(mem);
    let hooked = 0;
    setSendEmailForTests(async () => {
      hooked++;
      return { ok: true, messageId: "should-not-send" };
    });
    const result = await sendEmail({
      to: MANUAL,
      subject: "broadcast",
      html: "<p>hi</p>",
      text: "hi",
      unsubscribeUrl: "https://fromaitobusiness.com/api/unsubscribe?token=t",
      purpose: "marketing",
      log: { source: "broadcast:test" },
    });
    assert.equal(result.ok, false);
    assert.equal(result.skipped, true);
    assert.equal(result.error, "manual_only_contact");
    assert.equal(hooked, 0);
    const logs = logsFor(mem.store, MANUAL);
    assert.equal(logs.length, 1);
    assert.equal(logs[0]?.status, "skipped");
    assert.equal(logs[0]?.error, "manual_only_contact");
    assert.ok(logs.every((l) => l.status !== "sent" && l.status !== "failed"));
  });

  it("allowManualOnlyContact is the only sendEmail bypass", async () => {
    const mem = createMemoryFirestore();
    await seedManual(mem);
    let hooked = 0;
    setSendEmailForTests(async () => {
      hooked++;
      return { ok: true, messageId: "manual-ok" };
    });
    const result = await sendEmail({
      to: MANUAL,
      subject: "1:1",
      html: "<p>hi</p>",
      allowManualOnlyContact: true,
      log: { source: "admin_compose" },
    });
    assert.equal(result.ok, true);
    assert.equal(hooked, 1);
  });

  it("captureLead stamps self-signup and sends confirm; crm_contacts.manualOnly stays true", async () => {
    const mem = createMemoryFirestore();
    await seedManual(mem);
    const prevJwt = process.env.JWT_SECRET;
    const prevGmail = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    process.env.JWT_SECRET = "test-confirm-token-secret";
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY = "mock-gmail-present";
    delete process.env[MARKETING_SENDS_ENV];
    let hooked = 0;
    setSendEmailForTests(async () => {
      hooked++;
      return { ok: true, messageId: "confirm" };
    });
    try {
      const result = await captureLead({
        email: MANUAL,
        source: "checklist_lp",
        leadMagnet: "coaching_qualifier",
      });
      assert.equal(result.ok, true);
      assert.equal(result.emailSent, true);
      assert.equal(hooked, 1);
      const lead = (await mem.collection("leads").doc(MANUAL).get()).data();
      assert.equal(lead?.selfSignup, true);
      assert.equal(lead?.selfSignupSource, "checklist_lp");
      assert.equal(typeof lead?.selfSignupAt, "string");
      const contact = (await mem.collection(CRM_CONTACTS_COLLECTION).doc(MANUAL).get()).data();
      assert.equal(contact?.manualOnly, true);
    } finally {
      if (prevJwt === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = prevJwt;
      if (prevGmail === undefined) delete process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      else process.env.GOOGLE_SERVICE_ACCOUNT_KEY = prevGmail;
    }
  });

  it("triggerFlow/enrollFlow refuse to create a flow", async () => {
    const mem = createMemoryFirestore();
    await seedManual(mem);
    const enrolled = await enrollFlow("coaching_nurture", `lead:${encodeURIComponent(MANUAL)}`, MANUAL);
    assert.equal(enrolled.created, false);
    assert.equal(enrolled.blocked, "manual_only_contact");
    const id = await triggerFlow("coaching_nurture", `lead:${encodeURIComponent(MANUAL)}`, MANUAL);
    assert.equal(id, null);
    assert.equal(flowCount(mem.store), 0);
  });

  it("confirmLeadByEmail does not enroll a flow for a listed contact", async () => {
    const mem = createMemoryFirestore();
    await seedManual(mem);
    await mem.collection("leads").doc(MANUAL).set({
      email: MANUAL,
      status: "pending",
      leadMagnet: "coaching_qualifier",
      emailOptIn: true,
      consent: { given: true, textVersion: "t", formSource: "web", requestedAt: new Date().toISOString() },
    });
    const result = await confirmLeadByEmail(MANUAL);
    assert.equal(result.ok, true);
    assert.equal(result.flowDocId == null, true);
    assert.equal(flowCount(mem.store), 0);
  });

  it("process-flows skips without sending", async () => {
    const mem = createMemoryFirestore();
    await seedManual(mem);
    const pending: PendingEmail[] = [
      {
        flowDocId: "flow-1",
        flowType: "coaching_nurture",
        userId: MANUAL,
        email: MANUAL,
        stepIndex: 0,
        step: {
          stepId: "coaching_reminder",
          sendAt: new Date(Date.now() - 1000).toISOString(),
          sentAt: null,
          skipped: false,
        },
      },
    ];
    let sendCalls = 0;
    let skipped = 0;
    const result = await executeProcessFlows({
      dryRun: false,
      blocked: null,
      pending,
      loadLead: async () => undefined,
      loadManualOnly: (email) => isManualOnlyContact(email),
      loadFirstName: async () => "",
      effects: {
        sendEmail: async () => {
          sendCalls++;
          return { ok: true };
        },
        unsubscribeUrlFor: async () =>
          "https://fromaitobusiness.com/api/unsubscribe?token=t",
        getTemplate: () => ({ subject: "x", html: "<p>x</p>", text: "x" }),
        claimStepForSend: async () => ({ ok: true, claimId: "c1" }),
        recordSendReceipt: async () => undefined,
        releaseStepClaim: async () => undefined,
        markStepSent: async () => undefined,
        markStepSkipped: async () => {
          skipped++;
        },
        markStepAttemptFailed: async () => "ignored",
        exitFlow: async () => undefined,
      },
    });
    assert.equal(result.dryRun, false);
    if (result.dryRun) throw new Error("expected live");
    assert.equal(sendCalls, 0);
    assert.equal(result.skipped, 1);
    assert.equal(skipped, 1);
    assert.equal(result.sent, 0);
  });

  it("executeProcessFlows throws when loadManualOnly is omitted", async () => {
    await assert.rejects(
      () =>
        executeProcessFlows({
          dryRun: false,
          blocked: null,
          pending: [],
          loadLead: async () => undefined,
          loadFirstName: async () => "",
          effects: {
            sendEmail: async () => ({ ok: true }),
            unsubscribeUrlFor: async () => "https://fromaitobusiness.com/u",
            getTemplate: () => ({ subject: "x", html: "<p>x</p>" }),
            claimStepForSend: async () => ({ ok: true, claimId: "c" }),
            recordSendReceipt: async () => undefined,
            releaseStepClaim: async () => undefined,
            markStepSent: async () => undefined,
            markStepSkipped: async () => undefined,
            markStepAttemptFailed: async () => "ignored",
            exitFlow: async () => undefined,
          },
        }),
      /loadManualOnly/
    );
  });
});
