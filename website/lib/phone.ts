/**
 * Mobile numbers from public forms, kept as E.164 so the CRM, the texting
 * service and the call reminder all read the same string. Ten digits with no
 * country code are taken as North American, which is where the coaching
 * clients are; anything else must start with its country code.
 */
export function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const plus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");
  if (!plus && digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (!plus && digits.length === 10) return `+1${digits}`;
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
}

/** +14152955777 → (415) 295-5777 for North American numbers; others stay as E.164. */
export function formatPhone(e164: string): string {
  const m = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}
