import { TrackedLink } from "@/components/TrackedLink";
import { founderBio } from "@/content/site";
import { PortraitFrame } from "./PortraitFrame";
import { SectionHeading } from "./SectionHeading";

export function FounderBlock({
  folio,
  eyebrow = "Your host",
  aboutLocation,
  extra,
}: {
  folio?: string;
  eyebrow?: string;
  aboutLocation: string;
  extra?: React.ReactNode;
}) {
  return (
    <section className="px-6 py-[var(--space-section)]">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12 md:items-center">
        <div className="md:col-span-5 lg:col-span-4">
          <PortraitFrame caption="David Zimmerman · Founder" />
        </div>
        <div className="md:col-span-7 lg:col-span-7 lg:col-start-6">
          <SectionHeading folio={folio} eyebrow={eyebrow} title="David Zimmerman" />
          <div className="mt-6 space-y-4 text-[length:var(--text-body)] leading-[1.65] text-[var(--color-text)]">
            {founderBio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {extra}
          </div>
          <p className="mt-6 font-[family-name:var(--font-display)] text-2xl italic text-[var(--color-accent)]">
            — David
          </p>
          <TrackedLink
            href="/about"
            location={aboutLocation}
            className="mt-5 inline-flex min-h-[44px] items-center font-[family-name:var(--font-ui)] text-[15px] font-medium text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            About FromAItoBusiness →
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
