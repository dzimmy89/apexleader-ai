// FromAItoBusiness desk player: plays ./shots.json on the brand's set (one founder's calm desk, from above, in ink,
// paper and signal orange) and exposes window.renderAt(t), so render.mjs, encode.sh and check-sync.mjs work on it
// as they do on The Node's three.js kit. It is plain DOM: no WebGL, no 3D props, no emoji. Icons are Lucide
// (desk/icons.json, written by desk/icons.mjs). Times come only from cues on the voice (kit/spec.mjs), and every
// number on screen comes from "inputs" through kit/spec.mjs templates and is logged to window.__numbers.
// See desk/SHOTS.md for the shot types.
import * as SP from '../kit/spec.mjs';
import {ease, clamp} from '../../harness/motion.mjs';

const getJSON = async u => { const r = await fetch(u); if (!r.ok) throw new Error(`desk: cannot load ${u} (${r.status})`); return r.json(); };
const clip = location.pathname.split('/').filter(Boolean).slice(-2, -1)[0];
const [spec, WORDS, TL, BEATS, ICONS] = await Promise.all(['shots.json', 'words.json', 'timeline.json', 'beats.json', '../desk/icons.json'].map(getJSON));
window.__numbers = []; window.__cues = [];
// the course's track colour (brand.css: marketing, sales, accounting) for the quiet accents; the hero stays signal
if (spec.track) document.documentElement.dataset.track = spec.track;
await document.fonts.ready;

// ---------- motion helpers (pure functions of T) ----------
const en = (T, t0, d = .55) => ease.enter(clamp((T - t0) / d));
const mv = (T, t0, d = .9) => ease.move(clamp((T - t0) / d));
// an arrival that is sharp on its word: it starts ~0.45 s before the cue and settles ~0.1 s after
const arrive = (T, at, d = .55) => at === -Infinity ? 1 : en(T, at - .45, d);
const bump = (T, at, d = .32, a = .05) => { const u = (T - (at - d * .3)) / d; return u <= 0 || u >= 1 ? 1 : 1 + a * Math.sin(Math.PI * u); };
const lerp = (a, b, u) => a + (b - a) * u;

// ---------- DOM ----------
const $world = document.getElementById('world'), $shots = document.getElementById('shots'), $hud = document.getElementById('hud');
const el = (cls, html = '', parent = null, tag = 'div') => { const d = document.createElement(tag); if (cls) d.className = cls; if (html) d.innerHTML = html; if (parent) parent.appendChild(d); return d; };
const icon = (name, cls = 'icon') => { if (!name) return ''; const s = ICONS[name]; if (!s) throw new Error(`desk: icon "${name}" is not in icons.json (run npm run icons)`); return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${s}</svg>`; };
const at = (d, x, y, w) => { d.style.left = x + 'px'; d.style.top = y + 'px'; if (w) d.style.width = w + 'px'; return d; };
const show = (d, op, dy = 0, s = 1) => { d.style.opacity = op; d.style.transform = `translateY(${(1 - Math.min(1, op)) * dy}px) scale(${s})`; d.style.visibility = op < .002 ? 'hidden' : 'visible'; };
const lit = (d, on) => d.classList.toggle('lit', !!on);

// ---------- one clip's shots ----------
async function buildClip(cspec, env, only = null) {
  const P = SP.plan(cspec, env.resolve, {tl: env.tl});
  P.warnings.forEach(w => console.warn(`[desk] ${env.clip}: ${w}`));
  if (P.errors.length) { const m = `[desk] ${env.clip}:\n  ` + P.errors.join('\n  '); console.error(m); throw new Error(m); }
  const scope = SP.buildScope(cspec, env.baseScope || {});
  const built = [];
  for (const row of P.shots) {
    if (only && !only.has(row.id)) { built.push(null); continue; }
    const S = row.spec, overId = S.over && (typeof S.over === 'string' ? S.over : S.over.shot);
    const base = overId ? built.find(b => b && b.id === overId) : null;
    if (overId && !base) throw new Error(`[desk] ${row.id}: "over" names ${overId}, which must be an earlier shot`);
    const root = el('shot', '', $shots), hud = el('shot', '', $hud);
    root.dataset.id = hud.dataset.id = (env.prefix || '') + row.id;
    const cue = c => env.resolve(c).t;
    const ctx = {id: row.id, t0: row.t0, t1: row.t1, hero: row.hero, END: env.tl.end, scope, root, hud, base, env,
      cue, cueOr: (c, d) => c === undefined || c === null ? d : cue(c),
      // when a part has no cue: visible from frame 0 on the first shot, else just after the cut
      first: row.t0 <= 0 ? -Infinity : row.t0 + .45,
      tpl: (str, where) => SP.template(str, scope, r => { const n = {clip: env.clip, shot: row.id, where, ...r}; window.__numbers.push(n); console.log(`[kit number] ${row.id} ${where}: ${r.text} = ${r.expr} -> ${r.value} (${r.fmt})`); })};
    const shot = await BUILD[S.type](S, ctx);
    shot.notes = (S.notes || []).map((n, i) => makeNote(n, i, ctx));
    Object.assign(shot, {id: row.id, t0: row.t0, t1: row.t1, hero: row.hero, type: S.type, base, root, hud, scope});
    if (!shot.camera) shot.camera = preset(S.camera || shot.defaultMove || 'push-in', shot.frame || (base && base.camera(base.t1 - 1e-3)) || {x: 960, y: 540, s: 1}, row.t0, row.t1);
    built.push(shot);
  }
  return {P, built, scope};
}

// ---------- camera: the world is a 1920x1080 sheet; a frame is the point at screen centre and a scale ----------
function preset(move, F, t0, t1) {
  const m = typeof move === 'string' ? move : move.move, amt = (typeof move === 'object' && move.amount) || 1;
  if (!SP.CAMERA_MOVES.includes(m)) throw new Error(`camera ${m} is not a preset`);
  return T => { const u = ease.sine(clamp((T - t0) / Math.max(1, t1 - t0)));
    const ds = .04 * amt, dx = 60 * amt;
    switch (m) {
      case 'push-in': return {x: F.x, y: F.y, s: F.s * (1 + ds * u)};
      case 'pull-back': return {x: F.x, y: F.y, s: F.s * (1 + ds * (1 - u))};
      case 'dolly-left': return {x: F.x + dx * (1 - 2 * u), y: F.y, s: F.s * 1.02};
      case 'dolly-right': return {x: F.x - dx * (1 - 2 * u), y: F.y, s: F.s * 1.02};
      case 'hold-drift': return {x: F.x + 12 * u, y: F.y, s: F.s * (1 + .015 * u)};
    } };
}
// a faint handheld breath on top of every move, so nothing parks during a hold
const breathe = (c, T) => ({x: c.x + 2.2 * Math.sin(T * .63) + 1.1 * Math.sin(T * 1.37 + 2), y: c.y + 1.6 * Math.sin(T * .51 + 1), s: c.s * (1 + .0016 * Math.sin(T * .41))});
const setCam = c => { $world.style.transform = `translate(${960 - c.x * c.s}px, ${540 - c.y * c.s}px) scale(${c.s})`; };

// ---------- notes: small cued tags on the screen (never the hero) ----------
function makeNote(n, i, ctx) {
  const d = el('note chip' + (n.tone === 'signal' ? ' lit' : ''), icon(n.icon) + `<span>${ctx.tpl(n.text, `note ${i}`)}</span>`, ctx.hud);
  const tIn = ctx.cueOr(n.at, ctx.first), tOut = n.until !== undefined ? ctx.cue(n.until) : Infinity;
  const y = n.screen === 'top' ? 64 : n.screen === 'mid' ? 470 : 836;
  return {update(T) { const op = arrive(T, tIn) * (1 - en(T, tOut - .25, .4));
    d.style.left = '960px'; d.style.top = y + 'px'; d.style.opacity = op; d.style.visibility = op < .002 ? 'hidden' : 'visible';
    d.style.transform = `translate(-50%, ${(1 - op) * 14}px) scale(${bump(T, tIn, .32, .04)})`; }};
}

// ---------- shot types ----------
const BUILD = {};

// desk: the hook. Things on the desk at x, y (px on the 1920x1080 sheet); frame 0 is already composed.
// items: [{id, kind: laptop|chip|agent|paper|text|card|list, x, y, w, at?, until?, lightAt?, ...}], hero {move: light|pop, target, at}
BUILD.desk = async (S, ctx) => {
  const H = S.hero || {}, heroT = ctx.cue(H.at), targets = [].concat(H.target || []);
  const items = S.items.map((it, i) => {
    const id = it.id || `item${i}`, d = at(el(`it ${it.kind}`, '', ctx.root), it.x, it.y, it.w);
    let tIn = ctx.cueOr(it.at, ctx.first); if (H.move === 'pop' && targets.includes(id)) tIn = heroT;
    const tOut = it.until !== undefined ? ctx.cue(it.until) : Infinity;
    const tLit = targets.includes(id) && H.move !== 'pop' ? heroT : it.lightAt !== undefined ? ctx.cue(it.lightAt) : null;
    const subs = [];   // cued parts inside the item: [element, time]
    let extra = () => {};
    if (it.kind === 'laptop') {
      d.innerHTML = `<div class="lid"><div class="screen">${'<i></i>'.repeat(6)}</div></div><div class="base"></div>`;
      const lid = d.querySelector('.lid'), tClose = ctx.cueOr(it.closeAt, null);
      [...lid.querySelectorAll('i')].forEach((x, k) => { x.style.width = `${[88, 62, 74, 48, 80, 56][k]}%`; });
      extra = T => { const u = tClose === null ? 0 : mv(T, tClose - .35, .8); lid.style.transform = `scaleY(${1 - .93 * u})`; lid.querySelector('.screen').style.opacity = 1 - u; };
    } else if (it.kind === 'chip') {
      d.classList.add('chip'); d.innerHTML = `<span class="a">${icon(it.icon)}<span>${ctx.tpl(it.text, `${id}`)}</span></span>`;
      d.querySelector('.a').style.cssText = 'display:inline-flex;align-items:center;gap:14px';
      if (it.swap) { const b = el('b', icon(it.swap.icon || it.icon) + `<span>${ctx.tpl(it.swap.text, `${id} swap`)}</span>`, d, 'span'); b.style.cssText = 'position:absolute;left:26px;top:18px;display:inline-flex;align-items:center;gap:14px;white-space:nowrap';
        const tS = ctx.cue(it.swap.at), a = d.querySelector('.a'); a.style.display = 'inline-flex';
        d.style.minWidth = (it.swapW || 300) + 'px';
        extra = T => { const u = en(T, tS - .3, .45); a.style.opacity = 1 - u; b.style.opacity = u; }; }
    } else if (it.kind === 'agent' || it.kind === 'card') {
      d.classList.add('card'); if (it.kind === 'agent') d.classList.add('agent');
      const head = el('ic', '', d);
      if (it.kind === 'agent') { head.innerHTML = icon(it.icon) + `<span class="sys" style="color:var(--text)">${ctx.tpl(it.name, `${id} name`)}</span>`; head.style.justifyContent = 'flex-start'; }
      else head.innerHTML = icon(it.icon) + `<span class="h3">${ctx.tpl(it.title, `${id} title`)}</span>`;
      if (it.status) { const p = el('pill' + (it.statusTone ? ' ' + it.statusTone : ''), (it.statusIcon ? icon(it.statusIcon) : '') + ctx.tpl(it.status, `${id} status`), head, 'span'); p.style.marginLeft = 'auto';
        if (it.statusAt !== undefined) subs.push([p, ctx.cue(it.statusAt)]); }
      if (it.sub) el('body', ctx.tpl(it.sub, `${id} sub`), d);
      if (it.lines) { const R = el('rows', '', d); it.lines.forEach((l, k) => subs.push([el('row', ctx.tpl(l.text, `${id} line ${k}`), R), ctx.cueOr(l.at, tIn)])); }
    } else if (it.kind === 'paper') {
      d.classList.add('paper'); d.innerHTML = (it.kicker ? `<div class="kicker" style="margin-bottom:12px">${ctx.tpl(it.kicker, `${id} kicker`)}</div>` : '') +
        `<div style="display:flex;gap:20px;align-items:center">${icon(it.icon)}<span class="h3" style="color:inherit">${ctx.tpl(it.text, `${id}`)}</span></div>`;
    } else if (it.kind === 'text') {
      d.innerHTML = `<div class="${it.cls || 'h2'}">${ctx.tpl(it.text, `${id}`)}</div>`;
    } else if (it.kind === 'list') {
      d.classList.add('card'); if (it.title) el('kicker', ctx.tpl(it.title, `${id} title`), d);
      const R = el('rows', '', d); it.rows.forEach((l, k) => subs.push([el('row', ctx.tpl(l.text, `${id} row ${k}`), R), ctx.cueOr(l.at, tIn)]));
    } else throw new Error(`desk item kind "${it.kind}"`);
    return {id, d, tIn, tOut, tLit, subs, extra, it};
  });
  return {frame: S.frame || {x: 960, y: 540, s: 1}, defaultMove: 'push-in', update(T) {
    for (const x of items) {
      const op = arrive(T, x.tIn) * (1 - en(T, x.tOut - .25, .4));
      const on = x.tLit !== null && T >= x.tLit - .12;
      lit(x.d, on); if (x.it.kind === 'paper' && x.tLit !== null) x.d.style.boxShadow = on ? '0 0 0 6px var(--signal), 0 22px 60px oklch(8% 0.02 262 / 0.55)' : '';
      show(x.d, op, 26, x.tLit !== null ? bump(T, x.tLit, .34, .05) : 1);
      for (const [s, t] of x.subs) show(s, arrive(T, t), 12);
      x.extra(T);
    } }};
};

// chapter-card: kicker + title (+ sub), and an "In this lesson" list whose rows land on cues
BUILD['chapter-card'] = async (S, ctx) => {
  const [k0, ...rest] = String(ctx.env.tl.chapter || '').split(' · ');
  const box = el('chap', '', ctx.root);
  const kick = el('kicker', ctx.tpl(S.kicker ?? (rest.length ? [k0, ...rest.slice(0, -1)].join(' · ') : ''), 'kicker'), box);
  const title = el('title', ctx.tpl(S.title ?? (rest.length ? rest[rest.length - 1] : k0), 'title'), box);
  const bar = el('rule', '', box);
  const sub = S.sub ? el('body', ctx.tpl(S.sub, 'sub'), box) : null; if (sub) { sub.style.fontSize = '40px'; sub.style.marginTop = '-10px'; }
  const tSub = ctx.cueOr(S.subAt, ctx.t0);
  const ag = S.agenda ? el('agenda', '', box) : null;
  const rows = (S.agenda || []).map((a, i) => [el('ag', icon(a.icon) + `<span>${ctx.tpl(a.text, `agenda ${i}`)}</span>`, ag), ctx.cue(a.at)]);
  const tH = ctx.hero.t;
  return {frame: {x: 960, y: 540, s: 1}, defaultMove: 'push-in', update(T) {
    show(kick, en(T, tH - .3, .5), 16); show(title, en(T, tH - .2, .6), 22); bar.style.transform = `scaleX(${en(T, tH, .7)})`; bar.style.transformOrigin = 'left';
    if (sub) show(sub, arrive(T, tSub), 14);
    for (const [r, t] of rows) show(r, arrive(T, t), 14);
  }};
};

// story-cards: a row of cards that land one per cue; each may carry rows that land on their own cues
BUILD['story-cards'] = async (S, ctx) => {
  const n = S.cards.length, gap = S.gap ?? 44, W = S.cardW ?? Math.min(560, (1720 - gap * (n - 1)) / n);
  const x0 = 960 - (n * W + (n - 1) * gap) / 2, top = S.top ?? (S.title || S.kicker ? 340 : 290);
  const head = S.title || S.kicker ? at(el('it', (S.kicker ? `<div class="kicker" style="margin-bottom:14px">${ctx.tpl(S.kicker, 'kicker')}</div>` : '') + (S.title ? `<div class="h2">${ctx.tpl(S.title, 'title')}</div>` : ''), ctx.root), x0, 110, Math.min(1700, 1820 - x0)) : null;
  const tHead = ctx.cueOr(S.titleAt, ctx.first);
  const H = typeof S.hero === 'object' && S.hero ? S.hero : {}, hi = [].concat(H.card ?? n - 1), tHero = ctx.hero.t;
  const cards = S.cards.map((c, i) => {
    const d = at(el('it card' + (c.agent ? ' agent' : ''), '', ctx.root), x0 + i * (W + gap), top + (c.dy || 0), W);
    if (S.numbered) el('num', String(i + 1), d);
    const hd = el('ic', '', d);
    if (c.agent) hd.innerHTML = icon(c.icon) + `<span class="sys" style="color:var(--text)">${ctx.tpl(c.label, `card ${i} label`)}</span>`;
    else hd.innerHTML = icon(c.icon);
    if (!c.agent) el('h3', ctx.tpl(c.label, `card ${i} label`), d);
    if (c.status) { const p = el('pill' + (c.statusTone ? ' ' + c.statusTone : ''), ctx.tpl(c.status, `card ${i} status`), hd, 'span'); p.style.marginLeft = 'auto'; }
    if (c.sub) el('body', ctx.tpl(c.sub, `card ${i} sub`), d);
    const tIn = ctx.cue(c.at);
    const R = c.rows ? el('rows', '', d) : null;
    const rows = (c.rows || []).map((r, k) => [el('row', ctx.tpl(r.text, `card ${i} row ${k}`), R), ctx.cueOr(r.at, tIn)]);
    let bar = null, tStrike = c.strikeAt !== undefined ? ctx.cue(c.strikeAt) : null;
    if (tStrike !== null) { const h = d.querySelector('.h3') || d.querySelector('.sys'); h.classList.add('strike'); bar = el('bar', '', h, 'i'); }
    return {d, tIn, rows, bar, tStrike, hero: hi.includes(i)};
  });
  const hMax = Math.max(...cards.map(c => c.d.offsetHeight)); if (S.equal !== false) cards.forEach(c => { c.d.style.height = hMax + 'px'; });
  return {frame: {x: 960, y: 540, s: 1}, defaultMove: S.camera || 'push-in', update(T) {
    if (head) show(head, arrive(T, tHead), 14);
    for (const c of cards) {
      const on = c.hero && T >= tHero - .12;
      lit(c.d, on); show(c.d, arrive(T, c.tIn), 30, c.hero ? bump(T, tHero, .34, .045) : 1);
      for (const [r, t] of c.rows) show(r, arrive(T, t), 10);
      if (c.bar) c.bar.style.transform = `scaleX(${mv(T, c.tStrike - .3, .45)})`;
    } }};
};

// timeline: a rail; dated markers land on cues and the rail draws to each
BUILD.timeline = async (S, ctx) => {
  const n = S.markers.length, xa = 330, xb = 1590, y = 560;
  const head = at(el('it', (S.kicker ? `<div class="kicker" style="margin-bottom:14px">${ctx.tpl(S.kicker, 'kicker')}</div>` : '') + (S.title ? `<div class="h2">${ctx.tpl(S.title, 'title')}</div>` : ''), ctx.root), 170, 190, 1600);
  const rail = at(el('rail', '', ctx.root), xa - 80, y + 14, xb - xa + 160);
  const mks = S.markers.map((m, i) => { const x = n === 1 ? 960 : xa + (xb - xa) * i / (n - 1);
    const d = at(el('mk', `<div class="date">${ctx.tpl(m.date, `marker ${i} date`)}</div><div class="dot"></div><div class="h3">${ctx.tpl(m.label, `marker ${i} label`)}</div>` + (m.sub ? `<div class="body" style="font-size:30px">${ctx.tpl(m.sub, `marker ${i} sub`)}</div>` : ''), ctx.root), x, y - 46);
    return {d, x, t: ctx.cue(m.at)}; });
  const H = typeof S.hero === 'object' && S.hero ? S.hero : {}, hi = H.marker ?? n - 1, tH = ctx.hero.t, tHead = ctx.cueOr(S.titleAt, ctx.first);
  return {frame: {x: 960, y: 540, s: 1}, defaultMove: 'dolly-right', update(T) {
    show(head, arrive(T, tHead), 14);
    let reach = 0; mks.forEach((m, i) => { const u = mv(T, m.t - .7, .7); if (u > 0) reach = Math.max(reach, (i ? lerp(mks[i - 1].x, m.x, u) : lerp(xa - 80, m.x, u)) - (xa - 80)); });
    rail.style.background = `linear-gradient(90deg, var(--signal) ${reach}px, var(--line-strong) ${reach}px)`;
    mks.forEach((m, i) => { lit(m.d, i === hi ? T >= tH - .12 : false); show(m.d, arrive(T, m.t), 20, i === hi ? bump(T, tH, .34, .05) : 1); m.d.style.transform += ' translateX(-50%)'; });
  }};
};

// rule: the one paper block, a statement with a phrase that turns signal on its cue, and chips under it
BUILD.rule = async (S, ctx) => {
  const box = at(el('it paper', '', ctx.root), 240, S.y ?? 260, 1440);
  box.style.padding = '54px 64px';
  if (S.kicker) { const k = el('kicker', icon(S.kickerIcon) + `<span>${ctx.tpl(S.kicker, 'kicker')}</span>`, box); k.style.cssText = 'display:flex;align-items:center;gap:14px;margin-bottom:26px'; k.querySelector('svg') && (k.querySelector('svg').style.cssText = 'width:40px;height:40px'); }
  let html = ctx.tpl(S.statement, 'statement'); const hl = S.highlight ? ctx.tpl(S.highlight.text, 'highlight') : null;
  if (hl) { if (!html.includes(hl)) throw new Error(`[desk] ${ctx.id}: highlight "${hl}" is not in the statement`); html = html.replace(hl, `<span class="hlx">${hl}</span>`); }
  const st = el('', html, box); st.style.cssText = 'font: 800 70px/1.08 var(--display); letter-spacing: -0.02em; text-wrap: balance;';
  const span = st.querySelector('.hlx'), tHl = hl ? ctx.cue(S.highlight.at) : null;
  const tIn = ctx.cueOr(S.at, ctx.t0 <= 0 ? -Infinity : ctx.t0 + .3);
  const ph = box.offsetHeight, chipH = S.chips ? 110 : 0, y0 = S.y ?? Math.round(470 - (ph + chipH) / 2); box.style.top = y0 + 'px';
  const chipsBox = at(el('it', '', ctx.root), 240, y0 + ph + 36, 1440); chipsBox.style.cssText += ';display:flex;gap:24px;flex-wrap:wrap';
  const chips = (S.chips || []).map((c, i) => { const d = el('chip' + (c.tone === 'signal' ? ' lit' : ''), icon(c.icon) + `<span>${ctx.tpl(c.text, `chip ${i}`)}</span>`, chipsBox);
    let bar = null; if (c.strikeAt !== undefined) { d.classList.add('strike'); bar = el('bar', '', d, 'i'); }
    return {d, t: ctx.cue(c.at), bar, ts: c.strikeAt !== undefined ? ctx.cue(c.strikeAt) : null}; });
  const tH = ctx.hero.t;
  return {frame: {x: 960, y: 540, s: 1}, defaultMove: 'push-in', update(T) {
    show(box, arrive(T, tIn), 30, bump(T, tH, .34, .03));
    if (span) { const u = en(T, tHl - .25, .35); span.style.color = `color-mix(in oklch, var(--signal-ink) ${u * 100}%, var(--paper-text))`; }
    for (const c of chips) { show(c.d, arrive(T, c.t), 14); if (c.bar) c.bar.style.transform = `scaleX(${mv(T, c.ts - .3, .45)})`; }
  }};
};

// counter (bars mode): tracks at one shared scale; each value counts up and rides the bar's end
BUILD.counter = async (S, ctx) => {
  if (!S.bars) throw new Error(`[desk] ${ctx.id}: the desk counter supports bars mode only`);
  const head = at(el('it', (S.kicker ? `<div class="kicker" style="margin-bottom:14px">${ctx.tpl(S.kicker, 'kicker')}</div>` : '') + (S.title ? `<div class="h2">${ctx.tpl(S.title, 'title')}</div>` : ''), ctx.root), 160, 120, 1600);
  const vals = S.bars.map(b => SP.evaluate(b.value, ctx.scope)), max = Math.max(...vals), X = 760, Wmax = 1000, gap = S.gap ?? 130, y0 = S.top ?? 330;
  const H = typeof S.hero === 'object' && S.hero ? S.hero : {}, hi = H.bar ?? S.bars.length - 1, tH = ctx.hero.t;
  const bars = S.bars.map((b, i) => { const y = y0 + i * gap, fmt = b.fmt || S.fmt || '0,0';
    const lab = at(el('it h3', ctx.tpl(b.label, `bar ${i} label`), ctx.root), 160, y + 18, 580);
    const tr = at(el('it track', '', ctx.root), X, y, Wmax * vals[i] / max);
    const val = at(el('it bval', '', ctx.root), X, y);
    const text = SP.format(vals[i], fmt); window.__numbers.push({clip: ctx.env.clip, shot: ctx.id, where: `bar ${i}`, expr: String(b.value), value: vals[i], fmt, text});
    return {lab, tr, val, v: vals[i], fmt, w: Wmax * vals[i] / max, tA: ctx.cue(b.at), tL: ctx.cue(b.land)}; });
  const tHead = ctx.cueOr(S.titleAt, ctx.first);
  return {frame: {x: 960, y: 540, s: 1}, defaultMove: 'push-in', update(T) {
    show(head, arrive(T, tHead), 14);
    bars.forEach((b, i) => { const op = arrive(T, b.tA, .4), u = mv(T, b.tA, Math.max(.3, b.tL - b.tA));
      show(b.lab, op, 10); b.tr.style.opacity = op; b.tr.style.transform = `scaleX(${Math.max(.02, u)})`;
      b.val.textContent = SP.format(u >= 1 ? b.v : Math.round(b.v * u), b.fmt); b.val.style.opacity = op;
      b.val.style.left = (X + Math.max(b.w * u, 0) + 26) + 'px';
      lit(b.tr, i === hi && T >= tH - .12); b.val.style.color = i === hi && T >= tH - .12 ? 'var(--signal)' : 'var(--text)'; });
  }};
};

// ledger (grid mode): a table whose rows land on cues; a row can light; every cell is a template
BUILD.ledger = async (S, ctx) => {
  const G = S.grid; if (!G) throw new Error(`[desk] ${ctx.id}: the desk ledger supports grid mode only`);
  const head = at(el('it', (S.kicker ? `<div class="kicker" style="margin-bottom:16px">${ctx.tpl(S.kicker, 'kicker')}</div>` : '') + (S.title ? `<div class="h2">${ctx.tpl(S.title, 'title')}</div>` : ''), ctx.root), 160, 96, 1600);
  const cols = G.columns.map(c => c.w || '1fr').join(' ');
  const tbl = at(el('it tbl', '', ctx.root), 160, S.top ?? 290, 1600); tbl.style.setProperty('--cg', '44px');
  const cellsAt = [];   // cells with their own cue arrive after their row
  const mkRow = (cells, cls, where) => { const r = el('tr ' + cls, '', tbl); r.style.gridTemplateColumns = cols;
    cells.forEach((c, k) => { const C = G.columns[k] || {}; const d = el('td' + (C.num ? ' n' : '') + (C.sub ? ' sub' : ''), ctx.tpl(typeof c === 'string' ? c : c.text, `${where} col ${k}`), r);
      if (typeof c === 'object' && c.at !== undefined) cellsAt.push([d, ctx.cue(c.at)]); }); return r; };
  const hr = el('tr', '', tbl); hr.style.gridTemplateColumns = cols; G.columns.forEach(c => { const h = el('th', ctx.tpl(c.text, 'column'), hr); if (c.num) h.style.textAlign = 'right'; });
  const rows = G.rows.map((r, i) => ({d: mkRow(r.cells, '', `row ${i}`), t: ctx.cueOr(r.at, ctx.first), tl: r.lightAt !== undefined ? ctx.cue(r.lightAt) : null}));
  const tot = G.total ? {d: mkRow(G.total.cells, 'tot', 'total'), t: ctx.cue(G.total.at)} : null;
  const H = typeof S.hero === 'string' ? {[S.hero]: true} : S.hero || {}, tH = ctx.hero.t;
  if (H.row !== undefined) rows[H.row].tl = tH;
  const tHead = ctx.cueOr(S.titleAt, ctx.first);
  return {frame: {x: 960, y: 540, s: 1}, defaultMove: 'push-in', update(T) {
    show(head, arrive(T, tHead), 14); show(hr, arrive(T, tHead), 8);
    for (const r of rows) { show(r.d, arrive(T, r.t), 16, r.tl === tH ? bump(T, tH, .34, .02) : 1); lit(r.d, r.tl !== null && T >= r.tl - .12); }
    if (tot) show(tot.d, arrive(T, tot.t), 16, H.total ? bump(T, tH, .34, .03) : 1);
    for (const [d, t] of cellsAt) show(d, arrive(T, t, .4), 8);
  }};
};

// figure: a lesson infographic as a print on the desk; the camera pushes into regions and the rest dims
BUILD.figure = async (S, ctx) => {
  const img = new Image(); img.src = '/' + S.src.replace(/^\/+/, ''); await img.decode();
  const aspect = img.naturalWidth / img.naturalHeight, side = !!(S.title || S.regions.some(r => r.label));
  const box = side ? [660, 70, 1830, 880] : [260, 70, 1660, 880];
  let w = box[2] - box[0], h = w / aspect; if (h > box[3] - box[1]) { h = box[3] - box[1]; w = h * aspect; }
  const px = box[0] + (box[2] - box[0] - w) / 2, py = box[1] + (box[3] - box[1] - h) / 2;
  const pr = at(el('print', '', ctx.root), px, py, w); pr.style.height = h + 'px'; pr.appendChild(img);
  const dims = [0, 1, 2, 3].map(() => el('dim', '', pr)), ring = el('ring', '', pr);
  const plate = side ? at(el('it plate', '', ctx.hud), 90, 300, 520) : null;
  const pk = plate ? el('kicker', S.title ? ctx.tpl(S.title, 'title') : '', plate) : null, pl = plate ? el('h3', '', plate) : null;
  if (pl) { pl.style.marginTop = '12px'; pl.style.fontSize = '44px'; }
  const regs = S.regions.map((r, i) => ({...r, t: ctx.cue(r.at), label: r.label ? ctx.tpl(r.label, `region ${i}`) : ''}));
  // the frame that fits a region (fractions of the print) inside the box, never past 1.8x
  const fit = r => { const [rx, ry, rw, rh] = r.rect, cx = px + (rx + rw / 2) * w, cy = py + (ry + rh / 2) * h;
    const s = Math.min(1.8, (box[2] - box[0]) / (rw * w * 1.08), (box[3] - box[1]) / (rh * h * 1.08));
    // keep the print's centre near the box centre so the plate side stays clear
    const bx = (box[0] + box[2]) / 2, by = (box[1] + box[3]) / 2;
    return {x: cx - (bx - 960) / s, y: cy - (by - 540) / s, s, r: r.rect}; };
  const frames = regs.map(r => S.zoom === false ? {x: 960, y: 540, s: 1} : fit(r)), whole = {x: 960, y: 540, s: 1, r: [0, 0, 1, 1]};
  const camAt = T => { let F = whole, k = -1; regs.forEach((r, i) => { if (T >= r.t - .85) k = i; });
    if (k < 0) return {...whole, k};
    const prev = k ? frames[k - 1] : whole, u = mv(T, regs[k].t - .85, 1.0), F2 = frames[k];
    F = {x: lerp(prev.x, F2.x, u), y: lerp(prev.y, F2.y, u), s: lerp(prev.s, F2.s, u)};
    return {...F, k, u, prev, F2}; };
  const tIn = ctx.t0 <= 0 ? -Infinity : ctx.t0 + .2;
  return {camera: T => { const c = camAt(T), drift = 1 + .012 * clamp((T - ctx.t0) / Math.max(1, ctx.t1 - ctx.t0)); return {x: c.x, y: c.y, s: c.s * drift}; },
    update(T) {
      show(pr, arrive(T, tIn), 24); const c = camAt(T);
      const k = c.k; let op = 0, rr = [0, 0, 1, 1];
      if (k >= 0 && !(regs[k].dim === false)) { op = k === 0 ? c.u : 1; const a = k ? regs[k - 1].rect : regs[k].rect, b = regs[k].rect; rr = a.map((v, j) => lerp(v, b[j], k ? c.u : 1)); }
      const [x, y, ww, hh] = rr;
      const D = [[0, 0, 1, y], [0, y + hh, 1, 1 - y - hh], [0, y, x, hh], [x + ww, y, 1 - x - ww, hh]];
      dims.forEach((d, j) => { const [a, b, cW, cH] = D[j]; d.style.cssText = `left:${a * 100}%;top:${b * 100}%;width:${cW * 100}%;height:${Math.max(0, cH) * 100}%;opacity:${op}`; });
      ring.style.cssText = `left:${x * 100}%;top:${y * 100}%;width:${ww * 100}%;height:${hh * 100}%;opacity:${op}`;
      if (plate) { const lab = k >= 0 ? regs[k].label : ''; pl.innerHTML = lab; show(plate, arrive(T, tIn) * (lab || S.title ? 1 : 0), 14); pl.style.display = lab ? '' : 'none'; }
    }};
};

// question: the exercise setup's last shot. The scene it sits over dims, the card lands, each line carries a "?" chip
BUILD.question = async (S, ctx) => {
  const card = at(el('qcard', '', ctx.root), 250, S.y ?? 230, 1420);
  el('kicker', ctx.tpl(S.kicker || 'Your turn', 'kicker'), card);
  const q = el('h2', ctx.tpl(S.question, 'question'), card); q.style.fontSize = '64px';
  const lines = (S.lines || [{text: '', at: S.at}]).map((l, i) => { const r = el('qline', '', card);
    const chip = el('ans', '?', r, 'span'); el('', ctx.tpl(l.text, `line ${i}`), r, 'span'); return {r, chip, t: ctx.cueOr(l.at, ctx.t0 + .3)}; });
  if (!S.lines) lines[0].r.style.display = 'none';
  const tIn = ctx.cueOr(S.at, ctx.t0 + .1), tPulse = S.pulse ? ctx.cue(S.pulse) : null;
  const shot = {frame: {x: 960, y: 540, s: 1}, defaultMove: 'pull-back', answers: [],
    // aT: the clock the answers run on (the reveal clip's own time when the reveal replays this frame)
    update(T, aT = T) {
      show(card, arrive(T, tIn), 30);
      lines.forEach((l, i) => { show(l.r, arrive(T, l.t), 12); const A = shot.answers[i];
        if (A && aT >= A.t - .2) { l.chip.innerHTML = A.html; l.chip.classList.add('done'); l.chip.style.transform = `scale(${bump(aT, A.t, .34, .08)})`; }
        else { l.chip.textContent = '?'; l.chip.classList.remove('done'); l.chip.style.transform = `scale(${tPulse !== null ? bump(T, tPulse, .4, .12) : 1})`; } });
    }};
  return shot;
};

// reveal: the exercise reveal's first shot. It rebuilds the setup's question frame (from the setup's own shots,
// words and inputs), frozen on the setup's last frame, so frame 0 of the reveal is the setup's last frame.
BUILD.reveal = async (S, ctx) => {
  const {clip: other, shot: qid} = S.question;
  const O = await buildOther(other, [qid]);
  const q = O.built.find(b => b.id === qid), base = q.base, tq = O.tl.end - 1e-3;
  const scope = {...O.scope, ...ctx.scope};
  const As = (S.answers || [S.answer]).map((A, i) => {
    let html; if (A.text !== undefined) html = SP.template(A.text, scope, r => window.__numbers.push({clip: ctx.env.clip, shot: ctx.id, where: `answer ${i}`, ...r}));
    else { const v = SP.evaluate(A.value, scope); html = SP.format(v, A.fmt || '0,0'); window.__numbers.push({clip: ctx.env.clip, shot: ctx.id, where: `answer ${i}`, expr: String(A.value), value: v, fmt: A.fmt, text: html}); }
    return {html, t: ctx.cue(A.at)}; });
  q.answers = As;
  const F = q.camera(tq);
  return {phase: O.tl.end, other: [q, base].filter(Boolean), camera: T => T < As[0].t ? F : preset('push-in', F, As[0].t, ctx.t1)(T),
    update(T) { if (base) { base.root.style.opacity = .3; base.hud.style.opacity = 0; base.update(base.t1 - 1e-3); }
      q.root.style.opacity = 1; q.update(tq, T); }};
};

// another clip's shots (the reveal rebuilds its setup's question frame)
async function buildOther(otherClip, ids) {
  const b = `../${otherClip}/`;
  const [ospec, words, tl] = await Promise.all(['shots.json', 'words.json', 'timeline.json'].map(f => getJSON(b + f)));
  const env = {clip: otherClip, prefix: otherClip + '/', resolve: SP.makeResolver(words, tl), tl};
  const need = new Set(ids); let grew = true;
  while (grew) { grew = false; for (const s of ospec.shots) if (need.has(s.id) && s.over) { const o = typeof s.over === 'string' ? s.over : s.over.shot; if (!need.has(o)) { need.add(o); grew = true; } } }
  const r = await buildClip(ospec, env, need);
  return {built: r.built.filter(Boolean), tl, scope: r.scope};
}

// ---------- this clip ----------
const env = {clip, resolve: SP.makeResolver(WORDS, TL), tl: TL};
const {built} = await buildClip(spec, env);
const PHASE = built[0].phase || 0;
for (const b of built) if (b.hero && b.hero.word) window.__cues.push({word: b.hero.word, t: b.hero.t});
window.__kit = {clip, shots: built.map(b => ({id: b.id, type: b.type, t0: b.t0, t1: b.t1, hero: b.hero && {t: b.hero.t, word: b.hero.word, what: b.hero.what}})), numbers: window.__numbers};

const allRoots = [...document.querySelectorAll('.shot')];
// captions are player-only: the .vtt sidecar (voice_kokoro.py) is the caption track; nothing is burned into the frames

window.renderAt = T => {
  let i = 0; for (let j = 0; j < built.length; j++) if (T >= built[j].t0) i = j;
  const s = built[i], live = new Set([s.root, s.hud]);
  if (s.base) { live.add(s.base.root); live.add(s.base.hud); }
  for (const o of s.other || []) { live.add(o.root); live.add(o.hud); }
  for (const r of allRoots) { const on = live.has(r); r.style.display = on ? '' : 'none'; }
  setCam(breathe(s.camera(T), T + PHASE));
  if (s.base) { s.base.root.style.opacity = 1 - (s.type === 'question' ? .7 : 1) * en(T, s.t0, .45); s.base.hud.style.opacity = 1 - en(T, s.t0, .3); s.base.update(s.base.t1 - 1e-3); for (const n of s.base.notes) n.update(s.base.t1 - 1e-3); }
  s.root.style.opacity = 1; s.hud.style.opacity = 1;
  s.update(T); for (const n of s.notes) n.update(T);
};
await document.fonts.ready; await Promise.all([...document.images].map(im => im.decode().catch(() => {})));
window.renderAt(0); window.ready = true;
