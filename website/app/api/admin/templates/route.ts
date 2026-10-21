import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getTemplate, listTemplateIds } from "@/lib/email-templates";
import { getSiteOrigin } from "@/lib/env";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const origin = getSiteOrigin();
  const previews = listTemplateIds().map((stepId) => {
    const rendered = getTemplate(stepId, {
      email: "preview@defiuniversity.xyz",
      firstName: "Preview",
      unsubscribeUrl: `${origin}/api/unsubscribe?token=preview&email=preview@defiuniversity.xyz`,
    });
    return { stepId, subject: rendered.subject, html: rendered.html };
  });
  return NextResponse.json({ templates: previews });
}
