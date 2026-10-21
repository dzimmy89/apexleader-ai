export interface PersonRow {
  email: string;
  type: "lead" | "member";
  name?: string;
  tier?: string;
  status?: string;
  source?: string;
  leadMagnet?: string;
  captureCount?: number;
  lastSeenAt?: string;
  createdAt?: string;
  consentAt?: string;
  lifecycle?: "lead" | "applicant" | "client" | "member";
}

const PREFIX_END = "\uf8ff";

export type PeopleListStage = "email" | "name";

export type PeopleListCursor = {
  stage: PeopleListStage;
  afterEmail?: string;
  afterNameLower?: string;
};

export function personNameLower(
  ...parts: Array<string | undefined | null>
): string {
  for (const part of parts) {
    const trimmed = part?.trim();
    if (trimmed) return trimmed.toLowerCase();
  }
  return "";
}

export function prefixBounds(prefix: string): { start: string; end: string } {
  return { start: prefix, end: `${prefix}${PREFIX_END}` };
}

export function isEmailSearch(query: string): boolean {
  return query.includes("@");
}

export function encodePeopleCursor(cursor: PeopleListCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export class InvalidPeopleCursorError extends Error {
  constructor(message = "Invalid cursor") {
    super(message);
    this.name = "InvalidPeopleCursorError";
  }
}

export function decodePeopleCursor(
  raw: string | undefined | null
): PeopleListCursor | undefined {
  if (!raw?.trim()) return undefined;
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8")
    ) as Partial<PeopleListCursor>;
    if (parsed.stage !== "email" && parsed.stage !== "name") return undefined;
    const cursor: PeopleListCursor = { stage: parsed.stage };
    if (typeof parsed.afterEmail === "string" && parsed.afterEmail) {
      cursor.afterEmail = parsed.afterEmail;
    }
    if (typeof parsed.afterNameLower === "string" && parsed.afterNameLower) {
      cursor.afterNameLower = parsed.afterNameLower;
    }
    return cursor;
  } catch {
    return undefined;
  }
}

/** Non-empty cursor strings that do not decode are client errors, not first page. */
export function requirePeopleCursor(
  raw: string | undefined | null
): PeopleListCursor | undefined {
  if (!raw?.trim()) return undefined;
  const cursor = decodePeopleCursor(raw);
  if (!cursor) throw new InvalidPeopleCursorError();
  return cursor;
}

export function isFirestoreIndexError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return /requires an index/i.test(String(error));
  }
  const record = error as { code?: unknown; message?: unknown };
  const code = String(record.code ?? "");
  const message = String(record.message ?? error);
  return (
    code === "9" ||
    code === "failed-precondition" ||
    /FAILED_PRECONDITION/i.test(code) ||
    /requires an index/i.test(message) ||
    /currently building/i.test(message)
  );
}

export type MergeKind = "lead" | "member";

export type MergeCandidate<T> = {
  email: string;
  kind: MergeKind;
  nameLower?: string;
  value: T;
};

/**
 * Merge two email-sorted streams. Equal emails keep the member row.
 * Returns up to `limit` rows (caller may pass limit+1 to detect hasMore).
 */
export function mergeEmailSorted<T>(
  leads: Array<MergeCandidate<T>>,
  members: Array<MergeCandidate<T>>,
  limit: number
): Array<MergeCandidate<T>> {
  const out: Array<MergeCandidate<T>> = [];
  let i = 0;
  let j = 0;
  while (out.length < limit && (i < leads.length || j < members.length)) {
    const lead = leads[i];
    const member = members[j];
    if (lead && member && lead.email === member.email) {
      out.push(member);
      i += 1;
      j += 1;
      continue;
    }
    if (!lead || (member && member.email < lead.email)) {
      out.push(member!);
      j += 1;
    } else {
      out.push(lead);
      i += 1;
    }
  }
  return out;
}

/**
 * Merge two (nameLower, email)-sorted streams. Equal emails keep the member.
 */
export function mergeNameSorted<T>(
  leads: Array<MergeCandidate<T>>,
  members: Array<MergeCandidate<T>>,
  limit: number
): Array<MergeCandidate<T>> {
  const out: Array<MergeCandidate<T>> = [];
  let i = 0;
  let j = 0;
  const key = (row: MergeCandidate<T>) => `${row.nameLower ?? ""}\0${row.email}`;
  while (out.length < limit && (i < leads.length || j < members.length)) {
    const lead = leads[i];
    const member = members[j];
    if (lead && member && lead.email === member.email) {
      out.push(member);
      i += 1;
      j += 1;
      continue;
    }
    if (!lead || (member && key(member) < key(lead))) {
      out.push(member!);
      j += 1;
    } else {
      out.push(lead);
      i += 1;
    }
  }
  return out;
}
