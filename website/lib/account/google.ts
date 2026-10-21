import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/lib/firebase-admin";
import { normalizeEmail } from "@/lib/account/access";

/**
 * Member Google sign-in. The browser signs in with Google through Firebase
 * Auth (the same project setup as admin sign-in) and posts the ID token
 * here. Unlike admin sign-in there is no allowlist: any verified Google
 * email can open an account.
 */
export interface GoogleIdentity {
  email: string;
  name?: string;
}

type Verifier = (idToken: string) => Promise<{ email?: string; email_verified?: boolean; name?: string }>;

let verifierForTests: Verifier | null = null;

export function setGoogleVerifierForTests(fn: Verifier | null): void {
  verifierForTests = fn;
}

export async function verifyMemberGoogleToken(
  idToken: string
): Promise<{ ok: true; identity: GoogleIdentity } | { ok: false; error: string }> {
  if (!idToken) return { ok: false, error: "Missing Google sign-in token" };
  try {
    const decoded = verifierForTests
      ? await verifierForTests(idToken)
      : await getAuth(getAdminApp()).verifyIdToken(idToken);
    const email = normalizeEmail(decoded.email || "");
    if (!email) return { ok: false, error: "That Google account has no email address." };
    if (decoded.email_verified !== true) return { ok: false, error: "Google has not verified that email address yet." };
    return { ok: true, identity: { email, ...(decoded.name ? { name: String(decoded.name).slice(0, 120) } : {}) } };
  } catch (e) {
    console.error("[account/google] token rejected", e instanceof Error ? e.message : e);
    return { ok: false, error: "Google sign-in did not go through. Try again." };
  }
}
