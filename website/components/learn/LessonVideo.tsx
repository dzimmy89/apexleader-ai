import type { LessonSegment } from "@/lib/learn/blocks";

type Video = Extract<LessonSegment, { type: "video" }>;

const KIND_LABEL: Record<Video["kind"], string> = {
  overview: "Lesson overview",
  inline: "Video",
  "exercise-setup": "The task",
  "exercise-reveal": "Walkthrough",
};

/**
 * One lesson clip: a plain <video> with its poster and English captions, and
 * the narration as text underneath, so the lesson still works muted or
 * without video. Signed links come from another origin, so the player asks
 * for CORS (the bucket allows the site's origin) to load the caption track.
 */
export function LessonVideo({ video }: { video: Video }) {
  const crossOrigin = /^https?:\/\//.test(video.src) ? "anonymous" : undefined;
  return (
    <figure className="lesson-video my-8" data-video-id={video.id || undefined}>
      <p className="ui-label mb-2 text-[var(--color-text-muted)]">{KIND_LABEL[video.kind]}</p>
      <video
        controls
        playsInline
        preload="metadata"
        poster={video.poster || undefined}
        crossOrigin={crossOrigin}
        className="aspect-video h-auto w-full border border-[var(--color-border)] bg-[var(--color-panel)]"
      >
        <source src={video.src} type={video.src.split("?")[0]!.endsWith(".webm") ? "video/webm" : "video/mp4"} />
        {video.captions ? <track kind="captions" src={video.captions} srcLang="en" label="English" default /> : null}
      </video>
      {video.transcript ? (
        <details className="mt-2">
          <summary className="cursor-pointer font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Read the transcript
          </summary>
          <p className="mt-2 text-[var(--color-text-muted)]">{video.transcript}</p>
        </details>
      ) : null}
    </figure>
  );
}
