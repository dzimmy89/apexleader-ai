import { getDb } from "@/lib/firebase-admin";
import type { AccessState } from "@/lib/account/access";
import { coachingStatusLabel } from "@/lib/account/billing";
import { asPaymentPlanId, type PaymentPlanId } from "@/lib/coaching/payments";

/**
 * The coaching client behind a signed-in account, read from
 * client_records/{clientEmail}. One reader for /account and its routes so
 * every surface agrees on what "signed", "sessions left" and "name" mean.
 */
export interface CoachingClient {
  email: string;
  name: string;
  packageId: string;
  packageName: string;
  planId: PaymentPlanId;
  status: string;
  statusLabel: string;
  sessionsRemaining: number;
  sessionsTotal: number;
  contractSignedAt: string | null;
  signedContractPdfUrl: string | null;
  signatureId: string | null;
  telegramHandle: string | null;
  /** Granted by the coach, not bought. */
  fullAccess: boolean;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function readCoachingClient(email: string, data: Record<string, unknown>): CoachingClient {
  const status = str(data.status);
  return {
    email,
    name: str(data.name),
    packageId: str(data.packageId),
    packageName: str(data.packageName) || (data.fullAccess ? "Full access" : "Private coaching"),
    planId: asPaymentPlanId(data.planId),
    status,
    statusLabel: coachingStatusLabel(status),
    sessionsRemaining: Number(data.sessionsRemaining || 0),
    sessionsTotal: Number(data.sessionsTotal || 0),
    contractSignedAt: str(data.contractSignedAt) || null,
    signedContractPdfUrl: str(data.signedContractPdfUrl) || null,
    signatureId: str(data.signatureId) || null,
    telegramHandle: str(data.telegramHandle) || null,
    fullAccess: data.fullAccess === true,
  };
}

export async function getCoachingClient(rawEmail: string): Promise<CoachingClient | null> {
  const email = rawEmail.trim().toLowerCase();
  if (!email) return null;
  const snap = await getDb().collection("client_records").doc(email).get();
  if (!snap.exists) return null;
  return readCoachingClient(email, (snap.data() || {}) as Record<string, unknown>);
}

/** Statuses after which the package is over: no booking, but documents, notes and recordings stay. */
const ENDED_STATUSES = new Set(["cancelled", "subscription_cancelled", "refunded", "completed"]);

export function coachingEnded(client: Pick<CoachingClient, "status">): boolean {
  return ENDED_STATUSES.has(client.status);
}

/**
 * The client record behind an account: the live client the access check
 * found, or else a past client on any of the account's emails, so people
 * whose package ended still reach their agreement, recordings and notes.
 */
export async function findCoachingClient(access: Pick<AccessState, "emails" | "clientEmail">): Promise<CoachingClient | null> {
  if (access.clientEmail) return getCoachingClient(access.clientEmail);
  for (const email of access.emails) {
    const client = await getCoachingClient(email);
    if (client) return client;
  }
  return null;
}

/** Booking is open while the package runs, once the agreement is signed and sessions remain. */
export function bookingBlocker(client: CoachingClient): string | null {
  if (coachingEnded(client)) return "Your coaching package has ended.";
  if (!client.contractSignedAt && !client.fullAccess) return "Sign your coaching agreement before booking.";
  if (client.sessionsRemaining <= 0) return "You have used all the sessions in your package.";
  return null;
}
