# Clip studio (Learn videos)

Code-drawn lesson and exercise clips for FromAItoBusiness Learn. Each clip is `clips/<clip>/shots.json` plus its
narration in `clips/scripts.json`; the generic page `clips/<clip>/index.html` runs `clips/desk/player.mjs`, which
exposes `window.renderAt(t)`. Frames are rendered in Chrome and encoded with ffmpeg. House rules: `CLAUDE.md`.
Shot format: `clips/desk/SHOTS.md`.

Pilot clips (The One-Person Company, lesson 1 and exercise 1): `opc-l1-overview`, `opc-l1-three-kinds`,
`opc-l1-sort-the-work`, `opc-ex1-setup`, `opc-ex1-reveal`.

Not in git: `node_modules`, the narration audio, frames, stills, checks and the finished MP4s (`clips/out/`,
`public/learn/video/`). The voice regenerates from the script.

## Render on a Mac

    cd website/scripts/learn/clip-studio
    npm install                         # playwright-core (no browser download) + lucide-react for the icons
    npm run icons                       # clips/desk/icons.json from every "icon" in the shots
    npm run serve &                     # serves website/ on http://127.0.0.1:8768 (fonts and figures load from there)
    # Kokoro needs a Python with kokoro>=0.9, soundfile, numpy and spaCy en_core_web_sm:
    export KOKORO_PYTHON=~/.cache/fromai-voice/venv-kt/bin/python
    $KOKORO_PYTHON clips/voice_kokoro.py opc-l1-overview          # voice.wav, words.json, timeline.json, captions.vtt
    node clips/kit/kit.mjs retime opc-l1-overview                 # lint + every on-screen number next to the narration
    node clips/render.mjs opc-l1-overview stills 0,11,31.4,70.9   # look first
    python3 clips/sheet.py opc-l1-overview                        # contact sheet of the stills
    clips/kit/run-lesson.sh opc-l1-overview                       # the master: mix, contrast, frames, encode, sync, loudness, copy

`run-lesson.sh` copies `<clip>.mp4/.jpg/.vtt` to `public/learn/video/one-person-company/` (from `kit/lessons.json`),
where local dev plays them. Open `/scripts/learn/clip-studio/clips/<clip>/index.html` on the dev server and call
`renderAt(12.5)` in the console to freeze a moment.

Defaults: `KOKORO_VOICE=am_michael`, `KOKORO_SPEED=0.95`, `CHROME_PATH` = the Mac's Chrome. About 0.3–0.5 s per frame.
