import { cn } from "@/lib/utils";

const WEEK = [
  { day: "Mon", live: "Live Q&A with David" },
  { day: "Tue", live: null },
  { day: "Wed", live: "Live Q&A with David" },
  { day: "Thu", live: null },
  { day: "Fri", live: "Live Q&A with David" },
] as const;

/** Member live calls: five day panels in a row on desktop, a list on phones. Live days are raised and chipped. */
export function WeekTimetable({ className }: { className?: string }) {
  return (
    <figure className={className}>
      <ol
        aria-label="Weekly live calls for members"
        className="grid gap-3 lg:grid-cols-5"
      >
        {WEEK.map((slot) => (
          <li
            key={slot.day}
            className={cn(
              "flex items-center gap-4 p-4 font-[family-name:var(--font-ui)] lg:min-h-44 lg:flex-col lg:items-start lg:gap-6",
              slot.live ? "panel-raised" : "panel"
            )}
          >
            <span className="w-10 shrink-0 text-[15px] font-semibold text-[var(--color-text)] lg:w-auto">
              {slot.day}
            </span>
            {slot.live ? (
              <span className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1.5 lg:flex-col lg:items-start lg:justify-end">
                <span className="text-[15px] font-medium leading-snug text-[var(--color-text)]">
                  {slot.live}
                </span>
                <span className="chip chip-success">Live</span>
              </span>
            ) : (
              <span className="flex flex-1 items-center text-[14px] leading-snug text-[var(--color-text-muted)] lg:items-end">
                No live call · community &amp; courses
              </span>
            )}
          </li>
        ))}
      </ol>
      <figcaption className="mt-4 grid gap-1 font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-text-muted)] md:grid-cols-2 md:gap-6">
        <span>Every day: the community feed and all 31 courses.</span>
        <span>Live on Google Meet with David. Times are on the Skool Calendar.</span>
      </figcaption>
    </figure>
  );
}
