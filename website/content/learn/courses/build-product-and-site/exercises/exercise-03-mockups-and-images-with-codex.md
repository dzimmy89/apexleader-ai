---
module: 1
lesson_number: 3
course: build-product-and-site
template: v2
---

# Exercise 3: Mock Up the Look and Make Your Site Images

:::key-concept
You'll use Codex to generate three hero mockups, pick one, and then produce the real image set for your page: hero image, 1200 x 630 social share image, section icons and a favicon. At the end they're compressed, wired into your page with alt text, and the page matches your chosen mockup.
:::

**Time:** 30 minutes · **You'll need:** the Codex app signed in with a ChatGPT plan that includes image generation (or ChatGPT Images or Gemini as a fallback), your project folder from Exercise 2 · **Builds on:** Lesson 3

## Warm-up

:::checkpoint
Q: Which image is safe to put on your landing page?
- [ ] A generated photo of a groomer who looks like a well-known TV host
- [ ] A generated laptop with a real software company's logo on the lid
- [x] A generated scene of a tidy salon with no faces in focus, no text and no brands
Why: Recognizable people and real logos create legal and trust problems. A generic scene with no text or brands is the safe default.
:::

## Steps

1. **Open your project in Codex.** Start a Codex session on your site folder. Create a `mockups` folder for drafts. (In Exercise 4 you'll keep it out of GitHub, since drafts don't belong on the live site.)

2. **Generate three directions.** Paste:

    ```text
    Read SPEC.md and content/hero.md.
    Generate three mockups of the hero section at phone size (9:16) for [your customer].
    A: warm and friendly, cream background, one simple illustration.
    B: clean and professional, white background, realistic photo.
    C: bold, one strong accent color, large type, no image.
    Use the exact headline and button text from hero.md. Save to /mockups.
    ```

3. **Choose and refine.** Pick one. Give two rounds of specific feedback (layout, button size, image crop). Save the final as `/mockups/hero-final.png`. Write one line in SPEC.md under Rules: "Visual target: /mockups/hero-final.png".

4. **Make the real assets.** Paste, adjusting the scene to your business:

    ```text
    Create these images for the site, matching the style of /mockups/hero-final.png:
    1. /images/hero.png, 16:9, [describe the scene]. No text, no logos, no real people.
    2. /images/og.png, 1200x630, business name and the hero headline, large and legible.
    3. Three icons for the "How it works" steps, same line style, transparent background,
       saved as /images/icon-1.png, icon-2.png, icon-3.png.
    4. /images/favicon.png, 512x512, a simple mark, transparent background.
    Then make web versions: hero as WebP under 250 KB, icons under 30 KB each.
    Report every file and its size.
    ```

5. **Inspect each image yourself.** Zoom in on og.png and check every letter. Check hands, paws and faces in the hero. Regenerate anything with errors. If og.png text keeps coming out wrong, ask for a version with no text.

6. **Wire them in.** Paste:

    ```text
    Add the hero, icons and favicon to index.html. Write short, descriptive alt text
    for each meaningful image (empty alt for decorative ones). Add Open Graph and
    Twitter card meta tags using /images/og.png and the hero headline. Set width and
    height on every image. Screenshot at 375px and 1280px and list differences
    from /mockups/hero-final.png.
    ```

7. **Close the gap.** Fix any differences that matter. Leave the rest.

## Done when

- [ ] /mockups holds three directions and one chosen final, and SPEC.md names it as the visual target
- [ ] /images holds a hero, a 1200 x 630 share image, at least three icons and a favicon, all checked by you at full zoom
- [ ] Every image on the page is under about 300 KB and has appropriate alt text
- [ ] No image contains a real person, real brand or logo, or a claim that isn't true
- [ ] Screenshots at phone and laptop width match the chosen direction closely

:::coached
**For 1-on-1 coaching clients.** Build a reusable visual system, not just a page.

1. Ask Codex to extract a mini style guide from your chosen mockup: two fonts, three to five colors with hex codes, button style, image style rules. Save it as /brand/visual-notes.md.
2. Generate three more images for future use (a LinkedIn banner, an email header and a slide background) using only that guide, and check they look like one family.
3. Run a speed check on your page (ask your agent to measure page weight and the largest image) and get the total page under 1 MB.

**Bring to your session:** the mockups, /images, /brand/visual-notes.md and your page weight numbers.

**Your coach will:**
- Review the images for trust: do they look like your business, not a stock library
- Spot any likeness, logo or claim risk before it goes live
- Agree with you which visual notes move into your Brand in a Day kit
:::
