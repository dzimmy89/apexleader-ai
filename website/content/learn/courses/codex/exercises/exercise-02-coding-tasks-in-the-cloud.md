---
module: 1
lesson_number: 2
course: codex
template: v2
---

# Exercise 2: Run Three Cloud Tasks Before Lunch

:::key-concept
You'll put your tools project on GitHub, publish a Codex Cloud environment with tight network settings, send three tasks at once, and turn the good results into pull requests you merge. At the end you'll have an improved tool and a routine for delegating work that runs while you're away.
:::

**Time:** 35 minutes · **You'll need:** Your tools project from Exercise 1, a GitHub account, a ChatGPT plan that includes Codex · **Builds on:** Lesson 2

## Warm-up

:::checkpoint
Q: Your environment setup offers full internet access. The tasks are small edits to an HTML calculator. What should you choose?
- [ ] Full internet access, so nothing can fail
- [x] No access, or the narrowest preset that lets setup work
- [ ] Whatever the default is, since cloud tasks are isolated anyway
Why: The calculator needs nothing from the internet. Narrow access reduces what an agent can reach, or be misled by, while it works.
:::

## Steps

1. **Put the project on GitHub.** In Codex (local), send:

```text
Publish this project to a new private GitHub repository called
groomer-books-tools. Before pushing, check every file for passwords,
keys or client data and show me the file list. Wait for my OK.
```

Log in to GitHub yourself when asked.

2. **Limit GitHub access.** When ChatGPT asks to connect GitHub, grant access to `groomer-books-tools` only (and your site repo if you did the GitHub course).

3. **Create the environment.** In ChatGPT on the web or desktop, choose **Work in**, then **Cloud**, then **Select environment**, and create one for `groomer-books-tools`. Review what Codex found and tested.

4. **Set network access.** Under Networks, keep internet access off, or choose the narrowest preset if setup needs to install anything. Add no secrets. Set access to "Only me". Publish and wait for "Environment published."

5. **Send three tasks at once.** Start three separate cloud tasks:

```text
Task 1: In quote-calculator.html, add input checks: no negative numbers,
transactions must be whole numbers, show a friendly message for bad input.
List files changed.
```

```text
Task 2: Write tests/quote-cases.md with 10 test cases from pricing-rules.md
(inputs and expected fee), then check the calculator against each one and
report any mismatches. Don't change the calculator.
```

```text
Task 3: Improve accessibility of quote-calculator.html: labels tied to
inputs, visible focus outlines, readable contrast. Don't change any
wording or the pricing logic. List files changed.
```

6. **Do something else for ten minutes.** That's the point. Check back from your phone if you like.

7. **Review each result.** For each task, read the summary and changed files. For Task 2, read the mismatch report. If something is wrong, reply in the task with a specific follow-up.

8. **Open pull requests.** For each good result, open a pull request. On GitHub, review and merge them one at a time. If two touch the same file and conflict, ask Codex in the second task to update its branch.

9. **Pull the changes locally.** In Codex (local), ask: "Pull the latest changes from GitHub and open the calculator in the in-app browser." Test one bad input yourself.

## Done when

- [ ] The tools project is in a private GitHub repo that Codex can access, and no other repos are exposed unnecessarily
- [ ] A published cloud environment with no secrets and minimal network access
- [ ] Three cloud tasks ran in parallel, each reviewed
- [ ] At least two pull requests merged by you, and the calculator rejects bad input

:::coached
**For 1-on-1 coaching clients.** Build your cloud task playbook.

1. Write five task templates for recurring work on your real projects (content update, bug fix, accessibility pass, tests, cleanup), each with Rules and Done when lines.
2. Run two of them as cloud tasks against a real repository and record time to result and number of follow-ups.
3. List every secret any of your environments might ever need, and mark each "never", "test key only" or "read-only key".

**Bring to your session:** the five templates, the two task results, and your secrets list.

**Your coach will:**
- Tighten your templates so tasks come back right first time more often
- Review your environment network and secrets settings
- Agree a rule for which work stays local and supervised
:::
