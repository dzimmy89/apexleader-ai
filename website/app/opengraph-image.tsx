import { BRAND } from "@/lib/brand";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og-image";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${BRAND.name}: ${BRAND.tagline.toLowerCase()}`;

export default function Image() {
  return renderOgImage({
    eyebrow: "The one-person company course",
    title: `${BRAND.tagline}.`,
    footer: "Claude · Duet · Dots · Grok Bot · Gemini · Cursor · Codex · GitHub",
  });
}
