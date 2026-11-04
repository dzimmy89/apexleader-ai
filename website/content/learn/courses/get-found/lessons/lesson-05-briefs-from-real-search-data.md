---
module: 2
lesson_number: 5
course: get-found
template: v2
---

# Lesson 5: Briefs From Real Search Data

:::video
id: gf-l5-overview
kind: overview
status: paused
src: /learn/video/get-found/gf-l5-overview.mp4
captions: /learn/video/get-found/gf-l5-overview.vtt
poster: /learn/video/get-found/gf-l5-overview.jpg
transcript: Most AI-written pages fail before the first word, because nobody looked at what already ranks or what's missing. A brief fixes that. It's one page that says who the article is for, what question it answers, what the top results already cover, and the gap only you can fill from experience. In this lesson you'll build briefs with Claude from real data: the results page, People Also Ask, and your own Search Console, for free, or through an SEO data connection if you want to go faster.
:::

:::key-concept
A content brief is the plan for one page: the reader, the main question, what the top results already cover, the gap you'll fill, the outline, and the facts you need to supply. Built from real search data, it stops AI from writing the same generic page as everyone else. The gap is the point: Google's AI guidance asks for non-commodity content with first-hand experience, and assistants cite pages that add something the others don't.
:::

## What you'll be able to do

- Collect the data a brief needs: the top results, the questions, and your own queries
- Use Claude to analyse what ranks and find the gap
- Connect an SEO data tool to Claude through MCP, if you choose to
- Write a brief that a writer, human or AI, can follow

## Why this matters

If you ask an AI to "write a blog post about bookkeeping for groomers", you get the average of the internet. It won't rank, because the internet already has it, and no assistant will cite it, because it adds nothing. A brief turns your experience into instructions. It takes 20 minutes, and it's the difference between a page that works and one that sits on page five.

## Collect the data

| Data | Free way | Faster way |
|---|---|---|
| The top 10 results for the main question | Search it in a private window and copy the titles and links | An SEO data tool through MCP returns them as a table |
| What each top page covers | Claude Research or a builder agent reads the pages and summarises their headings | Same, from the data tool |
| People Also Ask and related searches | Copy them from the results page | The data tool returns them |
| Your own queries on this topic | Search Console Performance, filtered by a word in the topic | A Search Console connection in Claude |
| Your questions | The topic's rows from your question bank (Exercise 2) | Same |

### Optional: give Claude SEO data through MCP

MCP (Model Context Protocol) lets Claude, Claude Code or Cursor call another tool directly. Several SEO data services offer MCP servers. As of November 2026:

- **[DataForSEO MCP](https://dataforseo.com/)** is pay-as-you-go with no subscription, with a $50 minimum deposit. It returns results pages, keyword data and more. A brief's worth of data typically costs cents, but check your balance after each session.
- **Search Console MCP servers** let Claude read your own Search Console data. Some, such as SEOMCP, have a small free tier.
- **Ahrefs, Semrush and SE Ranking** include MCP access with their paid plans, if you already pay for one.

Brief-writing tools such as **Frase**, **NeuronWriter** and **Surfer** do similar work inside their own editors, from about $15 to $69 a month. They're optional. Everything in this course works with the free route.

:::infographic
id: fig-1
type: flow
title: Data in, brief out
shows: Four data sources on the left (top 10 results, People Also Ask, your Search Console queries, your question bank rows) flow into Claude in the middle, which produces a one-page brief on the right with its sections: reader, main question, what the top results cover, the gap, outline, facts you must supply. A free route and an MCP route are drawn as two paths into Claude.
data: none
alt: The top results, People Also Ask, your own queries and your question bank go into Claude, by copying or through an MCP connection, and come out as a one-page brief.
:::

:::video
id: gf-l5-mcp-data
kind: inline
status: paused
src: /learn/video/get-found/gf-l5-mcp-data.mp4
captions: /learn/video/get-found/gf-l5-mcp-data.vtt
poster: /learn/video/get-found/gf-l5-mcp-data.jpg
transcript: Here are both routes for one Groomer Books topic. The free route: we search "best bookkeeping software for dog groomers" in a private window, copy the top ten links, and ask Claude Research to read them and list each page's headings. The faster route: Claude Code, connected to a data service through MCP, pulls the same results page and the People Also Ask questions as a table in a few seconds, for a few cents. Same data, less copying.
:::

## Find the gap

The gap is what the top pages don't do, and you can. Ask Claude to look for it:

```text
Here are the top 10 results for "[main question]" with each page's headings
(pasted below), plus the People Also Ask questions and our question bank rows
for this topic. Tell me:
1. What every top page covers (the table stakes we must cover too)
2. What most of them miss or get vaguely: specifics, numbers, comparisons,
   first-hand steps, or a type of reader they ignore
3. Which questions from our bank none of them answer
4. Three angles where our experience could add something none of them have
Don't invent facts about our business. Mark anything that's a guess.
```

Gaps that usually win: a real comparison with specifics, a worked example with numbers, steps from someone who's done the job, and answers for a narrower reader the big sites ignore.

## Write the brief

```text
Write a content brief for one page on "[main question]", using your analysis.
Sections:
- Reader: who they are and what they're trying to decide
- Main question and a 50-word direct answer to open the page
- Must cover: the table stakes, as H2s
- Our gap: the 1 or 2 angles that make this page different
- Outline: H1, H2s and H3s, with one line on what each section says
- Facts I must supply: a list of numbers, examples and experiences only I know
- Internal links: which of our pages to link to and from
- Not this page: related questions that belong on another page
```

:::infographic
id: fig-2
type: anatomy
title: The anatomy of a brief
shows: A one-page brief with eight labelled parts: reader, main question with a 50-word answer, must-cover sections, our gap (highlighted), outline, facts I must supply (as a checklist), internal links, and "not this page". A paper note points at the gap: "Why this page deserves to exist".
data: none
alt: A brief has eight parts: the reader, the main question and short answer, what to cover, the gap that makes it different, the outline, the facts only you can supply, internal links, and what belongs on another page.
:::

:::video
id: gf-l5-finding-the-gap
kind: inline
status: paused
src: /learn/video/get-found/gf-l5-finding-the-gap.mp4
captions: /learn/video/get-found/gf-l5-finding-the-gap.vtt
poster: /learn/video/get-found/gf-l5-finding-the-gap.jpg
transcript: Claude reads the ten pages and finds the pattern. Every one lists five apps with a paragraph each. None compares how each app handles cash tips, mileage for a grooming van, or quarterly tax estimates, which are the three questions groomers ask most in our bank. That's the gap. The brief's opening answer names the best fit for each type of groomer, and the facts list asks our founder for her real numbers from forty salons.
:::

:::warning
A brief is only as good as its facts. If the "facts I must supply" list is empty, the brief has asked the AI to make things up. Fill every item yourself before anyone writes the page, and cut any section you can't support.
:::

:::try-it
Search your priority 1 question in a private window. Open the top three results and write one line each on what they do well. Then write one line on what none of them do. That line is your gap.
:::

:::checkpoint
Q: The top 10 results for your topic all list the same five tips. What should your brief aim for?
- [ ] The same five tips, written better
- [ ] Twenty tips, so it's the longest page
- [x] The table stakes, plus a gap they all miss, such as a comparison with specifics or steps from first-hand experience
Why: Google asks for non-commodity content, and assistants cite pages that add something. Length alone isn't the goal.
:::

:::takeaways
- A brief turns search data and your experience into instructions for one page.
- The free route works: copy the top results and let Claude read them. MCP tools make it faster.
- The gap is the reason the page should exist. Find it before writing.
- Every brief ends with a list of facts only you can supply.
:::

## Go deeper

- [Google: Optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) - non-commodity content in Google's words
- [Model Context Protocol](https://modelcontextprotocol.io/) - how MCP connects tools to Claude
- [Best MCP servers for SEO in 2026](https://storylab.ai/best-mcp-server-for-seo/) - DataForSEO, Ahrefs, Semrush, SE Ranking and others compared
