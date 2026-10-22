/**
 * The FromAItoBusiness course: build a one-person company and staff it with
 * AI. Shared by the home page and /course. Tool facts are as of October 2026;
 * prices change often, so pages link to vendors rather than printing them.
 */

export type TrackId = "build" | "marketing" | "sales" | "accounting";

export type Track = {
  id: TrackId;
  label: string;
  /** CSS class that sets --track for agent cards and tags. */
  className: string;
};

export const TRACKS: Record<TrackId, Track> = {
  build: { id: "build", label: "Build", className: "track-build" },
  marketing: { id: "marketing", label: "Marketing", className: "track-marketing" },
  sales: { id: "sales", label: "Sales", className: "track-sales" },
  accounting: { id: "accounting", label: "Accounting", className: "track-accounting" },
};

export type Module = {
  number: number;
  title: string;
  track: TrackId;
  summary: string;
  lessons: string[];
  tools: string[];
  /** What the student has at the end of the module. */
  deliverable: string;
};

export const MODULES: readonly Module[] = [
  {
    number: 1,
    title: "The one-person company",
    track: "build",
    summary:
      "Treat AI tools as hires, not apps. Pick a stack for your budget and set the rules every agent works under.",
    lessons: [
      "Agents as staff: what changed in 2026",
      "Pick your stack at $20, $100 and $300 a month",
      "Logins, access and approval rules",
      "Your AI org chart",
    ],
    tools: ["Claude", "Claude Duet", "OpenAI Dots", "Grok Bot", "Gemini"],
    deliverable: "An AI org chart naming each agent's job, access and approval rule",
  },
  {
    number: 2,
    title: "Find and validate the idea",
    track: "build",
    summary:
      "Research a market, talk to customers and price an offer before you build anything.",
    lessons: [
      "Market research with Deep Research",
      "Customer interviews an AI helps you run",
      "Shape the offer and the price",
      "Name it and check it",
    ],
    tools: ["Gemini Deep Research", "NotebookLM", "Claude"],
    deliverable: "A validated offer with pricing and three customer quotes",
  },
  {
    number: 3,
    title: "Build the product and the site",
    track: "build",
    summary:
      "Write a plain-English spec, have a coding agent build it, keep it in GitHub and put it live on your own domain.",
    lessons: [
      "Specs a coding agent can follow",
      "Build a site with Claude Code or Cursor",
      "Mockups and images with Codex",
      "GitHub for non-developers",
      "Deploy it and connect your domain",
    ],
    tools: ["Claude Code", "Cursor", "Codex", "GitHub"],
    deliverable: "A live landing page on your own domain, stored in GitHub",
  },
  {
    number: 4,
    title: "Brand in a day",
    track: "build",
    summary:
      "Voice, logo, colours and templates you can hand to every agent so the work sounds and looks like you.",
    lessons: [
      "Find your voice",
      "Logo and imagery with AI",
      "A brand kit your agents follow",
    ],
    tools: ["Claude", "Codex", "Gemini"],
    deliverable: "A brand kit: voice guide, logo, colours and three social templates",
  },
  {
    number: 5,
    title: "AI marketing",
    track: "marketing",
    summary:
      "Hire a marketing department: a content calendar that fills itself, posts that publish with your approval and a weekly results brief.",
    lessons: [
      "A 30-day content calendar",
      "SEO and AI-search visibility",
      "A Marketing Bot that posts and reports",
      "Keep launch materials current with Dots",
      "Email newsletter on autopilot",
      "Ads with approval gates",
    ],
    tools: ["Grok Bot", "OpenAI Dots", "Claude Duet", "Claude", "Gemini"],
    deliverable: "A 30-day content calendar with the first week published by an agent",
  },
  {
    number: 6,
    title: "AI sales",
    track: "sales",
    summary:
      "Hire a sales team: lead lists, outbound that waits for your OK, a CRM that updates itself and proposals that stay current.",
    lessons: [
      "Build a lead list",
      "Hire a Sales Bot",
      "Keep the CRM clean without touching it",
      "Call prep and follow-up with Duet",
      "Proposals that update themselves",
    ],
    tools: ["Grok Bot", "OpenAI Dots", "Claude Duet", "Claude"],
    deliverable: "A 50-lead pipeline with an agent drafting follow-ups for approval",
  },
  {
    number: 7,
    title: "AI accounting",
    track: "accounting",
    summary:
      "Hire a back office: receipts to books, invoices out, money chased and a cash forecast you read every Monday.",
    lessons: [
      "Set up the books",
      "Receipts and expenses with Cowork and an Expense Bot",
      "Invoices and collections",
      "A 90-day cash-flow forecast",
      "Tax-season prep",
    ],
    tools: ["Grok Bot", "Claude Cowork", "Claude Duet", "OpenAI Dots", "Gemini in Sheets"],
    deliverable: "A monthly close checklist and a cash-flow forecast that updates itself",
  },
];

export type Agent = {
  role: string;
  tool: string;
  track: TrackId;
  task: string;
  rule: string;
};

/** The "AI team" a student ends the course with. */
export const AGENT_TEAM: readonly Agent[] = [
  {
    role: "Chief of staff",
    tool: "Claude Duet",
    track: "build",
    task: "Sends the morning brief and chases what's slipping.",
    rule: "Asks before booking anything",
  },
  {
    role: "Builder",
    tool: "Claude Code · Cursor · Codex",
    track: "build",
    task: "Ships the site, the product and the small tools you need.",
    rule: "Every change lands in GitHub",
  },
  {
    role: "Marketing",
    tool: "Grok Bot · Dots",
    track: "marketing",
    task: "Drafts the week's posts and newsletter, then reports results.",
    rule: "Publishes after your OK",
  },
  {
    role: "Sales",
    tool: "Grok Bot · Duet",
    track: "sales",
    task: "Researches leads, drafts outreach and keeps the CRM current.",
    rule: "Sends only what you approve",
  },
  {
    role: "Accounting",
    tool: "Cowork · Grok Bot",
    track: "accounting",
    task: "Turns receipts into books and flags unpaid invoices.",
    rule: "Never moves money",
  },
  {
    role: "Research",
    tool: "Gemini · NotebookLM",
    track: "build",
    task: "Reads the market and your documents and writes cited briefs.",
    rule: "Cites every source",
  },
];

/** Tools the course covers, with where to learn more. */
export const TOOLS: readonly { name: string; maker: string; job: string; href: string }[] = [
  { name: "Claude", maker: "Anthropic", job: "Strategy, writing and analysis", href: "https://claude.ai" },
  { name: "Claude Code", maker: "Anthropic", job: "Builds your site and tools", href: "https://claude.com/product/claude-code" },
  { name: "Claude Cowork", maker: "Anthropic", job: "Works through files on your computer", href: "https://claude.ai" },
  { name: "Claude Duet", maker: "Anthropic", job: "A proactive chief of staff", href: "https://claude.ai" },
  { name: "OpenAI Dots", maker: "OpenAI", job: "Always-on agents in ChatGPT", href: "https://chatgpt.com" },
  { name: "Codex", maker: "OpenAI", job: "Builds, designs and automates", href: "https://openai.com/codex" },
  { name: "Grok Bot", maker: "SpaceXAI", job: "Bots that operate your apps", href: "https://grok.com" },
  { name: "Cursor", maker: "Anysphere", job: "AI code editor with parallel agents", href: "https://cursor.com" },
  { name: "Gemini", maker: "Google", job: "Research, NotebookLM and Workspace", href: "https://gemini.google.com" },
  { name: "GitHub", maker: "GitHub", job: "Home for your code and free hosting", href: "https://github.com" },
];
