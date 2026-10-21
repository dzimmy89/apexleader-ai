import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og-image";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Private DeFi coaching with David Zimmerman";

export default function Image() {
  return renderOgImage({
    eyebrow: "Private coaching · from $750",
    title: "Private DeFi coaching with David Zimmerman.",
    footer: "1-on-1 education · You keep custody · Free 30-minute call first",
  });
}
