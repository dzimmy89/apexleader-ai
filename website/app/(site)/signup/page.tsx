import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/account/login";

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

/** Signing in creates the account, so /signup is the sign-in page. */
export default async function SignupPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  redirect(`/login?next=${encodeURIComponent(safeNextPath(next))}`);
}
