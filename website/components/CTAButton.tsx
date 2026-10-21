"use client";

import Link from "next/link";
import { trackCoachingClick, trackInternalCta, trackSkoolSignup } from "@/lib/gtm";
import { cn } from "@/lib/utils";

type Variant = "skool" | "coaching" | "ghost";
type Surface = "dark" | "parchment";
type Size = "sm" | "md" | "lg";

interface CTAButtonProps {
  variant?: Variant;
  surface?: Surface;
  size?: Size;
  /** Which event the click reports; defaults to the variant's event. */
  track?: "skool" | "coaching" | "internal";
  href: string;
  children: React.ReactNode;
  className?: string;
  location?: string;
  external?: boolean;
  onClick?: () => void;
  /** Paid Skool tier amount in USD. Omit on generic community CTAs. */
  skoolValue?: number;
  skoolPlanId?: string;
}

const variantClass: Record<Variant, string> = {
  skool: "btn-skool",
  coaching: "btn-primary",
  ghost: "btn-secondary",
};

const sizeClass: Record<Size, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

/**
 * The site's link button. `variant` is the look (gold primary, Skool green,
 * or outlined). The analytics event follows the variant as it always has,
 * unless `track` names the event explicitly, so a button that changed look
 * keeps reporting under the same event.
 */
export function CTAButton({
  variant = "coaching",
  surface = "dark",
  size = "md",
  track,
  href,
  children,
  className = "",
  location = "cta",
  external = false,
  onClick,
  skoolValue,
  skoolPlanId,
}: CTAButtonProps) {
  const handleClick = () => {
    const event = track ?? (variant === "skool" && external ? "skool" : variant === "coaching" ? "coaching" : "internal");
    if (event === "skool") {
      trackSkoolSignup(location, { value: skoolValue, planId: skoolPlanId });
    } else if (event === "coaching") {
      trackCoachingClick(location);
    } else {
      trackInternalCta(location, href);
    }
    onClick?.();
  };

  const classes = cn(
    "btn motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98]",
    variantClass[variant],
    sizeClass[size],
    surface === "parchment" &&
      variant === "ghost" &&
      "border-[var(--color-border-strong-on-parchment)] text-[var(--color-text-on-parchment)] hover:border-[var(--color-coaching-ink)] hover:text-[var(--color-coaching-ink)]",
    className
  );

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={handleClick}>
      {children}
    </Link>
  );
}
