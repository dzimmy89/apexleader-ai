import { NextRequest } from "next/server";
import {
  COOKIE_NAME,
  getAdminSession,
  verifyAdminSession,
} from "@/lib/auth/admin-session-cookie";

export async function requireAdmin(
  request?: NextRequest
): Promise<{ ok: true; username: string } | { ok: false; status: number }> {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(COOKIE_NAME)?.value;
    const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
    if (bearer && process.env.JWT_SECRET) {
      const v = await verifyAdminSession(bearer);
      if (v.valid && v.username) return { ok: true, username: v.username };
    }
  } else {
    const session = await getAdminSession();
    if (session.valid && session.username) {
      return { ok: true, username: session.username };
    }
    return { ok: false, status: 401 };
  }

  const session = await verifyAdminSession(token);
  if (session.valid && session.username) {
    return { ok: true, username: session.username };
  }
  return { ok: false, status: 401 };
}

/** Cookie session only. Rejects bearer, cron, and secret-header auth. */
export async function requireAdminCookie(
  request: NextRequest
): Promise<{ ok: true; username: string } | { ok: false; status: number }> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await verifyAdminSession(token);
  if (session.valid && session.username) {
    return { ok: true, username: session.username };
  }
  return { ok: false, status: 401 };
}
