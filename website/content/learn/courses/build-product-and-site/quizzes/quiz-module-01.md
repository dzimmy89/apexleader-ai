# Module 1 Quiz: Build the Product and the Site
Checks that you can spec, build, review and launch a landing page with agents while you keep the approval click.

---

## Question 1
You're about to hand your landing page to a coding agent. Which addition to SPEC.md will most improve what comes back?

- A) A longer description of the mood you want, with more adjectives
- B) A "Done when" section with checks the agent can run and report pass or fail on
- C) A list of ten websites you like
- D) A note asking the agent to be creative

**Answer:** B

**Explanation:** Checks the agent can run let it test and fix its own work before reporting, instead of stopping when the page merely looks done.

---

## Question 2
Your agent's first draft includes three glowing customer testimonials, but you have no customers yet. What should change?

- A) Keep them until real ones arrive, since every landing page has testimonials
- B) Edit the names so they sound less generic
- C) Remove them and add "No testimonials, logos or numbers that aren't real" to the spec's Rules
- D) Move them lower on the page

**Answer:** C

**Explanation:** Invented social proof misleads customers and can break consumer protection rules; writing the rule into the spec stops it recurring.

---

## Question 3
In Claude Code or Cursor, what is the main purpose of plan mode before a build?

- A) The agent reads your spec and files and proposes a plan without editing anything, so you can fix the plan first
- B) It makes the agent build faster by skipping checks
- C) It lets two agents edit the same file at once
- D) It publishes a preview of the site to the internet

**Answer:** A

**Explanation:** Plan mode separates exploring and planning from editing, so a misunderstanding gets caught in the plan rather than in the code.

---

## Question 4
Codex gives you a perfect hero image with your headline painted into the picture. What's the best move?

- A) Use it, since it matches the mockup
- B) Regenerate without text and keep the headline as real HTML text
- C) Convert it to a PDF
- D) Add the same headline in a caption below it

**Answer:** B

**Explanation:** Text in an image can't be edited, read by screen readers or indexed by search engines, and may contain misspellings.

---

## Question 5
An agent opens a pull request for a typo fix, and Files changed shows a new tracking script. Your AGENTS.md forbids tracking without asking. What do you do?

- A) Merge it and remove the script later
- B) Ask the agent to merge it, since it opened the PR
- C) Delete the repository and start over
- D) Comment on the pull request asking for the script to be removed, and merge only once the PR contains just the typo fix

**Answer:** D

**Explanation:** The pull request is your approval gate; you merge only changes that match what you asked for and your rules.

---

## Question 6
You're connecting your domain to GitHub Pages. What's the correct order?

- A) Add the A records, wait a day, then add the domain in GitHub
- B) Enforce HTTPS, then add the DNS records
- C) Verify the domain in GitHub, add it under Settings then Pages, add the DNS records, then enforce HTTPS
- D) Point your nameservers to GitHub

**Answer:** C

**Explanation:** Adding the domain at the host before pointing DNS prevents someone else from claiming it, and HTTPS needs working DNS first.

---

## Question 7
Your site loads at www.yourdomain.com but HTTPS won't turn on after several hours. What's the most likely cause?

- A) Your HTML has a typo
- B) An extra or leftover DNS record, such as an old parking A record on the apex
- C) The images are too large
- D) You need to buy a certificate

**Answer:** B

**Explanation:** Hosts issue free certificates automatically once DNS checks pass, and stray or duplicate records are the usual reason the check fails.

---

## Question 8
Which task should stay with you and not be handed to an agent?

- A) Drafting the FAQ copy for your review
- B) Creating a branch and opening a pull request
- C) Logging in to your domain registrar and changing DNS records
- D) Taking screenshots at phone and laptop width

**Answer:** C

**Explanation:** Your registrar login controls your website and email, so you keep it, protect it with two-factor authentication, and make DNS changes yourself from the agent's list.

---
