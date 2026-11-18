#!/usr/bin/env python3
"""Print the readable text of one trusted page, so a reviewer can quote a source's own words.

    python3 -I readpage.py URL [--find WORD ...]

Each host belongs to exactly one tier, and the tier is printed with the text so nobody mistakes one for another:
  RULES     support.google.com, blog.youtube           YouTube's own policies; the only valid source for a YouTube rule
  PRIMARY   www.justice.gov, www.courtlistener.com     DOJ releases and court records; what documentaries must rest on
  LEAD      en.wikipedia.org                           for finding primary sources only; never cite it as the source
Anything else is refused: the point is to tell documented fact from repetition, so an open reader would defeat it.
--find prints only paragraphs containing any of the words (case-insensitive). Exit status 2 means the page could not
be read; the caller must then say so rather than fall back on memory.
"""
import html, re, subprocess, sys
from urllib.parse import urlparse

TIERS = {
    "support.google.com": "RULES", "blog.youtube": "RULES",
    "www.justice.gov": "PRIMARY", "www.courtlistener.com": "PRIMARY",
    "en.wikipedia.org": "LEAD (find primary sources here; never cite it)",
}
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

def page_text(url):
    """Return (title, paragraphs) for a trusted URL, or raise ValueError / RuntimeError."""
    host = urlparse(url).hostname or ""
    if host not in TIERS:
        raise ValueError(f"refused: {host} is not a trusted source ({', '.join(sorted(TIERS))})")
    if host == "support.google.com" and "hl=" not in url:
        url += ("&" if "?" in url else "?") + "hl=en"   # English text, so quotes match what the owner will read
    r = subprocess.run(["curl", "-sL", "-m", "30", "-A", UA, "-w", "\n%{http_code}", url], capture_output=True, text=True)
    body, _, status = r.stdout.rpartition("\n")
    if status != "200" or len(body) < 500:
        raise RuntimeError(f"COULD NOT READ {url} (HTTP {status or 'none'})")
    # Some sites (justice.gov article pages) answer 200 with a bot-check page instead of the article. That is the site
    # choosing to keep automated readers out: report it, never try to get past it.
    if re.search(r"triggerInterstitialChallenge|akam-logo|cf-challenge|captcha", body[:20000], re.I) and len(body) < 20000:
        raise RuntimeError(f"COULD NOT READ {url} (the site shows a bot check instead of the page; find the same facts in court records or search results)")
    title = html.unescape((re.search(r"<title>(.*?)</title>", body, re.S) or [None, ""])[1]).strip()
    body = re.sub(r"(?is)<(script|style|noscript|svg|header|footer|nav)\b.*?</\1>", " ", body)
    body = re.sub(r"(?i)<br\s*/?>|</(p|li|h[1-6]|div|tr|section|article)>", "\n", body)
    body = re.sub(r"(?i)<li[^>]*>", "\n• ", body)
    text = html.unescape(re.sub(r"<[^>]+>", " ", body))
    paras = [re.sub(r"[ \t ]+", " ", p).strip() for p in text.split("\n")]
    return title, list(dict.fromkeys(p for p in paras if len(p) > 2))   # drop repeated menu lines, keep order

def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    url, finds = args[0], []
    if "--find" in args:
        finds = [w.lower() for w in args[args.index("--find") + 1:]]
    try:
        title, paras = page_text(url)
    except ValueError as e:
        sys.exit(str(e))
    except RuntimeError as e:
        print(e)
        sys.exit(2)
    if finds:
        paras = [p for p in paras if any(w in p.lower() for w in finds)]
    print(f"SOURCE: {url}\nTIER: {TIERS[urlparse(url).hostname]}\nTITLE: {title}\n")
    print("\n".join(paras))

if __name__ == "__main__":
    main()
