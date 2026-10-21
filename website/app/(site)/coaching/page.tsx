import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { CTAButton } from "@/components/CTAButton";
import { SectionReveal } from "@/components/SectionReveal";
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
import { getPackages } from "@/lib/coaching/packages";
import { JsonLd, faqNode } from "@/lib/seo/json-ld";

// Reads Firestore at render time; must not be statically pre-rendered at build
// time (no credentials available during `next build` on Cloud Build).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private 1-on-1 DeFi Coaching",
  description:
    "Private DeFi coaching with David Zimmerman. Kickstart $750, Operator $2,500, and Inner Circle $7,500. Education-only 1-on-1 process work — not portfolio management.",
  alternates: { canonical: "/coaching" },
  openGraph: {
    title: "Private 1-on-1 DeFi Coaching | DeFi University",
    description:
      "Education-only 1-on-1 DeFi process work. Kickstart, Operator, and Inner Circle, from $750. Not portfolio management.",
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
    targetCapital: p.targetCapital,
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
    "You hold your own keys, or want to learn how.",
    "You want a written process for sizing, limits, and exits.",
    "You would rather understand a protocol than follow a call.",
    "You want someone to pressure-test your thinking before you act.",
  ],
  notFor: [
    "You want signals, picks, or trade calls.",
    "You want someone to manage your money.",
    "You want a promised return.",
    "You want a shortcut instead of a process.",
  ],
} as const;

const METHOD = [
  {
    title: "Diagnose",
    body: "We map your experience, habits, and knowledge gaps into a baseline. Your positions stay yours.",
  },
  {
    title: "Build your framework",
    body: "You draft a written risk-parameter profile — sizing, limits, exit rules — and we pressure-test it. You set the numbers.",
  },
  {
    title: "Practice",
    body: "Self-custody setup, a sizing method, and a due-diligence checklist, practiced before you act.",
  },
  {
    title: "Review",
    body: "Weekly or bi-weekly sessions review what you did and why. You leave with judgment, not tips.",
  },
] as const;

const LEAVE_WITH = [
  {
    title: "Your risk-parameter profile",
    body: "A written framework you build for sizing, allocation limits, and exit rules. You set the numbers; we teach the method.",
  },
  {
    title: "Risk-framework blueprint",
    body: "Practice reading funding, liquidation distance, and sizing frameworks before you act. Education only — you keep self-custody. Not portfolio management.",
  },
  {
    title: "Smart-contract audit checklist",
    body: "A repeatable process for vetting a protocol before you deploy.",
  },
  {
    title: "Dedicated async channel",
    body: "Slack access between sessions for time-sensitive questions. No more guessing in isolation.",
  },
  {
    title: "Client portal",
    body: "Book sessions, view shared notes, download your signed contract, and track session usage.",
  },
] as const;

const STEPS = [
  {
    title: "Book a free 30-minute call",
    body: "We look at where you are, what you want to learn, and which package fits. Already decided? Enroll in Kickstart or Operator directly.",
  },
  {
    title: "Choose your package",
    body: "Kickstart and Operator check out on Stripe, in full or in installments for Operator. Inner Circle starts with a free call. Sign the coaching agreement before sessions begin.",
  },
  {
    title: "Get your portal access",
    body: "A magic link arrives in your inbox. From the portal, book your kickoff session.",
  },
  {
    title: "Begin coaching",
    body: "Weekly or every-other-week sessions depending on your package, plus async support throughout.",
  },
] as const;

const FAQS = [
  {
    question: "Is this financial advice?",
    answer:
      "No. All DeFi University coaching is educational. We do not provide financial advice, investment recommendations, or portfolio management. You remain in full custody and control of your assets at all times.",
  },
  {
    question: "Do you custody my funds?",
    answer:
      "Never. You retain full self-custody throughout the engagement. We guide setup of your own wallets and teach you to manage your own risk.",
  },
  {
    question: "What happens after I purchase?",
    answer:
      "You'll receive a contract signing link, then a client portal magic link. From the portal you book sessions, access documents, and view notes from your coach.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Kickstart and Operator offer a 14-day refund window if no sessions have been conducted. Inner Circle is non-refundable because it reserves weekly time directly with David.",
  },
  {
    question: "What if I need to reschedule?",
    answer:
      "Sessions can be rescheduled through the client portal with at least 24 hours notice. Sessions cancelled with less notice may be forfeited.",
  },
  {
    question: "Do you offer payment plans?",
    answer:
      "Yes. Every package can be paid in full, in 3 monthly payments, or in 6, by card or by crypto. Kickstart is 3 × $250 or 6 × $125, Operator is 3 × $834 or 6 × $417, and Inner Circle is 3 × $2,500 or 6 × $1,250. Crypto installments are tracked by us. Submit a transfer notice for each payment.",
  },
  {
    question: "Can I start small and upgrade later?",
    answer:
      "Yes. Start with Kickstart, and if you move up to Operator within 30 days, the full $750 counts toward it.",
  },
] as const;

const SESSION_LINE = /^\d+\s*×/;
const INHERITS_LINE = /^Everything in /;

function ownFeatures(pkg: PackageCardData): string[] {
  return pkg.features.filter((f) => !INHERITS_LINE.test(f));
}

export default async function CoachingPage() {
  const packages = await fetchPackagesForGrid();
  const institutional = packages.find((p) => p.id === "institutional");
  const mastery = packages.find((p) => p.id === "mastery");

  return (
    <>
      <JsonLd data={faqNode(FAQS)} />

      <PortraitHero
        eyebrow="Private coaching · from $750"
        title="Private DeFi coaching with David Zimmerman."
        subtitle="Private sessions on risk, protocols, and self-custody. You keep custody of everything. Start with a free 30-minute call."
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
        portraitCaption="David Zimmerman · your coach"
      />

      <section className="px-6 pb-4">
        <ul className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] font-medium text-[var(--color-text)]">
          {["Education only", "You keep custody", "Not financial advice", "Free 30-minute call"].map(
            (item) => (
              <li key={item} className="flex items-center gap-2">
                <Check size={15} strokeWidth={2.5} className="text-[var(--color-accent)]" aria-hidden="true" />
                {item}
              </li>
            )
          )}
          <li className="font-normal text-[var(--color-text-muted)] md:ml-auto">
            Full refund within 14 days if no session has been held (Kickstart and Operator).
          </li>
        </ul>
      </section>

      <section className="px-6 py-[var(--space-section)]">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            folio="01"
            eyebrow="Fit"
            title="Who it is for, and who it is not for."
            intro="Private coaching is education. It works best for people who want to own their process."
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
            intro="The difference is depth, how long you work together, and how much time you spend with David. Pay in full or in installments."
          />
          <p className="mb-10 mt-4">
            <PayNowLink href="/coaching/pay">
              Already chose a package? Pay now →
            </PayNowLink>
          </p>
          <PackageGrid packages={packages} />
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
                intro={`${institutional.sessionCount} weekly sessions with David over six months. It starts with a free call.`}
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
        aboutLocation="coaching_david_about"
        extra={<p>Every Inner Circle client works directly with David. There is no hand-off to a junior coach.</p>}
      />

      <section className="px-6 py-[var(--space-section)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            folio="09"
            eyebrow="Membership"
            title="Not ready for 1-on-1?"
            intro="The membership on Skool is $97 a month: live Q&A with David every Monday, Wednesday, and Friday, plus the courses and community. Seven days free."
          />
          <div data-sticky-guard className="shrink-0">
            <CTAButton variant="skool" href="/skool" location="coaching_exit_group">
              See the membership
            </CTAButton>
          </div>
        </div>
      </section>

      <FaqSection folio="10" title="Common questions." items={FAQS} />

      <section className="px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <p className="ui-label">Risk disclosure</p>
          <p className="mt-2 text-[length:var(--text-small)] leading-relaxed text-[var(--color-text-muted)]">
            DeFi University LLC provides educational services only. We do not provide financial,
            investment, legal, or tax advice. Digital assets are volatile and you may lose your
            entire investment. Past performance is not indicative of future results. You are solely
            responsible for your own investment decisions. All coaching is delivered on a
            self-custody basis — we never hold or control your funds.
          </p>
        </div>
      </section>

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
