#!/usr/bin/env python3
"""Tell the IndexNow search engines (Bing, and through it Yahoo, DuckDuckGo and ChatGPT search; also Yandex, Seznam,
Naver and Yep) which pages changed, so they recrawl them within minutes instead of days. Google doesn't use
IndexNow: it reads the sitemap submitted in Search Console.

Run after a production deploy has finished, from a computer that can reach the internet:
  python3 tools/indexnow.py                                   # every page in public/sitemap.xml
  python3 tools/indexnow.py /urgent-care/ /es/salud-sexual/   # only these pages

It needs nothing but Python. The key is the one build.py publishes at https://jachihealth.com/<key>.txt: it isn't a
secret, it only shows the request comes from whoever runs the site, and all it can do is ask for a recrawl.
"""
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SITE = "https://jachihealth.com"
HOST = "jachihealth.com"


def main(paths):
    keys = [p.stem for p in PUBLIC.glob("*.txt") if re.fullmatch(r"[0-9a-f]{32}", p.stem)]
    if len(keys) != 1:
        raise SystemExit(f"expected one IndexNow key file in public/, found {len(keys)}: run python3 build.py")
    key = keys[0]
    listed = re.findall(r"<loc>([^<]+)</loc>", (PUBLIC / "sitemap.xml").read_text())
    if paths:
        urls = [SITE + p if p.startswith("/") else p for p in paths]
        unknown = [u for u in urls if u not in listed]
        if unknown:
            raise SystemExit(f"not in the sitemap: {unknown}")
    else:
        urls = listed
    body = json.dumps({"host": HOST, "key": key, "keyLocation": f"{SITE}/{key}.txt", "urlList": urls}).encode()
    request = urllib.request.Request("https://api.indexnow.org/indexnow", data=body, method="POST",
                                     headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            status = response.status
    except urllib.error.HTTPError as err:
        status = err.code
    # 200 and 202 mean accepted; 403 means the key file isn't live yet (wait for the deploy); 422 means a URL
    # doesn't belong to the site; 429 means too many requests (try again later).
    print(f"IndexNow: {status} for {len(urls)} page(s)")
    return 0 if status in (200, 202) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
