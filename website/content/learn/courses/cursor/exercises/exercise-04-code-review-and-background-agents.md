---
module: 1
lesson_number: 4
course: cursor
template: v2
---

# Exercise 4: Delegate From Your Phone, Review With Bugbot

:::key-concept
You'll connect your site repo to Cursor, add review rules for Bugbot, send a cloud agent a task from your phone or browser, and run its pull request through Bugbot and your own two-minute review before merging. At the end you'll have a delegate, review, merge loop that works when you're away from your desk.
:::

**Time:** 30 minutes · **You'll need:** Your site project on GitHub (see the GitHub for Non-Developers course), a Cursor Premium tier or higher for cloud agents and Bugbot, a phone or browser · **Builds on:** Lesson 4

## Warm-up

:::checkpoint
Q: A cloud agent needs to test your contact form, which sends email through a service. What should it get?
- [ ] Your main email service API key, pasted into the task
- [ ] Your email login, so it can check the inbox
- [x] Nothing that sends real email; ask it to test with the form disabled or a test key you add as a dashboard secret
Why: Cloud agents run commands freely inside their machine, so keep live sending keys away from them. Anything that leaves the business needs a human click.
:::

## Steps

1. **Push your project to GitHub** if it isn't there yet. Ask Agent: "Publish this project to a new public GitHub repository called groomer-books-site using the gh tool. Show me the file list before the first push." Log in to `gh` yourself in the browser when asked.

2. **Connect GitHub to Cursor with minimum access.** In the Cursor dashboard, connect GitHub and choose only `groomer-books-site`.

3. **Turn on Bugbot.** In the dashboard, open **Bugbot** under Automations and enable it for this repository.

4. **Add review rules.** On a branch, ask Agent to create `.cursor/BUGBOT.md`:

```text
Create .cursor/BUGBOT.md with these review rules:
- Flag any new third-party script, tracker, font or external request
- Flag any file that looks like it contains a key, password, token or email list
- Flag pricing text outside content/pricing.md
- Flag any form that posts data anywhere new
- Flag http links and images over 250 KB or missing alt text
Commit it, push, and open a pull request. Don't merge.
```

Merge that pull request yourself after a quick review.

5. **Send a cloud agent a task from your phone.** On your phone (cursor.com/agents or the iOS app) or in a browser, choose the repository and send:

```text
Add a "Testimonials" section after "How it works" with these three
placeholder quotes, clearly marked as placeholders:
"PLACEHOLDER: Saved me five hours a month." - Groomer, Austin
"PLACEHOLDER: Finally ready for tax time." - Salon owner, Denver
"PLACEHOLDER: Worth every penny." - Mobile groomer, Tampa
Follow AGENTS.md. Screenshot at 375px and 1280px. Open a pull request with
a summary and screenshots. Don't merge.
```

If asked to set a spend limit, set a low one.

6. **Let Bugbot review.** When the pull request opens, wait for Bugbot's comments. If none appear, comment `bugbot run`. Read every comment. For anything real, either comment `@cursor` with a fix request, or let Autofix create a fix on a new branch and review that too.

7. **Teach it one thing.** Comment on the pull request: `@cursor remember testimonials must be from real, consenting customers before launch`.

8. **Your review, then merge.** Do the two-minute review (summary, files changed, screenshots, checks). Merge only when you're satisfied. Then add a task to your list: replace placeholders with real quotes, with permission, before launch.

## Done when

- [ ] Cursor has GitHub access to this one repository only
- [ ] Bugbot is enabled and `.cursor/BUGBOT.md` is merged on `main`
- [ ] A cloud agent started from your phone or browser opened a pull request
- [ ] Bugbot reviewed it, and you handled each comment before you merged
- [ ] Your spend limit is set

:::coached
**For 1-on-1 coaching clients.** Make the loop part of your week.

1. Pick three real backlog items and send each to a cloud agent from your phone over a day, noting time to pull request and how much rework each needed.
2. Review Bugbot's comments across those pull requests: which were useful, which were noise, and which rule would reduce the noise.
3. Decide your Autofix mode and your monthly spend limit, in writing.

**Bring to your session:** the three pull requests, your Bugbot notes, and your Autofix and spend decisions.

**Your coach will:**
- Review the pull requests and Bugbot findings with you
- Help tune BUGBOT.md to cut noise without missing real issues
- Check that no cloud agent has access to live keys, payments or customer data
:::
