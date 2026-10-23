---
module: 1
lesson_number: 4
course: ai-marketing
template: v2
---

# Exercise 4: Set Up a Launch Kit and Its Weekly Sweep

:::key-concept
You'll gather your launch assets in one folder, write the Offer Facts page they all follow, and run your first consistency sweep with a Dot (or ChatGPT as a fallback). At the end you'll have a clean launch kit and a change list you approved line by line.
:::

**Time:** 30 minutes · **You'll need:** ChatGPT with Dots (Pro or Business Premium at launch; plain ChatGPT or Claude works for the manual version), Google Drive or a ChatGPT Space, your website · **Builds on:** Lesson 4

## Warm-up

:::checkpoint
Q: Your Dot's Custom Rules say "require approval before sending email." It drafts a note to a partner with your new pricing. You approve that one email. What has the Dot now been allowed to do?
- [x] Send that one approved email, and nothing more
- [ ] Email that partner whenever pricing changes
- [ ] Email any partner about pricing
Why: OpenAI says approving one message does not grant ongoing permission to contact people. Each send needs its own approval unless you change the rule.
:::

## Steps

1. **Make the folder.** Create `Launch Kit` in Google Drive or a ChatGPT Space. Add every asset that describes your offer: one-pager, sales email templates, FAQ, partner blurb, and links to your homepage and pricing page. Using Groomer Books? Ask Claude to draft a one-pager, two sales emails and an FAQ first, then add them.

2. **Write Offer Facts.** Create a page called `Offer Facts`, dated today, with: name, who it's for, plans and prices, what's included, what's not, guarantee, three main features, launch date, key links. Keep it under one page.

3. **Plant a change.** To test the sweep, change one fact in Offer Facts (for example, add an annual plan at a discount) without updating any other asset.

4. **Create the Dot.** Name it `Launch Dot`. Connect only the Launch Kit folder (and your site repo, with pull-request permission, if you have one). In Settings, add Custom Rules: never send email or messages to anyone but you, never publish or merge, never delete files, ask before editing any original document.

5. **Give it the job.** Paste the job from Lesson 4. No Dots access? Paste the same prompt into ChatGPT or Claude and attach the files manually.

6. **Run the sweep.** Ask:

   ```text
   Run the launch-kit sweep now. Compare every asset with Offer Facts. Return a
   table: asset | current text | proposed text | Offer Facts line. Mark price,
   guarantee and legal-claim changes HIGH. Then wait for my approval.
   ```

7. **Approve line by line.** Reply with which lines to approve, reject or rewrite. Ask the Dot to create marked-up draft copies (not edit originals) and, if connected, one pull request for your site.

8. **Check its work.** Confirm it caught your planted change everywhere. Spot-check two "current text" quotes against the real assets. Open Activity View and confirm it touched only the Launch Kit and repo. Then replace the originals yourself and merge the pull request if it's right.

## Done when

- [ ] Offer Facts is dated and every asset in the Launch Kit agrees with it
- [ ] The sweep found your planted change in every place it appeared
- [ ] Custom Rules block sending, publishing, merging and deleting
- [ ] You, not the Dot, replaced the originals and merged any site change

:::coached
**For 1-on-1 coaching clients.** Extend the kit to your whole public footprint:

1. Add your directory listings, Google Business Profile text and social bios to the sweep (read-only), so mismatches outside your site show up too.
2. Add a "claims check" step: the Dot lists every claim in your assets that has no source in Offer Facts.
3. Schedule the sweep weekly and run it for two weeks.

**Bring to your session:** Offer Facts, two weeks of sweep tables, your Custom Rules and the list of unsourced claims.

**Your coach will:**
- Review your claims list and decide with you what to cut, prove or soften
- Check that your Custom Rules and connectors match the job, nothing wider
- Help you decide which assets deserve a faster update cycle
:::
