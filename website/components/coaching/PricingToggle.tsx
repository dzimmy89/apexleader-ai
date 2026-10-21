"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { SPRING } from "@/lib/motion";
import { useRadioKeys } from "@/lib/use-radio-keys";
import { cn } from "@/lib/utils";

interface PricingToggleProps {
  value: "full" | "3pay" | "6pay";
  onChange: (value: "full" | "3pay" | "6pay") => void;
  has6pay?: boolean;
}

/** Sans segmented control; the selected option is filled gold. Radiogroup with arrow keys. */
export function PricingToggle({
  value,
  onChange,
  has6pay = false,
}: PricingToggleProps) {
  const reduced = useReducedMotion();
  const indicatorId = useId();
  const options: Array<{ id: "full" | "3pay" | "6pay"; label: string }> = [
    { id: "full", label: "Pay in full" },
    { id: "3pay", label: "3 payments" },
  ];
  if (has6pay) {
    options.push({ id: "6pay", label: "6 payments" });
  }
  const { onKeyDown, register } = useRadioKeys(
    options.map((opt) => opt.id),
    value,
    onChange
  );

  return (
    <div
      role="radiogroup"
      aria-label="Payment option"
      onKeyDown={onKeyDown}
      className="inline-flex max-w-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-1"
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            ref={register(opt.id)}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.id)}
            className="relative min-h-[44px] cursor-pointer px-3 text-[14px] font-medium sm:px-4 sm:text-[15px]"
          >
            {active ? (
              <motion.span
                layoutId={indicatorId}
                className="absolute inset-0 border border-[var(--color-accent)] bg-[var(--color-accent-subtle)]"
                transition={reduced ? { duration: 0 } : SPRING.snap}
              />
            ) : null}
            <span
              className={cn(
                "relative transition-colors",
                active
                  ? "text-[var(--color-text)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
