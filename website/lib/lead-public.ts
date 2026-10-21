export const PUBLIC_LEAD_OK = { ok: true as const };

export type PublicLeadOk = { ok: true };

/** Public POST /api/lead body after a valid submission. No per-address fields. */
export function publicLeadAcceptedResponse(): PublicLeadOk {
  return PUBLIC_LEAD_OK;
}
