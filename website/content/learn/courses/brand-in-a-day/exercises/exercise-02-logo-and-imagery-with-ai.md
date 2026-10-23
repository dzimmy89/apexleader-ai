---
module: 1
lesson_number: 2
course: brand-in-a-day
template: v2
---

# Exercise 2: Make Your Logo Set and Image Style

:::key-concept
You'll explore logo concepts with an AI image tool, rebuild the winner as a clean SVG logo set with your own design choices, run a basic trademark check, and write image style rules with three on-brand images. Everything lands in your brand/ folder.
:::

**Time:** 40 minutes · **You'll need:** ChatGPT, Codex or the Gemini app (any plan with image generation), your coding agent (Claude Code, Cursor or Codex) for the SVG step, your voice guide from Exercise 1 · **Builds on:** Lesson 2

## Warm-up

:::checkpoint
Q: Which statement about AI-generated logos is most accurate?
- [ ] If the AI tool's terms let you use it commercially, nobody else can use a similar logo
- [ ] Copyright and trademark are the same thing
- [x] A logo produced by prompts alone may be hard to protect, so add human design work and run a trademark search
Why: Commercial-use terms don't give exclusivity, and the US Copyright Office has said prompts alone generally aren't authorship. Trademark conflicts are a separate check.
:::

## Steps

1. **Brief and explore (10 minutes).** In ChatGPT, Codex or Gemini, paste (adjust for your business and voice):

    ```text
    Create 8 logo concepts for [Business], [one sentence on what you do].
    Voice: [your four voice words from voice-guide.md].
    4 wordmarks in different type styles (serif, rounded sans, geometric sans, slab);
    4 with a simple symbol plus the name. Flat, two colors max, no gradients or shadows,
    must read at 32 px wide. White background, numbered grid.
    ```

2. **Stress-test two favorites.** Ask to see each at favicon size, in one color, on a dark background, and on a mock business card. Pick one.

3. **Rebuild it as a vector.** In your coding agent, attach the chosen concept and paste:

    ```text
    Recreate the attached logo concept as SVG files in /brand/logo:
    logo.svg (full color), logo-black.svg, logo-white.svg (for dark backgrounds),
    and logo-mark.png (square mark, 512x512, transparent background) plus favicon.png.
    Use the Google Font [font name] for the name, converted to paths.
    Show me each file rendered at 32 px, 200 px and 800 px wide.
    ```

    Make at least three deliberate changes yourself (font weight, spacing, color, symbol shape) and have the agent apply them. Write those decisions in `brand/logo/NOTES.md` with the date.

4. **Check the name and look.** Search your business name and two close spellings in the USPTO Trademark search system (or your country's trademark office). Google your name with your industry. Run a reverse image search on your logo. Record what you searched and found in `brand/logo/NOTES.md`. If anything is close, change it now or talk to a trademark lawyer before going further.

5. **Write your image style rules.** Ask Claude (in your brand Project) to draft six to eight rules based on your voice guide: photo or illustration, light, settings, people, one accent color, no text or logos. Edit and save as `brand/image-style.md`.

6. **Make three images in that style.** In Gemini or ChatGPT, generate one image you love using the rules, then use it as a reference for two more. Check every image for odd hands, faces, text and brand logos. Save the keepers to `brand/images/`.

7. **Swap in the new logo.** If your landing page from Build the Product and the Site is live, ask your coding agent to replace the old logo and favicon on a branch and open a pull request with screenshots. Review and merge it yourself.

## Done when

- [ ] brand/logo holds an SVG logo, black and white versions, a square mark and a favicon, all sharp at every size
- [ ] NOTES.md records at least three human design decisions and your trademark and web search results
- [ ] No close conflicts turned up, or you've changed the design or booked legal advice
- [ ] brand/image-style.md has 6 to 8 rules, and brand/images holds three consistent images that follow them
- [ ] No image or logo includes another company's mark, a real person's likeness or "in the style of" a living artist

:::coached
**For 1-on-1 coaching clients.** Take the mark from draft to defensible.

1. Put your two finalist logos in front of five target customers next to two competitors' logos, and ask which business they'd trust with their money and why. Record the answers.
2. Prepare a one-page trademark brief: the name, the logo, the goods and services you'll offer, the countries you'll sell in, and your search results, ready for a lawyer.
3. Build a logo usage sheet (clear space, minimum size, allowed backgrounds, misuse examples) as a single PNG for future agents and suppliers.

**Bring to your session:** both finalists, the customer feedback, your trademark brief and the usage sheet.

**Your coach will:**
- Pick the final mark with you based on the customer evidence, not taste alone
- Review the trademark brief so a lawyer's time is spent well
- Check every image for trust and legal risk before it goes into the brand kit
:::
