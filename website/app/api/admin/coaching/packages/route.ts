import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getPackages,
  upsertPackage,
  deletePackage,
  type PackageId,
  type CoachingPackage,
} from "@/lib/coaching/packages";

const VALID_IDS: PackageId[] = ["foundations", "mastery", "institutional"];

function isPackageId(v: unknown): v is PackageId {
  return typeof v === "string" && VALID_IDS.includes(v as PackageId);
}

export async function GET() {
  const packages = await getPackages({ activeOnly: false });
  return NextResponse.json({ packages });
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

  if (!isPackageId(body.id)) {
    return NextResponse.json(
      { error: `id must be one of: ${VALID_IDS.join(", ")}` },
      { status: 400 }
    );
  }

  await upsertPackage(body as Partial<CoachingPackage> & { id: PackageId });
  return NextResponse.json({ ok: true, id: body.id });
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

  const id = body.id;
  if (!isPackageId(id)) {
    return NextResponse.json(
      { error: `id must be one of: ${VALID_IDS.join(", ")}` },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = { ...body };
  delete updates.id;
  updates.updatedAt = new Date().toISOString();

  await upsertPackage({ ...(updates as Partial<CoachingPackage>), id });
  return NextResponse.json({ ok: true, id });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!isPackageId(id)) {
    return NextResponse.json(
      { error: `?id= must be one of: ${VALID_IDS.join(", ")}` },
      { status: 400 }
    );
  }

  await deletePackage(id);
  return NextResponse.json({ ok: true, id });
}
