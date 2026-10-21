import type { Metadata } from "next";
import { Check, XCircle } from "lucide-react";
import { SectionReveal } from "@/components/SectionReveal";
import { CTAButton } from "@/components/CTAButton";
import { PageHeader, Panel } from "@/components/system";
import { URLS } from "@/content/site";

export const metadata: Metadata = {
  title: "Payment Cancelled",
  description: "Your payment was cancelled. No charges were made.",
};

interface CancelPageProps {
  searchParams: Promise<{ tier?: string; package?: string }>;
}

const MEMBERSHIP_POINTS = [
  "Month-to-month membership",
  "No long-term contracts",
  "Structured education, not financial advice",
];

export default async function CancelPage({ searchParams }: CancelPageProps) {
  const params = await searchParams;
  const isCoaching = params.tier === "coaching";

  return (
    <section className="flex min-h-[70vh] items-center px-6 py-[var(--space-section)]">
      <div className="mx-auto w-full max-w-2xl">
        <SectionReveal>
          <XCircle size={40} className="text-[var(--color-text-muted)]" aria-hidden="true" />
          <PageHeader
            className="mt-6"
            eyebrow={isCoaching ? "Private coaching" : "Membership"}
            title="Payment cancelled"
            intro="No charges were made to your account. You can try again whenever you are ready."
          />

          <Panel className="mt-8" title={isCoaching ? "Still thinking it over?" : "Still interested?"}>
            {isCoaching ? (
              <p className="font-[family-name:var(--font-ui)] text-[15px] leading-relaxed text-[var(--color-text)]">
                Book a free discovery call. We&apos;ll talk through your goals, answer your questions,
                and figure out whether private coaching makes sense for you. No pressure.
              </p>
            ) : (
              <>
                <p className="font-[family-name:var(--font-ui)] text-[15px] leading-relaxed text-[var(--color-text)]">
                  Join the membership on Skool: $97 a month for live Q&A Monday, Wednesday, and
                  Friday, after a 7-day free trial. Cancel anytime. Educational content only.
                </p>
                <ul className="mt-4 space-y-2 font-[family-name:var(--font-ui)] text-[15px] text-[var(--color-text)]">
                  {MEMBERSHIP_POINTS.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <Check size={18} className="mt-0.5 shrink-0 text-[var(--color-success)]" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            {isCoaching ? (
              <>
                <CTAButton
                  variant="coaching"
                  size="lg"
                  href={URLS.coachingDiscovery}
                  location="cancel_coaching"
                >
                  Book a discovery call
                </CTAButton>
                <CTAButton variant="ghost" href="/coaching" location="cancel_coaching_back">
                  Back to coaching
                </CTAButton>
              </>
            ) : (
              <>
                <CTAButton variant="skool" size="lg" href={URLS.skoolPlans} location="cancel" external>
                  Try again
                </CTAButton>
                <CTAButton variant="ghost" href="/" location="cancel_home">
                  Back to homepage
                </CTAButton>
              </>
            )}
          </div>

          <p className="mt-8 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
            Questions?{" "}
            <a
              href={`mailto:${URLS.email}`}
              className="text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hover)]"
            >
              {URLS.email}
            </a>
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
