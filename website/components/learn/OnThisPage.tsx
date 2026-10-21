"use client";

import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LessonSection } from "@/lib/learn/blocks";
import { cn } from "@/lib/utils";

/** The section whose heading has scrolled past the sticky header, or the first one. */
function useActiveSection(sections: LessonSection[]): string | null {
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null);
  useEffect(() => {
    if (!sections.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current = sections[0]!.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sections]);
  return active;
}

function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  el.focus({ preventScroll: true });
  history.replaceState(null, "", `#${id}`);
}

function SectionList({
  sections,
  active,
  lockedFrom,
  onPick,
}: {
  sections: LessonSection[];
  active: string | null;
  lockedFrom: number;
  onPick?: () => void;
}) {
  return (
    <ol>
      {sections.map((s, i) => {
        const indent = s.level === 3 ? "pl-7" : "pl-3";
        if (i >= lockedFrom) {
          return (
            <li key={s.id}>
              <span
                className={cn(
                  "flex min-h-[44px] items-center gap-2 border-l-[3px] border-transparent py-2 pr-2 leading-snug text-[var(--color-text-muted)]",
                  indent
                )}
              >
                <Lock size={13} aria-hidden="true" className="shrink-0" />
                <span>
                  <span className="sr-only">Locked: </span>
                  {s.title}
                </span>
              </span>
            </li>
          );
        }
        const isActive = s.id === active;
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={isActive ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                jumpTo(s.id);
                onPick?.();
              }}
              className={cn(
                "flex min-h-[44px] items-center border-l-[3px] py-2 pr-2 leading-snug transition-colors",
                indent,
                isActive
                  ? "border-[var(--color-accent)] bg-[var(--color-panel-raised)] font-semibold text-[var(--color-text)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-panel-raised)] hover:text-[var(--color-text)]"
              )}
            >
              {s.title}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * "On this page": the lesson's sections as anchor links, highlighting the one
 * being read. `panel` is the desktop column, `inline` the box above the lesson
 * on mid-size screens, `dropdown` the button in the phone bar.
 */
export function OnThisPage({
  sections,
  lockedFrom = Infinity,
  variant,
}: {
  sections: LessonSection[];
  lockedFrom?: number;
  variant: "panel" | "inline" | "dropdown";
}) {
  const active = useActiveSection(sections);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!sections.length) return null;
  const index = Math.max(0, sections.findIndex((s) => s.id === active));

  if (variant === "dropdown") {
    return (
      <div ref={wrap} className="relative min-w-0 flex-1">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="on-this-page-menu"
          onClick={() => setOpen(!open)}
          className="flex min-h-[44px] w-full items-center justify-end gap-2 truncate font-[family-name:var(--font-ui)] text-[length:var(--text-small)] font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]"
        >
          <span className="truncate">
            On this page · {index + 1} of {sections.length}
          </span>
          {open ? <ChevronUp size={16} aria-hidden="true" className="shrink-0" /> : <ChevronDown size={16} aria-hidden="true" className="shrink-0" />}
        </button>
        {open ? (
          <nav
            id="on-this-page-menu"
            aria-label="On this page"
            className="menu-in panel-raised ui-surface no-scrollbar absolute right-0 top-full z-50 mt-1 max-h-[60vh] w-[min(20rem,calc(100vw-3rem))] overflow-y-auto p-2 text-[length:var(--text-small)] shadow-lg"
          >
            <SectionList sections={sections} active={active} lockedFrom={lockedFrom} onPick={() => setOpen(false)} />
          </nav>
        ) : null}
      </div>
    );
  }

  return (
    <nav
      aria-label="On this page"
      className={cn(
        "panel ui-surface text-[length:var(--text-small)]",
        variant === "inline" ? "mb-10 p-4 [&_ol]:columns-2 [&_ol]:gap-8 [&_li]:break-inside-avoid" : "p-3"
      )}
    >
      <p className="ui-label mb-2 px-3">On this page</p>
      <SectionList sections={sections} active={active} lockedFrom={lockedFrom} />
    </nav>
  );
}
