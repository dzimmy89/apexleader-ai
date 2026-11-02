import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { NextRequest } from "next/server";
import { verifyDashboardToken } from "../lib/dashboard-auth";

const env = process.env as Record<string, string | undefined>;
const ORIGINAL = { token: env.DASHBOARD_SUMMARY_TOKEN, nodeEnv: env.NODE_ENV };

function req(auth?: string): NextRequest {
  const headers = new Headers();
  if (auth !== undefined) headers.set("authorization", auth);
  return new NextRequest("https://example.com/api/internal/dashboard-summary", { headers });
}

afterEach(() => {
  env.DASHBOARD_SUMMARY_TOKEN = ORIGINAL.token;
  env.NODE_ENV = ORIGINAL.nodeEnv;
});

describe("verifyDashboardToken", () => {
  it("accepts the exact bearer token", () => {
    env.DASHBOARD_SUMMARY_TOKEN = "s3cret-token";
    assert.equal(verifyDashboardToken(req("Bearer s3cret-token")), true);
  });

  it("rejects a wrong, missing or non-bearer token", () => {
    env.DASHBOARD_SUMMARY_TOKEN = "s3cret-token";
    assert.equal(verifyDashboardToken(req("Bearer s3cret-tokeX")), false);
    assert.equal(verifyDashboardToken(req("Bearer s3cret")), false);
    assert.equal(verifyDashboardToken(req("s3cret-token")), false);
    assert.equal(verifyDashboardToken(req()), false);
  });

  it("fails closed in production when the token is not set", () => {
    delete env.DASHBOARD_SUMMARY_TOKEN;
    env.NODE_ENV = "production";
    assert.equal(verifyDashboardToken(req("Bearer anything")), false);
  });
});
