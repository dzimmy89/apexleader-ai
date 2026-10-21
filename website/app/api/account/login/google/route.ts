import { NextRequest, NextResponse } from "next/server";
import { rejectUntrustedAdminLoginPost } from "@/lib/auth/admin-login-request-guards";
import { clientIpFromHeaders, isLeadRateLimited } from "@/lib/lead-rate-limit";
import { verifyMemberGoogleToken } from "@/lib/account/google";
import { safeNextPath, touchAccount } from "@/lib/account/login";
import { primaryEmailFor } from "@/lib/account/links";
import { getAccess } from "@/lib/account/access";
import { applyAccountCookie, createAccountSession } from "@/lib/account/session";
import { captureLead } from "@/lib/crm/leads";
import { CONSENT_TEXT_VERSION } from "@/lib/consent";

/** POST { idToken, next }: sign in or create an account with Google. */
export async function POST(request: NextRequest) {
  // Same JSON + same-origin check as admin sign-in, so another site cannot post a token here.
  const rejected = rejectUntrustedAdminLoginPost(request);
  if (rejected) return rejected;
  const ip = clientIpFromHeaders(request.headers);
  if (isLeadRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const verified = await verifyMemberGoogleToken(String(body.idToken || ""));
  if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: 401 });

  try {
    const email = await primaryEmailFor(verified.identity.email);
    await touchAccount(email, { lastSignInMethod: "google" });
    const next = safeNextPath(body.next);
    // Free learners join the email list, the same as the email sign-in form.
    const access = await getAccess(email);
    if (!access.hasCourseAccess && !access.isCoachingClient) {
      await captureLead({
        email,
        firstName: verified.identity.name?.split(" ")[0],
        source: "university_signin",
        landingPath: next,
        ip,
        userAgent: request.headers.get("user-agent") || undefined,
        consentTextVersion: CONSENT_TEXT_VERSION,
      }).catch((e) => console.error("[account/login/google] lead capture failed", e));
    }
    const response = NextResponse.json({ ok: true, next });
    applyAccountCookie(response, await createAccountSession(email));
    return response;
  } catch (e) {
    console.error("[account/login/google] unexpected error", e);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
