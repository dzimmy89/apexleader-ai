import { NextRequest, NextResponse } from "next/server";
import { rejectUntrustedAdminLoginPost } from "@/lib/auth/admin-login-request-guards";
import { getDb } from "@/lib/firebase-admin";
import { getAccountEmail } from "@/lib/account/session";
import { getAccess } from "@/lib/account/access";
import { createPortalSession } from "@/lib/account/stripe-portal";

/** POST: open the Stripe customer portal for the signed-in account. Returns { url }. */
export async function POST(request: NextRequest) {
  const rejected = rejectUntrustedAdminLoginPost(request);
  if (rejected) return rejected;
  const email = await getAccountEmail();
  if (!email) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const access = await getAccess(email);
  let recordCustomerId: string | null = null;
  if (access.clientEmail) {
    const record = (await getDb().collection("client_records").doc(access.clientEmail).get()).data() || {};
    recordCustomerId = typeof record.stripeCustomerId === "string" && record.stripeCustomerId ? record.stripeCustomerId : null;
  }
  const result = await createPortalSession({ emails: access.emails, recordCustomerId });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ url: result.url });
}
