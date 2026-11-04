---
module: 2
lesson_number: 6
course: ai-sales
template: v2
---

# Lesson 6: Prospect With a Research Agent

:::key-concept
A research agent such as Origami turns a plain-English description of your buyer into a table of real businesses, each with contact details and the reason it showed up. It does in minutes what Lesson 1 had you do by hand. Your job doesn't change: write a sharp profile, check the sources, and decide who makes the list.
:::

## What you'll be able to do

- Explain what Origami's research agents and "plays" do, and when they beat a chat assistant
- Turn your Lesson 1 ICP into one prompt that returns a usable, sourced lead table
- Spend credits on the leads you want, not on loose searches
- Move the best rows into your Lead list sheet without losing the source trail

## Why this matters

In Lesson 1 you asked a chat assistant to find 30 businesses. It worked, but it was slow, and the assistant often wrote "unknown" for contact details. Dedicated prospecting tools close that gap: they search many sources at once, look up verified emails and phone numbers, and return the same columns every time. The risk is the same as with any agent. A fast tool with a vague brief fills your sheet with the wrong people quickly. This lesson keeps the speed and keeps your standards.

## Meet Origami

Origami (origami.chat) is a Y Combinator startup founded in 2024. You describe who you sell to, and its research agents search live sources (Google Maps, Yelp, state license boards, LinkedIn, job boards and company websites), remove duplicates, and return a structured table: business name, owner or decision-maker, email, phone, and the signal that made each lead relevant. Origami says contacts are "researched across 50+ sources, verified with 10+ providers."

Independent reviewers note that Origami is strongest on local and offline businesses (food trucks, salons, trades, home services) because it crawls maps, review sites and license boards rather than relying on one database. That makes it a good fit for the sample business in this course: bookkeeping for independent food truck owners.

**Pricing, as of November 2026.** Origami's homepage lists a Starter plan at $99 a month ("over 1,000 leads a month," unlimited teammates and plays, verified contact details) and a custom Teams plan, with no per-seat fees. Older pages and third-party reviews list different tiers and credit amounts, so check the [current pricing](https://origami.chat/) before you buy. A free plan has existed with tight limits (no export, no contact details), which is enough to see how searches work but not to build a real list.

## Step 1: Understand plays

Origami organizes prospecting into **plays**. Its own definition: a play is "one way of getting customers." When you enter your website, it suggests plays for you, and you can describe your own. The play types it lists include:

| Play type | What it finds | Rolling Ledger example |
|---|---|---|
| Buying signals | Businesses with a recent event: hiring, a new location, funding, new reviews, a job change | Food trucks posting a job for a second line cook |
| New market | Businesses matching a plain-English description | Food truck owners in Austin and Denver with 1 to 10 staff |
| Website visitors | Companies that visited your site | Truck owners who read your pricing page last week |
| Conversations | People publicly asking for what you sell | Food truck owners asking in forums how to handle bookkeeping |
| Your network | People you're already connected to | Past clients and contacts who own food trucks |

Start with one signal play. A list built around a "why now" event gives you a reason to write, which is the hardest part of a cold message.

## Step 2: Write the prompt from your ICP

Origami takes plain English, but it is literal, and reviewers report that similar prompts can return different results. So write the prompt once, save it, and reuse it. Build it straight from your Lesson 1 profile:

```text
Find independent single-truck and multi-truck owners in the Austin, TX
and Denver, CO metro areas.

Include: 1 to 10 staff, one or two locations, owner-operated.
Signal: posted a job for a line cook or cashier in the last 60 days, OR opened
a new location in the last 6 months.
Exclude: franchise locations, restaurant groups, catering companies, chains with
more than 3 locations.

For each business return: business name, city, website, owner or manager
name, business email, the signal and its date, and a source link for each.
```

Run it and read the first 10 rows before you let it fetch more. If three of the first ten are franchises or restaurant groups, tighten the Exclude line and run it again. This costs less than cleaning a list of 200.

:::warning
Origami pulls from sources that include LinkedIn. That's Origami's arrangement with its data sources, and it's covered by your agreement with Origami. It doesn't change the rule from Lesson 1: don't point your own bots or browser extensions at LinkedIn to scrape profiles.
:::

## Step 3: Spend credits deliberately

Prospecting tools charge for contact lookups. Reviewers report that Origami charges for found emails and phones (phones cost several times more than emails) and nothing when no match is found. That makes three habits worth keeping:

1. **Search first, enrich second.** Review the matched businesses, delete poor fits, then ask for contact details on the rows you kept.
2. **Skip phones by default.** You won't cold call in this course. Add phones only for leads that have replied.
3. **Cap the first run.** Ask for 30 rows, not 300. You're testing the prompt, not filling a quarter's pipeline.

Write down what you spent on each run. In Lesson 9 you'll compare cost per reply across every channel, and you can't do that without the numbers.

## Step 4: Check the sources

A verified email is more likely to be real. It isn't necessarily one the business chose to publish. Keep the Lesson 1 standard:

- Open five rows at random and click the source links. Does the signal (job post, new location) really exist, and is it recent?
- Prefer emails the business published on its own website or listing. Mark the source of each email in a column.
- Remove personal details you don't need: home addresses, personal cell numbers, family names.
- If you sell into the EU or UK, collect only business contact details and check the privacy rules before you email anyone.

If two of the five spot-checks fail, the list isn't ready. Fix the prompt and rerun.

## Step 5: Move the keepers into your Lead list

Origami saves searches as workspaces you can export to CSV or push to a CRM (it names Salesforce, HubSpot and Attio). For this course, export to CSV and import into your existing Lead list sheet, so every tool feeds the same place:

1. Export the kept rows.
2. Paste them into a new tab, then copy the matching columns into "Lead list."
3. Add a **Source tool** column and write "Origami" on each row, plus the play name.
4. Score each row with the Lesson 1 formula (Fit 1 to 3, plus Signal 0 to 2).
5. Check every new row against your Do not contact tab.

Now your Sales Bot, your CRM keeper and the sequences in Lesson 7 all read from one list, and you can always answer "where did this lead come from?"

:::try-it
Write the Include, Signal and Exclude lines for your own business in three sentences. Then read them as if you were a literal-minded researcher. What would you wrongly include? Add that to Exclude.
:::

:::checkpoint
Q: Origami returns 30 food trucks. Before paying for contact details, what should you do first?
- [ ] Enrich all 30 with emails and phones so nothing is missed
- [x] Review the matches, delete poor fits, then enrich only the rows you kept
- [ ] Export all 30 to your CRM and clean them up later
Why: Contact lookups cost credits. Removing franchises and wrong-fit businesses first means you only pay for leads you would actually contact.
:::

:::takeaways
- A play is one way of getting customers. Start with one signal play.
- Build the prompt from your Lesson 1 ICP, save it, and reuse it
- Search first, enrich second, skip phones, and cap the first run
- Spot-check five sources; record the source tool and play on every row
:::

## Go deeper

- [Origami](https://origami.chat/) - plays, data sources and current plans
- [What is Origami?](https://origami.chat/blog/what-is-origami-ai-prospecting-tool-review-2026) - Origami's own overview of sources, workspaces, exports and CRM options
- [FTC: CAN-SPAM Act compliance guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business) - the rules your list will be emailed under
