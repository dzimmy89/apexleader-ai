import Link from "next/link";
import { splitBlocks, type LessonSegment } from "@/lib/learn/blocks";
import { cn } from "@/lib/utils";
import { LessonMarkdown } from "./LessonMarkdown";
import { Checkpoint } from "./Checkpoint";
import { LessonVideo } from "./LessonVideo";

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

/**
 * A lesson or exercise body: markdown plus the course's :::blocks.
 * `showCoached` is for coaching clients: everyone else gets a short note
 * in place of each :::coached block, and its text never leaves the server.
 */
export function LessonBody({ body, showCoached = false }: { body: string; showCoached?: boolean }) {
  return <article className="lesson-prose">{renderSegments(splitBlocks(body), showCoached)}</article>;
}

function renderSegments(segments: LessonSegment[], showCoached: boolean): React.ReactNode[] {
  return segments.map((seg, i) => {
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
        return seg.image ? (
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
        ) : (
          <figure
            key={i}
            className="mx-auto my-8 flex w-full max-w-2xl flex-col items-center justify-center gap-1 border border-dashed border-[var(--color-border-strong)] px-6 py-10 text-center"
          >
            <span className="ui-label text-[var(--color-text-muted)]">Infographic in production</span>
            {seg.title ? (
              <figcaption className="font-[family-name:var(--font-ui)] text-[var(--color-text)]">{seg.title}</figcaption>
            ) : null}
          </figure>
        );
      case "video":
        return <LessonVideo key={i} video={seg} />;
      case "example":
        return (
          <details key={i} className="lesson-example notice my-8 block p-5 md:p-6">
            <summary className="cursor-pointer font-[family-name:var(--font-ui)] font-semibold text-[var(--color-text)]">
              {seg.title}
            </summary>
            <div className="mt-4 min-w-0">{renderSegments(seg.segments, showCoached)}</div>
          </details>
        );
      case "checkpoint":
        return <Checkpoint key={i} questions={seg.questions} />;
      case "coached":
        return showCoached ? (
          <aside key={i} className="notice notice-success prose-serif my-8 p-5 md:p-6 [&_p:last-child]:mb-0">
            <div className="min-w-0">
              <p className="ui-label mb-2 text-[var(--color-text)]">Coached work</p>
              <LessonMarkdown text={seg.text} />
            </div>
          </aside>
        ) : (
          <aside key={i} className="notice my-8">
            <div className="min-w-0">
              <span className="block font-semibold">Coached work</span>
              <span className="block text-[var(--color-text-muted)]">
                1-on-1 coaching clients take this exercise further on their own business and review it with their coach.{" "}
                <Link href="/coaching" className="underline">
                  See coaching
                </Link>
              </span>
            </div>
          </aside>
        );
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
  });
}
