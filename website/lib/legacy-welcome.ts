/** Unreviewed "Two paths that convert serious learners" lead welcome. Off by default. */
export const LEGACY_LEAD_WELCOME_ENV = "LEGACY_LEAD_WELCOME_ENABLED";

export function isLegacyLeadWelcomeEnabled(): boolean {
  const v = process.env[LEGACY_LEAD_WELCOME_ENV];
  return v === "true" || v === "1";
}

export function assertLegacyLeadWelcomeAllowed(): void {
  if (!isLegacyLeadWelcomeEnabled()) {
    throw new Error("legacy_welcome_disabled");
  }
}
