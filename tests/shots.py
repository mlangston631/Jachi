#!/usr/bin/env python3
"""Screenshot parts of the site to look at them, after `python3 build.py`.

  python3 tests/shots.py 390,#services,services-phone 1440,.hero,hero-desktop

Each argument is width,css-selector,name. Pictures go to tests/out/<name>.png.
Use 404 as the selector's page by prefixing the selector with "404:" (e.g. 390,404:main,nf-phone).
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
import serve  # noqa: E402
from common import ROOT, ensure_fonts, use_brand_fonts  # noqa: E402

PORT = 8766
OUT = ROOT / "tests" / "out"
OUT.mkdir(exist_ok=True)
ensure_fonts()
server = serve.start(PORT)

with sync_playwright() as p:
    browser = p.chromium.launch()
    for spec in sys.argv[1:]:
        w, sel, name = spec.split(",")
        w = int(w)
        path = "/"
        if sel.startswith("404:"):
            path, sel = "/missing-page", sel[4:]
        ctx = browser.new_context(viewport={"width": w, "height": 900 if w > 800 else 844}, device_scale_factor=1,
                                  is_mobile=w < 900, has_touch=w < 900)
        page = ctx.new_page()
        use_brand_fonts(page)
        page.goto(f"http://127.0.0.1:{PORT}{path}", wait_until="networkidle")
        page.wait_for_timeout(1500)
        if sel not in (".hero", ".site-header"):
            # Hide the fixed header and bars, and show scroll-in blocks, so the element is pictured whole.
            page.add_style_tag(content=".site-header,.dock,.skip,.chat-launcher{visibility:hidden!important}"
                               "[data-reveal].pre{opacity:1!important;transform:none!important}"
                               ".steps-wrap.pre .step::before{transform:none!important}")
        el = page.locator(sel).first
        el.scroll_into_view_if_needed()
        page.wait_for_timeout(300)
        el.screenshot(path=str(OUT / f"{name}.png"), animations="disabled")
        print("saved", OUT / f"{name}.png")
        ctx.close()
    browser.close()
server.shutdown()
