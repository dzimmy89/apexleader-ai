import { URLS } from "@/content/site";
import { segmentLabel, type VerifiedTestimonial } from "@/content/testimonial";
import { absoluteUrl, SITE_URL } from "@/lib/seo/site-url";

type JsonLdNode = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const FOUNDER_ID = `${SITE_URL}/#david-zimmerman`;

export const SAME_AS = [
  "https://www.youtube.com/@DeFiUniversity-xyz",
  "https://www.skool.com/defiuniversity",
] as const;

export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : { "@context": "https://schema.org", ...data };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function organizationNode(): JsonLdNode {
  return {
    "@type": "EducationalOrganization",
    "@id": ORGANIZATION_ID,
    name: "DeFi University",
    legalName: "DeFi University LLC",
    url: `${SITE_URL}/`,
    logo: absoluteUrl("/favicon.svg"),
    email: URLS.email,
    founder: { "@id": FOUNDER_ID },
    sameAs: [...SAME_AS],
  };
}

export function founderNode(): JsonLdNode {
  return {
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: "David Zimmerman",
    jobTitle: "Founder",
    image: absoluteUrl("/images/david-zimmerman.jpg"),
    url: absoluteUrl("/about"),
    worksFor: { "@id": ORGANIZATION_ID },
  };
}

export function faqNode(
  items: readonly { question: string; answer: string }[]
): JsonLdNode {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function isoDuration(seconds: number): string {
  const total = Math.round(seconds);
  return `PT${Math.floor(total / 60)}M${total % 60}S`;
}

export function videoObjectNode(
  clip: VerifiedTestimonial,
  uploadDate: string
): JsonLdNode {
  const base = {
    "@type": "VideoObject",
    name: `${clip.name}: ${clip.title}`,
    description: `${clip.name}, ${segmentLabel(clip.segment).toLowerCase()} at DeFi University: “${clip.quote}”`,
    thumbnailUrl: clip.media.poster,
    uploadDate,
    duration: isoDuration(clip.durationSec),
    publisher: { "@id": ORGANIZATION_ID },
  };
  switch (clip.media.source) {
    case "gcs":
      return { ...base, contentUrl: clip.media.mp4 };
    case "youtube":
      return {
        ...base,
        embedUrl: `https://www.youtube-nocookie.com/embed/${clip.media.videoId}`,
      };
    default: {
      const unhandled: never = clip.media;
      return unhandled;
    }
  }
}

export function breadcrumbNode(
  trail: readonly { name: string; path: string }[]
): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
