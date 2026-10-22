import type { Metadata } from "next";
import Image from "next/image";
import { Hero } from "@/components/Hero";
import { SectionReveal } from "@/components/SectionReveal";
import { CTAButton } from "@/components/CTAButton";
import { FinalCta } from "@/components/editorial/FinalCta";
import { URLS } from "@/content/site";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
  description: `${BRAND.name}: private coaching for business owners ${BRAND.subject}.`,
};

// Placeholder copy until the founder story is written.
export default function AboutPage() {
  return (
    <>
      <Hero
        variant="home"
        eyebrow={`About ${BRAND.name}`}
        title="AI that does real work in your business."
        subtitle="One-on-one coaching that starts from your processes, not from the latest tool, and ends with workflows your team actually uses."
        primaryCta={{
          label: "Book a free call",
          href: URLS.coachingDiscovery,
          variant: "coaching",
          location: "about_hero_discovery",
        }}
        secondaryCta={{ label: "Explore coaching", href: "/coaching", location: "about_hero_private" }}
      />

      <section className="px-6 py-[var(--space-section)]">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
          <SectionReveal className="md:col-span-7">
            <div className="space-y-6 text-[length:var(--text-body)] leading-[1.7] text-[var(--color-text)]">
              <p className="drop-cap text-[length:var(--text-lead)]">
                {BRAND.name} exists for owners who know AI could save them hours every week but have not found the time to work out where
                to start.
              </p>
              <p>
                Every client starts with a free discovery call. From what you tell {BRAND.coachFirstName} about your business, you get a
                week-by-week plan: short lessons and exercises from the course library, real tasks in your own business, and a live
                session each week to review what you built.
              </p>
              <p>
                Coaching is practical and honest. We do not promise results we cannot measure, and we never ask you to put customer or
                confidential data into a tool before you have checked how it is handled.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.15} className="md:col-span-4 md:col-start-9">
            <figure className="parchment-card p-4 md:p-5">
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-surface-raised)]">
                <Image
                  src="/images/david-zimmerman.jpg"
                  alt={`${BRAND.coachName}, founder of ${BRAND.name}`}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <figcaption className="mt-4">
                <p className="ui-label">Founder</p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-2xl leading-tight text-on-parchment">{BRAND.coachName}</p>
              </figcaption>
            </figure>
          </SectionReveal>
        </div>
      </section>

      <FinalCta title="Start with a free call." intro={`Tell ${BRAND.coachFirstName} what takes up your week, and leave with a first idea of where AI fits.`}>
        <CTAButton variant="coaching" href={URLS.coachingDiscovery} location="about">
          Book a free call
        </CTAButton>
        <CTAButton variant="ghost" href="/coaching" location="about">
          Explore coaching
        </CTAButton>
      </FinalCta>
    </>
  );
}
