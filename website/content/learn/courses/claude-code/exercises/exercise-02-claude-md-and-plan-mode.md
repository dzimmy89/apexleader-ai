---
module: 1
lesson_number: 2
course: claude-code
template: v2
---

# Exercise 2: Write Your Project Rulebook and Plan the Pricing Page

:::key-concept
You'll give your website project a CLAUDE.md rulebook and use plan mode to produce an approved plan for a Pricing page. At the end you have a short, tested CLAUDE.md and a written plan saved in your project, ready to build in Exercise 3.
:::

**Time:** 30 minutes · **You'll need:** Claude Code installed, your website folder from Exercise 1, your founder brief · **Builds on:** Lesson 2

## Warm-up

:::checkpoint
Q: What happens in plan mode before you approve?
- [ ] Claude edits files but doesn't save them
- [x] Claude reads and explores, then proposes a plan without editing your source files
- [ ] Claude only answers yes or no questions
Why: Plan mode blocks edits until you approve the plan, so you can review the approach first.
:::

## Steps

1. Open your website project in Claude Code (terminal: `cd` into the folder and run `claude`; desktop: Code tab, **Local**, open the folder).
2. Run `/init`. Read the CLAUDE.md it creates.
3. Edit it into a rulebook. Ask Claude:

```text
Rewrite CLAUDE.md for a non-developer founder. Keep it under 60 lines. Sections:
About the business (from this brief: [paste founder brief]), How this project
works, and Rules. Include these rules: explain every change in plain English;
never invent testimonials, names, statistics or prices; never add tracking or
third-party scripts without asking; never put secrets or personal data in files;
mobile first; do not commit or push unless I ask.
```

4. Read the result. Delete any line that would not change Claude's behavior. Run `/context` and confirm CLAUDE.md is listed under Memory files.
5. Test the rulebook. Start a fresh session (`/clear` or a new session) and ask: "Add a testimonials section to the home page." Claude should refuse to invent quotes or ask you for real ones. If it doesn't, sharpen the rule.
6. Switch to plan mode (Shift+Tab in the terminal, or **Plan** in the mode selector).
7. Ask for the plan:

```text
Plan a Pricing page for this site. Three plans with placeholder prices, what's
included in each, a 5-question FAQ written in our voice, and a clear call to action.
Read CLAUDE.md and the current pages first. List every file you'll create or change,
the page sections in order, how it links from the home page, and the decisions you
need from me. Don't write code yet.
```

8. Review the plan. Reply with at least two changes (for example "leave the home page layout alone" or "FAQ answers under 40 words"). Choose **No, keep planning** until it's right.
9. When it's right, leave plan mode without approving the build: press Shift+Tab until you're in Manual mode (or pick **Manual** in the mode selector). Then ask: "Save the plan you just wrote to PLAN-pricing.md. Don't change any other file." Approve that one file write. You'll build the page in Exercise 3.

## Done when

- [ ] CLAUDE.md is under 60 lines, specific, and shows up in `/context`
- [ ] A fresh session followed at least one of your rules without being reminded
- [ ] You revised the plan at least twice before accepting it
- [ ] PLAN-pricing.md is saved in the project folder

:::coached
**For 1-on-1 coaching clients.** Build a stronger rulebook for your real project:

1. Write a personal `~/.claude/CLAUDE.md` with how you like Claude to explain things and report back.
2. Use the "interview me" prompt from the lesson to write SPEC.md for the most important feature on your roadmap.
3. Run plan mode against SPEC.md and compare the plan to what you expected.

**Bring to your session:** both CLAUDE.md files, SPEC.md and the plan.

**Your coach will:**
- Cut and sharpen your rules so they are short and testable
- Review the spec for gaps and scope creep
- Help you decide what to build first and what to defer
:::
