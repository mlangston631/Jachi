#!/usr/bin/env python3
"""Write the mobile app's content files (app/src/content/content.json and icons.json) from the website.

The app and the website then say exactly the same thing about services (with what to expect from each),
conditions, safety, what isn't offered, how Jachi works and the health guides, in English and Spanish. Run after
changing content.py, content_es.py, pages.py or learn.py:

  python3 tools/app_content.py
"""
import ast
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import content as EN  # noqa: E402
import content_es as ES  # noqa: E402
import learn as LEARN  # noqa: E402
import pages as PAGES  # noqa: E402
import brand as BRAND  # noqa: E402
import strings as STRINGS  # noqa: E402

OUT = ROOT / "app" / "src" / "content" / "content.json"
ICONS_OUT = ROOT / "app" / "src" / "content" / "icons.json"
STRINGS_OUT = ROOT / "app" / "src" / "content" / "site-strings.json"
# Reviewed website wording the app reuses word for word: the care finder (f_), account (a_), help chat (c_),
# support ticket (t_), early access (j_) and weight check (e_) messages, and a few form errors.
STRING_PREFIXES = ("f_", "a_", "c_", "t_", "j_", "e_")
STRING_KEYS = {"choose_state", "choose_answer", "fix_one", "fix_many", "enter_email", "valid_email", "launch_note",
               "continue"}
STRING_SKIP = {"a_meta_title", "a_meta_desc", "a_h1", "a_noscript", "a_create_note", "a_tabs", "c_off", "t_preview",
               "j_preview", "a_home"}
SITE_URL = "https://jachihealth.com"


def from_build(name):
    """A constant from build.py (STATES, ICONS), read without running the website build."""
    tree = ast.parse((ROOT / "build.py").read_text())
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(getattr(t, "id", "") == name for t in node.targets):
            return ast.literal_eval(node.value)
    raise SystemExit(f"{name} not found in build.py")


def icon_shapes(markup):
    """The site's 24x24 stroke icons as [tag, attributes] pairs, so the app draws them without parsing SVG."""
    root = ET.fromstring(f'<svg xmlns="http://www.w3.org/2000/svg">{markup}</svg>')
    shapes = []
    for el in root:
        tag = el.tag.split('}')[-1]
        if tag not in ("path", "rect", "circle"):
            raise SystemExit(f"icon uses <{tag}>, which the app doesn't draw")
        attrs = {k: (float(v) if k in ("x", "y", "width", "height", "rx", "ry", "cx", "cy", "r") else v)
                 for k, v in el.attrib.items()}
        shapes.append([tag, attrs])
    return shapes


def site_strings():
    keys = [k for k in STRINGS.EN if (k.startswith(STRING_PREFIXES) or k in STRING_KEYS) and k not in STRING_SKIP]
    out = {"en": {}, "es": {}}
    for k in keys:
        for lang, table in (("en", STRINGS.EN), ("es", STRINGS.ES)):
            text = table.get(k)
            if not isinstance(text, str):
                raise SystemExit(f"strings.py: {lang} is missing {k}")
            if "<" in text:
                raise SystemExit(f"strings.py: {k} has HTML, which the app can't show; add it to STRING_SKIP")
            out[lang][k] = html.unescape(text)
    return out


def states():
    return [list(pair) for pair in from_build("STATES")]


def plain(text, bold=False):
    """Website text for the app: entities decoded and links dropped, since the app can't show HTML (phone numbers stay
    as text). Guides keep <b> for their bold words."""
    return re.sub(r"<(?!/?b>)[^>]+>" if bold else r"<[^>]+>", "", html.unescape(text))


def expect(key):
    """What to expect from a service: its main page's visit, tests and follow-up (pages.py), in both languages."""
    page = PAGES.BY_SLUG[PAGES.SERVICE_SLUG[key]]
    es_title, es_lead, es_items = ES.EXPECT[page["slug"]]
    if len(es_items) != len(page["expect"]):
        raise SystemExit(f"content_es.EXPECT[{page['slug']!r}] needs one item for each in pages.py")
    return {
        "en": {"title": page["expect_title"], "lead": page.get("expect_lead", PAGES.EXPECT_LEAD),
               "items": [{"icon": ic, "title": t, "text": d} for ic, t, d in page["expect"]]},
        "es": {"title": es_title, "lead": es_lead or ES.EXPECT_LEAD,
               "items": [{"icon": ic, "title": t, "text": d} for (ic, _t, _d), (t, d) in zip(page["expect"], es_items)]},
    }


def services():
    out = []
    for s in EN.SERVICES:
        es = ES.SERVICES[s["key"]]
        page = next((p["slug"] for p in PAGES.PAGES if p["key"] == s["key"] and p["slug"] != "uti-treatment"), None)
        out.append({
            "key": s["key"], "interest": s["interest"], "icon": s["icon"], "ongoing": bool(s.get("ongoing")),
            "page": f"{SITE_URL}/{page}/" if page else SITE_URL + "/",
            "en": {"name": s["name"], "chip": s.get("chip", s["name"]), "tag": s["tag"], "desc": s["desc"],
                   "items": s["items"]},
            "es": {"name": es["name"], "chip": es.get("chip", es["name"]), "tag": es["tag"], "desc": es["desc"],
                   "items": es["items"]},
            "expect": expect(s["key"]),
        })
    return out


def how():
    """How Jachi works: the steps on Jachi, the handoff, then the steps with the medical group (as on the website)."""
    def one(H):
        return {"lanes": [{"who": lane["who"], "title": lane["title"],
                           "steps": [{"title": t, "text": d} for t, d in lane["steps"]]} for lane in H["lanes"]],
                "handoff": {"title": H["handoff"][0], "text": H["handoff"][1]}}
    return {"en": one(EN.HOW), "es": one(ES.HOW)}


def guide_block(b):
    kind = b[0]
    if kind in ("p", "h2"):
        return {"kind": kind, "text": plain(b[1], bold=True)}
    if kind in ("ul", "ol"):
        return {"kind": kind, "items": [plain(x, bold=True) for x in b[1]]}
    if kind == "callout":
        _kind, tone, title, parts, actions = b
        return {"kind": "callout", "tone": tone, "title": title,
                "parts": [{"kind": "p", "text": plain(x, bold=True)} if isinstance(x, str)
                          else {"kind": "ul", "items": [plain(y, bold=True) for y in x[1]]} for x in parts],
                "actions": [{"label": label, "href": href, "style": style} for label, href, style in actions]}
    raise SystemExit(f"learn.py: the app doesn't show {kind!r} blocks")


def interest_of(href):
    """The service a guide's waitlist link picks (/?interest=weight-care → weight-care), or None."""
    return href.split("interest=", 1)[1] if "interest=" in href else None


def guides():
    """The health guides (learn.py). Text may hold <b>; links in the box beside each guide stay website paths."""
    out = []
    for a in LEARN.ARTICLES:
        item = {"key": a["key"], "services": a["services"], "date": LEARN.UPDATED}
        for lang in ("en", "es"):
            t = a[lang]
            item[lang] = {
                "title": t["h1"].rstrip("."), "topic": t["topic"], "summary": t["summary"], "minutes": t["minutes"], "lead": t["lead"],
                "body": [guide_block(b) for b in t["body"]],
                "sources": [{"name": name, "url": url} for name, url in t["sources"]],
                "cta": {"title": t["cta"]["title"], "text": t["cta"]["text"],
                        "page": {"label": t["cta"]["page"][0], "href": t["cta"]["page"][1]},
                        "interest": interest_of(t["cta"]["join"])},
                "url": SITE_URL + LEARN.path(a, lang), "updated": LEARN.UPDATED_LABEL[lang],
            }
        out.append(item)
    return out


def learn_words():
    keys = ("minutes", "sources", "sources_lead", "note_title", "note", "more")
    # The app's section titles don't end with a full stop; the website's headings do.
    return {lang: {"title": LEARN.HUB[lang]["h1"].rstrip("."), "lead": LEARN.HUB[lang]["lead"],
                   **{k: LEARN.LABELS[lang][k] for k in keys}} for lang in ("en", "es")}


def conditions():
    out = []
    for name, key, words, note in EN.TREATED:
        es_name, es_words, es_note = ES.TREATED[name]
        out.append({"key": key, "en": {"name": name, "words": words, "note": plain(note)},
                    "es": {"name": es_name, "words": es_words, "note": plain(es_note)}})
    return out


def finder():
    return [{"key": key, "icon": icon, "en": {"title": title, "sub": sub},
             "es": {"title": ES.FINDER[key][0], "sub": ES.FINDER[key][1]}} for key, icon, title, sub in EN.FINDER]


def keyed(rows, es_rows):
    out = []
    for name, words, text in rows:
        es_name, es_words, es_text = es_rows[name]
        out.append({"en": {"name": name, "words": words, "text": plain(text)},
                    "es": {"name": es_name, "words": es_words, "text": plain(es_text)}})
    return out


def faq():
    return {"en": [{"q": plain(q), "a": plain(a)} for q, a in EN.FAQ],
            "es": [{"q": plain(q), "a": plain(a)} for q, a in ES.FAQ]}


def main():
    crisis_en, crisis_es = EN.CRISIS, ES.CRISIS
    data = {
        "_note": "Generated by tools/app_content.py from the website's content. Don't edit by hand.",
        "site": SITE_URL,
        "email": EN.EMAIL,
        "pricingNote": {"en": EN.PRICING_NOTE, "es": ES.PRICING_NOTE},
        "services": services(),
        "conditions": conditions(),
        "finder": finder(),
        "emergencies": keyed(EN.EMERGENCIES, ES.EMERGENCIES),
        "crisis": {"en": {"name": crisis_en[0], "words": crisis_en[1], "text": plain(crisis_en[2])},
                   "es": {"name": crisis_es[0], "words": crisis_es[1], "text": plain(crisis_es[2])}},
        "notOffered": keyed(EN.NOT_OFFERED, ES.NOT_OFFERED),
        "faq": faq(),
        "how": how(),
        "guides": guides(),
        "learn": learn_words(),
        "states": states(),
        "statesEs": dict(ES.STATES),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    icons = {name: icon_shapes(markup) for name, markup in sorted(from_build("ICONS").items())}
    icons["_leaf"] = {"leaf": BRAND.LEAF, "j": BRAND.J_PATH, "veins": BRAND.VEINS, "stem": BRAND.STEM}
    ICONS_OUT.write_text(json.dumps(icons, ensure_ascii=False, separators=(",", ":")) + "\n")
    strings = site_strings()
    STRINGS_OUT.write_text(json.dumps(strings, ensure_ascii=False, indent=1) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)}: {len(data['services'])} services, {len(data['conditions'])} conditions, "
          f"{len(data['guides'])} guides; "
          f"{ICONS_OUT.relative_to(ROOT)}: {len(icons) - 1} icons; {STRINGS_OUT.relative_to(ROOT)}: {len(strings['en'])} strings")


if __name__ == "__main__":
    main()
