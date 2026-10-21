import Link from "next/link";
import { URLS } from "@/content/site";
import { SkoolJoinLink } from "@/components/SkoolJoinLink";
import { ManageCardButton } from "@/components/account/ManageCardButton";
import { Chip, Notice, Panel, Stat } from "@/components/system";
import type { BillingSummary, CoachingPlan, SkoolPlan } from "@/lib/account/billing";
import { dayShort } from "@/lib/account/dates";
import { formatUsdCents } from "@/lib/coaching/payments";

const METHOD_LABEL = { stripe: "Card", crypto: "Crypto", paypal: "PayPal" } as const;

function SkoolCard({ skool }: { skool: SkoolPlan }) {
  if (skool.paying) {
    return (
      <Panel title="Membership on Skool" action={<Chip tone="skool">Active</Chip>}>
        <p className="text-[17px]">$97 a month: all 31 courses, the live calls and the community.</p>
        {skool.lastSeenAt ? (
          <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">Last confirmed in Skool on {dayShort(skool.lastSeenAt)}.</p>
        ) : null}
        <p className="mt-3 text-[15px] text-[var(--color-text-muted)]">
          Skool bills this membership, so your card, receipts and cancelling live in your Skool settings. If you leave Skool,
          course access here ends after the next member update.
        </p>
        <a href={URLS.skoolCommunity} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-5">
          Open DeFi University on Skool
        </a>
      </Panel>
    );
  }
  const seat = skool.coachingSeat!;
  return (
    <Panel title="Skool community" action={<Chip tone="skool">Until {dayShort(seat.endsAt)}</Chip>}>
      <p className="text-[17px]">Your coaching includes the Skool community for the coaching period.</p>
      <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">
        {seat.status === "to_add"
          ? "We are adding you to Skool. The invite comes by email."
          : seat.status === "invited"
            ? "Your Skool invite is in your email. Accept it to join."
            : "You are in the Skool group."}{" "}
        To stay after that date, join the $97 membership on Skool.
      </p>
      <SkoolJoinLink location="account_billing" className="btn btn-secondary mt-5">
        Join on Skool
      </SkoolJoinLink>
    </Panel>
  );
}

function planLine(c: CoachingPlan): string {
  if (c.fullAccess && !c.payments.length) return "Granted by DeFi University. Nothing to pay.";
  if (c.installments <= 1) return c.payments.length ? "Paid in full." : "Paid in full, or payment not recorded yet.";
  return `${c.installments} monthly payments, ${c.installmentsPaid} of ${c.installments} paid.`;
}

function CoachingCard({ coaching: c }: { coaching: CoachingPlan }) {
  const owesCrypto = c.method === "crypto" && c.nextDue;
  const nextDueLabel = c.nextDue
    ? `${c.nextDue.amount ? formatUsdCents(c.nextDue.amount) : "Next payment"} ${c.nextDue.estimated ? "around" : "due"} ${dayShort(c.nextDue.dueDate)}`
    : null;
  return (
    <Panel title={c.packageName} eyebrow="Private coaching" action={<Chip tone={c.lastPaymentFailed ? "danger" : "success"}>{c.lastPaymentFailed ? "Payment failed" : c.statusLabel}</Chip>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat value={c.nextDue?.amount ? formatUsdCents(c.nextDue.amount) : "—"} label={c.nextDue ? `${c.nextDue.estimated ? "around" : "due"} ${dayShort(c.nextDue.dueDate)}` : "nothing due"} />
        <Stat value={c.accessEndsAt ? dayShort(c.accessEndsAt) : "Open"} label="coaching and course access until" />
      </div>
      <p className="mt-5 text-[15px] text-[var(--color-text-muted)]">
        {planLine(c)}
        {c.nextDue && c.method === "stripe" ? " Stripe charges your card automatically." : ""}
      </p>
      {c.lastPaymentFailed ? (
        <Notice tone="danger" title="Your last card payment did not go through." className="mt-4" role="alert">
          Update your card below and Stripe will try again.
        </Notice>
      ) : null}
      {owesCrypto && nextDueLabel ? (
        <Notice tone="warning" title={nextDueLabel} className="mt-4">
          <Link href={`/coaching/pay?package=${encodeURIComponent(c.packageId)}`} className="underline underline-offset-4">
            Send the crypto payment and tell us the transaction
          </Link>
        </Notice>
      ) : null}
      {c.payments.length ? (
        <div className="mt-6">
          <p className="ui-label mb-1">Payments</p>
          {c.payments.map((p, i) => (
            <div key={`${p.paidAt}-${i}`} className="row">
              <div className="min-w-0">
                <div className="row-label">{formatUsdCents(p.amount)}</div>
                <div className="mt-0.5 font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-text-muted)]">
                  {dayShort(p.paidAt)} · {METHOD_LABEL[p.method] || p.method}
                  {p.installmentNumber && c.installments > 1 ? ` · payment ${p.installmentNumber} of ${c.installments}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {c.hasStripeCustomer ? (
        <div className="mt-6">
          <ManageCardButton />
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
            Opens Stripe, where you can change your card and download invoices. Payment plans run for the number of
            payments in your coaching agreement.
          </p>
        </div>
      ) : null}
      <p className="mt-5 text-[14px] text-[var(--color-text-muted)]">Questions about a payment: hello@defiuniversity.xyz.</p>
    </Panel>
  );
}

/** "Plans and billing" on /account. */
export function PlansAndBilling({ billing, hasCourseAccess }: { billing: BillingSummary; hasCourseAccess: boolean }) {
  const { skool, coaching, manual } = billing;
  const nothing = !skool && !coaching && !manual;
  return (
    <div id="billing" className="space-y-6">
      <div>
        <p className="section-eyebrow">Billing</p>
        <h2 className="mt-2 text-[length:var(--text-h2)] leading-[1.08]">Plans and billing</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 md:[&>*:only-child]:col-span-2">
        {coaching ? <CoachingCard coaching={coaching} /> : null}
        {skool ? <SkoolCard skool={skool} /> : null}
        {manual && !coaching?.fullAccess ? (
          <Panel title={manual.endsAt ? `Full access until ${dayShort(manual.endsAt)}` : "Full access"} action={<Chip tone="success">Granted</Chip>}>
            <p className="text-[17px]">Granted by DeFi University. Nothing to pay.</p>
          </Panel>
        ) : null}
        {nothing ? (
          <Panel title={hasCourseAccess ? "Member" : "Free account"} action={<Chip>{hasCourseAccess ? "Active" : "Stage 1 open"}</Chip>}>
            <p className="text-[17px]">
              {hasCourseAccess
                ? "Your access is active."
                : "Stage 1 is open to you. The $97 membership on Skool opens all 31 courses, plus the live calls and community. Private coaching is one-on-one with David."}
            </p>
            {hasCourseAccess ? null : (
              <div className="mt-5 flex flex-wrap gap-3">
                <SkoolJoinLink location="account_billing" className="btn btn-skool">
                  Join on Skool
                </SkoolJoinLink>
                <Link href="/coaching" className="btn btn-secondary">
                  Private coaching
                </Link>
              </div>
            )}
            <p className="mt-4 text-[15px] text-[var(--color-text-muted)]">Already a member or client under another email? Add that email under Settings.</p>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
