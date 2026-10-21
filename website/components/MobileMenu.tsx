"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AccountNavLink } from "./AccountNavLink";
import { NavLinks } from "./NavLinks";
import { SkoolJoinLink } from "./SkoolJoinLink";

/** Phone navigation: a full-height sheet with Escape, backdrop and focus trapping. */
export function MobileMenu({
  links,
}: {
  links: readonly { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--color-text)] hover:text-[var(--color-accent)] lg:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
        <Dialog.Popup
          className="menu-in fixed inset-x-0 top-[var(--site-header-h)] z-50 flex max-h-[calc(100dvh-var(--site-header-h))] flex-col overflow-y-auto border-b border-[var(--color-border-strong)] bg-[var(--color-bg)] px-6 pb-8 pt-4 lg:hidden"
          aria-label="Site menu"
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <nav aria-label="Mobile">
            <NavLinks
              links={links}
              className="flex flex-col"
              linkClassName="min-h-[52px] w-full border-b border-[var(--color-border)] text-lg"
              onNavigate={close}
            />
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <SkoolJoinLink location="mobile_menu_join" className="btn btn-skool btn-block" onClick={close}>
              Join on Skool
            </SkoolJoinLink>
            <AccountNavLink className="btn-block" onClick={close} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
