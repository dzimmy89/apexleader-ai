export const CAPTURE_SUCCESS_SENDS_OFF =
  "You're on the list. Open the checklist below — we have not sent a confirmation email.";

export const CAPTURE_SUCCESS_SENDS_ON =
  "You're on the list. If this is your first time, check your inbox to confirm.";

export const CHECKLIST_HTML_HREF = "/checklists/defi-safety-checklist.html";
export const CHECKLIST_PDF_HREF = "/checklists/defi-safety-checklist.pdf";

/** `sendsPossible` is environment-wide (gates), never per-address. */
export function captureSuccessCopy(sendsPossible: boolean): {
  message: string;
  showChecklistLinks: boolean;
} {
  if (sendsPossible) {
    return { message: CAPTURE_SUCCESS_SENDS_ON, showChecklistLinks: true };
  }
  return { message: CAPTURE_SUCCESS_SENDS_OFF, showChecklistLinks: true };
}
