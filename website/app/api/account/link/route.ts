import { NextRequest, NextResponse } from "next/server";
import { rejectUntrustedAdminLoginPost } from "@/lib/auth/admin-login-request-guards";
import { isValidEmail } from "@/lib/html";
import { clientIpFromHeaders, isLeadRateLimited } from "@/lib/lead-rate-limit";
import { getAccountEmail } from "@/lib/account/session";
import { sendLoginLink } from "@/lib/account/login";
import { linkBlocker, unlinkEmail } from "@/lib/account/links";

async function readBody(request: NextRequest): Promise<{ email: string } | null> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    return { email: String(body.email || "").trim().toLowerCase() };
  } catch {
    return null;
  }
}

/** POST { email }: email a confirmation link that adds `email` to the signed-in account. */
export async function POST(request: NextRequest) {
  const rejected = rejectUntrustedAdminLoginPost(request);
  if (rejected) return rejected;
  const primary = await getAccountEmail();
  if (!primary) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  if (isLeadRateLimited(clientIpFromHeaders(request.headers))) {
    return NextResponse.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });
  }
  const body = await readBody(request);
  if (!body || !isValidEmail(body.email)) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  const blocker = await linkBlocker(primary, body.email);
  if (blocker) return NextResponse.json({ error: blocker }, { status: 409 });
  const sent = await sendLoginLink(body.email, "/account", { linkTo: primary });
  if (!sent.ok) {
    console.error("[account/link] send failed", sent.error);
    return NextResponse.json({ error: "We could not send the email. Try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

/** DELETE { email }: remove a linked email from the signed-in account. */
export async function DELETE(request: NextRequest) {
  const rejected = rejectUntrustedAdminLoginPost(request);
  if (rejected) return rejected;
  const primary = await getAccountEmail();
  if (!primary) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const body = await readBody(request);
  if (!body || !body.email) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const removed = await unlinkEmail(primary, body.email);
  return removed ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "That email is not on your account" }, { status: 404 });
}
