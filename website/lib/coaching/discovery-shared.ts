import { getSiteOrigin } from "@/lib/env";

export const COACH_TIMEZONE = "America/New_York";

export const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

export function getDiscoveryPrepUrl(packageId?: string): string {
  const base = `${getSiteOrigin()}/coaching/discovery-prep`;
  if (!packageId) return base;
  return `${base}?packageId=${encodeURIComponent(packageId)}`;
}

export function formatTimezoneLabel(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "longGeneric",
    }).formatToParts(new Date());
    const name =
      parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
    if (name.startsWith("GMT")) return tz;
    return `${name} (${tz})`;
  } catch {
    return tz;
  }
}

export function formatBookingDateTime(start: Date, timeZone: string): string {
  return start.toLocaleString("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}
