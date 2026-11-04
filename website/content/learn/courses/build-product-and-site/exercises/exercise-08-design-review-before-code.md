---
module: 2
lesson_number: 8
course: build-product-and-site
template: v2
---

# Exercise 8: Review It, Then Build It

:::key-concept
You'll take version E from Exercise 6 through the ten-point check, get a critique from a fresh agent, fix the frame on the canvas, write a handoff note, and have the agent build it. Then you'll run the same ten checks on the preview.
:::

**Time:** 60 minutes · **You'll need:** Your Paper frame from Exercise 6, your agent with the `frontend-design`, design system and voice skills, your repo with preview links · **Builds on:** Lesson 8

:::video
id: bp-ex8-setup
kind: exercise-setup
status: paused
src: /learn/video/build-product-and-site/bp-ex8-setup.mp4
captions: /learn/video/build-product-and-site/bp-ex8-setup.vtt
poster: /learn/video/build-product-and-site/bp-ex8-setup.jpg
transcript: In this exercise your design goes through the gate. Run the ten-point check on version E at desktop and phone width. Start a fresh agent session for a critique of five problems. Fix what serves your goal, on the canvas. Write the handoff note, have the agent build it, and run the same ten checks on the preview.
:::

## Warm-up

:::checkpoint
Q: What's the minimum contrast for body text?
- [ ] 2 to 1
- [ ] 3 to 1
- [x] 4.5 to 1
Why: Body text needs at least 4.5 to 1 against its background. Large text can go down to 3 to 1, which is why a colour can pass on a big button and fail on small text.
:::

## Steps

1. **Write the goal.** One sentence, like "A truck owner on a phone understands the price and starts in under ten seconds." Put it at the top of `design/review.md`.

2. **Run the ten-point check** from Lesson 8 on version E at 1440 and 390 wide. Ask the agent to measure contrast for every text and background pair. Mark each check pass or fail.

3. **Get a fresh critique.** Start a new agent session with only the goal and two screenshots, using the Lesson 8 prompt. Paste its five points into `design/review.md`.

4. **Decide.** For each point: accept or skip, with a reason.

5. **Fix on the canvas.** In the original session, have the drawing agent fix the failed checks and accepted points in Paper. Re-run the failed checks.

6. **Write the handoff note** in the Lesson 8 format: frame names, decisions, out of scope, done when.

7. **Build it.** Ask the agent to read the frames from Paper and build the screen from the handoff note, then open a pull request.

8. **Check the preview.** Open the preview next to the frames, at both widths, and run the ten checks again. Send back anything that drifted.

9. **Merge** when the preview passes.

## Done when

- [ ] `design/review.md` has the goal, the ten checks, the fresh critique and your decisions
- [ ] Every failed check is fixed on the canvas before the build
- [ ] A handoff note exists in the `specs` format
- [ ] The preview passes the same ten checks, and you've merged it

:::example
title: See an example result

For Rolling Ledger's pricing page, version E failed two checks: on a phone the Start button was below the fold, and the coral subtitle measured about 3 to 1 against cream, too light for small text. The fresh critique found both, plus three more; the founder accepted a shorter comparison on phones and skipped a testimonial carousel ("out of scope"). After fixes on the canvas, the build matched the frames, except the price wrapped on one phone width, which the agent fixed in the same pull request. All ten checks passed on the preview.

:::video
id: bp-ex8-reveal
kind: exercise-reveal
status: paused
src: /learn/video/build-product-and-site/bp-ex8-reveal.mp4
captions: /learn/video/build-product-and-site/bp-ex8-reveal.vtt
poster: /learn/video/build-product-and-site/bp-ex8-reveal.jpg
transcript: Here's the Rolling Ledger review. Two failed checks, caught on the canvas and fixed in a sentence each. A fresh critique with five points, three taken. A one-page handoff note. And a preview that passes all ten checks after one small fix. The design was settled before a line of code was written.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Make the gate a habit.

1. Add the ten checks to your `specs` skill as a design section.
2. Decide which screens always get a fresh critique.
3. Review one of your live pages with the checklist.

**Bring to your session:** `design/review.md`, the handoff note and the merged pull request.

**Your coach will:**
- Review your accept and skip decisions
- Check the preview against your goal
- Help you tune the checklist for your product
:::
