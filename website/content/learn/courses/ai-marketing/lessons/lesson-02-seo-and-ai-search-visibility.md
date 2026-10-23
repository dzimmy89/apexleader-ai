---
module: 1
lesson_number: 2
course: ai-marketing
template: v2
---

# Lesson 2: SEO and AI-Search Visibility

:::key-concept
Your next customer may never see a list of ten blue links. They will ask ChatGPT, Gemini, Claude or Perplexity, and get an answer that cites a few sources. You show up in those answers the same way you show up in search: let the right crawlers in, publish clear pages that directly answer real questions, and be mentioned in places the assistants trust.
:::

## What you'll be able to do

- Check that the crawlers behind Google AI Overviews, ChatGPT search, Claude and Perplexity can reach your site
- Write "answer pages" that an assistant can quote and link
- Run a monthly visibility check: ask the assistants your customers' questions and log who gets cited
- Use Search Console and Bing Webmaster Tools to see what is working

## Why this matters

A solo founder can't outspend anyone on ads for long. Organic visibility compounds. In 2026 that means two overlapping games: classic search rankings and being cited inside AI answers. The good news is that the work is mostly the same. Google says plainly that there are no extra requirements to appear in AI Overviews or AI Mode beyond being indexed and eligible to show a snippet. The assistants that run their own search (ChatGPT, Perplexity, Claude) need their crawlers allowed in. Most small sites lose visibility for boring reasons: a blocked bot, a page that hides the answer, or no third-party mentions at all.

## Step 1: Let the right crawlers in

Each AI company uses separate bots for separate jobs. The useful split is "search" (shows your pages in answers) versus "training" (uses your pages to train models). You can allow one and block the other.

| Assistant | Crawler that affects whether you're cited | Training crawler (separate choice) |
|---|---|---|
| Google AI Overviews and AI Mode | Googlebot (normal Search) | Google-Extended controls use in Gemini models and grounding outside Search, not Search itself |
| ChatGPT search | OAI-SearchBot | GPTBot |
| Perplexity | PerplexityBot | Perplexity says PerplexityBot is not used for model training |
| Claude | Claude-SearchBot | ClaudeBot |

There are also "user" agents (ChatGPT-User, Perplexity-User, Claude-User) that fetch a page when someone asks about it directly. OpenAI and Perplexity note that robots.txt may not apply to those visits, because a person started them.

Your job: open `yoursite.com/robots.txt` and make sure the search crawlers are not blocked. Also check your host or CDN. Some firewalls block AI bots by default, and Perplexity's docs specifically say to allow its bots in any web application firewall. OpenAI notes robots.txt changes can take about 24 hours to affect ChatGPT search.

Ask your builder agent to check it for you:

```text
Read our robots.txt and any bot-blocking settings in our hosting config. Tell me,
for each of these user agents, whether it is allowed or blocked: Googlebot,
Google-Extended, OAI-SearchBot, GPTBot, PerplexityBot, Claude-SearchBot, ClaudeBot,
Bingbot. Do not change anything. Propose the edit you recommend and explain it in
plain English. I'll approve before you commit.
```

:::warning
Robots.txt and firewall changes affect your whole site. Make them through a pull request you approve (GitHub for Non-Developers, Lesson 2), never by giving an agent your hosting password. Deciding whether to allow training crawlers is a business choice; there's no wrong answer, but make it on purpose.
:::

## Step 2: Write answer pages

Assistants cite pages that answer one question clearly, early and in text. Google's own guidance for AI features is ordinary good SEO: crawlable pages, internal links, important content in text (not only in images or video), structured data that matches what's visible, and an up-to-date Business Profile. Google says you do not need special AI files or markup.

An answer page has a shape:

1. **The question as the title**, in the customer's words: "Do mobile dog groomers need to track mileage?"
2. **A two or three sentence direct answer** at the top.
3. **The detail**: steps, a short table, an example with real numbers you can stand behind.
4. **Who wrote it and why they know**: your name, your experience, the date it was last checked.
5. **One next step**: a link to your offer or a related answer page.

Find the questions from real sources: your inbox, sales calls, review sites, Reddit threads and the "People also ask" boxes in Google. Then draft:

```text
Here are 20 questions our customers have asked us (pasted below). Group them into
8 answer pages. For each page give: the title as a question, a 50-word direct
answer, an outline of 4 to 6 sections, and which facts I need to supply or check.
Do not invent statistics. Mark anything that needs an accountant's review.
```

Add one answer page a week to your content calendar from Lesson 1. Repurpose each one into social posts.

## Step 3: Get mentioned where assistants look

Assistants lean on sources they already trust: review sites, industry directories, partner pages, podcasts, community threads and news coverage. A mention there often matters as much as your own page. Practical moves for a one-person company:

- Claim and complete your Google Business Profile and Bing Places listing, if you serve customers locally or by region.
- Get listed in the two or three directories your customers actually use (for Groomer Books, grooming associations and their vendor lists).
- Ask happy customers for reviews on the platform your buyers check.
- Offer to answer questions on a niche podcast or newsletter. Bring one specific, quotable idea.
- Keep your name, description and offer consistent everywhere, so assistants connect the mentions to you.

## Step 4: Measure monthly

Two free tools show part of the picture. Google says AI Overviews and AI Mode clicks are included in the Search Console Performance report under the "Web" search type. Bing Webmaster Tools added an AI Performance report that shows how often your pages are cited in Copilot answers. Verify your site in both.

Then run your own "AI visibility check" once a month. Ask each assistant the same five questions your buyers ask, and log the results.

```text
Act as a buyer looking for [your category] for [your customer type] in [region].
Question: [buyer question]. Answer as you normally would and list the sources you used.
```

Record, for each assistant and question: were you mentioned, were you linked, who was cited instead. Over a few months you'll see which answer pages and mentions move the needle. You can hand this check to a research agent later, as long as it only reads and reports.

:::try-it
Ask ChatGPT, Gemini, Claude and Perplexity: "Who offers [your service] for [your customer]?" Note which competitors and sources come up. Those sources are your outreach list.
:::

:::checkpoint
Q: Your site never appears in ChatGPT search answers, but it ranks fine on Google. What is the first thing to check?
- [ ] Whether you have an llms.txt file
- [ ] Whether you blocked GPTBot
- [x] Whether OAI-SearchBot is allowed in robots.txt and not blocked by your host or firewall
Why: OpenAI says sites that opt out of OAI-SearchBot won't appear in ChatGPT search answers. GPTBot is the training crawler and is a separate setting.
:::

:::takeaways
- Search crawlers and training crawlers are separate; allow the search ones on purpose
- Answer pages win: a real question, a direct answer up top, details in text, a named author and date
- Third-party mentions (reviews, directories, podcasts) are often what assistants cite
- Measure with Search Console, Bing Webmaster Tools and a monthly ask-the-assistants log
:::

## Go deeper

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) - Google's own requirements, controls and measurement for AI Overviews and AI Mode
- [OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots) - OAI-SearchBot, GPTBot and ChatGPT-User, and how each affects ChatGPT search
- [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers.md) - PerplexityBot, Perplexity-User and firewall guidance
- [Anthropic: Does Anthropic crawl data from the web?](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web) - Claude's crawlers and how robots.txt applies
