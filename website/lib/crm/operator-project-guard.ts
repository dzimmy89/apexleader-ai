import { readFileSync } from "node:fs";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { setDbForTests } from "@/lib/firebase-admin";

export const PROD_FIRESTORE_PROJECT = "apexleader-prod";

export interface OperatorProjectGuardArgs {
  credentialProjectId: string;
  projectFlag?: string;
  expectedProject?: string;
  emulatorHost?: string;
}

export function parseCredentialsProjectId(jsonText: string): string {
  let parsed: { project_id?: unknown };
  try {
    parsed = JSON.parse(jsonText) as { project_id?: unknown };
  } catch {
    throw new Error("credentials JSON is invalid");
  }
  if (typeof parsed.project_id !== "string" || !parsed.project_id.trim()) {
    throw new Error("credentials JSON has no project_id");
  }
  return parsed.project_id.trim();
}

export function readCredentialsProjectId(
  credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
): string {
  if (!credentialsPath) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not set");
  }
  return parseCredentialsProjectId(readFileSync(credentialsPath, "utf8"));
}

/**
 * Resolve the operator Firestore project from the credential file's
 * project_id. Do not use getDb()'s apexleader-prod default.
 */
export function assertOperatorProject(args: OperatorProjectGuardArgs): string {
  const expected = (args.expectedProject ?? PROD_FIRESTORE_PROJECT).trim();
  const cred = args.credentialProjectId.trim();
  if (!cred) {
    throw new Error("credentials project_id is empty");
  }
  const flag = args.projectFlag?.trim();
  if (flag && flag !== cred) {
    throw new Error(
      `--project ${flag} does not match credentials project_id ${cred}`
    );
  }
  if (cred !== expected) {
    throw new Error(
      `credentials project_id ${cred} does not match expected project ${expected}`
    );
  }
  const emulatorHost = (args.emulatorHost ?? "").trim();
  if (emulatorHost && cred === PROD_FIRESTORE_PROJECT) {
    throw new Error(
      `FIRESTORE_EMULATOR_HOST is set (${emulatorHost}); refusing to target ${PROD_FIRESTORE_PROJECT}`
    );
  }
  return cred;
}

export function bindOperatorFirestore(projectId: string): Firestore {
  const appName = `crm-operator-${projectId}`;
  const existing = getApps().find((app) => app.name === appName);
  const app =
    existing ||
    initializeApp(
      {
        credential: applicationDefault(),
        projectId,
      },
      appName
    );
  const db = getFirestore(app);
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // settings can only be applied once per client
  }
  setDbForTests(db);
  return db;
}

/** Bind getDb() to the credential project after the guard passes. */
export function prepareOperatorFirestore(opts: {
  projectFlag?: string;
  expectedProject?: string;
  credentialsPath?: string;
  emulatorHost?: string;
}): string {
  const credentialProjectId = readCredentialsProjectId(opts.credentialsPath);
  const projectId = assertOperatorProject({
    credentialProjectId,
    projectFlag: opts.projectFlag,
    expectedProject: opts.expectedProject,
    emulatorHost: opts.emulatorHost ?? process.env.FIRESTORE_EMULATOR_HOST,
  });
  bindOperatorFirestore(projectId);
  return projectId;
}
