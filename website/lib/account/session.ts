import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { readAdminJwtSecret } from "@/lib/auth/admin-session-cookie";
import { SIGNED_IN_HINT } from "@/lib/account/signed-in-hint";

/**
 * Member and coaching-client sign-in. Separate cookie and role from the
 * admin session so an account cookie can never open /admin.
 */
const COOKIE_NAME = "apex_account";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secretBytes(): Uint8Array | null {
  const secret = readAdminJwtSecret();
  return secret === null ? null : new TextEncoder().encode(`account:${secret}`);
}

export async function createAccountSession(email: string): Promise<string> {
  const secret = secretBytes();
  if (!secret) throw new Error("JWT_SECRET is required to sign account sessions");
  return new SignJWT({ sub: email.trim().toLowerCase(), role: "account" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret);
}

export async function verifyAccountSession(
  token: string | undefined
): Promise<{ valid: boolean; email?: string }> {
  if (!token) return { valid: false };
  const secret = secretBytes();
  if (!secret) return { valid: false };
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "account" || typeof payload.sub !== "string") return { valid: false };
    return { valid: true, email: payload.sub };
  } catch {
    return { valid: false };
  }
}

export function applyAccountCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  response.cookies.set(SIGNED_IN_HINT, "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearAccountCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  response.cookies.set(SIGNED_IN_HINT, "", { path: "/", maxAge: 0 });
}

let emailForTests: string | null | undefined;

/** Test-only: act as this signed-in email (null: signed out). Pass undefined to clear. */
export function setAccountEmailForTests(email: string | null | undefined): void {
  emailForTests = email;
}

/** The signed-in email, or null. Server components and route handlers only. */
export async function getAccountEmail(): Promise<string | null> {
  if (emailForTests !== undefined) return emailForTests;
  const jar = await cookies();
  const session = await verifyAccountSession(jar.get(COOKIE_NAME)?.value);
  return session.valid && session.email ? session.email : null;
}

export { COOKIE_NAME as ACCOUNT_COOKIE_NAME };
