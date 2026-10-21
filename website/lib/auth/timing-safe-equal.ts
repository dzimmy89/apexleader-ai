import { timingSafeEqual } from "node:crypto";

/**
 * Compare UTF-8 strings in constant time for a given max length.
 * Length mismatches still run a padded compare so callers cannot skip work.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  const len = Math.max(aBuf.length, bBuf.length, 1);
  const aPad = Buffer.alloc(len);
  const bPad = Buffer.alloc(len);
  aBuf.copy(aPad);
  bBuf.copy(bPad);
  const contentsEqual = timingSafeEqual(aPad, bPad);
  const lengthEqual = aBuf.length === bBuf.length;
  return contentsEqual && lengthEqual;
}
