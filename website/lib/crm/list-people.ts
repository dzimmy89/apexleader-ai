import {
  FieldPath,
  type CollectionReference,
  type DocumentData,
  type Query,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase-admin";
import {
  encodePeopleCursor,
  isEmailSearch,
  isFirestoreIndexError,
  mergeEmailSorted,
  mergeNameSorted,
  personNameLower,
  prefixBounds,
  requirePeopleCursor,
  type MergeCandidate,
  type PeopleListCursor,
  type PersonRow,
} from "@/lib/crm/people-search";

export interface ListPeopleResult {
  people: PersonRow[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
  totalApproximate: boolean;
  indexPending: boolean;
}

export interface ListPeopleOpts {
  limit?: number;
  offset?: number;
  cursor?: string;
  type?: "lead" | "member" | "all";
  search?: string;
  status?: string;
}

const DOC_ID = FieldPath.documentId();

type PeopleType = "lead" | "member" | "all";

function assertPeopleType(type: PeopleType): PeopleType {
  switch (type) {
    case "lead":
    case "member":
    case "all":
      return type;
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
}

function tsToIso(v: unknown): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null && "toDate" in v) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return undefined;
}

function rowFromDoc(
  snap: QueryDocumentSnapshot,
  kind: "lead" | "member"
): PersonRow {
  const data = snap.data();
  const email = String(data.email || snap.id).toLowerCase();
  if (kind === "member") {
    return {
      email,
      type: "member",
      name: (data.name as string) || undefined,
      tier: data.tier as string | undefined,
      status: data.status as string | undefined,
      lastSeenAt: tsToIso(data.updatedAt),
      createdAt: tsToIso(data.joinDate) || tsToIso(data.createdAt),
      lifecycle: "member",
    };
  }
  return {
    email,
    type: "lead",
    name: (data.firstName as string) || (data.name as string) || undefined,
    status: data.status as string | undefined,
    source: data.source as string | undefined,
    leadMagnet: data.leadMagnet as string | undefined,
    captureCount: data.captureCount as number | undefined,
    lastSeenAt: tsToIso(data.lastSeenAt),
    createdAt: tsToIso(data.createdAt),
    consentAt:
      (data.consent as { confirmedAt?: string; requestedAt?: string } | undefined)
        ?.confirmedAt ||
      (data.consent as { confirmedAt?: string; requestedAt?: string } | undefined)
        ?.requestedAt,
    lifecycle: "lead",
  };
}

function candidate(
  snap: QueryDocumentSnapshot,
  kind: "lead" | "member"
): MergeCandidate<QueryDocumentSnapshot> {
  const data = snap.data();
  return {
    email: String(data.email || snap.id).toLowerCase(),
    kind,
    nameLower: personNameLower(
      data.nameLower as string | undefined,
      data.firstName as string | undefined,
      data.name as string | undefined
    ),
    value: snap,
  };
}

async function runQuery(
  query: Query,
  onIndexError: () => Promise<QueryDocumentSnapshot[]>
): Promise<{ docs: QueryDocumentSnapshot[]; indexPending: boolean }> {
  try {
    const snap = await query.get();
    return { docs: snap.docs, indexPending: false };
  } catch (error) {
    if (!isFirestoreIndexError(error)) throw error;
    try {
      const docs = await onIndexError();
      return { docs, indexPending: true };
    } catch (inner) {
      if (!isFirestoreIndexError(inner)) throw inner;
      return { docs: [], indexPending: true };
    }
  }
}

async function countQuery(
  query: Query
): Promise<{ count: number; indexPending: boolean }> {
  try {
    const snap = await query.count().get();
    return { count: snap.data().count, indexPending: false };
  } catch (error) {
    if (!isFirestoreIndexError(error)) throw error;
    return { count: 0, indexPending: true };
  }
}

function collectionRef(
  db: ReturnType<typeof getDb>,
  name: "leads" | "members"
): CollectionReference<DocumentData> {
  return db.collection(name);
}

function emailQuery(
  col: CollectionReference,
  args: {
    prefix?: string;
    status?: string;
    afterEmail?: string;
    limit: number;
  }
): Query {
  let q: Query = col;
  if (args.status) {
    q = q.where("status", "==", args.status);
  }
  // Document-id order only. With no other inequality this uses the automatic
  // __name__ index — not a composite — so unfiltered lead lists (HubSpot-scale
  // ~760 contacts) page past 500 before database/indexes.json is deployed.
  q = q.orderBy(DOC_ID);
  if (args.prefix) {
    const { start, end } = prefixBounds(args.prefix);
    if (args.afterEmail && args.afterEmail >= start) {
      q = q.startAfter(args.afterEmail).endAt(end);
    } else {
      q = q.startAt(start).endAt(end);
    }
  } else if (args.afterEmail) {
    q = q.startAfter(args.afterEmail);
  }
  return q.limit(args.limit);
}

function emailCountQuery(
  col: CollectionReference,
  args: { prefix?: string; status?: string }
): Query {
  let q: Query = col;
  if (args.status) {
    q = q.where("status", "==", args.status);
  }
  if (args.prefix) {
    const { start, end } = prefixBounds(args.prefix);
    q = q.orderBy(DOC_ID).startAt(start).endAt(end);
  }
  return q;
}

function nameQuery(
  col: CollectionReference,
  args: {
    prefix: string;
    status?: string;
    afterNameLower?: string;
    afterEmail?: string;
    limit: number;
  }
): Query {
  const { start, end } = prefixBounds(args.prefix);
  let q: Query = col;
  if (args.status) {
    q = q.where("status", "==", args.status);
  }
  q = q
    .where("nameLower", ">=", start)
    .where("nameLower", "<", end)
    .orderBy("nameLower")
    .orderBy(DOC_ID);
  if (args.afterNameLower && args.afterEmail) {
    q = q.startAfter(args.afterNameLower, args.afterEmail);
  } else if (args.afterNameLower) {
    q = q.startAfter(args.afterNameLower);
  }
  return q.limit(args.limit);
}

function nameCountQuery(
  col: CollectionReference,
  args: { prefix: string; status?: string }
): Query {
  const { start, end } = prefixBounds(args.prefix);
  let q: Query = col;
  if (args.status) {
    q = q.where("status", "==", args.status);
  }
  return q.where("nameLower", ">=", start).where("nameLower", "<", end);
}

async function fetchEmailBatch(
  col: CollectionReference,
  args: {
    prefix?: string;
    status?: string;
    afterEmail?: string;
    limit: number;
  }
): Promise<{ docs: QueryDocumentSnapshot[]; indexPending: boolean }> {
  return runQuery(emailQuery(col, args), async () => {
    // status + document-id range is the same composite that just failed.
    // Do not re-issue it. Name search already degrades to [] until indexes exist.
    if (args.prefix) return [];

    // Equality-only status uses the automatic single-field index. Pagination
    // with startAfter(snapshot) does not add orderBy(__name__).
    let q: Query = col;
    if (args.status) q = q.where("status", "==", args.status);
    if (args.afterEmail) {
      const cursorSnap = await col.doc(args.afterEmail).get();
      q = cursorSnap.exists ? q.startAfter(cursorSnap) : q;
    }
    try {
      const snap = await q.limit(args.limit).get();
      return snap.docs;
    } catch (inner) {
      if (!isFirestoreIndexError(inner)) throw inner;
      return [];
    }
  });
}

async function fetchNameBatch(
  col: CollectionReference,
  args: {
    prefix: string;
    status?: string;
    afterNameLower?: string;
    afterEmail?: string;
    limit: number;
  }
): Promise<{ docs: QueryDocumentSnapshot[]; indexPending: boolean }> {
  return runQuery(nameQuery(col, args), async () => {
    // Name prefix needs nameLower + __name__ (and status if set). Until
    // those indexes exist, skip name matches rather than scanning 500 docs.
    return [];
  });
}

async function mergedEmailPage(args: {
  type: PeopleType;
  prefix?: string;
  status?: string;
  afterEmail?: string;
  limit: number;
}): Promise<{
  rows: PersonRow[];
  hasMore: boolean;
  nextAfterEmail?: string;
  indexPending: boolean;
}> {
  const db = getDb();
  const want = args.limit + 1;
  const includeLeads = args.type !== "member";
  const includeMembers = args.type !== "lead";

  let leadAfter = args.afterEmail;
  let memberAfter = args.afterEmail;
  let leadBuf: Array<MergeCandidate<QueryDocumentSnapshot>> = [];
  let memberBuf: Array<MergeCandidate<QueryDocumentSnapshot>> = [];
  let leadExhausted = !includeLeads;
  let memberExhausted = !includeMembers;
  let indexPending = false;

  const refillLeads = async () => {
    if (leadExhausted) return;
    const batch = await fetchEmailBatch(collectionRef(db, "leads"), {
      prefix: args.prefix,
      status: args.status,
      afterEmail: leadAfter,
      limit: want,
    });
    indexPending = indexPending || batch.indexPending;
    leadBuf = leadBuf.concat(batch.docs.map((d) => candidate(d, "lead")));
    if (batch.docs.length) leadAfter = batch.docs[batch.docs.length - 1]!.id;
    if (batch.docs.length < want) leadExhausted = true;
  };
  const refillMembers = async () => {
    if (memberExhausted) return;
    const batch = await fetchEmailBatch(collectionRef(db, "members"), {
      prefix: args.prefix,
      status: args.status,
      afterEmail: memberAfter,
      limit: want,
    });
    indexPending = indexPending || batch.indexPending;
    memberBuf = memberBuf.concat(batch.docs.map((d) => candidate(d, "member")));
    if (batch.docs.length) memberAfter = batch.docs[batch.docs.length - 1]!.id;
    if (batch.docs.length < want) memberExhausted = true;
  };

  await Promise.all([refillLeads(), refillMembers()]);

  const picked: Array<MergeCandidate<QueryDocumentSnapshot>> = [];
  while (picked.length < want) {
    if (leadBuf.length === 0 && !leadExhausted) await refillLeads();
    if (memberBuf.length === 0 && !memberExhausted) await refillMembers();
    if (leadBuf.length === 0 && memberBuf.length === 0) break;
    const take = mergeEmailSorted(leadBuf, memberBuf, 1)[0];
    if (!take) break;
    if (take.kind === "lead") {
      leadBuf = leadBuf.filter((row) => row.email !== take.email);
      memberBuf = memberBuf.filter((row) => row.email !== take.email);
    } else {
      leadBuf = leadBuf.filter((row) => row.email !== take.email);
      memberBuf = memberBuf.filter((row) => row.email !== take.email);
    }
    picked.push(take);
  }

  const hasMore = picked.length > args.limit;
  const page = picked.slice(0, args.limit);
  return {
    rows: page.map((row) => rowFromDoc(row.value, row.kind)),
    hasMore,
    nextAfterEmail: page[page.length - 1]?.email,
    indexPending,
  };
}

async function mergedNamePage(args: {
  type: PeopleType;
  prefix: string;
  status?: string;
  afterEmail?: string;
  afterNameLower?: string;
  skipEmailPrefix?: string;
  limit: number;
}): Promise<{
  rows: PersonRow[];
  hasMore: boolean;
  nextAfterEmail?: string;
  nextAfterNameLower?: string;
  indexPending: boolean;
}> {
  const db = getDb();
  const want = args.limit + 1;
  const includeLeads = args.type !== "member";
  const includeMembers = args.type !== "lead";

  let leadAfterEmail = args.afterEmail;
  let leadAfterName = args.afterNameLower;
  let memberAfterEmail = args.afterEmail;
  let memberAfterName = args.afterNameLower;
  let leadBuf: Array<MergeCandidate<QueryDocumentSnapshot>> = [];
  let memberBuf: Array<MergeCandidate<QueryDocumentSnapshot>> = [];
  let leadExhausted = !includeLeads;
  let memberExhausted = !includeMembers;
  let indexPending = false;

  const refillLeads = async () => {
    if (leadExhausted) return;
    const batch = await fetchNameBatch(collectionRef(db, "leads"), {
      prefix: args.prefix,
      status: args.status,
      afterEmail: leadAfterEmail,
      afterNameLower: leadAfterName,
      limit: want,
    });
    indexPending = indexPending || batch.indexPending;
    const mapped = batch.docs
      .map((d) => candidate(d, "lead"))
      .filter((row) =>
        args.skipEmailPrefix ? !row.email.startsWith(args.skipEmailPrefix) : true
      );
    leadBuf = leadBuf.concat(mapped);
    if (batch.docs.length) {
      const last = batch.docs[batch.docs.length - 1]!;
      leadAfterEmail = last.id;
      leadAfterName = candidate(last, "lead").nameLower;
    }
    if (batch.docs.length < want) leadExhausted = true;
    if (batch.indexPending && batch.docs.length === 0) leadExhausted = true;
  };
  const refillMembers = async () => {
    if (memberExhausted) return;
    const batch = await fetchNameBatch(collectionRef(db, "members"), {
      prefix: args.prefix,
      status: args.status,
      afterEmail: memberAfterEmail,
      afterNameLower: memberAfterName,
      limit: want,
    });
    indexPending = indexPending || batch.indexPending;
    const mapped = batch.docs
      .map((d) => candidate(d, "member"))
      .filter((row) =>
        args.skipEmailPrefix ? !row.email.startsWith(args.skipEmailPrefix) : true
      );
    memberBuf = memberBuf.concat(mapped);
    if (batch.docs.length) {
      const last = batch.docs[batch.docs.length - 1]!;
      memberAfterEmail = last.id;
      memberAfterName = candidate(last, "member").nameLower;
    }
    if (batch.docs.length < want) memberExhausted = true;
    if (batch.indexPending && batch.docs.length === 0) memberExhausted = true;
  };

  await Promise.all([refillLeads(), refillMembers()]);

  const picked: Array<MergeCandidate<QueryDocumentSnapshot>> = [];
  // Name-stage skip can empty a batch that still has more matching docs;
  // keep refilling until we have a page or both streams are exhausted.
  let spins = 0;
  while (picked.length < want && spins < 50) {
    spins += 1;
    if (leadBuf.length === 0 && !leadExhausted) await refillLeads();
    if (memberBuf.length === 0 && !memberExhausted) await refillMembers();
    if (leadBuf.length === 0 && memberBuf.length === 0) break;
    const take = mergeNameSorted(leadBuf, memberBuf, 1)[0];
    if (!take) break;
    leadBuf = leadBuf.filter((row) => row.email !== take.email);
    memberBuf = memberBuf.filter((row) => row.email !== take.email);
    picked.push(take);
  }

  const page = picked.slice(0, args.limit);
  const last = page[page.length - 1];
  return {
    rows: page.map((row) => rowFromDoc(row.value, row.kind)),
    hasMore: picked.length > args.limit || !leadExhausted || !memberExhausted,
    nextAfterEmail: last?.email,
    nextAfterNameLower: last?.nameLower,
    indexPending,
  };
}

async function countEmailStage(args: {
  type: PeopleType;
  prefix?: string;
  status?: string;
}): Promise<{ count: number; approximate: boolean; indexPending: boolean }> {
  const db = getDb();
  const includeLeads = args.type !== "member";
  const includeMembers = args.type !== "lead";
  const counts: number[] = [];
  let indexPending = false;
  if (includeLeads) {
    const r = await countQuery(
      emailCountQuery(collectionRef(db, "leads"), args)
    );
    counts.push(r.count);
    indexPending = indexPending || r.indexPending;
  }
  if (includeMembers) {
    const r = await countQuery(
      emailCountQuery(collectionRef(db, "members"), args)
    );
    counts.push(r.count);
    indexPending = indexPending || r.indexPending;
  }
  const count = counts.reduce((a, b) => a + b, 0);
  return {
    count,
    approximate: includeLeads && includeMembers && counts[0] > 0 && counts[1] > 0,
    indexPending,
  };
}

async function countNameStage(args: {
  type: PeopleType;
  prefix: string;
  status?: string;
}): Promise<{ count: number; approximate: boolean; indexPending: boolean }> {
  const db = getDb();
  const includeLeads = args.type !== "member";
  const includeMembers = args.type !== "lead";
  const counts: number[] = [];
  let indexPending = false;
  if (includeLeads) {
    const r = await countQuery(
      nameCountQuery(collectionRef(db, "leads"), args)
    );
    counts.push(r.count);
    indexPending = indexPending || r.indexPending;
  }
  if (includeMembers) {
    const r = await countQuery(
      nameCountQuery(collectionRef(db, "members"), args)
    );
    counts.push(r.count);
    indexPending = indexPending || r.indexPending;
  }
  return {
    count: counts.reduce((a, b) => a + b, 0),
    approximate:
      includeLeads && includeMembers && counts[0] > 0 && counts[1] > 0,
    indexPending,
  };
}

async function loadLifecycle(rows: PersonRow[]): Promise<PersonRow[]> {
  if (!rows.length) return rows;
  const db = getDb();
  const emails = [...new Set(rows.map((r) => r.email))];
  const applicantEmails = new Set<string>();
  const clientEmails = new Set<string>();
  for (let i = 0; i < emails.length; i += 10) {
    const chunk = emails.slice(i, i + 10);
    const [appsSnap, clientsSnap] = await Promise.all([
      db.collection("coaching_applications").where("email", "in", chunk).get(),
      db.collection("client_records").where("email", "in", chunk).get(),
    ]);
    appsSnap.docs.forEach((d) => {
      const email = (d.data().email as string)?.toLowerCase();
      if (email) applicantEmails.add(email);
    });
    clientsSnap.docs.forEach((d) => {
      const email = (d.data().email as string)?.toLowerCase();
      if (email) clientEmails.add(email);
    });
  }
  return rows.map((row) => {
    let lifecycle: PersonRow["lifecycle"] = row.type;
    if (clientEmails.has(row.email)) lifecycle = "client";
    else if (applicantEmails.has(row.email)) lifecycle = "applicant";
    return { ...row, lifecycle };
  });
}

function nextCursorFor(
  stage: PeopleListCursor["stage"],
  hasMore: boolean,
  last?: { email?: string; nameLower?: string }
): string | undefined {
  if (!hasMore) return undefined;
  if (!last?.email) {
    return stage === "name" ? encodePeopleCursor({ stage: "name" }) : undefined;
  }
  const cursor: PeopleListCursor = { stage, afterEmail: last.email };
  if (stage === "name" && last.nameLower) cursor.afterNameLower = last.nameLower;
  return encodePeopleCursor(cursor);
}

async function listPeoplePage(opts: {
  type: PeopleType;
  search: string;
  status?: string;
  limit: number;
  cursor?: PeopleListCursor;
}): Promise<ListPeopleResult> {
  const stage: PeopleListCursor["stage"] =
    opts.cursor?.stage || "email";
  const emailOnly = isEmailSearch(opts.search);
  let indexPending = false;

  if (!opts.search) {
    const page = await mergedEmailPage({
      type: opts.type,
      status: opts.status,
      afterEmail: opts.cursor?.afterEmail,
      limit: opts.limit,
    });
    indexPending = page.indexPending;
    const totals = await countEmailStage({
      type: opts.type,
      status: opts.status,
    });
    indexPending = indexPending || totals.indexPending;
    return {
      people: await loadLifecycle(page.rows),
      total: totals.count,
      totalApproximate: totals.approximate,
      hasMore: page.hasMore,
      nextCursor: nextCursorFor("email", page.hasMore, {
        email: page.nextAfterEmail,
      }),
      indexPending,
    };
  }

  if (emailOnly || stage === "email") {
    const page = await mergedEmailPage({
      type: opts.type,
      prefix: opts.search,
      status: opts.status,
      afterEmail: opts.cursor?.afterEmail,
      limit: opts.limit,
    });
    indexPending = page.indexPending;

    const emailTotals = await countEmailStage({
      type: opts.type,
      prefix: opts.search,
      status: opts.status,
    });
    indexPending = indexPending || emailTotals.indexPending;

    if (emailOnly) {
      return {
        people: await loadLifecycle(page.rows),
        total: emailTotals.count,
        totalApproximate: emailTotals.approximate,
        hasMore: page.hasMore,
        nextCursor: nextCursorFor("email", page.hasMore, {
          email: page.nextAfterEmail,
        }),
        indexPending,
      };
    }

    const nameTotals = await countNameStage({
      type: opts.type,
      prefix: opts.search,
      status: opts.status,
    });
    indexPending = indexPending || nameTotals.indexPending;
    const total = emailTotals.count + nameTotals.count;
    const totalApproximate =
      (emailTotals.count > 0 && nameTotals.count > 0) ||
      emailTotals.approximate ||
      nameTotals.approximate;

    if (page.rows.length === opts.limit && page.hasMore) {
      return {
        people: await loadLifecycle(page.rows),
        total,
        totalApproximate,
        hasMore: true,
        nextCursor: nextCursorFor("email", true, { email: page.nextAfterEmail }),
        indexPending,
      };
    }

    if (page.rows.length === opts.limit && !page.hasMore) {
      const namePeek = await mergedNamePage({
        type: opts.type,
        prefix: opts.search,
        status: opts.status,
        skipEmailPrefix: opts.search,
        limit: 1,
      });
      indexPending = indexPending || namePeek.indexPending;
      return {
        people: await loadLifecycle(page.rows),
        total,
        totalApproximate,
        hasMore: namePeek.rows.length > 0 || namePeek.hasMore,
        nextCursor: nextCursorFor(
          "name",
          namePeek.rows.length > 0 || namePeek.hasMore,
          { email: undefined, nameLower: undefined }
        ),
        indexPending,
      };
    }

    const remaining = opts.limit - page.rows.length;
    const namePage = await mergedNamePage({
      type: opts.type,
      prefix: opts.search,
      status: opts.status,
      skipEmailPrefix: opts.search,
      limit: remaining,
    });
    indexPending = indexPending || namePage.indexPending;
    const combined = [...page.rows, ...namePage.rows];
    return {
      people: await loadLifecycle(combined),
      total,
      totalApproximate,
      hasMore: namePage.hasMore,
      nextCursor: nextCursorFor("name", namePage.hasMore, {
        email: namePage.nextAfterEmail,
        nameLower: namePage.nextAfterNameLower,
      }),
      indexPending,
    };
  }

  const namePage = await mergedNamePage({
    type: opts.type,
    prefix: opts.search,
    status: opts.status,
    afterEmail: opts.cursor?.afterEmail,
    afterNameLower: opts.cursor?.afterNameLower,
    skipEmailPrefix: opts.search,
    limit: opts.limit,
  });
  const emailTotals = await countEmailStage({
    type: opts.type,
    prefix: opts.search,
    status: opts.status,
  });
  const nameTotals = await countNameStage({
    type: opts.type,
    prefix: opts.search,
    status: opts.status,
  });
  return {
    people: await loadLifecycle(namePage.rows),
    total: emailTotals.count + nameTotals.count,
    totalApproximate: emailTotals.count > 0 && nameTotals.count > 0,
    hasMore: namePage.hasMore,
    nextCursor: nextCursorFor("name", namePage.hasMore, {
      email: namePage.nextAfterEmail,
      nameLower: namePage.nextAfterNameLower,
    }),
    indexPending:
      namePage.indexPending ||
      emailTotals.indexPending ||
      nameTotals.indexPending,
  };
}

export async function listPeople(opts: ListPeopleOpts): Promise<ListPeopleResult> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const type = assertPeopleType(opts.type ?? "all");
  const search = opts.search?.trim().toLowerCase() || "";
  const status = opts.status?.trim() || undefined;
  let cursor = requirePeopleCursor(opts.cursor);
  const offset = opts.offset ?? 0;

  if (offset > 0 && !opts.cursor) {
    let skipped = 0;
    let skipCursor: PeopleListCursor | undefined;
    while (skipped < offset) {
      const batchLimit = Math.min(200, offset - skipped);
      const batch = await listPeoplePage({
        type,
        search,
        status,
        limit: batchLimit,
        cursor: skipCursor,
      });
      skipped += batch.people.length;
      if (!batch.hasMore || !batch.nextCursor) {
        cursor = { stage: "email", afterEmail: "\uf8ff" };
        break;
      }
      skipCursor = requirePeopleCursor(batch.nextCursor);
    }
    if (skipped >= offset) cursor = skipCursor;
  }

  return listPeoplePage({ type, search, status, limit, cursor });
}
