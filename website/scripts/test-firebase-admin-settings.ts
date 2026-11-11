import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp, getDb } from "../lib/firebase-admin";

describe("getDb on a warm instance", () => {
  it("does not throw when another bundled copy already used the Firestore client", () => {
    process.env.GCP_PROJECT_ID = "demo-test";
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:1";
    // Stand-in for a second copy of lib/firebase-admin: it configures and
    // uses the shared client before this copy's getDb() runs.
    const shared = getFirestore(getAdminApp());
    shared.settings({ ignoreUndefinedProperties: true });
    shared.collection("x").doc("y");
    assert.throws(() => shared.settings({ ignoreUndefinedProperties: true }), /already been initialized/);
    assert.doesNotThrow(() => getDb());
    assert.equal(getDb(), shared);
  });
});
