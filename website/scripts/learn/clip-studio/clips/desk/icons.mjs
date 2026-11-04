// Lucide icons for the desk player, from the lucide-react the site already uses (the same set as the figures).
// Scans every clips/*/shots.json for "icon": "<name>" and writes clips/desk/icons.json ({name: inner SVG}).
//   node clips/desk/icons.mjs            (npm run icons)
import fs from 'fs'; import path from 'path'; import {pathToFileURL} from 'url';
const DESK = path.dirname(new URL(import.meta.url).pathname), CLIPS = path.dirname(DESK);
const LUCIDE = path.resolve(CLIPS, '../node_modules/lucide-react/dist/esm/icons');
const names = new Set(['check', 'clock', 'moon']);
const walk = o => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (/^icon$|Icon$/.test(k) && typeof v === 'string') names.add(v); else walk(v); } };
for (const d of fs.readdirSync(CLIPS)) { const f = path.join(CLIPS, d, 'shots.json'); if (fs.existsSync(f)) walk(JSON.parse(fs.readFileSync(f, 'utf8'))); }
const out = {}; let bad = 0;
for (const n of [...names].sort()) {
  const file = path.join(LUCIDE, `${n}.mjs`);
  if (!fs.existsSync(file)) { console.error(`no Lucide icon "${n}" (see lucide.dev/icons)`); bad++; continue; }
  const {__iconNode} = await import(pathToFileURL(file).href);
  out[n] = __iconNode.map(([tag, a]) => `<${tag} ${Object.entries(a).filter(([k]) => k !== 'key').map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
}
fs.writeFileSync(path.join(DESK, 'icons.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`icons.json: ${Object.keys(out).length} icons`);
process.exit(bad ? 1 : 0);
