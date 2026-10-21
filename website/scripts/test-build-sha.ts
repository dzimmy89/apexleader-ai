import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { GET } from "../app/api/version/route";
import {
  UNKNOWN_BUILD_SHA,
  loadWebsiteBuildSha,
  normalizeBuildSha,
  readBuildShaFromDisk,
} from "../lib/build-sha";

const VALID_SHA = "0123456789abcdef0123456789abcdef01234567";

describe("normalizeBuildSha", () => {
  it("accepts exactly 40 lowercase hex characters", () => {
    assert.equal(normalizeBuildSha(VALID_SHA), VALID_SHA);
  });

  it("trims surrounding whitespace including a trailing newline", () => {
    assert.equal(normalizeBuildSha(`\n${VALID_SHA}\n`), VALID_SHA);
  });

  it("returns unknown for missing or empty values", () => {
    assert.equal(normalizeBuildSha(undefined), UNKNOWN_BUILD_SHA);
    assert.equal(normalizeBuildSha(null), UNKNOWN_BUILD_SHA);
    assert.equal(normalizeBuildSha(""), UNKNOWN_BUILD_SHA);
    assert.equal(normalizeBuildSha("   "), UNKNOWN_BUILD_SHA);
  });

  it("returns unknown for garbage", () => {
    assert.equal(normalizeBuildSha("not-a-sha"), UNKNOWN_BUILD_SHA);
    assert.equal(
      normalizeBuildSha("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"),
      UNKNOWN_BUILD_SHA
    );
  });

  it("returns unknown for uppercase hex", () => {
    assert.equal(
      normalizeBuildSha("0123456789ABCDEF0123456789ABCDEF01234567"),
      UNKNOWN_BUILD_SHA
    );
  });

  it("returns unknown for a short value", () => {
    assert.equal(normalizeBuildSha("0123456789abcdef"), UNKNOWN_BUILD_SHA);
    assert.equal(normalizeBuildSha(VALID_SHA.slice(0, 39)), UNKNOWN_BUILD_SHA);
  });
});

describe("readBuildShaFromDisk", () => {
  const dir = mkdtempSync(join(tmpdir(), "build-sha-"));

  after(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns unknown when the file is missing", () => {
    assert.equal(
      readBuildShaFromDisk(join(dir, "BUILD_SHA")),
      UNKNOWN_BUILD_SHA
    );
  });

  it("returns the sha when the file contains a valid value", () => {
    const path = join(dir, "valid");
    writeFileSync(path, `${VALID_SHA}\n`, "utf8");
    assert.equal(readBuildShaFromDisk(path), VALID_SHA);
  });

  it("returns unknown for garbage, uppercase, or short file contents", () => {
    const garbage = join(dir, "garbage");
    const upper = join(dir, "upper");
    const short = join(dir, "short");
    writeFileSync(garbage, "nope\n", "utf8");
    writeFileSync(upper, "0123456789ABCDEF0123456789ABCDEF01234567\n", "utf8");
    writeFileSync(short, "abc\n", "utf8");
    assert.equal(readBuildShaFromDisk(garbage), UNKNOWN_BUILD_SHA);
    assert.equal(readBuildShaFromDisk(upper), UNKNOWN_BUILD_SHA);
    assert.equal(readBuildShaFromDisk(short), UNKNOWN_BUILD_SHA);
  });
});

describe("GET /api/version", () => {
  it("returns JSON with only the sha field from the website BUILD_SHA file", async () => {
    const res = await GET();
    assert.match(res.headers.get("content-type") ?? "", /application\/json/);
    assert.deepEqual(await res.json(), { sha: loadWebsiteBuildSha() });
  });
});
