---
module: 1
lesson_number: 1
course: get-found
template: v2
---

# Exercise 1: Set Up Your Free Search Stack and Take a Baseline

:::key-concept
You'll verify your site in Google Search Console and Bing Webmaster Tools, submit your sitemap, turn on IndexNow and save a baseline. At the end you'll have both consoles collecting data and a one-page snapshot to measure every later lesson against.
:::

**Time:** 35 minutes · **You'll need:** your live site or landing page on your own domain, access to its DNS or its GitHub repository, a Google account and a Microsoft account · **Builds on:** Lesson 1, and Build the Product and the Site

:::video
id: gf-ex1-setup
kind: exercise-setup
status: paused
src: /learn/video/get-found/gf-ex1-setup.mp4
captions: /learn/video/get-found/gf-ex1-setup.vtt
poster: /learn/video/get-found/gf-ex1-setup.jpg
transcript: In this exercise you'll switch on the two free consoles every site needs. Verify your domain in Google Search Console, submit your sitemap, then import the site into Bing Webmaster Tools and turn on IndexNow. Have your builder agent check robots.txt, the sitemap and canonical links. Finish by saving a baseline tab in your marketing sheet: pages indexed, top queries, and any AI-feature numbers. Every later lesson measures against it.
:::

:::infographic
id: fig-1
type: anatomy
title: Your starting checklist
shows: A paper checklist with six empty boxes: Search Console verified (domain property), sitemap submitted, Bing imported from Search Console, IndexNow on, agent check of robots.txt and canonicals, baseline tab saved. Each box has the console icon beside it.
data: none
alt: Six setup steps to tick off: verify Search Console, submit the sitemap, import into Bing, turn on IndexNow, have an agent check robots.txt and canonicals, and save a baseline.
:::

## Warm-up

:::checkpoint
Q: Why verify a "domain property" in Search Console rather than a single URL-prefix property?
- [ ] It's the only option that works for small sites
- [x] It covers every version of your site, with and without www and on http and https, in one property
- [ ] It makes your pages rank higher
Why: A domain property, verified with a DNS record, collects data for all versions of your domain, so nothing falls through the cracks.
:::

## Steps

1. **Add a domain property in Search Console.** Go to Search Console, choose **Domain**, and enter your domain without `https://`. Google gives you a TXT record.

2. **Add the TXT record.** Add it at your DNS provider. If your DNS is managed in code, ask your builder agent to add it in a pull request and approve it yourself. Click **Verify**. DNS changes can take a few minutes to an hour.

3. **Submit your sitemap.** In **Sitemaps**, enter `sitemap.xml` and submit. If you don't have one, ask your builder agent to generate one that lists every public page on your real domain.

4. **Import into Bing.** Sign in to Bing Webmaster Tools and choose **Import from Google Search Console**. Pick your site. Bing verifies it and copies the sitemap.

5. **Turn on IndexNow.** Check whether your host or site builder supports IndexNow. If not, ask your builder agent:

   ```text
   Add IndexNow to our site: generate a key file, host it at the root, and
   ping the IndexNow endpoint with each changed URL when we deploy. Open a pull
   request and explain what it does. Don't merge it.
   ```

6. **Run the agent check.** Paste the four-question check from Lesson 1 into your builder agent. Write down every problem it finds. Don't fix them yet; Lesson 3 does that.

7. **Save a baseline.** In your marketing sheet from AI Marketing, add a tab called `Search Baseline` with today's date and:
   - Indexed pages and not-indexed pages, from Search Console's Pages report
   - Your top 10 queries by impressions, from Performance (it may be empty for a new site)
   - AI-feature impressions, if the Generative AI performance report is available for your site
   - Bing citations, if the AI Performance report shows any

8. **Set a reminder.** Put a 15-minute recurring calendar event on the first Monday of each month called "Search check". Lesson 12 fills in what to do in it.

## Done when

- [ ] Search Console shows your domain property as verified, with a sitemap submitted
- [ ] Bing Webmaster Tools shows your site, imported from Search Console
- [ ] IndexNow is on, or a pull request for it is open
- [ ] You have the agent's list of basics problems
- [ ] Your `Search Baseline` tab has today's numbers, even if some are zero

:::example
title: See an example result

For Rolling Ledger, verification took 20 minutes because the DNS record needed one retry. Search Console showed 14 pages indexed and 3 not indexed: two old test pages marked "Crawled, currently not indexed" and a thank-you page with noindex, which is correct. The top query was "bookkeeping for food truck owners" with 210 impressions and an average position of 18. The agent check found that canonical links pointed at the hosting preview address instead of the real domain, which went on the list for Lesson 3.

:::video
id: gf-ex1-reveal
kind: exercise-reveal
status: paused
src: /learn/video/get-found/gf-ex1-reveal.mp4
captions: /learn/video/get-found/gf-ex1-reveal.vtt
poster: /learn/video/get-found/gf-ex1-reveal.jpg
transcript: Here's a finished setup for Rolling Ledger. Search Console is verified as a domain property, with 14 pages indexed and 3 left out for good reasons. Bing imported the site in one click and IndexNow is on. The agent check found one real problem: canonical links pointed at the hosting preview address. And the baseline tab records today's numbers, including 210 impressions for "bookkeeping for food truck owners" at position 18. That's the starting line.
:::

:::infographic
id: fig-2
type: anatomy
title: A finished baseline
shows: A sheet tab named Search Baseline with one dated row: 14 indexed, 3 not indexed, top query "bookkeeping for food truck owners" 210 impressions at position 18, AI-feature impressions 0, Bing citations 0. A sticky note lists the agent's one problem: canonicals point at the preview address.
data: 14 indexed, 3 not indexed, 210 impressions, position 18, 0 AI impressions, 0 Bing citations.
alt: The Rolling Ledger baseline: 14 pages indexed, 3 not indexed, a top query with 210 impressions at position 18, no AI impressions or citations yet, and one problem to fix.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Set up the stack for every site you run.

1. Repeat the setup for any second site or subdomain, such as a blog or a booking page.
2. Export the last 3 months of Search Console Performance data to a sheet, if you have any.
3. Write down your three most important pages and check each one in URL Inspection.

**Bring to your session:** your baseline tab, the agent's problem list and the three URL Inspection results.

**Your coach will:**
- Check your verification and sitemap setup for gaps
- Rank the agent's problem list by what to fix first
- Pick the one page to make your first SEO priority
:::
