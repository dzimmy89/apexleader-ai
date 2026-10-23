---
module: 1
lesson_number: 2
course: brand-in-a-day
template: v2
---

# Lesson 2: Logo and Imagery With AI

:::key-concept
AI image tools are excellent for exploring logo ideas and producing on-brand imagery fast. They are a poor place to stop for your final logo: purely AI-generated images may not be protected by copyright, and a logo that looks like someone else's mark is a trademark problem. Explore with AI, then finish the logo with real human design choices and check it before you use it.
:::

## What you'll be able to do

- Use ChatGPT Images, Codex or Gemini to explore logo directions and a consistent image style
- Turn a chosen concept into a clean, simple logo set you can use everywhere
- Run a basic trademark search and know when to call a lawyer
- Write image style rules so every future image looks like the same business

## Why this matters

Your logo goes on your site, your invoices, your social profiles and maybe a van. Changing it later costs money and recognition. AI makes it tempting to type "logo for a bookkeeping business" and ship the first result. That is how founders end up with a generic mark, a blurry file they can't resize, or a lookalike of a company they've never heard of. One focused day avoids all three.

## The tools, as of October 2026

| Tool | What it's good at | Notes |
|---|---|---|
| ChatGPT Images (in ChatGPT) | Fast concepts, text in images, many variations | Runs on OpenAI's gpt-image-2 model, announced April 21, 2026, which handles text and small details better than earlier versions and supports formats from 3:1 to 1:3 |
| Codex | Same image model, inside a project folder | Good when you want logo files saved straight into your site's repo; can request transparent backgrounds |
| Gemini app (Nano Banana image models) | Editing, style consistency across many images, using several reference images | Google's Nano Banana 2 reached the Gemini app in February 2026; newer variants followed. Google marks its generated images with an invisible SynthID watermark |

Plans and limits change; check each tool's current plan page before you rely on it. Any of these is enough for this lesson.

## Step 1: Brief the concept, not the logo

Good logos for small businesses are simple: a wordmark (your name in a well-chosen font), sometimes with a small symbol. Give the AI the brief a designer would want.

```text
I'm creating a logo for Groomer Books, monthly bookkeeping for independent dog groomers.
Voice: plain, warm, practical, honest (not cute, not corporate).
Generate 8 different logo concepts on a white background:
- 4 wordmarks using different type styles (serif, rounded sans, geometric sans, slab)
- 4 with a simple symbol plus the name (ideas: a ledger line that becomes a leash,
  a tag shape, a simple paw combined with a check mark)
Flat, two colors maximum, no gradients, no shadows, no tiny details.
Must still read clearly at 32 pixels wide. Show them in a grid, numbered.
```

Then narrow down. Pick two. Ask for each at small size (favicon), on a dark background, in one color, and next to the name of a competitor. A logo that falls apart at 32 pixels or in black and white isn't finished.

## Step 2: Finish the logo with human choices

This step matters for quality and for ownership.

**Quality.** Image models produce pixels (PNG or WebP files). A logo needs to be a vector (SVG) so it stays sharp on a phone and on a banner. The cleanest route for a wordmark is to rebuild it: choose a real font (a free Google Font avoids licensing questions), set your name in it, adjust spacing and color, and save as SVG. Your coding agent can do this:

```text
Recreate concept #3 as an SVG wordmark. Use the Google Font "Fraunces" at semibold,
letter-spacing slightly tighter than default, color #1F2A37.
Convert text to paths so it renders without the font installed.
Also make: a one-color black version, a white version for dark backgrounds,
and a square mark using just the "G" in a rounded square, at 512x512 PNG.
Save to /brand/logo.
```

For a symbol, ask a designer or a vector tool to redraw it, making deliberate changes to shape, spacing and proportion. Keep the drafts and notes of the choices you made.

**Ownership.** The US Copyright Office's January 2025 report on AI and copyrightability concluded that prompts alone generally don't make you the author of what a model generates; protection depends on human-authored expression, such as your own modifications or creative arrangement. In practice, a logo that came straight out of a prompt may be hard to protect from copying. Redrawing and refining it yourself (or with a designer) puts real human authorship into the final mark.

Read the terms of whichever tool you use. OpenAI's terms (effective January 1, 2026), for example, say that to the extent the law allows you own the output, and also that other users may receive similar output. That's typical: the tool hands you whatever rights it has, but it can't promise your image is unique, and it doesn't clear trademarks for you.

## Step 3: Check it before you use it

Copyright and trademark are different things. Copyright protects the artwork. Trademark protects you from customers being confused about who is selling what, and it's the one that bites small businesses.

1. **Search the name and the look.** Use the USPTO's Trademark search system for word marks (your business name and close spellings) and, for a symbol, its design search codes. The USPTO points out that marks can conflict if they look or sound alike and the goods or services are related, even across different classes.
2. **Search the real world.** Google your name plus your industry, check app stores, domain names and social handles, and do a reverse image search of your logo.
3. **Avoid lookalikes.** If your symbol resembles a well-known brand, change it now, while it's cheap.
4. **Know when to get help.** The USPTO itself suggests hiring a trademark attorney for clearance searches, because they can be complex. If you plan to register a trademark or invest real money in signage and packaging, book an hour with one. Outside the US, check your own country's trademark office.

:::warning
This lesson is general information, not legal advice. Never prompt for a logo "in the style of" an existing brand, never include another company's logo or a celebrity's likeness, and don't assume an AI-made mark is yours to protect. For registration or a dispute, talk to a trademark lawyer in your country.
:::

## Step 4: Set an image style, not just images

Beyond the logo, you'll need dozens of images over the next year: social posts, blog headers, email banners. Consistency is what makes them look like one business. Write style rules once and reuse them in every prompt.

```text
# Image style (paste into every image prompt)
- Realistic photo style, warm natural light, slightly muted colors
- Settings: small independent grooming salons, front desks, vans; never corporate offices
- Dogs relaxed and happy; people shown from the side or behind, no faces in focus
- Accent color #E8664A appears once in each scene (a towel, a leash, a mug)
- No text, no logos, no brand names on objects
- Leave clear space on one side for a headline
```

Gemini's image models are strong at keeping a style or a character consistent when you give them several reference images. Generate a "hero" image you love, then use it as a reference for the next ones:

```text
Using the attached image as the style reference, create three more images in the same
light, palette and mood: 1) a groomer's van parked at dawn, 2) a receipt box on a
salon counter, 3) a groomer checking a phone between appointments.
Follow the style rules below. [paste rules]
```

Save your best images and the style rules in your brand folder. Lesson 3 turns all of this into a kit your agents follow.

:::try-it
Open ChatGPT or Gemini and ask for six wordmark concepts of your business name in different type styles, flat, one color, on white. Then ask to see your favorite at 32 pixels wide. Does it still read?
:::

:::checkpoint
Q: You love a logo that ChatGPT generated in one shot. What's the best next step before printing it on business cards?
- [ ] Print it as is; the AI tool's terms say you can use it commercially
- [x] Rebuild it as a vector with deliberate human design changes, then run a trademark search on the name and look
- [ ] Ask the AI tool to confirm it's unique
Why: Commercial-use terms don't make a mark unique or protectable. Human refinement strengthens your claim to the artwork, and a trademark search catches conflicts before you spend money.
:::

:::takeaways
- Use AI to explore logo concepts and image style; finish the logo as a clean vector with human choices.
- Prompts alone generally don't create copyright; your edits and arrangement can.
- Run a USPTO (or local) trademark search and a web and reverse image search; use a lawyer for registration.
- Write image style rules once and reuse them so every image looks like one business.
:::

## Go deeper

- [Copyright Office releases Part 2 of AI report](https://copyright.gov/newsnet/2025/1060.html) - January 29, 2025: prompts alone are insufficient; human selection, arrangement and modification can be protected
- [Federal trademark searching (USPTO)](https://www.uspto.gov/trademarks/search/federal-trademark-searching) - how to search word marks and design codes, and likelihood of confusion
- [OpenAI announces ChatGPT Images 2.0](https://thurrott.com/a-i/openai-a-i/335196/openai-announces-chatgpt-images-2-0) - gpt-image-2 across ChatGPT, Codex and the API
- [Nano Banana 2 Lite and Gemini Omni Flash](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni-flash-nano-banana-2-lite/) - Google's June 2026 image model update and SynthID watermarking
- [OpenAI terms of use](https://www.openai.com/policies/terms-of-use/) - ownership of output and the note that others may receive similar output
