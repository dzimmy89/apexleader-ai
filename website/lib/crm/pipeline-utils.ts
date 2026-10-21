export const PIPELINE_COLUMNS = [
  { id: "new", label: "New" },
  { id: "applied", label: "Applied" },
  { id: "scheduled", label: "Discovery scheduled" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "proposal_sent", label: "Proposal sent" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
] as const;

export type PipelineStatus = (typeof PIPELINE_COLUMNS)[number]["id"];

export interface PipelineApplication {
  id: string;
  email: string;
  name?: string;
  status: string;
  notes?: string;
  source?: string;
  packageId?: string;
  discoveryCallId?: string;
  discoveryCallAt?: string;
  applicationData?: {
    capital?: string;
    experience?: string;
    goals?: string;
    timeCommitment?: string;
    howHeard?: string;
  };
  nextActionAt?: string;
  closeValue?: number;
  /** Resolved for display: closeValue ?? package price */
  effectiveValue?: number;
  lossReason?: string;
  /** Set when the latest Stripe charge for this email failed. */
  paymentFailedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Fallback package prices when Firestore packages are unavailable. */
export const DEFAULT_PACKAGE_PRICES: Record<string, number> = {
  foundations: 600,
  mastery: 1800,
  institutional: 7200,
};

export function effectiveCloseValue(
  app: Pick<PipelineApplication, "closeValue" | "packageId">,
  priceMap?: Record<string, number>
): number {
  if (typeof app.closeValue === "number" && app.closeValue > 0) {
    return app.closeValue;
  }
  if (!app.packageId) return 0;
  const map = priceMap || DEFAULT_PACKAGE_PRICES;
  return map[app.packageId] || DEFAULT_PACKAGE_PRICES[app.packageId] || 0;
}

export function isOverdue(nextActionAt?: string): boolean {
  if (!nextActionAt) return false;
  return new Date(nextActionAt).getTime() < Date.now();
}

export function isDiscoverySoon(discoveryCallAt?: string, hours = 24): boolean {
  if (!discoveryCallAt) return false;
  const diff = new Date(discoveryCallAt).getTime() - Date.now();
  return diff > 0 && diff <= hours * 3600000;
}

export function pipelineMetrics(
  apps: PipelineApplication[],
  priceMap?: Record<string, number>
) {
  const open = apps.filter((a) => a.status !== "won" && a.status !== "lost");
  const overdue = open.filter((a) => isOverdue(a.nextActionAt));
  const totalValue = open.reduce(
    (sum, a) => sum + effectiveCloseValue(a, priceMap),
    0
  );
  return { openCount: open.length, overdueCount: overdue.length, totalValue };
}

export function columnAggregate(
  apps: PipelineApplication[],
  status: string,
  priceMap?: Record<string, number>
) {
  const items = apps.filter((a) => a.status === status);
  const value = items.reduce(
    (sum, a) => sum + effectiveCloseValue(a, priceMap),
    0
  );
  return { count: items.length, value };
}

export type SmartViewId = "all" | "overdue" | "discovery_week" | "proposal_stale" | "new_7d";

export function applySmartView(apps: PipelineApplication[], view: SmartViewId): PipelineApplication[] {
  const now = Date.now();
  const weekMs = 7 * 86400000;
  const dayMs = 86400000;

  switch (view) {
    case "overdue":
      return apps.filter(
        (a) =>
          a.status !== "won" &&
          a.status !== "lost" &&
          isOverdue(a.nextActionAt)
      );
    case "discovery_week": {
      const weekEnd = now + weekMs;
      return apps.filter((a) => {
        if (!a.discoveryCallAt) return false;
        const t = new Date(a.discoveryCallAt).getTime();
        return t >= now && t <= weekEnd;
      });
    }
    case "proposal_stale":
      return apps.filter((a) => {
        if (a.status !== "proposal_sent" || !a.updatedAt) return false;
        return now - new Date(a.updatedAt).getTime() >= 3 * dayMs;
      });
    case "new_7d":
      return apps.filter((a) => {
        if (!a.createdAt) return false;
        return now - new Date(a.createdAt).getTime() <= weekMs;
      });
    default:
      return apps;
  }
}
