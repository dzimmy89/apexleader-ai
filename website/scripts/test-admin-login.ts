import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { after, before, beforeEach, describe, it, mock } from "node:test";
import { fileURLToPath } from "node:url";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { Firestore } from "firebase-admin/firestore";
import { POST as googleLogin } from "../app/api/admin/login/google/route";
import { POST as passwordLogin } from "../app/api/admin/login/route";
import { requireAdmin } from "../lib/admin-auth";
import {
  lastForwardedClientIp,
  trustedAdminClientIp,
} from "../lib/auth/admin-login-client-ip";
import {
  ADMIN_LOGIN_APEX_ORIGIN,
  ADMIN_LOGIN_WWW_ORIGIN,
  adminLoginOriginAllowlist,
  adminLoginRequestIsTrustedOrigin,
  isAllowedAdminLoginOrigin,
  isJsonContentType,
  parseExactOrigin,
} from "../lib/auth/admin-login-request-guards";
import {
  ADMIN_LOGIN_ATTEMPTS_COLLECTION,
  ADMIN_LOGIN_MAX_FAILURES,
  ADMIN_LOGIN_USERNAME_MAX_FAILURES,
  FirestoreAdminLoginLimiter,
  adminLoginIpDocId,
  adminLoginUsernameDocId,
  lockThresholdForAttemptKey,
  passwordLoginLockKeys,
} from "../lib/auth/admin-login-rate-limit";
import {
  DEFAULT_ADMIN_NEXT_PATH,
  safeAdminNextPath,
} from "../lib/auth/admin-next-path";
import {
  ADMIN_SESSION_MAX_AGE,
  AdminJwtSecretMissingError,
  COOKIE_NAME,
  createAdminSession,
  getAdminSessionCookieOptions,
  readAdminJwtSecret,
  verifyAdminSession,
} from "../lib/auth/admin-session-cookie";
import {
  ADMIN_TEAM_USERNAME,
  MAX_ADMIN_PASSWORD_BYTES,
  MAX_ADMIN_USERNAME_CHARS,
  adminLoginCredentialsWithinLimits,
  isAdminTeamPasswordConfigured,
  isBcryptPasswordHash,
  isPasswordAdminPrincipal,
  utf8ByteLength,
  verifyAdminTeamPassword,
} from "../lib/auth/admin-team-password";
import { middleware } from "../middleware";
import { jsonWithAdminSession } from "../lib/auth/issue-admin-session";
import { timingSafeEqualString } from "../lib/auth/timing-safe-equal";
import { setDbForTests } from "../lib/firebase-admin";

const HASH_ENV = "ADMIN_TEAM_PASSWORD_HASH";

const savedHash = process.env[HASH_ENV];
const savedJwt = process.env.JWT_SECRET;
const savedAdminPassword = process.env.ADMIN_PASSWORD;

type Stored = Record<string, unknown>;

function createSharedMemoryFirestore() {
  const store = new Map<string, Stored>();
  let chain = Promise.resolve();

  const db = {
    collection(name: string) {
      return {
        doc(id: string) {
          return { path: `${name}/${id}`, id };
        },
      };
    },
    runTransaction<T>(
      fn: (tx: {
        get: (ref: { path: string }) => Promise<{
          exists: boolean;
          data: () => unknown;
        }>;
        set: (ref: { path: string }, value: Stored) => void;
        delete: (ref: { path: string }) => void;
      }) => Promise<T>
    ): Promise<T> {
      const run = async () => {
        const writes: Array<{
          path: string;
          mode: "set" | "delete";
          value?: Stored;
        }> = [];
        const tx = {
          async get(ref: { path: string }) {
            const value = store.get(ref.path);
            return {
              exists: value !== undefined,
              data: () =>
                value ? (JSON.parse(JSON.stringify(value)) as Stored) : undefined,
            };
          },
          set(ref: { path: string }, value: Stored) {
            writes.push({
              path: ref.path,
              mode: "set",
              value: JSON.parse(JSON.stringify(value)) as Stored,
            });
          },
          delete(ref: { path: string }) {
            writes.push({ path: ref.path, mode: "delete" });
          },
        };
        const result = await fn(tx);
        for (const write of writes) {
          if (write.mode === "delete") store.delete(write.path);
          else if (write.value) store.set(write.path, write.value);
        }
        return result;
      };
      const pending = chain.then(run, run);
      chain = pending.then(
        () => undefined,
        () => undefined
      );
      return pending;
    },
    clear() {
      store.clear();
    },
    get(path: string) {
      return store.get(path);
    },
  };

  return db;
}

function loginRequest(
  body: unknown,
  forwardedFor: string,
  extraHeaders: Record<string, string> = {}
): NextRequest {
  return new NextRequest("http://localhost/api/admin/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      "x-forwarded-for": forwardedFor,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}

function googleLoginRequest(
  body: unknown,
  extraHeaders: Record<string, string> = {}
): NextRequest {
  return new NextRequest("http://localhost/api/admin/login/google", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}

function cookieAttrs(res: NextResponse) {
  return res.cookies.get(COOKIE_NAME);
}

function setNodeEnv(value: string | undefined): void {
  const env = process.env as { NODE_ENV?: string };
  if (value === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = value;
}

describe("admin team password login", () => {
  let password: string;
  let memory: ReturnType<typeof createSharedMemoryFirestore>;

  before(async () => {
    process.env.JWT_SECRET = "ci-admin-login-tests";
    password = randomBytes(24).toString("hex");
    process.env[HASH_ENV] = await bcrypt.hash(password, 4);
  });

  after(() => {
    if (savedHash === undefined) delete process.env[HASH_ENV];
    else process.env[HASH_ENV] = savedHash;
    if (savedJwt === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = savedJwt;
    if (savedAdminPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = savedAdminPassword;
    setDbForTests(undefined);
  });

  beforeEach(() => {
    memory = createSharedMemoryFirestore();
    setDbForTests(memory as unknown as Firestore);
  });

  it("accepts the team username and matching password and issues the admin session cookie", async () => {
    const res = await passwordLogin(
      loginRequest(
        { username: ADMIN_TEAM_USERNAME, password },
        "203.0.113.10"
      )
    );
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);

    const cookie = cookieAttrs(res);
    assert.ok(cookie?.value);
    const flags = getAdminSessionCookieOptions();
    assert.equal(cookie?.httpOnly, flags.httpOnly);
    assert.equal(cookie?.secure, flags.secure);
    assert.equal(cookie?.sameSite, flags.sameSite);
    assert.equal(cookie?.path, flags.path);
    assert.equal(cookie?.maxAge, flags.maxAge);
    assert.equal(cookie?.maxAge, ADMIN_SESSION_MAX_AGE);

    const session = await verifyAdminSession(cookie?.value);
    assert.equal(session.valid, true);
    assert.equal(session.username, ADMIN_TEAM_USERNAME);
    assert.equal(isPasswordAdminPrincipal(session.username ?? ""), true);

    const gated = await requireAdmin(
      new NextRequest("http://localhost/api/admin/overview", {
        headers: { cookie: `${COOKIE_NAME}=${cookie?.value}` },
      })
    );
    assert.equal(gated.ok, true);
    if (gated.ok) {
      assert.equal(gated.username, ADMIN_TEAM_USERNAME);
    }
  });

  it("returns a generic error for a wrong password", async () => {
    const res = await passwordLogin(
      loginRequest(
        { username: ADMIN_TEAM_USERNAME, password: randomBytes(12).toString("hex") },
        "203.0.113.11"
      )
    );
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.error, "Invalid credentials");
    assert.equal(cookieAttrs(res), undefined);
  });

  it("returns the same generic error for a wrong username", async () => {
    const res = await passwordLogin(
      loginRequest({ username: "not_the_team", password }, "203.0.113.12")
    );
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.error, "Invalid credentials");
    assert.equal(cookieAttrs(res), undefined);
  });

  it("refuses password sign-in when the hash env is unset", async () => {
    const previous = process.env[HASH_ENV];
    delete process.env[HASH_ENV];
    assert.equal(isAdminTeamPasswordConfigured(), false);
    try {
      const disabled = await verifyAdminTeamPassword(ADMIN_TEAM_USERNAME, password);
      assert.equal(disabled.ok, false);
      if (!disabled.ok) assert.equal(disabled.reason, "disabled");

      const res = await passwordLogin(
        loginRequest({ username: ADMIN_TEAM_USERNAME, password }, "203.0.113.13")
      );
      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.error, "Password sign-in is disabled");
      assert.equal(cookieAttrs(res), undefined);
    } finally {
      process.env[HASH_ENV] = previous;
    }
  });

  it("refuses password sign-in when the hash env is empty", async () => {
    const previous = process.env[HASH_ENV];
    process.env[HASH_ENV] = "   ";
    try {
      const res = await passwordLogin(
        loginRequest({ username: ADMIN_TEAM_USERNAME, password }, "203.0.113.14")
      );
      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.error, "Password sign-in is disabled");
    } finally {
      process.env[HASH_ENV] = previous;
    }
  });

  it("refuses password sign-in when the hash env is not a bcrypt hash", async () => {
    const previous = process.env[HASH_ENV];
    const malformed = [
      "not-a-bcrypt-hash",
      "$2b$12$too-short",
      "$2b$ab$" + "A".repeat(53),
    ];
    try {
      for (const value of malformed) {
        assert.equal(isBcryptPasswordHash(value), false);
        process.env[HASH_ENV] = value;
        assert.equal(isAdminTeamPasswordConfigured(), false);
        const verified = await verifyAdminTeamPassword(
          ADMIN_TEAM_USERNAME,
          password
        );
        assert.equal(verified.ok, false);
        if (!verified.ok) assert.equal(verified.reason, "disabled");

        const res = await passwordLogin(
          loginRequest(
            { username: ADMIN_TEAM_USERNAME, password },
            "203.0.113.114"
          )
        );
        assert.equal(res.status, 403);
        const json = await res.json();
        assert.equal(json.error, "Password sign-in is disabled");
        assert.equal(cookieAttrs(res), undefined);
      }
    } finally {
      process.env[HASH_ENV] = previous;
    }
  });

  it("redirects unauthenticated GET /admin to /admin/login", async () => {
    const res = await middleware(new NextRequest("http://localhost/admin"));
    assert.equal(res.status, 307);
    const location = res.headers.get("location") ?? "";
    const url = new URL(location);
    assert.equal(url.pathname, "/admin/login");
  });

  it("returns 401 for GET /api/admin/overview without a session", async () => {
    const res = await middleware(
      new NextRequest("http://localhost/api/admin/overview")
    );
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.error, "Unauthorized");

    const gated = await requireAdmin(
      new NextRequest("http://localhost/api/admin/overview")
    );
    assert.equal(gated.ok, false);
    if (!gated.ok) assert.equal(gated.status, 401);
  });

  it("returns 401 for GET /api/admin/crm-contacts without a session", async () => {
    const res = await middleware(
      new NextRequest("http://localhost/api/admin/crm-contacts")
    );
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.error, "Unauthorized");

    const gated = await requireAdmin(
      new NextRequest("http://localhost/api/admin/crm-contacts")
    );
    assert.equal(gated.ok, false);
    if (!gated.ok) assert.equal(gated.status, 401);
  });

  it("locks out after N failed attempts from the same client", async () => {
    const ip = "203.0.113.15";
    for (let i = 0; i < ADMIN_LOGIN_MAX_FAILURES - 1; i++) {
      const res = await passwordLogin(
        loginRequest({ username: ADMIN_TEAM_USERNAME, password: "wrong" }, ip)
      );
      assert.equal(res.status, 401);
    }
    const locked = await passwordLogin(
      loginRequest({ username: ADMIN_TEAM_USERNAME, password: "wrong" }, ip)
    );
    assert.equal(locked.status, 429);
    const lockedJson = await locked.json();
    assert.equal(lockedJson.error, "Too many attempts. Try again later.");

    const evenCorrect = await passwordLogin(
      loginRequest({ username: ADMIN_TEAM_USERNAME, password }, ip)
    );
    assert.equal(evenCorrect.status, 429);
    assert.equal(cookieAttrs(evenCorrect), undefined);
  });

  it("issues the same cookie flags as the Google session helper", async () => {
    const passwordRes = await passwordLogin(
      loginRequest({ username: ADMIN_TEAM_USERNAME, password }, "203.0.113.16")
    );
    const googleRes = await jsonWithAdminSession("hello@defiuniversity.xyz", {
      email: "hello@defiuniversity.xyz",
    });
    const passCookie = cookieAttrs(passwordRes);
    const googleCookie = cookieAttrs(googleRes);
    assert.ok(passCookie);
    assert.ok(googleCookie);
    assert.equal(passCookie?.httpOnly, googleCookie?.httpOnly);
    assert.equal(passCookie?.secure, googleCookie?.secure);
    assert.equal(passCookie?.sameSite, googleCookie?.sameSite);
    assert.equal(passCookie?.path, googleCookie?.path);
    assert.equal(passCookie?.maxAge, googleCookie?.maxAge);

    const googleSession = await verifyAdminSession(googleCookie?.value);
    assert.equal(googleSession.valid, true);
    assert.equal(googleSession.username, "hello@defiuniversity.xyz");
    assert.equal(isPasswordAdminPrincipal(googleSession.username ?? ""), false);
  });

  it("holds the lock across two limiter instances sharing one store", async () => {
    const shared = createSharedMemoryFirestore();
    const fs = shared as unknown as Firestore;
    const instanceA = new FirestoreAdminLoginLimiter(fs);
    const instanceB = new FirestoreAdminLoginLimiter(fs);
    const keys = passwordLoginLockKeys("198.51.100.10");

    for (let i = 0; i < ADMIN_LOGIN_MAX_FAILURES; i++) {
      const fromA = i % 2 === 0;
      const limiter = fromA ? instanceA : instanceB;
      await limiter.recordFailures(keys);
    }

    assert.equal(await instanceA.isLocked(keys), true);
    assert.equal(await instanceB.isLocked(keys), true);
    const userDoc = shared.get(
      `${ADMIN_LOGIN_ATTEMPTS_COLLECTION}/${adminLoginUsernameDocId()}`
    );
    const ipDoc = shared.get(
      `${ADMIN_LOGIN_ATTEMPTS_COLLECTION}/${adminLoginIpDocId("198.51.100.10")}`
    );
    assert.ok(userDoc);
    assert.ok(ipDoc);
    assert.equal((userDoc?.failures as number[]).length, ADMIN_LOGIN_MAX_FAILURES);
  });

  it("serializes concurrent failure writes so the counter cannot skip the limit", async () => {
    const shared = createSharedMemoryFirestore();
    const limiter = new FirestoreAdminLoginLimiter(shared as unknown as Firestore);
    const keys = passwordLoginLockKeys("198.51.100.11");
    await Promise.all(
      Array.from({ length: ADMIN_LOGIN_MAX_FAILURES }, () =>
        limiter.recordFailures(keys)
      )
    );
    assert.equal(await limiter.isLocked(keys), true);
    const userDoc = shared.get(
      `${ADMIN_LOGIN_ATTEMPTS_COLLECTION}/${adminLoginUsernameDocId()}`
    );
    assert.equal((userDoc?.failures as number[]).length, ADMIN_LOGIN_MAX_FAILURES);
  });

  it("does not let a spoofed leading x-forwarded-for evade the IP lock", async () => {
    const clientIp = "198.51.100.20";
    const lbHop = "8.233.107.134";
    for (let i = 0; i < ADMIN_LOGIN_MAX_FAILURES; i++) {
      const res = await passwordLogin(
        loginRequest(
          { username: ADMIN_TEAM_USERNAME, password: "wrong" },
          `203.0.113.${i}, ${clientIp}, ${lbHop}`
        )
      );
      if (i < ADMIN_LOGIN_MAX_FAILURES - 1) assert.equal(res.status, 401);
      else assert.equal(res.status, 429);
    }

    const spoofed = await passwordLogin(
      loginRequest(
        { username: ADMIN_TEAM_USERNAME, password: "wrong" },
        `192.0.2.1, ${clientIp}, ${lbHop}`
      )
    );
    assert.equal(spoofed.status, 429);
  });

  it("does not hard-lock the team username from one source or a handful of IPs", async () => {
    for (let i = 0; i < ADMIN_LOGIN_MAX_FAILURES; i++) {
      const res = await passwordLogin(
        loginRequest(
          { username: ADMIN_TEAM_USERNAME, password: "wrong" },
          `198.51.100.${40 + i}`
        )
      );
      assert.equal(res.status, 401);
    }

    const freshIp = await passwordLogin(
      loginRequest({ username: ADMIN_TEAM_USERNAME, password }, "203.0.113.77")
    );
    assert.equal(freshIp.status, 200);
    assert.ok(cookieAttrs(freshIp)?.value);
  });

  it("still globally locks the username after the high distributed threshold", async () => {
    const limiter = new FirestoreAdminLoginLimiter(
      memory as unknown as Firestore
    );
    const userKey = adminLoginUsernameDocId();
    assert.equal(lockThresholdForAttemptKey(userKey), ADMIN_LOGIN_USERNAME_MAX_FAILURES);
    assert.equal(
      lockThresholdForAttemptKey(adminLoginIpDocId("198.51.100.1")),
      ADMIN_LOGIN_MAX_FAILURES
    );

    for (let i = 0; i < ADMIN_LOGIN_USERNAME_MAX_FAILURES - 1; i++) {
      const recorded = await limiter.recordFailures([userKey]);
      assert.equal(recorded.locked, false);
    }
    const trip = await limiter.recordFailures([userKey]);
    assert.equal(trip.locked, true);
    assert.equal(await limiter.isLocked([userKey]), true);

    const blocked = await passwordLogin(
      loginRequest({ username: ADMIN_TEAM_USERNAME, password }, "203.0.113.88")
    );
    assert.equal(blocked.status, 429);
  });

  it("returns 429 for a locked client without calling bcrypt", async () => {
    const ip = "198.51.100.55";
    const limiter = new FirestoreAdminLoginLimiter(
      memory as unknown as Firestore
    );
    for (let i = 0; i < ADMIN_LOGIN_MAX_FAILURES; i++) {
      await limiter.recordFailures(passwordLoginLockKeys(ip));
    }
    assert.equal(await limiter.isLocked(passwordLoginLockKeys(ip)), true);

    const spy = mock.method(bcrypt, "compare");
    try {
      const res = await passwordLogin(
        loginRequest({ username: ADMIN_TEAM_USERNAME, password }, ip)
      );
      assert.equal(res.status, 429);
      assert.equal(spy.mock.callCount(), 0);
    } finally {
      spy.mock.restore();
    }
  });

  it("refuses to sign or verify in production when JWT_SECRET is missing", async () => {
    const previousJwt = process.env.JWT_SECRET;
    const previousNodeEnv = process.env.NODE_ENV;
    delete process.env.JWT_SECRET;
    setNodeEnv("production");
    try {
      assert.equal(readAdminJwtSecret(), null);

      await assert.rejects(
        () => createAdminSession(ADMIN_TEAM_USERNAME),
        AdminJwtSecretMissingError
      );
      assert.equal((await verifyAdminSession("anything")).valid, false);

      const res = await passwordLogin(
        loginRequest(
          { username: ADMIN_TEAM_USERNAME, password },
          "203.0.113.201",
          { origin: ADMIN_LOGIN_APEX_ORIGIN }
        )
      );
      assert.equal(res.status, 503);
      const json = await res.json();
      assert.equal(json.error, "Admin session is unavailable");
      assert.equal(cookieAttrs(res), undefined);
    } finally {
      setNodeEnv(previousNodeEnv);
      if (previousJwt === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = previousJwt;
    }
  });

  it("keeps a local fallback when JWT_SECRET is missing outside production", async () => {
    const previousJwt = process.env.JWT_SECRET;
    const previousNodeEnv = process.env.NODE_ENV;
    delete process.env.JWT_SECRET;
    setNodeEnv("development");
    try {
      assert.equal(typeof readAdminJwtSecret(), "string");
      const token = await createAdminSession(ADMIN_TEAM_USERNAME);
      const session = await verifyAdminSession(token);
      assert.equal(session.valid, true);
      assert.equal(session.username, ADMIN_TEAM_USERNAME);

      const res = await passwordLogin(
        loginRequest(
          { username: ADMIN_TEAM_USERNAME, password },
          "203.0.113.202"
        )
      );
      assert.equal(res.status, 200);
      assert.ok(cookieAttrs(res)?.value);
    } finally {
      setNodeEnv(previousNodeEnv);
      if (previousJwt === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = previousJwt;
    }
  });

  it("fails closed on Firestore errors for the password path", async () => {
    setDbForTests({
      collection() {
        return { doc() { return { path: "x" }; } };
      },
      runTransaction() {
        return Promise.reject(new Error("unavailable"));
      },
    } as unknown as Firestore);

    const res = await passwordLogin(
      loginRequest({ username: ADMIN_TEAM_USERNAME, password }, "203.0.113.80")
    );
    assert.equal(res.status, 429);
    const json = await res.json();
    assert.equal(json.error, "Too many attempts. Try again later.");
    assert.equal(cookieAttrs(res), undefined);
  });

  describe("admin credential length caps", () => {
  it("rejects passwords over 72 UTF-8 bytes with the generic error and does not treat bcrypt truncation as a match", async () => {
    const seventyTwo = "a".repeat(MAX_ADMIN_PASSWORD_BYTES);
    assert.equal(utf8ByteLength(seventyTwo), MAX_ADMIN_PASSWORD_BYTES);
    assert.equal(adminLoginCredentialsWithinLimits(ADMIN_TEAM_USERNAME, seventyTwo), true);
    assert.equal(
      adminLoginCredentialsWithinLimits(ADMIN_TEAM_USERNAME, seventyTwo + "b"),
      false
    );
    assert.equal(
      utf8ByteLength("a".repeat(71) + "é"),
      MAX_ADMIN_PASSWORD_BYTES + 1
    );

    const previous = process.env[HASH_ENV];
    process.env[HASH_ENV] = await bcrypt.hash(seventyTwo, 4);
    try {
      const ok = await verifyAdminTeamPassword(ADMIN_TEAM_USERNAME, seventyTwo);
      assert.equal(ok.ok, true);

      const over = await verifyAdminTeamPassword(
        ADMIN_TEAM_USERNAME,
        seventyTwo + "b"
      );
      assert.equal(over.ok, false);
      if (!over.ok) assert.equal(over.reason, "invalid");

      const res = await passwordLogin(
        loginRequest(
          { username: ADMIN_TEAM_USERNAME, password: seventyTwo + "x" },
          "203.0.113.90"
        )
      );
      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.error, "Invalid credentials");
      assert.equal(cookieAttrs(res), undefined);
    } finally {
      process.env[HASH_ENV] = previous;
    }
  });

  it("rejects over-length usernames with the same generic error", async () => {
    const tooLong = ADMIN_TEAM_USERNAME + "x".repeat(MAX_ADMIN_USERNAME_CHARS);
    assert.equal(tooLong.length > MAX_ADMIN_USERNAME_CHARS, true);
    const res = await passwordLogin(
      loginRequest({ username: tooLong, password: "unused" }, "203.0.113.91")
    );
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.error, "Invalid credentials");
  });

  it("counts over-length submissions as lockout failures", async () => {
    const ip = "203.0.113.92";
    const tooLongPassword = "a".repeat(MAX_ADMIN_PASSWORD_BYTES + 1);
    for (let i = 0; i < ADMIN_LOGIN_MAX_FAILURES; i++) {
      const res = await passwordLogin(
        loginRequest(
          { username: ADMIN_TEAM_USERNAME, password: tooLongPassword },
          ip
        )
      );
      if (i < ADMIN_LOGIN_MAX_FAILURES - 1) assert.equal(res.status, 401);
      else assert.equal(res.status, 429);
    }

    const evenCorrect = await passwordLogin(
      loginRequest({ username: ADMIN_TEAM_USERNAME, password }, ip)
    );
    assert.equal(evenCorrect.status, 429);
    assert.equal(cookieAttrs(evenCorrect), undefined);
  });
});

describe("admin login POST content-type and origin", () => {
  it("accepts application/json including an optional charset parameter", () => {
    assert.equal(isJsonContentType("application/json"), true);
    assert.equal(isJsonContentType("application/json; charset=utf-8"), true);
    assert.equal(isJsonContentType("text/plain"), false);
    assert.equal(isJsonContentType(null), false);
  });

  it("allows apex and www via exact URL.origin equality; localhost only in non-production", () => {
    assert.equal(isAllowedAdminLoginOrigin(ADMIN_LOGIN_APEX_ORIGIN, false), true);
    assert.equal(isAllowedAdminLoginOrigin(ADMIN_LOGIN_WWW_ORIGIN, false), true);
    assert.equal(
      isAllowedAdminLoginOrigin("http://localhost:3000", false),
      false
    );
    assert.equal(isAllowedAdminLoginOrigin("http://localhost:3000", true), true);
    assert.equal(isAllowedAdminLoginOrigin("https://evil.example", true), false);
    assert.equal(
      parseExactOrigin("https://www.defiuniversity.xyz/admin/login"),
      ADMIN_LOGIN_WWW_ORIGIN
    );
  });

  it("rejects a missing or non-JSON content-type with 403", async () => {
    const missing = await passwordLogin(
      loginRequest(
        { username: ADMIN_TEAM_USERNAME, password },
        "203.0.113.93",
        { "content-type": "text/plain" }
      )
    );
    assert.equal(missing.status, 403);
    const json = await missing.json();
    assert.equal(json.error, "Forbidden");
    assert.equal(cookieAttrs(missing), undefined);
  });

  it("rejects a cross-site Origin with 403", async () => {
    const res = await passwordLogin(
      loginRequest(
        { username: ADMIN_TEAM_USERNAME, password },
        "203.0.113.94",
        { origin: "https://evil.example" }
      )
    );
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.error, "Forbidden");
    assert.equal(cookieAttrs(res), undefined);
  });

  it("accepts the production site Origin (same headers the login page fetch sends)", async () => {
    const res = await passwordLogin(
      loginRequest(
        { username: ADMIN_TEAM_USERNAME, password },
        "203.0.113.95",
        { origin: "https://defiuniversity.xyz" }
      )
    );
    assert.equal(res.status, 200);
  });

  it("accepts https://www.defiuniversity.xyz Origin on password and Google login", async () => {
    const passwordRes = await passwordLogin(
      loginRequest(
        { username: ADMIN_TEAM_USERNAME, password },
        "203.0.113.99",
        { origin: ADMIN_LOGIN_WWW_ORIGIN }
      )
    );
    assert.equal(passwordRes.status, 200);

    const googleRes = await googleLogin(
      googleLoginRequest({ idToken: "x" }, { origin: ADMIN_LOGIN_WWW_ORIGIN })
    );
    assert.notEqual(googleRes.status, 403);
  });

  it("rejects Origin: null", async () => {
    const res = await passwordLogin(
      loginRequest(
        { username: ADMIN_TEAM_USERNAME, password },
        "203.0.113.100",
        { origin: "null" }
      )
    );
    assert.equal(res.status, 403);
    assert.equal(parseExactOrigin("null"), null);
    assert.equal(isAllowedAdminLoginOrigin("null", true), false);

    const withFetchSite = await passwordLogin(
      loginRequest(
        { username: ADMIN_TEAM_USERNAME, password },
        "203.0.113.100",
        { origin: "null", "sec-fetch-site": "same-origin" }
      )
    );
    assert.equal(withFetchSite.status, 403);
  });

  it("accepts Sec-Fetch-Site same-origin when Origin is omitted", async () => {
    const req = new NextRequest("http://localhost/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "sec-fetch-site": "same-origin",
        "x-forwarded-for": "203.0.113.96",
      },
      body: JSON.stringify({ username: ADMIN_TEAM_USERNAME, password }),
    });
    const res = await passwordLogin(req);
    assert.equal(res.status, 200);
  });

  it("rejects Sec-Fetch-Site same-site and cross-site unless Referer exact-matches", async () => {
    const sameSite = new NextRequest("http://localhost/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "sec-fetch-site": "same-site",
        "x-forwarded-for": "203.0.113.101",
      },
      body: JSON.stringify({ username: ADMIN_TEAM_USERNAME, password }),
    });
    assert.equal((await passwordLogin(sameSite)).status, 403);

    const crossSite = new NextRequest("http://localhost/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "sec-fetch-site": "cross-site",
        "x-forwarded-for": "203.0.113.102",
      },
      body: JSON.stringify({ username: ADMIN_TEAM_USERNAME, password }),
    });
    assert.equal((await passwordLogin(crossSite)).status, 403);

    const sameSiteWithReferer = new NextRequest("http://localhost/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "sec-fetch-site": "same-site",
        referer: `${ADMIN_LOGIN_WWW_ORIGIN}/admin/login`,
        "x-forwarded-for": "203.0.113.103",
      },
      body: JSON.stringify({ username: ADMIN_TEAM_USERNAME, password }),
    });
    assert.equal((await passwordLogin(sameSiteWithReferer)).status, 200);
  });

  it("rejects look-alike Referers that are not an exact allowlisted origin", async () => {
    const lookalikes = [
      "https://defiuniversity.xyz.evil.com/",
      "https://evil.com/?https://defiuniversity.xyz",
      "https://defiuniversity.xyz@evil.com/",
      "http://defiuniversity.xyz",
      "http://www.defiuniversity.xyz/admin/login",
      "https://wwwdefiuniversity.xyz",
    ];
    for (const referer of lookalikes) {
      assert.equal(
        isAllowedAdminLoginOrigin(referer, false),
        false,
        referer
      );
      const req = new NextRequest("http://localhost/api/admin/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          referer,
          "sec-fetch-site": "same-site",
          "x-forwarded-for": "203.0.113.104",
        },
        body: JSON.stringify({ username: ADMIN_TEAM_USERNAME, password }),
      });
      assert.equal((await passwordLogin(req)).status, 403, referer);
    }
  });

  it("does not expand the allowlist from Host or X-Forwarded-Host", async () => {
    const allowlist = adminLoginOriginAllowlist();
    assert.equal(allowlist.includes(ADMIN_LOGIN_APEX_ORIGIN), true);
    assert.equal(allowlist.includes(ADMIN_LOGIN_WWW_ORIGIN), true);

    const spoofed = new NextRequest("https://evil.example/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://evil.example",
        host: "www.defiuniversity.xyz",
        "x-forwarded-host": "www.defiuniversity.xyz",
        "x-forwarded-for": "203.0.113.105",
      },
      body: JSON.stringify({ username: ADMIN_TEAM_USERNAME, password }),
    });
    assert.equal(adminLoginRequestIsTrustedOrigin(spoofed), false);
    assert.equal((await passwordLogin(spoofed)).status, 403);

    const headerOnly = new NextRequest("https://evil.example/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "defiuniversity.xyz",
        "x-forwarded-host": "www.defiuniversity.xyz",
        "x-forwarded-for": "203.0.113.106",
      },
      body: JSON.stringify({ username: ADMIN_TEAM_USERNAME, password }),
    });
    assert.equal(adminLoginRequestIsTrustedOrigin(headerOnly), false);
    assert.equal((await passwordLogin(headerOnly)).status, 403);
  });

  it("accepts a same-origin Referer when Origin is omitted", async () => {
    const req = new NextRequest("http://localhost/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        referer: "http://localhost:3000/admin/login",
        "x-forwarded-for": "203.0.113.97",
      },
      body: JSON.stringify({ username: ADMIN_TEAM_USERNAME, password }),
    });
    const res = await passwordLogin(req);
    assert.equal(res.status, 200);
  });

  it("rejects a request with no Origin, Sec-Fetch-Site, or Referer", async () => {
    const req = new NextRequest("http://localhost/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.98",
      },
      body: JSON.stringify({ username: ADMIN_TEAM_USERNAME, password }),
    });
    const res = await passwordLogin(req);
    assert.equal(res.status, 403);
  });

  it("applies the same 403 guards to the Google login endpoint", async () => {
    const crossSite = await googleLogin(
      googleLoginRequest({ idToken: "x" }, { origin: "https://evil.example" })
    );
    assert.equal(crossSite.status, 403);

    const badType = await googleLogin(
      googleLoginRequest({ idToken: "x" }, { "content-type": "text/plain" })
    );
    assert.equal(badType.status, 403);
  });
});
});

describe("trusted admin client IP from X-Forwarded-For", () => {
  it("takes the next-to-last hop (ALB client), ignoring a spoofed prefix and the LB IP", () => {
    assert.equal(
      trustedAdminClientIp("203.0.113.50, 8.233.107.134", null),
      "203.0.113.50"
    );
    assert.equal(
      trustedAdminClientIp(
        "192.0.2.1, 198.51.100.9, 203.0.113.50, 8.233.107.134",
        "10.0.0.1"
      ),
      "203.0.113.50"
    );
    assert.equal(
      lastForwardedClientIp(
        "192.0.2.1, 198.51.100.9, 203.0.113.50, 8.233.107.134",
        null
      ),
      "203.0.113.50"
    );
    assert.notEqual(
      trustedAdminClientIp("192.0.2.1, 203.0.113.50, 8.233.107.134", null),
      "192.0.2.1"
    );
    assert.notEqual(
      trustedAdminClientIp("192.0.2.1, 203.0.113.50, 8.233.107.134", null),
      "8.233.107.134"
    );
  });

  it("uses a single hop or X-Real-IP when the ALB pair is absent", () => {
    assert.equal(trustedAdminClientIp("203.0.113.9", "10.0.0.1"), "203.0.113.9");
    assert.equal(trustedAdminClientIp(null, "10.0.0.1"), "10.0.0.1");
    assert.equal(trustedAdminClientIp(null, null), "unknown");
    assert.equal(trustedAdminClientIp("  ", "  "), "unknown");
  });
});

describe("timing-safe string compare", () => {
  it("returns true only for identical strings", () => {
    assert.equal(timingSafeEqualString("defi_u_team", "defi_u_team"), true);
    assert.equal(timingSafeEqualString("defi_u_team", "defi_u_teams"), false);
    assert.equal(timingSafeEqualString("abc", "xyz"), false);
  });
});

describe("admin ?next= allowlist", () => {
  it("allows relative paths under /admin including a simple query string", () => {
    assert.equal(safeAdminNextPath(null), DEFAULT_ADMIN_NEXT_PATH);
    assert.equal(safeAdminNextPath(""), DEFAULT_ADMIN_NEXT_PATH);
    assert.equal(safeAdminNextPath("/admin"), "/admin");
    assert.equal(safeAdminNextPath("/admin/people"), "/admin/people");
    assert.equal(safeAdminNextPath("/admin/email/sends?x=1"), "/admin/email/sends?x=1");
    assert.equal(safeAdminNextPath("/admin/coaching/sessions"), "/admin/coaching/sessions");
    assert.equal(safeAdminNextPath("/admin/login"), "/admin/login");
  });

  it("rejects open-redirect and encoded tricks by falling back to /admin", () => {
    const rejected = [
      "//evil.com",
      "/\\evil.com",
      "/%5Cevil.com",
      "%2F%2Fevil.com",
      "/%2F/evil.com",
      "%252F%252Fevil.com",
      "/admin/../evil",
      "/admin/..%2F..%2Fevil",
      "/admin@evil.com",
      "https://user@evil.com",
      "/adminevil",
      "/admin%0d%0aSet-Cookie:x",
      "/admin\r\nSet-Cookie:x",
      "javascript:alert(1)",
      "/admin\\evil",
    ];
    for (const vector of rejected) {
      assert.equal(safeAdminNextPath(vector), "/admin", vector);
    }
  });
});

describe("firestore rules deny admin_login_attempts", () => {
  it("includes an explicit deny-all match for admin_login_attempts/{doc}", () => {
    const rulesPath = join(
      dirname(fileURLToPath(import.meta.url)),
      "../../database/security-rules.rules"
    );
    const rules = readFileSync(rulesPath, "utf8");
    assert.match(rules, /match \/admin_login_attempts\/\{doc\}/);
    const block = rules.slice(rules.indexOf("match /admin_login_attempts/{doc}"));
    const end = block.indexOf("match /", 1);
    const snippet = end === -1 ? block : block.slice(0, end);
    assert.match(snippet, /allow read, write:\s*if false/);
  });
});
