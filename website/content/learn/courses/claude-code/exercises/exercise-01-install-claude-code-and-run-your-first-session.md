---
module: 1
lesson_number: 1
course: claude-code
template: v2
---

# Exercise 1: Install Claude Code and Build Your First Web Page

:::key-concept
You'll install Claude Code, run your first session, and build a one-page website for your business in a folder on your computer. At the end you have a working install and a real `index.html` page you can open in your browser and keep improving through this course.
:::

**Time:** 30 minutes · **You'll need:** A Pro or Max Claude plan, a Mac or Windows computer, your founder brief or the Groomer Books sample · **Builds on:** Lesson 1

## Warm-up

:::checkpoint
Q: Where should you start Claude Code for this exercise?
- [ ] In your home folder, so Claude can see everything
- [x] In a new, dedicated project folder for the website
- [ ] On your Desktop, where your files are
Why: Claude works on the folder you start it in, so a dedicated project folder keeps its reach limited to what the task needs.
:::

## Steps

1. Choose your path: desktop app (Code tab) or terminal. If you've never used a terminal, choose the desktop app.
2. Install:
   - Desktop: download and install the Claude desktop app, sign in, click **Code**.
   - Terminal: run the install command for your system from Lesson 1, open a new terminal, and run `claude --version`. If it fails, run `claude doctor` and follow the fix it suggests.
3. Create a folder called `my-business-site` (or `groomer-books-site`). In the desktop app, choose **Local** and **Open folder…**. In the terminal, run `cd my-business-site` and then `claude`, and sign in when the browser opens.
4. Paste this prompt, filling in your details or using the sample business:

```text
I'm not a developer. Build a simple one-page website in this folder using plain
HTML and CSS, no frameworks, no external scripts. Business: [name], [one-line offer]
for [customer]. Sections: headline, three benefits, how it works in 3 steps,
pricing placeholder, and a contact email link to [your email]. Mobile friendly,
readable fonts, good contrast. When done, list the files you created and tell me
how to open the page.
```

5. Watch what Claude does. If it asks for permission, read what it wants to do before approving.
6. Open `index.html` in your browser. Then make three improvements in plain English, one at a time, for example a shorter headline, a brand color, and a call-to-action button.
7. Press Esc (or the stop button) once while Claude is working, then redirect it with a new instruction, so you've practiced steering.
8. Ask Claude:

```text
Explain each file in this folder in two sentences for a non-developer, and tell
me which file I would edit to change the headline text myself.
```

9. Change one word of the headline yourself in that file, save, and refresh the browser.

## Done when

- [ ] `claude --version` prints a version, or the Code tab opens without an upgrade prompt
- [ ] Your folder contains a working `index.html` you can open in a browser
- [ ] You made at least three improvements by prompting and one by hand
- [ ] You stopped and redirected Claude at least once

:::coached
**For 1-on-1 coaching clients.** Go beyond the sample page:

1. Install both the desktop app and the terminal version, and run the same request in each.
2. Have Claude build a three-page site (home, services, about) from your real founder brief, with no invented testimonials.
3. Ask Claude to audit the site for accessibility and mobile issues and fix the top five.

**Bring to your session:** the site folder (or screenshots), the prompts you used, and any errors you hit.

**Your coach will:**
- Review the site copy and structure against your offer
- Help you fix any install or PATH issues live
- Agree which surface (desktop or terminal) you'll use day to day
:::
