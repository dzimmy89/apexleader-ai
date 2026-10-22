import { NextRequest, NextResponse } from "next/server";
import { getDb, leadDocId } from "@/lib/firebase-admin";
import { unsubscribeLeadByEmail } from "@/lib/crm/leads";
import {
  UNSUBSCRIBE_PURPOSE,
  verifyEmailToken,
} from "@/lib/email-tokens";
import { isOneClickUnsubscribeRequest } from "@/lib/crm/lead-lifecycle";

async function resolveEmailFromRequest(
  _request: NextRequest,
  token: string | null,
  emailParam: string | null
): Promise<string | null> {
  if (token) {
    const signed = await verifyEmailToken(token, UNSUBSCRIBE_PURPOSE);
    if (signed.ok) return signed.email;
  }
  const email = emailParam?.trim().toLowerCase();
  if (email && token) {
    const db = getDb();
    const lead = await db.collection("leads").doc(leadDocId(email)).get();
    if (lead.exists && lead.data()?.unsubscribeToken === token) {
      return email;
    }
  }
  return null;
}

function unsubscribePageHtml(token: string, email: string | null): string {
  const action = `/api/unsubscribe?token=${encodeURIComponent(token)}${
    email ? `&email=${encodeURIComponent(email)}` : ""
  }`;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Unsubscribe — ApexLeader.ai</title></head>
<body style="font-family:Georgia,serif;background:#0f0f0f;color:#e8e4dc;padding:40px;max-width:560px;margin:0 auto;">
  <h1>Unsubscribe</h1>
  <p>Unsubscribe from all ApexLeader.ai marketing email.</p>
  <form method="POST" action="${action}">
    <button type="submit" style="margin-top:16px;padding:12px 20px;background:#c9a227;color:#0f0f0f;border:0;font-weight:bold;cursor:pointer;">
      Unsubscribe from all ApexLeader.ai marketing email
    </button>
  </form>
</body>
</html>`;
}

function doneHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Unsubscribed — ApexLeader.ai</title></head>
<body style="font-family:Georgia,serif;background:#0f0f0f;color:#e8e4dc;padding:40px;">
  <h1>Unsubscribed</h1>
  <p>You will no longer receive marketing emails from ApexLeader.ai.</p>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const emailParam = request.nextUrl.searchParams.get("email")?.toLowerCase() || null;
  if (!token) {
    return new NextResponse("Invalid unsubscribe link", { status: 400 });
  }
  const email = await resolveEmailFromRequest(request, token, emailParam);
  if (!email) {
    return new NextResponse("Invalid unsubscribe link", { status: 400 });
  }
  return new NextResponse(unsubscribePageHtml(token, email), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const emailParam = request.nextUrl.searchParams.get("email")?.toLowerCase() || null;
  const email = await resolveEmailFromRequest(request, token, emailParam);
  if (!email) {
    return new NextResponse("Invalid unsubscribe link", { status: 400 });
  }

  const contentType = request.headers.get("content-type");
  const bodyText = await request.text().catch(() => "");
  const oneClick = isOneClickUnsubscribeRequest({
    contentType,
    bodyText,
    headerListUnsubscribe: request.headers.get("list-unsubscribe"),
  });

  await unsubscribeLeadByEmail(email, oneClick ? "one_click" : "link");

  if (oneClick) {
    return new NextResponse(null, { status: 200 });
  }
  return new NextResponse(doneHtml(), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, List-Unsubscribe",
    },
  });
}
