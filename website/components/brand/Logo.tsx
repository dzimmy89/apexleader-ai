/**
 * The FromAItoBusiness mark: a spark (the AI) travelling along the signal
 * arrow into a solid block (the business). The wordmark puts the same arrow
 * between "From AI" and "to Business".
 */
export function LogoMark({ size = 32, title }: { size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="32" height="32" rx="8" fill="var(--logo-tile, oklch(25.5% 0.028 262))" />
      <circle cx="8" cy="16" r="3" fill="oklch(71% 0.19 45)" />
      <path d="M12 16h7" stroke="oklch(71% 0.19 45)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16.5 12l4 4-4 4" stroke="oklch(71% 0.19 45)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="22" y="10" width="5" height="12" rx="1.5" fill="var(--logo-block, oklch(96.5% 0.008 85))" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-[family-name:var(--font-display)] font-extrabold tracking-[-0.03em] ${className}`}
    >
      <span>From</span>
      <span className="text-[var(--color-accent)]">AI</span>
      <span aria-hidden="true" className="mx-[0.12em] text-[var(--color-accent)]">
        →
      </span>
      <span className="sr-only"> to </span>
      <span aria-hidden="true">to</span>
      <span>Business</span>
    </span>
  );
}

export function Logo({ className = "", markSize = 30 }: { className?: string; markSize?: number }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={markSize} />
      <Wordmark />
    </span>
  );
}
