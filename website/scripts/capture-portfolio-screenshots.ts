/**
 * Saves a 1440x900 screenshot of each public portfolio homepage to
 * public/portfolio/<slug>.png. Run by .github/workflows/portfolio-screenshots.yml,
 * since the sites must be reachable from where it runs.
 *
 *   npx tsx scripts/capture-portfolio-screenshots.ts
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { PORTFOLIO } from "../content/portfolio";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "portfolio");

async function main() {
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const failed: string[] = [];
  for (const business of PORTFOLIO) {
    if (!business.url) continue;
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    try {
      await page.goto(business.url, { waitUntil: "load", timeout: 45_000 });
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
      // Let entrance animations settle so the frame is at rest.
      await page.waitForTimeout(3_000);
      await page.screenshot({ path: join(outDir, `${business.slug}.png`) });
      console.log(`saved ${business.slug} (${business.url})`);
    } catch (err) {
      failed.push(business.slug);
      console.error(`failed ${business.slug} (${business.url}): ${(err as Error).message}`);
    } finally {
      await page.close();
    }
  }
  await browser.close();
  if (failed.length) console.error(`no screenshot for: ${failed.join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
