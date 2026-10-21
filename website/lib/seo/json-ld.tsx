import { URLS } from "@/content/site";
import { BRAND } from "@/lib/brand";
import { absoluteUrl, SITE_URL } from "@/lib/seo/site-url";

type JsonLdNode = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const FOUNDER_ID = `${SITE_URL}/#founder`;

/** Profiles that belong to the business (YouTube, LinkedIn, X). Add as they exist. */
export const SAME_AS: readonly string[] = [];

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
    "@type": "ProfessionalService",
    "@id": ORGANIZATION_ID,
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: `${SITE_URL}/`,
    logo: absoluteUrl("/favicon.svg"),
    email: URLS.email,
    founder: { "@id": FOUNDER_ID },
    ...(SAME_AS.length ? { sameAs: [...SAME_AS] } : {}),
  };
}

export function founderNode(): JsonLdNode {
  return {
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: BRAND.coachName,
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
