---
module: 3
lesson_number: 9
course: get-found
template: v2
---

# Lesson 9: How AI Answers Pick Sources

:::video
id: gf-l9-overview
kind: overview
status: paused
src: /learn/video/get-found/gf-l9-overview.mp4
captions: /learn/video/get-found/gf-l9-overview.vtt
poster: /learn/video/get-found/gf-l9-overview.jpg
transcript: When someone asks ChatGPT, Gemini, Perplexity, Claude or Copilot a question that needs current facts, the assistant searches first. It turns the question into a few search queries, retrieves pages, and writes an answer that cites some of them. GEO, generative engine optimization, is the work of being one of those pages. Google says plainly that for its AI features, GEO is just SEO. For the other assistants, there's one extra step: their own search crawlers have to be let in. In this lesson you'll see how the pipeline works, sort myth from fact, and check which AI bots can reach your site.
:::

:::key-concept
AI answers that cite sources work in three steps: the assistant rewrites the question into one or more search queries, retrieves pages from a search index or its own crawler, and writes an answer grounded in a few of them. To be cited, your page has to be retrievable (crawled and indexed), relevant to those queries, and the clearest, most trustworthy source for the claim. Google treats optimizing for its AI features as ordinary SEO and ignores special files like llms.txt. ChatGPT, Perplexity and Claude also need their search crawlers allowed.
:::

## What you'll be able to do

- Explain how an assistant turns a question into sources
- Tell search crawlers from training crawlers for each assistant, and decide on each
- Sort the common GEO myths from what the platforms actually say
- Find out which AI bots actually visit your site, from your server logs

## Why this matters

A whole industry now sells "GEO" as something new and mysterious. Most of it is SEO with a new name, and some of it is wasted effort. Knowing how retrieval really works stops you buying tricks and points you at the few things that matter: access, clear pages and real mentions. And because Copilot grounds in Bing and ChatGPT's search has its own crawler, being findable outside Google matters more than it used to.

## The pipeline

1. **Rewrite.** The assistant turns the question into search queries. Google calls this "query fan-out" in AI Mode: one question becomes several searches on its parts. Bing's AI Performance report shows the resulting **grounding queries** that found your pages.
2. **Retrieve.** It fetches candidate pages from a search index (Google's own, Bing's, or the assistant's) or by crawling them live.
3. **Ground and cite.** It writes the answer from the passages that best support each claim, and links some of them.

Each step is a filter. A page blocked from the crawler never reaches step 2. A page that buries the answer, or says nothing specific, loses at step 3.

:::infographic
id: fig-1
type: flow
title: From question to citation
shows: Left to right: a user's question ("best bookkeeping app for a mobile groomer?"), the assistant fans it out into three search queries, retrieval pulls about 20 pages from an index and crawler, grounding picks 3 to 5 passages, and the answer shows with 3 cited links. Under each step, a filter label: "blocked bots stop here", "irrelevant pages stop here", "vague pages stop here".
data: Illustrative: 1 question, 3 queries, about 20 pages retrieved, 3 to 5 passages, 3 citations.
alt: An assistant rewrites a question into several searches, retrieves pages, and grounds its answer in a few passages it cites. Blocked, irrelevant and vague pages drop out at each step.
:::

:::video
id: gf-l9-search-vs-training
kind: inline
status: paused
src: /learn/video/get-found/gf-l9-search-vs-training.mp4
captions: /learn/video/get-found/gf-l9-search-vs-training.vtt
poster: /learn/video/get-found/gf-l9-search-vs-training.jpg
transcript: Each AI company runs separate bots for separate jobs. The search bot decides whether you can be cited in answers. The training bot collects pages to train future models. They're separate settings. You can let OAI-SearchBot in so ChatGPT can cite you, and block GPTBot so OpenAI doesn't train on you. For Google, normal Googlebot covers AI Overviews and AI Mode, and Google-Extended controls Gemini training, not Search.
:::

## Search crawlers versus training crawlers

| Assistant | Crawler that decides if you can be cited | Training crawler (a separate choice) |
|---|---|---|
| Google AI Overviews and AI Mode | Googlebot (normal Search) | Google-Extended, which controls Gemini model use and grounding outside Search, not Search itself |
| ChatGPT search | OAI-SearchBot | GPTBot |
| Perplexity | PerplexityBot | Perplexity says PerplexityBot isn't used for training |
| Claude | Claude-SearchBot | ClaudeBot |
| Microsoft Copilot | Bingbot (Copilot grounds in Bing) | Bing's own controls |

There are also **user agents** such as ChatGPT-User, Perplexity-User and Claude-User, which fetch a page because a person asked about it. OpenAI and Perplexity say robots.txt may not apply to those visits.

Allow every search crawler. Decide on training crawlers on purpose; it's a business choice, and either answer is fine.

Then check your host and CDN. Some firewalls and CDNs block AI bots by default or offer a one-click block; Cloudflare, for example, added settings in 2025 that can block AI crawlers on new sites. A search crawler blocked by a firewall is as invisible as one blocked in robots.txt.

## Myth or fact

| Claim | What the platforms say |
|---|---|
| "You need an llms.txt file" | Google says Google Search ignores llms.txt and you don't need new machine-readable files. Crawler-log studies show AI bots rarely fetch it. It's harmless but optional |
| "Chunk content into short pages for AI" | Google says its systems understand pages with several topics and there's no ideal length. Don't chunk |
| "Rewrite pages for AI" | Google says its systems understand synonyms and meaning. Write for people |
| "Structured data is what AI reads" | Google says it isn't required for AI features. It's still useful for rich results (Lesson 3) |
| "Seed mentions of your brand everywhere" | Google says inauthentic mentions aren't as helpful as they seem, and its spam systems work against them (Lesson 11) |
| "Being crawlable and clear is enough to start" | True. Access, indexing and a clear answer are the base of every citation |

:::infographic
id: fig-2
type: comparison
title: GEO myths and facts
shows: A two-column card. Left, crossed out: llms.txt required, chunk into short pages, rewrite for AI, structured data is what AI reads, seed mentions everywhere. Right, ticked: let search crawlers in, get indexed, answer clearly in text, add first-hand specifics, earn real mentions. Footer: "Google: optimizing for generative AI search is SEO."
data: none
alt: Myths crossed out: llms.txt, chunking, rewriting for AI, structured data as the key, and seeding mentions. Facts ticked: let search crawlers in, get indexed, answer clearly, add specifics and earn real mentions.
:::

:::video
id: gf-l9-reading-bot-logs
kind: inline
status: paused
src: /learn/video/get-found/gf-l9-reading-bot-logs.mp4
captions: /learn/video/get-found/gf-l9-reading-bot-logs.vtt
poster: /learn/video/get-found/gf-l9-reading-bot-logs.jpg
transcript: Robots.txt says who's allowed. Your logs say who actually came. Here we ask Claude Code to search a week of our hosting logs for AI user agents. Googlebot and Bingbot visit every day. OAI-SearchBot and Claude-SearchBot came to the pillar page and the pricing guide. PerplexityBot got a 403 from the firewall, so it was being blocked even though robots.txt allows it. That's one setting to fix.
:::

## See who actually visits

Robots.txt says who's allowed; your server logs say who came. Most hosts let you search request logs by user agent. Ask your builder agent:

```text
Search our hosting request logs for the last 7 days for these user agents:
Googlebot, Bingbot, OAI-SearchBot, GPTBot, ChatGPT-User, PerplexityBot,
Perplexity-User, Claude-SearchBot, ClaudeBot, Claude-User, Google-Extended.
For each: number of requests, top 5 pages requested, and any responses
that weren't 200 (especially 403 or 429, which mean we blocked them).
Read only. Tell me how to run the same search myself next month.
```

A search bot getting 403 or 429 responses is being blocked by a firewall or rate limit, whatever robots.txt says.

:::warning
User-agent names can be faked. Bad bots sometimes call themselves Googlebot. If you ever write a firewall rule to allow AI crawlers, use the verification method each company publishes (such as published IP ranges) rather than trusting the name alone. Make firewall changes through your normal reviewed process.
:::

:::try-it
Ask ChatGPT (with search on) and Perplexity a question your best page answers. Click every source they cite. What do the cited pages have that yours doesn't?
:::

:::checkpoint
Q: You want Claude to be able to cite your site, but you don't want Anthropic training on it. What do you set?
- [ ] Block both ClaudeBot and Claude-SearchBot
- [x] Allow Claude-SearchBot and disallow ClaudeBot
- [ ] Add an llms.txt file
Why: Claude-SearchBot decides whether your pages can appear in Claude's search answers. ClaudeBot is the training crawler, and it's a separate setting.
:::

:::checkpoint
Q: Robots.txt allows PerplexityBot, but Perplexity never cites you and your logs show PerplexityBot getting 403 responses. What's wrong?
- [ ] Your robots.txt is too long
- [x] A firewall or CDN setting is blocking the bot
- [ ] Perplexity doesn't cite small sites
Why: A 403 means the server refused the request. Firewalls and CDNs can block bots that robots.txt allows. Perplexity's docs say to allow its bots in any web application firewall.
:::

:::takeaways
- Assistants rewrite the question, retrieve pages, and cite the clearest passages.
- Search crawlers decide whether you can be cited; training crawlers are a separate choice.
- Google says GEO for its AI features is SEO, and it ignores llms.txt.
- Check your logs: a bot blocked by a firewall is invisible, whatever robots.txt says.
:::

## Go deeper

- [Google: Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) - what to do and what not to do, from Google
- [OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots) - OAI-SearchBot, GPTBot and ChatGPT-User
- [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers.md) - PerplexityBot, Perplexity-User and firewall guidance
- [Anthropic: Does Anthropic crawl data from the web?](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web) - ClaudeBot, Claude-SearchBot and Claude-User
