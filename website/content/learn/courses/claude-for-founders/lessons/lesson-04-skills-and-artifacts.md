---
module: 1
lesson_number: 4
course: claude-for-founders
template: v2
---

# Lesson 4: Skills and Artifacts

:::key-concept
A skill is a written procedure Claude loads when a task calls for it, so it does recurring work your way every time. An artifact is a finished piece of work Claude builds beside the chat: a doc, a deck, a design, a dashboard or a small tool. Skills make the process repeatable; artifacts are the output you use and share.
:::

## What you'll be able to do

- Turn on skills and use Anthropic's built-in document skills
- Write and upload your own skill with a SKILL.md file
- Create artifacts from the Docs, Slides and Design templates
- Share artifacts safely and export them to Word, PowerPoint or PDF

## Why this matters

Every business has tasks you do the same way each week: a client update, a proposal, a social post in your voice. Explaining the steps every time wastes your morning and gives uneven results. A skill writes the steps down once. Artifacts then turn the result into something you can actually send, present or reuse, without opening five other tools.

## Skills: the standard operating procedure for Claude

A skill is a folder with a `SKILL.md` file inside. The file starts with a short header (name and description) and then the instructions. Claude reads only the name and description up front. When your request matches the description, it loads the full instructions. That is why the description matters most.

As of October 2026:

- Skills are on all plans, including Free.
- Skills need code execution. Turn on **Code execution and file creation** in **Settings > Capabilities**.
- Manage skills in **Customize > Skills**, where you can toggle each one on or off.
- Anthropic provides built-in skills for Excel, Word, PowerPoint and PDF files. You don't call them by name; Claude uses them when you ask for those files.

### Write your own skill

Here is a skill for a monthly client update, written for the sample business:

```text
---
name: monthly-client-update
description: Write the monthly bookkeeping update email for a Groomer Books client from their profit report numbers.
---

# Monthly client update

## Inputs to ask for if missing
- Client salon name and owner first name
- Month, revenue, expenses, net profit, and last month's net profit

## Steps
1. Open with one sentence on the headline: profit up or down and by how much.
2. List three numbers in a short table: revenue, expenses, net profit.
3. Give one plain-English observation (for example, supplies rose 18%).
4. Give one suggested action the owner can take this month.
5. Close with the date their next books will be ready.

## Rules
- Under 150 words. Warm, plain, no accounting jargon.
- Never give tax advice. If asked, say "Your CPA is the right person for that."
- Label the email DRAFT FOR FOUNDER APPROVAL. Never send it.

## Example opening
"Hi Maria, good news: Paws & Suds kept $4,120 in profit in September, up $610 from August."
```

The required header fields are `name` (up to 64 characters) and `description` (up to 200 characters). Keep each skill to one workflow, include an example, and start with plain instructions before adding any scripts.

To install it:

1. Create a folder named `monthly-client-update` and save the text above inside it as `SKILL.md`.
2. Zip the folder so the folder itself is at the root of the zip.
3. Go to **Customize > Skills**, click **+**, then **+ Create skill**, then **Upload a skill**, and upload the zip.
4. Make sure it is switched on.

Test it with a prompt that should trigger it, and one that should not:

```text
Write this month's update for Maria at Paws & Suds. September revenue $18,400,
expenses $14,280, net profit $4,120. August net profit was $3,510.
```

If Claude doesn't pick up the skill, sharpen the description or name the skill in your prompt. You can also ask Claude in a normal chat to help draft a skill from a process you describe, then review it before uploading.

:::warning
Only install skills from sources you trust, and read every file in a skill before you enable it, especially scripts or anything that connects to the internet. Never put API keys or passwords inside a skill.
:::

## Artifacts: work you can use, not just read

Artifacts open beside the chat as standalone outputs. Since September 16, 2026, artifacts are available on every plan, and Claude Docs, Claude Slides and Claude Design are built in as templates:

| Template | Use it for | Exports to |
| --- | --- | --- |
| Docs | Proposals, SOPs, policies, briefs you edit together | Word, PDF, Markdown, Google Docs |
| Slides | Pitch decks, sales decks, workshop slides | PowerPoint, PDF, Google Slides |
| Design | Landing page mockups, one-pagers, prototypes | ZIP, PDF, PowerPoint, standalone HTML |
| Dashboards (beta, Pro and up) | Live charts from connected apps or data | View in Claude |

You can start an artifact by asking in chat, by choosing **Output** in the message box, or from the **Artifacts** tab in the sidebar.

Prompts that work well:

```text
Create a Slides deck: a 6-slide sales deck for Groomer Books aimed at salon owners.
Use project knowledge for the offer and price. One idea per slide, big type,
speaker notes on each slide. Final slide: the free 15-minute books check.
```

```text
Create a Design one-pager for a salon owner who asked "what do I actually get?"
Use our brand voice. Include what's included, what's not, the price, and a
3-step getting-started section.
```

```text
Build a small interactive tool: a "what is my time worth" calculator. Inputs:
hours per month on bookkeeping and owner's hourly value. Output: monthly cost
of doing it themselves vs our flat fee. Simple, clean, mobile friendly.
```

To revise, ask for changes in chat, edit directly in the Docs or Slides editor, or highlight text and choose **Edit with Claude**.

### Sharing and data

Artifacts start private to you. You decide who can open them when you share. A few rules for founders:

- **Check before sharing.** A deck with internal pricing notes in the speaker notes is still a deck with internal pricing notes.
- **Storage.** On Pro and up, an artifact can store data, either personal (private to each viewer) or shared (everyone sees it). The limit is 20 MB of text per artifact. Check which kind before entering anything sensitive.
- **Connected apps.** On Pro and up, artifacts can use apps like Google Calendar or Slack. Approve only the tools the artifact needs.
- **Others' artifacts.** Treat a published artifact from someone else like a file from an unknown sender. Only build on artifacts from people you trust.

## Skills plus artifacts: a weekly engine

The real payoff is combining them. A skill defines how a proposal is written; an artifact turns it into a Doc you export to PDF. A skill defines your pitch structure; Slides turns it into a deck. Each week you just supply the new facts.

:::try-it
Ask Claude: "Make a Docs artifact: a one-page checklist titled 'Before I hit send' for any email, proposal or post that leaves my business." Export it to PDF and keep it next to your keyboard.
:::

:::checkpoint
Q: You uploaded a skill, but Claude keeps writing client updates without following it. What is the most likely fix?
- [ ] Upload the same skill a second time
- [x] Make the skill's description clearly match the request, or name the skill in your prompt
- [ ] Turn off memory
Why: Claude decides when to load a skill from its name and description, so a vague description is the usual reason a skill is skipped.
:::

:::takeaways
- A skill is a SKILL.md with a name, a clear description and step-by-step instructions; it needs code execution turned on.
- Keep each skill to one workflow, include an example, and review any skill before you enable it.
- Artifacts include Docs, Slides and Design templates on every plan, and they start private.
- Pair a skill (the process) with an artifact (the output) for recurring work.
:::

## Go deeper

- [Use skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude) - enabling, uploading and safety
- [How to create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) - SKILL.md structure and best practices
- [What are artifacts and how do I use them?](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them) - templates, sharing, storage and export
- [Claude release notes](https://support.claude.com/en/articles/12138966-release-notes) - the September 2026 Docs, Slides and Design launch
