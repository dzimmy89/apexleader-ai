export type TimelineEventType =
  | "email"
  | "flow"
  | "application"
  | "session"
  | "note"
  | "stage_change"
  | "payment";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  at: string;
  meta?: Record<string, unknown>;
}

interface EmailLogEntry {
  id?: string;
  subject?: string;
  status?: string;
  source?: string;
  sentAt?: string;
  flowType?: string;
}

interface FlowEntry {
  id?: string;
  flowType?: string;
  status?: string;
  triggeredAt?: string;
  steps?: { stepId: string; sendAt: string; sentAt: string | null }[];
}

interface ApplicationEntry {
  id?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  discoveryCallAt?: string;
  notes?: string;
}

interface SessionEntry {
  id?: string;
  scheduledAt?: string;
  status?: string;
  sharedNotes?: string;
}

interface ActivityLogEntry {
  id?: string;
  type?: string;
  title?: string;
  description?: string;
  at?: string;
}

export function buildPersonTimeline(input: {
  emailLog?: EmailLogEntry[];
  flows?: FlowEntry[];
  applications?: ApplicationEntry[];
  sessions?: SessionEntry[];
  activityLog?: ActivityLogEntry[];
  notes?: { id: string; text: string; at: string }[];
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const log of input.emailLog || []) {
    if (!log.sentAt) continue;
    events.push({
      id: `email-${log.id || log.sentAt}`,
      type: "email",
      title: log.subject || "Email sent",
      description: [log.status, log.source, log.flowType].filter(Boolean).join(" · "),
      at: log.sentAt,
      meta: { status: log.status, flowType: log.flowType, emailLogId: log.id || null },
    });
  }

  for (const flow of input.flows || []) {
    if (flow.triggeredAt) {
      events.push({
        id: `flow-${flow.id || flow.triggeredAt}`,
        type: "flow",
        title: `Enrolled in ${flow.flowType || "flow"}`,
        description: flow.status ? `Status: ${flow.status}` : undefined,
        at: flow.triggeredAt,
        meta: { flowType: flow.flowType, status: flow.status },
      });
    }
    for (const step of flow.steps || []) {
      if (step.sentAt) {
        events.push({
          id: `flow-step-${flow.id}-${step.stepId}`,
          type: "flow",
          title: `Flow step sent: ${step.stepId}`,
          at: step.sentAt,
          meta: { flowType: flow.flowType },
        });
      }
    }
  }

  for (const app of input.applications || []) {
    if (app.createdAt) {
      events.push({
        id: `app-${app.id || app.createdAt}`,
        type: "application",
        title: "Coaching application submitted",
        description: app.status ? `Status: ${app.status}` : undefined,
        at: app.createdAt,
        meta: { applicationId: app.id, status: app.status },
      });
    }
    if (app.discoveryCallAt) {
      events.push({
        id: `discovery-${app.id || app.discoveryCallAt}`,
        type: "application",
        title: "Discovery call scheduled",
        at: app.discoveryCallAt,
        meta: { applicationId: app.id },
      });
    }
  }

  for (const session of input.sessions || []) {
    if (!session.scheduledAt) continue;
    events.push({
      id: `session-${session.id || session.scheduledAt}`,
      type: "session",
      title: `Coaching session ${session.status || "scheduled"}`,
      description: session.sharedNotes,
      at: session.scheduledAt,
      meta: { sessionId: session.id, status: session.status },
    });
  }

  for (const entry of input.activityLog || []) {
    if (!entry.at) continue;
    events.push({
      id: `activity-${entry.id || entry.at}`,
      type: (entry.type as TimelineEventType) || "note",
      title: entry.title || "Activity",
      description: entry.description,
      at: entry.at,
    });
  }

  for (const note of input.notes || []) {
    events.push({
      id: note.id,
      type: "note",
      title: "Note",
      description: note.text,
      at: note.at,
    });
  }

  return events.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
