---
module: 1
lesson_number: 2
course: get-found
template: v2
---

# Lesson 2: Find the Questions Buyers Ask

:::video
id: gf-l2-overview
kind: overview
status: paused
src: /learn/video/get-found/gf-l2-overview.mp4
captions: /learn/video/get-found/gf-l2-overview.vtt
poster: /learn/video/get-found/gf-l2-overview.jpg
transcript: People don't search in keywords anymore. They ask full questions, to Google and even more to AI assistants. So your research starts with the questions real buyers ask, in your inbox, your sales calls, Reddit threads and People Also Ask boxes. Then you check which ones have search demand, and group them into topics, so one strong page answers a whole family of questions. In this lesson you'll build a question bank and a topic map with Claude, Grok and free Google tools.
:::

:::key-concept
A keyword is a short label; a question is what a buyer actually types or asks. Start from real questions, then check demand, then group them. A topic cluster is one main page that answers the big question, plus a few supporting pages for the narrower ones, all linked together. One page per question variant is the mistake: Google says its systems understand synonyms, and making a page for every small variation can count as scaled content abuse.
:::

## What you'll be able to do

- Collect real buyer questions from five free sources
- Use Grok and Claude to find more, without inventing any
- Check rough demand with Search Console, Keyword Planner and People Also Ask
- Group the questions into a topic map: one main page per topic

## Why this matters

Most founders guess what to write, then wonder why nobody comes. The questions your buyers ask are already written down: in emails to you, in reviews of your competitors, in forum threads. Answering those questions well is the whole game, for search and for AI answers. And because AI assistants handle long, specific questions, the narrow, honest question a buyer asks is often easier to win than the short, crowded keyword.

## Five places real questions live

| Source | How to collect | What it's best for |
|---|---|---|
| Your inbox and sales calls | Search email for "?" from prospects, and pull questions from call notes | The exact words buyers use, and the questions just before buying |
| Search Console queries | Performance → Queries, filtered to queries containing who, what, how, can, does | What already shows your site, often on page two |
| People Also Ask and autocomplete | Search your main topic in Google and open every question box | Questions Google sees often, and how they branch |
| Reddit, forums and X | Search `site:reddit.com your topic`, or ask Grok to search X and the web | Frustrations, comparisons, and the words people use when they complain |
| Competitor reviews | Read 2- and 3-star reviews of the tools your buyers use today | Gaps your page can fill |

:::infographic
id: fig-1
type: flow
title: Questions in, topics out
shows: A funnel. At the top, five source icons (inbox, Search Console, People Also Ask, Reddit and X, reviews) pour about 60 questions in. The middle layer removes duplicates and off-topic questions, leaving about 40. The bottom groups them into 6 topics, each with one main page and 2 to 4 supporting questions.
data: About 60 raw questions, about 40 after cleaning, 6 topics.
alt: Collect about 60 questions from five sources, clean them down to about 40, and group them into 6 topics, each with one main page and a few supporting questions.
:::

:::video
id: gf-l2-where-questions-live
kind: inline
status: paused
src: /learn/video/get-found/gf-l2-where-questions-live.mp4
captions: /learn/video/get-found/gf-l2-where-questions-live.vtt
poster: /learn/video/get-found/gf-l2-where-questions-live.jpg
transcript: Let's collect questions for Groomer Books. Our inbox has twelve, like "can I deduct my grooming van?" Search Console shows eight we already appear for on page two. People Also Ask adds a branch of tax questions. Grok searches X and Reddit and finds groomers complaining about tracking tips and cash payments, with links to each post. Every question keeps its source, so nothing in the bank is made up.
:::

## Use AI to find more, not to invent

Grok can search X and the web in real time, and Claude's Research mode can read many pages and cite them. Both are good at finding questions. Neither should make them up. Ask for sources every time:

```text
Search Reddit, X and industry forums for questions that [customer type]
ask about [your topic] in the last 12 months. Return a table: question
in the person's own words | link to where it was asked | date. Only
include questions you can link to. No paraphrased or invented questions.
```

Then check two or three links yourself. If a link doesn't show the question, delete the row.

## Check demand, roughly

You don't need exact search volumes. You need to know which questions have some demand and which are just yours.

- **Search Console** is the best signal you have: real impressions for your own site.
- **[Google Keyword Planner](https://ads.google.com/home/tools/keyword-planner/)** is free with a Google Ads account. Without active ad spend it shows ranges such as "100 to 1K", which is enough.
- **People Also Ask** and autocomplete show that Google sees a question often.
- **Keywords Everywhere** is an optional, low-cost browser add-on that shows volume next to Google results.

Mark each question High, Some or Unknown. Don't throw out Unknown questions from real buyers. AI assistants get long, specific questions that never show up in keyword tools.

## Group into a topic map

A topic map is one row per topic: the main question, the main page that answers it, and the supporting questions under it. Ask Claude to do the first pass:

```text
Here is our question bank (pasted below, with sources). Group the questions
into 5 to 8 topics. For each topic give: a main question that a single page
can answer well, 2 to 4 supporting questions that need their own short page
or a section of the main page, and which questions are near-duplicates that
belong on the same page. Don't add questions that aren't in the bank.
```

:::infographic
id: fig-2
type: anatomy
title: A good question bank row
shows: One sheet row, labelled: the question in the buyer's words, source link, date found, stage (problem, comparison or purchase), demand (High, Some, Unknown), topic, and target page. A paper note says "No source, no row".
data: none
alt: Each row of the question bank holds the buyer's words, a source link, the date, the buying stage, a rough demand mark, its topic and the page that will answer it. No source, no row.
:::

:::video
id: gf-l2-clustering
kind: inline
status: paused
src: /learn/video/get-found/gf-l2-clustering.mp4
captions: /learn/video/get-found/gf-l2-clustering.vtt
poster: /learn/video/get-found/gf-l2-clustering.jpg
transcript: Now Claude groups forty questions into six topics. "Can I deduct my van", "is mileage deductible for mobile groomers" and "van expenses for groomers" become one topic with one main page, because they're the same question in different words. A comparison topic, "QuickBooks or a groomer app", gets its own page. We check every grouping, merge one more pair by hand, and the topic map is ready for Lesson 5.
:::

:::warning
Don't plan a page for every variation of a question. Google says its systems understand synonyms and that mass-producing pages to target small variations can violate its scaled content abuse policy. One strong page per topic beats ten thin ones.
:::

:::try-it
Open your sent and received email for the last three months and search for "?". Copy every question a prospect or customer asked into a sheet. Most founders find 15 or more in ten minutes.
:::

:::checkpoint
Q: Three questions in your bank are "Can groomers deduct a van?", "Is a grooming van tax deductible?" and "Van write-off for mobile groomers". How many pages should they get?
- [x] One page that answers all three
- [ ] Three pages, one per question
- [ ] None, because they have low search volume
Why: They're the same question in different words. Google understands synonyms, and one strong page serves the topic better than three thin ones.
:::

:::takeaways
- Start from real questions with sources, not invented keywords.
- Grok and Claude are good at finding questions. Make them link to every one.
- Rough demand is enough: Search Console, Keyword Planner ranges and People Also Ask.
- Group questions into topics. One main page per topic, never one page per variation.
:::

## Go deeper

- [Google: Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) - what Google's ranking systems reward
- [Google: Spam policies, scaled content abuse](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content) - what not to mass-produce
- [Google Keyword Planner](https://ads.google.com/home/tools/keyword-planner/) - free demand ranges with a Google Ads account
