#!/usr/bin/env python3
"""Make the mobile app's fonts (app/assets/fonts/*.ttf) from the same Fraunces and Instrument Sans the site uses.

Phones handle variable fonts unevenly, so each style the app uses becomes its own small, fixed font, trimmed to
English and Spanish characters. Run: python3 tools/make_app_fonts.py (fetches the source fonts first if needed).
"""
import subprocess
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / ".cache" / "fonts"
OUT = ROOT / "app" / "assets" / "fonts"

if not (SRC / "Fraunces.ttf").exists():
    subprocess.run([str(ROOT / "tools" / "get_fonts.sh")], check=True)

UNICODES = (list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) +
            [0x131, 0x152, 0x153, 0x2C6, 0x2DA, 0x2DC, 0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C,
             0x201D, 0x201E, 0x2022, 0x2026, 0x2039, 0x203A, 0x20AC, 0x2122, 0x2212])

# output name: (source file, axis values, family name the app uses)
FONTS = {
    "Fraunces-Display": ("Fraunces.ttf", {"opsz": 96, "wght": 520, "SOFT": 0, "WONK": 1}),
    "Fraunces-DisplayItalic": ("Fraunces-Italic.ttf", {"opsz": 96, "wght": 480, "SOFT": 0, "WONK": 1}),
    "Fraunces-Heading": ("Fraunces.ttf", {"opsz": 28, "wght": 600, "SOFT": 0, "WONK": 1}),
    "InstrumentSans-Regular": ("InstrumentSans.ttf", {"wdth": 100, "wght": 400}),
    "InstrumentSans-Medium": ("InstrumentSans.ttf", {"wdth": 100, "wght": 500}),
    "InstrumentSans-SemiBold": ("InstrumentSans.ttf", {"wdth": 100, "wght": 600}),
}


def rename(font, family):
    """Give each fixed font its own family name, so iOS and Android load it by that name."""
    names = font["name"]
    for record in list(names.names):
        if record.nameID in (1, 4, 6, 16, 17, 21, 22):
            names.removeNames(nameID=record.nameID)
    names.setName(family, 1, 3, 1, 0x409)
    names.setName("Regular", 2, 3, 1, 0x409)
    names.setName(family, 4, 3, 1, 0x409)
    names.setName(family, 6, 3, 1, 0x409)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (source, axes) in FONTS.items():
        font = instancer.instantiateVariableFont(TTFont(SRC / source), axes)
        options = subset.Options()
        options.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk", "tnum", "lnum"]
        options.hinting = False
        options.name_IDs = [0, 1, 2, 3, 4, 5, 6]
        sub = subset.Subsetter(options)
        sub.populate(unicodes=UNICODES)
        sub.subset(font)
        rename(font, name)
        if "STAT" in font:
            del font["STAT"]
        path = OUT / f"{name}.ttf"
        font.save(path)
        print(f"{path.relative_to(ROOT)}: {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
