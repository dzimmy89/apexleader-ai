import Link from "next/link";
import { siteNavLinks } from "@/content/nav";
import { URLS } from "@/content/site";
import { Logo } from "@/components/brand/Logo";
import { MobileMenu } from "./MobileMenu";
import { AccountNavLink } from "./AccountNavLink";
import { NavLinks } from "./NavLinks";

/**
 * Sticky header on a three-column grid: wordmark on the left, section links
 * truly centred on the page (the side columns share the leftover space
 * equally), and the actions on the right with the primary "Book a free call"
 * last. Below `xl` the links move into the menu sheet so nothing wraps or
 * crowds. Its height is `--site-header-h` (tokens.css), which the lesson
 * viewer uses.
 */
export function SiteNav() {
  const links = siteNavLinks();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md">
      <div className="mx-auto grid h-[var(--site-header-h)] max-w-7xl grid-cols-[1fr_auto] items-center gap-6 px-6 xl:grid-cols-[1fr_auto_1fr] xl:gap-10">
        <Link
          href="/"
          aria-label="FromAItoBusiness home"
          className="justify-self-start text-[1.375rem] leading-none text-[var(--color-text)] transition-opacity hover:opacity-85"
        >
          <Logo />
        </Link>

        <nav className="hidden xl:block" aria-label="Main">
          <NavLinks links={links} className="flex items-center gap-8 whitespace-nowrap" />
        </nav>

        <div className="flex items-center justify-self-end gap-3">
          <div className="hidden items-center gap-3 xl:flex">
            <AccountNavLink className="whitespace-nowrap px-3" />
            <Link
              href={URLS.coachingDiscovery}
              className="btn btn-primary btn-sm whitespace-nowrap"
            >
              Book a free call
            </Link>
          </div>
          {/* Tablets and small laptops keep the main action in view. */}
          <Link
            href={URLS.coachingDiscovery}
            className="btn btn-primary btn-sm hidden whitespace-nowrap md:inline-flex xl:hidden"
          >
            Book a free call
          </Link>
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
