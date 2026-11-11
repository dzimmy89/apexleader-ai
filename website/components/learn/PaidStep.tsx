import Image from "next/image";
import Link from "next/link";
import { FOUNDER_PORTRAIT } from "@/components/editorial/PortraitFrame";
import { BRAND } from "@/lib/brand";
import { URLS } from "@/content/site";
import { getPackages, isPublicPlan } from "@/lib/coaching/packages";
import { NextOpenings } from "@/components/home/NextOpenings";

/** Matches section 4 of every coaching agreement (content/coaching-contracts). */
export const GUARANTEE_LINE = "Change your mind within 14 days of signing, before your first session, and you get a full refund.";

interface PackageRow {
  id: string;
  name: string;
  priceDisplay: string;
  line: string;
  plan: string | null;
}

async function loadPackages(): Promise<PackageRow[]> {
  try {
    const packages = await getPackages({ activeOnly: true });
    return packages
      .filter((p) => !p.applicationOnly)
      .map((p) => {
        const plan = p.paymentPlans.find((pl) => isPublicPlan(pl) && pl.installments > 1);
        return {
          id: p.id,
          name: p.name,
          priceDisplay: p.priceDisplay,
          line: `${p.sessionCount} sessions over ${p.durationWeeks} weeks. ${p.tagline}`,
          plan: plan ? `or ${plan.installments} × $${plan.perPayment.toLocaleString()}` : null,
        };
      });
  } catch (e) {
    console.error("[PaidStep] packages unavailable", e);
    return [];
  }
}

/**
 * Below the exercise on a lesson, for everyone who is not a coaching client:
 * David's line, the three prices in a row, the refund line from the
 * agreement, and the way to a call. It never sits above the lesson text.
 */
export async function PaidStep({
  courseTitle,
  showTimes = false,
}: {
  courseTitle: string;
  /** After the exercise opens: show David's next open call times instead of one button. */
  showTimes?: boolean;
}) {
  const packages = await loadPackages();
  return (
    <section aria-labelledby="paid-step-heading" className="mt-16 border-t border-[var(--color-border-strong)] pt-10">
      <div className="grid gap-8 md:grid-cols-[1fr_1.3fr] md:items-start">
        <div>
          <p className="section-eyebrow">With private coaching</p>
          <h2 id="paid-step-heading" className="mt-3 text-[length:var(--text-h4)] leading-[1.35] text-[var(--color-text)] md:text-[1.25rem]">
            &ldquo;Most owners can do this lesson in an afternoon. The hard part is the agent that runs it and the rule that keeps it
            safe. That is what we set up together, in your business.&rdquo;
          </h2>
          <p className="mt-4 flex items-center gap-3 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
            <Image src={FOUNDER_PORTRAIT.src} alt="" width={36} height={36} className="size-9 rounded-full object-cover object-top" />
            <span>
              <span className="font-medium text-[var(--color-text)]">{BRAND.coachName}</span>
              <br />
              founder, coaches every session himself
            </span>
          </p>
        </div>
        <div className="min-w-0">
          {packages.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[22rem] border-collapse font-[family-name:var(--font-ui)] text-[length:var(--text-small)]">
                <thead>
                  <tr className="border-b border-[var(--color-border-strong)] text-left">
                    <th className="ui-label pb-2 pr-4 font-semibold">Package</th>
                    <th className="ui-label pb-2 pr-4 font-semibold">Includes</th>
                    <th className="ui-label pb-2 font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--color-border)] align-top">
                      <td className="py-3 pr-4 font-semibold text-[var(--color-text)]">{p.name}</td>
                      <td className="py-3 pr-4 text-[var(--color-text-muted)]">{p.line}</td>
                      <td className="py-3 tabular-nums">
                        <span className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-text)]">{p.priceDisplay}</span>
                        {p.plan ? <span className="mono-label block whitespace-nowrap normal-case tracking-normal">{p.plan}</span> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="font-[family-name:var(--font-ui)] text-[var(--color-text-muted)]">
              Three packages, from two sessions to six months, every one private and built around your business.
            </p>
          )}
          <p className="mt-4 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-text)]">{GUARANTEE_LINE}</span> It is written into the agreement. Coaching
            opens every lesson in {courseTitle} and the rest of the library.
          </p>
          {showTimes ? (
            <div className="mt-6">
              <p className="ui-label">Free 30-minute call. Next open times</p>
              <NextOpenings location="exercise_paid_step" className="mt-3" />
              <Link
                href="/coaching"
                className="mt-3 inline-block font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)] underline"
              >
                How coaching works
              </Link>
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={URLS.coachingDiscovery} className="btn btn-primary">
                Book a free call
              </Link>
              <Link href="/coaching" className="btn btn-secondary">
                How coaching works
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
