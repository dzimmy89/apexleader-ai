---
module: 1
lesson_number: 5
course: ai-sales
template: v2
---

# Lesson 5: Proposals That Update Themselves

:::key-concept
A proposal is a template plus a few facts: the client's situation, your offer, your price. Keep those facts in one source of truth, let Claude write and pressure-test the words, and let an OpenAI Dot keep a live proposal Page in ChatGPT Space current as the facts change. The moment you send, you freeze a dated copy. Nothing goes to a client without your click.
:::

## What you'll be able to do

- Split your proposal into a reusable template and a short list of live facts
- Use Claude to draft and critique a proposal from your call notes
- Set up an OpenAI Dot to keep a draft proposal Page current from your pricing sheet and CRM
- Freeze, approve and send a version without the risk of it changing after the client sees it

## Why this matters

Founders rewrite every proposal from scratch, then forget to update the old ones when prices or packages change. The result: inconsistent offers, stale numbers, and an evening lost every time a deal gets close. A template with live inputs means the next proposal takes 20 minutes, and every open draft reflects your current pricing.

## Step 1: Separate the template from the facts

Make a Google Sheet called "Offer facts." It's the single source of truth that every proposal reads from:

| Tab | Contents |
|---|---|
| Packages | Package name, what's included, monthly price, setup fee |
| Terms | Payment terms, deposit, cancellation notice, what's out of scope |
| Proof | Short results or testimonials you have permission to use, with the client's approval date |
| Clients | One row per open deal: name, contact, needs from the call, chosen package, proposal status |

Then write a proposal template with placeholders. Ask Claude to help:

```text
I sell monthly bookkeeping to independent dog grooming salons.
Write a one-page proposal template with these sections:
1. What we heard (their situation in their words)
2. What you'll get (the package)
3. Price and terms
4. Why us (one proof point)
5. Next step (sign by date, start date)
Use placeholders in [brackets] that match these columns in my sheet: [Client name], [Contact], [Needs from call], [Package], [Monthly price], [Setup fee], [Payment terms], [Deposit], [Proof point], [Start date].
Plain language, under 450 words, no hype.
```

The rule for proof: only use results and quotes you can document and have permission to share. Claude will happily write "clients save 10 hours a month." Don't let it, unless that's true and you can show it.

## Step 2: Draft and pressure-test with Claude

After a call (Lesson 4), give Claude the notes, the template and the Offer facts row:

```text
Here are my call notes with Dana at Happy Paws Grooming, my proposal template, and their row from my Offer facts sheet.
Fill in the template. Use Dana's own words in "What we heard".
Then, as a skeptical salon owner, list the three biggest reasons Dana might not sign and suggest one sentence I could add to address each. Don't add any claims that aren't in my facts sheet.
```

You get a draft and a short critique. Make the edits you agree with. This is judgment work, and Claude is good at it.

## Step 3: Let a Dot keep drafts current

Here's the "updates itself" part. OpenAI launched Dots and ChatGPT Space on September 29, 2026. As of October 2026:

- **Dots** are always-on agents in ChatGPT, each with its own cloud computer and browser. The first Dot is included with ChatGPT Pro and Business Premium. Dots connect to apps through OpenAI's plugin ecosystem, and you can message them in ChatGPT, Slack or Microsoft Teams.
- **ChatGPT Space** is a shared workspace (replacing the Library for Pro, Business and Enterprise users) that holds Pages, files, presentations and spreadsheets. Pages can stay synced with connected tools, and you can tell ChatGPT or a Dot which sources to check, which parts of a Page to update, and how often.
- **Controls.** You choose which apps a Dot can reach. Custom Rules let you allow an action, require approval, or prohibit it. An Activity View shows what it did in the background.

Create a Page in Space for each open proposal from your template. Then give your Dot the job:

```text
You maintain my draft proposals in Space.
Sources: my Google Sheet "Offer facts" (Packages, Terms, Proof, Clients tabs). Read only.
Each morning:
1. For every Page tagged "Proposal - Draft", check that the package details, price, terms and proof point match the current Offer facts sheet. Update any that don't, and add a dated line at the bottom: "Updated: price changed from X to Y."
2. Never touch Pages tagged "Proposal - Sent".
3. Never share a Page, change sharing settings, or send anything to a client.
4. Post a short summary in this chat: which drafts changed and why.
```

Then set Custom Rules: **prohibit** sharing Pages or sending messages outside the business, and **require approval** for anything else that leaves ChatGPT. If you use Claude for this instead, Cowork can do the same job on Word or Google documents in a connected folder as a scheduled task.

:::warning
Space Pages have their own sharing. OpenAI notes that anything copied onto a Page is visible to everyone who can open it, while sharing a Page doesn't expose your private chats or memory. Keep one Page per client, never paste another client's details into it, and keep internal notes (your margin, your walk-away price) in the facts sheet, not on the Page.
:::

## Step 4: Freeze before you send

A proposal that changes after the client reads it is a problem: they see one price, sign another. So when a draft is ready:

1. Read the whole Page yourself. Check every number against the facts sheet.
2. Export or print it to PDF named `Proposal_HappyPaws_2026-10-23_v1.pdf`.
3. Change the Page tag to "Proposal - Sent" so the Dot stops updating it.
4. Send the PDF (or an e-signature request) from your own email. You click send.
5. Update the Clients tab: status Sent, date sent. Your CRM Keeper (Lesson 3) will pick it up.

If prices change later, the client keeps the price in the version you sent until you decide otherwise. If you want to send an updated version, make a v2 and say what changed in your email.

Signing contracts is yours too. Even agents that can operate e-signature tools are built to ask first: Claude Duet, for example, asks for approval before signing a document. Keep it that way.

## Step 5: Use proposals to improve your offer

Once a month, ask Claude to review your proposals and outcomes:

```text
Here are my last 8 proposals and whether each was Won, Lost or No reply (with the reason if I know it).
What patterns do you see in package choice, price, and the "What we heard" section between won and lost deals?
Suggest one change to my packages and one change to my template. Keep it to 6 bullet points.
```

Update the facts sheet, and the Dot rolls the change into every open draft by morning.

:::try-it
Write your Offer facts "Packages" tab right now with one package: name, three things included, monthly price. That one row is the start of every proposal you'll send.
:::

:::checkpoint
Q: You raise your monthly price in the Offer facts sheet. A proposal you sent last week is still waiting for a signature. What should happen to it?
- [ ] The Dot updates it automatically so it shows the new price
- [x] Nothing: it's tagged Sent and frozen as a PDF; you decide separately whether to honor the old price
- [ ] The Dot emails the client the new price
Why: Sent proposals are frozen so the client signs what they read. Only drafts update automatically, and nothing reaches a client without your click.
:::

:::takeaways
- Proposals are a template plus a facts sheet; keep the facts in one place
- Claude drafts from call notes and plays skeptical buyer before you send
- An OpenAI Dot keeps draft Pages in ChatGPT Space matched to your facts, with Custom Rules blocking sharing and sending
- Freeze a dated PDF before sending; you send and you sign
:::

## Go deeper

- [OpenAI launches Dots and ChatGPT Space (VentureBeat)](https://venturebeat.com/technology/openai-launches-dots-always-on-ai-agent-coworkers-and-chatgpt-space-where-they-can-collaborate-with-human-teams) - plans, Custom Rules, Pages that stay synced
- [OpenAI launches Dots (TechCrunch)](https://techcrunch.com/2026/09/29/openai-launches-dots-its-bubbly-agentic-avatar/) - launch details and availability
- [Claude Cowork overview](https://claude.com/cowork) - the Claude alternative for scheduled document updates
- [Anthropic launches Claude Duet (MacRumors)](https://www.macrumors.com/2026/10/21/anthropic-claude-duet/) - approval before signing or sending
