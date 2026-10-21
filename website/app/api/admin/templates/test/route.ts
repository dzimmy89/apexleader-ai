import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminSessionLooksLikeEmail } from "@/lib/auth/admin-team-password";
import { getTemplate } from "@/lib/email-templates";
import { sendEmail } from "@/lib/gmail";
import { getSiteOrigin } from "@/lib/env";
import { isValidEmail } from "@/lib/html";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const body = await request.json();
  const fallback = adminSessionLooksLikeEmail(auth.username) ? auth.username : "";
  const to = String(body.to || fallback);
  if (!isValidEmail(to)) {
    return NextResponse.json(
      { error: "A valid recipient email is required" },
      { status: 400 }
    );
  }
  const stepId = String(body.stepId || "welcome");
  const origin = getSiteOrigin();
  const rendered = getTemplate(stepId, {
    email: to,
    firstName: "Test",
    unsubscribeUrl: `${origin}/api/unsubscribe?token=test&email=${encodeURIComponent(to)}`,
  });
  const result = await sendEmail({
    to,
    subject: `[TEST] ${rendered.subject}`,
    html: rendered.html,
    text: rendered.text,
    unsubscribeUrl: `${origin}/api/unsubscribe?token=test&email=${encodeURIComponent(to)}`,
    purpose: "marketing",
    log: { source: "admin_test", stepId },
  });
  return NextResponse.json(result);
}
