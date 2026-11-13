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
from content import EMAIL  # noqa: E402
import membership as MEMBERSHIP  # noqa: E402
import pages as PAGES  # noqa: E402
import pages_es as PAGES_ES  # noqa: E402
import learn as LEARN  # noqa: E402
import landing as LANDING  # noqa: E402
import content as CONTENT  # noqa: E402
import content_es as CONTENT_ES  # noqa: E402
import strings  # noqa: E402

ES = strings.ES

PORT = 8765
BASE = f"http://127.0.0.1:{PORT}"
URL = f"{BASE}/"
ES_URL = f"{BASE}/es/"
# The consumer health data privacy policy (Washington's My Health My Data Act), in each language
HEALTH_EN, HEALTH_ES = "/consumer-health-data/", "/es/datos-de-salud/"
# Each service page in each language, keyed by its English slug (pages.py, pages_es.py)
SVC_PATH = {"en": {p["slug"]: f"/{p['slug']}/" for p in PAGES.PAGES},
            "es": {slug: f"/es/{t['slug']}/" for slug, t in PAGES_ES.PAGES.items()}}
LINKS_JS = """() => [...new Set([...document.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href').split('#')[0])
                  .filter(h => h && !h.startsWith('/api/')))]"""
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
        tops = page.evaluate("[...document.querySelectorAll('#help .svc')].map(e => Math.round(e.getBoundingClientRect().top))")
        expect_rows = 2 if w >= 1060 else (5 if w >= 640 else 10)
        check(f"ten care cards in {expect_rows} rows @{w}", len(tops) == 10 and len(set(tops)) == expect_rows, str(tops))
        check(f"three plans on the home page @{w}", page.locator("#plans .m-plan").count() == 3)
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

    # 2) Mobile interactions on the home page
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
    menu_links = page.evaluate("[...document.querySelectorAll('#mobile-menu nav a')].map(a => a.getAttribute('href'))")
    check("menu lists six sections (Plans first)", len(menu_links) == 6 and menu_links[0] == "/plans/", str(menu_links))
    check("menu offers a plan and log in", page.locator("#mobile-menu .mobile-menu__foot a[href='/plans/']").is_visible()
          and page.locator("#mobile-menu a[href='/account/']").is_visible())
    page.screenshot(path=str(OUT / "mobile-menu.png"))
    page.keyboard.press("Escape")
    page.wait_for_timeout(500)
    check("escape closes menu", not is_open(page, "#mobile-menu"))
    check("focus returns to toggle", page.evaluate("document.activeElement.classList.contains('menu-toggle')"))
    toggle.click(); page.wait_for_timeout(500)
    page.locator("#mobile-menu a[href='#help']").click()
    page.wait_for_timeout(1400)
    check("menu link closes menu", not is_open(page, "#mobile-menu"))
    top = page.evaluate("document.getElementById('help').getBoundingClientRect().top")
    check("menu link scrolls to what we help with", 0 <= top < 160, f"top={top}")
    check("main not inert after close", page.evaluate("document.getElementById('main').inert === false"))

    # dock visibility
    page.evaluate("window.scrollTo(0, document.getElementById('how').offsetTop + 200)")
    page.wait_for_timeout(900)
    check("mobile dock shows after hero", page.locator("#dock").evaluate("el => el.classList.contains('is-visible')"))
    check("dock offers the plans", page.locator("#dock a").get_attribute("href") == "/plans/"
          and "Choose your plan" in page.locator("#dock a").inner_text())
    page.screenshot(path=str(OUT / "mobile-dock.png"))
    page.evaluate("document.getElementById('plans').scrollIntoView()")
    page.wait_for_timeout(900)
    check("mobile dock hides at the plans, which have their own buttons", not page.locator("#dock").evaluate("el => el.classList.contains('is-visible')"))
    page.screenshot(path=str(OUT / "plans-phone.png"))
    page.evaluate("document.getElementById('privacy-promise').scrollIntoView()"); page.wait_for_timeout(400)
    page.screenshot(path=str(OUT / "privacy-promise-phone.png"))

    # FAQ
    page.locator("#faq").scroll_into_view_if_needed()
    q = page.locator(".faq-q").first
    q.click(); page.wait_for_timeout(600)
    check("faq opens", q.get_attribute("aria-expanded") == "true" and page.locator("#faq-a-1 p").is_visible())
    check("faq: the first answer says Jachi isn't a doctor's office", "doctor's office" in q.inner_text()
          and page.locator("#faq-a-1 p").inner_text().startswith("No."), q.inner_text())
    q.click(); page.wait_for_timeout(600)
    check("faq closes", q.get_attribute("aria-expanded") == "false" and not page.locator("#faq-a-1 p").is_visible())
    check("footer links to the privacy policy, health data policy and terms", page.locator("footer a[href='/privacy/']").count() == 1
          and page.locator(f"footer a[href='{HEALTH_EN}']").count() == 1
          and page.locator("footer a[href='/terms/']").count() == 1 and page.locator("footer a[href='/texas-medical-board/']").count() == 1)
    socials = ["https://www.tiktok.com/@jachihealth", "https://www.instagram.com/jachihealth/"]
    check("footer links Jachi's TikTok and Instagram", all(page.locator(f"footer a[href='{u}'][rel='me']").count() == 1 for u in socials))
    foot = page.locator("footer .footer__legal").inner_text()
    check("footer: Jachi coordinates care; independent providers give and bill it; not insurance; 911 and 988",
          all(x in foot for x in ("care-coordination company", "does not practice medicine", "independent", "referral fees",
                                  "don't pay for medical care", "live in Texas", "911", "988")), foot)
    ov = page.evaluate(OVERFLOW_JS)
    check("home on a phone: no overflow after scrolling through", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
    check("mobile interactions: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 2b) The waitlist form, which only the ad landing pages still have (step 4 of the membership switch replaces it):
    # errors, an honest failure, then a sign-up
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    page.goto(f"{BASE}/join/", wait_until="networkidle"); page.wait_for_timeout(500)
    check("join form asks only for email and state, the rest optional", page.locator("#join-form [required]").count() == 2
          and page.locator("#join-form .label__opt").count() == 2 and page.locator("#join-consent").count() == 0)
    page.locator("#join-submit").click(); page.wait_for_timeout(300)
    check("join: missing email and state caught", page.locator("#err-email").is_visible() and page.locator("#err-jstate").is_visible())
    check("join status explains", page.locator("#join-status").inner_text().strip() == strings.EN["fix_many"].replace("{n}", "2"),
          page.locator("#join-status").inner_text())
    check("join: focus moves to the email field", page.evaluate("document.activeElement.id") == "join-email")
    page.screenshot(path=str(OUT / "join-errors-mobile.png"))
    page.locator("#join-email").fill("maya@example")
    page.locator("#join-submit").click(); page.wait_for_timeout(200)
    check("invalid email caught", "valid email" in page.locator("#err-email").inner_text())
    page.locator("#join-email").fill("maya@example.com")
    page.locator("#join-name").fill("Maya")
    page.select_option("#join-state", "TX")
    page.locator("#join-form label.check:has(input[value='urgent-care'])").click()
    page.locator("#join-form label.check:has(input[value='weight-care'])").click()
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
    check("post body has form-name and fields", all(s in body for s in ("form-name=early-access", "first_name=Maya", "email=maya%40example.com",
                                                                         "state=TX", "language=en", "source=website"))
          and "consent" not in body, body)
    check("account offer stays hidden while accounts are off", page.locator("#join-account").is_hidden())
    check("interests sent as one value", body.count("interest=") == 1 and "interest=urgent-care%2C+weight-care" in body, body)
    page.screenshot(path=str(OUT / "join-success-mobile.png"))
    page.locator("#join-again").click(); page.wait_for_timeout(300)
    check("add another resets form", page.locator("#join-form").is_visible() and page.locator("#join-name").input_value() == ""
          and page.evaluate("!document.querySelector('#join-form input[name=interest]:checked')"))
    page.locator("#join-form [data-open='privacy']").scroll_into_view_if_needed()
    page.locator("#join-form [data-open='privacy']").click(); page.wait_for_timeout(500)
    check("privacy dialog opens", page.locator("#privacy").evaluate("d => d.open"))
    page.screenshot(path=str(OUT / "privacy-mobile.png"))
    page.keyboard.press("Escape"); page.wait_for_timeout(300)
    check("privacy dialog closes", not page.locator("#privacy").evaluate("d => d.open"))
    check("focus back on opener", page.evaluate("document.activeElement.matches('#join-form [data-open=privacy]')"))
    unexpected = [l for l in logs if "501" not in l[1]]  # the 501 comes from the deliberate no-backend test
    check("waitlist form: no unexpected console errors", not unexpected, json.dumps(unexpected))
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
                          body=json.dumps({"reply": f"Your coordinator finds care near you and books it. Questions? Email {EMAIL}."}))
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
    page.locator("#chat-quick button[data-ask='What does a coordinator do?']").click(); page.wait_for_timeout(700)
    bots = page.locator("#chat-log .msg--bot")
    check("chat: quick question gets an AI reply", "finds care near you" in bots.last.inner_text(), bots.last.inner_text())
    check("chat: quick replies hide after first question", page.locator("#chat-quick").is_hidden())
    check("chat: request carries the conversation", chat_bodies and json.loads(chat_bodies[-1])["messages"][-1] == {"role": "user", "content": "What does a coordinator do?"}, str(chat_bodies[-1:]))
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
    page.route("**/api/chat", lambda r: r.fulfill(status=200, content_type="application/json", body='{"reply":"Your coordinator replies within 1 business day."}'))
    page.goto(URL, wait_until="networkidle"); page.wait_for_timeout(600)
    check("phone chat: launcher shows at the top", page.locator("#chat-launcher").is_visible())
    page.evaluate("window.scrollTo({top: document.getElementById('how').offsetTop + 200, behavior: 'instant'})"); page.wait_for_timeout(1000)
    check("phone chat: launcher steps aside for the bottom bar", not page.locator("#chat-launcher").is_visible() and page.locator(".dock__chat").is_visible())
    page.screenshot(path=str(OUT / "chat-dock-phone.png"))
    page.locator(".dock__chat").click(); page.wait_for_timeout(600)
    box = page.locator("#chat").bounding_box()
    check("phone chat: opens full screen", box and box["x"] == 0 and box["y"] == 0 and round(box["width"]) == 390 and round(box["height"]) == 844, str(box))
    check("phone chat: page behind is inert", page.evaluate("document.getElementById('main').inert === true"))
    check("phone chat: no keyboard pop on open", page.evaluate("document.activeElement.id") == "chat-title")
    page.locator("#chat-input").fill("When do you launch?"); page.locator("#chat-send").click(); page.wait_for_timeout(700)
    check("phone chat: reply arrives", "1 business day" in page.locator("#chat-log .msg--bot").last.inner_text())
    page.screenshot(path=str(OUT / "chat-open-phone.png"))
    page.locator("#chat .chat__fine [data-ticket]").click(); page.wait_for_timeout(300)
    page.screenshot(path=str(OUT / "ticket-phone.png"))
    ov = page.evaluate(OVERFLOW_JS)
    check("phone chat: no overflow", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
    page.locator("#chat-close").click(); page.wait_for_timeout(500)
    check("phone chat: closing restores the page", page.evaluate("document.getElementById('main').inert === false") and page.locator("#chat").is_hidden())
    check("phone chat: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 2e) Home page on a computer: the plans button, the quick picker, the care cards, the plans and the privacy promise
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page, logs = setup(ctx)
    page.goto(URL, wait_until="networkidle"); page.wait_for_timeout(500)
    hero_btns = page.locator(".hero .cta-row .btn")
    check("hero: choosing a plan is the main button, how it works second", hero_btns.first.get_attribute("href") == "/plans/"
          and "Choose your plan" in hero_btns.first.inner_text() and hero_btns.nth(1).get_attribute("href") == "#how")
    trust = page.locator(".hero .trust").inner_text()
    check("hero: a real person, prices confirmed first, no referral fees",
          all(x in trust for x in ("real person", "Prices confirmed", "No referral fees")), trust)
    check("header: the plans button goes to the plans page", page.locator(".header-cta").get_attribute("href") == "/plans/")
    picks = page.evaluate("[...document.querySelectorAll('.picker a')].map(a => a.getAttribute('href'))")
    bad_picks = [h for h in picks if status_of(h) != 200]
    check("hero: quick picker goes straight to service pages", len(picks) == 8 and not bad_picks and len(set(picks)) == 8, str(picks))
    cards = page.evaluate("[...document.querySelectorAll('#help .svc__link')].map(a => a.getAttribute('href'))")
    check("what we help with: a card for every service page", cards == list(SVC_PATH["en"].values()), str(cards))
    inc = page.locator("#included").inner_text()
    check("what we help with: what the plan includes and what providers bill", page.locator(".included__col").count() == 2
          and "Your plan includes" in inc and "Billed by your provider" in inc and "aren't insurance" in inc, inc[:300])
    plans = page.evaluate("""() => [...document.querySelectorAll('#plans .m-plan')].map(c => ({
      name: c.querySelector('.m-plan__name').textContent, price: c.querySelector('.m-plan__price').textContent,
      href: c.querySelector('.btn').getAttribute('href'), items: c.querySelectorAll('.m-plan__list li').length }))""")
    check("plans: three plans, their monthly prices, three highlights each and a start button to checkout",
          [x["name"] for x in plans] == ["Concierge", "Concierge Plus", "Signature"]
          and [x["price"].replace("/month", "") for x in plans] == ["$49", "$99", "$250"]
          and [x["href"] for x in plans] == ["/membership/?plan=concierge", "/membership/?plan=plus", "/membership/?plan=signature"]
          and all(x["items"] == 3 for x in plans), json.dumps(plans))
    check("plans: the founding price is on the Concierge card", "$39" in page.locator("#plans .m-plan").first.inner_text())
    promise = page.locator("#privacy-promise")
    check("privacy promise: four zeros, including referral fees, and links to both privacy policies",
          promise.locator(".ledger__row").count() == 4 and promise.locator(".ledger__n").all_inner_texts() == ["0"] * 4
          and "Referral fees" in promise.inner_text() and promise.locator(f"a[href='{HEALTH_EN}']").count() == 1
          and promise.locator("a[href='/privacy/']").count() == 1, promise.inner_text()[:300])
    check("privacy promise: screen readers hear each row as none",
          promise.locator(".ledger__row .visually-hidden").all_inner_texts() == [": none."] * 4)
    check("AI disclosure: on the page, and the footer links to it", "AI" in page.locator("#ai-disclosure").inner_text()
          and page.locator("footer a[href='#ai-disclosure']").count() == 1)
    page.locator(".picker a[href='/uti-treatment/']").click(); page.wait_for_load_state("networkidle")
    check("quick picker: UTI opens the UTI page", page.url == f"{BASE}/uti-treatment/", page.url)
    page.goto(URL + "#help", wait_until="networkidle"); page.wait_for_timeout(300)
    page.locator("#help .svc__link[href='/skin-care/']").click(); page.wait_for_load_state("networkidle")
    check("home care card opens its page", page.url == f"{BASE}/skin-care/", page.url)
    page.goto(ES_URL, wait_until="networkidle"); page.wait_for_timeout(300)
    es_picks = page.evaluate("[...document.querySelectorAll('.picker a')].map(a => a.getAttribute('href'))")
    check("es quick picker: goes straight to the Spanish service pages", len(es_picks) == 8 and len(set(es_picks)) == 8
          and all(h in SVC_PATH["es"].values() and status_of(h) == 200 for h in es_picks), str(es_picks))
    es_cards = page.evaluate("[...document.querySelectorAll('#help .svc__link')].map(a => a.getAttribute('href'))")
    check("es: a care card for every Spanish service page", es_cards == list(SVC_PATH["es"].values()), str(es_cards))
    es_plans = page.evaluate("[...document.querySelectorAll('#plans .m-plan .btn')].map(a => a.getAttribute('href'))")
    check("es plans: start buttons go to the Spanish checkout",
          es_plans == ["/es/membresia/?plan=concierge", "/es/membresia/?plan=plus", "/es/membresia/?plan=signature"], str(es_plans))
    es_care = page.evaluate("[...document.querySelectorAll('footer nav[aria-label=\\'Atención\\'] a')].map(a => a.getAttribute('href'))")
    check("es footer: care links go to the Spanish service pages", es_care == list(SVC_PATH["es"].values()), str(es_care))
    check("es footer: links Jachi's TikTok and Instagram", page.locator("footer a[href='https://www.tiktok.com/@jachihealth']").count() == 1
          and page.locator("footer a[href='https://www.instagram.com/jachihealth/']").count() == 1)
    page.locator(f".picker a[href='{SVC_PATH['es']['uti-treatment']}']").click(); page.wait_for_load_state("networkidle")
    check("es quick picker: infección urinaria opens the Spanish UTI page", page.url == BASE + SVC_PATH["es"]["uti-treatment"], page.url)
    check("home on a computer: no console errors", not logs, json.dumps(logs))
    ctx.close()

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
    page.locator(".nav a[href='#how']").click(); page.wait_for_timeout(1500)
    active = page.evaluate("[...document.querySelectorAll('.nav a.is-active')].map(a=>a.getAttribute('href'))")
    check("scrollspy marks How it works", active == ["#how"], str(active))
    check("header solid after scroll", page.evaluate("document.getElementById('site-header').classList.contains('is-scrolled')"))
    page.screenshot(path=str(OUT / "desktop-how.png"))
    page.locator(".nav a[href='#help']").click(); page.wait_for_timeout(1500)
    active = page.evaluate("[...document.querySelectorAll('.nav a.is-active')].map(a=>a.getAttribute('href'))")
    check("scrollspy marks What we help with", active == ["#help"], str(active))
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
    # keyboard: tab to a care card's link; the whole card answers to it
    page.locator("#help .svc__link").first.focus()
    check("care card link takes keyboard focus", page.evaluate("document.activeElement.classList.contains('svc__link')"))
    page.locator("#help .svc").nth(3).hover(); page.wait_for_timeout(400)
    page.screenshot(path=str(OUT / "desktop-care-cards.png"))
    check("desktop: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 6) Preview mode (inside the artifact viewer): honest message, no network call
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page, logs = setup(ctx, preview=True)
    page.goto(f"{BASE}/join/", wait_until="networkidle")
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
        opts.onText({ text: 'Concierge is', delta: 'Concierge is' });
        await new Promise(r => setTimeout(r, 150));
        opts.onText({ text: 'Concierge is $49 a month.', delta: ' $49 a month.' });
        return { text: 'Concierge is $49 a month.', truncated: false, modelTierApplied: 'quick' };
      };
      window.claude = { use: async (name) => (name === 'sample' ? fakeSample : null) };
    """)
    plogs = []
    page.on("pageerror", lambda e: plogs.append(str(e)))
    page.goto(f"{BASE}/__dist/artifact-sim.html", wait_until="networkidle"); page.wait_for_timeout(500)
    page.locator("#chat-launcher").click(); page.wait_for_timeout(300)
    page.locator("#chat-input").fill("What do the plans cost?"); page.keyboard.press("Enter"); page.wait_for_timeout(250)
    mid = page.locator("#chat-log .msg--bot").last.inner_text()
    page.wait_for_timeout(600)
    calls = page.evaluate("window.__sampleCalls")
    check("preview AI: answer streams in", "$49 a month" in page.locator("#chat-log .msg--bot").last.inner_text(), mid)
    check("preview AI: rules sent as the first turn", calls and calls[0][0]["role"] == "user" and "RULES" in calls[0][0]["content"]
          and calls[0][-1] == {"role": "user", "content": "What do the plans cost?"})
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
    for tag in ('property="og:image" content="https://jachihealth.com/og.jpg"', 'name="twitter:card" content="summary_large_image"',
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
        check(f"404 @{w}: one h1, links home and to the plans", page.locator("h1").count() == 1
              and page.locator("a[href='/']").count() >= 2 and page.locator("a[href='/plans/']").count() == 1)
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
        tops = page.evaluate("[...document.querySelectorAll('#help .svc')].map(e => Math.round(e.getBoundingClientRect().top))")
        expect_rows = 2 if w >= 1060 else (5 if w >= 640 else 10)
        check(f"es: ten care cards in {expect_rows} rows @{w}", len(tops) == 10 and len(set(tops)) == expect_rows, str(tops))
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
      values: [...document.querySelectorAll('#ticket-topic option')].map(e => e.value).sort(),
      cards: document.querySelectorAll('#help .svc').length, plans: document.querySelectorAll('#plans .m-plan').length,
      faq: document.querySelectorAll('.faq-item').length,
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
                                                     body=json.dumps({"reply": f"Concierge cuesta $49 al mes. Escriba a {EMAIL}."})))
    page.goto(f"{BASE}/es/unase/", wait_until="networkidle"); page.wait_for_timeout(500)
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
    check("es share: opens the share sheet with the Spanish page", shared and shared["url"] == "https://jachihealth.com/es/" and shared["text"] == ES["share_text"], str(shared))
    page.screenshot(path=str(OUT / "es-join-success-phone.png"))

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
    check("es chat: AI reply shown with the email linked", "$49 al mes" in page.locator("#chat-log .msg--bot").last.inner_text()
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
    page.goto(f"{BASE}/join/", wait_until="networkidle"); page.wait_for_timeout(400)
    page.locator("#join-email").fill("sam@example.com"); page.select_option("#join-state", "TX")
    page.locator("#join-submit").click(); page.wait_for_timeout(1000)
    check("sign-up with only email and state works", page.locator("#join-success").is_visible()
          and page.locator("#join-success-title").inner_text().startswith("You're on the list."))
    page.locator("#join-share").click(); page.wait_for_timeout(300)
    check("share: copies the link when there's no share sheet", page.evaluate("window.__copied") == "https://jachihealth.com/"
          and page.locator("#join-share .btn__label").inner_text() == strings.EN["share_copied_button"]
          and strings.EN["share_copied"] in page.locator("#join-share-status").inner_text())
    page.screenshot(path=str(OUT / "share-copied-desktop.png"))
    page.wait_for_timeout(2700)
    check("share: button label comes back", page.locator("#join-share .btn__label").inner_text() == strings.EN["share_button"])
    check("share: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 11) Service pages, in English and Spanish: what a coordinator does for each kind of care
    slugs = [p["slug"] for p in PAGES.PAGES]
    svc_pages = [(lang, slug, SVC_PATH[lang][slug]) for slug in slugs for lang in ("en", "es")]
    for lang, slug, path in svc_pages:
        plans_path, twin = ("/plans/" if lang == "en" else "/es/planes/"), SVC_PATH["es" if lang == "en" else "en"][slug]
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
              ctas: [...document.querySelectorAll('main a.btn')].filter(a => !a.closest('.glance')).map(a => a.getAttribute('href')),
              helps: document.querySelectorAll('.conds li').length,
              canonical: (document.querySelector('link[rel=canonical]') || {}).href,
              alt: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map(l => l.hreflang + ' ' + new URL(l.href).pathname),
              swap: document.querySelector('.lang-switch').getAttribute('href'),
              related: [...document.querySelectorAll('.related a')].map(a => a.getAttribute('href')),
              faq: document.querySelectorAll('.faq-item').length,
              ld: [...document.querySelectorAll('script[type="application/ld+json"]')]
                .flatMap(s => { const d = JSON.parse(s.textContent); return (d['@graph'] || [d]).map(n => n['@type']); }),
            })""")
            ok = (info["lang"] == lang and info["h1"] == 1 and info["crumbs"] == 3 and info["helps"] >= 4
                  and info["ctas"].count(plans_path) == 2 and info["canonical"] == f"https://jachihealth.com{path}"
                  and len(info["related"]) == 3 and all(r in SVC_PATH[lang].values() for r in info["related"]) and info["faq"] >= 3
                  and info["ld"] == ["Organization", "WebPage", "BreadcrumbList", "FAQPage"])
            check(f"{path} @{w}: language, heading, breadcrumb, what the coordinator does, plan buttons, canonical, related pages, FAQ and schema",
                  ok, json.dumps(info))
            check(f"{path} @{w}: points to its {'Spanish' if lang == 'en' else 'English'} twin (hreflang and language switch)",
                  sorted(info["alt"]) == sorted([f"en {SVC_PATH['en'][slug]}", f"es {SVC_PATH['es'][slug]}", f"x-default {SVC_PATH['en'][slug]}"])
                  and info["swap"] == twin, json.dumps(info["alt"] + [info["swap"]]))
            if w == 1440:
                problems = page.evaluate(STATIC_A11Y_JS)
                check(f"{path}: links, labels and ids valid", not problems, json.dumps(problems))
                bad = [href for href in page.evaluate(LINKS_JS) if status_of(href) != 200]
                check(f"{path}: every link on the page works", not bad, str(bad))
                page.locator(".faq-q").first.click(); page.wait_for_timeout(500)
                check(f"{path}: FAQ opens", page.locator(".faq-q").first.get_attribute("aria-expanded") == "true")
            if slug in ("uti-treatment", "weight-loss", "online-therapy"):
                page.screenshot(path=str(OUT / f"svc-{lang + '-' if lang == 'es' else ''}{slug}-{w}.png"), full_page=True, animations="disabled")
            check(f"{path} @{w}: no console errors", not logs, json.dumps(logs))
            ctx.close()

    # The Spanish pages are all Spanish: none of the English page's words are left in them
    english_words = ["Choose your plan", "Good to know", "Related care", "Care coordination", "For adults in Texas",
                     "Ask our assistant", "Have another question", "Ready when you are", "How it works", "at a glance",
                     "Call 911", "Text 988", "Questions, answered", "See how Jachi works", "Your coordinator", "self-pay",
                     "Plans from"]
    leftovers = {}
    for slug in slugs:
        path = SVC_PATH["es"][slug]
        doc = (ROOT / "public" / path.strip("/") / "index.html").read_text()
        words = re.sub(r"<[^>]+>", " ", re.search(r"<main\b.*?</main>", doc, re.S).group(0))
        found = [w for w in english_words if w.lower() in words.lower()]
        if found:
            leftovers[path] = found
    check("es service pages: no English left on the page", not leftovers, json.dumps(leftovers))
    usted = [path for path in SVC_PATH["es"].values()
             if re.search(r"\b(tú|tienes|puedes|necesitas|quieres|eres|estás|tu salud|tus )\b",
                          (ROOT / "public" / path.strip("/") / "index.html").read_text(), re.I)]
    check("es service pages: speak to the visitor as usted", not usted, str(usted))
    # No service page promises treatment, names a medicine or quotes a provider's price
    promising = {}
    for lang, slug, path in svc_pages:
        doc = (ROOT / "public" / path.strip("/") / "index.html").read_text()
        words = html.unescape(re.sub(r"<[^>]+>", " ", re.search(r"<main\b.*?</main>", doc, re.S).group(0)))
        found = [m.group(0) for m in re.finditer(r"\bwe (?:treat|prescribe|diagnose)\b|\bJachi (?:treats|prescribes|diagnoses)\b"
                                                 r"|\b(?:wegovy|zepbound|ozempic|mounjaro|semaglutide|tirzepatide|viagra|cialis|adderall|xanax)\b"
                                                 r"|\$\s?\d[\d,]*", words, re.I)]
        found = [x for x in found if x not in ("$49",)]
        if found:
            promising[path] = found
    check("service pages: no treatment promises, medicine names or prices other than the Concierge plan's", not promising,
          json.dumps(promising))

    # From a service page to the plans
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    page.goto(f"{BASE}/uti-treatment/", wait_until="networkidle"); page.wait_for_timeout(500)
    page.evaluate("window.scrollTo({top: document.querySelector('.conds').getBoundingClientRect().top + scrollY, behavior: 'instant'})"); page.wait_for_timeout(900)
    check("service page phone: bottom bar appears after the hero and offers the plans",
          page.locator("#dock").evaluate("el => el.classList.contains('is-visible')")
          and page.locator("#dock a").get_attribute("href") == "/plans/" and not page.locator("#chat-launcher").is_visible())
    page.screenshot(path=str(OUT / "svc-dock-phone.png"))
    page.locator(".page-hero .btn").first.click(); page.wait_for_load_state("networkidle")
    check("service page CTA: opens the plans page", page.evaluate("location.pathname") == "/plans/", page.url)
    page.goto(f"{BASE}{SVC_PATH['es']['uti-treatment']}", wait_until="networkidle"); page.wait_for_timeout(500)
    page.locator(".page-hero .btn").first.click(); page.wait_for_load_state("networkidle")
    check("es service page CTA: opens the Spanish plans page", page.evaluate("location.pathname") == "/es/planes/"
          and page.evaluate("document.documentElement.lang") == "es", page.url)
    check("service page journeys: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 11b) How it works on every service page: the same four steps, a safety box and a link to the full page
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page, logs = setup(ctx)
    for lang, slug, path in svc_pages:
        page.goto(f"{BASE}{path}", wait_until="domcontentloaded")
        how_path = CONTENT.HOW["path"] if lang == "en" else CONTENT_ES.HOW["path"]
        exp = page.evaluate("""how => ({
          title: (document.querySelector('#expect-title') || {}).textContent || '',
          items: [...document.querySelectorAll('#expect .expect li h3')].map(h => h.textContent),
          how: !!document.querySelector(`#expect a[href="${how}"]`),
          safety: document.querySelectorAll('#expect .safety').length,
          tops: [...document.querySelectorAll('#expect .expect li h3')].map(h => Math.round(h.getBoundingClientRect().top)),
        })""", how_path)
        check(f"{path}: four steps line up, with a safety box and a link to how Jachi works",
              exp["title"] == ("How it works." if lang == "en" else "Cómo funciona.") and len(exp["items"]) == 4
              and exp["how"] and exp["safety"] == 1 and len(set(exp["tops"])) == 1, json.dumps(exp))
    check("service steps: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 11c) How Jachi works and the Learn guides, in English and Spanish
    content_pages = [CONTENT.HOW["path"], CONTENT_ES.HOW["path"], LEARN.HUB["en"]["path"], LEARN.HUB["es"]["path"],
                     HEALTH_EN, HEALTH_ES]
    guide_pages = [LEARN.path(a, lang) for lang in ("en", "es") for a in LEARN.ARTICLES]
    content_pages += guide_pages
    pairs = {CONTENT.HOW["path"]: CONTENT_ES.HOW["path"], LEARN.HUB["en"]["path"]: LEARN.HUB["es"]["path"], HEALTH_EN: HEALTH_ES}
    pairs.update({LEARN.path(a, "en"): LEARN.path(a, "es") for a in LEARN.ARTICLES})
    pairs.update({v: k for k, v in list(pairs.items())})
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
            ok = (info["lang"] == lang and info["h1"] == 1 and info["canonical"] == f"https://jachihealth.com{path}"
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
      plans: [...document.querySelectorAll('main a.btn')].filter(a => /plan/i.test(a.textContent)).map(a => a.getAttribute('href')),
      note: (document.querySelector('.note-box') || {}).textContent || '',
    })""")
    check("how it works: seven steps, with the coordinator then the provider", len(how["steps"]) == 7
          and how["lanes"] == ["Your coordinator", "Your provider"] and how["roles"] == ["Jachi Health LLC", "Your provider"], json.dumps(how))
    check("how it works: says Jachi isn't a medical practice or insurance, and every plan button goes to the plans",
          "isn't a medical practice or insurance" in how["note"] and len(how["plans"]) == 2 and set(how["plans"]) == {"/plans/"}, json.dumps(how))
    page.evaluate("window.scrollTo({top: document.querySelector('.lanes').getBoundingClientRect().top + scrollY, behavior: 'instant'})"); page.wait_for_timeout(900)
    check("how it works (phone): bottom bar appears after the hero", page.locator("#dock").evaluate("el => el.classList.contains('is-visible')")
          and page.locator("#dock a").get_attribute("href") == "/plans/")
    page.locator(".page-top .cta-row .btn").first.click(); page.wait_for_load_state("networkidle")
    check("how it works: the plan button opens the plans page", page.evaluate("location.pathname") == "/plans/", page.url)
    page.goto(f"{BASE}/es/como-funciona/", wait_until="networkidle"); page.wait_for_timeout(300)
    es_how = page.evaluate("[...document.querySelectorAll('main a.btn')].filter(a => /plan/i.test(a.textContent)).map(a => a.getAttribute('href'))")
    check("cómo funciona: the Spanish page's plan buttons go to the Spanish plans", len(es_how) == 2 and set(es_how) == {"/es/planes/"}, str(es_how))
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
            check(f"{path}: sources, plans box, 911 and 988, two more guides, date", len(g["sources"]) >= 2
                  and g["join"] == a[lang]["cta"]["plans"] and g["tel"] == ["tel:911", "tel:988"] and len(g["more"]) == 2
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

    # 11d) Ad landing pages: the ad's headline and the waitlist form up top, no drug names or prices, out of search
    # Netlify stores only the fields of one copy of each form name, so every copy of the waitlist form needs the same fields.
    form_fields = {}
    for f in sorted((ROOT / "public").rglob("*.html")):
        for form in re.findall(r'<form[^>]*\bname="early-access".*?</form>', f.read_text(encoding="utf-8"), flags=re.S):
            names = tuple(sorted(set(re.findall(r'<(?:input|select|textarea)\b[^>]*\bname="([^"]+)"', form))))
            form_fields.setdefault(names, []).append(str(f.relative_to(ROOT / "public")))
    check("every copy of the waitlist form has the same fields, so Netlify keeps them all",
          len(form_fields) == 1 and sum(len(v) for v in form_fields.values()) == 2 * len(LANDING.PAGES),
          json.dumps({", ".join(k): v for k, v in form_fields.items()}))
    lp_pairs = {}
    for entry in LANDING.PAGES:
        lp_pairs[LANDING.path(entry, "en")] = LANDING.path(entry, "es")
        lp_pairs[LANDING.path(entry, "es")] = LANDING.path(entry, "en")
    banned = [re.compile(b, re.I) for b in LANDING.BANNED]
    for entry in LANDING.PAGES:
        for lang in ("en", "es"):
            path = LANDING.path(entry, lang)
            for w, h in ((360, 740), (390, 844), (1440, 900)):
                ctx = browser.new_context(viewport={"width": w, "height": h}, has_touch=w < 900, is_mobile=w < 900)
                page, logs = setup(ctx)
                page.goto(f"{BASE}{path}", wait_until="networkidle"); page.wait_for_timeout(400)
                ov = page.evaluate(OVERFLOW_JS)
                check(f"{path} @{w}: no overflow", ov["scrollWidth"] <= ov["clientWidth"] and not ov["offenders"], json.dumps(ov))
                info = page.evaluate("""() => ({
                  lang: document.documentElement.lang,
                  h1: [...document.querySelectorAll('h1')].map(x => x.textContent.trim()),
                  robots: (document.querySelector('meta[name=robots]') || {}).content,
                  canonical: !!document.querySelector('link[rel=canonical]'),
                  swap: document.querySelector('.lang-switch').getAttribute('href'),
                  checked: [...document.querySelectorAll('#join-form input[name=interest]:checked')].map(x => x.value),
                  state: document.querySelector('#join-state').value,
                  heard: !!document.querySelector('#join-heard'),
                  tags: [...document.querySelectorAll('#join-form input[type=hidden][name^=utm_]')].map(x => x.name),
                  language: document.querySelector('#join-form input[name=language]').value,
                  formTop: Math.round(document.querySelector('#join-form').getBoundingClientRect().top + scrollY),
                  text: document.body.innerText,
                })""")
                ok = (info["lang"] == lang and info["h1"] == [entry[lang]["h1"]] and info["robots"] == "noindex"
                      and not info["canonical"] and info["swap"] == lp_pairs[path] and sorted(info["checked"]) == sorted(entry["interests"])
                      and info["state"] == "" and not info["heard"] and info["language"] == lang
                      and info["tags"] == ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"])
                check(f"{path} @{w}: the ad's headline, noindex, other language linked, no state picked in advance", ok,
                      json.dumps({k: v for k, v in info.items() if k != "text"}))
                if w == 390:
                    check(f"{path} @390: the form starts within the first two screens", info["formTop"] < 2 * 844, str(info["formTop"]))
                    page.screenshot(path=str(OUT / f"landing{path.strip('/').replace('/', '-')}-390.png"), full_page=True)
                if w == 1440:
                    hits = sorted({m.group(0) for b in banned for m in b.finditer(info["text"])})
                    check(f"{path}: no drug names, prescriptions, refills, booking or prices in the page", not hits, str(hits))
                    problems = page.evaluate(STATIC_A11Y_JS)
                    check(f"{path}: links, labels and ids valid", not problems, json.dumps(problems))
                    bad = [href for href in page.evaluate(LINKS_JS) if status_of(href) != 200]
                    check(f"{path}: every link on the page works", not bad, str(bad))
                    cols = page.locator("footer .footer__col").count()
                    check(f"{path}: footer keeps the legal links and notes, without the lists of other services and pages",
                          cols == 1 and page.locator("footer .emergency").count() == 1 and page.locator("footer a[href='/texas-medical-board/']").count() == 1
                          and page.locator("footer a[href='/privacy/']").count() == 1
                          and page.locator(f"footer a[href='{HEALTH_EN}'], footer a[href='{HEALTH_ES}']").count() == 1)
                    page.screenshot(path=str(OUT / f"landing{path.strip('/').replace('/', '-')}-1440.png"), full_page=False)
                check(f"{path} @{w}: no console errors", not logs, json.dumps(logs))
                ctx.close()
    status, headers, body = get("/sitemap.xml")
    check("ad landing pages stay out of the sitemap", "/join/" not in body.decode() and "/es/unase/" not in body.decode())

    # A sign-up from an ad: the ad's tags ride along with the form, and the address bar is tidied
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    page.route(f"{BASE}/", lambda r: r.fulfill(status=200, body="ok") if r.request.method == "POST" else r.continue_())
    lposted = {}
    page.on("request", lambda req: lposted.update(body=req.post_data) if req.method == "POST" and req.url.rstrip("/") == BASE else None)
    page.goto(f"{BASE}/join/weight-care/?utm_source=ig&utm_medium=paid_social&utm_campaign=jh-us-waitlist-en"
              "&utm_term=en-us-18plus-broad&utm_content=en-weight-v1%3Cb%3E&fbclid=abc123", wait_until="networkidle")
    check("ad landing: tags and Meta's click id are tidied from the address", page.evaluate("location.search") == "", page.evaluate("location.href"))
    page.locator("#join-email").fill("lena@example.com")
    check("ad landing: no service is ticked for the visitor", page.locator("#join-form input[name=interest]:checked").count() == 0)
    page.locator("#join-form input[name=interest][value=weight-care]").check(force=True)
    page.locator("#join-submit").click()
    page.wait_for_timeout(400)
    check("ad landing: the form asks for a state before sending", lposted.get("body") is None
          and page.locator("#join-success").is_hidden() and page.evaluate("document.activeElement.id") == "join-state",
          page.evaluate("document.activeElement.id"))
    page.locator("#join-state").select_option("FL")
    page.locator("#join-submit").click()
    page.wait_for_selector("#join-success:not([hidden])", timeout=5000)
    lb = lposted.get("body", "")
    check("ad landing: the sign-up carries the ad's tags, cleaned, with the state and the service the visitor chose",
          all(x in lb for x in ("form-name=early-access", "email=lena%40example.com", "state=FL", "interest=weight-care",
                                "utm_source=ig", "utm_campaign=jh-us-waitlist-en", "utm_term=en-us-18plus-broad",
                                "utm_content=en-weight-v1b", "source=website", "language=en")) and "fbclid" not in lb and "%3C" not in lb, lb[:400])
    page.goto(f"{BASE}/join/", wait_until="networkidle")
    page.route(f"{BASE}/", lambda r: r.fulfill(status=200, body="ok") if r.request.method == "POST" else r.continue_())
    lposted.clear()
    page.locator("#join-email").fill("lena2@example.com")
    page.locator("#join-state").select_option("TX")
    page.locator("#join-submit").click()
    page.wait_for_selector("#join-success:not([hidden])", timeout=5000)
    check("ad landing: the tags stay with a sign-up later in the same visit", "utm_content=en-weight-v1b" in lposted.get("body", ""), lposted.get("body", "")[:300])
    check("ad landing: no console errors", not logs, json.dumps(logs))
    ctx.close()
    ctx = browser.new_context(viewport={"width": 390, "height": 844})
    page, logs = setup(ctx)
    page.route(f"{BASE}/", lambda r: r.fulfill(status=200, body="ok") if r.request.method == "POST" else r.continue_())
    lposted.clear()
    page.on("request", lambda req: lposted.update(body=req.post_data) if req.method == "POST" and req.url.rstrip("/") == BASE else None)
    page.goto(f"{BASE}/join/", wait_until="networkidle")
    page.locator("#join-email").fill("noad@example.com")
    page.locator("#join-state").select_option("TX")
    page.locator("#join-submit").click()
    page.wait_for_selector("#join-success:not([hidden])", timeout=5000)
    nb = lposted.get("body", "")
    check("a sign-up without an ad sends the tag fields empty", "utm_campaign=&" in nb and "utm_content=" in nb and "utm_content=e" not in nb, nb[:300])
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

    # 12a) Consumer health data privacy policy: what Washington's My Health My Data Act asks it to say, in both
    # languages, and a link to it from both home pages (RCW 19.373.020), the waitlist form's note and the privacy policy
    for path, must in ((HEALTH_EN, ["My Health My Data Act", "What we collect", "Where it comes from", "How we use it",
                                    "Who handles it", "Netlify", "Anthropic", "Meta", "Confirm and access", "Withdraw consent",
                                    "Delete it", "45 days", "Appeals", "Washington State Attorney General", EMAIL]),
                       (HEALTH_ES, ["My Health My Data", "Qué recopilamos", "De dónde vienen", "Cómo los usamos",
                                    "Quién los maneja", "Netlify", "Anthropic", "Meta", "Confirmar y acceder",
                                    "Retirar su consentimiento", "Borrarlos", "45 días", "Apelaciones", "Procurador General", EMAIL])):
        text = html.unescape(re.sub(r"<[^>]+>", " ", (ROOT / "public" / path.strip("/") / "index.html").read_text()))
        text = re.sub(r"\s+", " ", text)
        missing = [m for m in must if m not in text]
        check(f"{path}: says what's collected, from where, why, who handles it, the rights, deadlines and appeals", not missing, str(missing))
    for home, policy in (("index.html", HEALTH_EN), ("es/index.html", HEALTH_ES)):
        h = (ROOT / "public" / home).read_text()
        promise = h[h.index('id="privacy-promise"'):h.index("</section>", h.index('id="privacy-promise"'))]
        foot = h[h.index("<footer"):h.index("</footer>")]
        check(f"/{home.replace('index.html', '')}: links the health data policy from the privacy promise and the footer",
              f'href="{policy}"' in promise and f'href="{policy}"' in foot)
    for entry in LANDING.PAGES:
        for lang, policy in (("en", HEALTH_EN), ("es", HEALTH_ES)):
            path = LANDING.path(entry, lang)
            h = (ROOT / "public" / path.strip("/") / "index.html").read_text()
            note = re.search(r'<form class="form" id="join-form".*?</form>', h, re.S).group(0)
            check(f"{path}: the waitlist form links the health data policy", f'href="{policy}"' in note)
    check("the privacy policy links the health data policy",
          f'href="{HEALTH_EN}"' in (ROOT / "public" / "privacy" / "index.html").read_text().split("<footer")[0])

    # 12b) The only prices on the site are Jachi's plan prices (membership.py); terms keep their $100 liability cap.
    # Providers set and confirm their own prices, so no page or assistant answer quotes one. Ad pages show none at all.
    plan_amounts = [c for p in MEMBERSHIP.PLANS for c in (p["monthly"], p["yearly"], p.get("founding")) if c] + [MEMBERSHIP.EXTRA_ADULT]
    plan_prices = {MEMBERSHIP.money(c, cents) for c in plan_amounts for cents in (False, True)}
    stray, ad_priced = [], []
    for f in sorted((ROOT / "public").rglob("*.html")):
        rel = "/" + str(f.relative_to(ROOT / "public"))
        text = re.sub(r"<(script|style)\b.*?</\1>", " ", f.read_text(), flags=re.S)
        amounts = set(re.findall(r"\$\s?\d[\d,]*(?:\.\d+)?", html.unescape(re.sub(r"<[^>]+>", " ", text))))
        if rel.startswith(("/join/", "/es/unase/")):
            if amounts:
                ad_priced.append(rel)
            continue
        allowed = plan_prices | ({"$100"} if rel == "/terms/index.html" else set())
        if amounts - allowed:
            stray.append(f"{rel}: {sorted(amounts - allowed)}")
    check("every price on the site is a Jachi plan price", not stray, json.dumps(stray[:8]))
    check("the ad landing pages show no prices", not ad_priced, str(ad_priced))
    chat_src = (ROOT / "netlify" / "functions" / "chat.mjs").read_text()
    chat_amounts = set(re.findall(r"\$\s?\d[\d,]*(?:\.\d+)?", chat_src))
    check("the assistant knows only the plan prices and never quotes a provider's", chat_amounts and chat_amounts <= plan_prices
          and "Never quote, estimate or compare what a provider" in chat_src, str(sorted(chat_amounts)))
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page, logs = setup(ctx)
    page.goto(f"{BASE}/weight-loss/", wait_until="networkidle"); page.wait_for_timeout(300)
    glance = page.locator(".glance").inner_text()
    check("service page summary: the kind of care, care coordination, and the plans' starting price",
          "Weight management" in glance and "Care coordination" in glance and "Plans from $49 a month" in glance
          and "bill their care separately" in glance, glance)
    check("prices: no console errors", not logs, json.dumps(logs))
    ctx.close()

    # 12c) Membership: the plans pages and the checkout (Stripe is never called: the page's API answers are stood in)
    sm_text = get("/sitemap.xml")[2].decode()
    check("plans pages are in the sitemap, checkout pages are not", "/plans/" in sm_text and "/es/planes/" in sm_text
          and "/membership/" not in sm_text and "/es/membresia/" not in sm_text)
    for lang, plans_path, checkout_path, per in (("en", "/plans/", "/membership/", "/month"), ("es", "/es/planes/", "/es/membresia/", "/mes")):
        ctx = browser.new_context(viewport={"width": 390, "height": 844})
        page, logs = setup(ctx)
        page.goto(BASE + plans_path, wait_until="networkidle"); page.wait_for_timeout(300)
        prices = page.locator(".m-plan__price").all_inner_texts()
        links = page.evaluate("[...document.querySelectorAll('.m-plan .btn')].map(a => a.getAttribute('href'))")
        check(f"{plans_path}: three plans at $49, $99 and $250 a month, each starting checkout",
              ["".join(x.split()) for x in prices] == [f"$49{per}", f"$99{per}", f"$250{per}"]
              and links == [f"{checkout_path}?plan={k}" for k in ("concierge", "plus", "signature")], f"{prices} {links}")
        check(f"{plans_path}: founding price and the not-insurance note", "$39" in page.locator(".m-plan--featured").inner_text()
              and page.locator(".note-box").count() >= 1)
        check(f"{plans_path}: no sideways scrolling at 390px", page.evaluate("document.documentElement.scrollWidth") <= 390)
        sent = []
        page.route("**/api/membership/plans", lambda route: route.fulfill(status=200, content_type="application/json", body=json.dumps(
            {"ok": True, "daysUntilDue": 3, "plans": {"concierge": {"monthly": 4900, "yearly": 49000, "founding": {"amount": 3900, "open": True, "limit": 100, "remaining": 12}, "extraAdult": {"monthly": 2500, "max": 3}},
                                                     "plus": {"monthly": 9900, "yearly": 99000}, "signature": {"monthly": 25000, "yearly": 250000}}})))

        def start(route):
            sent.append(json.loads(route.request.post_data))
            route.fulfill(status=200, content_type="application/json", body=json.dumps(
                {"ok": True, "status": "invoice_sent", "email": "m\u2022\u2022\u2022\u2022@example.com", "amountDue": 8900,
                 "invoiceNumber": "JH-0001", "dueDate": 1795000000}))
        page.route("**/api/membership/start", start)
        page.goto(BASE + checkout_path + "?plan=concierge", wait_until="networkidle"); page.wait_for_timeout(300)
        check(f"{checkout_path}: live founding spots shown", "12" in page.locator("#m-founding-note").inner_text())
        page.locator("#m-plus").click(); page.locator("#m-plus").click()
        check(f"{checkout_path}: two added adults make $89.00", page.locator("#m-total").inner_text() == "$89.00")
        page.locator("label:has(input[name='billing'][value='yearly'])").click()
        check(f"{checkout_path}: yearly hides the monthly-only adults and shows $490.00",
              page.locator("#m-adults").is_hidden() and page.locator("#m-total").inner_text() == "$490.00")
        page.locator("label:has(input[name='billing'][value='monthly'])").click()
        page.locator("#m-plus").click(); page.locator("#m-plus").click()
        page.locator("#m-submit").click(); page.wait_for_timeout(200)
        shown = page.evaluate("[...document.querySelectorAll('.m-checkout .err:not([hidden])')].length")
        check(f"{checkout_path}: an empty form shows five field errors and sends nothing", shown == 5 and not sent, str(shown))
        page.locator("#m-name").fill("Maria Lopez"); page.locator("#m-email").fill("maria@example.com")
        page.locator("#m-phone").fill("(214) 555-0142")
        page.locator("#m-check-nonclinical").click(); page.locator("#m-check-terms").click()
        page.locator("#m-submit").click(); page.wait_for_timeout(500)
        check(f"{checkout_path}: sends the plan, card-by-invoice and both agreements", len(sent) == 1
              and sent[0]["plan"] == "concierge" and sent[0]["extraAdults"] == 2 and sent[0]["payment"] == "card_invoice"
              and sent[0]["agreeTerms"] is True and sent[0]["agreeNonclinical"] is True and sent[0]["language"] == lang, json.dumps(sent))
        check(f"{checkout_path}: confirmation says the invoice was emailed", page.locator("#m-done").is_visible()
              and "$89.00" in page.locator("#m-done-text").inner_text() and page.locator("#m-form").is_hidden())
        check(f"{checkout_path}: no sideways scrolling, no console errors", page.evaluate("document.documentElement.scrollWidth") <= 390
              and not logs, json.dumps(logs))
        page.screenshot(path=str(OUT / f"membership-{lang}-done.png"))
        ctx.close()

    # 13) Search engine files and fonts
    status, headers, body = get("/sitemap.xml")
    sm = body.decode()
    all_svc = [path for _lang, _slug, path in svc_pages]
    missing = [u for u in ["/", "/es/", "/privacy/", "/terms/", "/texas-medical-board/"] + all_svc + content_pages
               if f"<loc>https://jachihealth.com{u}</loc>" not in sm]
    check("sitemap lists every page, with the Spanish alternate", not missing and 'hreflang="es"' in sm, str(missing))
    # Structured data, titles and descriptions on every page search engines see
    indexable = ["/", "/es/", "/privacy/", "/terms/", "/texas-medical-board/"] + all_svc + content_pages
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
    service_ok = all(any(n.get("@type") == "WebPage" and (n.get("mainEntity") or {}).get("@type") == "Service"
                         and n["mainEntity"].get("serviceType") == "Care coordination" for n in nodes_by_page[u]) for u in all_svc)
    check("structured data: valid, connected, organization, website and FAQ on both home pages, a care-coordination service on service pages",
          not sd_problems and all(t == ["Organization", "WebSite", "WebPage", "FAQPage"] for t in home_types) and service_ok,
          json.dumps(sd_problems[:6] + home_types))
    check("search titles fit (65 characters) and descriptions fit (50 to 160)", not meta_problems, json.dumps(meta_problems))
    titles = {}
    for u in indexable:
        h = (ROOT / "public" / u.strip("/") / "index.html").read_text()
        titles.setdefault(re.search(r"<title>(.*?)</title>", h).group(1), []).append(u)
    check("every page search engines see has its own title", all(len(v) == 1 for v in titles.values()),
          json.dumps({k: v for k, v in titles.items() if len(v) > 1}))
    # hreflang: every page that names a version in another language is named back by it, with the same set
    alt_sets, alt_problems = {}, []
    for u in indexable:
        h = (ROOT / "public" / u.strip("/") / "index.html").read_text()
        alt_sets[u] = dict(re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="https://jachihealth\.com([^"]+)">', h))
    for u, alts in alt_sets.items():
        if not alts:
            continue
        if alts.get("en" if not u.startswith("/es/") else "es") != u or "x-default" not in alts:
            alt_problems.append(f"{u}: doesn't name itself or x-default")
        for code, other in alts.items():
            if alt_sets.get(other) != alts:
                alt_problems.append(f"{u} → {code} {other}: not reciprocal")
    check("hreflang: every page and its other-language twin name each other, with x-default",
          not alt_problems and all(alt_sets[u] for u in all_svc), json.dumps(alt_problems[:6]))
    # Sitemap dates: each page lists the day its words last changed, kept between builds in sitemap_dates.json
    entries = re.findall(r"<url>\s*<loc>https://jachihealth\.com([^<]+)</loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})</lastmod>", sm)
    dates = json.loads((ROOT / "sitemap_dates.json").read_text())
    check("sitemap: every page has a last-changed date that matches sitemap_dates.json",
          len(entries) == sm.count("<url>") and all(dates.get(u, {}).get("date") == d for u, d in entries)
          and set(dates) == {u for u, _d in entries}, f"{len(entries)} of {sm.count('<url>')}")
    # IndexNow: the key file Bing checks before it accepts a list of changed pages
    key_files = [f for f in (ROOT / "public").glob("*.txt") if re.fullmatch(r"[0-9a-f]{32}", f.stem)]
    if len(key_files) == 1:
        status, headers, body = get(f"/{key_files[0].name}")
        check("IndexNow key file is served as plain text and holds its own key", status == 200
              and "text/plain" in headers.get("Content-Type", "") and body.decode().strip() == key_files[0].stem
              and key_files[0].name not in sm, f"{status} {headers.get('Content-Type')}")
    else:
        check("IndexNow key file is served as plain text and holds its own key", False, f"{len(key_files)} key files")
    # Care is credited to the providers, never to Jachi ("your provider decides", not "we treat")
    credited = []
    for f in sorted((ROOT / "public").rglob("*.html")):
        text = re.sub(r"<(script|style)\b.*?</\1>", " ", f.read_text(), flags=re.S)
        text = html.unescape(re.sub(r"<[^>]+>", " ", text))
        hits = re.findall(r"\bwe(?:'ll)? (?:treat|prescribe|diagnose|refill)\b(?! them as)", text, re.I)
        hits += re.findall(r"(?<!No )(?<!no )(?<!ni )(?<!los )\b(?:tratamos|recetamos|diagnosticamos|resurtimos|trataremos|recetaremos)\b", text)
        if hits:
            credited.append(f"{f.relative_to(ROOT / 'public')}: {hits[:3]}")
    check("care is credited to providers, not to Jachi, in both languages", not credited, json.dumps(credited[:6]))
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
          and page.locator("[data-view=off] a[href='/join/']").count() == 1)
    page.goto(f"{BASE}/admin/", wait_until="networkidle"); page.wait_for_timeout(500)
    check("admin: explains how to turn accounts on while Identity is off", view(page) == "off" and "Enable Identity" in page.locator("[data-view=off]").inner_text())
    check("accounts off: no unexpected console errors", not expected_http_errors(logs), json.dumps(logs))
    ctx.close()

    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page, logs = setup(ctx)
    fake = FakeIdentity()
    fake.attach(page)
    page.route(f"{BASE}/", lambda r: r.fulfill(status=200, body="ok") if r.request.method == "POST" else r.continue_())
    page.goto(f"{BASE}/join/", wait_until="networkidle"); page.wait_for_timeout(400)
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
