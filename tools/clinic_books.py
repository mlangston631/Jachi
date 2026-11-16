#!/usr/bin/env python3
"""Build the two outreach workbooks from the sorted lists (tools/clinic_sort.py): the tracker's first batch, ready to
bring into a spreadsheet, and the full Texas list.

    python3 tools/clinic_books.py <folder with call_list.csv and first_wave.csv> <folder to write to>

Needs openpyxl. The workbooks hold practices only, never patients. They are working files for the outreach team:
keep them out of this public repository.
"""
import sys
import csv
import collections
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

SRC = Path(sys.argv[1])
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
PLAYBOOK = "https://claude.ai/artifact/NSe2KNYeG5KnLjeBRdEfYB"
SOURCE = "NPI Registry (NPPES) monthly data file for November 2026, Centers for Medicare & Medicaid Services"
SOURCE_URL = "https://download.cms.gov/nppes/NPI_Files.html"
STATUSES = ["To call", "No answer", "Left voicemail", "Call back", "Info emailed", "Reached", "Prices in writing", "Partner",
            "Not a fit", "Wrong number", "Parked", "Do not call"]
KINDS = ["Primary care", "Urgent care", "Therapy and mental health", "Women's health", "Men's health", "Skin care",
         "Weight management", "Labs"]
HEAD = PatternFill("solid", fgColor="E8EFEA")
BOLD = Font(name="Arial", size=10, bold=True)


def book():
    """A workbook whose default font is Arial 10, so cells without a style of their own use it too."""
    from openpyxl.utils.indexed_list import IndexedList
    wb = Workbook()
    arial = Font(name="Arial", size=10, family=2)
    wb._fonts = IndexedList([arial])
    wb._named_styles["Normal"].font = arial
    return wb


def header(ws, row, names, widths=None):
    for i, name in enumerate(names, 1):
        cell = ws.cell(row=row, column=i if not isinstance(names, dict) else i, value=name)
        cell.font = BOLD
        cell.fill = HEAD
        cell.alignment = Alignment(vertical="top", wrap_text=True)
    if widths:
        for i, width in enumerate(widths, 1):
            ws.column_dimensions[get_column_letter(i)].width = width


full = list(csv.DictReader(open(SRC / "call_list.csv", encoding="utf-8")))
wave = list(csv.DictReader(open(SRC / "first_wave.csv", encoding="utf-8")))
in_wave = {r["NPI"] for r in wave}
areas = list(dict.fromkeys(r["Area"] for r in full))

# ---------- 1. The tracker ----------
wb = book()
ws = wb.active
ws.title = "Tracker"
COLS = [  # name, width, where the value comes from
    ("Practice", 34, "Practice"), ("Phone", 15, "Phone"), ("Status", 16, None), ("Call back on", 13, None),
    ("City", 16, "City"), ("Kind of care", 22, "Kind of care"), ("Area", 24, "Area"), ("Time zone", 10, "Time zone"),
    ("Contact on file", 30, "Contact on file"), ("Tries", 7, None), ("Last call", 12, None), ("Spoke with", 20, None),
    ("Booking contact", 22, None), ("New self-pay patients", 13, None), ("New-patient price", 12, None),
    ("Follow-up price", 12, None), ("Soonest new patient", 14, None), ("Telehealth", 11, None),
    ("Evenings or weekends", 12, None), ("Spanish", 9, None), ("Email for confirmation", 26, None),
    ("Confirmed in writing on", 14, None), ("OK to name", 11, None), ("Notes", 46, None),
    ("Address", 34, "Address"), ("ZIP", 8, "ZIP"), ("Also offers", 22, "Also offers"), ("Legal name", 30, "Legal name"),
    ("Registry specialty", 28, "Registry specialty"), ("Registry updated", 13, "Registry updated"), ("NPI", 12, "NPI"),
]
header(ws, 1, [c[0] for c in COLS], [c[1] for c in COLS])
for r in wave:
    ws.append([("To call" if name == "Status" else (r[src] if src else None)) for name, _, src in COLS])
last = ws.max_row
letter = {name: get_column_letter(i) for i, (name, _, _) in enumerate(COLS, 1)}
for name in ("Call back on", "Last call", "Confirmed in writing on"):
    for cell in ws[letter[name]][1:]:
        cell.number_format = "m/d/yyyy"
for name in ("New-patient price", "Follow-up price"):
    for cell in ws[letter[name]][1:]:
        cell.number_format = "$#,##0"
for cell in ws[letter["Notes"]][1:]:
    cell.alignment = Alignment(wrap_text=True, vertical="top")
ws.freeze_panes = "B2"
ws.row_dimensions[1].height = 30

sm = wb.create_sheet("Summary")
sm.sheet_view.showGridLines = False
sm.column_dimensions["A"].width = 3
for col, width in zip("BCDEFGH", (34, 44, 26, 14, 16, 12, 14)):
    sm.column_dimensions[col].width = width
T = "Tracker!"
S, D, F, G, J = (T + f"{letter[n]}:{letter[n]}" for n in ("Status", "Call back on", "Kind of care", "Area", "Tries"))
reached = lambda extra="": "+".join(f'COUNTIFS({S},"{s}"{extra})' for s in ("Reached", "Prices in writing", "Partner"))
written = lambda extra="": "+".join(f'COUNTIFS({S},"{s}"{extra})' for s in ("Prices in writing", "Partner"))

sm["B2"] = "Clinic outreach summary"
sm["B2"].font = Font(name="Arial", size=14, bold=True)
sm["B3"] = "These counts update by themselves as the Tracker sheet is filled in."
figures = [("Practices on this list", f"=COUNTA({T}A:A)-1"), ("Practices tried", f'=COUNTIF({J},">0")'),
           ("Dials made", f"=SUM({J})"), ("Reached", "=" + reached()), ("Prices in writing", "=" + written()),
           ("Partners", f'=COUNTIF({S},"Partner")'), ("Callbacks due today or earlier", f'=COUNTIFS({S},"Call back",{D},"<="&TODAY())')]
sm["B5"] = "At a glance"
sm["B5"].font = BOLD
for i, (label, formula) in enumerate(figures):
    sm.cell(row=6 + i, column=2, value=label)
    sm.cell(row=6 + i, column=3, value=formula).alignment = Alignment(horizontal="left")

row = 6 + len(figures) + 1
sm.cell(row=row, column=2, value="By status").font = BOLD
for i, name in enumerate(("Status", "Practices")):
    c = sm.cell(row=row + 1, column=2 + i, value=name); c.font = BOLD; c.fill = HEAD
for i, status in enumerate(STATUSES):
    sm.cell(row=row + 2 + i, column=2, value=status)
    sm.cell(row=row + 2 + i, column=3, value=f"=COUNTIF({S},B{row + 2 + i})").alignment = Alignment(horizontal="left")

row = row + 2 + len(STATUSES) + 1
for title, items, col in (("By area", areas, G), ("By kind of care", KINDS, F)):
    sm.cell(row=row, column=2, value=title).font = BOLD
    for i, name in enumerate((title[3:].capitalize(), "On the list", "Tried", "Reached", "Prices in writing", "Partners")):
        c = sm.cell(row=row + 1, column=2 + i, value=name); c.font = BOLD; c.fill = HEAD
    for i, item in enumerate(items):
        r = row + 2 + i
        me = f",{col},B{r}"
        sm.cell(row=r, column=2, value=item)
        sm.cell(row=r, column=3, value=f"=COUNTIF({col},B{r})").alignment = Alignment(horizontal="left")
        sm.cell(row=r, column=4, value=f'=COUNTIFS({col},B{r},{J},">0")')
        sm.cell(row=r, column=5, value="=" + reached(me))
        sm.cell(row=r, column=6, value="=" + written(me))
        sm.cell(row=r, column=7, value=f'=COUNTIFS({S},"Partner"{me})')
    row = row + 2 + len(items) + 1

sm.cell(row=row, column=2, value="How to fill in a row").font = BOLD
for i, name in enumerate(("Column", "What goes in it", "Example")):
    c = sm.cell(row=row + 1, column=2 + i, value=name); c.font = BOLD; c.fill = HEAD
legend = [
    ("Status", "Pick from the list after every call. The playbook says what each one means.", "Left voicemail"),
    ("Call back on", "The date they asked you to call again.", "11/18/2026"),
    ("Tries and Last call", "Add one to Tries on every call, and put today's date in Last call.", "2 and 11/17/2026"),
    ("Spoke with", "Name and role. A first name is fine.", "Dana, office manager"),
    ("Booking contact", "The number or email coordinators should use to book.", "Front desk, option 2"),
    ("New self-pay patients", "Yes, No or Unsure.", "Yes"),
    ("New-patient price, Follow-up price", "The standard self-pay price in dollars. For a range, put the low end here and the range in Notes.", "150"),
    ("Soonest new patient", "How long a new patient usually waits.", "3 days"),
    ("Telehealth, Evenings or weekends, Spanish", "Yes or No.", "No"),
    ("Email for confirmation", "Where the follow-up email went.", "The practice's front-desk address"),
    ("Confirmed in writing on", "The date their reply arrived.", "11/19/2026"),
    ("OK to name", "Yes, No or Later. Only Yes counts.", "Later"),
    ("Notes", "Anything a coordinator should know before calling. Never anything about a patient.", "Closed for lunch 12 to 1"),
]
for i, line in enumerate(legend):
    for j, value in enumerate(line):
        sm.cell(row=row + 2 + i, column=2 + j, value=value).alignment = Alignment(wrap_text=True, vertical="top")
row = row + 2 + len(legend) + 1
sm.cell(row=row, column=2, value="Where this list comes from").font = BOLD
sm.cell(row=row + 1, column=2, value=f"{SOURCE}. Practices report their own details to the registry, so some phone numbers "
        "will be out of date: mark those Wrong number. Columns from Address onward are the registry's own details.")
sm.cell(row=row + 1, column=2).alignment = Alignment(wrap_text=True, vertical="top")
sm.merge_cells(start_row=row + 1, start_column=2, end_row=row + 1, end_column=4)
sm.row_dimensions[row + 1].height = 44
sm.cell(row=row + 2, column=2, value="Source page").hyperlink = SOURCE_URL
sm.cell(row=row + 3, column=2, value="Clinic outreach playbook: scripts, rules and what each status means").hyperlink = PLAYBOOK
for r in (row + 2, row + 3):
    sm.cell(row=r, column=2).font = Font(name="Arial", size=10, underline="single", color="1E4A3B")
wb.save(OUT / "tracker_import.xlsx")
print("tracker:", last - 1, "practices,", len(COLS), "columns; summary rows to", row + 3)

# ---------- 2. The full Texas list ----------
wb = book()
ws = wb.active
ws.title = "Practices"
FULL = [("Area", 26), ("City", 18), ("Kind of care", 24), ("Practice", 40), ("Phone", 15), ("Time zone", 10),
        ("Contact on file", 34), ("Address", 36), ("ZIP", 8), ("Also offers", 24), ("Legal name", 34),
        ("Registry specialty", 30), ("Registry updated", 14), ("Owner's entries in Texas", 12), ("NPI", 12), ("In the tracker", 12)]
header(ws, 1, [c[0] for c in FULL], [c[1] for c in FULL])
for r in full:
    ws.append([r["Area"], r["City"], r["Kind of care"], r["Practice"], r["Phone"], r["Time zone"], r["Contact on file"],
               r["Address"], r["ZIP"], r["Also offers"], r["Legal name"], r["Registry specialty"], r["Registry updated"],
               int(r["Owner's entries in Texas"]), r["NPI"], "First batch" if r["NPI"] in in_wave else None])
ws.freeze_panes = "A2"
ws.auto_filter.ref = f"A1:{get_column_letter(len(FULL))}{ws.max_row}"
n = ws.max_row

rm = wb.create_sheet("Read me")
rm.column_dimensions["A"].width = 34
rm.column_dimensions["B"].width = 16
rm.column_dimensions["C"].width = 70
lines = [
    ("Texas practices for clinic outreach", None, None),
    ("What this is", None, "Every practice in Texas that offers a kind of care Jachi coordinates and has a phone number in the federal provider registry. One row per phone number. Practices only: nothing here is about a patient."),
    ("Source", None, f"{SOURCE}, {SOURCE_URL}. The file holds registry data through November 2, 2026."),
    ("How the list was made", None, "Active organizations with a Texas practice address were kept when their registered specialty matched one of the eight kinds of care below. Entries that share a phone number became one row, named by the practice's doing-business-as name when the registry has one."),
    ("What to know before calling", None, "Practices report their own details to the registry and don't always update them, so some numbers are out of date. 'Registry updated' shows when each entry last changed: newer entries are more reliable. Sole practitioners who never registered a practice are not in this list."),
    ("In the tracker", None, "'First batch' marks the practices already loaded into the outreach tracker, so the next batch can be taken from the rest."),
    ("Owner's entries in Texas", None, "How many registry entries across Texas share this practice's registered owner contact. A large number usually means a hospital system or a chain."),
]
for i, (a, b, c) in enumerate(lines, 1):
    rm.cell(row=i, column=1, value=a).font = Font(name="Arial", size=14 if i == 1 else 10, bold=True)
    if c:
        cell = rm.cell(row=i, column=3, value=c)
        cell.alignment = Alignment(wrap_text=True, vertical="top")
        rm.cell(row=i, column=1).alignment = Alignment(vertical="top")
        rm.row_dimensions[i].height = 58
row = len(lines) + 2
P = "Practices!"
rm.cell(row=row, column=1, value="Practices on the list").font = BOLD
rm.cell(row=row, column=2, value=f"=COUNTA({P}D:D)-1").alignment = Alignment(horizontal="left")
row += 2
for title, items, col in (("Kind of care", KINDS, "C"), ("Area", areas, "A")):
    for i, name in enumerate((title, "Practices")):
        c = rm.cell(row=row, column=1 + i, value=name); c.font = BOLD; c.fill = HEAD
    for i, item in enumerate(items):
        rm.cell(row=row + 1 + i, column=1, value=item)
        rm.cell(row=row + 1 + i, column=2, value=f"=COUNTIF({P}{col}:{col},A{row + 1 + i})").alignment = Alignment(horizontal="left")
    row += len(items) + 2
wb.save(OUT / "Texas practices for clinic outreach.xlsx")
print("full list:", n - 1, "practices; first batch marked:", sum(1 for r in full if r["NPI"] in in_wave))
print("areas:", areas)
