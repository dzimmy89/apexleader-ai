---
module: 1
lesson_number: 3
course: codex
template: v2
---

# Lesson 3: Images and Mockups

:::key-concept
Codex can generate and edit images in the same place it writes code, so you can sketch a screen, agree on the look, then have Codex build it and compare the result in its browser. Pictures settle taste questions in minutes that words can't. Use mockups to decide, and real assets (icons, social images) to ship.
:::

## What you'll be able to do

- Generate two or three mockups of a screen and pick a direction before any code is written
- Turn a chosen mockup into a working page and compare the two side by side
- Make simple assets, like icons with transparent backgrounds and a social share image
- Check generated images for the problems that embarrass small businesses

## Why this matters

"Make it look clean and friendly" means something different to you and to an agent. A mockup is a shared picture. It's also cheap: changing a picture costs one prompt, while changing a built page costs a rework. And because Codex can both make the image and write the code, the handoff from design to build happens in one thread instead of across three tools.

## What Codex can do with images

- **Generate and revise images.** OpenAI added image generation to the Codex app in April 2026, and it can create and revise images on request.
- **Transparent backgrounds.** Since late September 2026, you can explicitly ask for a transparent background when generating or editing, which matters for icons and logos.
- **Edit images you give it.** Attach a screenshot, a photo or an earlier image and ask for changes.
- **See your page.** The in-app browser shows what Codex built, and you can comment on parts of the page to request changes.

Image work uses your Codex credits like any other task, and image-heavy sessions use them faster. Keep an eye on the Usage panel.

## Step 1: Mock up before you build

Say you want a simple client intake form for Groomer Books: new clients fill it in before their first call. Ask for whole-screen mockups, not art:

```text
Read AGENTS.md. Generate three mockups of a one-page client intake form for
Groomer Books, phone size (9:16). Fields: name, business name, email, number
of bank accounts, monthly transactions (dropdown), "What's your biggest
bookkeeping headache?" (text box), Submit button.
Direction A: warm, cream background, rounded fields.
Direction B: clean and white, strong teal accent.
Direction C: one question per screen with a progress bar.
Use real labels, no lorem ipsum. Save to /mockups.
```

Pick one and refine with specific feedback:

```text
Go with B. Make the Submit button full width, move the headache question
to the top, and add a one-line privacy note under the email field.
Save as /mockups/intake-B-v2.png.
```

Two or three rounds is normal. Stop when you'd be happy to show it to a client.

## Step 2: Build from the mockup and compare

Hand the chosen picture to Codex as the target:

```text
Build /intake/index.html to match /mockups/intake-B-v2.png as closely as
plain HTML and CSS allow. All text must be real HTML text, not part of an
image. The form must not send data anywhere yet: show a "Thanks, we'll be
in touch" message on submit. Open it in the in-app browser at phone width,
take a screenshot, and list every difference from the mockup.
```

Then look for yourself in the in-app browser. Comment directly on anything that's off, like "this field is too close to the label." That loop, mockup, build, compare, comment, is how you get a result that matches your taste without reading code.

Note the line about not sending data. Connecting a form to your inbox or CRM is a separate, deliberate step you approve, covered in Lesson 4's approval rules.

## Step 3: Make real assets

A small business site needs a short list of images. Generate each at the size you'll use:

| Asset | Size | Notes |
|---|---|---|
| Social share image | 1200 x 630 | Shows when your link is shared; short headline is fine |
| Feature icons | 3 to 6, square, transparent background | Same style and line weight |
| Favicon | Start at 512 x 512, transparent | Simple shape; detail vanishes when small |
| Hero or section image | About 16:9 | No text inside the image |

```text
Create four simple line icons for: bank feeds, receipt photos, monthly
report, tax-time ready. Same style, 2px teal lines, transparent background,
512 x 512 each. Save to /images/icons. Then make web-sized copies under
20 KB each and tell me the file sizes.
```

## Step 4: Check every image

Two minutes per image, every time:

- **Text:** zoom in. Misspellings still happen. Wrong letters mean regenerate, or remove the text and use real HTML text instead.
- **Details:** hands, paws, faces, objects that melt into each other.
- **No real people, brands or logos:** no recognizable faces, no real company logos on props, nothing "in the style of" a living artist.
- **Honesty:** nothing that implies a big team, an office or customers you don't have.
- **Size and alt text:** compressed for the web, with a short plain description.

:::warning
Don't generate images of real, identifiable people or real brands, and don't upload photos of clients, their pets or their documents without permission. Mockups of forms should use made-up sample data, never a real client's details. If you plan to trademark a logo, talk to a lawyer before relying on a purely AI-generated design; protection for AI-generated images is limited and varies by country. This is general information, not legal advice.
:::

:::try-it
In Codex, ask: "Generate one 1200 x 630 social share image for my business with the name and a five-word tagline, then a second version with no text at all." Zoom in on the first. If any letter is wrong, use the no-text version and add the words in HTML.
:::

:::checkpoint
Q: Codex built your intake form from the mockup, and it looks great. The mockup shows sample client details filled in. What should the live page contain?
- [ ] The same sample details, so visitors see an example
- [x] Empty fields with real HTML labels, and no real client data anywhere
- [ ] A screenshot of the mockup, since it already looks right
Why: The mockup is a picture of the design, not content. The live form needs real, editable fields, and no client's details should ever appear in your files or images.
:::

:::takeaways
- Mock up first, pick one direction, refine with specific feedback.
- Build from the chosen mockup, then compare in the in-app browser and comment.
- Make a small set of sized assets; ask for transparent backgrounds for icons.
- Check text, details, likeness and honesty in every image before it ships.
:::

## Go deeper

- [Codex for (almost) everything](https://openai.com/index/codex-for-almost-everything/) - image generation and the in-app browser in the Codex app
- [Codex release tracker](https://releasebot.io/updates/openai/codex) - recent changes, including transparent background requests
- [OpenAI's ChatGPT desktop app on Linux](https://thenewstack.io/openais-chatgpt-desktop-linux/) - what the merged app includes, including the in-app browser
