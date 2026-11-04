---
module: 2
lesson_number: 7
course: get-found
template: v2
---

# Exercise 7: Refresh Three Pages and Link Them From Your Strongest

:::key-concept
You'll find your slipping pages in Search Console, decide what to do with each, refresh up to three, and add internal links from your strongest pages, all in one reviewed pull request. At the end you'll have a refresh routine you can run every quarter.
:::

**Time:** 40 minutes · **You'll need:** Search Console with at least 3 months of data, Claude or Claude Code, your site's repository · **Builds on:** Lesson 7

:::video
id: gf-ex7-setup
kind: exercise-setup
status: paused
src: /learn/video/get-found/gf-ex7-setup.mp4
captions: /learn/video/get-found/gf-ex7-setup.vtt
poster: /learn/video/get-found/gf-ex7-setup.jpg
transcript: In this exercise you'll win back traffic you already earned. Compare the last three months with the three before in Search Console and export the Pages tab. Have Claude list the slipping pages. Decide refresh, merge or leave for each. Refresh up to three, add links from your strongest pages, and ship it all in one pull request. Change the last-updated date only on pages you really changed.
:::

:::infographic
id: fig-1
type: anatomy
title: Your decay list
shows: A table of five slipping pages with clicks before and after and position before and after, and an empty "Decision" column waiting for refresh, merge or leave. The biggest drop is highlighted.
data: none
alt: A list of slipping pages with their before-and-after clicks and positions, and a blank column for your decision on each.
:::

## Warm-up

:::checkpoint
Q: Two of your pages rank for the same queries and both have slipped. What's usually best?
- [ ] Delete the weaker one
- [x] Merge them into the stronger page and 301-redirect the weaker one to it
- [ ] Keep both and add more keywords to each
Why: Two pages competing for the same queries split their strength. Merging with a permanent redirect keeps what both earned.
:::

## Steps

1. **Export the comparison.** In Search Console Performance, compare the last 3 months with the previous 3 months, open the Pages tab and export it.

   New site with too little data? Use the pages you published in Exercise 6 and earlier, and skip to step 4 with "refresh" as the decision for your oldest page.

2. **Find the slippers.** Give the export to Claude with the decay prompt from Lesson 7.

3. **Decide.** Add a `Refresh Log` tab to your marketing sheet: URL | Clicks before | Clicks after | Decision | Reason | Done date. Decide refresh, merge or leave for each page, using the table in Lesson 7.

4. **Refresh up to three.** For each page marked refresh, run the refresh prompt from Lesson 7 with the page text and its queries. Check every marked change and confirm every flagged fact.

5. **Merge if needed.** For each merge, ask your builder agent to move the useful content into the stronger page and add a 301 redirect from the old address.

6. **Add internal links.** Run the internal-link prompt from Lesson 7 with your export and sitemap.

7. **Ship one pull request.** Ask the builder agent to put the refreshes, merges, redirects and links in one pull request, with `dateModified` updated only on pages whose content changed.

8. **Review and merge.** Check the preview, click a redirect to make sure it works, merge, and request indexing for each changed page.

9. **Set the routine.** Add "Run the refresh routine" to your calendar every 3 months.

## Done when

- [ ] Your `Refresh Log` lists each slipping page with a decision and reason
- [ ] Up to three pages are refreshed, with every change reviewed
- [ ] Any merges have working 301 redirects
- [ ] New internal links from your strongest pages are live
- [ ] A quarterly reminder is set

:::example
title: See an example result

Rolling Ledger found five slipping pages. The quarterly tax page (down 41% in clicks) was refreshed with this year's deadlines and a new section on safe-harbour payments. The fuel page was merged into the truck deduction page with a 301 redirect. The pricing guide got a sharper 45-word opening answer, because an AI Overview now answers its main question. Two pages with normal seasonal dips were left alone. The pillar page and home page now link to all three refreshed pages. Six weeks later, the tax page was back above its old click level.

:::video
id: gf-ex7-reveal
kind: exercise-reveal
status: paused
src: /learn/video/get-found/gf-ex7-reveal.mp4
captions: /learn/video/get-found/gf-ex7-reveal.vtt
poster: /learn/video/get-found/gf-ex7-reveal.jpg
transcript: Here's the Rolling Ledger refresh. Five slipping pages, five decisions. The tax page got this year's deadlines. The fuel page was merged into the truck page with a redirect. The pricing guide got a sharper opening answer. Two seasonal dips were left alone. One pull request carried it all, plus links from the pillar and home pages. Six weeks later the tax page was back above where it started.
:::

:::infographic
id: fig-2
type: anatomy
title: A finished refresh log
shows: The Refresh Log tab with five rows filled: quarterly tax page (refresh, deadlines out of date), fuel page (merge into truck page, 301), pricing guide (refresh opening answer, AI Overview), two seasonal pages (leave). Done dates filled. A small sparkline beside the tax page shows the recovery.
data: 5 pages: 2 refreshed, 1 merged, 2 left.
alt: Rolling Ledger's refresh log with five slipping pages: two refreshed, one merged with a redirect, and two seasonal dips left alone.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Make refreshing a system.

1. Run the decay comparison for 6-month and 12-month windows too.
2. Write a one-page refresh checklist for your business, including the facts that go stale (prices, dates, rules).
3. Map your internal links: which pages link to your three most important pages today?

**Bring to your session:** your refresh log, the longer comparisons, your checklist and your link map.

**Your coach will:**
- Check your refresh-versus-merge calls
- Find pages that should be linked from more places
- Help you plan which facts to review on a schedule
:::
