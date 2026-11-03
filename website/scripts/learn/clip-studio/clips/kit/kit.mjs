// Clip kit CLI (Node, no browser). Run from anywhere:
//   node clips/kit/kit.mjs init <clip>     write clips/<clip>/index.html (the generic player page) if it is missing
//   node clips/kit/kit.mjs retime <clip>   after voice: lint shots.json against words.json/timeline.json, write
//                                          <clip>/cues.json (the tick list mix.py reads) and <clip>/checks/kit.json
//                                          (heroes, beats, every on-screen number next to the narration). Exit 1 on errors.
//   node clips/kit/kit.mjs dest <clip>     print the lesson's video folder (repo-relative) or nothing
import fs from 'fs'; import path from 'path';
import {makeResolver, plan, buildScope, template, format, evaluate, heard, seriesOf} from './spec.mjs';
const KIT = path.dirname(new URL(import.meta.url).pathname), CLIPS = path.dirname(KIT), REPO = path.resolve(CLIPS, '../../../..');
const [, , cmd, clip] = process.argv;
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const dir = c => path.join(CLIPS, c);
if (!cmd || !clip) { console.log('usage: kit.mjs init|retime|dest <clip>'); process.exit(2); }

if (cmd === 'init') {
  fs.mkdirSync(dir(clip), {recursive: true});
  const f = path.join(dir(clip), 'index.html');
  if (fs.existsSync(f) && !fs.readFileSync(f, 'utf8').includes('desk/player.mjs')) { console.log(`${f} exists and is not a kit page; left alone`); process.exit(1); }
  fs.copyFileSync(path.join(CLIPS, 'desk', 'index.html'), f); console.log('wrote', path.relative(REPO, f));
  if (!fs.existsSync(path.join(dir(clip), 'shots.json'))) console.log('next: write', path.relative(REPO, path.join(dir(clip), 'shots.json')), '(see clips/desk/SHOTS.md)');
  process.exit(0);
}

const specFile = path.join(dir(clip), 'shots.json');
const spec = fs.existsSync(specFile) ? J(specFile) : (cmd === 'dest' ? {} : J(specFile));
if (cmd === 'dest') {
  if (spec.dest === null) process.exit(0);
  if (spec.dest) { console.log(spec.dest); process.exit(0); }
  const map = J(path.join(KIT, 'lessons.json')).prefixes;
  const k = Object.keys(map).sort((a, b) => b.length - a.length).find(p => clip.startsWith(p));
  if (k && map[k]) console.log(map[k]);
  process.exit(0);
}
if (cmd !== 'retime') { console.log('unknown command', cmd); process.exit(2); }

// ---------- retime ----------
for (const f of ['words.json', 'timeline.json', 'beats.json']) if (!fs.existsSync(path.join(dir(clip), f))) {
  console.log(`kit ${clip}: no ${f} yet. Voice the clip first (voice_eleven.py ${clip}, or voice_draft.py ${clip} for draft timings)`); process.exit(1); }
const words = J(path.join(dir(clip), 'words.json')), tl = J(path.join(dir(clip), 'timeline.json')), beats = J(path.join(dir(clip), 'beats.json'));
const resolve = makeResolver(words, tl);
const P = plan(spec, resolve, {tl});
// reveal: the setup's question frame must resolve against the setup's own words
for (const r of P.shots.filter(r => r.type === 'reveal')) {
  try { const q = r.spec.question; const sd = dir(q.clip);
    const sp = J(path.join(sd, 'shots.json')), sres = makeResolver(J(path.join(sd, 'words.json')), J(path.join(sd, 'timeline.json')));
    const sP = plan(sp, sres, {tl: J(path.join(sd, 'timeline.json'))});
    if (!sP.shots.some(s => s.id === q.shot && s.type === 'question')) P.errors.push(`${r.id}: ${q.clip} has no question shot "${q.shot}"`);
    sP.errors.forEach(e => P.errors.push(`${r.id} (setup ${q.clip}): ${e}`));
  } catch (e) { P.errors.push(`${r.id}: cannot read the setup clip: ${e.message}`); }
}
// numbers: every {expr|fmt} and every computed value the shots show, with the narration said during the shot
let scope = {};
try { scope = buildScope(spec); } catch (e) { P.errors.push('inputs/values: ' + e.message); }
const sentAt = (a, b) => tl.starts.map((s, i) => ({s, e: s + tl.durs[i], t: beats[i]})).filter(x => x.e > a - .3 && x.s < b + .3).map(x => x.t).join(' ');
const numbers = [];
const walkText = (o, add) => { if (Array.isArray(o)) o.forEach(x => walkText(x, add)); else if (o && typeof o === 'object') Object.values(o).forEach(x => walkText(x, add)); else if (typeof o === 'string' && /\{[^{}]+\}/.test(o)) add(o); };
for (const r of P.shots) {
  const say = sentAt(r.t0, r.t1), s = r.spec;
  const rep = (where, text, expr, value, fmt) => numbers.push({shot: r.id, where, expr, value: +(+value).toFixed(6), fmt, text, heard: heard(text, say), narration: say});
  try {
    walkText(s, str => template(str, scope, x => rep('text', x.text, x.expr, x.value, x.fmt)));
    if (s.type === 'counter' && s.bars) for (const [i, b] of s.bars.entries()) { const fv = b.fmt || s.fmt || '0,0', v = evaluate(b.value, scope); rep(`bar ${i} end`, format(v, fv), String(b.value), v, fv); }
    else if (s.type === 'counter') { const fv = s.fmt || '0,0'; rep('counter end', format(evaluate(s.value, scope), fv), String(s.value), evaluate(s.value, scope), fv); }
    if (s.type === 'ledger' && !s.grid) { let bal = s.opening ? evaluate(s.opening.value, scope) : 0; const fv = s.fmt || '$0,0.00';
      for (const row of s.rows) { const v = evaluate(row.value, scope); bal += v; rep(`row "${row.label}"`, format(v, fv), String(row.value), v, fv); }
      if (s.total) rep('total', format(bal, fv), 'opening + rows', bal, fv); }
    if (s.type === 'flow') for (const m of s.moves.filter(m => m.amount !== undefined)) { const v = evaluate(m.amount, scope); rep(`move ${m.from}→${m.to}`, format(v, m.fmt || s.fmt || '$0,0'), String(m.amount), v, m.fmt || s.fmt || '$0,0'); }
    if (s.type === 'reveal') for (const [i, A] of (s.answers || [s.answer]).entries()) { if (A.text !== undefined) continue; const v = evaluate(A.value, scope); rep(`answer ${i}`, format(v, A.fmt || '0,0'), String(A.value), v, A.fmt || '0,0'); }
  } catch (e) { P.errors.push(`${r.id} numbers: ${e.message}`); }
}
// line-chart: the last point of the series (the value the line lands on)
for (const r of P.shots.filter(r => r.type === 'line-chart' && (r.spec.show || {}).tip !== false)) {
  try { const s = r.spec, {ys} = seriesOf(s, scope), say = sentAt(r.t0, r.t1), fv = s.yFmt || '0,0', last = ys[ys.length - 1];
    numbers.push({shot: r.id, where: 'last point', expr: String(s.series.y), value: +last.toFixed(6), fmt: fv, text: format(last, fv), heard: heard(format(last, fv), say), narration: say});
  } catch (e) { P.errors.push(`${r.id} series: ${e.message}`); }
}
fs.mkdirSync(path.join(dir(clip), 'checks'), {recursive: true});
fs.writeFileSync(path.join(dir(clip), 'cues.json'), JSON.stringify(P.ticks, null, 1) + '\n');
fs.writeFileSync(path.join(dir(clip), 'checks', 'kit.json'), JSON.stringify({clip, draft: !!tl.draft, end: tl.end, errors: P.errors, warnings: P.warnings,
  shots: P.shots.map(r => ({id: r.id, type: r.type, t0: +(+r.t0).toFixed(3), t1: +(+r.t1).toFixed(3), hero: r.hero && {cue: r.hero.cue, t: +r.hero.t.toFixed(3), what: r.hero.what}})), ticks: P.ticks, numbers}, null, 1));
console.log(`kit ${clip}: ${P.shots.length} shots, ${P.ticks.length} ticks, end ${tl.end}s${tl.draft ? ' (draft timings)' : ''}`);
for (const r of P.shots) console.log(`  ${String(r.t0?.toFixed(2)).padStart(6)}s  ${r.type.padEnd(12)} ${r.id.padEnd(14)} hero ${r.hero ? `${r.hero.what} on "${r.hero.cue}" @${r.hero.t.toFixed(2)}s` : '?'}`);
for (const n of numbers) console.log(`  number  ${n.shot.padEnd(14)} ${n.text.padEnd(12)} = ${n.expr} -> ${n.value}  ${n.heard ? 'said' : 'NOT FOUND IN NARRATION — check'}`);
P.warnings.forEach(w => console.log('  WARN', w));
P.errors.forEach(e => console.log('  ERROR', e));
process.exit(P.errors.length ? 1 : 0);
