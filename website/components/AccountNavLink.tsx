"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasSignedInHint } from "@/lib/account/signed-in-hint";
import { cn } from "@/lib/utils";

/**
 * "Sign in" for visitors, "Account" once signed in. The header is shared by
 * cached marketing pages, so the swap happens in the browser from a readable
 * marker cookie instead of the private session cookie.
 */
export function AccountNavLink({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(hasSignedInHint(document.cookie));
  }, []);

  return (
    <Link
      href="/account"
      className={cn("btn btn-ghost btn-sm", className)}
      onClick={onClick}
    >
      {signedIn ? "Account" : "Sign in"}
    </Link>
  );
}
