import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/seo/og-image";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "DeFi University — live DeFi education with David Zimmerman";

export default function Image() {
  return renderOgImage({
    eyebrow: "DeFi University",
    title: "Learn DeFi live, with David Zimmerman.",
    footer: "Membership $97/mo on Skool · Private 1-on-1 coaching · Education only",
  });
}
