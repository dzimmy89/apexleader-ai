// Concurrent admin-login lockout against the Firestore emulator.
// Run via firebase emulators:exec (chained from scripts/ci.sh).
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { after, before, describe, it, mock } from "node:test";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { POST as passwordLogin } from "../app/api/admin/login/route";
import {
  ADMIN_LOGIN_ATTEMPTS_COLLECTION,
  ADMIN_LOGIN_MAX_FAILURES,
  FirestoreAdminLoginLimiter,
  adminLoginIpDocId,
  passwordLoginLockKeys,
} from "../lib/auth/admin-login-rate-limit";
import { ADMIN_TEAM_USERNAME } from "../lib/auth/admin-team-password";
import { setDbForTests } from "../lib/firebase-admin";

const HASH_ENV = "ADMIN_TEAM_PASSWORD_HASH";
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
assert.ok(
  emulatorHost,
  "FIRESTORE_EMULATOR_HOST is required (run under firebase emulators:exec)"
);

const savedHash = process.env[HASH_ENV];
const savedJwt = process.env.JWT_SECRET;

describe("admin login lockout (Firestore emulator)", () => {
  const app = initializeApp(
    { projectId: "demo-admin-login-lockout" },
    "admin-login-lockout"
  );
  const db = getFirestore(app);

  before(async () => {
    process.env.JWT_SECRET = "ci-admin-login-tests";
    const password = randomBytes(24).toString("hex");
    process.env[HASH_ENV] = await bcrypt.hash(password, 4);
    setDbForTests(db);
  });

  after(() => {
    setDbForTests(undefined);
    if (savedHash === undefined) delete process.env[HASH_ENV];
    else process.env[HASH_ENV] = savedHash;
    if (savedJwt === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = savedJwt;
  });

  it("serializes concurrent recordFailures so the IP lock still trips", async () => {
    const ip = `198.51.100.${100 + Math.floor(Math.random() * 50)}`;
    const limiter = new FirestoreAdminLoginLimiter(db as Firestore);
    const keys = passwordLoginLockKeys(ip);
    await Promise.all(
      Array.from({ length: 20 }, () => limiter.recordFailures(keys))
    );
    assert.equal(await limiter.isLocked(keys), true);

    const snap = await db
      .collection(ADMIN_LOGIN_ATTEMPTS_COLLECTION)
      .doc(adminLoginIpDocId(ip))
      .get();
    const failures = snap.data()?.failures;
    assert.ok(Array.isArray(failures));
    assert.ok(failures.length >= ADMIN_LOGIN_MAX_FAILURES);
  });

  it("locks the IP after concurrent failed POSTs", async () => {
    const ip = `203.0.113.${100 + Math.floor(Math.random() * 50)}`;
    const spy = mock.method(bcrypt, "compare", async () => false);
    try {
      const responses = await Promise.all(
        Array.from({ length: ADMIN_LOGIN_MAX_FAILURES }, () =>
          passwordLogin(
            new NextRequest("http://localhost/api/admin/login", {
              method: "POST",
              headers: {
                "content-type": "application/json",
                origin: "http://localhost",
                "x-forwarded-for": ip,
              },
              body: JSON.stringify({
                username: ADMIN_TEAM_USERNAME,
                password: "wrong",
              }),
            })
          )
        )
      );
      assert.ok(responses.every((res) => res.status === 401 || res.status === 429));
      const locked = await passwordLogin(
        new NextRequest("http://localhost/api/admin/login", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: "http://localhost",
            "x-forwarded-for": ip,
          },
          body: JSON.stringify({
            username: ADMIN_TEAM_USERNAME,
            password: "wrong",
          }),
        })
      );
      assert.equal(locked.status, 429);
    } finally {
      spy.mock.restore();
    }
  });
});
