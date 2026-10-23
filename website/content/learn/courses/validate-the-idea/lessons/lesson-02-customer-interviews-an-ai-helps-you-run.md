---
module: 1
lesson_number: 2
course: validate-the-idea
template: v2
---

# Lesson 2: Customer Interviews an AI Helps You Run

:::key-concept
Customer interviews tell you what research can't: how people really handle the problem today and what they've already paid to fix it. AI helps with everything around the conversation: finding people, writing a script that avoids leading questions, transcribing, and spotting patterns across calls. The conversation itself stays human.
:::

## What you'll be able to do

- Find 8 to 10 people to interview without paying for leads or spamming anyone
- Write an interview script in the style of The Mom Test that gets facts, not compliments
- Record and transcribe calls with consent, then synthesize them with AI
- Decide whether your riskiest assumptions survived

## Why this matters

Friends and strangers are polite. Ask "Would you use this?" and most will say yes, then never buy. Rob Fitzpatrick's book The Mom Test is built on that problem: people lie to be nice, so you ask about their past behavior instead of your idea. For a solo founder, ten good interviews can save months of building the wrong thing. AI makes the prep and the analysis fast enough that you can run them in a week.

## Find the right people to talk to

You want people who have the problem now, not people who might be interested. For Groomer Books, that's owners of small grooming shops who do their own books.

Where to look:

- **Your own network.** Ask friends: "Do you know anyone who owns a grooming shop?" Warm intros get the most yeses.
- **Communities.** Industry Facebook groups, subreddits, trade associations, local business groups. Read the rules first; many ban promotion. Ask to learn, not to sell.
- **Walk in.** For local businesses, a short visit at a quiet time works surprisingly well.
- **LinkedIn and email.** Short, specific, no pitch.

Let AI draft the outreach, then you edit and send it yourself:

```text
Write a 70-word message to a dog grooming shop owner asking for a 20-minute call.
I'm researching how small groomers handle bookkeeping. I'm not selling anything on this call.
Offer a $25 gift card or a summary of what I learn from other groomers.
Plain, friendly, no hype, no exclamation marks.
```

Aim for 8 to 10 conversations. Patterns usually appear by call five or six.

## Write a script that passes The Mom Test

The core rules from The Mom Test:

1. **Talk about their life, not your idea.** Don't pitch until the end, if at all.
2. **Ask about specifics in the past, not opinions about the future.** "When did you last..." beats "Would you ever..."
3. **Talk less, listen more.**

Ask the AI to draft the script, and to police it:

```text
Write a 20-minute customer interview script for owners of small dog grooming shops.
Goal: learn how they handle bookkeeping today, what it costs them in time and money, and what they've tried.
Follow The Mom Test: ask about past behavior and specifics, never ask if they'd buy or like my idea, don't mention my product.
Include: a 1-sentence opener, 8 to 10 questions, follow-up probes, and a closing ask for intros to other groomers.
Then list any question you wrote that a strict Mom Test reviewer would reject, and fix it.
```

Good questions look like this:

- "Walk me through the last time you did your books. When was it, how long did it take?"
- "What did you do about it last tax season?"
- "Have you ever paid someone or bought software to help? What happened?"
- "What's the most annoying part? Why?"

Bad questions sound like: "Would you pay $200 a month for this?" or "Do you think this is a good idea?"

At the end of a good call, ask for a small **commitment**: an intro to another groomer, a follow-up call, or permission to send them your offer when it's ready. Compliments are not data. Commitments are.

## Record, transcribe and take notes

With permission, record the call so you can listen instead of scribbling.

- **Video calls.** Google Meet can take notes with Gemini and create transcripts on eligible Workspace and Google AI plans. Zoom and other tools have similar features. Check your plan's current options.
- **Phone or in person.** Use your phone's recorder or a transcription app, then upload the transcript.
- **Ask first, every time.** Start with: "Is it OK if I record so I can focus on listening? Only I will hear it." Recording laws vary by place, and some US states require everyone's consent. This is general information, not legal advice.

Right after each call, spend five minutes writing the three things that surprised you. Your memory fades fast.

## Synthesize with AI, then read the quotes yourself

Put all transcripts in one notebook (Gemini Notebook, formerly NotebookLM, works well because it cites the passage) or one long chat. Remove last names and anything sensitive first.

```text
These are transcripts of interviews with small dog grooming shop owners about bookkeeping.
1. For each interview: how they do bookkeeping now, time spent, money spent, tools used, biggest pain in their own words.
2. Across all interviews: the top 3 pains, how many people mentioned each, with a short quote for each.
3. Evidence for and against each of these assumptions: [paste your top 3 risky assumptions].
4. Anyone who already pays for a solution or has tried to: what and how much.
Only use what's in the transcripts. Quote, don't paraphrase, when it matters.
```

Then read the quotes it pulled in the original transcript. AI summaries smooth over hedges like "maybe" and "I guess." Those words matter.

Score each assumption: **supported**, **mixed**, or **not supported**. If your biggest assumption isn't supported, that's not failure. It's the cheapest pivot you'll ever make.

:::try-it
Write your three worst interview questions, the ones you'd naturally ask. Paste them into an AI chat and ask: "Rewrite these to pass The Mom Test: past behavior, specifics, no mention of my idea."
:::

:::warning
Get consent before recording, store transcripts in an account you control, and strip last names and sensitive details before pasting them into an AI tool. Send outreach messages yourself; never let an agent message strangers on your behalf without your review.
:::

:::checkpoint
Q: An interviewee says, "That sounds great, I'd definitely use it!" How should you record that?
- [ ] Strong evidence of demand; count them as a likely customer
- [x] A compliment, not data; look for past behavior or a commitment like an intro or follow-up
- [ ] A reason to stop interviewing and start building
Why: The Mom Test treats compliments and future promises as unreliable. Past spending, effort and commitments are the real signals.
:::

:::takeaways
- Interview people who have the problem now; aim for 8 to 10.
- Ask about specific past behavior, never "would you buy this?"
- Record with consent, transcribe, and synthesize with AI, then check the quotes yourself.
- Score each risky assumption as supported, mixed or not supported.
:::

## Go deeper

- [Use Deep Research in Gemini Apps](https://support.google.com/gemini/answer/15719111?hl=en&co=GENIE.Platform%3DDesktop) - add notebooks and files as research sources
- [NotebookLM is now Gemini Notebook](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/) - Google's cited-answers notebook for transcripts and notes
- [Add or discover new sources for your notebook](https://support.google.com/gemininotebook/answer/16215270) - how to load transcripts into a notebook
