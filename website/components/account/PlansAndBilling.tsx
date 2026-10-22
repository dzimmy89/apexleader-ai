import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { ManageCardButton } from "@/components/account/ManageCardButton";
import { Chip, Notice, Panel, Stat } from "@/components/system";
import type { BillingSummary, CoachingPlan } from "@/lib/account/billing";
import { dayShort } from "@/lib/account/dates";
import { formatUsdCents } from "@/lib/coaching/payments";

const METHOD_LABEL = { stripe: "Card", manual: "Bank transfer or invoice" } as const;

function planLine(c: CoachingPlan): string {
  if (c.fullAccess && !c.payments.length) return `Granted by ${BRAND.name}. Nothing to pay.`;
  if (c.installments <= 1) return c.payments.length ? "Paid in full." : "Paid in full, or payment not recorded yet.";
  return `${c.installments} monthly payments, ${c.installmentsPaid} of ${c.installments} paid.`;
}

function CoachingCard({ coaching: c }: { coaching: CoachingPlan }) {
  const owesManual = c.method === "manual" && c.nextDue;
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
      {owesManual && nextDueLabel ? (
        <Notice tone="warning" title={nextDueLabel} className="mt-4">
          Pay the way we agreed, then email <a href={`mailto:${BRAND.email}`} className="underline underline-offset-4">{BRAND.email}</a> so we can mark it paid.
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
      <p className="mt-5 text-[14px] text-[var(--color-text-muted)]">Questions about a payment: {BRAND.email}.</p>
    </Panel>
  );
}

/** "Plans and billing" on /account. */
export function PlansAndBilling({ billing, hasCourseAccess }: { billing: BillingSummary; hasCourseAccess: boolean }) {
  const { coaching, manual } = billing;
  const nothing = !coaching && !manual;
  return (
    <div id="billing" className="space-y-6">
      <div>
        <p className="section-eyebrow">Billing</p>
        <h2 className="mt-2 text-[length:var(--text-h2)] leading-[1.08]">Plans and billing</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 md:[&>*:only-child]:col-span-2">
        {coaching ? <CoachingCard coaching={coaching} /> : null}
        {manual && !coaching?.fullAccess ? (
          <Panel title={manual.endsAt ? `Full access until ${dayShort(manual.endsAt)}` : "Full access"} action={<Chip tone="success">Granted</Chip>}>
            <p className="text-[17px]">Granted by {BRAND.name}. Nothing to pay.</p>
          </Panel>
        ) : null}
        {nothing ? (
          <Panel title={hasCourseAccess ? "Client" : "Free account"} action={<Chip>{hasCourseAccess ? "Active" : "Free"}</Chip>}>
            <p className="text-[17px]">
              {hasCourseAccess
                ? "Your access is active."
                : `Private coaching is one-on-one with ${BRAND.coachFirstName}, and it opens the course library for the coaching period.`}
            </p>
            {hasCourseAccess ? null : (
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/coaching" className="btn btn-primary">
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
