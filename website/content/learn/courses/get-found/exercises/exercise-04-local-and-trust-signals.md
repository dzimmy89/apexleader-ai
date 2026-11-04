---
module: 1
lesson_number: 4
course: get-found
template: v2
---

# Exercise 4: Build Your Trust Checklist and Publish an Author Page

:::key-concept
You'll check every trust signal your business has today, fix your business details everywhere, set up a business listing if you're eligible, send your first honest review requests, and publish an author page. At the end, search engines and assistants have consistent, checkable evidence that you're real.
:::

**Time:** 40 minutes · **You'll need:** your site's repository, Claude or another writing assistant, a list of 5 recent happy customers, links to your official profiles · **Builds on:** Lesson 4

:::video
id: gf-ex4-setup
kind: exercise-setup
status: paused
src: /learn/video/get-found/gf-ex4-setup.mp4
captions: /learn/video/get-found/gf-ex4-setup.vtt
poster: /learn/video/get-found/gf-ex4-setup.jpg
transcript: In this exercise you'll make your business easy to trust. Write one version of your details and fix any profile that differs. Set up Google Business Profile only if you meet customers in person. Send five honest review requests, with no incentives. Then write a fact sheet about your real experience, have Claude turn it into an author page, remove anything you can't prove, and publish it through a pull request.
:::

:::infographic
id: fig-1
type: anatomy
title: Your blank trust checklist
shows: A paper checklist with six rows and empty boxes: one version of business details written, profiles checked and fixed, business listing (or "not eligible" noted), five review requests sent, author fact sheet written, author page published with Person markup.
data: none
alt: Six trust tasks to tick off: write one version of your details, fix your profiles, set up a listing if eligible, send review requests, write a fact sheet and publish the author page.
:::

## Warm-up

:::checkpoint
Q: Claude's draft of your about page says "trusted by hundreds of businesses". You've had 22 customers. What do you do?
- [ ] Keep it, it's only marketing
- [x] Replace it with the true number or remove it
- [ ] Change it to "trusted by many businesses"
Why: Trust signals only work if they're true and checkable. A vague or false claim weakens the page and can be unlawful advertising.
:::

## Steps

1. **Write your one version.** In a doc called `Business Details`, write the exact name, a one-line description, website, email, phone, address if shown, and founder name and title.

2. **Find your profiles.** Ask Claude or Grok to search for your business name and list every profile and directory page with the details each shows. Add any you know of that it missed.

3. **Fix the differences.** Update every profile you control to match your one version. List the ones you don't control, such as an old directory listing, and note how to request a change.

4. **Business listing.** If you meet customers in person or travel to them, create or claim your Google Business Profile and add Bing Places. If you're online only, write "Not eligible: online only" in your checklist and move on.

5. **Send five review requests.** Use the review prompt from Lesson 4 to draft a message for each of five recent happy customers. Send them yourself from your own email, with the review link for the platform your buyers check.

6. **Write a fact sheet.** In a doc, list the facts about you: years in the field, roles, numbers you can prove, notable clients you're allowed to name, why you started the business, and links to your official profiles.

7. **Draft the author page.** Give Claude the fact sheet and ask:

   ```text
   Write an author and about page from this fact sheet only. Sections: who I am,
   what I've done in this field, why I started this business, how to check me,
   how to contact me. Plain, specific sentences. No claims beyond the fact sheet.
   List anything you'd want me to confirm.
   ```

8. **Make it true.** Remove or fix anything you can't prove. Add a real photo.

9. **Publish it.** Ask your builder agent to add the page, link it from the site footer and from every article's author line, and add Person structured data that matches the page. Review the pull request and merge.

## Done when

- [ ] Your `Business Details` doc exists and every profile you control matches it
- [ ] You have a business listing, or a note that you're not eligible
- [ ] Five honest review requests are sent
- [ ] Your author page is live, linked from the footer, with Person markup that passes the Rich Results Test

:::example
title: See an example result

Rolling Ledger found 9 profiles, and 4 had an old tagline from before the founder narrowed the business to food truck owners. She fixed 3 herself and asked one directory to update its listing. Rolling Ledger is software sold online, so it isn't eligible for a Business Profile. Five review requests went out and 2 reviews came in within a week. The author page says she kept the books for 40 food trucks over 9 years, links her LinkedIn, and is marked up as a Person.

:::video
id: gf-ex4-reveal
kind: exercise-reveal
status: paused
src: /learn/video/get-found/gf-ex4-reveal.mp4
captions: /learn/video/get-found/gf-ex4-reveal.vtt
poster: /learn/video/get-found/gf-ex4-reveal.jpg
transcript: Here's the Rolling Ledger result. Nine profiles found, four with an old tagline, all now fixed or requested. It's online-only, so no Business Profile, and that's noted. Five honest review requests brought two reviews in a week. The author page went from "we're passionate about small business" to forty trucks over nine years, with a real photo, profile links and Person markup that passes the test.
:::

:::infographic
id: fig-2
type: anatomy
title: A finished trust checklist
shows: The same six-row checklist, now ticked: details doc written, 9 profiles checked and 4 fixed, "Not eligible: online only" for the listing, 5 requests sent with 2 reviews in, fact sheet written, author page live with Person markup passing. A small preview of the author page sits beside it.
data: 9 profiles, 4 fixed, 5 requests, 2 reviews.
alt: Every trust task ticked for Rolling Ledger: consistent details on 9 profiles, a note that it's not eligible for a listing, 2 new reviews from 5 requests, and a live author page with Person markup.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Build a trust plan for the year.

1. List the three review platforms your buyers check most and your current rating and count on each.
2. Write a short case study with one customer's real numbers, with their written permission.
3. Draft a reply template for a negative review, in your own voice.

**Bring to your session:** your details doc, profile list, author page, the case study draft and the reply template.

**Your coach will:**
- Check your author page for missing or weak evidence
- Help you pick the review platform to focus on
- Review the case study for claims you can't back up
:::
