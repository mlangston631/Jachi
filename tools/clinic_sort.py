#!/usr/bin/env python3
"""Turn the raw registry rows (tools/clinic_list.py) into the outreach call list: one row per phone number, with
the kind of care, the area of Texas, the practice's own time zone and the contact the registry has on file.

    python3 tools/clinic_sort.py <folder with tx_organizations.csv.gz and taxonomy_codes.csv> <folder to write to>

Writes call_list.csv (every practice) and first_wave.csv (a first batch for the tracker: every area and every kind
of care, no more than two locations per owner). Standard library only. Practices only, never patients.
"""
import collections
import csv
import gzip
import re
import sys
from pathlib import Path

KINDS = ["Primary care", "Urgent care", "Therapy and mental health", "Women's health", "Men's health", "Skin care",
         "Weight management", "Labs"]

# The registry's own name for each specialty -> the kind of care Jachi coordinates. Anything not listed is left out
# (hospitals, dentists, children's practices, addiction programs, surgery and the rest).
EXACT = {
    "Primary care": [
        "Family Medicine", "Family Medicine, Adult Medicine", "Family Medicine, Geriatric Medicine",
        "Internal Medicine", "Internal Medicine, Geriatric Medicine", "General Practice",
        "Clinic/Center, Primary Care", "Clinic/Center, Federally Qualified Health Center (FQHC)",
        "Clinic/Center, Rural Health", "Clinic/Center, Community Health", "Clinic/Center, Migrant Health",
        "Nurse Practitioner", "Nurse Practitioner, Family", "Nurse Practitioner, Adult Health",
        "Nurse Practitioner, Primary Care", "Nurse Practitioner, Gerontology",
        "Physician Assistant", "Physician Assistant, Medical",
    ],
    "Urgent care": ["Clinic/Center, Urgent Care"],
    "Therapy and mental health": [
        "Clinic/Center, Mental Health (Including Community Mental Health Center)", "Clinic/Center, Adult Mental Health",
        "Community/Behavioral Health", "Psychiatry & Neurology, Psychiatry",
        "Psychologist", "Psychologist, Clinical", "Psychologist, Counseling", "Psychologist, Cognitive & Behavioral",
        "Psychologist, Adult Development & Aging", "Psychologist, Group Psychotherapy", "Psychologist, Health",
        "Psychologist, Health Service", "Psychologist, Family", "Psychologist, Psychoanalysis",
        "Psychologist, Prescribing (Medical)", "Psychoanalyst",
        "Counselor", "Counselor, Professional", "Counselor, Mental Health",
        "Social Worker", "Social Worker, Clinical", "Marriage & Family Therapist",
        "Nurse Practitioner, Psych/Mental Health", "Clinical Nurse Specialist, Psych/Mental Health",
        "Clinical Nurse Specialist, Psych/Mental Health, Adult",
    ],
    "Women's health": [
        "Obstetrics & Gynecology", "Obstetrics & Gynecology, Gynecology", "Obstetrics & Gynecology, Obstetrics",
        "Clinic/Center, Family Planning, Non-Surgical", "Nurse Practitioner, Women's Health",
        "Nurse Practitioner, Obstetrics & Gynecology",
    ],
    "Men's health": ["Urology"],
    "Skin care": ["Dermatology", "Dermatology, MOHS-Micrographic Surgery", "Dermatology, Procedural Dermatology"],
    "Labs": ["Clinical Medical Laboratory"],
}
KIND_OF = {name: kind for kind, names in EXACT.items() for name in names}
# A group or clinic registered without a specialty of its own takes the first listed specialty that counts.
GENERIC = {"Clinic/Center", "Clinic/Center, Multi-Specialty", "Clinic/Center, Health Service", "Clinic/Center, Health Services",
           "Multi-Specialty Group", "Single Specialty Group", "Multi-Specialty", "Single Specialty", "Specialist",
           "Clinic/Center, Medical Specialty", "Clinic/Center, Physician Assistant"}


def kind_of(name):
    if name.endswith(("Obesity Medicine", "Bariatric Medicine")):
        return "Weight management"
    return KIND_OF.get(name)


AREAS = [  # by the first three digits of the ZIP code
    ("Dallas-Fort Worth", "750 751 752 753 760 761 762"),
    ("Houston", "770 771 772 773 774 775"),
    ("San Antonio", "780 781 782"),
    ("Austin", "733 786 787 789"),
    ("El Paso and Far West Texas", "798 799 885"),
    ("Rio Grande Valley", "785"),
    ("Corpus Christi", "783 784"),
    ("Northeast Texas", "754 755"),
    ("East Texas", "756 757 758 759"),
    ("Beaumont-Port Arthur", "776 777"),
    ("Bryan-College Station", "778"),
    ("Victoria", "779"),
    ("Waco, Temple and Killeen", "765 766 767"),
    ("Wichita Falls and North Central Texas", "763 764"),
    ("San Angelo and Brownwood", "768 769"),
    ("Abilene", "795 796"),
    ("Lubbock", "793 794"),
    ("Amarillo and the Panhandle", "790 791 792"),
    ("Midland-Odessa", "797"),
    ("Del Rio, Eagle Pass and Uvalde", "788"),
]
AREA_OF = {prefix: area for area, prefixes in AREAS for prefix in prefixes.split()}
LAREDO = {f"7804{d}" for d in "0123456789"}
# El Paso and Hudspeth counties keep Mountain time; the rest of Texas keeps Central time.
MOUNTAIN_798 = {"79821", "79835", "79836", "79837", "79838", "79839", "79847", "79849", "79851", "79853"}
BIG = {"Dallas-Fort Worth": 2.0, "Houston": 2.0, "San Antonio": 1.5, "Austin": 1.5}
QUOTA = {"Primary care": 18, "Urgent care": 9, "Therapy and mental health": 14, "Women's health": 6, "Men's health": 4,
         "Skin care": 4, "Weight management": 3, "Labs": 4}

UPPER = {"NW", "NE", "SW", "SE", "FM", "LLC", "PLLC", "PA", "PC", "PLLP", "LLP", "LP", "MD", "DO", "NP", "PHD", "LPC", "LCSW", "LMFT", "DDS", "II", "III",
         "IV", "TX", "USA", "UT", "ER", "ENT", "OB", "GYN", "OBGYN", "HCA", "UTMB", "MSO", "PSC", "DBA", "FQHC", "CHC",
         "BHS", "MHMR", "ABA", "IDD", "APRN", "FNP", "PMHNP", "RN", "CEO", "CFO", "COO", "CMO", "VP", "EVP", "AVP", "CIO", "CAO", "CNO", "CTO", "DON", "LVN", "HR", "IT", "DNP", "ARNP", "ANP", "PAC",
         "LPCS", "LMSW", "LCDC", "PSYD", "EDD", "MBA", "MHA", "MSN", "BSN", "MA", "MS", "MPH", "CPA", "JD"}
LOWER = {"of", "and", "the", "for", "at", "in", "on", "de", "la", "del", "y"}
NO_TITLE = {"authorized official", "authorized representative", "official", "authorized offical", "ao", "n/a", "none"}
TITLES = {"DR", "ST", "MT", "FT", "LTD", "JR", "SR", "MR", "MRS", "MS", "BLVD", "RD", "HWY", "PKWY", "STE", "FM", "NW", "NE", "SW", "SE"}
CITY_FIX = {"Mcallen": "McAllen", "Mckinney": "McKinney", "Mcgregor": "McGregor", "Mccamey": "McCamey", "Mclean": "McLean",
            "Desoto": "DeSoto", "Mcdade": "McDade", "Mcqueeney": "McQueeney"}


def nice(text):
    """The registry writes everything in capitals: 'WOMEN'S CLINIC OF TEXAS, PLLC' -> 'Women's Clinic of Texas, PLLC'."""
    words = []
    for i, word in enumerate(text.split()):
        core = re.sub(r"[^A-Za-z]", "", word).upper()
        initials = 2 <= len(core) <= 4 and not set(core) & set("AEIOUY") and core not in TITLES  # DFW, LMC, SVP
        if core in UPPER or initials or re.search(r"\d", word):
            words.append(word.upper())
        elif i and core.lower() in LOWER:
            words.append(word.lower())
        else:
            word = re.sub(r"[A-Za-z]+('[A-Za-z]+)?", lambda m: m.group(0)[0].upper() + m.group(0)[1:].lower(), word)
            words.append(re.sub(r"\bMc([a-z])(?=[a-z]{2})", lambda m: "Mc" + m.group(1).upper(), word))  # McAllen, McBee
    return " ".join(words)


def digits(phone):
    d = re.sub(r"\D", "", phone or "")
    if len(d) == 11 and d[0] == "1":
        d = d[1:]
    return d if len(d) == 10 and d[0] not in "01" and len(set(d)) > 2 else ""


def show_phone(d):
    return f"({d[:3]}) {d[3:6]}-{d[6:]}" if d else ""


def area_of(zip5):
    if zip5 in LAREDO:
        return "Laredo"
    return AREA_OF.get(zip5[:3], "Other Texas")


def zone_of(zip5):
    return "Mountain" if zip5[:3] in ("799", "885") or zip5 in MOUNTAIN_798 else "Central"


def stamp(date):
    """MM/DD/YYYY (the file) or YYYY-MM-DD -> YYYY-MM-DD, so dates sort."""
    m = re.fullmatch(r"(\d{2})/(\d{2})/(\d{4})", date or "")
    return f"{m.group(3)}-{m.group(1)}-{m.group(2)}" if m else (date or "")


def main(src, dest):
    src, dest = Path(src), Path(dest)
    dest.mkdir(parents=True, exist_ok=True)
    names = {r["code"]: r["description"] for r in csv.DictReader(open(src / "taxonomy_codes.csv", encoding="utf-8"))}
    raw = list(csv.DictReader(gzip.open(src / "tx_organizations.csv.gz", "rt", encoding="utf-8")))
    owners = collections.Counter(digits(r["official_phone"]) for r in raw if digits(r["official_phone"]))

    left_out = collections.Counter()
    by_phone = collections.defaultdict(list)
    no_phone = 0
    for r in raw:
        primary = names.get(r["primary_code"], "")
        listed = [names.get(c, "") for c in r["codes"].split()]
        kind = kind_of(primary)
        if not kind and (primary in GENERIC or not primary):
            kind = next((k for k in map(kind_of, listed) if k), None)
        if not kind:
            left_out[primary or "(no specialty named)"] += 1
            continue
        phone = digits(r["phone"])
        if not phone:
            no_phone += 1
            continue
        kinds = [kind] + [k for k in map(kind_of, listed) if k and k != kind]
        by_phone[phone].append({**r, "_kinds": list(dict.fromkeys(kinds)), "_primary": primary, "_updated": stamp(r["last_updated"])})

    rows, odd_zip = [], 0
    for phone, group in by_phone.items():
        group.sort(key=lambda r: (r["other_name_type"] != "3", r["_updated"]), reverse=False)
        group.sort(key=lambda r: r["_updated"], reverse=True)
        best = next((r for r in group if r["other_name"] and r["other_name_type"] == "3"), group[0])  # 3 = doing business as
        kinds = [k for k in KINDS if any(k in r["_kinds"] for r in group)]
        main_kind = collections.Counter(r["_kinds"][0] for r in group).most_common(1)[0][0]
        zip5 = re.sub(r"\D", "", best["zip"])[:5]
        if area_of(zip5) == "Other Texas":   # a ZIP code that isn't a Texas one: a slip in the registry, not worth a call
            odd_zip += 1
            continue
        legal = nice(best["name"])
        trade = nice(best["other_name"]) if best["other_name"] and best["other_name_type"] == "3" else ""
        owner_phone = digits(best["official_phone"])
        official = nice(best["official_name"]).strip(" ,")
        letters = best["official_credential"].upper().replace(".", "").strip(" ,")   # MD, LPC, DNP ...
        if letters and letters.replace(" ", "") not in official.upper().replace(".", "").replace(" ", ""):
            official += ", " + letters
        title = nice(best["official_title"])
        plain = lambda text: re.sub(r"[^a-z]", "", text.lower())
        said = {plain(t) for t in re.split(r"[,\s/]+", letters) if t}
        words = title.split()
        while words and plain(words[0]) in said:   # "MD Owner" after "..., MD" -> "Owner"
            words.pop(0)
        title = " ".join(words).lstrip("/,- ")
        if title.lower() in NO_TITLE:              # "Authorized Official" says nothing
            title = ""
        rows.append({
            "Area": area_of(zip5), "City": CITY_FIX.get(nice(best["city"]), nice(best["city"])), "Kind of care": main_kind,
            "Practice": trade or legal or official or "Name not on file", "Phone": show_phone(phone),
            "Address": ", ".join(x for x in (nice(best["address_1"]), nice(best["address_2"])) if x), "ZIP": zip5,
            "Time zone": zone_of(zip5),
            "Contact on file": ", ".join(x for x in (official, title) if x),
            "Also offers": "; ".join(k for k in kinds if k != main_kind),
            "Legal name": legal if trade and trade.lower() != legal.lower() else "",
            "Registry specialty": best["_primary"], "Registry entries at this number": len(group),
            "Owner's entries in Texas": owners.get(owner_phone, 1), "Registry updated": best["_updated"], "NPI": best["npi"],
            "_owner": owner_phone or phone,
        })
    order = {a: i for i, (a, _) in enumerate(AREAS)}
    rows.sort(key=lambda r: (order.get(r["Area"], 50 if r["Area"] == "Laredo" else 99), KINDS.index(r["Kind of care"]), r["City"], r["Practice"]))

    # The first wave: each area and each kind of care, the most recently updated entries first, and no more than two
    # locations under one owner, so one hospital system can't fill the list.
    wave, seen_owner = [], collections.Counter()
    cells = collections.defaultdict(list)
    for r in rows:
        cells[(r["Area"], r["Kind of care"])].append(r)
    for (area, kind), cell in cells.items():
        take = round(QUOTA[kind] * BIG.get(area, 1.0))
        cell = sorted(cell, key=lambda r: r["Registry updated"], reverse=True)
        picked = 0
        for r in cell:
            if picked >= take:
                break
            if seen_owner[r["_owner"]] >= 2:
                continue
            seen_owner[r["_owner"]] += 1
            wave.append(r)
            picked += 1
    wave.sort(key=lambda r: (order.get(r["Area"], 50 if r["Area"] == "Laredo" else 99), KINDS.index(r["Kind of care"]), r["City"], r["Practice"]))

    fields = [f for f in rows[0] if not f.startswith("_")]
    for name, data in (("call_list.csv", rows), ("first_wave.csv", wave)):
        with open(dest / name, "w", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=fields, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(data)
    print(f"organizations read: {len(raw)}; practices on the list: {len(rows)}; first wave: {len(wave)}; "
          f"left out for having no usable phone: {no_phone}, for a ZIP code outside Texas: {odd_zip}")
    print("by kind:", dict(collections.Counter(r["Kind of care"] for r in rows)))
    print("by area:", dict(collections.Counter(r["Area"] for r in rows)))
    print("most common specialties left out:", left_out.most_common(25))
    return rows, wave


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
