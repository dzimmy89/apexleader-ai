/**
 * Starting points for the contact page composer. The admin edits the text
 * before preview, and the server still runs every 1:1 guard and appends the
 * locked footer. Plain sentences, no em dashes.
 */
export const CONTACT_EMAIL_TEMPLATE_IDS = [
  "discovery_follow_up",
  "proposal",
  "payment_reminder",
  "welcome",
] as const;

export type ContactEmailTemplateId = (typeof CONTACT_EMAIL_TEMPLATE_IDS)[number];

export function isContactEmailTemplateId(value: string): value is ContactEmailTemplateId {
  return (CONTACT_EMAIL_TEMPLATE_IDS as readonly string[]).includes(value);
}

export const CONTACT_EMAIL_TEMPLATE_LABELS: Record<ContactEmailTemplateId, string> = {
  discovery_follow_up: "Follow-up after discovery call",
  proposal: "Proposal",
  payment_reminder: "Payment reminder",
  welcome: "Welcome",
};

/** The 1:1 guard asks the admin to label each email. These are the usual choices. */
export const CONTACT_EMAIL_TEMPLATE_AD_KIND: Record<ContactEmailTemplateId, "promotional" | "personal"> = {
  discovery_follow_up: "personal",
  proposal: "promotional",
  payment_reminder: "personal",
  welcome: "personal",
};

export interface ContactEmailTemplateContext {
  name?: string;
  packageName?: string;
  /** Whole dollars. */
  packagePrice?: number | null;
  /** USD cents. */
  amountDue?: number | null;
  dueDate?: string | null;
  installmentNumber?: number | null;
  installments?: number | null;
  payUrl?: string;
  signature?: string;
}

function firstName(name?: string): string {
  const first = (name || "").trim().split(/\s+/)[0] || "";
  return first || "there";
}

function dollars(cents: number): string {
  const value = cents / 100;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** YYYY-MM-DD as "October 20, 2026". */
export function formatDueDate(ymd: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) return ymd;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function contactEmailTemplate(
  id: ContactEmailTemplateId,
  ctx: ContactEmailTemplateContext
): { subject: string; body: string } {
  const hi = `Hi ${firstName(ctx.name)},`;
  const sign = ctx.signature || "David";
  const pkg = ctx.packageName || "coaching";
  switch (id) {
    case "discovery_follow_up":
      return {
        subject: "Following up on our call",
        body: [
          hi,
          "",
          "Thank you for taking the time to talk with me.",
          "",
          "If you have questions about what we discussed, reply to this email and I will answer them.",
          "",
          sign,
        ].join("\n"),
      };
    case "proposal": {
      const lines = [hi, "", "Here is what I suggest after our call.", "", `Package: ${pkg}`];
      if (typeof ctx.packagePrice === "number" && ctx.packagePrice > 0) {
        lines.push(`Price: $${ctx.packagePrice.toLocaleString("en-US")}`);
      }
      lines.push(
        "You can pay in full, in 3 monthly payments, or in 6 monthly payments.",
        "",
        "Reply to this email if you want to go ahead or have questions.",
        "",
        sign
      );
      return { subject: "Your coaching proposal", body: lines.join("\n") };
    }
    case "payment_reminder": {
      const which =
        ctx.installmentNumber && ctx.installments && ctx.installments > 1
          ? `Payment ${ctx.installmentNumber} of ${ctx.installments} for ${pkg}`
          : `Your payment for ${pkg}`;
      const amount = typeof ctx.amountDue === "number" && ctx.amountDue > 0 ? ` (${dollars(ctx.amountDue)})` : "";
      const due = ctx.dueDate ? ` is due on ${formatDueDate(ctx.dueDate)}.` : " is due.";
      const lines = [hi, "", `${which}${amount}${due}`, ""];
      if (ctx.payUrl) {
        lines.push(`You can pay here: ${ctx.payUrl}`, "");
      }
      lines.push(
        "If you already sent it, reply with the transaction hash and I will update your record.",
        "",
        sign
      );
      return { subject: "Payment reminder", body: lines.join("\n") };
    }
    case "welcome":
      return {
        subject: `Welcome to ${pkg}`,
        body: [
          hi,
          "",
          `Welcome. Your ${pkg} payment is recorded.`,
          "",
          "Next step: sign the coaching agreement I sent by email. Then reply with a few times that work for your first session.",
          "",
          sign,
        ].join("\n"),
      };
    default: {
      const exhaustive: never = id;
      return exhaustive;
    }
  }
}
