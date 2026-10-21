"use client";

import Link from "next/link";
import { trackCoachingClick } from "@/lib/gtm";

/** Text link to /coaching/pay that fires the coaching click event. Sans by default; callers may restyle. */
export function PayNowLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        className ??
        "inline-flex min-h-11 items-center font-[family-name:var(--font-ui)] text-[15px] font-medium text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hover)]"
      }
      onClick={() => trackCoachingClick("coaching_tiers_pay_link")}
    >
      {children}
    </Link>
  );
}
