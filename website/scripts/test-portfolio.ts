import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { MODULES, TOOLS } from "../content/course";
import { PORTFOLIO, type PortfolioBusiness } from "../content/portfolio";

// The site makes no earnings claims. Portfolio copy says what was built and
// how; any figure about results lives in `results` with a source, a date and
// the owner's confirmation. Prices (an offer's "$10 a month") are allowed.
const RESULT_CLAIM =
  /\b(revenue|profit|income|earn(s|ed|ing)?|mrr|arr|sales of|made \$|grew|growth|doubled|tripled|\d+x)\b|\b\d[\d,.]*\s*(k|m)?\+?\s*(users|customers|subscribers|members|students|clients|signups|downloads|readers|followers|views|visitors)\b|\d+\s*%/i;

function copyOf(b: PortfolioBusiness): string[] {
  return [b.name, b.oneLine, ...b.about, ...b.modules.map((m) => m.built), b.next, ...b.team.map((a) => a.task)];
}

describe("portfolio", () => {
  it("has unique slugs that are url-safe", () => {
    const slugs = PORTFOLIO.map((b) => b.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    for (const slug of slugs) assert.match(slug, /^[a-z0-9-]+$/);
  });

  it("makes no result claims outside confirmed results", () => {
    for (const b of PORTFOLIO) {
      for (const text of copyOf(b)) {
        assert.doesNotMatch(text, RESULT_CLAIM, `${b.slug}: "${text}" reads as a result claim; move it to results with a source`);
      }
    }
  });

  it("gives every result a source, a date and a confirmation", () => {
    for (const b of PORTFOLIO) {
      for (const r of b.results) {
        assert.ok(r.source.trim(), `${b.slug}: result "${r.label}" needs a source`);
        assert.ok(r.confirmedBy.trim(), `${b.slug}: result "${r.label}" needs the owner's confirmation`);
        assert.match(r.asOf, /^\d{4}-\d{2}-\d{2}$/, `${b.slug}: result "${r.label}" needs an asOf date`);
      }
    }
  });

  it("names only course modules and toolkit tools", () => {
    const tools = new Set(TOOLS.map((t) => t.name));
    const modules = new Set(MODULES.map((m) => m.number));
    for (const b of PORTFOLIO) {
      for (const tool of b.tools) assert.ok(tools.has(tool), `${b.slug}: "${tool}" is not in the toolkit`);
      assert.ok(b.modules.length > 0, `${b.slug}: needs at least one module`);
      for (const m of b.modules) assert.ok(modules.has(m.number), `${b.slug}: module ${m.number} does not exist`);
    }
  });

  it("has a homepage screenshot file for every business", () => {
    const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
    for (const b of PORTFOLIO) {
      assert.ok(b.screenshot, `${b.slug}: needs a screenshot`);
      assert.ok(b.screenshot.alt.trim(), `${b.slug}: screenshot needs alt text`);
      assert.ok(existsSync(join(publicDir, b.screenshot.src)), `${b.slug}: ${b.screenshot.src} is missing from public/`);
    }
  });

  it("links only to https sites", () => {
    for (const b of PORTFOLIO) {
      if (b.url) assert.match(b.url, /^https:\/\//, `${b.slug}: url must be https`);
    }
  });
});
