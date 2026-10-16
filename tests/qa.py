#!/usr/bin/env python3
"""Browser QA for the Jachi Health site: layouts, overflow, console, security headers and every interaction.

Run from the repo root after `python3 build.py`:   python3 tests/qa.py
It starts a local stand-in for Netlify (tests/serve.py), uses the real brand fonts (tools/get_fonts.sh),
and saves screenshots to tests/out/. Exits non-zero if any check fails.
"""
import html
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "tests"))
import serve  # noqa: E402
from common import ensure_fonts, use_brand_fonts  # noqa: E402
from fake_identity import FakeIdentity  # noqa: E402
from content import EMAIL, PRICING_NOTE  # noqa: E402
import pages as PAGES  # noqa: E402
import learn as LEARN  # noqa: E402
import content as CONTENT  # noqa: E402
import content_es as CONTENT_ES  # noqa: E402
import strings  # noqa: E402

ES = strings.ES

PORT = 8765
BASE = f"http://127.0.0.1:{PORT}"
URL = f"{BASE}/"
ES_URL = f"{BASE}/es/"
OUT = ROOT / "tests" / "out"
OUT.mkdir(exist_ok=True)
ensure_fonts()



server = serve.start(PORT)

results = {"errors": [], "checks": []}


def status_of(path):
    """The HTTP status the local server gives a path (without a browser)."""
    try:
        with urllib.request.urlopen(urllib.request.Request(BASE + path, method="HEAD")) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code


def check(name, ok, detail=""):
    results["checks"].append({"name": name, "ok": bool(ok), "detail": detail})
    print(("PASS " if ok else "FAIL ") + name + (f" :: {detail}" if detail else ""))


EXTERNAL = []  # requests that tried to leave the site, from every page the tests open


def setup(context, preview=False):
    page = context.new_page()

    def outside(route):
        EXTERNAL.append(route.request.url)
        route.abort()
    page.route(lambda url: not url.startswith(BASE) and not url.startswith("data:"), outside)
    if preview:
        page.add_init_script("window.claude = { use: async () => null };")
    logs = []

    def on_console(m):
        if m.type not in ("error", "warning"):
            return
        # The site asks /.netlify/identity/settings whether accounts are switched on. The local server, like
        # Netlify before Identity is enabled, answers 404, which Chrome logs. That one is expected.
        if "Failed to load resource" in m.text and (m.location or {}).get("url", "").endswith("/.netlify/identity/settings"):
            return
        logs.append((m.type, m.text))
    page.on("console", on_console)
    page.on("pageerror", lambda e: logs.append(("pageerror", str(e))))
    return page, logs


def is_open(page, sel):
    return page.locator(sel).evaluate("el => el.classList.contains('is-open')")


OVERFLOW_JS = """() => {
  const de = document.documentElement;
  const vw = de.clientWidth;
  const offenders = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.right > vw + 1 || r.left < -1) {
      let p = el, clipped = false;
      while ((p = p.parentElement)) {
        const cs = getComputedStyle(p);
        if (['hidden','clip'].includes(cs.overflowX) || ['hidden','clip'].includes(cs.overflow)) { clipped = true; break; }
      }
      if (!clipped && getComputedStyle(el).position !== 'fixed') offenders.push((el.id ? '#' + el.id : el.className || el.tagName).toString().slice(0, 60) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    }
  });
  return { scrollWidth: de.scrollWidth, clientWidth: vw, bodyScroll: document.body.scrollWidth, offenders: offenders.slice(0, 12) };
}"""

STATIC_A11Y_JS = """() => {
  const problems = [];
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href').slice(1);
    if (id && !document.getElementById(id)) problems.push('dead anchor ' + a.getAttribute('href'));
  });
  document.querySelectorAll('input:not([type=hidden]), select').forEach(el => {
    if (el.closest('.hp')) return;
    const named = el.labels && el.labels.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
    if (!named) problems.push('unlabelled ' + (el.id || el.name));
  });
  document.querySelectorAll('button, a[href]').forEach(el => {
    const txt = (el.innerText || '').trim() || el.getAttribute('aria-label') || '';
    if (!txt) problems.push('nameless ' + el.outerHTML.slice(0, 60));
  });
  const ids = {};
  document.querySelectorAll('[id]').forEach(el => { ids[el.id] = (ids[el.id] || 0) + 1; });
  Object.entries(ids).forEach(([k, v]) => { if (v > 1) problems.push('duplicate id ' + k); });
  document.querySelectorAll('[aria-describedby]').forEach(el => {
    el.getAttribute('aria-describedby').split(/\\s+/).forEach(id => { if (!document.getElementById(id)) problems.push('describedby missing ' + id); });
  });
  document.querySelectorAll('[aria-controls]').forEach(el => {
    if (!document.getElementById(el.getAttribute('aria-controls'))) problems.push('controls missing ' + el.getAttribute('aria-controls'));
  });
  const h1 = document.querySelectorAll('h1').length;
  if (h1 !== 1) problems.push('h1 count ' + h1);
  return problems;
}"""

VIEWPORTS = [(360, 740), (375, 812), (390, 844), (430, 932), (768, 1024), (1024, 768), (1280, 800), (1440, 900), (1920, 1080)]

with sync_playwright() as p:
    browser = p.chromium.launch()

    # 1) Layout at every size
    for w, h in VIEWPORTS:
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, has_touch=w < 900, is_mobile=w < 900)
        page, logs = setup(ctx)
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(1400)
        page.screenshot(path=str(OUT / f"first-{w}.png"))
        ov = page.evaluate(OVERFLOW_JS)
        check(f"no horizontal overflow @{w}", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
        tops = page.evaluate("[...document.querySelectorAll('.svc')].map(e => Math.round(e.getBoundingClientRect().top))")
        rows_seen = len(set(tops))
        expect_rows = 3 if w >= 1060 else (5 if w >= 640 else 9)
        check(f"nine service cards in {expect_rows} rows @{w}", len(tops) == 9 and rows_seen == expect_rows, str(tops))
        check(f"condition search visible @{w}", page.locator("#lookup").is_visible() and page.locator("#lookup-results").is_hidden())
        page.screenshot(path=str(OUT / f"full-{w}.png"), full_page=True, animations="disabled")
        header_info = page.evaluate("""() => ({
          nav: [...document.querySelectorAll('.nav a')].filter(a => a.offsetParent).map(a => Math.round(a.getBoundingClientRect().height)),
          login: (() => { const a = document.querySelector('.login-link'); return a && a.offsetParent ? a.getAttribute('href') : null; })(),
          toggle: !!document.querySelector('.menu-toggle').offsetParent,
        })""")
        if w >= 1100:
            check(f"header: full nav on one line, log in link @{w}", len(header_info["nav"]) == 4 and max(header_info["nav"]) < 50
                  and header_info["login"] == "/account/" and not header_info["toggle"], json.dumps(header_info))
        elif w >= 960:
            check(f"header: menu button and log in link @{w}", header_info["toggle"] and header_info["login"] == "/account/", json.dumps(header_info))
        errs = [l for l in logs]
        check(f"no console errors @{w}", not errs, json.dumps(errs))
        if w == 1440:
            problems = page.evaluate(STATIC_A11Y_JS)
            check("anchors, labels, names, ids all valid", not problems, json.dumps(problems))
        ctx.close()

    # 2) Mobile interactions
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    page.goto(URL, wait_until="networkidle")
    page.wait_for_timeout(800)
    toggle = page.locator(".menu-toggle")
    toggle.click()
    page.wait_for_timeout(700)
    check("menu opens", is_open(page, "#mobile-menu"))
    check("menu toggle aria-expanded", toggle.get_attribute("aria-expanded") == "true")
    check("main is inert while menu open", page.evaluate("document.getElementById('main').inert === true"))
    check("menu lists seven sections", page.locator("#mobile-menu nav a").count() == 7)
    check("menu offers log in", page.locator("#mobile-menu a[href='/account/']").is_visible())
    page.screenshot(path=str(OUT / "mobile-menu.png"))
    page.keyboard.press("Escape")
    page.wait_for_timeout(500)
    check("escape closes menu", not is_open(page, "#mobile-menu"))
    check("focus returns to toggle", page.evaluate("document.activeElement.classList.contains('menu-toggle')"))
    toggle.click(); page.wait_for_timeout(500)
    page.locator("#mobile-menu a[href='#services']").click()
    page.wait_for_timeout(1400)
    check("menu link closes menu", not is_open(page, "#mobile-menu"))
    top = page.evaluate("document.getElementById('services').getBoundingClientRect().top")
    check("menu link scrolls to services", 0 <= top < 160, f"top={top}")
    check("main not inert after close", page.evaluate("document.getElementById('main').inert === false"))

    # dock visibility
    page.evaluate("window.scrollTo(0, document.getElementById('why').offsetTop + 200)")
    page.wait_for_timeout(900)
    check("mobile dock shows after hero", page.locator("#dock").evaluate("el => el.classList.contains('is-visible')"))
    check("dock points to the sign-up form", page.locator("#dock a").get_attribute("href") == "#join")
    page.screenshot(path=str(OUT / "mobile-dock.png"))
    page.evaluate("document.getElementById('care-finder').scrollIntoView()")
    page.wait_for_timeout(900)
    check("mobile dock hides at care finder", not page.locator("#dock").evaluate("el => el.classList.contains('is-visible')"))

    # care finder: errors, emergency path, restart, urgent path to sign-up
    page.locator("#finder-next").click(); page.wait_for_timeout(300)
    check("finder: empty step 1 shows error", page.locator("#err-need").is_visible())
    check("finder: focus on first option", page.evaluate("document.activeElement.name") == "need")
    page.screenshot(path=str(OUT / "finder-error-mobile.png"))
    page.locator("label.need:has(input[value='urgent'])").click()
    check("finder: error clears on choice", not page.locator("#err-need").is_visible())
    page.locator("#finder-next").click(); page.wait_for_timeout(600)
    check("finder: step 2 shows urgent question only",
          page.locator("[data-path='urgent']").is_visible() and not page.locator("[data-path='refill']").is_visible()
          and not page.locator("[data-path='mental']").is_visible())
    check("finder: step counter", page.locator("#finder-count").inner_text() == "Step 2 of 2")
    check("finder: button says See my options", page.locator("#finder-next-label").inner_text() == "See my options")
    check("finder: step 2 title focused", page.evaluate("document.activeElement.classList.contains('q-title')"))
    page.screenshot(path=str(OUT / "finder-redflags-mobile.png"))
    page.locator("#finder-next").click(); page.wait_for_timeout(300)
    check("finder: empty step 2 shows error", page.locator("#err-flag-urgent").is_visible())
    page.locator("fieldset[data-field='flag-urgent'] label:has(input[value='yes'])").click()
    check("finder: step 2 error clears", not page.locator("#err-flag-urgent").is_visible())
    page.locator("#finder-next").click(); page.wait_for_timeout(700)
    check("finder: emergency result", page.locator("#fres-title").inner_text() == "Call 911 now.", page.locator("#fres-title").inner_text())
    check("finder: emergency CTA dials 911", page.locator("#fres-cta").get_attribute("href") == "tel:911"
          and "btn--danger" in page.locator("#fres-cta").get_attribute("class") and page.locator("#fres-cta").is_visible())
    check("finder: emergency hides sign-up note", not page.locator("#fres-note").is_visible() and not page.locator("#fres-hotline").is_visible())
    check("finder: result title focused", page.evaluate("document.activeElement.id") == "fres-title")
    page.screenshot(path=str(OUT / "finder-emergency-mobile.png"))
    page.locator("#fres-restart").click(); page.wait_for_timeout(500)
    check("finder: start over resets", page.locator("[data-fstep='1']").is_visible()
          and page.evaluate("!document.querySelector('#finder-form input[name=need]:checked')")
          and page.locator("#finder-count").inner_text() == "Step 1 of 2")
    page.locator("label.need:has(input[value='urgent'])").click()
    page.locator("#finder-next").click(); page.wait_for_timeout(400)
    page.locator("#finder-back").click(); page.wait_for_timeout(300)
    check("finder: back keeps the choice", page.locator("[data-fstep='1']").is_visible()
          and page.locator("input[name='need'][value='urgent']").is_checked())
    page.locator("#finder-next").click(); page.wait_for_timeout(400)
    page.locator("fieldset[data-field='flag-urgent'] label:has(input[value='no'])").click()
    page.locator("#finder-next").click(); page.wait_for_timeout(700)
    chips = page.locator("#fres-chips").inner_text()
    check("finder: urgent result names the service, no price", "Urgent care" in page.locator("#fres-title").inner_text()
          and "Online visit" in chips and "$" not in chips, chips)
    check("finder: launch note shown", "Texas" in page.locator("#fres-note").inner_text())
    check("finder: CTA arrow restored", page.locator("#fres-cta .i--arrow").count() == 1 and "btn--danger" not in page.locator("#fres-cta").get_attribute("class"))
    page.screenshot(path=str(OUT / "finder-urgent-mobile.png"))
    page.locator("#fres-cta").click(); page.wait_for_timeout(1200)
    check("finder CTA preselects urgent care", page.locator("input[name='interest'][value='urgent-care']").is_checked())
    check("finder CTA lands on the form without opening the keyboard", page.evaluate("document.activeElement.id") == "join-form-title")
    card_top = page.evaluate("document.querySelector('.form-card').getBoundingClientRect().top")
    check("finder CTA scrolls the form into view", 60 <= card_top <= 140, f"top={card_top}")

    # weight care check
    page.evaluate("document.getElementById('eligibility').scrollIntoView()")
    page.wait_for_timeout(900)
    check("mobile dock hides at eligibility", not page.locator("#dock").evaluate("el => el.classList.contains('is-visible')"))
    page.locator("#elig-next").click()
    page.wait_for_timeout(300)
    check("step 1 shows state error", page.locator("#err-state").is_visible())
    check("step 1 shows age error", page.locator("#err-age").is_visible())
    check("focus moves to first invalid field", page.evaluate("document.activeElement.id") == "elig-state")
    page.screenshot(path=str(OUT / "elig-errors-mobile.png"))
    page.select_option("#elig-state", "TX")
    check("state error clears on change", not page.locator("#err-state").is_visible())
    check("cleared error leaves no stale text", page.locator("#err-state span").inner_text() == "")
    page.locator("#elig-tool .seg label:has(input[value='yes'])").first.click()
    page.locator("#elig-next").click()
    page.wait_for_timeout(600)
    check("advances to step 2", page.locator("[data-step='2']").is_visible())
    check("step counter updates", page.locator("#elig-count").inner_text() == "Step 2 of 3")
    page.locator("#elig-next").click(); page.wait_for_timeout(200)
    check("step 2 errors on empty", page.locator("#err-height").is_visible() and page.locator("#err-weight").is_visible())
    page.locator("#elig-ft").fill("5")
    check("ft auto-advances to inches", page.evaluate("document.activeElement.id") == "elig-in")
    page.locator("#elig-in").fill("9")
    page.locator("#elig-lb").fill("2x10")
    check("weight input sanitized", page.locator("#elig-lb").input_value() == "210", page.locator("#elig-lb").input_value())
    page.wait_for_timeout(900)
    bmi = page.locator("#bmi-num").inner_text()
    check("BMI computed 31.0", bmi == "31.0", bmi)
    page.screenshot(path=str(OUT / "elig-gauge-mobile.png"))
    page.locator("#elig-next").click(); page.wait_for_timeout(600)
    check("advances to step 3", page.locator("[data-step='3']").is_visible())
    page.locator("#elig-next").click(); page.wait_for_timeout(200)
    check("step 3 errors on empty", all(page.locator(f"#err-{k}").is_visible() for k in ("cond", "mtc", "preg")))
    page.locator("#elig-tool label.check:has(input[value='bp'])").click()
    page.locator("#elig-tool label.check:has(input[value='none'])").click()
    check("None of these clears others", not page.locator("input[value='bp']").is_checked() and page.locator("input[value='none']").is_checked())
    page.locator("#elig-tool label.check:has(input[value='t2d'])").click()
    check("Choosing a condition clears None", not page.locator("input[value='none']").is_checked())
    page.locator("fieldset[data-field='mtc'] label:has(input[value='no'])").click()
    page.locator("fieldset[data-field='preg'] label:has(input[value='no'])").click()
    page.locator("#elig-next").click(); page.wait_for_timeout(700)
    check("result shows", page.locator("#elig-result").is_visible())
    title = page.locator("#res-title").inner_text()
    check("likely result for BMI 31", "good fit" in title, title)
    check("result title focused", page.evaluate("document.activeElement.id") == "res-title")
    check("Texas note", "Texas is our first state" in page.locator("#res-note").inner_text())
    page.screenshot(path=str(OUT / "elig-result-mobile.png"))
    page.locator("#res-join").click(); page.wait_for_timeout(1200)
    check("join prefilled state", page.locator("#join-state").input_value() == "TX")
    check("join adds weight care, keeps urgent care", page.locator("input[name='interest'][value='weight-care']").is_checked()
          and page.locator("input[name='interest'][value='urgent-care']").is_checked())
    check("join form focused (touch)", page.evaluate("document.activeElement.id") == "join-form-title")

    # join form: errors then failure path (local server has no form backend)
    check("join form asks only for email and state, the rest optional", page.locator("#join-form [required]").count() == 2
          and page.locator("#join-form .label__opt").count() == 3 and page.locator("#join-consent").count() == 0)
    page.locator("#join-submit").click(); page.wait_for_timeout(300)
    check("join: missing email caught, state already filled", page.locator("#err-email").is_visible()
          and not page.locator("#err-jstate").is_visible())
    check("join status explains", page.locator("#join-status").inner_text().strip() == strings.EN["fix_one"], page.locator("#join-status").inner_text())
    check("join: focus moves to the email field", page.evaluate("document.activeElement.id") == "join-email")
    page.screenshot(path=str(OUT / "join-errors-mobile.png"))
    page.locator("#join-email").fill("maya@example")
    page.locator("#join-submit").click(); page.wait_for_timeout(200)
    check("invalid email caught", "valid email" in page.locator("#err-email").inner_text())
    page.locator("#join-email").fill("maya@example.com")
    page.locator("#join-name").fill("Maya")
    page.select_option("#join-heard", "social")
    page.locator("#join-submit").click(); page.wait_for_timeout(1500)
    check("server failure shows honest error", "couldn't save" in page.locator("#join-status").inner_text(), page.locator("#join-status").inner_text())
    check("button restored after failure", page.locator("#join-submit").is_enabled()
          and page.locator("#join-submit .btn__label").inner_text() == "Join the waitlist")
    # success path: pretend the host accepts the form
    page.route(f"{BASE}/", lambda r: r.fulfill(status=200, body="ok") if r.request.method == "POST" else r.continue_())
    posted = {}
    page.on("request", lambda req: posted.update(body=req.post_data) if req.method == "POST" else None)
    page.locator("#join-submit").click(); page.wait_for_timeout(1200)
    check("success panel shows", page.locator("#join-success").is_visible())
    check("success names email", "maya@example.com" in page.locator("#join-success").inner_text())
    body = posted.get("body", "")
    check("post body has form-name and fields", all(s in body for s in ("form-name=early-access", "first_name=Maya", "email=maya%40example.com", "state=TX", "language=en"))
          and "consent" not in body, body)
    check("post body says where it came from and how they heard", "source=website" in body and "heard=social" in body, body)
    check("account offer stays hidden while accounts are off", page.locator("#join-account").is_hidden())
    check("interests sent as one value", body.count("interest=") == 1 and "interest=urgent-care%2C+weight-care" in body, body)
    page.screenshot(path=str(OUT / "join-success-mobile.png"))
    page.locator("#join-again").click(); page.wait_for_timeout(300)
    check("add another resets form", page.locator("#join-form").is_visible() and page.locator("#join-name").input_value() == ""
          and page.evaluate("!document.querySelector('#join-form input[name=interest]:checked')"))

    # FAQ + privacy
    page.locator("#faq").scroll_into_view_if_needed()
    q = page.locator(".faq-q").first
    q.click(); page.wait_for_timeout(600)
    check("faq opens", q.get_attribute("aria-expanded") == "true" and page.locator("#faq-a-1 p").is_visible())
    check("faq: the first answer says Jachi isn't accepting patients yet", "accepting patients" in q.inner_text()
          and page.locator("#faq-a-1 p").inner_text().startswith("Not yet."), q.inner_text())
    q.click(); page.wait_for_timeout(600)
    check("faq closes", q.get_attribute("aria-expanded") == "false" and not page.locator("#faq-a-1 p").is_visible())
    check("footer links to the privacy policy and terms", page.locator("footer a[href='/privacy/']").count() == 1
          and page.locator("footer a[href='/terms/']").count() == 1 and page.locator("footer a[href='/texas-medical-board/']").count() == 1)
    page.locator("#join-form [data-open='privacy']").scroll_into_view_if_needed()
    page.locator("#join-form [data-open='privacy']").click(); page.wait_for_timeout(500)
    check("privacy dialog opens", page.locator("#privacy").evaluate("d => d.open"))
    page.screenshot(path=str(OUT / "privacy-mobile.png"))
    page.keyboard.press("Escape"); page.wait_for_timeout(300)
    check("privacy dialog closes", not page.locator("#privacy").evaluate("d => d.open"))
    check("focus back on opener", page.evaluate("document.activeElement.matches('#join-form [data-open=privacy]')"))
    unexpected = [l for l in logs if "501" not in l[1]]  # the 501 comes from the deliberate no-backend test
    check("mobile interactions: no unexpected console errors", not unexpected, json.dumps(unexpected))
    ctx.close()

    # 2b) Condition search on a phone
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    page.goto(URL + "#services", wait_until="networkidle"); page.wait_for_timeout(600)
    q = page.locator("#lookup-q")
    def visible_hits():
        return page.evaluate("[...document.querySelectorAll('#lookup-results .hit')].filter(h => !h.hidden).map(h => h.dataset.name)")
    q.fill("uti"); page.wait_for_timeout(400)
    hits = visible_hits()
    check("search: 'uti' finds UTI", hits[:1] == ["Urinary tract infection (UTI)"], str(hits))
    check("search: count announced", "result" in page.locator("#lookup-count").inner_text(), page.locator("#lookup-count").inner_text())
    check("search: clear button shows", page.locator("#lookup-clear").is_visible())
    check("search: popular chips step aside while searching", page.locator(".lookup__chips").is_hidden())
    check("search: phone bar hides while typing", not page.locator("#dock").evaluate("el => el.classList.contains('is-visible')"))
    page.screenshot(path=str(OUT / "search-uti-mobile.png"))
    q.fill("viagra"); page.wait_for_timeout(300)
    check("search: brand name finds ED", visible_hits() == ["Erectile dysfunction (ED)"], str(visible_hits()))
    q.fill("hair loss"); page.wait_for_timeout(300)
    check("search: two-word query finds men's and women's rows", set(visible_hits()) == {"Hair loss", "Hair thinning"}, str(visible_hits()))
    q.fill("Adderall"); page.wait_for_timeout(300)
    hits = visible_hits()
    check("search: controlled drug explained, no sign-up", hits == ["ADHD medication"]
          and page.locator(".hit--no:not([hidden]) .hit__cta").count() == 0, str(hits))
    q.fill("testosterone"); page.wait_for_timeout(300)
    check("search: testosterone not offered", visible_hits() == ["Testosterone (TRT)"], str(visible_hits()))
    q.fill("heart"); page.wait_for_timeout(300)
    hits = visible_hits()
    check("search: emergencies sort first", hits[:1] == ["Chest pain"] and "Acid reflux (GERD)" in hits, str(hits))
    check("search: emergency row dials 911", page.locator(".hit--911:not([hidden]) a[href='tel:911']").count() >= 1)
    page.screenshot(path=str(OUT / "search-heart-mobile.png"))
    q.fill("suicidal"); page.wait_for_timeout(300)
    check("search: crisis row offers 988", visible_hits() == ["Thoughts of suicide or self-harm"]
          and page.locator(".hit--988:not([hidden]) a[href='tel:988']").count() == 1
          and page.locator(".hit--988:not([hidden]) a[href='sms:988']").count() == 1)
    q.fill("zzzz"); page.wait_for_timeout(400)
    check("search: no-match message", page.locator("#lookup-empty").is_visible() and "zzzz" in page.locator("#lookup-empty").inner_text()
          and page.locator("#lookup-results").is_hidden())
    page.screenshot(path=str(OUT / "search-empty-mobile.png"))
    page.locator("#lookup-clear").click(); page.wait_for_timeout(300)
    check("search: clear resets", q.input_value() == "" and page.locator("#lookup-results").is_hidden()
          and page.locator("#lookup-empty").is_hidden() and page.locator("#lookup-clear").is_hidden())
    page.locator(".lookup__chips button[data-q='Birth control']").click(); page.wait_for_timeout(300)
    check("search: popular chip runs a search", q.input_value() == "Birth control" and visible_hits()[:1] == ["Birth control"], str(visible_hits()))
    page.locator(".hit:not([hidden]) [data-join]").first.click(); page.wait_for_timeout(1200)
    check("search: result signs up for that service", page.locator("input[name='interest'][value='womens-health']").is_checked())
    page.goto(URL + "#services", wait_until="networkidle"); page.wait_for_timeout(400)
    page.locator("#lookup-q").fill("anxiety"); page.wait_for_timeout(300)
    page.locator(".hit:not([hidden]) [data-join]").first.click(); page.wait_for_timeout(1200)
    check("search: anxiety offers therapy and medication", page.locator("input[name='interest'][value='therapy']").is_checked()
          and page.locator("input[name='interest'][value='anxiety-depression']").is_checked())
    page.goto(URL + "#services", wait_until="networkidle"); page.wait_for_timeout(400)
    page.locator("#lookup-q").fill("wegovy"); page.wait_for_timeout(300)
    page.locator(".hit:not([hidden]) [data-elig]").click(); page.wait_for_timeout(1300)
    t = page.evaluate("document.getElementById('eligibility').getBoundingClientRect().top")
    check("search: weight result opens the check", -5 <= t < 140, f"top={t}")
    page.goto(URL + "#services", wait_until="networkidle"); page.wait_for_timeout(400)
    page.locator("#lookup-q").fill("acne"); page.keyboard.press("Escape"); page.wait_for_timeout(300)
    check("search: Escape clears", page.locator("#lookup-q").input_value() == "")
    ov = page.evaluate(OVERFLOW_JS)
    check("search: no overflow", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
    check("search: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 2c) Help chat on a laptop
    ctx = browser.new_context(viewport={"width": 1280, "height": 860})
    page, logs = setup(ctx)
    chat_bodies = []
    replies = {"mode": "ok"}
    def chat_route(route):
        chat_bodies.append(route.request.post_data)
        if replies["mode"] == "down":
            route.fulfill(status=503, content_type="application/json", body='{"error":"not_configured"}')
        else:
            route.fulfill(status=200, content_type="application/json",
                          body=json.dumps({"reply": f"Our clinicians are licensed in your state. Questions? Email {EMAIL}."}))
    page.route("**/api/chat", chat_route)
    page.goto(URL, wait_until="networkidle"); page.wait_for_timeout(500)
    launcher = page.locator("#chat-launcher")
    check("chat: launcher visible on desktop", launcher.is_visible())
    launcher.click(); page.wait_for_timeout(500)
    check("chat: opens", page.locator("#chat").is_visible() and launcher.get_attribute("aria-expanded") == "true")
    check("chat: says no live agents", "No live agents yet" in page.locator("#chat-sub").inner_text())
    check("chat: input focused on desktop", page.evaluate("document.activeElement.id") == "chat-input")
    check("chat: send disabled while empty", page.locator("#chat-send").is_disabled())
    page.screenshot(path=str(OUT / "chat-open-desktop.png"))
    page.locator("#chat-quick button[data-ask='Who are the clinicians?']").click(); page.wait_for_timeout(700)
    bots = page.locator("#chat-log .msg--bot")
    check("chat: quick question gets an AI reply", "licensed in your state" in bots.last.inner_text(), bots.last.inner_text())
    check("chat: quick replies hide after first question", page.locator("#chat-quick").is_hidden())
    check("chat: request carries the conversation", chat_bodies and json.loads(chat_bodies[-1])["messages"][-1] == {"role": "user", "content": "Who are the clinicians?"}, str(chat_bodies[-1:]))
    check("chat: support email becomes a link", page.locator(f"#chat-log .msg--bot a[href='mailto:{EMAIL}']").count() >= 1)
    page.locator("#chat-input").fill("Do you take insurance?")
    page.keyboard.press("Enter"); page.wait_for_timeout(700)
    sent = json.loads(chat_bodies[-1])["messages"]
    check("chat: Enter sends and history grows", len(sent) == 3 and sent[1]["role"] == "assistant", json.dumps(sent))
    check("chat: input clears after sending", page.locator("#chat-input").input_value() == "")
    n_before = len(chat_bodies)
    page.locator("#chat-input").fill("I have chest pain right now"); page.keyboard.press("Enter"); page.wait_for_timeout(400)
    check("chat: emergency answered with 911, no AI call", len(chat_bodies) == n_before
          and page.locator("#chat-log .msg--alert a[href='tel:911']").count() == 1)
    page.locator("#chat-input").fill("I want to kill myself"); page.keyboard.press("Enter"); page.wait_for_timeout(400)
    check("chat: crisis answered with 988 call and text, no AI call", len(chat_bodies) == n_before
          and page.locator("#chat-log .msg--alert a[href='tel:988']").count() == 1
          and page.locator("#chat-log .msg--alert a[href='sms:988']").count() == 1)
    page.locator("#chat-input").fill("I need to end my membership"); page.keyboard.press("Enter"); page.wait_for_timeout(700)
    check("chat: everyday wording isn't mistaken for a crisis", len(chat_bodies) == n_before + 1)
    page.screenshot(path=str(OUT / "chat-safety-desktop.png"))
    replies["mode"] = "down"
    page.locator("#chat-input").fill("Can I book a visit?"); page.keyboard.press("Enter"); page.wait_for_timeout(700)
    check("chat: honest fallback when AI is offline", "can't answer right now" in bots.last.inner_text()
          and page.locator("#chat-log .msg--bot").last.locator("[data-ticket]").count() == 1)
    page.locator("#chat-log .msg--bot").last.locator("[data-ticket]").click(); page.wait_for_timeout(300)
    check("ticket: opens with focus on its title", page.locator("#chat-ticket").is_visible() and page.evaluate("document.activeElement.id") == "ticket-title")
    check("ticket: says a person reads it", "A person on our team reads every ticket" in page.locator(".ticket__lead").inner_text())
    check("ticket: offers to include the chat", page.locator("#ticket-include-row").is_visible())
    page.locator("#ticket-submit").click(); page.wait_for_timeout(300)
    check("ticket: validation shows all three errors", all(page.locator(f"#err-{k}").is_visible() for k in ("tname", "temail", "tmsg")))
    page.screenshot(path=str(OUT / "ticket-errors-desktop.png"))
    page.locator("#ticket-name").fill("Ana"); page.locator("#ticket-email").fill("ana@example.com")
    page.locator("#ticket-message").fill("When will you open in Dallas?")
    page.select_option("#ticket-topic", "Waitlist")
    page.locator("label[for='ticket-include']").click()
    page.locator("#ticket-submit").click(); page.wait_for_timeout(1200)
    check("ticket: failure shows an honest error with the email", "couldn't send" in page.locator("#ticket-status").inner_text()
          and EMAIL in page.locator("#ticket-status").inner_text())
    tposted = {}
    page.route(f"{BASE}/", lambda r: r.fulfill(status=200, body="ok") if r.request.method == "POST" else r.continue_())
    page.on("request", lambda req: tposted.update(body=req.post_data) if req.method == "POST" and req.url.rstrip("/") == BASE else None)
    page.locator("#ticket-submit").click(); page.wait_for_timeout(1200)
    tb = tposted.get("body", "")
    check("ticket: success screen names the email", page.locator("#ticket-success").is_visible() and "ana@example.com" in page.locator("#ticket-success").inner_text())
    check("ticket: posts to the support-ticket form with all fields",
          all(x in tb for x in ("form-name=support-ticket", "name=Ana", "email=ana%40example.com", "topic=Waitlist", "include_chat=yes", "chat_transcript=Visitor", "source=website")), tb[:300])
    page.screenshot(path=str(OUT / "ticket-sent-desktop.png"))
    page.locator("#ticket-done").click(); page.wait_for_timeout(300)
    check("ticket: back to chat", page.locator("#chat-talk").is_visible() and page.locator("#ticket-form").is_visible() is False)
    page.keyboard.press("Escape")
    closed = "document.getElementById('chat').hidden && document.activeElement && document.activeElement.id === 'chat-launcher'"
    for _ in range(30):  # the panel hides after its closing animation (wait_for_function can't run under the site's CSP)
        if page.evaluate(closed):
            break
        page.wait_for_timeout(100)
    check("chat: Escape closes and returns focus", page.evaluate(closed),
          json.dumps(page.evaluate("[document.activeElement.id || document.activeElement.tagName, document.getElementById('chat').hidden, document.documentElement.className]")))
    page.locator("#faq [data-chat-open]").click(); page.wait_for_timeout(400)
    check("chat: FAQ button opens the chat", page.locator("#chat").is_visible())
    page.locator("#chat-close").click(); page.wait_for_timeout(400)
    unexpected = [l for l in logs if "501" not in l[1] and "503" not in l[1]]
    check("chat desktop: no unexpected console errors", not unexpected, json.dumps(unexpected))
    ctx.close()

    # 2d) Help chat on a phone
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    page.route("**/api/chat", lambda r: r.fulfill(status=200, content_type="application/json", body='{"reply":"We launch in Texas first."}'))
    page.goto(URL, wait_until="networkidle"); page.wait_for_timeout(600)
    check("phone chat: launcher shows at the top", page.locator("#chat-launcher").is_visible())
    page.evaluate("window.scrollTo({top: document.getElementById('why').offsetTop + 200, behavior: 'instant'})"); page.wait_for_timeout(1000)
    check("phone chat: launcher steps aside for the bottom bar", not page.locator("#chat-launcher").is_visible() and page.locator(".dock__chat").is_visible())
    page.screenshot(path=str(OUT / "chat-dock-phone.png"))
    page.locator(".dock__chat").click(); page.wait_for_timeout(600)
    box = page.locator("#chat").bounding_box()
    check("phone chat: opens full screen", box and box["x"] == 0 and box["y"] == 0 and round(box["width"]) == 390 and round(box["height"]) == 844, str(box))
    check("phone chat: page behind is inert", page.evaluate("document.getElementById('main').inert === true"))
    check("phone chat: no keyboard pop on open", page.evaluate("document.activeElement.id") == "chat-title")
    page.locator("#chat-input").fill("When do you launch?"); page.locator("#chat-send").click(); page.wait_for_timeout(700)
    check("phone chat: reply arrives", "Texas" in page.locator("#chat-log .msg--bot").last.inner_text())
    page.screenshot(path=str(OUT / "chat-open-phone.png"))
    page.locator("#chat .chat__fine [data-ticket]").click(); page.wait_for_timeout(300)
    page.screenshot(path=str(OUT / "ticket-phone.png"))
    ov = page.evaluate(OVERFLOW_JS)
    check("phone chat: no overflow", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
    page.locator("#chat-close").click(); page.wait_for_timeout(500)
    check("phone chat: closing restores the page", page.evaluate("document.getElementById('main').inert === false") and page.locator("#chat").is_hidden())
    check("phone chat: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 2e) Home page: the waitlist first, the quick picker, what's included and clinical standards
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    page.goto(URL, wait_until="networkidle"); page.wait_for_timeout(600)
    hero_btns = page.locator(".hero .cta-row .btn")
    check("hero: the waitlist is the main button, care finder second", hero_btns.first.get_attribute("href") == "#join"
          and "Join the waitlist" in hero_btns.first.inner_text() and hero_btns.nth(1).get_attribute("href") == "#care-finder")
    check("hero: says it's free to join", "Free to join" in page.locator(".hero .trust").inner_text())
    picks = page.evaluate("[...document.querySelectorAll('.picker a')].map(a => a.getAttribute('href'))")
    bad_picks = [h for h in picks if status_of(h) != 200]
    check("hero: quick picker goes straight to service pages", len(picks) == 8 and not bad_picks and len(set(picks)) == 8, str(picks))
    hero_btns.first.click(); page.wait_for_timeout(1200)
    check("hero button: form in view, keyboard not opened", page.evaluate("document.activeElement.id") == "join-form-title"
          and 0 <= page.evaluate("document.querySelector('.form-card').getBoundingClientRect().top") < 200)
    page.evaluate("document.getElementById('services').scrollIntoView()"); page.wait_for_timeout(400)
    inc = page.locator("#included").inner_text()
    check("services: what's included and what's billed separately", page.locator(".included__col").count() == 2
          and "What's included" in inc and "Billed separately" in inc and "Lab tests, by the lab" in inc and PRICING_NOTE in inc, inc[:200])
    page.evaluate("document.getElementById('standards').scrollIntoView()"); page.wait_for_timeout(400)
    links = page.evaluate("[...document.querySelectorAll('.verify__links a')].map(a => a.getAttribute('href'))")
    check("clinical standards: six standards and where to check a license", page.locator(".standard").count() == 6
          and any("tmb.texas.gov" in l for l in links) and any("bon.texas.gov" in l for l in links)
          and any("bhec.texas.gov" in l for l in links) and "/texas-medical-board/" in links, str(links))
    check("clinical standards: outside links don't pass on where you came from",
          page.evaluate("[...document.querySelectorAll('.verify__links a[href^=http]')].every(a => a.relList.contains('noreferrer'))"))
    page.screenshot(path=str(OUT / "standards-phone.png"))
    ov = page.evaluate(OVERFLOW_JS)
    check("home additions: no overflow on a phone", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
    page.evaluate("window.scrollTo(0, 0)"); page.wait_for_timeout(300)
    page.locator(".menu-toggle").click(); page.wait_for_timeout(600)
    page.locator("#mobile-menu [data-to-join]").click(); page.wait_for_timeout(1300)
    check("menu's waitlist button closes the menu and brings up the form", not is_open(page, "#mobile-menu")
          and page.evaluate("document.activeElement.id") == "join-form-title")
    check("home additions: no console errors", not logs, json.dumps(logs))
    ctx.close()
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page, logs = setup(ctx)
    page.goto(URL, wait_until="networkidle"); page.wait_for_timeout(500)
    page.locator(".header-cta").click(); page.wait_for_timeout(1300)
    check("header waitlist button (desktop): email field ready", page.evaluate("document.activeElement.id") == "join-email")
    page.goto(URL, wait_until="networkidle"); page.wait_for_timeout(300)
    page.locator(".picker a[href='/uti-treatment/']").click(); page.wait_for_load_state("networkidle")
    check("quick picker: UTI opens the UTI page", page.url == f"{BASE}/uti-treatment/", page.url)
    page.goto(ES_URL, wait_until="networkidle"); page.wait_for_timeout(300)
    es_picks = page.evaluate("[...document.querySelectorAll('.picker a')].map(a => a.getAttribute('href'))")
    check("es quick picker: links to the service cards on the Spanish page", len(es_picks) == 8
          and all(page.locator(h).count() == 1 for h in es_picks), str(es_picks))
    check("quick picker pages: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 3) Every care finder outcome
    def run_finder(need, flag=None, shot=None):
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page, logs = setup(ctx)
        page.goto(URL + "#care-finder", wait_until="networkidle")
        page.locator(f"label.need:has(input[value='{need}'])").click()
        page.locator("#finder-next").click(); page.wait_for_timeout(350)
        if flag:
            page.locator(f"fieldset[data-field='flag-{need}'] label:has(input[value='{flag}'])").click()
            page.locator("#finder-next").click()
        page.wait_for_timeout(700)
        out = {
            "title": page.locator("#fres-title").inner_text(),
            "body": page.locator("#fres-body").inner_text(),
            "chips": page.locator("#fres-chips").inner_text() if page.locator("#fres-chips").is_visible() else "",
            "cta": page.locator("#fres-cta").is_visible(),
            "href": page.locator("#fres-cta").get_attribute("href"),
            "label": page.locator("#fres-cta").inner_text().strip(),
            "hotline": page.locator("#fres-hotline").is_visible(),
            "note": page.locator("#fres-note").is_visible(),
            "kind": page.locator("#finder-result").get_attribute("class"),
        }
        if shot:
            page.locator("#finder-tool").screenshot(path=str(OUT / f"finder-{shot}.png"))
        return page, ctx, out, logs

    page, ctx, o, lg = run_finder("refill", "yes", "refill-controlled")
    check("refill controlled → can't refill", "can't refill controlled" in o["title"] and o["href"] == "#services"
          and "don't stop taking it suddenly" in o["body"] and not o["note"], json.dumps(o))
    page.locator("#fres-cta").click(); page.wait_for_timeout(1200)
    t = page.evaluate("document.getElementById('services').getBoundingClientRect().top")
    check("controlled CTA scrolls to services", -5 <= t < 140, f"top={t}")
    ctx.close()
    page, ctx, o, lg = run_finder("refill", "unsure")
    check("refill unsure → may be a fit, pharmacist note", "may be a good fit" in o["title"] and "pharmacist" in o["body"]
          and "Online refill" in o["chips"], json.dumps(o))
    ctx.close()
    page, ctx, o, lg = run_finder("refill", "no", "refill")
    check("refill no → good fit", o["title"] == "A refill visit is a good fit." and o["label"] == "Join the waitlist", json.dumps(o))
    page.locator("#fres-cta").click(); page.wait_for_timeout(1200)
    check("refill CTA preselects refills", page.locator("input[name='interest'][value='refills']").is_checked())
    ctx.close()
    page, ctx, o, lg = run_finder("mental", "yes", "crisis")
    check("mental crisis → 988 lifeline, no sign-up", o["hotline"] and not o["cta"] and not o["note"] and "result--crisis" in o["kind"], json.dumps(o))
    links = page.evaluate("[...document.querySelectorAll('#fres-hotline a')].map(a => a.getAttribute('href'))")
    check("crisis offers call and text 988", links == ["tel:988", "sms:988"], str(links))
    ctx.close()
    page, ctx, o, lg = run_finder("mental", "no", "mental")
    check("mental no → therapy or medication, 988", "Therapy, medication or both" in o["title"] and "Therapy" in o["chips"]
          and "Medication care" in o["chips"] and "988" in o["body"] and "$" not in o["chips"], json.dumps(o))
    page.locator("#fres-cta").click(); page.wait_for_timeout(1200)
    check("mental CTA preselects therapy and medication care", page.locator("input[name='interest'][value='therapy']").is_checked()
          and page.locator("input[name='interest'][value='anxiety-depression']").is_checked())
    ctx.close()
    page, ctx, o, lg = run_finder("sexual", "yes", "sexual-pep")
    check("sexual + possible HIV exposure → get PEP today", "Get care today" in o["title"] and "PEP" in o["body"]
          and not o["cta"] and "result--inperson" in o["kind"], json.dumps(o))
    ctx.close()
    page, ctx, o, lg = run_finder("sexual", "unsure")
    check("sexual unsure → fit plus PEP warning", "Sexual health" in o["title"] and "Online visit" in o["chips"] and "72 hours" in o["body"], json.dumps(o))
    page.locator("#fres-cta").click(); page.wait_for_timeout(1200)
    check("sexual CTA preselects sexual health", page.locator("input[name='interest'][value='sexual-health']").is_checked())
    ctx.close()
    page, ctx, o, lg = run_finder("mens", "yes", "mens-nitrates")
    check("men's + nitrates → ED pills may not be safe", "may not be safe" in o["title"] and "nitrates" in o["body"]
          and "hair loss" in o["body"], json.dumps(o))
    ctx.close()
    page, ctx, o, lg = run_finder("mens", "no", "mens")
    check("men's no → fit", "Men's health" in o["title"] and "Online visit" in o["chips"], json.dumps(o))
    page.locator("#fres-cta").click(); page.wait_for_timeout(1200)
    check("men's CTA preselects men's health", page.locator("input[name='interest'][value='mens-health']").is_checked())
    ctx.close()
    page, ctx, o, lg = run_finder("womens", "yes", "womens-redflag")
    check("women's red flags → seen in person", "in person today" in o["title"] and not o["cta"], json.dumps(o))
    ctx.close()
    page, ctx, o, lg = run_finder("womens", "no")
    check("women's no → fit", "Women's health" in o["title"] and "birth control" in o["body"], json.dumps(o))
    ctx.close()
    page, ctx, o, lg = run_finder("skin", "yes")
    check("skin red flags → seen in person", "in person today" in o["title"] and "infection" in o["body"], json.dumps(o))
    ctx.close()
    page, ctx, o, lg = run_finder("skin", "no", "skin")
    check("skin no → fit", "Skin care" in o["title"] and "acne" in o["body"], json.dumps(o))
    page.locator("#fres-cta").click(); page.wait_for_timeout(1200)
    check("skin CTA preselects skin care", page.locator("input[name='interest'][value='skin-care']").is_checked())
    ctx.close()
    page, ctx, o, lg = run_finder("weight", None, "weight")
    check("weight → skips safety step to eligibility", "weight care check" in o["title"] and o["href"] == "#eligibility"
          and "Ongoing care" in o["chips"], json.dumps(o))
    page.locator("#fres-cta").click(); page.wait_for_timeout(1300)
    t = page.evaluate("document.getElementById('eligibility').getBoundingClientRect().top")
    check("weight CTA scrolls to the check", -5 <= t < 140, f"top={t}")
    check("weight CTA focuses the check", page.evaluate("document.activeElement.closest('#elig-tool') !== null"))
    check("finder runs: no console errors", not lg, json.dumps(lg))
    ctx.close()

    # 4) Other eligibility outcomes
    def run_elig(state, age, ft, inch, lb, conds, mtc, preg):
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page, logs = setup(ctx)
        page.goto(URL + "#eligibility", wait_until="networkidle")
        page.select_option("#elig-state", state)
        page.locator(f"fieldset[data-field='age'] label:has(input[value='{age}'])").click()
        page.locator("#elig-next").click(); page.wait_for_timeout(300)
        if age == "yes":
            page.locator("#elig-ft").fill(ft); page.locator("#elig-in").fill(inch); page.locator("#elig-lb").fill(lb)
            page.locator("#elig-next").click(); page.wait_for_timeout(300)
            for c in conds:
                page.locator(f"#elig-tool label.check:has(input[value='{c}'])").click()
            page.locator(f"fieldset[data-field='mtc'] label:has(input[value='{mtc}'])").click()
            page.locator(f"fieldset[data-field='preg'] label:has(input[value='{preg}'])").click()
            page.locator("#elig-next").click()
        page.wait_for_timeout(700)
        nxt = page.locator("#res-next").inner_text() if page.locator("#res-next").is_visible() else ""
        out = (page.locator("#res-title").inner_text(), page.locator("#res-body").inner_text() + ("\n" + nxt if nxt else ""),
               page.locator("#res-note").inner_text() if page.locator("#res-note").is_visible() else "",
               page.locator("#res-join").is_visible())
        page.screenshot(path=str(OUT / f"elig-{state}-{age}-{lb}-{mtc}-{preg}.png"))
        ctx.close()
        return out, logs

    (t, b, n, j), lg = run_elig("TX", "no", "", "", "", [], "", "")
    check("minor result", "18 and older" in t and not j, t)
    (t, b, n, j), lg = run_elig("CA", "yes", "5", "6", "175", ["bp"], "no", "no")
    check("BMI 28.2 + condition → likely", "good fit" in t and "28.2" in b, b)
    check("likely result: only a first step, and what a clinical evaluation involves", "not a diagnosis or a promise of a prescription" in b
          and "What a clinical evaluation involves" in b and "Lab tests." in b and "Not everyone is prescribed medication." in b, b)
    check("non-Texas note names state", "California" in n, n)
    (t, b, n, j), lg = run_elig("TX", "yes", "5", "10", "160", ["none"], "no", "no")
    check("BMI 23 → unlikely", "may not be the right fit" in t and "23.0" in b, b)
    check("unlikely result: no evaluation steps", "What a clinical evaluation involves" not in b, b)
    (t, b, n, j), lg = run_elig("TX", "yes", "5", "4", "220", ["none"], "yes", "no")
    check("MTC history → caution", "may not be safe" in t and "medullary" in b, b)
    check("caution result: no evaluation steps", "What a clinical evaluation involves" not in b, b)
    (t, b, n, j), lg = run_elig("TX", "yes", "5", "4", "220", ["none"], "unsure", "no")
    check("MTC unsure → likely + note", "good fit" in t and "family history" in b, b)
    (t, b, n, j), lg = run_elig("NY", "yes", "5", "6", "175", ["none"], "no", "no")
    check("BMI 28.2 no condition → unlikely", "may not be the right fit" in t, t)

    # 5) Desktop interactions + keyboard
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page, logs = setup(ctx)
    page.goto(URL, wait_until="networkidle")
    page.wait_for_timeout(600)
    page.keyboard.press("Tab")
    check("first tab = skip link", page.evaluate("document.activeElement.classList.contains('skip')"))
    page.screenshot(path=str(OUT / "desktop-skip.png"))
    page.keyboard.press("Tab")
    check("second tab = brand", page.evaluate("document.activeElement.classList.contains('brand')"))
    page.locator(".nav a[href='#approach']").click(); page.wait_for_timeout(1500)
    active = page.evaluate("[...document.querySelectorAll('.nav a.is-active')].map(a=>a.getAttribute('href'))")
    check("scrollspy marks Our approach", active == ["#approach"], str(active))
    check("header solid after scroll", page.evaluate("document.getElementById('site-header').classList.contains('is-scrolled')"))
    page.screenshot(path=str(OUT / "desktop-approach.png"))
    page.locator(".nav a[href='#services']").click(); page.wait_for_timeout(1500)
    active = page.evaluate("[...document.querySelectorAll('.nav a.is-active')].map(a=>a.getAttribute('href'))")
    check("scrollspy marks Services", active == ["#services"], str(active))
    # keyboard through the care finder: arrow keys pick, Enter submits
    page.goto(URL + "#care-finder", wait_until="networkidle"); page.wait_for_timeout(500)
    page.locator("input[name='need'][value='urgent']").focus()
    page.keyboard.press("ArrowRight")
    check("arrow keys move between needs without advancing", page.locator("input[name='need'][value='refill']").is_checked()
          and page.locator("[data-fstep='1']").is_visible())
    page.keyboard.press("Enter"); page.wait_for_timeout(500)
    check("Enter submits the finder step", page.locator("[data-path='refill']").is_visible())
    # reveal: scroll from the top and check every block appears
    page.goto(URL, wait_until="networkidle"); page.wait_for_timeout(500)
    page.mouse.wheel(0, 300); page.wait_for_timeout(300)
    pre_count = page.evaluate("document.querySelectorAll('[data-reveal].pre').length")
    check("reveal arms below-fold blocks on first scroll", pre_count > 0, str(pre_count))
    for y in range(0, 16000, 600):
        page.mouse.wheel(0, 600); page.wait_for_timeout(120)
    page.wait_for_timeout(2900)
    left = page.evaluate("document.querySelectorAll('[data-reveal].pre').length")
    check("all reveal blocks shown after scrolling through", left == 0, str(left))
    # service card buttons
    page.locator("#svc-sexual [data-join]").click(); page.wait_for_timeout(1200)
    check("sexual health card preselects its interest", page.locator("input[name='interest'][value='sexual-health']").is_checked())
    check("desktop: email field focused for typing", page.evaluate("document.activeElement.id") == "join-email")
    card_top = page.evaluate("document.querySelector('.form-card').getBoundingClientRect().top")
    check("desktop: form card in view", 60 <= card_top <= 400, f"top={card_top}")
    page.locator("#svc-therapy [data-join]").click(); page.wait_for_timeout(1200)
    check("service card adds its interest", page.locator("input[name='interest'][value='therapy']").is_checked()
          and page.locator("input[name='interest'][value='sexual-health']").is_checked())
    check("sign-up lists all nine services", page.locator("#join-form input[name='interest']").count() == 9)
    page.locator(".svc [data-elig]").click(); page.wait_for_timeout(1300)
    t = page.evaluate("document.getElementById('eligibility').getBoundingClientRect().top")
    check("weight card opens the check", -5 <= t < 140, f"top={t}")
    # hover state screenshot of a tile
    page.locator("#why").scroll_into_view_if_needed(); page.wait_for_timeout(500)
    page.locator(".tile--wide").hover(); page.wait_for_timeout(600)
    page.screenshot(path=str(OUT / "desktop-tile-hover.png"))
    check("desktop: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 6) Preview mode (inside the artifact viewer): honest message, no network call
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page, logs = setup(ctx, preview=True)
    page.goto(URL + "#join", wait_until="networkidle")
    sent = []
    page.on("request", lambda req: sent.append(req.url) if req.method == "POST" else None)
    page.locator("#join-name").fill("Sam"); page.locator("#join-email").fill("sam@example.com")
    page.select_option("#join-state", "TX")
    page.locator("#join-form label.check:has(input[value='anxiety-depression'])").click()
    page.locator("#join-submit").click(); page.wait_for_timeout(600)
    check("preview mode shows preview notice", "preview" in page.locator("#join-status").inner_text().lower())
    check("preview mode sends nothing", not sent, str(sent))
    page.screenshot(path=str(OUT / "preview-notice.png"))
    page.locator("#chat-launcher").click(); page.wait_for_timeout(400)
    page.locator("#chat-input").fill("What do you treat?"); page.keyboard.press("Enter"); page.wait_for_timeout(700)
    check("preview without AI: honest fallback", "can't answer right now" in page.locator("#chat-log .msg--bot").last.inner_text())
    page.locator("#chat .chat__fine [data-ticket]").click()
    page.locator("#ticket-name").fill("Sam"); page.locator("#ticket-email").fill("sam@example.com"); page.locator("#ticket-message").fill("Testing the ticket form here.")
    page.locator("#ticket-submit").click(); page.wait_for_timeout(500)
    check("preview ticket: honest notice, nothing sent", "preview" in page.locator("#ticket-status").inner_text().lower() and not sent)
    ctx.close()

    # 5b) Preview with Claude available through the artifact's sample capability
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    use_brand_fonts(page)
    page.add_init_script("""
      window.__sampleCalls = [];
      const fakeSample = async (input, opts) => {
        window.__sampleCalls.push(input);
        await new Promise(r => setTimeout(r, 150));
        opts.onText({ text: 'We launch', delta: 'We launch' });
        await new Promise(r => setTimeout(r, 150));
        opts.onText({ text: 'We launch in Texas first.', delta: ' in Texas first.' });
        return { text: 'We launch in Texas first.', truncated: false, modelTierApplied: 'quick' };
      };
      window.claude = { use: async (name) => (name === 'sample' ? fakeSample : null) };
    """)
    plogs = []
    page.on("pageerror", lambda e: plogs.append(str(e)))
    page.goto(f"{BASE}/__dist/artifact-sim.html", wait_until="networkidle"); page.wait_for_timeout(500)
    page.locator("#chat-launcher").click(); page.wait_for_timeout(300)
    page.locator("#chat-input").fill("When do you launch?"); page.keyboard.press("Enter"); page.wait_for_timeout(250)
    mid = page.locator("#chat-log .msg--bot").last.inner_text()
    page.wait_for_timeout(600)
    calls = page.evaluate("window.__sampleCalls")
    check("preview AI: answer streams in", "Texas" in page.locator("#chat-log .msg--bot").last.inner_text(), mid)
    check("preview AI: rules sent as the first turn", calls and calls[0][0]["role"] == "user" and "RULES" in calls[0][0]["content"]
          and calls[0][-1] == {"role": "user", "content": "When do you launch?"})
    check("preview AI: no page errors", not plogs, json.dumps(plogs))
    ctx.close()

    # 7) Reduced motion
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce", is_mobile=True, has_touch=True)
    page, logs = setup(ctx)
    page.goto(URL, wait_until="networkidle"); page.wait_for_timeout(300)
    op = page.evaluate("getComputedStyle(document.querySelector('.hero .display')).opacity")
    check("reduced motion: hero visible immediately", op == "1", op)
    page.mouse.wheel(0, 800); page.wait_for_timeout(300)
    check("reduced motion: nothing hidden on scroll", page.evaluate("document.querySelectorAll('[data-reveal].pre').length") == 0)
    check("reduced motion: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 8) Files, headers and the page-not-found page
    def get(path):
        try:
            with urllib.request.urlopen(BASE + path) as r:
                return r.status, r.headers, r.read()
        except urllib.error.HTTPError as e:
            return e.code, e.headers, e.read()

    status, headers, html_bytes = get("/")
    check("home page served with a Content-Security-Policy", status == 200 and "frame-ancestors 'none'" in headers.get("Content-Security-Policy", ""))
    check("home page sends nosniff, referrer and frame headers", headers.get("X-Content-Type-Options") == "nosniff"
          and headers.get("X-Frame-Options") == "DENY" and headers.get("Referrer-Policy"))
    for path, kind in (("/og.jpg", "image/jpeg"), ("/apple-touch-icon.png", "image/png"), ("/favicon.ico", "image/"),
                       ("/icon.svg", "image/svg+xml"), ("/robots.txt", "text/plain"), ("/sitemap.xml", "xml")):
        status, headers, body = get(path)
        check(f"{path} is served", status == 200 and kind in headers.get("Content-Type", "") and len(body) > 50, f"{status} {headers.get('Content-Type')}")
    html_text = html_bytes.decode()
    for tag in ('property="og:image" content="https://www.jachihealth.com/og.jpg"', 'name="twitter:card" content="summary_large_image"',
                'rel="apple-touch-icon" href="/apple-touch-icon.png"', 'rel="icon" href="/icon.svg"', 'rel="canonical"'):
        check(f"head has {tag.split('=')[1].split()[0]}", tag in html_text, tag)
    status, headers, body = get("/no-such-page")
    check("unknown page returns 404 with our page", status == 404 and b"This page isn" in body, str(status))

    for w, h in ((390, 844), (1440, 900)):
        ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=w < 900, has_touch=w < 900)
        page, logs = setup(ctx)
        bad = []
        page.on("response", lambda r: bad.append(f"{r.status} {r.url}") if r.status >= 400 and not r.url.endswith("/old-link") else None)
        page.goto(f"{BASE}/old-link", wait_until="networkidle"); page.wait_for_timeout(400)
        # The page itself answers 404 on purpose, and Chrome logs that; anything else is a real problem.
        logs[:] = [l for l in logs if "status of 404" not in l[1]]
        page.screenshot(path=str(OUT / f"404-{w}.png"))
        ov = page.evaluate(OVERFLOW_JS)
        check(f"404 @{w}: no overflow", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
        check(f"404 @{w}: one h1, links home and to the care finder", page.locator("h1").count() == 1
              and page.locator("a[href='/']").count() >= 2 and page.locator("a[href='/#care-finder']").count() == 1)
        page.locator(".nf a.btn[href='/']").click(); page.wait_for_load_state("networkidle")
        check(f"404 @{w}: homepage button works", page.url == URL and page.locator("#hero-title").is_visible(), page.url)
        check(f"404 @{w}: every file it uses loads", not bad, json.dumps(bad))
        check(f"404 @{w}: no console errors", not logs, json.dumps(logs))
        ctx.close()

    # 9) Spanish home page: every size, then every tool in Spanish
    for w, h in VIEWPORTS:
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, has_touch=w < 900, is_mobile=w < 900)
        page, logs = setup(ctx)
        page.goto(ES_URL, wait_until="networkidle"); page.wait_for_timeout(1200)
        ov = page.evaluate(OVERFLOW_JS)
        check(f"es: no horizontal overflow @{w}", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
        tops = page.evaluate("[...document.querySelectorAll('.svc')].map(e => Math.round(e.getBoundingClientRect().top))")
        expect_rows = 3 if w >= 1060 else (5 if w >= 640 else 9)
        check(f"es: nine service cards in {expect_rows} rows @{w}", len(tops) == 9 and len(set(tops)) == expect_rows, str(tops))
        es_nav = page.evaluate("[...document.querySelectorAll('.nav a')].filter(a => a.offsetParent).map(a => Math.round(a.getBoundingClientRect().height))")
        if w >= 1100:
            check(f"es: header nav on one line @{w}", len(es_nav) == 4 and max(es_nav) < 50, str(es_nav))
        check(f"es: no console errors @{w}", not logs, json.dumps(logs))
        if w in (390, 1440):
            page.screenshot(path=str(OUT / f"es-first-{w}.png"))
            page.screenshot(path=str(OUT / f"es-full-{w}.png"), full_page=True, animations="disabled")
        if w == 1440:
            problems = page.evaluate(STATIC_A11Y_JS)
            check("es: anchors, labels, names, ids all valid", not problems, json.dumps(problems))
        ctx.close()

    STRUCTURE_JS = """() => ({
      ids: [...document.querySelectorAll('[id]')].map(e => e.id).sort(),
      fields: [...document.querySelectorAll('form[name] [name]')].map(e => e.closest('form').getAttribute('name') + ':' + e.name + ':' + e.type).sort(),
      values: [...document.querySelectorAll('input[name=interest], #join-state option, #ticket-topic option')].map(e => e.value).sort(),
      hits: document.querySelectorAll('.hit').length, faq: document.querySelectorAll('.faq-item').length,
    })"""
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page, logs = setup(ctx)
    page.goto(URL, wait_until="networkidle"); en_shape = page.evaluate(STRUCTURE_JS)
    en_alt = page.evaluate("[...document.querySelectorAll('link[rel=alternate][hreflang]')].map(l => l.hreflang + ' ' + l.href)")
    page.goto(ES_URL, wait_until="networkidle"); es_shape = page.evaluate(STRUCTURE_JS)
    es_alt = page.evaluate("[...document.querySelectorAll('link[rel=alternate][hreflang]')].map(l => l.hreflang + ' ' + l.href)")
    check("es: same ids, form fields and values as the English page", en_shape == es_shape,
          json.dumps({k: (sorted(set(en_shape[k]) ^ set(es_shape[k])) if isinstance(en_shape[k], list) else (en_shape[k], es_shape[k])) for k in en_shape})[:600])
    check("both home pages point to each other (hreflang)", en_alt == es_alt and any(a.startswith("es ") and a.endswith("/es/") for a in en_alt)
          and any(a.startswith("x-default ") for a in en_alt), str(en_alt))
    check("es: page language is Spanish", page.evaluate("document.documentElement.lang") == "es")
    page.locator(".lang-switch").click(); page.wait_for_load_state("networkidle")
    check("es: language switch goes to English", page.url == URL and page.evaluate("document.documentElement.lang") == "en", page.url)
    page.locator(".lang-switch").click(); page.wait_for_load_state("networkidle")
    check("en: language switch goes to Spanish", page.url == ES_URL, page.url)
    ctx.close()

    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    page.add_init_script("navigator.share = async data => { window.__shared = data; };")
    page.route("**/api/chat", lambda r: r.fulfill(status=200, content_type="application/json",
                                                     body=json.dumps({"reply": f"Compartiremos los precios antes de abrir. Escriba a {EMAIL}."})))
    page.goto(ES_URL + "#care-finder", wait_until="networkidle"); page.wait_for_timeout(500)
    page.locator("#finder-next").click(); page.wait_for_timeout(300)
    check("es finder: empty step shows the Spanish error", page.locator("#err-need").inner_text().strip() == ES["f_need"])
    page.locator("label.need:has(input[value='urgent'])").click()
    page.locator("#finder-next").click(); page.wait_for_timeout(500)
    check("es finder: step counter in Spanish", page.locator("#finder-count").inner_text() == "Paso 2 de 2")
    page.locator("fieldset[data-field='flag-urgent'] label:has(input[value='yes'])").click()
    page.locator("#finder-next").click(); page.wait_for_timeout(600)
    check("es finder: emergency result in Spanish", page.locator("#fres-title").inner_text() == ES["f_urgent_911_title"]
          and page.locator("#fres-cta").get_attribute("href") == "tel:911" and ES["f_call_911"] in page.locator("#fres-cta").inner_text())
    page.locator("#fres-restart").click(); page.wait_for_timeout(400)
    page.locator("label.need:has(input[value='mental'])").click()
    page.locator("#finder-next").click(); page.wait_for_timeout(400)
    page.locator("fieldset[data-field='flag-mental'] label:has(input[value='no'])").click()
    page.locator("#finder-next").click(); page.wait_for_timeout(600)
    chips = page.locator("#fres-chips").inner_text()
    check("es finder: therapy and medication result in Spanish", page.locator("#fres-title").inner_text() == ES["f_mental_title"]
          and ES["f_mental_chip_therapy"] in chips and ES["f_mental_chip_meds"] in chips, chips)
    page.screenshot(path=str(OUT / "es-finder-phone.png"))

    page.goto(ES_URL + "#services", wait_until="networkidle"); page.wait_for_timeout(400)
    def es_hits():
        return page.evaluate("[...document.querySelectorAll('#lookup-results .hit')].filter(h => !h.hidden).map(h => h.dataset.name)")
    page.locator("#lookup-q").fill("infeccion urinaria"); page.wait_for_timeout(400)
    check("es search: Spanish words find the condition", es_hits()[:1] == ["Infección urinaria (IU)"], str(es_hits()))
    check("es search: count in Spanish", "resultado" in page.locator("#lookup-count").inner_text(), page.locator("#lookup-count").inner_text())
    page.locator("#lookup-q").fill("UTI"); page.wait_for_timeout(300)
    check("es search: English words still work", "Infección urinaria (IU)" in es_hits(), str(es_hits()))
    page.locator("#lookup-q").fill("dolor de pecho"); page.wait_for_timeout(300)
    check("es search: emergencies first, with 911", es_hits()[:1] == ["Dolor de pecho"]
          and page.locator(".hit--911:not([hidden]) a[href='tel:911']").count() >= 1, str(es_hits()))
    page.locator(".lookup__clear").click(); page.wait_for_timeout(200)

    page.goto(ES_URL + "#join", wait_until="networkidle"); page.wait_for_timeout(500)
    page.locator("#join-submit").click(); page.wait_for_timeout(300)
    check("es join: errors in Spanish", page.locator("#err-email").inner_text().strip() == ES["enter_email"]
          and page.locator("#err-jstate").inner_text().strip() == ES["choose_state"]
          and ES["fix_many"].split("{n}")[0] in page.locator("#join-status").inner_text(), page.locator("#join-status").inner_text())
    page.locator("#join-name").fill("Ana"); page.locator("#join-email").fill("ana@example.com")
    page.select_option("#join-state", "TX")
    page.locator("#join-form label.check:has(input[value='therapy'])").click()
    es_posted = {}
    page.route(f"{BASE}/", lambda r: r.fulfill(status=200, body="ok") if r.request.method == "POST" else r.continue_())
    page.on("request", lambda req: es_posted.update(body=req.post_data) if req.method == "POST" and req.url.rstrip("/") == BASE else None)
    page.locator("#join-submit").click(); page.wait_for_timeout(1200)
    body = es_posted.get("body", "")
    check("es join: saves to the same form, marked Spanish", all(x in body for x in ("form-name=early-access", "language=es", "first_name=Ana", "interest=therapy")), body)
    check("es join: success in Spanish", page.locator("#join-success-title").inner_text().startswith("Ya está en la lista, Ana"))
    page.locator("#join-share").click(); page.wait_for_timeout(300)
    shared = page.evaluate("window.__shared")
    check("es share: opens the share sheet with the Spanish page", shared and shared["url"] == "https://www.jachihealth.com/es/" and shared["text"] == ES["share_text"], str(shared))
    page.screenshot(path=str(OUT / "es-join-success-phone.png"))

    page.goto(ES_URL + "#eligibility", wait_until="networkidle"); page.wait_for_timeout(500)
    page.locator("#elig-next").click(); page.wait_for_timeout(200)
    check("es check: errors in Spanish", page.locator("#err-state").inner_text().strip() == ES["choose_state"])
    page.select_option("#elig-state", "TX")
    page.locator("fieldset[data-field='age'] label:has(input[value='yes'])").click()
    page.locator("#elig-next").click(); page.wait_for_timeout(400)
    page.locator("#elig-ft").fill("5"); page.locator("#elig-in").fill("9"); page.locator("#elig-lb").fill("210")
    page.wait_for_timeout(900)
    check("es check: BMI computed", page.locator("#bmi-num").inner_text() == "31.0" and page.locator("#bmi-hint").inner_text() == ES["e_gauge_30"])
    page.screenshot(path=str(OUT / "es-elig-phone.png"))
    page.locator("#elig-next").click(); page.wait_for_timeout(400)
    page.locator("#elig-tool label.check:has(input[value='none'])").click()
    page.locator("fieldset[data-field='mtc'] label:has(input[value='no'])").click()
    page.locator("fieldset[data-field='preg'] label:has(input[value='no'])").click()
    page.locator("#elig-next").click(); page.wait_for_timeout(600)
    check("es check: result in Spanish", page.locator("#res-title").inner_text() == ES["e_likely_title"]
          and page.locator("#res-note").inner_text() == ES["e_note_tx"])

    page.goto(ES_URL, wait_until="networkidle"); page.wait_for_timeout(500)
    page.locator("#chat-launcher").click(); page.wait_for_timeout(600)
    check("es chat: Spanish greeting and labels", "Soy el asistente de IA de Jachi" in page.locator("#chat-log").inner_text()
          and page.locator("#chat-title").inner_text() == "Ayuda de Jachi")
    page.locator("#chat-input").fill("Tengo dolor de pecho ahora"); page.locator("#chat-send").click(); page.wait_for_timeout(500)
    alert = page.locator("#chat-log .msg--alert").last
    check("es chat: Spanish emergency goes straight to 911", alert.inner_text().startswith(ES["c_emergency"][:30]) and alert.locator("a[href='tel:911']").count() == 1)
    page.locator("#chat-input").fill("me quiero morir"); page.locator("#chat-send").click(); page.wait_for_timeout(500)
    alert = page.locator("#chat-log .msg--alert").last
    check("es chat: Spanish crisis gets 988 in Spanish, and the text button starts the message with AYUDA",
          "AYUDA" in alert.inner_text() and alert.locator("a[href='tel:988']").count() == 1
          and alert.locator("a[href='sms:988?&body=AYUDA']").count() == 1)
    page.locator("#chat-input").fill("¿Cuánto cuesta?"); page.locator("#chat-send").click(); page.wait_for_timeout(700)
    check("es chat: AI reply shown with the email linked", "antes de abrir" in page.locator("#chat-log .msg--bot").last.inner_text()
          and page.locator(f"#chat-log .msg--bot a[href='mailto:{EMAIL}']").count() >= 1)
    page.screenshot(path=str(OUT / "es-chat-phone.png"))
    page.locator("#chat .chat__fine [data-ticket]").click(); page.wait_for_timeout(300)
    page.locator("#ticket-submit").click(); page.wait_for_timeout(300)
    check("es ticket: errors in Spanish", page.locator("#err-tname").inner_text().strip() == ES["t_name"])
    page.locator("#chat-close").click(); page.wait_for_timeout(400)
    check("es: no console errors in the flows", not [l for l in logs if "501" not in l[1]], json.dumps(logs))
    ctx.close()

    # 10) Sharing on a computer: no share sheet, so the link is copied
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page, logs = setup(ctx)
    page.add_init_script("delete Navigator.prototype.share; Object.defineProperty(navigator, 'clipboard', { value: { writeText: async t => { window.__copied = t; } } });")
    page.route(f"{BASE}/", lambda r: r.fulfill(status=200, body="ok") if r.request.method == "POST" else r.continue_())
    page.goto(URL + "#join", wait_until="networkidle"); page.wait_for_timeout(400)
    page.locator("#join-email").fill("sam@example.com"); page.select_option("#join-state", "TX")
    page.locator("#join-submit").click(); page.wait_for_timeout(1000)
    check("sign-up with only email and state works", page.locator("#join-success").is_visible()
          and page.locator("#join-success-title").inner_text().startswith("You're on the list."))
    page.locator("#join-share").click(); page.wait_for_timeout(300)
    check("share: copies the link when there's no share sheet", page.evaluate("window.__copied") == "https://www.jachihealth.com/"
          and page.locator("#join-share .btn__label").inner_text() == strings.EN["share_copied_button"]
          and strings.EN["share_copied"] in page.locator("#join-share-status").inner_text())
    page.screenshot(path=str(OUT / "share-copied-desktop.png"))
    page.wait_for_timeout(2700)
    check("share: button label comes back", page.locator("#join-share .btn__label").inner_text() == strings.EN["share_button"])
    check("share: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 11) Service pages
    slugs = [p["slug"] for p in PAGES.PAGES]
    for slug in slugs:
        for w, h in ((390, 844), (1440, 900)):
            ctx = browser.new_context(viewport={"width": w, "height": h}, has_touch=w < 900, is_mobile=w < 900)
            page, logs = setup(ctx)
            page.goto(f"{BASE}/{slug}/", wait_until="networkidle"); page.wait_for_timeout(500)
            ov = page.evaluate(OVERFLOW_JS)
            check(f"/{slug}/ @{w}: no overflow", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
            info = page.evaluate("""() => ({
              h1: document.querySelectorAll('h1').length,
              crumbs: document.querySelectorAll('.crumbs li').length,
              join: [...document.querySelectorAll('a[href*="interest="]')].map(a => a.getAttribute('href')),
              canonical: (document.querySelector('link[rel=canonical]') || {}).href,
              related: [...document.querySelectorAll('.related a')].map(a => a.getAttribute('href')),
              faq: document.querySelectorAll('.faq-item').length,
              ld: [...document.querySelectorAll('script[type="application/ld+json"]')]
                .flatMap(s => { const d = JSON.parse(s.textContent); return (d['@graph'] || [d]).map(n => n['@type']); }),
            })""")
            ok = (info["h1"] == 1 and info["crumbs"] == 3 and len(info["join"]) >= 3 and len(set(info["join"])) == 1
                  and info["canonical"] == f"https://www.jachihealth.com/{slug}/" and len(info["related"]) == 3 and info["faq"] >= 3
                  and info["ld"] == ["Organization", "MedicalWebPage", "BreadcrumbList", "FAQPage"])
            check(f"/{slug}/ @{w}: heading, breadcrumb, sign-up links, canonical, related pages, FAQ and schema", ok, json.dumps(info))
            if w == 1440:
                problems = page.evaluate(STATIC_A11Y_JS)
                check(f"/{slug}/: links, labels and ids valid", not problems, json.dumps(problems))
                for href in info["related"]:
                    status, _h, _b = get(href)
                    if status != 200:
                        check(f"/{slug}/ related link {href} works", False, str(status))
                page.locator(".faq-q").first.click(); page.wait_for_timeout(500)
                check(f"/{slug}/: FAQ opens", page.locator(".faq-q").first.get_attribute("aria-expanded") == "true")
            if slug in ("uti-treatment", "weight-loss", "online-therapy"):
                page.screenshot(path=str(OUT / f"svc-{slug}-{w}.png"), full_page=True, animations="disabled")
            check(f"/{slug}/ @{w}: no console errors", not logs, json.dumps(logs))
            ctx.close()

    # From a service page to the sign-up form with the service chosen
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    page.goto(f"{BASE}/uti-treatment/", wait_until="networkidle"); page.wait_for_timeout(500)
    page.evaluate("window.scrollTo({top: document.querySelector('.conds').getBoundingClientRect().top + scrollY, behavior: 'instant'})"); page.wait_for_timeout(900)
    check("service page phone: bottom bar appears after the hero", page.locator("#dock").evaluate("el => el.classList.contains('is-visible')")
          and page.locator("#dock a").get_attribute("href") == "/?interest=urgent-care"
          and not page.locator("#chat-launcher").is_visible())
    page.screenshot(path=str(OUT / "svc-dock-phone.png"))
    page.locator(".page-hero .btn").first.click(); page.wait_for_load_state("networkidle"); page.wait_for_timeout(1500)
    check("service page CTA: lands on the home sign-up with the service ticked",
          page.locator("input[name='interest'][value='urgent-care']").is_checked() and page.evaluate("location.search") == ""
          and page.evaluate("location.hash") == "#join", page.url)
    check("service page CTA: form in view, keyboard not opened", page.evaluate("document.activeElement.id") == "join-form-title"
          and 0 <= page.evaluate("document.querySelector('.form-card').getBoundingClientRect().top") < 200)
    check("service page CTA: no console errors", not logs, json.dumps(logs))
    ctx.close()
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page, logs = setup(ctx)
    page.goto(f"{BASE}/weight-loss/", wait_until="networkidle"); page.wait_for_timeout(300)
    page.locator(".page-cta .btn").click(); page.wait_for_load_state("networkidle"); page.wait_for_timeout(1500)
    check("weight page CTA (desktop): weight care ticked and email field ready", page.locator("input[name='interest'][value='weight-care']").is_checked()
          and page.evaluate("document.activeElement.id") == "join-email")
    page.goto(URL + "#services", wait_until="networkidle"); page.wait_for_timeout(300)
    page.locator("#svc-skin .svc__link").click(); page.wait_for_load_state("networkidle")
    check("home service card title opens its page", page.url == f"{BASE}/skin-care/", page.url)
    check("service journeys: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 11b) What to expect on every service page
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page, logs = setup(ctx)
    for slug in slugs:
        page.goto(f"{BASE}/{slug}/", wait_until="domcontentloaded")
        exp = page.evaluate("""() => ({
          title: (document.querySelector('#expect-title') || {}).textContent || '',
          items: [...document.querySelectorAll('#expect .expect li h3')].map(h => h.textContent),
          how: !!document.querySelector('#expect a[href="/how-it-works/"]'),
          tops: [...document.querySelectorAll('#expect .expect li h3')].map(h => Math.round(h.getBoundingClientRect().top)),
        })""")
        check(f"/{slug}/: what to expect (visit, tests, follow-up) lines up, with a link to how Jachi works",
              exp["title"].startswith("What to expect") and len(exp["items"]) == 3 and exp["how"]
              and len(set(exp["tops"])) == 1, json.dumps(exp))
    check("what to expect: no console errors", not logs, json.dumps(logs))
    check("what to expect: the Spanish wording (for the app) covers every service page, item for item",
          set(CONTENT_ES.EXPECT) == set(slugs) and all(len(CONTENT_ES.EXPECT[p["slug"]][2]) == len(p["expect"]) for p in PAGES.PAGES))
    ctx.close()

    # 11c) How Jachi works and the Learn guides, in English and Spanish
    content_pages = [CONTENT.HOW["path"], CONTENT_ES.HOW["path"], LEARN.HUB["en"]["path"], LEARN.HUB["es"]["path"]]
    guide_pages = [LEARN.path(a, lang) for lang in ("en", "es") for a in LEARN.ARTICLES]
    content_pages += guide_pages
    pairs = {CONTENT.HOW["path"]: CONTENT_ES.HOW["path"], LEARN.HUB["en"]["path"]: LEARN.HUB["es"]["path"]}
    pairs.update({LEARN.path(a, "en"): LEARN.path(a, "es") for a in LEARN.ARTICLES})
    pairs.update({v: k for k, v in list(pairs.items())})
    LINKS_JS = """() => [...new Set([...document.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href').split('#')[0])
                      .filter(h => h && !h.startsWith('/api/')))]"""
    for path in content_pages:
        lang = "es" if path.startswith("/es/") else "en"
        for w, h in ((390, 844), (1440, 900)):
            ctx = browser.new_context(viewport={"width": w, "height": h}, has_touch=w < 900, is_mobile=w < 900)
            page, logs = setup(ctx)
            page.goto(f"{BASE}{path}", wait_until="networkidle"); page.wait_for_timeout(500)
            ov = page.evaluate(OVERFLOW_JS)
            check(f"{path} @{w}: no overflow", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
            info = page.evaluate("""() => ({
              lang: document.documentElement.lang,
              h1: document.querySelectorAll('h1').length,
              crumbs: document.querySelectorAll('.crumbs li').length,
              canonical: (document.querySelector('link[rel=canonical]') || {}).href,
              alt: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map(l => l.hreflang + ' ' + new URL(l.href).pathname),
              swap: (document.querySelector('.lang-switch') || {}).getAttribute ? document.querySelector('.lang-switch').getAttribute('href') : null,
              ld: [...document.querySelectorAll('script[type="application/ld+json"]')]
                .flatMap(s => { const d = JSON.parse(s.textContent); return (d['@graph'] || [d]).map(n => n['@type']); }),
            })""")
            other = pairs[path]
            ok = (info["lang"] == lang and info["h1"] == 1 and info["canonical"] == f"https://www.jachihealth.com{path}"
                  and f"{lang} {path}" in info["alt"] and any(a.endswith(" " + other) for a in info["alt"])
                  and any(a.startswith("x-default ") for a in info["alt"]) and info["swap"] == other
                  and info["crumbs"] == (3 if path in guide_pages else 2)
                  and "BreadcrumbList" in info["ld"] and "Organization" in info["ld"])
            check(f"{path} @{w}: language, one heading, breadcrumb, canonical, both languages linked, schema", ok, json.dumps(info))
            if w == 1440:
                problems = page.evaluate(STATIC_A11Y_JS)
                check(f"{path}: links, labels and ids valid", not problems, json.dumps(problems))
                bad = [href for href in page.evaluate(LINKS_JS) if status_of(href) != 200]
                check(f"{path}: every link on the page works", not bad, str(bad))
                if page.locator(".faq-q").count():
                    page.locator(".faq-q").first.click(); page.wait_for_timeout(500)
                    check(f"{path}: FAQ opens", page.locator(".faq-q").first.get_attribute("aria-expanded") == "true")
                out = page.evaluate("[...document.querySelectorAll('a[href^=http]')].filter(a => !a.closest('footer')).map(a => [a.href, a.relList.contains('noreferrer')])")
                check(f"{path}: outside links are https and don't pass on where you came from",
                      all(u.startswith("https://") and r for u, r in out), json.dumps(out[:6]))
            if w == 390:
                page.screenshot(path=str(OUT / f"content{path.strip('/').replace('/', '-')}-390.png"), full_page=True)
            check(f"{path} @{w}: no console errors", not logs, json.dumps(logs))
            ctx.close()

    # How Jachi works: seven steps in two lanes, who does what, and the phone bar after the hero
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    page.goto(f"{BASE}/how-it-works/", wait_until="networkidle"); page.wait_for_timeout(500)
    how = page.evaluate("""() => ({
      steps: [...document.querySelectorAll('.lane__steps li h4')].map(h => h.textContent),
      lanes: [...document.querySelectorAll('.lane .lane__who')].map(p => p.textContent),
      roles: [...document.querySelectorAll('.role .role__who')].map(p => p.textContent),
      join: [...document.querySelectorAll('main a.btn')].filter(a => /waitlist/i.test(a.textContent)).map(a => a.getAttribute('href')),
      notOpen: (document.querySelector('.note-box') || {}).textContent || '',
    })""")
    check("how it works: seven steps, on Jachi then with the medical group", len(how["steps"]) == 7
          and how["lanes"] == ["On Jachi", "With the medical group"] and how["roles"] == ["Jachi Health LLC", "The medical group"], json.dumps(how))
    check("how it works: says Jachi isn't open yet, and every waitlist button goes to the sign-up", "isn't open yet" in how["notOpen"]
          and how["join"] and set(how["join"]) == {"/#join"}, json.dumps(how))
    page.evaluate("window.scrollTo({top: document.querySelector('.lanes').getBoundingClientRect().top + scrollY, behavior: 'instant'})"); page.wait_for_timeout(900)
    check("how it works (phone): bottom bar appears after the hero", page.locator("#dock").evaluate("el => el.classList.contains('is-visible')")
          and page.locator("#dock a").get_attribute("href") == "/#join")
    page.locator(".page-top .cta-row .btn").first.click(); page.wait_for_load_state("networkidle"); page.wait_for_timeout(1300)
    check("how it works: waitlist button lands on the home page form", page.evaluate("location.pathname") == "/"
          and page.evaluate("location.hash") == "#join", page.url)
    page.goto(f"{BASE}/es/como-funciona/", wait_until="networkidle"); page.wait_for_timeout(300)
    es_how = page.evaluate("[...document.querySelectorAll('main a.btn')].filter(a => /lista de espera/i.test(a.textContent)).map(a => a.getAttribute('href'))")
    check("cómo funciona: the Spanish page's waitlist buttons go to the Spanish sign-up", es_how and set(es_how) == {"/es/#join"}, str(es_how))
    check("how it works pages: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # Learn: the hub lists every guide, guides cite their sources, and the home pages link to them
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page, logs = setup(ctx)
    for lang in ("en", "es"):
        hub = LEARN.HUB[lang]["path"]
        page.goto(f"{BASE}{hub}", wait_until="domcontentloaded")
        listed = page.evaluate("[...document.querySelectorAll('.guide__link')].map(a => a.getAttribute('href'))")
        check(f"{hub}: lists every guide", listed == [LEARN.path(a, lang) for a in LEARN.ARTICLES], str(listed))
        for a in LEARN.ARTICLES:
            path = LEARN.path(a, lang)
            page.goto(f"{BASE}{path}", wait_until="domcontentloaded")
            g = page.evaluate("""() => ({
              sources: [...document.querySelectorAll('.sources a')].map(x => x.href),
              join: (document.querySelector('.article__aside .btn') || {}).getAttribute ? document.querySelector('.article__aside .btn').getAttribute('href') : '',
              more: [...document.querySelectorAll('.guides .guide__link')].map(x => x.getAttribute('href')),
              tel: [...document.querySelectorAll('.article__aside a[href^="tel:"]')].map(x => x.getAttribute('href')),
              time: (document.querySelector('.meta time') || {}).getAttribute ? document.querySelector('.meta time').getAttribute('datetime') : '',
            })""")
            check(f"{path}: sources, waitlist box, 911 and 988, two more guides, date", len(g["sources"]) >= 2
                  and g["join"] == a[lang]["cta"]["join"] and g["tel"] == ["tel:911", "tel:988"] and len(g["more"]) == 2
                  and path not in g["more"] and g["time"] == LEARN.UPDATED, json.dumps(g))
        where = LEARN.path(next(x for x in LEARN.ARTICLES if x["key"] == "where"), lang)
        page.goto(f"{BASE}{where}", wait_until="domcontentloaded")
        calls = page.evaluate("[...document.querySelectorAll('.prose .callout a')].map(a => a.getAttribute('href'))")
        text_988 = "sms:988" if lang == "en" else "sms:988?&body=AYUDA"
        check(f"{where}: the warning signs offer 911, and the crisis box 988 by call and text", calls == ["tel:911", "tel:988", text_988], str(calls))
    page.goto(URL, wait_until="domcontentloaded")
    home_guides = page.evaluate("[...document.querySelectorAll('#learn .guide__link')].map(a => a.getAttribute('href'))")
    check("home: the Learn section links to every guide", home_guides == [LEARN.path(a, "en") for a in LEARN.ARTICLES], str(home_guides))
    check("footer links to how Jachi works and the guides", page.locator("footer a[href='/how-it-works/']").count() == 1
          and page.locator("footer a[href='/learn/']").count() == 1)
    page.goto(ES_URL, wait_until="domcontentloaded")
    es_guides = page.evaluate("[...document.querySelectorAll('#learn .guide__link')].map(a => a.getAttribute('href'))")
    check("es home: the Learn section links to the Spanish guides", es_guides == [LEARN.path(a, "es") for a in LEARN.ARTICLES], str(es_guides))
    check("es footer links to cómo funciona and the Spanish guides", page.locator("footer a[href='/es/como-funciona/']").count() == 1
          and page.locator("footer a[href='/es/guias/']").count() == 1)
    check("learn pages: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 12) Legal pages
    for slug, must in (("privacy", ["What we collect", "Who we share it with", "Netlify", "Anthropic", EMAIL]),
                       ("terms", ["Not medical advice", "call 911", "Tarrant County"]),
                       ("texas-medical-board", ["NOTICE CONCERNING COMPLAINTS", "1801 Congress Avenue, Suite 9.200", "P.O. Box 2018",
                                                "Austin, Texas 78768-2018", "1-800-201-9353", "www.tmb.state.tx.us"])):
        for w, h in ((390, 844), (1440, 900)):
            ctx = browser.new_context(viewport={"width": w, "height": h}, has_touch=w < 900, is_mobile=w < 900)
            page, logs = setup(ctx)
            page.goto(f"{BASE}/{slug}/", wait_until="networkidle"); page.wait_for_timeout(400)
            ov = page.evaluate(OVERFLOW_JS)
            text = page.locator("main").inner_text()
            check(f"/{slug}/ @{w}: no overflow, one heading, key text present", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"]
                  and page.locator("h1").count() == 1 and all(m in text for m in must), json.dumps([ov["offenders"], [m for m in must if m not in text]]))
            check(f"/{slug}/ @{w}: no console errors", not logs, json.dumps(logs))
            if w == 390:
                page.screenshot(path=str(OUT / f"legal-{slug}-390.png"), full_page=True)
            ctx.close()

    # 12b) No prices anywhere until the owner has a quote (terms keep their $100 liability cap)
    import re as _re
    priced = []
    for f in sorted((ROOT / "public").rglob("*.html")):
        rel = "/" + str(f.relative_to(ROOT / "public"))
        if rel == "/terms/index.html":
            continue
        if _re.search(r"\$\s?\d", f.read_text()):
            priced.append(rel)
    chat_src = (ROOT / "netlify" / "functions" / "chat.mjs").read_text()
    check("no prices on any page or in the assistant's instructions", not priced and not _re.search(r"\$\s?\d", chat_src)
          and "Prices aren't set yet" in chat_src, str(priced))
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page, logs = setup(ctx)
    page.goto(URL + "#services", wait_until="networkidle"); page.wait_for_timeout(300)
    check("services say prices come before opening", PRICING_NOTE in page.locator("#included").inner_text())
    page.goto(f"{BASE}/weight-loss/", wait_until="networkidle"); page.wait_for_timeout(300)
    glance = page.locator(".glance").inner_text()
    check("service page summary: service, kind of care, no price", "Weight care" in glance and "Ongoing care" in glance
          and PRICING_NOTE in glance and "$" not in glance, glance)
    check("no prices: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 13) Search engine files and fonts
    status, headers, body = get("/sitemap.xml")
    sm = body.decode()
    missing = [u for u in ["/", "/es/", "/privacy/", "/terms/", "/texas-medical-board/"] + [f"/{s}/" for s in slugs] + content_pages
               if f"<loc>https://www.jachihealth.com{u}</loc>" not in sm]
    check("sitemap lists every page, with the Spanish alternate", not missing and 'hreflang="es"' in sm, str(missing))
    # Structured data, titles and descriptions on every page search engines see
    indexable = ["/", "/es/", "/privacy/", "/terms/", "/texas-medical-board/"] + [f"/{s}/" for s in slugs] + content_pages
    nodes_by_page, sd_problems, meta_problems = {}, [], []
    for u in indexable:
        h = (ROOT / "public" / u.strip("/") / "index.html").read_text()
        try:
            blocks = [json.loads(x) for x in re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S)]
        except ValueError as err:
            sd_problems.append(f"{u}: invalid JSON-LD ({err})"); continue
        nodes = [n for b in blocks for n in b.get("@graph", [b])]
        nodes_by_page[u] = nodes
        if any(b.get("@context") != "https://schema.org" for b in blocks):
            sd_problems.append(f"{u}: missing @context")
        for n in nodes:
            if n.get("@type") == "BreadcrumbList" and any("#" in e["item"] for e in n["itemListElement"]):
                sd_problems.append(f"{u}: breadcrumb step that is only an anchor")
        title = html.unescape(re.search(r"<title>(.*?)</title>", h).group(1))
        desc = html.unescape(re.search(r'<meta name="description" content="([^"]*)"', h).group(1))
        if len(title) > 65 or len(desc) > 160 or len(desc) < 50:
            meta_problems.append(f"{u}: title {len(title)}, description {len(desc)}")
    site_ids = {n["@id"] for n in nodes_by_page.get("/", []) if "@id" in n}
    for u, nodes in nodes_by_page.items():
        known = site_ids | {n["@id"] for n in nodes if "@id" in n}
        refs = re.findall(r'\{"@id": "([^"]+)"\}', json.dumps(nodes))
        sd_problems += [f"{u}: {r} isn't defined" for r in refs if r not in known]
    home_types = [[n.get("@type") for n in nodes_by_page.get(u, [])] for u in ("/", "/es/")]
    service_ok = all(any(n.get("@type") == "MedicalWebPage" and n.get("about") for n in nodes_by_page[f"/{s}/"]) for s in slugs)
    check("structured data: valid, connected, organization and website on both home pages, conditions on service pages",
          not sd_problems and all(t == ["Organization", "WebSite", "WebPage"] for t in home_types) and service_ok,
          json.dumps(sd_problems[:6] + home_types))
    check("search titles fit (65 characters) and descriptions fit (50 to 160)", not meta_problems, json.dumps(meta_problems))
    home_html = (ROOT / "public" / "index.html").read_text()
    check("only the two main fonts are preloaded (the italic waits, so the page paints sooner)",
          len(re.findall(r'rel="preload"[^>]*as="font"', home_html)) == 2 and "fraunces-italic" not in
          "".join(re.findall(r'<link rel="preload"[^>]*>', home_html)))
    font_file = next((ROOT / "public" / "fonts").glob("fraunces.*.woff2")).name
    status, headers, body = get(f"/fonts/{font_file}")
    check("fonts are served by the site with a long cache", status == 200 and "immutable" in headers.get("Cache-Control", ""), str(dict(headers)))
    ctx = browser.new_context(viewport={"width": 390, "height": 844})
    page, logs = setup(ctx)
    page.goto(URL, wait_until="networkidle"); page.wait_for_timeout(500)
    fonts_ok = page.evaluate("document.fonts.ready.then(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.style))")
    check("brand fonts load from the site", any("Fraunces" in f for f in fonts_ok) and any("Instrument Sans" in f for f in fonts_ok), str(fonts_ok))
    ctx.close()

    # 14) Accounts: from the waitlist form to a confirmed account, then update, password, log out, reset, delete
    A = strings.EN
    def view(page):
        return page.evaluate("[...document.querySelectorAll('[data-view]')].filter(v => !v.hidden).map(v => v.dataset.view).join()")
    def expected_http_errors(logs):
        # Wrong passwords (400), unknown emails (404), refused admin access (403) and an invited account confirming
        # before choosing a password (422) are answers the pages handle; Chrome logs them anyway.
        return [l for l in logs if not any(f"status of {c}" in l[1] for c in (400, 401, 403, 404, 422))]

    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    page.goto(f"{BASE}/account/", wait_until="networkidle"); page.wait_for_timeout(500)
    check("account page: says accounts aren't open yet while Identity is off", view(page) == "off"
          and page.locator("[data-view=off] a[href='/#join']").count() == 1)
    page.goto(f"{BASE}/admin/", wait_until="networkidle"); page.wait_for_timeout(500)
    check("admin: explains how to turn accounts on while Identity is off", view(page) == "off" and "Enable Identity" in page.locator("[data-view=off]").inner_text())
    check("accounts off: no unexpected console errors", not expected_http_errors(logs), json.dumps(logs))
    ctx.close()

    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    fake = FakeIdentity()
    fake.attach(page)
    page.route(f"{BASE}/", lambda r: r.fulfill(status=200, body="ok") if r.request.method == "POST" else r.continue_())
    page.goto(URL + "#join", wait_until="networkidle"); page.wait_for_timeout(400)
    page.locator("#join-email").fill("maya@example.com"); page.select_option("#join-state", "TX")
    page.locator("#join-form label.check:has(input[value='therapy'])").click()
    page.locator("#join-submit").click(); page.wait_for_timeout(1200)
    check("join success offers an account once accounts are on", page.locator("#join-account").is_visible())
    page.screenshot(path=str(OUT / "join-account-offer-phone.png"))
    page.locator("#join-account-link").click(); page.wait_for_load_state("networkidle"); page.wait_for_timeout(600)
    check("account offer opens Create account, filled in from the form", page.url == f"{BASE}/account/?create" and view(page) == "auth"
          and page.locator("#tab-create").get_attribute("aria-selected") == "true" and page.locator("#create-email").input_value() == "maya@example.com"
          and page.locator("#create-state").input_value() == "TX" and page.locator("#create-form input[value='therapy']").is_checked())
    check("account page is in English and not indexed", page.evaluate("document.documentElement.lang") == "en"
          and page.locator("meta[name=robots][content=noindex]").count() == 1 and page.locator("link[rel=canonical]").count() == 0)
    page.locator("#create-submit").click(); page.wait_for_timeout(300)
    check("create account: asks for a password", page.locator("#err-create-password").is_visible()
          and page.evaluate("document.activeElement.id") == "create-password")
    page.locator("#create-password").fill("short"); page.locator("#create-submit").click(); page.wait_for_timeout(300)
    check("create account: password needs 8 characters", page.locator("#err-create-password").inner_text().strip() == A["a_err_password_short"])
    page.locator("#create-form .pw__toggle").click()
    check("password can be shown", page.locator("#create-password").get_attribute("type") == "text"
          and page.locator("#create-form .pw__toggle").get_attribute("aria-pressed") == "true")
    page.locator("#create-password").fill("garden-path-42"); page.locator("#create-submit").click(); page.wait_for_timeout(800)
    user = fake.users.get("maya@example.com")
    check("create account: check-your-email screen", view(page) == "sent" and "maya@example.com" in page.locator("#sent-body").inner_text()
          and "no-reply@netlify.com" in page.locator("#sent-from").inner_text())
    check("create account: saved unconfirmed, with state, services, language and emails on", user and user["confirmed_at"] is None
          and user["user_metadata"] == {"state": "TX", "interests": ["therapy"], "language": "en", "updates": True}, json.dumps(user and user["user_metadata"]))
    page.screenshot(path=str(OUT / "account-sent-phone.png"))
    page.locator("[data-view=sent] [data-go=login]").click(); page.wait_for_timeout(300)
    page.locator("#login-email").fill("maya@example.com"); page.locator("#login-password").fill("garden-path-42")
    page.locator("#login-submit").click(); page.wait_for_timeout(600)
    check("log in before confirming: explains what to do", A["a_e_unconfirmed"] in page.locator("#login-status").inner_text())

    token = fake.last_link("confirmation")
    page.goto(f"{BASE}/#confirmation_token={token}"); page.wait_for_load_state("networkidle"); page.wait_for_timeout(1200)
    check("confirmation link on the home page lands on the account, confirmed and logged in", page.url == f"{BASE}/account/"
          and view(page) == "profile" and A["a_confirmed"] in page.locator("#profile-status").inner_text()
          and "maya@example.com" in page.locator("#who").inner_text(), page.url)
    check("profile shows the saved details", page.locator("#profile-state").input_value() == "TX"
          and page.locator("#profile-form input[value='therapy']").is_checked() and page.locator("#profile-form input[name=language][value=en]").is_checked()
          and page.locator("#profile-updates").is_checked())
    page.screenshot(path=str(OUT / "account-profile-phone.png"), full_page=True)
    page.select_option("#profile-state", "CA")
    page.locator("#profile-form label:has(input[value='therapy'])").click()
    page.locator("#profile-form label:has(input[value='anxiety-depression'])").click()
    page.locator("#profile-form .seg label:has(input[value=es])").click()
    page.locator("label[for=profile-updates]").click()
    page.locator("#profile-submit").click(); page.wait_for_timeout(600)
    check("profile: changes saved, including turning emails off", A["a_saved"] in page.locator("#profile-status").inner_text()
          and fake.users["maya@example.com"]["user_metadata"] == {"state": "CA", "interests": ["anxiety-depression"], "language": "es", "updates": False},
          json.dumps(fake.users["maya@example.com"]["user_metadata"]))
    page.locator("#password-open").click(); page.wait_for_timeout(200)
    check("change password: form opens with the field ready", page.locator("#password-form").is_visible() and page.evaluate("document.activeElement.id") == "new-password")
    page.locator("#new-password").fill("new-garden-77"); page.locator("#password-submit").click(); page.wait_for_timeout(600)
    check("change password: saved", A["a_password_saved"] in page.locator("#password-status").inner_text()
          and fake.users["maya@example.com"]["_password"] == "new-garden-77" and page.locator("#password-form").is_hidden())
    page.locator("#logout").click(); page.wait_for_timeout(600)
    check("log out: back to log in, session gone", view(page) == "auth" and A["a_logged_out"] in page.locator("#login-status").inner_text()
          and page.evaluate("localStorage.getItem('jachi.session')") is None)
    page.locator("#login-email").fill("maya@example.com"); page.locator("#login-password").fill("garden-path-42")
    page.locator("#login-submit").click(); page.wait_for_timeout(600)
    check("log in: old password refused", A["a_e_invalid_login"] in page.locator("#login-status").inner_text() and view(page) == "auth")
    page.locator("#login-password").fill("new-garden-77"); page.locator("#login-submit").click(); page.wait_for_timeout(700)
    check("log in: new password works", view(page) == "profile")
    page.locator("#logout").click(); page.wait_for_timeout(500)

    page.locator("#login-email").fill("maya@example.com")
    page.locator("[data-view=auth] [data-go=forgot]").click(); page.wait_for_timeout(300)
    check("forgot password: email carried over", view(page) == "forgot" and page.locator("#forgot-email").input_value() == "maya@example.com")
    page.locator("#forgot-email").fill("nobody@example.com"); page.locator("#forgot-submit").click(); page.wait_for_timeout(600)
    unknown_text = page.locator("#sent-body").inner_text()
    check("forgot password: same answer for an unknown email", view(page) == "sent" and "nobody@example.com" in unknown_text and not fake.last_link("recovery"))
    page.locator("[data-view=sent] [data-go=login]").click(); page.locator("[data-view=auth] [data-go=forgot]").click()
    page.locator("#forgot-email").fill("maya@example.com"); page.locator("#forgot-submit").click(); page.wait_for_timeout(600)
    check("forgot password: reset email sent", view(page) == "sent" and fake.last_link("recovery") is not None)
    page.goto(f"{BASE}/#recovery_token={fake.last_link('recovery')}"); page.wait_for_load_state("networkidle"); page.wait_for_timeout(1200)
    check("reset link lands on choose-a-new-password", page.url == f"{BASE}/account/" and view(page) == "reset")
    page.locator("#reset-password").fill("third-garden-55"); page.locator("#reset-submit").click(); page.wait_for_timeout(700)
    check("reset: new password saved and logged in", view(page) == "profile" and A["a_password_saved"] in page.locator("#profile-status").inner_text()
          and fake.users["maya@example.com"]["_password"] == "third-garden-55")
    page.goto(f"{BASE}/account/?from=email#confirmation_token=used-or-made-up"); page.wait_for_timeout(1200)
    check("an expired or used link explains itself, token cleared from the address", view(page) == "link" and "#" not in page.url, page.url)
    page.goto(f"{BASE}/account/", wait_until="networkidle"); page.wait_for_timeout(700)
    check("returning to the account page keeps you logged in", view(page) == "profile")
    page.locator("#delete-open").click(); page.wait_for_timeout(200)
    check("delete: asks first", page.locator("#delete-confirm").is_visible() and page.evaluate("document.activeElement.id") == "delete-warn")
    page.locator("#delete-no").click(); page.wait_for_timeout(200)
    check("delete: cancel keeps everything", page.locator("#delete-confirm").is_hidden() and page.evaluate("document.activeElement.id") == "delete-open"
          and "maya@example.com" in fake.users)
    page.locator("#delete-open").click(); page.locator("#delete-yes").click(); page.wait_for_timeout(900)
    check("delete: account and sign-ups gone, session cleared", view(page) == "deleted" and fake.deleted == ["maya@example.com"]
          and A["a_deleted_done"] in page.locator("#deleted-body").inner_text() and page.evaluate("localStorage.getItem('jachi.session')") is None)
    page.screenshot(path=str(OUT / "account-deleted-phone.png"))
    ov = page.evaluate(OVERFLOW_JS)
    check("account page: no overflow on a phone", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
    check("accounts (phone): no unexpected console errors", not expected_http_errors(logs), json.dumps(logs))
    ctx.close()

    # The account page in Spanish, at every size
    for w, h in ((360, 740), (768, 1024), (1440, 900)):
        ctx = browser.new_context(viewport={"width": w, "height": h}, has_touch=w < 900, is_mobile=w < 900)
        page, logs = setup(ctx)
        fake = FakeIdentity()
        fake.attach(page)
        page.goto(f"{BASE}/es/account/?create", wait_until="networkidle"); page.wait_for_timeout(600)
        ov = page.evaluate(OVERFLOW_JS)
        check(f"es account @{w}: Spanish, no overflow", page.evaluate("document.documentElement.lang") == "es"
              and page.locator("#tab-create").inner_text() == ES["a_tab_create"] and ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
        if w == 1440:
            problems = page.evaluate(STATIC_A11Y_JS)
            check("es account: labels, names and ids valid", not problems, json.dumps(problems))
            check("es account: language switch stays on the account page", page.locator(".lang-switch").get_attribute("href") == "/account/")
            page.locator("#create-email").fill("ana@example.com"); page.locator("#create-password").fill("jardin-123")
            page.select_option("#create-state", "TX"); page.locator("#create-submit").click(); page.wait_for_timeout(700)
            check("es account: created in Spanish, check-your-email in Spanish", view(page) == "sent"
                  and fake.users["ana@example.com"]["user_metadata"]["language"] == "es" and "Enviamos un enlace" in page.locator("#sent-body").inner_text())
            page.goto(f"{BASE}/#confirmation_token={fake.last_link('confirmation')}"); page.wait_for_load_state("networkidle"); page.wait_for_timeout(1300)
            check("es account: the confirmation link comes back to the Spanish page", page.url == f"{BASE}/es/account/"
                  and view(page) == "profile" and ES["a_confirmed"] in page.locator("#profile-status").inner_text(), page.url)
            page.screenshot(path=str(OUT / "es-account-desktop.png"), full_page=True)
        check(f"es account @{w}: no console errors", not expected_http_errors(logs), json.dumps(logs))
        ctx.close()

    # Desktop account page: tabs by keyboard, a11y and invite-only mode
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page, logs = setup(ctx)
    fake = FakeIdentity(disable_signup=True)
    fake.attach(page)
    page.goto(f"{BASE}/account/", wait_until="networkidle"); page.wait_for_timeout(600)
    problems = page.evaluate(STATIC_A11Y_JS)
    check("account page: labels, names and ids valid", not problems, json.dumps(problems))
    check("invite-only: no Create account tab", page.locator("#tab-create").is_hidden() and view(page) == "auth")
    page.screenshot(path=str(OUT / "account-desktop.png"))
    ctx.close()
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page, logs = setup(ctx)
    fake = FakeIdentity()
    fake.attach(page)
    page.goto(f"{BASE}/account/", wait_until="networkidle"); page.wait_for_timeout(600)
    page.locator("#tab-login").focus(); page.keyboard.press("ArrowRight")
    check("tabs: arrow keys switch to Create account", page.locator("#tab-create").get_attribute("aria-selected") == "true"
          and page.evaluate("document.activeElement.id") == "tab-create" and page.locator("#panel-create").is_visible() and page.locator("#panel-login").is_hidden())
    invite = fake.invite("lee@example.com")
    page.goto(f"{BASE}/#invite_token={invite}"); page.wait_for_load_state("networkidle"); page.wait_for_timeout(1000)
    check("invite link: choose a password", view(page) == "invite")
    page.locator("#invite-password").fill("lee-password-1"); page.locator("#invite-submit").click(); page.wait_for_timeout(700)
    check("invite: accepted and logged in", view(page) == "profile" and fake.users["lee@example.com"]["confirmed_at"] is not None
          and fake.users["lee@example.com"]["_password"] == "lee-password-1")
    change = fake.email_change("lee@example.com", "lee.new@example.com")
    page.locator("#logout").click(); page.wait_for_timeout(500)
    page.goto(f"{BASE}/#email_change_token={change}"); page.wait_for_load_state("networkidle"); page.wait_for_timeout(1000)
    check("email-change link while logged out: asks to log in first", view(page) == "auth"
          and A["a_email_change_login"] in page.locator("#login-status").inner_text() and "#" not in page.url, page.url)
    page.locator("#login-email").fill("lee@example.com"); page.locator("#login-password").fill("lee-password-1")
    page.locator("#login-submit").click(); page.wait_for_timeout(700)
    page.goto(f"{BASE}/#email_change_token={change}"); page.wait_for_load_state("networkidle"); page.wait_for_timeout(1000)
    check("email-change link once logged in: email updated", view(page) == "profile"
          and A["a_email_changed"] in page.locator("#profile-status").inner_text() and "lee.new@example.com" in page.locator("#who").inner_text())
    page.locator("#logout").click(); page.wait_for_timeout(500)
    invite = fake.invite("kim@example.com")
    page.goto(f"{BASE}/account/?create", wait_until="networkidle"); page.wait_for_timeout(500)
    page.locator("#create-email").fill("kim@example.com"); page.locator("#create-password").fill("kim-own-pass-1")
    page.select_option("#create-state", "TX"); page.locator("#create-submit").click(); page.wait_for_timeout(700)
    check("invited, then signed up again: still no password, the invitation link replaced", view(page) == "sent"
          and fake.users["kim@example.com"]["_password"] is None and invite not in fake.links)
    page.goto(f"{BASE}/#confirmation_token={fake.last_link('confirmation')}"); page.wait_for_load_state("networkidle"); page.wait_for_timeout(1000)
    check("its confirmation link asks for a password, like the invitation", view(page) == "invite")
    page.locator("#invite-password").fill("kim-password-1"); page.locator("#invite-submit").click(); page.wait_for_timeout(700)
    check("password chosen: confirmed and logged in", view(page) == "profile" and fake.users["kim@example.com"]["confirmed_at"] is not None
          and fake.users["kim@example.com"]["_password"] == "kim-password-1")
    check("account desktop: no console errors", not expected_http_errors(logs), json.dumps(logs))
    ran = page.evaluate("""() => { window.__injected = 0; const s = document.createElement('script'); s.textContent = 'window.__injected = 1';
        document.body.appendChild(s); return window.__injected; }""")
    check("account page: only its own scripts can run (injected ones are blocked)", ran == 0
          and page.locator("meta[http-equiv=Content-Security-Policy]").count() == 1)
    ctx.close()

    # 15) Admin console
    def admin_fake(page):
        f = FakeIdentity()
        f.attach(page)
        f.add_user("support@jachihealth.com", "admin-pass-1", confirmed=True, invited=True)
        f.add_user("maya@example.com", "maya-pass-1", confirmed=True,
                   metadata={"state": "TX", "interests": ["therapy"], "language": "es", "updates": False})
        f.add_signup("maya@example.com", name="Maya", state="TX", interest="therapy", language="es", created_at="2026-10-13T10:00:00Z")
        f.add_signup("sam@example.com", name="Sam", state="CA", interest="urgent-care, skin-care", created_at="2026-10-14T10:00:00Z")
        f.add_signup("=cmd@evil.example", name='=HYPERLINK("http://x")', state="TX", created_at="2026-10-15T10:00:00Z")
        f.add_ticket("ana@example.com", name="Ana <b>bold</b>", topic="Waitlist", message="When will you open in Dallas?",
                     transcript="Visitor: hi\n\nAssistant: hello")
        f.add_ticket("sam@example.com", name="Sam", topic="Website problem", message="The form didn't load.")
        f.add_ticket("x@y.com?cc=z%40evil.example&subject=hi.com", name="Odd", message="hello", created_at="2026-10-12T09:00:00Z")
        return f

    for w, h in ((390, 844), (1440, 900)):
        ctx = browser.new_context(viewport={"width": w, "height": h}, has_touch=w < 900, is_mobile=w < 900, accept_downloads=True)
        page, logs = setup(ctx)
        fake = admin_fake(page)
        page.goto(f"{BASE}/admin/", wait_until="networkidle"); page.wait_for_timeout(500)
        check(f"admin @{w}: asks to log in, not indexed", view(page) == "login" and page.locator("meta[name=robots][content=noindex]").count() == 1)
        page.locator("#adm-login-email").fill("maya@example.com"); page.locator("#adm-login-password").fill("maya-pass-1")
        page.locator("#adm-login-submit").click(); page.wait_for_timeout(1000)
        check(f"admin @{w}: an ordinary account is turned away", view(page) == "denied" and "isn't an admin" in page.locator("#adm-denied-text").inner_text())
        page.locator("[data-view=denied] [data-logout]").click(); page.wait_for_timeout(500)
        page.locator("#adm-login-email").fill("support@jachihealth.com"); page.locator("#adm-login-password").fill("admin-pass-1")
        page.locator("#adm-login-submit").click(); page.wait_for_timeout(1200)
        check(f"admin @{w}: console opens for the admin", view(page) == "console" and page.locator("#adm-email").inner_text() == "support@jachihealth.com"
              and page.locator("#n-signups").inner_text() == "3" and page.locator("#n-tickets").inner_text() == "3" and page.locator("#n-members").inner_text() == "2")
        check(f"admin @{w}: overview counts people still getting emails", page.locator(".ov__num").inner_text() == "2"
              and page.locator(".bars li").count() == 12, page.locator(".ov__num").inner_text())
        page.screenshot(path=str(OUT / f"admin-overview-{w}.png"), full_page=True)
        ov = page.evaluate(OVERFLOW_JS)
        check(f"admin @{w}: no overflow", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
        if w == 1440:
            problems = page.evaluate(STATIC_A11Y_JS.replace("if (h1 !== 1) problems.push('h1 count ' + h1);", ""))
            check("admin: labels, names and ids valid", not problems, json.dumps(problems))
        page.locator("#tab-signups").click(); page.wait_for_timeout(300)
        rows = page.locator("#signups-list .row")
        check(f"admin @{w}: one row per person, admins left out", rows.count() == 3 and "support@jachihealth.com" not in page.locator("#signups-list").inner_text())
        check(f"admin @{w}: account and emails-off badges", page.locator("#signups-list .row[data-email='maya@example.com'] .badge--off").count() == 1)
        page.locator("#f-q").fill("sam"); page.wait_for_timeout(200)
        check(f"admin @{w}: search", rows.count() == 1 and "Showing 1 of 3" in page.locator("#signups-count").inner_text())
        page.locator("#f-q").fill(""); page.select_option("#f-emails", "off"); page.wait_for_timeout(200)
        check(f"admin @{w}: filter by emails off", rows.count() == 1 and page.locator("#signups-list .row").first.get_attribute("data-email") == "maya@example.com")
        page.select_option("#f-emails", ""); page.select_option("#f-service", "skin-care"); page.wait_for_timeout(200)
        check(f"admin @{w}: filter by service", rows.count() == 1 and page.locator("#signups-list .row").first.get_attribute("data-email") == "sam@example.com")
        page.select_option("#f-service", "")
        with page.expect_download() as dl:
            page.locator("#csv").click()
        csv_text = Path(dl.value.path()).read_text(encoding="utf-8-sig")
        check(f"admin @{w}: CSV download, safe from spreadsheet formulas", csv_text.startswith('"email","first_name","state","services","language","joined","account","emails"')
              and all(line.startswith('"') and line.endswith('"') for line in csv_text.strip().split("\r\n"))
              and "'=cmd@evil.example" in csv_text and '"\'=HYPERLINK(""http://x"")"' in csv_text and "maya@example.com" in csv_text
              and dl.value.suggested_filename.startswith("jachi-waitlist-"), csv_text[:400])
        page.locator("#tab-tickets").click(); page.wait_for_timeout(300)
        check(f"admin @{w}: tickets show what people typed, never as page code", page.locator("#tickets-list b").count() == 0
              and "Ana <b>bold</b>" in page.locator("#tickets-list").inner_text())
        check(f"admin @{w}: reply by email", page.locator("#tickets-list a[href^='mailto:ana@example.com?subject=Re%3A%20Waitlist']").count() == 1)
        check(f"admin @{w}: no reply link for an address that could add cc or subject", page.locator("#tickets-list a[href*='evil']").count() == 0
              and "x@y.com?cc=" in page.locator("#tickets-list").inner_text() and page.locator("#tickets-list a[href^='mailto:']").count() == 2)
        page.locator("#tickets-list .row").first.locator("[data-delete-ticket]").click(); page.wait_for_timeout(200)
        page.locator("#tickets-list .row").first.locator("[data-yes]").click(); page.wait_for_timeout(600)
        check(f"admin @{w}: delete a ticket", len(fake.tickets) == 2 and page.locator("#tickets-list .row").count() == 2
              and "Ticket deleted" in page.locator("#adm-status").inner_text() and page.locator("#n-tickets").inner_text() == "2")
        page.locator("#tab-signups").click(); page.wait_for_timeout(200)
        page.locator("#signups-list .row[data-email='maya@example.com'] [data-erase]").click(); page.wait_for_timeout(200)
        page.locator("#signups-list .row[data-email='maya@example.com'] [data-no]").click(); page.wait_for_timeout(200)
        check(f"admin @{w}: erase can be cancelled", "maya@example.com" in fake.users and page.locator("#signups-list .row").count() == 3)
        page.locator("#signups-list .row[data-email='maya@example.com'] [data-erase]").click(); page.wait_for_timeout(200)
        page.locator("#signups-list .row[data-email='maya@example.com'] [data-yes]").click(); page.wait_for_timeout(700)
        check(f"admin @{w}: erase removes the person's sign-ups and account", "maya@example.com" not in fake.users
              and not [x for x in fake.signups if x["email"] == "maya@example.com"] and page.locator("#signups-list .row").count() == 2
              and "Erased everything for maya@example.com" in page.locator("#adm-status").inner_text())
        page.locator("#tab-members").click(); page.wait_for_timeout(200)
        check(f"admin @{w}: your own account can't be deleted here", page.locator("#members-list .row").count() == 1
              and page.locator("#members-list [data-delete-member]").count() == 0 and "You" in page.locator("#members-list .badge").first.inner_text())
        page.locator("#tab-checklist").click(); page.wait_for_timeout(200)
        page.locator("#check-list label:has(input[data-item='quote'])").click(); page.wait_for_timeout(900)
        saved = fake.users["support@jachihealth.com"]["user_metadata"].get("checklist", {})
        check(f"admin @{w}: launch checklist saves to the admin account", saved.get("done", {}).get("quote") is True
              and "1 of 10 done" in page.locator("#check-progress").inner_text(), json.dumps(saved))
        page.locator("#check-new").fill("Order business cards"); page.locator("#check-add button").click(); page.wait_for_timeout(900)
        saved = fake.users["support@jachihealth.com"]["user_metadata"].get("checklist", {})
        check(f"admin @{w}: add your own checklist item", any(c["text"] == "Order business cards" for c in saved.get("custom", [])))
        page.locator("#tab-setup").click(); page.wait_for_timeout(200)
        check(f"admin @{w}: setup flags email alerts as a to-do", page.locator("#setup-dot").is_visible() and page.locator("#alerts-on").is_visible())
        page.locator("#alerts-on").click(); page.wait_for_timeout(600)
        check(f"admin @{w}: turn on email alerts", fake.alerts == ["support@jachihealth.com"] and page.locator("#alerts-on").count() == 0
              and "Email alerts are on" in page.locator("#setup-list").inner_text())
        page.screenshot(path=str(OUT / f"admin-setup-{w}.png"), full_page=True)
        page.reload(wait_until="networkidle"); page.wait_for_timeout(1000)
        check(f"admin @{w}: stays logged in, remembers the tab and the checklist", view(page) == "console"
              and page.locator("#tab-setup").get_attribute("aria-selected") == "true"
              and page.locator("#check-list input[data-item='quote']").is_checked())
        page.locator("#tab-setup").focus(); page.keyboard.press("Home")
        check(f"admin @{w}: tabs work with the keyboard", page.locator("#tab-overview").get_attribute("aria-selected") == "true"
              and page.evaluate("document.activeElement.id") == "tab-overview")
        fake.autoconfirm = True
        page.locator("#adm-refresh").click(); page.wait_for_timeout(900)
        check(f"admin @{w}: access pauses if email confirmation is switched off", view(page) == "denied"
              and "confirm their email" in page.locator("#adm-denied-text").inner_text())
        check(f"admin @{w}: no unexpected console errors", not expected_http_errors(logs), json.dumps(logs))
        if w == 1440:
            ran = page.evaluate("""() => { window.__injected = 0; const s = document.createElement('script'); s.textContent = 'window.__injected = 1';
                document.body.appendChild(s); return window.__injected; }""")
            check("admin: only the console's own script can run (injected ones are blocked)", ran == 0
                  and page.locator("meta[http-equiv=Content-Security-Policy]").count() == 1)
        ctx.close()

    # Someone who signs up first with the admin's address can't get in, even after the owner confirms it
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    fake = FakeIdentity()
    fake.attach(page)
    fake.add_user("support@jachihealth.com", "stranger-pass-1", confirmed=False)  # their sign-up, never confirmed
    page.goto(f"{BASE}/account/?create", wait_until="networkidle"); page.wait_for_timeout(500)
    page.locator("#create-email").fill("support@jachihealth.com"); page.locator("#create-password").fill("owner-pass-123")
    page.select_option("#create-state", "TX"); page.locator("#create-submit").click(); page.wait_for_timeout(700)
    page.goto(f"{BASE}/#confirmation_token={fake.last_link('confirmation')}"); page.wait_for_load_state("networkidle"); page.wait_for_timeout(1200)
    confirmed = view(page) == "profile" and fake.users["support@jachihealth.com"]["_password"] == "stranger-pass-1"
    page.goto(f"{BASE}/admin/", wait_until="networkidle"); page.wait_for_timeout(900)
    check("admin: an account someone else signed up first is refused, with the fix", confirmed and view(page) == "denied"
          and "Invite users" in page.locator("#adm-denied-text").inner_text())
    page.locator("[data-view=denied] [data-logout]").click(); page.wait_for_timeout(500)
    page.locator("#adm-login-email").fill("support@jachihealth.com"); page.locator("#adm-login-password").fill("stranger-pass-1")
    page.locator("#adm-login-submit").click(); page.wait_for_timeout(1000)
    check("admin: the person who chose that password is refused too", view(page) == "denied")
    page.locator("[data-view=denied] [data-logout]").click(); page.wait_for_timeout(500)
    del fake.users["support@jachihealth.com"]
    invite = fake.invite("support@jachihealth.com")
    page.goto(f"{BASE}/#invite_token={invite}"); page.wait_for_load_state("networkidle"); page.wait_for_timeout(1000)
    page.locator("#invite-password").fill("owner-pass-456"); page.locator("#invite-submit").click(); page.wait_for_timeout(700)
    page.goto(f"{BASE}/admin/", wait_until="networkidle"); page.wait_for_timeout(900)
    check("admin: once the address is deleted and invited, the owner gets in", view(page) == "console")
    check("admin takeover test: no unexpected console errors", not expected_http_errors(logs), json.dumps(logs))
    ctx.close()

    status, headers, _b = get("/admin/")
    check("admin and account pages send noindex headers", headers.get("X-Robots-Tag") == "noindex"
          and get("/account/")[1].get("X-Robots-Tag") == "noindex" and get("/es/account/")[1].get("X-Robots-Tag") == "noindex")
    sm = get("/sitemap.xml")[2].decode()
    check("admin and account pages stay out of the sitemap", "/admin/" not in sm and "/account/" not in sm)

    check("no page asked another website for anything", not EXTERNAL, json.dumps(EXTERNAL[:10]))

    browser.close()

server.shutdown()

fails = [c for c in results["checks"] if not c["ok"]]
print(f"\n{len(results['checks']) - len(fails)} passed, {len(fails)} failed")
(OUT / "results.json").write_text(json.dumps(results, indent=2))
sys.exit(1 if fails else 0)
