---
module: 1
lesson_number: 4
course: ai-sales
template: v2
---

# Lesson 4: Call Prep and Follow-Up With Duet

:::key-concept
Claude Duet is Anthropic's proactive agent: it checks your connected apps, sends you a morning brief, and messages you when something needs attention. Use it as your sales assistant around every call. It prepares a one-page brief before, drafts the follow-up and CRM notes after, and asks for your approval before anything is sent.
:::

## What you'll be able to do

- Set up Claude Duet with the apps a sales call depends on
- Get a consistent one-page brief before every sales call
- Turn your call notes into a follow-up email and CRM update within the hour
- Keep approvals, recording consent and privacy in order

## Why this matters

Calls are where deals move, and founders lose deals in the two places around them: walking in unprepared, and following up three days late. Neither takes skill. Both take time you don't have on a busy day. Duet is built to reach out before you ask, which is exactly what a sales assistant should do: "Your 2pm is with Happy Paws Grooming. Here's your brief."

## Meet Claude Duet

Anthropic launched Claude Duet on October 21, 2026, as a research preview. Here's what's confirmed as of this week:

- It's a standalone agent product, available on the web and as a Duet iOS app.
- Access is by waitlist, for Claude Pro and Max subscribers in the United States.
- It sends a short morning brief of important items from your connected apps, and checks those apps every few hours to flag what needs attention.
- It uses the memory, skills and connected apps from your Claude account, so if you've connected Gmail, Google Calendar or HubSpot to Claude, Duet can use them.
- It runs in the cloud on a virtual machine with its own browser, so your computer doesn't need to be on.
- Everything happens in one ongoing thread rather than separate chats.
- It asks for your approval before acting on things like sending a message, making a payment, signing a document, or deleting a file. It doesn't see your passwords when given account access.
- Background checks count toward your Claude plan's usage limits.

Because it's a research preview, features and availability will change quickly. Check Anthropic's current Duet page before you rely on any specific behavior. If you aren't off the waitlist yet, every prompt in this lesson also works in regular Claude with the same connectors, or in Claude Cowork as a scheduled task. You just trigger it yourself.

## Step 1: Connect only what calls need

A sales assistant needs four things: your calendar (who and when), your email (the history), your CRM (stage and notes), and your notes folder. Connect those to your Claude account and nothing more. Skip your bank, your accounting app and personal accounts. If your CRM is the Google Sheet from Lesson 3, connect Google Drive. If it's HubSpot, connect the HubSpot connector.

Then teach Duet the routine in its thread:

```text
You're my sales assistant. Remember this routine.

Before calls: Each morning, look at today's calendar. For any meeting with someone in my CRM Pipeline (or any external attendee from a business), prepare a one-page brief and send it to me at least one hour before the call.

Brief format:
1. Who: name, role, business, how we met, CRM stage.
2. History: every email and meeting with them, newest first, one line each.
3. Their business: three facts from their own website, with links.
4. Likely needs: two guesses based on the above, labeled as guesses.
5. My goal for this call: the next step that would move the deal forward.
6. Three questions to ask.

After calls: When I send you notes from a call, draft (a) a follow-up email and (b) CRM updates. Don't send or update anything until I approve.
```

## Step 2: Read the brief like a pilot's checklist

A good brief takes three minutes to read. Before the call, check:

- **Is the history complete?** If you know you talked at a conference and it's missing, the gap is in your connected data. Note it in the CRM.
- **Are the facts sourced?** Click one link. Agents can mix up businesses with similar names.
- **Is the goal one specific next step?** "Book a 30-minute walkthrough of their books for next week" beats "build rapport."

If the briefs are too long, tell Duet: "Cut briefs to half a page. Drop section 4 unless the CRM has notes." It remembers your preferences.

## Step 3: Capture the call

Take notes in whatever form you like: a few bullets in a doc, a voice memo you transcribe, or a transcript from your meeting tool.

:::warning
Recording laws differ by state and country. Some US states require everyone on the call to consent. The simple rule: always ask "Mind if I record this so I can focus on you instead of taking notes?" and only record if they say yes. Don't paste call content into a tool your client would object to, and leave out sensitive personal details that aren't needed for the follow-up.
:::

Within an hour of the call, send your notes to Duet:

```text
Notes from my call with Dana at Happy Paws Grooming:
- 2 locations, 6 groomers, Dana does books on Sunday nights
- Uses a spreadsheet, accountant complained last April
- Wants monthly P&L, worried about cost
- Next step: I send pricing for monthly package + sample report by Thursday
- She'll loop in her business partner Sam

Draft the follow-up email and the CRM updates.
```

## Step 4: Approve the follow-up and the update

Duet should return two things. Review both:

**The email.** Check that it restates what they said in their words, confirms the next step and date, and promises only what you agreed. Cut any line that sounds like a brochure. Then approve the send, or copy it into your own email.

**The CRM update.** It should propose: Stage moves to "Call booked" or "Proposal sent" as appropriate, a dated note, the next step ("Send pricing and sample report"), and a next step date (Thursday). Approve it, and your CRM Keeper from Lesson 3 will see the change on its next run.

Ask Duet to keep watch:

```text
If I haven't sent Dana the pricing by Thursday noon, remind me. If she hasn't replied 3 business days after I send it, draft a short check-in for me to approve.
```

That's the follow-up habit most founders never build, now running on its own. Every outgoing message still waits for your click.

## Step 5: Learn from your calls

After five or ten calls, ask for a pattern review:

```text
Look at my last 10 call notes and follow-ups in this thread.
What questions do prospects ask most? What objections come up? Which calls led to a proposal and what did they have in common?
Give me 5 bullet points and one change to my call routine.
```

Use what you learn to update the brief format and your proposal template in Lesson 5.

:::try-it
Open your calendar and find your next external meeting. Write the one sentence for "My goal for this call." If you can't write it, that's the first thing to fix, with or without an agent.
:::

:::checkpoint
Q: After a call, Duet drafts a follow-up promising "a free month to get started." You never offered that. What should you do?
- [ ] Approve it, since a free month might help close the deal
- [x] Edit the draft to remove the promise, then approve, and tell Duet to only restate what was agreed
- [ ] Let it send and correct it in your next email
Why: Follow-ups should only confirm what you actually agreed. Fix the draft before approval and correct the preference so it doesn't repeat.
:::

:::takeaways
- Claude Duet (research preview, US Pro and Max, waitlist) is proactive: morning brief, periodic checks, one ongoing thread
- Connect only calendar, email, CRM and notes; it uses your Claude account's connectors and memory
- A one-page brief before every call, and a follow-up plus CRM update within the hour after
- Duet asks before sending messages; you approve every email and record calls only with consent
:::

## Go deeper

- [Anthropic launches Claude Duet (MacRumors)](https://www.macrumors.com/2026/10/21/anthropic-claude-duet/) - availability, features and approval behavior at launch
- [Claude Cowork overview](https://claude.com/cowork) - an alternative for scheduled prep while you wait for Duet access
- [HubSpot connector for Claude](https://ecosystem.hubspot.com/marketplace/listing/hubspot-connector-for-claude) - connect your CRM to your Claude account
