---
module: 1
lesson_number: 3
course: get-found
template: v2
---

# Lesson 3: Technical SEO by Agent

:::video
id: gf-l3-overview
kind: overview
status: paused
src: /learn/video/get-found/gf-l3-overview.mp4
captions: /learn/video/get-found/gf-l3-overview.vtt
poster: /learn/video/get-found/gf-l3-overview.jpg
transcript: Technical SEO sounds like a developer's job, and it used to be. Now your builder agent can read your whole site, check the eight things that matter, and propose every fix in one pull request. You don't need to know the code. You need to know what good looks like, read the agent's plain-English summary, and approve the change. In this lesson you'll learn the eight checks, run an audit with Claude Code, Cursor or Codex, and merge one fix.
:::

:::key-concept
Technical SEO is making sure search engines and AI crawlers can reach, read and trust every page. For a small site it comes down to eight checks: crawl access, a sitemap, one canonical address per page, unique titles and descriptions, a clear heading structure, fast pages, structured data that matches what's on the page, and no broken links. Your builder agent can audit all eight and propose fixes. You approve them through a pull request, the same way as any other change.
:::

## What you'll be able to do

- Name the eight technical checks and what "good" looks like for each
- Run a read-only audit of your site with a builder agent
- Read Core Web Vitals in PageSpeed Insights
- Add structured data the right way, and test it before it goes live

## Why this matters

Most small sites lose search traffic to boring technical problems: a preview address set as the canonical, a sitemap that lists deleted pages, every page with the same title, or a slow hero image. None of it is hard to fix, but finding it used to take an expert. A builder agent can read every file in your repository in minutes. That turns technical SEO from a hire into a 30-minute monthly check.

## The eight checks

| Check | Good looks like | Where to see it |
|---|---|---|
| Crawl access | robots.txt allows search crawlers; private areas are disallowed; no firewall blocks Googlebot or Bingbot | `/robots.txt`, Search Console URL Inspection |
| Sitemap | Lists every public page on your real domain, and nothing deleted or private | `/sitemap.xml`, Search Console Sitemaps |
| Canonical | Each page names one address as the real one, on your real domain, with https | Page source, URL Inspection ("Google-selected canonical") |
| Titles and descriptions | Unique per page; title says what the page answers in about 60 characters | Page source, Search Console Performance |
| Headings | One H1 that matches the page's question; H2s for each section | Page source |
| Speed | Core Web Vitals "good": LCP under 2.5 s, INP under 200 ms, CLS under 0.1 | [PageSpeed Insights](https://pagespeed.web.dev/), Search Console Core Web Vitals |
| Structured data | JSON-LD that describes only what's visible on the page | [Rich Results Test](https://search.google.com/test/rich-results), [Schema Markup Validator](https://validator.schema.org/) |
| Links | No broken internal links; every important page linked from at least one other page | Agent audit, Ahrefs Webmaster Tools Site Audit |

:::infographic
id: fig-1
type: anatomy
title: The eight technical checks
shows: A web page drawn as a card with eight numbered callouts: 1 robots.txt at the door, 2 sitemap as a map, 3 canonical as a single address label, 4 title and description on the tab, 5 one H1 and H2s down the page, 6 a speed gauge with LCP, INP and CLS, 7 a JSON-LD tag matching the visible text, 8 links in and out.
data: Core Web Vitals good thresholds: LCP 2.5 s, INP 200 ms, CLS 0.1.
alt: The eight technical checks on one page: crawl access, sitemap, canonical address, unique title and description, headings, speed, structured data that matches the page, and working links.
:::

:::video
id: gf-l3-audit-prompt
kind: inline
status: paused
src: /learn/video/get-found/gf-l3-audit-prompt.mp4
captions: /learn/video/get-found/gf-l3-audit-prompt.vtt
poster: /learn/video/get-found/gf-l3-audit-prompt.jpg
transcript: Here's the audit on the Rolling Ledger site in Claude Code. We paste the eight-check prompt and ask for read-only. The agent reads the robots file, the sitemap code and every page template. It reports in plain English: canonicals point at the preview address, four pages share one title, the blog has no Article markup, and the hero image is 2 megabytes. Each item has a file and a proposed fix. Nothing has changed yet.
:::

## Run the audit

Ask your builder agent for a read-only audit first. Fixes come after you've read it.

```text
Audit our site for technical SEO. Read-only: change nothing.
Check these eight things and report each as OK or a problem, in plain English:
1. robots.txt: are search crawlers allowed and private areas disallowed?
2. sitemap.xml: does it list every public page on our real domain, and nothing else?
3. canonical links: does every page name itself on our real https domain?
4. titles and meta descriptions: unique per page, title under about 60 characters?
5. headings: exactly one H1 per page, sections under H2s?
6. images and scripts that could slow the first screen (name the biggest ones)
7. structured data: what JSON-LD exists, and does it match visible content?
8. broken internal links, and important pages with no links pointing to them
For each problem: the file, why it matters, and the smallest fix you propose.
```

Then check speed yourself: paste your home page and one key page into [PageSpeed Insights](https://pagespeed.web.dev/) and note the mobile Core Web Vitals. Field data from real visitors appears only once a page has enough traffic; until then, use the lab score as a guide.

## Structured data, the useful kinds

Structured data is a block of JSON-LD that tells search engines what a page is about. For a small business, four types cover most needs:

- **Organization** (or **LocalBusiness** if you serve an area): name, logo, URL, contact and `sameAs` links to your official profiles. Put it on the home page.
- **Person** for the founder, on the about page, linked from articles as the author.
- **Article** on blog posts and answer pages, with the author and the date published and modified.
- **Product** or **Service** with real prices, where you sell something.

Two warnings. First, structured data must describe what's visible on the page; adding things that aren't there breaks Google's guidelines. Second, some rich results have been cut back: Google shows FAQ rich results only for a small set of well-known government and health sites, and has dropped HowTo rich results. You can still use FAQ markup, but don't expect it to change how your result looks. Google also says structured data isn't required for AI features.

:::infographic
id: fig-2
type: flow
title: The agent proposes, you approve
shows: A left-to-right flow: the agent audits (read-only report), you pick which fixes to make, the agent opens a pull request with a plain-English summary, automatic checks and a preview run, you read the summary and the preview, and you merge. A paper card says "Robots.txt and canonical changes always get a second look".
data: none
alt: The agent audits read-only, you choose the fixes, the agent opens a pull request with a summary and a preview, and you check it before you merge. Robots.txt and canonical changes always get a second look.
:::

:::video
id: gf-l3-agent-pr
kind: inline
status: paused
src: /learn/video/get-found/gf-l3-agent-pr.mp4
captions: /learn/video/get-found/gf-l3-agent-pr.vtt
poster: /learn/video/get-found/gf-l3-agent-pr.jpg
transcript: Now the fix. We ask the agent to fix only the canonical addresses and the duplicate titles, in one pull request. It changes two files and writes a summary we can read. We open the preview, view the page source, and see the canonical now uses the real domain. We paste the preview into the Rich Results Test to check the markup still passes. Then we merge, and ask Search Console to recrawl the home page.
:::

## Fix it through a pull request

Pick the fixes that matter most: anything that blocks crawling or indexing first, then canonicals and titles, then speed and structured data. Ask for one pull request per group so each is easy to review:

```text
Fix only these problems from your audit: [list]. Open one pull request.
In the description, list each change in plain English and how I can check
it on the preview. Don't touch robots.txt or anything else not on the list.
```

Review it the way GitHub for Non-Developers taught you: read the summary, open the preview, check one page yourself, then merge. After it's live, use URL Inspection on the changed pages and click **Request indexing**.

:::warning
A wrong robots.txt or canonical change can drop your whole site from search. Never let an agent change either one without your review, and never give it hosting or registrar passwords to "fix things directly". If something breaks, revert the pull request; that's why every change goes through one.
:::

:::try-it
Open your home page, right-click and choose View Page Source. Search for `canonical`. Does the address use your real domain with https? If it shows a hosting or preview address, you've found your first fix.
:::

:::checkpoint
Q: The agent proposes adding FAQ structured data with ten questions that aren't on the page. What do you say?
- [ ] Yes, more markup means more AI citations
- [x] No. Structured data must describe what's visible, and FAQ rich results are limited to a few authoritative sites anyway
- [ ] Yes, but only on the home page
Why: Markup for content that isn't on the page breaks Google's structured data guidelines. Google also says structured data isn't required for its AI features.
:::

:::takeaways
- Eight checks cover technical SEO for a small site. An agent can audit them in minutes.
- Audit read-only first, then fix in small pull requests you review.
- Core Web Vitals good: LCP under 2.5 s, INP under 200 ms, CLS under 0.1.
- Structured data must match the visible page. Use Organization, Person, Article and Product or Service.
:::

## Go deeper

- [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) - the basics from Google
- [Google: Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals) - what LCP, INP and CLS measure
- [Google: Introduction to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) - supported types and guidelines
- [Ahrefs Webmaster Tools](https://ahrefs.com/webmaster-tools) - free site audit and backlinks for sites you verify
