import { Check } from "lucide-react";
import { CTAButton } from "./CTAButton";
import { URLS, SKOOL_TRIAL_DAYS, type MembershipPlan } from "@/content/site";

type Props = {
  plan: MembershipPlan;
};

/** The membership plan: the screen's parchment card, with one filled button. */
export function PricingCard({ plan }: Props) {
  return (
    <div className="parchment-card flex h-full flex-col p-7 md:p-9">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[1.625rem]">{plan.name}</h3>
        <span className="chip chip-success shrink-0">{SKOOL_TRIAL_DAYS} days free</span>
      </div>

      <p className="stat mt-5">
        <span className="stat-value text-[3rem] tabular-nums text-[var(--color-text-on-parchment)]">
          {plan.priceDisplay}
        </span>
        <span className="stat-label text-[var(--color-text-muted-on-parchment)]">
          per month on Skool, after the free trial
        </span>
      </p>
      <p className="mt-4 text-[length:var(--text-body)] leading-[1.6]">{plan.summary}</p>

      <ul className="mt-6 flex-1 space-y-3 font-[family-name:var(--font-ui)] text-[15px] leading-snug">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check
              size={16}
              strokeWidth={2.5}
              className="mt-0.5 shrink-0 text-[var(--color-skool-ink)]"
              aria-hidden="true"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <CTAButton
          variant="skool"
          surface="parchment"
          href={URLS.skoolPlans}
          location={`pricing_card_${plan.id}`}
          external
          className="w-full"
          skoolValue={plan.price}
          skoolPlanId={plan.id}
        >
          Start your free week ↗
        </CTAButton>
      </div>
    </div>
  );
}
