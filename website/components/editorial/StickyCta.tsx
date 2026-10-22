"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trackCoachingClick, trackStickyCta } from "@/lib/gtm";
import { cn } from "@/lib/utils";

/**
 * Mobile-only CTA bar (56px): the note as plain text on the left, one filled
 * button on the right. Hidden while any `[data-sticky-guard]` element (hero
 * CTAs, plan grids, lead forms, final CTA, footer) is on screen so it never
 * stacks on another CTA.
 */
/** The sticky header's height from the CSS token, for the scroll guard. */
function headerHeight(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--site-header-h");
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 64;
}

export function StickyCta({
  page,
  location,
  label,
  href,
  variant,
  external = false,
  note,
}: {
  page: string;
  location: string;
  label: string;
  href: string;
  variant: "positive" | "coaching";
  external?: boolean;
  note?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const guards = Array.from(document.querySelectorAll("[data-sticky-guard], footer"));
    if (guards.length === 0) return;
    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target);
          else onScreen.delete(entry.target);
        }
        setVisible(onScreen.size === 0 && window.scrollY > 200);
      },
      // The sticky site header (--site-header-h) covers the top of the viewport; a guard hidden under it is off screen.
      { rootMargin: `-${headerHeight()}px 0px 0px 0px` }
    );
    guards.forEach((guard) => observer.observe(guard));
    return () => observer.disconnect();
  }, []);

  const onClick = () => {
    trackStickyCta(page, href);
    if (variant === "coaching") trackCoachingClick(location);
  };

  const className = cn(
    "btn shrink-0",
    variant === "positive" ? "btn-positive" : "btn-primary",
    !note && "flex-1"
  );

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 px-4 backdrop-blur-md md:hidden",
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-14 items-center justify-between gap-3">
        {note ? (
          <p className="min-w-0 flex-1 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] font-medium leading-snug text-[var(--color-text)]">
            {note}
          </p>
        ) : null}
        {external ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            onClick={onClick}
            tabIndex={visible ? 0 : -1}
          >
            {label}
          </a>
        ) : (
          <Link href={href} className={className} onClick={onClick} tabIndex={visible ? 0 : -1}>
            {label}
          </Link>
        )}
      </div>
    </div>
  );
}
