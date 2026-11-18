#!/usr/bin/env python3
"""Writes the shot plans for sections 2-7 of episode 1 (sections/sN.json), from the shot list
(network/ch-12/ep01-petters-shotlist.md). Section 1 (the cold open) is written by hand in sections/s1.json.

    python3 -I production/ep01-petters/plans.py

Rules kept here (shot list 1.9 and the channel's standing rules):
- Quotes on screen are only the words the script quotes, which the fact pass checked against the record; every quote
  card names its record and date. S1 = U.S. Attorney, D. Minn., 8 Apr 2010; S2 = U.S. Attorney, D. Minn., 2 Sept 2010.
- Figures on screen are only the script's figures. Where the record gives words, not numbers, the graphic shows words.
- Every AI scene carries its label for the whole shot: "Recreation" (people), "Illustration" (no people).
- No faces of real people: the stills were made faceless; shots that show a face in the background are cropped.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
S1 = 'U.S. Attorney, D. Minn. · 8 Apr 2010'
S2 = 'U.S. Attorney, D. Minn. · 2 Sept 2010'
S4 = 'U.S. Court of Appeals, 8th Cir. · 9 Dec 2011'
GEN, CLIP = 'assets/gen/', 'assets/clips/'

# Clips not used: in R19 and R24 a face becomes readable later in the generated motion; their stills are faceless.
NO_CLIP = {'R19', 'R24'}

def clip_or_still(name):
    if name in NO_CLIP:
        return GEN + name + '.png'
    return CLIP + name + '.mp4' if os.path.exists(os.path.join(HERE, CLIP + name + '.mp4')) else GEN + name + '.png'

def rec(name, w, label='Recreation', zoom=(1.0, 1.08), focus=(0.5, 0.5), text=None):
    s = {'w': w, 'src': clip_or_still(name), 'label': label, 'zoom': list(zoom), 'focus': list(focus)}
    if text:
        s['text'] = text
    return s

def ill(name, w, **k):
    return rec(name, w, label='Illustration', **k)

def mg(w, kind, label=None, **spec):
    s = {'w': w, 'src': {'mg': dict(kind=kind, **spec)}}
    if label:
        s['label'] = label
    return s

def quote(w, text, credit, hl=None, size=58, **k):
    return mg(w, 'type', lines=[{'text': text, 'size': size, 'weight': 'Medium'}], hl=hl, credit=credit,
              credit_at=min(2.6, len(text) / 22 + 0.6), **k)

def excerpt(w, text, source, hl=None, size=96, **k):
    return mg(w, 'excerpt', source=source, text=text, hl=hl if hl is not None else text.strip('"'), size=size,
              hl_at=0.8, hl_dur=max(0.5, len(text) / 30), **k)

def header(w, text, sub=None, **k):
    lines = [{'text': text, 'size': 84}]
    if sub:
        lines.append({'text': sub, 'size': 40, 'weight': 'Medium', 'color': 'grey'})
    return mg(w, 'type', lines=lines, cps=18, mark_at=k.pop('mark_at', None), **k)

def words(w, *lines, credit=None, hl=None, size=64, **k):
    return mg(w, 'type', lines=[{'text': l, 'size': size} for l in lines], credit=credit, hl=hl, **k)

def counter(w, value, head=None, source=None, caption=None, **k):
    return mg(w, 'counter', value=value, head=head, source=source, caption=caption, **k)

# The money loop: Investor -> PCI -> goods -> retailer -> back to the investor (shot list 1.5).
LOOP_NODES = {'i': {'label': 'INVESTOR', 'x': 0.5, 'y': 0.2}, 'p': {'label': 'PCI', 'x': 0.8, 'y': 0.5},
              'g': {'label': 'GOODS', 'x': 0.5, 'y': 0.8}, 'r': {'label': 'RETAILER', 'x': 0.2, 'y': 0.5}}
LOOP_EDGES = [('i', 'p', 'r', 't'), ('p', 'g', 'b', 'r'), ('g', 'r', 'l', 'b'), ('r', 'i', 't', 'l')]

def loop(w, draw=True, tokens=0, hollow_at=None, hollow=False, marks=(), captions=(), zoom=(1.0, 1.03, 0.5, 0.5),
         nodes=None, edges=None, **k):
    n = json.loads(json.dumps(nodes or LOOP_NODES))
    if hollow:
        n['g']['state'] = 'hollow'
    if hollow_at is not None:
        n['g']['hollow_at'] = hollow_at
    if not draw:
        for v in n.values():
            v['at'] = 0
    es = []
    for j, (a, b, sa, sb) in enumerate(edges or LOOP_EDGES):
        e = {'a': a, 'b': b, 'sa': sa, 'sb': sb, 'bend': -0.12, 'at': 0.3 + 0.45 * j if draw else 0, 'd': 0.6 if draw else 0}
        if tokens and not (hollow and 'g' in (a, b)):
            e['tokens'] = tokens
        es.append(e)
    return mg(w, 'flow', nodes=n, edges=es, marks=list(marks), captions=list(captions), zoom=list(zoom), **k)

def insert(sec, spec):
    return dict(insert=sec, src={'mg': spec})

def wall(w, cards, **k):
    return mg(w, 'wall', cards=cards, **k)

PLANS = {}

# ------------------------------------------------------------------------------------------- 2. The central mystery
PLANS[2] = [
    [  # ¶4 the story of PCI; investors lent; shown the paperwork; paid
        ill('A01', 4.6, text=[{'text': 'TWIN CITIES, MINNESOTA', 'rel': 0.4, 'size': 34, 'x': '80', 'y': '90', 'box': True}]),
        words(4.6, 'PETTERS COMPANY, INC.', '(PCI)', credit='Twin Cities, Minnesota · ' + S1, size=80),
        rec('R09', 4.6, zoom=(1.0, 1.1)),
        loop(4.6, captions=[{'text': 'electronics, bought and sold on at a profit: the pitch', 'x': 0.5, 'y': 0.9, 'at': 2.8, 'size': 28}]),
        loop(4.6, draw=False, tokens=3, captions=[{'text': 'SHOWN THE PAPERWORK', 'x': 0.5, 'y': 0.06, 'at': 0.4, 'size': 30},
                                                  {'text': 'PAID', 'x': 0.5, 'y': 0.33, 'at': 2.4, 'size': 40, 'color': 'ac'}]),
    ],
    [  # ¶5 the goods were never bought; "no such purchases were made."
        loop(3.7, draw=False, tokens=3, zoom=(1.0, 1.25, 0.5, 0.95)),
        loop(3.7, draw=False, tokens=3, hollow_at=0.5, marks=[{'x': 0.66, 'y': 0.8, 'at': 1.0}], zoom=(1.25, 1.25, 0.5, 0.95)),
        excerpt(3.7, '"no such purchases were made."', S1, size=70),
    ],
    [  # ¶6 individuals and an investment firm; hundreds of millions in notes; largest financial crime
        mg(4.5, 'flow', nodes={'a': {'label': 'INDIVIDUALS', 'x': 0.3, 'y': 0.5, 'w': 380}, 'b': {'label': 'AN INVESTMENT FIRM', 'x': 0.7, 'y': 0.5, 'w': 460, 'at': 0.8},
                               'p': {'label': 'PCI', 'x': 0.5, 'y': 0.82, 'at': 1.4}},
           edges=[{'a': 'a', 'b': 'p', 'at': 1.6, 'tokens': 2, 'sa': 'b', 'sb': 'l', 'bend': 0.1}, {'a': 'b', 'b': 'p', 'at': 1.8, 'tokens': 2, 'sa': 'b', 'sb': 'r', 'bend': -0.1}],
           captions=[{'text': 'WHO LENT THE MONEY', 'x': 0.5, 'y': 0.18, 'at': 0.2, 'size': 44, 'weight': 'ExtraBold'}]),
        excerpt(4.5, '"hundreds of millions of dollars in promissory notes"', S1, size=60),
        rec('R25', 4.5, text=[{'text': 'HUNDREDS OF MILLIONS  (DOJ)', 'rel': 1.0, 'size': 30, 'x': '80', 'y': '90', 'box': True}]),
        words(4.5, 'THE LARGEST FINANCIAL CRIME', 'IN MINNESOTA HISTORY', credit=S2, mark_at=2.6, size=70),
    ],
    [  # ¶7 two questions; the money
        header(4.0, 'QUESTION 1: THE MONEY', mark_at=2.2),
        loop(4.0, draw=False, hollow=True, tokens=2, captions=[{'text': 'BANKS', 'x': 0.2, 'y': 0.36, 'at': 0.5, 'size': 32, 'weight': 'Bold'},
                                                               {'text': 'INVESTORS', 'x': 0.5, 'y': 0.06, 'at': 1.0, 'size': 32, 'weight': 'Bold'},
                                                               {'text': 'FAMOUS COMPANIES', 'x': 0.8, 'y': 0.36, 'at': 1.5, 'size': 32, 'weight': 'Bold'}]),
        counter(4.0, 'MORE THAN A DECADE', head='HOW DO YOU KEEP A LIE THAT SIZE AFLOAT?', hit=False),
        loop(4.0, draw=False, hollow=True, tokens=4, zoom=(1.12, 0.95, 0.5, 0.5),
             captions=[{'text': 'WHERE DID THE MONEY GO?', 'x': 0.5, 'y': 0.46, 'at': 1.2, 'size': 50, 'weight': 'ExtraBold', 'color': 'ac'}]),
    ],
    [  # ¶8 a person inside; September 2008
        header(4.6, 'QUESTION 2: A PERSON', mark_at=2.2),
        wall(4.6, [{'name': 'INSIDER', 'role': 'there almost from the start; touched the paperwork; knew', 'src': '', 'at': 0.4}], cols=1),
        rec('R02', 4.6, text=[{'text': '8 SEPTEMBER 2008', 'rel': 0.6, 'size': 34, 'x': '80', 'y': '90', 'box': True}]),
        rec('R03', 4.6),
        insert(5.0, {'kind': 'title', 'lines': ['THE $3.7 BILLION EMPIRE', 'BUILT ON FAKE PURCHASE ORDERS'], 'channel': 'CROOKED ARITHMETIC'}),
    ],
]

PETTERS = {'name': 'TOM PETTERS', 'role': 'Founder and owner of PCI; 52, of Wayzata, at sentencing', 'src': '(DOJ, 8 Apr 2010)'}
COLEMAN = {'name': 'DEANNA COLEMAN', 'role': 'Hired 1993 as office manager; later an officer of PCI', 'src': '(DOJ)'}

# ------------------------------------------------------------------------------------------------------ 3. Origins
PLANS[3] = [
    [  # ¶9 Thomas Joseph Petters, 52, Wayzata
        wall(4.7, [dict(PETTERS, at=0.3)], cols=1, zoom=[1.0, 1.06, 0.5, 0.5]),
        rec('R22', 4.7, label='Recreation: not the actual courtroom', text=[{'text': 'AGE 52 AT SENTENCING, 2010  (DOJ)', 'rel': 0.8, 'size': 30, 'x': '80', 'y': '90', 'box': True}]),
        excerpt(4.7, '"Thomas Joseph Petters, age 52, of Wayzata"', S1, size=60, hl='of Wayzata'),
    ],
    [  # ¶10 real businesses; Petters Warehouse Direct; RedTag; prominent businessman
        words(5.7, 'PETTERS WAREHOUSE DIRECT', credit='One of "Petters\'s companies" · ' + S1, size=72),
        words(5.7, 'REDTAG', credit='One of "Petters\'s companies" · ' + S1, size=110),
        mg(5.7, 'flow', nodes={'a': {'label': 'REAL BUSINESSES', 'x': 0.3, 'y': 0.45, 'w': 440}, 'b': {'label': 'REAL PRODUCTS', 'x': 0.7, 'y': 0.45, 'w': 440, 'at': 0.7}},
           edges=[{'a': 'a', 'b': 'b', 'at': 1.1, 'd': 0.6}],
           captions=[{'text': 'WHY THE PAPERWORK LOOKED BELIEVABLE', 'x': 0.5, 'y': 0.68, 'at': 2.0, 'size': 40, 'weight': 'ExtraBold', 'color': 'ac'}]),
        excerpt(5.7, '"Petters was a prominent Minneapolis, Minnesota businessman."', S4, size=56, hl='prominent'),
    ],
    [  # ¶11 1993, office manager, Deanna Coleman
        rec('R05', 3.0, text=[{'text': '1993', 'rel': 0.3, 'size': 40, 'x': '80', 'y': '90', 'box': True}]),
        wall(3.0, [dict(PETTERS, at=0), dict(COLEMAN, at=0.3, name='DEANNA COLEMAN')], cols=2,
             sfx=[{'rel': 1.6, 'kind': 'hit', 'gain': 0.7}]),
    ],
    [  # ¶12 1994 PCI formed, owned all of it, fraud from the start
        counter(3.9, '1994', head='THE NEXT YEAR', source='Petters forms Petters Company, Inc. (PCI)', roll=1.0, hit=False),
        counter(3.9, '100%', head='WHO OWNED PCI', source='Petters owned all of it (DOJ)', roll=1.2, hit=False),
        excerpt(3.9, '"used for fraudulent purposes from its inception"', S2, size=60, sfx=[{'rel': 2.2, 'kind': 'hit', 'gain': 0.8}]),
    ],
    [  # ¶13 the purchase order, explained
        ill('A02', 4.3, text=[{'text': 'THE PURCHASE ORDER', 'rel': 0.5, 'size': 60, 'box': True}]),
        mg(4.3, 'form'),
        words(4.3, 'A BUYER\'S WRITTEN PROMISE TO BUY', size=60, hl='PROMISE'),
        mg(4.3, 'checks', items=[{'text': 'SPECIFIC GOODS', 'at': 0.3}, {'text': 'SPECIFIC QUANTITY', 'at': 1.1}, {'text': 'SPECIFIC PRICE', 'at': 1.9}]),
        mg(4.3, 'flow', nodes={'b': {'label': 'LARGE, RELIABLE BUYER', 'x': 0.3, 'y': 0.5, 'w': 520}, 'l': {'label': 'LENDER', 'x': 0.75, 'y': 0.5, 'at': 0.6}},
           edges=[{'a': 'b', 'b': 'l', 'at': 0.9, 'label': 'purchase order', 'tokens': 0}],
           captions=[{'text': 'CLOSE TO A GUARANTEE', 'x': 0.5, 'y': 0.7, 'at': 1.8, 'size': 44, 'weight': 'ExtraBold', 'color': 'ac'}]),
        rec('R09b', 4.3, text=[{'text': 'CLOSE TO A GUARANTEE', 'rel': 0.8, 'size': 30, 'x': '80', 'y': '90', 'box': True}]),
        mg(4.3, 'versus', a='PROMISE', b='RISK LOOKS SMALL', b_ac=False, size=60, mark_at=99,
           caption='If a well-known chain has promised to buy, lending against it looks safe'),
    ],
    [  # ¶14 the pitch
        mg(4.5, 'flow', nodes={'s': {'label': 'SUPPLIER', 'x': 0.2, 'y': 0.55}, 'p': {'label': 'PCI', 'x': 0.5, 'y': 0.55, 'at': 0.4}, 'r': {'label': 'RETAILER', 'x': 0.8, 'y': 0.55, 'at': 0.8}},
           captions=[{'text': 'THE PITCH, AS THE RECORD DESCRIBES IT', 'x': 0.5, 'y': 0.2, 'at': 1.2, 'size': 40, 'weight': 'ExtraBold'}]),
        mg(4.5, 'flow', nodes={'i': {'label': 'INVESTOR', 'x': 0.5, 'y': 0.2}, 's': {'label': 'SUPPLIER', 'x': 0.2, 'y': 0.6}, 'p': {'label': 'PCI', 'x': 0.5, 'y': 0.6}, 'r': {'label': 'RETAILER', 'x': 0.8, 'y': 0.6}},
           edges=[{'a': 'i', 'b': 'p', 'at': 0.3, 'tokens': 2, 'sa': 'b', 'sb': 't'}, {'a': 'p', 'b': 's', 'at': 1.2, 'label': 'buy merchandise', 'tokens': 2, 'sa': 'l', 'sb': 'r'}]),
        mg(4.5, 'flow', nodes={'i': {'label': 'INVESTOR', 'x': 0.5, 'y': 0.2}, 's': {'label': 'SUPPLIER', 'x': 0.2, 'y': 0.6}, 'p': {'label': 'PCI', 'x': 0.5, 'y': 0.6}, 'r': {'label': 'RETAILER', 'x': 0.8, 'y': 0.6, 'sub': 'Costco · Sam\'s Club (DOJ)'}},
           edges=[{'a': 'i', 'b': 'p', 'at': 0, 'd': 0, 'sa': 'b', 'sb': 't'}, {'a': 'p', 'b': 's', 'at': 0, 'd': 0, 'sa': 'l', 'sb': 'r'}, {'a': 's', 'b': 'r', 'at': 0.4, 'd': 1.2, 'label': 'sold on at a profit', 'tokens': 2, 'sa': 'b', 'sb': 'b', 'bend': 0.25}], size=30),
        mg(4.5, 'flow', nodes={'i': {'label': 'INVESTOR', 'x': 0.5, 'y': 0.2}, 's': {'label': 'SUPPLIER', 'x': 0.2, 'y': 0.6}, 'p': {'label': 'PCI', 'x': 0.5, 'y': 0.6}, 'r': {'label': 'RETAILER', 'x': 0.8, 'y': 0.6}},
           edges=[{'a': 'i', 'b': 'p', 'at': 0, 'd': 0, 'sa': 'b', 'sb': 't'}, {'a': 'r', 'b': 'i', 'at': 0.4, 'd': 1.0, 'label': 'repaid with interest', 'tokens': 3, 'sa': 't', 'sb': 'r', 'bend': -0.15}]),
        rec('R08', 4.5),
        words(4.5, 'PROMISSORY NOTES', '+ HIS PERSONAL GUARANTEE', credit='Petters often signed the notes himself and gave his personal guarantee (DOJ)', size=64),
    ],
    [  # ¶15 a real kind of business; the goods exist (not true)
        header(4.5, 'A REAL KIND OF BUSINESS'),
        mg(4.5, 'checks', header='ON PAPER IT LOOKS SAFE', items=[{'text': 'THE BUYER IS A GIANT', 'at': 0.4}, {'text': 'THE DEAL IS SHORT', 'at': 1.4}]),
        mg(4.5, 'checks', header='ON PAPER IT LOOKS SAFE', items=[{'text': 'THE BUYER IS A GIANT', 'at': 0}, {'text': 'THE DEAL IS SHORT', 'at': 0}, {'text': 'THE GOODS EXIST', 'at': 0.8}]),
        mg(4.5, 'checks', header='ON PAPER IT LOOKS SAFE', items=[{'text': 'THE BUYER IS A GIANT', 'at': 0}, {'text': 'THE DEAL IS SHORT', 'at': 0}, {'text': 'THE GOODS EXIST', 'at': 0, 'strike_at': 1.0}],
           sfx=[{'rel': 1.0, 'kind': 'hit'}]),
    ],
    [  # ¶16 paid with newer investors' money; their own money; stalling; bounced checks
        mg(4.5, 'flow', nodes={'b': {'label': 'INVESTOR B', 'x': 0.25, 'y': 0.5}, 'a': {'label': 'INVESTOR A', 'x': 0.75, 'y': 0.5, 'at': 0.3}, 'p': {'label': 'PCI', 'x': 0.5, 'y': 0.2, 'at': 0.5}},
           edges=[{'a': 'b', 'b': 'p', 'at': 0.8, 'sa': 't', 'sb': 'l', 'tokens': 2}, {'a': 'p', 'b': 'a', 'at': 1.4, 'sa': 'r', 'sb': 't', 'tokens': 2}],
           captions=[{'text': 'NOT PROFITS ON REAL SALES', 'x': 0.5, 'y': 0.72, 'at': 2.2, 'size': 40, 'weight': 'ExtraBold', 'color': 'ac'}]),
        excerpt(4.5, '"paid with money obtained from subsequent investors"', S1, size=58),
        quote(4.5, '"sometimes, even their own money."', S1, hl='their own money'),
        rec('R13', 4.5),
        mg(4.5, 'checks', header='WHEN A PAYMENT WAS DUE', items=[{'text': 'PROMISES OF PAYMENT SOON', 'at': 0.3}, {'text': 'EXCUSES: RETAILERS PAYING SLOWLY', 'at': 1.1}, {'text': 'CHECKS THAT BOUNCED', 'at': 1.9}], size=46),
    ],
    [  # ¶17 lulling payments
        excerpt(4.1, '"lulling payments"', S1, size=110),
        words(4.1, 'MONEY PAID OUT', 'TO KEEP INVESTORS CALM', size=64, hl='CALM'),
        mg(4.1, 'flow', nodes={'pot': {'label': 'ONE POT', 'x': 0.5, 'y': 0.3, 'w': 360, 'state': 'ac'}, 'a': {'label': 'INVESTOR', 'x': 0.2, 'y': 0.72, 'at': 0.4}, 'b': {'label': 'INVESTOR', 'x': 0.5, 'y': 0.72, 'at': 0.5}, 'c': {'label': 'INVESTOR', 'x': 0.8, 'y': 0.72, 'at': 0.6}},
           edges=[{'a': 'pot', 'b': 'a', 'at': 0.7, 'sa': 'b', 'sb': 't', 'tokens': 1}, {'a': 'pot', 'b': 'b', 'at': 0.8, 'sa': 'b', 'sb': 't', 'tokens': 1}, {'a': 'pot', 'b': 'c', 'at': 0.9, 'sa': 'b', 'sb': 't', 'tokens': 1}]),
        mg(4.1, 'checks', items=[{'text': 'RETURNS ON ANYTHING', 'at': 0.2, 'strike_at': 1.0}, {'text': 'STOP PEOPLE ASKING QUESTIONS', 'at': 1.8}]),
    ],
    [  # ¶18 the shape of a Ponzi scheme; one need: paper
        loop(4.7, draw=False, hollow=True, tokens=5, captions=[{'text': 'THE SHAPE OF A PONZI SCHEME', 'x': 0.5, 'y': 0.46, 'at': 0.5, 'size': 40, 'weight': 'ExtraBold'}]),
        words(4.7, 'ONE NEED THAT NEVER GOES AWAY:', 'PAPER', size=70, hl='PAPER'),
        mg(4.7, 'form', stamp='NEW DEAL', stamp_at=2.0),
        rec('R27', 4.7),
    ],
    [  # ¶19 Coleman fabricating; false documents; millions
        wall(4.5, [dict(PETTERS, at=0), dict(COLEMAN, at=0.4)], cols=2, zoom=[1.0, 1.15, 0.85, 0.5]),
        rec('R06', 4.5),
        excerpt(4.5, '"began fabricating PCI purchase orders and transferring funds between investors"', S1, size=52, hl='fabricating PCI purchase orders'),
        words(4.5, 'SHE RECEIVED', 'MILLIONS OF DOLLARS', credit='for creating the false documents, she later admitted · ' + S2, size=72, hl='MILLIONS',
              sfx=[{'rel': 1.4, 'kind': 'hit', 'gain': 0.8}]),
    ],
    [  # ¶20 office manager to officer; closest to the paper
        wall(4.7, [dict(PETTERS, at=0), dict(COLEMAN, at=0, role='Office manager → an officer of PCI', stamp='OFFICER', stamp_at=1.2)], cols=2),
        wall(4.7, [dict(PETTERS, at=0), dict(COLEMAN, at=0, role='Office manager → an officer of PCI')], cols=2, links=[{'a': 0, 'b': 1, 'at': 0.6}]),
        wall(4.7, [dict(PETTERS, at=0), dict(COLEMAN, at=0, role='Office manager → an officer of PCI')], cols=2, links=[{'a': 0, 'b': 1, 'at': 0}],
             zoom=[1.0, 1.25, 0.5, 0.5], label='Closest to the paper, and to Tom Petters'),
        insert(3.0, {'kind': 'type', 'lines': [{'text': 'PAPER WASN\'T ENOUGH.', 'size': 84}], 'mark_at': 1.6}),
    ],
]

WHITE = {'name': 'ROBERT WHITE', 'role': 'A friend; false bank statements from 1999; titled CFO', 'src': '(DOJ)'}
REYNOLDS = {'name': 'LARRY REYNOLDS', 'role': 'Ran Nationwide International Resources (NIR)', 'src': '(DOJ)'}
CATAIN = {'name': 'MICHAEL CATAIN', 'role': 'Created Enchanted Family Buying Co. (EFBC), 2002', 'src': '(DOJ)'}
GROSS = 'Gross money moved, not losses'

def three(**k):   # supplier / PCI / retailer with the investor above
    n = {'i': {'label': 'INVESTOR', 'x': 0.5, 'y': 0.18}, 's': {'label': 'SUPPLIER', 'x': 0.2, 'y': 0.62}, 'p': {'label': 'PCI', 'x': 0.5, 'y': 0.62},
         'r': {'label': 'RETAILER', 'x': 0.8, 'y': 0.62}}
    for key, v in k.pop('nodes', {}).items():
        n[key] = dict(n.get(key, {}), **v)
    return n

# ---------------------------------------------------------------------------------------------------- 4. Expansion
PLANS[4] = [
    [  # ¶21 the weak point: a careful investor wants a bank statement
        counter(4.4, '1999', head='THE WEAK POINT', roll=1.0, hit=False),
        mg(4.4, 'flow', nodes={'po': {'label': 'PURCHASE ORDER', 'x': 0.32, 'y': 0.5, 'w': 420}, 'bs': {'label': 'BANK STATEMENT?', 'x': 0.68, 'y': 0.5, 'w': 420, 'state': 'hollow', 'at': 0.8}},
           edges=[{'a': 'po', 'b': 'bs', 'at': 1.2, 'dashed': True, 'color': 'grey'}],
           captions=[{'text': 'A CAREFUL INVESTOR WANTS TO SEE THE MONEY MOVING', 'x': 0.5, 'y': 0.72, 'at': 1.8, 'size': 32}]),
        rec('R09b', 4.4, zoom=(1.08, 1.0)),
    ],
    [  # ¶22 1999 bank statements to "verify"; Robert White; CFO; fabricating
        excerpt(4.7, '"verify"', S1, size=140),
        wall(4.7, [dict(PETTERS, at=0), dict(COLEMAN, at=0), dict(WHITE, at=0.5)], cols=3),
        rec('R07', 4.7),
        wall(4.7, [dict(PETTERS, at=0), dict(COLEMAN, at=0), dict(WHITE, at=0, stamp='CFO', stamp_at=0.9)], cols=3, zoom=[1.0, 1.2, 0.85, 0.5]),
        words(4.7, 'FABRICATING', 'RETAILER PURCHASE ORDERS', '+ PCI\'S FINANCIAL RECORDS', credit=S1, size=58, hl='FABRICATING'),
    ],
    [  # ¶23 White pleaded guilty and testified
        wall(4.2, [dict(WHITE, at=0)], cols=1, zoom=[1.0, 1.08, 0.5, 0.5], label='Remember the name'),
        wall(4.2, [dict(WHITE, at=0, role='Pleaded guilty; testified against Petters at trial', src='(DOJ; U.S. v. White, D. Minn. 2011)', stamp='TESTIFIED', stamp_at=0.8)], cols=1),
    ],
    [  # ¶24 weak point 2: the money
        header(4.3, 'WEAK POINT 2: THE MONEY', mark_at=2.0),
        rec('R15', 4.3, text=[{'text': 'MONEY HAD TO GO TO SUPPLIERS', 'rel': 0.6, 'size': 30, 'x': '80', 'y': '90', 'box': True}]),
        mg(4.3, 'flow', nodes=three(), edges=[{'a': 'p', 'b': 's', 'at': 0.2, 'sa': 'l', 'sb': 'r', 'tokens': 2}, {'a': 'r', 'b': 'p', 'at': 1.0, 'sa': 'l', 'sb': 'r', 'dashed': True, 'color': 'grey', 'label': 'money must come back?'}]),
        mg(4.3, 'flow', nodes=three(nodes={'s': {'label': 'VENDOR?', 'state': 'hollow'}, 's2': {'label': 'VENDOR?', 'x': 0.2, 'y': 0.86, 'state': 'hollow', 'at': 0.6}}),
           captions=[{'text': '2001: TWO BUSINESS ASSOCIATES', 'x': 0.5, 'y': 0.86, 'at': 1.2, 'size': 36, 'weight': 'ExtraBold', 'color': 'ac'}]),
    ],
    [  # ¶25 Larry Reynolds, NIR, commission
        wall(4.1, [dict(PETTERS, at=0), dict(REYNOLDS, at=0.4)], cols=2),
        excerpt(4.1, '"previously had conducted deals involving shoes and clothing with retailers"', S1, size=52, hl='shoes and clothing'),
        rec('R10', 4.1),
        mg(4.1, 'flow', nodes={'p': {'label': 'PETTERS / PCI', 'x': 0.18, 'y': 0.5, 'w': 360}, 'n': {'label': 'NIR', 'x': 0.5, 'y': 0.5}, 'q': {'label': 'PCI', 'x': 0.82, 'y': 0.5}},
           edges=[{'a': 'p', 'b': 'n', 'at': 0.2, 'tokens': 2}, {'a': 'n', 'b': 'q', 'at': 0.8, 'tokens': 2}],
           captions=[{'text': 'a "commission" (DOJ)', 'x': 0.5, 'y': 0.66, 'at': 1.6, 'size': 34, 'color': 'ac'}]),
    ],
    [  # ¶26 Michael Catain, EFBC, car wash
        wall(4.3, [dict(REYNOLDS, at=0), dict(CATAIN, at=0.4)], cols=2),
        rec('R11', 4.3, zoom=(1.0, 1.08), focus=(0.7, 0.5)),
        mg(4.3, 'flow', nodes={'p': {'label': 'PETTERS', 'x': 0.18, 'y': 0.5}, 'e': {'label': 'EFBC ACCOUNT', 'x': 0.5, 'y': 0.5, 'w': 360}, 'q': {'label': 'PETTERS / PCI', 'x': 0.82, 'y': 0.5, 'w': 360}},
           edges=[{'a': 'p', 'b': 'e', 'at': 0.2, 'tokens': 2}, {'a': 'e', 'b': 'q', 'at': 0.8, 'tokens': 2, 'label': 'less a commission'}]),
        excerpt(4.3, '"EFBC did no real business."', S1, size=70),
        rec('R12', 4.3, label='Recreation: not the actual building'),
        mg(4.3, 'flow', nodes={'c': {'label': "CATAIN'S CAR WASH", 'x': 0.27, 'y': 0.5, 'w': 460, 'sub': 'EFBC headquarters (DOJ)'}, 'h': {'label': "PETTERS'S HQ", 'x': 0.75, 'y': 0.5, 'w': 400, 'at': 0.5}},
           edges=[{'a': 'c', 'b': 'h', 'at': 0.9, 'dashed': True, 'color': 'fg', 'label': 'a few miles (DOJ)'}], label='Diagram, not to scale', size=30),
    ],
    [  # ¶27 every part; cleared; PCI to PCI
        mg(4.9, 'checks', header='WHAT AN INVESTOR SAW', items=[{'text': 'PURCHASE ORDER (FAMOUS RETAILER)', 'at': 0.2}, {'text': 'SUPPLIER INVOICE', 'at': 0.8}, {'text': 'BANK STATEMENT', 'at': 1.4}, {'text': 'MONEY OUT · MONEY BACK', 'at': 2.2}], size=44),
        mg(4.9, 'flow', nodes=three(nodes={'s': {'label': 'NIR / EFBC', 'sub': '"suppliers"'}}), size=32,
           edges=[{'a': 'i', 'b': 'p', 'at': 0, 'd': 0.4, 'sa': 'b', 'sb': 't', 'tokens': 2}, {'a': 'p', 'b': 's', 'at': 0.4, 'sa': 'l', 'sb': 'r', 'tokens': 2}, {'a': 's', 'b': 'p', 'at': 1.0, 'sa': 'b', 'sb': 'b', 'bend': 0.3, 'tokens': 2}],
           captions=[{'text': 'CLEARED', 'x': 0.8, 'y': 0.25, 'at': 2.2, 'size': 64, 'weight': 'ExtraBold', 'color': 'ac'}]),
        mg(4.9, 'flow', nodes=three(nodes={'s': {'label': 'NIR / EFBC', 'sub': '"suppliers"'}, 'r': {'label': 'RETAILER', 'state': 'hollow'}}), size=32,
           edges=[{'a': 'i', 'b': 'p', 'at': 0, 'd': 0, 'sa': 'b', 'sb': 't', 'tokens': 3}, {'a': 'p', 'b': 's', 'at': 0, 'd': 0, 'sa': 'l', 'sb': 'r', 'tokens': 3}, {'a': 's', 'b': 'p', 'at': 0, 'd': 0, 'sa': 'b', 'sb': 'b', 'bend': 0.3, 'tokens': 3}],
           marks=[{'x': 0.8, 'y': 0.85, 'at': 1.6}], zoom=[1.15, 0.92, 0.5, 0.55],
           captions=[{'text': 'PCI → PCI', 'x': 0.5, 'y': 0.85, 'at': 1.2, 'size': 56, 'weight': 'ExtraBold', 'color': 'ac'}]),
    ],
    [  # ¶28 two details: PCI's "own" wires; statements showing billions owed by retailers
        header(4.6, 'TWO DETAILS'),
        mg(4.6, 'flow', nodes={'p': {'label': 'PCI', 'x': 0.25, 'y': 0.5}, 's': {'label': 'SUPPLIER', 'x': 0.75, 'y': 0.5}},
           edges=[{'a': 'p', 'b': 's', 'at': 0.3, 'tokens': 2, 'label': "PCI's own money?"}], label='Illustration',
           captions=[{'text': 'FALSE RECORDS OF PCI WIRING ITS OWN FUNDS (DOJ)', 'x': 0.5, 'y': 0.72, 'at': 1.4, 'size': 32}]),
        excerpt(4.6, '"false records indicating that PCI had wired its own funds to vendors"', S1, size=52, hl='false records'),
        rec('R26', 4.6),
        words(4.6, 'OWED BY RETAILERS:', 'BILLIONS', credit='What PCI\'s financial statements showed (DOJ)', size=80, hl='BILLIONS'),
        words(4.6, 'THOSE STATEMENTS', 'WERE FALSE', credit=S1, size=84, mark_at=1.8),
        words(4.6, 'NO SALES.', 'NOTHING OWED.', size=84, sfx=[{'rel': 0.3, 'kind': 'hit'}]),
    ],
    [  # ¶29 bank records: ~$12bn NIR, roughly the same EFBC, no income from sales; "only flowed one way."
        rec('R10b', 4.9, text=[{'text': 'BANK RECORDS  ·  JAN 2003 – SEPT 2008', 'rel': 0.6, 'size': 30, 'x': '80', 'y': '90', 'box': True}]),
        counter(4.9, '$12 BILLION', head='NIR ACCOUNT → PCI, ABOUT', source='Jan 2003 – Sept 2008 · ' + S1, caption=GROSS, color='ac'),
        counter(4.9, 'ROUGHLY THE SAME', head='EFBC ACCOUNT → PCI', source=S1, caption=GROSS, size=110, hit=False),
        mg(4.9, 'checks', header='"SUPPLIERS" SELLING HUNDREDS OF MILLIONS OF MERCHANDISE', items=[{'text': 'INCOME FROM THOSE SALES', 'at': 0.5, 'strike_at': 1.4}], size=56),
        quote(4.9, '"only flowed one way."', S1, hl='one way', size=72),
    ],
    [  # ¶30 April 2001 account, Petters and Coleman; ~$35bn wired in; not one deposit from a retailer
        counter(4.8, 'APRIL 2001', head='A NEW BANK ACCOUNT', size=130, hit=False),
        wall(4.8, [dict(PETTERS, at=0.2, role='Authorized on the account'), dict(COLEMAN, at=0.6, role='Authorized on the account')], cols=2, label='The only two people authorized to use it (DOJ)'),
        rec('R15', 4.8),
        counter(4.8, '$35 BILLION', head='WIRED IN, 2003 – SEPT 2008, ABOUT', source='From investors and the two so-called suppliers · ' + S1, caption=GROSS, color='ac'),
        mg(4.8, 'flow', nodes={'i': {'label': 'INVESTORS', 'x': 0.18, 'y': 0.3}, 'n': {'label': 'NIR', 'x': 0.18, 'y': 0.55}, 'e': {'label': 'EFBC', 'x': 0.18, 'y': 0.8},
                               'a': {'label': 'THE ACCOUNT', 'x': 0.6, 'y': 0.55, 'w': 360}, 'r': {'label': 'RETAILERS', 'x': 0.88, 'y': 0.25, 'state': 'grey', 'at': 1.2}},
           edges=[{'a': 'i', 'b': 'a', 'at': 0.1, 'tokens': 2}, {'a': 'n', 'b': 'a', 'at': 0.3, 'tokens': 2}, {'a': 'e', 'b': 'a', 'at': 0.5, 'tokens': 2}],
           captions=[{'text': 'DEPOSITS FROM A RETAILER: NONE', 'x': 0.6, 'y': 0.85, 'at': 2.0, 'size': 36, 'weight': 'ExtraBold', 'color': 'ac'}]),
    ],
    [  # ¶31 the heart of it: $35bn in, $0 from retailers
        mg(4.8, 'flow', nodes={'a': {'label': 'THE ACCOUNT', 'x': 0.5, 'y': 0.5, 'w': 360, 'state': 'grey'}, 'r': {'label': 'RETAILERS', 'x': 0.5, 'y': 0.2, 'state': 'solid'}},
           edges=[{'a': 'r', 'b': 'a', 'at': 0.4, 'dashed': True, 'color': 'grey', 'label': '$0'}], zoom=[1.0, 1.15, 0.5, 0.3]),
        mg(4.8, 'versus', a='$35 BILLION IN', b='$0 FROM RETAILERS', size=58, caption='The customers never paid a cent into the account (DOJ)'),
        ill('A03', 4.8),
    ],
    [  # ¶32 where did it go
        mg(5.0, 'flow', nodes={'a': {'label': 'THE ACCOUNT', 'x': 0.18, 'y': 0.5, 'w': 330}, 'b1': {'label': 'BACK TO INVESTORS', 'x': 0.68, 'y': 0.18, 'w': 560, 'at': 0.6}},
           edges=[{'a': 'a', 'b': 'b1', 'at': 0.8, 'tokens': 2}], size=30),
        mg(5.0, 'flow', nodes={'a': {'label': 'THE ACCOUNT', 'x': 0.18, 'y': 0.5, 'w': 330}, 'b1': {'label': 'BACK TO INVESTORS', 'x': 0.68, 'y': 0.18, 'w': 560},
                               'b2': {'label': 'BONUSES', 'x': 0.68, 'y': 0.38, 'w': 560, 'sub': 'most did not even work for PCI (DOJ)', 'at': 0.5}},
           edges=[{'a': 'a', 'b': 'b1', 'at': 0, 'd': 0}, {'a': 'a', 'b': 'b2', 'at': 0.7, 'tokens': 2}], size=30),
        mg(5.0, 'flow', nodes={'a': {'label': 'THE ACCOUNT', 'x': 0.18, 'y': 0.5, 'w': 330}, 'b1': {'label': 'BACK TO INVESTORS', 'x': 0.68, 'y': 0.18, 'w': 560},
                               'b2': {'label': 'BONUSES', 'x': 0.68, 'y': 0.38, 'w': 560}, 'b3': {'label': 'HIS OTHER COMPANIES', 'x': 0.68, 'y': 0.58, 'w': 560, 'sub': 'hundreds of millions (DOJ)', 'at': 0.3},
                               'b4': {'label': 'REAL ESTATE', 'x': 0.68, 'y': 0.78, 'w': 560, 'sub': 'for family members (DOJ)', 'at': 1.4}},
           edges=[{'a': 'a', 'b': 'b1', 'at': 0, 'd': 0}, {'a': 'a', 'b': 'b2', 'at': 0, 'd': 0}, {'a': 'a', 'b': 'b3', 'at': 0.5, 'tokens': 2}, {'a': 'a', 'b': 'b4', 'at': 1.6, 'tokens': 2}], size=30),
        rec('R15', 5.0, text=[{'text': 'MILLIONS → COLEMAN AND WHITE  (DOJ)', 'rel': 0.6, 'size': 30, 'x': '80', 'y': '90', 'box': True}]),
        counter(5.0, 'TENS OF MILLIONS', head='TO PETTERS HIMSELF', source=S1, size=110, color='ac', hit=False),
    ],
    [  # ¶33 he bought famous companies
        words(3.4, 'HE BOUGHT', 'FAMOUS COMPANIES', size=90, hl='FAMOUS', sfx=[{'rel': 1.4, 'kind': 'hit'}]),
        words(3.4, 'HARDER TO SEE', size=90, mark_at=1.0),
    ],
    [  # ¶34 Fingerhut, Polaroid, Sun Country -> Petters Group Worldwide
        words(3.9, 'FINGERHUT', credit='the catalog retailer', size=120),
        words(3.9, 'POLAROID', credit='the camera brand', size=120),
        words(3.9, 'SUN COUNTRY AIRLINES', size=96),
        words(3.9, 'PETTERS GROUP WORLDWIDE', credit='bought with proceeds of the PCI fraud, according to the Justice Department', size=76, hl='WORLDWIDE'),
    ],
    [  # ¶35 the appearance he needed
        mg(4.9, 'flow', nodes={'t': {'label': 'TOM PETTERS', 'x': 0.5, 'y': 0.2, 'w': 380}, 'g': {'label': 'PETTERS GROUP WORLDWIDE', 'x': 0.27, 'y': 0.62, 'w': 600, 'at': 0.4, 'sub': 'household names'},
                               'p': {'label': 'PCI', 'x': 0.78, 'y': 0.62, 'at': 0.8, 'state': 'grey'}},
           edges=[{'a': 't', 'b': 'g', 'at': 0.5, 'sa': 'b', 'sb': 't', 'color': 'fg'}, {'a': 't', 'b': 'p', 'at': 0.9, 'sa': 'b', 'sb': 't', 'color': 'grey'}], size=30),
        mg(4.9, 'versus', a='PUBLIC IMAGE', b='THE LEDGER', size=64, caption='To a lender deciding whether to put money into PCI, that was reassurance'),
        rec('R26b', 4.9),
        quote(4.9, '"the appearance he needed to keep the scam going."', S1, hl='to keep the scam going', size=54),
    ],
    [  # ¶36 the companies drained it; more investors every year
        mg(5.2, 'flow', nodes={'p': {'label': 'PCI', 'x': 0.3, 'y': 0.5}, 'g': {'label': 'PETTERS GROUP WORLDWIDE', 'x': 0.7, 'y': 0.5, 'w': 600}},
           edges=[{'a': 'p', 'b': 'g', 'at': 0.3, 'tokens': 3, 'label': 'losses written off every year (DOJ)'}], size=30),
        mg(5.2, 'versus', a='LOOKED SOLID', b='DRAINING IT', size=70),
        rec('R09', 5.2, text=[{'text': 'MORE INVESTORS NEEDED EVERY YEAR', 'rel': 0.8, 'size': 30, 'x': '80', 'y': '90', 'box': True}], zoom=(1.1, 1.0)),
        insert(3.0, {'kind': 'type', 'lines': [{'text': 'THEN THE NEW MONEY SLOWED.', 'size': 76}], 'mark_at': 1.8}),
    ],
]

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'sections'), exist_ok=True)
    for n, paras in PLANS.items():
        json.dump({'_about': f'Written by plans.py; section {n} of the shot list.', 'section': n,
                   'narration': f'narration/section{n}.wav', 'paras': paras},
                  open(os.path.join(HERE, f'sections/s{n}.json'), 'w'), indent=1)
        print(f's{n}: {sum(len(p) for p in paras)} shots')
