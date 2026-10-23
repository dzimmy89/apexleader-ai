---
module: 1
lesson_number: 5
course: build-product-and-site
template: v2
---

# Lesson 5: Deploy It and Connect Your Domain

:::key-concept
A host takes the `main` branch of your GitHub repo and serves it to the world, rebuilding every time you merge. DNS records at your domain registrar point your domain at that host, and the host issues a free HTTPS certificate. Set it up once and publishing becomes "merge the pull request."
:::

## What you'll be able to do

- Choose a beginner-friendly host: GitHub Pages, Netlify, Vercel or Cloudflare Pages
- Publish your landing page from GitHub so every merge goes live
- Read and add the DNS records that connect your own domain
- Get HTTPS working and check that the site is really live

## Why this matters

A page on your laptop is a draft. A page on `yourbusiness.com` with the padlock in the browser is a business: you can put it on a card, in an email signature and in your social profiles. This is also the step where founders most often get stuck, because DNS looks like a foreign language. It isn't hard. There are four record types you need to recognize, and the host tells you exactly what to enter.

## Pick a host

For a static landing page (HTML, CSS, images), all four of these are good, have a free starting tier and give you HTTPS at no extra cost. They differ in setup and extras.

| Host | Best when | How it deploys | Pull request previews |
|---|---|---|---|
| GitHub Pages | You want the fewest accounts. Everything stays in GitHub | Publishes from a branch (for example `main`, root folder) or a GitHub Actions workflow | Not built in |
| Netlify | You want simple drag-and-connect and built-in extras like forms | Connect the GitHub repo; every push to `main` deploys | Yes, a preview link per pull request |
| Vercel | You may move to a framework like Next.js later | Connect the GitHub repo; every push to `main` deploys | Yes |
| Cloudflare Pages | Your domain is (or will be) on Cloudflare DNS | Connect the GitHub repo in Workers & Pages | Yes |

Two things to check before you choose, because they change: each host's current plan limits, and its terms for commercial use on the free tier. Some free tiers are meant for personal projects only. Read the pricing and fair-use pages linked from each host's site; if the free tier doesn't fit a business, the paid entry plan usually does.

If you're unsure, start with **GitHub Pages** for the fewest moving parts, or **Netlify** if you want a preview link on every pull request. You can move hosts later in an afternoon, because your code lives in GitHub, not at the host.

## Deploy from GitHub

**GitHub Pages.** In your repo on github.com, go to **Settings**, then **Pages**. Under the build and deployment source, publish from the `main` branch and the root folder, and save. In a minute or two your site appears at `https://<your-username>.github.io/<repo-name>/`. On a free account, Pages publishes from public repositories; paid plans add private ones.

**Netlify, Vercel or Cloudflare Pages.** Sign up with your GitHub account, choose "import" or "add new project," pick your repository and accept the defaults for a plain HTML site (no build command, publish the root folder). You get a free address like `something.netlify.app`, `something.vercel.app` or `something.pages.dev`. When the host asks for access to GitHub, grant it to **only this repository**, not all of them. That's least access, applied to a host.

Before you touch DNS, open the free address on your phone and click every link. Fix anything broken through a pull request, merge, and watch the site update.

## DNS in plain English

Your registrar (where you bought the domain, such as Cloudflare, Namecheap, Porkbun, Squarespace Domains or GoDaddy) runs a phone book for your domain. Each line is a record.

| Record | What it does | Typical use here |
|---|---|---|
| A / AAAA | Points a name at a server's IP address (A for IPv4, AAAA for IPv6) | The bare domain, `groomerbooks.com` |
| CNAME | Points a name at another name | `www.groomerbooks.com` points to your host's address |
| TXT | Holds a text value that proves you own the domain | Domain verification for GitHub, email services |
| NS (nameservers) | Says which company runs the phone book at all | Only if a host asks you to move DNS to them |

Two more terms: the **apex** (or root) is the bare domain, `groomerbooks.com`, and the `@` symbol in DNS forms means the apex. **TTL** is how long the internet caches a record; changes can take from minutes to 24 hours or more to spread.

## Connect your domain

The safe order is: **add the domain at the host first, then change DNS.** GitHub warns that pointing DNS at Pages before adding the domain in your repo settings can let someone else claim your domain on their site. Cloudflare Pages likewise says to add the domain in its dashboard first, or you may see an error.

**GitHub Pages, step by step:**

1. Verify the domain on your GitHub account first: profile picture, **Settings**, **Pages**, **Add a domain**. GitHub shows a TXT record to add at your registrar. Keep that TXT record in place afterward.
2. In the repo, **Settings**, **Pages**, enter `groomerbooks.com` under Custom domain and save.
3. At your registrar, add four A records for the apex (`@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Remove any default "parked" records for `@`.
4. Add a CNAME record: name `www`, value `<your-username>.github.io` (no repo name). GitHub redirects between `www` and the apex automatically.
5. Wait, then tick **Enforce HTTPS** in Settings, Pages. It can take a while (up to 24 hours) to become available.

**Netlify, Vercel or Cloudflare Pages:** open your project's domain settings, add the domain, and copy the exact records the dashboard shows you. Don't copy values from a blog post, because hosts change them and some give each project its own. Two specifics worth knowing: Cloudflare Pages needs your domain's nameservers on Cloudflare to use the apex (a `www` or other subdomain only needs a CNAME to `<project>.pages.dev`), and every host will offer to redirect `www` to the apex or the other way. Pick one and stick with it.

Do not use wildcard records like `*.groomerbooks.com`. GitHub strongly recommends against them.

## HTTPS and the "is it live" check

All four hosts issue a free certificate (GitHub Pages uses Let's Encrypt) once DNS checks pass. You don't buy or install anything. If the certificate stalls, the usual cause is an extra or leftover DNS record; delete the stray record, then remove and re-add the custom domain to restart.

When it's live, run this check:

```text
Check https://groomerbooks.com and https://www.groomerbooks.com.
For each: does it load over HTTPS with a valid certificate, does http:// redirect
to https://, and does one version redirect to the other?
Load every link on the page and report any that fail.
Check for mixed content (any image, CSS or script loaded over http://).
```

You can paste this into your coding agent, or do it by hand in a private browser window and on your phone with Wi-Fi off.

:::warning
Your registrar account controls your domain, and with it your website and any email on that domain. Turn on two-factor authentication, use a unique password, turn on auto-renew and registrar lock, and don't hand that login to any agent. Agents can prepare DNS changes as a list; you make them, one record at a time, and keep a note of the old values.
:::

:::try-it
Log in to your registrar and find the DNS page for your domain. Don't change anything. Write down every record that's there now (type, name, value). That snapshot is your undo button.
:::

:::checkpoint
Q: You're moving your domain to GitHub Pages. In which order should you work?
- [ ] Add the A records at the registrar, wait a day, then add the domain in GitHub
- [x] Verify the domain in GitHub, add it under Settings, Pages, then add the DNS records, then enforce HTTPS
- [ ] Enforce HTTPS first, then add DNS records
Why: Adding the domain at the host before pointing DNS prevents someone else from claiming it, and HTTPS can only be issued once DNS points at the host.
:::

:::takeaways
- A host publishes `main` from GitHub; publishing becomes "merge the pull request."
- GitHub Pages is the simplest start; Netlify, Vercel and Cloudflare Pages add preview links per pull request.
- Learn A, CNAME, TXT and NS; add the domain at the host first, then change DNS.
- HTTPS is free and automatic once DNS is right; lock down your registrar account.
:::

## Go deeper

- [About GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages) - which plans publish from public versus private repositories
- [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) - the A, AAAA and CNAME records and the takeover warning
- [Verifying your custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages) - the TXT record that protects your domain
- [Securing your GitHub Pages site with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https) - Enforce HTTPS, certificate troubleshooting, mixed content
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/platform/custom-domains/) - apex versus subdomain setup on Cloudflare
