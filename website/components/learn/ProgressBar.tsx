/**
 * A meter with a sans "3 of 7 lessons" line above it. `label` names the bar
 * for screen readers; `unit` is the noun after the count.
 */
export function ProgressBar({ done, total, label, unit = "lessons" }: { done: number; total: number; label?: string; unit?: string }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="font-[family-name:var(--font-ui)]">
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[length:var(--text-small)]">
        <span className="font-medium text-[var(--color-text)]">
          {done} of {total} {unit}
        </span>
        <span className="tabular-nums text-[var(--color-text-muted)]">{pct}%</span>
      </div>
      <div className="meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label || "Progress"}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
