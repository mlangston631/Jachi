#!/usr/bin/env python3
"""Make the web fonts the site serves itself (public/fonts/*.woff2).

Same fonts Google Fonts would serve (Fraunces and Instrument Sans, SIL Open Font License), trimmed to
the axes and characters the site uses, so pages load faster and visitors' browsers never contact Google.

Run: python3 tools/make_fonts.py   (fetches the source fonts first if needed), then python3 build.py.
Only needed again if the fonts or the character set change.
"""
import hashlib
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / ".cache" / "fonts"
OUT = ROOT / "public" / "fonts"

try:
    import brotli  # noqa: F401
except ImportError:  # Use Node's Brotli through a small stand-in module.
    sys.path.insert(0, str(Path(__file__).resolve().parent / "brotli_shim"))

from fontTools import subset  # noqa: E402
from fontTools.ttLib import TTFont  # noqa: E402
from fontTools.varLib import instancer  # noqa: E402

if not (SRC / "Fraunces.ttf").exists():
    subprocess.run([str(ROOT / "tools" / "get_fonts.sh")], check=True)

# English and Spanish text, punctuation and symbols used on the site (®, ·, curly quotes, dashes, ¿¡).
UNICODES = (list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) +
            [0x131, 0x152, 0x153, 0x2C6, 0x2DA, 0x2DC, 0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C,
             0x201D, 0x201E, 0x2022, 0x2026, 0x2039, 0x203A, 0x20AC, 0x2122, 0x2212])

FONTS = [
    # source file, output name, axes to pin or limit (as Google serves them for the site's request)
    ("Fraunces.ttf", "fraunces", {"SOFT": 0, "WONK": 1, "wght": (300, 700)}),
    ("Fraunces-Italic.ttf", "fraunces-italic", {"SOFT": 0, "WONK": 1, "wght": (300, 700)}),
    ("InstrumentSans.ttf", "instrument-sans", {"wdth": 100, "wght": (400, 700)}),
]

OUT.mkdir(parents=True, exist_ok=True)
for old in OUT.glob("*.woff2"):
    old.unlink()

for source, name, axes in FONTS:
    font = TTFont(SRC / source)
    font = instancer.instantiateVariableFont(font, axes)
    options = subset.Options()
    options.layout_features = ["*"]
    options.hinting = False
    options.desubroutinize = True
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6]
    options.flavor = "woff2"
    sub = subset.Subsetter(options)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)
    tmp = OUT / f"{name}.woff2"
    subset.save_font(font, str(tmp), options)
    digest = hashlib.sha256(tmp.read_bytes()).hexdigest()[:8]
    final = OUT / f"{name}.{digest}.woff2"
    tmp.rename(final)
    axes_left = [(a.axisTag, a.minValue, a.maxValue) for a in font["fvar"].axes] if "fvar" in font else []
    print(f"{final.name}: {final.stat().st_size // 1024} KB, axes {axes_left}")
