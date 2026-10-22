import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { URLS } from "../content/site";
import { getTemplate, listTemplateIds } from "../lib/email-templates";

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(websiteRoot, "..");

const ctx = {
  email: "a@b.com",
  unsubscribeUrl: "https://fromaitobusiness.com/api/unsubscribe?token=t",
};

function hrefsFromHtml(html: string): string[] {
  return [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
}

function isDiscoveryBookingHref(href: string): boolean {
  try {
    if (href.startsWith("/")) {
      return href.split("?")[0] === "/coaching/book";
    }
    const url = new URL(href);
    return url.pathname === "/coaching/book";
  } catch {
    return href.includes("/coaching/book");
  }
}

function rg(args: string[], cwd: string): string {
  try {
    return execFileSync("rg", args, { cwd, encoding: "utf8" });
  } catch (err) {
    const error = err as { status?: number; stdout?: string };
    if (error.status === 1) return "";
    throw err;
  }
}

describe("clean Discovery booking links", () => {
  it("keeps URLS.coachingDiscovery as a path with no query string", () => {
    assert.equal(URLS.coachingDiscovery, "/coaching/book");
    assert.equal(URLS.coachingDiscovery.includes("?"), false);
  });

  it("renders generated Discovery CTAs without a query string", () => {
    const discoveryHrefs: string[] = [];
    for (const id of listTemplateIds()) {
      const rendered = getTemplate(id, ctx);
      for (const href of hrefsFromHtml(rendered.html)) {
        if (isDiscoveryBookingHref(href)) discoveryHrefs.push(href);
      }
    }
    assert.ok(discoveryHrefs.length > 0, "expected at least one Discovery booking href");
    for (const href of discoveryHrefs) {
      assert.equal(
        href.includes("?"),
        false,
        `Discovery href must not carry a query string: ${href}`
      );
    }
  });

  it("uses the apex Discovery URL in coaching_final_discovery_nudge with no query tail", () => {
    const d16 = getTemplate("coaching_final_discovery_nudge", ctx);
    assert.match(d16.html, /href="https:\/\/fromaitobusiness\.com\/coaching\/book"/);
    assert.doesNotMatch(d16.html, /www\.fromaitobusiness\.com\/coaching\/book/);
    assert.doesNotMatch(d16.html, /discovery=/);
    assert.ok(d16.text);
    assert.match(d16.text, /https:\/\/fromaitobusiness\.com\/coaching\/book(?:\s|$)/);
    assert.doesNotMatch(d16.text, /coaching\/book\?/);
  });

  it("does not leave discovery=true or ?discovery in source producers", () => {
    const hits = rg(
      [
        "-n",
        "discovery=true|\\?discovery",
        "-g",
        "!scripts/test-discovery-links.ts",
      ],
      repoRoot
    );
    assert.equal(hits, "", hits);
  });
});
