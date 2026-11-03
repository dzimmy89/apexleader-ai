import { getDb } from "@/lib/firebase-admin";
import { getPackage, paymentPlanAddsUp, type PackageId } from "@/lib/coaching/packages";
import { logManualPayment } from "@/lib/coaching/manual-payments";
import { isValidEmail } from "@/lib/html";
import {
  CRYPTO_NETWORK_LABEL,
  isCryptoNetwork,
  type CryptoNetwork,
} from "@/content/crypto-payments";

/**
 * Crypto transfer notices from /coaching/pay.
 *
 * crypto_payment_notices/{id}: what the buyer told us (name, email, package,
 * plan, network, transaction hash). A notice grants nothing. The coach checks
 * the transfer on a block explorer and on the sister site's admin
 * (SHARED_WALLET_SITE, same wallets), then confirms it here. Confirming logs
 * it as a hand-logged payment with the transaction hash as the reference, so
 * grants, installment schedules, Payments due and the agreement email all
 * work as they do for a bank transfer.
 */
export const CRYPTO_NOTICES = "crypto_payment_notices";

const PACKAGE_IDS: PackageId[] = ["foundations", "mastery", "institutional"];

export interface CryptoNoticeInput {
  name: string;
  email: string;
  packageId: string;
  network: string;
  txHash: string;
  planId?: string;
}

export interface CryptoNoticeRecord {
  id: string;
  name: string;
  email: string;
  packageId: string;
  packageName: string;
  network: CryptoNetwork;
  txHash: string;
  /** Whole dollars due for this transfer. */
  amountUsd: number;
  /** Whole dollars for the whole plan. */
  totalUsd: number;
  planId: "full" | "3pay" | "6pay";
  installments: number;
  status: "unconfirmed" | "confirmed";
  createdAt: string;
  confirmedAt: string | null;
  confirmedBy: string | null;
  paymentId: string | null;
}

function isPackageId(id: string): id is PackageId {
  return PACKAGE_IDS.some((known) => known === id);
}

function asPlanId(id: string | undefined): CryptoNoticeRecord["planId"] {
  return id === "3pay" || id === "6pay" ? id : "full";
}

/** Normalized hash used for the duplicate check and the payment's idempotency key. */
export function txHashKey(network: CryptoNetwork, txHash: string): string {
  const trimmed = txHash.trim();
  switch (network) {
    case "solana":
      return trimmed;
    case "evm":
    case "bitcoin":
      return trimmed.toLowerCase();
    default: {
      const exhaustive: never = network;
      return exhaustive;
    }
  }
}

export function txHashError(network: CryptoNetwork, txHash: string): string | null {
  const value = txHash.trim();
  switch (network) {
    case "evm":
      return /^0x[a-fA-F0-9]{64}$/.test(value)
        ? null
        : "An Ethereum, Base or Arbitrum transaction hash is 0x followed by 64 letters and numbers";
    case "bitcoin":
      return /^[a-fA-F0-9]{64}$/.test(value)
        ? null
        : "A Bitcoin transaction ID is 64 letters and numbers";
    case "solana":
      return /^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(value)
        ? null
        : "That does not look like a Solana transaction signature";
    default: {
      const exhaustive: never = network;
      return `Unknown network: ${String(exhaustive)}`;
    }
  }
}

export async function createCryptoNotice(
  input: CryptoNoticeInput
): Promise<{ ok: true; id: string } | { ok: false; status: number; error: string }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const packageId = input.packageId.trim();
  const networkRaw = input.network.trim();
  const txHash = input.txHash.trim();

  if (!name || name.length > 120) {
    return { ok: false, status: 400, error: "Name is required" };
  }
  if (!isValidEmail(email)) {
    return { ok: false, status: 400, error: "Enter a valid email" };
  }
  if (!isPackageId(packageId)) {
    return { ok: false, status: 400, error: "Unknown package" };
  }
  if (!isCryptoNetwork(networkRaw)) {
    return { ok: false, status: 400, error: "Unknown network" };
  }
  const hashError = txHashError(networkRaw, txHash);
  if (hashError) {
    return { ok: false, status: 400, error: hashError };
  }

  const pkg = await getPackage(packageId);
  if (!pkg) {
    return { ok: false, status: 400, error: "Unknown package" };
  }
  const planId = asPlanId(input.planId);
  const plan = pkg.paymentPlans.find((item) => item.id === planId);
  if (!plan || !paymentPlanAddsUp(plan)) {
    return { ok: false, status: 400, error: "Unknown payment plan" };
  }

  const key = txHashKey(networkRaw, txHash);
  const db = getDb();
  const dup = await db.collection(CRYPTO_NOTICES).where("txHashKey", "==", key).limit(1).get();
  if (!dup.empty) {
    return { ok: false, status: 409, error: "That transfer was already submitted" };
  }

  const now = new Date().toISOString();
  const ref = await db.collection(CRYPTO_NOTICES).add({
    name,
    email,
    packageId,
    packageName: pkg.name,
    network: networkRaw,
    txHash,
    txHashKey: key,
    planId,
    installments: plan.installments,
    amountUsd: plan.perPayment,
    totalUsd: plan.total,
    status: "unconfirmed",
    createdAt: now,
    updatedAt: now,
    confirmedAt: null,
    confirmedBy: null,
    paymentId: null,
  });
  return { ok: true, id: ref.id };
}

export function readCryptoNotice(
  id: string,
  data: Record<string, unknown>
): CryptoNoticeRecord | null {
  const network = String(data.network || "");
  if (!isCryptoNetwork(network)) return null;
  const planId = asPlanId(typeof data.planId === "string" ? data.planId : undefined);
  const amountUsd = Number(data.amountUsd || 0);
  return {
    id,
    name: String(data.name || ""),
    email: String(data.email || ""),
    packageId: String(data.packageId || ""),
    packageName: String(data.packageName || ""),
    network,
    txHash: String(data.txHash || ""),
    amountUsd,
    totalUsd: Number(data.totalUsd || amountUsd),
    planId,
    installments: Number(data.installments) || (planId === "3pay" ? 3 : planId === "6pay" ? 6 : 1),
    status: data.status === "confirmed" ? "confirmed" : "unconfirmed",
    createdAt: String(data.createdAt || ""),
    confirmedAt: typeof data.confirmedAt === "string" ? data.confirmedAt : null,
    confirmedBy: typeof data.confirmedBy === "string" ? data.confirmedBy : null,
    paymentId: typeof data.paymentId === "string" ? data.paymentId : null,
  };
}

export async function listCryptoNotices(): Promise<CryptoNoticeRecord[]> {
  const snap = await getDb().collection(CRYPTO_NOTICES).limit(200).get();
  const rows: CryptoNoticeRecord[] = [];
  for (const doc of snap.docs) {
    const row = readCryptoNotice(doc.id, (doc.data() || {}) as Record<string, unknown>);
    if (row) rows.push(row);
  }
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return rows;
}

export type ConfirmCryptoNoticeResult =
  | { ok: true; paymentId: string; installmentNumber: number | null; emailWarning?: string }
  | { ok: false; status: number; error: string };

/**
 * The coach saw the transfer arrive. Logs it as a payment (idempotency key
 * crypto:{network}:{hash}, so confirming twice writes one row) and marks the
 * notice confirmed.
 */
export async function confirmCryptoNotice(
  noticeId: string,
  actor: string
): Promise<ConfirmCryptoNoticeResult> {
  const db = getDb();
  const ref = db.collection(CRYPTO_NOTICES).doc(noticeId);
  const snap = await ref.get();
  if (!snap.exists) {
    return { ok: false, status: 404, error: "Notice not found" };
  }
  const notice = readCryptoNotice(noticeId, (snap.data() || {}) as Record<string, unknown>);
  if (!notice || !notice.txHash || !isPackageId(notice.packageId)) {
    return { ok: false, status: 400, error: "Notice is incomplete" };
  }

  const key = txHashKey(notice.network, notice.txHash);
  const label = notice.network === "bitcoin" ? "BTC" : `USDC/USDT on ${CRYPTO_NETWORK_LABEL[notice.network]}`;
  const logged = await logManualPayment(
    {
      email: notice.email,
      name: notice.name,
      amountUsd: notice.amountUsd,
      reference: `${notice.network} tx ${notice.txHash}`.slice(0, 120),
      paidAt: notice.createdAt || new Date().toISOString(),
      packageId: notice.packageId,
      planId: notice.planId,
      note: `Crypto transfer (${label}), confirmed from notice ${notice.id}.`,
      idempotencyKey: `crypto:${notice.network}:${key}`,
    },
    actor
  );
  if (!logged.ok) {
    return logged;
  }

  const now = new Date().toISOString();
  await ref.set(
    {
      status: "confirmed",
      confirmedAt: notice.confirmedAt || now,
      confirmedBy: notice.confirmedBy || actor,
      paymentId: logged.paymentId,
      updatedAt: now,
    },
    { merge: true }
  );
  return {
    ok: true,
    paymentId: logged.paymentId,
    installmentNumber: logged.installmentNumber,
    ...(logged.emailWarning ? { emailWarning: logged.emailWarning } : {}),
  };
}
