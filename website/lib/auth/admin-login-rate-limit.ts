import type { Firestore } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase-admin";
import { ADMIN_TEAM_USERNAME } from "@/lib/auth/admin-team-password";

/**
 * Firestore-backed failed-attempt lockout for password admin login.
 * Admin SDK only. Client SDKs cannot read/write this collection
 * (`match /admin_login_attempts/{doc}` deny-all in
 * database/security-rules.rules, plus default-deny for unmatched paths).
 *
 * Fail-closed: callers must treat thrown errors as locked. Google sign-in
 * must not call this module.
 *
 * Design (password path only):
 * - Per-IP hard lock: ADMIN_LOGIN_MAX_FAILURES (5) in 15 min → 15 min 429.
 *   An attacker is stopped at the IP key before they can fill the username
 *   bucket (one source contributes at most 5 username failures).
 * - Per-username hard lock: much higher ADMIN_LOGIN_USERNAME_MAX_FAILURES
 *   (40). That is 8 distinct IPs at the per-IP cap, so one client cannot
 *   lock `defi_u_team` for everyone. It remains a safety valve against a
 *   distributed bcrypt-CPU flood.
 *
 * Trade-offs: a botnet of ≥8 IPs can still lock the shared username for
 * 15 minutes (team must use Google sign-in or wait). A slowdown-only
 * username policy would keep password login available but spend bcrypt on
 * every attempt. We chose a high hard cap rather than a delay loop so
 * locked requests stay cheap (429 before bcrypt).
 */

export const ADMIN_LOGIN_ATTEMPTS_COLLECTION = "admin_login_attempts";
export const ADMIN_LOGIN_MAX_FAILURES = 5;
export const ADMIN_LOGIN_USERNAME_MAX_FAILURES = 40;
export const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const ADMIN_LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

export type AdminLoginAttemptDoc = {
  failures: number[];
  lockedUntil: number;
  updatedAt: number;
};

type Tx = {
  get: (ref: unknown) => Promise<{ exists: boolean; data: () => unknown }>;
  set: (ref: unknown, data: AdminLoginAttemptDoc) => void;
  delete: (ref: unknown) => void;
};

type AttemptStore = {
  collection: (name: string) => { doc: (id: string) => unknown };
  runTransaction: <T>(fn: (tx: Tx) => Promise<T>) => Promise<T>;
};

function asStore(db: Firestore): AttemptStore {
  return db as unknown as AttemptStore;
}

export function adminLoginUsernameDocId(): string {
  return `user:${ADMIN_TEAM_USERNAME}`;
}

export function adminLoginIpDocId(ip: string): string {
  const safe = (ip.trim() || "unknown").slice(0, 128).replace(/\//g, "_");
  return `ip:${safe}`;
}

export function lockThresholdForAttemptKey(key: string): number {
  if (key.startsWith("user:")) return ADMIN_LOGIN_USERNAME_MAX_FAILURES;
  return ADMIN_LOGIN_MAX_FAILURES;
}

function readState(raw: unknown, now: number): AdminLoginAttemptDoc {
  const cutoff = now - ADMIN_LOGIN_WINDOW_MS;
  const data =
    raw && typeof raw === "object" ? (raw as Partial<AdminLoginAttemptDoc>) : {};
  const failures = Array.isArray(data.failures)
    ? data.failures.filter(
        (ts): ts is number => typeof ts === "number" && ts > cutoff
      )
    : [];
  let lockedUntil = typeof data.lockedUntil === "number" ? data.lockedUntil : 0;
  if (lockedUntil > 0 && now >= lockedUntil) {
    lockedUntil = 0;
  }
  return {
    failures,
    lockedUntil,
    updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
  };
}

function currentlyLocked(state: AdminLoginAttemptDoc, now: number): boolean {
  return state.lockedUntil > now;
}

export class FirestoreAdminLoginLimiter {
  constructor(private readonly db: Firestore) {}

  private col() {
    return asStore(this.db).collection(ADMIN_LOGIN_ATTEMPTS_COLLECTION);
  }

  async isLocked(keys: string[], now = Date.now()): Promise<boolean> {
    return asStore(this.db).runTransaction(async (tx) => {
      for (const key of keys) {
        const snap = await tx.get(this.col().doc(key));
        const state = readState(snap.exists ? snap.data() : undefined, now);
        if (currentlyLocked(state, now)) return true;
      }
      return false;
    });
  }

  /**
   * Increment every key in one transaction so concurrent attempts cannot
   * skip past that key's failure threshold.
   */
  async recordFailures(
    keys: string[],
    now = Date.now()
  ): Promise<{ locked: boolean }> {
    return asStore(this.db).runTransaction(async (tx) => {
      const refs = keys.map((key) => this.col().doc(key));
      const snaps = [];
      for (const ref of refs) {
        snaps.push(await tx.get(ref));
      }
      let locked = false;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key === undefined) continue;
        const state = readState(
          snaps[i]?.exists ? snaps[i]?.data() : undefined,
          now
        );
        state.failures.push(now);
        if (state.failures.length >= lockThresholdForAttemptKey(key)) {
          state.lockedUntil = now + ADMIN_LOGIN_LOCKOUT_MS;
        }
        state.updatedAt = now;
        const ref = refs[i];
        if (ref === undefined) continue;
        tx.set(ref, {
          failures: state.failures,
          lockedUntil: state.lockedUntil,
          updatedAt: state.updatedAt,
        });
        if (currentlyLocked(state, now)) locked = true;
      }
      return { locked };
    });
  }

  async reset(keys: string[]): Promise<void> {
    await asStore(this.db).runTransaction(async (tx) => {
      const refs = keys.map((key) => this.col().doc(key));
      for (const ref of refs) {
        await tx.get(ref);
      }
      for (const ref of refs) {
        tx.delete(ref);
      }
    });
  }
}

export function adminLoginLimiter(db: Firestore = getDb()): FirestoreAdminLoginLimiter {
  return new FirestoreAdminLoginLimiter(db);
}

export function passwordLoginLockKeys(ip: string): string[] {
  return [adminLoginUsernameDocId(), adminLoginIpDocId(ip)];
}
