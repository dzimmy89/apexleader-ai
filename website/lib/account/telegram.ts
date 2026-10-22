/**
 * Messages: a private coaching client talks to David on Telegram. There is
 * no bot or inbox; the site hands the client a deep link into Telegram and
 * remembers their username so David knows who is writing.
 */
import { BRAND } from "@/lib/brand";

export const COACH_TELEGRAM_HANDLE = BRAND.telegramHandle;

const HANDLE_RE = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;

/** "@Jane_Trader " -> "jane_trader"; null when it is not a Telegram username. */
export function normalizeTelegramHandle(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const handle = raw.trim().replace(/^@/, "").replace(/^(https?:\/\/)?(t\.me|telegram\.me)\//i, "");
  return HANDLE_RE.test(handle) ? handle.toLowerCase() : null;
}

/** The t.me link that opens a chat with David, with a first line pre-filled. */
export function telegramDeepLink(input: { name?: string | null; packageName?: string | null }): string {
  const who = (input.name || "").trim().split(/\s+/)[0] || "";
  const pkg = (input.packageName || "").trim();
  const text = `Hi David, it's ${who || "your client"}${pkg ? ` (${pkg})` : ""}. `;
  return `https://t.me/${COACH_TELEGRAM_HANDLE}?text=${encodeURIComponent(text)}`;
}
