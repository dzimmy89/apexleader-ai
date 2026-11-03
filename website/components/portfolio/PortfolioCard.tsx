import Link from "next/link";
import { PORTFOLIO_STATUS, portfolioHost, type PortfolioBusiness } from "@/content/portfolio";

/** One business on /portfolio, the home page and /coaching. */
export function PortfolioCard({ business }: { business: PortfolioBusiness }) {
  const status = PORTFOLIO_STATUS[business.status];
  return (
    <article className="panel relative flex h-full flex-col gap-4 p-6 transition-colors hover:border-[var(--color-accent)]">
      <div className="flex items-center justify-between gap-3">
        <span className={`chip shrink-0 ${status.chip}`}>{status.label}</span>
        <span className="mono-label min-w-0 truncate normal-case tracking-normal">
          {business.url ? portfolioHost(business.url) : "Not public yet"}
        </span>
      </div>
      <div>
        <h3 className="text-2xl text-[var(--color-text)]">
          <Link
            href={`/portfolio/${business.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {business.name}
          </Link>
        </h3>
        <p className="mt-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] leading-relaxed text-[var(--color-text-muted)]">
          {business.oneLine}
        </p>
      </div>
      <ul className="mt-auto flex flex-wrap gap-2" aria-label="Course modules used">
        {business.modules.map((m) => (
          <li key={m.number} className="mono-label normal-case tracking-normal text-[var(--color-accent)]">
            M{m.number}
          </li>
        ))}
      </ul>
      <p className="border-t border-[var(--color-border-muted)] pt-3 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text)]">
        <span className="text-[var(--color-text-faint)]">Built with · </span>
        {business.tools.join(" · ")}
      </p>
    </article>
  );
}
