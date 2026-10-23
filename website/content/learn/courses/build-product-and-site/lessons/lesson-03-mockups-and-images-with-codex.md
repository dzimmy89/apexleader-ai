---
module: 1
lesson_number: 3
course: build-product-and-site
template: v2
---

# Lesson 3: Mockups and Images With Codex

:::key-concept
Codex, OpenAI's coding agent app, can generate and edit images with OpenAI's image model, then place them straight into your site's folder. Use it twice: first to mock up how the page should look before code changes, then to produce the real assets (hero image, social share image, icons) at the right sizes.
:::

## What you'll be able to do

- Generate two or three visual mockups of your landing page and pick a direction before you touch code
- Produce a hero image, a social share image (1200 x 630) and simple icons sized for the web
- Hand a chosen mockup to your coding agent as the visual target
- Spot the image problems that hurt a launch: garbled text, slow files, missing alt text, risky likenesses

## Why this matters

Words in a spec are a weak way to describe taste. "Clean and friendly" means something different to you and to an agent. A picture settles it in seconds. You also need real images: a page with no visuals looks unfinished, and stock photos of laughing people in offices make a small business look generic. Image generation inside Codex lets you do both jobs in the same place as your code.

## What Codex brings to this

Codex is OpenAI's agent app for coding and more. You sign in with your ChatGPT account. As of 2026 it can:

- **Generate and edit images.** OpenAI's April 2026 update put image generation in the Codex app, and ChatGPT Images 2.0 (the gpt-image-2 model, announced April 21, 2026) is available across ChatGPT, Codex and the API. It is better at small text, UI elements and dense layouts than earlier models, and supports wide and tall formats from 3:1 to 1:3.
- **Request transparent backgrounds** for icons and logos (added to Codex in late September 2026).
- **Look at your page.** Codex has an in-app browser where you can comment directly on a page to tell the agent what to change, and you can attach screenshots as input.
- **Work in your project folder,** so generated files can be moved into `/images` and wired into `index.html` in the same session.

Image generation counts against your ChatGPT plan's limits, and image turns use them faster than text. Check OpenAI's current Codex pricing page for which plans include what.

You don't have to use Codex for images. ChatGPT Images, Gemini's image models, or Claude working with your designer's files all work. This lesson uses Codex because it can make the image and put it in the code in one go.

## Step 1: Mock up before you build more

Before you polish the page from Lesson 2, generate a few directions. Give Codex your spec and your audience, and ask for whole-page mockups, not art.

```text
Read SPEC.md and /content/hero.md.
Generate three mockups of the landing page hero section, phone width (9:16),
for independent dog groomers who read on their phone between appointments.
Direction A: warm and friendly, cream background, one illustration.
Direction B: clean and professional, white background, a real-looking photo.
Direction C: bold, one strong accent color, big type, no image.
Use the exact headline and button text from hero.md. Save them to /mockups.
```

Then pick one and refine it with specific feedback ("make the button larger, drop the paw icon, the headline must fit in three lines"). Mockups are cheap. Changing your mind after the code is built is not.

When you have a winner, give it to the coding agent as the visual target:

```text
Use /mockups/hero-B-v2.png as the visual target for the hero section.
Match layout, spacing and colors as closely as plain HTML and CSS allow.
Keep all text as real HTML text, not part of an image.
Take a screenshot at 375px and list the differences from the mockup.
```

That last rule matters. Text baked into an image can't be read by search engines or screen readers, and you can't edit it later.

## Step 2: Make the real assets

A landing page needs a small, specific set of images. Generate each one at the size it will be used.

| Asset | Size | Notes |
|---|---|---|
| Hero image | about 1600 x 900 (16:9) or a tall crop for mobile | No text in the image |
| Social share image (Open Graph) | 1200 x 630 | Shows when your link is pasted into LinkedIn, Slack, iMessage. A short headline is fine here |
| Section icons | 3 to 6 simple icons, transparent background | Same style and line weight |
| Favicon | Start at 512 x 512, square, transparent | Simple shape; detail disappears at 32 px |

A prompt that works:

```text
Create a hero image for Groomer Books, a bookkeeping service for independent dog groomers.
Scene: a tidy grooming salon after closing, a groomer at the front desk smiling at a tablet,
a sleepy dog on a bed nearby. Warm natural light, realistic photo style.
No text, no logos, no brand names on any object. 16:9, leave calm space on the left
for a headline. Save to /images/hero.png.
Then create a compressed web version as /images/hero.webp under 250 KB.
```

Then ask Codex to wire it in properly:

```text
Add /images/hero.webp to the hero section with descriptive alt text.
Add Open Graph and Twitter card meta tags pointing to /images/og.png.
Set width and height on every image so the page doesn't jump while loading.
Report the file size of every image in /images.
```

## Step 3: Check every image before it ships

Run this checklist yourself. It takes three minutes.

- **Text:** zoom in. Models are much better at text now, but still misspell. Any wrong letter means regenerate or remove the text.
- **Hands, paws and faces:** look for extra fingers, odd eyes, warped leashes.
- **No real people, brands or logos:** no recognizable faces, no real company logos on mugs or laptops, no "in the style of" a living artist.
- **File size:** under about 300 KB per image for a fast page.
- **Alt text:** every meaningful image has a short, plain description.
- **Honesty:** the image doesn't imply things that aren't true, like a team of ten when it's just you.

:::warning
Don't generate images of real, identifiable people (including "someone who looks like" a celebrity), real company logos or trademarked characters, and don't upload photos of clients or their pets without permission. Imply only what's true about your business. For anything you plan to trademark, like your logo, see the Brand in a Day course: purely AI-generated images may not be protected by copyright, so how you make a logo matters.
:::

## Where Codex fits in your team

Think of Codex in this lesson as your in-house designer who can also touch the code. Claude Code or Cursor stays your builder. It's fine to use both tools on the same project folder, as long as only one agent edits at a time and every change goes through GitHub (next lesson). If you prefer one tool, Codex can also build the whole page from SPEC.md; the plan, build, verify loop from Lesson 2 is the same.

:::try-it
In Codex or ChatGPT, generate a 1200 x 630 social share image for your business with your business name and one short line of text. Zoom in and check every letter. If any is wrong, ask for a version with no text at all.
:::

:::checkpoint
Q: Codex produced a beautiful hero image with your headline painted into it. What should you do?
- [ ] Use it as is, since it matches the mockup exactly
- [x] Regenerate it without text and keep the headline as real HTML text on top
- [ ] Add the headline again in HTML underneath the image so it appears twice
Why: Text inside an image can't be edited, read by screen readers or indexed by search engines, and may contain spelling errors. Keep words in HTML and let the image do the mood.
:::

:::takeaways
- Use generated mockups to agree on a look before you polish code.
- Produce a small, sized set of assets: hero, 1200 x 630 share image, icons, favicon.
- Keep text in HTML, compress images, and write alt text for each one.
- No real people, brands or logos, and nothing that overstates your business.
:::

## Go deeper

- [Codex for (almost) everything](https://openai.com/index/codex-for-almost-everything/) - OpenAI's April 2026 Codex update: image generation, in-app browser, computer use
- [OpenAI announces ChatGPT Images 2.0](https://thurrott.com/a-i/openai-a-i/335196/openai-announces-chatgpt-images-2-0) - what the gpt-image-2 model added, including text rendering and aspect ratios
- [Codex updates (release tracker)](https://releasebot.io/updates/openai/codex) - recent Codex changes, including transparent background requests
- [Image generation in Codex CLI](https://codex.danielvaughan.com/2026/06/04/codex-cli-visual-workflows-image-input-gpt-image-2-generation-asset-pipelines-v0137/) - an independent deep dive on the image skill, inputs and sizes
