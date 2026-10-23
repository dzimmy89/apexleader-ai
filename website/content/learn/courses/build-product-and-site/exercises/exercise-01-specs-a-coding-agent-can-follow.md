---
module: 1
lesson_number: 1
course: build-product-and-site
template: v2
---

# Exercise 1: Write the SPEC.md for Your Landing Page

:::key-concept
You'll set up your site's project folder and write a one-page SPEC.md, with your real copy in a /content folder, that a coding agent can build from without guessing. Every later exercise in this course builds from this file.
:::

**Time:** 30 minutes · **You'll need:** a Claude account (any plan), a text editor, your Validated Offer Doc from Find and Validate the Idea if you have it · **Builds on:** Lesson 1

## Warm-up

:::checkpoint
Q: Which line belongs in the "Done when" section of a spec?
- [ ] The page should feel modern and trustworthy
- [x] Screenshots at 375px and 1280px wide show every section with nothing cut off
- [ ] Use a nice blue for the buttons
Why: "Done when" items must be checks an agent can run and report pass or fail on. Feelings and colors belong in other sections.
:::

## Steps

1. **Pick your business.** Use your own, or the sample: Groomer Books, monthly bookkeeping for independent dog groomers, $149 a month, goal is a booked 15-minute call. Write one sentence: who it's for, what they get, the one action you want.

2. **Make the folder.** Create a folder named after your business plus `-site` (for example `groomer-books-site`) with a subfolder `content`. Keep it out of folders that hold personal or financial files.

3. **Run the interview.** Open Claude (a Project for your business is ideal) and paste:

    ```text
    I'm a non-technical founder. I want a one-page landing page for my business:
    [your one sentence].

    Interview me one question at a time until you can write a complete spec a coding
    agent could build without guessing. Cover: the visitor and where they'll read it,
    the single action I want, every section and its copy, tone, technical rules,
    what's out of scope, and how we'll check it's done.
    Skip obvious questions. Push on what I haven't thought about.
    When done, write SPEC.md with these headings: Goal, Audience, Sections, Rules,
    Out of scope, Done when. Under one page.
    ```

    Answer honestly. When you don't know, ask Claude for two options and pick one.

4. **Write the copy files.** Ask Claude to draft each copy file, then edit them yourself in your own words:

    ```text
    Using SPEC.md and what I told you, draft these files as plain text:
    content/hero.md (headline under 10 words, subhead under 25 words, button text),
    content/problem.md (three pains in my customer's words),
    content/how-it-works.md (three steps),
    content/price.md (only the price I gave you; if I didn't give one, write [TODO]),
    content/faq.md (five questions and short answers).
    Do not invent testimonials, client names, numbers or guarantees.
    ```

    Save each file into `content/`. Replace anything that doesn't sound like you.

5. **Add the guardrail lines.** Make sure SPEC.md's Rules section includes: "Use the copy in /content exactly. If copy is missing, write [TODO] and list it." and "No testimonials, logos or numbers that aren't real." and "No analytics, cookies or third-party scripts in version 1."

6. **Stress-test it.** In a fresh Claude chat, attach SPEC.md and paste:

    ```text
    You are a coding agent about to build this. Don't build. List every assumption
    you'd have to make, every ambiguous line, and anything missing to meet "Done when."
    ```

    Fix SPEC.md for every item that matters. Repeat once.

## Done when

- [ ] A project folder exists with SPEC.md and a content/ folder holding at least hero, problem, how-it-works, price and faq files
- [ ] SPEC.md fits on one page and has all six headings: Goal, Audience, Sections, Rules, Out of scope, Done when
- [ ] Every "Done when" item is a check that returns pass or fail
- [ ] The Rules section forbids invented testimonials, numbers and tracking scripts
- [ ] A fresh Claude chat finds no more than two minor ambiguities

:::coached
**For 1-on-1 coaching clients.** Spec your real page against a real competitor.

1. Find the two competitors your customers mentioned most and screenshot their landing pages on a phone.
2. Ask Claude to compare those pages to your SPEC.md: what they promise, what proof they show, what the call to action is. Add a "Positioning" section to SPEC.md with the one thing your page says that theirs don't.
3. Rewrite your hero copy three ways, each anchored to a different pain from your interview notes, and keep all three in content/hero-options.md.
4. Add a second page to scope or explicitly rule it out (for example a short "About" page), and justify the choice in SPEC.md.

**Bring to your session:** SPEC.md, your content/ folder, the competitor screenshots and the three hero options.

**Your coach will:**
- Red-pen the spec for gaps an agent would fill with guesses
- Pick the strongest hero option with you and test it out loud against your customer
- Check that every claim on the page is one you can back up
:::
