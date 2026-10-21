import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/firebase-admin";
import { listPaymentsDue, listPaymentsUpcoming } from "@/lib/coaching/payments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/admin/coaching/payments-due
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }
  const db = getDb();
  const [items, upcoming] = await Promise.all([listPaymentsDue(db), listPaymentsUpcoming(db)]);
  const overdue = items.filter((i) => i.status === "overdue").length;
  return NextResponse.json(
    { items, upcoming, overdue, dueSoon: items.length - overdue },
    { headers: { "Cache-Control": "no-store" } }
  );
}
