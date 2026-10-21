export type CrmStorage = "firestore" | "dual" | "postgres";

export function getCrmStorage(): CrmStorage {
  const mode = process.env.CRM_STORAGE || "firestore";
  if (mode === "dual" || mode === "postgres") return mode;
  return "firestore";
}

export function isPostgresEnabled(): boolean {
  return getCrmStorage() !== "firestore" && !!process.env.DATABASE_URL;
}
