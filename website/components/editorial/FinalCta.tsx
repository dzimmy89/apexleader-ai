import { cn } from "@/lib/utils";

/**
 * Page ending: one headline, one line, one primary button and (optionally)
 * one outlined secondary, framed in a raised panel so it reads as the last
 * decision point rather than another paragraph.
 */
export function FinalCta({
  title,
  intro,
  children,
  className,
}: {
  title: React.ReactNode;
  intro?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section data-sticky-guard className={cn("px-6 py-[var(--space-section)]", className)}>
      <div className="panel-raised mx-auto max-w-3xl px-6 py-12 text-center md:px-12 md:py-16">
        <h2 className="text-[length:var(--text-h2)] text-[var(--color-text)]">{title}</h2>
        {intro ? (
          <p className="mx-auto mt-5 max-w-xl text-[length:var(--text-lead)] leading-[1.55] text-[var(--color-text-muted)]">
            {intro}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          {children}
        </div>
      </div>
    </section>
  );
}
