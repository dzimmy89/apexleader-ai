import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { CTAButton } from "@/components/CTAButton";
import { SectionReveal } from "@/components/SectionReveal";
import { BotCareCard } from "@/components/coaching/BotCareCard";
import { PackageGrid } from "@/components/coaching/PackageGrid";
import { PayNowLink } from "@/components/coaching/PayNowLink";
import type { PackageCardData } from "@/components/coaching/PackageCard";
import { FaqSection } from "@/components/editorial/FaqSection";
import { FinalCta } from "@/components/editorial/FinalCta";
import { FounderBlock } from "@/components/editorial/FounderBlock";
import { PortraitHero } from "@/components/editorial/PortraitHero";
import { SectionHeading } from "@/components/editorial/SectionHeading";
import { StickyCta } from "@/components/editorial/StickyCta";
import { URLS } from "@/content/site";
import { BRAND } from "@/lib/brand";
import { BOT_CARE, isBotCareCheckoutOpen } from "@/lib/coaching/bot-care";
import { getPackages } from "@/lib/coaching/packages";
import { JsonLd, faqNode } from "@/lib/seo/json-ld";

// Reads Firestore at render time; must not be statically pre-rendered at build
// time (no credentials available during `next build` on Cloud Build).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private 1-on-1 AI Coaching",
  description: `Private AI coaching with ${BRAND.coachName}: learn to use AI and build with AI in your own business, one on one, with a syllabus built around your goals.`,
  alternates: { canonical: "/coaching" },
  openGraph: {
    title: `Private 1-on-1 AI Coaching | ${BRAND.name}`,
    description: "One-to-one coaching on using AI and building with AI in your own business.",
    url: "/coaching",
    type: "website",
  },
};

async function fetchPackagesForGrid(): Promise<PackageCardData[]> {
  const packages = await getPackages({ activeOnly: true });
  return packages.map((p) => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    price: p.price,
    priceDisplay: p.priceDisplay,
    durationWeeks: p.durationWeeks,
    sessionCount: p.sessionCount,
    sessionLengthMins: p.sessionLengthMins,
    requiresDiscoveryCall: p.requiresDiscoveryCall,
    applicationOnly: p.applicationOnly,
    cadence: p.cadence,
    features: p.features,
    deliverables: p.deliverables,
    bestFor: p.bestFor,
    badge: p.badge,
    paymentPlans: p.paymentPlans.map((plan) => ({
      id: plan.id,
      label: plan.label,
      installments: plan.installments,
      perPayment: plan.perPayment,
      total: plan.total,
    })),
  }));
}

const FIT = {
  for: [
    "You run a business, or a team inside one, and want AI doing real work in it.",
    "You want to build things yourself: automations, assistants, internal tools.",
    "You learn best by working on your own processes, not toy examples.",
    "You want someone to pressure-test your ideas before you spend on them.",
  ],
  notFor: [
    "You want us to build and run it for you (that is an agency).",
    "You want a list of tools without doing the work.",
    "You want a promised revenue or headcount number.",
    "You want a shortcut instead of a skill.",
  ],
} as const;

const METHOD = [
  {
    title: "Map",
    body: "We map how your business runs today and find the work AI can take off your plate first.",
  },
  {
    title: "Plan",
    body: "Your discovery call becomes a written syllabus: lessons, exercises and build projects on your own business.",
  },
  {
    title: "Build",
    body: "You build real things between sessions: prompts, workflows, automations and small internal tools.",
  },
  {
    title: "Review",
    body: "Each session reviews what you built and what to build next. You leave with the skill, not just the tools.",
  },
] as const;

const LEAVE_WITH = [
  {
    title: "A syllabus built for your business",
    body: "Drafted from your discovery call and kept up to date as you go, week by week.",
  },
  {
    title: "Working AI in your business",
    body: "Build projects on your own processes, so the work keeps paying off after coaching ends.",
  },
  {
    title: "The course library",
    body: "Every lesson, exercise and quiz in the library for the length of your coaching.",
  },
  {
    title: "A direct line between sessions",
    body: `Message ${BRAND.coachFirstName} between sessions when you get stuck.`,
  },
  {
    title: "Your client home",
    body: "Book sessions, follow your syllabus, watch recordings and download your documents in one place.",
  },
] as const;

const STEPS = [
  {
    title: "Book a free 30-minute call",
    body: "We look at your business, what you want AI to do in it, and which package fits.",
  },
  {
    title: "Choose your package",
    body: "Check out on Stripe, in full or in installments. Sign the coaching agreement before sessions begin.",
  },
  {
    title: "Get your syllabus",
    body: "Your syllabus is drafted from the call and waiting in your account, with your first session to book.",
  },
  {
    title: "Begin coaching",
    body: "Weekly or every-other-week sessions depending on your package, plus support between them.",
  },
] as const;

const FAQS = [
  {
    question: "Do I need to know how to code?",
    answer:
      "No. Most clients start with no code at all. Where code helps, we use AI to write it with you, and you learn enough to read and change it.",
  },
  {
    question: "Which AI tools do we use?",
    answer:
      "Whatever fits your business and budget. We compare options together, and you keep accounts in your own name, so nothing depends on us after coaching ends.",
  },
  {
    question: "What happens after I purchase?",
    answer:
      "You'll receive a contract signing link, then a sign-in link to your account. From there you book sessions, follow your syllabus and download documents.",
  },
  {
    question: "Can I get a refund?",
    answer: "The refund terms for each package are set out in your coaching agreement before you pay.",
  },
  {
    question: "What if I need to reschedule?",
    answer:
      "Sessions can be rescheduled from your account with at least 24 hours notice. Sessions cancelled with less notice may be forfeited.",
  },
  {
    question: `What is ${BOT_CARE.name}?`,
    answer: `A monthly plan for coaching clients, ${BOT_CARE.priceDisplay} a month. Each month we review the bots you built, fix what broke, update them when the tools change, and add new templates. Cancel any time.`,
  },
  {
    question: "Do you offer payment plans?",
    answer: "Yes. Packages can be paid in full or in monthly installments by card.",
  },
] as const;

const SESSION_LINE = /^\d+\s*×/;
const INHERITS_LINE = /^Everything in /;

function ownFeatures(pkg: PackageCardData): string[] {
  return pkg.features.filter((f) => !INHERITS_LINE.test(f));
}

export default async function CoachingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const packages = await fetchPackagesForGrid();
  const botCareStarted = (await searchParams).bot_care === "started";
  const institutional = packages.find((p) => p.id === "institutional");
  const mastery = packages.find((p) => p.id === "mastery");

  return (
    <>
      <JsonLd data={faqNode(FAQS)} />

      <PortraitHero
        eyebrow="Private AI coaching"
        title={`Private AI coaching with ${BRAND.coachName}.`}
        subtitle="One-to-one sessions on using AI and building with AI in your own business. Start with a free 30-minute call."
        primary={{
          label: "Book a free 30-minute call",
          href: URLS.coachingDiscovery,
          variant: "coaching",
          location: "hero_coaching",
        }}
        secondary={{
          label: "Compare the packages",
          href: "#packages",
          variant: "ghost",
          location: "coaching_hero_tiers",
        }}
        portraitCaption={`${BRAND.coachName} · your coach`}
      />

      <section className="px-6 pb-4">
        <ul className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] font-medium text-[var(--color-text)]">
          {["One to one", "Built around your business", "Free 30-minute call"].map(
            (item) => (
              <li key={item} className="flex items-center gap-2">
                <Check size={15} strokeWidth={2.5} className="text-[var(--color-accent)]" aria-hidden="true" />
                {item}
              </li>
            )
          )}
        </ul>
      </section>

      <section className="px-6 py-[var(--space-section)]">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            folio="01"
            eyebrow="Fit"
            title="Who it is for, and who it is not for."
            intro="Private coaching works best for people who want to build the skill themselves."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="panel">
              <div className="panel-head">
                <h3 className="text-[length:var(--text-h4)]">It fits if</h3>
              </div>
              <ul className="panel-body space-y-3.5 font-[family-name:var(--font-ui)] text-[15px] leading-snug text-[var(--color-text)]">
                {FIT.for.map((line) => (
                  <li key={line} className="flex gap-3">
                    <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel">
              <div className="panel-head">
                <h3 className="text-[length:var(--text-h4)]">It is not for you if</h3>
              </div>
              <ul className="panel-body space-y-3.5 font-[family-name:var(--font-ui)] text-[15px] leading-snug text-[var(--color-text)]">
                {FIT.notFor.map((line) => (
                  <li key={line} className="flex gap-3">
                    <X size={16} className="mt-0.5 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-[var(--space-section)]">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            folio="02"
            eyebrow="The method"
            title="Four steps, repeated until they are yours."
          />
          <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {METHOD.map((step, i) => (
              <li key={step.title} className="panel p-6">
                <p className="font-[family-name:var(--font-display)] text-[1.75rem] leading-none text-[var(--color-accent)] tabular-nums md:text-4xl">
                  {`0${i + 1}`}
                </p>
                <h3 className="mt-4 text-[length:var(--text-h4)] text-[var(--color-text)]">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-text-muted)]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="packages" className="px-6 py-[var(--space-section)]">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            folio="04"
            eyebrow="Packages"
            title="Three packages. Every one is private 1-on-1."
            intro={`The difference is depth, how long you work together, and how much time you spend with ${BRAND.coachFirstName}. Pay in full or in installments.`}
          />
          <p className="mb-10 mt-4">
            <PayNowLink href="/coaching/pay">
              Already chose a package? Pay now →
            </PayNowLink>
          </p>
          <PackageGrid packages={packages} />
          <div id="bot-care" className="mt-16 scroll-mt-24">
            <h3 className="text-[length:var(--text-h3)] text-[var(--color-text)]">After your package</h3>
            <p className="mb-6 mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--color-text-muted)]">
              The bots you build keep running after coaching ends. {BOT_CARE.name} keeps them working as your business and the tools change.
            </p>
            <BotCareCard plan={BOT_CARE} checkoutOpen={isBotCareCheckoutOpen()} started={botCareStarted} />
          </div>
        </div>
      </section>

      <section className="px-6 py-[var(--space-section)]">
        <div className="mx-auto max-w-6xl">
          <SectionHeading folio="05" eyebrow="What you get" title="What you leave with." />
          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {LEAVE_WITH.map((item) => (
              <div key={item.title} className="flex gap-3">
                <Check size={18} strokeWidth={2.5} className="mt-1 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
                <div>
                  <h3 className="text-[length:var(--text-h4)] text-[var(--color-text)]">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-text-muted)]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-[var(--space-section)]">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            folio="06"
            eyebrow="How it works"
            title="From discovery call to first session in under a week."
          />
          <ol className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <p className="section-eyebrow">{`Step ${i + 1}`}</p>
                <h3 className="mt-3 text-[length:var(--text-h4)] text-[var(--color-text)]">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-text-muted)]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {institutional ? (
        <section className="px-6 py-[var(--space-section)]">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <SectionHeading
                folio="07"
                eyebrow="Inner Circle, itemized"
                title={`What ${institutional.priceDisplay} covers.`}
                intro={`${institutional.sessionCount} sessions with ${BRAND.coachFirstName}. It starts with a free call.`}
              />
              <div data-sticky-guard className="mt-8">
                <CTAButton
                  variant="coaching"
                  href={`${URLS.coachingDiscovery}?packageId=${institutional.id}`}
                  location="coaching_institutional_call"
                >
                  Book a free 30-minute call
                </CTAButton>
              </div>
            </div>
            <div className="md:col-span-7">
              <SectionReveal>
                <div className="parchment-card p-6 md:p-8">
                  <p className="ui-label">{institutional.name} adds</p>
                  <ul className="mt-3 space-y-2.5 font-[family-name:var(--font-ui)] text-[15px] leading-snug">
                    {ownFeatures(institutional).map((item) => (
                      <li key={item} className="flex gap-3">
                        <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[var(--color-coaching-ink)]" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {mastery ? (
                    <>
                      <p className="ui-label mt-8">Plus everything in {mastery.name}</p>
                      <ul className="mt-3 space-y-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] leading-snug text-muted-on-parchment">
                        {ownFeatures(mastery)
                          .filter((item) => !SESSION_LINE.test(item))
                          .map((item) => (
                            <li key={item} className="flex gap-3">
                              <Check size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                              {item}
                            </li>
                          ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              </SectionReveal>
            </div>
          </div>
        </section>
      ) : null}

      <FounderBlock
        folio="08"
        eyebrow="Your coach"
        aboutLocation="coaching_coach_about"
        extra={<p>Every client works directly with {BRAND.coachFirstName}. There is no hand-off to a junior coach.</p>}
      />

      <FaqSection folio="09" title="Common questions." items={FAQS} />

      <FinalCta
        title="Start with a 30-minute conversation."
        intro="Book a free call and find out which package fits. No pressure, no obligation — just a clear-eyed conversation about where you are and where you want to go."
      >
        <CTAButton variant="coaching" href={URLS.coachingDiscovery} location="coaching_final_cta">
          Book a free 30-minute call
        </CTAButton>
        <CTAButton variant="ghost" href="#packages" location="coaching_final_cta_secondary">
          Compare the packages
        </CTAButton>
      </FinalCta>

      <StickyCta
        page="coaching"
        location="coaching_sticky_discovery"
        label="Book a free 30-minute call"
        href={URLS.coachingDiscovery}
        variant="coaching"
        note="Free · 30 minutes · no obligation"
      />
    </>
  );
}
