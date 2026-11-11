import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let db: Firestore | undefined;

function parseServiceAccount(): Record<string, unknown> | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf-8");
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

export function getAdminApp(): App {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }
  const projectId = process.env.GCP_PROJECT_ID || "apexleader-prod";
  // Cloud Run: use the runtime service account (ADC) for Firestore.
  // GOOGLE_SERVICE_ACCOUNT_KEY is reserved for Gmail/Calendar domain-wide delegation.
  const sa =
    process.env.NODE_ENV === "production" ? null : parseServiceAccount();
  if (sa) {
    app = initializeApp({
      credential: cert(sa as Parameters<typeof cert>[0]),
      projectId,
    });
  } else {
    app = initializeApp({ projectId });
  }
  return app;
}

/**
 * The build can load this file more than once in one server (one copy per
 * route bundle), while firebase-admin itself is loaded once. Each copy then
 * gets the same Firestore client, and a second settings() call on it throws
 * "Firestore has already been initialized". So the configured client is kept
 * on globalThis for every copy to share, and a client another copy already
 * configured is used as it is.
 */
const shared = globalThis as { __fatbFirestore?: Firestore };

export function getDb(): Firestore {
  if (db) return db;
  if (shared.__fatbFirestore) {
    db = shared.__fatbFirestore;
    return db;
  }
  const instance = getFirestore(getAdminApp());
  applyIgnoreUndefinedProperties(instance);
  shared.__fatbFirestore = instance;
  db = instance;
  return db;
}

function applyIgnoreUndefinedProperties(instance: Firestore): void {
  try {
    instance.settings({ ignoreUndefinedProperties: true });
  } catch (e) {
    // Already configured (by another copy of this file) or already in use.
    // Either way the client works; only a different error is worth raising.
    if (!(e instanceof Error) || !/already been initialized/i.test(e.message)) throw e;
  }
}

/** Test-only: inject an in-memory Firestore stand-in before first getDb(). */
export function setDbForTests(instance: Firestore | undefined): void {
  db = instance;
  shared.__fatbFirestore = instance;
}

export function leadDocId(email: string): string {
  return email.trim().toLowerCase();
}
