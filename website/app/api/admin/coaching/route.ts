import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/firebase-admin";
import { logActivity } from "@/lib/crm/activity-log";
import { isValidEmail } from "@/lib/html";
import { getPackages } from "@/lib/coaching/packages";
import {
  DEFAULT_PACKAGE_PRICES,
  effectiveCloseValue,
} from "@/lib/crm/pipeline-utils";

const VALID_STATUSES = [
  "new",
  "applied",
  "scheduled",
  "contacted",
  "qualified",
  "proposal_sent",
  "won",
  "lost",
] as const;

/** Stages a card can be added in. Won comes from a logged payment, so the client record exists. */
const ADDABLE_STATUSES = ["new", "applied", "scheduled", "contacted", "qualified", "proposal_sent"] as const;

async function packagePriceMap(): Promise<Record<string, number>> {
  try {
    const packages = await getPackages({ activeOnly: false });
    const map: Record<string, number> = { ...DEFAULT_PACKAGE_PRICES };
    for (const p of packages) {
      map[p.id] = p.price;
    }
    return map;
  } catch {
    return { ...DEFAULT_PACKAGE_PRICES };
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search")?.trim().toLowerCase() || "";
  const overdue = url.searchParams.get("overdue") === "true";
  const limit = Math.min(Number(url.searchParams.get("limit") || 300), 500);

  const db = getDb();
  let query: FirebaseFirestore.Query = db
    .collection("coaching_applications")
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (status && VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    query = db
      .collection("coaching_applications")
      .where("status", "==", status)
      .orderBy("createdAt", "desc")
      .limit(limit);
  }

  const [snap, priceMap, failedSnap] = await Promise.all([
    query.get(),
    packagePriceMap(),
    db.collection("client_records").where("paymentFailed", "==", true).limit(200).get(),
  ]);
  const paymentFailedAt = new Map<string, string>();
  for (const doc of failedSnap.docs) {
    const data = doc.data() as { email?: unknown; paymentFailedAt?: unknown };
    const key = String(data.email || doc.id).toLowerCase();
    paymentFailedAt.set(key, typeof data.paymentFailedAt === "string" ? data.paymentFailedAt : "");
  }
  let applications: Record<string, unknown>[] = snap.docs.map((d) => {
    const data = d.data();
    const app = { id: d.id, ...data } as Record<string, unknown> & {
      id: string;
      closeValue?: number;
      packageId?: string;
    };
    const value = effectiveCloseValue(app, priceMap);
    const failedAt = paymentFailedAt.get(String(data.email || "").toLowerCase());
    return {
      ...app,
      ...(failedAt !== undefined ? { paymentFailedAt: failedAt || "unknown" } : {}),
      effectiveValue: value,
      // Surface derived value for UI that still reads closeValue.
      closeValue:
        typeof app.closeValue === "number" && app.closeValue > 0
          ? app.closeValue
          : value || undefined,
    };
  });

  if (search) {
    applications = applications.filter((a) => {
      const email = String(a.email || "").toLowerCase();
      const name = String(a.name || "").toLowerCase();
      return email.includes(search) || name.includes(search);
    });
  }

  if (overdue) {
    const now = Date.now();
    applications = applications.filter((a) => {
      const statusVal = String(a.status);
      if (statusVal === "won" || statusVal === "lost") return false;
      const next = a.nextActionAt as string | undefined;
      return next && new Date(next).getTime() < now;
    });
  }

  return NextResponse.json({ applications, packagePrices: priceMap });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const db = getDb();
  const docRef = db.collection("coaching_applications").doc(id);
  const existing = await docRef.get();
  if (!existing.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const prev = existing.data() || {};
  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };
  if (
    typeof body.status === "string" &&
    VALID_STATUSES.includes(body.status as (typeof VALID_STATUSES)[number])
  ) {
    updates.status = body.status;
  }
  if (typeof body.notes === "string") updates.notes = body.notes;
  if (typeof body.nextActionAt === "string") updates.nextActionAt = body.nextActionAt;
  if (typeof body.assignedCoach === "string") updates.assignedCoach = body.assignedCoach;
  if (typeof body.closeValue === "number") updates.closeValue = body.closeValue;
  if (typeof body.lossReason === "string") updates.lossReason = body.lossReason;
  if (typeof body.packageId === "string") {
    updates.packageId = body.packageId;
    const hasClose =
      typeof body.closeValue === "number" ||
      typeof prev.closeValue === "number";
    if (!hasClose && body.packageId) {
      const priceMap = await packagePriceMap();
      const price = priceMap[body.packageId];
      if (price) updates.closeValue = price;
    }
  }
  if (body.applicationData && typeof body.applicationData === "object") {
    updates.applicationData = body.applicationData;
  }

  await docRef.update(updates);

  if (
    typeof body.status === "string" &&
    body.status !== prev.status &&
    typeof prev.email === "string"
  ) {
    await logActivity({
      email: prev.email,
      type: "stage_change",
      title: `Stage changed to ${body.status}`,
      description: typeof body.lossReason === "string" ? body.lossReason : undefined,
      meta: { applicationId: id, from: prev.status, to: body.status },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  const statusRaw = typeof body.status === "string" ? body.status : "new";
  const status = (ADDABLE_STATUSES as readonly string[]).includes(statusRaw) ? statusRaw : "new";

  const packageId = typeof body.packageId === "string" ? body.packageId : "";
  let closeValue =
    typeof body.closeValue === "number" ? body.closeValue : undefined;
  if (closeValue === undefined && packageId) {
    const priceMap = await packagePriceMap();
    closeValue = priceMap[packageId];
  }

  const db = getDb();
  const now = new Date().toISOString();
  // One open card per person: adding someone already on the pipeline returns their card.
  const existing = await db
    .collection("coaching_applications")
    .where("email", "==", email)
    .limit(20)
    .get();
  const open = existing.docs.find((d) => {
    const st = (d.data() || {}).status;
    return st !== "won" && st !== "lost";
  });
  if (open) {
    return NextResponse.json({ ok: true, id: open.id, existing: true });
  }
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const ref = await db.collection("coaching_applications").add({
    email,
    name,
    status,
    notes: typeof body.notes === "string" ? body.notes : "",
    source: typeof body.source === "string" ? body.source : "manual",
    ...(packageId ? { packageId } : {}),
    ...(typeof closeValue === "number" ? { closeValue } : {}),
    createdAt: now,
    updatedAt: now,
  });
  await logActivity({
    email,
    type: "stage_change",
    title: "Added to pipeline by hand",
    description: `Stage: ${status}. Added by ${auth.username}.`,
    meta: { applicationId: ref.id, to: status, source: "manual" },
  });
  return NextResponse.json({ ok: true, id: ref.id, existing: false });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const db = getDb();
  const docRef = db.collection("coaching_applications").doc(id);
  const existing = await docRef.get();
  if (!existing.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const email = existing.data()?.email as string | undefined;
  await docRef.delete();

  if (email) {
    await logActivity({
      email,
      type: "note",
      title: "Pipeline lead deleted",
      meta: { applicationId: id },
    }).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}
