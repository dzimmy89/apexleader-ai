import Link from "next/link";
import { BRAND } from "@/lib/brand";
import type { CourseLock } from "@/lib/learn/gate";

/**
 * Shown on a course page or a quiz when the reader cannot open the whole
 * course. Lessons are always open to read, so this is about the rest. The
 * one parchment block on the screen, with one primary action.
 */
export function LockedNotice({ lock, next }: { lock: CourseLock; next: string }) {
  if (lock === "open") return null;
  const loginHref = `/login?next=${encodeURIComponent(next)}`;
  return (
    <div className="parchment-card my-10 p-6 md:p-8">
      {lock === "sign-in" ? (
        <>
          <p className="section-eyebrow">Free with sign-in</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-[length:var(--text-h3)] leading-[1.15] text-on-parchment md:text-[1.875rem]">
            Every lesson is open to read. Sign in to keep your place.
          </p>
          <p className="mt-3 max-w-xl text-muted-on-parchment">
            The free courses open fully with your email: quizzes, progress and a tick on every lesson you finish. We
            send you a sign-in link; there is no password.
          </p>
          <div className="mt-6">
            <Link href={loginHref} className="btn btn-primary">
              Sign in with email
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="section-eyebrow">Coaching clients</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-[length:var(--text-h3)] leading-[1.15] text-on-parchment md:text-[1.875rem]">
            Read every lesson now. The rest comes with coaching.
          </p>
          <p className="mt-3 max-w-xl text-muted-on-parchment">
            Every lesson here is open to read, and the exercises open with your email. The quizzes and the coached
            notes come with private coaching with {BRAND.coachFirstName}, with a syllabus built around your business.
            Already a client? Sign in with the email you paid with.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/coaching" className="btn btn-primary">
              Private coaching
            </Link>
            <Link href={loginHref} className="btn btn-secondary">
              Already a client? Sign in
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
