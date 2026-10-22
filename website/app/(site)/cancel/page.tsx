import type { Metadata } from "next";
import { XCircle } from "lucide-react";
import { SectionReveal } from "@/components/SectionReveal";
import { CTAButton } from "@/components/CTAButton";
import { PageHeader, Panel } from "@/components/system";
import { URLS } from "@/content/site";

export const metadata: Metadata = {
  title: "Payment Cancelled",
  description: "Your payment was cancelled. No charges were made.",
};

export default function CancelPage() {
  return (
    <section className="flex min-h-[70vh] items-center px-6 py-[var(--space-section)]">
      <div className="mx-auto w-full max-w-2xl">
        <SectionReveal>
          <XCircle size={40} className="text-[var(--color-text-muted)]" aria-hidden="true" />
          <PageHeader
            className="mt-6"
            eyebrow="Private coaching"
            title="Payment cancelled"
            intro="No charges were made to your account. You can try again whenever you are ready."
          />

          <Panel className="mt-8" title="Still thinking it over?">
            <p className="font-[family-name:var(--font-ui)] text-[15px] leading-relaxed text-[var(--color-text)]">
              Book a free discovery call. We&apos;ll talk through your goals, answer your questions,
              and figure out whether private coaching makes sense for you. No pressure.
            </p>
          </Panel>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <CTAButton variant="coaching" size="lg" href={URLS.coachingDiscovery} location="cancel_coaching">
              Book a discovery call
            </CTAButton>
            <CTAButton variant="ghost" href="/coaching" location="cancel_coaching_back">
              Back to coaching
            </CTAButton>
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
