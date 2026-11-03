// TheNode clip studio: the one set of motion numbers every lesson and exercise clip uses.
// Pure functions of time. No clocks, no unseeded random. Import from Remotion, R3F or a single HTML film.
// Source of the numbers: the motion-studio method (CLAUDE.md / REFERENCE.md, 2026-10-10), tuned for
// TheNode's "Premium" personality: unhurried, no overshoot on type or opacity.

// ---------- curves (cubic-bezier control points) ----------
export const CURVES = {
  enter: [0.16, 1, 0.3, 1],     // arrivals, ease-out expo
  move: [0.76, 0, 0.24, 1],     // travel across the frame, ease-in-out quart; also camera
  exit: [0.7, 0, 0.84, 0],      // departures, ease-in expo
  pop: [0.34, 1.56, 0.64, 1],   // small overshoot; NOT used in Premium clips except the XP reward chip
  sine: [0.45, 0, 0.55, 1],     // loops, ambient drift, slow camera creep
};

export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t;
  const sy = t => ((ay * t + by) * t + cy) * t;
  const dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { // Newton
      const e = sx(t) - x, d = dx(t);
      if (Math.abs(e) < 1e-6) return sy(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1; t = x; // bisection fallback
    for (let i = 0; i < 30; i++) { const v = sx(t); if (Math.abs(v - x) < 1e-6) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
    return sy(t);
  };
}

export const ease = Object.fromEntries(Object.entries(CURVES).map(([k, c]) => [k, cubicBezier(...c)]));
ease.linear = x => Math.min(1, Math.max(0, x)); // rotation, progress bars, loop phase only

// ---------- springs (closed form: progress at time t, no stepping) ----------
// zeta: 1.0 no bounce · 0.70-0.85 premium · 0.40-0.60 playful · <0.30 cartoon. f: natural frequency in Hz.
export function spring(t, zeta = 0.8, f = 1.6) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * f;
  if (zeta < 1) {
    const wd = w * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t));
  }
  if (zeta === 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const s = Math.sqrt(zeta * zeta - 1), r1 = -w * (zeta - s), r2 = -w * (zeta + s);
  return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
}
// Libraries that take stiffness/damping/mass: Remotion's default (1, 10, 100) is zeta 0.5, too bouncy for Premium.
export const dampingRatio = (stiffness, damping, mass = 1) => damping / (2 * Math.sqrt(stiffness * mass));
export const dampingFor = (zeta, stiffness = 100, mass = 1) => zeta * 2 * Math.sqrt(stiffness * mass);

// ---------- time helpers ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, x) => a + (b - a) * x;
// progress of a move that starts at `start` seconds and lasts `dur` seconds
export const prog = (t, start, dur) => clamp((t - start) / dur);
// eased tween: tween(t, 3.2, DUR.standard, 'enter')
export const tween = (t, start, dur, curve = 'enter') => ease[curve](prog(t, start, dur));

// Durations in seconds for the Premium personality (quick / standard / slow + named events)
export const DUR = {
  quick: 0.35, standard: 0.55, slow: 0.8,
  heroReveal: 0.75, dramatic: 1.0,
  exitOf: entrance => entrance * 0.6,          // exits are ~60% of their entrance
  travel: px => 0.45 + 0.35 * clamp(px / 1920), // farther takes longer, never 2x
};
export const STAGGER = { letter: 0.03, word: 0.09, item: 0.06, maxTotal: 0.5 };

// On-screen text must hold (sharp, still) for at least this long.
export const holdFor = text => 0.3 * String(text).trim().split(/\s+/).filter(Boolean).length + 0.5;

// Frames
export const toFrame = (sec, fps) => Math.round(sec * fps);
export const beatFrame = (beatIndex, fps, bpm) => Math.round(beatIndex * 60 * fps / bpm); // recompute, never accumulate

// ---------- narration-driven timing (lesson clips cut to the voice, not to a BPM grid) ----------
// words: WhisperX word list [{word, start, end}]. Returns the start time of the n-th word matching `match`.
export function wordAt(words, match, nth = 0) {
  const norm = s => String(s).toLowerCase().replace(/[^a-z0-9.%$]/g, '').replace(/^\.+|\.+$/g, '');
  const m = typeof match === 'string' ? w => norm(w.word) === norm(match) : match;
  const hits = words.filter(m);
  if (!hits[nth]) throw new Error(`cue word not found: ${match} #${nth}`);
  return hits[nth].start;
}
// Reveal lands ON the word: the visual is sharp at the word's start, so the move starts `lead` earlier.
export const revealOn = (words, match, dur = DUR.heroReveal, nth = 0) => wordAt(words, match, nth) - dur * 0.85;

// ---------- deterministic variation ----------
export function seeded(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- staging rules as numbers ----------
export const STAGE = {
  dimNonHero: 0.4,         // everything that is not the hero dims toward 40% opacity
  secondaryTravel: 0.5,    // secondary motion travels 30-70% of the hero
  secondaryDelay: 0.15,    // and starts 50-200 ms later
  ambientMax: 0.1,         // ambient < 5-20% of the hero's travel, on a sine
  holdPush: 0.02,          // during a hold, scale 1.00 -> 1.02 is enough life
  minContrast: 4.5,
  maxFlashesPerSec: 3,
};

// Camera: soft curves only, never parks during a hold
export const CAMERA = { productFov: 30, sceneFov: [35, 50], parallax: { fg: 1.0, mid: 0.5, bg: 0.2 } };

// Sound: a hit peaks one frame after its picture
export const sfxPeakAt = (pictureSec, fps) => pictureSec + 1 / fps;
