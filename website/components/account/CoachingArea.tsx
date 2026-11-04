import Link from "next/link";
import { Check, Circle, Download, ExternalLink, FileText, Star, Video } from "lucide-react";
import { BookSession } from "@/components/account/BookSession";
import { SignAgreementButton } from "@/components/account/SignAgreementButton";
import { SyllabusTaskCheck } from "@/components/account/SyllabusTaskCheck";
import { TelegramConnect } from "@/components/account/TelegramConnect";
import { Chip, EmptyState, Meter, Notice, Panel } from "@/components/system";
import { bookingBlocker, coachingEnded } from "@/lib/account/coaching-client";
import { dateTimeET, dayBrief, dayShort } from "@/lib/account/dates";
import type { CoachingOverview } from "@/lib/account/overview";
import { telegramDeepLink } from "@/lib/account/telegram";
import type { ClientFile } from "@/lib/coaching/client-files";
import type { CoachingSessionDoc } from "@/lib/coaching/sessions";
import { PACE_LABEL, type Syllabus, type SyllabusStatus } from "@/lib/coaching/syllabus";
import type { ResolvedItem } from "@/lib/coaching/syllabus-plan";
import { BRAND } from "@/lib/brand";

const SESSION_MINUTES = 60;

function statusChip(status: string) {
  switch (status) {
    case "onboarded":
    case "active":
    case "paid":
      return <Chip tone="success">Active</Chip>;
    case "paid_pending_contract":
      return <Chip tone="warning">Agreement to sign</Chip>;
    case "completed":
      return <Chip>Completed</Chip>;
    case "cancelled":
    case "subscription_cancelled":
    case "refunded":
      return <Chip tone="danger">{status === "refunded" ? "Refunded" : "Cancelled"}</Chip>;
    default:
      return <Chip tone="success">Active</Chip>;
  }
}

/** Private coaching on /account: next step, sessions, syllabus, documents and messages. */
export function CoachingArea({ coaching, accessEndsAt }: { coaching: CoachingOverview; accessEndsAt: string | null }) {
  const { client, upcoming, past, syllabus, status, goals, recordings, materials } = coaching;
  const next = upcoming[0] ?? null;
  const blocker = bookingBlocker(client);
  const ended = coachingEnded(client);
  const unsigned = !client.contractSignedAt && !client.fullAccess;

  return (
    <div id="coaching" className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="section-eyebrow">Private coaching</p>
          <h2 className="mt-2 text-[length:var(--text-h2)] leading-[1.08]">{client.packageName}</h2>
        </div>
        <div className="flex items-center gap-2">{statusChip(client.status)}</div>
      </div>

      <div className="panel grid grid-cols-1 divide-y divide-[var(--color-border)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <AccountStat value={client.sessionsTotal ? `${client.sessionsRemaining}` : "—"} label={client.sessionsTotal ? `of ${client.sessionsTotal} sessions left` : "sessions"} />
        <AccountStat value={next ? dayBrief(next.scheduledAt) : "None"} label={next ? "next session" : "next session booked"} />
        <AccountStat value={accessEndsAt ? dayShort(accessEndsAt) : "Open"} label={accessEndsAt ? "coaching and courses until" : "course access"} />
      </div>

      <SessionsPanel client={client} next={next} upcoming={upcoming} past={past} blocker={blocker} unsigned={unsigned} ended={ended} />

      <Panel id="syllabus" title="Your syllabus" action={status ? <PaceChip status={status} /> : null}>
        {goals ? (
          <div className="mb-6 border-l-2 border-[var(--color-accent)] pl-4">
            <p className="ui-label">Your goals</p>
            <p className="mt-1 whitespace-pre-line text-[17px]">{goals.summary}</p>
            {goals.targetDate ? (
              <p className="mt-1 text-[15px] text-[var(--color-text-muted)]">Target: {dayShort(goals.targetDate)}</p>
            ) : null}
          </div>
        ) : null}
        {syllabus && status ? (
          <SyllabusBody syllabus={syllabus} status={status} />
        ) : (
          <EmptyState title="David is building your syllabus.">
            It is drafted from your discovery call and your goals, and shows here as soon as it is published.
          </EmptyState>
        )}
      </Panel>

      <Panel id="documents" title="Documents">
        <AgreementRow client={client} unsigned={unsigned && !ended} />
        {recordings.length ? <FileList title="Call recordings" files={recordings} /> : null}
        {materials.length ? <FileList title="Materials from David" files={materials} /> : null}
        {!recordings.length && !materials.length ? (
          <p className="mt-5 text-[15px] text-[var(--color-text-muted)]">
            Call recordings and anything David shares with you will appear here after your sessions.
          </p>
        ) : null}
      </Panel>

      <Panel id="messages" title="Messages">
        <TelegramConnect deepLink={telegramDeepLink({ name: client.name, packageName: client.packageName })} savedHandle={client.telegramHandle} />
        <NotesFromDavid sessions={past} />
      </Panel>
    </div>
  );
}

function AccountStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-0 items-baseline gap-3 px-5 py-3 sm:block sm:py-4">
      <span className="block font-[family-name:var(--font-display)] text-[1.5rem] leading-none sm:text-[2rem]">{value}</span>
      <span className="mt-1.5 block font-[family-name:var(--font-ui)] text-[12px] leading-snug text-[var(--color-text-muted)] sm:text-[14px]">{label}</span>
    </div>
  );
}

function PaceChip({ status }: { status: SyllabusStatus }) {
  const tone = status.pace === "behind" ? "danger" : status.pace === "done" || status.pace === "ahead" ? "success" : status.pace === "on-track" ? "info" : "neutral";
  const week =
    status.currentWeek > 0 && status.currentWeek <= status.weeks.length
      ? `Week ${status.currentWeek} of ${status.weeks.length}`
      : `${status.weeks.length} weeks`;
  return (
    <span className="flex flex-wrap items-center gap-2">
      <Chip tone={tone}>{PACE_LABEL[status.pace]}</Chip>
      <span className="font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-text-muted)]">{week}</span>
    </span>
  );
}

function SessionsPanel({
  client,
  next,
  upcoming,
  past,
  blocker,
  unsigned,
  ended,
}: {
  client: CoachingOverview["client"];
  next: CoachingSessionDoc | null;
  upcoming: CoachingSessionDoc[];
  past: CoachingSessionDoc[];
  blocker: string | null;
  unsigned: boolean;
  ended: boolean;
}) {
  return (
    <Panel id="sessions" title="Sessions">
      {next ? (
        <div className="panel-raised p-5">
          <p className="ui-label">Next session</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-[length:var(--text-h3)] leading-tight">
            {dateTimeET(next.scheduledAt)}
          </p>
          <p className="mt-1 text-[15px] text-[var(--color-text-muted)]">
            {next.durationMins || SESSION_MINUTES} minutes on Google Meet. The calendar invite shows it in your timezone.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {next.meetUrl ? (
              <a href={next.meetUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <Video size={18} aria-hidden /> Join on Google Meet
              </a>
            ) : null}
            <a href={`mailto:${BRAND.email}?subject=Reschedule%20my%20coaching%20session`} className="btn btn-ghost">
              Need to reschedule? Email David
            </a>
          </div>
          {upcoming.length > 1 ? (
            <ul className="mt-5 space-y-1 text-[15px] text-[var(--color-text-muted)]">
              {upcoming.slice(1).map((s) => (
                <li key={s.id}>
                  Also booked: {dateTimeET(s.scheduledAt)}
                  {s.meetUrl ? (
                    <>
                      {" · "}
                      <a href={s.meetUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline underline-offset-4">
                        Meet link
                      </a>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className={next ? "mt-6" : ""}>
        {blocker ? (
          <Notice
            tone={ended ? "info" : "warning"}
            title={ended ? "This coaching package has ended." : unsigned ? "Sign your agreement to book sessions." : "No sessions left in your package."}
          >
            {unsigned && !ended ? (
              <span className="mt-3 block">
                <SignAgreementButton size="sm" tone="secondary" />
              </span>
            ) : (
              <span>
                {ended ? "Your notes, recordings and agreement stay here. " : "Want to keep going? "}
                <a href={`mailto:${BRAND.email}?subject=More%20coaching%20sessions`} className="underline underline-offset-4">
                  {ended ? "Email David to start again" : "Email David about more sessions"}
                </a>
                .
              </span>
            )}
          </Notice>
        ) : (
          <div>
            {next ? null : (
              <p className="mb-4 text-[17px]">
                {client.sessionsRemaining} of {client.sessionsTotal || client.sessionsRemaining} sessions left. Book the next one when you are ready.
              </p>
            )}
            <BookSession packageId={client.packageId || undefined} durationMins={SESSION_MINUTES} open={!next} />
          </div>
        )}
      </div>

      {past.length ? (
        <div className="mt-8">
          <p className="ui-label mb-2">Past sessions</p>
          <div>
            {past.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function sessionChip(status: CoachingSessionDoc["status"]) {
  if (status === "completed") return <Chip tone="success">Completed</Chip>;
  if (status === "cancelled") return <Chip tone="danger">Cancelled</Chip>;
  if (status === "no-show") return <Chip tone="danger">Missed</Chip>;
  return <Chip tone="info">Scheduled</Chip>;
}

function SessionRow({ session }: { session: CoachingSessionDoc }) {
  return (
    <div className="row flex-col items-stretch gap-1">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <div className="row-label whitespace-nowrap">{dateTimeET(session.scheduledAt)}</div>
          <div className="row-meta">
            {session.durationMins || SESSION_MINUTES} minutes
            {session.title ? ` · ${session.title}` : ""}
          </div>
        </div>
        <div className="ml-auto shrink-0">{sessionChip(session.status)}</div>
      </div>
      {session.sharedNotes ? <p className="mt-1 whitespace-pre-line font-[family-name:var(--font-body)] text-[15px]">{session.sharedNotes}</p> : null}
    </div>
  );
}

function AgreementRow({ client, unsigned }: { client: CoachingOverview["client"]; unsigned: boolean }) {
  const signed = Boolean(client.contractSignedAt);
  return (
    <div className="row flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <div className="row-label flex items-center gap-2">
          <FileText size={18} className="shrink-0 text-[var(--color-accent)]" aria-hidden />
          Coaching agreement
          {signed ? <Chip tone="success">Signed</Chip> : unsigned ? <Chip tone="warning">To sign</Chip> : null}
        </div>
        <div className="row-meta">
          {signed
            ? client.signedContractPdfUrl
              ? `Signed ${dayShort(client.contractSignedAt!)}.`
              : `Signed ${dayShort(client.contractSignedAt!)} before this site existed. For a copy, email ${BRAND.email}.`
            : client.fullAccess
              ? "Not needed for your access."
              : "Not signed yet. Booking opens once it is."}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {client.signedContractPdfUrl ? (
          <>
            <a href="/api/account/contract?inline=1" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              <ExternalLink size={14} aria-hidden /> View
            </a>
            <a href="/api/account/contract" className="btn btn-ghost btn-sm">
              <Download size={14} aria-hidden /> PDF
            </a>
          </>
        ) : unsigned ? (
          <SignAgreementButton size="sm" tone="secondary" />
        ) : null}
      </div>
    </div>
  );
}

function FileList({ title, files }: { title: string; files: ClientFile[] }) {
  return (
    <div className="mt-6">
      <p className="ui-label mb-2">{title}</p>
      <ul className="space-y-3">
        {files.map((f) => (
          <li key={f.id} className="panel-raised p-4">
            {f.driveFileId ? (
              <>
                <p className="text-[17px]">{f.title}</p>
                <video className="mt-3 aspect-video w-full max-w-full bg-black" controls preload="metadata" src={`/api/account/files/${f.id}`}>
                  <a href={`/api/account/files/${f.id}`}>Watch the replay</a>
                </video>
              </>
            ) : (
              <a
                href={`/api/account/files/${f.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 text-[17px] hover:text-[var(--color-accent)]"
              >
                {f.url ? <ExternalLink size={16} aria-hidden /> : <Download size={16} aria-hidden />}
                {f.title}
              </a>
            )}
            <p className="mt-1 font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-text-muted)]">
              {f.sessionDate ? dayShort(f.sessionDate) : dayShort(f.createdAt)}
            </p>
            {f.note ? <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">{f.note}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NotesFromDavid({ sessions }: { sessions: CoachingSessionDoc[] }) {
  const withNotes = sessions.filter((s) => s.sharedNotes);
  return (
    <div className="mt-8">
      <p className="ui-label mb-2">Notes from David</p>
      {withNotes.length ? (
        <div>
          {withNotes.map((s) => (
            <div key={s.id} className="row items-start">
              <div className="min-w-0">
                <div className="row-meta">{dayShort(s.scheduledAt)}</div>
                <p className="mt-1 whitespace-pre-line font-[family-name:var(--font-body)] text-[16px]">{s.sharedNotes}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[15px] text-[var(--color-text-muted)]">
          Notes David shares after a session show here. Day to day, Telegram is the fastest way to reach him.
        </p>
      )}
    </div>
  );
}

const KIND_LABEL: Record<ResolvedItem["kind"], string> = {
  lesson: "Lesson",
  exercise: "Exercise",
  quiz: "Quiz",
  task: "Task",
  milestone: "Milestone",
};

function SyllabusBody({ syllabus, status }: { syllabus: Syllabus; status: SyllabusStatus }) {
  const thisWeek = status.weeks[Math.min(Math.max(status.currentWeek, 1), status.weeks.length) - 1] ?? status.weeks[0];
  return (
    <div className="space-y-6">
      {syllabus.note ? <p className="max-w-3xl whitespace-pre-line text-[17px]">{syllabus.note}</p> : null}
      {syllabus.version > 1 && syllabus.changeNote ? (
        <Notice tone="info" title={`Updated${syllabus.publishedAt ? ` ${dayShort(syllabus.publishedAt)}` : ""}`}>
          {syllabus.changeNote}
        </Notice>
      ) : null}

      <div>
        <div className="flex items-baseline justify-between gap-3 font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-text-muted)]">
          <span>
            {status.done} of {status.total} done
          </span>
          {status.overdue > 0 ? <Chip tone="danger">{status.overdue} overdue</Chip> : null}
        </div>
        <Meter value={status.done} max={status.total} className="mt-2" />
      </div>

      {status.next ? (
        <div className="panel-raised border-l-2 border-l-[var(--color-accent)] p-5">
          <p className="ui-label">Next up</p>
          {status.next.href ? (
            <Link href={status.next.href} className="mt-1 block font-[family-name:var(--font-display)] text-[length:var(--text-h3)] leading-tight hover:text-[var(--color-accent)]">
              {status.next.title}
            </Link>
          ) : (
            <p className="mt-1 font-[family-name:var(--font-display)] text-[length:var(--text-h3)] leading-tight">{status.next.title}</p>
          )}
          <p className="mt-1 font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-text-muted)]">
            {[KIND_LABEL[status.next.kind], status.next.courseTitle, status.next.minutes ? `about ${status.next.minutes} min` : "", status.next.detail]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {status.next.href ? (
            <Link href={status.next.href} className="btn btn-primary mt-4">
              Continue
            </Link>
          ) : null}
        </div>
      ) : null}

      {status.milestones.length ? (
        <ol className="flex flex-wrap gap-2" aria-label="Milestones">
          {status.milestones.map((m) => (
            <li key={m.id}>
              <Chip tone={m.done ? "success" : "neutral"} className="h-auto whitespace-normal py-1 text-left">
                {m.done ? <Check size={14} aria-hidden /> : <Star size={14} aria-hidden />}
                {m.title} · week {m.week}
              </Chip>
            </li>
          ))}
        </ol>
      ) : null}

      <ol className="space-y-2">
        {status.weeks.map((week) => (
          <li key={week.number}>
            <details className="group border border-[var(--color-border)] bg-[var(--color-bg)]" open={week.number === thisWeek?.number}>
              <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="font-[family-name:var(--font-ui)] text-[16px] font-medium">
                    Week {week.number}
                    {week.number === thisWeek?.number && status.currentWeek === week.number ? (
                      <span className="ml-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--color-accent)]">This week</span>
                    ) : null}
                  </span>
                  <span className="block font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-text-muted)]">
                    From {dayShort(week.starts)}
                    {week.goal ? ` · ${week.goal}` : ""}
                  </span>
                </span>
                <span className="shrink-0 font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-text-muted)]">
                  {week.paused ? "Break" : `${week.done} of ${week.total}`}
                </span>
              </summary>
              <div className="border-t border-[var(--color-border)] px-4 py-4">
                {week.note ? <p className="mb-4 whitespace-pre-line text-[15px] text-[var(--color-text-muted)]">{week.note}</p> : null}
                {week.paused && !week.items.length ? <p className="text-[15px] text-[var(--color-text-muted)]">No work planned this week.</p> : null}
                <ul className="space-y-3">
                  {week.items.map((item) => (
                    <li key={item.id} className={`flex gap-3 ${item.skipped ? "opacity-60" : ""}`}>
                      {item.kind === "task" ? (
                        <SyllabusTaskCheck itemId={item.id} done={item.done} title={item.title} />
                      ) : (
                        <span aria-hidden="true" className={`mt-0.5 ${item.done ? "text-[var(--color-success)]" : "text-[var(--color-text-faint)]"}`}>
                          {item.kind === "milestone" ? <Star size={18} /> : item.done ? <Check size={18} /> : <Circle size={18} />}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        {item.href ? (
                          <Link href={item.href} className="text-[16px] hover:text-[var(--color-accent)]">
                            {item.title}
                          </Link>
                        ) : (
                          <span className={`text-[16px] ${item.kind === "milestone" ? "font-medium" : ""}`}>{item.title}</span>
                        )}
                        <span className="sr-only">{item.done ? " (done)" : ""}</span>
                        <span className="block font-[family-name:var(--font-ui)] text-[13px] text-[var(--color-text-muted)]">
                          {[
                            KIND_LABEL[item.kind],
                            item.courseTitle,
                            item.kind !== "milestone" && item.minutes ? `${item.minutes} min` : "",
                            item.skipped ? "you know this already" : "",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        {item.detail ? <span className="block text-[14px] text-[var(--color-text-muted)]">{item.detail}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
