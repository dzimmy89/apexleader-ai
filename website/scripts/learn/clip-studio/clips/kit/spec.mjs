// Clip kit: the pure part, shared by the browser player (player.mjs) and the Node CLI (kit.mjs).
// No DOM, no three.js. Cues, the safe expression evaluator, number formats, templates, the shot plan and the lint.
// See SPEC.md for the format.

// ---------- words ----------
// same as cine.mjs: lowercase, keep a-z 0-9 % $ ("won't" -> "wont", "seventy-four" -> "seventyfour")
export const norm = s => String(s).toLowerCase().replace(/[^a-z0-9%$]/g, '');

// ---------- cues ----------
// A cue is never a raw number of seconds. Forms (string shorthand or object):
//   "gone"            first "gone" in the clip              {"word": "gone"}
//   "gone#1"          second "gone" (nth counts from 0)     {"word": "gone", "nth": 1}
//   "L3"              start of script line 3 (from 0)       {"line": 3}
//   "L3:gone"         first "gone" inside line 3            {"word": "gone", "line": 3}
//   "L3:gone#1"       second "gone" inside line 3           {"word": "gone", "line": 3, "nth": 1}
//   "end"             the clip's last moment (timeline end) {"end": true}
//   any of these + "+0.4" or "-0.25": an offset in seconds   {"word": "gone", "off": -0.25}
export function parseCue(c) {
  if (c === null || c === undefined) return null;
  if (typeof c === 'number') throw new Error(`raw seconds (${c}) are not a cue; use a word ("gone", "gone#1"), a line ("L3") or "end"`);
  if (typeof c === 'object') {
    const off = +(c.off || 0);
    if (c.end) return {kind: 'end', off};
    if (c.start) return {kind: 'start', off};
    if (c.word !== undefined) return {kind: 'word', word: norm(c.word), nth: +(c.nth || 0), line: c.line ?? null, off};
    if (c.line !== undefined) return {kind: 'line', line: +c.line, off};
    throw new Error('cue object needs "word", "line" or "end": ' + JSON.stringify(c));
  }
  let s = String(c).trim(), off = 0;
  const m = s.match(/^(.*?[^+\-\s])\s*([+-]\s*\d*\.?\d+)$/);
  if (m) { s = m[1]; off = +m[2].replace(/\s/g, ''); }
  if (s === 'end') return {kind: 'end', off};
  if (s === 'start') return {kind: 'start', off};
  let mm;
  if ((mm = s.match(/^L(\d+)$/i))) return {kind: 'line', line: +mm[1], off};
  if ((mm = s.match(/^L(\d+):(.+?)(?:#(\d+))?$/i))) return {kind: 'word', word: norm(mm[2]), nth: +(mm[3] || 0), line: +mm[1], off};
  if ((mm = s.match(/^(.+?)(?:#(\d+))?$/))) { const w = norm(mm[1]); if (!w) throw new Error('empty cue word: ' + c); return {kind: 'word', word: w, nth: +(mm[2] || 0), line: null, off}; }
  throw new Error('cannot read cue ' + JSON.stringify(c));
}
export const cueText = c => typeof c === 'string' ? c : JSON.stringify(c);

// resolve against one clip's words.json + timeline.json. Returns {t, word, at (the word's start), off}
export function makeResolver(words, tl) {
  const N = words.map(w => norm(w.word));
  const lineStart = k => { if (k < 0 || k >= tl.lineStarts.length) throw new Error(`line ${k} does not exist (the script has ${tl.lineStarts.length} lines, counted from 0)`); return tl.lineStarts[k]; };
  const lineEnd = k => k + 1 < tl.lineStarts.length ? tl.lineStarts[k + 1] : Infinity;
  const firstWordAt = t => { const i = words.findIndex(w => w.start >= t - .01); if (i < 0) throw new Error('no word after ' + t); return i; };
  return function resolve(c) {
    const q = typeof c === 'object' && c && c.kind ? c : parseCue(c);
    if (q.kind === 'end') return {t: tl.end + q.off, word: null, at: tl.end, off: q.off, kind: 'end'};
    if (q.kind === 'start') return {t: 0 + q.off, word: null, at: 0, off: q.off, kind: 'start'};
    if (q.kind === 'line') { const i = firstWordAt(lineStart(q.line)); return {t: words[i].start + q.off, word: N[i], at: words[i].start, off: q.off, kind: 'line', idx: i}; }
    let hits = N.map((w, i) => w === q.word ? i : -1).filter(i => i >= 0);
    if (q.line !== null && q.line !== undefined) { const a = lineStart(q.line), b = lineEnd(q.line); hits = hits.filter(i => words[i].start >= a - .01 && words[i].start < b - .01); }
    const i = hits[q.nth];
    if (i === undefined) throw new Error(`cue word "${q.word}"${q.line !== null && q.line !== undefined ? ' in line ' + q.line : ''} #${q.nth} not found (${hits.length} found) — did the script change?`);
    return {t: words[i].start + q.off, word: N[i], at: words[i].start, off: q.off, kind: 'word', idx: i};
  };
}

// ---------- safe expressions ----------
// numbers, names from inputs/values, + - * / ^ ( ) [ ] and a fixed list of functions. Nothing else is evaluated.
const FN = {
  min: Math.min, max: Math.max, abs: Math.abs, floor: Math.floor, ceil: Math.ceil, sqrt: Math.sqrt, exp: Math.exp,
  log: Math.log, log10: Math.log10, pow: Math.pow,
  round: (x, d = 0) => { const k = 10 ** d; return Math.round(x * k) / k; },
  sum: a => arr(a).reduce((p, q) => p + q, 0), len: a => arr(a).length, first: a => arr(a)[0], last: a => arr(a)[arr(a).length - 1],
  at: (a, i) => { const v = arr(a)[i]; if (v === undefined) throw new Error('at(): index ' + i + ' out of range'); return v; },
  range: (a, b, s = 1) => { const o = []; for (let x = a; s > 0 ? x <= b + 1e-9 : x >= b - 1e-9; x += s) o.push(+x.toFixed(10)); return o; },
  // compound growth helpers (readable in specs): grow(100, .03, 10) = 100 * 1.03^10
  grow: (p, r, n) => p * (1 + r) ** n, shrink: (p, r, n) => p / (1 + r) ** n,
  // counting by sign (netting: how many owe, how many are owed)
  sign: Math.sign, negatives: a => arr(a).filter(x => x < 0).length, positives: a => arr(a).filter(x => x > 0).length,
};
const arr = a => { if (!Array.isArray(a)) throw new Error('expected a list'); return a; };
function tokenize(src) {
  const out = []; let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    const num = src.slice(i).match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i);
    if (num) { out.push({t: 'n', v: +num[0]}); i += num[0].length; continue; }
    const id = src.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (id) { out.push({t: 'id', v: id[0]}); i += id[0].length; continue; }
    if ('+-*/^(),[]'.includes(ch)) { out.push({t: ch}); i++; continue; }
    throw new Error(`unexpected "${ch}" in expression "${src}"`);
  }
  return out;
}
export function evaluate(src, scope = {}) {
  if (typeof src === 'number') return src;
  if (Array.isArray(src)) return src.map(x => evaluate(x, scope));
  const tk = tokenize(String(src)); let p = 0;
  const peek = () => tk[p], eat = t => { if (!tk[p] || tk[p].t !== t) throw new Error(`expected "${t}" in "${src}"`); return tk[p++]; };
  const bin = (a, b, f) => { if (Array.isArray(a) || Array.isArray(b)) throw new Error(`arithmetic on a list in "${src}"; use sum(), at() or first()`); return f(a, b); };
  const add = () => { let v = mul(); while (peek() && (peek().t === '+' || peek().t === '-')) { const o = tk[p++].t, r = mul(); v = bin(v, r, o === '+' ? (a, b) => a + b : (a, b) => a - b); } return v; };
  const mul = () => { let v = pw(); while (peek() && (peek().t === '*' || peek().t === '/')) { const o = tk[p++].t, r = pw(); v = bin(v, r, o === '*' ? (a, b) => a * b : (a, b) => a / b); } return v; };
  const pw = () => { const b = un(); if (peek() && peek().t === '^') { p++; const e = pw(); return bin(b, e, (a, c) => a ** c); } return b; };
  const un = () => { if (peek() && peek().t === '-') { p++; const v = un(); return bin(v, 0, a => -a); } if (peek() && peek().t === '+') { p++; return un(); } return atom(); };
  const atom = () => {
    const k = tk[p++]; if (!k) throw new Error(`unexpected end of "${src}"`);
    if (k.t === 'n') return k.v;
    if (k.t === '(') { const v = add(); eat(')'); return v; }
    if (k.t === '[') { const o = []; if (peek() && peek().t !== ']') { o.push(add()); while (peek() && peek().t === ',') { p++; o.push(add()); } } eat(']'); return o; }
    if (k.t === 'id') {
      if (peek() && peek().t === '(') { p++; const f = FN[k.v]; if (!f) throw new Error(`unknown function ${k.v}() in "${src}"`);
        const a = []; if (peek() && peek().t !== ')') { a.push(add()); while (peek() && peek().t === ',') { p++; a.push(add()); } } eat(')'); return f(...a); }
      if (!Object.prototype.hasOwnProperty.call(scope, k.v)) throw new Error(`unknown name "${k.v}" in "${src}" (add it to "inputs" or "values")`);
      return scope[k.v];
    }
    throw new Error(`unexpected "${k.t}" in "${src}"`);
  };
  const v = add(); if (p < tk.length) throw new Error(`unexpected "${tk[p].t === 'id' || tk[p].t === 'n' ? tk[p].v : tk[p].t}" in "${src}"`);
  if (typeof v === 'number' && !Number.isFinite(v)) throw new Error(`"${src}" is not a finite number`);
  return v;
}
// inputs (literal numbers or lists), then values (expressions, in order, each may use the ones before it)
export function buildScope(spec, base = {}) {
  const S = {...base};
  for (const [k, v] of Object.entries(spec.inputs || {})) {
    if (typeof v === 'number' || (Array.isArray(v) && v.every(x => typeof x === 'number'))) S[k] = v;
    else throw new Error(`input "${k}" must be a number or a list of numbers (put expressions in "values")`);
  }
  for (const [k, v] of Object.entries(spec.values || {})) S[k] = evaluate(v, S);
  return S;
}

// ---------- number formats ----------
// "$0,0.00" -> $1,234.50 · "0%" -> 3% (x100) · "+0.0%" -> +3.0% · "0,0" -> 1,302 · "0.0x" -> 1.3x · "$0" -> $74
// Anything before the digits is a prefix, anything after a suffix; a leading "+" always shows the sign.
// Negative numbers get a typographic minus before the prefix: −$26.
export function format(x, fmt = '0,0.[00]') {
  if (typeof x !== 'number' || !Number.isFinite(x)) throw new Error('format: not a number: ' + x);
  let f = String(fmt), plus = false;
  if (f[0] === '+') { plus = true; f = f.slice(1); }
  const m = f.match(/0[0,]*(\.(\[0+\]|0+))?/);
  if (!m) throw new Error('format needs a 0 digit pattern: ' + fmt);
  const pre = f.slice(0, m.index), suf = f.slice(m.index + m[0].length);
  if (suf.includes('%')) x *= 100;
  const opt = m[2] && m[2][0] === '[', dec = m[2] ? m[2].replace(/[\[\]]/g, '').length : 0, group = m[0].includes(',');
  let s = Math.abs(x).toFixed(dec);
  if (opt) s = s.replace(/\.?0+$/, '');
  if (Math.abs(+s) === 0) x = 0;
  if (group) { const [a, b] = s.split('.'); s = a.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (b ? '.' + b : ''); }
  return (x < 0 ? '−' : plus ? '+' : '') + pre + s + suf;
}

// ---------- templates ----------
// "{expr}" or "{expr|fmt}" inside any on-screen text, e.g. "BUYS {after|$0}". report(text, expr, value, fmt) logs each.
export function template(str, scope, report) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/\{([^{}|]+)(?:\|([^{}]+))?\}/g, (_, e, f) => {
    const v = evaluate(e.trim(), scope); if (typeof v !== 'number') throw new Error(`"{${e}}" is a list; on-screen numbers must be single values`);
    const s = format(v, f ? f.trim() : '0,0.[00]'); if (report) report({expr: e.trim(), value: v, fmt: f ? f.trim() : '', text: s}); return s; });
}
// literal digits outside {…} in on-screen text break the rule "every number comes from inputs"
// years (a standalone 1000-2099, as in "AUG 2026" or "1923") are dates, allowed literally in any text
export const literalDigits = s => /\d/.test(String(s ?? '').replace(/\{[^{}]*\}/g, '').replace(/<[^>]*>/g, '').replace(/(^|[^\d.,])(1\d{3}|20\d{2})(?![\d.,]*\d)/g, '$1'));

// ---------- shot types: which field is the hero, which fields hold cues ----------
// FromAItoBusiness desk player (desk/player.mjs): the shot types it builds. The 3D-only types of The Node's kit
// (hook-table, line-chart, scorecard, flow, quote) are not ported; heroOf() still knows them.
export const TYPES = ['desk', 'chapter-card', 'story-cards', 'ledger', 'counter', 'timeline', 'figure', 'rule', 'question', 'reveal'];
export const CAMERA_MOVES = ['push-in', 'pull-back', 'dolly-left', 'dolly-right', 'hold-drift'];
const CUE_KEYS = new Set(['at', 'titleAt', 'land', 'until', 'pulse', 'labelAt', 'popAt', 'lightAt', 'subAt', 'agendaAt', 'strikeAt', 'quoteAt', 'closeAt', 'doneAt']);
const pick = (a, i, what) => { if (!a || a[i] === undefined) throw new Error(`hero refers to ${what} ${i}, which does not exist`); return a[i]; };
// the hero's cue and a short description, per type
export function heroOf(s) {
  // a string hero is a keyword ("total", "end", "event"); an object names the hero's part and cue
  const h = typeof s.hero === 'string' ? {[s.hero]: true} : s.hero || {};
  switch (s.type) {
    case 'desk': if (!h.at) throw new Error('desk needs hero.at (and hero.target)'); return {cue: h.at, what: `${h.move || 'light'} ${[].concat(h.target || '').join('+')}`};
    case 'rule': return s.highlight && !h.at ? {cue: s.highlight.at, what: `"${s.highlight.text}" lights`} : {cue: h.at || s.at || s.from || 'start', what: 'rule lands'};
    case 'hook-table': if (!h.at) throw new Error('hook-table needs hero.at (and hero.move)'); return {cue: h.at, what: `${h.move || 'pop'} ${[].concat(h.target || '').join('+')}`};
    case 'chapter-card': return {cue: h.at || s.from || 'start', what: 'chapter card lands'};
    case 'story-cards': { const i = [].concat(h.card ?? s.cards.length - 1)[0]; if (h.move === 'swap' && !h.at) throw new Error('story-cards hero.move "swap" needs hero.at'); return {cue: h.at || pick(s.cards, i, 'card').at, what: `${h.move === 'strike' ? 'strike on ' : h.move === 'swap' ? 'swap of ' : ''}card ${[].concat(h.card ?? i).join('+')} (${s.cards[i].label || s.cards[i].emoji})`}; }
    case 'ledger': {
      if (s.grid) { const G = s.grid;
        if (h.cell) { const r = pick(G.rows, h.cell[0], 'row'), c = pick(r.cells, h.cell[1], 'cell'); return {cue: c.swap ? c.swap.at : c.at ?? r.at, what: `cell ${h.cell.join(',')}${c.swap ? ' swaps' : ''}`}; }
        if (h.row !== undefined) { const r = pick(G.rows, h.row, 'row'); return {cue: r.strikeAt ?? r.at, what: `row ${h.row}${r.strikeAt ? ' struck' : ''}`}; }
        if (h.column !== undefined) return {cue: pick(G.columns, h.column, 'column').at, what: `column ${h.column} lights`};
        if (h.at) return {cue: h.at, what: 'title lights'};
        if (G.total) return {cue: G.total.at, what: 'total'};
        throw new Error('ledger grid needs hero.cell, hero.row, hero.column, hero.at (title) or a total'); }
      if (h.row !== undefined) return {cue: pick(s.rows, h.row, 'row').at, what: `row ${h.row}`}; if (h.at) return {cue: h.at, what: 'title lights'}; if (!s.total) throw new Error('ledger needs hero.row, hero.at or a total'); return {cue: s.total.at, what: 'total'}; }
    case 'counter': if (s.bars) { const i = h.bar ?? s.bars.length - 1; return {cue: pick(s.bars, i, 'bar').land, what: `bar ${i} lands`}; } return {cue: s.land, what: 'counter lands'};
    case 'line-chart': return h.event !== undefined ? {cue: s.event.at, what: 'event label'} : {cue: s.draw.land, what: 'line reaches its last point'};
    case 'scorecard': { const i = h.mark ?? s.marks.length - 1; return {cue: pick(s.marks, i, 'mark').at, what: `mark ${i}`}; }
    case 'flow': { if (h.vanish) { if (!h.at) throw new Error('flow hero.vanish needs hero.at'); return {cue: h.at, what: `${h.vanish} vanishes`}; } const i = h.move ?? s.moves.length - 1; return {cue: h.at || pick(s.moves, i, 'move').at, what: `move ${i}`}; }
    case 'timeline': { const i = h.marker ?? s.markers.length - 1; return {cue: pick(s.markers, i, 'marker').at, what: `marker ${i}`}; }
    case 'figure': { const i = h.region ?? 0; return {cue: pick(s.regions, i, 'region').at, what: `push into region ${i}`}; }
    case 'quote': return s.highlight && !h.at ? {cue: s.highlight.at, what: `"${s.highlight.text}" lights`} : {cue: h.at || s.at || s.from || 'start', what: 'quote lands'};
    case 'question': return {cue: s.pulse || h.at || s.at || s.from, what: s.pulse ? '"?" pulses' : 'question lands'};
    case 'reveal': { const As = s.answers || [s.answer], i = h.answer ?? 0; return {cue: pick(As, i, 'answer').at, what: As.length > 1 ? `answer ${i} lands` : 'answer lands'}; }
  }
  throw new Error('unknown shot type ' + s.type);
}
// every cue a shot uses (for beat gaps and errors): shot.from plus any nested at/land/until/pulse
export function cuesOf(s) {
  const out = []; if (s.from !== undefined) out.push(['from', s.from]);
  const walk = (o, path) => { if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (k === 'question' && s.type === 'reveal') continue; if (CUE_KEYS.has(k) && (typeof v !== 'object' || v.word || v.line !== undefined || v.end)) out.push([`${path}.${k}`, v]); else walk(v, `${path}.${k}`); } };
  for (const [k, v] of Object.entries(s)) if (k !== 'from') { if (CUE_KEYS.has(k)) out.push([k, v]); else walk(v, k); }
  return out;
}
// every on-screen text field a shot shows (for the literal-digit lint); years and dates are allowed literally
const TEXT_KEYS = new Set(['label', 'title', 'kicker', 'text', 'name', 'sub', 'question', 'quote', 'role', 'xLabel', 'yLabel', 'heading', 'with', 'withLabel', 'unit', 'status', 'statement']);
export function textsOf(s) {
  const out = []; const walk = (o, path) => { if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (TEXT_KEYS.has(k) && typeof v === 'string') out.push([`${path}.${k}`, v]); else if (k !== 'question' || s.type !== 'reveal') walk(v, path ? `${path}.${k}` : k); } };
  walk(s, ''); return out;
}

// ---------- the plan: shot windows, heroes, ticks, lint ----------
// shots play one after another: shot i runs from its "from" cue to the next shot's "from" (the last one to the end).
export function plan(spec, resolve, {lines = [], tl} = {}) {
  const errors = [], warnings = [], shots = [];
  const shotList = spec.shots || [];
  if (!shotList.length) errors.push('no shots');
  const ids = new Set();
  shotList.forEach((s, i) => {
    const id = s.id || `${s.type}-${i}`;
    if (ids.has(id)) errors.push(`duplicate shot id ${id}`); ids.add(id);
    const row = {i, id, type: s.type, spec: s, beats: []};
    shots.push(row);
    if (!TYPES.includes(s.type)) { errors.push(`${id}: unknown type "${s.type}" (one of ${TYPES.join(', ')})`); return; }
    try { row.t0 = i === 0 ? 0 : resolve(s.from).t; if (i > 0 && s.from === undefined) throw new Error('needs "from" (a cue)'); } catch (e) { errors.push(`${id}.from: ${e.message}`); row.t0 = NaN; }
    for (const [k, c] of cuesOf(s)) { try { const r = resolve(c); row.beats.push({k, t: r.t}); } catch (e) { errors.push(`${id}.${k}: ${e.message}`); } }
    try { const h = heroOf(s), r = resolve(h.cue); row.hero = {...r, what: h.what, cue: cueText(h.cue)}; } catch (e) { errors.push(`${id} hero: ${e.message}`); }
    const cam = s.camera; const mv = cam && (typeof cam === 'string' ? cam : cam.move);
    if (mv && !CAMERA_MOVES.includes(mv)) errors.push(`${id}: camera "${mv}" is not a preset (${CAMERA_MOVES.join(', ')})`);
    if (cam && typeof cam === 'object' && cam.move === 'rack-focus' && (!cam.from || !cam.to || !cam.at)) errors.push(`${id}: rack-focus needs from, to (prop ids) and at (a cue)`);
    for (const [k, t] of textsOf(s)) if (literalDigits(t) && !/year|date/i.test(k)) warnings.push(`${id}.${k}: "${t}" has digits outside {…}; on-screen numbers should come from inputs`);
  });
  const END = tl ? tl.end : Infinity;
  shots.forEach((r, i) => { r.t1 = i + 1 < shots.length ? shots[i + 1].t0 : END; });
  shots.forEach((r, i) => {
    if (i > 0 && !(r.t0 > shots[i - 1].t0)) errors.push(`${r.id} starts at ${r.t0?.toFixed(2)}s, not after ${shots[i - 1].id} (${shots[i - 1].t0?.toFixed(2)}s): shots play in order`);
    if (r.hero && (r.hero.t < r.t0 - .05 || r.hero.t > r.t1 + .05)) errors.push(`${r.id}: hero "${r.hero.cue}" at ${r.hero.t.toFixed(2)}s is outside its shot (${r.t0.toFixed(2)}–${r.t1.toFixed(2)}s)`);
    if (['story-cards', 'timeline'].includes(r.type)) { const first = Math.min(...r.beats.filter(b => b.k !== 'from').map(b => b.t));
      if (first - r.t0 > 2.5) warnings.push(`${r.id}: the first thing arrives ${(first - r.t0).toFixed(1)}s after the cut; cue it earlier or start the shot later (an empty frame)`); }
    if (r.type === 'reveal' && i !== 0) errors.push(`${r.id}: a reveal must be the first shot (it starts on the setup's last frame)`);
    if (r.type === 'question') {
      if (i !== shots.length - 1) errors.push(`${r.id}: the question must be the last shot (the exercise UI sits under its still frame)`);
      const last = Math.max(...r.beats.map(b => b.t), r.hero ? r.hero.t : 0);
      if (tl && END - last < 3) errors.push(`${r.id}: the still hold after the last cue is ${(END - last).toFixed(2)}s; it must be at least 3 s (raise the script's "tail")`);
    }
  });
  // one hero at a time: heroes closer than 0.9 s step on each other
  const H = shots.filter(r => r.hero).map(r => r.hero.t !== undefined && {id: r.id, t: r.hero.t}).filter(Boolean).sort((a, b) => a.t - b.t);
  for (let i = 1; i < H.length; i++) if (H[i].t - H[i - 1].t < .9) warnings.push(`heroes overlap: ${H[i - 1].id} (${H[i - 1].t.toFixed(2)}s) and ${H[i].id} (${H[i].t.toFixed(2)}s) are ${(H[i].t - H[i - 1].t).toFixed(2)}s apart (want ≥ 0.9 s)`);
  // a new visual beat at least every ~4 s (CLAUDE.md: hook first, no stretch over ~4 s without a beat)
  if (tl) { const all = shots.flatMap(r => [r.t0, ...r.beats.map(b => b.t)]).filter(Number.isFinite).sort((a, b) => a - b);
    const lastSpeech = tl.starts.length ? tl.starts[tl.starts.length - 1] + tl.durs[tl.durs.length - 1] : END;
    for (let i = 1; i < all.length; i++) if (all[i] - all[i - 1] > 6 && all[i - 1] < lastSpeech) warnings.push(`no new visual beat for ${(all[i] - all[i - 1]).toFixed(1)}s after ${all[i - 1].toFixed(2)}s`); }
  // ticks for mix.py, in the cues.json shape [word, search-from seconds, offset seconds]
  const ticks = shots.filter(r => r.hero && r.hero.word).map(r => [r.hero.word, r.hero.at, +r.hero.off.toFixed(3)]);
  return {shots, errors, warnings, ticks, end: END};
}

// ---------- the reviewer's number report ----------
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
export function spoken(n) {
  n = Math.round(Math.abs(n));
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + 'hundred' + (n % 100 ? spoken(n % 100) : '');
  if (n < 1e6) return spoken(Math.floor(n / 1000)) + 'thousand' + (n % 1000 ? spoken(n % 1000) : '');
  if (n < 1e9) return spoken(Math.floor(n / 1e6)) + 'million' + (n % 1e6 ? spoken(n % 1e6) : '');
  if (n < 1e12) return spoken(Math.floor(n / 1e9)) + 'billion' + (n % 1e9 ? spoken(n % 1e9) : '');
  return String(n);
}
// the ways a number is said: "ninetyseven", "twohundredandfiftythousand", years as "eighteenthirtyfour",
// "twentyfourteen", "twothousandandeight", "twothousandeight"
export function sayings(n) {
  n = Math.round(Math.abs(n)); const out = new Set([spoken(n)]);
  out.add(spoken(n).replace(/hundred(?=[a-z])/g, 'hundredand'));
  // the spoken "and" before a last part under a hundred: "a thousand and five", "two million and fifty"
  for (const [u, w] of [[1e3, 'thousand'], [1e6, 'million'], [1e9, 'billion']]) if (n >= u) { const rest = n % u; if (rest && rest < 100) for (const x of [...out]) out.add(x.replace(new RegExp(w + spoken(rest) + '$'), w + 'and' + spoken(rest))); }
  // "and a half": 1,500,000 as "one and a half million" or "a million and a half"
  for (const [u, w] of [[1e3, 'thousand'], [1e6, 'million'], [1e9, 'billion']]) if (n >= u && n % u === u / 2) { const q = spoken(Math.floor(n / u)); out.add(q + 'andahalf' + w); out.add(q + w + 'andahalf'); }
  if (n >= 1100 && n < 2100) { const hi = Math.floor(n / 100), lo = n % 100;
    out.add(spoken(hi) + (lo === 0 ? 'hundred' : lo < 10 ? 'oh' + spoken(lo) : spoken(lo))); }
  for (const w of [...out]) out.add(w.replace(/^one(hundred|thousand|million|billion)/, '$1'));   // "a hundred and ten", "a million"
  return [...out];
}
// does the narration say this on-screen number? (digits, words, or "a hundred" for 100)
export function heard(text, script) {
  const nums = (String(text).replace(/,/g, '').match(/\d+(\.\d+)?/g) || []);
  if (!nums.length) return true;
  const sc = norm(script), raw = String(script).replace(/,/g, '');
  return nums.every(d => { const n = +d; if (raw.includes(d)) return true;
    if (sayings(n).some(w => sc.includes(w))) return true;
    if (n === 100 && /hundred/.test(sc)) return true;
    if (n % 1000 === 0 && n > 0 && sc.includes(spoken(n / 1000) + 'thousand')) return true;
    if (Number.isInteger(n)) return false;
    const i = Math.floor(n), fr = d.split('.')[1], DIG = c => ONES[+c];
    if (fr === '5' && sayings(i).some(w => sc.includes(w + 'andahalf'))) return true;               // "two and a half"
    if (sc.includes((i ? spoken(i) : '') + 'point' + [...fr].map(DIG).join('')) || sc.includes(spoken(i) + 'point' + [...fr].map(DIG).join(''))) return true;   // "three point four", "point two"
    if (fr.length === 2 && sayings(i).some(w => sc.includes(w)) && sc.includes(spoken(+fr) + 'cent')) return true;   // "... dollars and thirty-two cents"
    return sc.includes(spoken(i) + 'point'); });
}

// ---------- series (line-chart) ----------
// x: a list, an expression giving a list ("range(0, years)"), or {"from", "to", "step"} (each an expression)
// y: an expression in x ("start / (1 + rate)^x"), evaluated at every x, or a list / a list-valued expression
export function seriesOf(s, scope) {
  const X = s.series.x;
  const xs = X && typeof X === 'object' && !Array.isArray(X) ? FN.range(evaluate(X.from, scope), evaluate(X.to, scope), X.step === undefined ? 1 : evaluate(X.step, scope)) : evaluate(X, scope);
  if (!Array.isArray(xs) || xs.length < 2) throw new Error('series.x must be a list of at least two numbers');
  const Y = s.series.y, probe = Array.isArray(Y) ? Y : evaluate(Y, {...scope, x: xs[0]});
  const ys = Array.isArray(probe) ? evaluate(probe, scope) : xs.map(x => evaluate(Y, {...scope, x}));
  if (ys.length !== xs.length) throw new Error(`series.y has ${ys.length} points but series.x has ${xs.length}`);
  return {xs, ys};
}
