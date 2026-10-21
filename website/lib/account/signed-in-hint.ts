/**
 * Readable marker set next to the session cookie so the cached site header can
 * show "Account" instead of "Sign in" in the browser. Holds no email and grants
 * nothing; /account still checks the real session.
 */
export const SIGNED_IN_HINT = "apex_signed_in";

/** True when the cookie header carries the signed-in marker. */
export function hasSignedInHint(cookieHeader: string): boolean {
  return cookieHeader.split(";").some((part) => part.trim() === `${SIGNED_IN_HINT}=1`);
}
