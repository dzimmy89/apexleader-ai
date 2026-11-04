---
module: 3
lesson_number: 12
course: get-found
template: v2
---

# Lesson 12: Measure AI Visibility

:::video
id: gf-l12-overview
kind: overview
status: paused
src: /learn/video/get-found/gf-l12-overview.mp4
captions: /learn/video/get-found/gf-l12-overview.vtt
poster: /learn/video/get-found/gf-l12-overview.jpg
transcript: You can't see inside ChatGPT or Gemini, but you can measure enough to make good decisions. Four free sources cover most of it: a fixed panel of buyer questions you ask the assistants every month, Search Console's Generative AI report, Bing's AI Performance report, and AI referrals in your analytics. Paid trackers automate the panel when it gets big. In this lesson you'll build one dashboard from all four, and decide whether a paid tracker is worth it yet.
:::

:::key-concept
AI visibility is how often assistants mention, cite and send visitors to you for the questions your buyers ask. Measure it from four sources: a prompt panel (the same questions, asked the same way, every month), Search Console's Generative AI performance report, Bing Webmaster Tools' AI Performance report, and AI-assistant referrals in your analytics. Answers vary from run to run, so watch trends over months, not single answers. Paid trackers run the panel for you at scale; none can see inside the assistants' systems.
:::

## What you'll be able to do

- Build a prompt panel and run it consistently
- Read the two free AI reports side by side
- Find AI-assistant visits in your analytics
- Decide whether, and which, paid tracker to use

## Why this matters

Without measurement, GEO turns into guessing and buying tools. With a simple monthly dashboard you'll see which pages and mentions actually move citations, and you'll stop spending time on what doesn't. It also protects you from vendors: Google says no third-party tool has access to its internal ranking or AI systems, so any tracker's numbers are samples, not truth.

## Source 1: the prompt panel

A prompt panel is a fixed list of buyer questions you ask each assistant the same way every month. You started one in AI Marketing Exercise 2. Make it a measurement tool:

- **10 to 20 questions** across problem, comparison and purchase stages, from your question bank.
- **The same wording every time.** Change a question and you've started a new series.
- **Five assistants:** ChatGPT (search on), Gemini, Perplexity, Claude (web search on) and Copilot. Add Google AI Mode if your buyers use it.
- **Fresh sessions,** signed out or with memory off where you can, so past chats don't skew results.
- **Record:** mentioned (Y/N), linked (Y/N), position in the answer (first, middle, last), and who else was cited.

Answers vary between runs. Run each question twice if you can, and only trust a change that holds for two months.

## Source 2 and 3: the free AI reports

| Report | What it shows | What it doesn't |
|---|---|---|
| Search Console: Generative AI performance (June 2026) | Impressions for your pages in AI Overviews, AI Mode and Discover AI features, by page, country, device and date | Which question was asked; other assistants |
| Search Console: Performance (Web) | Clicks from AI Overviews and AI Mode, counted with normal web clicks | AI clicks on their own |
| Bing Webmaster Tools: AI Performance (Feb 2026) | Citations in Copilot and Bing AI answers, cited pages, and grounding queries | Clicks; other assistants |

Put them side by side each month: which pages gained AI impressions in Google, and which gained citations in Bing. When both move for the same page, it's probably the page, not noise.

:::infographic
id: fig-1
type: comparison
title: Four sources, one picture
shows: Four tiles in a row: prompt panel (mentions and links across 5 assistants), Search Console Generative AI report (AI Overviews, AI Mode, Discover impressions), Bing AI Performance (Copilot citations and grounding queries), analytics (visits from chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, claude.ai). Arrows from all four into one monthly dashboard. A paper card: "Trends over months, not single answers".
data: none
alt: The prompt panel, Search Console's Generative AI report, Bing's AI Performance report and analytics referrals all feed one monthly dashboard. Read trends over months, not single answers.
:::

:::video
id: gf-l12-prompt-panel
kind: inline
status: paused
src: /learn/video/get-found/gf-l12-prompt-panel.mp4
captions: /learn/video/get-found/gf-l12-prompt-panel.vtt
poster: /learn/video/get-found/gf-l12-prompt-panel.jpg
transcript: Here's the Groomer Books panel run. Twelve questions, five assistants, fresh sessions, same wording as last month. For "best bookkeeping app for a mobile groomer", Perplexity now cites the comparison page, and ChatGPT mentions Groomer Books without a link. Gemini and Claude don't mention it yet. Each answer goes into the sheet as a row: mentioned, linked, position, and who else was cited. It takes about forty minutes a month.
:::

## Source 4: AI referrals in analytics

When an assistant sends someone to your site, analytics usually records the referrer. In Google Analytics, open the traffic acquisition report, show **Session source**, and look for sources such as `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com` and `claude.ai`. ChatGPT adds `utm_source=chatgpt.com` to many of the links it shows.

Some AI visits arrive with no referrer and show up as direct traffic, so this undercounts. It's still the best signal of which assistants send people who actually do something, such as start a trial.

## Do you need a paid tracker?

Paid trackers run your prompt panel automatically, every day, across assistants, and chart mentions, citations and competitors. Entry prices as of November 2026 (check before you buy):

| Tracker | Entry plan | What it covers |
|---|---|---|
| [Otterly.AI](https://otterly.ai/) | Lite, $29/mo, 15 prompts | ChatGPT, Google AI Overviews, Perplexity and Copilot; others as paid add-ons |
| [Peec AI](https://peec.ai/) | About $95/mo, 50 prompts | 3 assistants of your choice, with citation sources |
| [Semrush AI Visibility Toolkit](https://www.semrush.com/) | $99/mo per domain, 25 prompts | ChatGPT, AI Overviews, Gemini and Perplexity |
| [Ahrefs Brand Radar](https://ahrefs.com/) | With Ahrefs Lite at $129/mo, 5 custom prompts | AI Overviews, AI Mode, Gemini, ChatGPT, Perplexity and Copilot |

A simple rule for a one-person company: **stay manual until the panel stops fitting in an hour a month,** usually past about 20 questions, or until you need daily data for a launch. Then start with the cheapest tracker that covers the assistants your buyers use, and keep running five of your panel questions by hand to check it.

:::infographic
id: fig-2
type: anatomy
title: The monthly AI-visibility dashboard
shows: A one-page sheet dashboard with four blocks: panel score (mentions and links out of 60 answers, with a 3-month sparkline), Google AI impressions by top 5 pages, Bing citations and top grounding queries, and AI referral visits by assistant with trial sign-ups. A notes box at the bottom: "What we changed this month".
data: Illustrative: 12 questions x 5 assistants = 60 answers per run.
alt: A monthly dashboard with four blocks: the prompt panel score with a three-month trend, Google AI impressions by page, Bing citations and grounding queries, and AI referral visits with sign-ups, plus a note of what changed.
:::

:::video
id: gf-l12-free-reports
kind: inline
status: paused
src: /learn/video/get-found/gf-l12-free-reports.mp4
captions: /learn/video/get-found/gf-l12-free-reports.vtt
poster: /learn/video/get-found/gf-l12-free-reports.jpg
transcript: Now the free reports side by side. Search Console's Generative AI report shows the comparison page gaining impressions in AI Mode since it went live. Bing's AI Performance shows Copilot citing the same page, with grounding queries like "bookkeeping app for groomers mileage". Analytics shows eleven visits from perplexity.ai and four trial sign-ups. Same page, three signals. That's the change worth repeating.
:::

:::warning
Don't change your site every time one answer changes. Assistant answers vary from run to run and day to day. Act on changes that hold for at least two monthly runs and show up in more than one source.
:::

:::try-it
Open your analytics and filter session source for `chatgpt.com` and `perplexity.ai` over the last 90 days. Which landing pages did those visitors arrive on?
:::

:::checkpoint
Q: A vendor says its tracker shows "exactly how Google's AI ranks you". What should you think?
- [ ] It's probably right, since it costs money
- [x] Be sceptical. Google says no third-party tool has access to its internal ranking or AI systems; trackers sample answers
- [ ] Only trust it if it covers more assistants
Why: Trackers run prompts and record answers, like your panel but at scale. That's useful, but it's a sample, not a view inside Google.
:::

:::checkpoint
Q: When does a paid tracker start to make sense for a solo founder?
- [ ] From day one, before running any panel by hand
- [x] When the panel no longer fits in about an hour a month, or you need daily data, such as around a launch
- [ ] Never, because the free reports cover everything
Why: The manual panel teaches you what matters and costs nothing. A tracker pays off once the panel is too big to run by hand.
:::

:::takeaways
- Measure AI visibility from four sources: prompt panel, Search Console's Generative AI report, Bing's AI Performance and analytics referrals.
- Keep the panel's wording fixed and read trends over months.
- Act on changes that hold for two runs and show up in more than one source.
- Stay manual until the panel stops fitting in an hour; then pick the cheapest tracker that covers your buyers' assistants.
:::

## Go deeper

- [Google: Search Generative AI performance reports](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) - what the Search Console report shows
- [Bing's AI Performance dashboard](https://explodingtopics.com/blog/bing-ai-performance) - citations and grounding queries explained
- [AI visibility tools pricing compared](https://www.get-ryze.ai/blog/ai-visibility-tools-pricing-compared-2026) - entry prices and prompt allowances, August 2026
- [Semrush AI Toolkit vs Ahrefs Brand Radar](https://resources.rework.com/tools/aeo-ai-visibility/semrush-ai-toolkit-vs-ahrefs-brand-radar) - a pricing comparison, October 2026
