import { listUnsubscribeHeaderValue } from "@/lib/email-tokens";

export function headerValueHasCtl(value: string): boolean {
  return /[\r\n]/.test(value);
}

/** RFC 2047 encoded-word for non-ASCII; ASCII is passed through. */
export function encodeRfc2047(value: string): string {
  if (headerValueHasCtl(value)) {
    throw new Error("header_injection");
  }
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

export function buildMimeHeaders(opts: {
  fromEmail: string;
  fromName: string;
  to: string;
  subject: string;
  unsubscribeUrl?: string;
  purpose?: "marketing" | "transactional";
}): string[] {
  const fields = [
    opts.fromName,
    opts.fromEmail,
    opts.to,
    opts.subject,
    opts.unsubscribeUrl || "",
  ];
  if (fields.some((value) => headerValueHasCtl(value))) {
    throw new Error("header_injection");
  }
  const headers = [
    `From: ${encodeRfc2047(opts.fromName)} <${opts.fromEmail}>`,
    `Reply-To: ${encodeRfc2047(opts.fromName)} <${opts.fromEmail}>`,
    `To: ${opts.to}`,
    `Subject: ${encodeRfc2047(opts.subject)}`,
    "MIME-Version: 1.0",
  ];
  if (opts.purpose === "marketing") {
    if (!opts.unsubscribeUrl) {
      throw new Error("marketing send requires unsubscribeUrl");
    }
    headers.push(
      `List-Unsubscribe: ${listUnsubscribeHeaderValue(opts.unsubscribeUrl)}`
    );
    headers.push("List-Unsubscribe-Post: List-Unsubscribe=One-Click");
  } else if (opts.unsubscribeUrl) {
    headers.push(`List-Unsubscribe: <${opts.unsubscribeUrl}>`);
  }
  return headers;
}
