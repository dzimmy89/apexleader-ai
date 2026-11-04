---
module: 2
lesson_number: 6
course: get-found
template: v2
---

# Exercise 6: Draft, Edit and Publish Your Pillar Page

:::key-concept
You'll turn your Exercise 5 brief into a published page: an AI draft from your facts, three experience inserts in your own words, a seven-point expert edit, and Article structured data with your name and date. At the end your priority 1 topic has its main page live.
:::

**Time:** 45 minutes · **You'll need:** your brief from Exercise 5, Claude, your site's repository and builder agent, your author page from Exercise 4 · **Builds on:** Lesson 6

:::video
id: gf-ex6-setup
kind: exercise-setup
status: paused
src: /learn/video/get-found/gf-ex6-setup.mp4
captions: /learn/video/get-found/gf-ex6-setup.vtt
poster: /learn/video/get-found/gf-ex6-setup.jpg
transcript: In this exercise you'll publish your first pillar page. Give Claude your brief with the drafting rules, so anything it doesn't know becomes a NEED marker. Write the three experience inserts yourself. Run the seven-point edit and fix every failure. Then have your builder agent publish the page with your author line, the date, and Article markup, through a pull request you review.
:::

:::infographic
id: fig-1
type: anatomy
title: A raw AI draft
shows: A draft page with flags in the margin: two [NEED] markers in amber, three [EXPERIENCE] markers in blue, a red underline under a filler opening paragraph, and a red circle around the word "affordable". No author line, no date.
data: 2 NEED markers, 3 EXPERIENCE markers.
alt: A raw draft with two missing facts, three places for your experience, a filler opening and a vague adjective, and no author or date yet.
:::

## Warm-up

:::checkpoint
Q: What should Claude do when it needs a fact that isn't in your brief?
- [ ] Use a typical figure from the internet
- [x] Write a [NEED] marker so you can supply it
- [ ] Leave the section out without telling you
Why: The drafting rules make missing facts visible. You supply them or cut the section, so nothing invented reaches the page.
:::

## Steps

1. **Draft.** Paste your brief and the drafting prompt from Lesson 6 into Claude.

2. **Fill the NEEDs.** Answer every `[NEED]` marker with a fact you can prove, or delete the sentence.

3. **Write the experience inserts.** Replace each `[EXPERIENCE]` marker with two to four sentences from your own work. Include a number where you can.

4. **Run the edit.** Paste the draft into Claude with the strict-editor prompt from Lesson 6. Fix every sentence it quotes.

5. **Read it aloud.** Read the whole page out loud once. Rewrite anything you wouldn't say to a customer.

6. **Add name and date.** Add an author line linking to your author page and "Last updated: [today's date]".

7. **Publish through a pull request.** Ask your builder agent:

   ```text
   Add this page at /[slug]. Use our page template. Add Article structured data
   with headline, author (linked to our Person markup on the about page),
   datePublished and dateModified, matching what's on the page. Add the page
   to the sitemap and link to it from [two related pages]. Open a pull request.
   ```

8. **Check and merge.** Open the preview. Run it through the Rich Results Test. Merge, then request indexing in Search Console.

9. **Log it.** Add the page to your content calendar from AI Marketing as `published`, with two repurposed social posts as `draft`.

## Done when

- [ ] The page is live with no `[NEED]` markers and three experience inserts
- [ ] Every one of the seven edit checks passes
- [ ] The page shows your author line and "Last updated" date
- [ ] Article markup passes the Rich Results Test, and indexing is requested

:::example
title: See an example result

The Groomer Books page "What bookkeeping software should a dog groomer use?" went from a 1,900-word draft to 1,450 words after the edit. The two NEED markers became the founder's real month-end times for salon clients (from about 6 hours to under 2). The three experience inserts covered a mobile groomer's van miles, a salon's cash tips, and a solo groomer who missed a quarterly tax payment. The comparison table rated four apps on tips, mileage and quarterly estimates, with a pick for each type of groomer.

:::video
id: gf-ex6-reveal
kind: exercise-reveal
status: paused
src: /learn/video/get-found/gf-ex6-reveal.mp4
captions: /learn/video/get-found/gf-ex6-reveal.vtt
poster: /learn/video/get-found/gf-ex6-reveal.jpg
transcript: Here's the published Groomer Books page. The edit cut it from nineteen hundred words to fourteen fifty, and every number now comes from the founder's own client work. Three short stories, a van, cash tips and a missed tax payment, make it clearly hers. The comparison table picks an app for salon, mobile and solo groomers. Her name, the date and Article markup are on the page, and it's in Search Console's queue.
:::

:::infographic
id: fig-2
type: anatomy
title: The finished page
shows: The published page with labelled parts: H1 question, a 48-word direct answer, a comparison table of four apps on tips, mileage and quarterly estimates, three experience inserts marked with a person icon, the author line and "Last updated" date, and one link to the Groomer Books trial. A green "Article markup valid" badge.
data: 1,900 words drafted, 1,450 published; 4 apps compared; 3 experience inserts.
alt: The finished Groomer Books pillar page: the question and a short answer, a four-app comparison, three first-hand stories, the founder's name and date, one next step, and valid Article markup.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Publish the cluster.

1. Write the two supporting pages you briefed, using the same workflow.
2. Link all three pages to each other where it helps the reader.
3. Share the pillar page with one customer and ask what's missing.

**Bring to your session:** the three published pages, the customer's feedback and your edit notes.

**Your coach will:**
- Review the pillar page as a buyer would
- Find the weakest section and help you strengthen it
- Agree a weekly publishing pace you can keep
:::
