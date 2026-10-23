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

## Warm-up

:::checkpoint
Q: You want ChatGPT search to cite your site, but you don't want OpenAI training on it. Which robots.txt setup does that?
- [ ] Block everything from OpenAI
- [x] Allow OAI-SearchBot and disallow GPTBot
- [ ] Allow GPTBot and disallow OAI-SearchBot
Why: OAI-SearchBot controls inclusion in ChatGPT search answers and GPTBot controls training. OpenAI treats them as independent settings.
:::

## Steps

1. **Write your five buyer questions.** Pull them from your inbox, sales calls or customer interviews. No business yet? Use Groomer Books questions such as "What bookkeeping software do dog groomers use?" and "Can a mobile groomer deduct their van?"

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
