---
module: 1
lesson_number: 5
course: ai-marketing
template: v2
---

# Lesson 5: Email Newsletter on Autopilot

:::key-concept
Your email list is the one audience no platform can take away. "Autopilot" here means the gathering, drafting and formatting run themselves every week, and you spend ten minutes reviewing and one click scheduling. The send stays yours.
:::

## What you'll be able to do

- Choose a newsletter tool and set it up with the legal basics in place
- Build a fixed issue template your agent fills from the week's content
- Set up a weekly draft routine that ends in a test email to you, not a send to your list
- Decide which automations (welcome emails, RSS-to-email) are safe to run without a weekly click

## Why this matters

Social reach rises and falls with each platform's algorithm. Email reaches the people who asked to hear from you. For a solo founder, a short weekly newsletter is often the highest-return marketing habit you can keep, and it's the habit most likely to die in week three. Automating the assembly is what keeps it alive. Keeping the send click is what keeps one bad draft from landing in a thousand inboxes.

## Step 1: Pick a tool and set the basics

Any mainstream newsletter platform works: beehiiv, Kit, Mailchimp, Buttondown and others. Choose based on three questions:

1. **Can my agent create drafts without being able to send?** Look for team roles (a writer or contributor role) or an API that can create draft posts.
2. **Does it have automations** for a welcome sequence and, optionally, RSS-to-email?
3. **Can I export my list** any time? You should always own it.

Check each tool's current pricing page; free tiers usually cover a new list.

Then set the legal basics. In the US, the CAN-SPAM Act applies to commercial email. The FTC's guide lists the essentials: honest "From" and subject lines, a valid physical postal address, a clear way to opt out, and honoring opt-outs within 10 business days. The FTC also says you can't contract compliance away; if a tool or agent sends for you, you're still responsible. Rules differ elsewhere (the EU and Canada, for example, generally require prior consent), so if you have subscribers abroad, this is general information: check with a lawyer for your situation. Using double opt-in and a clear signup promise ("one email a week about X") covers most of the ground.

:::warning
Your subscriber list is customer data. Don't export it into a chat, and don't give an agent a role that can view or download the full list. The agent needs to write drafts, not see who's on the list.
:::

## Step 2: Design an issue your agent can fill

Readers like predictability, and so do agents. Fix the shape once:

```text
Subject: [one specific promise, under 50 characters]
Preview text: [one line that adds to the subject]

1. Opening (60 words): one observation from my week, in my voice
2. The main idea (200 words): from this week's article or answer page, with link
3. Quick wins (3 bullets): repurposed from this week's best social posts
4. One question for readers: invite replies
5. Soft offer (1 line): what we do and the link
Footer: physical address, unsubscribe link (the tool adds these)
```

Write the first three issues mostly by hand. They teach the agent your voice. Save them in your `Marketing` project as examples.

## Step 3: Set up the weekly draft routine

The draft job can belong to your Marketing Bot from Lesson 3, a Dot, or a scheduled Claude task. The pattern is the same:

```text
Every Thursday at 2:00 PM, draft this week's newsletter.
Inputs: Content Calendar rows published this week (Status = published), the
latest answer page, and my notes in the "Newsletter notes" doc.
Follow the issue template and the three example issues in this project.
Create it as a DRAFT in [newsletter tool]. Send a test email to me only.
Then post in our conversation: subject line, 2 alternative subject lines,
and a list of every fact or link I should check.
Never schedule or send to the list. Never edit the subscriber list or settings.
```

Give the agent a contributor or writer seat that can create drafts but not send, or an API key scoped the same way if the tool offers it. Add an approval rule for any send action in the agent's settings (Grok Bot Ask first rules, Dot Custom Rules) as a second lock.

Your Friday routine is ten minutes: open the test email on your phone, click every link, read it once out loud, fix what's off, then schedule it yourself.

:::try-it
Open your three most recent sent emails to customers or friends. Ask Claude: "Describe my writing voice in five rules, with an example of each, based on these emails." Paste the rules into your newsletter template. That is your voice guide for the agent.
:::

## Step 4: Decide what runs without a weekly click

Some email automations send without you, and that can be fine, as long as you approved the content once and it doesn't change:

| Automation | Runs on its own? | Why it's acceptable |
|---|---|---|
| Welcome sequence (3 emails over a week) | Yes | You write and approve each email once; every subscriber gets the same approved copy |
| RSS-to-email (sends when you publish a blog post) | Yes, if you choose | It only sends articles you already approved and published. beehiiv describes its RSS-to-Send as fully automated once enabled, so preview the format first |
| Weekly newsletter drafted by an agent | No | New copy every week needs your eyes |
| Replies to subscribers | No | Draft only; you send |

The test is simple: new words that haven't been approved never reach a subscriber without your click.

## Step 5: Read the numbers, change one thing

Ask your Marketing Bot to add a newsletter section to its weekly brief: list growth, open rate, click rate, top link, replies and unsubscribes. Treat open rates as a rough signal (privacy features in mail apps inflate them) and clicks and replies as the real ones. Each month, change one thing: subject line style, send day, or the main section's length. Keep a note of what you changed and what happened.

:::checkpoint
Q: Your agent drafted Thursday's newsletter and you haven't reviewed it by Friday's usual send time. What should happen?
- [ ] The agent sends it on schedule so you don't break the streak
- [x] Nothing sends until you review and schedule it yourself
- [ ] The agent sends it to half the list as a test
Why: New copy that leaves the business needs a human click. A late issue costs little; a wrong one sent to your whole list costs trust you can't recall.
:::

:::takeaways
- Autopilot means the assembly runs itself; the send is your click
- Pick a tool where your agent can create drafts without send rights or list access
- CAN-SPAM basics: honest headers and subjects, a postal address, working opt-out honored within 10 business days
- Pre-approved, unchanging automations (welcome sequence, RSS of published posts) can run alone; new copy can't
:::

## Go deeper

- [FTC: CAN-SPAM Act compliance guide for business](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business) - the US rules for commercial email, in plain language
- [beehiiv: RSS-to-Send](https://www.beehiiv.com/features/rss-to-send) - an example of an automation that sends your published posts by email
- [Grok Bot: Skills, routines and automations](https://docs.x.ai/grok-bot/skills-routines-and-automations) - scheduling a weekly draft routine with an approval boundary
