import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { describe, it } from "node:test";

const req = createRequire(import.meta.url);

/**
 * The production build can load lib/firebase-admin more than once in one
 * server while firebase-admin itself loads once. The second copy used to
 * throw "Firestore has already been initialized" from settings(), which
 * returned HTTP 500 from the flows cron on 2026-11-11.
 */
describe("getDb with two copies of the module", () => {
  const path = req.resolve("../lib/firebase-admin");
  /** A fresh copy of the module, as a second route bundle would hold. */
  const load = () => {
    delete req.cache[path];
    return req("../lib/firebase-admin") as typeof import("../lib/firebase-admin");
  };

  it("gives the second copy the same working client instead of throwing", () => {
    const first = load();
    const a = first.getDb();
    const second = load();
    assert.notEqual(first, second);
    const b = second.getDb();
    assert.equal(a, b);
    assert.equal(second.getDb(), b);
  });

  it("uses a client that some other code already configured", () => {
    const g = globalThis as { __fatbFirestore?: unknown };
    delete g.__fatbFirestore;
    // The underlying client was configured above, so settings() would throw again here.
    const third = load();
    assert.doesNotThrow(() => third.getDb());
  });

  it("still lets tests swap in a stand-in", () => {
    const mod = load();
    const fake = { fake: true } as never;
    mod.setDbForTests(fake);
    assert.equal(mod.getDb(), fake);
    assert.equal(load().getDb(), fake);
    mod.setDbForTests(undefined);
  });
});
