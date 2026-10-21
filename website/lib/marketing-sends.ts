import { isPostalAddressPlaceholder } from "@/content/site";
import { emailTokenSecretAvailable } from "@/lib/email-tokens";

/** Env key. Unset / anything other than true|1 keeps marketing sends off. */
export const MARKETING_SENDS_ENV = "MARKETING_SENDS_ENABLED";

export function marketingSendsEnabled(): boolean {
  const v = process.env[MARKETING_SENDS_ENV];
  return v === "true" || v === "1";
}

export function marketingSendBlockReason(): string | null {
  if (!marketingSendsEnabled()) {
    return "marketing_sends_disabled";
  }
  if (isPostalAddressPlaceholder()) {
    return "postal_address_placeholder";
  }
  if (!emailTokenSecretAvailable()) {
    return "missing_email_token_secret";
  }
  return null;
}

/**
 * Environment-wide: double-opt-in confirm mail can go out.
 * Transactional confirm is not gated by MARKETING_SENDS_ENABLED; it still
 * needs a token secret and Gmail credentials. Not per-address.
 */
export function confirmSendsPossible(): boolean {
  return (
    emailTokenSecretAvailable() &&
    Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
  );
}
