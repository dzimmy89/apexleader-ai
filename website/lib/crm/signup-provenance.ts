export const SIGNUP_ORIGIN_PUBLIC_FORM = "public_form";
export const SIGNUP_ORIGIN_CHECKOUT = "checkout";

export type SignupOrigin =
  | typeof SIGNUP_ORIGIN_PUBLIC_FORM
  | typeof SIGNUP_ORIGIN_CHECKOUT;

/** Server-stamped only. Client bodies must never set these fields. */
export interface SelfSignupProvenance {
  selfSignup: true;
  signupOrigin: SignupOrigin;
  selfSignupSource: string;
  selfSignupAt: string;
  canonicalEmail: string;
}

export function isSelfSignupProvenance(
  data: { selfSignup?: unknown } | undefined | null
): boolean {
  return data?.selfSignup === true;
}

export function isSignupOrigin(value: unknown): value is SignupOrigin {
  return (
    value === SIGNUP_ORIGIN_PUBLIC_FORM || value === SIGNUP_ORIGIN_CHECKOUT
  );
}

export function resolveSignupOrigin(
  requested: SignupOrigin,
  existingOrigin: unknown
): SignupOrigin {
  if (isSignupOrigin(existingOrigin)) return existingOrigin;
  return requested;
}

export function resolveSelfSignupSource(
  requested: string,
  existing: { selfSignup?: unknown; selfSignupSource?: unknown } | undefined
): string {
  if (
    existing?.selfSignup === true &&
    typeof existing.selfSignupSource === "string" &&
    existing.selfSignupSource.trim()
  ) {
    return existing.selfSignupSource;
  }
  return requested;
}

export function resolveSelfSignupAt(
  nowIso: string,
  existing: { selfSignup?: unknown; selfSignupAt?: unknown } | undefined
): string {
  if (
    existing?.selfSignup === true &&
    typeof existing.selfSignupAt === "string" &&
    existing.selfSignupAt.trim()
  ) {
    return existing.selfSignupAt;
  }
  return nowIso;
}
