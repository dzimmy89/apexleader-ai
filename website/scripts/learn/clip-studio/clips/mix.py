# Sound for a clip: narration + soft ticks on cue words, and no background bed by default.
# BED=pad adds the quiet synth pad, BED=music the <clip>/music.flac bed from music_eleven.py, both ducked under the voice.
# Writes <clip>/mix.wav at 48 kHz, then loudness-normalises to -14 LUFS / -1.5 dBTP (two-pass loudnorm).
import json, os, sys, subprocess, numpy as np, soundfile as sf
os.chdir(os.path.dirname(os.path.abspath(__file__)))
clip = sys.argv[1]
# sound cues per clip, [word, search-from seconds(, offset seconds)]: a soft tick lands one frame after the picture reveal.
# Hand-timed clips keep theirs in cues.json; kit clips get <clip>/cues.json from `kit/kit.mjs retime` (one per shot hero).
CUES = json.load(open('cues.json'))
if os.path.exists(f'{sys.argv[1]}/cues.json'): CUES = {sys.argv[1]: json.load(open(f'{sys.argv[1]}/cues.json'))}
SR = 48000
words = json.load(open(f'{clip}/words.json')); tl = json.load(open(f'{clip}/timeline.json'))
v, vsr = sf.read(f'{clip}/voice.wav' if os.path.exists(f'{clip}/voice.wav') else f'{clip}/voice.flac', dtype='float32')
# resample voice 24k -> 48k (linear is fine for speech at this ratio after a gentle smooth)
n = int(len(v) * SR / vsr); x = np.linspace(0, len(v) - 1, n); voice = np.interp(x, np.arange(len(v)), v).astype(np.float32)
L = int(tl['end'] * SR) + SR // 2
voice = np.pad(voice, (0, max(0, L - len(voice))))[:L]
t = np.arange(L) / SR
# pad bed: A major, slow breathing, no beat
freqs = [110.0, 164.81, 220.0, 277.18, 329.63]
bed = sum(np.sin(2 * np.pi * f * t + i) * (0.6 if f < 200 else 0.35) for i, f in enumerate(freqs))
bed *= 0.55 + 0.45 * np.sin(2 * np.pi * t / 9.0) ** 2
k = np.ones(64) / 64; bed = np.convolve(bed, k, mode='same')   # soften
bed /= np.max(np.abs(bed)) + 1e-9
bed *= np.clip(t / 1.2, 0, 1)                                     # short fade-in on sound only; the picture starts composed
# duck the bed under the voice (envelope follower)
env = np.abs(voice); win = int(0.25 * SR); cs = np.concatenate([[0], np.cumsum(env)]); idx = np.arange(L); lo = np.clip(idx - win // 2, 0, L); hi = np.clip(idx + win // 2, 0, L); env = (cs[hi] - cs[lo]) / win; env /= env.max() + 1e-9
duck = 1 - 0.65 * np.clip(env * 4, 0, 1)
bed = bed * duck * 10 ** (-24 / 20)
# music bed (music_eleven.py writes <clip>/music.flac): replaces the pad. It sits MUSIC_DB (17 dB) under the speech level while
# the narrator talks, comes up in the gaps, starts with the picture and fades out over the last 1.5 s.
mpath = f'{clip}/music.flac'
BED = os.environ.get('BED', 'none')
if BED == 'music' and os.path.exists(mpath):
    m, msr = sf.read(mpath, dtype='float32')
    if m.ndim > 1: m = m.mean(axis=1)
    if msr != SR: m = np.interp(np.linspace(0, len(m) - 1, int(len(m) * SR / msr)), np.arange(len(m)), m).astype(np.float32)
    m = np.pad(m, (0, max(0, L - len(m))))[:L]
    rms = lambda a: float(np.sqrt(np.mean(a ** 2))) + 1e-9
    m *= rms(voice[np.abs(voice) > 0.02]) * 10 ** (-float(os.environ.get('MUSIC_DB', '17')) / 20) / rms(m)
    mduck = 1 - 0.55 * np.clip(env * 4, 0, 1)                      # about -7 dB more under words, back up in the gaps
    bed = m * mduck * np.clip(t / .25, 0, 1) * np.clip((tl['end'] + .5 - t) / 1.5, 0, 1)
if BED == 'none': bed = np.zeros_like(bed)                      # voice and ticks only
# ticks
def norm(s): return ''.join(ch for ch in s.lower() if ch.isalnum() or ch in '%$')
ticks = np.zeros(L, np.float32)
tick_t = np.arange(int(0.18 * SR)) / SR
tick = (np.sin(2 * np.pi * 1500 * tick_t) * np.exp(-tick_t * 38) + 0.4 * np.sin(2 * np.pi * 2250 * tick_t) * np.exp(-tick_t * 55)).astype(np.float32)
placed = []
for cue in CUES.get(clip, []):
    w, frm, off = cue[0], cue[1], (cue[2] if len(cue) > 2 else 0)
    hit = next((x for x in words if norm(x['word']) == norm(w) and x['start'] >= frm - .01), None)
    if not hit: print('cue missing', w, frm); continue
    s = int((hit['start'] + off + 1 / 24) * SR); ticks[s:s + len(tick)] += tick[: max(0, min(len(tick), L - s))]
    placed.append({'word': w, 't': round(s / SR, 4)})
json.dump({'ticks': placed}, open(f'{clip}/mix.json', 'w'), indent=1)   # where the ticks are, for check-sync.mjs
ticks *= 10 ** (-27 / 20)
mix = voice + bed + ticks
sf.write(f'{clip}/mix_raw.wav', mix.astype(np.float32), SR, subtype='FLOAT')
# two-pass loudnorm
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'{clip}/mix_raw.wav', '-af', 'highpass=f=70,loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
j = json.JSONDecoder().raw_decode(r.stderr[r.stderr.rindex('{'):])[0]   # ffmpeg 8 prints more lines after the JSON
af = f"highpass=f=70,loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=false"
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', f'{clip}/mix_raw.wav', '-af', af, '-ar', '48000', f'{clip}/mix.wav'], check=True)
print(clip, 'mixed', 'in', j['input_i'], 'LUFS')
# trim pass: close the gap to -14 LUFS with gain into a limiter at about -4.4 dBFS, so the AAC encode keeps
# its true peak under -1 dBTP; the limiter costs loudness, so measure and repeat until within 0.2 LU
import re as _re, shutil
def lufs(f):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
    return float(_re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1])
shutil.copy(f'{clip}/mix.wav', f'{clip}/mix_pre.wav')
g = -14.0 - lufs(f'{clip}/mix_pre.wav')
for k in range(6):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', f'{clip}/mix_pre.wav', '-af', f'volume={g:.2f}dB,alimiter=limit=0.6:attack=1:release=80:level=false', '-ar', '48000', f'{clip}/mix.wav'], check=True)
    I = lufs(f'{clip}/mix.wav')
    if abs(I + 14) < .2: break
    g += -14.0 - I
os.remove(f'{clip}/mix_pre.wav')
print(clip, 'trim', round(g, 2), 'dB ->', I, 'LUFS')
