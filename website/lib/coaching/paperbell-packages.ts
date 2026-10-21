/**
 * Packages clients bought on Paperbell before coaching moved onto the site.
 *
 * They are never sold again and never shown on public pages. They only tell
 * the site how many sessions a Paperbell purchase carried, how long its
 * course access lasts (from the purchase date, like today's packages), and
 * whether it comes with a Skool seat for that window.
 */
export interface PaperbellPackage {
  id: string;
  /** The name clients saw on Paperbell. */
  name: string;
  /** Sessions included; null when it varies and the roster must say. */
  sessions: number | null;
  access: { days?: number; months?: number } | null;
  skool: boolean;
}

export const PAPERBELL_PACKAGES: PaperbellPackage[] = [
  { id: "pb_session_1", name: "60-Minute Breakthrough Session", sessions: 1, access: { days: 30 }, skool: false },
  { id: "pb_session_5", name: "(5) 60-Minute Breakthrough Sessions", sessions: 5, access: { months: 3 }, skool: false },
  { id: "pb_intensive", name: "DeFi Intensive Package", sessions: null, access: { months: 3 }, skool: true },
  { id: "pb_mastery", name: "DeFi Mastery Package", sessions: null, access: { months: 6 }, skool: true },
];

/** Paperbell's free intro call. A buyer of only this is a lead, not a client. */
export const PAPERBELL_DISCOVERY = "discovery";

export const PAPERBELL_ACCESS: Record<string, { days?: number; months?: number }> = Object.fromEntries(
  PAPERBELL_PACKAGES.filter((p) => p.access).map((p) => [p.id, p.access!])
);

function squash(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Match what the roster says (a legacy id or the Paperbell name, in any case
 * or spacing) to a package. Returns PAPERBELL_DISCOVERY for discovery calls.
 */
export function matchPaperbellPackage(raw: string): PaperbellPackage | typeof PAPERBELL_DISCOVERY | null {
  const key = squash(raw);
  if (!key) return null;
  const byId = PAPERBELL_PACKAGES.find((p) => squash(p.id) === key);
  if (byId) return byId;
  if (key.includes("discovery")) return PAPERBELL_DISCOVERY;
  const byName = PAPERBELL_PACKAGES.find((p) => squash(p.name) === key);
  if (byName) return byName;
  if (key.includes("mastery")) return PAPERBELL_PACKAGES.find((p) => p.id === "pb_mastery")!;
  if (key.includes("intensive")) return PAPERBELL_PACKAGES.find((p) => p.id === "pb_intensive")!;
  if (key.includes("breakthrough")) {
    return /(^|\s)5(\s|$)|five/.test(key)
      ? PAPERBELL_PACKAGES.find((p) => p.id === "pb_session_5")!
      : PAPERBELL_PACKAGES.find((p) => p.id === "pb_session_1")!;
  }
  return null;
}
