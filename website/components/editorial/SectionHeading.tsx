import { cn } from "@/lib/utils";

type Surface = "dark" | "parchment";

/**
 * Eyebrow, headline and one intro line. The headline is always the biggest
 * and brightest element; the eyebrow is a small semibold label above it.
 */
export function SectionHeading({
  folio,
  eyebrow,
  title,
  intro,
  id,
  surface = "dark",
  align = "left",
  className,
}: {
  folio?: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  id?: string;
  surface?: Surface;
  align?: "left" | "center";
  className?: string;
}) {
  const onParchment = surface === "parchment";
  return (
    <header className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p
        className={cn(
          "section-eyebrow flex items-center gap-3",
          align === "center" && "justify-center",
          onParchment && "on-parchment"
        )}
      >
        {folio ? (
          <span
            aria-hidden="true"
            className={cn(
              "font-normal tracking-normal",
              onParchment ? "text-muted-on-parchment" : "text-[var(--color-text-faint)]"
            )}
          >
            § {folio}
          </span>
        ) : null}
        <span>{eyebrow}</span>
      </p>
      <h2
        id={id}
        className={cn(
          "mt-3 text-[length:var(--text-h2)] leading-[1.08]",
          onParchment ? "text-on-parchment" : "text-[var(--color-text)]"
        )}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={cn(
            "mt-4 text-[length:var(--text-lead)] leading-[1.55]",
            align === "center" ? "mx-auto" : "",
            onParchment ? "text-muted-on-parchment" : "text-[var(--color-text-muted)]"
          )}
        >
          {intro}
        </p>
      ) : null}
    </header>
  );
}
