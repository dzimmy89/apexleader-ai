import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/learn/LoginForm";
import { Notice, PageHeader } from "@/components/system";
import { getAccountEmail } from "@/lib/account/session";
import { safeNextPath } from "@/lib/account/login";

export const metadata: Metadata = {
  title: "Sign in or create an account",
  description: "Sign in to FromAItoBusiness, or create a free account, with Google or an email link. No password.",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ next?: string; expired?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { next, expired } = await searchParams;
  const target = safeNextPath(next);
  if (await getAccountEmail()) redirect(target);
  return (
    <section className="px-6 py-[var(--space-section)]">
      <div className="mx-auto max-w-md">
        <PageHeader
          eyebrow="Members, clients and free learners"
          title="Sign in or create an account"
          intro="Continue with Google, or get a sign-in link by email. No password. Coaching clients get every course."
        />
        {expired ? (
          <Notice tone="warning" className="mt-6">
            That sign-in link has expired or was already used. Ask for a new one below.
          </Notice>
        ) : null}
        <div className="mt-8">
          <LoginForm next={target} />
        </div>
      </div>
    </section>
  );
}
