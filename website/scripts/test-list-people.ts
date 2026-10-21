import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { initializeApp } from "firebase-admin/app";
import {
  FieldPath,
  getFirestore,
  type Firestore,
} from "firebase-admin/firestore";
import { setDbForTests } from "../lib/firebase-admin";
import { NextRequest } from "next/server";
import { GET as getSubscribers } from "../app/api/admin/subscribers/route";
import { COOKIE_NAME, createAdminSession } from "../lib/auth/admin-session-cookie";
import { listPeople } from "../lib/crm/list-people";
import {
  decodePeopleCursor,
  encodePeopleCursor,
  InvalidPeopleCursorError,
  mergeEmailSorted,
  personNameLower,
  prefixBounds,
} from "../lib/crm/people-search";

describe("people-search helpers", () => {
  it("lowercases the first non-empty name part", () => {
    assert.equal(personNameLower(" Ada ", "ignored"), "ada");
    assert.equal(personNameLower(undefined, "Zelda Nominee"), "zelda nominee");
    assert.equal(personNameLower("", "  "), "");
  });

  it("builds an inclusive prefix range", () => {
    const { start, end } = prefixBounds("zel");
    assert.equal(start, "zel");
    assert.equal(end.startsWith("zel"), true);
    assert.ok(end > "zelda");
  });

  it("round-trips cursors", () => {
    const encoded = encodePeopleCursor({
      stage: "name",
      afterEmail: "a@example.com",
      afterNameLower: "ada",
    });
    assert.deepEqual(decodePeopleCursor(encoded), {
      stage: "name",
      afterEmail: "a@example.com",
      afterNameLower: "ada",
    });
  });

  it("merges email-sorted streams with member winning duplicates", () => {
    const merged = mergeEmailSorted(
      [
        { email: "a@x.com", kind: "lead", value: "L-a" },
        { email: "c@x.com", kind: "lead", value: "L-c" },
      ],
      [
        { email: "a@x.com", kind: "member", value: "M-a" },
        { email: "b@x.com", kind: "member", value: "M-b" },
      ],
      10
    );
    assert.deepEqual(
      merged.map((row) => `${row.kind}:${row.email}`),
      ["member:a@x.com", "member:b@x.com", "lead:c@x.com"]
    );
  });

  it("rejects a malformed cursor", async () => {
    await assert.rejects(
      () => listPeople({ cursor: "not-a-cursor", limit: 10 }),
      InvalidPeopleCursorError
    );
    await assert.rejects(
      () =>
        listPeople({
          cursor: Buffer.from("{}").toString("base64url"),
          limit: 10,
        }),
      InvalidPeopleCursorError
    );
  });
});

function firestoreIndexError(): Error {
  const err = new Error(
    "9 FAILED_PRECONDITION: The query requires an index. You can create it here: https://example"
  );
  Object.assign(err, { code: 9 });
  return err;
}

function createIndexMissingFirestore() {
  const chain: {
    where: () => typeof chain;
    orderBy: () => typeof chain;
    limit: () => typeof chain;
    startAt: () => typeof chain;
    endAt: () => typeof chain;
    startAfter: () => typeof chain;
    get: () => Promise<never>;
    count: () => { get: () => Promise<never> };
  } = {
    where: () => chain,
    orderBy: () => chain,
    limit: () => chain,
    startAt: () => chain,
    endAt: () => chain,
    startAfter: () => chain,
    get: async () => {
      throw firestoreIndexError();
    },
    count: () => ({
      get: async () => {
        throw firestoreIndexError();
      },
    }),
  };
  return {
    collection() {
      return {
        ...chain,
        doc() {
          return {
            async get() {
              return { exists: false, id: "", data: () => undefined };
            },
          };
        },
      };
    },
  };
}

describe("listPeople when composite indexes are missing", () => {
  it("status + email search returns empty with indexPending and does not throw", async () => {
    setDbForTests(createIndexMissingFirestore() as unknown as Firestore);
    try {
      const result = await listPeople({
        type: "lead",
        search: "zzz-needle@example.com",
        status: "confirmed",
        limit: 50,
      });
      assert.equal(result.indexPending, true);
      assert.deepEqual(result.people, []);
      assert.equal(result.hasMore, false);
    } finally {
      setDbForTests(undefined);
    }
  });
});

describe("unfiltered lead list uses document-id order only", () => {
  it("does not add where clauses or extra orderBy fields on leads", async () => {
    const calls: Array<{
      collection: string;
      wheres: unknown[][];
      orderBys: unknown[];
    }> = [];

    function chainFor(collection: string) {
      const rec = {
        collection,
        wheres: [] as unknown[][],
        orderBys: [] as unknown[],
      };
      const chain: {
        where: (...args: unknown[]) => typeof chain;
        orderBy: (field: unknown) => typeof chain;
        limit: () => typeof chain;
        startAt: () => typeof chain;
        endAt: () => typeof chain;
        startAfter: () => typeof chain;
        get: () => Promise<{ docs: []; empty: true; size: 0 }>;
        count: () => {
          get: () => Promise<{ data: () => { count: number } }>;
        };
      } = {
        where: (...args: unknown[]) => {
          rec.wheres.push(args);
          return chain;
        },
        orderBy: (field: unknown) => {
          rec.orderBys.push(field);
          return chain;
        },
        limit: () => chain,
        startAt: () => chain,
        endAt: () => chain,
        startAfter: () => chain,
        get: async () => {
          calls.push({
            collection: rec.collection,
            wheres: [...rec.wheres],
            orderBys: [...rec.orderBys],
          });
          return { docs: [], empty: true, size: 0 };
        },
        count: () => ({
          get: async () => {
            calls.push({
              collection: rec.collection,
              wheres: [...rec.wheres],
              orderBys: [...rec.orderBys],
            });
            return { data: () => ({ count: 0 }) };
          },
        }),
      };
      return chain;
    }

    setDbForTests({
      collection(name: string) {
        return chainFor(name);
      },
    } as unknown as Firestore);
    try {
      await listPeople({ type: "lead", limit: 50 });
    } finally {
      setDbForTests(undefined);
    }

    const leadCalls = calls.filter((c) => c.collection === "leads");
    assert.ok(leadCalls.length >= 1);
    for (const call of leadCalls) {
      assert.deepEqual(call.wheres, []);
      for (const field of call.orderBys) {
        assert.ok(
          field instanceof FieldPath && field.isEqual(FieldPath.documentId()),
          "lead list may only order by document id"
        );
      }
    }
    assert.equal(
      calls.some((c) => c.collection === "members"),
      false
    );
    assert.equal(
      calls.some((c) => c.collection === "crm_contacts"),
      false,
      "listPeople must not read crm_contacts"
    );
  });
});

describe("GET /api/admin/subscribers cursor", () => {
  it("returns 400 for a garbled cursor", async () => {
    const savedJwt = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "test-list-people-cursor";
    try {
      const token = await createAdminSession("apex_team");
      const req = new NextRequest(
        "http://localhost/api/admin/subscribers?cursor=not-a-cursor",
        { headers: { cookie: `${COOKIE_NAME}=${token}` } }
      );
      const res = await getSubscribers(req);
      assert.equal(res.status, 400);
      const body = (await res.json()) as { error?: string };
      assert.equal(body.error, "Invalid cursor");
    } finally {
      if (savedJwt === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = savedJwt;
    }
  });
});

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const PROJECT_ID = "demo-apexleader-people";
const LEAD_COUNT = 760;
const HIDDEN_EMAIL = "zzz-needle@example.com";

describe("listPeople emulator", async () => {
  assert.ok(
    emulatorHost,
    "FIRESTORE_EMULATOR_HOST is required (run under firebase emulators:exec)"
  );

  const app = initializeApp({ projectId: PROJECT_ID }, "list-people-test");
  const db = getFirestore(app);
  setDbForTests(db as unknown as Firestore);

  async function writeBatch(
    collection: string,
    docs: Array<{ id: string; data: Record<string, unknown> }>
  ) {
    let batch = db.batch();
    let n = 0;
    for (const doc of docs) {
      batch.set(db.collection(collection).doc(doc.id), doc.data);
      n += 1;
      if (n === 400) {
        await batch.commit();
        batch = db.batch();
        n = 0;
      }
    }
    if (n) await batch.commit();
  }

  before(async () => {
    setDbForTests(db as unknown as Firestore);
    const leads: Array<{ id: string; data: Record<string, unknown> }> = [];
    for (let i = 0; i < LEAD_COUNT; i += 1) {
      const email = `a${String(i).padStart(4, "0")}@example.com`;
      leads.push({
        id: email,
        data: {
          email,
          firstName: i === 7 ? "Zelda Nominee" : `Lead${i}`,
          nameLower: i === 7 ? "zelda nominee" : `lead${i}`,
          status: i % 10 === 0 ? "confirmed" : "pending",
          source: "test",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      });
    }
    leads.push({
      id: HIDDEN_EMAIL,
      data: {
        email: HIDDEN_EMAIL,
        firstName: "Needle",
        nameLower: "needle",
        status: "pending",
        source: "test",
        createdAt: "2026-01-02T00:00:00.000Z",
      },
    });
    await writeBatch("leads", leads);
    await writeBatch("members", [
      {
        id: "a0007@example.com",
        data: {
          email: "a0007@example.com",
          name: "Zelda Member",
          nameLower: "zelda member",
          status: "active",
          joinDate: "2026-01-03T00:00:00.000Z",
        },
      },
      {
        id: "m-unique@example.com",
        data: {
          email: "m-unique@example.com",
          name: "Unique Member",
          nameLower: "unique member",
          status: "active",
          joinDate: "2026-01-04T00:00:00.000Z",
        },
      },
    ]);
    await db.collection("coaching_applications").add({
      email: "a0001@example.com",
      status: "new",
    });
    await db.collection("client_records").doc("a0002@example.com").set({
      email: "a0002@example.com",
      status: "active",
    });
    await db.collection("crm_contacts").doc("hubspot-only@example.com").set({
      email: "hubspot-only@example.com",
      canonicalEmail: "hubspot-only@example.com",
      name: "HubSpot Only",
      source: "hubspot_import",
      importBatchId: "2026-10-03-a",
      manualOnly: true,
      doNotContact: false,
      hubspotBounced: false,
      hubspotOptedOut: false,
    });
  });

  it("finds an email that sits past the first 500 document ids", async () => {
    const unordered = await db.collection("leads").limit(500).get();
    const unorderedIds = new Set(unordered.docs.map((d) => d.id));
    assert.equal(unordered.size, 500);
    assert.equal(unorderedIds.has(HIDDEN_EMAIL), false);

    const found = await listPeople({
      type: "lead",
      search: HIDDEN_EMAIL,
      limit: 50,
    });
    assert.equal(found.total, 1);
    assert.equal(found.totalApproximate, false);
    assert.equal(found.people.length, 1);
    assert.equal(found.people[0]?.email, HIDDEN_EMAIL);

    const prefix = await listPeople({
      type: "lead",
      search: "zzz-needle",
      limit: 50,
    });
    assert.ok(prefix.people.some((p) => p.email === HIDDEN_EMAIL));
  });

  it("prefix-searches names even when the email sorts first", async () => {
    const found = await listPeople({
      type: "all",
      search: "zelda",
      limit: 50,
    });
    assert.ok(found.people.length >= 1);
    assert.ok(
      found.people.some(
        (p) => p.email === "a0007@example.com" && p.type === "member"
      )
    );
    assert.ok(found.people.every((p) => (p.name || "").toLowerCase().startsWith("zelda") || p.email.startsWith("zelda")));
  });

  it("paginates without duplicates or skips and reports a real total", async () => {
    const seen = new Set<string>();
    let cursor: string | undefined;
    let pages = 0;
    let lastEmail = "";
    for (;;) {
      const page = await listPeople({
        type: "lead",
        limit: 50,
        cursor,
      });
      pages += 1;
      if (pages === 1) {
        assert.equal(page.total, LEAD_COUNT + 1);
        assert.equal(page.totalApproximate, false);
      }
      for (const person of page.people) {
        assert.equal(seen.has(person.email), false, `duplicate ${person.email}`);
        assert.ok(person.email >= lastEmail, "email order must be stable");
        seen.add(person.email);
        lastEmail = person.email;
      }
      if (!page.hasMore) break;
      assert.ok(page.nextCursor);
      cursor = page.nextCursor;
    }
    assert.equal(seen.size, LEAD_COUNT + 1);
    assert.ok(seen.has(HIDDEN_EMAIL));
    assert.ok(pages >= 16);
  });

  it("merges overlapping lead/member rows once", async () => {
    const page = await listPeople({
      type: "all",
      search: "a0007@example.com",
      limit: 10,
    });
    const matches = page.people.filter((p) => p.email === "a0007@example.com");
    assert.equal(matches.length, 1);
    assert.equal(matches[0]?.type, "member");
  });

  it("labels lifecycle from page emails, not a 500-doc scan", async () => {
    const page = await listPeople({ type: "lead", search: "a0001@", limit: 10 });
    const applicant = page.people.find((p) => p.email === "a0001@example.com");
    assert.equal(applicant?.lifecycle, "applicant");
    const clientPage = await listPeople({
      type: "lead",
      search: "a0002@",
      limit: 10,
    });
    const client = clientPage.people.find((p) => p.email === "a0002@example.com");
    assert.equal(client?.lifecycle, "client");
  });

  it("does not include crm_contacts in people results or totals", async () => {
    const page = await listPeople({ type: "all", limit: 50 });
    assert.equal(
      page.people.some((p) => p.email === "hubspot-only@example.com"),
      false
    );
    const search = await listPeople({
      type: "all",
      search: "hubspot-only@example.com",
      limit: 10,
    });
    assert.equal(search.total, 0);
    assert.equal(search.people.length, 0);
    const allLeads = await listPeople({ type: "lead", limit: 50 });
    assert.equal(allLeads.total, LEAD_COUNT + 1);
  });
});
