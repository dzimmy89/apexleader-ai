---
module: 1
lesson_number: 4
course: claude-for-founders
template: v2
---

# Exercise 4: Package a Recurring Task as a Skill and Ship a Sales Deck

:::key-concept
You'll turn one task you repeat every week into a working Claude skill, then use Slides to build a short sales deck for your business. At the end you have an installed skill you can reuse forever and a deck exported to PowerPoint or PDF.
:::

**Time:** 30 minutes · **You'll need:** A Claude account with code execution turned on, your Company HQ Project, a zip tool (built into Mac and Windows) · **Builds on:** Lesson 4

## Warm-up

:::checkpoint
Q: Which part of a skill does Claude read first to decide whether to use it?
- [ ] The example at the bottom
- [ ] The scripts folder
- [x] The name and description in the header
Why: Claude loads the header up front and reads the full instructions only when the description matches your request.
:::

## Steps

1. Pick one recurring task: a client update, a proposal, a weekly social post, or a reply to a common question. If you're using the sample business, use the monthly client update.
2. Check **Settings > Capabilities** and make sure **Code execution and file creation** is on.
3. In your Company HQ Project, ask Claude to draft the skill:

```text
Help me write a Claude skill for this recurring task: [describe the task and how
you do it today]. Output a SKILL.md with a header containing name (lowercase,
hyphens) and description (under 200 characters, saying what it does and when to
use it). Then sections: Inputs to ask for if missing, Steps, Rules, and one Example.
Include a rule that the output is labeled DRAFT FOR FOUNDER APPROVAL.
```

4. Read the draft carefully. Cut anything vague. Make sure there are no passwords, keys or customer personal data in it.
5. On your computer, create a folder with the same name as the skill, save the text as `SKILL.md` inside it, and zip the folder.
6. Go to **Customize > Skills**, click **+**, **+ Create skill**, **Upload a skill**, and upload the zip. Make sure it is on.
7. Test it in a new chat with a realistic request that should trigger it. Then test one request that should not trigger it. If the skill misfires, edit the description and re-upload.
8. Now build the deck:

```text
Create a Slides deck: a 6-slide sales deck for my business aimed at my ideal
customer. Use project knowledge for the offer, price and voice. One idea per slide,
speaker notes on each, last slide is the call to action. Don't invent customer
quotes or results.
```

9. Edit at least two slides yourself in the Slides editor. Check the speaker notes for anything internal you would not want a prospect to see.
10. Export the deck to PowerPoint or PDF and save it.

## Done when

- [ ] Your skill is uploaded, switched on, and triggered correctly on a test request
- [ ] The skill includes inputs, steps, rules, an example and the approval label
- [ ] A 6-slide deck exists with no invented quotes or numbers
- [ ] The deck is exported and saved on your computer

:::coached
**For 1-on-1 coaching clients.** Build a small skill library for your real business:

1. Write three skills for your three most frequent tasks.
2. Build one Design artifact (a one-pager or landing page mockup) using the same voice rules.
3. Track how long each task takes with and without the skill over one week.

**Bring to your session:** your three SKILL.md files, the deck, the one-pager, and your time log.

**Your coach will:**
- Review each skill's description and rules for clarity and safety
- Critique the deck's story and call to action
- Help you pick the next process worth turning into a skill
:::
