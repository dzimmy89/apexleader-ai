/** Google Tag Manager container. Empty until the business has its own; no tag loads without it. */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export function pushEvent(data: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
  }
}

export function trackStickyCta(page: string, href: string) {
  pushEvent({ event: "sticky_cta_click", cta_page: page, cta_href: href });
}

/** On-site navigation CTAs. */
export function trackInternalCta(location: string, href: string) {
  pushEvent({
    event: "internal_cta_click",
    cta_location: location,
    cta_href: href,
  });
}

export function trackCoachingClick(location: string, value = 0) {
  pushEvent({
    event: "conversion",
    conversion_type: "coaching_click",
    conversion_location: location,
    value,
    currency: "USD",
    transaction_id: `coaching_${Date.now()}`,
  });
}

export interface PackageTrackingContext {
  packageId: string;
  packageName: string;
  value: number;
  planId?: string;
}

export function trackCoachingPackageClick(
  location: string,
  ctx: PackageTrackingContext
) {
  pushEvent({
    event: "conversion",
    conversion_type: "coaching_package_click",
    conversion_location: location,
    package_id: ctx.packageId,
    package_name: ctx.packageName,
    plan_id: ctx.planId || "full",
    value: ctx.value,
    currency: "USD",
    transaction_id: `coaching_${ctx.packageId}_${Date.now()}`,
  });
}

export function trackCoachingCheckoutStart(
  ctx: PackageTrackingContext & { location?: string }
) {
  const payload: Record<string, unknown> = {
    event: "begin_checkout",
    conversion_type: "coaching_checkout_start",
    package_id: ctx.packageId,
    package_name: ctx.packageName,
    plan_id: ctx.planId || "full",
    value: ctx.value,
    currency: "USD",
    transaction_id: `coaching_${ctx.packageId}_${Date.now()}`,
  };
  if (ctx.location) payload.conversion_location = ctx.location;
  pushEvent(payload);
}

export function trackCoachingApplicationStart(packageId: string) {
  pushEvent({
    event: "generate_lead",
    conversion_type: "coaching_application_start",
    package_id: packageId,
    transaction_id: `coaching_app_${packageId}_${Date.now()}`,
  });
}

export function trackCoachingDiscoveryBooked() {
  pushEvent({
    event: "generate_lead",
    conversion_type: "coaching_discovery_booked",
    transaction_id: `coaching_discovery_${Date.now()}`,
  });
}
