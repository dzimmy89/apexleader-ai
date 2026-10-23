---
module: 1
lesson_number: 5
course: ai-sales
template: v2
---

# Exercise 5: Build a Proposal System and Send Version One

:::key-concept
You'll create an Offer facts sheet, a one-page proposal template, and a first proposal drafted by Claude. Then you'll set up an OpenAI Dot (or Cowork) to keep drafts current, and freeze a dated PDF ready to send.
:::

**Time:** 35 minutes · **You'll need:** Claude, ChatGPT with a Dot (Pro or Business Premium) or Claude Cowork, your Pipeline and call notes from Exercise 4 · **Builds on:** Lesson 5

## Warm-up

:::checkpoint
Q: Where should your walk-away price and margin notes live?
- [ ] In the proposal Page, hidden at the bottom
- [x] In your private Offer facts sheet, never on the client's Page
- [ ] In the email you send with the proposal
Why: Anything on a shared Page is visible to everyone who can open it. Internal numbers stay in your private source of truth.
:::

## Steps

1. **Create "Offer facts."** A Google Sheet with four tabs: Packages, Terms, Proof, Clients. Fill in at least two packages (sample business: "Monthly Books" and "Monthly Books + Payroll Prep"), your payment terms, one proof point you can document (or "None yet"), and a Clients row for the prospect from Exercise 4.

2. **Generate the template.** Run the template prompt from Lesson 5 in Claude. Save it as "Proposal template" with placeholders that match your sheet's columns exactly.

3. **Draft the first proposal.** Give Claude your call notes, the template and the client's row. Use the "skeptical salon owner" prompt from Lesson 5. Apply the edits you agree with.

4. **Check every claim.** Highlight every number and every result statement. Confirm each one is in your Offer facts sheet. Delete anything that isn't.

5. **Set up the updater.** Choose one:
   - **OpenAI Dot:** create a Page in ChatGPT Space for this proposal, tag it "Proposal - Draft," and give your Dot the job from Lesson 5. In Custom Rules, prohibit sharing Pages and sending messages outside the business.
   - **Claude Cowork:** put the draft in a connected folder named "Proposals/Drafts," and schedule a daily task that checks drafts against the Offer facts sheet and logs any changes. Tell it never to touch "Proposals/Sent."

6. **Test the update.** Change one package price in Offer facts by a dollar. Run the updater once. Confirm the draft changed and logged the change. Change the price back and run it again.

7. **Freeze version one.** Export the proposal as `Proposal_<Client>_<YYYY-MM-DD>_v1.pdf`. Move or retag the original as Sent so it stops updating.

8. **Send (if it's a real deal).** Send the PDF from your own email with a three-line note. Update the Clients tab and your Pipeline: stage "Proposal sent," next step "Follow up," date in three business days.

## Done when

- [ ] Offer facts has Packages, Terms, Proof and Clients tabs filled in
- [ ] Every number and claim in the proposal traces to the facts sheet
- [ ] The updater changed a draft when you changed a price, and logged it
- [ ] A dated v1 PDF exists, and the original is tagged or filed as Sent
- [ ] Rules block the agent from sharing or sending anything to clients

:::coached
**For 1-on-1 coaching clients.** Build a proposal you can price with confidence.

1. Add a "Good, Better, Best" option set to your Packages tab with clear differences.
2. Draft proposals for two real prospects and send at least one.
3. Write down what you'd change about price after seeing their reactions.

**Bring to your session:** your Offer facts sheet, both proposals, and any client responses.

**Your coach will:**
- Review your packaging and pricing logic line by line
- Check your proof points for accuracy and permission
- Help you plan the follow-up for each open proposal
:::
