---
module: 1
lesson_number: 5
course: ai-marketing
template: v2
---

# Exercise 5: Launch a Newsletter Your Agent Drafts and You Send

:::key-concept
You'll set up a newsletter with the legal basics, a welcome sequence and an issue template, then run the weekly draft routine once. At the end you'll have issue one sitting as a draft with a test email in your inbox, waiting for your click.
:::

**Time:** 35 minutes · **You'll need:** a newsletter tool account (beehiiv, Kit, Mailchimp, Buttondown or similar), your Marketing project, your Marketing Bot or another agent from Exercise 3 · **Builds on:** Lesson 5

:::video
id: mkt-ex5-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-marketing/mkt-ex5-setup.mp4
captions: /learn/video/ai-marketing/mkt-ex5-setup.vtt
poster: /learn/video/ai-marketing/mkt-ex5-setup.jpg
transcript: One tool, three welcome emails, and a first issue that lands in your inbox only. Let's launch your newsletter. In this exercise you'll set it up so the agent drafts and you send. Create your publication, and turn on double opt-in. Add your postal address, and confirm the unsubscribe link. Write a one-line signup promise: what readers get, and how often. Ask Claude for a three-email welcome sequence, edit each one, and set it running. That copy is approved once, so it can run on its own. Save the issue template and your voice rules. Give the agent a writer seat that can't send or see subscribers. Then run the draft job once, and review the test like a reader: on your phone, every link, out loud. Schedule it yourself, and make the job weekly. So: is there any path for unapproved words to reach your list? Pause here and set it up.
:::

## Warm-up

:::checkpoint
Q: A subscriber clicks unsubscribe on Monday. Your newsletter tool processes opt-outs automatically, but your agent also keeps a separate "VIP" list in a spreadsheet. What does CAN-SPAM require?
- [ ] Remove them from the main list only; the VIP sheet is separate
- [x] Honor the opt-out everywhere you send marketing email, within 10 business days
- [ ] Ask them to confirm before removing them
Why: The FTC guide says opt-outs must be honored within 10 business days and you can't require anything beyond the request. A side list doesn't get an exemption.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to a newsletter you send
shows: Seven numbered steps: 1 tool and legal basics, 2 signup promise, 3 welcome sequence, 4 issue template, 5 draft-only seat (highlighted), 6 run the draft job, 7 review, schedule, make it weekly.
data: none
image: /learn/figures/ai-marketing/exercise-05-fig-1.webp
alt: Seven steps: set up the tool with double opt-in, an address and unsubscribe; write the signup promise; set up a welcome sequence; save the issue template; give the agent a draft-only seat; run the draft job once; and review, schedule it yourself and make it weekly.
:::

1. **Set up the tool.** Create your publication. Turn on double opt-in. Add your physical mailing address to the footer (a PO box or registered private mailbox works under CAN-SPAM). Confirm the unsubscribe link appears on every email.

2. **Write the signup promise.** One line for your signup form: what readers get and how often. Example for Rolling Ledger: "One short email every Friday: a money tip for food truck owners and nothing salesy."

3. **Write the welcome sequence.** Ask Claude:

   ```text
   Using my brand voice and offer, draft a 3-email welcome sequence for new
   subscribers: email 1 (immediately) thanks them and delivers one useful tip,
   email 2 (day 3) tells my founder story in 150 words, email 3 (day 7) shares
   our best answer page and a soft offer. Under 200 words each. No hype words.
   ```

   Edit each email, then set it up as an automation in your tool. You've approved this copy once; it can run on its own.

4. **Save the issue template.** Add the template from Lesson 5 to your `Marketing` project, plus your voice rules. Write issue one's opening paragraph yourself.

5. **Give the agent a draft-only seat.** Invite your Marketing Bot's email as a writer or contributor (a role that can't send or see subscribers), or create an API key limited to drafts if your tool supports it. Add an approval rule for sending in the agent's own settings.

6. **Run the draft job once.** Ask the agent:

   ```text
   Draft this week's newsletter now using the issue template, my opening
   paragraph, and this week's published calendar rows. Create it as a draft in
   [tool] and send a test to me only. Then list every fact and link I should check,
   plus 2 alternative subject lines. Do not schedule or send to the list.
   ```

7. **Review like a reader.** Open the test on your phone. Click every link. Read it out loud. Fix anything off. Schedule it yourself, or leave it as a draft if you aren't ready to launch.

8. **Make it weekly.** Ask the agent to save the job as a skill and add a Thursday routine. Add a newsletter section to its Monday brief.

## Done when

- [ ] Double opt-in, a postal address and a working unsubscribe link are set
- [ ] A three-email welcome sequence you edited is live
- [ ] Issue one exists as a draft and a test email reached you
- [ ] The agent's seat can create drafts but cannot send or view the subscriber list

:::example
title: See an example result
Here is the newsletter setup for the sample business, Rolling Ledger, after the first draft run.

:::video
id: mkt-ex5-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-marketing/mkt-ex5-reveal.mp4
captions: /learn/video/ai-marketing/mkt-ex5-reveal.vtt
poster: /learn/video/ai-marketing/mkt-ex5-reveal.jpg
transcript: For Rolling Ledger, the newsletter is live, and the agent has never sent a thing. Here's the example. The tool is beehiiv, with double opt-in on, a PO box in the footer, and the unsubscribe link checked. The signup promise: one short email every Friday, a money tip for food truck owners, and nothing salesy. The welcome sequence has three emails: a tip on day zero, the founder story on day three, and the best answer page on day seven. The founder edited all three, then turned the sequence on. Issue one's draft came from that week's three LinkedIn posts and the new answer page. The test email reached the founder only. She clicked seven links and found one broken, the answer page address, and fixed it. She checked two facts, then scheduled the issue herself for Friday at seven. The agent's writer seat can't send, and can't see the list.
:::

:::infographic
id: fig-2
type: comparison
title: Rolling Ledger newsletter, issue one
shows: Under "Rolling Ledger newsletter" tagged example: a welcome sequence of 3 emails (day 0, 3, 7, live), and issue one: test sent to the founder only, 7 links checked, 1 fixed, scheduled by the founder for Friday 7:00 AM. Footer: the agent cannot send or see the list.
data: example numbers: 3 welcome emails; 7 links checked; 1 fixed
image: /learn/figures/ai-marketing/exercise-05-fig-2.webp
alt: Example Rolling Ledger newsletter: a three-email welcome sequence on days 0, 3 and 7 is live. Issue one went as a test to the founder only, she checked 7 links and fixed 1, then scheduled it herself for Friday at 7:00 AM. The agent cannot send or see the subscriber list.
:::

**Tool:** beehiiv. Double opt-in on, a PO box in the footer, unsubscribe link confirmed on a test.

**Signup promise:** "One short email every Friday: a money tip for food truck owners and nothing salesy."

| Welcome email | When | What it does | Words |
|---|---|---|---|
| 1 | Right away | Thanks them, one tip: photograph fuel receipts the day you pay | 170 |
| 2 | Day 3 | The founder's story: 9 years, 40 trucks, why she started | 150 |
| 3 | Day 7 | The best answer page, plus a soft offer | 180 |

```text
ISSUE ONE (draft by the agent, test to the founder only)
Subject: The receipt that costs trucks the most
Alternatives: "Fuel, commissary and the shoebox" / "One habit for a calmer April"
Opening: written by the founder
Main idea: from this week's answer page, with link
Quick wins: from Monday, Wednesday and Friday's LinkedIn posts
Check list from the agent: 7 links, 2 facts (the IRS mileage page date, the app price)
Founder's review: 1 broken link (answer page address) fixed; both facts confirmed;
scheduled by the founder, Friday 7:00 AM
Agent seat: Contributor (can create drafts; cannot send or view subscribers)
Routine: Thursdays 2:00 PM, newsletter section added to the Monday brief
```
:::

:::coached
**For 1-on-1 coaching clients.** Build the newsletter into your sales engine:

1. Add a lead magnet (a checklist or template from one of your answer pages) to your signup form, drafted with Claude and checked by you.
2. Add a fourth welcome email that invites a reply or a short call, and route replies to your sales inbox.
3. Send two issues, then pull the numbers: signups, clicks, replies, unsubscribes.

**Bring to your session:** your lead magnet, the welcome sequence, both issues and their numbers.

**Your coach will:**
- Rewrite your best and worst subject lines with you and explain the difference
- Check your signup promise against what you actually send
- Help you pick the one change to test next month
:::
