---
module: 2
lesson_number: 7
course: get-found
template: v2
---

# Lesson 7: Internal Links and Content Refresh

:::video
id: gf-l7-overview
kind: overview
status: paused
src: /learn/video/get-found/gf-l7-overview.mp4
captions: /learn/video/get-found/gf-l7-overview.vtt
poster: /learn/video/get-found/gf-l7-overview.jpg
transcript: Publishing is the start, not the end. Pages slip as competitors publish, facts go out of date, and AI answers prefer what's current. The cheapest SEO win for a small site is usually not a new page, it's refreshing one that's already slipping, and linking to it from your strongest pages. In this lesson you'll find decaying pages in Search Console, have an agent propose refreshes and internal links, and ship them in one pull request.
:::

:::key-concept
Content decay is when a page that used to get clicks gets fewer, because results changed, competitors improved, or the page went out of date. A refresh updates the facts, fills new questions and improves the answer, without starting over. Internal links are links between your own pages; they help search engines find pages and understand which ones matter most. Together they're the highest-return SEO work for a site with a few dozen pages.
:::

## What you'll be able to do

- Find pages that are slipping using a Search Console date comparison
- Decide whether to refresh, merge or leave a page
- Have an agent propose internal links from your strongest pages
- Update a page honestly, with a real "last updated" date

## Why this matters

A solo founder can write maybe one great page a week. If three older pages are each losing a third of their clicks, refreshing them recovers more traffic than the new page will earn for months. AI answers add urgency: one study of Bing's citation data found Copilot citations to one site's pages dropped sharply within weeks when the pages weren't updated. The lesson it drew was simple: publish-and-forget doesn't work.

## Find the slipping pages

In Search Console, open **Performance**, click **Date**, choose **Compare**, and compare the last 3 months with the previous 3 months. Switch to the **Pages** tab and sort by **Clicks difference**. Export the table.

Then ask Claude Code or Claude to read the export:

```text
Here's a Search Console Pages export comparing two periods (CSV attached).
List pages that lost at least 20% of clicks, or lost average position by
more than 3, and had at least 50 impressions. For each, give: URL, clicks
before and after, position before and after. Then sort by clicks lost.
```

## Refresh, merge or leave

| What you see | What to do |
|---|---|
| Lost clicks, position dropped, facts are dated | **Refresh**: update facts and examples, answer new questions, improve the opening answer |
| Two of your pages compete for the same queries | **Merge** into the stronger page and redirect the weaker one to it |
| Impressions steady, clicks down, position steady | The results page changed, often an AI Overview now answers it. Improve the title and the opening answer; check the Generative AI performance report |
| Seasonal drop that happens every year | **Leave** it and note the pattern |

:::infographic
id: fig-1
type: chart
title: A page slipping and recovering
shows: A line chart of weekly clicks for one page over 9 months: steady around 120 a week, sliding to about 70 over 3 months, then recovering to about 130 within 6 weeks of a refresh, marked with a dot labelled "Refreshed". A faint second line shows average position moving from 4 to 9 and back to 3.
data: Illustrative: weekly clicks 120 steady, falling to 70, recovering to 130 after refresh; position 4 to 9 to 3.
alt: An illustrative page loses about 40% of its weekly clicks as its position slips from 4 to 9, then recovers past where it started within six weeks of a refresh.
:::

:::video
id: gf-l7-spotting-decay
kind: inline
status: paused
src: /learn/video/get-found/gf-l7-spotting-decay.mp4
captions: /learn/video/get-found/gf-l7-spotting-decay.vtt
poster: /learn/video/get-found/gf-l7-spotting-decay.jpg
transcript: Here's the comparison on Groomer Books. Last three months against the three before, sorted by clicks lost. Three pages stand out. The quarterly tax page lost 41 percent, and its deadlines are last year's. The mileage page and the van deduction page compete for the same queries, so they'll be merged. The pricing guide's clicks fell while its position held, because an AI Overview now answers the question, so it needs a sharper opening answer.
:::

## Refresh honestly

When you refresh a page:

1. **Update facts, numbers and dates** in the content, and check every link still works.
2. **Answer new questions** from your question bank and People Also Ask.
3. **Strengthen the opening answer** so it's the clearest one on the results page.
4. **Add an experience insert** if the page has none.
5. **Change "Last updated" and `dateModified`** only when you changed the content meaningfully. Changing the date without changing the page misleads readers and doesn't help.

```text
Refresh this page (current text and its Search Console queries attached).
Keep the URL and the structure that works. Update anything dated, answer
these new questions: [list], and tighten the opening answer to 50 words.
Mark every change so I can review it, and mark any fact I need to confirm.
```

## Internal links from strong pages

Pages that already get clicks and links pass some of that strength to the pages they link to. Point them at the pages you're refreshing.

```text
Here are our pages with clicks (Search Console export) and our sitemap.
For each page I'm refreshing [list], suggest 2 or 3 links from our
strongest related pages: the source page, the sentence where the link fits,
and the link text. Link text should describe the target page, not "click here".
Then open one pull request with the links. Don't change anything else.
```

:::infographic
id: fig-2
type: diagram
title: Link from strength
shows: A site map of 8 page circles sized by monthly clicks. The two largest (home page and pillar page) have arrows to three smaller pages marked "refreshing". Each arrow carries a short descriptive link text, such as "quarterly tax deadlines for groomers". A paper card says "Describe the target, never 'click here'".
data: none
alt: Your strongest pages, such as the home page and pillar page, link to the pages you're refreshing with link text that describes each target.
:::

:::video
id: gf-l7-link-pr
kind: inline
status: paused
src: /learn/video/get-found/gf-l7-link-pr.mp4
captions: /learn/video/get-found/gf-l7-link-pr.vtt
poster: /learn/video/get-found/gf-l7-link-pr.jpg
transcript: Now the links. Claude Code reads the Search Console export and the sitemap, and suggests links from the pillar page and the home page to the three pages we're refreshing, each with a sentence and descriptive link text. We drop one that doesn't read naturally. It opens a single pull request with the refreshed pages, the merge redirect and the links. We read the summary, check the preview, and merge.
:::

:::warning
When you merge two pages, always redirect the old address to the new one with a permanent (301) redirect. Deleting a page that has links and clicks without a redirect throws away what it earned and gives visitors a dead end.
:::

:::try-it
Open Search Console and compare the last 3 months with the previous 3 months on the Pages tab. Which page lost the most clicks? Write down one reason you think it slipped.
:::

:::checkpoint
Q: A page's impressions and position are steady, but clicks fell by a third. What's the likely cause?
- [ ] Google stopped indexing it
- [x] The results page changed, for example an AI Overview now answers the question, so fewer people click
- [ ] The page needs a newer "last updated" date
Why: Steady impressions and position mean you're still shown. Fewer clicks usually means something above you now answers the question. Sharpen the title and opening answer, and check the Generative AI report.
:::

:::takeaways
- Refreshing slipping pages often beats writing new ones for a small site.
- Find decay with a Search Console date comparison on the Pages tab.
- Refresh, merge with a 301 redirect, or leave seasonal dips alone.
- Link from your strongest pages with descriptive link text, and update dates only for real changes.
:::

## Go deeper

- [Google: Links best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) - crawlable links and good anchor text
- [Google: Redirects and Google Search](https://developers.google.com/search/docs/crawling-indexing/301-redirects) - when and how to use permanent redirects
- [What 20,000 Copilot citations taught us](https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/) - one site's study of citation decay in Bing's AI Performance data
