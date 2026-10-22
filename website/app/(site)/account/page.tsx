import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Video } from "lucide-react";
import { CoachingArea } from "@/components/account/CoachingArea";
import { CoursesSection } from "@/components/account/CoursesSection";
import { LinkedEmails } from "@/components/account/LinkedEmails";
import { PlansAndBilling } from "@/components/account/PlansAndBilling";
import { SignAgreementButton } from "@/components/account/SignAgreementButton";
import { Chip, Notice, PageHeader, Panel, SubNav } from "@/components/system";
import { coachingEnded } from "@/lib/account/coaching-client";
import { dayBrief } from "@/lib/account/dates";
import { getAccountOverview, type AccountOverview } from "@/lib/account/overview";
import type { AccessState } from "@/lib/account/access";
import { getViewer } from "@/lib/learn/gate";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ link?: string }>;
}

type NextStep =
  | { kind: "sign" }
  | { kind: "link"; label: string; href: string; external?: boolean; icon?: "video" };

/** The one thing to do next, shown as the only gold button at the top. */
function nextStep(access: AccessState | null, overview: AccountOverview): NextStep | null {
  const coaching = overview.coaching;
  if (coaching) {
    const { client, upcoming, status } = coaching;
    if (!coachingEnded(client)) {
      if (!client.contractSignedAt && !client.fullAccess) return { kind: "sign" };
      const next = upcoming[0];
      if (next) {
        return next.meetUrl
          ? { kind: "link", label: `Join your call on ${dayBrief(next.scheduledAt)}`, href: next.meetUrl, external: true, icon: "video" }
          : { kind: "link", label: `Your next session is ${dayBrief(next.scheduledAt)}`, href: "#sessions" };
      }
      if (client.sessionsRemaining > 0) return { kind: "link", label: "Book your next session", href: "#sessions" };
    }
    if (status?.next?.href) return { kind: "link", label: `Continue: ${status.next.title}`, href: status.next.href };
  }
  const last = overview.progress?.lastVisited;
  if (last) return { kind: "link", label: `Continue: ${last.title}`, href: last.href };
  return access?.hasCourseAccess
    ? { kind: "link", label: "Browse the courses", href: "/university" }
    : { kind: "link", label: "See private coaching", href: "/coaching" };
}

function NextStepButton({ step }: { step: NextStep }) {
  if (step.kind === "sign") return <SignAgreementButton size="lg" />;
  const inner = (
    <>
      {step.icon === "video" ? <Video size={18} aria-hidden /> : null}
      {step.label}
    </>
  );
  if (step.external) {
    return (
      <a href={step.href} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg btn-wrap max-w-full">
        {inner}
      </a>
    );
  }
  return (
    <Link href={step.href} className="btn btn-primary btn-lg btn-wrap max-w-full">
      {inner}
    </Link>
  );
}

export default async function AccountPage({ searchParams }: PageProps) {
  const { link } = await searchParams;
  const viewer = await getViewer();
  if (!viewer.email) redirect("/login?next=/account");
  const access = viewer.access;
  const overview = await getAccountOverview(viewer);
  const { progress, billing, coaching } = overview;
  const step = nextStep(access, overview);
  const firstName = coaching?.client.name.trim().split(/\s+/)[0] || "";
  // Coaching clients hold a coaching grant; a manual grant is "full access".
  const fullAccess = Boolean(billing?.manual) || Boolean(coaching?.client.fullAccess);
  const member = fullAccess || (!coaching && Boolean(access?.hasMembership));
  const client = Boolean(coaching);
  const unsignedClient = client && !coaching!.client.contractSignedAt && !coaching!.client.fullAccess && !coachingEnded(coaching!.client);
  const accessEndsAt = billing?.coaching?.accessEndsAt ?? null;

  const nav = [
    ...(client ? [{ href: "#coaching", label: "Coaching" }] : []),
    { href: "#courses", label: "Courses" },
    { href: "#billing", label: "Billing" },
    { href: "#settings", label: "Settings" },
  ];

  return (
    <section className="px-6 py-[var(--space-section)]">
      <div className="mx-auto max-w-5xl space-y-14">
        <div className="space-y-6">
          <PageHeader
            eyebrow="Your account"
            title={firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
            intro={
              <span className="flex flex-wrap items-center gap-2">
                {client ? (
                  unsignedClient ? <Chip tone="warning">Coaching client · agreement to sign</Chip> : <Chip tone="success">Coaching client</Chip>
                ) : null}
                {member ? <Chip tone="success">{fullAccess ? "Full access" : "Course access"}</Chip> : null}
                {!client && !member ? <Chip>Free account</Chip> : null}
                <span className="font-[family-name:var(--font-ui)] text-[15px] text-[var(--color-text-muted)]">{viewer.email}</span>
              </span>
            }
            action={step ? <NextStepButton step={step} /> : null}
          />
          <SubNav items={nav} />
        </div>

        {link === "ok" ? (
          <Notice tone="success" title="Email added.">
            Anything under that email now shows on this account.
          </Notice>
        ) : link === "failed" ? (
          <Notice tone="warning" title="That email could not be added.">
            It may already be part of another account. Sign in with it to check, or email {BRAND.email}.
          </Notice>
        ) : null}

        {coaching ? <CoachingArea coaching={coaching} accessEndsAt={accessEndsAt} /> : null}

        {!access?.hasCourseAccess && !coaching ? (
          <div className="parchment-card p-6 md:p-8">
            <p className="section-eyebrow">Private coaching</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-[length:var(--text-h2)] leading-[1.1] text-on-parchment">
              The course library comes with coaching.
            </p>
            <p className="mt-2 max-w-2xl text-[17px] text-on-parchment">
              Private coaching with {BRAND.coachFirstName} opens every course, with a syllabus built around your business. If you
              paid under another email, add it under Settings.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/coaching" className="btn btn-primary">
                Private coaching
              </Link>
            </div>
          </div>
        ) : null}

        <CoursesSection progress={progress} hasCourseAccess={Boolean(access?.hasCourseAccess)} />

        {billing ? <PlansAndBilling billing={billing} hasCourseAccess={Boolean(access?.hasCourseAccess)} /> : null}

        <div id="settings" className="space-y-6">
          <div>
            <p className="section-eyebrow">Settings</p>
            <h2 className="mt-2 text-[length:var(--text-h2)] leading-[1.08]">Your sign-in</h2>
          </div>
          <Panel title="Emails on this account">
            <LinkedEmails primary={viewer.email} linked={(access?.emails || []).filter((e) => e !== viewer.email)} />
          </Panel>
          <Panel title="Sign out">
            <form action="/api/account/logout" method="post" className="flex flex-wrap items-center gap-4">
              <button type="submit" className="btn btn-secondary">
                Sign out
              </button>
              <span className="text-[15px] text-[var(--color-text-muted)]">Signing in again takes one email link or your Google account.</span>
            </form>
          </Panel>
        </div>
      </div>
    </section>
  );
}
