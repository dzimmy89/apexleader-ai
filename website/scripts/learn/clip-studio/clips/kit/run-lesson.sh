#!/bin/bash
# run-lesson <clip or lesson prefix>...: build kit clips end to end on the Mac (GPU Chrome).
#   clips/kit/run-lesson.sh mb-l2                  every clips/mb-l2-*/ that has a shots.json
#   clips/kit/run-lesson.sh mb-l2-overview mb-l2-ex-setup
# Per clip, in order (reveal clips run after the other clips, because a reveal reads its setup's words):
#   1 voice      voice_kokoro.py, the house narrator (Kokoro am_michael, free, local; cached), or voice_eleven.py with VOICE=eleven
#   2 retime     kit/kit.mjs retime: lint shots.json against the words, write the tick list <clip>/cues.json
#   3 mix        mix.py with BED=none: voice plus the soft cue ticks, -14 LUFS (no music)
#   4 contrast   render.mjs check: every label at least 4.5:1 against what is behind it
#   5 frames     render.mjs reframes with motion blur (BLUR subframes, default 3)
#   6 encode     encode.sh: mp4 + poster + captions, then the sync check (check-sync.mjs)
#   7 loudness   the decoded mp4: integrated -14 LUFS +/- 1 LU, true peak at most -1 dBTP
#   8 copy       mp4, jpg and vtt into the lesson's video folder (kit/kit.mjs dest: shots.json "dest", else kit/lessons.json)
# A failed step stops that clip only, logs why, and the run moves on to the next clip. The summary lists both.
# Env: VOICE (kokoro, the default; eleven, which needs VOICE_ID; or draft, placeholder timings and noise voice for testing
# the pipeline that never copies into a lesson), KOKORO_PYTHON (an interpreter with the kokoro package: on the Mac
# ~/.cache/thenode-voice/venv-kt/bin/python when it exists, else python3, as in the cloud image), KOKORO_VOICE (default am_michael), BLUR (default 3), SIZE ("1920 1080"), CHECK_EVERY (contrast, every Nth
# frame, default 12), CHROME_PATH (defaults to the Mac's Chrome when it exists).
# Logs: clips/out/run-lesson/<clip>.log and clips/out/run-lesson/summary.txt
cd "$(dirname "$0")/.." || exit 1          # clips/
CLIPS=$(pwd); REPO=$(cd ../../../.. && pwd)
BLUR=${BLUR:-1}; export BLUR
SIZE=${SIZE:-1920 1080}; read -r W H <<< "$SIZE"
CHECK_EVERY=${CHECK_EVERY:-12}
MAC_CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ -z "$CHROME_PATH" ] && [ -x "$MAC_CHROME" ]; then export CHROME_PATH="$MAC_CHROME"; fi
VOICE=${VOICE:-kokoro}
if [ -z "$KOKORO_PYTHON" ]; then
  KOKORO_PYTHON=python3; [ -x "$HOME/.cache/fromai-voice/venv-kt/bin/python" ] && KOKORO_PYTHON="$HOME/.cache/fromai-voice/venv-kt/bin/python"
fi
if [ "$VOICE" = eleven ] && [ -z "$VOICE_ID" ]; then echo "VOICE=eleven needs VOICE_ID"; exit 2; fi
if [ "$VOICE" = kokoro ] && ! "$KOKORO_PYTHON" -c 'import kokoro' 2>/dev/null; then echo "$KOKORO_PYTHON cannot import kokoro (set KOKORO_PYTHON)"; exit 2; fi
[ $# -gt 0 ] || { sed -n 2,19p "$0"; exit 2; }

# clips: names as given, or every <prefix>-* folder with a shots.json; reveals last
list=()
for a in "$@"; do
  if [ -f "$a/shots.json" ]; then list+=("$a"); continue; fi
  found=0; for d in "$a"-*/; do d=${d%/}; [ -f "$d/shots.json" ] && { list+=("$d"); found=1; }; done
  [ $found = 1 ] || echo "no kit clip matches $a (a kit clip is a folder with shots.json)"
done
first=(); last=()
for c in "${list[@]}"; do if grep -q '"type": *"reveal"' "$c/shots.json"; then last+=("$c"); else first+=("$c"); fi; done
list=("${first[@]}" "${last[@]}")
[ ${#list[@]} -gt 0 ] || exit 2

# static server for the renderer (serves clip-studio/ on 8767)
curl -s -o /dev/null http://127.0.0.1:8768/scripts/learn/clip-studio/clips/desk/desk.css || { (cd ../../../.. && nohup python3 -m http.server 8768 --bind 127.0.0.1 >/dev/null 2>&1 &); sleep 1; }

LOGS=out/run-lesson; mkdir -p "$LOGS"; SUM=$LOGS/summary${RUN_TAG:+-$RUN_TAG}.txt
echo "run-lesson $(date '+%Y-%m-%d %H:%M')  voice=$VOICE blur=$BLUR size=${W}x$H" > "$SUM"
ok=(); bad=()

# run one step: its output goes to the clip's log (and the screen); on failure the reason is the step's name plus
# the last meaningful log line
step() {
  local name=$1; shift
  echo "-- $c: $name" | tee -a "$LOG"
  "$@" 2>&1 | grep -v '^\[kit number\]' | tee -a "$LOG"
  local rc=${PIPESTATUS[0]}
  if [ "$rc" != 0 ]; then why="$name failed (exit $rc): $(grep -v '^\s*$' "$LOG" | tail -1)"; return 1; fi
}

voice() {
  if [ "$VOICE" = draft ]; then
    # never overwrite a real narration's timings with draft ones
    if { [ -f "$c/voice.wav" ] || [ -f "$c/voice.flac" ]; } && [ ! -f "$c/checks/voice.draft" ]; then
      echo "$c has a real voice; VOICE=draft would overwrite its timings"; return 1; fi
    python3 voice_draft.py "$c" && python3 kit/draft_voice.py "$c"
  else
    rm -f "$c/checks/voice.draft"
    if [ "$VOICE" = eleven ]; then python3 voice_eleven.py "$c"; else "$KOKORO_PYTHON" voice_kokoro.py "$c"; fi
  fi
}
mix() { local out; out=$(BED=none python3 mix.py "$c" 2>&1); local rc=$?; echo "$out"
  [ $rc = 0 ] || return $rc
  if echo "$out" | grep -q '^cue missing'; then echo "a cue word is not in words.json"; return 1; fi; }
contrast() { local out; out=$(node render.mjs "$c" check "$CHECK_EVERY" 0 "$W" "$H" 2>&1); echo "$out"
  echo "$out" | grep -q ': 0 label(s) under' || { echo "labels under 4.5:1, see $c/checks/contrast.json"; return 1; }; }
frames() { local n; n=$(python3 -c "import json,math;print(math.floor(json.load(open('$c/timeline.json'))['end']*24)+1)") || return 1
  rm -rf "$c/frames"; node render.mjs "$c" reframes 0 "$n" "$W" "$H" || return 1
  local got; got=$(ls "$c/frames" | grep -c '^f_.*\.png$'); [ "$got" = "$n" ] || { echo "rendered $got of $n frames"; return 1; }; }
loudness() { local r I P
  r=$(ffmpeg -hide_banner -nostats -i "out/$c.mp4" -af ebur128=peak=true -f null - 2>&1)
  I=$(echo "$r" | grep -E '^\s+I:' | tail -1 | awk '{print $2}'); P=$(echo "$r" | grep -E '^\s+Peak:' | tail -1 | awk '{print $2}')
  echo "loudness $c: $I LUFS, true peak $P dBTP"
  python3 -c "import sys;I,P=float('$I'),float('$P');sys.exit(0 if abs(I+14)<=1 and P<=-1 else 1)" || { echo "want -14 +/- 1 LUFS and at most -1 dBTP"; return 1; }; }
copy() { local dest; dest=$(node kit/kit.mjs dest "$c") || return 1
  if [ "$VOICE" = draft ]; then echo "draft voice: not copied into a lesson (dest would be ${dest:-none})"; return 0; fi
  if [ -z "$dest" ]; then echo "no lesson folder for $c (shots.json \"dest\" or kit/lessons.json): kept in clips/out"; return 0; fi
  mkdir -p "$REPO/$dest" || return 1   # public/learn/video/ is gitignored: a fresh checkout has no folder yet
  cp "out/$c.mp4" "out/$c.jpg" "out/$c.vtt" "$REPO/$dest/" && echo "copied to $dest"; }

for c in "${list[@]}"; do
  LOG=$LOGS/$c.log; : > "$LOG"; why=""; t0=$(date +%s)
  echo "== $c"
  step voice voice &&
  step retime node kit/kit.mjs retime "$c" &&
  step mix mix &&
  step contrast contrast &&
  step frames frames &&
  step encode ./encode.sh "$c" &&
  step loudness loudness &&
  step copy copy
  if [ -z "$why" ]; then ok+=("$c"); echo "ok      $c ($(( $(date +%s) - t0 )) s)" | tee -a "$SUM"
  else bad+=("$c"); echo "FAILED  $c: $why" | tee -a "$SUM"; fi
done
echo "== ${#ok[@]} ok, ${#bad[@]} failed (log: clips/$SUM)"
[ ${#bad[@]} = 0 ]
