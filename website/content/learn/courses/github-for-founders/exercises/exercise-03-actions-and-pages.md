---
module: 1
lesson_number: 3
course: github-for-founders
template: v2
---

# Exercise 3: Publish Your Site and Add a Robot Reviewer

:::key-concept
You'll publish your site repo with GitHub Pages, add a workflow that checks every pull request for broken links, and make that check required before merging. At the end you'll have a live URL that updates on merge and a second reviewer that never sleeps.
:::

**Time:** 35 minutes · **You'll need:** Your public site repo and `protect-main` ruleset from Exercise 2 · **Builds on:** Lesson 3

## Warm-up

:::checkpoint
Q: Which of these is a good fit for GitHub Pages?
- [ ] An online store that takes card payments
- [x] A landing page and a help center for your service
- [ ] A client portal with logins and a database
Why: Pages hosts static sites, and GitHub's usage limits say it isn't meant to run e-commerce or software as a service. Marketing pages and docs are a normal use.
:::

## Steps

1. **Turn on Pages.** In your site repo, open **Settings**, then **Pages**. Under Build and deployment, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.

2. **Find your URL.** Refresh the Pages settings after a minute or two. Copy the live address (it looks like `yourname.github.io/groomer-books-site`). Open it on your phone.

3. **Watch the deploy.** Click the **Actions** tab. You'll see a "pages build and deployment" run. Click it and look at the steps. This is what runs every time you merge.

4. **Add a link-check workflow through a pull request.** On the Code tab, click **Add file**, then **Create new file**. Name it `.github/workflows/check-links.yml` and paste:

```text
name: Check links
on:
  pull_request:
  workflow_dispatch:
jobs:
  links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check links in HTML files
        uses: lycheeverse/lychee-action@v2
        with:
          args: --no-progress './**/*.html'
          fail: true
```

Commit it on a new branch called `add-link-check` and open a pull request. In the description, write one line on what each `uses:` line does (checkout copies the repo; lychee is a widely used open-source link checker). This is you practicing the high-risk review for workflow files.

5. **Merge it**, then open the **Actions** tab, choose **Check links**, and click **Run workflow** to see it run on `main`.

6. **Make it required.** Open **Settings**, then **Rules**, then **Rulesets**, then `protect-main`. Tick **Require status checks to pass**, add the `links` check, and save.

7. **Test with a broken link.** Create a branch `test-broken-link`, edit `index.html`, and add:

```text
<p><a href="https://example.com/this-page-does-not-exist-12345">Our old pricing</a></p>
```

Open a pull request. Wait for the check. It should go red and the merge button should be blocked. Open the failed run and find the line that names the broken link. Then close the pull request without merging and delete the branch.

8. **Optional: your domain.** If you own a domain, add it under Settings, Pages, Custom domain, follow GitHub's DNS instructions at your registrar, and tick **Enforce HTTPS** when available.

## Done when

- [ ] Your site is live on a github.io address (or your domain) and updates when you merge
- [ ] A link-check workflow runs on every pull request
- [ ] `protect-main` requires the check, and a pull request with a broken link was blocked
- [ ] You can explain what each line of the workflow's `uses:` steps does

:::coached
**For 1-on-1 coaching clients.** Build the checks your real site needs.

1. List the three ways your live site could embarrass you (broken booking link, huge images, missing contact info) and ask a coding agent to write one workflow check for each, delivered as separate pull requests.
2. Review each workflow with the high-risk checklist: trigger, every `uses:` publisher, any secrets, any step that sends data outside GitHub.
3. If a check needs a key (for example to ping your team chat), create a dedicated, limited key and store it as an Actions secret.

**Bring to your session:** the three workflow pull requests and any questions about third-party actions.

**Your coach will:**
- Review the workflows for risky triggers, unknown publishers and secret exposure
- Help you decide which checks should block merging
- Confirm your Pages use fits GitHub's usage limits, or plan a move to a dedicated host
:::
