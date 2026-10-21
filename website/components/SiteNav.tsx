import Link from "next/link";
import { siteNavLinks } from "@/content/testimonials";
import { MobileMenu } from "./MobileMenu";
import { AccountNavLink } from "./AccountNavLink";
import { NavLinks } from "./NavLinks";
import { SkoolJoinLink } from "./SkoolJoinLink";

/**
 * Sticky header: wordmark, section links with the current one marked and the
 * one filled "Join on Skool" action after them, then a quiet Sign in /
 * Account link on the far right (the layout the header plan settled on). Its
 * height is `--site-header-h` (tokens.css), which the lesson viewer uses.
 */
export function SiteNav() {
  const links = siteNavLinks();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--site-header-h)] max-w-6xl items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-[1.625rem] leading-none text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)]"
        >
          DeFi University
        </Link>

        <nav className="hidden flex-1 items-center gap-7 lg:flex" aria-label="Main">
          <NavLinks links={links} className="flex items-center gap-7" />
          <SkoolJoinLink
            location="nav_join"
            className="btn btn-secondary btn-sm border-[var(--color-skool)] text-[var(--color-skool)] hover:border-[var(--color-skool)] hover:bg-[var(--color-skool)] hover:text-[var(--color-bg)]"
          >
            Join on Skool
          </SkoolJoinLink>
        </nav>

        <div className="hidden lg:block">
          <AccountNavLink />
        </div>

        <MobileMenu links={links} />
      </div>
      <div className="foil-rule" aria-hidden="true" />
    </header>
  );
}
