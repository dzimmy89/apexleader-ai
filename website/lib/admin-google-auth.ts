import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/lib/firebase-admin";
import { BRAND } from "@/lib/brand";

function getAllowlist(): Set<string> {
  const raw =
    process.env.ADMIN_GOOGLE_ALLOWLIST || BRAND.email;
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function verifyGoogleAdminIdToken(
  idToken: string
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  if (!idToken) {
    return { ok: false, error: "Missing ID token" };
  }

  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(idToken);
    const email = (decoded.email || "").trim().toLowerCase();
    if (!email) {
      return { ok: false, error: "Google account has no email" };
    }

    const allowlist = getAllowlist();
    if (!allowlist.has(email)) {
      return { ok: false, error: "This Google account is not authorized for admin" };
    }

    return { ok: true, email };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid token";
    return { ok: false, error: msg };
  }
}
