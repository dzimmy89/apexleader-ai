# Module 1 Quiz: GitHub for Non-Developers
Checks whether you can supervise agents on GitHub: branches, pull requests as approval gates, Actions, Pages and Copilot cloud agent.

---

## Question 1
A coding agent finished a task and says it "pushed the update." What is the most reliable way to see what actually changed?

- A) Ask the agent to summarize its work again
- B) Refresh the live website until something looks different
- C) Open the commit or pull request on GitHub and look at the added and removed lines
- D) Check your email for a GitHub notification

**Answer:** C

**Explanation:** The commit is the record of what changed; summaries can be incomplete and the live site only shows results, not changes.

---

## Question 2
You run a solo business and want to make sure nothing reaches `main` without your review. Which ruleset setup fits?

- A) Require a pull request before merging, with required approvals set to 0
- B) Require one approving review from the pull request author
- C) Allow the agent to bypass the ruleset so it can work faster
- D) Turn off rulesets and rely on asking agents nicely

**Answer:** A

**Explanation:** Authors can't approve their own pull requests, so solo founders require pull requests with zero approvals and treat the merge click as the approval.

---

## Question 3
An agent's pull request titled "Fix typo on FAQ" also edits a file inside `.github/workflows`. What should you do?

- A) Merge it because workflow files are just settings
- B) Ask why the workflow changed and have it removed from this pull request before merging
- C) Merge it and revert later if something breaks
- D) Delete the repository and start again

**Answer:** B

**Explanation:** Workflow files control automation that can reach your repo and secrets, so an unrequested change there needs an explanation before anything merges.

---

## Question 4
You want to sell products with a cart and card checkout. Is GitHub Pages the right host?

- A) Yes, Pages is built for online stores
- B) Yes, but only on a paid GitHub plan
- C) No, Pages can't use custom domains
- D) No, GitHub's usage limits say Pages isn't meant to run e-commerce or software as a service

**Answer:** D

**Explanation:** Pages is static hosting for sites like landing pages and docs; GitHub's limits rule out using it as a free host for commercial transactions or SaaS.

---

## Question 5
A weekly workflow needs a key for your team chat. Where should the key go?

- A) In the workflow file so it's easy to find
- B) In the README, in a private repo
- C) In an Actions repository secret, as a dedicated limited key
- D) In an issue comment assigned to Copilot

**Answer:** C

**Explanation:** Actions secrets are encrypted and never shown again, while anything in files or comments stays in history and spreads to every copy.

---

## Question 6
You assigned an issue to Copilot, then realized the button text should change. Where do you tell it?

- A) Comment on Copilot's pull request starting with @copilot
- B) Add a comment to the original issue
- C) Edit the issue title
- D) Unassign and reassign the issue every time

**Answer:** A

**Explanation:** Copilot reads the issue when assigned and doesn't see later issue comments; an @copilot comment on its pull request starts a new session on the same branch.

---

## Question 7
Copilot's pull request is ready, but the required link check hasn't run. What is the safe next step?

- A) Turn off "Require approval for workflow runs" permanently
- B) Merge anyway since the change looks small
- C) Glance at the changes, then click Approve and run workflows in the merge box
- D) Delete the link-check workflow

**Answer:** C

**Explanation:** GitHub holds workflow runs on Copilot's pushes by default because workflows can access secrets; you approve them after a look at the changes.

---

## Question 8
Which issue is the best candidate to hand to Copilot cloud agent first?

- A) "Fix whatever is wrong with the checkout"
- B) "Add a footer with business hours and contact email to index.html only; no other changes"
- C) "Rework how we store client tax records"
- D) "Handle the outage on the client portal right now"

**Answer:** B

**Explanation:** GitHub recommends clear, well-scoped tasks for the agent and keeping ambiguous, sensitive or production-critical work under closer human control.

---
