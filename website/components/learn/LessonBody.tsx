import { splitBlocks } from "@/lib/learn/blocks";
import { cn } from "@/lib/utils";
import { LessonMarkdown } from "./LessonMarkdown";
import { Checkpoint } from "./Checkpoint";

const CALLOUT_LABEL: Record<string, string> = {
  "key-concept": "Key concept",
  takeaways: "Takeaways",
  warning: "Watch out",
  "try-it": "Try it",
};

/* The coloured bar on the left says what kind of note it is. */
const CALLOUT_TONE: Record<string, string> = {
  "key-concept": "",
  takeaways: "notice-success",
  warning: "notice-warning",
  "try-it": "",
};

/** A lesson or exercise body: markdown plus the course's :::blocks. */
export function LessonBody({ body }: { body: string }) {
  const segments = splitBlocks(body);
  return (
    <article className="lesson-prose">
      {segments.map((seg, i) => {
        switch (seg.type) {
          case "markdown":
            return <LessonMarkdown key={i} text={seg.text} />;
          case "callout":
            return (
              <aside key={i} className={cn("notice prose-serif my-8 p-5 md:p-6 [&_p:last-child]:mb-0", CALLOUT_TONE[seg.kind])}>
                <div className="min-w-0">
                  <p className="ui-label mb-2 text-[var(--color-text)]">{CALLOUT_LABEL[seg.kind]}</p>
                  <LessonMarkdown text={seg.text} />
                </div>
              </aside>
            );
          case "infographic":
            return (
              <figure key={i} className="my-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={seg.image}
                  alt={seg.alt}
                  loading="lazy"
                  className="mx-auto h-auto w-full max-w-2xl border border-[var(--color-border)]"
                />
                {seg.title ? (
                  <figcaption className="mt-2 text-center font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-muted)]">
                    {seg.title}
                  </figcaption>
                ) : null}
              </figure>
            );
          case "checkpoint":
            return <Checkpoint key={i} questions={seg.questions} />;
          case "interactive":
            return (
              <aside key={i} className="notice my-8">
                <div className="min-w-0">
                  <span className="block font-semibold">Interactive tool</span>
                  <span className="block text-[var(--color-text-muted)]">
                    {seg.title}. This tool is not on the site yet; the lesson works without it.
                  </span>
                </div>
              </aside>
            );
        }
      })}
    </article>
  );
}
