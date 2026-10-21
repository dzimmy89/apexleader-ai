import { NextRequest, NextResponse } from "next/server";
import { verifyGoogleAdminIdToken } from "@/lib/admin-google-auth";
import { rejectUntrustedAdminLoginPost } from "@/lib/auth/admin-login-request-guards";
import { jsonWithAdminSession } from "@/lib/auth/issue-admin-session";

export async function POST(request: NextRequest) {
  const rejected = rejectUntrustedAdminLoginPost(request);
  if (rejected) return rejected;

  const body = await request.json();
  const idToken = String(body.idToken || "");

  const result = await verifyGoogleAdminIdToken(idToken);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  return jsonWithAdminSession(result.email, { email: result.email });
}
