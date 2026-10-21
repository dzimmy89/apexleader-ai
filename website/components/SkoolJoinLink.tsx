"use client";

import { URLS } from "@/content/site";
import { trackSkoolSignup } from "@/lib/gtm";
import { cn } from "@/lib/utils";

/** External link to the Skool plans page that fires the sign-up event. Unstyled unless given classes. */
export function SkoolJoinLink({
  location,
  className,
  children = "Join on Skool ↗",
  onClick,
}: {
  location: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <a
      href={URLS.skoolPlans}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center",
        // As a text link it is Skool green; as a button the btn classes set the colours.
        !/\bbtn\b/.test(className ?? "") &&
          "min-h-[44px] font-[family-name:var(--font-ui)] font-medium text-[var(--color-skool)] transition-colors hover:text-[var(--color-text)]",
        className
      )}
      onClick={() => {
        trackSkoolSignup(location);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
