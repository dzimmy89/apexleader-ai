---
module: 1
lesson_number: 1
course: get-found
template: v2
---

# Lesson 1: How Search Works Now, and Your Free Stack

:::video
id: gf-l1-overview
kind: overview
status: paused
src: /learn/video/get-found/gf-l1-overview.mp4
captions: /learn/video/get-found/gf-l1-overview.vtt
poster: /learn/video/get-found/gf-l1-overview.jpg
transcript: Search has two front doors now. One is the familiar list of links. The other is an AI answer that cites a handful of sources, in Google's AI Overviews and AI Mode, in ChatGPT, Perplexity, Claude and Copilot. Both doors run on the same basics: a crawler has to reach your page, the page has to be indexed, and it has to be the clearest answer to the question. In this course you'll do that work with free tools and the AI subscriptions you already pay for. This lesson sets up the free stack: Google Search Console and Bing Webmaster Tools, which now both report when AI answers show your pages.
:::

:::key-concept
Every search result, a blue link or a line in an AI answer, comes from the same four steps: a crawler finds your page, the search engine stores it in its index, a ranking system decides it's the best match, and the result is shown as a link or quoted in an answer. Google says its AI features are built on its core Search ranking systems, so the work that gets you ranked is the work that gets you cited. Two free consoles, Google Search Console and Bing Webmaster Tools, show you what happens at each step.
:::

## What you'll be able to do

- Explain the four steps every page goes through before anyone can find it
- Set up Google Search Console and Bing Webmaster Tools for your site
- Read the reports that matter: pages indexed, search queries, and AI-feature visibility
- Turn on IndexNow so Bing and other engines hear about new pages quickly

## Why this matters

A solo founder can't buy attention for long. Search is the one channel that keeps paying after you stop working on a page. In 2026 a buyer may meet you as a link on Google, a source under an AI Overview, or a citation in ChatGPT. You don't need a separate plan for each. You need pages that a crawler can reach, an index that has them, and a way to see what's working. The tools for that last part are free, and most small sites have never set them up.

## The four steps

1. **Crawl.** A bot such as Googlebot or Bingbot fetches your page. If robots.txt, a login wall or a firewall blocks it, nothing else happens.
2. **Index.** The engine stores the page and works out what it's about. Thin, duplicate or broken pages may be crawled but left out.
3. **Rank.** For each search, ranking systems pick the most helpful pages. First-hand experience, clear answers and trust signals matter here.
4. **Show.** The result appears as a link, a rich result, or a source inside an AI answer. Google says there are no extra technical requirements to appear in AI Overviews or AI Mode beyond being indexed and eligible to show a snippet.

ChatGPT, Perplexity and Claude run their own search crawlers and also lean on search indexes, which is why Bing matters more than its market share suggests. Module 3 covers how those assistants pick sources.

:::infographic
id: fig-1
type: flow
title: One index feeds links and AI answers
shows: Four steps left to right: crawl (a bot reaches the page), index (the page is stored), rank (it's picked as the best match), show. The last step splits into two outputs: a blue link on a results page and a cited source under an AI answer. A paper card underneath says "Fix the earliest broken step first".
data: none
alt: A page is crawled, indexed and ranked, and then shown either as a search link or as a cited source in an AI answer. The same four steps feed both.
:::

:::video
id: gf-l1-one-index
kind: inline
status: paused
src: /learn/video/get-found/gf-l1-one-index.mp4
captions: /learn/video/get-found/gf-l1-one-index.vtt
poster: /learn/video/get-found/gf-l1-one-index.jpg
transcript: Here's why one plan covers both front doors. Google's AI Overviews and AI Mode are built on Google's normal ranking systems, so a page has to be indexed and snippet-eligible before it can be cited. ChatGPT, Perplexity and Claude run their own search crawlers, and Microsoft Copilot grounds its answers in Bing. So the first job is the same everywhere: make sure the crawlers reach your pages and the indexes have them. When something isn't showing, fix the earliest broken step first.
:::

## Your free stack

| Tool | What it tells you | Cost |
|---|---|---|
| [Google Search Console](https://search.google.com/search-console) | Which pages are indexed and why others aren't, the queries that show your pages, clicks and position, and a Generative AI performance report for AI Overviews, AI Mode and Discover | Free |
| [Bing Webmaster Tools](https://www.bing.com/webmasters) | Indexing, queries and backlinks for Bing, plus an AI Performance report that counts how often Copilot and Bing answers cite your pages | Free |
| IndexNow (inside Bing Webmaster Tools) | Tells Bing and other participating engines the moment a page is added or changed | Free |
| Google Business Profile | Your listing in Maps and local results (Lesson 4) | Free |

### Search Console in five minutes

- **Pages** (under Indexing) lists which pages are indexed and the reason for each one that isn't, such as "Crawled, currently not indexed" or "Excluded by noindex tag".
- **Performance** shows queries, clicks, impressions, click-through rate and average position. Google says clicks from AI Overviews and AI Mode are counted here under the Web search type.
- **Generative AI performance**, launched in June 2026, shows impressions for your pages inside AI Overviews, AI Mode and Discover's AI features, by page, country, device and date. Google rolled it out to a subset of sites first, so your property may not have it yet.
- **URL Inspection** checks one page: is it indexed, when was it last crawled, and can Google render it.
- **Sitemaps** is where you submit `yoursite.com/sitemap.xml` so Google finds every page.

### Bing Webmaster Tools in five minutes

- You can sign in and **import your site from Search Console**, which verifies it in one step.
- **AI Performance**, added in February 2026, shows total citations in Copilot and Bing AI answers, which pages were cited, and the **grounding queries**: the short phrases the AI used to find your content. A citation isn't a click, so treat it as a visibility trend.
- **IndexNow** pings participating engines when you publish. Many hosts and site builders have it built in. Google does not use IndexNow, so keep your sitemap submitted in Search Console too.

:::infographic
id: fig-2
type: comparison
title: What each free console shows
shows: Two columns, Google Search Console and Bing Webmaster Tools. Rows: indexing (Pages report vs Site Explorer), queries (Performance vs Search Performance), AI visibility (Generative AI performance: impressions in AI Overviews, AI Mode, Discover vs AI Performance: citations and grounding queries in Copilot), fast indexing (sitemap only vs IndexNow). A paper card says "Verify both on day one".
data: Generative AI performance report launched June 2026. Bing AI Performance launched February 2026.
alt: Search Console shows indexing, queries and AI-feature impressions for Google. Bing Webmaster Tools shows indexing, queries, Copilot citations and grounding queries, and adds IndexNow. Verify both on day one.
:::

:::video
id: gf-l1-console-tour
kind: inline
status: paused
src: /learn/video/get-found/gf-l1-console-tour.mp4
captions: /learn/video/get-found/gf-l1-console-tour.vtt
poster: /learn/video/get-found/gf-l1-console-tour.jpg
transcript: Here's a quick tour on a real site. In Search Console, the Pages report lists what's indexed and why the rest isn't. Performance shows the queries people typed and where we appeared. The Generative AI report shows impressions inside AI Overviews and AI Mode. In Bing Webmaster Tools we imported the site from Search Console in one click, and the AI Performance report shows how often Copilot cited our pages and the grounding queries behind each citation.
:::

## Let your builder agent check the basics

You don't need to read code to check the plumbing. If your site lives in GitHub, ask Claude Code, Cursor or Codex:

```text
Check our site's search basics. Tell me in plain English:
1. Does /robots.txt exist, and does it block anything important?
2. Does /sitemap.xml exist, list every public page, and use our real domain?
3. Does every page have a unique <title> and meta description?
4. Do canonical links point at our real domain, not a preview or hosting URL?
Change nothing. List each problem with the file and the fix you propose.
```

:::warning
Verification gives a tool access to your site's search data, not to your site. Still, verify with the method that leaves the least behind: a DNS record or an HTML tag added through a pull request you approve. Never hand an agent your domain registrar or hosting password to do it.
:::

:::try-it
Search Google for `site:yourdomain.com`. The rough count of results tells you how many of your pages Google has indexed. If a page you care about is missing, it's the first one to check in URL Inspection.
:::

:::checkpoint
Q: A new page has been live for three weeks and gets no search traffic. What do you check first?
- [ ] Whether the page has enough keywords
- [x] Whether Google has crawled and indexed it, in URL Inspection
- [ ] Whether you need an llms.txt file
Why: Fix the earliest broken step first. If the page isn't indexed, ranking and AI citations can't happen at all.
:::

:::checkpoint
Q: What does Bing's AI Performance report count?
- [ ] Clicks from ChatGPT
- [x] How often Copilot and Bing AI answers cite your pages, and the grounding queries behind them
- [ ] Your ranking position on Google
Why: It reports citations, not clicks, and only for Microsoft's AI answers. Use it as a trend alongside Search Console.
:::

:::takeaways
- Every result comes from crawl, index, rank and show. Fix the earliest broken step first.
- Google's AI features run on its core ranking systems, so SEO is also the base of AI visibility.
- Search Console and Bing Webmaster Tools are free and now both report AI-answer visibility.
- Submit your sitemap to Google and turn on IndexNow for Bing.
:::

## Go deeper

- [Google: In-depth guide to how Search works](https://developers.google.com/search/docs/fundamentals/how-search-works) - crawling, indexing and serving, from Google
- [Google: Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) - Google's guidance for AI Overviews and AI Mode, updated July 2026
- [Google: Search Generative AI performance reports](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) - the June 2026 Search Console report
- [Bing's AI Performance dashboard](https://explodingtopics.com/blog/bing-ai-performance) - what the citation and grounding-query metrics mean
