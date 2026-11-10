/**
 * Lesson follow-up series: which email + text series a lead gets, keyed to
 * the lesson they came in through (usually a link David sent on X). Each
 * course belongs to one track; a course not listed here falls back to the
 * default track. Pure data, safe on client and server.
 */

export const LESSON_TRACK_IDS = [
  "marketing",
  "get_found",
  "sales",
  "accounting",
  "build",
  "agents",
  "idea",
  "default",
] as const;

export type LessonTrackId = (typeof LESSON_TRACK_IDS)[number];

export interface LessonTrackCopy {
  subject: string;
  /** Paragraphs of plain text. Sent as <p> in HTML. */
  paragraphs: string[];
}

export interface LessonTrack {
  id: LessonTrackId;
  /** Courses whose lessons start this series. */
  courses: string[];
  /** Courses to point to in the "related" email, first match not the lead's own course. */
  related: string[];
  /** The topic in a sentence: "about AI marketing". */
  label: string;
  /** What coaching builds for this topic, after "we build". */
  offer: string;
  /** The same in a few words for a text. */
  offerShort: string;
  /** One line for the first email: what to do with the exercise. */
  exerciseHint: string;
  /** Day 2: one play the lead can run this week. */
  play: LessonTrackCopy;
  /** Day 4: the mistake most people make on this topic. */
  mistake: LessonTrackCopy;
  /** Day 7 email subject (the coaching offer). */
  offerSubject: string;
  /** Day 5 text, after the greeting. A question that invites a reply. */
  checkInText: string;
}

export const LESSON_TRACKS: Record<LessonTrackId, LessonTrack> = {
  marketing: {
    id: "marketing",
    courses: ["ai-marketing", "brand-in-a-day"],
    related: ["brand-in-a-day", "get-found", "ai-marketing"],
    label: "AI marketing",
    offer: "your content calendar, your brand voice file and a posting agent, set up on your own accounts",
    offerShort: "your content calendar and posting agent",
    exerciseHint: "Do it with your real offer, not a made-up one. You should finish with a month of post ideas you would actually publish.",
    play: {
      subject: "The one-hour marketing week",
      paragraphs: [
        "Most solo owners don't have a content problem. They have a Monday problem: the week starts and nothing is written.",
        "The fix in the course is boring on purpose. Once a month, give Claude three things: your offer, the five questions customers ask you most, and the best post you wrote last month. Ask for 30 days of posts in your voice. A scheduler publishes them, and you spend ten minutes a day replying to people instead of writing.",
        "Rolling Ledger, the food truck bookkeeping business we use as the example in the course, runs its whole month this way.",
      ],
    },
    mistake: {
      subject: "Why AI posts sound like AI",
      paragraphs: [
        "The most common marketing mistake I see: letting the AI write in its own voice. Readers can tell within a line, and they scroll past.",
        "The fix takes an afternoon. Write a short voice file: words you use, words you never use, three posts you wrote yourself. Give it to every tool that writes for you. Brand in a Day walks through it step by step.",
      ],
    },
    offerSubject: "Want your marketing set up with you?",
    checkInText: "did the exercise get you a month of post ideas? If it stalled, text me where and I'll tell you the fix.",
  },
  get_found: {
    id: "get_found",
    courses: ["get-found"],
    related: ["ai-marketing", "brand-in-a-day"],
    label: "getting found on Google and in AI answers",
    offer: "Search Console, your list of customer questions and your first five pages, set up and published",
    offerShort: "your first five search pages",
    exerciseHint: "Use your own site, even if it's tiny. The free tools in the lesson work on a one-page site.",
    play: {
      subject: "Start with the questions, not keywords",
      paragraphs: [
        "Here's the simplest search plan that still works: write down the 20 questions customers ask before they buy, then give each one its own page that answers it in the first two sentences.",
        "Google ranks pages that answer the question. ChatGPT, Gemini and Perplexity quote pages that answer it plainly. One page per question does both.",
        "Search Console is free and shows you which questions people already find you for, so start there.",
      ],
    },
    mistake: {
      subject: "Don't publish 50 AI pages at once",
      paragraphs: [
        "The quickest way to waste a month: have AI write 50 pages and publish them in a day. Thin pages get ignored by Google and never get cited by AI assistants.",
        "One strong page a week beats it every time. Use a real example from your business, put a date and your name on it, and link it from a page people already visit.",
      ],
    },
    offerSubject: "Want to get found, built with you?",
    checkInText: "did you get Search Console connected? It's the step most people stall on. Text me if it's fighting you.",
  },
  sales: {
    id: "sales",
    courses: ["ai-sales"],
    related: ["ai-marketing", "always-on-agents"],
    label: "AI sales",
    offer: "your lead list, outreach drafts that wait for your OK and a CRM that logs every reply, set up on your accounts",
    offerShort: "your lead list and outreach",
    exerciseHint: "Aim the list at your best customer so far. Twenty good names beat two hundred random ones.",
    play: {
      subject: "Twenty good leads beat 2,000",
      paragraphs: [
        "The sales play from the course that works for one person: have a research agent find 20 people who look like your best customer, each with one real reason to reach out right now.",
        "The agent writes a first message for each one. Nothing goes out until you read it and say yes. That's 20 conversations a week that sound like you, in about half an hour.",
      ],
    },
    mistake: {
      subject: "The sales step to keep for yourself",
      paragraphs: [
        "The mistake I see most: automating the send. Accounts get flagged, replies dry up, and the leads you burned don't come back.",
        "Keep a human on send. Let the agents do everything around it: the research, the drafts, the follow-up reminders and the CRM notes after every reply.",
      ],
    },
    offerSubject: "Want your sales system built with you?",
    checkInText: "how many leads did the exercise get you? If the list came back thin, text me your ideal customer in one line and I'll suggest a better search.",
  },
  accounting: {
    id: "accounting",
    courses: ["ai-accounting"],
    related: ["run-the-company", "ai-sales"],
    label: "AI accounting",
    offer: "your books, your invoice flow and a cash forecast, connected and running",
    offerShort: "your books and invoicing",
    exerciseHint: "Use last month's real receipts. Ten is enough to see how the categories come out.",
    play: {
      subject: "The 15-minute Friday books",
      paragraphs: [
        "Here's the bookkeeping rhythm from the course. Receipts get photographed into one folder during the week. An agent sorts them into your books and flags the ones it isn't sure about. On Friday you review the flags only, which takes about 15 minutes.",
        "Rolling Ledger, the example business in the course, is a bookkeeping service for food trucks, and this is the exact loop it runs for its clients.",
      ],
    },
    mistake: {
      subject: "What to never hand to the agent",
      paragraphs: [
        "AI is good at sorting transactions. It should still not file anything without you looking first. The agent prepares, you approve.",
        "And keep your accountant for taxes. The point is that they get clean books instead of a shoebox, which usually makes their bill smaller. None of this is tax advice.",
      ],
    },
    offerSubject: "Want your books set up with you?",
    checkInText: "did your receipts make it into the books in the exercise? If the categories came out messy, text me and I'll show you the rule that fixes it.",
  },
  build: {
    id: "build",
    courses: ["claude-code", "cursor", "codex", "build-product-and-site", "agent-build-line", "github-for-founders"],
    related: ["github-for-founders", "build-product-and-site", "claude-code"],
    label: "building with coding agents",
    offer: "your site or your first internal tool, built together, with GitHub set up so every change waits for your OK",
    offerShort: "your site or first tool",
    exerciseHint: "Pick something small and real, like your contact page. A finished small thing teaches more than a half-built big one.",
    play: {
      subject: "Write the spec before you open the agent",
      paragraphs: [
        "Coding agents follow specs and wander without them. Before every session, write one page: who it's for, what it does, what done looks like, and what the agent must not touch.",
        "Ten minutes of writing saves an hour of undoing. The course has a spec template you can copy.",
      ],
    },
    mistake: {
      subject: "Don't let the agent touch the live site",
      paragraphs: [
        "The mistake that costs people a weekend: letting an agent change the live site directly. One bad edit and the site is down while you figure out what changed.",
        "Have the agent work on a copy. Every change comes back as a pull request on GitHub, you look at it, and only then does it go live. GitHub for Non-Developers covers it in plain English.",
      ],
    },
    offerSubject: "Want your build done with you?",
    checkInText: "did your first agent session run? If it threw an error, text me the error line and I'll tell you what it means.",
  },
  agents: {
    id: "agents",
    courses: ["agent-skills", "t3-code", "always-on-agents"],
    related: ["agent-skills", "always-on-agents", "one-person-company"],
    label: "AI agents that work for you",
    offer: "your first skills written and your always-on agents set up with safe approval rules",
    offerShort: "your agents and skills",
    exerciseHint: "Pick a task you repeat every week. That's the one worth teaching an agent first.",
    play: {
      subject: "Teach it once",
      paragraphs: [
        "Every time you explain the same thing to an agent, you're paying twice. Write it down once as a skill: how you price, how you answer a refund request, how you format a report.",
        "Install it once and Claude Code, Codex and Cursor all use it. The more skills you have, the less you type.",
      ],
    },
    mistake: {
      subject: "Don't give an agent every login on day one",
      paragraphs: [
        "The mistake: handing a new agent your email, your bank and your calendar in the first week. When it gets something wrong, it gets it wrong everywhere.",
        "Start read-only. Add one permission at a time, and set rules for what needs your OK. That's how you end up trusting it with more, not less.",
      ],
    },
    offerSubject: "Want your agents set up with you?",
    checkInText: "did you get your first skill installed? If the agent ignored it, text me which tool you're using and I'll tell you where the file goes.",
  },
  idea: {
    id: "idea",
    courses: ["validate-the-idea"],
    related: ["build-product-and-site", "one-person-company"],
    label: "testing a business idea",
    offer: "your market research, an interview script and a priced offer you can put in front of real buyers",
    offerShort: "your research and first offer",
    exerciseHint: "Use the idea you're actually thinking about, even if it feels too early. That's the point of the exercise.",
    play: {
      subject: "Ask for the money before the code",
      paragraphs: [
        "The cheapest way to test an idea: a deep research report on the market, ten conversations with people who have the problem, then a priced offer you ask them to say yes to.",
        "If nobody says yes at the price, you've saved yourself months of building. If a few do, you build with customers already waiting.",
      ],
    },
    mistake: {
      subject: "Don't ask friends if it's a good idea",
      paragraphs: [
        "Friends say yes to be kind. Strangers say yes to be polite. Neither tells you if they'll pay.",
        "Ask about what people already do instead: how they handle the problem today, what it costs them, and what they've tried. Past behavior is the only honest answer. The interview script in the course is built around that.",
      ],
    },
    offerSubject: "Want to test your idea with me?",
    checkInText: "did the research exercise turn up competitors you hadn't seen? Text me your idea in one line if you want a second opinion.",
  },
  default: {
    id: "default",
    courses: ["one-person-company", "claude-for-founders", "google-gemini", "run-the-company"],
    related: ["one-person-company", "ai-marketing", "claude-for-founders"],
    label: "running your business with AI",
    offer: "your AI stack chosen, set up and doing its first real job in your business",
    offerShort: "your AI stack",
    exerciseHint: "Answer it about your real business. The exercise only works with your own numbers and tasks.",
    play: {
      subject: "Hire AI for one job first",
      paragraphs: [
        "Pick the task you dislike most each week. Give Claude a Project with your business documents and that one job. Run it for a week before adding anything else.",
        "One job done well shows you what AI is good at in your business. Ten jobs started at once just shows you ten logins.",
      ],
    },
    mistake: {
      subject: "Don't try ten tools at once",
      paragraphs: [
        "The trap: signing up for every AI tool you see on X, then using none of them properly.",
        "A small stack goes a long way: Claude for thinking and writing, one coding agent for building, and the Google tools you already have. Add the next tool only when the first ones are doing real work.",
      ],
    },
    offerSubject: "Want your AI team set up with you?",
    checkInText: "which part of your week did the exercise make you want to hand to AI first? Text me back, I read every reply.",
  },
};

const TRACK_BY_COURSE: Record<string, LessonTrackId> = Object.fromEntries(
  LESSON_TRACK_IDS.flatMap((id) => LESSON_TRACKS[id].courses.map((c) => [c, id] as const))
);

/** The series for a course; any course not listed gets the default series. */
export function trackForCourse(courseId: string | undefined | null): LessonTrackId {
  return (courseId && TRACK_BY_COURSE[courseId]) || "default";
}

/** "lesson:<courseId>/<slug>" (the lead magnet the exercise gate writes) → parts. */
export function parseLessonMagnet(
  leadMagnet: string | undefined | null
): { courseId: string; lessonSlug: string } | null {
  const m = /^lesson:([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(leadMagnet || "");
  return m ? { courseId: m[1]!, lessonSlug: m[2]! } : null;
}
