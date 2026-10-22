export type SiteNavLink = { href: string; label: string };

/** Header links, in order. The "Book a free call" button sits after them. */
export const SITE_NAV_LINKS: readonly SiteNavLink[] = [
  { href: "/course", label: "The course" },
  { href: "/university", label: "Lessons" },
  { href: "/coaching", label: "1-on-1 coaching" },
  { href: "/about", label: "About" },
];

export function siteNavLinks(): SiteNavLink[] {
  return SITE_NAV_LINKS.map((link) => ({ ...link }));
}
