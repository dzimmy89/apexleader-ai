// render <clip> <mode> <a> <b> [w=1920] [h=1080] [fps=24]
//   stills   a = comma-separated seconds          -> <clip>/stills/s_XXXX.png
//   frames   a..b frame range, skips frames on disk -> <clip>/frames/f_XXXXX.png
//   reframes same, overwrites
//   check    a = every Nth frame (default 12): label contrast report -> <clip>/checks/contrast.json, plus scene cues
// Env: CHROME_PATH (a real Chrome: Metal on the Mac, Vulkan on a Linux GPU machine; see chrome-args.mjs),
// CHROME_ARGS (override the flags), BLUR = subframes per frame (default 1: the desk player is DOM, which has no
// accumulation buffer, so subframes would only cost time). The page is served from website/ on 8768 (npm run serve).
import {chromium} from 'playwright-core'; import fs from 'fs'; import {chromeArgs} from './chrome-args.mjs';
process.chdir(new URL('.', import.meta.url).pathname);   // paths below are relative to clips/
const [,, clip, mode, a = '', b = '', w = '1920', h = '1080', fps = '24'] = process.argv;
const FPS = +fps, BLUR = Math.max(1, +(process.env.BLUR ?? 1)), SHUTTER = 0.5 / FPS;
const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: chromeArgs()});
const page = await browser.newPage({viewport: {width: +w, height: +h}});
page.on('console', m => { if (m.type() === 'error') console.log('PAGE', m.text()); });
page.on('pageerror', e => console.log('PAGEERR', e.message));
await page.goto(`http://127.0.0.1:8768/scripts/learn/clip-studio/clips/${clip}/index.html`); await page.waitForFunction('window.ready', null, {timeout: 120000});
fs.mkdirSync(`${clip}/checks`, {recursive: true});
fs.writeFileSync(`${clip}/checks/scene-cues.json`, JSON.stringify(await page.evaluate(() => window.__cues || []), null, 1));

// one frame: BLUR subframes spread over the shutter, the centre one last so the overlay text matches time T
const draw = (T, n) => page.evaluate(([T, n, sh]) => {
  if (n < 2) { window.__mb = null; window.renderAt(T); return; }
  const offs = [...Array(n).keys()].map(j => (j / (n - 1) - .5) * sh), mid = offs.splice(n >> 1, 1); offs.push(mid[0]);
  offs.forEach((o, i) => { window.__mb = {i, n}; window.renderAt(Math.max(0, T + o)); }); window.__mb = null;
}, [T, n, SHUTTER]);
const shot = async (T, f, n = BLUR) => { await draw(T, n); await page.screenshot({path: f, type: 'png'}); };
const t0 = Date.now(); let count = 0;

if (mode === 'stills') {
  fs.mkdirSync(`${clip}/stills`, {recursive: true});
  for (const T of a.split(',').map(Number)) { await shot(T, `${clip}/stills/s_${String(Math.round(T * 10)).padStart(4, '0')}.png`); count++; }
} else if (mode === 'frames' || mode === 'reframes') {
  fs.mkdirSync(`${clip}/frames`, {recursive: true});
  for (let i = +a; i < +b; i++) { const f = `${clip}/frames/f_${String(i).padStart(5, '0')}.png`; if (mode === 'reframes' || !fs.existsSync(f)) { await shot(i / FPS, f); count++; } }
} else if (mode === 'check') {
  // label contrast: every visible overlay text against what is actually behind it (plate colour over the rendered picture)
  const tl = JSON.parse(fs.readFileSync(`${clip}/timeline.json`)); const step = +(a || 12), last = Math.floor(tl.end * FPS);
  const fails = []; let checked = 0;
  for (let i = 0; i <= last; i += step) {
    await draw(i / FPS, 1); count++;
    // DOM set: the background behind a text is its nearest painted ancestor, composited down to the ink ground;
    // colours are read back through a canvas so oklch() and color-mix() resolve exactly as painted
    const r = await page.evaluate(() => {
      const W = 1920, H = 1080, c = document.createElement('canvas'); c.width = c.height = 1; const g = c.getContext('2d', {willReadFrequently: true});
      const rgba = css => { g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = css; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
      const alphaOf = css => { const m = String(css).match(/\/\s*([\d.]+)(%?)\s*\)$/) || String(css).match(/rgba\([^)]*,\s*([\d.]+)\)$/); return css === 'transparent' || /rgba\(0, 0, 0, 0\)/.test(css) ? 0 : m ? (+m[1]) / (m[2] ? 100 : 1) : 1; };
      const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
      const lum = ([r, gg, b]) => .2126 * lin(r) + .7152 * lin(gg) + .0722 * lin(b);
      const ink = rgba(getComputedStyle(document.body).backgroundColor);
      const out = [];
      for (const e of document.querySelectorAll('#stage *')) {
        const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim(); if (!own) continue;
        let op = 1, hidden = false; const layers = [];
        for (let p = e; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); op *= +cs.opacity; if (cs.display === 'none' || cs.visibility === 'hidden') hidden = true;
          const bg = cs.backgroundColor, a = alphaOf(bg); if (a > .02) { const [r0, g0, b0] = rgba(bg.replace(/\/\s*[\d.]+%?\s*\)$/, ')')); layers.push([r0, g0, b0, a]); if (a > .97) break; } }
        if (hidden || op < .95) continue;
        const R = e.getBoundingClientRect(); if (R.width < 2 || R.height < 2 || R.right < 0 || R.left > W || R.bottom < 0 || R.top > H) continue;
        if (R.left < -1 || R.top < -1 || R.right > W + 1 || R.bottom > H + 1) { out.push({text: own.slice(0, 40), cls: String(e.className), ratio: 0, cut: true}); continue; }
        let bgc = ink.slice(0, 3); for (const L of layers.reverse()) bgc = bgc.map((v, k) => L[k] * L[3] + v * (1 - L[3]));
        const tcss = getComputedStyle(e).color, ta = alphaOf(tcss), tc = rgba(tcss.replace(/\/\s*[\d.]+%?\s*\)$/, ')')).slice(0, 3).map((v, k) => v * ta + bgc[k] * (1 - ta));
        const Lt = lum(tc), Lb = lum(bgc), ratio = (Math.max(Lt, Lb) + .05) / (Math.min(Lt, Lb) + .05);
        out.push({text: own.slice(0, 40), cls: String(e.className), ratio: +ratio.toFixed(2)});
      }
      return out;
    });
    for (const x of r) { checked++; if (x.ratio < 4.5) fails.push({t: +(i / FPS).toFixed(2), ...x}); }
  }
  const worst = {}; for (const f of fails) { const k = f.cls + '|' + f.text; if (!worst[k] || f.ratio < worst[k].ratio) worst[k] = f; }
  const rep = {clip, minRatio: 4.5, framesChecked: count, labelsChecked: checked, failing: Object.values(worst).sort((p, q) => p.ratio - q.ratio)};
  fs.writeFileSync(`${clip}/checks/contrast.json`, JSON.stringify(rep, null, 1));
  console.log(`contrast ${clip}: ${rep.failing.length} label(s) under 4.5:1` + rep.failing.map(f => `\n  ${f.cut ? 'CUT BY EDGE' : f.ratio}  t=${f.t}s  .${f.cls}  "${f.text}"`).join(''));
}
console.log('ms/frame', Math.round((Date.now() - t0) / Math.max(1, count)), `(${count} frames, blur ${mode === 'check' ? 1 : BLUR})`);
await browser.close();
