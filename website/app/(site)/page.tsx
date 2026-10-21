import type { Metadata } from "next";
import { PortraitHero } from "@/components/editorial/PortraitHero";
import { URLS } from "@/content/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Placeholder home. The real ApexLeader.ai home page is built in phase 4.
export default function HomePage() {
  return (
    <PortraitHero
      eyebrow="Private AI coaching"
      title="Private AI coaching for business owners."
      subtitle="One-to-one coaching on using AI and building with AI in your own business. Start with a free 30-minute call."
      primary={{
        label: "Book a free 30-minute call",
        href: URLS.coachingDiscovery,
        variant: "coaching",
        location: "hero_home",
      }}
      secondary={{
        label: "See private coaching",
        href: "/coaching",
        variant: "ghost",
        location: "home_hero_coaching",
      }}
      portraitCaption="Your coach"
    />
  );
}
