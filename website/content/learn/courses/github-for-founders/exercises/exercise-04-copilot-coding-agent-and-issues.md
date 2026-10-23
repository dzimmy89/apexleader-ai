---
module: 1
lesson_number: 4
course: github-for-founders
template: v2
---

# Exercise 4: Hand Your First Work Order to an Agent

:::key-concept
You'll turn your site's to-do list into well-written issues, give agents standing instructions, assign one issue to Copilot cloud agent, steer it with an @copilot comment, and merge the result through your gate. At the end you'll have a working backlog and a repeatable delegate-review-merge loop.
:::

**Time:** 30 minutes · **You'll need:** Your site repo from Exercises 2 and 3; a paid Copilot plan (Pro or higher) for the agent steps · **Builds on:** Lesson 4

## Warm-up

:::checkpoint
Q: Copilot pushed changes to its pull request, but your link-check workflow hasn't run. Why?
- [ ] The workflow is broken and needs to be rewritten
- [x] By default, workflows wait for you to click Approve and run workflows on Copilot's pull requests
- [ ] Copilot disabled the workflow to save time
Why: GitHub holds workflow runs on Copilot's pushes until a human approves them, because workflows can access secrets. Glance at the changes, then approve the run.
:::

## Steps

1. **Add standing instructions.** In your site repo, create `.github/copilot-instructions.md` on a branch and merge it through a pull request:

```text
# House rules for agents working on this site
- Work on a branch and open a pull request. Never merge.
- Change only the files named in the issue.
- Plain HTML and CSS. No new scripts, trackers, fonts or external services.
- Must look right at 375px and 1280px wide.
- Never add API keys, passwords, tokens or customer data to any file.
- In the pull request, list files changed and anything you were unsure about.
```

2. **Write three issues.** Click **Issues**, then **New issue**, and write three work orders using What / Done when / Files / Out of scope. For Groomer Books, use these or your own:
   - Add a "Who it's for" section with three bullets (mobile groomers, salon owners, new groomers)
   - Add a simple FAQ with four questions and answers you supply in the issue
   - Add a footer with business hours and a contact email

Here's the first, filled in:

```text
Title: Add a "Who it's for" section

What: Add a section after "How it works" titled "Who it's for" with three
short bullets: mobile groomers, salon owners, and groomers in their first year.
One sentence each on why bookkeeping is a headache for them.

Done when:
- Section appears after "How it works" and before the contact link
- Reads well on a 375px phone screen
- No other sections change

Files: index.html only.
Out of scope: pricing, contact details, any new styling files.
```

3. **Label them.** Add labels `content` or `idea` so the backlog is sortable. This is your product to-do list from now on.

4. **Assign one to Copilot.** Open the "Who it's for" issue, click **Assignees**, choose **Copilot**, check the repository and base branch (`main`), and confirm. If you don't have a paid Copilot plan, skip to step 8 and use another agent instead.

5. **Watch the session.** Open the **Agents** tab (or the link on the issue) and read the session log as it works. Note what files it read and what it ran.

6. **Review and steer.** When the pull request arrives, click **Approve and run workflows** so your link check runs. Do your two-minute review. Then leave one steering comment, even if it's minor:

```text
@copilot Make the bullet for first-year groomers mention that we set up
their books from day one. Keep everything else the same.
```

Wait for the follow-up push, review again, and merge when the check is green.

7. **Close the loop.** Confirm the issue closed (or close it), check your live Pages site shows the new section, and look at the commit on `main`.

8. **No paid Copilot plan?** Paste the same issue text into Cursor, Codex or Claude Code with this line added: "Work on a new branch, push, and open a pull request that references issue #1. Don't merge." Review and merge the same way.

## Done when

- [ ] `.github/copilot-instructions.md` with house rules is merged on `main`
- [ ] Three labeled issues exist, each with What, Done when, Files and Out of scope
- [ ] One issue became a pull request from an agent, which you steered with a comment
- [ ] The change passed the link check, merged through your ruleset, and shows on the live site

:::coached
**For 1-on-1 coaching clients.** Run a week of real work through issues.

1. Write ten issues for your real site or tool, then sort them into "agent," "agent with close supervision" and "human developer" using GitHub's guidance on task types.
2. Assign two "agent" issues and compare the pull requests: time to first PR, how many steering comments, and how many problems you caught in review.
3. Draft one automation idea (for example, labeling new issues) with the exact tools it would need, and the ones it must never get.

**Bring to your session:** your sorted backlog, the two pull requests with your notes, and the automation draft.

**Your coach will:**
- Review your issue writing and tighten the weakest work orders
- Check your sorting, especially anything touching money, logins or customer data
- Help you decide whether the automation is worth turning on, and with what limits
:::
