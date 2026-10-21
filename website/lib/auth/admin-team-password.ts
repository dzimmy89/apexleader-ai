import bcrypt from "bcryptjs";
import { timingSafeEqualString } from "@/lib/auth/timing-safe-equal";
import { isValidEmail } from "@/lib/html";

/** Canonical password-login subject stored on the session cookie (`sub`). */
export const ADMIN_TEAM_USERNAME = "defi_u_team";

const HASH_ENV = "ADMIN_TEAM_PASSWORD_HASH";

/** Username is compared as a whole string; over-length is rejected, never sliced. */
export const MAX_ADMIN_USERNAME_CHARS = 64;

/**
 * bcrypt only uses 72 UTF-8 bytes. Over-length is rejected with the same
 * generic invalid result, before any bcrypt work (also caps CPU on huge
 * passwords). Over-length is counted as a failed attempt by the login route
 * (`reason: "invalid"` → lockout counters), same as a wrong password.
 */
export const MAX_ADMIN_PASSWORD_BYTES = 72;

/**
 * 53-character bcrypt salt+digest body. Paired with the configured cost so a
 * wrong username still pays bcrypt.compare. Not a production password hash.
 */
const DUMMY_BCRYPT_BODY = "qmfFP5U087qcnQymdK9.uONUtBRdrSVVKHRZQlKes83I.4rwX6n0i";

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

/**
 * True when username/password are within the caps. Over-length is a failed
 * attempt (lockout), not a separate error channel.
 */
export function adminLoginCredentialsWithinLimits(
  username: string,
  password: string
): boolean {
  return (
    username.length <= MAX_ADMIN_USERNAME_CHARS &&
    utf8ByteLength(password) <= MAX_ADMIN_PASSWORD_BYTES
  );
}

export function isBcryptPasswordHash(value: string): boolean {
  return BCRYPT_HASH_PATTERN.test(value);
}

function configuredAdminTeamPasswordHash(): string | null {
  const hash = process.env[HASH_ENV]?.trim() ?? "";
  if (!hash || !isBcryptPasswordHash(hash)) return null;
  return hash;
}

export function isAdminTeamPasswordConfigured(): boolean {
  return configuredAdminTeamPasswordHash() !== null;
}

function dummyHashMatchingCost(configuredHash: string): string {
  const cost = configuredHash.slice(4, 6);
  const rounds = /^\d{2}$/.test(cost) ? cost : "12";
  return `$2b$${rounds}$${DUMMY_BCRYPT_BODY}`;
}

export function isPasswordAdminPrincipal(username: string): boolean {
  return timingSafeEqualString(username, ADMIN_TEAM_USERNAME);
}

/** Google sessions use an email `sub`; password sessions use ADMIN_TEAM_USERNAME. */
export function adminSessionLooksLikeEmail(username: string): boolean {
  return isValidEmail(username);
}

export type AdminTeamPasswordVerifyResult =
  | { ok: true; username: string }
  | { ok: false; reason: "disabled" | "invalid" };

export async function verifyAdminTeamPassword(
  username: string,
  password: string
): Promise<AdminTeamPasswordVerifyResult> {
  const hash = configuredAdminTeamPasswordHash();
  if (!hash) {
    return { ok: false, reason: "disabled" };
  }

  // Reject before bcrypt. Do not slice — bcrypt would otherwise ignore bytes
  // past 72 and treat a 73-byte password as a match for the first 72.
  if (!adminLoginCredentialsWithinLimits(username, password)) {
    return { ok: false, reason: "invalid" };
  }

  const usernameOk = timingSafeEqualString(username, ADMIN_TEAM_USERNAME);
  const compareHash = usernameOk ? hash : dummyHashMatchingCost(hash);

  let passwordOk = false;
  try {
    passwordOk = await bcrypt.compare(password, compareHash);
  } catch {
    passwordOk = false;
  }

  if (!usernameOk || !passwordOk) {
    return { ok: false, reason: "invalid" };
  }

  return { ok: true, username: ADMIN_TEAM_USERNAME };
}

export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${String(value)}`);
}
