import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { SignJWT, generateKeyPair } from "jose";
import {
  DASHBOARD_AUDIENCE,
  DASHBOARD_CALLER_REF,
  DASHBOARD_CALLER_REPOSITORY_ID,
  GITHUB_ACTIONS_ISSUER,
  verifyDashboardCaller,
} from "../lib/dashboard-auth";

type Pair = Awaited<ReturnType<typeof generateKeyPair>>;
let github: Pair;
let stranger: Pair;

before(async () => {
  github = await generateKeyPair("RS256");
  stranger = await generateKeyPair("RS256");
});

const keys = async () => github.publicKey;

interface Opts {
  claims?: Record<string, unknown>;
  issuer?: string;
  audience?: string;
  expires?: string | number;
  signer?: Pair;
}

async function token(opts: Opts = {}): Promise<string> {
  return new SignJWT({
    repository: "dzimmy89/defi-university-gtm",
    repository_id: DASHBOARD_CALLER_REPOSITORY_ID,
    ref: DASHBOARD_CALLER_REF,
    ...opts.claims,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(opts.issuer ?? GITHUB_ACTIONS_ISSUER)
    .setAudience(opts.audience ?? DASHBOARD_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(opts.expires ?? "5m")
    .sign((opts.signer ?? github).privateKey);
}

function req(auth?: string): Request {
  const headers = new Headers();
  if (auth !== undefined) headers.set("authorization", auth);
  return new Request("https://example.com/api/internal/dashboard-summary", { headers });
}

async function allowed(opts?: Opts): Promise<boolean> {
  return verifyDashboardCaller(req(`Bearer ${await token(opts)}`), keys);
}

describe("verifyDashboardCaller", () => {
  it("accepts a run of the GTM repository's main branch", async () => {
    assert.equal(await allowed(), true);
  });

  it("rejects another repository, even one with the same name", async () => {
    assert.equal(await allowed({ claims: { repository_id: "1" } }), false);
    assert.equal(await allowed({ claims: { repository_id: undefined } }), false);
  });

  it("rejects another branch", async () => {
    assert.equal(await allowed({ claims: { ref: "refs/heads/someone-elses-branch" } }), false);
    assert.equal(await allowed({ claims: { ref: "refs/pull/7/merge" } }), false);
  });

  it("rejects a token issued for another audience or by another issuer", async () => {
    assert.equal(await allowed({ audience: "https://github.com/dzimmy89" }), false);
    assert.equal(await allowed({ issuer: "https://example.com" }), false);
  });

  it("rejects an expired token and one GitHub did not sign", async () => {
    assert.equal(await allowed({ expires: Math.floor(Date.now() / 1000) - 60 }), false);
    assert.equal(await allowed({ signer: stranger }), false);
  });

  it("rejects a missing, empty or non-bearer header", async () => {
    assert.equal(await verifyDashboardCaller(req(), keys), false);
    assert.equal(await verifyDashboardCaller(req("Bearer "), keys), false);
    assert.equal(await verifyDashboardCaller(req("Bearer not-a-token"), keys), false);
    assert.equal(await verifyDashboardCaller(req(await token()), keys), false);
  });
});
