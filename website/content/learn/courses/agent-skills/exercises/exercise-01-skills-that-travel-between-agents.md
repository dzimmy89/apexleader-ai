---
module: 1
lesson_number: 1
course: agent-skills
template: v2
---

# Exercise 1: One Skill, Two Agents

:::key-concept
You'll check one shared skill before installing it, install it in two agents, and give both the same job. At the end you'll have a trust check you can reuse for every skill, and proof that one skill makes two different agents work the same way.
:::

**Time:** 40 minutes · **You'll need:** Claude Code, plus Codex or Cursor, installed and signed in; your site's folder (or the Rolling Ledger site from Build the Product and Site) · **Builds on:** Lesson 1

:::video
id: sk-ex1-setup
kind: exercise-setup
status: paused
src: /learn/video/agent-skills/sk-ex1-setup.mp4
captions: /learn/video/agent-skills/sk-ex1-setup.vtt
poster: /learn/video/agent-skills/sk-ex1-setup.jpg
transcript: In this exercise you'll put one skill into two agents. First list what each agent already has. Then pick one code review skill from the wshobson agents collection, read it, and run the five trust checks. Install it in Claude Code and in your second agent, and ask both to review the same page of the Rolling Ledger site. You'll finish with a short note comparing the two reviews.
:::

## Warm-up

:::checkpoint
Q: Where should "our site is plain HTML and CSS on GitHub Pages" go?
- [x] The project rules file, like `CLAUDE.md` or `AGENTS.md`
- [ ] A skill
- [ ] A marketplace
Why: It's a fact every session needs, so it belongs in the rules file that loads every time. Skills hold procedures you only need sometimes.
:::

## Steps

1. **Take stock.** In Claude Code, type `/plugin` and note what's installed. Then ask: "List every skill you can use right now, with its one-line description." Do the same in your second agent. Save both lists in `notes/skills-before.md`.

2. **Pick one skill.** Open the plugin catalog in the wshobson/agents repository on GitHub and find a code review skill in the `developer-essentials` plugin. Write down its name.

3. **Read it.** Open its `SKILL.md` on GitHub and read it to the end.

4. **Run the five checks.** In `notes/skills-before.md`, add a short trust check:

```text
Skill:
Source:            (who maintains it, last updated)
What it does:      (one sentence, your words)
Scripts or commands it runs:
Files it changes:
Install where:     (this project or everywhere)
Verdict:           install / don't install
```

For the scripts and files lines, ask your agent: "Read this SKILL.md and list every command it would run and every file it would change."

5. **Install in Claude Code.** Run `/plugin marketplace add wshobson/agents`, then `/plugin install developer-essentials@claude-code-workflows`.

6. **Install in your second agent.** For Codex: `codex plugin marketplace add wshobson/agents`, then `codex plugin add developer-essentials@claude-code-workflows`. For Cursor or another agent, install only the one skill with `npx skills add wshobson/agents --skill <skill-name>` and pick your agent.

7. **Same job, both agents.** Keep approval on. In each agent, send:

```text
Use your code review skill on index.html. List the five most important
problems, most serious first, one line each. Don't change any files.
```

8. **Compare.** Save both answers in `notes/skills-compare.md` and add three lines: what both caught, what only one caught, and whether the skill made the two reviews look alike.

## Done when

- [ ] `notes/skills-before.md` lists each agent's skills and a completed trust check
- [ ] The skill is installed in two agents
- [ ] `notes/skills-compare.md` holds both reviews and your three lines
- [ ] No site files changed (check the diff)

:::example
title: See an example result

For Rolling Ledger, the founder checked a code review skill from `developer-essentials`: one page of steps, no scripts, read-only. Both agents found the same top problem, a phone menu that couldn't be opened from the keyboard, and listed their findings in the same severity order the skill asks for. Codex also caught a missing page title; Claude Code caught an image with no alt text. The founder noted that the skill made both reviews follow one format, which made them easy to compare.

:::video
id: sk-ex1-reveal
kind: exercise-reveal
status: paused
src: /learn/video/agent-skills/sk-ex1-reveal.mp4
captions: /learn/video/agent-skills/sk-ex1-reveal.vtt
poster: /learn/video/agent-skills/sk-ex1-reveal.jpg
transcript: Here's a finished result for Rolling Ledger. The trust check took four minutes: one page of steps, no scripts, read-only. Both agents put the same problem first, a phone menu that doesn't work from the keyboard. Each caught one thing the other missed. Because both followed the same skill, the reviews came out in the same format, which is exactly what a shared skill is for.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Do the same with the skills that matter to your business.

1. Run the trust check on three skills you're considering, not just one.
2. Install the one that passes in every agent you pay for.
3. Run it on a real page or file from your business.

**Bring to your session:** both notes files and your three trust checks.

**Your coach will:**
- Review your trust checks and flag anything you missed
- Help you choose which plugins are worth keeping
- Check that approval settings are still on in each agent
:::
