import { marketingSendBlockReason } from "@/lib/marketing-sends";

export type EmailPurpose = "marketing" | "transactional";

export function evaluateSendGates(args: {
  purpose: EmailPurpose;
  requireSendEnabled?: boolean;
  suppressed: boolean;
  unsubscribeUrl?: string;
}): { skip: boolean; error?: string } {
  if (args.purpose === "marketing" && !args.unsubscribeUrl) {
    return { skip: true, error: "missing_unsubscribe_url" };
  }
  if (args.purpose === "marketing" || args.requireSendEnabled) {
    const blocked = marketingSendBlockReason();
    if (blocked) return { skip: true, error: blocked };
  }
  if (args.suppressed) {
    return { skip: true, error: "suppressed" };
  }
  return { skip: false };
}
