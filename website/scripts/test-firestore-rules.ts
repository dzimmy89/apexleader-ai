// Firestore security-rules tests against the emulator
// (@firebase/rules-unit-testing). Run via:
//   firebase emulators:exec --only firestore --project demo-defi-university-rules \
//     "npx tsx website/scripts/test-firestore-rules.ts"
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../..");
const RULES_PATH = join(REPO_ROOT, "database/security-rules.rules");
const PROJECT_ID = "demo-defi-university-rules";

function loadRules(): string {
  return readFileSync(RULES_PATH, "utf8");
}

describe("firestore rules file", () => {
  it("is a v2 Firestore ruleset", () => {
    const rules = loadRules();
    assert.match(rules, /^rules_version\s*=\s*'2'\s*;/);
    assert.match(rules, /service cloud\.firestore/);
  });
});

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
assert.ok(
  emulatorHost,
  "FIRESTORE_EMULATOR_HOST is required (run under firebase emulators:exec)"
);

describe("firestore rules (emulator)", async () => {
  const { initializeTestEnvironment, assertFails, assertSucceeds } =
    await import("@firebase/rules-unit-testing");
  const { doc, getDoc, setDoc, updateDoc } = await import(
    "firebase/firestore"
  );

  const hostPort = emulatorHost.split(":");
  const host = hostPort[0] || "127.0.0.1";
  const port = Number(hostPort[1] || 8080);

  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: loadRules(),
      host,
      port,
    },
  });

  after(async () => {
    await testEnv.cleanup();
  });

  async function seed(
    path: string,
    data: Record<string, unknown>
  ): Promise<void> {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), path), data);
    });
  }

  function authed(
    uid: string,
    email: string,
    emailVerified: boolean
  ) {
    return testEnv
      .authenticatedContext(uid, {
        email,
        email_verified: emailVerified,
      })
      .firestore();
  }

  it("denies unauthenticated coaching_packages reads", async () => {
    await seed("coaching_packages/foundations", { name: "Foundations" });
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "coaching_packages/foundations")));
  });

  it("denies unverified-email owner and admin; allows verified", async () => {
    await seed("members/admin@example.com", {
      email: "admin@example.com",
      tier: "admin",
    });
    await seed("members/owner@example.com", {
      email: "owner@example.com",
      tier: "skool",
    });

    await assertFails(
      getDoc(doc(authed("uid-owner", "owner@example.com", false), "members/owner@example.com"))
    );
    await assertSucceeds(
      getDoc(doc(authed("uid-owner", "owner@example.com", true), "members/owner@example.com"))
    );
    await assertFails(
      getDoc(doc(authed("uid-admin", "admin@example.com", false), "members/owner@example.com"))
    );
    await assertSucceeds(
      getDoc(doc(authed("uid-admin", "admin@example.com", true), "members/owner@example.com"))
    );
  });

  it("denies unverified token reading a subscription by memberEmail; verified allowed; memberId==uid allowed", async () => {
    await seed("subscriptions/sub-email", {
      memberEmail: "owner@example.com",
      memberId: "uid-owner",
    });
    await seed("subscriptions/sub-uid-only", {
      memberEmail: "other@example.com",
      memberId: "uid-by-id",
    });

    await assertFails(
      getDoc(
        doc(
          authed("uid-spoof", "owner@example.com", false),
          "subscriptions/sub-email"
        )
      )
    );
    await assertSucceeds(
      getDoc(
        doc(
          authed("uid-owner", "owner@example.com", true),
          "subscriptions/sub-email"
        )
      )
    );
    await assertSucceeds(
      getDoc(
        doc(
          authed("uid-by-id", "unrelated@example.com", false),
          "subscriptions/sub-uid-only"
        )
      )
    );
  });

  it("denies progress create with mismatched userId and allows matching", async () => {
    const uid = "progress-user";
    const db = authed(uid, "progress@example.com", true);

    await assertFails(
      setDoc(doc(db, "progress/other-doc"), { userId: "someone-else" })
    );
    await assertSucceeds(
      setDoc(doc(db, "progress/own-doc"), { userId: uid, lesson: 1 })
    );
  });

  it("denies progress update that reassigns userId; allows update that keeps userId", async () => {
    const uid = "progress-updater";
    await seed("progress/keep-or-reassign", { userId: uid, lesson: 1 });
    const db = authed(uid, "updater@example.com", true);

    await assertFails(
      updateDoc(doc(db, "progress/keep-or-reassign"), { userId: "hijacked" })
    );
    await assertSucceeds(
      updateDoc(doc(db, "progress/keep-or-reassign"), { lesson: 2 })
    );
  });

  it("free member cannot read paid published content; paid member can; public allowed", async () => {
    await seed("content/paid-published", {
      access: "paid",
      status: "published",
      title: "Paid lesson",
    });
    await seed("content/public-published", {
      access: "public",
      status: "published",
      title: "Free lesson",
    });
    await seed("members/free@example.com", {
      email: "free@example.com",
      tier: "free",
    });
    await seed("members/paid@example.com", {
      email: "paid@example.com",
      tier: "skool",
    });

    const freeDb = authed("uid-free", "free@example.com", true);
    await assertFails(getDoc(doc(freeDb, "content/paid-published")));
    await assertSucceeds(getDoc(doc(freeDb, "content/public-published")));

    const paidDb = authed("uid-paid", "paid@example.com", true);
    await assertSucceeds(getDoc(doc(paidDb, "content/paid-published")));
    await assertSucceeds(getDoc(doc(paidDb, "content/public-published")));

    const anon = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anon, "content/public-published")));
    await assertFails(getDoc(doc(anon, "content/paid-published")));
  });

  it("content with no access field is denied to free members and allowed to paid members", async () => {
    await seed("content/no-access", {
      status: "published",
      title: "Legacy paid",
    });
    await seed("members/free2@example.com", {
      email: "free2@example.com",
      tier: "free",
    });
    await seed("members/paid2@example.com", {
      email: "paid2@example.com",
      tier: "paid",
    });

    await assertFails(
      getDoc(
        doc(authed("uid-free2", "free2@example.com", true), "content/no-access")
      )
    );
    await assertSucceeds(
      getDoc(
        doc(authed("uid-paid2", "paid2@example.com", true), "content/no-access")
      )
    );
  });

  it("missing members doc is denied cleanly (exists guard)", async () => {
    await seed("members/someone@example.com", {
      email: "someone@example.com",
      tier: "skool",
    });
    await seed("content/paid-for-exists", {
      access: "paid",
      status: "published",
      title: "Paid",
    });

    const ghost = authed("uid-ghost", "ghost@example.com", true);
    await assertFails(getDoc(doc(ghost, "members/someone@example.com")));
    await assertFails(getDoc(doc(ghost, "content/paid-for-exists")));
  });

  it("UID-keyed member doc does not grant paid or admin", async () => {
    await seed("members/uid-keyed-paid", {
      email: "uid-keyed-paid@example.com",
      tier: "skool",
    });
    await seed("members/uid-keyed-admin", {
      email: "uid-keyed-admin@example.com",
      tier: "admin",
    });
    await seed("content/paid-uid-grant", {
      access: "paid",
      status: "published",
      title: "Paid",
    });
    await seed("members/victim@example.com", {
      email: "victim@example.com",
      tier: "free",
    });

    const paidByUid = authed("uid-keyed-paid", "uid-keyed-paid@example.com", true);
    const adminByUid = authed("uid-keyed-admin", "uid-keyed-admin@example.com", true);

    await assertFails(getDoc(doc(paidByUid, "content/paid-uid-grant")));
    await assertFails(getDoc(doc(adminByUid, "members/victim@example.com")));
  });

  it("course with no access field is denied to free member and allowed to paid", async () => {
    await seed("courses/no-access", {
      status: "published",
      title: "Legacy course",
    });
    await seed("members/free-course@example.com", {
      email: "free-course@example.com",
      tier: "free",
    });
    await seed("members/paid-course@example.com", {
      email: "paid-course@example.com",
      tier: "skool",
    });

    await assertFails(
      getDoc(
        doc(
          authed("uid-free-course", "free-course@example.com", true),
          "courses/no-access"
        )
      )
    );
    await assertSucceeds(
      getDoc(
        doc(
          authed("uid-paid-course", "paid-course@example.com", true),
          "courses/no-access"
        )
      )
    );
  });

  it("course with access member is denied to free and allowed to paid", async () => {
    await seed("courses/member-course", {
      status: "published",
      access: "member",
      title: "Member course",
    });
    await seed("members/free-member-course@example.com", {
      email: "free-member-course@example.com",
      tier: "free",
    });
    await seed("members/paid-member-course@example.com", {
      email: "paid-member-course@example.com",
      tier: "skool",
    });

    await assertFails(
      getDoc(
        doc(
          authed(
            "uid-free-member-course",
            "free-member-course@example.com",
            true
          ),
          "courses/member-course"
        )
      )
    );
    await assertSucceeds(
      getDoc(
        doc(
          authed(
            "uid-paid-member-course",
            "paid-member-course@example.com",
            true
          ),
          "courses/member-course"
        )
      )
    );
  });

  it("course with access public is allowed to anyone", async () => {
    await seed("courses/public-course", {
      status: "published",
      access: "public",
      title: "Open course",
    });

    const anon = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anon, "courses/public-course")));
    await assertSucceeds(
      getDoc(
        doc(
          authed("uid-any", "any@example.com", false),
          "courses/public-course"
        )
      )
    );
  });

  it("denies client reads and writes on crm_contacts", async () => {
    await seed("crm_contacts/sales@example.com", {
      email: "sales@example.com",
      manualOnly: true,
      salesList: "hubspot",
    });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, "crm_contacts/sales@example.com")));
    await assertFails(
      setDoc(doc(anon, "crm_contacts/new@example.com"), { email: "new@example.com" })
    );

    await seed("members/admin@example.com", {
      email: "admin@example.com",
      tier: "admin",
    });
    const adminDb = authed("uid-admin-crm", "admin@example.com", true);
    await assertFails(getDoc(doc(adminDb, "crm_contacts/sales@example.com")));
    await assertFails(
      updateDoc(doc(adminDb, "crm_contacts/sales@example.com"), { rank: 1 })
    );
  });

  it("denies client reads and writes on crm_enrichment_snapshots", async () => {
    await seed("crm_enrichment_snapshots/batch__sales@example.com", {
      batchId: "batch",
      crmDocId: "sales@example.com",
    });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      getDoc(doc(anon, "crm_enrichment_snapshots/batch__sales@example.com"))
    );
    await assertFails(
      setDoc(doc(anon, "crm_enrichment_snapshots/new"), { batchId: "new" })
    );

    await seed("members/admin@example.com", {
      email: "admin@example.com",
      tier: "admin",
    });
    const adminDb = authed("uid-admin-enrich", "admin@example.com", true);
    await assertFails(
      getDoc(doc(adminDb, "crm_enrichment_snapshots/batch__sales@example.com"))
    );
    await assertFails(
      updateDoc(doc(adminDb, "crm_enrichment_snapshots/batch__sales@example.com"), {
        batchId: "x",
      })
    );
  });

  it("denies client reads and writes on touchpoints", async () => {
    await seed("touchpoints/abc", {
      crmContactId: "sales@example.com",
      channel: "email",
    });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, "touchpoints/abc")));
    await assertFails(
      setDoc(doc(anon, "touchpoints/new"), { crmContactId: "x@example.com" })
    );

    await seed("members/admin@example.com", {
      email: "admin@example.com",
      tier: "admin",
    });
    const adminDb = authed("uid-admin-touch", "admin@example.com", true);
    await assertFails(getDoc(doc(adminDb, "touchpoints/abc")));
    await assertFails(
      updateDoc(doc(adminDb, "touchpoints/abc"), { channel: "sms" })
    );
  });

  it("denies client reads and writes on stripe_processed_events", async () => {
    await seed("stripe_processed_events/evt_test", {
      eventId: "evt_test",
      type: "invoice.paid",
    });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, "stripe_processed_events/evt_test")));
    await assertFails(
      setDoc(doc(anon, "stripe_processed_events/evt_new"), {
        eventId: "evt_new",
        type: "invoice.paid",
      })
    );

    await seed("members/admin@example.com", {
      email: "admin@example.com",
      tier: "admin",
    });
    const adminDb = authed("uid-admin-stripe-events", "admin@example.com", true);
    await assertFails(getDoc(doc(adminDb, "stripe_processed_events/evt_test")));
    await assertFails(
      updateDoc(doc(adminDb, "stripe_processed_events/evt_test"), {
        type: "invoice.payment_failed",
      })
    );
  });

  it("denies client reads and writes on crm_admin_1to1_idempotency", async () => {
    await seed("crm_admin_1to1_idempotency/abc", {
      email: "sales@example.com",
    });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, "crm_admin_1to1_idempotency/abc")));
    await assertFails(
      setDoc(doc(anon, "crm_admin_1to1_idempotency/new"), { email: "x@example.com" })
    );
  });

  it("denies client reads and writes on crm_touchpoint_snapshots", async () => {
    await seed("crm_touchpoint_snapshots/batch__sales@example.com", {
      batchId: "batch",
      crmContactId: "sales@example.com",
    });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      getDoc(doc(anon, "crm_touchpoint_snapshots/batch__sales@example.com"))
    );
    await assertFails(
      setDoc(doc(anon, "crm_touchpoint_snapshots/new"), { batchId: "new" })
    );

    await seed("members/admin@example.com", {
      email: "admin@example.com",
      tier: "admin",
    });
    const adminDb = authed("uid-admin-tp-snap", "admin@example.com", true);
    await assertFails(
      getDoc(doc(adminDb, "crm_touchpoint_snapshots/batch__sales@example.com"))
    );
    await assertFails(
      updateDoc(doc(adminDb, "crm_touchpoint_snapshots/batch__sales@example.com"), {
        batchId: "x",
      })
    );
  });

  it("denies client reads and writes on crm_import_batches", async () => {
    await seed("crm_import_batches/2026-10-02-a", {
      batchId: "2026-10-02-a",
      createdContactIds: [],
    });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, "crm_import_batches/2026-10-02-a")));
    await assertFails(
      setDoc(doc(anon, "crm_import_batches/new-batch"), { batchId: "new-batch" })
    );

    await seed("members/admin@example.com", {
      email: "admin@example.com",
      tier: "admin",
    });
    const adminDb = authed("uid-admin-batches", "admin@example.com", true);
    await assertFails(getDoc(doc(adminDb, "crm_import_batches/2026-10-02-a")));
    await assertFails(
      updateDoc(doc(adminDb, "crm_import_batches/2026-10-02-a"), {
        rolledBackAt: "2026-10-02T00:00:00.000Z",
      })
    );
  });

  it("settings read denied for unverified token and allowed for verified", async () => {
    await seed("settings/app", { feature: "ok" });

    await assertFails(
      getDoc(doc(authed("uid-unverified", "u@example.com", false), "settings/app"))
    );
    await assertSucceeds(
      getDoc(doc(authed("uid-verified", "v@example.com", true), "settings/app"))
    );
  });
});
