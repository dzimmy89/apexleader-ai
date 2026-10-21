import { getDb } from "@/lib/firebase-admin";

/**
 * Who may open the members-only courses.
 *
 * learn_accounts/{email}: one doc per person who has signed in or been
 * granted access. `grants` holds one entry per source; a grant with no
 * expiresAt lasts until it is revoked. A coaching purchase writes a
 * "coaching" grant that ends with the coaching period (COACHING_ACCESS).
 * Clients paid before that grant existed keep access for the same period
 * counted from their client record's paidAt.
 */
export const ACCOUNTS = "learn_accounts";

export type GrantSource = "coaching" | "manual";

export interface AccessGrant {
  source: GrantSource;
  grantedAt: string;
  expiresAt: string | null;
  note?: string;
}

export interface AccountRecord {
  email: string;
  name?: string;
  grants: AccessGrant[];
  createdAt?: string;
  lastSignInAt?: string | null;
}

export interface AccessState {
  email: string;
  /** The signed-in email first, then every linked email. */
  emails: string[];
  /** The email whose client_records doc is the live coaching client, if any. */
  clientEmail: string | null;
  hasMembership: boolean;
  isCoachingClient: boolean;
  /** Members-only stages open: membership or coaching. */
  hasCourseAccess: boolean;
  /** Grants across all linked emails, live or not. */
  grants: AccessGrant[];
}

/** "completed": a past client whose sessions and access period are over. */
const ENDED_CLIENT_STATUSES = new Set(["cancelled", "subscription_cancelled", "refunded", "completed"]);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function readLinkedEmails(data: Record<string, unknown> | undefined): string[] {
  const raw = Array.isArray(data?.linkedEmails) ? (data!.linkedEmails as unknown[]) : [];
  return [...new Set(raw.filter((e): e is string => typeof e === "string" && e.includes("@")).map(normalizeEmail))];
}

export function grantIsLive(grant: AccessGrant, now = Date.now()): boolean {
  if (!grant.expiresAt) return true;
  return new Date(grant.expiresAt).getTime() > now;
}

export function readAccount(email: string, data: Record<string, unknown> | undefined): AccountRecord {
  const raw = Array.isArray(data?.grants) ? (data!.grants as Record<string, unknown>[]) : [];
  const grants: AccessGrant[] = raw
    .filter((g) => g && typeof g.source === "string")
    .map((g) => ({
      source: g.source as GrantSource,
      grantedAt: String(g.grantedAt || ""),
      expiresAt: typeof g.expiresAt === "string" && g.expiresAt ? g.expiresAt : null,
      ...(typeof g.note === "string" && g.note ? { note: g.note } : {}),
    }));
  return {
    email,
    name: typeof data?.name === "string" ? data.name : undefined,
    grants,
    createdAt: typeof data?.createdAt === "string" ? data.createdAt : undefined,
    lastSignInAt: typeof data?.lastSignInAt === "string" ? data.lastSignInAt : null,
  };
}

export async function getAccess(rawEmail: string): Promise<AccessState> {
  const email = normalizeEmail(rawEmail);
  const db = getDb();
  const primarySnap = await db.collection(ACCOUNTS).doc(email).get();
  const emails = [email, ...readLinkedEmails(primarySnap.data()).filter((e) => e !== email)];
  const [accountSnaps, clientSnaps] = await Promise.all([
    Promise.all(emails.map((e, i) => (i === 0 ? primarySnap : db.collection(ACCOUNTS).doc(e).get()))),
    Promise.all(emails.map((e) => db.collection("client_records").doc(e).get())),
  ]);
  const accounts = emails.map((e, i) => readAccount(e, accountSnaps[i]!.data()));
  const grants = accounts.flatMap((a) => a.grants);
  const live = grants.filter((g) => grantIsLive(g));
  const clientIndex = clientSnaps.findIndex(
    (snap) => snap.exists && !ENDED_CLIENT_STATUSES.has(String((snap.data() || {}).status || ""))
  );
  const isCoachingClient = clientIndex >= 0;
  const client = isCoachingClient ? clientSnaps[clientIndex]!.data() || {} : {};
  const hasMembership = live.length > 0;
  const hasCoachingGrant = grants.some((g) => g.source === "coaching");
  // Clients from before coaching grants: the coaching period from paidAt.
  const legacyCoaching =
    isCoachingClient && !hasCoachingGrant && legacyCoachingLive(String(client.packageId || ""), String(client.paidAt || client.createdAt || ""));
  return {
    email,
    emails,
    clientEmail: isCoachingClient ? emails[clientIndex]! : null,
    hasMembership,
    isCoachingClient,
    hasCourseAccess: hasMembership || legacyCoaching,
    grants,
  };
}

function legacyCoachingLive(packageId: string, paidAt: string, now = Date.now()): boolean {
  const from = Date.parse(paidAt);
  if (!accessPeriod(packageId) || Number.isNaN(from)) return true;
  const ends = coachingAccessEnds(packageId, new Date(from));
  return !ends || Date.parse(ends) > now;
}

/**
 * Add or replace the grant for one source. A later expiry wins over an
 * earlier one, so two coaching purchases never shorten access.
 */
export async function grantAccess(
  rawEmail: string,
  input: { source: GrantSource; expiresAt?: string | null; note?: string; name?: string }
): Promise<void> {
  const email = normalizeEmail(rawEmail);
  if (!email.includes("@")) return;
  const db = getDb();
  const ref = db.collection(ACCOUNTS).doc(email);
  const now = new Date().toISOString();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const account = readAccount(email, snap.data());
    const existing = account.grants.find((g) => g.source === input.source);
    const nextExpiry = input.expiresAt ?? null;
    let expiresAt = nextExpiry;
    if (existing && existing.expiresAt && nextExpiry) {
      expiresAt = existing.expiresAt > nextExpiry ? existing.expiresAt : nextExpiry;
    } else if (existing && !existing.expiresAt && grantIsLive(existing)) {
      expiresAt = null;
    }
    const grant: AccessGrant = {
      source: input.source,
      grantedAt: existing?.grantedAt || now,
      expiresAt,
      ...(input.note ? { note: input.note } : existing?.note ? { note: existing.note } : {}),
    };
    const grants = [...account.grants.filter((g) => g.source !== input.source), grant];
    tx.set(
      ref,
      {
        email,
        grants,
        ...(input.name && !account.name ? { name: input.name } : {}),
        ...(snap.exists ? {} : { createdAt: now }),
        updatedAt: now,
      },
      { merge: true }
    );
  });
}

export async function revokeAccess(rawEmail: string, source: GrantSource): Promise<void> {
  const email = normalizeEmail(rawEmail);
  const db = getDb();
  const ref = db.collection(ACCOUNTS).doc(email);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const account = readAccount(email, snap.data());
    tx.set(
      ref,
      {
        grants: account.grants.filter((g) => g.source !== source),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  });
}

/**
 * How long course access lasts for each coaching package (by internal id):
 * the coaching period, and never less than the membership the package
 * advertises (Operator: 12 weeks of coaching, 3 months of membership).
 */
export const COACHING_ACCESS: Record<string, { days?: number; months?: number }> = {
  foundations: { days: 30 },
  mastery: { months: 3 },
  institutional: { months: 6 },
};

export function addMonths(from: Date, months: number): string {
  const d = new Date(from.getTime());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString();
}

/** The access period for a package. */
export function accessPeriod(packageId: string): { days?: number; months?: number } | null {
  return COACHING_ACCESS[packageId] || null;
}

/** When course access from this package ends, counted from the first payment. */
export function coachingAccessEnds(packageId: string, from: Date): string | null {
  const period = accessPeriod(packageId);
  if (!period) return null;
  if (period.months) return addMonths(from, period.months);
  return new Date(from.getTime() + (period.days || 0) * 86_400_000).toISOString();
}

/** Grant course access for the coaching period of the package they bought. */
export async function grantCoachingMembership(
  email: string,
  packageId: string,
  opts: { name?: string; from?: Date } = {}
): Promise<void> {
  const from = opts.from || new Date();
  const expiresAt = coachingAccessEnds(packageId, from);
  if (!expiresAt) return;
  await grantAccess(email, {
    source: "coaching",
    expiresAt,
    note: `Coaching period (${packageId})`,
    name: opts.name,
  });
}
