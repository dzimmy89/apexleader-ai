import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/firebase-admin";

// GET /api/admin/coaching/clients
// Returns all client_records (active coaching clients) with their key fields.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.toLowerCase() || "";
  const limit = Math.min(Number(url.searchParams.get("limit") || 200), 500);

  const db = getDb();
  const snap = await db.collection("client_records").limit(limit).get();

  const clients = snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    const row: { id: string; [key: string]: unknown } = { id: d.id, ...data };
    return row;
  });

  const filtered = clients.filter((c) => {
    if (!q) return true;
    const haystack = [c.id, c.name, c.email, c.packageName]
      .filter((v): v is string => typeof v === "string")
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return NextResponse.json({ clients: filtered });
}
