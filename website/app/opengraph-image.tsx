import { BRAND } from "@/lib/brand";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og-image";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${BRAND.name}: ${BRAND.tagline.toLowerCase()}`;

export default function Image() {
  return renderOgImage({
    eyebrow: BRAND.name,
    title: `${BRAND.tagline}, with ${BRAND.coachName}.`,
    footer: "1-on-1 coaching · A plan built for your business · Free call first",
  });
}
