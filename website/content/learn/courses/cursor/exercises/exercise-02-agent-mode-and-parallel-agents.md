---
module: 1
lesson_number: 2
course: cursor
template: v2
---

# Exercise 2: Build the Page With a Small Agent Team

:::key-concept
You'll build the first version of your site from `SPEC.md` with one agent, then run parallel agents in separate worktrees for independent jobs, and race several attempts at the hero section with `/best-of-n`. At the end you'll have a working one-page site and a feel for supervising more than one agent.
:::

**Time:** 35 minutes · **You'll need:** Cursor, your project folder with `SPEC.md` from Exercise 1 · **Builds on:** Lesson 2

## Warm-up

:::checkpoint
Q: Which pair of tasks is safe to run as parallel agents?
- [ ] Rewrite the hero section, and restyle the hero section's button
- [x] Write content/faq.md from your notes, and compress every image in /images
- [ ] Rename index.html, and add a new section to index.html
Why: Parallel agents work best when each touches different files. The other pairs edit the same file and will collide.
:::

## Steps

1. **Make it a Git repository.** If your folder isn't one yet, ask Agent: "Initialize a git repository here and commit SPEC.md with the message 'Add site spec'." Worktrees need Git.

2. **Build version one with a single agent.** Use the brief structure from the lesson:

```text
Goal: Build the one-page site described in SPEC.md.
Context: Read SPEC.md first. Put copy in /content as Markdown files so I
can edit it, and build index.html and styles.css from it.
Constraints: Plain HTML and CSS. No frameworks, scripts, trackers or
external fonts. Use placeholder boxes where images will go.
Done when: Every section in SPEC.md is on the page, it looks right at 375px
and 1280px wide, and you've shown me screenshots of both.
Commit when done with a clear message. Ask before anything outside this.
```

3. **Steer once.** While it works, queue one message (press Enter) such as "Make the call-to-action button say 'Book a 15-minute call'." Watch it pick that up after the current step.

4. **Review.** Read the diff and screenshots. Open `index.html` in your browser. Ask for one fix if something's off, then make sure it's committed.

5. **Run two agents in parallel.** In the Agents Window, start two agents, each in its own worktree:

```text
Agent A: Write content/faq.md with six short questions and answers a dog
groomer would ask about outsourcing bookkeeping. Mark any statement about
taxes "General information, not tax advice." Only create content/faq.md.
```

```text
Agent B: Review index.html for accessibility: headings in order, alt text
placeholders, button contrast, link text. List problems and fix them in
index.html and styles.css only. Don't change any wording.
```

6. **Bring results in one at a time.** Review Agent B's diff first and bring it into your main folder (in the Agents Window, or with `/apply-worktree` in the Editor). Then review Agent A's file and bring it in. Commit.

7. **Race the hero.** In the Editor's agent input:

```text
/best-of-n Redesign the hero section of index.html to feel warm and
trustworthy for independent dog groomers. Keep the exact headline and
button text. Follow SPEC.md. Plain HTML and CSS only.
```

Use models your plan includes. Open each result in the browser at phone width, pick one, apply it with `/apply-worktree`, and delete the others with `/delete-worktree`.

8. **Clean up.** Ask: "Run git worktree list and tell me if any worktrees are left over." Delete leftovers you don't need.

## Done when

- [ ] A working `index.html` and `styles.css` built from `SPEC.md` are committed
- [ ] Two parallel agents finished separate jobs in separate worktrees, and both results are in your main folder
- [ ] You compared at least two `/best-of-n` hero versions and kept one
- [ ] No stray worktrees are left

:::coached
**For 1-on-1 coaching clients.** Run a real sprint with an agent team.

1. Break your real spec into five to eight tasks and mark which can run in parallel (different files) and which must be sequential.
2. Run one batch of two or three parallel agents on your real project, timing how long each review takes you.
3. Use `/best-of-n` on the one design decision you've been stuck on, and write two sentences on why you picked the winner.

**Bring to your session:** your task breakdown, the review times, and the best-of-n results.

**Your coach will:**
- Check your task split for hidden file collisions
- Help you set a sustainable number of parallel agents for your review capacity
- Review the chosen design against your audience
:::
