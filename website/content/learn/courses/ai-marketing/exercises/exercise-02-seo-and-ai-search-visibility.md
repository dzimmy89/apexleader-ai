---
module: 1
lesson_number: 2
course: ai-marketing
template: v2
---

# Exercise 2: Run an AI-Visibility Audit and Publish One Answer Page

:::key-concept
You'll check whether AI assistants can find and cite your business, log where you stand today, and draft your first answer page. At the end you'll have a visibility log you can repeat monthly and one page ready for your approval.
:::

**Time:** 35 minutes · **You'll need:** access to ChatGPT, Gemini, Claude and Perplexity (free tiers are fine), your website or a draft site, your content calendar from Exercise 1 · **Builds on:** Lesson 2

:::video
id: mkt-ex2-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-marketing/mkt-ex2-setup.mp4
captions: /learn/video/ai-marketing/mkt-ex2-setup.vtt
poster: /learn/video/ai-marketing/mkt-ex2-setup.jpg
transcript: Five questions, four assistants, and twenty rows that show who gets cited. Let's check your visibility. In this exercise you'll find out where you stand, and write your first answer page. Write five questions your buyers actually ask. Ask each one in ChatGPT, Gemini, Claude and Perplexity, and log every answer in an AI Visibility tab: were you mentioned, were you linked, and who was cited instead. Check your crawlers with your builder agent, change nothing, and write down your training-crawler choice. Pick the question where others were cited and you weren't, and draft an answer page for it. Fill every fact yourself, and cut anything you can't source. List three outside sources the assistants trust, with a next step for each. Then add the page and three posts to your calendar, as drafts. So: which sources do assistants trust instead of you? Pause here and run your check.
:::

## Warm-up

:::checkpoint
Q: You want ChatGPT search to cite your site, but you don't want OpenAI training on it. Which robots.txt setup does that?
- [ ] Block everything from OpenAI
- [x] Allow OAI-SearchBot and disallow GPTBot
- [ ] Allow GPTBot and disallow OAI-SearchBot
Why: OAI-SearchBot controls inclusion in ChatGPT search answers and GPTBot controls training. OpenAI treats them as independent settings.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to an AI visibility check
shows: Seven numbered steps: 1 five buyer questions, 2 ask four assistants, 3 log 20 rows (highlighted), 4 check crawlers, 5 draft an answer page, 6 make it true, 7 plan mentions and schedule.
data: none
image: /learn/figures/ai-marketing/exercise-02-fig-1.webp
alt: Seven steps: write five buyer questions; ask ChatGPT, Gemini, Claude and Perplexity; log all 20 answers; check your crawlers; draft one answer page; source every fact in it; and plan three mentions and add the page to your calendar.
:::

1. **Write your five buyer questions.** Pull them from your inbox, sales calls or customer interviews. No business yet? Use Rolling Ledger questions such as "What bookkeeping software do food truck owners use?" and "Can a food truck owner deduct their truck?"

2. **Ask the assistants.** For each question, ask ChatGPT, Gemini, Claude and Perplexity:

   ```text
   Act as a buyer looking for [your category] for [your customer type].
   Question: [buyer question]. Answer normally and list the sources you used.
   ```

3. **Log the results.** Add a tab called `AI Visibility` to your calendar sheet with columns: Date | Assistant | Question | We were mentioned (Y/N) | We were linked (Y/N) | Who was cited instead | Notes. Fill one row per assistant per question (20 rows).

4. **Check your crawlers.** Open `yoursite.com/robots.txt` in a browser. If you have a builder agent (Claude Code, Cursor or Codex) connected to your site repo, ask it:

   ```text
   Read robots.txt and our hosting or CDN bot settings. For Googlebot, Google-Extended,
   OAI-SearchBot, GPTBot, PerplexityBot, Claude-SearchBot, ClaudeBot and Bingbot,
   report allowed or blocked. Change nothing. Propose the edit you recommend.
   ```

   Write down your decision on training crawlers (allow or block) and why.

5. **Pick your first answer page.** Choose the question where competitors or directories were cited and you weren't. Draft it:

   ```text
   Draft an answer page for: "[question]". Structure: the question as the H1, a
   50-word direct answer, 4 to 6 short sections, one small table if useful, an
   author line with my name and why I know this, a "last checked" date, and one
   link to our offer. Use only facts I give you below. List anything you need me
   to confirm. Flag anything that should be reviewed by an accountant or lawyer.
   ```

6. **Make it true.** Fill every fact the draft asked for. Remove anything you can't source.

7. **Plan the mentions.** From your log, list three outside sources assistants cited (directories, review sites, publications). Write one sentence on how you'll get listed or mentioned in each.

8. **Schedule it.** Add the answer page and three repurposed posts to your content calendar as `draft`.

## Done when

- [ ] Your `AI Visibility` tab has 20 rows with today's date
- [ ] You know whether each search crawler is allowed, and you've written down your training-crawler choice
- [ ] One answer page draft is complete, every fact sourced, with author and date
- [ ] Three outside sources are listed with a next step for each

:::example
title: See an example result
Here is the first visibility check for the sample business, Rolling Ledger, run on November 2, 2026.

:::video
id: mkt-ex2-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-marketing/mkt-ex2-reveal.mp4
captions: /learn/video/ai-marketing/mkt-ex2-reveal.vtt
poster: /learn/video/ai-marketing/mkt-ex2-reveal.jpg
transcript: For Rolling Ledger, twenty answers produced two mentions, and a clear list of who to talk to next. Here's the example. Five buyer questions, four assistants, twenty rows. Rolling Ledger was mentioned twice, both times for bookkeeping for food trucks in Austin, and linked once. The sources cited instead were QuickBooks, a state food truck association's resource page, a restaurant bookkeeping roundup, and a Reddit thread. The crawler check found one real problem. The host's bot protection was blocking PerplexityBot, which explains zero Perplexity mentions. The founder allowed every search crawler, and chose to block the two training crawlers. The first answer page is what bookkeeping software do food truck owners use, with a fifty-word answer, five sections, and two facts flagged for checking. Three outreach targets made the list: the association's vendor list, the roundup, and that Reddit thread.
:::

:::infographic
id: fig-2
type: chart
title: Rolling Ledger in AI answers
shows: Under "Rolling Ledger visibility" tagged example: 20 answers checked, 2 mentioned, 1 linked. Beside it, four sources cited instead: QuickBooks, a state food truck association page, a restaurant bookkeeping roundup, a Reddit thread. Footer: PerplexityBot was blocked by the host, now allowed.
data: example numbers: 5 questions x 4 assistants = 20 rows; 2 mentions; 1 link
image: /learn/figures/ai-marketing/exercise-02-fig-2.webp
alt: Example visibility check for Rolling Ledger: 20 answers from four assistants, with 2 mentions and 1 link. Sources cited instead were QuickBooks, a state food truck association page, a restaurant bookkeeping roundup and a Reddit thread. The host was blocking PerplexityBot, which is now allowed.
:::

| Buyer question | ChatGPT | Gemini | Claude | Perplexity |
|---|---|---|---|---|
| What bookkeeping software do food truck owners use? | No (QuickBooks, roundup) | No (QuickBooks) | No (roundup) | No |
| Can a food truck owner deduct their truck? | No (IRS page) | No (IRS page) | No (IRS page) | No |
| How do food trucks track cash sales? | No (Reddit thread) | No (Reddit thread) | No (POS vendor blog) | No |
| Who does bookkeeping for food trucks in Austin? | No (association page) | Mentioned | Mentioned and linked | No |
| How much does a bookkeeper cost for a small food truck? | No (roundup) | No (roundup) | No (roundup) | No |

**Totals:** 20 rows, 2 mentions, 1 link. Perplexity never mentioned Rolling Ledger, because its crawler could not reach the site.

```text
CRAWLERS (checked by the builder agent, nothing changed until approved)
Allowed: Googlebot, OAI-SearchBot, Claude-SearchBot, Bingbot
Blocked by the host's bot protection: PerplexityBot -> now allowed (founder's pull request)
Training choice: block GPTBot, ClaudeBot and Google-Extended for now. Reason: no
upside yet for a small service business; revisit in six months.

FIRST ANSWER PAGE (draft)
Title: What bookkeeping software do food truck owners use?
Direct answer (50 words), 5 sections, a comparison table of three apps,
author line with the founder's 9 years and 40 trucks, "last checked" date.
Facts flagged: current Wave and QuickBooks plan prices; which POS systems sync.

OUTREACH TARGETS
1. State food truck association vendor list: apply for a listing this week.
2. Restaurant bookkeeping roundup: email the editor with one quotable tip.
3. Reddit food truck thread: answer the cash-sales question as myself, disclosed.
Calendar: answer page + 3 repurposed LinkedIn posts added, all draft.
```
:::

:::coached
**For 1-on-1 coaching clients.** Go deeper on your own market:

1. Expand to 15 buyer questions across three stages: problem, comparison ("X vs Y") and purchase.
2. Verify your site in Google Search Console and Bing Webmaster Tools, and export the queries that already bring you impressions.
3. Draft three answer pages and a 90-day mention plan (reviews, directories, one podcast or guest post a month).

**Bring to your session:** your visibility log, Search Console and Bing exports, three draft answer pages and your mention plan.

**Your coach will:**
- Pick the one answer page most likely to win citations first and sharpen its opening answer
- Review your robots.txt decision and any firewall settings with you
- Help you choose the outside sources worth the effort
:::
