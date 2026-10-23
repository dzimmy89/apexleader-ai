---
module: 1
lesson_number: 3
course: brand-in-a-day
template: v2
---

# Exercise 3: Assemble Your Brand Kit and Wire It Into Your Agents

:::key-concept
You'll finish a brand/ folder (BRAND.md, voice guide, colors, type, logo files, two social templates) and connect it to your agents three ways: a Claude Project, a Claude skill and your website repo's CLAUDE.md or AGENTS.md. At the end, a fresh agent produces an on-brand post without you explaining anything.
:::

**Time:** 35 minutes · **You'll need:** a Claude account, your voice guide (Exercise 1) and logo files (Exercise 2), your coding agent and website repo from Build the Product and the Site (optional but recommended) · **Builds on:** Lesson 3

## Warm-up

:::checkpoint
Q: Your coral accent on cream scores a 2.9:1 contrast ratio. Where can you still use it?
- [ ] For body text, since it's your brand color
- [x] For buttons with dark text or large decorative shapes, but not for normal-size text
- [ ] Nowhere; delete it from the palette
Why: Normal text needs at least 4.5:1 under WCAG. A color that fails can still work for shapes or backgrounds, as long as text on it passes.
:::

## Steps

1. **Fill the folder.** Make sure `brand/` contains `voice-guide.md` and a `logo/` folder from Exercise 2. Then ask Claude (in your brand Project) to draft the rest:

    ```text
    Using my voice guide and logo files, draft:
    1. colors.md: a table of 3 to 5 colors (name, hex, use) based on my logo colors,
       plus two rules for using them.
    2. type.md: one heading font and one body font from Google Fonts that fit my voice,
       with sizes for web and social.
    3. BRAND.md: under one page. Who we are, voice in four words, colors, fonts,
       logo rules, three "never" rules, and the approval rule
       "every draft that leaves the business goes to the founder first."
    ```

    Edit each, then save them into `brand/`.

2. **Check contrast.** Paste:

    ```text
    Read colors.md. Calculate the contrast ratio for each text color on each background.
    Mark pass or fail for normal text (4.5:1) and large text (3:1). Suggest the smallest
    change that makes any failing pair I need pass.
    ```

    Update colors.md with the fixes and a line saying which pairs are allowed for text.

3. **Wire in a Claude Project.** In your "[Business] brand desk" Project, upload every file in `brand/` and set project instructions:

    ```text
    You write and review content for [Business]. Before writing, follow BRAND.md and
    voice-guide.md. Use only facts, prices and quotes in project knowledge; otherwise
    write [CHECK]. End each draft with "Brand check:" listing rules you were unsure about.
    You draft; the founder approves and sends. Never claim something was sent or posted.
    ```

4. **Package a skill.** Create a folder named `[business]-brand` (lowercase, hyphens). Ask Claude to write its `SKILL.md` with a name matching the folder, a description starting "Use whenever writing, editing or designing anything for [Business]," and four short steps. Copy BRAND.md, voice-guide.md and colors.md into the folder, zip it, and upload it in Claude under Customize, Skills (turn on code execution in Settings, Capabilities if asked). Toggle it on.

5. **Wire into your repo.** In your website project, ask your coding agent:

    ```text
    On a new branch: copy my brand/ folder into the repo. Add to CLAUDE.md
    (and AGENTS.md if present) a "Brand" section: follow brand/BRAND.md and
    brand/voice-guide.md for all copy; use colors from brand/colors.md as CSS
    variables and no other colors; use logos from brand/logo only.
    Update styles.css to use those CSS variables. Open a pull request with
    before and after screenshots. Don't merge.
    ```

    Review and merge it yourself.

6. **Build two social templates.** Ask your coding agent (or use a design tool):

    ```text
    Create brand/templates/social-tip.html (1080x1080) and
    brand/templates/social-announcement.html (1080x1350) using only brand/colors.md,
    brand/type.md and brand/logo. Render each with sample text to PNG and show me.
    ```

7. **Run the blind test.** Open a brand-new Claude chat outside the Project (the skill should load) and ask: "Write a LinkedIn post announcing that [Business] now offers [something]." Check it against BRAND.md without adding any instructions. Fix whichever file caused any miss.

## Done when

- [ ] brand/ contains BRAND.md, voice-guide.md, colors.md, type.md, logo/ files and two templates
- [ ] Every text and background pair you use passes 4.5:1, or is marked large-text only
- [ ] The kit is in a Claude Project with instructions, uploaded as an enabled skill, and referenced from your repo's rules file
- [ ] Every place the kit is wired includes the rule that the founder approves anything that leaves the business
- [ ] A fresh chat produced an on-brand draft with no extra instructions from you

:::coached
**For 1-on-1 coaching clients.** Turn the kit into a working content desk.

1. Write five real posts for the next two weeks with the skill, rendered through your templates, and keep a log of every edit you had to make.
2. Turn the three most common edits into new rules in BRAND.md or the voice guide, then regenerate one post to confirm the rules work.
3. Write a one-paragraph "brand changes" policy: who can change the kit, how (pull request), and how agents get the new version.

**Bring to your session:** the brand/ folder, the five posts with your edit log, and the change policy.

**Your coach will:**
- Review the posts side by side for consistency in look and voice
- Check every place the kit is wired for missing approval rules or private data
- Plan which department agents (marketing, sales) get the kit first in the Run the Business stage
:::
