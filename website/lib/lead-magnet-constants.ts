/** Where a lead came from. Only the coaching ones start an email flow. */
export const COACHING_NURTURE_MAGNETS = new Set([
  "coaching_qualifier",
  "coaching_application",
]);

// The calendar booking handler sets the lead magnet to
// "coaching_discovery_booked" once a discovery call is booked.
export const COACHING_POST_CALL_MAGNETS = new Set(["coaching_discovery_booked"]);
