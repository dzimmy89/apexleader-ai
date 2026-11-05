import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { readAdminJwtSecret } from "@/lib/auth/admin-session-cookie";

/**
 * A "reader" left an email and mobile at a lesson's exercise gate. It is a
 * lighter cookie than the account session: it opens exercises, not the
 * account page, and no sign-in link is involved, so it must never be treated
 * as proof of who the person is.
 */
const COOKIE_NAME = "fatb_reader";
const MAX_AGE = 60 * 60 * 24 * 180; // 180 days

export interface Reader {
  email: string;
}

function secretBytes(): Uint8Array | null {
  const secret = readAdminJwtSecret();
  return secret === null ? null : new TextEncoder().encode(`reader:${secret}`);
}

export async function createReaderSession(email: string): Promise<string> {
  const secret = secretBytes();
  if (!secret) throw new Error("JWT_SECRET is required to sign reader sessions");
  return new SignJWT({ sub: email.trim().toLowerCase(), role: "reader" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret);
}

export async function verifyReaderSession(token: string | undefined): Promise<Reader | null> {
  if (!token) return null;
  const secret = secretBytes();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "reader" || typeof payload.sub !== "string") return null;
    return { email: payload.sub };
  } catch {
    return null;
  }
}

export function applyReaderCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

let readerForTests: Reader | null | undefined;

/** Test-only: act as this reader (null: no reader cookie). Pass undefined to clear. */
export function setReaderForTests(reader: Reader | null | undefined): void {
  readerForTests = reader;
}

/** The reader from the cookie, or null. Server components and route handlers only. */
export async function getReader(): Promise<Reader | null> {
  if (readerForTests !== undefined) return readerForTests;
  const jar = await cookies();
  return verifyReaderSession(jar.get(COOKIE_NAME)?.value);
}
