# Crooked Arithmetic, episode 1: shot list and edit plan

"The $3.7 Billion Empire Built on Fake Purchase Orders". Visual direction for `ep01-petters-script.md`.

Written 18 Nov 2026 from the script **as it stood after the fact pass** (`ep01-factpass.md`: all ten [UNVERIFIED]
items settled, cut or replaced by their fallback lines), plus `market.md`, the `network` section of `briefs.json`,
`plan/production-tools.md` and `design/ch-12.json`. The script now has no [UNVERIFIED] lines, so there are no
alternative shots: every shot below follows the current text. Where the fact pass cut a line (the 10,000 documents,
Wal-Mart and the affidavit, Petters's testimony about going to the government, "known as someone who moved
merchandise", "He is serving his sentence", SEC v. Petters, "most admired", "people who did not exist"), no shot shows
it either. If the script changes again, re-time from the paragraph word counts (150 words a minute, 2.5 words a
second).

**Change from the script's [VISUAL] notes, at the owner's request (18 Nov 2026):** recreated scenes with characters
run through the whole episode, not only empty rooms. The script's [RECON] notes say "no people shown"; this plan
replaces that with the character rules in section 1.9. The script's [GOV], [ARCH], [GFX] and [MAP] notes are kept.

**Contents**
1. Visual system
2. Shot list (304 shots and the end screen)
3. Retention beats
4. Higgsfield prompt list (atmosphere and recreations)
5. Thumbnails
6. Counts and checks

---

## 1. Visual system

The idea in one line: **the books don't balance.** Every frame is a page from a ledger, the yellow highlighter is
the narrator's finger, and the channel's mark, an equals sign whose lower bar is knocked crooked, appears whenever
something on paper doesn't equal what was real.

### 1.1 Palette and grade

| Role | Colour | Use |
|---|---|---|
| Ground | near-black `#1C1D20` | Every background; graphics never sit on pure black. Shadows in all footage are lifted to it. |
| Paper | paper white `#F4F2EA` | Text, documents, the ledger lines (at 4 to 6% opacity), highlights in footage. Never pure white. |
| Accent | ledger yellow `#EDE04A` | Only three things: the highlighter, money in motion, and the crooked bar. One yellow idea per frame. |
| Neutral | grey (paper white at 35%) | Things that are empty, false or finished: the hollow "goods" node, the "retailers" input, Coleman's card after she is charged. |

There is no red anywhere, including the "FAKE" stamp the script's thumbnail note proposes (section 5 uses yellow).

**Colour grade (DaVinci Resolve, one node tree saved as a PowerGrade):**
- Public-domain documents: rendered from the PDF at 4K, paper tinted to `#F4F2EA`, text kept black, a 3% paper grain,
  a soft vignette. Never retyped, never altered; the only marks on a real document are highlighter and push-ins.
- Licensed archival: desaturate 60%, warm the highlights toward paper white, crush blacks to `#1C1D20`, add 35mm
  grain to match. No reframing that changes meaning; licensor credit in the lower right.
- Recreations and AI atmosphere: generated in the palette (prompts in section 4), then the same grade: teal and
  orange removed, saturation below 30% except one ledger-yellow practical light per shot (a lamp, a lit window, a
  recorder's light).
- Overall: contrast high but soft roll-off, no crushed faces (there are no faces to crush), Rec.709, 24 fps.

### 1.2 Typography

JetBrains Mono everywhere (`design/ch-12.json`): the typeface of a ledger and a terminal, so every number lines up.

| Element | Weight / size at 1080p | Notes |
|---|---|---|
| Section and question headers ("QUESTION 1: THE MONEY") | 800, 88 px, tracking -0.02 em, caps | Types on at 18 characters a second with a key sound per character. |
| Big numbers ($3.7 BILLION, 50 YEARS, 16 DAYS) | 800, 140 to 200 px, tabular figures | Always roll like an odometer; never fade in. |
| Name cards | 800, 52 px name; 400, 30 px role and source | Source tag in brackets, e.g. "(DOJ)", "(court record)". |
| Quotes | 500, 44 px, sentence case, inside straight quotes | Credit line under every quote: who, which record, date. |
| Credits, lower thirds, "Recreation" | 500, 26 to 28 px | Bottom-left, inside the 5% title-safe area. |
| Captions that protect accuracy ("Gross flow, not losses") | 500, 30 px, paper white at 80% | Locked on screen as long as the figure is. |

### 1.3 The crooked equals sign as a motion device

The mark is two bars: a straight paper-white bar on top, a ledger-yellow bar below, tilted about 9°. Five uses, and
no others, so it keeps its meaning:
1. **Section bumper and transition.** The yellow bar slides across the frame at 9° as a wipe (8 frames), with a paper
   snap. Used only between sections and at open loops.
2. **"Doesn't add up."** When something on paper and the truth separate (the "goods" node goes hollow; the third tick
   "Goods exist" erases; "$35 billion in, $0 from retailers"; "LOOKS FINE ≠ IS FINE"), the mark appears between the
   two things and its lower bar tilts with a low hit.
3. **"Balances, for once."** Twice in the episode the bar goes level: when the purchase order is explained as "close to
   a guarantee" (Origins) and when every forged document matches every other (Consequences); the second time it
   tilts back. Save it for those two.
4. **Title card and end card.** The mark builds bar by bar.
5. **Corner bug.** A 40 px mark in the top-right at 30% opacity during the body of the film; it tilts one extra degree
   at each section start, so viewers can feel the story moving.

### 1.4 How documents move

- **Entry:** a real page slides up into frame and settles with a 2° rotation and a soft shadow, as if laid on a desk
  (paper-slide sound).
- **Reading:** a slow push-in (3 to 5% over the shot) toward the quoted line; the highlighter stroke runs left to
  right at reading speed, synced to the narrator's words. The quoted words themselves take full yellow; the rest of
  the highlighted sentence 40%.
- **Redaction bars as a reveal, never as concealment:** near-black bars lie over the rest of the page and slide off
  sideways to reveal only the line being read. They are never left on, and never placed on a real document as if the
  government redacted it.
- **Stamps** ("PAID", "RETURNED", "BOUNCED", "EXTENSION", "PLEADED GUILTY") land only on the channel's own illustrated
  forms or name cards, never on a real record. Stamped words are the record's own words.
- **Quote isolation:** after a key line is highlighted, the quote can be lifted off the page onto near-black, typed in
  mono with its credit (the "could of" line, "smell test", "the light of day").
- **"[sic], as published"** appears in small type wherever the record's own spelling is quoted ("could of",
  "conscious over loyalty and greed").

### 1.5 How money moves

- **Flow diagrams:** companies and accounts are ledger cells (paper-white outline boxes); money is a yellow ink line
  that draws itself in the direction of travel, carrying small square tokens. Fakes are grey and hollow.
  The core diagram, "the loop" (Investor → PCI → goods → retailer → Investor), is built once in the Central Mystery and
  rebuilt at each stage: hollow goods node; honest loop (Investor B pays Investor A); two vendor boxes; the full loop
  that turns out to be PCI to PCI; the outflow tree; the reversed arrows of the trustee's suits.
- **Counters:** mono odometers with a mechanical ratchet sound, easing to a stop. Every counter carries its source,
  and the two gross-flow figures ($12 billion, $35 billion) carry "Gross flow, not losses" for as long as they are on
  screen. The $3.7 billion figure gets its own look (paper white, centred) so it is never confused with the flows.
- **No invented totals.** Where the record gives words, not numbers ("hundreds of millions", "tens of millions"), the
  branch carries the words.

### 1.6 Maps

Built in QGIS from OpenStreetMap data and animated in Resolve Fusion, never drawn by AI. Land near-black, water a
shade lighter, roads paper white at 15%, place names in mono, pins as yellow squares that settle with a click.
Credit "© OpenStreetMap contributors" on screen. Only two maps: the Twin Cities with PCI's suburb, and Wayzata on Lake
Minnetonka. The car wash and HQ distance is shown as a diagram, not a map, because no address is in the record.

### 1.7 The evidence board ("the ledger wall")

Instead of cork and red string: a large ledger sheet on near-black. Name cards are pinned with strips of yellow tape;
connections are ruled lines drawn with a ruler click. Cards carry name, role and source, never a face (except the one
licensed news photo of Petters, which stays a separate shot). The wall grows across the film: Petters and the blank
"insider" card (Central Mystery), Coleman (Origins), White, Reynolds, Catain (Expansion), Bell (Turning point), the
five "Pleaded guilty" stamps (Exposure), and the full wall in one frame near the end. Each section-end recap is a 1-s
pull-back to the wall so names stick.

### 1.8 Transitions

- Inside a section: straight cuts on the beat of the narration; match cuts between the same object (a purchase order
  icon becomes a real line in the DOJ release).
- Between sections: the crooked-bar wipe plus a 3-s open-loop insert (section 3.2).
- Into a recreation: a 4-frame paper-grain dissolve, so recreations feel like a different layer from records.
- Never: glitch effects, whip pans, light leaks, zoom blur. The style is calm and exact; the speed comes from cutting.

### 1.9 Recreations with characters (owner's rules, 18 Nov 2026)

1. **Only documented moments.** A recreation shows something the script's sources record: the insider going to the
   authorities with her lawyer (8 Sept 2008), the recorded conversations, the recording device, the fabricating of
   purchase orders and bank statements, the signing of promissory notes, the wires through the NIR and EFBC accounts,
   the account opened at a bank, investors being shown paperwork, a bounced payment, the round trips, the search of
   24 Sept 2008, the arrest and detention of 3 Oct 2008, Coleman's plea, the trial (witnesses, Petters testifying), the
   verdict, both sentencings, the trustee's suits, and the 1973 tip in the episode 2 teaser. No invented events.
2. **No dialogue.** No lip-sync, no voices, no invented lines. Mouths are never visible. What people said appears only
   as narration or as on-screen quotes from the record.
3. **No readable faces for real people.** Petters, Coleman, White, Reynolds, Catain, Bell, the judge, agents and lawyers
   are shown only as silhouettes, figures from behind, shadows on walls, hands on documents, out-of-focus figures, or
   wide shots where faces can't be read. Generic background people (bank customers, lawyers in a gallery) may be seen
   normally but are kept soft. Never an AI image made to look like a real photo of a real person.
4. **No real documents, no logos.** Papers in recreations are blank or blurred beyond reading. No agency lettering,
   badges, seals, weapons, handcuffs or brand logos. Agents wear plain dark jackets.
5. **Settings are generic and labelled.** Where the record doesn't say where something happened, the label says so.
6. **Labels.** Every recreation carries a lower third for its full duration, bottom-left, mono 500, 28 px, paper white
   on a 60% near-black bar:
   - `Recreation`: a documented moment, setting generic;
   - `Recreation: setting not known`: the recorded conversations (the record doesn't say where they took place);
   - `Recreation: not the actual building` / `not the actual courtroom`: when a real place is involved.
   AI atmosphere without people carries `Illustration`. Explanatory graphics with made-up data carry `Illustration`
   (and "not to scale" where relevant).
7. **Disclosure.** Upload with **AI use: Yes** (realistic generated scenes). The description note already says scenes
   marked "Recreation" are illustrations; keep it.
8. **Rhythm.** A recreation or character shot at least every 30 to 45 seconds, alternating with documents, graphics
   and maps. In this plan the longest gap between recreation shots is under 45 seconds (section 6).

### 1.10 Sound design

All music and effects licensed (Artlist Pro or YouTube Audio Library, per `production-tools.md` section 3); nothing
from Higgsfield's game-only sound models; no audio from the real recordings, no waveform, no voice acting.
- **Bed:** low drones in D, mixed at least 18 dB under the voice; they rise half a tone at reveals and cut to silence
  for the biggest ones (the "goods" node going hollow, "retailers: $0", "16 days").
- **Paper:** slide, snap, riffle, drop, tape. A paper snap marks every section change.
- **Ink and office:** highlighter squeak (soft, under the voice), pen scratch, ruler click, rubber stamp, typewriter
  keys for typed text, adding-machine ratchet for counters, a single soft beep for the recording dot.
- **Room tone for recreations:** HVAC, clock tick, rain, courtroom hush, footsteps, door handles. No crowd walla with
  words in it.
- **Sub hit:** one low impact, used about once a minute at most, always on a fact (never on a name).
- **Music stings:** a 4-s licensed sting on the title card and on the episode 2 hand-off; nothing else with melody
  over narration.

---

## 2. Shot list

Timings: narration at 150 words a minute from the current script; each paragraph's shots split its narration time
evenly (3.0 to 6.0 s each). Inserted beats without narration (open loops, title card, end screen) are marked INSERT.
Running time: **22:36** to the end screen, **22:56** with its 20 seconds.

Sources: **PD** public-domain US government or court record · **ARCH** licensed archival (log every item in the
licence record) · **MG** motion graphic made for the channel · **MAP** map (OpenStreetMap, QGIS) · **AI-ILL** AI
atmosphere, no people, labelled "Illustration" · **[RECREATION]** AI recreation with characters, labelled
"Recreation" (rules in 1.9). Prompt IDs (A.., R..) refer to section 4. **RE-HOOK** marks the re-hook beats.


### Cold open (starts 00:00.0)

| # | Time | Sec | Source | On screen | Motion | On-screen text | Sound |
|---|---|---|---|---|---|---|---|
| | | | | **¶1** "In September 2008, a businessman in Minnesota was talking…" (28 words, 11.2 s, 3 shots) | | | |
| 1 | 00:00.0 | 3.7 | PD | DOJ release (8 Apr 2010), extreme macro on one word | Highlighter sweeps "fake" left to right in 0.6 s; crooked-equals bar snaps diagonally across frame on the last frame | "fake" (highlighted) · tiny credit "U.S. Attorney, D. Minn., 8 Apr 2010" | Highlighter squeak; low drone fades in under first word |
| 2 | 00:03.7 | 3.7 | **[RECREATION]** | R01: two figures in a dim office seen as shadows on a frosted-glass wall; nearer figure's shoulder in soft focus, foreground | Slow push-in 4%; shadows move only slightly (no mouths, no gestures that read as speech) | MINNESOTA · SEPTEMBER 2008 (typed) · lower third "Recreation: setting not known" | Typewriter key per character; air-con room tone |
| 3 | 00:07.5 | 3.7 | MG | Black. A single ledger-yellow recording dot pulses; the word RECORDED types beside it | Dot pulses twice; on "recorded" the drone cuts to silence | RECORDED | Drone cut to dead silence for 0.5 s (pattern interrupt) |
| | | | | **¶2** "According to the Department of Justice, within the first…" (64 words, 25.6 s, 6 shots) | | | |
| 4 | 00:11.2 | 4.3 | PD | DOJ release full page, lit as paper on near-black | Page slides up into frame, settles with 2° rotation | Lower third "U.S. Attorney, District of Minnesota · 8 April 2010" | Paper slide; drone back in, lower |
| 5 | 00:15.5 | 4.3 | PD | Push to the recordings paragraph | Highlighter strokes "Within the first few hours of Coleman's recorded conversations" line by line | (the line itself) | Highlighter squeak, soft |
| 6 | 00:19.7 | 4.3 | PD | Same paragraph | Highlight "purchase orders were 'fake'"; quoted word in full ledger yellow, rest at 40% | "fake" | Sub hit on "fake" |
| 7 | 00:24.0 | 4.3 | **[RECREATION]** | R04: hands only, slipping a small generic digital recorder into a jacket inside pocket; dark office | Close, static, 1 s of motion then still | "Recreation" | Fabric rustle (licensed) |
| 8 | 00:28.3 | 4.3 | PD | Same paragraph | Highlight "'divine intervention' was the only explanation" | "divine intervention" | Highlighter; drone swells |
| 9 | 00:32.5 | 4.3 | MG | Quote alone on near-black, JetBrains Mono | "could of got away with this for so long." types out; "so long" underlined in yellow | "could of got away with this for so long." · small "[as published, DOJ]" | Typewriter; bell-less carriage stop |
| | | | | **¶3** "How long was "so long"? About fourteen years. And…" (28 words, 11.2 s, 3 shots) | | | |
| 10 | 00:36.8 | 3.7 | MG | Ledger column header "YEARS" | Counter ratchets 1994 → 2008, lands on "≈ 14 YEARS" | ≈ 14 YEARS | Adding-machine ratchet ticks |
| 11 | 00:40.5 | 3.7 | MG | Number builds on black | $0.0 → $3.7 BILLION, digits roll like an odometer | $3.7 BILLION · "Size of the Ponzi scheme, per U.S. Attorney, D. Minn., 8 Apr 2010" | Sub hit on landing |
| 12 | 00:44.3 | 3.7 | MG | Blank fictional purchase-order form slides behind the number | Crooked-equals wipe: yellow bar sweeps across at 9°, number and form separate | BUILT ON PAPER · "Illustration" | Paper whoosh, drone tail |
| 13 | 00:48.0 | 3.0 | MG | **INSERT.** Open loop: the yellow recording dot from the opening, alone on black | Dot blinks once, then holds | WHO WAS HOLDING THE RECORDER? | Drone tail; paper snap on cut |

### The central mystery (starts 00:51.0)

| # | Time | Sec | Source | On screen | Motion | On-screen text | Sound |
|---|---|---|---|---|---|---|---|
| | | | | **¶4** "This is the story of Petters Company, Incorporated, a…" (58 words, 23.2 s, 5 shots) | | | |
| 14 | 00:51.0 | 4.6 | AI-ILL | A01: Minneapolis-style skyline at dusk, snow haze | Slow lateral drift | TWIN CITIES, MINNESOTA · "Illustration" | Low city hum |
| 15 | 00:55.6 | 4.6 | MAP | Twin Cities OSM map in channel style | Camera descends; yellow pin settles in the western suburbs | Petters Company, Inc. (PCI) · "© OpenStreetMap contributors" | Soft pin click |
| 16 | 01:00.3 | 4.6 | **[RECREATION]** | R09: investor's office, wide; a figure seen from behind turns pages of a thick binder; across the desk an out-of-focus second figure | Slow push-in | "Recreation" | Page turns, room tone |
| 17 | 01:04.9 | 4.6 | MG | Money loop draws itself in yellow ink: Investor → PCI → goods → retailer → Investor | Line draws clockwise in 2 s | INVESTOR · PCI · GOODS · RETAILER | Pen scratch |
| 18 | 01:09.6 | 4.6 | MG | Loop cycles; small paper icons stack at "Investor"; tiny ticks mark payments | Tokens circle; ticks pop | shown the paperwork · paid | Soft ledger ticks |
| | | | | **¶5** "But the goods in the middle of that loop…" (28 words, 11.2 s, 3 shots) | | | |
| 19 | 01:14.2 | 3.7 | MG | Loop, camera pushes toward the "goods" node | Push-in 15% | GOODS | Drone rises half a tone |
| 20 | 01:17.9 | 3.7 | MG | "Goods" node flickers and goes hollow; crooked-equals bottom bar tilts beside it | Flicker 3 frames, hollow | GOODS (outline only) | Sub hit, then silence 0.5 s |
| 21 | 01:21.7 | 3.7 | PD | DOJ release line | Highlight "However, no such purchases were made." | credit "U.S. Attorney, D. Minn., 8 Apr 2010" | Highlighter |
| | | | | **¶6** "The people who lent the money were not only…" (45 words, 18.0 s, 4 shots) | | | |
| 22 | 01:25.4 | 4.5 | MG | Investor node splits: a cluster of small squares "individuals" and one large block "an investment firm" | Split animation | INDIVIDUALS · AN INVESTMENT FIRM | Paper riffle |
| 23 | 01:29.9 | 4.5 | PD | DOJ release | Highlight "hundreds of millions of dollars in promissory notes" | (the line) | Highlighter |
| 24 | 01:34.4 | 4.5 | **[RECREATION]** | R25: an investment office at night, wide; a figure from behind at a desk squares a thick stack of notes (unreadable); city lights beyond | Slow push | "Recreation" · hundreds of millions (DOJ) | Paper, clock tick |
| 25 | 01:38.9 | 4.5 | MG | Line types out on near-black | Typewriter reveal, then the crooked-equals mark stamps beside it | "the largest financial crime in Minnesota history" · U.S. Attorney, D. Minn., 2 Sept 2010 | Typewriter; low hit |
| | | | | **¶7** "So this film follows two questions. The first is…" (40 words, 16.0 s, 4 shots) | | | |
| 26 | 01:43.4 | 4.0 | MG | Ledger column header | Header types; equals mark snaps straight then tilts | QUESTION 1: THE MONEY | Paper snap |
| 27 | 01:47.4 | 4.0 | MG | The hollow loop keeps cycling | Three labels pin onto the loop | banks · investors · famous companies | Ticks |
| 28 | 01:51.4 | 4.0 | MG | Year counter runs along the loop | 1994 → 2008 ticks | MORE THAN A DECADE | Ratchet |
| 29 | 01:55.4 | 4.0 | MG | Dollar tokens circle; none touches the hollow node | Camera pulls back | WHERE DID THE MONEY GO? | Drone swells |
| | | | | **¶8** "The second is about a person. Somebody inside the…" (46 words, 18.4 s, 4 shots) | | | |
| 30 | 01:59.4 | 4.6 | MG | Ledger header | Same style as Question 1 | QUESTION 2: A PERSON | Paper snap |
| 31 | 02:04.0 | 4.6 | MG | Evidence board ("ledger wall"): one blank name card pinned with yellow tape | Card slides in, tape slaps | INSIDER · there almost from the start | Tape rip |
| 32 | 02:08.6 | 4.6 | **[RECREATION]** | R02: corridor of a plain government-style building; two figures seen from behind walk away from camera toward a door, one carrying a briefcase | Slow follow, figures stay soft | "Recreation" · 8 SEPTEMBER 2008 | Footsteps on hard floor, distant HVAC |
| 33 | 02:13.2 | 4.6 | **[RECREATION]** | R03: plain meeting room, wide; two figures backlit against a window across a table from two others; a closed folder centre table; no face readable | Slow push-in toward the folder | "Recreation" | Clock tick, room tone; drone swell into title |
| 34 | 02:17.8 | 5.0 | MG | **INSERT.** **RE-HOOK.** Title card: THE $3.7 BILLION EMPIRE BUILT ON FAKE PURCHASE ORDERS; crooked-equals mark builds (white bar, then yellow bar tilting in) | Mark animates 1.2 s, title types | (title) · CROOKED ARITHMETIC | Licensed 4-s music sting, ends on paper snap |

### Origins (starts 02:22.8)

| # | Time | Sec | Source | On screen | Motion | On-screen text | Sound |
|---|---|---|---|---|---|---|---|
| | | | | **¶9** "The man at the center is Thomas Joseph Petters.…" (35 words, 14.0 s, 3 shots) | | | |
| 35 | 02:22.8 | 4.7 | ARCH | Licensed news photo of Tom Petters at a public event | Held still, slow 3% drift; desaturated 60% with paper tint | THOMAS JOSEPH PETTERS · photo credit (licensor) | Drone low |
| 36 | 02:27.5 | 4.7 | **[RECREATION]** | R22: a federal courtroom, wide from the rear gallery: a man in a suit from behind at the defence table, the bench far off under a lamp | Slow push | "Recreation" · AGE 52 AT SENTENCING, 2010 (DOJ) | Room hush |
| 37 | 02:32.1 | 4.7 | MAP | Lake Minnetonka, OSM, channel style | Push to Wayzata; yellow pin | WAYZATA, MN · "© OpenStreetMap contributors" | Water-lap ambience (licensed), soft |
| | | | | **¶10** "He was a dealmaker in consumer goods. He owned…" (57 words, 22.8 s, 4 shots) | | | |
| 38 | 02:36.8 | 5.7 | ARCH | Licensed photo or footage of Petters Warehouse Direct premises; if none, MG text card | Slow push | PETTERS WAREHOUSE DIRECT (DOJ) | Paper slide |
| 39 | 02:42.5 | 5.7 | ARCH | Licensed image of RedTag; if none, MG text card | Slow push | REDTAG (DOJ) | Paper slide |
| 40 | 02:48.2 | 5.7 | MG | Ledger wall: two company tabs clip under Petters's card | Tabs drop in | real businesses · real products · WHY THE PAPER LOOKED BELIEVABLE | Tape |
| 41 | 02:53.9 | 5.7 | PD | 8th Circuit opinion, U.S. v. Petters (2011), from CourtListener | Highlight "Petters was a prominent Minneapolis, Minnesota businessman." | U.S. Court of Appeals, 8th Cir., 2011 | Highlighter |
| | | | | **¶11** "In 1993, he hired an office manager. Her name…" (15 words, 6.0 s, 2 shots) | | | |
| 42 | 02:59.6 | 3.0 | **[RECREATION]** | R05: early-1990s small office; a woman seen from behind walks in carrying a coat and a box; beige computer, fax | Static wide, figure crosses frame | "Recreation" · 1993 | Door, footsteps, period fax hum |
| 43 | 03:02.6 | 3.0 | MG | Ledger wall: the blank insider card fills with a name | Name types; card stays partly greyed | DEANNA COLEMAN · hired 1993 · office manager (DOJ) · REMEMBER THE NAME | Typewriter; low hit |
| | | | | **¶12** "The next year, 1994, Petters formed Petters Company, Incorporated.…" (29 words, 11.6 s, 3 shots) | | | |
| 44 | 03:05.6 | 3.9 | MG | Year card | 1993 flips to 1994 | 1994 · PETTERS COMPANY, INC. = PCI | Page flip |
| 45 | 03:09.5 | 3.9 | MG | Ownership bar fills completely | Bar fills 0 → 100% | 100% PETTERS (DOJ) | Ratchet |
| 46 | 03:13.3 | 3.9 | PD | DOJ release | Highlight "was used for fraudulent purposes from the start." | (the line) | Highlighter, sub hit |
| | | | | **¶13** "To follow what happened next, it helps to know…" (75 words, 30.0 s, 7 shots) | | | |
| 47 | 03:17.2 | 4.3 | AI-ILL | A02: desk lamp pooling light over blank paper forms at night | Slow push | THE PURCHASE ORDER · "Illustration" | Lamp hum, drone |
| 48 | 03:21.5 | 4.3 | MG | Generic purchase-order form for "Example Retailer Inc." slides in | Slides up, settles | "Illustration" | Paper slide |
| 49 | 03:25.8 | 4.3 | MG | Field "Buyer" lights in yellow | Field glows | BUYER | Highlighter squeak |
| 50 | 03:30.1 | 4.3 | MG | "Goods" and "Quantity" light in turn | Fields glow in sequence | GOODS · QUANTITY | Two squeaks |
| 51 | 03:34.3 | 4.3 | MG | "Price" lights; a margin note writes itself | Pen writes | a buyer's written promise to buy | Pen scratch |
| 52 | 03:38.6 | 4.3 | **[RECREATION]** | R09b: a lender's office; a figure from behind holds a purchase order (unreadable) up to window light; a second figure out of focus | Slow push | "Recreation" · CLOSE TO A GUARANTEE | Paper, distant traffic |
| 53 | 03:42.9 | 4.3 | MG | Risk gauge drops low; crooked-equals mark straightens, perfectly level, for the only time so far | Needle falls | RISK LOOKS SMALL | Low tone resolves |
| | | | | **¶14** "Here is the pitch, as the record describes it.…" (68 words, 27.2 s, 6 shots) | | | |
| 54 | 03:47.2 | 4.5 | MG | Three boxes appear: SUPPLIER · PCI · RETAILER | Boxes draw | (box labels) | Pen scratch |
| 55 | 03:51.7 | 4.5 | MG | Arrow: Investor money → PCI → Supplier | Ink arrow travels | buy merchandise | Ink flow |
| 56 | 03:56.3 | 4.5 | MG | Arrow PCI → Retailer | Ink arrow travels | big-box retailers such as Costco and Sam's Club (DOJ) | Ink flow |
| 57 | 04:00.8 | 4.5 | MG | Profit arrow returns to investor | Arrow + small "+%" tag | repaid with interest | Ledger tick |
| 58 | 04:05.3 | 4.5 | **[RECREATION]** | R08: hands only, signing a blank, unreadable promissory note with a fountain pen; desk lamp | Close, slow push | "Recreation" | Pen nib on paper |
| 59 | 04:09.9 | 4.5 | PD | DOJ release | Highlight "Petters often signed promissory notes and provided his personal guarantee" | (the line) | Highlighter |
| | | | | **¶15** "It is a real kind of business. Short-term financing…" (45 words, 18.0 s, 4 shots) | | | |
| 60 | 04:14.4 | 4.5 | MG | Header | Types | A REAL KIND OF BUSINESS | Typewriter |
| 61 | 04:18.9 | 4.5 | MG | Checklist builds | Two ticks pop | ✓ KNOWN BUYER · ✓ SHORT TERM | Ticks |
| 62 | 04:23.4 | 4.5 | MG | Third line | Tick pops | ✓ GOODS EXIST | Tick |
| 63 | 04:27.9 | 4.5 | MG | **RE-HOOK.** The third tick turns into an empty box; crooked-equals tilts | Tick erases itself | ☐ GOODS EXIST | Sub hit, then 0.5 s silence |
| | | | | **¶16** "Investors were not paid out of profits on real…" (56 words, 22.4 s, 5 shots) | | | |
| 64 | 04:32.4 | 4.5 | MG | The loop, now honest: Investor B → Investor A | Arrows re-route | INVESTOR B → INVESTOR A | Ink flow |
| 65 | 04:36.9 | 4.5 | PD | DOJ release | Highlight "paid with money obtained from subsequent investors" | (the line) | Highlighter |
| 66 | 04:41.4 | 4.5 | MG | Quote alone | Types | "sometimes, even their own money." (DOJ) | Typewriter |
| 67 | 04:45.8 | 4.5 | **[RECREATION]** | R13: hands only, an investor at a kitchen table holding an opened envelope and a check (unreadable); out-of-focus lamp | Static, hands lower the check | "Recreation" | Envelope tear, quiet room |
| 68 | 04:50.3 | 4.5 | MG | Stack of envelopes; one stamped RETURNED; a check marked BOUNCED | Stamps thunk on | excuses · "slow payments from retailers" (DOJ) · "Illustration" | Two rubber-stamp thunks |
| | | | | **¶17** "The government has a phrase for money paid out…" (41 words, 16.4 s, 4 shots) | | | |
| 69 | 04:54.8 | 4.1 | MG | Dictionary card | Card slides in | lulling payments (n.) · DOJ, 8 Apr 2010 | Paper slide |
| 70 | 04:58.9 | 4.1 | MG | Definition types | Typewriter | money paid to keep investors calm | Typewriter |
| 71 | 05:03.0 | 4.1 | MG | One pot graphic; all arrows leave the same pot | Arrows fan out | ONE POT | Low tone |
| 72 | 05:07.1 | 4.1 | MG | Strike-through | Pen strikes the word | not returns on anything | Pen scratch |
| | | | | **¶18** "That's the shape of a Ponzi scheme. And a…" (47 words, 18.8 s, 4 shots) | | | |
| 73 | 05:11.2 | 4.7 | MG | Loop diagram with "Ponzi" label | Loop spins faster | THE SHAPE OF A PONZI SCHEME | Ticks speed up |
| 74 | 05:15.9 | 4.7 | MG | Text | Types, then underline | ONE NEED: PAPER | Typewriter |
| 75 | 05:20.6 | 4.7 | MG | Document counter beside a growing stack of blank PO forms | Counter climbs, stack rises | DOCUMENTS · "Illustration" | Adding machine |
| 76 | 05:25.3 | 4.7 | **[RECREATION]** | R27: hands only, feeding blank paper into a 1990s office laser printer; printed sheets (unreadable) slide out | Close, static | "Recreation" | Printer whir, paper |
| | | | | **¶19** "The government says that as the scheme went on,…" (45 words, 18.0 s, 4 shots) | | | |
| 77 | 05:30.0 | 4.5 | MG | Ledger wall: Coleman card slides forward | Push to card | DEANNA COLEMAN | Tape |
| 78 | 05:34.5 | 4.5 | **[RECREATION]** | R06: hands only at an early-2000s office computer, a form on the monitor blurred and unreadable; printed forms beside the keyboard | Slow push toward screen glow | "Recreation" | Keyboard clicks, printer |
| 79 | 05:39.0 | 4.5 | PD | DOJ release, 2 Sept 2010 | Highlight "admittedly began creating false documents" | credit "U.S. Attorney, D. Minn., 2 Sept 2010" | Highlighter |
| 80 | 05:43.5 | 4.5 | PD | Same release | Highlight "For her efforts, Coleman received millions of dollars." | (the line) | Highlighter, low hit |
| | | | | **¶20** "Over the years, she rose from office manager to…" (35 words, 14.0 s, 3 shots) | | | |
| 81 | 05:48.0 | 4.7 | MG | Coleman card | "office manager" struck through; "officer of PCI (DOJ)" writes beneath | OFFICER OF PCI | Pen scratch |
| 82 | 05:52.7 | 4.7 | MG | Coleman card slides next to Petters's card; a yellow ruled line joins them | Line draws | (none) | Ruler click |
| 83 | 05:57.3 | 4.7 | MG | Crop on both cards | Slow push | CLOSEST TO THE PAPER | Drone swell |
| 84 | 06:02.0 | 3.0 | MG | **INSERT.** Open loop: a purchase order alone; an empty frame beside it fills with a question mark | Frame flickers | PAPER WASN'T ENOUGH | Paper snap |

### Expansion (starts 06:05.0)

| # | Time | Sec | Source | On screen | Motion | On-screen text | Sound |
|---|---|---|---|---|---|---|---|
| | | | | **¶21** "By the late 1990s the paper had a weak…" (33 words, 13.2 s, 3 shots) | | | |
| 85 | 06:05.0 | 4.4 | MG | **RE-HOOK.** Year card; the purchase order from Origins cracks along a crease | Flip, crack | 1999 · THE WEAK POINT | Page flip, paper crack |
| 86 | 06:09.4 | 4.4 | MG | Purchase order with an empty frame beside it | Frame draws | bank statement? | Pen scratch |
| 87 | 06:13.8 | 4.4 | **[RECREATION]** | R09b: lender's office, a figure from behind holds a purchase order up to a window, reading; second figure out of focus | Slow push | "Recreation" | Paper, distant traffic |
| | | | | **¶22** "In 1999, according to the Justice Department, Petters wanted…" (59 words, 23.6 s, 5 shots) | | | |
| 88 | 06:18.2 | 4.7 | PD | DOJ release | Highlight "to 'verify' PCI's purported bank transactions with retailers" | (the line) | Highlighter |
| 89 | 06:22.9 | 4.7 | MG | Ledger wall: new card types | Card slides in | ROBERT WHITE · friend · false bank statements from 1999 (DOJ) | Typewriter, tape |
| 90 | 06:27.6 | 4.7 | **[RECREATION]** | R07: hands only, laying printed bank-statement pages (blurred, unreadable) in a neat row on a desk at night | Static top-down | "Recreation" | Paper on wood |
| 91 | 06:32.4 | 4.7 | MG | White card adds a line | Writes | title: CHIEF FINANCIAL OFFICER (DOJ) | Pen |
| 92 | 06:37.1 | 4.7 | PD | DOJ release | Highlight "responsible for fabricating retailer purchase orders and PCI financial records" | (the line) | Highlighter |
| | | | | **¶23** "Remember the name White, too. He later pleaded guilty,…" (21 words, 8.4 s, 2 shots) | | | |
| 93 | 06:41.8 | 4.2 | MG | White card underlined in yellow | Underline draws | REMEMBER THE NAME | Low hit |
| 94 | 06:46.0 | 4.2 | MG | White card gains a second line | Writes | Pleaded guilty · testified against Petters at trial (court record) | Pen, stamp thunk |
| | | | | **¶24** "The next weak point was money itself. If PCI…" (43 words, 17.2 s, 4 shots) | | | |
| 95 | 06:50.2 | 4.3 | MG | Header | Types | WEAK POINT 2: THE MONEY | Typewriter |
| 96 | 06:54.5 | 4.3 | **[RECREATION]** | R15b: hands only on a keyboard, early-2000s bank screen blurred, ENTER pressed | Close, static | "Recreation" · money must go to suppliers | Key press, soft beep |
| 97 | 06:58.8 | 4.3 | MG | Dashed empty arrow from retailers back | Dashes blink | money must come back | Tick |
| 98 | 07:03.1 | 4.3 | MG | Two empty boxes appear on the supplier side | Boxes draw | 2001 · vendor? · vendor? | Pen |
| | | | | **¶25** "The first was Larry Reynolds, who ran a company…" (41 words, 16.4 s, 4 shots) | | | |
| 99 | 07:07.4 | 4.1 | MG | Ledger wall card | Slides in | LARRY REYNOLDS · Nationwide International Resources (NIR) | Tape |
| 100 | 07:11.5 | 4.1 | PD | DOJ release | Highlight "previously had conducted deals involving shoes and clothing with retailers" | (the line) | Highlighter |
| 101 | 07:15.6 | 4.1 | **[RECREATION]** | R10: hands only at a bank desk, 2001: a wire-transfer form (unreadable) slid across the counter by a hand | Close, static | "Recreation" | Counter bell, paper slide |
| 102 | 07:19.7 | 4.1 | MG | Money passes through the NIR box; a slice peels off | Slice drops into a small cup | "commission" (DOJ) | Coin-less tick |
| | | | | **¶26** "The second was Michael Catain. In early 2002, Catain…" (65 words, 26.0 s, 6 shots) | | | |
| 103 | 07:23.8 | 4.3 | MG | Ledger wall card | Slides in | MICHAEL CATAIN · Enchanted Family Buying Co. (EFBC) · 2002 | Tape |
| 104 | 07:28.1 | 4.3 | **[RECREATION]** | R11: bank branch, 2002, wide: a figure from behind seated at a banker's desk; banker out of focus | Slow push | "Recreation" | Bank murmur, pen |
| 105 | 07:32.5 | 4.3 | MG | Account card "EFBC business account": money in, back to PCI, less a slice | Ink flows | less a commission | Ink flow |
| 106 | 07:36.8 | 4.3 | PD | DOJ release | Highlight "EFBC did no real business." | (the line) | Highlighter, low hit |
| 107 | 07:41.1 | 4.3 | **[RECREATION]** | R12: generic car wash at night, one upstairs window lit; a figure's silhouette behind the blind | Very slow push | "Recreation: not the actual building" | Rain, distant traffic |
| 108 | 07:45.5 | 4.3 | MG | Two plain pins (no map) joined by a dotted line | Line draws | a few miles from PCI's headquarters (DOJ) | Pin clicks |
| | | | | **¶27** "So now the picture an investor saw had every…" (37 words, 14.8 s, 3 shots) | | | |
| 109 | 07:49.8 | 4.9 | MG | Loop fills: purchase order, invoice, bank statement icons drop into boxes | Icons drop in | EVERY PART | Paper drops |
| 110 | 07:54.7 | 4.9 | MG | Money leaves PCI for "supplier", comes back; boxes tick CLEARED | Tokens travel | CLEARED | Ticks |
| 111 | 07:59.7 | 4.9 | MG | **RE-HOOK.** Camera pulls back: every arrow runs from PCI back into PCI; crooked-equals tilts | Pull-back 40% | PCI → PCI | Sub hit, silence 0.5 s |
| | | | | **¶28** "Two details in the government's account show how carefully…" (80 words, 32.0 s, 7 shots) | | | |
| 112 | 08:04.6 | 4.6 | MG | Header | Types | TWO DETAILS | Typewriter |
| 113 | 08:09.2 | 4.6 | MG | Generic wire record, labelled | Slides in; arrow PCI → vendor | "Illustration" | Paper |
| 114 | 08:13.7 | 4.6 | PD | DOJ release | Highlight "giving the appearance that PCI had money invested in the deals too" | (the line) | Highlighter |
| 115 | 08:18.3 | 4.6 | **[RECREATION]** | R26: a lender's office, wide, night: a figure from behind reads a bound financial statement (unreadable) under a desk lamp | Slow push | "Recreation" | Page turn, clock |
| 116 | 08:22.9 | 4.6 | MG | Generic financial statement, line "Owed by retailers" | Counter rolls up into billions | OWED BY RETAILERS: $ BILLIONS · "Illustration" | Ratchet |
| 117 | 08:27.5 | 4.6 | PD | DOJ release | Highlight "false PCI financial statements showing the company was owed billions of dollars from retailers" | (the line) | Highlighter |
| 118 | 08:32.0 | 4.6 | MG | The figure dissolves to $0 | Digits fall away | NO SALES · NOTHING OWED | Sub hit |
| | | | | **¶29** "Here are the numbers the bank records later showed.…" (73 words, 29.2 s, 6 shots) | | | |
| 119 | 08:36.6 | 4.9 | **[RECREATION]** | R10b: hands only, a bank clerk stamps and files a wire slip (unreadable), 2003 | Close, static | "Recreation" · BANK RECORDS · JAN 2003 – SEPT 2008 | Stamp, paper |
| 120 | 08:41.5 | 4.9 | MG | Bar grows | Counter ticks with the bar | NIR → PCI ≈ $12 BILLION | Ratchet |
| 121 | 08:46.3 | 4.9 | MG | Second bar grows to the same height | Counter | EFBC → PCI · ROUGHLY THE SAME | Ratchet |
| 122 | 08:51.2 | 4.9 | MG | Caption locks under both bars | Caption slides in | GROSS MONEY MOVED · NOT LOSSES · U.S. Attorney, D. Minn., 8 Apr 2010 | Click |
| 123 | 08:56.1 | 4.9 | MG | Supplier "income from sales" meters stay at zero | Needles twitch, stay down | INCOME FROM SALES: NONE SHOWN | Low tone |
| 124 | 09:00.9 | 4.9 | PD | DOJ release | Highlight "only flowed one way" | (the line) | Highlighter, low hit |
| | | | | **¶30** "In April 2001, PCI had opened a new bank…" (60 words, 24.0 s, 5 shots) | | | |
| 125 | 09:05.8 | 4.8 | MG | Year card | Flip | APRIL 2001 · A NEW ACCOUNT | Page flip |
| 126 | 09:10.6 | 4.8 | MG | Account card with two signature lines | Names write in | AUTHORIZED: PETTERS · COLEMAN | Pen |
| 127 | 09:15.4 | 4.8 | **[RECREATION]** | R15: hands only on a keyboard, 2003-era bank portal on a CRT, screen blurred; ENTER pressed | Close, static | "Recreation" | Key press, soft beep |
| 128 | 09:20.2 | 4.8 | MG | Incoming arrows: investors, NIR, EFBC; counter climbs | Counter to ≈ $35 BILLION | ≈ $35 BILLION WIRED IN · GROSS FLOW, NOT LOSSES | Ratchet accelerating |
| 129 | 09:25.0 | 4.8 | PD | DOJ release | Highlight "none of the deposits into the account came from retailers" | (the line) | Highlighter |
| | | | | **¶31** "That is the heart of it. Thirty-five billion dollars…" (36 words, 14.4 s, 3 shots) | | | |
| 130 | 09:29.8 | 4.8 | MG | Hold on the grey "retailers" input; everything else dims | Static hold | RETAILERS: $0 | Silence (all music out) |
| 131 | 09:34.6 | 4.8 | MG | Two ledger lines face each other with the crooked equals between | Bottom bar tilts | $35,000,000,000 IN · $0 FROM RETAILERS | Single low hit |
| 132 | 09:39.4 | 4.8 | AI-ILL | A03: an empty, unbranded loading bay at night, one light | Slow push | "Illustration" | Wind, distant hum |
| | | | | **¶32** "So where did it go? Some went back out…" (62 words, 24.8 s, 5 shots) | | | |
| 133 | 09:44.2 | 5.0 | MG | Outflow diagram from the account; first branch | Branch draws | back to investors | Ink flow |
| 134 | 09:49.2 | 5.0 | MG | Second branch | Branch draws | bonuses · "most of whom did not even work for PCI" (DOJ) | Ink flow |
| 135 | 09:54.1 | 5.0 | MG | Third and fourth branches | Branches draw | hundreds of millions → Petters's companies · real estate for family members (DOJ) | Ink flow |
| 136 | 09:59.1 | 5.0 | **[RECREATION]** | R15c: hands only on a keyboard, a wire screen blurred; an outgoing wire sent | Close, static | "Recreation" · millions → Coleman and White (DOJ) | Key press, soft beep |
| 137 | 10:04.0 | 5.0 | MG | Last branch, thicker | Branch draws | tens of millions → Petters (DOJ) | Low hit |
| | | | | **¶33** "And then he did something that made the whole…" (17 words, 6.8 s, 2 shots) | | | |
| 138 | 10:09.0 | 3.4 | MG | **RE-HOOK.** Black | Types | HE BOUGHT FAMOUS COMPANIES | Typewriter, sub hit |
| 139 | 10:12.4 | 3.4 | ARCH | Licensed footage: catalog mailing operation | Natural motion | (none) | Licensed archival audio off; music only |
| | | | | **¶34** "The government listed them: Fingerhut, the catalog retailer. Polaroid,…" (39 words, 15.6 s, 4 shots) | | | |
| 140 | 10:15.8 | 3.9 | ARCH | Licensed footage: catalog pages, mail bins | Natural motion | FINGERHUT · catalog retailer | Soft whoosh |
| 141 | 10:19.7 | 3.9 | ARCH | Licensed footage: vintage instant camera ejecting a print | Natural motion | POLAROID · camera brand | Camera click (licensed SFX) |
| 142 | 10:23.6 | 3.9 | ARCH | Licensed footage: airliner on a runway | Natural motion | SUN COUNTRY AIRLINES | Jet rumble, low |
| 143 | 10:27.5 | 3.9 | PD | DOJ release | Highlight "The companies he bought were purchased with proceeds of the PCI fraud" | PETTERS GROUP WORLDWIDE | Highlighter |
| | | | | **¶35** "Think about what that did. To the public, Tom…" (49 words, 19.6 s, 4 shots) | | | |
| 144 | 10:31.4 | 4.9 | MG | Org chart: Petters at top; Petters Group Worldwide left; PCI right | Lines draw | (labels) | Pen |
| 145 | 10:36.3 | 4.9 | MG | Split screen: licensed brand footage left; hollow loop right | Wipe splits frame | PUBLIC IMAGE · LEDGER | Paper snap |
| 146 | 10:41.2 | 4.9 | **[RECREATION]** | R26b: a lender's office; a figure from behind reads the business pages of a newspaper (unreadable); out-of-focus window | Slow push | "Recreation" · "a false air of legitimacy" (DOJ) | Newspaper rustle |
| 147 | 10:46.1 | 4.9 | PD | DOJ release | Highlight "the appearance he needed to keep the scam going" | (the line) | Highlighter, low hit |
| | | | | **¶36** "Those companies cost money too. Each year, the release…" (52 words, 20.8 s, 4 shots) | | | |
| 148 | 10:51.0 | 5.2 | MG | PGW branch pipes money back out of PCI | Ink drains | losses written off every year (DOJ) | Drip-like ticks |
| 149 | 10:56.2 | 5.2 | MG | Two lines start to separate | Lines draw | MONEY OWED TO INVESTORS · MONEY COMING IN · "Illustration, not to scale" | Low tone |
| 150 | 11:01.4 | 5.2 | MG | The gap widens | Lines continue | (same) | Tone rises |
| 151 | 11:06.6 | 5.2 | **[RECREATION]** | R09: the investor's office again, wide; a new figure from behind receives the binder across the desk | Slow push | "Recreation" · MORE INVESTORS NEEDED EVERY YEAR | Page turns |
| 152 | 11:11.8 | 3.0 | MG | **INSERT.** Open loop: the new-investor arrow stutters and stops; calendar card END OF 2007 | Arrow freezes | THEN THE NEW MONEY SLOWED | Drone cut, paper snap |

### Turning point (starts 11:14.8)

| # | Time | Sec | Source | On screen | Motion | On-screen text | Sound |
|---|---|---|---|---|---|---|---|
| | | | | **¶37** "By the end of 2007, the arithmetic was turning…" (57 words, 22.8 s, 5 shots) | | | |
| 153 | 11:14.8 | 4.6 | MG | Calendar card | Flip | END OF 2007 | Page flip |
| 154 | 11:19.4 | 4.6 | MG | New-investor counter slows to a stop | Counter decelerates | NEW INVESTORS | Ratchet slowing |
| 155 | 11:23.9 | 4.6 | MG | Ledger wall card | Slides in | GREG BELL · Lancelot Investment Management (DOJ) | Tape |
| 156 | 11:28.5 | 4.6 | **[RECREATION]** | R25: an investment office at night, wide; a figure from behind at a desk with a stack of notes, city lights beyond | Slow push | "Recreation" | Clock tick, HVAC |
| 157 | 11:33.0 | 4.6 | PD | DOJ release | Highlight "PCI was slow to pay hundreds of millions of dollars in promissory notes" | (the line) | Highlighter |
| | | | | **¶38** "Petters told Bell the delay was the retailers' fault:…" (27 words, 10.8 s, 3 shots) | | | |
| 158 | 11:37.6 | 3.6 | PD | DOJ release | Highlight "his retailers, who were late in paying him" | (the line) | Highlighter |
| 159 | 11:41.2 | 3.6 | MG | Promissory note (illustration): due date crossed out, moved forward | Pen strikes, rewrites | "Illustration" | Pen scratch |
| 160 | 11:44.8 | 3.6 | MG | Stamp | Stamp thunks | EXTENSION | Rubber-stamp thunk |
| | | | | **¶39** "Then, in February 2008, according to the government, the…" (84 words, 33.6 s, 7 shots) | | | |
| 161 | 11:48.4 | 4.8 | MG | Calendar card | Flip | FEBRUARY 2008 | Page flip |
| 162 | 11:53.2 | 4.8 | **[RECREATION]** | R14: hands only, two pairs, across a table: one slides a stack of purchase orders (unreadable) across, the other slides a stack back | Close, top-down | "Recreation" | Paper slide x2 |
| 163 | 11:58.0 | 4.8 | PD | DOJ release | Highlight "Bell suggested they also exchange money so it would appear that PCI was paying its notes" | (the line) | Highlighter |
| 164 | 12:02.8 | 4.8 | MG | Arrows bounce between LANCELOT and PCI | Bounce speeds up | (labels) | Ticks |
| 165 | 12:07.6 | 4.8 | MG | Counter | 0 → 80+ | 80+ "ROUND TRIP" TRANSACTIONS · FEB – SEPT 2008 (DOJ) | Adding machine |
| 166 | 12:12.4 | 4.8 | MG | **RE-HOOK.** Bounces blur into a solid line | Speed ramps | (none) | Ticks blur into a tone |
| 167 | 12:17.2 | 4.8 | MG | Bell card | Stamp | PLEADED GUILTY (DOJ) | Stamp thunk |
| | | | | **¶40** "A round trip, in this sense, is money that…" (73 words, 29.2 s, 6 shots) | | | |
| 168 | 12:22.0 | 4.9 | MG | Dictionary card | Slides in | round trip (n.) | Paper slide |
| 169 | 12:26.9 | 4.9 | MG | One token PCI → Lender; a PAID stamp lands on a ledger | Token travels | PAID · "Illustration" | Stamp |
| 170 | 12:31.7 | 4.9 | **[RECREATION]** | R15: hands only on a keyboard, the same blurred wire screen; ENTER, then a second ENTER | Close, static | "Recreation" · BALANCE OWED: UNCHANGED | Two key presses |
| 171 | 12:36.6 | 4.9 | MG | Repeats; PAID stamps pile up, balance still unchanged | Loop ×3, faster | PAID PAID PAID | Stamps quicken |
| 172 | 12:41.5 | 4.9 | MG | Text | Types | DEBT THE SAME · APPEARANCE BETTER | Typewriter |
| 173 | 12:46.3 | 4.9 | MG | Counter | Ticks | 80+ IN ABOUT 7 MONTHS | Ratchet |
| | | | | **¶41** "In this case, the last months didn't look like…" (42 words, 16.8 s, 4 shots) | | | |
| 174 | 12:51.2 | 4.2 | AI-ILL | A04: rain on an office window at night, city lights blurred | Static | "Illustration" | Rain, drone |
| 175 | 12:55.4 | 4.2 | MG | Crooked-equals mark large; top bar "LOOKS FINE", bottom bar "IS FINE" tilting | Bottom bar tilts further | LOOKS FINE ≠ IS FINE | Low tone |
| 176 | 12:59.6 | 4.2 | AI-ILL | A05: an office corridor at dusk, most rooms dark, one door ajar; one more light switches off | Light clicks off | "Illustration" | Switch click |
| 177 | 13:03.8 | 4.2 | MG | Ledger wall: Coleman card lit, others dim | Light pools on card | THE ONE PERSON WHO COULD SEE ALL OF IT | Drone swell |
| | | | | **¶42** "On the eighth of September 2008, Deanna Coleman and…" (58 words, 23.2 s, 5 shots) | | | |
| 178 | 13:08.0 | 4.6 | MG | **RE-HOOK.** Calendar card | Flip, sub hit | 8 SEPTEMBER 2008 | Sub hit |
| 179 | 13:12.6 | 4.6 | **[RECREATION]** | R02: the corridor from the Central Mystery; two figures from behind reach a door, one opens it | Static, door opens | "Recreation" | Door handle, footsteps |
| 180 | 13:17.3 | 4.6 | PD | DOJ release | Highlight "co-conspirator Deanna Coleman and her attorney reported to authorities" | (the line) | Highlighter |
| 181 | 13:21.9 | 4.6 | **[RECREATION]** | R03: the meeting room, wide, backlit, faces unreadable; the folder now open | Slow push | "Recreation" | Room tone, paper |
| 182 | 13:26.6 | 4.6 | PD | DOJ release | Highlight "multi-billion-dollar Ponzi scheme over the previous ten years" | (the line) | Highlighter |
| | | | | **¶43** "The record doesn't explain her reasons, and this film…" (36 words, 14.4 s, 3 shots) | | | |
| 183 | 13:31.2 | 4.8 | MG | Text | Types | HER REASONS: NOT IN THE RECORD | Typewriter |
| 184 | 13:36.0 | 4.8 | PD | DOJ release, 2 Sept 2010 | Highlight "she did the right thing by bringing this fraud into the light of day" | U.S. Attorney B. Todd Jones, 2 Sept 2010 | Highlighter |
| 185 | 13:40.8 | 4.8 | MG | Quote alone on near-black | Fades up | "into the light of day" | Drone, soft |
| | | | | **¶44** "What she offered wasn't only a confession. She agreed…" (42 words, 16.8 s, 4 shots) | | | |
| 186 | 13:45.6 | 4.2 | MG | Text | Types | NOT ONLY A CONFESSION | Typewriter |
| 187 | 13:49.8 | 4.2 | PD | DOJ release, 2 Sept 2010 | Highlight "agreed to work with law enforcement" | (the line) | Highlighter |
| 188 | 13:54.0 | 4.2 | **[RECREATION]** | R04b: hands only, a small generic digital recorder on a desk beside a closed day planner; a finger presses the side switch; a tiny yellow light comes on | Close, static | "Recreation" | Small click |
| 189 | 13:58.2 | 4.2 | PD | DOJ release | Highlight "She wore a recording device to tape conversations with Petters and others" | (the line) | Highlighter |
| | | | | **¶45** "Going to the authorities did not make her a…" (58 words, 23.2 s, 5 shots) | | | |
| 190 | 14:02.4 | 4.6 | MG | Coleman card | Writes | PART OF THE SCHEME ≈ 10 YEARS (DOJ) | Pen |
| 191 | 14:07.0 | 4.6 | MG | Card turns grey | Colour drains | CHARGED 6 OCT 2008 (DOJ) | Low hit |
| 192 | 14:11.7 | 4.6 | MG | "Who knew" diagram: two dots (Petters, Coleman) then a third, larger, appears | Dot fades up | THE GOVERNMENT | Tone |
| 193 | 14:16.3 | 4.6 | MG | Text | Types | EVERY CONVERSATION → EVIDENCE | Typewriter |
| 194 | 14:21.0 | 4.6 | **[RECREATION]** | R01: the frosted-glass office again; two shadows; in the foreground, soft, a jacket with a faint yellow light at the pocket | Slow push | "Recreation: setting not known" | Room tone, faint |
| | | | | **¶46** "Think about the position that put him in. The…" (43 words, 17.2 s, 4 shots) | | | |
| 195 | 14:25.6 | 4.3 | MG | Ledger wall: Petters and Coleman cards side by side | Push | (names) | Tape |
| 196 | 14:29.9 | 4.3 | MG | The account card slides between them | Slides in | ONLY TWO PEOPLE AUTHORIZED | Paper |
| 197 | 14:34.2 | 4.3 | MG | Yellow recording dot appears on Coleman's card | Dot fades up, pulses | (none) | Single soft beep |
| 198 | 14:38.5 | 4.3 | MG | Push in on the dot until it fills the frame | Push 300% | (none) | Drone rises |
| | | | | **¶47** "The first few hours are already on record. "Fake."…" (62 words, 24.8 s, 5 shots) | | | |
| 199 | 14:42.8 | 5.0 | MG | Callback to cold open, same highlight style | "Fake." and "Divine intervention." flash in order | "Fake." · "Divine intervention." | Highlighter x2 |
| 200 | 14:47.8 | 5.0 | PD | DOJ release | Highlight "chronicled the history of the scheme" | (the line) | Highlighter |
| 201 | 14:52.7 | 5.0 | **[RECREATION]** | R01b: same frosted-glass office, a wider angle; one shadow stands, the other stays seated | Static | "Recreation: setting not known" | Chair creak |
| 202 | 14:57.7 | 5.0 | PD | DOJ release | Highlight "obtaining new investor funds and lulling long-term investors" | (the line) | Highlighter |
| 203 | 15:02.6 | 5.0 | PD | DOJ release | Highlight "how the conspirators planned to avoid responsibility if the fraud was discovered" | IF THE FRAUD WAS DISCOVERED | Highlighter, low hit |
| | | | | **¶48** "A plan for what to do if they were…" (25 words, 10.0 s, 2 shots) | | | |
| 204 | 15:07.6 | 5.0 | MG | Calendar from 8 September; days tick | Days flip, accelerating | 8 SEPT 2008 → | Ratchet |
| 205 | 15:12.6 | 5.0 | MG | Calendar stops | Hard stop | 24 · 16 DAYS | Sub hit, silence |
| 206 | 15:17.6 | 3.0 | AI-ILL | **INSERT.** Open loop: A06, dawn light through window blinds across an empty desk | Slow light move | THE MORNING OF THE SEARCH · "Illustration" | Distant car doors (licensed) |

### Exposure (starts 15:20.6)

| # | Time | Sec | Source | On screen | Motion | On-screen text | Sound |
|---|---|---|---|---|---|---|---|
| | | | | **¶49** "On the twenty-fourth of September 2008, agents from the…" (47 words, 18.8 s, 4 shots) | | | |
| 207 | 15:20.6 | 4.7 | MG | **RE-HOOK.** Calendar card | Flip | 24 SEPTEMBER 2008 | Page flip, sub hit |
| 208 | 15:25.3 | 4.7 | **[RECREATION]** | R16: morning, an office building exterior, wide; figures in plain dark windbreakers (no lettering, no badges, no weapons) carry archive boxes to unmarked vans; faces too small to read | Slow lateral drift | "Recreation: not the actual building" | Van doors, footsteps |
| 209 | 15:30.0 | 4.7 | ARCH | Licensed local news footage of the headquarters on 24 Sept 2008 (or licensed still of the building) | Natural / slow push | Minnetonka headquarters · credit | Licensed natural sound low |
| 210 | 15:34.7 | 4.7 | **[RECREATION]** | R17: interior, figures from behind lifting files from open filing-cabinet drawers into boxes | Static | "Recreation" | Drawers, cardboard |
| | | | | **¶50** "Each of those agencies was there for a reason.…" (74 words, 29.6 s, 6 shots) | | | |
| 211 | 15:39.4 | 4.9 | MG | Three plain text labels (no seals, no logos) | Labels slide in | FBI · IRS CRIMINAL INVESTIGATION · U.S. POSTAL INSPECTION SERVICE | Paper slides |
| 212 | 15:44.3 | 4.9 | MG | FBI label links to the loop with a thin line | Line draws | FBI: FRAUD | Pen |
| 213 | 15:49.3 | 4.9 | MG | IRS label links to the account card | Line draws | IRS-CI: MONEY | Pen |
| 214 | 15:54.2 | 4.9 | MG | Postal label links to the envelopes | Line draws | USPIS: THE MAIL | Pen |
| 215 | 15:59.1 | 4.9 | PD | DOJ release | Highlight "the criminal misuse of the U.S. mail" | Postal Inspector in Charge, 8 Apr 2010 | Highlighter |
| 216 | 16:04.1 | 4.9 | MG | Two equations, straight equals | Types | MAIL → MAIL FRAUD · WIRE → WIRE FRAUD | Typewriter |
| | | | | **¶51** "The government's later summary of the paperwork was blunt.…" (24 words, 9.6 s, 3 shots) | | | |
| 217 | 16:09.0 | 3.2 | **[RECREATION]** | R17b: hands only, a purchase order (unreadable) laid on a table; a second hand points at the header | Close | "Recreation" | Paper |
| 218 | 16:12.2 | 3.2 | PD | DOJ release, 2 Sept 2010 | Highlight "Again, those transactions were fictitious." | (the line) | Highlighter |
| 219 | 16:15.4 | 3.2 | MG | Quote card | Word stamps on | "fictitious" (DOJ) | Stamp thunk |
| | | | | **¶52** "Things moved quickly after that. Within days, PCI filed…" (24 words, 9.6 s, 2 shots) | | | |
| 220 | 16:18.6 | 4.8 | MG | Timeline strip along the bottom | 24 Sept → "within days" | SEARCH · PCI BANKRUPTCY | Ticks |
| 221 | 16:23.4 | 4.8 | PD | DOJ release | Highlight "Petters continued to lull investors even after law enforcement executed search warrants" | (the line) | Highlighter |
| | | | | **¶53** "Then, the government says, on the first of October…" (65 words, 26.0 s, 6 shots) | | | |
| 222 | 16:28.2 | 4.3 | MG | Timeline continues | Marker drops | 1 OCT · suggested White and Reynolds flee (DOJ) | Tick |
| 223 | 16:32.5 | 4.3 | PD | DOJ release | Highlight "Petters suggested to White and Reynolds that they flee prior to prosecution" | (the line) | Highlighter |
| 224 | 16:36.9 | 4.3 | **[RECREATION]** | R29: a federal building corridor, wide: two figures in plain suits walk beside a third, all from behind, faces unreadable, no restraints shown | Slow follow | "Recreation" · 3 OCT 2008 · ARRESTED AND DETAINED (DOJ) | Footsteps, door buzz |
| 225 | 16:41.2 | 4.3 | ARCH | Licensed exterior of the federal courthouse | Slow push | (location caption) | City ambience |
| 226 | 16:45.5 | 4.3 | PD | DOJ release | Highlight "He has been in custody since that time." | U.S. Attorney, D. Minn., 8 Apr 2010 | Highlighter |
| 227 | 16:49.9 | 4.3 | MG | Timeline strip holds; the date of the statement pins under it | Pin drops | IN CUSTODY SINCE 3 OCT 2008 · as of 8 Apr 2010 (DOJ) | Typewriter |
| | | | | **¶54** "And the people around him began to plead guilty.…" (59 words, 23.6 s, 5 shots) | | | |
| 228 | 16:54.2 | 4.7 | MG | Ledger wall: five name cards in a row | Cards slide in | COLEMAN · WHITE · REYNOLDS · CATAIN · BELL | Tape x5 |
| 229 | 16:58.9 | 4.7 | MG | Coleman card | Writes | charged 6 Oct 2008 · pleaded guilty 8 Oct 2008 · conspiracy to commit mail fraud (DOJ) | Pen |
| 230 | 17:03.6 | 4.7 | **[RECREATION]** | R18: a courtroom from the rear gallery, wide: a woman stands at the lectern beside a lawyer, both from behind; the judge far off, out of focus | Static | "Recreation" · 8 OCT 2008 | Room hush |
| 231 | 17:08.4 | 4.7 | MG | White and Reynolds cards | Stamps | PLEADED GUILTY | Stamp x2 |
| 232 | 17:13.1 | 4.7 | MG | **RE-HOOK.** Catain and Bell cards | Stamps | PLEADED GUILTY | Stamp x2 |
| | | | | **¶55** "Petters did not. He was indicted in December 2008,…" (14 words, 5.6 s, 1 shot) | | | |
| 233 | 17:17.8 | 5.6 | MG | Petters card alone, no stamp; the other five dim | Card lit | INDICTED DECEMBER 2008 (DOJ) | Low hit |
| | | | | **¶56** "The trial lasted about a month, in the fall…" (53 words, 21.2 s, 5 shots) | | | |
| 234 | 17:23.4 | 4.2 | ARCH | Licensed courthouse exterior, fall 2009 | Slow push | TRIAL · ABOUT ONE MONTH · ENDED 2 DEC 2009 | City ambience |
| 235 | 17:27.6 | 4.2 | MG | Yellow recording dot beside a stack of the four document types; no waveform | Dot pulses; stack settles | THE RECORDINGS · THE DOCUMENTS | Soft beep, paper |
| 236 | 17:31.9 | 4.2 | **[RECREATION]** | R19: courtroom, wide from the rear: jury box seen from behind, a witness at the stand silhouetted against a window | Slow push | "Recreation" | Courtroom hush, chair creak |
| 237 | 17:36.1 | 4.2 | MG | White and Reynolds cards light up | Cards lift | ROBERT WHITE · LARRY REYNOLDS · testified against Petters (court records) | Tape |
| 238 | 17:40.4 | 4.2 | **[RECREATION]** | R20: a man in a suit at a witness stand, seen from behind and to the side, out of focus, against window light | Static | "Recreation" · TESTIFIED IN HIS OWN DEFENSE | Courtroom hush |
| | | | | **¶57** "The judge, Richard Kyle, later gave his view of…" (22 words, 8.8 s, 2 shots) | | | |
| 239 | 17:44.6 | 4.4 | MG | Ledger wall card | Slides in | JUDGE RICHARD KYLE | Tape |
| 240 | 17:49.0 | 4.4 | PD | DOJ release | Highlight "It just didn't pass the smell test." | Judge Kyle, per DOJ | Highlighter, low hit |
| | | | | **¶58** "On the second of December 2009, the jury found…" (47 words, 18.8 s, 4 shots) | | | |
| 241 | 17:53.4 | 4.7 | **[RECREATION]** | R21: courtroom, wide from the rear: the jury box from behind, jurors standing; faces unreadable | Static | "Recreation" · 2 DECEMBER 2009 | Courtroom hush, sub hit |
| 242 | 17:58.1 | 4.7 | MG | Twenty-line checklist; first group fills | Ticks fill | 10 × WIRE FRAUD | Ticks |
| 243 | 18:02.8 | 4.7 | MG | Next three groups fill | Ticks fill | 3 × MAIL FRAUD · 1 × CONSPIRACY (MAIL/WIRE) · 1 × CONSPIRACY (LAUNDERING) | Ticks |
| 244 | 18:07.5 | 4.7 | MG | Last group fills; total locks | Ticks, then hard stop | 5 × MONEY LAUNDERING · GUILTY: 20 OF 20 | Sub hit |
| | | | | **¶59** "In plain words: wire fraud and mail fraud are…" (59 words, 23.6 s, 5 shots) | | | |
| 245 | 18:12.2 | 4.7 | MG | Checklist, definitions type beside groups | Types | WIRE / MAIL FRAUD: a scheme to cheat, using wires or the mail | Typewriter |
| 246 | 18:16.9 | 4.7 | MG | Next definition | Types | CONSPIRACY: agreeing with others to commit the crime | Typewriter |
| 247 | 18:21.6 | 4.7 | **[RECREATION]** | R10: hands only at a bank desk: a wire slip (unreadable) slid across the counter | Close, static | "Recreation" · MONEY LAUNDERING · NIR · EFBC | Counter bell, paper |
| 248 | 18:26.4 | 4.7 | PD | DOJ release | Highlight "to launder billions of dollars of investor funds through their business accounts" | (the line) | Highlighter |
| 249 | 18:31.1 | 4.7 | MG | Flow returns to Petters and PCI | Ink flow | back to Petters and PCI (DOJ) | Ink flow |
| 250 | 18:35.8 | 3.0 | MG | **INSERT.** Open loop: two empty bars side by side, unlabeled, one long and one tiny | Bars draw | THE BOSS. THE INSIDER. | Drone, paper snap |

### Consequences (starts 18:38.8)

| # | Time | Sec | Source | On screen | Motion | On-screen text | Sound |
|---|---|---|---|---|---|---|---|
| | | | | **¶60** "On the eighth of April 2010, in St. Paul,…" (38 words, 15.2 s, 3 shots) | | | |
| 251 | 18:38.8 | 5.1 | **[RECREATION]** | R22: a federal courtroom, wide from the rear gallery: judge's bench under a lamp, a figure in a suit from behind at the defence table | Slow push | "Recreation: not the actual courtroom" · ST. PAUL · 8 APRIL 2010 | Room hush |
| 252 | 18:43.9 | 5.1 | MG | **RE-HOOK.** Counter | 0 → 50 | 50 YEARS | Ratchet, sub hit |
| 253 | 18:48.9 | 5.1 | PD | DOJ release | Highlight "the longest term of imprisonment ever ordered in a financial fraud case in Minnesota history" | (the line) | Highlighter |
| | | | | **¶61** "Explaining the length of the term, the judge said:…" (21 words, 8.4 s, 2 shots) | | | |
| 254 | 18:54.0 | 4.2 | PD | DOJ release | Highlight the judge's sentence | (the line) | Highlighter |
| 255 | 18:58.2 | 4.2 | **[RECREATION]** | R22b: the courtroom from the rear gallery; the judge's bench under a lamp, a silhouette, unreadable; quote types over it | Static | "Recreation" · "I'm not satisfied that if he were released early, he wouldn't re-offend." Judge Kyle (DOJ) | Typewriter |
| | | | | **¶62** "The U.S. Attorney for Minnesota, B. Todd Jones, spoke…" (58 words, 23.2 s, 5 shots) | | | |
| 256 | 19:02.4 | 4.6 | MG | Card | Slides in | B. TODD JONES · U.S. Attorney, D. Minn. | Tape |
| 257 | 19:07.0 | 4.6 | PD | DOJ release | Highlight "Tom Petters built his life on the shattered dreams of others" | (the line) | Highlighter |
| 258 | 19:11.7 | 4.6 | AI-ILL | A01b: the skyline at first light | Slow drift | "Illustration" | Soft drone |
| 259 | 19:16.3 | 4.6 | MG | Card | Slides in | RALPH S. BOELTER · FBI Special Agent in Charge, Minneapolis | Tape |
| 260 | 19:21.0 | 4.6 | PD | DOJ release | Highlight "the start of a recovery process of sorts" | (the line) | Highlighter |
| | | | | **¶63** "That September, the same judge sentenced Deanna Coleman. Her…" (41 words, 16.4 s, 4 shots) | | | |
| 261 | 19:25.6 | 4.1 | MG | Calendar card | Flip | 2 SEPTEMBER 2010 | Page flip |
| 262 | 19:29.7 | 4.1 | **[RECREATION]** | R23: the same courtroom setup from a different rear angle: a woman stands beside a lawyer, both from behind | Static | "Recreation" | Room hush |
| 263 | 19:33.8 | 4.1 | PD | DOJ release, 2 Sept 2010 | Highlight "sentenced to a year and a day in prison" | (the line) | Highlighter |
| 264 | 19:37.9 | 4.1 | PD | Same release | Highlight "extremely valuable, she still had to pay a price for her own wrongdoing" | (the line) | Highlighter |
| | | | | **¶64** "He went on to say that the sentence reflected…" (30 words, 12.0 s, 3 shots) | | | |
| 265 | 19:42.0 | 4.0 | PD | Same release | Highlight "conscious over loyalty and greed" | [sic], as published | Highlighter |
| 266 | 19:46.0 | 4.0 | MG | Ledger wall: Coleman card; two paths drawn away from it; one fades | Lines draw | COME FORWARD · STAY SILENT | Pen |
| 267 | 19:50.0 | 4.0 | **[RECREATION]** | R02c: the government corridor, one figure from behind walks toward a bright doorway | Static | "Recreation" · COME FORWARD | Footsteps |
| | | | | **¶65** "Fifty years for the man who ran it. A…" (39 words, 15.6 s, 3 shots) | | | |
| 268 | 19:54.0 | 5.2 | MG | Bar drawn to scale, full width | Bar grows 3 s | 50 YEARS | Slow ratchet |
| 269 | 19:59.2 | 5.2 | MG | Second bar, to scale, barely visible | Bar grows a sliver | 1 YEAR AND 1 DAY | Single tick |
| 270 | 20:04.4 | 5.2 | MG | **RE-HOOK.** Both bars, crooked equals between | Hold | A COOPERATING WITNESS | Drone |
| | | | | **¶66** "Petters appealed, challenging his conviction and his sentence. On…" (22 words, 8.8 s, 2 shots) | | | |
| 271 | 20:09.6 | 4.4 | PD | First page of the 8th Circuit opinion, U.S. v. Petters, No. 10-1843 | Slow push down the caption | 8th Cir. · 9 DECEMBER 2011 | Paper slide |
| 272 | 20:14.0 | 4.4 | PD | Same opinion | Highlight "We affirm." | CONVICTION AND SENTENCE UPHELD | Highlighter, low hit |
| | | | | **¶67** "In September 2010, the government said he was being…" (17 words, 6.8 s, 2 shots) | | | |
| 273 | 20:18.4 | 3.4 | ARCH | Licensed exterior still of the Leavenworth facility from a public vantage, or MG text card | Slow push | FEDERAL PENITENTIARY, LEAVENWORTH, KANSAS · As of Sept 2010 (DOJ) | Wind |
| 274 | 20:21.8 | 3.4 | PD | DOJ release, 2 Sept 2010 | Highlight "presently incarcerated in the federal penitentiary in Leavenworth, Kansas" | (the line) | Highlighter |
| | | | | **¶68** "And the money? PCI's bankruptcy case, in the federal…" (46 words, 18.4 s, 4 shots) | | | |
| 275 | 20:25.2 | 4.6 | **[RECREATION]** | R28: a bankruptcy courtroom, wide from the rear: rows of lawyers seen from behind, generic people | Slow push | "Recreation" · AND THE MONEY? | Room murmur |
| 276 | 20:29.8 | 4.6 | PD | Case caption as clean text on near-black (no defendants' names) | Types | In re Petters Company, Inc. (Bankr. D. Minn.) | Typewriter |
| 277 | 20:34.4 | 4.6 | MG | Year counter under the caption | 2008 → 2020, slowing at the end | STILL IN COURT IN 2019 AND 2020 | Ratchet |
| 278 | 20:39.0 | 4.6 | MG | Arrows reverse on the old outflow diagram, pulled back toward the estate; no names, no figures | Arrows reverse | THE TRUSTEE: SUING TO RECOVER MONEY PAID OUT BEFORE THE COLLAPSE | Ink flow, reversed |
| | | | | **¶69** "The famous companies were caught up in the collapse…" (34 words, 13.6 s, 3 shots) | | | |
| 279 | 20:43.6 | 4.5 | MG | Org chart from Expansion: Petters Group Worldwide branch lights, the rest dim | Branch lights | PETTERS GROUP WORLDWIDE | Low tone |
| 280 | 20:48.1 | 4.5 | ARCH | Licensed Polaroid brand footage, slowed 50%, colour drained | Slowed | POLAROID | Music only |
| 281 | 20:52.7 | 4.5 | PD | Case caption on near-black | Types | In re Polaroid Corporation (Bankr. D. Minn.) · petitions filed 18 Dec 2008 | Typewriter, low hit |
| | | | | **¶70** "It is worth going back to the government's own…" (41 words, 16.4 s, 4 shots) | | | |
| 282 | 20:57.2 | 4.1 | MG | Four document types return, stacked | Stack drops in | PURCHASE ORDERS · INVOICES · BANK RECORDS · FINANCIAL STATEMENTS | Paper drops |
| 283 | 21:01.3 | 4.1 | **[RECREATION]** | R06b: hands only, squaring a stack of printed forms on a desk edge, lamp | Close | "Recreation" | Paper tap |
| 284 | 21:05.4 | 4.1 | MG | The stack collapses into one blank sheet | Collapse | (none) | Paper whoosh |
| 285 | 21:09.5 | 4.1 | MG | **RE-HOOK.** Text on the blank sheet | Types | THE PAPERWORK WAS THE PRODUCT | Typewriter, sub hit |
| | | | | **¶71** "That leaves a question the people who lost money…" (80 words, 32.0 s, 7 shots) | | | |
| 286 | 21:13.6 | 4.6 | MG | Text | Types | HOW DID IT LAST SO LONG? | Typewriter |
| 287 | 21:18.2 | 4.6 | **[RECREATION]** | R26: a lender's office at night, wide: a figure from behind reads a bound financial statement (unreadable) under a lamp | Slow push | "Recreation" · THE PEOPLE DECEIVED | Page turn, clock |
| 288 | 21:22.7 | 4.6 | MG | Lines connect matching amounts | Lines draw | AMOUNTS | Ruler click |
| 289 | 21:27.3 | 4.6 | MG | Lines connect matching dates | Lines draw | DATES | Ruler click |
| 290 | 21:31.9 | 4.6 | MG | Lines connect matching names | Lines draw | NAMES | Ruler click |
| 291 | 21:36.5 | 4.6 | MG | Text card | Types | The records name no one outside the scheme who knew. | Typewriter |
| 292 | 21:41.0 | 4.6 | MG | Every line matches; the crooked equals straightens, then tilts back | Bar straightens, tilts | EVERY DOCUMENT MATCHED | Low tone resolves, then detunes |
| | | | | **¶72** "And it didn't end with an audit, or a…" (41 words, 16.4 s, 4 shots) | | | |
| 293 | 21:45.6 | 4.1 | MG | Text | Types | NOT AN AUDIT · NOT AN OUTSIDE WHISTLE | Typewriter |
| 294 | 21:49.7 | 4.1 | **[RECREATION]** | R02b: the government corridor, two figures from behind walk toward a door; the door opens to bright light | Static | "Recreation" | Footsteps, door |
| 295 | 21:53.8 | 4.1 | AI-ILL | A05b: the same office corridor, now every light on | Lights click on in sequence | "Illustration" | Switch clicks |
| 296 | 21:57.9 | 4.1 | MG | Ledger wall pulls back: every card from the episode in one frame | Pull-back | (cards) | Drone resolves |
| | | | | **¶73** "She was not the first. In March 1973, in…" (85 words, 34.0 s, 8 shots) | | | |
| 297 | 22:02.0 | 4.2 | MG | Text | Types | SHE WAS NOT THE FIRST | Typewriter |
| 298 | 22:06.3 | 4.2 | MG | Calendar card | Flip back through years | MARCH 1973 | Pages riffle |
| 299 | 22:10.5 | 4.2 | ARCH | Licensed 1970s stock-exchange footage | Natural | (none) | Period floor ambience (licensed) |
| 300 | 22:14.8 | 4.2 | **[RECREATION]** | R24: a 1970s office, wide; one man from behind hands a folder to another silhouetted against a window | Slow push | "Recreation" | Period phone ring far off |
| 301 | 22:19.0 | 4.2 | ARCH | Licensed ticker-strip footage | Natural | (none) | Ticker clatter |
| 302 | 22:23.3 | 4.2 | MG | A plain balance-sheet bar labelled ASSETS inflates, then turns hollow | Bar grows, then empties | "vastly overstated" · Dirks v. SEC, U.S. Supreme Court, 1983 · "Illustration" | Soft ticks, low hit |
| 303 | 22:27.5 | 4.2 | MG | **RE-HOOK.** Crooked equals: two blank cards either side | Bar tilts | THE FRAUD · THE ONE IN TROUBLE | Low hit |
| 304 | 22:31.8 | 4.2 | MG | Episode 2 hand-off frame | Equals mark animates | NEXT: (episode 2 title) | Music sting |
| 305 | 22:36.0 | 20.0 | MG | **INSERT.** End screen: episode 2 video element + subscribe element on ledger paper, crooked-equals mark | Static | (YouTube end-screen elements) | Music bed out |

---

## 3. Retention beats

### 3.1 The first 30 seconds, frame by frame

Narration starts on frame 1 (no logo, no black lead-in). Word times are at 150 words a minute.

| Time | Picture | Narration under it | Interrupt |
|---|---|---|---|
| 0:00.0 | Extreme macro of the real DOJ release; the yellow highlighter is already mid-stroke over the word **fake**. Credit in small type. | "In September 2008…" | Opens on motion and the story's key word |
| 0:03.5 | The crooked bar snaps diagonally across the frame. | "…a businessman in Minnesota…" | Bar snap + paper snap |
| 0:03.7 | **[RECREATION]** R01: two shadows on frosted glass in a dim office; "MINNESOTA · SEPTEMBER 2008" types on; "Recreation: setting not known". | "…was talking with someone who had worked for him for fifteen years." | Cut 1: document → people |
| 0:07.5 | Black; one yellow dot pulses; **RECORDED** types beside it. **The hook is on screen by 7.5 s: a secret recording and a "fake".** | "He did not know the conversation was being recorded." | Cut 2: people → graphic |
| 0:10.4 | On "recorded", the drone cuts to silence for half a second. | (end of line) | Sound drop |
| 0:11.2 | The full DOJ release slides up and settles; lower third "U.S. Attorney, District of Minnesota · 8 April 2010". | "According to the Department of Justice…" | Cut 3; paper slide |
| 0:15.5 | Push-in; highlighter runs "Within the first few hours of Coleman's recorded conversations". | "…within the first few hours of those recordings, he was heard admitting…" | Cut 4; highlighter |
| 0:19.7 | Highlight lands on **"fake"** (full yellow) at about 0:20.8, with a sub hit. | "…that purchase orders were 'fake'. And he offered an explanation…" | Cut 5; sub hit |
| 0:24.0 | **[RECREATION]** R04: hands slip a small recorder into a jacket pocket. | "…for why nobody had caught on. The only explanation, he said…" | Cut 6: back to people |
| 0:28.3 | Highlight "'divine intervention' was the only explanation" (about 0:29.2). | "…was 'divine intervention'." | Cut 7; highlight |

Cuts land every 3.7 to 4.3 seconds, with an extra beat inside each shot (bar snap, silence, sub hit). At 0:32.5 the
"could of got away with this for so long" quote is lifted onto black, then "≈ 14 YEARS" (0:36.8) and the $3.7 billion
odometer (0:40.5) close the cold open.

### 3.2 A visual open loop at every section end

| Time | Section ends | Open loop on screen | Paid off at |
|---|---|---|---|
| 0:48 | Cold open | The yellow recording dot alone: **WHO WAS HOLDING THE RECORDER?** | The insider card (2:04), named at 3:03, fully at 13:08 |
| 2:13 to 2:23 | Central mystery | A blank "INSIDER" card on the ledger wall, then the title card | Coleman's name types into that same card (3:03) |
| 6:02 | Origins | A purchase order and an empty frame: **PAPER WASN'T ENOUGH** | Bank statements and White (6:05 onward) |
| 11:12 | Expansion | The new-investor arrow stutters and stops: **THEN THE NEW MONEY SLOWED** | End of 2007, Lancelot (11:15) |
| 15:18 | Turning point | Dawn through blinds: **THE MORNING OF THE SEARCH** | 24 Sept 2008 (15:21) |
| 18:36 | Exposure | Two unlabelled bars, one long and one tiny: **THE BOSS. THE INSIDER.** | 50 years against a year and a day (20:04) |
| 22:27 | Consequences | The crooked equals between two blank cards: **THE FRAUD · THE ONE IN TROUBLE**, then the episode 2 end screen | Episode 2 |

### 3.3 Re-hooks every 2 to 3 minutes

13 re-hook beats; the longest gap between them is 2:13. Each is a fact that turns the story, shown big and with a sound
change, never a "but wait".

| Time | Re-hook |
|---|---|
| 2:18 | Title card with the mark building (after the insider question) |
| 4:28 | "Goods exist": the tick erases itself (the pitch's one false part) |
| 6:05 | 1999: the purchase order cracks along its crease (paper wasn't enough) |
| 8:00 | The full loop pulls back: every arrow runs PCI to PCI |
| 10:09 | "HE BOUGHT FAMOUS COMPANIES" on black, sub hit |
| 12:12 | 80-plus round trips blur into a solid line |
| 13:08 | 8 September 2008: the insider walks in |
| 15:21 | 24 September 2008: the search |
| 17:13 | The last two "PLEADED GUILTY" stamps: everyone but Petters |
| 18:44 | The 50-year odometer |
| 20:04 | The two sentences drawn to scale |
| 21:10 | "THE PAPERWORK WAS THE PRODUCT" |
| 22:28 | The episode 2 question |

### 3.4 Drop-off risks in the script, and fixes

1. **The hook line comes at 7.6 to 10.4 seconds.** The first spoken sentence takes 7.6 s before "recorded" is said.
   Fix in the edit: open on the highlighted "fake" and show the recording visually by 7.5 s (done above). Suggested
   script tweak for the writer (not made here): "In September 2008, a Minnesota businessman was being secretly
   recorded by someone who had worked for him for fifteen years." That puts "recorded" at about 5 s.
2. **Ninety seconds of set-up before the title (0:51 to 2:18).** Fix: shots under 4.6 s, two recreations, the loop
   diagram building and breaking (the hollow "goods" node at 1:18 is the first payoff), and the two questions as
   big headers so viewers know what they will get.
3. **Origins is 3:40 of explanation, including a 30-second purchase-order lesson and a 27-second pitch.** Fix: the
   purchase-order form lights field by field (a new element every 4.3 s), a recreation lands in the middle of it
   (R09b), and the section's payoff (the third tick erasing at 4:28) is a re-hook. Writer's option: trim the
   purchase-order paragraph by about 25 words.
4. **Name and acronym overload in Expansion** (White, Reynolds, NIR, Catain, EFBC, then Bell and Lancelot). Fix: every
   person gets a ledger-wall card the moment they're named, acronyms appear spelled out on the card, the wall pulls
   back at each section end, and each person's card returns, not just their name, when they recur (pleas, trial).
5. **Three big numbers that are easy to mix up** ($3.7 billion scheme, $12 billion and $35 billion gross flows). Fix:
   the $3.7 billion figure has its own look (centred, paper white, odometer); the flows are always yellow bars or
   arrows with "Gross flow, not losses" locked on screen; they never share a frame.
6. **Long runs of motion graphics in Expansion and Turning point** (up to 8 graphics in a row, about 35 s). Fix: the
   graphics change kind inside a run (diagram, ledger wall, counter, quote card) and a recreation breaks every run
   before 45 s; no two document highlights from the same page sit back to back for more than two shots.
7. **The legal definitions right after the verdict (18:12 to 18:36).** The climax is followed by 24 seconds of
   explanation. Fix: fast checklist definitions, a recreation of the wire slip, and the "THE BOSS. THE INSIDER." open
   loop straight after. Writer's option: cut it to one sentence.
8. **Quote after quote in Consequences** (sentence, the judge, the U.S. Attorney, the FBI, Coleman's sentence: five
   statements in about 80 seconds). Fix: alternate each highlighted line with a recreation (sentencing courtroom,
   the judge's bench, Coleman's sentencing) or an isolated quote card; the two-bar comparison is the payoff.
9. **The wrap-up at 21:00 to 22:00** (summary, then "how did it last so long?"): viewers sense the end and leave.
   Fix: "THE PAPERWORK WAS THE PRODUCT" as a re-hook, the matching-lines graphic (the second and last time the
   equals sign balances), the corridor with every light on, and the 1973 calendar flipping back as the teaser starts.
   Put the end screen's episode 2 element over the last 20 s, and publish episode 2 within 7 to 10 days
   (`market.md` section 3).
10. **Viewers may expect to hear the tapes.** They never will (no audio exists in the record read). Fix: the yellow
    recording dot stands for the tapes every time, so the motif pays off without implying audio.

---

## 4. Higgsfield prompt list

**How to make them.** Stills with GPT Image 2.6 (about 0.25 credits each) at 16:9. Animate the key shots with Kling
3.0 image-to-video, 5 s, from the approved still (about 10 credits); the rest become motion in Resolve (slow push-in
or a two-layer parallax from the still). Generate three tries per still and keep the best. Log every output in the
licence record (tool, model, prompt, job id, date).

**Add this to the end of every prompt (house style):**
> Cinematic documentary still, 35mm film grain, low-key lighting, colour limited to near-black #1C1D20 shadows, warm
> paper-white #F4F2EA highlights and a single ledger-yellow #EDE04A practical light, desaturated, shallow depth of
> field, 16:9. No readable text, no logos, no badges, seals or insignia, no weapons, no handcuffs.

**And this to every prompt with people:**
> No visible faces: people are seen from behind, in silhouette, as shadows or out of focus; no recognisable person;
> mouths never visible; no one speaking.

Rough budget: about 45 stills × 3 tries × 0.25 ≈ 35 credits; 15 recreation videos × 2 tries × 10 ≈ 300 credits;
atmosphere videos only for A01, A05, A05b and A06 (≈ 80 credits; the rest move as stills in Resolve). About 415
credits in all: half the Plus balance (834.58 on 17 Nov 2026), leaving room for narration (about 130).

### 4.1 Atmosphere (no people, labelled "Illustration"), 12

| ID | Used at | Image prompt | Video prompt (Kling 3.0, 5 s) |
|---|---|---|---|
| A01 | 0:51 | A Midwestern American downtown skyline at dusk seen across a frozen river, light snow haze, office windows mostly dark, one warm yellow window, no signage. | Very slow lateral drift right, snow haze moving slightly. |
| A01b | 19:12 | The same skyline at first light, pale sky, river mist, no signage. | Very slow drift left, mist moving. |
| A02 | 3:17 | A desk lamp pooling warm yellow light over a stack of blank paper forms on a dark wooden desk at night, the rest of the office in darkness. | Slow push-in toward the lamp pool; dust motes drift. |
| A03 | 9:39 | An empty, unbranded loading bay at night, one sodium light, bare concrete, an empty pallet, no trucks, no goods. | Static; light flickers once. |
| A04 | 12:51 | Rain on an office window at night, blurred city lights beyond, a dark desk edge in the foreground. | Static; rain runs down the glass. |
| A05 | 13:00 | An office corridor at dusk, closed doors on both sides, most rooms dark, one door ajar with a strip of light, carpet, ceiling panel lights. | Static; one ceiling light switches off. |
| A05b | 21:54 | The same corridor with every ceiling light on, doors open, empty. | Static; the lights switch on one after another toward the camera. |
| A06 | 15:18 | Dawn light through horizontal window blinds falling across an empty office desk with a closed binder. | Light bars move slowly across the desk. |
| A07 | backplate | Macro of blank ledger paper, faint pale ruled lines and columns, no numbers or words, soft paper texture. | none (still) |
| A08 | backplate | A near-black matte desk surface with faint wood grain, soft top light, empty, for placing document pages. | none (still) |
| A09 | ledger wall | A large blank ledger sheet pinned to a dark wall with strips of yellow tape, raking side light, no writing. | none (still; move it in Resolve) |
| A10 | bumpers, thumbnail | Macro of a ledger-yellow highlighter lying diagonally on blank ruled paper, cap off, one short yellow stroke on the paper. | none (still) |

### 4.2 Recreations with characters ([RECREATION], labelled "Recreation"), 29 set-ups

Each set-up is one image prompt; the letters (b, c) are the same set-up from another angle or moment, made by adding the
change shown. ★ marks the key shots with a video prompt.

| ID | Documented moment (source) | Image prompt | Video prompt (Kling 3.0, 5 s) |
|---|---|---|---|
| R01 ★ | The recorded conversations, Sept 2008 (S1); setting not known | A dim modern office in 2008 seen through a frosted-glass partition: two human shadows on the glass, one seated, one standing near a desk lamp; in the foreground the soft shoulder of a jacket. **b:** a wider angle, one shadow now stands. | The shadows shift slightly, as people do while sitting and listening; no gestures of speech; the camera pushes in 4%. |
| R02 ★ | Coleman and her attorney report to authorities, 8 Sept 2008 (S1, S2) | A plain government-building corridor, pale walls, linoleum floor; two people seen from behind walking away toward a closed door, one carrying a briefcase. **b:** the door opens onto bright light. **c:** one person alone walks toward a bright doorway. | The two figures walk away from camera toward the door at a steady pace; camera follows slowly. |
| R03 ★ | The meeting with the authorities (S1, S2) | A plain meeting room, wide shot, two people on one side of a table backlit by a large window so they are silhouettes, two others with their backs to camera; a closed folder in the middle of the table. (Later version: the folder open, pages blurred.) | Slow push-in toward the folder; the silhouettes stay still. |
| R04 | She wore a recording device (S1) | Close-up of hands only slipping a small generic black digital voice recorder into the inside pocket of a dark jacket, dim office light. | none |
| R04b ★ | The recording device (S1) | Close-up of a small generic digital voice recorder on a desk beside a closed day planner; a fingertip presses its side switch; a tiny yellow light. | The fingertip presses the switch; the yellow light comes on and stays; nothing else moves. |
| R05 | Coleman hired as office manager, 1993 (S1) | A small early-1990s office, beige computer and fax machine, wood-veneer desk; a woman seen from behind walks in carrying a coat and a cardboard box. | none |
| R06 | Coleman fabricating purchase orders (S1, S2) | Close-up of hands at an early-2000s office computer keyboard; on the beige monitor a form, blurred beyond reading; printed forms stacked beside the keyboard. **b:** hands squaring a stack of printed forms on the desk edge under a lamp. | none |
| R07 | White preparing false bank statements, 1999 (S1) | Top-down view of hands laying printed pages in a neat row on a dark desk at night; the pages are blurred, no readable text or numbers. | none |
| R08 ★ | Petters often signed promissory notes and personal guarantees (S1) | Close-up of a hand signing a blank, unreadable document with a fountain pen under a desk lamp; dark cuff; nothing else in focus. | The pen moves across the line in one signature stroke; the camera pushes in slightly. |
| R09 | Investors shown the paperwork (S1) | A lender's office, wide: a person seen from behind turns the pages of a thick binder; across the desk a second person, out of focus. **b:** the person from behind holds a single page up to window light, reading. | none |
| R10 | Money wired through Reynolds's NIR accounts (S1) | Close-up at a bank counter, 2001: a hand slides a wire-transfer slip, blurred and unreadable, across the counter. **b:** a clerk's hands stamp the slip and file it. | none |
| R11 | Catain opened a business bank account, 2002 (S1) | A bank branch interior in 2002, wide: a person seen from behind sits at a banker's desk; the banker out of focus; other customers soft in the background. | none |
| R12 ★ | EFBC's headquarters above Catain's car wash (S1); not the actual building | A small generic car wash at night, wet asphalt, one lit upstairs window with a blind drawn and a silhouette behind it, no signage. | Very slow push-in toward the lit window; light rain. |
| R13 | Checks that bounced (S1) | Close-up of hands at a kitchen table holding an opened envelope and a check, both unreadable; a lamp out of focus. | none |
| R14 | Replacement purchase orders, Feb 2008 (S1) | Top-down view of a table: two pairs of hands, one slides a stack of papers across, the other slides a stack back; papers blurred, no text. | none |
| R15 | The round trips and the outgoing wires (S1) | Close-up of hands on a keyboard; a bank wire screen on a monitor, blurred beyond reading; a finger on the Enter key. (Variants b, c: other moments of the same.) | The finger presses Enter twice, a beat apart; the screen glow flickers. |
| R16 ★ | The search, 24 Sept 2008 (S1); not the actual building | Morning, an office building exterior, wide: people in plain dark windbreakers with no lettering carry cardboard archive boxes to unmarked dark vans; everyone too small for faces to read. | People cross the frame carrying boxes; the camera drifts slowly sideways. |
| R17 | The search: documents recovered (S1) | An office interior, people seen from behind lift files from open filing-cabinet drawers into cardboard boxes. **b:** close-up of hands, a single document on a table, unreadable, one hand pointing at its header. | none |
| R18 ★ | Coleman's guilty plea, 8 Oct 2008 (S2) | A wood-panelled federal courtroom seen from the rear of the public gallery: a woman stands at a lectern beside a lawyer, both from behind; the judge's bench far off and out of focus. | Static; the woman's posture settles; nothing else moves. |
| R19 ★ | The trial, fall 2009 (S1, S4) | A courtroom wide from the rear: the jury box seen from behind, a witness at the stand silhouetted against a tall window. | Slow push-in toward the witness stand. |
| R20 | Petters testifying (S1) | A man in a dark suit at a witness stand seen from behind and to one side, out of focus, against window light. | none |
| R21 | The verdict, 2 Dec 2009 (S1) | A courtroom from the rear: jurors in the jury box standing, seen from behind and in shadow. | none |
| R22 ★ | The sentencing, 8 Apr 2010, St. Paul (S1); not the actual courtroom | A federal courtroom from the rear of the gallery: the judge's bench under a single lamp, the judge a silhouette; a man in a suit from behind at the defence table. **b:** tighter on the bench, the judge's silhouette only. | Very slow push-in down the aisle toward the bench. |
| R23 | Coleman's sentencing, 2 Sept 2010 (S2) | The same courtroom from a different rear angle: a woman stands beside a lawyer, both from behind; soft afternoon light. | none |
| R24 ★ | Episode 2: a former officer takes the information to an analyst, March 1973 (S9) | A 1970s office, wood panelling, a desk with a typewriter and a rotary phone: one man seen from behind hands a folder to another man silhouetted against a window. | The folder passes from one hand to the other; the camera pushes in slightly. |
| R25 | Lancelot held hundreds of millions in notes (S1) | An investment office at night, wide: a person seen from behind at a desk squares a thick stack of papers; city lights beyond the window. | none |
| R26 | Investors received false financial statements (S1) | A lender's office at night: a person seen from behind reads a bound report, unreadable, under a desk lamp. **b:** the same person reads the business pages of a newspaper, unreadable. | none |
| R27 | Fabricated purchase orders (S1, S2) | Close-up of hands feeding blank paper into a 1990s office laser printer; printed sheets, unreadable, sliding out. | Sheets slide out of the printer one after another. |
| R28 ★ | The trustee's suits in PCI's bankruptcy case (court records) | A bankruptcy courtroom seen from the rear: rows of lawyers from behind, papers on the tables, soft daylight. | Slow push-in over the rows. |
| R29 ★ | Arrested and detained, 3 Oct 2008 (S1) | A federal building corridor, wide: two people in plain dark suits walk on either side of a third, all seen from behind and small in frame; no restraints visible. | The three walk away from camera; a door at the end opens. |

Fifteen set-ups have a video prompt: the thirteen key shots (★) plus two short loops (R15, R27). Make the rest as
stills and move them in Resolve.

---

## 5. Thumbnails

All three are built from the channel's system: near-black ground, ledger paper, JetBrains Mono 800, one yellow idea.
No face of anyone (no AI likeness; a licensed news photo of Petters is a later A/B variant only), no agency seals, no
blood, weapons, handcuffs or profanity, no real document (the forms are the channel's own illustration), text at most
four words.

**A. "The stamp"** (the script's own concept, in the channel's colours)
- Layout: a purchase-order form (the channel's fictional "Example Retailer Inc." form, fields blurred) fills the right
  60% of the frame at an 8° tilt, lit by a warm lamp from the left (A02 lighting) on a near-black desk. Across it a
  rubber-stamp mark **FAKE** in ledger yellow, slightly uneven ink. Top left, huge paper-white mono 800:
  **$3.7B**. The crooked equals mark small in the bottom-left corner.
- Text: **$3.7B · FAKE** (2 words).
- Why: market.md's winners use one number plus one short word in heavy type on a dark ground with one warm accent.

**B. "She wore a wire"**
- Layout: a graphic silhouette (clearly stylised, not photoreal) of a woman seen from behind at the end of a dark
  corridor (R02 look), a small yellow light glowing at her jacket pocket; the corridor's lines lead to her. Right
  third: text in two lines, paper white, with **WIRE** in yellow.
- Text: **SHE WORE A WIRE** (4 words).
- Why: character plus contradiction, the pattern behind "How One Woman Ignored Her Boss and Brought Down an $11B Fraud"
  in market.md. It promises the insider story the cold open delivers.

**C. "The equation"**
- Layout: ledger paper filling the frame; one huge crooked equals sign in the centre (white top bar, yellow bottom bar
  tilted); left of it **$35B**, right of it **$0**, both mono 800; under the $0, small: "from retailers".
- Text: **$35B ≠ $0 FROM RETAILERS** reads as 4 words ("$35B", "$0", "FROM", "RETAILERS").
- Why: the impossible fact in plain figures (market.md pattern 2), and the channel's mark doing the work.
  Accuracy note: $35 billion is money wired into the account, not losses; the title carries the scheme's $3.7 billion,
  so test C only after A and B, and keep "from retailers" readable at phone size.

Test A against B first (YouTube's thumbnail test), then the winner against C.

---

## 6. Counts and checks

| Check | Result |
|---|---|
| Shots | **304** plus the 20-s end screen (305 rows) |
| Average shot length | **4.46 s** (shortest 3.0 s, longest 5.7 s; every shot 3 to 6 s) |
| Narration | 73 paragraphs, 1336 s at 150 words a minute; with inserts 22:36, plus the end screen 22:56 |
| Source mix | motion graphics 177 (including 7 inserts and the end screen) · public-domain records 53 · recreations 51 · licensed archival 14 · AI atmosphere 8 · maps 2 |
| Recreations | 51 shots from 29 set-ups; first at 0:03.7; longest gap between two **43.7 s** |
| Re-hooks | 13; longest gap 2:13 |
| Open loops | one at the end of every section (7) |
| Faces | none readable for any real person; one licensed news photo of Petters (Origins) |
| AI images of real documents or people | none; every form in a graphic is the channel's illustration, labelled |
| Seals, logos, weapons, handcuffs, blood | none |
| Labels | "Recreation" on every [RECREATION] shot for its full length; "Illustration" on AI atmosphere and illustrative graphics |
| Disclosure | Upload with AI use: Yes |
| Licence record | Every ARCH item, every music and SFX file and every AI output goes in the per-video licence record (`plan/production-tools.md` section 2) before upload |

Re-timing: if the script changes, each paragraph's time is its spoken words ÷ 2.5 seconds; keep shots between 3 and
6 seconds and a recreation at least every 45 seconds.
