import { NextResponse } from "next/server";
import {
  AdminJwtSecretMissingError,
  applyAdminSessionCookie,
  createAdminSession,
} from "@/lib/auth/admin-session-cookie";

const UNAVAILABLE = { error: "Admin session is unavailable" } as const;

export async function jsonWithAdminSession(
  subject: string,
  body: Record<string, unknown> = {}
): Promise<NextResponse> {
  try {
    const token = await createAdminSession(subject);
    const res = NextResponse.json({ ok: true, ...body });
    applyAdminSessionCookie(res, token);
    return res;
  } catch (error) {
    if (error instanceof AdminJwtSecretMissingError) {
      return NextResponse.json(UNAVAILABLE, { status: 503 });
    }
    throw error;
  }
}
