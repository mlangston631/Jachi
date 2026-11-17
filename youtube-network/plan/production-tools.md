# Production tools for "Until Someone Talked" and "Crooked Arithmetic"

Two faceless channels of 18-30 minute investigative documentaries: street-level crews and organisations, and
financial fraud. One owner, assisted by AI, with a person leading every episode. Target: about one documentary a week
per channel, so roughly 9 a month. Researched 17 Nov 2026.

How sure each part is:
- **[read]** I read it myself, on YouTube's help pages (`readpage.py`, RULES tier) or justice.gov (PRIMARY tier).
- **[account]** The owner's connected Higgsfield and Runway accounts reported it on 17 Nov 2026. Credit costs come
  from Higgsfield's cost check (`get_cost`), which costs nothing and generates nothing.
- **[search]** It comes from web-search summaries. Most of these are third-party pages and many disagree with each
  other. From this session I could not open higgsfield.ai, help.runwayml.com or the vendors' own pricing pages, so
  check those numbers before buying.
- **[unverified]** My own judgement or general knowledge that I did not confirm this session.

The `network` section of `network/briefs.json` sets the standard: licensed archival footage, maps, documents,
evidence boards, AI atmosphere only with labels, natural narration that never sounds robotic, and a quality gate
that includes copyright and advertiser suitability. `plan/setup.md` already covers the YouTube account rules (the
AI-use disclosure, no AI persona giving advice, no templated content, a licence record for every asset). This plan
builds on both.

---

## 0. What the owner already has

| Tool | State on 17 Nov 2026 | Useful for |
|---|---|---|
| **Higgsfield** (main creation tool) | **Plus plan, 834.58 credits** [account] | Speech, including **Eleven v4** and a voice cloned from his own recording (`create_voice`, then use that voice), Seed Audio, Qwen, MiniMax and others. Video (Kling 3.0, Seedance 2.5 and more), images (GPT Image 2.6 and more), upscaling, AI music (ElevenLabs Music v2/v2.5), dubbing. |
| **Runway** | **Free plan, 750 credits** (500 plan + 250 purchased) [account] | Images only. Speech, video, music and sound effects need Standard ($15/mo) or higher [account]. |

Gaps that neither tool fills today:
- **Sound effects.** Higgsfield's sound-effect model (Mirelo) and its Sonilo music model are marked "game
  pipeline only" and must not be used on their own [account, from the tool's own description]. Runway's sound
  effects need a paid plan.
- **Licensed human-made music**, which keeps the AI-use answer at "No" (see §1 and §3).
- **News and archival footage**, and the **editor** that assembles the episode.

**Higgsfield prices.** Plus gives 1,000 credits a month. The offer screen also mentions 1,200, so the exact figure
is unclear [account]. List price is about $49/month according to Higgsfield's Oct 2026 pricing blog; one tracker
says $59 monthly or $47 a month billed yearly [search]. Ultra gives 3,000 credits a month at a $129/month list price
[search]. On 17 Nov the account's offer screen showed Ultra at $79/month monthly or $50/month billed yearly, and Plus
at $27/month billed yearly, in a sale ending 18 Nov 2026 [account]. One-time top-ups cost about $0.053-0.059 a
credit (1,000 for $55.56, 4,000 for $210.53) and expire after 90 days [account].

---

## 1. Narration

### Options, on Higgsfield first

Narration that runs 25 minutes at about 150 words a minute is roughly 3,750 words, or about **22,000 characters**.
Eleven v4 accepts at most 10,000 characters per call [account], so render one call per section of the episode
structure (cold open, mystery, origins and so on). Use the same voice and settings for every call.

| Option | Where | Credits per 1,000 characters [account] | **Credits per 25-min episode**, one take | With about 30% redone | Approx. $ at $0.05/credit |
|---|---|---|---|---|---|
| **Eleven v4** (stock voice or his own clone) | Higgsfield `elevenlabs_v4` | 4.6 | ~101 | **~130** | ~$6.50 |
| Eleven v4 Turbo / Text to Speech V2 (ElevenLabs engine) | Higgsfield | 3.0 | ~66 | ~86 | ~$4.30 |
| Seed Audio 1.0 (ByteDance) | Higgsfield `seed_audio` | 6.7 | ~147 | ~190 | ~$9.50 |
| The owner reads it himself | microphone | 0 | 0 | 0 | one-time microphone, roughly $100-250 [unverified] |
| ElevenLabs direct, Creator plan | elevenlabs.io | $22/mo for about 121k credits, with professional voice cloning [search] | about one plan's worth for 4-5 episodes [search; the credit-to-minute rate is disputed] | n/a | $22-99/mo |

**Which sounds natural over 25 minutes?** I did not generate test audio, because that would spend his credits.
What the search turned up: long-form "drift" (the tone changing across chunks) is a known ElevenLabs problem in
2026, the steadier models are recommended for long reads, and claims about v4 are thin [search]. Before choosing, run
a **blind 3-minute test**: the same passage in Eleven v4 with a stock voice, in Eleven v4 with a clone of his voice,
and in Seed Audio, plus him reading it. That costs about 12-20 credits per AI version. Listen to the ends of the
chunks and how names are pronounced. Keep a pronunciation list for each episode, covering names, places and acronyms.

### Licence for monetized YouTube

- **Higgsfield.** Its help centre says the terms do not restrict commercial use of outputs, do not tie that right to
  a plan, and Higgsfield claims no ownership. Protection against third-party IP claims (indemnification) comes only
  with Enterprise. You may not use outputs to train AI models [search; I could not open the page itself from this
  session]. **Unverified:** whether ElevenLabs' own voice-library terms also apply to Eleven v4 voices used through
  Higgsfield. Ask Higgsfield support before episode 1, and keep the reply in the licence record.
- **ElevenLabs direct.** The free plan "does not include a commercial license and cannot be used for any commercial
  purpose". Paid plans from Starter (about $5-6) up do include one [search; official help page quoted in results].
- **Runway.** Its help centre says users keep ownership of what they generate on every plan, Free included, and its
  terms (§4.4) don't restrict commercial use. Third-party sites claim the free plan is personal-use only or carries a
  watermark [search; conflicting]. This only matters for Runway images (see §2).

### His own voice or a clone, against a stock voice: the YouTube rules [read]

- **Disclosure** (answer/14328491). Among the things creators *don't* need to disclose, YouTube lists "Cloning one's
  own voice to create voice overs or dubs". Creators must disclose content that "Makes a real person appear to say or
  do something they didn't do", "Generates a realistic scene that didn't actually occur", or "Creates music that's the
  main focus of the video". A **stock synthetic narrator** isn't named on either list. `plan/setup.md` already sets
  "Yes" for realistic synthetic voices, so keep that. "Disclosing AI content alone won't limit a video's audience or
  impact its eligibility to earn money."
- **AI personas** (answer/1311392). Channels that use "AI-generated personas to deliver information on sensitive
  topics… that presents itself as a human expert providing advice to viewers on topics such as health, legal issues,
  finances, or politics… will not be allowed to monetize." The examples include "AI-generated podcast hosts offering
  financial guidance". **Crooked Arithmetic is the exposed channel.** The narrator tells what happened and never tells
  viewers what to do with their money. If an episode ends with warning signs of fraud, attribute them to the
  SEC/FTC/FINRA on screen as their words.
- The same page says AI-made content "with generic or unoriginal templates giving the impression of mass production"
  can't be monetized. A person must research and write each script.

**Recommendation:** narrate in **his own voice**. Record it himself when time allows, and otherwise use a
**Higgsfield clone of his voice made from a clean 1-3 minute studio-quality recording, read with Eleven v4**. This
needs no disclosure for the voice, removes the AI-persona risk on the finance channel, and gives both channels one
real, consistent human narrator. Use a stock voice only if the blind test shows his clone is clearly worse; then
disclose "Yes" and never let the narrator advise. Pay for a direct ElevenLabs plan (Creator, $22/mo, professional
clone) only if the Higgsfield clone fails the 3-minute test.

---

## 2. Footage and stills

### Licensed archival and news footage

| Source | What it has | Typical cost | Watch out |
|---|---|---|---|
| **AP Archive** | Global news since 1895 | Quote-based. Billed in **15-second increments**, with a **minimum payment** for new customers; screeners are free but can't be used [search, older guide] | Ask for a quote naming "monetized YouTube documentary, worldwide, perpetual". |
| **Getty Images (video)** | News and editorial | Rights-ready clips are priced by use; one review says from **about $99** up to thousands [search] | Getty's licence: content marked "editorial" may not be used for "any commercial, promotional, advertorial, endorsement, advertising purpose" unless an invoice or agreement allows it [search, quoting the licence]. **Confirm in writing that monetized YouTube counts as editorial use.** |
| **Reuters** (Reuters Connect; pre-1980 material through British Pathé) | News archive | Quote-based. Pathé gives free research and low-resolution screeners [search] | Ask the same question as for Getty. |
| **Pond5 editorial** (includes Reuters, Newsflare) | News clips sold one at a time | **$49 / $149** per clip (2024 review), or "from $79" (2019 launch) [search] | One review says the editorial licence excludes commercial use. Read the licence before using a clip in a monetized video. |
| **Storyblocks** | Generic stock: establishing shots, textures | Sources disagree: about $20-65/month [search] | The individual licence covers **1 channel**; several channels need the business tier [search, Storyblocks licence page]. Two channels may mean the higher tier. Optional, because Higgsfield can make atmospheric shots. |
| **British Pathé** | Historical newsreels | Quote-based or subscription [search] | Mostly older than these stories, so useful only for context. |

Budget news footage for each episode, buying only clips the story truly needs: **$0-150 per episode** for a few
Pond5/Getty clips [estimate]. Most of these stories are told better with documents than with news video.

### Public domain: US federal works, and their caveats

- **The law.** 17 U.S.C. §105: works "prepared by an officer or employee of the United States Government as part of
  that person's official duties" have no US copyright [search; statute text on govinfo/Cornell].
- **DOJ's own notice** [read, justice.gov/legalpolicies]: "Unless otherwise indicated, information on Department of
  Justice websites is in the public domain and may be copied and distributed without permission." However: "If a
  source other than the Department of Justice or other federal government agency is indicated on a photo, graphic,
  or other material, permission to copy these materials must be obtained from the original source… some photos,
  graphics and other materials used on this website are copyrighted." And: "The use of any Department of Justice
  seals… is protected and requires advance authorization." **Don't put DOJ, FBI or SEC seals or logos in thumbnails
  or graphics.**
- **What is usually free to use:** federal indictments, criminal complaints, plea agreements, sentencing memos and
  government exhibits made by agents (charts, surveillance logs, photos taken by agents), DOJ/USAO press releases,
  FBI "wanted" and seizure photos taken by federal staff, SEC complaints and litigation releases, congressional
  reports and hearing transcripts. Court opinions themselves aren't copyrightable [search]. Free court records are on
  CourtListener (RECAP). PACER charges per page [unverified this session].
- **What is not automatically free:**
  1. **Third-party material inside federal files.** Weisberg v. DOJ (D.C. Cir. 1980): photos held by the FBI were
     owned by Time-Life, and the court required Time to be joined [search]. Bank statements, company slides, news
     photos, social-media photos and private CCTV stills in court exhibits can still be copyrighted.
  2. **Contractor or commissioned work** [search; Ohio State library guide].
  3. **State and local material** (local police mugshots and bodycam, state court records, state prosecutors' press
     photos). §105 covers only federal works, and state rules vary [unverified per state].
  4. **Archives.** At the National Archives and the Library of Congress, many items are free but donor restrictions
     and works still in copyright exist; "you are ultimately responsible" [search; documentary.org]. Use the Library of
     Congress "free to use" sets and read every catalogue record's rights statement.
  5. **Not a copyright question, but just as important:** victims' and minors' identities, sealed filings and
     unproven allegations. Blur where needed, and say "charged" or "alleged" until there is a conviction (see the
     briefs' research rules).

### AI stills and atmosphere (Higgsfield first, Runway images second)

| Item | Credits [account] | Note |
|---|---|---|
| GPT Image 2.6 still, 16:9 | 0.25 | Textures, empty rooms, abstract backgrounds, thumbnail drafts. |
| Kling 3.0 video, 5 s | 10 | Atmospheric shots without people. |
| Seedance 2.5 video, 5 s | 35 | Use only for hero shots. |
| Runway images | free-plan credits (750) | A second source for thumbnail concepts and mood boards. Check for watermarks [unverified]. |

**AI rules for these channels** (from answer/14328491 [read] and the briefs):
- Never make a realistic image of a **real** defendant, victim, officer or place "as it happened". YouTube's
  must-disclose examples include "Making it look like a real person has been arrested or imprisoned" and "AI generated
  extra footage of a real place".
- Never make a document that looks real: an indictment, bank statement or ledger. Show the real one, or a clearly
  labelled reconstruction.
- Label every illustrative recreation on screen ("Illustration" or "Reconstruction").
- If any photorealistic AI scene stays in the cut, tick **AI use: Yes**. It costs no reach.

### The licence record (one per video)

Keep one file per video, for example `results/licences/<video-id>.csv`, written as the edit is built and frozen
before upload. One row per asset:

`asset_id, file, timecode_in-out, type (footage/still/music/sfx/voice/ai), source_url, licensor, licence_type
(PD-federal / rights-managed / royalty-free / subscription / AI-generated / own), licence_or_invoice_no, date_obtained,
scope (channels, platforms, monetized yes/no, territory, term), credit_line_required, content_id_status (safelisted
channel? claim-free?), for PD: statute + agency + screenshot of the notice, for AI: tool, model, prompt/job id, date,
disclosure needed (Y/N), notes (people blurred, allegations wording)`.

Save a PDF or screenshot of each licence page and invoice the day the asset is downloaded, because terms change.
`plan/setup.md` notes that strikes can affect every related channel, so this record is the evidence for any dispute.

---

## 3. Music and sound

| Option | Content ID behaviour | Cost | Fit |
|---|---|---|---|
| **YouTube Audio Library** | "Copyright-safe music and sound effects downloaded from the Audio Library won't be claimed by a rights holder through the Content ID system." Monetizable in YPP. Creative Commons tracks need credit in the description [read, answer/3376882] | Free | **Sound effects** and some beds. The catalogue is small and widely used, so it can sound like every other channel. |
| **Artlist** | You add your channels to the account so your uploads count as licensed. The licence forbids registering tracks in Content ID yourself [search] | Social ~$9.99/mo yearly (1 channel per platform). **Pro ~$24.92/mo yearly ($299/yr): up to 3 channels per platform**, and it covers paid ads [search] | **Music + SFX for both channels on one plan.** |
| **Epidemic Sound** | Safelisting: connect the channels before publishing. Videos published while subscribed stay cleared after you cancel [search] | Creator ~$9.99-17.99/mo (one channel per platform). Pro ~$16.99/mo yearly or $39.99 monthly [search; sources conflict] | Good alternative. Check that one plan covers **two** of his own channels. |
| Soundstripe / Musicbed | Claim-clearance tools exist; details not found | Soundstripe Personal ~$9.99/mo yearly (non-commercial). Musicbed doesn't publish prices [search] | Not needed. |
| **Higgsfield ElevenLabs Music v2.5** | AI music | ~8.7 credits per minute [account] (≈ $0.45/min) | YouTube lists "AI generated music" among content that needs disclosure [read]. That puts a label in the player and makes Content ID behaviour uncertain. Use only for short stings, and disclose them. |

**Recommendation:** **Artlist Pro** (one plan, music and SFX, both channels), with the **YouTube Audio Library** for
extra sound effects. Connect both channels before the first upload. Mix music well below the voice (the briefs'
rule).

---

## 4. Assembly and editing

What a small documentary team uses [search; Resolve and Adobe prices]:
- **DaVinci Resolve.** The free version can edit, colour-grade and mix audio (Fairlight), and do motion graphics in
  Fusion. **Studio costs $295 one-time** (it was $236 on sale in Oct 2026) and adds the AI tools, including
  **IntelliScript**, which builds a timeline from the script text, plus AI transcription and voice isolation [search].
  No subscription.
- **Adobe After Effects** costs ~$22.99/mo yearly or ~$34.49/mo monthly [search]. It is the usual home for
  **GEOlayers 3** animated maps (price not confirmed; an upgrade from v2 is $205) [search] and for evidence-board and
  document-reveal templates. It is only worth it if he wants After Effects-grade maps.
- **Maps without Adobe** [unverified]: export a styled map from QGIS using OpenStreetMap or Natural Earth data
  (credit "© OpenStreetMap contributors"), then animate camera moves, routes and pins in Resolve Fusion. Never let AI
  draw a map of a real place: it invents geography.
- **Descript** ($24/mo yearly, $35 monthly) offers text-based editing [search]. It isn't needed if Resolve Studio is
  used.

**Recipe for document reveals and evidence boards:** scan or download the real PDF, render pages at high resolution,
then in Fusion use slow push-ins, highlighter wipes over the exact quoted line, redaction boxes, and a "page torn
from file" shadow. For evidence boards, use real photos (or labelled illustrations) pinned on a Higgsfield-made cork
or desk texture, with string paths animated in Fusion. Build these **once as reusable templates per channel**, but
make different story-driven choices in each episode. The "nothing templated" rule (setup.md §9) is about stories and
scripts, not about a consistent title style.

**What AI does well today:** transcription and captions; first assemblies from a script (IntelliScript); finding
shots; restoring, upscaling and denoising archival footage and audio (no disclosure needed: "upscaling or repair"
[read]); background removal; textures and atmospheric shots without people; thumbnail drafts; translation and
dubbing later.
**What AI does badly:** real people's likeness (also a disclosure and defamation risk); readable text in images,
which means fake documents; geography; continuity across shots longer than about 5-10 seconds; steady tone across a
25-minute read without supervision; facts and legal outcomes. A person fact-checks every claim against the primary
source.

---

## 5. Advertiser suitability for crime documentaries [read, answer/6162278]

I read the tier of each line ("can earn ad revenue" / "limited ad earnings" / "no ad earnings") from the page's own
section headings.

- **Scope:** "Our policies apply to all portions of your content (video, Short, or live stream, thumbnail, title,
  description, and tags)."
- **Crime itself is fine** (Enabling dishonest behaviour, **can earn**): "Documentaries about crime." and "Personal
  accounts by individuals affected by crimes." **No ad earnings:** "Displaying a house break-in without additional
  context, e.g. CCTV footage of a house break-in", and "Content meant to educate viewers on how to gain unauthorized
  access… in malicious ways". Elsewhere on the page, "Encouragement of fraudulent or illicit activities" is listed
  under **limited/no** ad earnings.
- **Violence:** "Content where the focal point is on blood, violence, or injury, when presented without other context,
  is not suitable for advertising. If you're showing violent content in a news, educational, artistic, or documentary
  context, that additional context is important." **Can earn** includes "Implied moment of death or severe bodily harm
  in an educational, documentary, journalistic reporting… context" and "Reports of nearby homicide events without
  graphic descriptions of the casualties". **Limited** includes "Dead bodies with obvious injury or damage in
  educational or documentary settings" and "**A documentary on a recent homicide featuring descriptive language of
  the circumstances of death.**" **No ad earnings** includes "Focus on blood, guts, gore, bodily fluids… **crime
  scenes** or accident photos with little to no context."
- **Drugs** (most street-crew stories): **Can earn**: "Documentary or journalistic reports on the purchase,
  fabrication, usage, or distribution of drugs, such a story about a drug bust." **Limited**: "Educational or
  documentary content on DTOs" (drug trafficking organisations) and "Violent situations and actions such as hostages
  or interrogation conducted by DTOs." **No ad earnings**: "Glorification, recruitment, graphic portrayal… or imagery
  of drug trade organizations. Focal content on drug trafficking organizations", "Non-educational videos focused on
  specific DTOs, DTO leaders", "Non-educational depictions of DTO-related imagery such as flags, slogans, banners",
  and "Discussion of DTOs with no explicit reference to an intent to educate or explain the topic is considered
  'non-educational' content."
- **Profanity:** moderate profanity in a title or thumbnail gives limited ads; "Stronger profanity (like f*ck) used in
  thumbnails or titles" gives no ads. Quoted wiretap language in the video is fine in moderation, but never put it in
  titles or thumbnails.
- **Sensitive events:** "Creators may not monetize content that profits from or exploits a sensitive event",
  including "Using keywords related to a sensitive event to attempt to drive additional traffic." Avoid mass-violence
  cases while they are recent.

**What this means for scripts**
1. Tell the story of the **case**: the investigation, the informant, the indictment, the trial. That is "a story
   about a drug bust" (can earn). Don't profile a cartel or gang as the subject (limited at best). Say early and in the
   description what the film explains and why.
2. Describe deaths in the past tense and factually, without anatomical detail, especially for recent homicides.
3. Crooked Arithmetic explains **how a scheme was caught**, never a step-by-step method someone could copy.
4. Never glorify: no "boss" framing, no lifestyle montages, no gang or cartel symbols as decoration.

**What this means for thumbnails and titles**
- No blood, bodies, crime-scene photos, weapons pointed at camera, gang/cartel flags or slogans, agency seals, or
  profanity.
- Use instead: a document fragment (a highlighted line, a ledger number), an empty place, a silhouette or labelled
  illustration, and one short accurate phrase. Never a realistic AI face of a real person.
- Answer YouTube's self-certification questionnaire honestly on every upload.

---

## 6. Recommended minimum stack and monthly cost (about 9 documentaries a month)

**Credit budget per episode on Higgsfield** [account prices; quantities are my estimate]:
- narration with Eleven v4 (his clone): ~130
- 10 AI atmospheric shots on Kling 3.0, about 2 tries each: ~200
- ~60 stills and textures: ~15

That is **~345 credits per episode, or ~3,100 a month.** If he reads the narration himself and uses fewer AI shots,
it drops to ~120 per episode, or ~1,100 a month.

| Need | Tool | Monthly cost |
|---|---|---|
| Narration, AI stills, atmospheric shots, voice clone, upscaling | **Higgsfield, moved from Plus to Ultra** (3,000 credits). Plus (1,000) covers only the lean version, where he reads it himself. | **$129 list** (offer on 17 Nov: $79 monthly, or $50/mo yearly until 18 Nov) in place of Plus's ~$49 |
| Extra images, thumbnail drafts | **Runway, stay on Free** (750 credits). Don't upgrade: Higgsfield already covers speech, video and music. | $0 |
| Music + sound effects, both channels | **Artlist Pro** (or an Epidemic plan that covers two channels) + **YouTube Audio Library** | ~$25 (yearly) |
| Editing, maps, document reveals, mixing | **DaVinci Resolve**: free now; **Studio $295 one-time** when IntelliScript and the AI tools are wanted | $0 (≈$25/mo if Studio is spread over a year) |
| News/archival clips | Pond5 / Getty / AP, per clip, only when essential | budget **$0-150 per episode** |
| Public-domain documents and photos | CourtListener, justice.gov, sec.gov, FBI, National Archives, Library of Congress | $0 |
| Microphone, if he records himself | one-time | ~$100-250 [unverified] |

**Totals**
- **Recommended:** Higgsfield Ultra + Artlist Pro + Resolve (free, later Studio). That is **about $155 a month at
  list prices** ($105 on the offer currently shown), plus **$295 once** for Resolve Studio, plus **$0-1,350 a month**
  for news clips depending on the stories.
- **Leanest start:** keep Higgsfield Plus (~$49), he reads the narration, YouTube Audio Library, free Resolve. That
  is **about $49 a month**, plus top-ups (~$0.055/credit) if a month runs over.

Order of steps:
1. Run the 3-minute blind voice test (under 80 credits).
2. Make the episode-1 licence record.
3. Confirm Higgsfield's voice terms and Getty's or Pond5's editorial terms in writing.
4. Only then upgrade Higgsfield, and only monthly. Don't commit to a yearly plan before two episodes are finished.

---

## What I could not verify

- **Higgsfield's licence text.** The help-centre summary came from search results; higgsfield.ai would not open from
  this session. Also unverified: whether ElevenLabs voice-library terms carry over when v4 voices are used through
  Higgsfield, and how good Higgsfield's clone of his voice will be over 25 minutes.
- **Higgsfield's exact Plus monthly price and credits** (1,000 or 1,200), and how long the offer prices shown on 17 Nov
  last. Credit costs are today's cost-check figures and can change.
- **How natural each voice sounds.** Nothing was generated; the blind test decides.
- **Vendor prices.** Every price for AP, Getty, Reuters, Pond5, Storyblocks, Artlist, Epidemic, Soundstripe, ElevenLabs
  direct, Adobe, GEOlayers and Descript is from third-party or older pages, and many disagree. AP, Getty and Reuters
  are quote-only.
- **Getty and Pond5 editorial use.** Whether their editorial licences cover **monetized** YouTube needs a written answer
  from each.
- **Multi-channel cover.** Whether Epidemic's and Storyblocks' plans cover two of his own channels on one subscription.
- **Copyright of court exhibits** in general (no source found). State and local records rules. PACER fees. The SEC and
  FBI websites' own copyright notices: only DOJ's was read.
- **Runway's free plan** for images: whether it adds a watermark, and whether third-party claims of "personal use only"
  are right (Runway's help centre says users own their outputs on all plans).
- Whether a **stock AI narrator** alone needs the AI-use "Yes" (YouTube's page names neither way; the network's rule
  says Yes).

## Sources

YouTube rules (read 17 Nov 2026 with `readpage.py`):
- [Disclosing use of GenAI content](https://support.google.com/youtube/answer/14328491)
- [Channel monetization policies](https://support.google.com/youtube/answer/1311392)
- [Advertiser-friendly content guidelines](https://support.google.com/youtube/answer/6162278)
- [Audio Library](https://support.google.com/youtube/answer/3376882)

Primary:
- [DOJ legal policies and copyright status](https://www.justice.gov/legalpolicies)
- [17 U.S.C. §105](https://www.law.cornell.edu/uscode/text/17/105)
- [Weisberg v. DOJ, 631 F.2d 824](https://m.openjurist.org/631/f2d/824)

Vendor and help pages, seen through search summaries only:
- [Higgsfield: who owns my generations](https://higgsfield.ai/creator-hub/help-center/account/who-owns-my-generations-and-can-i-use-them-commercially)
- [Higgsfield pricing blog](https://higgsfield.ai/blog/higgsfield-pricing-explained)
- [Costbench: Higgsfield](https://costbench.com/software/ai-video-generators/higgsfield/)
- [Runway usage rights](https://help.runwayml.com/hc/en-us/articles/18927776141715-Usage-rights)
- [ElevenLabs: can I publish](https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform)
- [ElevenLabs pricing summary](https://bigvu.tv/blog/elevenlabs-pricing-2026-plans-credits-commercial-rights-api-costs/)
- [ElevenLabs long-form caveats](https://medium.com/@elena.voss/elevenlabs-review-2026-the-caveats-before-you-build-on-ai-voice-3cf3f29b0917)
- [AP licensing guide (older)](https://kiwix.lema.org/wikihow_en_maxi_2023-03/License-Content-from-Associated-Press)
- [Getty purchasing FAQ](https://www.gettyimages.com/faq/purchasing)
- [Getty licence](https://www.gettyimages.com/license-information)
- [Pond5 editorial collection](https://www.footagesecrets.com/news/pond5-premium-editorial-footage/)
- [Pond5 and Reuters](https://www.provideocoalition.com/pond5-offers-editorial-video-content-from-reuters-covervideo-and-newsflare/)
- [British Pathé and Reuters](https://broadcastnow.co.uk/tech/british-pathe-to-rep-reuters-footage-before-1980/5128599.article)
- [Storyblocks licence comparison](https://www.storyblocks.com/license-comparison)
- [Storyblocks review](https://www.creatorstackclub.com/software/storyblocks)
- [Epidemic Sound plans](https://www.epidemicsound.com/our-plans)
- [Epidemic Sound pricing guide](https://lesfm.net/blog/epidemic-sound-pricing)
- [Artlist pricing](https://artlist.io/page/pricing)
- [Artlist licence](https://help-center.artlist.io/privacy-terms/artlist-license/)
- [Soundstripe on alternatives](https://www.soundstripe.com/blogs/musicbed-alternatives)
- [Blackmagic DaVinci Resolve Studio offer](https://www.blackmagicdesign.com/media/partial/release/20261020-02)
- [DaVinci Resolve AI features](https://thepostflow.com/ai/ai-in-davinci-resolve/)
- [GEOlayers 3](https://aescripts.com/geolayers/)
- [After Effects pricing](https://expertphotography.com/buy-adobe-after-effects)
- [Descript pricing](https://www.castmagic.io/blog/descript-pricing)
- [Copyright and public domain primer (IDA)](https://documentary.org/feature/copyright-and-public-domain-updated-primer)
- [OSU library on government documents](https://library.osu.edu/site/copyright/tag/government-documents/)
- [National Archives still photos search](https://unwritten-record.blogs.archives.gov/2020/04/21/searching-the-national-archives-catalog-for-still-photographs/)
