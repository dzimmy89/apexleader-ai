/**
 * Businesses the founder built and runs with the course's tools and steps,
 * shown on /portfolio. Pure data, safe on client and server.
 *
 * No earnings claims: copy says what was built and how. A figure (users,
 * subscribers, revenue, growth) goes only in `results`, and only with the
 * owner's confirmation, its date and its source. scripts/test-portfolio.ts
 * enforces this. Prices a business charges are facts about the offer, not
 * results, so they may appear in copy.
 *
 * This is the one file outside the crypto checkout that may name the sister
 * school by its brand (see the wording check in .github/workflows/ci.yml).
 */
import type { Agent } from "@/content/course";

export type PortfolioStatus = "live" | "beta" | "building";

export const PORTFOLIO_STATUS: Record<PortfolioStatus, { label: string; chip: string }> = {
  live: { label: "Live", chip: "chip-success" },
  beta: { label: "Live beta", chip: "chip-info" },
  building: { label: "In progress", chip: "chip-warning" },
};

export type PortfolioModule = {
  /** Course module number, 1 to 7. */
  number: number;
  /** What this module produced for this business. */
  built: string;
};

export type PortfolioResult = {
  label: string;
  value: string;
  /** "YYYY-MM-DD" the figure was read. */
  asOf: string;
  /** Where the figure comes from, such as "Stripe dashboard". */
  source: string;
  /** Who confirmed it may be published. */
  confirmedBy: string;
};

export type PortfolioBusiness = {
  slug: string;
  name: string;
  status: PortfolioStatus;
  /** Public address. Left out until the site is public. */
  url?: string;
  /** One line for cards. */
  oneLine: string;
  /** What the business is, a short paragraph per entry. */
  about: string[];
  /** Course tools that built it, as named in TOOLS. */
  tools: string[];
  modules: PortfolioModule[];
  team: Agent[];
  /** Hosting, payments, data and models. */
  stack: string[];
  /** What is next for it, said plainly. */
  next: string;
  /** Confirmed results only. Empty means the page shows none. */
  results: PortfolioResult[];
  /** Featured businesses also appear on the home page and /coaching. */
  featured?: boolean;
};

export const PORTFOLIO_OWNER_LINE = "Built and run by David Zimmerman (Blocksqozen LLC).";

export const PORTFOLIO: readonly PortfolioBusiness[] = [
  {
    slug: "fromaitobusiness",
    name: "FromAItoBusiness",
    status: "live",
    url: "https://fromaitobusiness.com",
    oneLine: "This site. A course and coaching business, rebranded and launched in a day.",
    about: [
      "The site you are on. It started as an earlier coaching site and was rebuilt under a new name, brand kit and design, then launched on its own domain the same day.",
      "Google sign-in, Stripe checkout for three coaching packages, client accounts, a coaching admin and company email followed within two days. Every change went through a GitHub pull request written by Claude Code.",
    ],
    tools: ["Claude", "Claude Code", "Gemini", "GitHub"],
    modules: [
      { number: 1, built: "A one-person org chart: Claude Code builds, Claude plans and writes, the owner approves." },
      { number: 3, built: "The full site and coaching admin on Next.js and Cloud Run, shipped through GitHub Actions." },
      { number: 4, built: "A new brand kit: logo, colours, type and templates, made with Claude in an afternoon." },
      { number: 6, built: "A discovery-call flow and a client CRM with drafted follow-ups the owner approves." },
      { number: 7, built: "Stripe products, payment plans and a webhook that records every payment." },
    ],
    team: [
      { role: "Builder", tool: "Claude Code", track: "build", task: "Writes every change as a pull request and fixes CI until it passes.", rule: "Every change lands in GitHub" },
      { role: "Research", tool: "Claude", track: "build", task: "Researched the course topics and the new brand direction.", rule: "Cites every source" },
      { role: "Sales", tool: "Claude", track: "sales", task: "Drafts follow-up emails to people who book a call.", rule: "Sends only what you approve" },
    ],
    stack: ["Next.js", "Google Cloud Run", "Firestore", "Firebase Auth", "Stripe", "Google Workspace"],
    next: "Course lessons with video, and the cold email and X outreach plans going live.",
    results: [],
    featured: true,
  },
  {
    slug: "defi-university",
    name: "DeFi University",
    status: "live",
    url: "https://defiuniversity.xyz",
    oneLine: "An online school and 1-on-1 coaching for crypto finance, with a Grok Bot marketing team.",
    about: [
      "An online school that teaches how crypto finance works, with free lessons, a community and private coaching. It is the sister business of FromAItoBusiness and the place this course's method was first used.",
      "Besides the site, it has a go-to-market workspace where a Grok Bot per channel (YouTube, LinkedIn, X, cold email, Facebook, Instagram and TikTok) reads shared facts, drafts content and reports back, and a pipeline that turns research into long-form YouTube lectures.",
    ],
    tools: ["Claude", "Claude Code", "Cursor", "Grok Bot", "Gemini", "GitHub"],
    modules: [
      { number: 3, built: "The school site, lessons, student accounts and a coaching admin, first in Cursor and now through Claude Code pull requests." },
      { number: 4, built: "A brand and a style bible for lecture boards and thumbnails." },
      { number: 5, built: "A Grok Bot for each of seven channels, working from one shared brief, plus a YouTube lecture pipeline." },
      { number: 6, built: "A CRM with lead capture, follow-up flows and discovery calls." },
      { number: 7, built: "Stripe checkout for coaching with installment plans." },
    ],
    team: [
      { role: "Builder", tool: "Claude Code · Cursor", track: "build", task: "Builds the site, the CRM and the admin tools.", rule: "Every change lands in GitHub" },
      { role: "Marketing", tool: "Grok Bot", track: "marketing", task: "One bot per channel drafts posts and briefs and files weekly reports.", rule: "Publishes after your OK" },
      { role: "Research", tool: "Gemini", track: "build", task: "Researches each lecture topic before the script is written.", rule: "Cites every source" },
    ],
    stack: ["Next.js", "Google Cloud Run", "Firestore", "Stripe", "Vertex AI (Gemini)", "YouTube"],
    next: "More channels handed to bots, with the owner approving each week's plan.",
    results: [],
    featured: true,
  },
  {
    slug: "the-node",
    name: "The Node",
    status: "live",
    url: "https://thenode.pro",
    oneLine: "A market briefing newsletter that an AI pipeline drafts for each reader's watchlist.",
    about: [
      "A newsletter for people who follow markets. Every day a pipeline pulls prices, macro data and the economic calendar from several data vendors, and Gemini drafts a brief shaped around the reader's own watchlist, from bonds to currencies to crypto.",
      "Readers can see a sample brief before they subscribe. Subscriptions run through Shopify, with a $1 trial and then $20 a month.",
    ],
    tools: ["Claude Code", "Gemini", "GitHub"],
    modules: [
      { number: 3, built: "The site, the sample brief and the subscriber pages, built with Claude Code." },
      { number: 4, built: "A written design contract with a colour per asset class." },
      { number: 5, built: "The newsletter itself: a daily pipeline that drafts each brief with Gemini." },
      { number: 7, built: "Shopify subscriptions with a $1 trial." },
    ],
    team: [
      { role: "Builder", tool: "Claude Code", track: "build", task: "Builds the site and the newsletter pipeline.", rule: "Every change lands in GitHub" },
      { role: "Research", tool: "Gemini", track: "build", task: "Reads the day's market data and drafts each reader's brief.", rule: "Cites every source" },
    ],
    stack: ["Next.js", "Google Cloud Run", "Firestore", "Vertex AI (Gemini)", "Shopify"],
    next: "More data sources and a brief for each asset class.",
    results: [],
    featured: true,
  },
  {
    slug: "we-like-food",
    name: "We Like Food",
    status: "beta",
    url: "https://we-like-food-1054912835612.us-central1.run.app",
    oneLine: "A kitchen notebook app: photograph your ingredients, get meal ideas and a weekly plan.",
    about: [
      "Photograph what is in your kitchen, up to 50 photos at a time, and We Like Food keeps a searchable list of what you have on hand. From that it suggests meals, writes recipes and builds a 3 to 7 day plan.",
      "The on-hand list is free without an account. The first meal idea is free, then it is $10 a month through Stripe.",
    ],
    tools: ["Claude Code", "Cursor", "Grok Bot", "Gemini", "GitHub"],
    modules: [
      { number: 2, built: "User research on food apps and a design for the recognition engine, written before any code." },
      { number: 3, built: "The web app, ingredient recognition and meal plans, built in Cursor with Claude Code." },
      { number: 5, built: "A plan for a Grok Bot marketing team." },
      { number: 7, built: "A $10 a month Stripe plan with one free try first." },
    ],
    team: [
      { role: "Builder", tool: "Cursor · Claude Code", track: "build", task: "Builds the app and the photo recognition.", rule: "Every change lands in GitHub" },
      { role: "Research", tool: "Gemini", track: "build", task: "Identifies ingredients in photos and drafts recipes and plans.", rule: "Cites every source" },
      { role: "Marketing", tool: "Grok Bot", track: "marketing", task: "Planned: drafts posts for each channel.", rule: "Publishes after your OK" },
    ],
    stack: ["React", "Google Cloud Run", "Firebase Auth", "Vertex AI (Gemini)", "fal", "Stripe"],
    next: "Its own domain and a mobile app.",
    results: [],
    featured: true,
  },
  {
    slug: "getrunway",
    name: "GetRunway",
    status: "building",
    url: "https://getrunway.trade",
    oneLine: "An AI co-pilot for traders: a pre-trade interview, a risk check and a trade journal.",
    about: [
      "A co-pilot that interviews a trader before each trade, checks the risk against their own rules and keeps a journal before and after. It watches open positions and sends alerts.",
      "The public site is a coming-soon page while the app is paused.",
    ],
    tools: ["Claude Code", "Cursor", "Gemini", "GitHub"],
    modules: [
      { number: 2, built: "A written product plan and agent instructions before the build." },
      { number: 3, built: "The app, the risk engine and the journal, built with Cursor and Claude Code." },
    ],
    team: [
      { role: "Builder", tool: "Cursor · Claude Code", track: "build", task: "Builds the app from written agent instructions.", rule: "Every change lands in GitHub" },
      { role: "Research", tool: "Gemini", track: "build", task: "Runs the pre-trade interview and adds market context.", rule: "Cites every source" },
    ],
    stack: ["Next.js", "FastAPI", "Google Cloud Run", "PostgreSQL", "Vertex AI (Gemini)"],
    next: "Back to public once the paused app is ready.",
    results: [],
  },
  {
    slug: "omnifolio",
    name: "Omnifolio",
    status: "building",
    oneLine: "One dashboard for every crypto wallet: balances, loans and liquidity positions together.",
    about: [
      "Paste wallet addresses or sign in with a wallet and Omnifolio reads every lending position, liquidity position and balance across many networks into one book, with net worth, exposure per asset and alerts.",
      "It merged two earlier tools, a portfolio tracker and a reader that tracks gains and losses on liquidity positions, into one app. It is ready to deploy and not yet public.",
    ],
    tools: ["Claude Code", "GitHub"],
    modules: [
      { number: 3, built: "The dashboard and its data readers, built almost entirely through Claude Code pull requests." },
    ],
    team: [
      { role: "Builder", tool: "Claude Code", track: "build", task: "Builds each data reader with tests, working from written agent instructions.", rule: "Every change lands in GitHub" },
    ],
    stack: ["Next.js", "Google Cloud Run", "PostgreSQL"],
    next: "A public address.",
    results: [],
  },
  {
    slug: "zins",
    name: "Zins",
    status: "building",
    oneLine: "A planned fixed-rate yield app on the Canton Network, validated with grant proposals first.",
    about: [
      "Zins plans to let holders split a yield-bearing position into a part that pays back at a set date and a part that collects the yield, so people can lock a fixed rate or trade the yield.",
      "Before writing code, the work so far is the validation: a funding plan, two grant proposals and a five-screen app mockup.",
    ],
    tools: ["Claude", "Claude Code", "GitHub"],
    modules: [
      { number: 2, built: "Research on funding routes, two grant proposals and a dated funding plan." },
      { number: 4, built: "A five-screen app mockup on a Claude design canvas." },
    ],
    team: [
      { role: "Research", tool: "Claude", track: "build", task: "Researched the grant programme and what reviewers asked of similar proposals.", rule: "Cites every source" },
    ],
    stack: ["Canton Network", "Claude design canvas"],
    next: "A working prototype and a filed grant proposal.",
    results: [],
  },
];

export function getPortfolioBusiness(slug: string): PortfolioBusiness | undefined {
  return PORTFOLIO.find((b) => b.slug === slug);
}

export function featuredPortfolio(): PortfolioBusiness[] {
  return PORTFOLIO.filter((b) => b.featured);
}

/** Businesses whose case study shows a given course module. */
export function portfolioForModule(moduleNumber: number): PortfolioBusiness[] {
  return PORTFOLIO.filter((b) => b.modules.some((m) => m.number === moduleNumber));
}

export function portfolioHost(url: string): string {
  return new URL(url).host.replace(/^www\./, "");
}
