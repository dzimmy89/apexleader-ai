---
module: 2
lesson_number: 6
course: build-product-and-site
template: v2
---

# Exercise 6: Four Versions, One Merge

:::key-concept
You'll connect Paper to your agent, have it draw four genuinely different versions of one screen on your site, all on brand, then merge the best parts of two into a fifth and check it at phone width. At the end you'll have a chosen frame ready for review in Lesson 8.
:::

**Time:** 50 minutes · **You'll need:** Paper Desktop, Claude Code, Codex or Cursor, your design system skill from the Agent Skills course · **Builds on:** Lesson 6

:::video
id: bp-ex6-setup
kind: exercise-setup
status: paused
src: /learn/video/build-product-and-site/bp-ex6-setup.mp4
captions: /learn/video/build-product-and-site/bp-ex6-setup.vtt
poster: /learn/video/build-product-and-site/bp-ex6-setup.jpg
transcript: In this exercise you'll pick one screen and see it four ways. Install Paper and connect your agent. Write four named directions. Ask for all four on the canvas, on brand and with the same content. Then write one sentence that merges the best parts of two, and check the result at phone width.
:::

## Warm-up

:::checkpoint
Q: What has to be open for the agent to draw in Paper?
- [ ] Only the agent
- [x] Paper Desktop, with a file open
- [ ] A browser tab on paper.design
Why: The desktop app runs the MCP server, and the agent's reads and writes go to the open file.
:::

## Steps

1. **Install Paper.** Download Paper Desktop, open it and create a file named after your screen, like `pricing-page`.

2. **Connect your agent.** Use the MCP panel's **Add to** button, or the Lesson 6 commands. Restart the agent and confirm Paper is listed (`/mcp` in Claude Code).

3. **Check your design system skill** is installed in the agent. If you skipped the Agent Skills course, write a short one now with your colours and fonts.

4. **Pick one screen** you'd like to improve, and gather its real content: headings, prices, button text.

5. **Write four directions.** One line each, as different as Lesson 6's A to D. Save them in `design/four-versions.md`.

6. **Ask for the four versions** with the Lesson 6 prompt, changed for your screen. Ask the agent to screenshot each and say which it would pick and why.

7. **Pick parts.** Write one merge sentence naming what to take from which version. Ask for version E next to the others.

8. **Check at phone width.** Ask for a 390-wide copy of E. Note anything that breaks and ask for fixes.

9. **Note what you chose and why** in `design/four-versions.md`.

## Done when

- [ ] Paper is connected to your agent
- [ ] Four labelled, genuinely different versions are on the canvas, all in your brand
- [ ] Version E merges parts of at least two of them, with a 390-wide copy
- [ ] `design/four-versions.md` records the directions, the merge and why

:::example
title: See an example result

For Rolling Ledger, the four pricing pages were all in ink, coral and cream with the brand's two fonts. The agent recommended D for speed. The founder merged A's big $149 with C's "doing it yourself vs Rolling Ledger" comparison, and kept B's first sentence ("Most truck owners do their books at midnight in March") as the subtitle. At 390 wide, the comparison pushed the Start button down, which the founder noted for review. Free-tier MCP calls ran out once; she upgraded for the month.

:::video
id: bp-ex6-reveal
kind: exercise-reveal
status: paused
src: /learn/video/build-product-and-site/bp-ex6-reveal.mp4
captions: /learn/video/build-product-and-site/bp-ex6-reveal.vtt
poster: /learn/video/build-product-and-site/bp-ex6-reveal.jpg
transcript: Here are the four Rolling Ledger pricing pages on the canvas, and version E next to them: A's big price, C's comparison and B's opening line. The phone copy shows one problem, the Start button sits too low, which goes on the list for the design review in Lesson 8.
:::
:::

:::coached
**For 1-on-1 coaching clients.** Choose with a second opinion.

1. Bring your four versions and version E.
2. Write the one goal the screen has to meet.
3. List what you'd test with a real customer.

**Bring to your session:** the Paper file and `design/four-versions.md`.

**Your coach will:**
- Review your directions for real differences
- Pressure-test your merge against the goal
- Help you plan a quick test with one customer
:::
