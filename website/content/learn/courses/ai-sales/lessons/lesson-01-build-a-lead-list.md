---
module: 1
lesson_number: 1
course: ai-sales
template: v2
---

# Lesson 1: Build a Lead List

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

If you don't have a business idea locked in yet, use this sample business for the whole course. Every exercise works with it.

Write a second line under the table called "Why now." This is the event that makes a prospect more likely to say yes this month: a new location, a hiring post, a recent opening, a price change on their site. Signals like these turn a list into a reason to reach out.

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

## Step 4: Know where the lines are

This step keeps you out of trouble.

- **Public business information only.** A salon's published contact email is fine to note. A personal cell number from a data broker is not something you need.
- **Don't scrape LinkedIn.** LinkedIn's User Agreement and its help page on prohibited software ban bots, scrapers and automation tools that collect data or act on the site for you. Read profiles yourself if you want, and add notes by hand. Don't point an agent at LinkedIn to harvest names or send connection requests.
- **Don't buy email lists.** Purchased lists hurt your sender reputation (more in Lesson 2) and often include people who never agreed to anything.
- **Record the source.** If someone asks "where did you get my email?", you want a one-line answer: "From the contact page on your website."
- **Keep personal data minimal.** If you sell in or into the EU or UK, privacy rules are stricter for personal data. When in doubt, collect only business contact details and check with a lawyer before scaling.

:::warning
Research agents will sometimes invent an email address that "looks right," like info@ plus the domain. Never send to an address you can't trace to a source the business published. Bounces from guessed addresses damage your domain's reputation for every future email.
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
