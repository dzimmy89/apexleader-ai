/**
 * Render lesson infographics. Each source is an HTML file in
 * content/learn/figures/<course>/ holding one `.fig` element and a
 * <meta name="out" content="public/learn/figures/<course>/<name>.webp">.
 * Renders at 2.5x (2000 px wide for a wide frame) to WebP, and warns about
 * text under 26 px or anything outside the frame.
 *
 *   node scripts/learn/infographics/render.mjs content/learn/figures/ai-sales/*.html
 *
 * Run from website/. Uses the machine's Playwright Chromium (PW_CHROMIUM to
 * point at another browser) and sharp, which Next already installs.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require("sharp");

const files = process.argv.slice(2).filter((f) => f.endsWith(".html"));
if (!files.length) {
  console.error("usage: node scripts/learn/infographics/render.mjs <figure.html>...");
  process.exit(1);
}
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1300, height: 1300 }, deviceScaleFactor: 2.5 });
let problems = 0;
for (const file of files) {
  await page.goto("file://" + path.resolve(file));
  await page.evaluate(() => document.fonts.ready);
  const out = await page.locator('meta[name="out"]').getAttribute("content");
  if (!out || !/^public\/learn\/figures\/[a-z0-9-_]+\/[a-z0-9-]+\.webp$/.test(out)) {
    console.log(`${file}: needs <meta name="out" content="public/learn/figures/<course>/<name>.webp">`);
    problems++;
    continue;
  }
  const fig = page.locator(".fig").first();
  const overflow = await fig.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return [...el.querySelectorAll("*")].some((c) => {
      const b = c.getBoundingClientRect();
      return b.width > 0 && (b.right > r.right + 1 || b.bottom > r.bottom + 1 || b.left < r.left - 1);
    });
  });
  const tooSmall = await fig.evaluate((el) =>
    [...el.querySelectorAll("*")]
      .filter(
        (c) =>
          [...c.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim()) &&
          parseFloat(getComputedStyle(c).fontSize) < 26,
      )
      .map((c) => c.textContent.trim().slice(0, 30)),
  );
  const png = await fig.screenshot({ type: "png" });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(png).webp({ quality: 86 }).toFile(out);
  const warn = [
    overflow ? "content overflows the frame" : "",
    tooSmall.length ? `text under 26 px: ${tooSmall.slice(0, 3).join(" | ")}` : "",
  ].filter(Boolean);
  problems += warn.length;
  console.log(`${out} ${(fs.statSync(out).size / 1024).toFixed(0)} KB${warn.length ? "  WARNING: " + warn.join("; ") : ""}`);
}
await browser.close();
process.exit(problems ? 1 : 0);
