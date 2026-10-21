import { NextResponse } from "next/server";
import { getPackages } from "@/lib/coaching/packages";

// Public read-only endpoint for active coaching packages.
// Used by the marketing page (/coaching) to hydrate package config.
// Writes go through /api/admin/coaching/packages (admin-protected).
export async function GET() {
  const packages = await getPackages({ activeOnly: true });
  // Strip server-only fields before returning to the public.
  const safe = packages.map(({ paymentPlans, ...rest }) => ({
    ...rest,
    planIds: paymentPlans.map((p) => p.id),
  }));
  return NextResponse.json(
    { packages: safe },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
