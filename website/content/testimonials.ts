import "server-only";
import {
  publishedTestimonials,
  type ClipMedia,
  type Segment,
  type Testimonial,
  type VerifiedTestimonial,
} from "@/content/testimonial";

export type { Segment, Testimonial, VerifiedTestimonial };
export { publishedTestimonials };

const MEDIA_BASE = "https://storage.googleapis.com/dfu-public-media/testimonials";
const MEDIA_VERSION = "v1";
/** Date the self-hosted clips were published (VideoObject uploadDate). */
export const MEDIA_PUBLISHED_ON = "2026-10-03";

function gcs(person: string, id: string, version: string = MEDIA_VERSION): ClipMedia {
  const stem = `${MEDIA_BASE}/${person}/${id}-${version}`;
  return {
    source: "gcs",
    mp4: `${stem}.mp4`,
    poster: `${stem}.jpg`,
    face: `${stem}-face.jpg`,
    captions: `${stem}.vtt`,
  };
}

const VERIFIED = {
  verified: true,
  verifiedBy: "David Zimmerman",
  verifiedOn: "2026-10-03",
} as const;

/**
 * Every clip here passed the testimonial gate: the quote is verbatim and spoken by the
 * member on screen, and trims remove income, returns, tax, and trade-instruction claims.
 * Clips and interviews the gate rejected are not listed.
 */
export const testimonials: readonly Testimonial[] = [
  {
    id: "ramzy-zero-to-understanding",
    name: "Ramzy",
    segment: "private_coaching",
    title: "From zero to understanding DeFi",
    quote: "After I did one year of almost coaching by you and the community, it's really like, I feel like I'm a completely different person.",
    videoTimestamp: "0:59",
    durationSec: 79.04,
    media: gcs("ramzy", "ramzy-zero-to-understanding"),
    ...VERIFIED,
  },
  {
    id: "ramzy-talk-my-language",
    name: "Ramzy",
    segment: "community",
    title: "A TradFi trader learning DeFi",
    quote: "I really like your style, specifically you, because you talk my language.",
    videoTimestamp: "0:31",
    durationSec: 77.68,
    media: gcs("ramzy", "ramzy-talk-my-language"),
    ...VERIFIED,
  },
  {
    id: "ramzy-told-his-family",
    name: "Ramzy",
    segment: "community",
    title: "Why he told his family to join",
    quote: "Even to the point I recommended my daughter and her husband to join you.",
    videoTimestamp: "0:01",
    durationSec: 29.0,
    media: gcs("ramzy", "ramzy-told-his-family"),
    ...VERIFIED,
  },
  {
    id: "paulo-afraid-to-fluent",
    name: "Paulo",
    segment: "community",
    title: "From afraid to fluent",
    quote: "Before DeFi University, I was afraid that I didn't understand it properly … I consider myself fluent in DeFi today.",
    videoTimestamp: "0:05",
    durationSec: 71.28,
    media: gcs("paulo", "paulo-afraid-to-fluent"),
    ...VERIFIED,
  },
  {
    id: "paulo-second-set-of-eyes",
    name: "Paulo",
    segment: "private_coaching",
    title: "Why a second set of eyes matters",
    quote: "Honestly, David, I thought I was doing great. And just then learning, I say, yeah, there's a lot of room for improvements.",
    videoTimestamp: "0:10",
    durationSec: 72.08,
    media: gcs("paulo", "paulo-second-set-of-eyes"),
    ...VERIFIED,
  },
  {
    id: "paulo-on-the-calls",
    name: "Paulo",
    segment: "group_coaching",
    title: "Studying the market on the calls",
    quote: "I think I feel fluent in DeFi today, for sure. And DeFi University plays a big role in it, for sure.",
    videoTimestamp: "0:22",
    durationSec: 29.0,
    media: gcs("paulo", "paulo-on-the-calls"),
    ...VERIFIED,
  },
  {
    id: "paulo-tells-it-like-it-is",
    name: "Paulo",
    segment: "community",
    title: "Straight talk, not sugarcoating",
    quote: "You're not afraid to speak the truth. You don't really sugarcoat things. And you really tell it like it is.",
    videoTimestamp: "0:01",
    durationSec: 31.32,
    media: gcs("paulo", "paulo-tells-it-like-it-is"),
    ...VERIFIED,
  },
  {
    id: "paulo-learn-by-doing",
    name: "Paulo",
    segment: "community",
    title: "Learning by doing",
    quote: "I really believe in learning by doing. So give it a try. It's worth it.",
    videoTimestamp: "0:16",
    durationSec: 21.36,
    media: gcs("paulo", "paulo-learn-by-doing"),
    ...VERIFIED,
  },
  {
    id: "paulo-depth",
    name: "Paulo",
    segment: "community",
    title: "Why he focuses his attention here",
    quote: "I really enjoy how we have the chance to study the markets, not only Bitcoin or ETH … a better understanding of the whole market.",
    videoTimestamp: "0:39",
    durationSec: 63.2,
    media: gcs("paulo", "paulo-depth"),
    ...VERIFIED,
  },
  {
    id: "paulo-compare-to-bitcoin",
    name: "Paulo",
    segment: "community",
    title: "Comparing an asset against Bitcoin",
    quote: "One thing that you taught me … was very beneficial to me is how to compare an asset that I'm learning.",
    videoTimestamp: "0:13",
    durationSec: 35.24,
    media: gcs("paulo", "paulo-compare-to-bitcoin"),
    ...VERIFIED,
  },
  {
    id: "martin-mindset",
    name: "Martin",
    segment: "community",
    title: "Mindset first",
    quote: "Because all the good and bad decisions, they come from my brain at the end.",
    videoTimestamp: "0:19",
    durationSec: 28.0,
    media: gcs("martin", "martin-mindset"),
    ...VERIFIED,
  },
  {
    id: "martin-no-fomo",
    name: "Martin",
    segment: "group_coaching",
    title: "Less FOMO, less stress",
    quote: "I don't have to be on top of everything all the time. And that reduces me the stress level that is usually high in crypto.",
    videoTimestamp: "0:15",
    durationSec: 62.56,
    media: gcs("martin", "martin-no-fomo"),
    ...VERIFIED,
  },
  {
    id: "martin-not-rushed",
    name: "Martin",
    segment: "group_coaching",
    title: "Never rushed into a decision",
    quote: "I don't have the feeling that I'm being rushed into a decision and that I'm being rushed into doing something that I'm not comfortable with.",
    videoTimestamp: "0:20",
    durationSec: 64.32,
    media: gcs("martin", "martin-not-rushed"),
    ...VERIFIED,
  },
  {
    id: "martin-knowledge",
    name: "Martin",
    segment: "community",
    title: "What he'd tell someone on the fence",
    quote: "You're going to get something that you cannot be taken away, that is knowledge.",
    videoTimestamp: "0:25",
    durationSec: 35.76,
    media: gcs("martin", "martin-knowledge"),
    ...VERIFIED,
  },
  {
    id: "balazs-honest-review",
    name: "Balazs",
    segment: "community",
    title: "His honest review",
    quote: "It's probably a price of a cup of coffee per day to try it out. And then you can always cancel if you find it's not being helpful to you.",
    videoTimestamp: "0:10",
    durationSec: 34.56,
    media: gcs("balazs", "balazs-honest-review"),
    ...VERIFIED,
  },
  {
    id: "balazs-steep-learning-curve",
    name: "Balazs",
    segment: "community",
    title: "A steep learning curve",
    quote: "If you just start listening to a few calls or a few lessons and then you jump in with serious capital, you're going to get burned.",
    videoTimestamp: "0:31",
    durationSec: 43.44,
    media: gcs("balazs", "balazs-steep-learning-curve"),
    ...VERIFIED,
  },
  {
    id: "david-hill-community",
    name: "David Hill",
    segment: "community",
    title: "Crypto used to be lonely",
    quote: "It's really nice now to have a community that I can, you know, reach out to people and talk to people.",
    videoTimestamp: "0:12",
    durationSec: 19.6,
    media: gcs("david-hill", "david-hill-community"),
    ...VERIFIED,
  },
  {
    id: "david-hill-noise",
    name: "David Hill",
    segment: "community",
    title: "Too much noise online",
    quote: "There's way too much noise online.",
    videoTimestamp: "0:03",
    durationSec: 20.0,
    media: gcs("david-hill", "david-hill-noise"),
    ...VERIFIED,
  },
  {
    id: "david-hill-forum",
    name: "David Hill",
    segment: "community",
    title: "Someone always answers",
    quote: "Pretty much someone will always get back to you within 24 hours.",
    videoTimestamp: "0:06",
    durationSec: 22.8,
    media: gcs("david-hill", "david-hill-forum"),
    ...VERIFIED,
  },
  {
    id: "david-hill-confidence",
    name: "David Hill",
    segment: "private_coaching",
    title: "Confidence from 1-on-1",
    quote: "Confidence, 100%. Just being able to go in and ask the right questions and being able to just bounce ideas off yourself.",
    videoTimestamp: "0:13",
    durationSec: 33.04,
    media: gcs("david-hill", "david-hill-confidence"),
    ...VERIFIED,
  },
  {
    id: "david-hill-calmer",
    name: "David Hill",
    segment: "community",
    title: "From roller coaster to balanced",
    quote: "It's a bit of a roller coaster what I was doing before, whereas now I'm, you know, a lot more balanced … a lot simpler.",
    videoTimestamp: "0:00",
    durationSec: 29.56,
    media: gcs("david-hill", "david-hill-calmer"),
    ...VERIFIED,
  },
  {
    id: "jarrod-one-on-one",
    name: "Jarrod Smithson",
    segment: "private_coaching",
    title: "Why 1-on-1, not just the group",
    quote: "The group space is not always the best format for an individual concern that I have.",
    videoTimestamp: "0:23",
    durationSec: 57.52,
    media: gcs("jarrod-smithson", "jarrod-one-on-one"),
    ...VERIFIED,
  },
  {
    id: "jarrod-accountability",
    name: "Jarrod Smithson",
    segment: "private_coaching",
    title: "Accountability",
    quote: "It's great to have that accountability.",
    videoTimestamp: "0:14",
    durationSec: 17.28,
    media: gcs("jarrod-smithson", "jarrod-accountability"),
    ...VERIFIED,
  },
  {
    id: "jarrod-not-in-a-vacuum",
    name: "Jarrod Smithson",
    segment: "community",
    title: "Not in a vacuum",
    quote: "It's really hard to do in a vacuum by yourself.",
    videoTimestamp: "0:04",
    durationSec: 16.8,
    media: gcs("jarrod-smithson", "jarrod-not-in-a-vacuum"),
    ...VERIFIED,
  },
  {
    id: "jarrod-people-to-lean-on",
    name: "Jarrod Smithson",
    segment: "community",
    title: "People to lean on",
    quote: "Having a community makes so much of a difference because you've got a group of people now that you can lean on.",
    videoTimestamp: "0:34",
    durationSec: 59.04,
    media: gcs("jarrod-smithson", "jarrod-people-to-lean-on"),
    ...VERIFIED,
  },
  {
    id: "ramon-who-its-for",
    name: "Ramon",
    segment: "community",
    title: "Who it's for, and who it isn't",
    quote: "I think it's for anyone who's curious about being in this space and seeing what's available and wants to learn and be part of the community.",
    videoTimestamp: "0:11",
    durationSec: 30.8,
    media: gcs("ramon", "ramon-who-its-for", "v2"),
    ...VERIFIED,
  },
  {
    id: "ramon-no-one-has-all-the-answers",
    name: "Ramon",
    segment: "community",
    title: "No one has all the answers",
    quote: "You're like, dude, I don't have all the answers. There's guys in here that know this better.",
    videoTimestamp: "0:04",
    durationSec: 17.04,
    media: gcs("ramon", "ramon-no-one-has-all-the-answers", "v2"),
    ...VERIFIED,
  },
  {
    id: "ramon-vetting",
    name: "Ramon",
    segment: "community",
    title: "How he vetted DeFi University",
    quote: "After all the vetting and everything else, I'm really grateful to be part of this community.",
    videoTimestamp: "0:36",
    durationSec: 41.12,
    media: gcs("ramon", "ramon-vetting", "v2"),
    ...VERIFIED,
  },
  {
    id: "ramon-intuition",
    name: "Ramon",
    segment: "private_coaching",
    title: "What private coaching validated",
    quote: "One of the blessings that God, universe, source has given me is this intuitive sense around money and finance. And what the coaching did was validate that.",
    videoTimestamp: "0:10",
    durationSec: 20.52,
    media: gcs("ramon", "ramon-intuition", "v2"),
    ...VERIFIED,
  },
  {
    id: "ramon-not-alone",
    name: "Ramon",
    segment: "private_coaching",
    title: "Not going it alone",
    quote: "You hear about the hacks, you hear about different things, and I don't want to go on that ride alone.",
    videoTimestamp: "0:30",
    durationSec: 66.52,
    media: gcs("ramon", "ramon-not-alone", "v2"),
    ...VERIFIED,
  },
];

export function clipsFor(...segments: Segment[]): VerifiedTestimonial[] {
  return publishedTestimonials(testimonials).filter((t) => segments.includes(t.segment));
}

export function clipById(id: string): VerifiedTestimonial | undefined {
  return publishedTestimonials(testimonials).find((t) => t.id === id);
}

export function hasPublishedSiteTestimonials(): boolean {
  return publishedTestimonials(testimonials).length > 0;
}

export const TESTIMONIALS_PAGE_TITLE = "Member and Client Stories | DeFi University";
export const TESTIMONIALS_PAGE_DESCRIPTION =
  "Video stories from DeFi University members and private coaching clients. Individual experiences, not typical results. Education only.";

export function testimonialsPageRobots(): { index: boolean; follow: boolean } {
  const published = hasPublishedSiteTestimonials();
  return { index: published, follow: published };
}

const CORE_NAV_LINKS = [
  { href: "/university", label: "University" },
  { href: "/skool", label: "Membership" },
  { href: "/coaching", label: "Private coaching" },
  { href: "/about", label: "About" },
] as const;

export type SiteNavLink = { href: string; label: string };

export function siteNavLinks(): SiteNavLink[] {
  if (!hasPublishedSiteTestimonials()) {
    return CORE_NAV_LINKS.map((link) => ({ ...link }));
  }
  return [
    ...CORE_NAV_LINKS.map((link) => ({ ...link })),
    { href: "/testimonials", label: "Stories" },
  ];
}
