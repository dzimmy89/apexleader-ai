# Draft timings for building scenes before the real voice exists (the cloud can't reach ElevenLabs).
# Writes the same timeline.json, beats.json, words.json and captions.vtt as voice_eleven.py, with word times
# estimated from the text at Bella's measured pace (~2.85 words/s). No audio. Re-run voice_eleven.py on the Mac
# for the real files; scenes cue on words, so they follow the real timings once those exist.
#   python3 clips/voice_draft.py [clip ...]
import json, os, re, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
S = json.load(open("scripts.json")); WPS = 2.85; BREATH = 0.3
def sentences(line): return [s.strip() for s in re.findall(r'[^.?!]+[.?!]*', line) if s.strip()]
for name, spec in S.items():
    if len(sys.argv) > 1 and name not in sys.argv[1:]: continue
    t = spec["lead"]; starts, durs, caps, line_starts, words = [], [], [], [], []
    for li, (line, pause) in enumerate(spec["lines"]):
        line_starts.append(round(t, 3))
        for si, sent in enumerate(sentences(line)):
            toks = sent.split(); dur = len(toks) / WPS; chars = sum(len(w) + 1 for w in toks); c = 0
            for w in toks:
                ws = t + dur * c / chars; c += len(w) + 1
                words.append({"word": w, "start": round(ws, 3), "end": round(t + dur * c / chars - 0.04, 3)})
            starts.append(round(t, 3)); durs.append(round(dur, 3)); caps.append(sent); t += dur + BREATH
        t -= BREATH; t += 0 if li == len(spec["lines"]) - 1 else pause
    end = round(t + spec["tail"], 3)
    json.dump({"starts": starts, "durs": durs, "lineStarts": line_starts, "end": end, "fps": 24, "chapter": spec.get("chapter", ""), "draft": True}, open(f"{name}/timeline.json", "w"))
    json.dump(caps, open(f"{name}/beats.json", "w"), indent=1)
    json.dump(words, open(f"{name}/words.json", "w"))
    def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f"{h:02d}:{m:02d}:{s:06.3f}"
    with open(f"{name}/captions.vtt", "w") as f:
        f.write("WEBVTT\n\n")
        for i, (st, du, cp) in enumerate(zip(starts, durs, caps)):
            nxt = starts[i + 1] if i + 1 < len(starts) else end
            f.write(f"{i + 1}\n{ts(st)} --> {ts(min(st + du + 0.35, nxt - 0.02))}\n{cp}\n\n")
    print(name, "end", end, "sentences", len(caps))
