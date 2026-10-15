#!/usr/bin/env python3
"""Write the mobile app's content files (app/src/content/content.json and icons.json) from the website.

The app and the website then say exactly the same thing about services, conditions, safety and what
isn't offered, in English and Spanish. Run after changing content.py, content_es.py or pages.py:

  python3 tools/app_content.py
"""
import ast
import html
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import content as EN  # noqa: E402
import content_es as ES  # noqa: E402
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
SITE_URL = "https://www.jachihealth.com"


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


def plain(text):
    return html.unescape(text)


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
        })
    return out


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
    print(f"wrote {OUT.relative_to(ROOT)}: {len(data['services'])} services, {len(data['conditions'])} conditions; "
          f"{ICONS_OUT.relative_to(ROOT)}: {len(icons) - 1} icons; {STRINGS_OUT.relative_to(ROOT)}: {len(strings['en'])} strings")


if __name__ == "__main__":
    main()
