import { TRACKS, type Agent } from "@/content/course";

/** One AI "hire": the role, the tool doing it, what it does and its rule. */
export function AgentCard({ agent, status = "Working" }: { agent: Agent; status?: string }) {
  const track = TRACKS[agent.track];
  return (
    <article className={`agent-card ${track.className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="agent-status">{status}</span>
        <span className="track-tag">{track.label}</span>
      </div>
      <div>
        <h3 className="text-xl text-[var(--color-text)]">{agent.role}</h3>
        <p className="mono-label mt-1 normal-case tracking-normal">{agent.tool}</p>
      </div>
      <p className="font-[family-name:var(--font-ui)] text-[length:var(--text-small)] leading-relaxed text-[var(--color-text-muted)]">
        {agent.task}
      </p>
      <p className="mt-auto border-t border-[var(--color-border-muted)] pt-3 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text)]">
        <span className="text-[var(--color-text-faint)]">Rule · </span>
        {agent.rule}
      </p>
    </article>
  );
}
