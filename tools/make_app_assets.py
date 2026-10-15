#!/usr/bin/env python3
"""Make the mobile app's icons and splash images (app/assets/images/) from the leaf logo, using the headless browser.

  icon.png                    1024x1024 store and home-screen icon (iPhone masks the corners itself)
  adaptive-foreground.png     1024x1024 Android adaptive icon foreground (leaf inside the safe zone, transparent)
  adaptive-monochrome.png     1024x1024 Android 13+ themed icon (one colour, transparent)
  splash-icon.png             1024x1024 leaf for the light launch screen (transparent)
  splash-icon-dark.png        1024x1024 leaf for the dark launch screen (transparent)
  notification-icon.png       96x96 Android status bar icon (white, transparent)

Run: python3 tools/make_app_assets.py. Remake them only when the logo or colours change.
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from brand import FOREST, SAGE, MIST, mark  # noqa: E402

OUT = ROOT / "app" / "assets" / "images"
DEEP = "#123327"


def page(size, body, background="transparent"):
    return (f"<!doctype html><html><head><style>html,body{{margin:0;width:{size}px;height:{size}px;"
            f"background:{background};overflow:hidden}}.wrap{{width:{size}px;height:{size}px;display:grid;"
            f"place-items:center}}svg{{display:block}}</style></head><body>{body}</body></html>")


def leaf(px, color, offset_y=0):
    svg = mark("m", "full").replace('class="mark"', f'width="{px}" height="{px}"')
    return f'<div class="wrap"><div style="color:{color};transform:translateY({offset_y}px)">{svg}</div></div>'


ICON_BG = (f"radial-gradient(120% 120% at 30% 20%, #2A5E4B 0%, {FOREST} 45%, {DEEP} 100%)")

IMAGES = [
    ("icon.png", 1024, leaf(600, MIST, 8), ICON_BG),
    ("adaptive-foreground.png", 1024, leaf(470, MIST, 6), "transparent"),
    ("adaptive-monochrome.png", 1024, leaf(470, "#FFFFFF", 6), "transparent"),
    ("splash-icon.png", 1024, leaf(760, FOREST), "transparent"),
    ("splash-icon-dark.png", 1024, leaf(760, SAGE), "transparent"),
    ("notification-icon.png", 96, leaf(80, "#FFFFFF"), "transparent"),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, size, body, background in IMAGES:
            pg = browser.new_page(viewport={"width": size, "height": size}, device_scale_factor=1)
            pg.set_content(page(size, body, background))
            pg.screenshot(path=str(OUT / name), omit_background=background == "transparent")
            pg.close()
            print(f"app/assets/images/{name}")
        browser.close()


if __name__ == "__main__":
    main()
