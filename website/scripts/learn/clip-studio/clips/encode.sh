#!/bin/bash
# encode <clip>: PNG frames + mix -> out/<clip>.mp4 (1080p, CRF 18, film tune), poster, captions; then loudness + sync check
set -e
c=$1; cd "$(dirname "$0")"
mkdir -p out
audio=$c/mix.wav; [ -f "$audio" ] || audio=$c/mix.flac
ffmpeg -hide_banner -loglevel error -y -framerate 24 -i $c/frames/f_%05d.png -i "$audio" \
  -vf "noise=c0s=3:c0f=t+u,format=yuv420p" \
  -c:v libx264 -preset slow -crf 18 -tune film -x264-params aq-mode=3 -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 160k -ar 48000 -movflags +faststart -shortest out/$c.mp4
cp $c/captions.vtt out/$c.vtt
ffmpeg -hide_banner -loglevel error -y -i $c/frames/f_00000.png -q:v 2 out/$c.jpg
ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=codec_name,width,height -of compact out/$c.mp4
ffmpeg -hide_banner -i out/$c.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tr -s ' '
node check-sync.mjs $c
