---
module: 3
lesson_number: 9
course: get-found
template: v2
---

# Exercise 9: Check Every AI Bot's Access to Your Site

:::key-concept
You'll check, for every major assistant, whether its search crawler is allowed in robots.txt, whether your firewall or CDN lets it through, and whether it actually visits, and you'll write down your training-crawler decision. At the end you'll know that nothing technical stands between your pages and an AI citation.
:::

**Time:** 35 minutes · **You'll need:** your site's repository and builder agent, access to your hosting logs and CDN or firewall settings, Exercise 3's audit · **Builds on:** Lesson 9, and AI Marketing Lesson 2

:::video
id: gf-ex9-setup
kind: exercise-setup
status: paused
src: /learn/video/get-found/gf-ex9-setup.mp4
captions: /learn/video/get-found/gf-ex9-setup.vtt
poster: /learn/video/get-found/gf-ex9-setup.jpg
transcript: In this exercise you'll make sure every AI search crawler can reach you. Fill a crawler table with robots.txt status, firewall status and log visits for each bot. Write down your training-crawler decision and why. Fix anything blocking a search crawler through a pull request. And keep the log search so you can repeat it next month.
:::

:::infographic
id: fig-1
type: anatomy
title: Your blank crawler table
shows: A table with one row per crawler (Googlebot, Bingbot, OAI-SearchBot, GPTBot, PerplexityBot, Claude-SearchBot, ClaudeBot, Google-Extended) and empty columns: job (search or training), robots.txt, firewall or CDN, visits in logs, non-200 responses, decision.
data: none
alt: An empty crawler table with a row for each AI and search bot, and columns for its job, robots.txt status, firewall status, log visits, errors and your decision.
:::

## Warm-up

:::checkpoint
Q: Which bot decides whether Microsoft Copilot can cite your page?
- [ ] GPTBot
- [x] Bingbot, because Copilot grounds its answers in Bing
- [ ] Google-Extended
Why: Copilot's answers are grounded in Bing's index, so Bingbot access and Bing indexing are what count. That's why Exercise 1 set up Bing Webmaster Tools.
:::

## Steps

1. **Create the table.** Add a `Crawler Access` tab to your marketing sheet with the columns in the starting figure, and one row per crawler from Lesson 9.

2. **Check robots.txt.** Ask your builder agent to report allowed or blocked for each crawler, using the prompt from AI Marketing Lesson 2. Fill the robots.txt column.

3. **Check the firewall and CDN.** Open your host's or CDN's bot settings. Look for "AI bots", "AI crawlers", "bot fight" or "block AI scrapers" options. Note anything that would block a search crawler.

4. **Search the logs.** Paste the log prompt from Lesson 9 into your builder agent. Fill the visits and non-200 columns. If your host keeps no logs or you can't reach them, write "no logs" and skip to step 6.

5. **Find the blocks.** Mark any search crawler that's disallowed in robots.txt, blocked by a firewall setting, or getting 403 or 429 responses.

6. **Decide on training.** For GPTBot, ClaudeBot and Google-Extended, choose allow or block. Write one sentence on why in the decision column.

7. **Fix through a pull request.** Ask your builder agent to update robots.txt to match your decisions, and to list any firewall or CDN setting you need to change yourself. Review and merge. Change firewall settings yourself, through your host's dashboard.

8. **Save the log search.** Save the agent's instructions for repeating the log search in `notes/ai-bot-log-check.md`, and add it to your monthly Search check.

## Done when

- [ ] Every crawler row in `Crawler Access` is filled in
- [ ] No search crawler is blocked by robots.txt, a firewall or rate limits
- [ ] Your training-crawler decisions are written down, with reasons
- [ ] The log search is saved for next month

:::example
title: See an example result

Rolling Ledger's robots.txt allowed every crawler, but the logs told a different story: PerplexityBot got 43 responses with status 403 in a week, from a "block AI scrapers" setting the host had switched on by default. The founder turned that setting off and kept a rule against unknown bots. She chose to allow search crawlers and block GPTBot and ClaudeBot for training, and wrote down why: the help articles are the product's edge. The next week's logs showed PerplexityBot fetching the pillar page with 200 responses.

:::video
id: gf-ex9-reveal
kind: exercise-reveal
status: paused
src: /learn/video/get-found/gf-ex9-reveal.mp4
captions: /learn/video/get-found/gf-ex9-reveal.vtt
poster: /learn/video/get-found/gf-ex9-reveal.jpg
transcript: Here's the Rolling Ledger crawler table. Robots.txt looked fine, but the logs showed PerplexityBot refused 43 times by a default "block AI scrapers" setting. That's fixed. Search crawlers are all allowed. GPTBot and ClaudeBot are blocked for training, with the reason written down. A week later, PerplexityBot is reading the pillar page. Nothing technical stands in the way of a citation now.
:::

:::infographic
id: fig-2
type: anatomy
title: A finished crawler table
shows: The Crawler Access table filled: all search crawlers green (allowed, firewall OK, visiting), PerplexityBot marked "403 x43 fixed" with a strikethrough, GPTBot and ClaudeBot marked "blocked for training" with a one-line reason, Google-Extended "blocked for training". A note: "Log search saved for monthly check".
data: PerplexityBot 43 responses with status 403 before the fix.
alt: Rolling Ledger's finished table: every search crawler allowed and visiting after a firewall fix, and two training crawlers blocked on purpose with the reason recorded.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Go further on access.

1. Use URL Inspection's live test and Bing's URL Inspection on your three key pages to confirm both can render them fully.
2. Check whether any key content only appears after JavaScript runs or behind a click, and ask your agent if crawlers can see it.
3. Review your training-crawler decision against your business model in writing.

**Bring to your session:** your crawler table, the inspection results and your written decision.

**Your coach will:**
- Check your firewall and CDN settings with you
- Look for content crawlers can't see
- Test your training-crawler reasoning
:::
