---
module: 1
lesson_number: 3
course: get-found
template: v2
---

# Exercise 3: Audit Your Site and Merge One Fix

:::key-concept
You'll have your builder agent audit your site against the eight technical checks, read-only, and then fix the most important problems in one pull request you review and merge. At the end your site's basics are clean and you have an audit report to repeat every month.
:::

**Time:** 40 minutes · **You'll need:** your site's repository in GitHub, Claude Code, Cursor or Codex, Search Console from Exercise 1, the problem list from Exercise 1 · **Builds on:** Lesson 3, and GitHub for Non-Developers

:::video
id: gf-ex3-setup
kind: exercise-setup
status: paused
src: /learn/video/get-found/gf-ex3-setup.mp4
captions: /learn/video/get-found/gf-ex3-setup.vtt
poster: /learn/video/get-found/gf-ex3-setup.jpg
transcript: In this exercise your builder agent audits your site, read-only, against the eight checks. Save the report. Run PageSpeed Insights on two pages. Then pick the problems that block crawling or indexing first, and have the agent fix them in one pull request. Check the preview, test the markup, merge, and ask Search Console to recrawl. Leave robots.txt alone unless the audit says it's blocking something important.
:::

:::infographic
id: fig-1
type: anatomy
title: An audit before the fixes
shows: An audit report card with the eight checks, three marked red (canonical on the preview address, four duplicate titles, a 2 MB hero image), one amber (no Article markup on the blog), four green. Each red item shows a file name.
data: 3 red, 1 amber, 4 green.
alt: A sample audit with three problems to fix, one to improve and four checks passing, each problem tied to a file.
:::

## Warm-up

:::checkpoint
Q: Your audit lists six problems. Which do you fix first?
- [ ] The slow image, because speed matters most
- [x] Anything that stops pages being crawled or indexed, such as a wrong canonical or a blocked page
- [ ] The missing structured data
Why: Fix the earliest broken step first. A page that can't be crawled or indexed gains nothing from speed or markup.
:::

## Steps

1. **Run the audit.** Open your site's repository in your builder agent and paste the read-only audit prompt from Lesson 3.

2. **Save the report.** Ask the agent to save it as `notes/seo-audit-YYYY-MM-DD.md` in a new branch, or paste it into a doc. Don't merge anything yet.

3. **Check speed.** Run your home page and your most important page through PageSpeed Insights on mobile. Add LCP, INP and CLS to the report.

4. **Rank the problems.** Mark each problem 1 (blocks crawling or indexing), 2 (canonical, titles, headings), 3 (speed, structured data, links).

5. **Fix the 1s and 2s.** Paste the fix prompt from Lesson 3 with your list of 1s and 2s. If you have no 1s or 2s, fix the biggest 3.

6. **Review the pull request.** Read the summary. Open the preview. View the source of one changed page and check the canonical and title. If structured data changed, paste the preview address into the Rich Results Test.

7. **Merge and recrawl.** Merge the pull request. Once it's live, run URL Inspection on each changed page and click **Request indexing**.

8. **Make it monthly.** Add "Run the SEO audit prompt" to your monthly Search check reminder from Exercise 1.

## Done when

- [ ] You have a saved audit report covering all eight checks
- [ ] PageSpeed results for two pages are in the report
- [ ] One pull request with your top fixes is reviewed and merged
- [ ] You've requested indexing for the changed pages

:::example
title: See an example result

For Rolling Ledger, the audit found three problems and one improvement. Canonicals pointed at the hosting preview address, four service pages shared the title "Rolling Ledger", and the hero image was 2 MB, which put mobile LCP at 4.1 seconds. The first pull request fixed the canonicals and wrote four unique titles. A second, smaller pull request compressed the hero image, and LCP dropped to 1.9 seconds on the next PageSpeed run. Article markup for the blog was left for Lesson 6, when the first article gets an author.

:::video
id: gf-ex3-reveal
kind: exercise-reveal
status: paused
src: /learn/video/get-found/gf-ex3-reveal.mp4
captions: /learn/video/get-found/gf-ex3-reveal.vtt
poster: /learn/video/get-found/gf-ex3-reveal.jpg
transcript: Here's how it went for Rolling Ledger. The audit found canonicals on the preview address, four pages with the same title, and a 2 megabyte hero image. One pull request fixed the canonicals and titles, and we checked the preview source before merging. A second one compressed the image, and mobile LCP went from 4.1 seconds to 1.9. Every check is green except blog markup, which waits for the first article.
:::

:::infographic
id: fig-2
type: comparison
title: Before and after the fixes
shows: Two audit cards side by side. Before: 3 red, 1 amber, 4 green, mobile LCP 4.1 s. After: 0 red, 1 amber (blog markup, waiting for Lesson 6), 7 green, mobile LCP 1.9 s. Two merged pull requests link the cards.
data: LCP 4.1 s before, 1.9 s after. Red items 3 before, 0 after.
alt: Rolling Ledger went from three problems and a 4.1-second mobile LCP to none and 1.9 seconds, after two reviewed pull requests.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Go a level deeper.

1. Verify your site in Ahrefs Webmaster Tools and run its free Site Audit. Compare its findings with your agent's.
2. Add Organization and Person structured data, and test both in the Rich Results Test and the Schema Markup Validator.
3. Check the Core Web Vitals report in Search Console for any URL groups marked poor.

**Bring to your session:** both audit reports, your merged pull requests and the structured data test results.

**Your coach will:**
- Review your robots.txt and canonical setup line by line
- Help you decide which remaining items are worth fixing
- Check your structured data matches what's on the page
:::
