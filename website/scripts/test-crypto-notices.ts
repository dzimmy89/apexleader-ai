import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Firestore } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { setDbForTests } from "../lib/firebase-admin";
import { setSendEmailForTests, type SendEmailOptions } from "../lib/gmail";
import { COOKIE_NAME, createAdminSession } from "../lib/auth/admin-session-cookie";
import { resetLeadRateLimit } from "../lib/lead-rate-limit";
import {
  confirmCryptoNotice,
  createCryptoNotice,
  txHashError,
} from "../lib/coaching/crypto-notices";
import { CRYPTO_RECEIVE_ADDRESSES, assertCryptoAddressShapes } from "../content/crypto-payments";
import { POST as postNotice } from "../app/api/coaching/crypto-notice/route";
import { POST as postConfirm } from "../app/api/admin/coaching/crypto-notices/[id]/confirm/route";
import { createMemoryFirestore, rows, type MemoryFirestore } from "./fixtures/memory-firestore";

const EVM_HASH = `0x${"ab".repeat(32)}`;
const BTC_HASH = "cd".repeat(32);
const SOL_SIG = "5".repeat(87);

let mem: MemoryFirestore;
let sent: SendEmailOptions[] = [];

beforeEach(() => {
  mem = createMemoryFirestore();
  setDbForTests(mem as unknown as Firestore);
  sent = [];
  setSendEmailForTests(async (opts) => {
    sent.push(opts);
    return { ok: true, messageId: "m1", threadId: "t1" };
  });
  resetLeadRateLimit();
  process.env.JWT_SECRET = "test-crypto-notices";
  process.env.NEXT_PUBLIC_SITE_URL = "https://fromaitobusiness.com";
  process.env.SENDER_EMAIL = "hello@fromaitobusiness.com";
});

afterEach(() => {
  setDbForTests(undefined);
  setSendEmailForTests(undefined);
});

function input(extra: Record<string, string> = {}) {
  return {
    name: "Ada Client",
    email: "Ada@Example.com",
    packageId: "mastery",
    planId: "3pay",
    network: "evm",
    txHash: EVM_HASH,
    ...extra,
  };
}

async function noticeId(): Promise<string> {
  const result = await createCryptoNotice(input());
  if (!result.ok) throw new Error(result.error);
  return result.id;
}

describe("receive addresses", () => {
  it("has the three networks and the right shapes", () => {
    assert.deepEqual(
      CRYPTO_RECEIVE_ADDRESSES.map((row) => row.network),
      ["evm", "solana", "bitcoin"]
    );
    assertCryptoAddressShapes();
  });
});

describe("crypto transfer notices", () => {
  it("saves an unconfirmed notice with the plan amount and grants nothing", async () => {
    const id = await noticeId();
    const notice = mem.store.get(`crypto_payment_notices/${id}`);
    assert.equal(notice?.status, "unconfirmed");
    assert.equal(notice?.email, "ada@example.com");
    assert.equal(notice?.packageName, "Operator");
    assert.equal(notice?.amountUsd, 834);
    assert.equal(notice?.totalUsd, 2502);
    assert.equal(notice?.installments, 3);
    assert.equal(mem.store.has("client_records/ada@example.com"), false);
    assert.equal(rows(mem.store, "client_payments").length, 0);
    assert.equal(sent.length, 0);
  });

  it("rejects the same transfer twice, ignoring hex case", async () => {
    await noticeId();
    const again = await createCryptoNotice(input({ txHash: EVM_HASH.toUpperCase().replace("0X", "0x") }));
    assert.deepEqual(again, { ok: false, status: 409, error: "That transfer was already submitted" });
  });

  it("checks the hash format for each network", async () => {
    assert.equal(txHashError("evm", EVM_HASH), null);
    assert.equal(txHashError("bitcoin", BTC_HASH), null);
    assert.equal(txHashError("solana", SOL_SIG), null);
    assert.notEqual(txHashError("evm", BTC_HASH), null);
    assert.notEqual(txHashError("bitcoin", EVM_HASH), null);
    assert.notEqual(txHashError("solana", "0OIl".repeat(20)), null);

    const cases: Array<[Record<string, string>, number]> = [
      [{ name: "" }, 400],
      [{ email: "nope" }, 400],
      [{ packageId: "gold" }, 400],
      [{ network: "dogecoin" }, 400],
      [{ txHash: "0x1234" }, 400],
    ];
    for (const [extra, status] of cases) {
      const result = await createCryptoNotice(input(extra));
      assert.equal(result.ok, false, JSON.stringify(extra));
      if (!result.ok) assert.equal(result.status, status);
    }
    assert.equal(rows(mem.store, "crypto_payment_notices").length, 0);
  });

  it("confirming logs one payment with the hash, starts the schedule, grants once and mails the agreement", async () => {
    const id = await noticeId();
    const result = await confirmCryptoNotice(id, "david");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.installmentNumber, 1);

    const payments = rows(mem.store, "client_payments");
    assert.equal(payments.length, 1);
    const [, payment] = payments[0]!;
    assert.equal(payment.amount, 83400);
    assert.equal(payment.reference, `evm tx ${EVM_HASH}`);
    assert.equal(payment.actor, "david");
    assert.match(String(payment.note), /Crypto transfer/);

    const client = mem.store.get("client_records/ada@example.com");
    assert.equal(client?.status, "paid_pending_contract");
    const schedule = mem.store.get("payment_schedules/ada@example.com__mastery");
    assert.equal((schedule?.installments as unknown[]).length, 3);
    assert.ok(sent.some((m) => m.log.source === "coaching_contract"), "agreement email");

    const notice = mem.store.get(`crypto_payment_notices/${id}`);
    assert.equal(notice?.status, "confirmed");
    assert.equal(notice?.confirmedBy, "david");
    assert.equal(notice?.paymentId, result.paymentId);

    const again = await confirmCryptoNotice(id, "david");
    assert.equal(again.ok, true);
    assert.equal(rows(mem.store, "client_payments").length, 1, "confirming twice writes one row");
    assert.equal(mem.store.get("client_records/ada@example.com")?.sessionsRemaining, client?.sessionsRemaining);
  });

  it("a second monthly transfer marks installment 2", async () => {
    const first = await noticeId();
    await confirmCryptoNotice(first, "david");
    const second = await createCryptoNotice(input({ txHash: `0x${"ef".repeat(32)}` }));
    assert.equal(second.ok, true);
    if (!second.ok) return;
    const confirmed = await confirmCryptoNotice(second.id, "david");
    assert.equal(confirmed.ok && confirmed.installmentNumber, 2);
    assert.equal(rows(mem.store, "client_payments").length, 2);
  });

  it("the public route saves a notice; the confirm route needs an admin cookie and same-site Origin", async () => {
    const res = await postNotice(
      new NextRequest("http://localhost/api/coaching/crypto-notice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input({ network: "bitcoin", txHash: BTC_HASH, planId: "full", packageId: "foundations" })),
      })
    );
    assert.equal(res.status, 200);
    const { id } = (await res.json()) as { id: string };
    assert.equal(mem.store.get(`crypto_payment_notices/${id}`)?.amountUsd, 750);

    const token = await createAdminSession("david");
    const call = (headers: Record<string, string>) =>
      postConfirm(
        new NextRequest(`http://localhost/api/admin/coaching/crypto-notices/${id}/confirm`, {
          method: "POST",
          headers,
        }),
        { params: Promise.resolve({ id }) }
      );
    assert.equal((await call({ origin: "https://fromaitobusiness.com" })).status, 401);
    assert.equal(
      (await call({ cookie: `${COOKIE_NAME}=${token}`, origin: "https://evil.example" })).status,
      403
    );
    const ok = await call({ cookie: `${COOKIE_NAME}=${token}`, origin: "https://fromaitobusiness.com" });
    assert.equal(ok.status, 200);
    assert.equal(mem.store.get(`crypto_payment_notices/${id}`)?.status, "confirmed");
  });
});
