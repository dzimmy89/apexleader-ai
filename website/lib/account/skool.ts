import { createHmac } from "node:crypto";
import { readAdminJwtSecret } from "@/lib/auth/admin-session-cookie";
import { timingSafeEqualString } from "@/lib/auth/timing-safe-equal";
import { getDb } from "@/lib/firebase-admin";
import { ACCOUNTS, grantAccess, normalizeEmail, readAccount, revokeAccess } from "@/lib/account/access";
import { isValidEmail } from "@/lib/html";
import { SKOOL_ACCESS, confirmSeenInSkool, isManagedSeat, readSkoolRecord } from "@/lib/account/skool-access";

/**
 * Skool has no public API. Members reach the site two ways:
 * 1. Skool's Zapier plugin posts each new member to /api/webhooks/skool.
 *    The token in that URL is derived from JWT_SECRET, so no new secret is needed.
 * 2. The admin uploads Skool's member export (CSV) on /admin/membership.
 */
export function skoolWebhookToken(): string | null {
  const secret = readAdminJwtSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update("skool-webhook-v1").digest("hex").slice(0, 40);
}

export function verifySkoolWebhookToken(token: string | null | undefined): boolean {
  const expected = skoolWebhookToken();
  if (!expected || !token) return false;
  return timingSafeEqualString(token, expected);
}

export function isRemovalEvent(value: unknown): boolean {
  return /remov|cancel|left|leave|churn|ban|delet|expire/i.test(String(value || ""));
}

export interface SkoolCsvRow {
  email: string;
  name: string;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      out.push(cell);
      cell = "";
    } else cell += ch;
  }
  out.push(cell);
  return out.map((c) => c.trim());
}

/** Parse a Skool member export. Finds the email column by its header. */
export function parseSkoolCsv(csv: string): { rows: SkoolCsvRow[]; error?: string } {
  const lines = csv.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { rows: [], error: "The file is empty" };
  const header = splitCsvLine(lines[0]!).map((h) => h.toLowerCase());
  const emailCol = header.findIndex((h) => h.includes("email"));
  if (emailCol < 0) return { rows: [], error: "No email column found in the first row" };
  const first = header.findIndex((h) => /first.?name/.test(h));
  const last = header.findIndex((h) => /last.?name/.test(h));
  const full = header.findIndex((h) => h === "name" || h === "full name");
  const seen = new Set<string>();
  const rows: SkoolCsvRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const email = normalizeEmail(cells[emailCol] || "");
    if (!isValidEmail(email) || seen.has(email)) continue;
    seen.add(email);
    const name =
      full >= 0 ? cells[full] || "" : [first >= 0 ? cells[first] : "", last >= 0 ? cells[last] : ""].join(" ").trim();
    rows.push({ email, name });
  }
  return { rows };
}

export interface SkoolImportResult {
  inFile: number;
  added: number;
  alreadyMembers: number;
  /** Emails with a Skool grant that are not in this export. */
  missing: string[];
  removed: number;
  /** Coaching clients in the file: their access stays tied to the coaching period. */
  coachingSeats: number;
}

export async function importSkoolMembers(
  rows: SkoolCsvRow[],
  opts: { apply: boolean; removeMissing: boolean }
): Promise<SkoolImportResult> {
  const db = getDb();
  const snap = await db.collection(ACCOUNTS).get();
  const skoolNow = new Set<string>();
  for (const doc of snap.docs) {
    const account = readAccount(doc.id, doc.data());
    if (account.grants.some((g) => g.source === "skool")) skoolNow.add(doc.id);
  }
  const inFile = new Set(rows.map((r) => r.email));
  const missing = [...skoolNow].filter((e) => !inFile.has(e)).sort();
  const seats = await db.collection(SKOOL_ACCESS).get();
  const managed = new Set(
    seats.docs.filter((d) => isManagedSeat(readSkoolRecord(d.id, d.data()))).map((d) => d.id)
  );
  let added = 0;
  let alreadyMembers = 0;
  let coachingSeats = 0;
  for (const row of rows) {
    if (managed.has(row.email)) {
      // A coaching client the coach added: confirm the seat and keep course
      // access on the coaching grant only, never a permanent Skool grant.
      coachingSeats++;
      if (opts.apply) {
        await confirmSeenInSkool(row.email, "Skool export");
        if (skoolNow.has(row.email)) await revokeAccess(row.email, "skool");
      }
      continue;
    }
    if (skoolNow.has(row.email)) alreadyMembers++;
    else added++;
    if (opts.apply) await grantAccess(row.email, { source: "skool", name: row.name || undefined, note: "Skool export" });
  }
  let removed = 0;
  if (opts.apply && opts.removeMissing) {
    for (const email of missing) {
      await revokeAccess(email, "skool");
      removed++;
    }
  }
  return { inFile: rows.length, added, alreadyMembers, missing, removed, coachingSeats };
}
