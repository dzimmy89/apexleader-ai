import Image from "next/image";
import { CTAButton } from "@/components/CTAButton";
import { FOUNDER_PORTRAIT, PortraitFrame } from "./PortraitFrame";

export type HeroCta = {
  label: string;
  href: string;
  variant: "skool" | "coaching" | "ghost";
  location: string;
  external?: boolean;
  skoolPlanId?: string;
  skoolValue?: number;
};

function HeroButton({ cta }: { cta: HeroCta }) {
  return (
    <CTAButton
      variant={cta.variant}
      href={cta.href}
      location={cta.location}
      external={cta.external}
      skoolPlanId={cta.skoolPlanId}
      skoolValue={cta.skoolValue}
    >
      {cta.label}
    </CTAButton>
  );
}

/**
 * Marketing hero. The H1 is the biggest thing on the screen, the subhead is
 * full-contrast reading text, and there is one filled primary action plus one
 * outlined secondary. Everything is in the server HTML; `.load-rise` only
 * translates, so nothing starts invisible.
 */
export function PortraitHero({
  eyebrow,
  title,
  subtitle,
  primary,
  secondary,
  portraitCaption,
  aside,
  footnote,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  primary: HeroCta;
  secondary?: HeroCta;
  portraitCaption: string;
  aside?: React.ReactNode;
  footnote?: React.ReactNode;
}) {
  return (
    <section className="px-6 pb-[var(--space-block)] pt-10 md:pt-20">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12 md:items-center">
        <div className="md:col-span-7">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <span className="block h-14 w-12 shrink-0 overflow-hidden border border-[var(--color-border-strong)]">
              <Image
                src={FOUNDER_PORTRAIT.src}
                alt=""
                width={96}
                height={120}
                sizes="48px"
                className="h-full w-full object-cover"
              />
            </span>
            <span className="font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] font-medium text-[var(--color-text-muted)]">
              {portraitCaption}
            </span>
          </div>
          <p className="section-eyebrow load-rise">{eyebrow}</p>
          <h1
            className="load-rise mt-4 text-[length:var(--text-display)] text-[var(--color-text)]"
            style={{ "--load-delay": "80ms" } as React.CSSProperties}
          >
            {title}
          </h1>
          <p
            className="load-rise mt-6 max-w-xl text-[length:var(--text-lead)] leading-[1.55] text-[var(--color-text)]"
            style={{ "--load-delay": "260ms" } as React.CSSProperties}
          >
            {subtitle}
          </p>
          <div
            data-sticky-guard
            className="load-rise mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
            style={{ "--load-delay": "360ms" } as React.CSSProperties}
          >
            <HeroButton cta={primary} />
            {secondary ? <HeroButton cta={secondary} /> : null}
          </div>
          {aside ? <div className="mt-8">{aside}</div> : null}
          {footnote ? (
            <p className="mt-6 max-w-xl font-[family-name:var(--font-ui)] text-[length:var(--text-small)] leading-relaxed text-[var(--color-text-muted)]">
              {footnote}
            </p>
          ) : null}
        </div>
        <div className="hidden md:col-span-5 md:block lg:col-span-4 lg:col-start-9">
          <PortraitFrame eager reveal caption={portraitCaption} />
        </div>
      </div>
    </section>
  );
}
