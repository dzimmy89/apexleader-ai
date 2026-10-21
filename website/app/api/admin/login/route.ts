import { NextRequest, NextResponse } from "next/server";
import { trustedAdminClientIp } from "@/lib/auth/admin-login-client-ip";
import {
  adminLoginLimiter,
  passwordLoginLockKeys,
} from "@/lib/auth/admin-login-rate-limit";
import { rejectUntrustedAdminLoginPost } from "@/lib/auth/admin-login-request-guards";
import {
  assertNever,
  verifyAdminTeamPassword,
} from "@/lib/auth/admin-team-password";
import { jsonWithAdminSession } from "@/lib/auth/issue-admin-session";
import { clearAdminCookie } from "@/lib/auth/admin-session-cookie";
import { getDb } from "@/lib/firebase-admin";

const INVALID = { error: "Invalid credentials" } as const;
const DISABLED = { error: "Password sign-in is disabled" } as const;
const LOCKED = { error: "Too many attempts. Try again later." } as const;

function lockedResponse(): NextResponse {
  return NextResponse.json(LOCKED, { status: 429 });
}

function clientIp(request: NextRequest): string {
  return trustedAdminClientIp(
    request.headers.get("x-forwarded-for"),
    request.headers.get("x-real-ip")
  );
}

export async function POST(request: NextRequest) {
  const rejected = rejectUntrustedAdminLoginPost(request);
  if (rejected) return rejected;

  let username = "";
  let password = "";
  try {
    const body = await request.json();
    username = String(body.username || "");
    password = String(body.password || "");
  } catch {
    return NextResponse.json(INVALID, { status: 401 });
  }

  const keys = passwordLoginLockKeys(clientIp(request));
  const limiter = adminLoginLimiter(getDb());

  try {
    if (await limiter.isLocked(keys)) {
      return lockedResponse();
    }
  } catch {
    return lockedResponse();
  }

  const result = await verifyAdminTeamPassword(username, password);
  if (!result.ok) {
    switch (result.reason) {
      case "disabled":
        return NextResponse.json(DISABLED, { status: 403 });
      case "invalid": {
        try {
          const recorded = await limiter.recordFailures(keys);
          if (recorded.locked) return lockedResponse();
        } catch {
          return lockedResponse();
        }
        return NextResponse.json(INVALID, { status: 401 });
      }
      default:
        return assertNever(result.reason);
    }
  }

  try {
    await limiter.reset(keys);
  } catch {
    // Password already verified. Do not fail the session if counter reset fails.
  }
  return jsonWithAdminSession(result.username);
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
