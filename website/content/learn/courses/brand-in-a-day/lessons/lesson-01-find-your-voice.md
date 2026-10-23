---
module: 1
lesson_number: 1
course: brand-in-a-day
template: v2
---

# Lesson 1: Find Your Voice

:::key-concept
Your brand voice is a short set of rules for how your business sounds: who you are, who you are not, the words you use and the words you never use. Claude can help you find it from your own writing and your customers' words, but you choose it. Once it's written down, every agent you hire can write like you.
:::

## What you'll be able to do

- Collect the raw material that reveals your natural voice: your writing and your customers' words
- Use Claude to turn that material into three or four voice traits, each with a "this, not that"
- Write a one-page voice guide with a word list and before and after examples
- Test the guide by having Claude rewrite real copy and judging the result

## Why this matters

You're about to have several agents writing for you: landing page copy, emails, social posts, proposals, follow-ups. Without a voice guide, each one defaults to the same polished, slightly generic AI tone, and your business sounds like everyone else's. Customers notice. A one-page guide fixes that, and it's the cheapest piece of brand work you'll ever do.

If you don't have a business yet, use the sample from this program: Groomer Books, monthly bookkeeping for independent dog groomers.

## Voice versus tone

**Voice** is your personality. It doesn't change. **Tone** is how that personality adjusts to the moment. A friendly, plain-spoken bookkeeper stays friendly and plain-spoken, but sounds lighter on Instagram and more careful in an overdue-invoice email.

| | Voice (constant) | Tone (shifts by moment) |
|---|---|---|
| Example | Plain-spoken, warm, practical | Upbeat in a welcome email; calm and direct in a tax deadline reminder |
| Where it lives | Top of your voice guide | A short "tone by situation" table |

## Step 1: Gather your raw material

Your voice already exists. It's in how you talk about your business and how your customers talk about their problem. Collect, in one document:

- **Your own words:** three to five emails or messages you're proud of, a voice memo transcript where you explain your business to a friend, your LinkedIn about section.
- **Your customers' words:** quotes from interviews or calls (the Find and Validate the Idea course produces these), reviews of competitors, posts in communities where your customers hang out.
- **Anti-examples:** two or three pieces of writing in your market that make you cringe.

Customer words are the most valuable part. "I do my books at 11pm after the last dog leaves" tells you more about how to sound than any adjective.

:::warning
Remove names, emails, phone numbers and anything private before pasting customer messages or call notes into any AI tool. Keep the quote, drop the identity. If a customer told you something in confidence, leave it out.
:::

## Step 2: Have Claude find the pattern

Put the material in a Claude Project for your business (Projects let you keep files and standing instructions in one place) or attach it to a chat. Then ask Claude to analyze, not invent.

```text
Attached: samples of my own writing, customer quotes, and writing I dislike.
My business: [one sentence].

1. Describe how I naturally write: sentence length, formality, humor, the words I reach for.
2. Describe how my customers talk about their problem: the exact phrases they repeat.
3. Describe what I dislike in the anti-examples.
4. Propose three or four voice traits for my business. For each give:
   the trait, what it means in one line, "this, not that" (e.g. "plain, not dumbed down"),
   and one example sentence.
Base everything on the material. Quote it. Don't flatter me.
```

You'll get a draft. Now do the founder's job: push back. Cut any trait that every business claims ("professional," "innovative"). Keep traits that would make a competitor's copywriter say "we couldn't say it that way."

## Step 3: Write the one-page voice guide

A voice guide that agents actually follow is short and concrete. Use this structure:

```text
# Groomer Books voice guide

## Who we sound like
A sharp friend who happens to be good with numbers. We talk like groomers talk.

## Traits
- Plain, not dumbed down. Short sentences. Explain any money term in five words or fewer.
- Warm, not cute. We like dogs. We don't do dog puns in serious moments.
- Practical, not preachy. Every message ends with one clear next step.
- Honest, not hyped. No "revolutionary," no guarantees about taxes, no fake urgency.

## Words we use / words we avoid
Use: books, receipts, money in, money out, your chair, slow season
Avoid: leverage, synergy, solutions, seamless, game-changer, "financial wellness"

## Tone by situation
- Social posts: lighter, one idea, can be funny
- Sales emails: direct, short, one question
- Reminders and deadlines: calm, specific dates, no exclamation marks
- Bad news (errors, price changes): own it first, then fix

## Before and after
Before: "Our innovative platform seamlessly streamlines your financial workflows."
After: "Send us your receipts. We'll send you your numbers by the 5th."

## Rules for AI writers
- Use American spelling. No em dashes. No emoji in emails.
- Never invent customer quotes, numbers, prices or results.
- When unsure about a claim, write [CHECK] and flag it.
```

Keep it to one page. If it grows past that, agents (and you) stop reading it closely.

## Step 4: Test it on real copy

A guide is only good if it changes the output. Run a quick test in a fresh chat:

```text
Here is my voice guide [attach]. Rewrite each of these three pieces in this voice:
1. My landing page hero (attached)
2. This cold email I sent last month (attached)
3. A 40-word Instagram caption announcing that we now do quarterly tax estimates.
After each, list which rules in the guide you applied and any you weren't sure how to apply.
```

Read the results aloud. Do they sound like you on a good day? Where Claude was unsure, the guide is vague: tighten that line. Two rounds is usually enough.

## Make it a team habit

Voice drifts when you're busy. Three habits keep it steady:

- **One home for the guide.** One file, versioned, that every agent reads. Lesson 3 shows how to wire it into a Claude Project, a skill and a CLAUDE.md.
- **Collect fresh customer words monthly.** New phrases from calls and emails go into the guide's word list.
- **You approve what goes out.** Agents draft in your voice; you click send or publish. A good voice guide makes your approval faster, not optional.

:::try-it
Open Claude and paste two emails you've written. Ask: "Describe my writing voice in three traits, each as 'this, not that', using quotes from these emails as evidence." Notice which trait surprises you.
:::

:::checkpoint
Q: Claude proposes the trait "Professional and innovative." What should you do with it?
- [ ] Keep it, because every business should sound professional
- [x] Replace it with a specific "this, not that" trait drawn from your own and your customers' words
- [ ] Add more adjectives so it's clearer
Why: Generic traits don't change what an agent writes. A specific contrast like "plain, not dumbed down" gives a clear rule an agent can follow and you can check.
:::

:::takeaways
- Voice is constant; tone shifts by situation. Write both down.
- Find your voice in your own writing and your customers' words, with Claude analyzing, not inventing.
- Keep the guide to one page: traits as "this, not that," words to use and avoid, before and after examples, rules for AI writers.
- Test it by rewriting real copy, then tighten anything the agent was unsure about.
:::

## Go deeper

- [What are Projects? (Claude Help Center)](https://support.claude.com/en/articles/9519177) - project knowledge and instructions; available on free accounts, with a project limit
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) - why short, specific instructions get followed and long ones get ignored, which applies to voice guides too
- [Using skills in Claude](https://support.claude.com/en/articles/12512180) - how to package instructions like a voice guide so Claude applies them automatically
