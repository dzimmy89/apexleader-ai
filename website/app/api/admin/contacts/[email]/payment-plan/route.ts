import { NextRequest, NextResponse } from "next/server";
import { requireAdminCookie } from "@/lib/admin-auth";
import { originMatchesSite } from "@/lib/auth/admin-login-request-guards";
import { getDb } from "@/lib/firebase-admin";
import { getPackage, paymentPlanAddsUp } from "@/lib/coaching/packages";
import { rebuildManualSchedule } from "@/lib/coaching/payments";
import { logActivity } from "@/lib/crm/activity-log";
import { isValidEmail } from "@/lib/html";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

// POST /api/admin/contacts/:email/payment-plan  { packageId, planId }
// Changes the plan on a client's manual payments and rebuilds the schedule.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const auth = await requireAdminCookie(request);
  if (!auth.ok) {
    return json({ error: "Unauthorized" }, auth.status);
  }
  if (!originMatchesSite(request)) {
    return json({ error: "Forbidden" }, 403);
  }
  const email = decodeURIComponent((await params).email).trim().toLowerCase();
  if (!isValidEmail(email)) {
    return json({ error: "Invalid email" }, 400);
  }
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const packageId = typeof body.packageId === "string" ? body.packageId.trim() : "";
  const planId = typeof body.planId === "string" ? body.planId.trim() : "";
  const pkg = packageId ? await getPackage(packageId) : null;
  if (!pkg) {
    return json({ error: "Unknown package" }, 400);
  }
  const plan = pkg.paymentPlans.find((p) => p.id === planId);
  if (!plan || !paymentPlanAddsUp(plan)) {
    return json({ error: "Unknown payment plan" }, 400);
  }

  const db = getDb();
  const client = await db.collection("client_records").doc(email).get();
  const name = String((client.data() || {}).name || "");
  const result = await rebuildManualSchedule(db, {
    email,
    name,
    packageId: pkg.id,
    packageName: pkg.name,
    planId: plan.id,
    installments: plan.installments,
    perPayment: plan.perPayment * 100,
  });
  await logActivity({
    email,
    type: "note",
    title: `Payment plan set to ${plan.id === "full" ? "paid in full" : `${plan.installments} payments`}`,
    description: `${pkg.name}. Changed by ${auth.username}.`,
    meta: { packageId: pkg.id, planId: plan.id, actor: auth.username },
  });
  return json({ ok: true, installmentsPaid: result.marked, hasSchedule: Boolean(result.schedule) });
}
