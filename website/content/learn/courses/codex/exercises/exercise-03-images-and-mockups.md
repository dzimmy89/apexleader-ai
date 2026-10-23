---
module: 1
lesson_number: 3
course: codex
template: v2
---

# Exercise 3: Design and Build a Client Intake Form

:::key-concept
You'll generate three mockups of a client intake form, refine one, have Codex build it to match, compare the two in the in-app browser, and produce a matching icon set with transparent backgrounds. At the end you'll have a working (not yet connected) intake form and a small set of brand assets.
:::

**Time:** 30 minutes · **You'll need:** Codex, your tools project from Exercises 1 and 2 · **Builds on:** Lesson 3

## Warm-up

:::checkpoint
Q: Your favorite mockup has the headline painted into the image. What's the right way to build it?
- [ ] Use the image as the page, since it already looks right
- [x] Rebuild the layout in HTML and CSS with the headline as real text
- [ ] Put the image on the page and repeat the headline underneath
Why: Text inside an image can't be edited, read by screen readers or found by search engines, and may contain spelling errors.
:::

## Steps

1. **Create a branch.** In Codex (local), ask: "Create a new branch called intake-form." Everything in this exercise goes on that branch.

2. **Generate three mockups.**

```text
Read AGENTS.md. Generate three phone-size (9:16) mockups of a one-page
client intake form for Groomer Books. Fields: name, business name, email,
number of bank accounts, monthly transactions (dropdown: under 150,
150 to 300, over 300), "What's your biggest bookkeeping headache?"
(text box), Submit button. Use made-up sample entries only.
A: warm cream with rounded fields. B: clean white with teal accent.
C: one question per screen with a progress bar. Save to /mockups.
```

3. **Pick and refine.** Choose one and give two or three specific changes. Save the final as `/mockups/intake-final.png`. Stop after three rounds.

4. **Build it.**

```text
Build /intake/index.html to match /mockups/intake-final.png as closely as
plain HTML and CSS allow. All text as real HTML. Labels tied to inputs.
The form must not send data anywhere: on submit, show "Thanks, we'll be in
touch within one business day." Add a one-line privacy note under the
email field. Open it in the in-app browser at phone width, screenshot it,
and list every difference from the mockup.
```

5. **Compare and comment.** Put the mockup and the in-app browser side by side. Comment on two things directly in the browser view and let Codex fix them.

6. **Make matching icons.**

```text
Create four simple line icons in the same style as the intake form: bank
feeds, receipt photos, monthly report, tax-time ready. Transparent
background, 512 x 512. Save to /images/icons, then make web copies under
20 KB each and report file sizes.
```

7. **Check every image.** Zoom in on each icon and mockup. Look for odd shapes, any accidental text, anything that resembles a real brand. Regenerate anything that fails.

8. **Commit and open a pull request.** Ask Codex to commit on the branch, push, and open a pull request that lists the files added. Review it on GitHub and merge.

## Done when

- [ ] Three mockups were generated and one was refined into `intake-final.png`
- [ ] `/intake/index.html` matches the mockup closely, uses real HTML text, and sends no data
- [ ] Four icons with transparent backgrounds, each under 20 KB for the web
- [ ] Every image passed your text, detail and likeness check
- [ ] Everything was merged through a pull request

:::coached
**For 1-on-1 coaching clients.** Design the screen that matters most to your revenue.

1. Pick your highest-value screen (booking, quote request, onboarding) and generate three mockups that test different approaches, not just colors.
2. Build the strongest one, and write the five questions you'd ask a real customer looking at it.
3. Draft the plan for connecting the form to where data should go (CRM, inbox), including what you'll approve before it goes live and what customer data it collects and why.

**Bring to your session:** the mockups, the built screen, your five questions, and the data plan.

**Your coach will:**
- Critique the design against your audience and goal
- Review the data plan for privacy and collection you don't need
- Help you plan a short test with two or three real customers
:::
