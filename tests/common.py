"""Shared test helpers: the brand fonts stand in for Google Fonts, which tests can't reach."""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / ".cache" / "fonts"

FONT_CSS = """
@font-face{font-family:'Fraunces';font-style:normal;font-weight:300 700;font-display:swap;src:url(https://fonts.gstatic.com/s/qa/Fraunces.ttf) format('truetype')}
@font-face{font-family:'Fraunces';font-style:italic;font-weight:300 700;font-display:swap;src:url(https://fonts.gstatic.com/s/qa/Fraunces-Italic.ttf) format('truetype')}
@font-face{font-family:'Instrument Sans';font-style:normal;font-weight:400 700;font-display:swap;src:url(https://fonts.gstatic.com/s/qa/InstrumentSans.ttf) format('truetype')}
"""


def ensure_fonts():
    if not (FONTS / "Fraunces.ttf").exists():
        subprocess.run([str(ROOT / "tools" / "get_fonts.sh")], check=True)


def serve_font(route):
    path = FONTS / route.request.url.rsplit("/", 1)[-1]
    if path.exists():
        route.fulfill(status=200, body=path.read_bytes(),
                      headers={"content-type": "font/ttf", "access-control-allow-origin": "*"})
    else:
        route.abort()


def use_brand_fonts(page):
    """Answer the page's Google Fonts requests with the same fonts from .cache/fonts."""
    page.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=FONT_CSS))
    page.route("https://fonts.gstatic.com/**", serve_font)
