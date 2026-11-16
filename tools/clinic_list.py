#!/usr/bin/env python3
"""Fetch the raw material for the clinic outreach call list: organizations (practices, clinics, labs) across Texas
whose registered specialty matches the kinds of care Jachi coordinates.

Source: the NPI Registry (NPPES), the public directory of health care providers run by the federal Centers for
Medicare & Medicaid Services. It is free and needs no key. Everything in it is about practices, never patients,
so nothing this tool reads or writes is health information.

    python3 tools/clinic_list.py              # writes outreach/raw.csv.gz, outreach/run_log.txt, outreach/summary.json
    python3 tools/clinic_list.py --probe      # a handful of small requests, to check the registry answers as expected

Needs internet access (the registry is at npiregistry.cms.hhs.gov). Standard library only.
Sorting the raw rows into a call list (one row per phone number, by area and kind of care) happens afterwards, away
from here, so the rules for that can change without asking the registry again.
"""
import csv
import gzip
import json
import os
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

BASE = os.environ.get("NPI_API_BASE", "https://npiregistry.cms.hhs.gov/api/")
OUT = Path(os.environ.get("NPI_OUT", Path(__file__).resolve().parent.parent / "outreach"))
PAGE = int(os.environ.get("NPI_PAGE", "200"))            # the registry's largest page
SKIP_MAX = int(os.environ.get("NPI_SKIP_MAX", "1000"))    # and the furthest it lets a search skip ahead
PAUSE = float(os.environ.get("NPI_PAUSE", "0.3"))         # seconds each worker waits between requests
WORKERS = int(os.environ.get("NPI_WORKERS", "3"))
AGENT = "JachiHealth-clinic-list/1.0 (+https://jachihealth.com; support@jachihealth.com)"

# What to search the registry's specialty descriptions for. The label is only a first guess at the kind of care:
# the real sorting uses each organization's own primary specialty, later.
TERMS = [
    ("Primary care", "Family Medicine"), ("Primary care", "Internal Medicine"), ("Primary care", "General Practice"),
    ("Primary care", "Primary Care"), ("Primary care", "Federally Qualified Health Center"),
    ("Primary care", "Rural Health"), ("Primary care", "Community Health"), ("Primary care", "Nurse Practitioner"),
    ("Urgent care", "Urgent Care"),
    ("Therapy and mental health", "Mental Health"), ("Therapy and mental health", "Psychiatry"),
    ("Therapy and mental health", "Psychologist"), ("Therapy and mental health", "Counselor"),
    ("Therapy and mental health", "Social Worker"), ("Therapy and mental health", "Marriage & Family Therapist"),
    ("Women's health", "Obstetrics & Gynecology"), ("Women's health", "Family Planning"),
    ("Men's health", "Urology"),
    ("Skin care", "Dermatology"),
    ("Weight management", "Obesity Medicine"),
    ("Labs", "Clinical Medical Laboratory"),
]
# Texas ZIP codes start with 750 to 799, plus 885 (El Paso).
PREFIXES = [str(n) for n in range(750, 800)] + ["885"]

FIELDS = ["npi", "name", "other_names", "primary_specialty", "all_specialties", "phone", "fax", "address_1",
          "address_2", "city", "state", "zip", "official_name", "official_title", "official_phone", "status",
          "last_updated", "enumeration_date", "matched_terms"]

log_lock = threading.Lock()
log_lines = []
stats = {"requests": 0, "errors": 0, "retries": 0, "capped": []}


def log(line):
    with log_lock:
        log_lines.append(line)
    print(line, flush=True)


def fetch(params):
    """One request to the registry. Returns the decoded JSON, or {'_failed': reason} after a few tries."""
    query = urllib.parse.urlencode(params, quote_via=urllib.parse.quote, safe="*")
    url = f"{BASE}?{query}"
    last = ""
    for attempt in range(1, 6):
        with log_lock:
            stats["requests"] += 1
        try:
            req = urllib.request.Request(url, headers={"User-Agent": AGENT, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=40) as res:
                data = json.loads(res.read().decode("utf-8", "replace"))
            time.sleep(PAUSE)
            return data
        except urllib.error.HTTPError as err:
            last = f"HTTP {err.code}"
            if err.code in (400, 404):
                break
        except Exception as err:  # timeouts, resets, bad JSON
            last = f"{type(err).__name__}: {err}"
        with log_lock:
            stats["retries"] += 1
        time.sleep(min(2 ** attempt, 20))
    with log_lock:
        stats["errors"] += 1
    return {"_failed": last, "_url": url}


def search(term, prefix):
    """Every organization the registry returns for one specialty term in one ZIP prefix (up to its ceiling)."""
    found, skip = [], 0
    while True:
        data = fetch({"version": "2.1", "enumeration_type": "NPI-2", "taxonomy_description": term, "state": "TX",
                      "postal_code": prefix + "*" if len(prefix) < 5 else prefix, "address_purpose": "LOCATION",
                      "limit": PAGE, "skip": skip})
        if "_failed" in data:
            log(f"FAILED {term!r} {prefix}: {data['_failed']}")
            return found, False
        if data.get("Errors"):
            log(f"ERROR  {term!r} {prefix}: {json.dumps(data['Errors'])[:300]}")
            return found, False
        page = data.get("results") or []
        found.extend(page)
        if len(page) < PAGE:
            return found, False
        if skip >= SKIP_MAX:
            return found, True  # the registry won't page further: the caller narrows the search
        skip += PAGE


def gather(term, prefix):
    """search(), narrowing a search that hits the registry's ceiling into ten smaller ones."""
    found, capped = search(term, prefix)
    if capped and len(prefix) < 5:
        log(f"narrow {term!r} {prefix}: {len(found)} rows hit the ceiling, splitting by the next digit")
        found = []
        for digit in "0123456789":
            found.extend(gather(term, prefix + digit))
    elif capped:
        with log_lock:
            stats["capped"].append([term, prefix])
        log(f"CAPPED {term!r} {prefix}: more than {len(found)} rows in one ZIP code; the rest are missing")
    return found


def text(value):
    return " ".join(str(value or "").split())


def row_of(rec):
    basic = rec.get("basic") or {}
    addresses = rec.get("addresses") or []
    place = next((a for a in addresses if a.get("address_purpose") == "LOCATION"), addresses[0] if addresses else {})
    specialties = rec.get("taxonomies") or []
    primary = next((t for t in specialties if t.get("primary")), specialties[0] if specialties else {})
    other = [f"{text(o.get('organization_name'))} [{text(o.get('type'))}]" for o in (rec.get("other_names") or [])
             if o.get("organization_name")]
    official = " ".join(x for x in (text(basic.get("authorized_official_first_name")),
                                    text(basic.get("authorized_official_last_name"))) if x)
    credential = text(basic.get("authorized_official_credential"))
    return {
        "npi": text(rec.get("number")),
        "name": text(basic.get("organization_name") or basic.get("name")),
        "other_names": " | ".join(other),
        "primary_specialty": text(primary.get("desc")),
        "all_specialties": " | ".join(dict.fromkeys(text(t.get("desc")) for t in specialties if t.get("desc"))),
        "phone": text(place.get("telephone_number")),
        "fax": text(place.get("fax_number")),
        "address_1": text(place.get("address_1")),
        "address_2": text(place.get("address_2")),
        "city": text(place.get("city")),
        "state": text(place.get("state")),
        "zip": text(place.get("postal_code")),
        "official_name": official + (f", {credential}" if official and credential else ""),
        "official_title": text(basic.get("authorized_official_title_or_position")),
        "official_phone": text(basic.get("authorized_official_telephone_number")),
        "status": text(basic.get("status")),
        "last_updated": text(basic.get("last_updated")),
        "enumeration_date": text(basic.get("enumeration_date")),
    }


def probe():
    """A few small requests whose answers are written to the log, to show how the registry behaves today."""
    ok = True
    checks = [
        ("one specialty in one ZIP prefix", {"version": "2.1", "enumeration_type": "NPI-2", "state": "TX",
         "taxonomy_description": "Urgent Care", "postal_code": "794*", "address_purpose": "LOCATION", "limit": 5}),
        ("the same with a full ZIP code", {"version": "2.1", "enumeration_type": "NPI-2", "state": "TX",
         "taxonomy_description": "Urgent Care", "postal_code": "79424", "address_purpose": "LOCATION", "limit": 5}),
        ("a second page", {"version": "2.1", "enumeration_type": "NPI-2", "state": "TX",
         "taxonomy_description": "Family Medicine", "postal_code": "770*", "address_purpose": "LOCATION",
         "limit": 5, "skip": 5}),
    ]
    for name, params in checks:
        data = fetch(params)
        results = data.get("results") or []
        log(f"probe: {name}: keys={sorted(data.keys())} result_count={data.get('result_count')} rows={len(results)}"
            + (f" errors={json.dumps(data.get('Errors'))[:300]}" if data.get("Errors") else "")
            + (f" failed={data.get('_failed')}" if data.get("_failed") else ""))
        for rec in results[:3]:
            r = row_of(rec)
            log(f"probe:   {r['primary_specialty']!r} | {r['city']} {r['zip']} | phone {'yes' if r['phone'] else 'no'}"
                f" | result keys={sorted(rec.keys())}")
        if name.startswith("one specialty") and not results:
            ok = False
    return ok


def main():
    started = time.time()
    OUT.mkdir(parents=True, exist_ok=True)
    good = probe()
    if "--probe" in sys.argv or not good:
        if not good:
            log("STOP: the first probe returned nothing, so the search would too. See the lines above.")
        (OUT / "run_log.txt").write_text("\n".join(log_lines) + "\n")
        return 0 if good else 2

    jobs = [(label, term, prefix) for label, term in TERMS for prefix in PREFIXES]
    rows = {}        # npi -> row
    matched = {}     # npi -> set of terms that returned it
    per_term = {}

    def work(job):
        label, term, prefix = job
        return job, gather(term, prefix)

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for done, ((label, term, prefix), found) in enumerate(pool.map(work, jobs), 1):
            for rec in found:
                r = row_of(rec)
                if not r["npi"]:
                    continue
                rows.setdefault(r["npi"], r)
                matched.setdefault(r["npi"], set()).add(term)
            per_term[term] = per_term.get(term, 0) + len(found)
            if done % 100 == 0:
                log(f"{done}/{len(jobs)} searches done, {len(rows)} organizations so far, "
                    f"{stats['requests']} requests, {round(time.time() - started)} s")

    with gzip.open(OUT / "raw.csv.gz", "wt", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=FIELDS)
        writer.writeheader()
        for npi in sorted(rows):
            writer.writerow({**rows[npi], "matched_terms": " | ".join(sorted(matched[npi]))})

    in_texas = sum(1 for r in rows.values() if r["state"] == "TX")
    summary = {
        "source": "NPI Registry (NPPES), Centers for Medicare & Medicaid Services, " + BASE,
        "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "organizations": len(rows), "with_texas_practice_address": in_texas,
        "with_phone": sum(1 for r in rows.values() if r["phone"]),
        "rows_returned_per_term": per_term, "requests": stats["requests"], "retries": stats["retries"],
        "failed_requests": stats["errors"], "searches_cut_short": stats["capped"],
        "seconds": round(time.time() - started),
    }
    (OUT / "summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    log("done: " + json.dumps(summary))
    (OUT / "run_log.txt").write_text("\n".join(log_lines) + "\n")
    return 0 if not stats["errors"] else 1


if __name__ == "__main__":
    sys.exit(main())
