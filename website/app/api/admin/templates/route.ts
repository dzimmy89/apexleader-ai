import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getTemplate, listTemplateIds } from "@/lib/email-templates";
import { getSiteOrigin } from "@/lib/env";
import { BRAND } from "@/lib/brand";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const origin = getSiteOrigin();
  const previews = listTemplateIds().map((stepId) => {
    const rendered = getTemplate(stepId, {
      email: `preview@${BRAND.domain}`,
      firstName: "Preview",
      unsubscribeUrl: `${origin}/api/unsubscribe?token=preview&email=preview@${BRAND.domain}`,
    });
    return { stepId, subject: rendered.subject, html: rendered.html };
  });
  return NextResponse.json({ templates: previews });
}
