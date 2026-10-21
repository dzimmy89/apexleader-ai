export type Segment = "community" | "group_coaching" | "private_coaching";

export type ClipMedia =
  | { source: "gcs"; mp4: string; poster: string; face: string; captions: string }
  | { source: "youtube"; videoId: string; poster: string; face: string };

type ClipBase = {
  id: string;
  name: string;
  segment: Segment;
  /** Written by the site; never the clip's YouTube title. */
  title: string;
  durationSec: number;
  media: ClipMedia;
  /** Shown when a clip describes an older format (for example daily calls). */
  formatNote?: string;
  /** Material-connection disclosure, when the person received anything for the video. */
  disclosure?: string;
};

export type UnverifiedTestimonial = ClipBase & { verified: false };

export type VerifiedTestimonial = ClipBase & {
  verified: true;
  /** Verbatim words from the clip, starting at `videoTimestamp`. */
  quote: string;
  videoTimestamp: string;
  verifiedBy: string;
  verifiedOn: string;
};

export type Testimonial = UnverifiedTestimonial | VerifiedTestimonial;

export function publishedTestimonials(
  items: readonly Testimonial[]
): VerifiedTestimonial[] {
  return items.filter((t): t is VerifiedTestimonial => t.verified === true);
}

export function segmentLabel(segment: Segment): string {
  switch (segment) {
    case "community":
      return "Community member";
    case "group_coaching":
      return "Group coaching member";
    case "private_coaching":
      return "Private coaching client";
    default: {
      const unhandled: never = segment;
      return unhandled;
    }
  }
}

export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
