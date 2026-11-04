---
module: 1
lesson_number: 2
course: ai-sales
template: v2
---

# Lesson 2: Hire a Sales Bot

:::video
id: sales-l2-overview
kind: overview
status: paused
src: /learn/video/ai-sales/sales-l2-overview.mp4
captions: /learn/video/ai-sales/sales-l2-overview.vtt
poster: /learn/video/ai-sales/sales-l2-overview.jpg
transcript: Twenty thoughtful first emails take a whole afternoon. A Sales Bot does the research and the first draft, and you spend fifteen minutes reviewing. This is AI Sales, lesson two: hire a Sales Bot. In this lesson: one written job, locked-down access, email that lands, the law and the platforms, and reviewing like an editor. The Bot's job is narrow. Each weekday, it takes the next five top-scored leads, confirms each contact email is published on the business's own site, and drafts a short, personal first email into a sheet. Then it stops. It never sends, and it never touches LinkedIn. You review each draft, and you click send, from a domain set up so your email lands in the inbox. Every message carries your real name, a postal address and an easy way to opt out. First, the job description.
:::

:::key-concept
A Sales Bot is a persistent agent with one job: research the next prospects on your list, draft a personal first message for each, and put the drafts in front of you. It never sends on its own. You click send, from a domain that is set up to land in inboxes, inside the rules of CAN-SPAM and each platform's terms.
:::

## What you'll be able to do

- Set up a dedicated Sales Bot in Grok Bot with a written job description
- Configure approval rules so nothing reaches a prospect without your click
- Check the email basics (SPF, DKIM, DMARC, volume) that decide whether you land in the inbox
- Apply CAN-SPAM and LinkedIn's rules to every message your Bot drafts

## Why this matters

Outreach is the job most founders put off, because writing 20 thoughtful first emails takes a whole afternoon. A Sales Bot does the research and the first draft. You spend 15 minutes reviewing instead of three hours writing. But outreach is also the place where an agent can do the most damage fastest: one bad batch of emails can get your domain flagged as spam or break a law. So you hire the Bot with a short leash.

## Meet Grok Bot

Grok Bot is SpaceXAI's agent product, in beta since August 11, 2026. Each Bot runs on a cloud computer, can sign in to websites and operate them like a person, keeps working when your laptop is closed, and can run saved routines. You can create several Bots, each with its own role. SpaceXAI's own examples include a "Sales Outbound" Bot and an "Expense Manager" Bot (you'll meet the second one in the AI Accounting course).

As of October 2026, access comes with SuperGrok subscriptions and with Cursor plans from Premium up. Plan access has changed several times since launch, so check the [Grok Bot get-started page](https://cursor.com/docs/grok-bot/get-started) for current access before you buy. If you use a different agent (OpenAI Dots, Claude Duet or Cowork), the same job description and approval rules apply.

## Step 1: Give the Bot one job, in writing

Grok Bot's docs recommend one focused job per Bot, stated in the first message, with a clear point where it stops and waits for you. Create a new Bot (the **+** button in the sidebar), name it "Sales Bot," and open with its job description:

```text
You are my Sales Bot. Your one job: turn my lead list into ready-to-review first emails.

Each weekday morning:
1. Open the Google Sheet "Lead list". Take the next 5 rows where Status is "New" and Score is 4 or 5.
2. For each, visit the business's own website and confirm the contact email is published there. If not, set Status to "Needs contact" and skip it.
3. Draft a first email of under 120 words in the "Outreach queue" sheet: one specific detail from their site, one sentence on what I do, one low-effort question. No attachments, no links except my site.
4. Include my business name, postal address and the line "Not interested? Reply 'no thanks' and I won't email again." at the bottom.
5. Set Status to "Drafted" and stop. Never send anything. Never contact anyone on LinkedIn.

Remember these rules for every future task. Ask me if anything is unclear.
```

Keep your voice notes in that first message too: "short sentences, no exclamation marks, never claim results we haven't delivered."

:::infographic
id: fig-1
type: flow
title: The Sales Bot's daily loop
shows: Five steps left to right: take 5 New leads scored 4 or 5; confirm the email on their own site; draft under 120 words with footer; set Drafted and stop (highlighted); you review and send.
data: none
image: /learn/figures/ai-sales/lesson-02-fig-1.webp
alt: Each weekday the Sales Bot takes five new leads scored 4 or 5, confirms each email on the business's own site, drafts a first email under 120 words with your footer, sets the row to Drafted and stops. You review and send.
:::

## Step 2: Lock down access and approvals

This is where a Sales Bot is safe or not.

**Its own login.** Create a separate Google account for the Bot (for example a second user in your Google Workspace) and share only the two sheets it needs. When the Bot reaches a login screen, Grok Bot's docs say to click **Open computer** (or **Take over**) and type the password or two-factor code yourself. Never paste passwords into the chat.

**Approval rules.** Grok Bot's Auto Review checks actions before they run. In **Settings → General → Auto-review**, add an **Ask first** rule for sending any external email or message. Ask-first rules beat allow rules when both match. When an approval card appears, check the target and content, then choose **Allow once** or **Deny**. Don't click **Always allow** for anything that sends.

**Know the limits.** The docs warn that all your Bots share one cloud computer, so files and signed-in browser sessions are visible across them. Separate Bots are not a security boundary. Don't sign the Sales Bot's computer in to your bank or accounting app.

:::warning
The safest setup is that the Bot cannot send at all. It drafts into a sheet, and you copy approved drafts into your own email. If you later let it send from a dedicated mailbox, keep the Ask first rule on every send. Approval controls the action before it runs. It cannot unsend an email.
:::

:::video
id: sales-l2-access
kind: inline
status: paused
src: /learn/video/ai-sales/sales-l2-access.mp4
captions: /learn/video/ai-sales/sales-l2-access.vtt
poster: /learn/video/ai-sales/sales-l2-access.jpg
transcript: This is where a Sales Bot is safe, or not. Start with its own login: a separate Google account, with only the two sheets it needs shared to it. When it reaches a sign-in page, take over and type the password yourself. Then add an approval rule. In Auto-review, set Ask first for sending any external email or message. Ask first beats allow rules, so nothing slips through. And know the limit: all your Bots share one cloud computer, including signed-in browser sessions. Separate Bots are not a security boundary, so never sign that computer in to your bank. The safest setup of all is a Bot that can't send. It drafts into a sheet, and you copy approved drafts into your own email. If you ever let it send, keep Ask first on every message. And if an approval card asks to send twelve at once, deny it. Approve only what you've read. Next: making sure your email lands.
:::

## Step 3: Make sure your email lands

Even perfect drafts fail if your domain looks like a spammer. Check these with whoever set up your email (or ask Claude to walk you through your domain host's settings):

| Basic | What it does | What to do |
|---|---|---|
| SPF | Lists which servers may send mail for your domain | One SPF record that includes your email provider |
| DKIM | Signs each message so receivers can verify it | Turn it on in Google Workspace or Microsoft 365 admin |
| DMARC | Tells receivers what to do when checks fail | Start with a `p=none` policy, tighten later |
| Volume | Sudden spikes look like spam | Start at 5 to 10 new emails a day and grow slowly |
| Bounces | Bad addresses hurt your reputation | Only use addresses you traced to a source (Lesson 1) |
| Complaints | People marking you as spam | Google's sender guidelines ask bulk senders to stay under a 0.3% spam rate; aim for near zero |

Google and Yahoo's strictest rules (including one-click unsubscribe headers) apply to senders of 5,000 or more messages a day to personal accounts. A solo founder sending 10 personal emails a day is far below that, but the same habits keep you out of the spam folder.

:::infographic
id: fig-2
type: comparison
title: Six email basics
shows: Six cards in a grid: SPF (who may send), DKIM (signs each message), DMARC (start at p=none), Volume (5 to 10 a day, grow slowly), Bounces (sourced addresses only), Complaints (stay near zero, under 0.3%).
data: none
image: /learn/figures/ai-sales/lesson-02-fig-2.webp
alt: Six basics decide whether your email lands: SPF lists who may send for your domain, DKIM signs each message, DMARC starts at p=none, volume starts at 5 to 10 new emails a day, bounces stay low by using sourced addresses, and spam complaints stay near zero, well under 0.3%.
:::

## Step 4: Follow the law and the platforms

**CAN-SPAM (US).** The FTC's guide is clear that the law covers business-to-business email too. For every commercial email:

- Honest From, Reply-To and subject line
- Identify it as an ad or offer (a plain, honest pitch does this)
- Include a valid postal address
- Tell people how to opt out, and honor it within 10 business days
- You stay responsible even if a tool or agent sends for you

Each violating email can cost up to $53,088, per the FTC guide. Keep a "Do not contact" tab in your lead sheet, and tell the Bot to check it before drafting. If you email people in Canada, the EU or the UK, rules are stricter (often requiring consent first), so check with a lawyer before you do.

**LinkedIn.** LinkedIn's terms prohibit bots and automation that act on the site for you, including scraping and automated messages or connection requests. Accounts get restricted for it. Keep your Sales Bot off LinkedIn. If you later decide the time saved is worth that risk, Lesson 7 shows how to run LinkedIn steps in Origami's Sequencer with one real profile, a low daily cap and approval on.

:::video
id: sales-l2-law
kind: inline
status: paused
src: /learn/video/ai-sales/sales-l2-law.mp4
captions: /learn/video/ai-sales/sales-l2-law.vtt
poster: /learn/video/ai-sales/sales-l2-law.jpg
transcript: Every message your Bot drafts has to follow the law, and the platforms. In the US, the CAN-SPAM Act covers business-to-business email too. Every commercial email needs an honest From line and subject, a plain, honest pitch, a valid postal address, and a clear way to opt out, honored within ten business days. You stay responsible even when an agent writes or sends for you, and each violating email can cost up to fifty-three thousand dollars. So keep a do-not-contact tab, and tell the Bot to check it before every draft. Outside the US, rules are stricter, so check before you email people in Canada, the EU or the UK. Then LinkedIn. Its terms ban bots and automation that act on the site for you, including automated messages and connection requests. Accounts get restricted for it. So your Sales Bot stays off LinkedIn entirely. In the exercise, you'll approve your first five drafts.
:::

## Step 5: Review drafts like an editor

Each morning, open the Outreach queue and give each draft 60 seconds:

1. Is the specific detail true? Click the source.
2. Would I send this if I'd written it myself?
3. Is the ask small and clear?
4. Are the address and opt-out line there?

Mark each draft Approved, Edit, or Reject, with a few words on why. Then tell the Bot: "Read my notes in the Outreach queue and remember what I changed." Grok Bot is designed to learn preferences like your writing voice. Corrections are how it gets better.

:::try-it
Write the first three lines of your Sales Bot's job description: its one job, where it gets leads, and where it must stop. If you can't say where it stops, it isn't ready to hire.
:::

:::checkpoint
Q: An approval card from your Sales Bot shows it wants to send 12 emails at once. You've reviewed three. What should you do?
- [ ] Click Always allow so future batches go faster
- [ ] Allow once, since the first three looked fine
- [x] Deny, and ask the Bot to put all 12 drafts in the queue so you can review each one
Why: Approval covers the whole action and can't be undone after sending. Only approve what you have actually read.
:::

:::takeaways
- One Bot, one written job, one clear stopping point: drafted, never sent
- Its own Google account, passwords typed by you, an Ask first rule on every send
- SPF, DKIM, DMARC and slow volume decide whether your emails land
- CAN-SPAM covers B2B email: honest headers, postal address, working opt-out; no LinkedIn automation
:::

## Go deeper

- [Get started with Grok Bot](https://cursor.com/docs/grok-bot/get-started) - creating a Bot, giving it a role, signing in safely
- [Grok Bot approvals, security and privacy](https://docs.x.ai/grok-bot/approvals-security-and-privacy) - Auto Review, Ask first rules and the shared computer warning
- [CAN-SPAM Act: A Compliance Guide for Business](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business) - the FTC's seven requirements
- [Google email sender guidelines](https://support.google.com/mail/answer/81126) - authentication and spam-rate rules
- [SpaceXAI's Grok Bot (VentureBeat)](https://venturebeat.com/orchestration/spacexais-grok-bot-turns-agents-into-persistent-digital-coworkers-that-can-operate-your-apps-for-120-per-month) - launch coverage, roles and access
