/** Motion tokens for the Editorial Vault marketing pages (see DESIGN.md › Motion). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_OUT_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

export const DURATION = {
  fast: 0.16,
  base: 0.24,
  slow: 0.48,
} as const;

export const SPRING = {
  snap: { type: "spring", stiffness: 380, damping: 30 },
  settle: { type: "spring", stiffness: 220, damping: 28 },
  dialog: { type: "spring", bounce: 0.12, duration: 0.42 },
} as const;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
