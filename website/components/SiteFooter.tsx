import Link from "next/link";
import { disclaimer, URLS } from "@/content/site";
import { BRAND } from "@/lib/brand";

const linkClass =
  "font-[family-name:var(--font-ui)] text-[15px] text-[var(--color-text)] hover:text-[var(--color-accent)]";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-text)]">
              {BRAND.name}
            </span>
            <p className="mt-3 max-w-xs text-[var(--color-text-muted)]">
              {BRAND.tagline}.
            </p>
          </div>

          <div>
            <h3 className="section-eyebrow mb-4">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/coaching" className={linkClass}>
                  Private coaching
                </Link>
              </li>
              <li>
                <Link href="/university" className={linkClass}>
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkClass}>
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="section-eyebrow mb-4">Clients</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/account" className={linkClass}>
                  Your account and coaching
                </Link>
              </li>
              <li>
                <a href={`mailto:${URLS.email}`} className={linkClass}>
                  {URLS.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 max-w-4xl font-[family-name:var(--font-ui)] text-sm leading-relaxed text-[var(--color-text-muted)]">
          <span className="font-semibold text-[var(--color-text)]">Disclaimer. </span>
          {disclaimer}
        </p>

        <div className="mt-8 flex flex-col gap-4 border-t border-[var(--color-border)] pt-6 font-[family-name:var(--font-ui)] text-sm text-[var(--color-text-muted)] md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.legalName}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[var(--color-text)]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--color-text)]">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
