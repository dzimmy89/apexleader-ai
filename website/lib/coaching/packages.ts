import { getDb } from "@/lib/firebase-admin";
import { fallbackPackages, privatePackages } from "@/content/site-fallback";

/**
 * foundations / mastery / institutional are the public packages.
 * build_launch is a private package sold by proposal (never listed on the
 * site); it lives in code (content/site-fallback.ts privatePackages).
 */
export type PackageId = "foundations" | "mastery" | "institutional" | "build_launch";

export interface CoachingPackage {
  id: PackageId;
  name: string;
  tagline: string;
  price: number;
  priceDisplay: string;
  durationWeeks: number;
  sessionCount: number;
  sessionLengthMins: number;
  requiresDiscoveryCall: boolean;
  applicationOnly: boolean;
  cadence: string;
  features: string[];
  deliverables: string[];
  bestFor: string;
  badge?: string;
  sortIndex: number;
  active: boolean;
  paymentPlans: PaymentPlan[];
}

export interface PaymentPlan {
  id: "full" | "2pay" | "3pay" | "6pay";
  label: string;
  installments: number;
  perPayment: number;
  total: number;
  stripePriceEnvVar: string;
}

const CACHE_TTL_MS = 60 * 1000;
let cache: { at: number; packages: CoachingPackage[] } | null = null;

function asPackageId(id: string): PackageId {
  switch (id) {
    case "foundations":
    case "mastery":
    case "institutional":
    case "build_launch":
      return id;
    default:
      throw new Error(`Unknown coaching package: ${id}`);
  }
}

function planEnvSuffix(planId: PaymentPlan["id"]): string {
  switch (planId) {
    case "full":
      return "FULL";
    case "2pay":
      return "2PAY";
    case "3pay":
      return "3PAY";
    case "6pay":
      return "6PAY";
    default: {
      const _exhaustive: never = planId;
      return _exhaustive;
    }
  }
}

function planLabel(planId: PaymentPlan["id"]): string {
  switch (planId) {
    case "full":
      return "Pay in full";
    case "2pay":
      return "2 payments";
    case "3pay":
      return "3 payments";
    case "6pay":
      return "6 payments";
    default: {
      const _exhaustive: never = planId;
      return _exhaustive;
    }
  }
}

function buildPlan(
  packageId: PackageId,
  price: number,
  planId: PaymentPlan["id"],
  installments: number
): PaymentPlan {
  // Installments round up to whole dollars, so the total can sit a few dollars
  // above the price (Operator: 3 x $834 = $2,502). Cards and checkout show this
  // total, which is exactly what Stripe or the manual schedule collects.
  const perPayment =
    installments === 1 ? price : Math.ceil(price / installments);
  return {
    id: planId,
    label: planLabel(planId),
    installments,
    perPayment,
    total: perPayment * installments,
    stripePriceEnvVar: `STRIPE_PRICE_${packageId.toUpperCase()}_${planEnvSuffix(planId)}`,
  };
}

function computePaymentPlans(
  price: number,
  packageId: PackageId
): PaymentPlan[] {
  switch (packageId) {
    case "foundations":
    case "mastery":
    case "institutional":
      return [
        buildPlan(packageId, price, "full", 1),
        buildPlan(packageId, price, "3pay", 3),
        buildPlan(packageId, price, "6pay", 6),
      ];
    case "build_launch":
      // Sold by proposal: no Stripe prices, paid by hand or in crypto.
      return [buildPlan(packageId, price, "full", 1), buildPlan(packageId, price, "2pay", 2)];
    default: {
      const _exhaustive: never = packageId;
      return _exhaustive;
    }
  }
}

export function paymentPlanAddsUp(plan: PaymentPlan): boolean {
  return plan.perPayment * plan.installments === plan.total;
}

// Runway is no longer offered (Oct 2026). Packages already saved in Firestore
// may still carry Runway lines, so drop them here instead of showing them.
function packageLines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter((line) => !/\brunway\b/i.test(line));
}

function normalizePackage(raw: Record<string, unknown>): CoachingPackage {
  const price = Number(raw.price) || 0;
  const id = asPackageId(String(raw.id));
  return {
    id,
    name: String(raw.name ?? ""),
    tagline: String(raw.tagline ?? ""),
    price,
    priceDisplay: `$${price.toLocaleString()}`,
    durationWeeks: Number(raw.durationWeeks) || 0,
    sessionCount: Number(raw.sessionCount) || 0,
    sessionLengthMins: Number(raw.sessionLengthMins) || 60,
    requiresDiscoveryCall: Boolean(raw.requiresDiscoveryCall),
    applicationOnly: Boolean(raw.applicationOnly),
    cadence: String(raw.cadence ?? ""),
    features: packageLines(raw.features),
    deliverables: packageLines(raw.deliverables),
    bestFor: String(raw.bestFor ?? ""),
    badge: raw.badge ? String(raw.badge) : undefined,
    sortIndex: Number(raw.sortIndex) || 0,
    active: raw.active === undefined ? true : Boolean(raw.active),
    paymentPlans: computePaymentPlans(price, id),
  };
}

export async function getPackages(
  opts: { activeOnly?: boolean } = {}
): Promise<CoachingPackage[]> {
  const activeOnly = opts.activeOnly ?? true;
  const now = Date.now();

  if (cache && now - cache.at < CACHE_TTL_MS) {
    return cache.packages.filter((p) => !activeOnly || p.active);
  }

  let packages: CoachingPackage[];
  try {
    const db = getDb();
    const snap = await db.collection("coaching_packages").get();
    if (snap.empty) {
      packages = fallbackPackages.map((p) =>
        normalizePackage({ ...p } as unknown as Record<string, unknown>)
      );
    } else {
      packages = snap.docs
        .map((d: { data: () => Record<string, unknown> }) =>
          normalizePackage(d.data())
        )
        .sort((a: CoachingPackage, b: CoachingPackage) => a.sortIndex - b.sortIndex);
    }
  } catch (e) {
    console.error("[getPackages] Firestore read failed, using fallback", e);
    packages = fallbackPackages.map((p) =>
      normalizePackage({ ...p } as unknown as Record<string, unknown>)
    );
  }

  // Private packages are defined in code only; add any Firestore lacks.
  // They are inactive, so public pages (activeOnly) never list them.
  for (const raw of privatePackages) {
    if (!packages.some((p) => p.id === raw.id)) {
      packages.push(normalizePackage({ ...raw } as unknown as Record<string, unknown>));
    }
  }

  cache = { at: now, packages };
  return packages.filter((p) => !activeOnly || p.active);
}

export async function getPackage(id: string): Promise<CoachingPackage | null> {
  const packages = await getPackages({ activeOnly: false });
  return packages.find((p) => p.id === id) ?? null;
}

export async function upsertPackage(
  pkg: Partial<CoachingPackage> & { id: PackageId }
): Promise<void> {
  const db = getDb();
  await db
    .collection("coaching_packages")
    .doc(pkg.id)
    .set(
      {
        ...pkg,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  cache = null;
}

export async function deletePackage(id: PackageId): Promise<void> {
  const db = getDb();
  await db.collection("coaching_packages").doc(id).delete();
  cache = null;
}

/** Plans the public checkout and package cards offer (2pay is private only). */
export type PublicPlanId = "full" | "3pay" | "6pay";

export function isPublicPlan(plan: PaymentPlan): plan is PaymentPlan & { id: PublicPlanId } {
  return plan.id === "full" || plan.id === "3pay" || plan.id === "6pay";
}
