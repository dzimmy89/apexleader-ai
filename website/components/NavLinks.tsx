"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Header links with the current section marked. */
export function NavLinks({
  links,
  className,
  linkClassName,
  onNavigate,
}: {
  links: readonly { href: string; label: string }[];
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "";
  return (
    <ul className={className}>
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "inline-flex min-h-[44px] items-center font-[family-name:var(--font-ui)] text-[15px] font-medium transition-colors",
                active
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-text)] hover:text-[var(--color-accent)]",
                linkClassName
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
