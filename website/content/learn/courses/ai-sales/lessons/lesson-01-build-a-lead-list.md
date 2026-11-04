---
module: 1
lesson_number: 1
course: ai-sales
template: v2
---

# Lesson 1: Build a Lead List

:::video
id: sales-l1-overview
kind: overview
status: paused
src: /learn/video/ai-sales/sales-l1-overview.mp4
captions: /learn/video/ai-sales/sales-l1-overview.vtt
poster: /learn/video/ai-sales/sales-l1-overview.jpg
transcript: Five thousand scraped names nobody wanted to hear from, or thirty businesses you picked for a reason. The short list wins. This is AI Sales, lesson one: build a lead list. In this lesson: write the profile, research matches, score the list, and know where the lines are. First, write a five-part customer profile: who, where, size, pain and disqualifier, plus a why-now signal. Then have an AI research assistant find thirty matches, with fixed columns and a source link for every fact. Unknown is an allowed answer. A guessed email is not. Spot-check five rows yourself. Score each row on fit and signal, and keep the top twenty to thirty. Use public business information only: no LinkedIn scraping, and no bought lists. Then refresh the list every month. First, the profile.
:::

:::key-concept
A lead list is only as good as the definition behind it. Write down exactly who you sell to, then have an AI research assistant find public businesses that match, fill in a fixed set of columns, and cite where every fact came from. You review the list before a single message goes out.
:::

## What you'll be able to do

- Write an ideal customer profile (ICP) that an AI tool can actually follow
- Run a research prompt that returns a clean, sourced list of 25 to 50 prospects
- Score and trim the list with a spreadsheet formula instead of by gut
- Stay on the right side of privacy rules and platform terms while you do it

## Why this matters

Most solo founders skip the list and go straight to "posting more." That works slowly, if at all. A short list of the right 30 businesses, each with a reason you picked them, is worth more than a scraped file of 5,000 names nobody wanted to hear from. It also feeds everything else in this course: the Sales Bot in Lesson 2 drafts from this list, the CRM in Lesson 3 is built on it, and your proposals in Lesson 5 reuse the facts you gather here.

## Step 1: Write the profile before you search

AI research tools are fast and literal. If you ask for "small businesses that need bookkeeping," you will get a vague pile. If you give it a profile, you get a list you can use.

Your ICP needs five parts:

| Part | Example (sample business: bookkeeping for dog groomers) |
|---|---|
| Who | Independent dog grooming salons and mobile groomers |
| Where | Within the US, start with two metro areas you know |
| Size signal | 1 to 10 staff, one or two locations |
| Pain signal | Booking-only website, no posted prices for packages, owner does admin, recent expansion or new location |
| Disqualifier | Franchise locations (they have corporate accounting), vet clinics, pet stores |

:::infographic
id: fig-1
type: diagram
title: A five-part profile, plus why now
shows: Five stacked cards with Lucide icons: Who (independent groomers), Where (two metro areas), Size (1 to 10 staff), Pain (booking-only site, owner does admin), Disqualifier (franchises, vet clinics, pet stores). Below, a highlighted paper card: Why now (new location, hiring post, price change).
data: none
image: /learn/figures/ai-sales/lesson-01-fig-1.webp
alt: A five-part customer profile: who, where, size, pain signal and disqualifier, using the dog groomer example. Under it, a why-now line lists recent events, such as a new location, a hiring post or a price change, that make a prospect likelier to buy this month.
:::

If you don't have a business idea locked in yet, use this sample business for the whole course. Every exercise works with it.

Write a second line under the table called "Why now." This is the event that makes a prospect more likely to say yes this month: a new location, a hiring post, a recent opening, a price change on their site. Signals like these turn a list into a reason to reach out.

:::video
id: sales-l1-profile
kind: inline
status: paused
src: /learn/video/ai-sales/sales-l1-profile.mp4
captions: /learn/video/ai-sales/sales-l1-profile.vtt
poster: /learn/video/ai-sales/sales-l1-profile.jpg
transcript: AI researchers are fast and literal. Ask for small businesses that need bookkeeping, and you'll get a vague pile. Give it a profile instead, in five parts. Who: independent dog grooming salons and mobile groomers. Where: start with two metro areas you know. Size signal: one to ten staff, and one or two locations. Pain signal: a booking-only website, no posted package prices, and an owner doing the admin. Disqualifier: franchises, vet clinics and pet stores. Then add one more line: why now. That's the recent event that makes a yes more likely this month, like a new location, a hiring post, or a price change. A profile like this turns a list of names into a list of reasons to reach out. Next: let the researcher find matches.
:::

## Step 2: Have an AI researcher find matches

Use an assistant that can browse the web and cite sources, such as Claude with web search, ChatGPT with search, or Gemini. Ask for a fixed set of columns so the output drops straight into a spreadsheet.

```text
You are my sales research assistant. Find 30 businesses that match this profile.

Profile:
- Who: independent dog grooming salons and mobile groomers
- Where: Austin, TX and Denver, CO metro areas
- Size: 1 to 10 staff, one or two locations
- Exclude: franchises, vet clinics, pet supply stores

For each business return one row with these columns, as a table:
Business name | City | Website | Public business email or contact form URL | Owner or manager name if publicly listed | Why-now signal | Source URL for each fact

Rules:
- Use only information the business has published itself (its website, its Google Business Profile, its own social pages) or reputable directories.
- If you cannot confirm a field, write "unknown". Do not guess emails.
- Do not include personal phone numbers or home addresses.
- Mark franchises with "EXCLUDE" instead of dropping them, so I can see your reasoning.
```

Paste the result into a Google Sheet called "Lead list." Then spot-check five rows by clicking the source links yourself. If two of the five are wrong, the list is not ready. Tighten the prompt and run it again.

## Step 3: Score the list with a formula, not a feeling

Add three columns: Fit (1 to 3), Signal (0 to 2), and Score (Fit plus Signal). You can fill Fit and Signal by hand in ten minutes for 30 rows. Or, if your Google account includes Gemini in Sheets, use the AI function to suggest a first pass:

```text
=AI("Based on this description, rate fit for a bookkeeping service for independent dog groomers from 1 (poor) to 3 (strong). Reply with the number only.", B2:F2)
```

Google's help page notes the AI function can only see the cells you point it at, generates a limited number of cells per run, and can be wrong. Treat its numbers as a suggestion and override anything that looks off. Then sort by Score and keep the top 20 to 30.

:::infographic
id: fig-2
type: diagram
title: Score = Fit + Signal
shows: Three tiles in a row: Fit 1 to 3, plus, Signal 0 to 2, equals, Score up to 5 (highlighted). Under it: sort by Score, keep the top 20 to 30. A small note: AI scores are a first pass you review.
data: Fit 1-3, Signal 0-2, Score 1-5, keep 20-30
image: /learn/figures/ai-sales/lesson-01-fig-2.webp
alt: Each prospect gets a Fit score from 1 to 3 and a Signal score from 0 to 2. Add them for a Score of up to 5, sort, and keep the top 20 to 30. Treat any AI-suggested score as a first pass you review.
:::

## Step 4: Know where the lines are

This step keeps you out of trouble.

- **Public business information only.** A salon's published contact email is fine to note. A personal cell number from a data broker is not something you need.
- **Don't scrape LinkedIn.** LinkedIn's User Agreement and its help page on prohibited software ban bots, scrapers and automation tools that collect data or act on the site for you. Read profiles yourself if you want, and add notes by hand. Don't point your own agents or browser extensions at LinkedIn to harvest names. Lesson 7 covers the one LinkedIn automation this course teaches, Origami's Sequencer, along with the account risk and the limits to use if you choose it.
- **Don't buy email lists.** Purchased lists hurt your sender reputation (more in Lesson 2) and often include people who never agreed to anything.
- **Record the source.** If someone asks "where did you get my email?", you want a one-line answer: "From the contact page on your website."
- **Keep personal data minimal.** If you sell in or into the EU or UK, privacy rules are stricter for personal data. When in doubt, collect only business contact details and check with a lawyer before scaling.

:::warning
Research agents will sometimes invent an email address that "looks right," like info@ plus the domain. Never send to an address you can't trace to a source the business published. Bounces from guessed addresses damage your domain's reputation for every future email.
:::

:::video
id: sales-l1-lines
kind: inline
status: paused
src: /learn/video/ai-sales/sales-l1-lines.mp4
captions: /learn/video/ai-sales/sales-l1-lines.vtt
poster: /learn/video/ai-sales/sales-l1-lines.jpg
transcript: A fast list is no use if it gets your domain blocked or your account banned. Here are the lines. Public business information only. A salon's published contact email is fine. A personal cell number from a data broker is not. Don't scrape LinkedIn. Its terms ban bots and scrapers, so read profiles yourself and take notes by hand. Don't buy email lists, because they hurt your sender reputation. Record the source of every contact, so you can always say where you got an address. Keep personal data minimal, and check with a lawyer before you scale into the EU or UK. And watch for invented emails. If an address isn't on the business's own site, mark it unknown. One guessed address that bounces hurts every email you send after it. In the exercise, you'll build your first list.
:::

## Step 5: Keep the list alive

A lead list rots. Businesses close, owners change, emails stop working. Set a monthly reminder to rerun your research prompt for new matches and to mark rows older than 90 days for a quick recheck. In Lesson 2, your Sales Bot will take over the routine part of this refresh. You stay the one who approves who gets added.

:::try-it
Open a chat with any AI assistant that can search the web and paste: "Find 5 independent dog grooming salons in [your city] with their website and a source link for each. Write 'unknown' for anything you cannot confirm." Click two of the links. Did the facts hold up?
:::

:::checkpoint
Q: Your research assistant returns a prospect with the email "owner@happypawsgrooming.com" but no source link. What should you do?
- [ ] Send to it, since that format is common
- [x] Mark it "unknown" and look for a published contact on the business's own site
- [ ] Ask the AI to confirm the email is real and trust its answer
Why: Guessed addresses bounce and hurt your sender reputation. Only use contact details you can trace to something the business published.
:::

:::takeaways
- Write a five-part ICP plus a "why now" signal before you research
- Ask for fixed columns and a source URL for every fact, with "unknown" allowed
- Score with simple numbers, and treat AI scores as a first pass you review
- Public business data only, no LinkedIn scraping, no bought lists
:::

## Go deeper

- [Use the AI function in Google Sheets](https://support.google.com/docs/answer/15877199) - syntax, limits and accuracy notes for =AI()
- [Collaborate with Gemini in Google Sheets](https://support.google.com/docs/answer/14356410) - side panel actions like sorting, filters and formulas
- [CAN-SPAM Act: A Compliance Guide for Business](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business) - the FTC rules your list will be emailed under
- [LinkedIn: Prohibited software and extensions](https://www.linkedin.com/help/linkedin/answer/a1341387) - what LinkedIn bans for scraping and automation
