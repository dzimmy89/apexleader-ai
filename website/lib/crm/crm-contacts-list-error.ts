/**
 * HubSpot contacts list fetch error copy. Kept out of the client component so
 * node:test can cover non-ok and invalid-cursor responses without rendering React.
 */
export function crmContactsListErrorMessage(
  ok: boolean,
  body: { error?: unknown }
): string | null {
  if (ok) return null;
  if (body.error === "Invalid cursor") {
    return "That page is no longer valid. Go back to the first page.";
  }
  if (typeof body.error === "string" && body.error.trim()) {
    return body.error;
  }
  return "Could not load HubSpot contacts.";
}
