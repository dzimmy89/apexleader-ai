"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LessonSection } from "@/lib/learn/blocks";
import { cn } from "@/lib/utils";
import { OnThisPage } from "./OnThisPage";

/** A scrolling column that brings the outline's current item into view. */
export function OutlineScroller({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const box = ref.current;
    const el = box?.querySelector<HTMLElement>("[data-outline-current]");
    // Only on arrival at a new piece, so a refresh after "Mark complete" keeps the reader's scroll.
    if (!box || !el || el === shown.current) return;
    shown.current = el;
    const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    box.scrollTop = Math.max(0, top - box.clientHeight / 3);
  });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

const BAR_BUTTON =
  "flex min-h-[44px] shrink-0 items-center gap-2 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]";

/**
 * Phones and tablets: a sticky bar under the site header with the course
 * outline in a drawer and the lesson's sections in a dropdown.
 */
export function LessonMobileBar({
  outline,
  sections,
  lockedFrom,
}: {
  outline: React.ReactNode;
  sections: LessonSection[];
  lockedFrom?: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <div className="lesson-bar sticky z-30 -mx-6 mb-8 flex items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 px-6 backdrop-blur-md lg:hidden">
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={BAR_BUTTON}>
        <Menu size={18} aria-hidden="true" />
        Outline
      </button>
      {sections.length ? <OnThisPage sections={sections} lockedFrom={lockedFrom} variant="dropdown" /> : null}
      <dialog
        ref={dialog}
        aria-label="Course outline"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          // A tap on the backdrop or on any link closes the drawer.
          const target = e.target as HTMLElement;
          if (target === dialog.current || target.closest("a")) setOpen(false);
        }}
        className="lesson-drawer m-0 h-dvh max-h-dvh w-[min(22rem,85vw)] max-w-none border-r border-[var(--color-border)] bg-[var(--color-bg)] p-0 text-[var(--color-text)]"
      >
        {open ? (
          <OutlineScroller className="no-scrollbar ui-surface h-full overflow-y-auto px-3 pb-10 pt-3">
            <div className="mb-2 flex justify-end">
              <button type="button" onClick={() => setOpen(false)} className={cn(BAR_BUTTON, "px-2 text-[var(--color-text-muted)]")}>
                Close
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            {outline}
          </OutlineScroller>
        ) : null}
      </dialog>
    </div>
  );
}
