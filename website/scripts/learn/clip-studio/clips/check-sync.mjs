// check-sync <clip>: does every sound cue land one frame after the picture reveal it belongs to, in the encoded file?
//  - sound: the tick times mix.py wrote into the mix (<clip>/mix.json), shifted by the offset measured between the
//    decoded out/<clip>.mp4 audio and the mix itself (cross-correlation), so any drift from muxing or encoding shows up
//  - picture: the reveal times the scene logged while rendering (<clip>/checks/scene-cues.json, from render.mjs)
// Pass: tick 0.5 to 1.6 frames after its reveal, one tick per reveal, video and audio streams both start at 0.
// Writes <clip>/checks/sync.json; exits 1 on any failure.
import fs from 'fs'; import {execFileSync} from 'child_process';
process.chdir(new URL('.', import.meta.url).pathname);
const clip = process.argv[2], FPS = 24, SR = 48000;
const mixFile = fs.existsSync(`${clip}/mix.wav`) ? `${clip}/mix.wav` : `${clip}/mix.flac`;
const pcm = (file, ss, t) => { const b = execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-ss', String(ss), '-t', String(t), '-i', file, '-vn', '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], {maxBuffer: 1 << 28}); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); };
const issues = [];
// 1. stream start times
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,start_time', '-of', 'json', `out/${clip}.mp4`]));
for (const s of probe.streams) if (Math.abs(+s.start_time) > .001) issues.push(`${s.codec_type} stream starts at ${s.start_time}s`);
// 2. offset of the file's audio against the mix, from three one-second windows, ±150 ms
const lagMax = Math.round(.15 * SR), offs = [];
const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `out/${clip}.mp4`]).toString();
for (const ss of [dur * .25, dur * .5, dur * .75]) {
  const ref = pcm(mixFile, ss, 1), got = pcm(`out/${clip}.mp4`, Math.max(0, ss - .15), 1.3), base = ss - Math.max(0, ss - .15);
  let best = -Infinity, at = 0;
  for (let lag = -lagMax; lag <= lagMax; lag++) { const o = Math.round(base * SR) + lag; if (o < 0 || o + ref.length > got.length) continue; let d = 0; for (let i = 0; i < ref.length; i += 2) d += ref[i] * got[o + i]; if (d > best) { best = d; at = lag; } }
  offs.push(at / SR);
}
offs.sort((p, q) => p - q); const offset = offs[1];
if (Math.abs(offset) > .5 / FPS) issues.push(`audio in the file is ${(offset * 1000).toFixed(1)} ms off the mix`);
// 3. ticks against reveals
const mix = JSON.parse(fs.readFileSync(`${clip}/mix.json`)), scene = JSON.parse(fs.readFileSync(`${clip}/checks/scene-cues.json`));
const rows = []; const used = new Map();
for (const tk of mix.ticks) {
  const t = tk.t + offset, near = scene.filter(c => c.t <= t + .05).sort((p, q) => q.t - p.t)[0];
  const row = {word: tk.word, tick: +t.toFixed(3)};
  if (!near || t - near.t > .3) { row.status = 'FAIL'; row.note = 'no picture reveal is timed to this sound'; }
  else {
    row.reveal = near.word; row.revealAt = +near.t.toFixed(3); row.framesAfterReveal = +((t - near.t) * FPS).toFixed(2);
    const dup = used.get(near.t); used.set(near.t, tk.word);
    row.status = dup ? 'FAIL' : row.framesAfterReveal < .5 || row.framesAfterReveal > 1.6 ? 'FAIL' : 'OK';
    row.note = dup ? `second tick on the reveal at "${near.word}"` : row.status === 'FAIL' ? `${row.framesAfterReveal} frames after the reveal, want 1` : '';
  }
  rows.push(row);
}
const bad = rows.filter(r => r.status !== 'OK').length + issues.length;
fs.writeFileSync(`${clip}/checks/sync.json`, JSON.stringify({clip, audioOffsetMs: +(offset * 1000).toFixed(2), issues, ticks: rows}, null, 1));
console.log(`sync ${clip}: ${rows.length - rows.filter(r => r.status !== 'OK').length}/${rows.length} ticks one frame after their reveal, audio offset ${(offset * 1000).toFixed(1)} ms` +
  issues.map(i => `\n  FAIL ${i}`).join('') + rows.filter(r => r.status !== 'OK').map(r => `\n  FAIL "${r.word}" @${r.tick}s  ${r.note}`).join(''));
process.exit(bad ? 1 : 0);
