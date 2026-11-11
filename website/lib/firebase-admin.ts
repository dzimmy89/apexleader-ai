import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let db: Firestore | undefined;
let ignoreUndefinedApplied = false;

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

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getAdminApp());
    applyIgnoreUndefinedProperties(db);
  }
  return db;
}

function applyIgnoreUndefinedProperties(instance: Firestore): void {
  if (ignoreUndefinedApplied) return;
  try {
    instance.settings({ ignoreUndefinedProperties: true });
  } catch (e) {
    // Next can bundle this module into more than one server chunk. Each copy
    // has its own `db`, but getFirestore() hands every copy the same client,
    // and settings() may only run once, before first use. The copy that got
    // there first already applied this same setting, so a second attempt on a
    // warm instance is safe to ignore. Anything else is a real error.
    if (!(e instanceof Error) || !e.message.includes("already been initialized")) throw e;
  }
  ignoreUndefinedApplied = true;
}

/** Test-only: inject an in-memory Firestore stand-in before first getDb(). */
export function setDbForTests(instance: Firestore | undefined): void {
  db = instance;
  ignoreUndefinedApplied = Boolean(instance);
}

export function leadDocId(email: string): string {
  return email.trim().toLowerCase();
}
