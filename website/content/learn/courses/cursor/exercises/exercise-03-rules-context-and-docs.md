---
module: 1
lesson_number: 3
course: cursor
template: v2
---

# Exercise 3: Write Your Agent Handbook

:::key-concept
You'll write an `AGENTS.md` for your project, add two Cursor project rules with different application settings, set up a local reference-docs folder, and prove the rules work with a test task. At the end, every agent that opens your project follows your policies without being told.
:::

**Time:** 30 minutes · **You'll need:** Cursor, your site project from Exercise 2 · **Builds on:** Lesson 3

## Warm-up

:::checkpoint
Q: You saved a rule as `.cursor/rules/brand.md`, but the agent ignores it. What's the likely reason?
- [ ] Rules only work on Ultra plans
- [x] Project rules must be `.mdc` files with a header; plain `.md` files in that folder are ignored
- [ ] The agent needs to be restarted every time a rule changes
Why: Cursor reads project rules from `.mdc` files with frontmatter (description, globs, alwaysApply). Use `/create-rule` and Cursor creates the right format.
:::

## Steps

1. **Collect what agents keep getting wrong.** Look back at Exercises 1 and 2. Write down three things you had to correct (wording, style, a file it shouldn't have touched).

2. **Draft AGENTS.md with an agent.** In Agent, send:

```text
Help me write AGENTS.md for this project. Use these sections: About the
business, How we build, Never, Reference. Pull facts from SPEC.md. Add these
corrections I've had to make: [paste your three]. Include these "Never"
rules: no new third-party scripts, trackers or fonts without asking; never
put passwords, keys or customer data in any file; never commit to main or
merge, work on a branch; don't change pricing or legal text unless asked.
Keep it under 60 lines. Only create AGENTS.md.
```

Read it line by line and cut anything vague.

3. **Add an always-on rule.** Type `/create-rule` and describe:

```text
Always: explain what you're about to change in plain English before
changing it, and end every task with a list of files changed and anything
you were unsure about.
```

Open the new `.mdc` file in `.cursor/rules/` and confirm it's set to always apply.

4. **Add a file-scoped rule.** Type `/create-rule` again:

```text
For files in content/: short sentences, talk to one groomer as "you",
never say "accounting solutions", no prices outside content/pricing.md,
and any tax statement ends with "General information, not tax advice."
Apply only to content/**/*.md.
```

Check the header has `globs: content/**/*.md` and `alwaysApply: false`.

5. **Set up reference docs.** Create a folder `docs-reference/`. Add one useful document as a Markdown or text file, for example your booking tool's embed instructions copied from its help page, or your brand guidelines. Make sure `AGENTS.md` mentions the folder under Reference.

6. **Test the rules.** Start a new chat (fresh context) and give a deliberately vague task:

```text
Add a short "Pricing" teaser section with a sentence about our plans and
a sentence about tax deductions.
```

Check: Did it explain first? Did it avoid putting prices outside `content/pricing.md`? Did the tax sentence get the disclaimer? Did it list files changed? If not, tighten the rule that failed and try again.

7. **Commit the handbook** on a branch with the message "Add agent handbook and rules".

## Done when

- [ ] `AGENTS.md` exists, under 60 lines, with About, How we build, Never and Reference sections
- [ ] One always-apply rule and one file-scoped rule exist as `.mdc` files
- [ ] A `docs-reference/` folder with at least one document is listed in `AGENTS.md`
- [ ] A test task in a fresh chat followed the rules, or you fixed the rule that failed
- [ ] No passwords, keys or client details appear in any rules file

:::coached
**For 1-on-1 coaching clients.** Turn your business knowledge into agent policy.

1. Write the real `AGENTS.md` for your main project, including the facts agents most often get wrong about your offer, audience and compliance limits.
2. Add a `.cursor/BUGBOT.md` draft listing the five things a reviewer must always flag in your business (for example any change to pricing, forms or data handling).
3. Assemble a `docs-reference/` folder with the three external docs your build depends on most.

**Bring to your session:** `AGENTS.md`, your rules files, the BUGBOT.md draft, and one transcript where an agent ignored a rule.

**Your coach will:**
- Edit your rules for clarity and remove anything an agent can't act on
- Check for sensitive details that shouldn't live in a repository
- Diagnose the ignored rule and show how to scope it better
:::
