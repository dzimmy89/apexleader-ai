import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle, FileSignature } from "lucide-react";
import { SectionReveal } from "@/components/SectionReveal";
import { CTAButton } from "@/components/CTAButton";
import { URLS } from "@/content/site";
import { getPackage } from "@/lib/coaching/packages";

// Reads Firestore via getPackage() for coaching purchases; render on-demand.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Your coaching payment is in. Next steps to sign your agreement and book your first session.",
};

interface SuccessPageProps {
  searchParams: Promise<{
    tier?: string;
    package?: string;
    session_id?: string;
  }>;
}

const COACHING_STEPS = [
  "Check your email: your contract signing link is on the way",
  "Sign the agreement (about 2 minutes)",
  "Receive your client portal link",
  "Book your kickoff session from the portal",
];

/** Numbered next steps: one row each, sans, the numeral in the accent ink. */
function Steps({ steps }: { steps: readonly string[] }) {
  const ink = "text-[var(--color-coaching-ink)]";
  return (
    <ol className="mt-2 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] font-[family-name:var(--font-ui)]">
      {steps.map((step, i) => (
        <li key={step} className="flex items-start gap-4 py-3 text-[15px] text-on-parchment">
          <span className={`w-5 shrink-0 font-semibold ${ink}`}>{i + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const isCoaching = params.tier === "coaching";
  const packageId = params.package;

  // Coaching buyers see a contract-signing CTA + portal access preview.
  if (isCoaching && packageId) {
    const pkg = await getPackage(packageId);
    const packageName = pkg?.name || "Coaching";

    return (
      <section className="flex min-h-[70vh] items-center px-6 py-[var(--space-section)]">
        <div className="mx-auto w-full max-w-2xl">
          <SectionReveal>
            <div className="parchment-card p-6 md:p-10">
              <CheckCircle size={40} className="text-[var(--color-coaching-ink)]" aria-hidden="true" />
              <p className="section-eyebrow mt-6">Private coaching</p>
              <h1 className="mt-3 text-[length:var(--text-h1)] leading-[1.05] text-on-parchment">
                Payment received.
              </h1>
              <p className="mt-4 text-[length:var(--text-lead)] leading-[1.55] text-muted-on-parchment">
                Your <strong className="text-on-parchment">{packageName}</strong> package is active.
                The last step before we begin is signing your coaching agreement.
              </p>

              <p className="ui-label mt-8">What happens next</p>
              <Steps steps={COACHING_STEPS} />

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <CTAButton
                  variant="coaching"
                  surface="parchment"
                  size="lg"
                  href="/coaching/portal-access"
                  location="success_coaching"
                >
                  <FileSignature size={18} aria-hidden="true" /> Access client portal
                </CTAButton>
                <Link
                  href="/account"
                  className="inline-flex min-h-11 items-center font-[family-name:var(--font-ui)] text-[15px] font-medium text-[var(--color-coaching-ink)] underline underline-offset-4"
                >
                  Your account
                </Link>
                <Link
                  href="/coaching"
                  className="inline-flex min-h-11 items-center font-[family-name:var(--font-ui)] text-[15px] text-muted-on-parchment hover:text-on-parchment"
                >
                  Back to coaching
                </Link>
              </div>

              <p className="mt-8 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-muted-on-parchment">
                Having trouble? Email{" "}
                <a href={`mailto:${URLS.email}`} className="underline underline-offset-4">
                  {URLS.email}
                </a>{" "}
                and we&apos;ll resend your contract link.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>
    );
  }

  // Anything else (an old or hand-typed link) goes to the account page.
  redirect("/account");
}
