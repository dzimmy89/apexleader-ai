import { CTAButton } from "./CTAButton";
import { HeroTitle } from "./HeroTitle";

type Variant = "home" | "skool" | "coaching";

interface HeroProps {
  variant?: Variant;
  eyebrow?: string;
  title: string;
  subtitle: string;
  /** `location` overrides the default `hero_<variant>` analytics location. */
  primaryCta?: { label: string; href: string; variant: "skool" | "coaching"; location?: string };
  /** `location` overrides the default `hero_secondary_<variant>` analytics location. */
  secondaryCta?: { label: string; href: string; location?: string };
}

/**
 * Text hero (About, University): eyebrow, the H1, one line of full-contrast
 * reading text, then one filled primary action and one outlined secondary.
 */
export function Hero({
  variant = "home",
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  return (
    <section className="px-6 pb-[var(--space-block)] pt-14 md:pt-24">
      <div className="mx-auto max-w-6xl">
        {eyebrow && <p className="section-eyebrow load-rise mb-5">{eyebrow}</p>}
        <HeroTitle title={title} />
        <p
          className="load-rise mt-7 max-w-2xl text-left text-[length:var(--text-lead)] leading-[1.55] text-pretty text-[var(--color-text)]"
          style={{ "--load-delay": "260ms" } as React.CSSProperties}
        >
          {subtitle}
        </p>

        {(primaryCta || secondaryCta) && (
          <div
            data-sticky-guard
            className="load-rise mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
            style={{ "--load-delay": "360ms" } as React.CSSProperties}
          >
            {primaryCta ? (
              <CTAButton
                variant={primaryCta.variant}
                href={primaryCta.href}
                location={primaryCta.location ?? `hero_${variant}`}
                external={primaryCta.href.startsWith("http")}
              >
                {primaryCta.label}
              </CTAButton>
            ) : null}
            {secondaryCta && (
              <CTAButton
                variant="ghost"
                href={secondaryCta.href}
                location={secondaryCta.location ?? `hero_secondary_${variant}`}
              >
                {secondaryCta.label}
              </CTAButton>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
