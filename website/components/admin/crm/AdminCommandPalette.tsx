"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { adminNavGroups } from "@/lib/admin/navigation";

export type AdminCommandItem = {
  href: string;
  label: string;
  group: string;
};

export function collectAdminCommandItems(): AdminCommandItem[] {
  return adminNavGroups.flatMap((group) =>
    group.items.map((item) => ({
      href: item.href,
      label: item.label,
      group: group.label,
    }))
  );
}

export function filterAdminCommandItems(
  items: AdminCommandItem[],
  query: string
): AdminCommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q) ||
      item.href.toLowerCase().includes(q)
  );
}

export function AdminCommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const items = useMemo(() => collectAdminCommandItems(), []);
  const filtered = useMemo(() => filterAdminCommandItems(items, query), [items, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (activeIndex >= filtered.length) {
      setActiveIndex(Math.max(0, filtered.length - 1));
    }
  }, [activeIndex, filtered.length]);

  function close() {
    onOpenChange(false);
  }

  function goTo(href: string) {
    close();
    router.push(href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (filtered.length === 0 ? 0 : (i + 1) % filtered.length));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) =>
          filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length
        );
        break;
      case "Enter":
        event.preventDefault();
        if (filtered[activeIndex]) goTo(filtered[activeIndex].href);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      default:
        break;
    }
  }

  if (!open) return null;

  return (
    <div className="mc-cmdk-root" role="presentation">
      <button type="button" className="mc-cmdk-backdrop" aria-label="Close command palette" onClick={close} />
      <div
        className="mc-cmdk-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Jump to admin tab"
      >
        <input
          ref={inputRef}
          className="mc-cmdk-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Jump to a tab…"
          aria-autocomplete="list"
          aria-controls="admin-cmdk-list"
          aria-activedescendant={
            filtered[activeIndex] ? `admin-cmdk-item-${filtered[activeIndex].href}` : undefined
          }
        />
        <ul id="admin-cmdk-list" className="mc-cmdk-list" role="listbox">
          {filtered.length === 0 ? (
            <li className="mc-cmdk-empty">No matching tabs</li>
          ) : (
            filtered.map((item, index) => (
              <li key={item.href} role="presentation">
                <button
                  type="button"
                  id={`admin-cmdk-item-${item.href}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={
                    index === activeIndex ? "mc-cmdk-item mc-cmdk-item-active" : "mc-cmdk-item"
                  }
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => goTo(item.href)}
                >
                  <span className="mc-cmdk-item-label">{item.label}</span>
                  <span className="mc-cmdk-item-group">{item.group}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
