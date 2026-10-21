import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/html";
import { clientIpFromHeaders, isLeadRateLimited } from "@/lib/lead-rate-limit";
import { sendLoginLink, safeNextPath } from "@/lib/account/login";
import { getAccess } from "@/lib/account/access";
import { captureLead } from "@/lib/crm/leads";
import { CONSENT_TEXT_VERSION } from "@/lib/consent";

export async function POST(request: NextRequest) {
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
  if (String(body.website || "").trim()) return NextResponse.json({ ok: true });
  const email = String(body.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });

  try {
    const sent = await sendLoginLink(email, safeNextPath(body.next));
    if (!sent.ok) {
      console.error("[account/login] send failed", sent.error);
      return NextResponse.json({ error: "We could not send the email. Try again." }, { status: 502 });
    }
    // Free learners join the email list the way the checklist form does;
    // members and coaching clients are already known.
    const access = await getAccess(email);
    if (!access.hasCourseAccess) {
      await captureLead({
        email,
        source: "university_signin",
        landingPath: safeNextPath(body.next),
        ip,
        userAgent: request.headers.get("user-agent") || undefined,
        consentTextVersion: CONSENT_TEXT_VERSION,
      }).catch((e) => console.error("[account/login] lead capture failed", e));
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[account/login] unexpected error", e);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
