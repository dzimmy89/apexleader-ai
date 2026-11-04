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

:::video
id: sales-ex5-setup
kind: exercise-setup
status: paused
src: /learn/video/ai-sales/sales-ex5-setup.mp4
captions: /learn/video/ai-sales/sales-ex5-setup.vtt
poster: /learn/video/ai-sales/sales-ex5-setup.jpg
transcript: One facts sheet, one template, and a version one that never changes. Let's build your proposal system. In this exercise you'll draft, test and freeze your first proposal. Create Offer facts with four tabs: packages, terms, proof and clients, and fill in at least two packages. Generate a template with placeholders that match your columns. Draft the first proposal from your call notes, and run the skeptical buyer critique. Then highlight every number and every result. If it isn't in your facts sheet, delete it. Set up the updater, a Dot or a scheduled task, with rules that block sharing and sending. Test it: change one price by a dollar, run the updater, and confirm the draft changed and logged it. Then change it back. Freeze version one as a dated PDF, tag the original as sent, and send it yourself. So: can anything in the PDF change now? Pause here and build it.
:::

## Warm-up

:::checkpoint
Q: Where should your walk-away price and margin notes live?
- [ ] In the proposal Page, hidden at the bottom
- [x] In your private Offer facts sheet, never on the client's Page
- [ ] In the email you send with the proposal
Why: Anything on a shared Page is visible to everyone who can open it. Internal numbers stay in your private source of truth.
:::

## Steps

:::infographic
id: fig-1
type: flow
title: Seven steps to proposal version one
shows: Seven numbered steps: 1 Offer facts, 2 Template, 3 Draft and critique, 4 Check every claim (highlighted), 5 Updater, 6 Test the update, 7 Freeze v1.
data: none
image: /learn/figures/ai-sales/exercise-05-fig-1.webp
alt: Seven steps. 1. Offer facts: 4 tabs, 2 packages. 2. Template: placeholders match columns. 3. Draft and critique: skeptical buyer. 4. Check every claim: not in the sheet? Cut. 5. Updater: no sharing or sending. 6. Test the update: change a price by $1. 7. Freeze v1: dated PDF, you send.
:::

1. **Create "Offer facts."** A Google Sheet with four tabs: Packages, Terms, Proof, Clients. Fill in at least two packages (sample business: "Monthly Books" and "Monthly Books + Payroll Prep"), your payment terms, one proof point you can document (or "None yet"), and a Clients row for the prospect from Exercise 4.

2. **Generate the template.** Run the template prompt from Lesson 5 in Claude. Save it as "Proposal template" with placeholders that match your sheet's columns exactly.

3. **Draft the first proposal.** Give Claude your call notes, the template and the client's row. Use the "skeptical truck owner" prompt from Lesson 5. Apply the edits you agree with.

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

:::example
title: See an example result
Here is the proposal system for the sample business, Rolling Ledger, and version one for Smoke and Salt Tacos.

:::video
id: sales-ex5-reveal
kind: exercise-reveal
status: paused
src: /learn/video/ai-sales/sales-ex5-reveal.mp4
captions: /learn/video/ai-sales/sales-ex5-reveal.vtt
poster: /learn/video/ai-sales/sales-ex5-reveal.jpg
transcript: For Rolling Ledger, version one went to Dana with every number traced to the facts sheet. Here's the example. Offer facts has two packages. Monthly Books is one hundred forty-nine dollars a month, with no setup fee. Monthly Books plus Payroll Prep is two hundred twenty-nine dollars a month, with a ninety-nine dollar setup fee. Smoke and Salt Tacos chose the first, for two trucks. Claude's draft quoted Dana's own words about Sunday nights. Its critique raised three objections: cost, switching effort, and her business partner Sam. The founder added one sentence for each. Highlighting found nine numbers. Eight traced to the sheet. One, saves ten hours a month, didn't, so it was deleted. The Dot test changed one price by a dollar. The draft updated and logged it, and the price went back. Version one is a dated PDF, the page is tagged sent, and the founder emailed it herself.
:::

:::infographic
id: fig-2
type: comparison
title: Rolling Ledger proposal v1
shows: Under "Rolling Ledger proposal" tagged example: two package cards (Monthly Books $149 a month; + Payroll Prep $229 a month, $99 setup). Beside them: 9 numbers checked, 8 traced, 1 cut (highlighted). Footer: v1 PDF, tagged Sent, emailed by the founder.
data: example numbers: $149, $229, $99; 9 numbers, 8 traced, 1 cut
image: /learn/figures/ai-sales/exercise-05-fig-2.webp
alt: Example proposal system for Rolling Ledger: two packages, Monthly Books at $149 a month and Monthly Books plus Payroll Prep at $229 a month with a $99 setup fee. In version one, 9 numbers were checked, 8 traced to the facts sheet and 1 was cut. The v1 PDF was tagged Sent and emailed by the founder.
:::

| Offer facts tab | Example rows |
|---|---|
| Packages | Monthly Books: $149 a month, no setup fee. Monthly Books + Payroll Prep: $229 a month, $99 setup |
| Terms | Billed monthly, cancel with 30 days' notice, out of scope: tax filing |
| Proof | One quote from a past client, permission dated Sep 14, 2026 |
| Clients | Smoke and Salt Tacos: Dana, 2 trucks, "Sunday nights", Monthly Books, Draft |

**Critique (as a skeptical truck owner):** cost, the effort of switching from a spreadsheet, and needing her partner Sam's yes. The founder added one sentence for each, including an offer to walk Sam through the sample report.

```text
CLAIM CHECK: 9 numbers highlighted. 8 traced to Offer facts. Cut: "clients save 10 hours a month".
UPDATER TEST: Monthly Books $149 -> $150. The Dot updated the draft and logged
"price changed per Packages tab". Changed back to $149; the Dot logged that too.
Dot rules: prohibit sharing Pages or sending messages; require approval for anything leaving ChatGPT.
FROZEN: Proposal_SmokeAndSalt_2026-10-23_v1.pdf. Page tag: Proposal - Sent.
Sent by the founder from her own email. Clients tab: Sent, Oct 23. Pipeline: Proposal sent.
```
:::

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
