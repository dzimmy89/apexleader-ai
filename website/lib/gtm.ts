export const GTM_ID = "GTM-MQH7BFVF";

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

export type SkoolSignupTracking = {
  /** Omit unless the click is on a known paid Skool tier. Never default to 97. */
  value?: number;
  planId?: string;
};

export function trackSkoolSignup(
  location: string,
  tracking: SkoolSignupTracking = {}
) {
  const payload: Record<string, unknown> = {
    event: "conversion",
    conversion_type: "skool_signup_click",
    conversion_location: location,
    currency: "USD",
    transaction_id: `skool_${Date.now()}`,
  };
  if (typeof tracking.value === "number") {
    payload.value = tracking.value;
  }
  if (tracking.planId) {
    payload.plan_id = tracking.planId;
  }
  pushEvent(payload);
}

export function trackTestimonialPlay(ctx: {
  clipId: string;
  person: string;
  segment: string;
  page: string;
}) {
  pushEvent({
    event: "testimonial_play",
    clip_id: ctx.clipId,
    clip_person: ctx.person,
    clip_segment: ctx.segment,
    clip_page: ctx.page,
  });
}

export function trackStickyCta(page: string, href: string) {
  pushEvent({ event: "sticky_cta_click", cta_page: page, cta_href: href });
}

/** On-site navigation CTAs. Never counted as a Skool signup. */
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

export function trackCoachingCryptoAddressCopy(input: {
  network: string;
  packageId: string;
}) {
  pushEvent({
    event: "conversion",
    conversion_type: "coaching_crypto_address_copy",
    network: input.network,
    package_id: input.packageId,
  });
}

export function trackCoachingCryptoNoticeSubmit(input: {
  packageId: string;
  network: string;
}) {
  pushEvent({
    event: "conversion",
    conversion_type: "coaching_crypto_notice_submit",
    package_id: input.packageId,
    network: input.network,
  });
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
