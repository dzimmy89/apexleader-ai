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

## Warm-up

:::checkpoint
Q: A subscriber clicks unsubscribe on Monday. Your newsletter tool processes opt-outs automatically, but your agent also keeps a separate "VIP" list in a spreadsheet. What does CAN-SPAM require?
- [ ] Remove them from the main list only; the VIP sheet is separate
- [x] Honor the opt-out everywhere you send marketing email, within 10 business days
- [ ] Ask them to confirm before removing them
Why: The FTC guide says opt-outs must be honored within 10 business days and you can't require anything beyond the request. A side list doesn't get an exemption.
:::

## Steps

1. **Set up the tool.** Create your publication. Turn on double opt-in. Add your physical mailing address to the footer (a PO box or registered private mailbox works under CAN-SPAM). Confirm the unsubscribe link appears on every email.

2. **Write the signup promise.** One line for your signup form: what readers get and how often. Example for Groomer Books: "One short email every Friday: a money tip for groomers and nothing salesy."

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
