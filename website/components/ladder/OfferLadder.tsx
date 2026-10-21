import { Check } from "lucide-react";
import { CTAButton } from "@/components/CTAButton";
import { offerLadder, URLS, type LadderRung } from "@/content/site";
import { cn } from "@/lib/utils";

/** The rung that gets the parchment card, the chip and the one filled button. */
const RECOMMENDED: LadderRung["id"] = "membership";

function RungCta({
  rung,
  location,
  recommended,
}: {
  rung: LadderRung;
  location: string;
  recommended: boolean;
}) {
  const cta = rung.cta;
  const surface = recommended ? "parchment" : "dark";
  switch (cta.kind) {
    case "skool":
      return (
        <CTAButton
          variant="skool"
          surface={surface}
          href={URLS.skoolPlans}
          external
          location={location}
          skoolPlanId={cta.planId}
          skoolValue={cta.value}
          className="w-full"
        >
          {cta.label}
        </CTAButton>
      );
    case "link":
      return (
        <CTAButton
          // One filled button on the recommended rung; the others are outlined.
          variant={recommended ? cta.variant : "ghost"}
          track={cta.variant === "coaching" ? "coaching" : "internal"}
          surface={surface}
          href={cta.href}
          location={location}
          className="w-full"
        >
          {cta.label}
        </CTAButton>
      );
    default: {
      const unhandled: never = cta;
      return unhandled;
    }
  }
}

/**
 * Three rungs (free, membership, private coaching). Each is a panel: the
 * name in serif, the price as a big numeral with a small label, a sans list
 * with check marks, and one button. The recommended rung is the screen's
 * parchment card.
 */
export function OfferLadder({ locationPrefix }: { locationPrefix: string }) {
  return (
    <ol className="grid gap-4 md:grid-cols-3 md:gap-5">
      {offerLadder.map((rung) => {
        const recommended = rung.id === RECOMMENDED;
        return (
          <li
            key={rung.id}
            className={cn("flex flex-col p-6 md:p-7", recommended ? "parchment-card" : "panel")}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[1.625rem]">{rung.label}</h3>
              {recommended ? <span className="chip chip-success shrink-0">Most popular</span> : null}
            </div>
            <p className="stat mt-5">
              <span
                className={cn(
                  "stat-value text-[2.5rem] tabular-nums",
                  recommended && "text-[var(--color-text-on-parchment)]"
                )}
              >
                {rung.price}
              </span>
              <span
                className={cn("stat-label", recommended && "text-[var(--color-text-muted-on-parchment)]")}
              >
                {rung.priceNote}
              </span>
            </p>
            <p className="mt-5 text-[length:var(--text-body)] leading-[1.6]">{rung.forYou}</p>
            <ul className="mt-5 flex-1 space-y-2.5 font-[family-name:var(--font-ui)] text-[15px] leading-snug">
              {rung.includes.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check
                    size={16}
                    strokeWidth={2.5}
                    className={cn(
                      "mt-0.5 shrink-0",
                      recommended ? "text-[var(--color-skool-ink)]" : "text-[var(--color-accent)]"
                    )}
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <RungCta rung={rung} location={`${locationPrefix}_${rung.id}`} recommended={recommended} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
