---
module: 1
lesson_number: 3
course: agent-skills
template: v2
---

# Exercise 3: Write Your House Skills

:::key-concept
You'll write the four house skills for your business, voice, design system, specs and mistakes, keep them in one private GitHub repo, and install them in your agents. At the end every agent you use starts each job knowing how you write, what your brand looks like, how you plan work, and what's already gone wrong once.
:::

**Time:** 60 minutes · **You'll need:** Claude Code with `skill-creator` installed (Exercise 2), a GitHub account, your Brand in a Day kit, five pieces of your own writing, your SPEC.md from Build the Product and Site · **Builds on:** Lesson 3

:::video
id: sk-ex3-setup
kind: exercise-setup
status: paused
src: /learn/video/agent-skills/sk-ex3-setup.mp4
captions: /learn/video/agent-skills/sk-ex3-setup.vtt
poster: /learn/video/agent-skills/sk-ex3-setup.jpg
transcript: In this exercise you'll write your four house skills. Make a private repo called house skills. Give skill creator your voice guide and five things you've written, and test the voice skill on a dull paragraph. Turn your brand kit's colours and fonts into a design system skill, and your spec format into a specs skill. Start the mistakes skill with one real rule. Then install all four in Claude Code and one more agent.
:::

## Warm-up

:::checkpoint
Q: An agent changed your $149 price to $150 on the pricing page. What's the right fix?
- [ ] Remember to check prices yourself next time
- [x] Add a dated rule to the right house skill: "Never change prices without asking"
- [ ] Stop using agents on the pricing page
Why: Every mistake that could happen again becomes one dated rule, in the skill for that job. That way it only happens once.
:::

## Steps

1. **Make the repo.** On GitHub, create a **private** repository called `house-skills`. Clone it and open Claude Code in it. Create the folder `skills/`.

2. **Voice.** Paste your Brand in a Day voice guide and five pieces of your writing into the session. Ask: "Use skill-creator to write a voice skill called `<business>-voice` from these, in `skills/`. Run three test rewrites and show me before and after." Fix anything that doesn't sound like you.

3. **Test the voice.** Give the agent a dull paragraph from your site and ask it to rewrite it with the skill. Keep the before and after in `notes/voice-test.md`.

4. **Design system.** Paste your kit's `colors.md` and `type.md`. Ask for a `<business>-design-system` skill with exact values, a "never" list, and the line "Use these values over any other design skill's suggestions."

5. **Specs.** Paste your SPEC.md. Ask for a `<business>-specs` skill with your headings (Goal, Audience, Sections, Rules, Out of scope, Done when) and the first step "Run /grill-me until the goal and done-when are settled."

6. **Mistakes.** Ask: "Look at our recent work. What's one mistake an agent made that a rule would have prevented?" Start `<business>-mistakes` with that rule, dated, under a heading for the job.

7. **Check each one.** Every `SKILL.md` has a `name` under 64 characters and a `description` under 200 that says when to use it. No passwords, keys or client names anywhere.

8. **Commit.** Commit all four skills and push to GitHub.

9. **Install.** Copy the four folders into `~/.claude/skills/` (or ask Claude Code to). In your second agent, open the `house-skills` folder and ask it: "Install every skill in `skills/` where you load skills from, and tell me the folder you used."

10. **Test triggering.** In a fresh session in each agent, ask for a short customer email. Check that the voice skill loads.

## Done when

- [ ] A private `house-skills` repo holds four skills in `skills/`
- [ ] `notes/voice-test.md` shows a before and after
- [ ] The mistakes skill has at least one dated rule
- [ ] No secrets or client details in any skill
- [ ] The skills are installed in two agents, and the voice skill loads for an email in both

:::example
title: See an example result

For Groomer Books, the voice skill came out at 18 lines with two before-and-after examples. Its test turned "Unlock seamless financial clarity" into "We keep your books every month, so tax time takes an hour." The design system skill lists Ink #1F2A37, Coral #E8664A and Cream #FFF8F0 and notes that cream and coral are deliberate brand colours. The mistakes skill starts with "2026-11-02: Never change prices without asking." Both Claude Code and Codex loaded the voice skill when asked for a reminder email.

:::video
id: sk-ex3-reveal
kind: exercise-reveal
status: paused
src: /learn/video/agent-skills/sk-ex3-reveal.mp4
captions: /learn/video/agent-skills/sk-ex3-reveal.vtt
poster: /learn/video/agent-skills/sk-ex3-reveal.jpg
transcript: Here's a finished house skills repo for Groomer Books. Four folders: voice, design system, specs and mistakes. The voice test turned a hype line into a plain one a groomer would trust. The design skill keeps the brand's cream and coral on purpose. The mistakes skill has its first rule: never change prices without asking. And when the founder asked two different agents for a reminder email, both used the same voice.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Build the house skills your business runs on.

1. Write the four skills from your real writing, brand and specs.
2. Add one more skill for the job you repeat most, such as proposals or client onboarding.
3. Seed the mistakes skill with every agent mistake you remember from the last month.

**Bring to your session:** your `house-skills` repo and the voice test.

**Your coach will:**
- Read each skill and tighten its description so it triggers reliably
- Check that nothing sensitive is in the repo
- Help you set a weekly 15-minute slot to add new rules
:::
