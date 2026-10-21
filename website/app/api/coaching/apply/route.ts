import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/gmail";
import {
  getDiscoveryPrepUrl,
  getInstitutionalApplicationEmailContent,
  resolvePackageContext,
} from "@/lib/coaching/discovery-content";
import { enrollCoachingNurture } from "@/lib/lead-flows";
import { getPackage } from "@/lib/coaching/packages";
import { stampLeadPublicFormSignup } from "@/lib/crm/leads";

// POST /api/coaching/apply
// Public: receives an application for the Operator/Inner Circle packages
// (ids mastery/institutional).
// Writes a coaching_applications doc with status="applied" and the
// application_data payload. Sends acknowledgment email and enrolls nurture
// as backup if the prospect abandons before booking.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const packageId = typeof body.packageId === "string" ? body.packageId : "";

  if (!email || !packageId) {
    return NextResponse.json(
      { error: "email and packageId are required" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const applicationData = {
    capital: typeof body.capital === "string" ? body.capital : "",
    experience: typeof body.experience === "string" ? body.experience : "",
    goals: typeof body.goals === "string" ? body.goals : "",
    timeCommitment:
      typeof body.timeCommitment === "string" ? body.timeCommitment : "",
    howHeard: typeof body.howHeard === "string" ? body.howHeard : "",
  };

  const db = getDb();
  const now = new Date().toISOString();
  const pkg = await getPackage(packageId);
  const closeValue = pkg?.price;

  await stampLeadPublicFormSignup({
    email,
    source: "apply_page",
    name,
  });

  const ref = await db.collection("coaching_applications").add({
    email,
    name,
    status: "applied",
    packageId,
    source: "apply_page",
    applicationData,
    ...(typeof closeValue === "number" ? { closeValue } : {}),
    nextActionAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now,
    updatedAt: now,
  });

  const packageContext = await resolvePackageContext(packageId);
  const prepUrl = getDiscoveryPrepUrl(packageId);
  const { subject, html, text } = getInstitutionalApplicationEmailContent({
    name,
    packageContext,
    prepUrl,
  });

  try {
    await sendEmail({
      to: email,
      subject,
      html,
      text,
      log: { source: "coaching_application_ack" },
    });
  } catch (e) {
    console.error("[coaching/apply] acknowledgment email failed", e);
  }

  try {
    await enrollCoachingNurture(email);
  } catch (e) {
    console.error("[coaching/apply] nurture enroll failed", e);
  }

  return NextResponse.json({ ok: true, id: ref.id });
}
