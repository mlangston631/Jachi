#!/usr/bin/env python3
"""Fetch the raw material for the clinic outreach call list: every active organization (practice, clinic, lab) whose
practice address is in Texas, with its registered specialties, from the federal NPI Registry.

Source: the NPPES monthly data file, published free by the Centers for Medicare & Medicaid Services at
https://download.cms.gov/nppes/NPI_Files.html . It is a public directory of providers. Everything in it is about
practices, never patients, so nothing this tool reads or writes is health information.

    python3 tools/clinic_list.py     # writes outreach/tx_organizations.csv.gz, taxonomy_codes.csv, summary.json, run_log.txt

Needs internet access and about 2 GB of disk for the download. Standard library plus the `unzip` command.
Sorting the rows into a call list (one row per phone number, by area and kind of care) happens afterwards, away from
here, so those rules can change without downloading the file again.

Why the whole file and not the registry's search API: the API finds a specialty by its description but looks at no
more than ten matching specialty codes per search, so a search for "Obstetrics & Gynecology" silently leaves out
most OB-GYN practices (measured Nov 16, 2026). The file has every code for every organization.
"""
import csv
import gzip
import io
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

INDEX = os.environ.get("NPPES_INDEX_URL", "https://download.cms.gov/nppes/NPI_Files.html")
ZIP_URL = os.environ.get("NPPES_ZIP_URL", "")
API = os.environ.get("NPI_API_BASE", "https://npiregistry.cms.hhs.gov/api/")
OUT = Path(os.environ.get("NPI_OUT", Path(__file__).resolve().parent.parent / "outreach"))
WORK = Path(os.environ.get("NPI_WORK", os.environ.get("RUNNER_TEMP", "/tmp")))
STATE = os.environ.get("NPI_STATE", "TX")
AGENT = "JachiHealth-clinic-list/2.0 (+https://jachihealth.com; support@jachihealth.com)"
MONTHS = "January February March April May June July August September October November December".split()

log_lines = []


def log(line):
    log_lines.append(line)
    print(line, flush=True)


def save_log():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "run_log.txt").write_text("\n".join(log_lines) + "\n")


def get(url, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read()


def monthly_file_url():
    """The newest full monthly file linked from CMS's page (not a weekly update, not the deactivation list)."""
    if ZIP_URL:
        return ZIP_URL
    page = get(INDEX).decode("utf-8", "replace")
    links = re.findall(r'href="([^"]+\.zip)"', page, flags=re.I)
    log(f"index: {len(links)} zip links: " + ", ".join(link.rsplit('/', 1)[-1] for link in links[:12]))
    full = []
    for link in links:
        name = link.rsplit("/", 1)[-1]
        m = re.fullmatch(r"NPPES_Data_Dissemination_([A-Za-z]+)_(\d{4})(_V2)?\.zip", name, flags=re.I)
        if m and m.group(1).capitalize() in MONTHS:
            full.append(((int(m.group(2)), MONTHS.index(m.group(1).capitalize()), 1 if m.group(3) else 0), link))
    if not full:
        raise RuntimeError("no monthly file link found on " + INDEX)
    return urllib.parse.urljoin(INDEX, max(full)[1])


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": AGENT})
    started, size = time.time(), 0
    with urllib.request.urlopen(req, timeout=120) as res, open(dest, "wb") as fh:
        while True:
            block = res.read(4 << 20)
            if not block:
                break
            fh.write(block)
            size += len(block)
    log(f"downloaded {url.rsplit('/', 1)[-1]}: {size / 1e6:.0f} MB in {time.time() - started:.0f} s")


def norm(text):
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def column(header, *words, exclude=()):
    """The index of the one column whose name has every word (so a small renaming by CMS doesn't break the tool)."""
    hits = [i for i, name in enumerate(header)
            if all(w in norm(name) for w in words) and not any(x in norm(name) for x in exclude)]
    if len(hits) != 1:
        raise RuntimeError(f"expected one column for {words}, found {[header[i] for i in hits]}")
    return hits[0]


def clean(value):
    return " ".join((value or "").split())


def read_organizations(zip_path):
    names = subprocess.run(["unzip", "-Z1", str(zip_path)], check=True, capture_output=True, text=True).stdout.split("\n")
    log("in the zip: " + ", ".join(n for n in names if n))
    main = [n for n in names if re.match(r"npidata_pfile_.*\.csv$", n, flags=re.I) and "fileheader" not in n.lower()]
    if len(main) != 1:
        raise RuntimeError(f"expected one npidata_pfile, found {main}")
    proc = subprocess.Popen(["unzip", "-p", str(zip_path), main[0]], stdout=subprocess.PIPE)
    lines = io.TextIOWrapper(proc.stdout, encoding="utf-8", errors="replace", newline="")
    header = next(csv.reader([next(lines)]))
    loc = ("business practice location address",)
    cols = {
        "npi": column(header, "npi", exclude=("replacement", "deactivation", "reactivation")),
        "entity": column(header, "entity type code"),
        "name": column(header, "provider organization name"),
        "other_name": column(header, "provider other organization name", exclude=("type",)),
        "other_name_type": column(header, "provider other organization name type code"),
        "address_1": column(header, "first line", *loc),
        "address_2": column(header, "second line", *loc),
        "city": column(header, *loc, "city"),
        "state": column(header, *loc, "state"),
        "zip": column(header, *loc, "postal code"),
        "phone": column(header, *loc, "telephone"),
        "fax": column(header, *loc, "fax"),
        "enumeration_date": column(header, "provider enumeration date"),
        "last_updated": column(header, "last update date"),
        "deactivated": column(header, "npi deactivation date"),
        "reactivated": column(header, "npi reactivation date"),
        "official_last": column(header, "authorized official last name"),
        "official_first": column(header, "authorized official first name"),
        "official_title": column(header, "authorized official title"),
        "official_phone": column(header, "authorized official telephone"),
        "official_credential": column(header, "authorized official credential"),
        "subpart": column(header, "is organization subpart"),
        "parent": column(header, "parent organization lbn"),
    }
    # The fifteen specialty slots go by their exact names ("code 1" would otherwise also match 10 to 15)
    exact = {norm(name): i for i, name in enumerate(header)}
    codes = [(exact[f"healthcare provider taxonomy code {n}"], exact[f"healthcare provider primary taxonomy switch {n}"])
             for n in range(1, 16)]
    log(f"file {main[0]}: {len(header)} columns; using " + json.dumps({k: header[v] for k, v in cols.items()}))

    quoted, bare = f'"{STATE}"', f",{STATE},"
    total = kept = 0
    for line in lines:
        total += 1
        if quoted not in line and bare not in line:  # a cheap first pass: only lines that mention the state are parsed
            continue
        row = next(csv.reader([line]))
        if len(row) != len(header) or row[cols["entity"]] != "2" or row[cols["state"]] != STATE:
            continue
        if row[cols["deactivated"]] and not row[cols["reactivated"]]:
            continue
        kept += 1
        specialties = [(row[c], row[s]) for c, s in codes if row[c]]
        yield {
            "npi": row[cols["npi"]], "name": clean(row[cols["name"]]),
            "other_name": clean(row[cols["other_name"]]), "other_name_type": row[cols["other_name_type"]],
            "address_1": clean(row[cols["address_1"]]), "address_2": clean(row[cols["address_2"]]),
            "city": clean(row[cols["city"]]), "state": row[cols["state"]], "zip": row[cols["zip"]],
            "phone": row[cols["phone"]], "fax": row[cols["fax"]],
            "official_name": clean(f"{row[cols['official_first']]} {row[cols['official_last']]}"),
            "official_credential": clean(row[cols["official_credential"]]),
            "official_title": clean(row[cols["official_title"]]), "official_phone": row[cols["official_phone"]],
            "enumeration_date": row[cols["enumeration_date"]], "last_updated": row[cols["last_updated"]],
            "subpart": row[cols["subpart"]], "parent": clean(row[cols["parent"]]),
            "primary_code": next((c for c, s in specialties if s == "Y"), specialties[0][0] if specialties else ""),
            "codes": " ".join(dict.fromkeys(c for c, _ in specialties)),
        }
    proc.wait()
    log(f"read {total} providers; kept {kept} active organizations with a practice address in {STATE}")


def describe_codes(rows):
    """What each specialty code is called, asked of the registry's API by looking up organizations that hold it."""
    wanted = {c for r in rows for c in r["codes"].split()}
    names, asked = {}, 0
    by_size = sorted(rows, key=lambda r: -len(r["codes"].split()))
    for r in by_size:
        if not (set(r["codes"].split()) - names.keys()):
            continue
        if asked >= 1500:
            break
        asked += 1
        try:
            data = json.loads(get(f"{API}?version=2.1&number={r['npi']}", timeout=40).decode("utf-8", "replace"))
        except Exception as err:
            log(f"lookup failed for one organization: {type(err).__name__}")
            time.sleep(2)
            continue
        for rec in data.get("results") or []:
            for t in rec.get("taxonomies") or []:
                if t.get("code") and t.get("desc"):
                    names.setdefault(t["code"], clean(t["desc"]))
        time.sleep(0.2)
        if wanted <= names.keys():
            break
    log(f"specialty names: {len(wanted & names.keys())} of {len(wanted)} codes named, in {asked} lookups")
    return names, sorted(wanted - names.keys())


def main():
    started = time.time()
    OUT.mkdir(parents=True, exist_ok=True)
    try:
        url = monthly_file_url()
        log("monthly file: " + url)
        zip_path = WORK / "nppes_monthly.zip"
        download(url, zip_path)
        rows = list(read_organizations(zip_path))
        if not rows:
            raise RuntimeError("the file was read but no organization matched: its layout may have changed")
        fields = list(rows[0].keys())
        with gzip.open(OUT / "tx_organizations.csv.gz", "wt", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)
        names, unnamed = describe_codes(rows)
        with open(OUT / "taxonomy_codes.csv", "w", newline="", encoding="utf-8") as fh:
            writer = csv.writer(fh)
            writer.writerow(["code", "description"])
            writer.writerows(sorted(names.items()))
        summary = {
            "source": "NPPES monthly data file, Centers for Medicare & Medicaid Services, " + url,
            "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "organizations": len(rows), "with_phone": sum(1 for r in rows if r["phone"]),
            "specialty_codes": len({c for r in rows for c in r["codes"].split()}), "codes_without_a_name": unnamed,
            "seconds": round(time.time() - started),
        }
        (OUT / "summary.json").write_text(json.dumps(summary, indent=2) + "\n")
        log("done: " + json.dumps(summary))
        code = 0
    except Exception as err:
        log(f"STOPPED: {type(err).__name__}: {err}")
        code = 2
    save_log()
    return code


if __name__ == "__main__":
    sys.exit(main())
