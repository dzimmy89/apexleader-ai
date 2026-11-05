import type { LeadUtm } from "@/lib/crm/lead-lifecycle";

/**
 * First-touch attribution, kept in a small cookie by the browser so that any
 * later form (the exercise gate, sign-in, the call booking) can hand it to
 * captureLead. Written by components/AttributionCapture on the first page
 * view that carries a utm_ tag or an outside referrer; never overwritten.
 */
export const ATTRIBUTION_COOKIE = "fatb_attr";
export const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 90;

export interface Attribution {
  utm?: LeadUtm;
  referrer?: string;
  landingPath?: string;
}

const UTM_KEYS: (keyof LeadUtm)[] = ["source", "medium", "campaign", "content", "term"];

function clean(value: unknown, max = 200): string | undefined {
  if (typeof value !== "string") return undefined;
  const s = value.trim().slice(0, max);
  return s || undefined;
}

/** Parse the cookie (or a posted copy of it); bad input gives an empty object. */
export function parseAttribution(raw: unknown): Attribution {
  let data: unknown = raw;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (!data || typeof data !== "object") return {};
  const d = data as Record<string, unknown>;
  const utm: LeadUtm = {};
  const u = d.utm && typeof d.utm === "object" ? (d.utm as Record<string, unknown>) : {};
  for (const k of UTM_KEYS) {
    const v = clean(u[k], 120);
    if (v) utm[k] = v;
  }
  const out: Attribution = {};
  if (Object.keys(utm).length) out.utm = utm;
  const referrer = clean(d.referrer, 500);
  if (referrer) out.referrer = referrer;
  const landingPath = clean(d.landingPath, 300);
  if (landingPath && landingPath.startsWith("/")) out.landingPath = landingPath;
  return out;
}

/** The utm_ fields of a URL as a LeadUtm, or undefined when there are none. */
export function utmFromSearch(search: string): LeadUtm | undefined {
  const params = new URLSearchParams(search);
  const utm: LeadUtm = {};
  for (const k of UTM_KEYS) {
    const v = clean(params.get(`utm_${k}`), 120);
    if (v) utm[k] = v;
  }
  return Object.keys(utm).length ? utm : undefined;
}
