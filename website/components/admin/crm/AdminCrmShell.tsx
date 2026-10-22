"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { adminNavGroups, isNavActive } from "@/lib/admin/navigation";
import { AdminCommandPalette } from "@/components/admin/crm/AdminCommandPalette";

function ServerMark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="6" rx="1.2" />
      <rect x="3" y="14" width="18" height="6" rx="1.2" />
      <circle cx="7" cy="7" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="7" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/.test(navigator.platform);
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="mc-nav">
      {adminNavGroups.map((group) => (
        <div key={group.id} className="mc-nav-group">
          <p className="mc-nav-group-label">{group.label}</p>
          {group.items.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={active ? "mc-nav-link mc-nav-link-active" : "mc-nav-link"}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SidebarBrand() {
  return (
    <Link href="/admin" className="mc-brand">
      <span className="mc-brand-icon">
        <ServerMark />
      </span>
      <span>
        <span className="mc-brand-title">Mission Control</span>
        <span className="mc-brand-sub">FromAItoBusiness CRM</span>
      </span>
    </Link>
  );
}

function SignOutButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="mc-sign-out" onClick={onClick}>
      Sign out
    </button>
  );
}

export function AdminCrmShell({
  children,
  username,
}: {
  children: ReactNode;
  username?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [modKey, setModKey] = useState("Ctrl");

  useEffect(() => {
    setModKey(isMacPlatform() ? "⌘" : "Ctrl");
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPaletteOpen(false);
        setMobileOpen(false);
        return;
      }
      const isPaletteChord =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey) && !event.altKey;
      if (!isPaletteChord) return;
      event.preventDefault();
      setMobileOpen(false);
      setPaletteOpen((open) => !open);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  const displayName = username?.trim() || "Admin";

  return (
    <div className="dark mc-shell">
      <aside className="mc-aside">
        <SidebarBrand />
        <nav className="mc-aside-nav" aria-label="Admin">
          <NavLinks pathname={pathname} />
        </nav>
        <div className="mc-aside-footer">
          <p className="mc-session-name" title={displayName}>
            {displayName}
          </p>
          <SignOutButton onClick={() => void logout()} />
        </div>
      </aside>

      <div className="mc-main-column">
        <header className="mc-header">
          <div className="mc-header-mobile">
            <button
              type="button"
              className="mc-icon-button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={16} />
            </button>
          </div>
          <p className="mc-header-title">FromAItoBusiness Mission Control</p>
          <button
            type="button"
            className="mc-cmdk-trigger"
            onClick={() => setPaletteOpen(true)}
            aria-keyshortcuts="Meta+K Control+K"
          >
            <span>Command</span>
            <kbd className="mc-cmdk-kbd">{modKey}K</kbd>
          </button>
        </header>

        <main className="mc-content">{children}</main>
      </div>

      {mobileOpen ? (
        <div className="mc-mobile-root">
          <button
            type="button"
            className="mc-mobile-backdrop"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="mc-mobile-panel" role="dialog" aria-modal="true" aria-label="Admin menu">
            <SidebarBrand />
            <nav className="mc-aside-nav" aria-label="Admin">
              <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </nav>
            <div className="mc-aside-footer">
              <p className="mc-session-name">{displayName}</p>
              <SignOutButton
                onClick={() => {
                  setMobileOpen(false);
                  void logout();
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <AdminCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
