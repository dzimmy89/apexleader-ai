import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const COOKIE_NAME = "apex_admin_session";
const MAX_AGE = 60 * 60 * 12; // 12 hours

/** Local/dev only. Never used when NODE_ENV === "production". */
const DEV_ADMIN_JWT_FALLBACK = "dev-admin-secret";

export class AdminJwtSecretMissingError extends Error {
  constructor() {
    super("JWT_SECRET is required to sign admin sessions in production");
    this.name = "AdminJwtSecretMissingError";
  }
}

export type AdminSessionCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
};

/**
 * Admin session HMAC secret. Reads JWT_SECRET at call time (not import time)
 * so `next build` does not require the env var.
 *
 * Production: missing/blank JWT_SECRET → null (fail closed). No fallback to
 * ADMIN_PASSWORD or a known default.
 * Non-production: missing JWT_SECRET → DEV_ADMIN_JWT_FALLBACK.
 */
export function readAdminJwtSecret(): string | null {
  const configured = process.env.JWT_SECRET;
  if (typeof configured === "string" && configured.trim().length > 0) {
    return configured;
  }
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  return DEV_ADMIN_JWT_FALLBACK;
}

export function isAdminJwtSecretConfigured(): boolean {
  return readAdminJwtSecret() !== null;
}

function secretBytes(): Uint8Array {
  const secret = readAdminJwtSecret();
  if (secret === null) {
    throw new AdminJwtSecretMissingError();
  }
  return new TextEncoder().encode(secret);
}

export function getAdminSessionCookieOptions(): AdminSessionCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export function applyAdminSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, getAdminSessionCookieOptions());
}

export async function createAdminSession(username: string): Promise<string> {
  return new SignJWT({ sub: username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretBytes());
}

export async function verifyAdminSession(
  token: string | undefined
): Promise<{ valid: boolean; username?: string }> {
  if (!token) return { valid: false };
  const secret = readAdminJwtSecret();
  if (secret === null) return { valid: false };
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.role !== "admin") return { valid: false };
    return { valid: true, username: payload.sub as string };
  } catch {
    return { valid: false };
  }
}

export async function setAdminCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, getAdminSessionCookieOptions());
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<{
  valid: boolean;
  username?: string;
}> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return verifyAdminSession(token);
}

export { COOKIE_NAME, MAX_AGE as ADMIN_SESSION_MAX_AGE };
