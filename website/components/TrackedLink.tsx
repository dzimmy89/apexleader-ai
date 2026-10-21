"use client";

import Link from "next/link";
import { trackInternalCta } from "@/lib/gtm";

export function TrackedLink({
  href,
  location,
  className,
  children,
}: {
  href: string;
  location: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => trackInternalCta(location, href)}>
      {children}
    </Link>
  );
}
