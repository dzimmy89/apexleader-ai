# contact sheet: every still of a clip (or the PNGs given), 3 across at 640x360, each tile labelled with its time
#   python3 clips/sheet.py <clip> [out.jpg]
import sys, glob, os
from PIL import Image, ImageDraw
clip = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else f'{clip}/sheet.jpg'
os.chdir(os.path.dirname(os.path.abspath(__file__)))
fs = sorted(glob.glob(f'{clip}/stills/s_*.png'))
W, H, C = 640, 360, 3
rows = (len(fs) + C - 1) // C
sh = Image.new('RGB', (W * C, H * rows + 40), (14, 17, 26))
d = ImageDraw.Draw(sh); d.text((10, 12), clip, fill=(240, 240, 240))
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGB').resize((W, H)); x, y = (i % C) * W, 40 + (i // C) * H
    sh.paste(im, (x, y)); t = int(os.path.basename(f)[2:6]) / 10
    d.rectangle([x + 6, y + 6, x + 70, y + 26], fill=(0, 0, 0)); d.text((x + 10, y + 10), f'{t:.1f}s', fill=(255, 200, 150))
sh.save(out, quality=82); print(out)
