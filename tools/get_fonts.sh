#!/usr/bin/env bash
# Copies the brand fonts (Fraunces and Instrument Sans, SIL Open Font License) from Google's
# open-source font repository into .cache/fonts/. Only the tests and tools/make_images.py use
# them; the live site loads the same fonts from Google Fonts.
set -euo pipefail
cd "$(dirname "$0")/.."
DEST=.cache/fonts
if [ -f "$DEST/Fraunces.ttf" ] && [ -f "$DEST/Fraunces-Italic.ttf" ] && [ -f "$DEST/InstrumentSans.ttf" ]; then
  echo "fonts already in $DEST"
  exit 0
fi
TMP=.cache/google-fonts
rm -rf "$TMP"
GIT_LFS_SKIP_SMUDGE=1 git clone --quiet --depth 1 --filter=blob:none --sparse https://github.com/google/fonts "$TMP"
git -C "$TMP" sparse-checkout set ofl/fraunces ofl/instrumentsans
mkdir -p "$DEST"
cp "$TMP/ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf" "$DEST/Fraunces.ttf"
cp "$TMP/ofl/fraunces/Fraunces-Italic[SOFT,WONK,opsz,wght].ttf" "$DEST/Fraunces-Italic.ttf"
cp "$TMP/ofl/instrumentsans/InstrumentSans[wdth,wght].ttf" "$DEST/InstrumentSans.ttf"
rm -rf "$TMP"
echo "fonts saved to $DEST"
