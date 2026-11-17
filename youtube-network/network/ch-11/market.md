# Until Someone Talked: market research

Data: `ytscout.mjs`, run 17 Nov 2026. Raw files in this folder:

- `scout-year.json` and `scout-month.json`: 12 niche queries x 2 periods (this year / this month), top 20 by views each:
  gang documentary, drug kingpin documentary, heist documentary, organized crime documentary, mafia informant
  documentary, biker gang documentary, prison gang documentary, drug empire rise and fall, robbery crew documentary,
  informant snitch documentary, cartel documentary, street gang history. ("drug empire rise and fall" (year) and
  "cartel documentary" (month) came back empty from YouTube, "informant snitch documentary" (month) returned only 3;
  the other 21 query-periods returned 20 videos each.)
- `scout-cases.json`: "<case> documentary" for the 30 candidate cases (this year).
- `scout-extra.json`: 9 follow-up queries for multipart series and two cases that came back empty.

Outlier ratio = views / uploader's subscribers. Two thumbnail sheets were reviewed (top 20 outliers of the year
queries, and top 20 outliers of the case queries). 358 unique videos in the two niche files.

Caveat on the tool: YouTube's search only filters by "this year" or "this month", so the coverage check sees what was
uploaded in the last 12 months, not older classics (an older 2M-view video on a case would not show). Where I know
of a major TV or streaming documentary on a case, cases.md says so separately.

## 1. Who dominates, and how

| Channel | Subs | Style | Length | Best this year |
|---|---|---|---|---|
| fern | 5.7M | Animated 3D investigative essays, narrator, no faces, global crime | 22-51 min | "Why El Mencho Was So Hard to Catch" 9.4M (1.66x) |
| Blackfiles | 465K | Faceless narrated docs, archive + stock, Mafia/heists | 25-28 min | "The Most Genius Bank Heist EVER" 2.38M (5.1x) |
| Lume | 359K | Faceless heist storytelling, AI-styled imagery, "He outsmarted..." titles | 20-25 min | "He Outsmarted Europe's Best Bank Engineers and Stole $10 Million Using a $5 Tool" 4.5M (12.6x) |
| FBI Investigates | 79.9K | Repackaged TV-style FBI case files, "FBI takes down X" | 44-52 min | "The True Story Of 'The Town': FBI Takes Down Boston's Most Dangerous Bank Robbers" 2.08M (26.1x) |
| FBI Uncovered / World's Greatest Heists / Daring Heists | 0.7K-14.7K | Same 44-50 min TV case-file format, many look like re-uploads | 44-50 min | "How the FBI Trapped Crazy Charlie at the Walt Whitman Rest Stop" 157K on a 732-sub channel (215x) |
| Hood Archives | 89.9K | Faceless narrated street-kingpin bios, long descriptive titles naming the betrayal | 16-32 min | "Albert 'Big' Ross ... Got Buried by His Own" 258K; "His Best Friend Slept With His Woman, So He Destroyed 109 People From Prison: Kingpin Nicky Barnes" 189K |
| Zero Reports | 66.3K | Cartel and trafficking sagas, often in linked parts | 33-73 min | "The Chicago Twins Who Built a Cartel Empire" 962K in 14 days (14.5x) |
| On the other side of the law | 72.2K | Prison/biker gang "[Documentary Series]" | 26-56 min | "THE DEADLIEST PRISON GANG - Aryan Brotherhood" 543K (7.5x) |
| Concrete Kingdoms | 19.1K | Mafia "the real story behind the film" | 31-40 min | "Every Real Goodfellas Character — Where They Ended Up" 526K (27.5x) |
| Toms Biker Chronicles | 14.7K | Outlaw motorcycle club news-docs | 26-36 min | "The Hells Angels' Richest Boss Just Lost Everything — The Fall of Necati Arabaci" 336K (22.9x) |
| Jack Mercer | 1.55K | UK gang "Brutal Rise and Fall of..." | 36-38 min | "...South London's MOST FEARED Gang Territory: Elephant and Castle" 43K (27.8x) |
| Street Files | 38.2K | Mafia/Goodfellas short docs | 17-21 min | "Tommy Was Executed. Jimmy and Henry Weren't. Why?" 987K |

Also big but not copyable: TV networks' full episodes (National Geographic "Mob Betrayals from New York to Chicago"
1.53M; HISTORY "American Godfathers" 2.8M; DW "Europe's drug mafia" 2 parts; ABC "Cartel Paradise" 2 parts) and
on-camera street-interview channels (Tommy G, Soft White Underbelly, The Taboo Room), which a faceless channel can't be.

What the field looks like: many small channels push the same Goodfellas, Frank Lucas, BMF, El Chapo and Flores-twins
stories; much of the 44-50 minute "FBI" content looks like recycled TV episodes, and a lot of the thumbnails are
AI art. Almost nobody cites court records on screen.

## 2. Patterns, with real titles and numbers

1. **The betrayal is the hook, named in the title.** "The Twins Who Sold Out El Chapo" (388K in 11 days);
   "His Best Friend Snitched On Him, So He Destroyed 300 People: Kingpin Rayful Edmond" (107K);
   "Angelo Ruggiero's Big Mouth Made John Gotti Boss — Then Gotti Left Him to Die" (16K on a 1.3K channel, 12x);
   "Gangster Slept With Nicky Barnes Girlfriend - So He Snitched 109 Names" (19K). This channel's name is that pattern.
2. **The film tie-in: "the real story behind ___".** "The True Story Of 'The Town'" 2.08M (26x); "Every Real Goodfellas
   Character" 526K (27.5x); "Paul Vario: The Mafia Capo Goodfellas Never Got Right" 242K (12.7x); "The Chambers Brothers:
   The brothers who inspired New Jack City" 76K on 4.2K subs. The **MGM+ series "The Westies" (2026)** trailer has
   9.0M views: demand for the real Westies story is rising now, and the existing YouTube versions are thin (best 631K,
   24 min, uncited).
3. **"How the FBI caught/trapped..." investigation-first framing** wins in heists: "How the FBI Trapped Crazy Charlie"
   (215x), "Hunting Anthony Shea: Hudson Armored Car Murders and the FBI Trap" (54x), "Inside the FBI's Hunt for
   Boston's Most Notorious Armored Car Robbers" (14x).
4. **A specific number or object in the title:** "$5 Tool" (4.5M), "$18.9 Million Using His Own Keys" (59K-322K across
   five Dunbar videos), "15-Minute Boston Robbery", "3,500 FBI Tapes".
5. **Rise and fall / "lost everything":** "The Hells Angels' Richest Boss Just Lost Everything" (336K, 23x); "The Rise
   and Fall Of Mr. Flashy" (337K on 1.7K subs, 196x); "The Rise and Fall of Britain's Richest Drug Lord: Curtis Warren"
   (87K on 176 subs, 494x).
6. **Lists still pull for tiny channels** ("10 Mafia Members Who Disappeared and Were Never Found" 377K on 2.6K subs,
   143x) but they are the "generic true crime" the brief rules out.
7. **Current news + history**: biker and cartel stories surge when there's a fresh verdict (Arabaci "Just Lost
   Everything" then "JUST Got 15 Years"). A case with a live development (parole, appeal, new series) gets a lift.

## 3. Multipart series: real pairs

| Series | Part 1 | Part 2 (and on) | Part 2 as % of part 1 |
|---|---|---|---|
| Zero Reports, Flores twins | "The Chicago Twins Who Built a Cartel Empire" 964K (14 d, 33 min) | "The Twins Who Sold Out El Chapo" 389K (11 d, 45 min) | 40% (3 days younger) |
| Zero Reports, Tijuana vs Sinaloa | "Open War" 985K (330 d) | "The Hunt Is On" 996K (330 d) | ~100% |
| On the other side of the law, Aryan Brotherhood "[Documentary Series]" | "The Origins..." 294K (30 d, 26 min) | "How They Conquered the U.S." 300K (28 d, 41 min); "Tentacles" 115K (14 d) | 102% (part 3 younger) |
| DW Documentary, "Europe's drug mafia (1/2), (2/2)" | 649K | 970K | 150% |
| ABC News In-depth, "Cartel Paradise" Part 1 / Part 2 | 2.73M | 397K | 15% |
| Toms Biker Chronicles, Arabaci (story + follow-up) | 336K | "JUST Got 15 Years" 141K | 42% |
| Outlaw Archive, "Hells Angels Frisco 1970" Part 1 / 2 | 152K | 152K | 100% |
| Mark Vicente (non-crime control) Part 1 / 2 | 293K | 86K | 29% |

Reading: when each part has its own title promise (Aryan Brotherhood "Origins" vs "How They Conquered"; Zero Reports
"Open War" vs "The Hunt Is On"; DW's part 2 with its own angle), part 2 holds 100% or more. When part 2 is labelled
only "Part 2" or is a follow-up to a news peg, it keeps 15-42%. So: series parts must be titled as standalone films
with a part number in the playlist and description, not "Part 2" in the title.

## 4. Thumbnails (two sheets reviewed)

What the outliers share:
- **One or two real faces, large**, usually a mugshot or press photo, often split-screen (boss vs. the one who talked:
  El Chapo with the Flores twins, "EL PRECIO DE LA TRAICIÓN"; "Real Goodfellas" four faces in a row).
- **Two to four words**, heavy condensed type, white/yellow with a red accent ("DARK WEB KING", "HE GOT THEM ALL",
  "NUESTRA FAMILIA", "600 GANGS, ONE CITY").
- **Mugshot grids** for crew stories (ADX "Demons", Gun Trace Task Force line-up of five officers).
- **A concrete object**: armored truck, vault, money bags; one red arrow or circle.
- **Archival "evidence" look** (FBI Investigates' perp-walk photo; "REC 1997/09/12" CCTV frame) reads as factual.
- Weaknesses to avoid and to beat: AI-rendered gangsters and 3D mannequins (Lume, Folio, Dragales) look generic and
  increasingly samey; several Spanish/Hindi re-dubs reuse the same art.

For this channel: real archival photo or court-exhibit look, the face of the one who talked set against the crew, a
two-to-three-word line, the channel's own palette (design/ch-11.json), no blood, no guns pointed at camera, no
invented "AI mugshots".

## 5. Length band

Median outlier ratio by length, all 358 niche videos:

| Length | Videos | Median outlier | Videos at 10x+ |
|---|---|---|---|
| under 10 min | 29 | 1.7x | 3 |
| 10-18 min | 35 | 3.3x | 10 |
| **18-30 min** | 86 | **2.5x** | 17 |
| 30-45 min | 86 | 1.7x | 17 |
| 45+ min | 122 | 1.3x | 23 |

The 18-30 minute band is where faceless narrated docs that break out sit (Blackfiles 25-28, Lume 20-25, fern 22-27,
Hood Archives 16-32, Toms Biker 26-36, Zero Reports 33). The 45+ band has many hits but most are TV full episodes or
compilations on big channels. **Target 22-28 minutes**, up to ~32 for a case that carries it. That fits the brief.

## 6. Gaps a new channel can own

1. **Court-record-led crew stories.** Nobody in the top results shows the indictment, the grand-jury record or the
   appeal; most narrate from Wikipedia and films. "Every claim on screen with its source" is a visible difference.
2. **Cases with a famous informant and weak recent coverage**: Brink's 1950 (best this year: "The Biggest Heist In U.S.
   History", Sagamo, 1.68M, 19 min, general heist angle; nobody tells it as the six years until O'Keefe talked);
   Operation Family Secrets (one 24K video this year); El Rukn's informant scandal (the 1990s retrials are barely
   covered; the top El Rukn video is 56K); the Biloxi Sherry murders (best English video 154K, uncited, 33 min);
   Westies (rising demand from MGM+, thin supply).
3. **Multipart organisation sagas** done as linked standalone films (only Zero Reports and one prison-gang channel do
   this, both with good retention).
4. **Victims and investigators as characters**, not just the bosses: the field glamorises ("legend", "untouchable",
   "$500M empire"). The brief forbids that, and it is also an opening: the agent, the prosecutor and the family of the
   victim are under-told.
5. **Saturated, avoid as lead uploads**: Flores twins (four videos over 200K in the last two weeks, across languages),
   Lufthansa/Goodfellas (ten videos 100K-990K this year), Dunbar and Loomis Fargo (five or more each this year),
   Aryan Brotherhood origins, Larry Hoover vs. Jeff Fort "war" videos, Supreme Team (two 700K+ videos), Freeway Rick
   Ross/CIA.
