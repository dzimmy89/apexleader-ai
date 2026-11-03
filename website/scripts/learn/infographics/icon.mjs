/**
 * Print Lucide icons as inline SVG for a figure, from the lucide-react the
 * site already uses, so figures and the site share one icon set.
 *
 *   node scripts/learn/infographics/icon.mjs search send user-round-check
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const dir = path.resolve("node_modules/lucide-react/dist/esm/icons");
for (const name of process.argv.slice(2)) {
  const file = path.join(dir, `${name}.mjs`);
  if (!fs.existsSync(file)) {
    console.error(`no Lucide icon "${name}" (see lucide.dev/icons)`);
    process.exitCode = 1;
    continue;
  }
  const { __iconNode } = await import(pathToFileURL(file).href);
  const inner = __iconNode
    .map(([tag, attrs]) => {
      const a = Object.entries(attrs)
        .filter(([k]) => k !== "key")
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
      return `<${tag} ${a}/>`;
    })
    .join("");
  console.log(`<!-- ${name} --><svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`);
}
