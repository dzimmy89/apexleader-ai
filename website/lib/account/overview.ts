import { getBillingSummary, type BillingSummary } from "@/lib/account/billing";
import type { AccessState } from "@/lib/account/access";
import { findCoachingClient, type CoachingClient } from "@/lib/account/coaching-client";
import type { Viewer } from "@/lib/learn/gate";
import { getProgress, type LearnProgress } from "@/lib/learn/progress";
import { listClientFiles, type ClientFile } from "@/lib/coaching/client-files";
import { getIntake } from "@/lib/coaching/intake";
import { listSessions, type CoachingSessionDoc } from "@/lib/coaching/sessions";
import { getClientSyllabus, syllabusStatus, type Syllabus, type SyllabusStatus } from "@/lib/coaching/syllabus";

/** Everything /account shows, loaded once so every section agrees. */
export interface CoachingOverview {
  client: CoachingClient;
  sessions: CoachingSessionDoc[];
  upcoming: CoachingSessionDoc[];
  past: CoachingSessionDoc[];
  syllabus: Syllabus | null;
  status: SyllabusStatus | null;
  goals: { summary: string; targetDate: string } | null;
  recordings: ClientFile[];
  materials: ClientFile[];
}

export interface AccountOverview {
  progress: LearnProgress | null;
  billing: BillingSummary | null;
  coaching: CoachingOverview | null;
}

/** Scheduled and not over yet. A call that is running still counts as upcoming. */
export function isUpcoming(session: CoachingSessionDoc, now = Date.now()): boolean {
  if (session.ignored || session.status !== "scheduled") return false;
  const start = Date.parse(session.scheduledAt);
  if (Number.isNaN(start)) return false;
  return start + (session.durationMins || 60) * 60_000 > now;
}

async function loadCoaching(access: AccessState, progressEmail: string, now: number): Promise<CoachingOverview | null> {
  const client = await findCoachingClient(access).catch((e) => {
    console.error("[account] client record failed", e);
    return null;
  });
  if (!client) return null;
  const [sessions, syllabus, progress, files, intake] = await Promise.all([
    listSessions({ clientId: client.email }).catch((e) => {
      console.error("[account] sessions failed", e);
      return [] as CoachingSessionDoc[];
    }),
    getClientSyllabus(client.email).catch(() => null),
    getProgress(progressEmail).catch(() => null),
    listClientFiles(client.email).catch((): ClientFile[] => []),
    getIntake(client.email).catch(() => null),
  ]);
  const visible = sessions.filter((s) => !s.ignored);
  const upcoming = visible.filter((s) => isUpcoming(s, now)).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const past = visible.filter((s) => !isUpcoming(s, now)).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  const shown = files.filter((f) => !f.hidden);
  // The goals card shows what David confirmed from the discovery call, once a syllabus is published.
  const goals =
    syllabus && intake?.status === "confirmed" && intake.form.goalsSummary
      ? { summary: intake.form.goalsSummary, targetDate: intake.form.targetDate }
      : null;
  return {
    client,
    sessions: visible,
    upcoming,
    past,
    syllabus,
    status: syllabus ? syllabusStatus(syllabus, progress, new Date(now)) : null,
    goals,
    recordings: shown.filter((f) => f.kind === "recording"),
    materials: shown.filter((f) => f.kind === "material"),
  };
}

export async function getAccountOverview(viewer: Viewer, now = Date.now()): Promise<AccountOverview> {
  const email = viewer.email!;
  const access = viewer.access;
  const [progress, billing, coaching] = await Promise.all([
    getProgress(email).catch(() => null),
    access
      ? getBillingSummary(access, now).catch((e) => {
          console.error("[account] billing summary failed", e);
          return null;
        })
      : Promise.resolve(null),
    access ? loadCoaching(access, email, now) : Promise.resolve(null),
  ]);
  return { progress, billing, coaching };
}
