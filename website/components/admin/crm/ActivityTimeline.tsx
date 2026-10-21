"use client";

import {
  Calendar,
  CreditCard,
  GitBranch,
  Mail,
  MessageSquare,
  StickyNote,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type TimelineEvent,
  type TimelineEventType,
  formatRelativeTime,
} from "@/lib/crm/timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/admin/crm/EmptyState";
import { SentEmailDialog } from "@/components/admin/crm/SentEmailDialog";
import { useState } from "react";

const ICONS: Record<TimelineEventType, typeof Mail> = {
  email: Mail,
  flow: GitBranch,
  application: User,
  session: Calendar,
  note: StickyNote,
  stage_change: MessageSquare,
  payment: CreditCard,
};

interface ActivityTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

function emailLogIdOf(event: TimelineEvent): string | null {
  const id = event.type === "email" ? event.meta?.emailLogId : null;
  return typeof id === "string" && id ? id : null;
}

function TimelineList({ events, onOpenEmail }: { events: TimelineEvent[]; onOpenEmail: (id: string) => void }) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Emails, flow enrollments, and coaching events will appear here."
        className="border-0 bg-transparent py-8"
      />
    );
  }

  return (
    <ul className="space-y-4">
      {events.map((event) => {
        const Icon = ICONS[event.type] || MessageSquare;
        return (
          <li
            key={event.id}
            className="flex gap-3 border-b border-[var(--color-border-muted)]/50 pb-4 last:border-0"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-panel)] text-[var(--color-accent)]">
              <Icon size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                {emailLogIdOf(event) ? (
                  <button
                    type="button"
                    onClick={() => onOpenEmail(emailLogIdOf(event) as string)}
                    className="text-left text-sm font-medium text-[var(--color-accent)] hover:underline"
                    title="Open the email that was sent"
                  >
                    {event.title}
                  </button>
                ) : (
                  <p className="text-sm font-medium text-[var(--color-text-on-obsidian)]">
                    {event.title}
                  </p>
                )}
                <time
                  className="shrink-0 font-mono text-[10px] text-[var(--color-text-muted)]"
                  dateTime={event.at}
                  title={new Date(event.at).toLocaleString()}
                >
                  {formatRelativeTime(event.at)}
                </time>
              </div>
              {event.description && (
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {event.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  const [openEmail, setOpenEmail] = useState<string | null>(null);
  const filterTypes: { id: string; label: string; types?: TimelineEventType[] }[] = [
    { id: "all", label: "All" },
    { id: "email", label: "Email", types: ["email"] },
    { id: "flows", label: "Flows", types: ["flow"] },
    { id: "notes", label: "Notes", types: ["note", "stage_change"] },
    { id: "payments", label: "Payments", types: ["payment"] },
  ];

  return (
    <div className={cn("rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg-panel)] p-4", className)}>
      <Tabs defaultValue="all">
        <TabsList className="mb-4 h-8 bg-[var(--color-bg-obsidian)]">
          {filterTypes.map((f) => (
            <TabsTrigger key={f.id} value={f.id} className="text-xs">
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {filterTypes.map((f) => {
          const filtered =
            f.id === "all"
              ? events
              : events.filter((e) => f.types?.includes(e.type));
          return (
            <TabsContent key={f.id} value={f.id}>
              <TimelineList events={filtered} onOpenEmail={setOpenEmail} />
            </TabsContent>
          );
        })}
      </Tabs>
      <SentEmailDialog emailLogId={openEmail} onClose={() => setOpenEmail(null)} />
    </div>
  );
}
