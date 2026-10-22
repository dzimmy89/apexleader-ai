import type { Metadata } from "next";
import { ApplicationForm } from "@/components/coaching/ApplicationForm";
import { SectionReveal } from "@/components/SectionReveal";
import { PageHeader } from "@/components/system";
import { getPackage } from "@/lib/coaching/packages";

// Reads Firestore via getPackage(); render on-demand to avoid SSG timeouts.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apply for Inner Circle Coaching",
  description:
    "Apply for FromAItoBusiness's Inner Circle: 24 weekly 1-on-1 sessions over six months with direct access to David.",
  robots: { index: true },
};

interface ApplyPageProps {
  searchParams: Promise<{ packageId?: string }>;
}

export default async function ApplyPage({ searchParams }: ApplyPageProps) {
  const { packageId } = await searchParams;
  const pkg = packageId ? await getPackage(packageId) : null;
  const packageName = pkg?.name || "Inner Circle";

  return (
    <section className="px-6 py-[var(--space-section)]">
      <div className="mx-auto max-w-2xl">
        <SectionReveal className="mb-8">
          <PageHeader
            eyebrow={`${packageName} application`}
            title={`Apply for ${packageName}`}
            intro={
              <>
                Tell us a little about your goals and we&apos;ll review them before your call.
                Prefer to talk first?{" "}
                <a
                  href={`/coaching/book?packageId=${packageId || "institutional"}`}
                  className="text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hover)]"
                >
                  Book a free call
                </a>{" "}
                instead.
              </>
            }
          />
        </SectionReveal>

        <ApplicationForm
          packageId={packageId || "institutional"}
          packageContext={
            pkg
              ? {
                  id: pkg.id,
                  name: pkg.name,
                  tagline: pkg.tagline,
                  priceDisplay: pkg.priceDisplay,
                  durationWeeks: pkg.durationWeeks,
                  sessionCount: pkg.sessionCount,
                  bestFor: pkg.bestFor,
                }
              : null
          }
        />
      </div>
    </section>
  );
}
