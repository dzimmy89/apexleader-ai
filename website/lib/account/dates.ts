const ET = "America/New_York";

function parse(iso: string): Date | null {
  if (!iso) return null;
  const t = Date.parse(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  return Number.isNaN(t) ? null : new Date(t);
}

/** "Nov 3, 2026" */
export function dayShort(iso: string): string {
  const d = parse(iso);
  return d ? d.toLocaleDateString("en-US", { timeZone: ET, month: "short", day: "numeric", year: "numeric" }) : "";
}

/** "November 3, 2026" */
export function dayLong(iso: string): string {
  const d = parse(iso);
  return d ? d.toLocaleDateString("en-US", { timeZone: ET, month: "long", day: "numeric", year: "numeric" }) : "";
}

/** "Mon, Nov 3" */
export function dayBrief(iso: string): string {
  const d = parse(iso);
  return d ? d.toLocaleDateString("en-US", { timeZone: ET, weekday: "short", month: "short", day: "numeric" }) : "";
}

/** "Mon, Nov 3 at 2:00 PM ET" */
export function dateTimeET(iso: string): string {
  const d = parse(iso);
  if (!d) return "";
  const day = d.toLocaleDateString("en-US", { timeZone: ET, weekday: "short", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { timeZone: ET, hour: "numeric", minute: "2-digit" });
  return `${day} at ${time} ET`;
}
