import { BRAND } from "@/lib/brand";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og-image";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `Private AI coaching with ${BRAND.coachName}`;

export default function Image() {
  return renderOgImage({
    eyebrow: "Private coaching",
    title: `Private AI coaching with ${BRAND.coachName}.`,
    footer: "1-on-1 sessions · Your own syllabus · Free 30-minute call first",
  });
}
