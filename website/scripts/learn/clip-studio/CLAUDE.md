# FromAItoBusiness clip studio

Lesson and exercise clips for FromAItoBusiness Learn (`content/learn/MEDIA.md`). Ported on 2026-11-03 from The Node's
clip studio (TheNode-University, `scripts/learn/clip-studio`: its CLAUDE.md, README.md and `clips/kit/SPEC.md`).
The method and the gates are The Node's. The set is new: The Node plays its shots on a three.js wooden table with
Poly Haven props and Fluent emoji; this brand has no emoji, robots or stock props, so the shots play on a plain DOM
"desk" in the brand's own picture. Read this file, then `clips/desk/SHOTS.md`, before any clip work.

A clip is a program that paints frames. A frame is a pure function of time. Render a frame, look at it, change a
number. Never ask a video model to draw a chart, a number, a formula or a word.

## What done means

- `clips/out/<clip>.mp4` exists at 1920x1080, 24 fps, with `.vtt` captions and a `.jpg` poster.
- The checkpoint stills (frame 0, each hero, the last frame) were rendered and read; each note fixed or declined.
- **Every number on screen is computed from the clip's `inputs`** through a `{expr|fmt}` template and logged.
  `kit.mjs retime` checks that the narration says it. Numbers inside a lesson figure come from the lesson itself.
- Frame 0 is a composed shot that names the hook. No black first frame, no logo.
- One hero move per shot. Everything else is quieter.
- Works muted: captions burned in from the script's own sentences, plus the `.vtt` track.
- Audio about −14 LUFS, true peak ≤ −1 dBTP, measured on the encoded MP4.
- The last frame holds still (the exercise setup ends on its question card). No fade to black.

## Clip shapes

| Shape | Length (house target) | Structure |
| --- | --- | --- |
| Overview | 90–130 s | Hook → title + "In this lesson" → build → turn → payoff → bridge → hold |
| Inline | 60–90 s | Hook → chapter card → the idea → why it matters → hold |
| Exercise setup | 40–55 s | Hook → the skill → the steps → still frame with the question |
| Exercise reveal | 45–60 s | Starts on the setup's last frame, the answer first, then why |

The narration is the slot's `transcript:` line in the lesson, word for word (`clips/scripts.json`). Lengths follow
the voice; the transcript is never edited to hit a length.

## Look (brand: `scripts/learn/infographics/brand.css`, `styles/tokens.css`)

- **Set:** one founder's calm desk, from above: the ink ground with the blueprint grid, a soft pool of lamp light,
  and a notebook, pen, mug, phone and plant drawn in faint lines at the edges (`clips/desk/index.html`).
- **Colour:** ink `oklch(17% 0.02 262)`, paper `oklch(97% 0.012 85)`, one accent, signal orange
  `oklch(71% 0.19 45)`, for the one thing that moves the business forward (the hero). Status colours always come
  with a word. At most one paper block on screen.
- **Type:** Bricolage Grotesque for titles and numbers, Instrument Sans for labels and captions, JetBrains Mono only
  for agent names and statuses. Fonts are the site's own files (`website/fonts`).
- **Pictures:** Lucide icons (`clips/desk/icons.json`, from the site's lucide-react), agent cards, and the lesson's own
  figures (`public/learn/figures/...`). No emoji, robots, glowing brains, stock or generated images, no vendor logos.
- **Motion:** tokens from `harness/motion.mjs`. Arrivals are sharp on their word (they start ~0.45 s early).
  The camera (a transform on the whole desk) always moves: push-in, pull-back, dollies, with a faint breath.
- **Ban list:** fades to or from black, text flying in, glow around text, a number typed by hand, emoji, more than
  one hero move at a time, a 3D prop for its own sake.

## Gates (in order)

1. **Script.** `clips/scripts.json` from the slot's transcript, split into lines (cues use `L<n>:word`).
2. **Voice.** `voice_kokoro.py` (Kokoro-82M, voice `af_heart`, local, cached). Word times come from the model's
   duration predictor. This is a synthetic voice; nothing labels it as human.
3. **Shots + lint.** `clips/<clip>/shots.json`, then `node clips/kit/kit.mjs retime <clip>`: no errors, every
   number "said".
4. **Stills.** `node clips/render.mjs <clip> stills 0,4.5,...` then `python3 clips/sheet.py <clip>`. Read them.
5. **Master.** `clips/kit/run-lesson.sh <clip>`: voice, retime, mix, contrast (≥ 4.5:1), frames, encode + sync,
   loudness, copy to `public/learn/video/<course>/` (gitignored).

## Not ported

The Node's cloud render (`cloud/`, Cloud Batch + a private bucket), the Scaleway farm, ElevenLabs voices, music beds
and the 3D-only shot types (hook-table, line-chart, scorecard, flow, quote). Uploading to the private Learn bucket is
the owner's step (`scripts/learn/setup-learn-video-bucket.sh`); slots stay `status: paused` until then.
