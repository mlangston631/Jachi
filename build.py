#!/usr/bin/env python3
"""Build the Jachi Health website from src/, content.py and chatbot.py.

Run `python3 build.py` after any change, then commit the output with the source.

Deployed by Netlify (see netlify.toml):
  public/index.html              the website (one self-contained page)
  public/404.html                the "page not found" page
  public/icon.svg                the browser tab icon
  public/robots.txt, sitemap.xml for search engines
  netlify/functions/chat.mjs     the help chat's server code (POST /api/chat)

Not deployed (ignored by git):
  dist/jachi-health.html         the same page as a Claude artifact preview
  dist/artifact-sim.html         that preview wrapped the way the artifact viewer wraps it, for tests

The images in public/ (og.jpg, apple-touch-icon.png, favicon.ico) are made by
tools/make_images.py and only need remaking when the logo or headline changes.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
PUBLIC = ROOT / "public"
FUNCTIONS = ROOT / "netlify" / "functions"
DIST = ROOT / "dist"
for d in (PUBLIC, FUNCTIONS, DIST):
    d.mkdir(parents=True, exist_ok=True)

import chatbot
from brand import mark, icon_svg_file
from content import PRICES, EMAIL, SERVICES, BY_KEY, FINDER, TREATED, NOT_OFFERED, EMERGENCIES, CRISIS, POPULAR, FAQ

SITE_URL = "https://www.jachihealth.com"

ICONS = {
    "arrow": '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    "arrow-left": '<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>',
    "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    "steth": '<path d="M6 3.5V9a4 4 0 0 0 8 0V3.5"/><path d="M10 13v1.5a5 5 0 0 0 10 0V12.5"/><circle cx="20" cy="10.5" r="2"/>',
    "shield": '<path d="M12 3l7 3v5.5c0 4.4-3 8.1-7 9.5-4-1.4-7-5.1-7-9.5V6z"/><path d="M8.8 12.2l2.2 2.2 4.4-4.6"/>',
    "spark": '<path d="M11 4c.6 4.2 2.4 6 6.6 6.6-4.2.6-6 2.4-6.6 6.6-.6-4.2-2.4-6-6.6-6.6C8.6 10 10.4 8.2 11 4z"/><path d="M19 3.5v3M17.5 5h3"/>',
    "user": '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
    "box": '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5"/><path d="M12 12v9"/>',
    "home": '<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
    "pharmacy": '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M12 8.5v7M8.5 12h7"/>',
    "lock": '<rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6v.4"/>',
    "alert": '<path d="M12 4.5l8.5 15h-17z"/><path d="M12 10v4.2"/><path d="M12 16.8v.3"/>',
    "msg": '<path d="M4 5.5h16v11H10l-4.5 3.5v-3.5H4z"/>',
    "clip": '<rect x="5.5" y="4.5" width="13" height="16" rx="2"/><path d="M9 4.5v-1h6v1"/><path d="M9 10h6M9 14h4"/>',
    "x": '<path d="M6 6l12 12M18 6L6 18"/>',
    "mail": '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4.5 7.5l7.5 5.5 7.5-5.5"/>',
    "thermo": '<path d="M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0Z"/><path d="M12 9.5v6"/>',
    "pill": '<rect x="3.5" y="8.5" width="17" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M9.6 9.6l4.8 4.8"/>',
    "mind": '<path d="M9.5 20v-3.2H7.4a1.9 1.9 0 0 1-1.9-1.9v-2.3L4 11.2l1.6-2.4a6.6 6.6 0 0 1 6.6-5.3c3.7 0 6.3 2.8 6.3 6.4 0 2-.9 3.6-2.3 4.8V20"/><path d="M12.6 11.7s-2.6-1.4-2.6-3.1a1.4 1.4 0 0 1 2.6-.8 1.4 1.4 0 0 1 2.6.8c0 1.7-2.6 3.1-2.6 3.1z"/>',
    "scale": '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 10a5 5 0 0 1 7 0"/><path d="M12 12.6l1.7-2.5"/>',
    "phone": '<path d="M6.6 4h2.6l1.4 3.6-1.8 1.2a10 10 0 0 0 6.4 6.4l1.2-1.8 3.6 1.4v2.6a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.6 6.2 2 2 0 0 1 6.6 4z"/>',
    "heart": '<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/>',
    "talk": '<path d="M6.5 3h7A2.5 2.5 0 0 1 16 5.5v4A2.5 2.5 0 0 1 13.5 12H9l-3.5 3v-3.1A2.5 2.5 0 0 1 4 9.5v-4A2.5 2.5 0 0 1 6.5 3z"/><path d="M19 9a2 2 0 0 1 1.5 1.9v3.6a2.5 2.5 0 0 1-2.5 2.5h-.5v2.6L14.6 17H11a2 2 0 0 1-1.6-.8"/>',
    "male": '<circle cx="10" cy="14" r="5.5"/><path d="M14 10l6-6"/><path d="M15 4h5v5"/>',
    "female": '<circle cx="12" cy="9" r="5.5"/><path d="M12 14.5V21"/><path d="M9 18h6"/>',
    "drop": '<path d="M12 3.5c3.4 4.2 6 7.4 6 10.6a6 6 0 0 1-12 0c0-3.2 2.6-6.4 6-10.6z"/><path d="M9.2 14.6a2.9 2.9 0 0 0 2.4 2.6"/>',
    "video": '<rect x="3" y="6.5" width="12.5" height="11" rx="2.5"/><path d="M15.5 10.5l5-3v9l-5-3"/>',
    "search": '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    "chat": '<path d="M5 5.5h14A1.5 1.5 0 0 1 20.5 7v8.5A1.5 1.5 0 0 1 19 17h-9l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z"/><path d="M8.5 11.25h.01M12 11.25h.01M15.5 11.25h.01"/>',
    "send": '<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>',
}

def icon_svg(name, extra=""):
    cls = ("i " + extra).strip()
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{ICONS[name]}</svg>'


STATES = [
    ("AL", "Alabama"), ("AK", "Alaska"), ("AZ", "Arizona"), ("AR", "Arkansas"), ("CA", "California"),
    ("CO", "Colorado"), ("CT", "Connecticut"), ("DE", "Delaware"), ("DC", "District of Columbia"),
    ("FL", "Florida"), ("GA", "Georgia"), ("HI", "Hawaii"), ("ID", "Idaho"), ("IL", "Illinois"),
    ("IN", "Indiana"), ("IA", "Iowa"), ("KS", "Kansas"), ("KY", "Kentucky"), ("LA", "Louisiana"),
    ("ME", "Maine"), ("MD", "Maryland"), ("MA", "Massachusetts"), ("MI", "Michigan"), ("MN", "Minnesota"),
    ("MS", "Mississippi"), ("MO", "Missouri"), ("MT", "Montana"), ("NE", "Nebraska"), ("NV", "Nevada"),
    ("NH", "New Hampshire"), ("NJ", "New Jersey"), ("NM", "New Mexico"), ("NY", "New York"),
    ("NC", "North Carolina"), ("ND", "North Dakota"), ("OH", "Ohio"), ("OK", "Oklahoma"), ("OR", "Oregon"),
    ("PA", "Pennsylvania"), ("RI", "Rhode Island"), ("SC", "South Carolina"), ("SD", "South Dakota"),
    ("TN", "Tennessee"), ("TX", "Texas"), ("UT", "Utah"), ("VT", "Vermont"), ("VA", "Virginia"),
    ("WA", "Washington"), ("WV", "West Virginia"), ("WI", "Wisconsin"), ("WY", "Wyoming"),
]
state_options = ('<optgroup label="Launching first"><option value="TX">Texas</option></optgroup>'
                 '<optgroup label="All other states">'
                 + "".join(f'<option value="{c}">{n}</option>' for c, n in STATES if c != "TX")
                 + "</optgroup>")

faq_html = "\n".join(
    f'<div class="faq-item"><h3><button class="faq-q" type="button" id="faq-q-{i}" aria-expanded="false" '
    f'aria-controls="faq-a-{i}">{html.escape(q)}<span class="faq-icon" aria-hidden="true"></span></button></h3>'
    f'<div class="faq-a" id="faq-a-{i}"><div><p>{html.escape(a)}</p></div></div></div>'
    for i, (q, a) in enumerate(FAQ, 1)
)


esc = html.escape


def service_card(svc, i):
    items = "".join(f"<li>{icon_svg('check')}<span>{esc(t)}</span></li>" for t in svc["items"])
    tag_cls = "svc__tag svc__tag--member" if svc["tag"] == "Membership" else "svc__tag"
    if svc.get("elig"):
        cta = ('<a class="btn btn--ghost btn--block" href="#eligibility" data-elig>Check your eligibility'
               '<span class="visually-hidden"> for weight care</span></a>')
    else:
        cta = (f'<button class="btn btn--ghost btn--block" type="button" data-join="{svc["interest"]}">Get early access'
               f'<span class="visually-hidden"> for {esc(svc["name"].lower())}</span></button>')
    return (f'<article class="svc" id="svc-{svc["key"]}" data-reveal style="--d:{(i % 3) * 80}ms">'
            f'<span class="svc__ic">{icon_svg(svc["icon"])}</span>'
            f'<h3>{esc(svc["name"])}</h3>'
            f'<span class="{tag_cls}">{svc["tag"]}</span>'
            f'<p class="svc__price"><b>{svc["price"]}</b><span>{svc["unit"]}</span></p>'
            f'<p class="svc__desc">{esc(svc["desc"])}</p>'
            f'<ul class="svc__list">{items}</ul>{cta}</article>')


def hit_row(kind, name, terms, meta, note, ic, cta):
    note_html = f'<span class="hit__note">{note}</span>' if note else ""
    return (f'<li class="hit hit--{kind}" data-name="{esc(name)}" data-terms="{esc(terms)}" hidden>'
            f'<span class="hit__ic">{icon_svg(ic)}</span>'
            f'<div class="hit__text"><b>{esc(name)}</b><small>{meta}</small>{note_html}</div>{cta}</li>')


def condition_rows():
    rows = []
    for name, cat, terms, note in TREATED:
        lower = esc(name[0].lower() + name[1:]) if not name[:2].isupper() else esc(name)
        if cat == "mental+therapy":
            meta = (f"Therapy {PRICES['therapy']} per session, or medication care {PRICES['mental']} a month")
            ic, interest = "mind", "therapy,anxiety-depression"
        else:
            svc = BY_KEY[cat]
            meta = f"{esc(svc['name'])} · {svc['price']} {svc['unit']}"
            ic, interest = svc["icon"], svc["interest"]
        if cat == "weight":
            cta = ('<a class="btn btn--ghost btn--sm hit__cta" href="#eligibility" data-elig>Check eligibility'
                   '<span class="visually-hidden"> for weight care</span></a>')
        else:
            cta = (f'<button class="btn btn--ghost btn--sm hit__cta" type="button" data-join="{interest}">Get early access'
                   f'<span class="visually-hidden"> for {lower}</span></button>')
        rows.append(hit_row("ok", name, terms, meta, esc(note), ic, cta))
    for name, terms, note in NOT_OFFERED:
        rows.append(hit_row("no", name, terms, "Not offered", note, "info", ""))
    call911 = f'<a class="btn btn--danger btn--sm hit__cta" href="tel:911">{icon_svg("phone")}Call 911</a>'
    for name, terms, note in EMERGENCIES:
        rows.append(hit_row("911", name, terms, "Emergency", note, "alert", call911))
    name, terms, note = CRISIS
    ctas = (f'<div class="hit__ctas"><a class="btn btn--sm" href="tel:988">{icon_svg("phone")}Call 988</a>'
            f'<a class="btn btn--ghost btn--sm" href="sms:988">{icon_svg("msg")}Text 988</a></div>')
    rows.append(hit_row("988", name, terms, "Get support now", note, "heart", ctas))
    return "\n".join(rows)


service_cards = "\n".join(service_card(svc, i) for i, svc in enumerate(SERVICES))
finder_needs = "".join(
    f'<label class="need"><input type="radio" name="need" value="{k}"><span><i class="need__ic">{icon_svg(ic)}</i>'
    f'<b>{esc(t)}</b><small>{esc(sub)}</small></span></label>' for k, ic, t, sub in FINDER)
join_interests = "".join(
    f'<label class="check"><input type="checkbox" name="interest" value="{svc["interest"]}"><span>{esc(svc.get("chip", svc["name"]))}</span></label>'
    for svc in SERVICES)
footer_care = "".join(f'<li><a href="#svc-{svc["key"]}">{esc(svc["name"])}</a></li>' for svc in SERVICES)
popular = "".join(f'<button type="button" data-q="{esc(q)}">{esc(q)}</button>' for q in POPULAR)
TOKENS = {
    "{{SERVICE_CARDS}}": service_cards,
    "{{FINDER_NEEDS}}": finder_needs,
    "{{JOIN_INTERESTS}}": join_interests,
    "{{FOOTER_CARE}}": footer_care,
    "{{CONDITION_ROWS}}": condition_rows(),
    "{{POPULAR}}": popular,
    "{{CONDITION_COUNT}}": str(len(TREATED)),
}


def render(text):
    text = text.replace("{{STATE_OPTIONS}}", state_options)
    text = text.replace("{{FAQ_ITEMS}}", faq_html)
    for token, value in TOKENS.items():
        text = text.replace(token, value)
    for key, value in PRICES.items():
        text = text.replace("{{PRICE_" + key.upper() + "}}", value)
    text = text.replace("{{EMAIL}}", EMAIL)
    text = re.sub(r"\{\{MARK:([\w-]+):(\w+)(?::([\w -]+))?\}\}",
                  lambda m: mark(m.group(1), m.group(2), m.group(3) or ""), text)
    text = re.sub(r"\{\{I:([\w-]+)(?::([\w -]+))?\}\}",
                  lambda m: icon_svg(m.group(1), m.group(2) or ""), text)
    leftover = re.findall(r"\{\{[^}]*\}\}", text)
    if leftover:
        raise SystemExit(f"Unreplaced tokens: {leftover[:5]}")
    return text


css = (SRC / "style.css").read_text()
body = render((SRC / "page.html").read_text())
js_base = ((SRC / "app.js").read_text()
      .replace("/*ICONS_JSON*/", json.dumps(ICONS))
      .replace("/*PRICES_JSON*/", json.dumps(PRICES))
      .replace("/*EMAIL_JSON*/", json.dumps(EMAIL))
      .replace("/*SERVICES_JSON*/", json.dumps({svc["key"]: {"name": svc["name"], "price": svc["price"], "unit": svc["unit"], "interest": svc["interest"]} for svc in SERVICES})))
if re.search(r"/\*[A-Z_]+_JSON\*/", js_base):
    raise SystemExit("data not injected: " + re.search(r"/\*[A-Z_]+_JSON\*/", js_base).group())
if "/*CHAT_RULES*/" not in js_base:
    raise SystemExit("chat rules hook missing")
js_artifact = js_base.replace("/*CHAT_RULES*/", json.dumps(chatbot.system_prompt()))
js = js_base.replace("/*CHAT_RULES*/", "null")
(FUNCTIONS / "chat.mjs").write_text(chatbot.function_source())

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;'
         '1,9..144,300..700&family=Instrument+Sans:wght@400;500;600;700&display=swap">')

DESCRIPTION = (f"See a licensed clinician online for urgent care, refills, therapy, sexual health, men's and women's "
               f"health, skin and weight care. {PRICES['visit']} visits, no insurance needed. Launching in Texas.")
TITLE = "Jachi Health | Online urgent care, therapy, sexual health and more"
SHARE_ALT = "Jachi Health: online care, rooted in real medicine. Licensed clinicians, no insurance needed."

ICON_LINKS = ('<link rel="icon" href="/favicon.ico" sizes="32x32">\n'
              '<link rel="icon" href="/icon.svg" type="image/svg+xml">\n'
              '<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n'
              '<meta name="apple-mobile-web-app-title" content="Jachi Health">\n'
              '<meta name="application-name" content="Jachi Health">')

ORG_LD = json.dumps({"@context": "https://schema.org", "@type": "Organization", "name": "Jachi Health",
                     "url": f"{SITE_URL}/", "logo": f"{SITE_URL}/apple-touch-icon.png", "email": EMAIL,
                     "description": DESCRIPTION})


def head(title, description, extra=""):
    return f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
<meta name="theme-color" content="#F5F7F2">
{ICON_LINKS}
{extra}{FONTS}"""


# ---------- The website ----------
index_head = head(TITLE, DESCRIPTION, f"""<link rel="canonical" href="{SITE_URL}/">
<meta property="og:type" content="website">
<meta property="og:url" content="{SITE_URL}/">
<meta property="og:site_name" content="Jachi Health">
<meta property="og:title" content="{esc(TITLE)}">
<meta property="og:description" content="{esc(DESCRIPTION)}">
<meta property="og:image" content="{SITE_URL}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{esc(SHARE_ALT)}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{ORG_LD}</script>
""")

page = f"""<!doctype html>
<html lang="en">
<head>
{index_head}
<style>
{css}
</style>
</head>
<body>
{body}
<script>
{js}
</script>
</body>
</html>
"""
(PUBLIC / "index.html").write_text(page)

# ---------- Page not found ----------
NOT_FOUND_CSS = """
.nf-page{position:relative;min-height:100vh;min-height:100svh;display:flex;flex-direction:column;overflow:hidden;padding:0}
.nf-top{display:flex;align-items:center;min-height:var(--header-h);padding-top:env(safe-area-inset-top,0px)}
.nf{position:relative;z-index:1;flex:1;display:grid;align-content:center;justify-items:start;gap:22px;padding-block:40px 64px}
.nf .display{max-width:12ch}
.nf .lead{max-width:30em}
.nf .fine a{color:var(--forest);font-weight:600;text-underline-offset:3px}
.nf__art{position:absolute;z-index:0;right:-140px;bottom:-170px;width:min(620px,80vw);color:rgba(30,74,59,.08);transform:rotate(-18deg);pointer-events:none}
@media (max-width:640px){.nf__art{right:-180px;bottom:-120px}.nf .cta-row .btn{width:100%}}
"""
not_found_body = render((SRC / "404.html").read_text())
not_found = f"""<!doctype html>
<html lang="en">
<head>
{head("Page not found | Jachi Health", "This page doesn't exist. Visit Jachi Health's homepage for online care from licensed clinicians.", '<meta name="robots" content="noindex">' + chr(10))}
<style>
{css}
{NOT_FOUND_CSS}
</style>
</head>
<body>
{not_found_body}
</body>
</html>
"""
(PUBLIC / "404.html").write_text(not_found)

# ---------- Icons and search engine files ----------
(PUBLIC / "icon.svg").write_text(icon_svg_file())
(PUBLIC / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n")
(PUBLIC / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    f'  <url><loc>{SITE_URL}/</loc></url>\n'
    '</urlset>\n')

# ---------- Claude artifact preview (not deployed) ----------
artifact = f"""<title>Jachi Health</title>
<meta name="claude:viewport-fit-sides" content="cover">
{FONTS}
<style>
{css}
</style>
{body}
<script>
{js_artifact}
</script>
"""
(DIST / "jachi-health.html").write_text(artifact)
(DIST / "artifact-sim.html").write_text(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" '
    'content="width=device-width, initial-scale=1"></head><body>' + artifact + '</body></html>')

missing = [n for n in ("og.jpg", "apple-touch-icon.png", "favicon.ico") if not (PUBLIC / n).exists()]
if missing:
    print("note: run tools/make_images.py to create", ", ".join(missing))
print(f"built public/index.html ({len(page):,} bytes), public/404.html, netlify/functions/chat.mjs, dist/ preview")
