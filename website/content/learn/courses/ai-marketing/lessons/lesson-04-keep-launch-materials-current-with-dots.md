---
module: 1
lesson_number: 4
course: ai-marketing
template: v2
---

# Lesson 4: Keep Launch Materials Current With Dots

:::video
id: mkt-l4-overview
kind: overview
status: paused
src: /learn/video/ai-marketing/mkt-l4-overview.mp4
captions: /learn/video/ai-marketing/mkt-l4-overview.vtt
poster: /learn/video/ai-marketing/mkt-l4-overview.jpg
transcript: Launch materials go stale the week after launch. The price changes, a feature ships, and the FAQ is wrong. This is AI Marketing, lesson four: keep launch materials current with Dots. In this lesson: a launch kit, a source of truth, tight rules, a weekly sweep, and checking the work. An OpenAI Dot is a persistent agent that keeps working after you close the chat. Put every asset that describes your offer in one Launch Kit folder. Then write one short, dated page called Offer Facts. When something changes, you change it there first. Every Monday, the Dot compares every asset against Offer Facts, and returns a table of mismatches with proposed fixes. You approve line by line. It prepares drafts and a pull request. You merge, and you replace the originals. It never sends, publishes or touches prices. First, the launch kit.
:::

:::key-concept
Launch materials go stale the week after launch: the price changes, a feature ships, the FAQ is wrong. An OpenAI Dot can watch one source of truth, spot what changed, and propose updates to every launch asset for your approval, so your site, one-pager and sales emails always say the same thing.
:::

## What you'll be able to do

- Build a launch kit in one place, with a single "source of truth" page the Dot checks
- Set up a Dot with Custom Rules that let it draft edits but never send or publish
- Run a weekly "what changed" sweep that ends in a list of proposed edits you approve
- Use Activity View to see what the Dot did and stop it when needed

## Why this matters

For a one-person company, inconsistency looks like carelessness. A prospect sees $129 on your pricing page, $149 in your one-pager and a feature in your sales email that you removed last month. Each mismatch costs trust, and AI assistants that read your pages repeat the mistakes. Keeping eight documents in sync is boring, exact work. That makes it a good job for an agent, as long as a human approves what goes out.

## What Dots and ChatGPT Space are

OpenAI launched Dots at DevDay on 29 September 2026. A Dot is a persistent agent that keeps working after you close the chat. Each Dot has its own cloud computer and browser, connects to apps through ChatGPT's connectors and plugins, learns your preferences over time, and can run several projects at once. You talk to it in ChatGPT and, if you connect them, in Slack or Microsoft Teams. At launch, the first Dot was included for Pro and Business Premium customers; check [OpenAI's current plans](https://openai.com/chatgpt/pricing) for what you have.

ChatGPT Space launched alongside Dots. It is a shared workspace where you, ChatGPT, Codex and Dots work from the same context. It holds Pages, files, presentations and spreadsheets. Pages can stay synced with connected tools such as Google Drive and Slack, and you can tag a Dot in a Page to ask for help. OpenAI's own launch example fits this lesson exactly: a Dot that learns your audience and brand standards and revises launch materials when the product changes.

The controls you'll use:

- **Connectors** decide which apps a Dot can reach. They share permissions with your ChatGPT connectors, managed from the Connectors tab.
- **Custom Rules** (in Settings) say which actions the Dot may take on its own, which need your approval and which it must never take. You can, for example, tell it never to send email. Custom Rules can't switch off OpenAI's core safety checks.
- **Auto-review** checks consequential actions, like an email's recipient and content, against your rules before they run.
- **Activity View** in the desktop app shows the Dot's tasks, status and steps, and lets you redirect or stop it.
- **Proactive research** (the Dot looking around when you're not active) uses read-only tools: it can't message people or change content through connectors.

## Step 1: Build the launch kit and its source of truth

Make a folder (Google Drive or a ChatGPT Space) called `Launch Kit`. Put in every asset that describes your offer:

| Asset | Where it lives | Who can publish it |
|---|---|---|
| Source of truth | `Offer Facts` page | You |
| Website home and pricing pages | Your site repo | You, via pull request |
| One-pager PDF | Launch Kit folder | You |
| Sales email templates | Launch Kit folder | You |
| FAQ | Site and Launch Kit | You |
| Press or partner blurb (50 and 150 words) | Launch Kit folder | You |

The **Offer Facts** page is a short, dated list: product name, who it's for, price and plans, what's included, what's not, guarantees, the three main features, launch date, and links. When something changes, you change it here first. Everything else follows.

:::infographic
id: fig-1
type: diagram
title: One source of truth
shows: The Offer Facts page as a paper card on the left, dated. Arrows run to five assets on the right: pricing and home pages, one-pager, sales emails, FAQ, partner blurb. Caption: change it here first.
data: none
image: /learn/figures/ai-marketing/lesson-04-fig-1.webp
alt: One dated Offer Facts page is the source of truth. Your pricing and home pages, one-pager, sales emails, FAQ and partner blurb all follow it. When something changes, you change Offer Facts first.
:::

## Step 2: Set up the Dot with tight rules

Name your Dot something obvious, like `Launch Dot`. Connect only the Launch Kit folder and, if your site lives on GitHub, the site repository with permission to open pull requests. Then write its Custom Rules and job:

```text
Job: keep our launch materials consistent with the Offer Facts page.

Every Monday morning, compare every asset in the Launch Kit folder and our live
pricing and home pages against Offer Facts. For each mismatch, list:
asset | exact current text | proposed new text | which Offer Facts line it comes from.

You may: read the Launch Kit, read our website, create draft copies of documents
with your changes marked, open a pull request on the website repo for me to review.
You must ask me before: editing any original document.
You must never: send email or messages to anyone but me, publish, merge, change
prices in any billing or checkout tool, or delete files.
If Offer Facts itself looks wrong or out of date, stop and ask me.
```

Mirror the "must never" lines in Custom Rules so they're enforced by the product, not just written in a prompt. The rule "never send email" is one OpenAI uses as its own example.

:::warning
The Dot can reach whatever its connectors reach. Don't connect your whole Drive, your billing system or your checkout. Price changes in Stripe or any payment tool are a human-only job. If a site login is needed, enter it in the secure login form, never in chat; OpenAI says that protection doesn't cover passwords typed into a conversation or a document.
:::

:::video
id: mkt-l4-rules
kind: inline
status: paused
src: /learn/video/ai-marketing/mkt-l4-rules.mp4
captions: /learn/video/ai-marketing/mkt-l4-rules.vtt
poster: /learn/video/ai-marketing/mkt-l4-rules.jpg
transcript: A Dot can reach whatever its connectors reach. So connect less than you think. Connect only the Launch Kit folder, and your site repository with permission to open pull requests. Nothing else: not your whole Drive, not your billing system, not your checkout. Then write the job in three tiers. It may read the kit and your website, create marked-up draft copies, and open a pull request for you to review. It must ask you before editing any original document. And it must never send email or messages to anyone but you, publish, merge, change prices in any billing tool, or delete files. Mirror those must-never lines in Custom Rules, so the product enforces them, not just the prompt. If Offer Facts itself looks wrong, the Dot stops and asks. And if a site needs a login, use the secure form, never the chat. Next: the weekly sweep.
:::

## Step 3: Run the weekly sweep

The sweep produces a change list. You review it in five minutes, approve or reject each line, and the Dot prepares drafts. The flow:

1. You update Offer Facts (for example, a new annual plan).
2. On Monday the Dot compares every asset and returns a table of mismatches.
3. You reply line by line: "approve 1, 2, 4. Reject 3. For 5, use 'per month, billed yearly'."
4. The Dot creates marked-up draft copies and opens one pull request for the website.
5. You read the pull request preview, merge it yourself, and replace the originals.

:::infographic
id: fig-2
type: flow
title: The weekly sweep
shows: Five numbered steps: 1 you update Offer Facts, 2 the Dot compares every asset, 3 you approve line by line (highlighted), 4 the Dot drafts copies and a pull request, 5 you merge and replace the originals.
data: none
image: /learn/figures/ai-marketing/lesson-04-fig-2.webp
alt: The weekly sweep: you update Offer Facts, the Dot compares every asset and lists mismatches, you approve line by line, the Dot prepares marked-up drafts and a pull request, and you merge and replace the originals yourself.
:::

Ask for the review in a fixed shape so it stays fast:

```text
Show this week's launch-kit sweep as a table, most important first. Mark anything
that changes a price, a guarantee or a legal claim as HIGH. Don't group changes.
Then wait for my line-by-line approval.
```

:::video
id: mkt-l4-sweep
kind: inline
status: paused
src: /learn/video/ai-marketing/mkt-l4-sweep.mp4
captions: /learn/video/ai-marketing/mkt-l4-sweep.vtt
poster: /learn/video/ai-marketing/mkt-l4-sweep.jpg
transcript: The sweep turns a week of drift into a five-minute review. Here's the loop. One: you update Offer Facts, say, with a new annual plan. Two: on Monday, the Dot compares every asset and returns a table: the asset, the exact current text, the proposed text, and the Offer Facts line it comes from. Anything that changes a price, a guarantee or a legal claim is marked high. Three: you reply line by line. Approve one, two and four. Reject three. Rewrite five. Four: the Dot creates marked-up draft copies, and opens one pull request for the website. Five: you read the preview, merge it yourself, and replace the originals. For the first month, open Activity View every week. Confirm the Dot only touched the kit and the repo, and spot-check two of its quotes against the real assets. Approving one draft gives it no ongoing permission. In the exercise, you'll run your first sweep.
:::

## Step 4: Check its work

Open Activity View weekly for the first month. Confirm the Dot only touched the Launch Kit and the repo. Spot-check two of its "current text" quotes against the live asset; if it misquoted, tell it, and add a line to its job. OpenAI says plainly that Dots can still make mistakes and that you should review consequential work. Approving one draft doesn't give it ongoing permission to do more.

:::try-it
Write your Offer Facts page now: ten lines, dated today. Then open your homepage and one other asset and look for any line that disagrees. Most founders find at least one.
:::

:::checkpoint
Q: You raised your price. The Dot's sweep finds the old price on your pricing page, your one-pager and in your Stripe checkout. What should the Dot do about Stripe?
- [ ] Update the Stripe price, since the change is approved in Offer Facts
- [x] Flag it for you; changing prices in a payment tool is a human-only job
- [ ] Ignore it, since Stripe isn't a launch asset
Why: Anything that changes money needs a human click, and agents never touch billing. The Dot's job is to find the mismatch and tell you.
:::

:::takeaways
- One dated Offer Facts page is the source of truth; every asset follows it
- A Dot's Custom Rules should enforce "draft and propose, never send or publish"
- The weekly sweep ends in a change list you approve line by line
- Activity View and spot-checks keep the Dot honest; billing stays human-only
:::

## Go deeper

- [VentureBeat: OpenAI launches Dots and ChatGPT Space](https://venturebeat.com/technology/openai-launches-dots-always-on-ai-agent-coworkers-and-chatgpt-space-where-they-can-collaborate-with-human-teams) - what Dots and Space do, including the launch-materials example
- [TechCrunch: OpenAI launches Dots](https://techcrunch.com/2026/09/29/openai-launches-dots-its-bubbly-agentic-avatar/) - launch date, availability and how to start with a primary dot
- [OpenAI Help: Dots privacy, security and safety FAQs](https://help.openai.com/en/articles/20001529-dots-privacy-security-and-safety-faqs) - Custom Rules, Activity View, approvals and credentials
