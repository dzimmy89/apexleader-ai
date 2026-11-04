---
module: 3
lesson_number: 10
course: get-found
template: v2
---

# Lesson 10: Pages That Get Cited

:::video
id: gf-l10-overview
kind: overview
status: paused
src: /learn/video/get-found/gf-l10-overview.mp4
captions: /learn/video/get-found/gf-l10-overview.vtt
poster: /learn/video/get-found/gf-l10-overview.jpg
transcript: When an assistant writes an answer, it looks for passages that settle a claim: a direct answer, a number, a clear comparison. Pages that say something specific get quoted. Pages that say what everyone says get skipped. In this lesson you'll learn the shape of a citable page, and build the two kinds that small businesses win with most: an honest comparison with real specifics, and a page of your own original data. A one-person company can't outspend anyone, but it can out-specific them.
:::

:::key-concept
A citable page gives an assistant something it can quote and stand behind: the answer in the first sentences, specifics such as numbers, prices, dates and named options, a clear structure where each section answers one sub-question, a visible author and "last updated" date, and something nobody else has, such as original data or first-hand results. Comparison pages with real specifics and pages with original data are the two formats a small business can win most often.
:::

## What you'll be able to do

- Spot what makes a passage quotable
- Restructure a page so each section answers one sub-question
- Build an honest comparison page with a specifics table
- Publish original data from your own business, safely

## Why this matters

An assistant cites a few sources per answer, and it picks the ones that support its sentences best. A page of general advice supports nothing in particular. A table that says app A handles cash tips and app B doesn't, checked on a date, supports a precise claim. One study of Bing's citation data found that a detailed comparison page, with pricing, features and named vendors, earned most of one site's Copilot citations. Specifics are the cheapest advantage a small business has.

## The shape of a citable page

1. **Question as the H1**, in the buyer's words.
2. **The answer in two or three sentences**, before anything else. If someone read only this, they'd have the answer.
3. **One section per sub-question**, each with an H2 that is itself a question or a clear label, and the answer at the top of the section.
4. **Specifics everywhere**: numbers with units, prices with dates, named options, real examples.
5. **A table** wherever you compare things on the same attributes.
6. **Author and date**: who wrote it, why they know, when it was last checked.
7. **Sources** linked for any fact that isn't yours.

All of this is text on the page. Don't put key facts only in images or video, and don't hide them behind tabs that need a click to load.

:::infographic
id: fig-1
type: anatomy
title: Anatomy of a citable page
shows: A page with seven numbered callouts: 1 the question as H1, 2 a two-sentence answer box at the top, 3 H2 sub-questions each opening with its answer, 4 specifics highlighted (a price with a date, a number with a unit), 5 a comparison table, 6 author line with "Last checked" date, 7 linked sources. A quote mark icon beside the answer box and the table: "what gets quoted".
data: none
alt: A citable page puts the question in the H1, the answer first, one sub-question per section, specifics and a table in text, an author and date, and linked sources. The answer box and the table are what gets quoted.
:::

:::video
id: gf-l10-answer-first
kind: inline
status: paused
src: /learn/video/get-found/gf-l10-answer-first.mp4
captions: /learn/video/get-found/gf-l10-answer-first.vtt
poster: /learn/video/get-found/gf-l10-answer-first.jpg
transcript: Here's a Groomer Books page before and after. Before, the first paragraph talks about how busy groomers are. The answer is in paragraph four. After, the first two sentences say which app fits a mobile groomer and why, with the price and date. Each section opens with its own answer. We asked Perplexity the same question a few weeks later, and the opening sentence was the passage it quoted.
:::

## The honest comparison page

Buyers ask assistants "X or Y?" and "best X for Y" constantly. A comparison page answers that, and it's citable when it's specific and fair.

- **Compare on what buyers actually decide on**, from your question bank, not on what flatters you.
- **One row per option, one column per attribute**, with units and the date you checked.
- **Include yourself honestly**, and say who each option is best for, including when it isn't you.
- **Link each vendor's pricing page** and re-check prices when you refresh the page.

```text
Build a comparison table for "[question]". Options: [list, including us].
Attributes: [the 4 to 6 things buyers decide on]. Use only facts from the
sources I paste below and our own product facts. Add a "Best for" row.
Write "not stated" where a source doesn't say. Add the date checked.
Then write a 2-sentence verdict per type of buyer. Be fair to competitors.
```

Check every cell against the vendor's own page before you publish. A comparison with one wrong fact about a competitor costs you more trust than it ever earns.

## Original data

Assistants and journalists love numbers nobody else has. You have some: from your customers, your own operations, or a small survey.

- **Your operations:** "Across 40 salons, month-end close took a median of 6 hours before switching and 1.8 after."
- **A small survey:** ask 50 customers three questions and publish the results with the method.
- **A benchmark:** time five tools doing the same task and publish the method and results.

Rules: get consent, never publish anything that identifies a customer without permission, say how many people or cases the number covers, and describe the method in a sentence. Small, honest data beats big, vague claims.

:::infographic
id: fig-2
type: comparison
title: Vague versus specific
shows: Two passages side by side. Vague: "Many apps can help groomers with taxes and are affordable." Specific: "App A tracks van mileage automatically and costs $15 a month (checked 1 Nov 2026); App B needs manual entries." The specific passage has a quote mark and "cited" stamp; the vague one has "skipped".
data: none
alt: A vague sentence about apps being affordable gets skipped. A specific sentence naming the app, the feature, the price and the date checked gets cited.
:::

:::video
id: gf-l10-comparison-table
kind: inline
status: paused
src: /learn/video/get-found/gf-l10-comparison-table.mp4
captions: /learn/video/get-found/gf-l10-comparison-table.vtt
poster: /learn/video/get-found/gf-l10-comparison-table.jpg
transcript: Now the comparison table. We give Claude the four apps' pricing and feature pages and our own facts. It builds a table on tips, mileage, quarterly estimates and price, with "not stated" where a vendor doesn't say. Then we check every cell against the vendor pages ourselves, fix one wrong price, and add the date checked. The verdict names the best fit for salon, mobile and solo groomers, and for one of them, it isn't us.
:::

## Make it machine-clear too

- Mark up the page with **Article** structured data, author and `dateModified` (Lesson 3), matching what's visible.
- Use real HTML tables for tables, not images of tables.
- Keep the URL stable. Refresh the page instead of publishing "2027 edition" copies.

:::warning
Never invent data, quotes or "studies" to look citable, and never publish false claims about a competitor. Assistants and readers both check, and false comparative claims can expose you to legal complaints. If you can't verify a cell, write "not stated".
:::

:::try-it
Take your pillar page from Exercise 6 and read only its first two sentences. Do they fully answer the H1 question, with at least one specific? If not, rewrite them now.
:::

:::checkpoint
Q: Which passage is most likely to be cited by an assistant?
- [ ] "There are lots of great options, and the best one depends on your needs."
- [x] "For mobile groomers, App A is the best fit: it logs van mileage automatically and costs $15 a month (checked November 2026)."
- [ ] "Click here to learn more about our amazing app."
Why: It answers directly with specifics an assistant can stand behind: who it's for, the feature, the price and the date.
:::

:::takeaways
- Put the answer first, then one sub-question per section, in text.
- Specifics win: numbers, prices with dates, named options and tables.
- Honest comparison pages and original data are a small business's best citation formats.
- Check every fact, especially about competitors, and write "not stated" when unsure.
:::

## Go deeper

- [Google: Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) - original information and first-hand expertise
- [What 20,000 Copilot citations taught us](https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/) - why a specific comparison page dominated one site's citations
- [Google: Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) - author and date markup
