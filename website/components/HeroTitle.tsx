interface HeroTitleProps {
  title: string;
}

/** The page's one H1. Paints without JavaScript (`.load-rise` is transform-only). */
export function HeroTitle({ title }: HeroTitleProps) {
  return (
    <h1
      className="load-rise max-w-3xl text-[length:var(--text-display)] text-balance text-[var(--color-text)]"
      style={{ "--load-delay": "80ms" } as React.CSSProperties}
    >
      {title}
    </h1>
  );
}
