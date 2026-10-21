import type { Metadata } from "next";
import Image from "next/image";
import { Hero } from "@/components/Hero";
import { SectionReveal } from "@/components/SectionReveal";
import { CTAButton } from "@/components/CTAButton";
import { FinalCta } from "@/components/editorial/FinalCta";
import { URLS } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
  description:
    "DeFi University LLC — structured blockchain education for serious learners. Education only, not financial advice.",
};

export default function AboutPage() {
  return (
    <>
      <Hero
        variant="home"
        eyebrow="About DeFi University"
        title="Education built for understanding."
        subtitle="We teach blockchain technology fundamentals, risk management, and protocol analysis — not speculation or guaranteed outcomes."
        primaryCta={{
          label: "Join the community ↗",
          href: URLS.skoolPlans,
          variant: "skool",
          location: "about_hero_membership",
        }}
        secondaryCta={{ label: "Explore coaching", href: "/coaching", location: "about_hero_private" }}
      />

      <section className="px-6 py-[var(--space-section)]">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
          <SectionReveal className="md:col-span-7">
            <div className="space-y-6 text-[length:var(--text-body)] leading-[1.7] text-[var(--color-text)]">
              <p className="drop-cap text-[length:var(--text-lead)]">
                DeFi University LLC was founded to fill a gap in blockchain education: structured, live instruction that builds genuine technical understanding.
              </p>
              <p>
                Our community is on Skool with one membership at $97 a month, which includes live Q&A with David every Monday, Wednesday, and Friday. Structured University courses provide supplementary self-paced content. For learners who want personalized guidance, private coaching runs from Kickstart at $750 to Inner Circle at $7,500, and anyone can start with a free call.
              </p>
              <p>
                We are educators, not financial advisors. Everything we teach is for informational and educational purposes. We make no guarantees about financial outcomes — our focus is on building knowledge you can apply responsibly.
              </p>
              <p>
                Sessions cover protocol mechanics, security best practices, and risk frameworks. We do not publish unverified headcounts or session totals.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.15} className="md:col-span-4 md:col-start-9">
            <figure className="parchment-card p-4 md:p-5">
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-surface-raised)]">
                <Image
                  src="/images/david-zimmerman.jpg"
                  alt="David Zimmerman, founder of DeFi University"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <figcaption className="mt-4">
                <p className="ui-label">Founder</p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-2xl leading-tight text-on-parchment">
                  David Zimmerman
                </p>
              </figcaption>
            </figure>
          </SectionReveal>
        </div>
      </section>

      <FinalCta
        title="Pick your way in."
        intro="Join the membership on Skool, or talk to David about 1-on-1. Education only — not financial advice."
      >
        <CTAButton variant="skool" href={URLS.skoolPlans} location="about" external>
          Join the community ↗
        </CTAButton>
        <CTAButton variant="ghost" href="/coaching" location="about">
          Explore coaching
        </CTAButton>
      </FinalCta>
    </>
  );
}
