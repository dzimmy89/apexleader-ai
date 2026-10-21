import { createHash } from "node:crypto";
import { getDb } from "@/lib/firebase-admin";
import {
  getPackage,
  paymentPlanAddsUp,
  type PackageId,
  type PaymentPlan,
} from "@/lib/coaching/packages";
import {
  grantCoachingPurchase,
  persistPaidCheckoutMember,
} from "@/lib/coaching/stripe";
import { ensureCoachingAgreementEmail } from "@/lib/coaching/contract-email";
import { grantCoachingMembership } from "@/lib/account/access";
import { logActivity } from "@/lib/crm/activity-log";
import { isValidEmail } from "@/lib/html";
import {
  applyCryptoPaymentToSchedule,
  cryptoPaymentDocId,
  firstPaymentAt,
  formatUsdCents,
  isCryptoAsset,
  markPipelineWon,
  recordClientPayment,
  type CryptoAsset,
} from "@/lib/coaching/payments";
import {
  isCryptoNetwork,
  type CryptoNetwork,
} from "@/content/crypto-payments";

const NOTICES = "crypto_payment_notices";

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
  amountUsd: number;
  totalUsd: number;
  planId: PaymentPlan["id"];
  installments: number;
  status: "unconfirmed" | "confirmed";
  createdAt: string;
  confirmedAt?: string | null;
  clientEmail?: string | null;
}

function isPackageId(id: string): id is PackageId {
  return PACKAGE_IDS.some((known) => known === id);
}

function asPlanId(id: string | undefined): PaymentPlan["id"] {
  switch (id) {
    case "3pay":
    case "6pay":
    case "full":
      return id;
    default:
      return "full";
  }
}

export function txHashKey(network: CryptoNetwork, txHash: string): string {
  const trimmed = txHash.trim();
  switch (network) {
    case "solana":
      return trimmed;
    case "evm":
    case "bitcoin":
      return trimmed.toLowerCase();
    default: {
      const _exhaustive: never = network;
      return _exhaustive;
    }
  }
}

export function txHashError(network: CryptoNetwork, txHash: string): string | null {
  const value = txHash.trim();
  switch (network) {
    case "evm":
      return /^0x[a-fA-F0-9]{64}$/.test(value) ? null : "EVM tx hash must be 0x plus 64 hex characters";
    case "bitcoin":
      return /^[a-fA-F0-9]{64}$/.test(value) ? null : "Bitcoin txid must be 64 hex characters";
    case "solana":
      return /^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(value)
        ? null
        : "Solana signature must be base58";
    default: {
      const _exhaustive: never = network;
      return `Unknown network: ${String(_exhaustive)}`;
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, status: 400, error: "Invalid email" };
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
  const dup = await db
    .collection(NOTICES)
    .where("txHashKey", "==", key)
    .limit(1)
    .get();
  if (!dup.empty) {
    return { ok: false, status: 409, error: "That transfer was already submitted" };
  }

  const now = new Date().toISOString();
  const ref = await db.collection(NOTICES).add({
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
    clientEmail: null,
  });

  return { ok: true, id: ref.id };
}

function readNotice(
  id: string,
  data: Record<string, unknown>
): CryptoNoticeRecord | null {
  const network = String(data.network || "");
  if (!isCryptoNetwork(network)) return null;
  const status = data.status === "confirmed" ? "confirmed" : "unconfirmed";
  const planId = asPlanId(typeof data.planId === "string" ? data.planId : undefined);
  const amountUsd = Number(data.amountUsd || 0);
  const installments = Number(data.installments || (planId === "3pay" ? 3 : planId === "6pay" ? 6 : 1));
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
    installments,
    status,
    createdAt: String(data.createdAt || ""),
    confirmedAt: typeof data.confirmedAt === "string" ? data.confirmedAt : null,
    clientEmail: typeof data.clientEmail === "string" ? data.clientEmail : null,
  };
}

export async function listCryptoNotices(): Promise<CryptoNoticeRecord[]> {
  const db = getDb();
  const snap = await db.collection(NOTICES).limit(200).get();
  const rows: CryptoNoticeRecord[] = [];
  for (const doc of snap.docs) {
    const row = readNotice(doc.id, (doc.data() || {}) as Record<string, unknown>);
    if (row) rows.push(row);
  }
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return rows;
}

async function recordCryptoTransfer(
  db: ReturnType<typeof getDb>,
  notice: Pick<CryptoNoticeRecord, "email" | "txHash" | "planId" | "installments">
): Promise<void> {
  const ref = db.collection("client_records").doc(notice.email);
  const snap = await ref.get();
  const data = (snap.data() || {}) as Record<string, unknown>;
  const existing = Array.isArray(data.cryptoTxHashes)
    ? data.cryptoTxHashes.map((hash) => String(hash))
    : [];
  const hashes = existing.includes(notice.txHash)
    ? existing
    : [...existing, notice.txHash];
  await ref.set(
    {
      cryptoTxHashes: hashes,
      cryptoTxHash: notice.txHash,
      cryptoPaymentsReceived: hashes.length,
      cryptoPlanId: notice.planId,
      cryptoInstallments: notice.installments,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function confirmCryptoNotice(
  noticeId: string
): Promise<{ ok: true; emailWarning?: string } | { ok: false; status: number; error: string }> {
  const db = getDb();
  const ref = db.collection(NOTICES).doc(noticeId);
  const snap = await ref.get();
  if (!snap.exists) {
    return { ok: false, status: 404, error: "Notice not found" };
  }
  const notice = readNotice(noticeId, (snap.data() || {}) as Record<string, unknown>);
  if (!notice) {
    return { ok: false, status: 400, error: "Notice is incomplete" };
  }
  if (!isPackageId(notice.packageId)) {
    return { ok: false, status: 400, error: "Unknown package" };
  }

  const grantKey = `crypto:${notice.email}:${notice.packageId}`;
  if (notice.status !== "confirmed") {
    await grantCoachingPurchase(db, {
      email: notice.email,
      clientName: notice.name,
      packageId: notice.packageId,
      packageName: notice.packageName,
      planId: notice.planId,
      grantKey,
      amountPaid: notice.amountUsd * 100,
      paymentSource: "crypto",
      cryptoTxHash: notice.txHash,
      cryptoNetwork: notice.network,
    });
    await persistPaidCheckoutMember(db, {
      email: notice.email,
      clientName: notice.name,
      packageId: notice.packageId,
      planId: notice.planId,
    });
    await recordCryptoTransfer(db, notice);
    const pkg = await getPackage(notice.packageId);
    await recordCryptoLedger(db, {
      email: notice.email,
      name: notice.name,
      packageId: notice.packageId,
      packageName: notice.packageName || pkg?.name || "",
      planId: notice.planId,
      installments: notice.installments,
      perPaymentUsd: notice.amountUsd,
      amountUsd: notice.amountUsd,
      network: notice.network,
      asset: notice.network === "bitcoin" ? "BTC" : null,
      txHash: notice.txHash,
      paymentId: cryptoPaymentDocId(notice.network, txHashKey(notice.network, notice.txHash)),
      paidAt: notice.createdAt || new Date().toISOString(),
      installmentNumber: null,
      note: `Client notice ${notice.id} confirmed.`,
      source: "crypto_notice",
      actor: null,
    });
  }

  const mailed = await ensureCoachingAgreementEmail({
    email: notice.email,
    name: notice.name,
    packageId: notice.packageId,
    planId: notice.planId,
    grantKey: `crypto-agreement:${notice.email}:${notice.packageId}`,
  });
  if (!mailed.ok && mailed.retryable) {
    return {
      ok: false,
      status: 502,
      error: mailed.error || "Agreement email failed. The payment record was saved. Confirm again to retry the email.",
    };
  }

  const now = new Date().toISOString();
  await ref.set(
    {
      status: "confirmed",
      confirmedAt: now,
      clientEmail: notice.email,
      updatedAt: now,
    },
    { merge: true }
  );

  if (!mailed.ok) {
    return { ok: true, emailWarning: mailed.error || "Agreement email was not sent" };
  }
  return { ok: true };
}

interface CryptoLedgerInput {
  email: string;
  name: string;
  packageId: PackageId;
  packageName: string;
  planId: PaymentPlan["id"];
  installments: number;
  /** Whole dollars per installment from the package plan. */
  perPaymentUsd: number;
  /** Whole or fractional dollars actually received. */
  amountUsd: number;
  network: CryptoNetwork;
  asset: CryptoAsset | "USDC or USDT" | null;
  txHash: string | null;
  paymentId: string;
  paidAt: string;
  installmentNumber: number | null;
  note: string;
  source: "admin_log" | "crypto_notice";
  actor: string | null;
}

/**
 * client_payments row, crypto schedule, membership, pipeline card, and a
 * timeline entry for one crypto transfer. Safe to repeat: the payment id is
 * derived from the tx hash (or the admin's idempotency key).
 */
async function recordCryptoLedger(
  db: ReturnType<typeof getDb>,
  input: CryptoLedgerInput
): Promise<{ created: boolean; installmentNumber: number | null }> {
  const amount = Math.round(input.amountUsd * 100);
  const nowIso = new Date().toISOString();
  const { created, row } = await recordClientPayment(db, input.paymentId, {
    email: input.email,
    method: "crypto",
    amount,
    currency: "usd",
    paidAt: input.paidAt,
    packageId: input.packageId,
    planId: input.planId,
    installmentNumber: input.installmentNumber,
    stripeInvoiceId: null,
    stripeSessionId: null,
    stripeSubscriptionId: null,
    txHash: input.txHash,
    network: input.network,
    asset: input.asset,
    note: input.note,
    source: input.source,
    actor: input.actor,
    createdAt: nowIso,
  });

  const scheduled = await applyCryptoPaymentToSchedule(db, {
    email: input.email,
    name: input.name,
    packageId: input.packageId,
    packageName: input.packageName,
    planId: input.planId,
    installments: input.installments,
    perPayment: input.perPaymentUsd * 100,
    paidAt: row.paidAt,
    paymentId: input.paymentId,
    installmentNumber: row.installmentNumber ?? input.installmentNumber,
  });
  const installmentNumber =
    scheduled?.marked ?? row.installmentNumber ?? (input.installments <= 1 ? 1 : null);
  if (created && installmentNumber !== row.installmentNumber) {
    await db
      .collection("client_payments")
      .doc(input.paymentId)
      .set({ installmentNumber }, { merge: true });
  }

  const firstAt = await firstPaymentAt(db, input.email, input.packageId);
  await grantCoachingMembership(input.email, input.packageId, {
    name: input.name || undefined,
    from: new Date(firstAt || row.paidAt),
  });
  const pkg = await getPackage(input.packageId);
  const plan = pkg?.paymentPlans.find((p) => p.id === input.planId);
  await markPipelineWon(db, {
    email: input.email,
    name: input.name,
    packageId: input.packageId,
    closeValue: plan?.total ?? pkg?.price ?? null,
    source: "crypto",
    note: input.note,
  });
  if (created) {
    await logActivity({
      email: input.email,
      type: "payment",
      title: `Crypto payment ${formatUsdCents(amount)}`,
      description: [
        input.packageName || input.packageId,
        input.installments > 1 && installmentNumber
          ? `installment ${installmentNumber} of ${input.installments}`
          : input.installments > 1
            ? "installment"
            : "paid in full",
        input.asset ? `${input.asset} on ${input.network}` : input.network,
        input.note,
      ]
        .filter(Boolean)
        .join(" · "),
      meta: { paymentId: input.paymentId, method: "crypto", amount, actor: input.actor },
    });
  }
  return { created, installmentNumber };
}

export interface LogCryptoPaymentInput {
  email: unknown;
  name?: unknown;
  amountUsd: unknown;
  asset: unknown;
  network: unknown;
  txHash?: unknown;
  /** YYYY-MM-DD (America/New_York) or an ISO timestamp. */
  paidAt: unknown;
  packageId: unknown;
  planId: unknown;
  installmentNumber?: unknown;
  note?: unknown;
  /** Required when there is no tx hash, so a double submit writes one row. */
  idempotencyKey?: unknown;
}

export type LogCryptoPaymentResult =
  | {
      ok: true;
      paymentId: string;
      created: boolean;
      installmentNumber: number | null;
      granted: "granted" | "replay";
      emailWarning?: string;
    }
  | { ok: false; status: number; error: string };

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Noon UTC on a YYYY-MM-DD date keeps it on the same calendar day in New York. */
function paidAtFromInput(raw: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const iso = `${raw}T16:00:00.000Z`;
    return Number.isNaN(Date.parse(iso)) ? null : iso;
  }
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

/**
 * Admin logs a crypto transfer by hand, with or without a client notice.
 * The first payment for a package grants it the same way confirmCryptoNotice
 * does (grantKey crypto:{email}:{packageId}), so a later notice confirm or a
 * second log never grants twice.
 */
export async function logCryptoPayment(
  input: LogCryptoPaymentInput,
  actor: string
): Promise<LogCryptoPaymentResult> {
  const email = str(input.email).toLowerCase();
  if (!isValidEmail(email)) {
    return { ok: false, status: 400, error: "Invalid email" };
  }
  const packageId = str(input.packageId);
  if (!isPackageId(packageId)) {
    return { ok: false, status: 400, error: "Unknown package" };
  }
  const pkg = await getPackage(packageId);
  if (!pkg) {
    return { ok: false, status: 400, error: "Unknown package" };
  }
  const planRaw = str(input.planId);
  if (planRaw !== "full" && planRaw !== "3pay" && planRaw !== "6pay") {
    return { ok: false, status: 400, error: "Unknown payment plan" };
  }
  const plan = pkg.paymentPlans.find((p) => p.id === planRaw);
  if (!plan || !paymentPlanAddsUp(plan)) {
    return { ok: false, status: 400, error: "Unknown payment plan" };
  }
  const amountUsd = typeof input.amountUsd === "number" ? input.amountUsd : Number(str(input.amountUsd));
  if (!Number.isFinite(amountUsd) || amountUsd <= 0 || amountUsd > 100000) {
    return { ok: false, status: 400, error: "Amount must be a positive number of dollars" };
  }
  const asset = str(input.asset);
  if (!isCryptoAsset(asset)) {
    return { ok: false, status: 400, error: "Unknown asset" };
  }
  const network = str(input.network);
  if (!isCryptoNetwork(network)) {
    return { ok: false, status: 400, error: "Unknown network" };
  }
  const txHash = str(input.txHash);
  if (txHash) {
    const hashError = txHashError(network, txHash);
    if (hashError) return { ok: false, status: 400, error: hashError };
  }
  const paidAt = paidAtFromInput(str(input.paidAt));
  if (!paidAt) {
    return { ok: false, status: 400, error: "Date paid is required" };
  }
  if (Date.parse(paidAt) > Date.now() + 36 * 60 * 60 * 1000) {
    return { ok: false, status: 400, error: "Date paid is in the future" };
  }
  let installmentNumber: number | null = null;
  const installmentRaw = input.installmentNumber;
  if (installmentRaw !== undefined && installmentRaw !== null && installmentRaw !== "") {
    const n = typeof installmentRaw === "number" ? installmentRaw : Number(str(installmentRaw));
    if (!Number.isInteger(n) || n < 1 || n > plan.installments) {
      return {
        ok: false,
        status: 400,
        error: `Installment must be between 1 and ${plan.installments}`,
      };
    }
    installmentNumber = n;
  }
  if (plan.installments === 1) installmentNumber = 1;
  const idempotencyKey = str(input.idempotencyKey);
  if (!txHash && !idempotencyKey) {
    return { ok: false, status: 400, error: "idempotencyKey is required without a tx hash" };
  }
  const paymentId = txHash
    ? cryptoPaymentDocId(network, txHashKey(network, txHash))
    : `crypto_manual_${createHash("sha256").update(`${email}\0${idempotencyKey}`).digest("hex").slice(0, 40)}`;

  const db = getDb();
  if (txHash) {
    const existing = await db.collection("client_payments").doc(paymentId).get();
    const prior = existing.data() as { email?: string } | undefined;
    if (existing.exists && prior?.email && prior.email !== email) {
      return { ok: false, status: 409, error: "That transfer is already logged for another contact" };
    }
  }
  const name = str(input.name).slice(0, 120);
  const note = str(input.note).slice(0, 500);

  const granted = await grantCoachingPurchase(db, {
    email,
    clientName: name || undefined,
    packageId,
    packageName: pkg.name,
    planId: plan.id,
    grantKey: `crypto:${email}:${packageId}`,
    amountPaid: Math.round(amountUsd * 100),
    paymentSource: "crypto",
    cryptoTxHash: txHash || undefined,
    cryptoNetwork: network,
  });
  await persistPaidCheckoutMember(db, {
    email,
    clientName: name || undefined,
    packageId,
    planId: plan.id,
  });
  if (txHash) {
    await recordCryptoTransfer(db, {
      email,
      txHash,
      planId: plan.id,
      installments: plan.installments,
    });
  }

  const ledger = await recordCryptoLedger(db, {
    email,
    name,
    packageId,
    packageName: pkg.name,
    planId: plan.id,
    installments: plan.installments,
    perPaymentUsd: plan.perPayment,
    amountUsd,
    network,
    asset,
    txHash: txHash || null,
    paymentId,
    paidAt,
    installmentNumber,
    note: note || "Logged by admin.",
    source: "admin_log",
    actor,
  });

  const mailed = await ensureCoachingAgreementEmail({
    email,
    name: name || email,
    packageId,
    planId: plan.id,
    grantKey: `crypto-agreement:${email}:${packageId}`,
  });

  return {
    ok: true,
    paymentId,
    created: ledger.created,
    installmentNumber: ledger.installmentNumber,
    granted,
    ...(mailed.ok ? {} : { emailWarning: mailed.error || "Agreement email was not sent" }),
  };
}
