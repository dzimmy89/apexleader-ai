import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { CTAButton } from "@/components/CTAButton";
import { StickyCta } from "@/components/editorial/StickyCta";
import { NextOpenings } from "@/components/home/NextOpenings";
import { PORTFOLIO } from "@/content/portfolio";
import { URLS } from "@/content/site";
import { BRAND } from "@/lib/brand";
import { getPackages, isPublicPlan, type CoachingPackage } from "@/lib/coaching/packages";
import { JsonLd, faqNode } from "@/lib/seo/json-ld";

// Prices come from the live coaching packages (Firestore), so the page is
// rendered on request; the build has no database credentials.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${BRAND.name}: run your business with an AI team` },
  description: `${BRAND.coachName} sets up an AI team in your business with you. Book a free 30-minute call and leave with a written one-page AI plan, whether or not you hire him.`,
  alternates: { canonical: "/" },
};

/**
 * The homepage has one job: get a visitor to pick a time for the free call.
 * Every section answers one question a buyer has before booking, in order:
 * what is this and who is it (hero), is he real (proof bar), does he get my
 * problem (pains), what happens on the call, what does the result look like,
 * what does it cost, who will I talk to, what about my doubts, then the ask
 * again. The course stays one quiet link at the end.
 */

const PAINS = [
  {
    quote: "I pay for four AI tools and really use one.",
    body: "Every tool promises to save time. Without a plan for which job each one does, they become more tabs.",
    fix: "On the call we pick one job and the one tool for it.",
  },
  {
    quote: "Sunday night is invoices and receipts.",
    body: "Admin eats the hours you should spend selling or resting, and it is the easiest work to hand to an agent.",
    fix: "On the call we map what an AI bookkeeper can take.",
  },
  {
    quote: "Leads go cold because I reply three days later.",
    body: "One person can't answer every message fast. An AI assistant can draft the reply in minutes for your OK.",
    fix: "On the call we sketch your follow-up agent.",
  },
] as const;

const CALL_STEPS = [
  {
    when: "Before · 2 minutes",
    title: "A short prep guide",
    body: "After you book you get a few questions to think about, so the call starts on your business and not on small talk.",
  },
  {
    when: "On the call · 30 minutes",
    title: "We map your week",
    body: "We find the jobs AI can take, pick the first one and choose the tools. If coaching fits, I'll say which package and why.",
  },
  {
    when: "After · yours to keep",
    title: "A written one-page AI plan",
    body: "Emailed to you after the call: the first agent to set up, the tools and the steps. Use it with me or on your own.",
    keep: true,
  },
] as const;

const BRIEF = [
  { who: "Accounting", what: "Chased 3 overdue invoices", value: "$1,840" },
  { who: "Accounting", what: "Filed and matched receipts", value: "14" },
  { who: "Sales", what: "New leads from the weekend", value: "5" },
  { who: "Marketing", what: "Posts scheduled this week", value: "4" },
  { who: "Chief of staff", what: "Cash runway at current pace", value: "11 wks" },
] as const;

const PROOF_SLUGS = ["the-node", "we-like-food", "omnifolio", "zins"];

const HOME_FAQ = [
  {
    question: "Do I need to be technical?",
    answer:
      "No. Most clients start with chat assistants and no-code tools. If you write code, the plan goes further.",
  },
  {
    question: "Is the call a sales pitch?",
    answer:
      "It is a working session on your business. If coaching fits, I'll say which package and why. If it doesn't, you still get the written plan.",
  },
  {
    question: "Why is the call recorded?",
    answer:
      "So I can listen instead of taking notes, and so your written plan is built from what you said. The recording is used for your plan and nothing else, and you can ask me not to record.",
  },
  {
    question: "Which AI tools will we use?",
    answer:
      "The ones that fit the job: Claude, Gemini, Grok bots, Cursor, Codex and others. We pick by task, not by hype.",
  },
  {
    question: "How much time does coaching take each week?",
    answer:
      "Plan on the session plus two to three hours of building. The point is to get hours back quickly.",
  },
  {
    question: "Do you guarantee results?",
    answer:
      "No. We measure how long a job takes before and after so you can see what changed. Results depend on your business and how you apply the work.",
  },
] as const;

function planNote(pkg: CoachingPackage): string | null {
  const plans = pkg.paymentPlans.filter(isPublicPlan).filter((p) => p.installments > 1);
  if (plans.length === 0) return null;
  const longest = plans.reduce((a, b) => (b.installments > a.installments ? b : a));
  const each = longest.perPayment.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: longest.perPayment % 1 === 0 ? 0 : 2,
  });
  return `or ${longest.installments} × ${each}`;
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="section-eyebrow">{children}</p>;
}

export default async function HomePage() {
  const packages = await getPackages({ activeOnly: true });
  const recommendedId =
    packages.find((p) => p.badge)?.id ?? packages[Math.min(1, packages.length - 1)]?.id;
  const proof = PROOF_SLUGS.map((slug) => PORTFOLIO.find((b) => b.slug === slug)).filter(
    (b): b is NonNullable<typeof b> => Boolean(b)
  );

  return (
    <>
      <JsonLd data={faqNode(HOME_FAQ)} />

      {/* Hero: the result, the person, the times. */}
      <section data-sticky-guard className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-14 pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:pb-20 lg:pt-20">
          <div>
            <h1 className="text-[length:var(--text-display)] leading-[1.02] text-[var(--color-text)]">
              Run your business with an AI team.{" "}
              <span className="signal-text">I&apos;ll set it up with you.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[length:var(--text-lead)] leading-[1.6] text-[var(--color-text-muted)]">
              I&apos;m {BRAND.coachName}. I run my own businesses on Claude, Gemini, Grok bots and
              coding agents. On a{" "}
              <strong className="font-semibold text-[var(--color-text)]">free 30-minute call</strong>{" "}
              we find the work in your week that AI should take first, and you leave with{" "}
              <strong className="font-semibold text-[var(--color-text)]">a written plan</strong>,
              whether or not you hire me.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTAButton
                href={`${URLS.coachingDiscovery}?source=home_hero`}
                size="lg"
                location="hero_home_call"
              >
                Pick a time for your free call
              </CTAButton>
              <CTAButton href="#the-call" variant="ghost" size="lg" track="internal" location="hero_home_how">
                What happens on the call
              </CTAButton>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
              {["30 minutes on Google Meet", "No pitch deck", "Written plan emailed after"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check size={15} className="text-[var(--color-positive)]" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <figure className="mt-8 flex max-w-xl items-center gap-4 border-t border-[var(--color-border-muted)] pt-6">
              <Image
                src="/images/david-zimmerman-studio.jpg"
                alt=""
                width={96}
                height={120}
                className="h-12 w-12 shrink-0 rounded-full object-cover object-top"
              />
              <blockquote className="font-[family-name:var(--font-ui)] text-[length:var(--text-ui)] leading-snug text-[var(--color-text-muted)]">
                <span className="font-semibold text-[var(--color-text)]">
                  &ldquo;One call should turn &lsquo;I should use AI&rsquo; into a plan you can
                  start on Monday.&rdquo;
                </span>{" "}
                {BRAND.coachFirstName}
              </blockquote>
            </figure>
          </div>

          <div
            id="book"
            className="panel scroll-mt-28 rounded-[var(--radius-lg)] p-6 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]"
          >
            <div className="flex items-center gap-4">
              <Image
                src="/images/david-zimmerman-studio.jpg"
                alt={`${BRAND.coachName}, founder of ${BRAND.name}`}
                width={112}
                height={140}
                priority
                className="h-14 w-14 shrink-0 rounded-full object-cover object-top"
              />
              <div>
                <h2 className="text-lg text-[var(--color-text)]">Free call with {BRAND.coachFirstName}</h2>
                <p className="font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
                  30 min · Google Meet · free
                </p>
              </div>
            </div>
            <p className="mono-label mt-5 flex items-center gap-2 text-[var(--color-positive)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-positive)]" aria-hidden />
              Next open times on {BRAND.coachFirstName}&apos;s calendar
            </p>
            <NextOpenings className="mt-4" location="home_hero" />
          </div>
        </div>
      </section>

      {/* Proof bar */}
      <section className="border-y border-[var(--color-border-muted)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <p className="mono-label">Businesses {BRAND.coachFirstName} built and runs this way</p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 font-[family-name:var(--font-display)] text-[1.0625rem] font-bold text-[var(--color-text-muted)]">
            {proof.map((b) => (
              <li key={b.slug}>
                <Link href={`/portfolio/${b.slug}`} className="transition-colors hover:text-[var(--color-text)]">
                  {b.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/portfolio"
                className="font-[family-name:var(--font-ui)] text-[length:var(--text-small)] font-medium text-[var(--color-accent)] underline-offset-4 hover:underline"
              >
                See the portfolio
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Pains */}
      <section className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
        <Kicker>Sound familiar?</Kicker>
        <h2 className="mt-3 max-w-3xl text-[length:var(--text-h2)] text-[var(--color-text)]">
          You know AI could run half your week. It isn&apos;t yet.
        </h2>
        <ul className="mt-10 grid border-t border-[var(--color-border)] md:grid-cols-3">
          {PAINS.map((pain, i) => (
            <li
              key={pain.quote}
              className={`flex flex-col gap-3 py-7 md:pr-7 ${
                i > 0
                  ? "border-t border-[var(--color-border-muted)] md:border-l md:border-t-0 md:pl-7"
                  : ""
              }`}
            >
              <p className="font-[family-name:var(--font-display)] text-[1.3125rem] font-semibold leading-snug text-[var(--color-text)]">
                &ldquo;{pain.quote}&rdquo;
              </p>
              <p className="font-[family-name:var(--font-ui)] text-[length:var(--text-ui)] text-[var(--color-text-muted)]">
                {pain.body}
              </p>
              <p className="font-[family-name:var(--font-ui)] text-[length:var(--text-small)] font-medium text-[var(--color-positive)]">
                {pain.fix}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* The call */}
      <section id="the-call" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-[var(--space-section)]">
        <Kicker>The free call</Kicker>
        <h2 className="mt-3 max-w-3xl text-[length:var(--text-h2)] text-[var(--color-text)]">
          Thirty minutes, and you leave with a plan.
        </h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {CALL_STEPS.map((step) => {
            const keep = "keep" in step && step.keep;
            return (
              <li
                key={step.title}
                className={`flex flex-col gap-2.5 rounded-[var(--radius-lg)] p-7 ${
                  keep ? "parchment-card" : "panel"
                }`}
              >
                <span
                  className={`mono-label ${keep ? "text-[var(--color-coaching-ink)]" : ""}`}
                >
                  {step.when}
                </span>
                <h3 className={`text-[1.3125rem] ${keep ? "" : "text-[var(--color-text)]"}`}>{step.title}</h3>
                <p
                  className={`font-[family-name:var(--font-ui)] text-[length:var(--text-ui)] ${
                    keep ? "text-[var(--color-text-muted-on-parchment)]" : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CTAButton href={`${URLS.coachingDiscovery}?source=home_call_steps`} location="home_call_steps">
            Book the free call
          </CTAButton>
          <p className="font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-faint)]">
            The call is recorded so your plan is built from what you said.
          </p>
        </div>
      </section>

      {/* The result, shown */}
      <section className="mx-auto max-w-6xl px-6 pb-[var(--space-section)]">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
          <div>
            <Kicker>What it looks like after</Kicker>
            <h2 className="mt-3 text-[length:var(--text-h2)] text-[var(--color-text)]">
              Monday at 7am, your AI team has already started.
            </h2>
            <p className="mt-5 font-[family-name:var(--font-ui)] text-[length:var(--text-body)] text-[var(--color-text-muted)]">
              This is the brief a coached owner gets each Monday. Agents chase invoices, file
              receipts and draft replies. You approve what matters, in one place.
            </p>
            <p className="mt-4 font-[family-name:var(--font-ui)] text-[length:var(--text-body)] text-[var(--color-text-muted)]">
              Rolling Ledger is the example business we build in the course: a one-person
              bookkeeping service for food trucks.
            </p>
          </div>
          <figure>
            <div className="parchment-card rounded-[var(--radius-lg)] p-6 shadow-[0_40px_70px_-40px_rgb(0_0_0/0.8)] md:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--color-border-on-parchment)] pb-3">
                <p className="font-[family-name:var(--font-display)] text-[1.1875rem] font-bold">
                  Rolling Ledger · Monday brief
                </p>
                <p className="mono-label text-[var(--color-text-muted-on-parchment)]">Mon 7:02 am</p>
              </div>
              <dl className="mt-4 grid gap-2.5">
                {BRIEF.map((row) => (
                  <div
                    key={row.what}
                    className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 sm:grid-cols-[7.5rem_1fr_auto]"
                  >
                    <span className="mono-label col-span-2 text-[var(--color-text-muted-on-parchment)] sm:col-span-1">
                      {row.who}
                    </span>
                    <dt className="font-[family-name:var(--font-ui)] text-[length:var(--text-ui)]">{row.what}</dt>
                    <dd className="font-[family-name:var(--font-mono)] text-[length:var(--text-small)] tabular-nums">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--color-coaching-subtle)] px-3.5 py-2.5 font-[family-name:var(--font-ui)] text-[length:var(--text-small)]">
                <span className="font-semibold">2 follow-up emails are waiting for your OK</span>
                <span className="shrink-0 rounded-full bg-[var(--color-text-on-parchment)] px-3 py-1 text-[length:var(--text-label)] font-semibold text-[var(--color-surface)]">
                  Review
                </span>
              </div>
            </div>
            <figcaption className="mono-label mt-3 normal-case tracking-normal">
              Example business. Figures are illustrative.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-[var(--space-section)]">
        <Kicker>Coaching</Kicker>
        <h2 className="mt-3 max-w-3xl text-[length:var(--text-h2)] text-[var(--color-text)]">
          {packages.length === 3 ? "Three ways" : "Ways"} to work together. Every one starts with the free call.
        </h2>
        <ul data-sticky-guard className="mt-10 grid gap-5 lg:grid-cols-3">
          {packages.map((pkg) => {
            const recommended = pkg.id === recommendedId;
            const note = planNote(pkg);
            return (
              <li
                key={pkg.id}
                className={`relative flex flex-col gap-4 rounded-[var(--radius-lg)] border p-7 ${
                  recommended
                    ? "border-[var(--color-accent)] bg-[var(--color-panel)]"
                    : "border-[var(--color-border)]"
                }`}
              >
                {recommended ? (
                  <span className="mono-label absolute -top-3 left-7 rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-[var(--color-bg)]">
                    Recommended
                  </span>
                ) : null}
                <h3 className="text-[1.375rem] text-[var(--color-text)]">{pkg.name}</h3>
                <p className="flex flex-wrap items-baseline gap-x-2.5">
                  <span className="font-[family-name:var(--font-display)] text-[2.5rem] font-extrabold leading-none tracking-tight tabular-nums text-[var(--color-text)]">
                    {pkg.priceDisplay}
                  </span>
                  {note ? (
                    <span className="font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-faint)]">
                      {note}
                    </span>
                  ) : null}
                </p>
                <p className="font-[family-name:var(--font-ui)] text-[length:var(--text-ui)] text-[var(--color-text-muted)]">
                  {pkg.tagline}
                </p>
                <ul className="grid flex-1 content-start gap-2 font-[family-name:var(--font-ui)] text-[length:var(--text-ui)] text-[var(--color-text)]">
                  <li className="flex gap-2">
                    <Check size={16} className="mt-1 shrink-0 text-[var(--color-positive)]" aria-hidden />
                    {pkg.sessionCount} private sessions over {pkg.durationWeeks} weeks
                  </li>
                  {pkg.deliverables.slice(0, 2).map((d) => (
                    <li key={d} className="flex gap-2">
                      <Check size={16} className="mt-1 shrink-0 text-[var(--color-positive)]" aria-hidden />
                      {d}
                    </li>
                  ))}
                  {pkg.bestFor ? (
                    <li className="mt-1 text-[length:var(--text-small)] text-[var(--color-text-muted)]">
                      Best for: {pkg.bestFor.charAt(0).toLowerCase() + pkg.bestFor.slice(1)}
                    </li>
                  ) : null}
                </ul>
                <CTAButton
                  href={`${URLS.coachingDiscovery}?packageId=${pkg.id}&source=home_pricing`}
                  variant={recommended ? "coaching" : "ghost"}
                  track="coaching"
                  location={`home_pricing_${pkg.id}`}
                  className="w-full"
                >
                  Talk about {pkg.name}
                </CTAButton>
              </li>
            );
          })}
        </ul>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
          <li>
            <strong className="font-semibold text-[var(--color-text)]">14-day full refund</strong> if you
            change your mind before the first session
          </li>
          <li>
            <strong className="font-semibold text-[var(--color-text)]">No pressure</strong> to buy on the call
          </li>
          <li>
            <Link href="/coaching" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
              Everything in each package
            </Link>
          </li>
        </ul>
      </section>

      {/* Founder */}
      <section className="border-y border-[var(--color-border-muted)] bg-[var(--color-panel)]/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-[var(--space-section)] md:grid-cols-[minmax(0,20rem)_1fr] md:items-center md:gap-14">
          <Image
            src="/images/david-zimmerman-studio.jpg"
            alt={`${BRAND.coachName}, founder of ${BRAND.name}`}
            width={1056}
            height={1320}
            sizes="(min-width: 768px) 20rem, 70vw"
            className="w-full max-w-[20rem] rounded-[var(--radius-lg)] object-cover"
          />
          <div>
            <Kicker>Who you&apos;ll talk to</Kicker>
            <blockquote className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.5rem,1.1rem+1.4vw,2.125rem)] font-semibold leading-tight tracking-tight text-[var(--color-text)]">
              <span className="signal-text">&ldquo;</span>Most owners know AI could build and run
              their business. They don&apos;t know where to start. I give you the plan, the tools
              and someone to check your work each week.<span className="signal-text">&rdquo;</span>
            </blockquote>
            <p className="mt-6 max-w-2xl font-[family-name:var(--font-ui)] text-[length:var(--text-body)] text-[var(--color-text-muted)]">
              I build with these tools every day, then teach what works. I&apos;ve built and run my
              own businesses as one person with an AI team: the sites, the marketing, the sales
              follow-up and the books. Every coaching session is with me, not an assistant.
            </p>
            <p className="mt-4 max-w-2xl font-[family-name:var(--font-ui)] text-[length:var(--text-body)] text-[var(--color-text-muted)]">
              My method is simple. Map how the work gets done today, hand one piece to AI and get
              it working well, then do the next.
            </p>
            <p className="mt-6 font-[family-name:var(--font-display)] text-[1.375rem] font-bold text-[var(--color-text)]">
              {BRAND.coachName}
            </p>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
        <Kicker>Questions</Kicker>
        <h2 className="mt-3 text-[length:var(--text-h2)] text-[var(--color-text)]">Before you book</h2>
        <div className="mt-8 grid gap-x-12 md:grid-cols-2">
          {HOME_FAQ.map((item, i) => (
            <details key={item.question} open={i === 0} className="group border-t border-[var(--color-border)] py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-text)] [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden className="text-[var(--color-accent)] group-open:hidden">+</span>
                <span aria-hidden className="hidden text-[var(--color-accent)] group-open:inline">−</span>
              </summary>
              <p className="mt-3 font-[family-name:var(--font-ui)] text-[length:var(--text-ui)] text-[var(--color-text-muted)]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* The ask, again */}
      <section data-sticky-guard className="mx-auto max-w-6xl px-6 pb-10">
        <div className="parchment-card grid gap-8 rounded-[var(--radius-lg)] p-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-12 md:p-12">
          <div>
            <h2 className="text-[length:var(--text-h2)]">Pick a time. Leave with a plan.</h2>
            <p className="mt-4 max-w-xl font-[family-name:var(--font-ui)] text-[length:var(--text-body)] text-[var(--color-text-muted-on-parchment)]">
              Thirty minutes on your business, free. The worst case is a written AI plan you can
              use on your own.
            </p>
          </div>
          <NextOpenings days={1} surface="paper" location="home_closer" />
        </div>
        <p className="mt-8 border-t border-[var(--color-border-muted)] pt-6 font-[family-name:var(--font-ui)] text-[length:var(--text-ui)] text-[var(--color-text-muted)]">
          Not ready to talk?{" "}
          <Link
            href="/university"
            className="font-semibold text-[var(--color-text)] underline decoration-[var(--color-accent)] underline-offset-4"
          >
            Read the free lessons
          </Link>{" "}
          and book when you are.
        </p>
      </section>

      <StickyCta
        page="home"
        location="home_sticky"
        label="Pick a time"
        href={`${URLS.coachingDiscovery}?source=home_sticky`}
        variant="coaching"
        note={`Free 30-min call with ${BRAND.coachFirstName}`}
      />
    </>
  );
}
