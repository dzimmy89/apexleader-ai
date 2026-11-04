---
module: 2
lesson_number: 6
course: get-found
template: v2
---

# Lesson 6: Write With AI, Edit Like an Expert

:::video
id: gf-l6-overview
kind: overview
status: paused
src: /learn/video/get-found/gf-l6-overview.mp4
captions: /learn/video/get-found/gf-l6-overview.vtt
poster: /learn/video/get-found/gf-l6-overview.jpg
transcript: Google doesn't penalise a page because AI helped write it. It penalises pages made mainly to game rankings, especially when they're mass-produced. So the question isn't whether to use AI, it's how. In this lesson you'll draft a page from your brief with Claude, add the experience only you have, and run an expert edit pass that cuts filler, checks every fact, and puts your name on it. One good page a week beats a hundred generated ones.
:::

:::key-concept
AI is a fast first-draft writer and a tireless editor. You are the expert. Google says using AI to create content is fine when the content is helpful, but generating many pages mainly to manipulate rankings breaks its scaled content abuse policy, however they're made. The safe and effective workflow is: a brief with your facts in, an AI draft, your experience added, an expert edit pass, then your name and date on the page.
:::

## What you'll be able to do

- Tell helpful AI-assisted content from scaled content abuse
- Draft a page from a brief so the AI uses your facts, not its guesses
- Add "experience inserts" that only you could write
- Run a seven-point expert edit before you publish

## Why this matters

Most AI content reads the same: long intros, vague advice, no numbers, no point of view. Readers leave, rankings don't come, and assistants have no reason to cite it. Your edge as a solo founder is that you've actually done the work. The workflow in this lesson keeps AI doing the typing while your experience does the convincing.

## Where the line is

| Helpful, AI-assisted | Scaled content abuse |
|---|---|
| One page per real topic, answering what buyers ask | A page for every keyword or city variation |
| Built from your facts and experience | Rewritten from other sites, adding nothing |
| Checked and edited by someone who knows the subject | Published without anyone reading it |
| Author named, date shown | No author, no date, or a made-up persona |
| Published at the pace you can review, such as one a week | Hundreds of pages at once |

Google's guidance for its AI features adds two more don'ts: don't chunk content into tiny pages for AI, and don't rewrite pages just for AI systems. Write for people.

:::infographic
id: fig-1
type: comparison
title: Helpful content versus scaled content abuse
shows: Two columns. Left, green: one page per topic, your facts, expert edit, named author and date, one a week. Right, red: a page per keyword variation, rewritten from others, no review, no author, hundreds at once. A paper card under both says "How it's made doesn't matter. Why and how many does."
data: none
alt: Helpful AI-assisted content answers real topics from your facts, is edited by an expert and carries your name. Scaled content abuse mass-produces thin variations. The tool doesn't matter; the purpose and the volume do.
:::

:::video
id: gf-l6-scaled-content-line
kind: inline
status: paused
src: /learn/video/get-found/gf-l6-scaled-content-line.mp4
captions: /learn/video/get-found/gf-l6-scaled-content-line.vtt
poster: /learn/video/get-found/gf-l6-scaled-content-line.jpg
transcript: Here's the line in practice. An agent offers to write "bookkeeping for groomers in" every one of fifty cities, same page, city name swapped. That's scaled content abuse, and it can hurt the whole site. Instead, Groomer Books writes one strong page on choosing bookkeeping software, from the founder's real numbers, and publishes it after she edits it. Same tools. Different purpose, and a different result.
:::

## Draft from the brief

Give Claude the brief, with your facts filled in, and tight rules:

```text
Write the page from this brief (pasted below). Rules:
- Use only the facts in the brief. If you need a fact that isn't there,
  write [NEED: what you need] instead of guessing.
- Open with the H1 and the direct answer from the brief, then the sections.
- Short paragraphs, plain words, no filler intro, no "in today's world".
- Where a table helps compare things, use one.
- Leave three markers, [EXPERIENCE: topic], where a first-hand story or
  example from me would make the point stronger.
```

## Add experience inserts

Each `[EXPERIENCE]` marker is a place for two to four sentences only you could write: what happened, what you did, the result, ideally with a number. For example: "When I moved a mobile groomer from a shoebox of receipts to a mileage app, her deductible van miles went from a guess to 11,400 for the year."

These inserts are what readers remember, what Google's guidance means by first-hand experience, and what assistants quote.

## The seven-point expert edit

Ask Claude to help with the edit, but make the calls yourself:

1. **Answer first.** Does the page answer the H1 question in the first two or three sentences?
2. **Every fact checked.** Is every number and claim from your brief or a source you link? Delete the rest.
3. **No filler.** Cut any sentence that would fit on a competitor's page unchanged.
4. **Experience in.** Are all three experience inserts written, in your voice?
5. **Specifics over adjectives.** Replace "affordable" with the price, "fast" with the time.
6. **Name and date.** Author line linking to your author page, and "Last updated" with the date.
7. **One next step.** One link to your offer or the next page in the cluster.

```text
Edit this draft as a strict editor. For each of these seven checks, quote the
sentences that fail and suggest a fix: answer first, unsupported facts, filler,
missing experience, vague adjectives, author and date, one next step.
Don't rewrite the whole page.
```

:::infographic
id: fig-2
type: flow
title: Fact sheet to published page
shows: Five steps left to right: brief with facts filled, AI draft with [NEED] and [EXPERIENCE] markers, you write the experience inserts, seven-point expert edit, published with author and date. A loop arrow from the edit back to the draft labelled "until every check passes".
data: none
alt: The brief and your facts go in, Claude drafts with markers for missing facts and experience, you add the experience, run the seven-point edit until it passes, and publish with your name and date.
:::

:::video
id: gf-l6-expert-edit
kind: inline
status: paused
src: /learn/video/get-found/gf-l6-expert-edit.mp4
captions: /learn/video/get-found/gf-l6-expert-edit.vtt
poster: /learn/video/get-found/gf-l6-expert-edit.jpg
transcript: Here's the expert edit on the Groomer Books draft. Claude flags an opening paragraph that doesn't answer the question, two sentences with no source, and the word "affordable" with no price. The founder fixes each one, writes three short stories from her salon clients into the experience markers, and adds her name and the date. The page went from a decent draft to something only Groomer Books could have published.
:::

:::warning
Never publish a page with a `[NEED]` marker or a claim you haven't checked. AI writing tools still invent numbers, quotes and sources that look real. If you publish one, it's your name on it.
:::

:::try-it
Take any paragraph you've written with AI recently. Highlight every sentence that would still be true on a competitor's site. If it's more than half, that paragraph needs an experience insert.
:::

:::checkpoint
Q: Which of these breaks Google's scaled content abuse policy?
- [ ] One AI-drafted page, edited by you, answering a real buyer question
- [x] Fifty near-identical pages, one per city, generated to rank for each city name
- [ ] Using Claude to fix the grammar on a page you wrote
Why: The policy targets mass-producing pages mainly to manipulate rankings, however they're made. One helpful, edited page is fine.
:::

:::checkpoint
Q: Claude's draft says "Groomers save an average of 6 hours a month with bookkeeping software." The figure isn't in your brief. What do you do?
- [ ] Keep it; it sounds right
- [ ] Change it to "many hours"
- [x] Remove it, or replace it with a number you can prove or a source you link
Why: Every fact on the page must come from you or a source. Invented statistics damage trust with readers, search engines and assistants.
:::

:::takeaways
- AI-assisted content is fine. Mass-producing pages to game rankings is not.
- Draft from a brief with your facts, and make the AI mark what it doesn't know.
- Experience inserts are what make the page yours, and what gets quoted.
- Run the seven-point expert edit and publish with your name and date.
:::

## Go deeper

- [Google: Guidance about AI-generated content](https://developers.google.com/search/blog/2023/02/google-search-and-ai-content) - Google's position on AI-assisted content
- [Google: Spam policies, scaled content abuse](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content) - what the policy covers
- [Google: Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) - the "who, how and why" of good content
