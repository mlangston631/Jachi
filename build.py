#!/usr/bin/env python3
"""Build the Jachi Health website from src/, content.py, content_es.py, pages.py, strings.py and chatbot.py.

Run `python3 build.py` after any change, then commit the output with the source.

Deployed by Netlify (see netlify.toml), all written into public/:
  index.html                      English home page             (src/en/home.html)
  es/index.html                   Spanish home page             (src/es/home.html)
  <service>/index.html            one page per service          (src/en/service.html + pages.py)
  how-it-works/, es/como-funciona/ the "How Jachi works" page     (src/<lang>/how.html + content.HOW, content_es.HOW)
  learn/, es/guias/ and their guides                            (src/learn.html, src/article.html + learn.py)
  privacy/, terms/, texas-medical-board/   legal pages          (src/en/*.html)
  account/, es/account/           accounts for the waitlist    (src/account.html, account.js, identity.js)
  admin/                          the admin console              (src/admin.html, admin.js, identity.js)
  404.html, icon.svg, robots.txt, sitemap.xml
  fonts/*.woff2                   made by tools/make_fonts.py (not by this script)
  og.jpg, apple-touch-icon.png, favicon.ico   made by tools/make_images.py
and the server code in netlify/functions/: chat.mjs (POST /api/chat, from chatbot.py), and account.mjs and
admin.mjs (from src/functions/lib.mjs plus src/functions/<name>.mjs).

Every page shares src/<lang>/header.html, footer.html and chat.html. Not deployed (ignored by git):
dist/jachi-health.html, the English home page as a Claude artifact preview, and dist/artifact-sim.html.
"""
import base64
import hashlib
import html
import json
import re
from pathlib import Path

import chatbot
import content as EN_CONTENT
import content_es as ES_CONTENT
import learn as LEARN
import pages as PAGES
import strings
from brand import mark, icon_svg_file

ROOT = Path(__file__).parent
SRC = ROOT / "src"
PUBLIC = ROOT / "public"
FUNCTIONS = ROOT / "netlify" / "functions"
DIST = ROOT / "dist"
for d in (PUBLIC, FUNCTIONS, DIST):
    d.mkdir(parents=True, exist_ok=True)

# The address the site is served from. Netlify's primary domain is the bare domain (www redirects to it), so canonical
# links, the sitemap and structured data use it too.
SITE_URL = "https://jachihealth.com"
EMAIL = EN_CONTENT.EMAIL
esc = html.escape

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
    "share": '<path d="M12 15V4"/><path d="M8 8l4-4 4 4"/><path d="M6 11v7.5A1.5 1.5 0 0 0 7.5 20h9a1.5 1.5 0 0 0 1.5-1.5V11"/>',
    "plus": '<path d="M12 5.5v13M5.5 12h13"/>',
    "out": '<path d="M14 4.5h4.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 16.5L5.5 12 10 7.5"/><path d="M5.5 12H15"/>',
    "trash": '<path d="M4.5 7h15"/><path d="M9.5 7V4.8h5V7"/><path d="M6.5 7l1 12.5h9l1-12.5"/><path d="M10.2 10.8v5.4M13.8 10.8v5.4"/>',
    "download": '<path d="M12 4v11"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M5 19.5h14"/>',
    "refresh": '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4.2h-4.2"/>',
    "eye": '<path d="M2.8 12S6.2 5.5 12 5.5 21.2 12 21.2 12 17.8 18.5 12 18.5 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.8"/>',
    "eye-off": '<path d="M4 4l16 16"/><path d="M9.9 6A9.8 9.8 0 0 1 12 5.5c5.8 0 9.2 6.5 9.2 6.5a16.6 16.6 0 0 1-3 3.8M14.1 18.2a9.6 9.6 0 0 1-2.1.3c-5.8 0-9.2-6.5-9.2-6.5a16.4 16.4 0 0 1 3.4-4.2"/><path d="M10 10a2.8 2.8 0 0 0 4 4"/>',
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


# ---------- Content in each language ----------

class Lang:
    """Everything a page needs in one language. Spanish text is laid over the English structure."""

    def __init__(self, code):
        self.code = code
        self.T = strings.STRINGS[code]
        if code == "en":
            c = EN_CONTENT
            self.services = [dict(s) for s in c.SERVICES]
            self.finder = list(c.FINDER)
            self.treated = list(c.TREATED)
            self.not_offered = list(c.NOT_OFFERED)
            self.emergencies = list(c.EMERGENCIES)
            self.crisis = c.CRISIS
            self.popular = list(c.POPULAR)
            self.picker = [(label, key, f"/{slug}/") for label, key, slug in c.PICKER]
            self.faq = list(c.FAQ)
            self.build = c.BUILD
            self.pricing_note = c.PRICING_NOTE
            self.state_name = dict(STATES)
        else:
            es = ES_CONTENT
            self.services = []
            for s in EN_CONTENT.SERVICES:
                t = es.SERVICES[s["key"]]
                self.services.append({**s, **t, "chip": t.get("chip", t["name"])})
            self.finder = [(k, ic, *es.FINDER[k]) for k, ic, _t, _s in EN_CONTENT.FINDER]
            self.treated = [(es.TREATED[n][0], cat, f"{es.TREATED[n][1]} {terms}", es.TREATED[n][2])
                            for n, cat, terms, _note in EN_CONTENT.TREATED]
            self.not_offered = [(es.NOT_OFFERED[n][0], f"{es.NOT_OFFERED[n][1]} {terms}", es.NOT_OFFERED[n][2])
                                for n, terms, _note in EN_CONTENT.NOT_OFFERED]
            self.emergencies = [(es.EMERGENCIES[n][0], f"{es.EMERGENCIES[n][1]} {terms}", es.EMERGENCIES[n][2])
                                for n, terms, _note in EN_CONTENT.EMERGENCIES]
            self.crisis = (es.CRISIS[0], f"{es.CRISIS[1]} {EN_CONTENT.CRISIS[1]}", es.CRISIS[2])
            self.popular = list(es.POPULAR)
            if len(es.PICKER) != len(EN_CONTENT.PICKER):
                raise SystemExit("content_es.PICKER must match content.PICKER")
            self.picker = [(label, key, f"#svc-{key}") for label, (_l, key, _s) in zip(es.PICKER, EN_CONTENT.PICKER)]
            self.faq = list(es.FAQ)
            self.build = es.BUILD
            self.pricing_note = es.PRICING_NOTE
            self.state_name = {c: es.STATES.get(c, n) for c, n in STATES}
        for s in self.services:
            s.setdefault("ongoing", False)
        self.by_key = {s["key"]: s for s in self.services}


def lower_first(name):
    return name if name[:2].isupper() else name[0].lower() + name[1:]


def state_options(L):
    first = L.build["launching_first"]
    rest = L.build["all_states"]
    others = sorted(((c, L.state_name[c]) for c, _n in STATES if c != "TX"), key=lambda x: x[1])
    return (f'<optgroup label="{esc(first)}"><option value="TX">Texas</option></optgroup>'
            f'<optgroup label="{esc(rest)}">' + "".join(f'<option value="{c}">{esc(n)}</option>' for c, n in others)
            + "</optgroup>")


def faq_items(items):
    return "\n".join(
        f'<div class="faq-item"><h3><button class="faq-q" type="button" id="faq-q-{i}" aria-expanded="false" '
        f'aria-controls="faq-a-{i}">{esc(q)}<span class="faq-icon" aria-hidden="true"></span></button></h3>'
        f'<div class="faq-a" id="faq-a-{i}"><div><p>{esc(a)}</p></div></div></div>'
        for i, (q, a) in enumerate(items, 1))


def service_card(L, svc, i):
    B = L.build
    items = "".join(f"<li>{icon_svg('check')}<span>{esc(t)}</span></li>" for t in svc["items"])
    tag_cls = "svc__tag svc__tag--ongoing" if svc["ongoing"] else "svc__tag"
    name_lower = esc(svc["name"].lower())
    if svc.get("elig"):
        cta = (f'<a class="btn btn--ghost btn--block" href="#eligibility" data-elig>{esc(B["check_elig_long"])}'
               f'<span class="visually-hidden">{esc(B["for_weight"])}</span></a>')
    else:
        cta = (f'<button class="btn btn--ghost btn--block" type="button" data-join="{svc["interest"]}">{esc(B["join"])}'
               f'<span class="visually-hidden">{B["for"].format(x=name_lower)}</span></button>')
    if L.code == "en":
        title = (f'<h3><a class="svc__link" href="/{PAGES.SERVICE_SLUG[svc["key"]]}/">{esc(svc["name"])}'
                 f'<span class="visually-hidden">: {esc(B["learn_more"].format(x=svc["name"].lower()))}</span></a></h3>')
    else:
        title = f'<h3>{esc(svc["name"])}</h3>'
    return (f'<article class="svc" id="svc-{svc["key"]}" data-reveal style="--d:{(i % 3) * 80}ms">'
            f'<span class="svc__ic">{icon_svg(svc["icon"])}</span>{title}'
            f'<span class="{tag_cls}">{esc(svc["tag"])}</span>'
            f'<p class="svc__desc">{esc(svc["desc"])}</p>'
            f'<ul class="svc__list">{items}</ul>{cta}</article>')


def hit_row(kind, name, terms, meta, note, ic, cta):
    note_html = f'<span class="hit__note">{note}</span>' if note else ""
    return (f'<li class="hit hit--{kind}" data-name="{esc(name)}" data-terms="{esc(terms)}" hidden>'
            f'<span class="hit__ic">{icon_svg(ic)}</span>'
            f'<div class="hit__text"><b>{esc(name)}</b><small>{meta}</small>{note_html}</div>{cta}</li>')


def condition_rows(L):
    B = L.build
    rows = []
    for name, cat, terms, note in L.treated:
        lower = esc(lower_first(name))
        if cat == "mental+therapy":
            meta = esc(B["mental_meta"])
            ic, interest = "mind", "therapy,anxiety-depression"
        else:
            svc = L.by_key[cat]
            meta = f"{esc(svc['name'])} · {esc(svc['tag'])}"
            ic, interest = svc["icon"], svc["interest"]
        if cat == "weight":
            cta = (f'<a class="btn btn--ghost btn--sm hit__cta" href="#eligibility" data-elig>{esc(B["check_elig"])}'
                   f'<span class="visually-hidden">{esc(B["for_weight"])}</span></a>')
        else:
            cta = (f'<button class="btn btn--ghost btn--sm hit__cta" type="button" data-join="{interest}">{esc(B["join"])}'
                   f'<span class="visually-hidden">{B["for"].format(x=lower)}</span></button>')
        rows.append(hit_row("ok", name, terms, meta, esc(note), ic, cta))
    for name, terms, note in L.not_offered:
        rows.append(hit_row("no", name, terms, esc(B["not_offered"]), note, "info", ""))
    call911 = f'<a class="btn btn--danger btn--sm hit__cta" href="tel:911">{icon_svg("phone")}{esc(B["call_911"])}</a>'
    for name, terms, note in L.emergencies:
        rows.append(hit_row("911", name, terms, esc(B["emergency"]), note, "alert", call911))
    name, terms, note = L.crisis
    ctas = (f'<div class="hit__ctas"><a class="btn btn--sm" href="tel:988">{icon_svg("phone")}{esc(B["call_988"])}</a>'
            f'<a class="btn btn--ghost btn--sm" href="{esc(L.T["sms_988"])}">{icon_svg("msg")}{esc(B["text_988"])}</a></div>')
    rows.append(hit_row("988", name, terms, esc(B["support_now"]), note, "heart", ctas))
    return "\n".join(rows)


def footer_care(L, home):
    """The footer's Care links: English pages link to the service pages; the Spanish page (which has no
    Spanish service pages yet) links to its own service cards."""
    if L.code == "en":
        return "".join(f'<li><a href="/{PAGES.SERVICE_SLUG[s["key"]]}/">{esc(s["name"])}</a></li>' for s in L.services)
    return "".join(f'<li><a href="{home}#svc-{s["key"]}">{esc(s["name"])}</a></li>' for s in L.services)


# ---------- Rendering ----------

def render(text, L, tokens):
    for token, value in tokens.items():
        text = text.replace(token, value)
    text = text.replace("{{EMAIL}}", EMAIL).replace("{{PRICING_NOTE}}", esc(L.pricing_note))
    text = re.sub(r"\{\{T:(\w+)\}\}", lambda m: esc(L.T[m.group(1)]), text)
    text = re.sub(r"\{\{TH:(\w+)\}\}", lambda m: L.T[m.group(1)], text)  # trusted markup from strings.py
    text = re.sub(r"\{\{MARK:([\w-]+):(\w+)(?::([\w -]+))?\}\}",
                  lambda m: mark(m.group(1), m.group(2), m.group(3) or ""), text)
    text = re.sub(r"\{\{I:([\w-]+)(?::([\w -]+))?\}\}",
                  lambda m: icon_svg(m.group(1), m.group(2) or ""), text)
    leftover = re.findall(r"\{\{[^}]*\}\}", text)
    if leftover:
        raise SystemExit(f"Unreplaced tokens: {leftover[:5]}")
    return text


def part(lang, name):
    return (SRC / lang / f"{name}.html").read_text()


def heading(text):
    """A section heading from data: the site's headings end with a full stop. 'Therapy questions, answered.'"""
    return esc(text) + "."


def nw(escaped):
    """Keep hyphenated words like GLP-1 and follow-up on one line (escaped text in, markup out)."""
    return re.sub(r"\b(\w+(?:-\w+)+)\b", r'<span class="nw">\1</span>', escaped)


def guide_cards(lang, skip=None, level="h3"):
    """The Learn guides as a list of rows, each linking to its article. skip leaves one guide out."""
    W = LEARN.LABELS[lang]
    rows = []
    for a in LEARN.ARTICLES:
        if a["key"] == skip:
            continue
        t = a[lang]
        rows.append(f'<li class="guide"><p class="guide__topic">{esc(t["topic"])}</p>'
                    f'<{level} class="guide__title"><a class="guide__link" href="{LEARN.path(a, lang)}">{nw(esc(t["h1"]))}</a></{level}>'
                    f'<p class="guide__sum">{nw(esc(t["summary"]))}</p>'
                    f'<p class="guide__meta"><span>{esc(W["minutes"].format(n=t["minutes"]))}</span>{icon_svg("arrow")}</p></li>')
    return "\n".join(rows)


def crumbs(trail):
    items = []
    for label, href in trail:
        if href:
            items.append(f'<li><a href="{href}">{esc(label)}</a></li>')
        else:
            items.append(f'<li aria-current="page">{esc(label)}</li>')
    return f'<nav class="crumbs" aria-label="Breadcrumb"><ol>{"".join(items)}</ol></nav>'


def breadcrumb_node(trail, path):
    """BreadcrumbList for search. Steps that are only an anchor on another page (like /#services) are left out."""
    steps = [(label, href) for label, href in trail if not (href and "#" in href)]
    elements = [{"@type": "ListItem", "position": i, "name": label, "item": SITE_URL + (href if href else path)}
                for i, (label, href) in enumerate(steps, 1)]
    return {"@type": "BreadcrumbList", "@id": f"{SITE_URL}{path}#breadcrumb", "itemListElement": elements}


def breadcrumb_ld(trail, path):
    return {"@context": "https://schema.org", **breadcrumb_node(trail, path)}


css = (SRC / "style.css").read_text()
FONT_FILES = {p.name.split(".")[0]: p.name for p in sorted((PUBLIC / "fonts").glob("*.woff2"))}
if set(FONT_FILES) != {"fraunces", "fraunces-italic", "instrument-sans"}:
    raise SystemExit("Fonts missing: run python3 tools/make_fonts.py")
FONT_FACES = (
    f'@font-face{{font-family:"Fraunces";font-style:normal;font-weight:300 700;font-display:swap;src:url(/fonts/{FONT_FILES["fraunces"]}) format("woff2")}}\n'
    f'@font-face{{font-family:"Fraunces";font-style:italic;font-weight:300 700;font-display:swap;src:url(/fonts/{FONT_FILES["fraunces-italic"]}) format("woff2")}}\n'
    f'@font-face{{font-family:"Instrument Sans";font-style:normal;font-weight:400 700;font-display:swap;src:url(/fonts/{FONT_FILES["instrument-sans"]}) format("woff2")}}')
GOOGLE_FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
                '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
                '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;'
                '1,9..144,300..700&family=Instrument+Sans:wght@400;500;600;700&display=swap">')

ICON_LINKS = ('<link rel="icon" href="/favicon.ico" sizes="32x32">\n'
              '<link rel="icon" href="/icon.svg" type="image/svg+xml">\n'
              '<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n'
              '<meta name="apple-mobile-web-app-title" content="Jachi Health">\n'
              '<meta name="application-name" content="Jachi Health">')


def js_for(lang, rules=False):
    L = Lang(lang)
    text = ((SRC / "app.js").read_text()
            .replace("/*ICONS_JSON*/", json.dumps(ICONS))
            .replace("/*EMAIL_JSON*/", json.dumps(EMAIL))
            .replace("/*STRINGS_JSON*/", json.dumps({k: v for k, v in L.T.items() if not k.startswith("a_")}, ensure_ascii=False))
            .replace("/*SERVICES_JSON*/", json.dumps({s["key"]: {"name": s["name"], "tag": s["tag"], "interest": s["interest"]}
                                                      for s in L.services}, ensure_ascii=False)))
    if "/*CHAT_RULES*/" not in text:
        raise SystemExit("chat rules hook missing")
    text = text.replace("/*CHAT_RULES*/", json.dumps(chatbot.system_prompt()) if rules else "null")
    if re.search(r"/\*[A-Z_]+_JSON\*/", text):
        raise SystemExit("data not injected: " + re.search(r"/\*[A-Z_]+_JSON\*/", text).group())
    return text


def head(page, main_html):
    lang = page["lang"]
    url = SITE_URL + page["path"]
    # The italic (76 KB) is only a few words in headings: preloading it slowed the main fonts and the page's
    # largest paint (LCP) on phones, so it loads when first used instead.
    preload = ["fraunces", "instrument-sans"]
    links = "\n".join(f'<link rel="preload" href="/fonts/{FONT_FILES[f]}" as="font" type="font/woff2" crossorigin>'
                      for f in preload)
    alternates = ""
    if page.get("alternates"):
        alternates = "\n".join(f'<link rel="alternate" hreflang="{code}" href="{SITE_URL}{path}">'
                               for code, path in page["alternates"].items())
        alternates += f'\n<link rel="alternate" hreflang="x-default" href="{SITE_URL}{page["alternates"]["en"]}">\n'
    robots = '<meta name="robots" content="noindex">\n' if page.get("noindex") else ""
    canonical = "" if page.get("noindex") else f'<link rel="canonical" href="{url}">\n'
    og = ""
    if not page.get("noindex"):
        og = (f'<meta property="og:type" content="website">\n'
              f'<meta property="og:url" content="{url}">\n'
              f'<meta property="og:site_name" content="Jachi Health">\n'
              f'<meta property="og:locale" content="{"es_US" if lang == "es" else "en_US"}">\n'
              f'<meta property="og:title" content="{esc(page["title"])}">\n'
              f'<meta property="og:description" content="{esc(page["description"])}">\n'
              f'<meta property="og:image" content="{SITE_URL}/og.jpg">\n'
              f'<meta property="og:image:width" content="1200">\n'
              f'<meta property="og:image:height" content="630">\n'
              f'<meta property="og:image:alt" content="{esc(SHARE_ALT_ES if lang == "es" else SHARE_ALT)}">\n'
              f'<meta name="twitter:card" content="summary_large_image">\n')
    ld = "".join(f'<script type="application/ld+json">{json.dumps(item, ensure_ascii=False)}</script>\n'
                 for item in page.get("ld", []))
    return f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(page["title"])}</title>
<meta name="description" content="{esc(page["description"])}">
<meta name="theme-color" content="#F5F7F2">
{links}
{ICON_LINKS}
{robots}{canonical}{alternates}{og}{ld}<style>
{FONT_FACES}
{css}
{page.get("css", "")}
</style>"""


def script_policy(scripts):
    """A Content-Security-Policy that lets only these exact inline scripts run, by their SHA-256 hashes.
    The site-wide policy in netlify.toml allows any inline script; pages that handle sign-in tokens
    (account and admin) add this one too, and browsers enforce both, so injected code couldn't run there."""
    hashes = " ".join("'sha256-" + base64.b64encode(hashlib.sha256(js.encode("utf-8")).digest()).decode() + "'"
                      for js in scripts)
    return f"<meta http-equiv=\"Content-Security-Policy\" content=\"script-src {hashes}; object-src 'none'; base-uri 'self'\">\n"


def document(page, body):
    scripts = ([js_for(page["lang"])] if page.get("site_js", True) else []) + ([page["script"]] if page.get("script") else [])
    contents = [f"\n{js}\n" for js in scripts]
    tags = "\n".join(f"<script>{js}</script>" for js in contents)
    top = head(page, page.get("main", body))
    if page.get("strict_scripts"):
        top = top.replace('<meta charset="utf-8">\n', '<meta charset="utf-8">\n' + script_policy(contents), 1)
    return f"""<!doctype html>
<html lang="{page["lang"]}">
<head>
{top}
</head>
<body>
{body}
{tags}
</body>
</html>
"""


def page_js(name, L, extra=None):
    """src/identity.js followed by src/<name>.js, with the words, icons, email and any extra data filled in."""
    text = (SRC / "identity.js").read_text() + "\n" + (SRC / f"{name}.js").read_text()
    text = (text.replace("/*STRINGS_JSON*/", json.dumps(L.T, ensure_ascii=False))
                .replace("/*ICONS_JSON*/", json.dumps(ICONS))
                .replace("/*EMAIL_JSON*/", json.dumps(EMAIL)))
    for key, value in (extra or {}).items():
        text = text.replace(f"/*{key}_JSON*/", json.dumps(value, ensure_ascii=False))
    if re.search(r"/\*[A-Z_]+_JSON\*/", text):
        raise SystemExit(f"{name}.js: data not injected: " + re.search(r"/\*[A-Z_]+_JSON\*/", text).group())
    return text


def chrome_tokens(L, home, home_top, join_href, share_url="", alt_href=None):
    """Tokens for the shared header, footer, dock and chat. alt_href is the same page in the other language."""
    return {
        "{{HOME}}": home, "{{HOME_TOP}}": home_top, "{{JOIN_HREF}}": join_href,
        "{{FOOTER_CARE}}": footer_care(L, home), "{{SHARE_URL}}": share_url,
        "{{ALT_HREF}}": alt_href or ("/es/" if L.code == "en" else "/"),
        # The home page's "How it works" links go to its own section; every other page links to the full page.
        "{{HOW_HREF}}": "#how" if home == "" else ("/how-it-works/" if L.code == "en" else "/es/como-funciona/"),
    }


def write(path, text):
    out = PUBLIC / path.lstrip("/")
    if path.endswith("/"):
        out = out / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text)
    return out


# Search titles and descriptions: under about 60 and 160 characters so Google shows them whole.
ORG_DESCRIPTION = ("See a licensed clinician online for urgent care, refills, therapy, sexual health, men's and women's "
                   "health, skin and weight care. No insurance needed. Launching in Texas.")
DESCRIPTION = ("Licensed clinicians online for urgent care, UTIs, refills, therapy, birth control, ED and weight care. "
               "No insurance needed. Launching in Texas.")
TITLE = "Online Doctor in Texas, No Insurance Needed | Jachi Health"
ES_DESCRIPTION = ("Profesionales de la salud con licencia, en línea: atención de urgencia, resurtidos, terapia, salud "
                  "sexual y más. Sin seguro médico. Abrimos pronto en Texas.")
ES_TITLE = "Doctor en línea en Texas, sin seguro médico | Jachi Health"
SHARE_ALT = "Jachi Health: online care, rooted in real medicine. Licensed clinicians, no insurance needed."
SHARE_ALT_ES = "Jachi Health: atención en línea, arraigada en la medicina real. Profesionales con licencia, sin seguro médico."
# ---------- Structured data (schema.org JSON-LD) ----------
# One connected graph per page: the organization and website are defined once (by @id) and every page points at them.
# Only facts that are true today: no clinician names, reviews, ratings or prices until they exist.
ORG_ID, SITE_ID = f"{SITE_URL}/#organization", f"{SITE_URL}/#website"
ORG_NODE = {
    "@type": "Organization", "@id": ORG_ID, "name": "Jachi Health", "url": f"{SITE_URL}/",
    "logo": {"@type": "ImageObject", "url": f"{SITE_URL}/apple-touch-icon.png", "width": 180, "height": 180},
    "image": f"{SITE_URL}/og.jpg", "email": EMAIL, "description": ORG_DESCRIPTION,
    "areaServed": {"@type": "State", "name": "Texas"}, "knowsLanguage": ["en", "es"],
    "contactPoint": {"@type": "ContactPoint", "contactType": "customer support", "email": EMAIL,
                     "availableLanguage": ["English", "Spanish"]},
}
ORG_REF = {"@type": "Organization", "@id": ORG_ID, "name": "Jachi Health", "url": f"{SITE_URL}/"}
SITE_NODE = {"@type": "WebSite", "@id": SITE_ID, "url": f"{SITE_URL}/", "name": "Jachi Health",
             "inLanguage": ["en", "es"], "publisher": {"@id": ORG_ID}}


def ld_graph(*nodes):
    return {"@context": "https://schema.org", "@graph": list(nodes)}


def page_node(kind, path, title, description, lang, **extra):
    return {"@type": kind, "@id": f"{SITE_URL}{path}#webpage", "url": f"{SITE_URL}{path}", "name": title,
            "description": description, "inLanguage": lang, "isPartOf": {"@id": SITE_ID}, **extra}
HOME_ALTERNATES = {"en": "/", "es": "/es/"}
SITEMAP = []


# ---------- Home pages (English and Spanish) ----------

def home_tokens(L):
    finder_needs = "".join(
        f'<label class="need"><input type="radio" name="need" value="{k}"><span><i class="need__ic">{icon_svg(ic)}</i>'
        f'<b>{esc(t)}</b><small>{esc(sub)}</small></span></label>' for k, ic, t, sub in L.finder)
    join_interests = "".join(
        f'<label class="check"><input type="checkbox" name="interest" value="{s["interest"]}"><span>{esc(s.get("chip", s["name"]))}</span></label>'
        for s in L.services)
    popular = "".join(f'<button type="button" data-q="{esc(q)}">{esc(q)}</button>' for q in L.popular)
    picker = "".join(f'<li><a href="{href}" data-svc="{key}">{esc(label)}</a></li>' for label, key, href in L.picker)
    return {
        "{{PICKER}}": picker,
        "{{STATE_OPTIONS}}": state_options(L),
        "{{FAQ_ITEMS}}": faq_items(L.faq),
        "{{SERVICE_CARDS}}": "\n".join(service_card(L, s, i) for i, s in enumerate(L.services)),
        "{{FINDER_NEEDS}}": finder_needs,
        "{{JOIN_INTERESTS}}": join_interests,
        "{{CONDITION_ROWS}}": condition_rows(L),
        "{{POPULAR}}": popular,
        "{{CONDITION_COUNT}}": str(len(L.treated)),
        "{{LEARN_CARDS}}": guide_cards(L.code),
    }


def build_home(lang):
    L = Lang(lang)
    path = HOME_ALTERNATES[lang]
    tokens = {**home_tokens(L), **chrome_tokens(L, "", "#top", "#join", SITE_URL + path),
              "{{DOCK_HREF}}": "#join", "{{DOCK_LABEL}}": esc(L.T["get_early_access"])}
    main = render(part(lang, "home"), L, tokens)
    body = "\n".join(render(part(lang, n), L, tokens) for n in ("header",)) + "\n" + main + "\n" + "\n".join(
        render(part(lang, n), L, tokens) for n in ("footer", "dock", "chat"))
    page = {"lang": lang, "path": path, "alternates": HOME_ALTERNATES, "main": main,
            "title": TITLE if lang == "en" else ES_TITLE,
            "description": DESCRIPTION if lang == "en" else ES_DESCRIPTION,
            "ld": [ld_graph(ORG_NODE, SITE_NODE, page_node(
                "WebPage", path, TITLE if lang == "en" else ES_TITLE,
                DESCRIPTION if lang == "en" else ES_DESCRIPTION, lang, about={"@id": ORG_ID}))]}
    write(path, document(page, body))
    SITEMAP.append((path, HOME_ALTERNATES))
    return body


home_body_en = build_home("en")
if (SRC / "es" / "home.html").exists():
    build_home("es")


# ---------- Service pages (English) ----------

def service_page(p):
    L = Lang("en")
    svc = L.by_key[p["key"]]
    path = f'/{p["slug"]}/'
    join_href = f'/?interest={svc["interest"]}'
    trail = [("Home", "/"), ("Services", "/#services"), (p["crumb"], None)]
    treated = {name: note for name, _cat, _terms, note in L.treated}
    items = []
    for entry in p["list"]:
        if isinstance(entry, tuple):
            title, note = entry
        else:
            if entry not in treated:
                raise SystemExit(f"pages.py: {p['slug']} lists unknown condition {entry!r}")
            title, note = entry, treated[entry]
        note_html = f"<small>{esc(note)}</small>" if note else ""
        items.append(f"<li>{icon_svg('check')}<span><b>{esc(title)}</b>{note_html}</span></li>")
    expect = "".join(f'<li><span class="expect__ic">{icon_svg(ic)}</span><h3>{esc(t)}</h3><p>{esc(d)}</p></li>'
                     for ic, t, d in p["expect"])
    know = "".join(f"<li>{icon_svg('info')}<span>{esc(k)}</span></li>" for k in p["know"])
    s = p["safety"]
    flags = "".join(f"<li>{esc(x)}</li>" for x in s["items"])
    flags_html = f'<ul class="flags">{flags}</ul>' if flags else ""
    actions = ""
    if s["kind"] == "911":
        actions = f'<div class="safety__actions"><a class="btn btn--danger btn--sm" href="tel:911">{icon_svg("phone")}Call 911</a></div>'
    elif s["kind"] == "988":
        actions = (f'<div class="safety__actions"><a class="btn btn--sm" href="tel:988">{icon_svg("phone")}Call 988</a>'
                   f'<a class="btn btn--ghost btn--sm" href="sms:988">{icon_svg("msg")}Text 988</a></div>')
    tone = "explain--caution" if s["kind"] == "caution" else "explain--alert"
    ic = "heart" if s["kind"] == "988" else "alert"
    safety = (f'<div class="explain {tone} safety"><h3><span class="explain__ic" aria-hidden="true">{icon_svg(ic)}</span>'
              f'{esc(s["title"])}</h3><p>{esc(s["text"])}</p>{flags_html}{actions}</div>')
    if p.get("elig"):
        second = '<a class="btn btn--ghost btn--lg" href="/#eligibility">Check your eligibility</a>'
    else:
        second = '<a class="btn btn--ghost btn--lg" href="/#care-finder">Find the right care</a>'
    perks = ["No insurance needed",
             "Licensed therapists in your state" if p["key"] == "therapy" else "Licensed clinicians in your state",
             "Regular check-ins" if svc["ongoing"] else
             ("Private video sessions" if p["key"] == "therapy" else "Prescriptions sent to your pharmacy")]
    perk_items = "".join(f"<li>{icon_svg('check')}<span>{esc(x)}</span></li>" for x in perks)
    tag_cls = "svc__tag svc__tag--ongoing" if svc["ongoing"] else "svc__tag"
    card = (f'<aside class="glance" aria-label="{esc(svc["name"])} at a glance">'
            f'<span class="svc__ic">{icon_svg(svc["icon"])}</span>'
            f'<p class="glance__name">{esc(svc["name"])}</p>'
            f'<span class="{tag_cls}">{esc(svc["tag"])}</span>'
            f'<ul>{perk_items}</ul>'
            f'<p class="fine">{esc(L.pricing_note)} Medication and lab tests are billed separately.</p></aside>')
    related = "".join(f'<li><a href="/{r}/">{esc(PAGES.BY_SLUG[r]["crumb"])}</a></li>' for r in p["related"])
    links = [("See how Jachi works, step by step", "/how-it-works/")] + [
        (a["en"]["h1"].rstrip("."), LEARN.path(a, "en")) for a in LEARN.ARTICLES if p["key"] in a["services"]]
    svc_links = "".join(f'<li><a class="textlink" href="{href}">{nw(esc(label))}{icon_svg("arrow", "i--arrow")}</a></li>'
                        for label, href in links)
    faq = list(p["faq"])
    tokens = {
        **chrome_tokens(L, "/", "/", join_href),
        "{{CRUMBS}}": crumbs(trail),
        "{{SVC_H1}}": f'{esc(p["h1"][0])} {esc(p["h1"][1])}',
        "{{SVC_LEAD}}": esc(p["lead"]) + " No insurance needed.",
        "{{SVC_SECOND_CTA}}": second,
        "{{SVC_CARD}}": card,
        "{{SVC_LIST_TITLE}}": esc(p["list_title"]),
        "{{SVC_LIST_LEAD}}": esc(p.get("list_lead", "A licensed clinician reviews every request and tells you if "
                                                   "you need to be seen in person instead.")),
        "{{SVC_LIST}}": "".join(items),
        "{{SVC_EXPECT}}": expect,
        "{{SVC_EXPECT_TITLE}}": heading(p["expect_title"]),
        "{{SVC_EXPECT_LEAD}}": esc(p.get("expect_lead", PAGES.EXPECT_LEAD)),
        "{{SVC_KNOW}}": know,
        "{{SVC_SAFETY}}": safety,
        "{{SVC_FAQ}}": faq_items(faq),
        "{{SVC_FAQ_TITLE}}": heading(p["faq_title"]),
        "{{SVC_RELATED}}": related,
        "{{SVC_LINKS}}": svc_links,
    }
    main = render(part("en", "service"), L, tokens)
    tokens.update({"{{DOCK_HREF}}": join_href, "{{DOCK_LABEL}}": "Join the waitlist"})
    body = "\n".join(render(part("en", n), L, tokens) for n in ("header",)) + "\n" + main + "\n" + "\n".join(
        render(part("en", n), L, tokens) for n in ("footer", "dock", "chat"))
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}
    about = [{"@type": "MedicalCondition", "name": a} if isinstance(a, str) else a for a in p["about"]]
    web = page_node("MedicalWebPage", path, p["title"], p["description"], "en", publisher={"@id": ORG_ID},
                    breadcrumb={"@id": f"{SITE_URL}{path}#breadcrumb"}, medicalAudience={"@type": "Patient"},
                    about=about, **({"specialty": f"https://schema.org/{p['specialty']}"} if p.get("specialty") else {}))
    page = {"lang": "en", "path": path, "main": main, "title": p["title"], "description": p["description"],
            "ld": [ld_graph(ORG_REF, web, breadcrumb_node(trail, path)), faq_ld]}
    write(path, document(page, body))
    SITEMAP.append((path, None))


for p in PAGES.PAGES:
    service_page(p)


# ---------- Legal pages (English) ----------

LEGAL = [
    ("privacy", "Privacy policy", "Privacy policy | Jachi Health",
     "How Jachi Health collects, uses and protects information on jachihealth.com, and the choices you have."),
    ("terms", "Terms of use", "Terms of use | Jachi Health",
     "The terms for using jachihealth.com, including our care finder, help chat and waitlist."),
    ("texas-medical-board", "Texas Medical Board notice", "Texas Medical Board notice | Jachi Health",
     "How to file a complaint with the Texas Medical Board."),
]
for slug, crumb, title, description in LEGAL:
    L = Lang("en")
    path = f"/{slug}/"
    trail = [("Home", "/"), (crumb, None)]
    tokens = {**chrome_tokens(L, "/", "/", "/#join"), "{{CRUMBS}}": crumbs(trail)}
    main = render(part("en", slug), L, tokens)
    body = render(part("en", "header"), L, tokens) + "\n" + main + "\n" + render(part("en", "footer"), L, tokens) + \
        "\n" + render(part("en", "chat"), L, tokens)
    page = {"lang": "en", "path": path, "main": main, "title": title, "description": description,
            "ld": [breadcrumb_ld(trail, path)]}
    write(path, document(page, body))
    SITEMAP.append((path, None))


# ---------- How Jachi works (English and Spanish) ----------

HOME_PATH = {"en": "/", "es": "/es/"}
OTHER = {"en": "es", "es": "en"}
HOW_PAGES = {"en": EN_CONTENT.HOW, "es": ES_CONTENT.HOW}
HOW_ALTERNATES = {code: h["path"] for code, h in HOW_PAGES.items()}


def faq_ld(items, lang):
    return {"@context": "https://schema.org", "@type": "FAQPage", "inLanguage": lang, "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items]}


def assemble(lang, main, tokens, parts=("footer", "dock", "chat")):
    """The page body: the shared header, the page's main content, then the shared footer, dock and chat."""
    L = Lang(lang)
    return render(part(lang, "header"), L, tokens) + "\n" + main + "\n" + "\n".join(
        render(part(lang, n), L, tokens) for n in parts)


def how_lanes(H):
    """The two lanes of the How page: the steps on Jachi, the handoff to the medical group, then the steps with it."""
    (jachi, care), (h_title, h_text) = H["lanes"], H["handoff"]

    def lane(data, cls, before):
        steps = "".join(f"<li><div><h4>{esc(title)}</h4><p>{esc(text)}</p></div></li>" for title, text in data["steps"])
        start = f' start="{before + 1}"' if before else ""
        return (f'<div class="lane {cls}"><div class="lane__head"><p class="lane__who">{esc(data["who"])}</p>'
                f'<h3 class="lane__title">{esc(data["title"])}</h3></div>'
                f'<ol class="lane__steps"{start} style="counter-reset:lane {before}">{steps}</ol></div>')
    handoff = (f'<div class="handoff"><span class="handoff__ic">{icon_svg("lock")}</span>'
               f'<div><h3>{esc(h_title)}</h3><p>{esc(h_text)}</p></div></div>')
    return lane(jachi, "lane--jachi", 0) + handoff + lane(care, "lane--care", len(jachi["steps"]))


def build_how(lang):
    L = Lang(lang)
    H = HOW_PAGES[lang]
    home, path = HOME_PATH[lang], H["path"]
    join_href = home + "#join"
    trail = [(LEARN.LABELS[lang]["home"], home), (H["crumb"], None)]
    tokens = {**chrome_tokens(L, home, home, join_href, alt_href=HOW_ALTERNATES[OTHER[lang]]),
              "{{CRUMBS}}": crumbs(trail), "{{HOW_FAQ}}": faq_items(H["faq"]), "{{HOW_LANES}}": how_lanes(H),
              "{{DOCK_HREF}}": join_href, "{{DOCK_LABEL}}": esc(L.T["get_early_access"])}
    main = render(part(lang, "how"), L, tokens)
    web = page_node("WebPage", path, H["title"], H["description"], lang, about={"@id": ORG_ID},
                    breadcrumb={"@id": f"{SITE_URL}{path}#breadcrumb"})
    page = {"lang": lang, "path": path, "alternates": HOW_ALTERNATES, "main": main,
            "title": H["title"], "description": H["description"],
            "ld": [ld_graph(ORG_REF, web, breadcrumb_node(trail, path)), faq_ld(H["faq"], lang)]}
    write(path, document(page, assemble(lang, main, tokens)))
    SITEMAP.append((path, HOW_ALTERNATES))


for code in HOW_PAGES:
    build_how(code)


# ---------- Learn: the guides hub and each guide (English and Spanish) ----------

LEARN_ALTERNATES = {code: LEARN.HUB[code]["path"] for code in LEARN.HUB}


def guide_text(text):
    """Guide text is escaped; the only markup it may use is <b>."""
    return nw(esc(text)).replace("&lt;b&gt;", "<b>").replace("&lt;/b&gt;", "</b>")


def guide_action(label, href, style):
    cls = {"danger": "btn btn--danger btn--sm", "solid": "btn btn--sm", "ghost": "btn btn--ghost btn--sm"}[style]
    ic = "phone" if href.startswith("tel:") else "msg" if href.startswith("sms:") else "arrow"
    return f'<a class="{cls}" href="{esc(href)}">{icon_svg(ic)}{esc(label)}</a>'


def guide_body(blocks):
    out, seen_h2 = [], False
    for b in blocks:
        kind = b[0]
        if kind == "p":
            out.append(f"<p>{guide_text(b[1])}</p>")
        elif kind == "h2":
            seen_h2 = True
            out.append(f"<h2>{esc(b[1])}</h2>")
        elif kind in ("ul", "ol"):
            out.append(f"<{kind}>" + "".join(f"<li>{guide_text(x)}</li>" for x in b[1]) + f"</{kind}>")
        elif kind == "callout":
            _kind, tone, title, parts, actions = b
            level = "h3" if seen_h2 else "h2"
            inner = "".join(f"<p>{guide_text(x)}</p>" if isinstance(x, str) else
                            "<ul>" + "".join(f"<li>{guide_text(y)}</li>" for y in x[1]) + "</ul>" for x in parts)
            acts = f'<div class="actions">{"".join(guide_action(*a) for a in actions)}</div>' if actions else ""
            ic = "alert" if tone == "alert" else "heart"
            out.append(f'<div class="callout callout--{tone}"><{level} class="callout__title">'
                       f'<span class="callout__ic" aria-hidden="true">{icon_svg(ic)}</span>{esc(title)}</{level}>'
                       f'{inner}{acts}</div>')
        else:
            raise SystemExit(f"learn.py: unknown block {kind!r}")
    return "\n".join(out)


def learn_tokens(lang):
    W = LEARN.LABELS[lang]
    return {"{{CTA_TITLE}}": esc(W["cta_title"]), "{{CTA_LEAD}}": esc(W["cta_lead"]), "{{CTA_JOIN}}": esc(W["cta_join"])}


def build_learn_hub(lang):
    L = Lang(lang)
    Hb, W = LEARN.HUB[lang], LEARN.LABELS[lang]
    home, path = HOME_PATH[lang], Hb["path"]
    trail = [(W["home"], home), (Hb["crumb"], None)]
    tokens = {**chrome_tokens(L, home, home, home + "#join", alt_href=LEARN_ALTERNATES[OTHER[lang]]), **learn_tokens(lang),
              "{{CRUMBS}}": crumbs(trail), "{{HUB_H1}}": esc(Hb["h1"]), "{{HUB_LEAD}}": nw(esc(Hb["lead"])),
              "{{HUB_NOTE}}": esc(Hb["note"]), "{{HUB_LIST_LABEL}}": esc(W["list_label"]),
              "{{HUB_CARDS}}": guide_cards(lang, level="h2")}
    main = render((SRC / "learn.html").read_text(), L, tokens)
    items = [{"@type": "ListItem", "position": i, "url": SITE_URL + LEARN.path(a, lang), "name": a[lang]["h1"]}
             for i, a in enumerate(LEARN.ARTICLES, 1)]
    web = page_node("CollectionPage", path, Hb["title"], Hb["description"], lang,
                    breadcrumb={"@id": f"{SITE_URL}{path}#breadcrumb"},
                    mainEntity={"@type": "ItemList", "itemListElement": items})
    page = {"lang": lang, "path": path, "alternates": LEARN_ALTERNATES, "main": main,
            "title": Hb["title"], "description": Hb["description"],
            "ld": [ld_graph(ORG_REF, web, breadcrumb_node(trail, path))]}
    write(path, document(page, assemble(lang, main, tokens, ("footer", "chat"))))
    SITEMAP.append((path, LEARN_ALTERNATES))


def build_guide(article, lang):
    L = Lang(lang)
    t, Hb, W = article[lang], LEARN.HUB[lang], LEARN.LABELS[lang]
    home, path = HOME_PATH[lang], LEARN.path(article, lang)
    alternates = {code: LEARN.path(article, code) for code in LEARN.HUB}
    trail = [(W["home"], home), (Hb["crumb"], Hb["path"]), (t["crumb"], None)]
    cta = t["cta"]
    english = ' hreflang="en"'
    sources = "".join(
        f'<li><a href="{url}" rel="noopener noreferrer"{english if "(en inglés)" in name else ""}>{esc(name)}</a></li>'
        for name, url in t["sources"])
    aside = (f'<aside class="article__aside" aria-label="{esc(W["aside_label"])}">'
             f'<div class="aside-card aside-card--dark on-dark"><h2>{esc(cta["title"])}</h2><p>{esc(cta["text"])}</p>'
             f'<a class="btn btn--light btn--block" href="{cta["join"]}">{esc(W["cta_join"])} {icon_svg("arrow", "i--arrow")}</a>'
             f'<a class="textlink" href="{cta["page"][1]}">{esc(cta["page"][0])}{icon_svg("arrow", "i--arrow")}</a></div>'
             f'<div class="aside-card"><h2>{esc(W["note_title"])}</h2><p>{esc(W["note"])}</p>'
             f'<p class="aside-card__urgent">{icon_svg("alert")}<span>{W["urgent"]}</span></p></div></aside>')
    tokens = {**chrome_tokens(L, home, home, cta["join"], alt_href=alternates[OTHER[lang]]), **learn_tokens(lang),
              "{{CRUMBS}}": crumbs(trail), "{{ART_TOPIC}}": esc(t["topic"]),
              "{{ART_MINUTES}}": esc(W["minutes"].format(n=t["minutes"])), "{{ART_DATE}}": LEARN.UPDATED,
              "{{ART_UPDATED}}": esc(LEARN.UPDATED_LABEL[lang]), "{{ART_H1}}": nw(esc(t["h1"])), "{{ART_LEAD}}": nw(esc(t["lead"])),
              "{{ART_BODY}}": guide_body(t["body"]), "{{ART_SOURCES_TITLE}}": esc(W["sources"]),
              "{{ART_SOURCES_LEAD}}": esc(W["sources_lead"]), "{{ART_SOURCES}}": sources, "{{ART_ASIDE}}": aside,
              "{{ART_MORE_TITLE}}": esc(W["more"]), "{{ART_ALL}}": esc(W["all"]), "{{HUB_PATH}}": Hb["path"],
              "{{ART_MORE}}": guide_cards(lang, skip=article["key"])}
    main = render((SRC / "article.html").read_text(), L, tokens)
    web = page_node("MedicalWebPage", path, t["title"], t["description"], lang, publisher={"@id": ORG_ID},
                    breadcrumb={"@id": f"{SITE_URL}{path}#breadcrumb"}, medicalAudience={"@type": "Patient"},
                    datePublished=LEARN.UPDATED, dateModified=LEARN.UPDATED,
                    citation=[{"@type": "CreativeWork", "name": n, "url": u} for n, u in t["sources"]])
    page = {"lang": lang, "path": path, "alternates": alternates, "main": main,
            "title": t["title"], "description": t["description"],
            "ld": [ld_graph(ORG_REF, web, breadcrumb_node(trail, path))]}
    write(path, document(page, assemble(lang, main, tokens, ("footer", "chat"))))
    SITEMAP.append((path, alternates))


for code in LEARN.HUB:
    build_learn_hub(code)
    for art in LEARN.ARTICLES:
        build_guide(art, code)


# ---------- Account pages (English and Spanish) ----------

ACCOUNT_PATHS = {"en": "/account/", "es": "/es/account/"}


def build_account(lang):
    L = Lang(lang)
    home = "/" if lang == "en" else "/es/"
    interests = "".join(
        f'<label class="check"><input type="checkbox" name="interest" value="{s["interest"]}"><span>{esc(s.get("chip", s["name"]))}</span></label>'
        for s in L.services)
    other = "es" if lang == "en" else "en"
    tokens = {**chrome_tokens(L, home, home, home + "#join", alt_href=ACCOUNT_PATHS[other]),
              "{{STATE_OPTIONS}}": state_options(L), "{{ACCOUNT_INTERESTS}}": interests}
    main = render((SRC / "account.html").read_text(), L, tokens)
    body = render(part(lang, "header"), L, tokens) + "\n" + main + "\n" + render(part(lang, "footer"), L, tokens) + \
        "\n" + render(part(lang, "chat"), L, tokens)
    page = {"lang": lang, "path": ACCOUNT_PATHS[lang], "noindex": True, "main": main,
            "title": L.T["a_meta_title"], "description": L.T["a_meta_desc"],
            "css": (SRC / "account.css").read_text(), "script": page_js("account", L), "strict_scripts": True}
    write(ACCOUNT_PATHS[lang], document(page, body))


for code in ACCOUNT_PATHS:
    build_account(code)


# ---------- Admin console (English only, not linked from the site) ----------

def build_admin():
    L = Lang("en")
    main = render((SRC / "admin.html").read_text(), L, {})
    page = {"lang": "en", "path": "/admin/", "noindex": True, "main": main, "site_js": False, "strict_scripts": True,
            "title": "Admin | Jachi Health", "description": "The Jachi Health admin console.",
            "css": (SRC / "admin.css").read_text(),
            "script": page_js("admin", L, {"INTERESTS": {s["interest"]: s.get("chip", s["name"]) for s in L.services},
                                           "STATES": dict(STATES)})}
    write("/admin/", document(page, main))


build_admin()


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
L = Lang("en")
nf_main = render(part("en", "404"), L, {})
nf_page = {"lang": "en", "path": "/404", "noindex": True, "css": NOT_FOUND_CSS, "main": nf_main,
           "title": "Page not found | Jachi Health",
           "description": "This page doesn't exist. Visit Jachi Health's homepage for online care from licensed clinicians."}
nf_html = f"""<!doctype html>
<html lang="en">
<head>
{head(nf_page, nf_main)}
</head>
<body>
{nf_main}
</body>
</html>
"""
(PUBLIC / "404.html").write_text(nf_html)


# ---------- Icons, search engine files and the chat function ----------

(PUBLIC / "icon.svg").write_text(icon_svg_file())
(PUBLIC / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n")
urls = []
for path, alternates in SITEMAP:
    links = ""
    if alternates:
        links = "".join(f'\n    <xhtml:link rel="alternate" hreflang="{c}" href="{SITE_URL}{p}"/>' for c, p in alternates.items())
        links += f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE_URL}{alternates["en"]}"/>'
    urls.append(f"  <url>\n    <loc>{SITE_URL}{path}</loc>{links}\n  </url>")
(PUBLIC / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
    + "\n".join(urls) + "\n</urlset>\n")
(FUNCTIONS / "chat.mjs").write_text(chatbot.function_source())
SERVER_CODE = {
    "account": "Jachi Health account deletion. Netlify Function: POST /api/account/delete",
    "admin": "Jachi Health admin console. Netlify Function: /api/admin/*",
}
for name, title in SERVER_CODE.items():
    (FUNCTIONS / f"{name}.mjs").write_text(
        f"// {title}\n"
        f"// GENERATED by build.py from src/functions/lib.mjs and src/functions/{name}.mjs. Edit those, then run\n"
        f"// `python3 build.py`. Never put a key or token in these files: they live in Netlify's environment variables.\n"
        f"const SUPPORT_EMAIL = {json.dumps(EMAIL)};\n\n"
        + (SRC / "functions" / "lib.mjs").read_text() + "\n" + (SRC / "functions" / f"{name}.mjs").read_text())


# ---------- Claude artifact preview of the English home page (not deployed) ----------

artifact = f"""<title>Jachi Health</title>
<meta name="claude:viewport-fit-sides" content="cover">
{GOOGLE_FONTS}
<style>
{css}
</style>
{home_body_en}
<script>
{js_for("en", rules=True)}
</script>
"""
(DIST / "jachi-health.html").write_text(artifact)
(DIST / "artifact-sim.html").write_text(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" '
    'content="width=device-width, initial-scale=1"></head><body>' + artifact + '</body></html>')

missing = [n for n in ("og.jpg", "apple-touch-icon.png", "favicon.ico") if not (PUBLIC / n).exists()]
if missing:
    print("note: run tools/make_images.py to create", ", ".join(missing))
print(f"built {len(SITEMAP)} pages + account, admin and 404 pages into public/, the functions in netlify/functions/ "
      f"and the dist/ preview")
