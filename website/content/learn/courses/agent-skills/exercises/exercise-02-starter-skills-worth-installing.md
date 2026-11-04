---
module: 1
lesson_number: 2
course: agent-skills
template: v2
---

# Exercise 2: Grill It, Design It, Keep It

:::key-concept
You'll take one small idea for your site through all three starter skills: `/grill-me` turns it into a clear plan, `frontend-design` turns the plan into one screen with a point of view, and `skill-creator` turns what worked into a skill you'll reuse. At the end you'll have a plan, a screen in its own branch, and your first home-made skill.
:::

**Time:** 50 minutes · **You'll need:** Claude Code installed and signed in, your site's folder (or the Rolling Ledger site), one small idea for the site · **Builds on:** Lesson 2

:::video
id: sk-ex2-setup
kind: exercise-setup
status: paused
src: /learn/video/agent-skills/sk-ex2-setup.mp4
captions: /learn/video/agent-skills/sk-ex2-setup.vtt
poster: /learn/video/agent-skills/sk-ex2-setup.jpg
transcript: In this exercise one idea goes through three skills. Install Matt Pocock's skills, frontend design and skill creator. Run grill me on a single sentence, like a page where truck owners can book a call, and answer until the agent has no questions left. Then build one screen with frontend design on its own branch. Last, ask skill creator to turn the session into a skill. You'll finish with a plan, a screen and a skill.
:::

## Warm-up

:::checkpoint
Q: The agent asks "Should the page show prices? Recommended: yes, the $149 plan only." You want both plans shown. What do you reply?
- [ ] "Yes"
- [x] "No, show both plans"
- [ ] Nothing, and let it decide
Why: "Yes" accepts the recommended answer. When you disagree, say what you want instead. The decisions are yours.
:::

## Steps

1. **Install the three skills.** In a terminal, `claude plugin install mattpocock-skills@claude-plugins-official`. Then in a Claude Code session, `/plugin install frontend-design@claude-plugins-official` and `/plugin install skill-creator@claude-plugins-official`. Run `/setup-matt-pocock-skills` once in your project.

2. **Write one sentence.** Pick one small change, for example: "A page where a food truck owner can book a free 15-minute call."

3. **Get grilled.** Send `/grill-me` followed by your sentence. Answer every round. Reply "yes" when you agree with a recommended answer. Stop when the agent says nothing is left open.

4. **Save the plan.** Ask: "Write what we agreed as `notes/booking-page-plan.md`, under one page." Read it and fix anything that's wrong.

5. **Count the questions.** At the bottom of the plan, write how many questions the agent asked and how many you hadn't thought about.

6. **Build one screen.** Ask Claude Code to make a new branch and build the screen from the plan:

```text
Create a branch called booking-page. Using the frontend-design skill and our
brand kit, build the page in notes/booking-page-plan.md. Ground the design in
a food truck owner's world, not a generic software page. Show me the plan first.
```

Approve the plan, let it build, and open the page in your browser.

7. **Check for the tells.** List any of the generic signs from Lesson 2 you can still see (a highlighted headline word, all-caps labels, numbered cards that aren't steps, an entrance animation on every section). Ask the agent to fix them.

8. **Make it a skill.** Ask: "Use skill-creator to turn how we planned and built this page into a skill called `new-page`, so next time I can say 'new page for X' and you follow the same steps. Skip the evals for now." Read the `SKILL.md` it writes.

9. **Test the skill.** Start a fresh session and say "new page for our FAQ." Check that it starts by grilling you.

## Done when

- [ ] `notes/booking-page-plan.md` exists and holds your question counts
- [ ] The screen is on its own branch and opens in a browser
- [ ] You've listed and fixed any generic tells
- [ ] A `new-page` skill exists and starts with a grilling session in a fresh session
- [ ] Nothing on your main branch changed

:::example
title: See an example result

For Rolling Ledger, `/grill-me` took three rounds and asked 11 questions, 6 the founder hadn't considered, such as what happens after an owner books (an email with a calendar invite) and whether evening calls are offered (yes, trucks serve lunch). The first build had an all-caps "BOOK NOW" label and fade-ins on every section; the agent removed both. The finished page opens with a simple chalkboard-menu layout in the brand's ink and coral. The `new-page` skill's first step is "Run /grill-me until the goal and done-when are settled."

:::video
id: sk-ex2-reveal
kind: exercise-reveal
status: paused
src: /learn/video/agent-skills/sk-ex2-reveal.mp4
captions: /learn/video/agent-skills/sk-ex2-reveal.vtt
poster: /learn/video/agent-skills/sk-ex2-reveal.jpg
transcript: Here's a finished result for Rolling Ledger. Grill me asked 11 questions over three rounds, and six of them were things the founder hadn't thought about, like evening slots. The first build had two generic tells, an all-caps label and fade-ins everywhere, and both came out. The page now looks like a chalkboard menu, not a software template. And the new page skill starts every future page the same way: with a grilling session.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Run the three skills on a change your business actually needs.

1. Pick the page or feature that's been on your list longest.
2. Run `/grill-me` with your coach's questions in mind: who it's for and how you'll know it worked.
3. Build it on a branch and turn the process into a skill.

**Bring to your session:** the plan, a link or screenshot of the screen, and your `new-page` skill.

**Your coach will:**
- Review the plan for gaps the grilling missed
- Critique the screen against your brand
- Help you tighten the skill's description so it triggers at the right time
:::
