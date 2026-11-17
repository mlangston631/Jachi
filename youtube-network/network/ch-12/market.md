# Crooked Arithmetic: what wins in this niche on YouTube now

Research for channel 12, 17 Nov 2026. Data: `ytscout.mjs` (YouTube search sorted by views, filtered to this year and
this month; outlier = views / uploader's subscribers). Raw files in this folder:

- `scout-year.json` and `scout-month.json`: 12 niche queries, both periods ("fraud documentary", "ponzi scheme
  documentary", "white collar crime documentary", "financial crime documentary", "accounting fraud", "biggest fraud in
  history", "money laundering documentary", "insider trading documentary", "crypto scam documentary", "corporate scandal
  documentary", "embezzlement documentary", "insurance fraud documentary"). Three month queries returned nothing on the
  first try ("ponzi scheme documentary" failed to read; two had no results this month).
- `scout-cases-a.json`, `scout-cases-b.json`, `scout-extra.json`: "<case> documentary" for the 30 candidate cases plus
  Madoff / Enron / FTX / Theranos controls and "part 1 / part 2" queries. `scout-pairs.json`: part 1 / part 2 lookups.
- `sheet-year.png` (top 20 outliers across the 12 niche queries) and `sheet-cases.png` (top 20 outliers across the
  case queries): thumbnail sheets, reviewed below.

Limits: YouTube search only shows this year's and this month's uploads, so older classics (Netflix/CNBC full episodes
uploaded years ago) are invisible here; subscriber counts are YouTube's rounded figures; views are a snapshot on
17 Nov 2026. Some queries return off-topic hits (sex trade, Mussolini); I ignore those below.

## 1. Who dominates

**Big channels own the broad "fraud" queries, but on modest outlier ratios (0.5x to 1.5x).**

| Channel (subs) | What wins for them | Real examples (views, length) |
|---|---|---|
| fern (5.7M) | Faceless, 3D-rendered investigative docs, 28 to 48 min, dollar figure in title | "How the Internet Exposed a $10,000,000 Scam" 5.9M, 48 min; "Exposing a $1,900,000,000 Pharma Company" 3.9M, 44 min; "The Insane Hunt for China's Biggest Scammer" 3.3M, 30 min |
| Coffeezilla (4.8M) | Presenter-led, live scams, crypto | "Exposing a $300,000,000 Scam" 4.8M, 31 min |
| Bloomberg Originals (5.2M), WSJ (6.7M), FRONTLINE (4.9M) | Newsroom docs on current cases | WSJ "The North Korean Operatives Hiding Inside U.S. Companies" 10.4M, 32 min; Bloomberg "A Ponzi Schemer Freed by Trump Strikes Again" 0.79M, 19 min |
| Hank Green (3.2M) | Long essay on one famous fraud | "The Theranos Trap" 4.6M, 84 min |
| Hamish Hodder (394K) | Market crime explained with humour, 16 to 33 min, highest outliers of the big names | "Hilariously Bad Insider Trading Attempts" 4.7M (12x), 33 min; "The Most Violent Trading Loss in History" (Archegos) 1.3M (3.3x), 25 min; "Investor Commits Fraud on Live TV" 0.8M, 22 min |

**Small faceless channels get the big outliers on single named cases, and this is the lane Crooked Arithmetic
competes in.**

| Channel (subs) | Video | Views | Outlier | Length |
|---|---|---|---|---|
| Gloam (8.4K) | How Binance Lost $6,300,000,000 in One Night | 2.56M | 304x | 14 min |
| Federal Desk (7.6K) | $53M Gone From A Small Illinois Town For 22 Years As 21 Audits Found Nothing (Rita Crundwell) | 1.59M in 10 days | 210x | 9 min |
| Econ in a Nutshell (6.2K) | Every Money Laundering Technique Explained | 1.42M | 228x | 11 min |
| The Wall Street Files (480) | Enron: The System That Built the Fraud | 74K | 155x | 33 min |
| Retraced (10.2K) | The Spy Who Seduced Nvidia's CEO | 617K in 8 days | 61x | 17 min |
| Built on Lies (2.45K) | The Man Who Stole $65 Billion and Made Everyone Thank Him (Madoff) / The Billionaire Who Bought a Country With a $7 Billion Lie (Stanford) / A $450 Million Fraud Ended With a Fake Death on a Bridge (Bayou) / How Enron Fooled Wall Street for 11 Years | 93K / 89K / 41K / 30K | 38x / 36x / 17x / 12x | 95 / 106 / 117 / 125 min |
| Fireball (8.8K) | The CEO Who Built a Fake NASCAR Empire (DC Solar) | 315K | 36x | 15 min |
| Veritas Files (1.25K) | How One Woman Ignored Her Boss and Brought Down an $11B Fraud (WorldCom); Enron: How the Most Admired Empire in the US Stole $60 Billion; The 16-Year-Old Genius Who Used Liquid Paper to Steal $280 Million (ZZZZ Best) | 19K / 24K / 16K | 15x / 19x / 13x | 23 to 30 min |
| Silent Collapse (7.5K) | Inside Crazy Eddie: How America's Beloved Discount King Stole Millions and Disappeared | 107K | 14x | 63 min |
| zmoothly (50.9K) | this is just a story about a carpet cleaning company. (ZZZZ Best) | 505K | 9.9x | 48 min |

Style of the winners: narrated (no presenter), a single case per film, dark cinematic palette, archival photos or
3D/AI scenes, a dollar figure or a single striking fact up front. The "Built on Lies" and "Industrial America" pattern
(90 to 125 min, sleep-friendly long form) earns high ratios on small subscriber bases, but at 30K to 90K views.

**Warning sign: a flood of near-zero faceless uploads.** Nearly every mid-famous case has 3 to 10 uploads from the
last 30 days on channels with under 100 subscribers and under 1,000 views ("Phoenix Files", "Paper Trail",
"Rise & Fall", "Dead Brands", "The Hubris Project", "Anatomy of a Fraud", "MoneyMarvels"). These are generic,
script-farm summaries (short, interchangeable titles, 6 to 16 min). They don't make a case "covered": none has
traction, and they are exactly what the brief says not to make. A sourced, well-built 22 to 28 minute film on the same
case is still the definitive YouTube version. But YouTube is filling up with these, so speed and quality both matter.

## 2. Title patterns that work (real titles, real numbers)

1. **Exact dollar figure, spelled out**: "How Binance Lost $6,300,000,000 in One Night" (2.56M, 304x); "Exposing a
   $1,900,000,000 Pharma Company" (3.9M); "They Stole $240,000,000 Then Got Kidnapped" (2.1M, 4.9x).
2. **The impossible detail in plain words**: "$53M Gone From A Small Illinois Town For 22 Years As 21 Audits Found
   Nothing" (1.59M, 210x); "A $450 Million Fraud Ended With a Fake Death on a Bridge" (41K, 17x); "His Auditors
   Demanded to See the Site, So He Rented One" (ZZZZ Best; small). The winning ones state a verifiable fact that
   sounds unbelievable.
3. **Character + contradiction**: "How this seemingly timid accountant STOLE $45 Million and almost got away with it"
   (905K, 49 min); "The Man Who Stole $65 Billion and Made Everyone Thank Him" (93K, 38x); "How One Woman Ignored Her
   Boss and Brought Down an $11B Fraud" (19K, 15x).
4. **Understatement / deadpan**: "this is just a story about a carpet cleaning company." (505K, 9.9x).
5. **Repeat offender / sequel hook**: "Woman Convicted of Stealing $1,000,000 Does It Again at Her New Job" (947K,
   25.5x); Bloomberg "A Ponzi Schemer Freed by Trump Strikes Again" (792K).

What under-performs: "The Rise and Fall of X", "X: The $N Billion Fraud Explained", "Top 10 frauds" lists and Hindi /
Spanish / Vietnamese re-tellings of the same famous cases.

## 3. Multipart series: real pairs

| Series | Part 1 | Part 2 | Part 3 | Retention P2/P1 |
|---|---|---|---|---|
| Fireball, DC Solar ("I Filmed a $1 Billion Ponzi Scheme From the Inside", fraud-specific) | 91K | 79K | | 87% |
| Jeremy Greene IRL, "The Devil Wears Dunks" | 1.57M | 2.13M | 1.24M | 135% (P3 58% of P2) |
| DW Documentary, "Opioid crisis in the US (1/2, 2/2)" | 494K | 327K | | 66% |
| The Real Deal, "The Alexander Brothers Documentary" | 357K | 157K | | 44% |
| WillStar Films, "Vijay Mallya Biopic" (financial fugitive) | 517K | 167K | | 32% |

Also seen, without a findable partner: Die Spur "Money Laundering King: The Rise of Ali C. (1/2)" 733K; DW "Unmasking
Hezbollah, Money laundering in Europe (3/3)" 397K; Zeteo "FIFA's Decades of Corruption EXPOSED, Ep 3" 1.7M.

Lessons: part 2 usually keeps 30 to 90% of part 1. It holds up when part 1 ends on a real event and each part works as
a film with its own title (the DC Solar pair: "From the Inside" then "Inside the FBI Raid"). It drops off when the
split is just a timeline cut ("Rise" / "Crimes", "Villain or Visionary" / "When the Crown Fell"). Title each part as its
own story, never "Part 2" alone. Put the part number in the title's end tag or the thumbnail corner. Publish part 2
within 7 to 10 days, and pin it from part 1's end screen.

## 4. Thumbnail traits (sheet-year.png, sheet-cases.png)

- **One face, large, with a fixed expression** (Allen Stanford grinning, "FAKE KING"; Sam Israel on an evidence board,
  "FAKE DEATH"; Bill Hwang masked, "-$160B"). The face usually fills a third to a half of the frame.
- **Two to three words or one number**, heavy condensed sans, often yellow or white on dark: "FAKE DEATH", "FAKE KING",
  "1.900 MILLONES Y DESAPARECIÓ", "-$160B", "FAKE RECORD". Long text thumbnails underperform.
- **An object that is the crime**: Gloam's Binance (a gold vault and two blue/red figures, 3D, no face, 304x); the
  DC Solar group photo with a NASCAR car (a real photo, 36x); a hammer on gold ore for Bre-X.
- **Evidence-board / dossier look** (red string, stamps, "FRAUD EVIDENCE", mugshot): common and readable but getting
  generic.
- **Dark, high-contrast palettes** with one warm accent (red, gold). The newsroom docs (WIRED, CNBC American Greed)
  rely on brand bugs instead.
- Faceless 3D renders (fern, Gloam) are the clearest way to look premium without archive rights. AI faces of real
  people are common on the small channels; we must not do that (misleading, likeness risk). Use real archival photos
  (licensed) or symbolic objects.

## 5. Winning length band

- Single-case fraud docs that overperform on small channels: **14 to 33 minutes** (Gloam 14, Fireball 15, Retraced 17,
  Veritas 23 to 30, The Wall Street Files 33, Northern Crimes 33). The big channels' winners run 28 to 48 minutes.
- Long form (60 to 125 min) earns high ratios only at tens of thousands of views (sleep / binge audience).
- Under 10 minutes wins only with a hot news hook (Federal Desk, Crundwell).
- **Target 22 to 28 minutes**, within the brief's 18 to 30. Recaps on big cases can reach 30.

## 6. Gaps: where Crooked Arithmetic can be the definitive version

1. **Big, well-documented US frauds of 1960 to 2012 with no strong YouTube film this year**: Tom Petters ($3.65B,
   best upload 429 views), Le-Nature's (15 views), Equity Funding (141 views), the salad oil swindle (3K), Phar-Mor
   (136), MiniScribe (2K), Refco (29), Rothstein (3.8K), HealthSouth (1K), the ADM lysine informant (883), Galleon
   (under 1K for a dedicated film), Zachary Horwitz (1K), Outcome Health (34). All have deep court records (section in
   cases.md) and only farm uploads.
2. **The investigation itself as the story**: winners lean on "how it was exposed" (the WorldCom auditor, the bridge
   suicide, the audits that found nothing). Few channels follow the money with on-screen filings and charts. That is
   "followed through the numbers", our tagline.
3. **Genuine multipart cases** (Stanford, ADM / Whitacre, Crazy Eddie) where the real record has a second act
   (receivership, the informant's own fraud, a flight abroad). Competitors cut timelines instead.
4. **Under-served sub-genres**: corporate espionage told as a fraud story (Aleynikov, Huawei / T-Mobile "Tappy") and
   insurance fraud at institutional scale (Equity Funding), as opposed to the "fake injury caught on camera" format.
5. **Avoid for now (strong or fresh competition)**: Madoff, Enron, FTX, Theranos (Hank Green 4.6M), OneCoin (ENDEVR,
   Silent Anjel 625K), Wirecard (ZDFinfo 747K), Archegos (Hamish Hodder 1.3M), ZZZZ Best (zmoothly 505K), Rita
   Crundwell (Federal Desk 1.59M this month), Bre-X (Northern Crimes 102K this month), DC Solar (Fireball series).

Nothing in this research is financial advice.
