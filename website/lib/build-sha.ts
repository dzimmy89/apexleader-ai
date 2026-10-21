import { readFileSync } from "node:fs";
import { join } from "node:path";

export const UNKNOWN_BUILD_SHA = "unknown";

const BUILD_SHA_RE = /^[0-9a-f]{40}$/;

export function normalizeBuildSha(raw: string | undefined | null): string {
  const value = (raw ?? "").trim();
  if (BUILD_SHA_RE.test(value)) {
    return value;
  }
  return UNKNOWN_BUILD_SHA;
}

export function readBuildShaFromDisk(filePath: string): string {
  try {
    return normalizeBuildSha(readFileSync(filePath, "utf8"));
  } catch {
    return UNKNOWN_BUILD_SHA;
  }
}

export function websiteBuildShaPath(): string {
  return join(process.cwd(), "BUILD_SHA");
}

export function loadWebsiteBuildSha(): string {
  return readBuildShaFromDisk(websiteBuildShaPath());
}
