#!/usr/bin/env python3
"""Make the site's images from the logo and brand fonts, using the headless browser.

  public/og.jpg               1200x630 picture shown when someone shares the link (iMessage, WhatsApp, LinkedIn...)
  public/apple-touch-icon.png 180x180 icon for iPhone home screens and bookmarks
  public/favicon.ico          16/32/48 px tab icon for browsers that can't use icon.svg

Run: python3 tools/make_images.py   (fetches the fonts first if needed)
Remake them only when the logo, colours or headline change, then commit them.
"""
import base64
import io
import subprocess
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from brand import FOREST, FOREST_INK, MOSS, SAGE, MIST, LEAF, VEINS, STEM, mark, icon_svg_file  # noqa: E402

FONTS = ROOT / ".cache" / "fonts"
PUBLIC = ROOT / "public"
if not (FONTS / "Fraunces.ttf").exists():
    subprocess.run([str(ROOT / "tools" / "get_fonts.sh")], check=True)


def font_face(family, file, style="normal", weight="100 900"):
    data = base64.b64encode((FONTS / file).read_bytes()).decode()
    return (f"@font-face{{font-family:'{family}';font-style:{style};font-weight:{weight};"
            f"src:url(data:font/ttf;base64,{data}) format('truetype')}}")


FACES = "\n".join([
    font_face("Fraunces", "Fraunces.ttf"),
    font_face("Fraunces", "Fraunces-Italic.ttf", "italic"),
    font_face("Instrument Sans", "InstrumentSans.ttf", weight="400 700"),
])
GRAIN = ("url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E"
         "%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix "
         "values='0 0 0 0 .05 0 0 0 0 .14 0 0 0 0 .11 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' "
         "filter='url(%23n)'/%3E%3C/svg%3E\")")
CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'

OG = f"""<!doctype html><html><head><meta charset="utf-8"><style>
{FACES}
*{{box-sizing:border-box;margin:0}}
html,body{{width:1200px;height:630px;overflow:hidden}}
body{{position:relative;font-family:'Instrument Sans',sans-serif;color:{FOREST_INK};-webkit-font-smoothing:antialiased;
  background:radial-gradient(70% 70% at 88% 18%,rgba(155,193,163,.5),rgba(155,193,163,0) 70%),
             radial-gradient(60% 60% at 0% 100%,rgba(207,227,212,.85),rgba(207,227,212,0) 70%),
             linear-gradient(180deg,#F8FAF5 0%,{MIST} 100%)}}
body::after{{content:"";position:absolute;inset:0;opacity:.32;mix-blend-mode:multiply;background-image:{GRAIN}}}
.copy{{position:absolute;z-index:2;left:84px;top:76px;bottom:72px;display:flex;flex-direction:column;width:690px}}
.brand{{display:flex;align-items:center;gap:14px;color:{FOREST}}}
.brand .mark{{width:54px;height:54px}}
.word{{font-family:'Fraunces',serif;font-size:38px;line-height:1;letter-spacing:-.012em}}
.word b{{font-weight:600}} .word span{{font-weight:400;color:{MOSS}}}
.pill{{display:inline-flex;align-items:center;gap:12px;align-self:flex-start;margin-top:auto;padding:9px 20px 9px 15px;border-radius:999px;
  background:rgba(255,255,255,.78);border:1px solid rgba(16,38,30,.11);box-shadow:0 1px 2px rgba(13,36,28,.06),0 4px 12px -4px rgba(13,36,28,.08);
  font-size:22px;font-weight:500;color:#3E5A4C}}
.pill i{{width:10px;height:10px;border-radius:50%;background:{MOSS};box-shadow:0 0 0 5px rgba(155,193,163,.45)}}
h1{{margin-top:26px;font-family:'Fraunces',serif;font-weight:500;font-size:90px;line-height:.98;letter-spacing:-.03em;max-width:11.5ch}}
h1 em{{font-style:italic;font-weight:400;color:{MOSS}}}
ul{{display:flex;gap:30px;margin-top:38px;padding:0;list-style:none;font-size:25px;font-weight:500;color:#3E5A4C}}
li{{display:flex;align-items:center;gap:11px;white-space:nowrap}}
li svg{{width:30px;height:30px;padding:6px;border-radius:50%;background:{FOREST};fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}}
.art{{position:absolute;z-index:1;right:-70px;top:50%;width:560px;height:560px;transform:translateY(-50%) rotate(14deg)}}
.glow{{position:absolute;z-index:0;right:20px;top:50%;width:520px;height:520px;transform:translateY(-50%);border-radius:50%;
  background:radial-gradient(closest-side,rgba(255,255,255,.75),rgba(255,255,255,0))}}
</style></head><body>
<div class="glow"></div>
<svg class="art" viewBox="0 0 64 64"><defs><linearGradient id="g" x1=".15" y1="0" x2=".85" y2="1">
<stop offset="0" stop-color="#E3EFE6"/><stop offset=".55" stop-color="#BBD7C2"/><stop offset="1" stop-color="#8FB89A"/></linearGradient></defs>
<path d="{LEAF}" fill="url(#g)"/>
<g fill="none" stroke="#fff" stroke-linecap="round" stroke-opacity=".8"><path stroke-width=".55" d="M32 9V50"/><path stroke-width=".42" d="{VEINS}"/></g>
<path d="{STEM}" fill="none" stroke="#8FB89A" stroke-width="1.4" stroke-linecap="round"/></svg>
<div class="copy">
  <div class="brand">{mark("m", "full")}<span class="word"><b>Jachi</b> <span>Health</span></span></div>
  <p class="pill"><i></i>Waitlist open · Launching nationwide</p>
  <h1>Online care, rooted in <em>real medicine.</em></h1>
  <ul><li>{CHECK}Licensed clinicians</li><li>{CHECK}No insurance needed</li></ul>
</div>
</body></html>"""


def tile(size, pad, bg, fg, variant):
    inner = size - 2 * pad
    return (f'<!doctype html><html><head><style>*{{margin:0}}html,body{{width:{size}px;height:{size}px;overflow:hidden;'
            f'background:{bg}}}body{{display:grid;place-items:center;color:{fg}}}.mark{{width:{inner}px;height:{inner}px}}'
            f'</style></head><body>{mark("t", variant)}</body></html>')


with sync_playwright() as p:
    browser = p.chromium.launch()

    page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    page.set_content(OG)
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(300)
    layout = page.evaluate("""() => {
      const right = s => Math.max(...[...document.querySelectorAll(s)].map(e => e.getBoundingClientRect().right));
      return { textRight: Math.max(right('h1'), right('li'), right('.pill')), top: document.querySelector('.brand').getBoundingClientRect().top,
               fonts: document.fonts.check('500 90px Fraunces') && document.fonts.check('italic 400 90px Fraunces') && document.fonts.check('500 25px "Instrument Sans"') };
    }""")
    if not layout["fonts"] or layout["textRight"] > 800:
        raise SystemExit(f"share image layout problem: {layout}")
    shot = Image.open(io.BytesIO(page.screenshot())).convert("RGB")
    # JPEG keeps the grain texture small; 4:4:4 colour keeps the text edges crisp.
    shot.save(PUBLIC / "og.jpg", "JPEG", quality=86, optimize=True, progressive=True, subsampling=0)
    print("og.jpg", layout)

    page = browser.new_page(viewport={"width": 180, "height": 180}, device_scale_factor=1)
    page.set_content(tile(180, 34, FOREST, MIST, "solid"))
    page.screenshot(path=str(PUBLIC / "apple-touch-icon.png"))
    print("apple-touch-icon.png")

    icons = []
    for size in (16, 32, 48):
        page = browser.new_page(viewport={"width": size, "height": size}, device_scale_factor=1)
        svg = icon_svg_file()
        page.set_content(f'<!doctype html><html><head><style>*{{margin:0}}html,body{{width:{size}px;height:{size}px;'
                         f'overflow:hidden;background:transparent}}img{{display:block;width:{size}px;height:{size}px}}'
                         f'</style></head><body><img src="data:image/svg+xml;base64,'
                         f'{base64.b64encode(svg.encode()).decode()}"></body></html>')
        page.wait_for_timeout(100)
        icons.append(Image.open(io.BytesIO(page.screenshot(omit_background=True))).convert("RGBA"))
    icons[-1].save(PUBLIC / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=icons[:-1])
    print("favicon.ico")
    browser.close()
