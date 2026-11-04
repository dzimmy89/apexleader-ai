# Narration with Kokoro (open source, Apache 2.0, runs locally on CPU): a drop-in for voice_eleven.py that writes the
# same files (voice.wav, timeline.json, beats.json, words.json, captions.vtt), so mix.py, the scenes and the checks don't
# change. Each scripts.json line is voiced in one call through the kokoro package (hexgrad/Kokoro-82M), whose duration
# predictor gives every token's start and end, so word times are exact without any speech recognition. Those tokens
# are aligned back onto the script's own words (difflib on normalised text); a script word the model's text front end
# spells differently gets a time interpolated between its matched neighbours. words.json therefore always holds the
# script text exactly, which is what the scenes and cues look up.
# Needs, in the interpreter that runs this (KOKORO_PYTHON in kit/run-lesson.sh): kokoro>=0.9, soundfile, numpy and the
# spaCy model en_core_web_sm. The model weights download from Hugging Face on first use and are cached there.
# Takes are cached in ~/.cache/fromai-voice, keyed by text, voice and speed.
#   python clips/voice_kokoro.py [clip ...]        KOKORO_VOICE (default am_michael), KOKORO_SPEED (default 0.95)
import difflib, hashlib, json, os, re, sys, numpy as np, soundfile as sf
os.chdir(os.path.dirname(os.path.abspath(__file__)))

VOICE = os.environ.get('KOKORO_VOICE', 'am_michael')
SPEED = float(os.environ.get('KOKORO_SPEED', '0.95'))
CACHE = os.path.expanduser('~/.cache/fromai-voice'); os.makedirs(CACHE, exist_ok=True)
SR = 24000
S = json.load(open('scripts.json'))
_p = None

def pipeline():
    global _p
    if _p is None:
        from kokoro import KPipeline
        _p = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')   # 'a' = American English
    return _p

def synth(text):
    """One line through Kokoro: (audio, [(token, start, end)]), edge silence trimmed and times shifted to match; cached."""
    h = hashlib.sha256(json.dumps(['kokoro-82m-pt', VOICE, SPEED, text]).encode()).hexdigest()[:24]
    wp, jp = f'{CACHE}/kokoro-pt-{h}.wav', f'{CACHE}/kokoro-pt-{h}.json'
    if not (os.path.exists(wp) and os.path.exists(jp)):
        parts, toks, off = [], [], 0.0
        for r in pipeline()(text, voice=VOICE, speed=SPEED):          # long lines come back in several chunks
            a = np.asarray(r.audio, dtype=np.float32)
            for tk in r.tokens or []:
                if tk.start_ts is not None and tk.end_ts is not None:
                    toks.append([tk.text, off + float(tk.start_ts), off + float(tk.end_ts)])
            parts.append(a); off += len(a) / SR
        sf.write(wp, np.concatenate(parts), SR); json.dump(toks, open(jp, 'w'))
    a, _ = sf.read(wp, dtype='float32'); toks = json.load(open(jp))
    idx = np.where(np.abs(a) > 0.01)[0]
    lo, hi = max(0, idx[0] - int(0.04 * SR)), min(len(a), idx[-1] + int(0.12 * SR))
    a = a[lo:hi].copy(); shift = lo / SR; dur = len(a) / SR
    fade = int(0.012 * SR); a[:fade] *= np.linspace(0, 1, fade); a[-fade:] *= np.linspace(1, 0, fade)
    words = []                                                         # punctuation tokens fold into the word before
    for t, s, e in toks:
        s, e = min(max(s - shift, 0.0), dur), min(max(e - shift, 0.0), dur)
        if re.search(r'\w', t): words.append([t, s, e])
        elif words: words[-1][2] = max(words[-1][2], s)
    return a, [tuple(w) for w in words]

norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())

def align(script_words, heard, dur):
    """Start/end per script word from the model's word times; unmatched words interpolated by character count."""
    A, B = [norm(w) for w in script_words], [norm(w) for w, _, _ in heard]
    st, en = [None] * len(A), [None] * len(A)
    for blk in difflib.SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
        for k in range(blk.size): st[blk.a + k], en[blk.a + k] = heard[blk.b + k][1], heard[blk.b + k][2]
    i = 0
    while i < len(A):
        if st[i] is not None: i += 1; continue
        j = i
        while j < len(A) and st[j] is None: j += 1
        lo = en[i - 1] if i > 0 else 0.0
        hi = st[j] if j < len(A) else dur
        chars = [len(script_words[k]) + 1 for k in range(i, j)]; tot = sum(chars) or 1; t = lo
        for k, c in zip(range(i, j), chars):
            st[k] = t; t += (hi - lo) * c / tot; en[k] = t
        i = j
    for k in range(len(A)):                      # keep times monotonic and inside the line
        st[k] = min(max(st[k], st[k - 1] if k else 0.0), dur); en[k] = min(max(en[k], st[k]), dur)
    return st, en

def sentences(line):
    """Sentences as runs of whole words: a word ending in . ? or ! (before any closing quote or bracket) ends one.
    Same split as voice_eleven.py for ordinary text, but never inside a word like 3.4%."""
    out, cur = [], []
    for w in line.split():
        cur.append(w)
        if re.search(r'[.?!]["\'”’)\]]*$', w): out.append(' '.join(cur)); cur = []
    if cur: out.append(' '.join(cur))
    return out

if __name__ == '__main__':
    for name, spec in S.items():
        if len(sys.argv) > 1 and name not in sys.argv[1:]: continue
        os.makedirs(name, exist_ok=True)
        pieces = [np.zeros(int(spec['lead'] * SR), np.float32)]; t = spec['lead']
        starts, durs, caps, line_starts, words = [], [], [], [], []
        for li, (line, pause) in enumerate(spec['lines']):
            a, heard = synth(line); dur = len(a) / SR
            sw = line.split()
            st, en = align(sw, heard, dur)
            words += [{'word': w, 'start': round(t + s, 3), 'end': round(t + e, 3)} for w, s, e in zip(sw, st, en)]
            k = 0                                 # sentence cues from the same word times
            for sent in sentences(line):
                n = len(sent.split())
                starts.append(round(t + st[k], 3)); durs.append(round(en[k + n - 1] - st[k], 3)); caps.append(sent); k += n
            line_starts.append(round(t + st[0], 3))
            gap = 0 if li == len(spec['lines']) - 1 else pause
            pieces += [a, np.zeros(int(gap * SR), np.float32)]; t += dur + gap
        end = round(t + spec['tail'], 3)
        pieces.append(np.zeros(int(spec['tail'] * SR), np.float32))
        sf.write(f'{name}/voice.wav', np.concatenate(pieces), SR)
        json.dump({'starts': starts, 'durs': durs, 'lineStarts': line_starts, 'end': end, 'fps': 24, 'chapter': spec.get('chapter', '')}, open(f'{name}/timeline.json', 'w'))
        json.dump(caps, open(f'{name}/beats.json', 'w'), indent=1)
        json.dump(words, open(f'{name}/words.json', 'w'))
        def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h:02d}:{m:02d}:{s:06.3f}'
        with open(f'{name}/captions.vtt', 'w') as f:
            f.write('WEBVTT\n\n')
            for i, (s0, du, c) in enumerate(zip(starts, durs, caps)):
                nxt = starts[i + 1] if i + 1 < len(starts) else end
                f.write(f'{i + 1}\n{ts(s0)} --> {ts(min(s0 + du + 0.35, nxt - 0.02))}\n{c}\n\n')
        print(name, 'end', end, 'sentences', len(caps), 'voice kokoro', VOICE, flush=True)
