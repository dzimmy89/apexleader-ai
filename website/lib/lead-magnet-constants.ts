export const LEAD_NURTURE_MAGNETS = new Set([
  "skool_interest",
  "free_signup",
  "university_catalog",
]);

export const SAMPLE_NURTURE_MAGNETS = new Set(["university_sample"]);

export const COACHING_NURTURE_MAGNETS = new Set([
  "coaching_qualifier",
  "coaching_application",
]);

// High-intent magnets that trigger the post-call flow after a discovery call
// has actually been booked (the calendar booking handler sets the lead magnet
// to "coaching_discovery_booked" on the lead doc).
export const COACHING_POST_CALL_MAGNETS = new Set(["coaching_discovery_booked"]);

export const HIGH_INTENT_MAGNETS = new Set([
  ...LEAD_NURTURE_MAGNETS,
  ...SAMPLE_NURTURE_MAGNETS,
  ...COACHING_NURTURE_MAGNETS,
]);

export const LOW_INTENT_MAGNETS = new Set(["footer_waitlist"]);

export const CHECKLIST_MAGNETS = new Set(["du_safety_checklist"]);
