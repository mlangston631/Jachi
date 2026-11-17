export const meta = {
  name: 'documentary-team',
  description: 'Market scouting, case discovery, story development, legal fact-checking, brand and growth strategy for the portfolio's investigative documentary channels (pass which in args); then tools research, production pipeline, 90-day plan and a completeness critic',
  phases: [
    { title: 'Market', detail: 'what wins in each niche on YouTube: outliers, series decay, thumbnails, competitors' },
    { title: 'Cases', detail: '30 cases per channel scored on documentation, story and how saturated YouTube already is' },
    { title: 'Stories', detail: 'top 10, first five uploads, three multipart series, full beat sheet for upload one' },
    { title: 'Verify', detail: 'convictions vs allegations, defamation and advertiser-suitability check' },
    { title: 'Strategy', detail: 'identity, voice, thumbnails, growth, returning viewers, monetization per channel' },
    { title: 'Tools', detail: 'voice generation, footage and music licensing, what Runway can do' },
    { title: 'Network', detail: 'production pipeline, quality gate, 90-day plan, integration' },
    { title: 'Critic', detail: 'check everything against the owner\'s 16-point brief' },
  ],
}

// The project folder. Pass args.root if the repository is checked out elsewhere.
const YT = (args && args.root) || '/home/user/Jachi/youtube-network'
const BRIEF = `${YT}/network/briefs.json`
const SCOUT = `node ${YT}/ytscout.mjs`
const SHEET = `NODE_PATH=$(npm root -g) node ${YT}/thumbsheet.mjs`
const READ = `python3 -I ${YT}/readpage.py`
// Which documentary channels to work on: args.channels, e.g. [{ n: 11, label: 'Until Someone Talked (blue-collar crime)' }].
const CH = (args && args.channels) || []
if (!CH.length) throw new Error('documentary-team needs args.channels: [{ n, label }]')

const COMMON = c => `This task has nothing to do with the website repository in the working directory. Do not read, edit or commit anything there and do not use git. You may write files only under ${YT}/network/ch-${c.n}/.

You are working on channel ${c.n} (${c.label}) of an investigative documentary network inside a 13-channel faceless YouTube portfolio. Read the owner's brief first: the "network" section and the entry with "n": ${c.n} in ${BRIEF}. The channel's name and live address are in its entry in ${YT}/channels.json (field youtube.url); it already exists on YouTube.

TOOLS (Bash timeout 600000; YouTube requests are shared with other agents and queue):
  ${SCOUT} [--period year|month] --top 20 "query" ...    YouTube's most-viewed videos for a query this year/month, with uploader subscribers and outlier ratio (views / subscribers)
  ${SHEET} scout.json sheet.png --top 20                 one image of the top outliers' thumbnails; open it with Read
  ${READ} URL [--find word ...]                           text of a trusted page. Tiers: RULES (YouTube help), PRIMARY (www.courtlistener.com court records; justice.gov when readable), LEAD (en.wikipedia.org: use it to FIND primary sources, never cite it as the source)
  CourtListener search pages read well: ${READ} "https://www.courtlistener.com/?q=%22Name%20Here%22" (case law) or add &type=r (dockets).
WEB SEARCH IS RATIONED: a 200-search limit is shared by every agent running now. Use at most 15 web searches in this task, and prefer CourtListener and Wikipedia (via the reader) whenever they can answer. If search refuses, carry on with the reader and say what could not be verified.
Never fabricate dialogue, quotes, numbers, events or sources. Distinguish convictions, court findings, allegations and speculation everywhere.`

// ---------- schemas ----------
const MARKET = { type: 'object', properties: {
  competitors: { type: 'array', items: { type: 'object', properties: { channel: { type: 'string' }, subs: { type: 'number' }, style: { type: 'string' }, typical_length_min: { type: 'number' } }, required: ['channel'] } },
  patterns: { type: 'array', items: { type: 'object', properties: { pattern: { type: 'string' }, strength: { type: 'string' }, evidence: { type: 'array', items: { type: 'string' } } }, required: ['pattern', 'strength', 'evidence'] } },
  series_signal: { type: 'string', description: 'How multipart series perform: part 1 vs later parts views, from real examples' },
  thumbnails: { type: 'string' }, length_band: { type: 'string' }, gaps: { type: 'array', items: { type: 'string' } },
}, required: ['competitors', 'patterns', 'series_signal', 'thumbnails', 'gaps'] }

const CASE = { type: 'object', properties: {
  case: { type: 'string' }, era: { type: 'string' }, summary: { type: 'string' },
  documentation: { type: 'string', description: 'What primary material exists (indictments, trials, appeals, official reports, books), with at least one court-record or official URL where found' },
  doc_score: { type: 'number', description: '0-10' }, story_score: { type: 'number', description: '0-10: characters, turns, betrayal, investigation, payoff' },
  youtube_coverage: { type: 'string', description: 'From the scout: how many sizeable videos already cover it and their views. Heavy coverage with weak videos is opportunity; heavy coverage by strong videos is a red flag.' },
  coverage_score: { type: 'number', description: '0-10, high = room for a definitive version' },
  living_people_risk: { type: 'string' }, ad_suitability: { type: 'string' },
}, required: ['case', 'summary', 'doc_score', 'story_score', 'coverage_score'] }

const EPISODE = { type: 'object', properties: {
  title: { type: 'string' }, alt_titles: { type: 'array', items: { type: 'string' } },
  thumbnail: { type: 'string' }, alt_thumbnail: { type: 'string' },
  summary: { type: 'string' }, central_mystery: { type: 'string' }, opening_hook: { type: 'string' },
  turning_points: { type: 'array', items: { type: 'string' } }, why_watch: { type: 'string' },
  sequel: { type: 'string', description: 'standalone | sequel possible | part of series X' },
  key_sources: { type: 'array', items: { type: 'string' } },
}, required: ['title', 'thumbnail', 'summary', 'central_mystery', 'opening_hook', 'turning_points', 'why_watch', 'sequel'] }

const STORIES = { type: 'object', properties: {
  top10: { type: 'array', items: EPISODE },
  first_five: { type: 'array', items: { type: 'string' }, description: 'Titles from top10 in upload order, with one line on why that order' },
  series: { type: 'array', items: { type: 'object', properties: {
    name: { type: 'string' }, why_multipart: { type: 'string' },
    parts: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, covers: { type: 'string' }, payoff: { type: 'string' }, cliffhanger: { type: 'string', description: 'A real unresolved development from the case, or "none: final part"' } }, required: ['title', 'covers', 'payoff', 'cliffhanger'] } },
  }, required: ['name', 'why_multipart', 'parts'] } },
  beat_sheet_upload_one: { type: 'array', description: 'The first upload, section by section', items: { type: 'object', properties: {
    time: { type: 'string' }, beat: { type: 'string' }, narration_gist: { type: 'string' }, open_loops: { type: 'string' },
    visuals: { type: 'string', description: 'What is on screen and its source type: archival (licensed), public-domain record, map, motion graphic, labelled recreation' },
    sources: { type: 'array', items: { type: 'string' } } }, required: ['time', 'beat', 'narration_gist', 'visuals'] } },
}, required: ['top10', 'first_five', 'series', 'beat_sheet_upload_one'] }

const VERIFIED = { type: 'object', properties: {
  checks: { type: 'array', items: { type: 'object', properties: {
    episode: { type: 'string' }, claim: { type: 'string' },
    status: { type: 'string', description: 'conviction | court finding | official record | attributed allegation | contested | unsupported' },
    source: { type: 'string' }, fix: { type: 'string' } }, required: ['episode', 'claim', 'status'] } },
  episode_verdicts: { type: 'array', items: { type: 'object', properties: {
    title: { type: 'string' }, verdict: { type: 'string', description: 'go | go with changes | replace' }, legal_notes: { type: 'string' }, ad_suitability: { type: 'string' } }, required: ['title', 'verdict'] } },
  unverified: { type: 'array', items: { type: 'string' } },
}, required: ['checks', 'episode_verdicts'] }

const STRATEGY = { type: 'object', properties: {
  audience: { type: 'string' }, positioning: { type: 'string' },
  visual_identity: { type: 'string', description: 'Palette, type, map style, evidence-board and document style, motion language, how recreations are labelled' },
  thumbnail_system: { type: 'string' }, title_system: { type: 'string' },
  narration: { type: 'string', description: 'Voice character, pace (words per minute), how suspense is handled, what to avoid; music and sound design' },
  cadence: { type: 'string' }, shorts: { type: 'string' }, playlists: { type: 'string' },
  search_and_suggested: { type: 'string' }, retention_and_ctr: { type: 'string' },
  returning_viewers: { type: 'string' }, community_and_cross_promo: { type: 'string' },
  monetization: { type: 'string', description: 'Partner Program, advertiser-friendly limits quoted from YouTube\'s own page, sponsors, memberships, compilations, other platforms, licensing' },
  risks: { type: 'array', items: { type: 'string' } },
}, required: ['audience', 'visual_identity', 'thumbnail_system', 'narration', 'cadence', 'shorts', 'playlists', 'returning_viewers', 'monetization'] }

// ---------- prompts ----------
const marketPrompt = c => `${COMMON(c)}

MARKET. Work in ${YT}/network/ch-${c.n}/. Find what wins in this channel's niche on YouTube now. Run the scout for both periods on at least 10 queries covering the sub-genres in the brief (e.g. specific organisation types, "documentary", "full story", "rise and fall"), make two thumbnail sheets and look at them. Report: the dominant competitor channels and their style and length; patterns with evidence (titles and numbers from the files); how multipart series perform (find real part 1 / part 2 pairs and compare views); thumbnail traits; the length band that wins; and gaps.`

const casesPrompt = (c, market) => `${COMMON(c)}

MARKET FINDINGS
${JSON.stringify(market, null, 1)}

CASES. Propose 30 cases for this channel, then score each:
- doc_score: how much primary material exists. Check every case on CourtListener through the reader (count of opinions or dockets for the key names) and use Wikipedia's references as leads to primary sources.
- story_score: real characters, turns, betrayals, investigation and payoff, per the brief's storytelling standard.
- coverage_score: run the scout on the case name ("<case> documentary"). Heavy coverage by strong videos means a red flag; coverage only by weak videos, or none, means room for the definitive version.
- living_people_risk and ad_suitability (graphic violence, drugs and weapons limit ads).
Avoid cases chosen only for fame. Respect the boundaries with existing channels in the brief.`

const storiesPrompt = (c, market, cases) => `${COMMON(c)}

MARKET FINDINGS
${JSON.stringify(market, null, 1)}

SCORED CASES
${JSON.stringify(cases, null, 1)}

STORIES. You are the story architect. Using the brief's storytelling standard and episode structure:
1. top10: the ten strongest cases ranked by storytelling potential, weighed with documentation and coverage. For each: a title that truthfully reflects the story, two alternative titles, a thumbnail concept and an alternative, a short narrative summary, the central mystery, the opening hook (cold open), the major turning points in order, why the audience would watch, and whether it is standalone, supports a sequel, or belongs to a series. Key sources.
2. first_five: the first five uploads in order, and why that order builds a returning audience.
3. series: three multipart series. Only where the case truly carries several parts; each part must pay off on its own and end on a real unresolved development from the case. Do not split stories that work better whole.
4. beat_sheet_upload_one: the first upload broken into timed sections with narration gist, open loops and foreshadowing, visual direction for every section (state the source type: licensed archival, public-domain government record, map, motion graphic, labelled recreation), and sources.
Every fact must be something the sources support. No invented dialogue or quotes.`

const verifyPrompt = (c, stories) => `${COMMON(c)}

THE STORY ARCHITECT'S WORK
${JSON.stringify(stories, null, 1)}

VERIFY. You are the fact and legal reviewer. Assume the architect overstated things. For every named living person and every crime attributed to someone, determine whether it is a conviction, a court finding, an official record, an attributed allegation, contested, or unsupported. Check convictions and dates on CourtListener through the reader first, then use your rationed web searches on what remains. Flag anything that would be defamatory if wrong, any invented-sounding detail, and any hook or title that promises more than the record shows. For each top-10 episode give go / go with changes / replace, legal notes, and advertiser suitability (read YouTube's advertiser-friendly guidelines with ${READ} https://support.google.com/youtube/answer/6162278 --find violence drugs crime documentary). List what you could not verify.`

const strategyPrompt = (c, market, stories, verified) => `${COMMON(c)}

MARKET FINDINGS
${JSON.stringify(market, null, 1)}

STORY PLAN (titles and series only)
${JSON.stringify({ top10: (stories?.top10 || []).map(e => e.title), first_five: stories?.first_five, series: (stories?.series || []).map(s => s.name) }, null, 1)}

VERIFIER'S VERDICTS
${JSON.stringify(verified?.episode_verdicts || [], null, 1)}

STRATEGY. Write this channel's brand, growth and monetization strategy, specific to it and distinct from its two sister documentary channels: audience profile; positioning; visual identity (palette, type, maps, evidence boards and documents, motion, how recreations are labelled); thumbnail system and title system (accurate, curiosity without deception); narration identity (voice character, words per minute, suspense without melodrama, music and sound design); realistic cadence for 18-30 minute documentaries made by a small human-led team with AI assistance; Shorts strategy; playlist architecture; search and suggested-video strategy; retention and click-through analysis plan (what to measure, where viewers leave, what to change); returning-viewer strategy (series, recurring segments, release rhythm); community and cross-promotion within the network; monetization (Partner Program thresholds from ${READ} https://support.google.com/youtube/answer/72851, advertiser-friendly limits quoted from YouTube's own guidelines page, sponsors that fit crime content, memberships, compilations, other platforms, licensing); risks.`

// ---------- per-channel pipeline ----------
const channelWork = pipeline(
  CH,
  c => agent(marketPrompt(c), { label: `market:${c.n}`, phase: 'Market', schema: MARKET }),
  (market, c) => agent(casesPrompt(c, market), { label: `cases:${c.n}`, phase: 'Cases',
    schema: { type: 'object', properties: { cases: { type: 'array', items: CASE } }, required: ['cases'] } })
    .then(cases => ({ market, cases: cases?.cases || [] })),
  (mc, c) => agent(storiesPrompt(c, mc.market, mc.cases), { label: `stories:${c.n}`, phase: 'Stories', schema: STORIES })
    .then(stories => ({ ...mc, stories })),
  (mcs, c) => agent(verifyPrompt(c, mcs.stories), { label: `verify:${c.n}`, phase: 'Verify', schema: VERIFIED })
    .then(verified => ({ ...mcs, verified })),
  (all, c) => agent(strategyPrompt(c, all.market, all.stories, all.verified), { label: `strategy:${c.n}`, phase: 'Strategy', schema: STRATEGY })
    .then(strategy => ({ channel: c.n, label: c.label, ...all, strategy })),
)

// ---------- network tools research (independent of the channels, runs alongside) ----------
const toolsWork = agent(`This task has nothing to do with the website repository in the working directory; do not touch it or use git, and write no files.

You are researching production tools for an investigative documentary network (three crime documentary channels, 18-30 minute episodes) inside a faceless YouTube portfolio. Read the brief's "network" section in ${BRIEF}.

THE OWNER ALREADY HAS: a Runway workspace on the free plan with 750 credits. Its image models are available (nano-banana-pro, nano-banana-2.x, seedream-5-pro, ideogram, gen-4 image). Video, speech, music and sound-effect generation are locked behind a paid plan. Runway's speech uses an ElevenLabs v4 voice library. Reuse what exists before recommending anything new.

Research and report, with sources (web search is rationed: at most 20 searches; say what you could not verify):
1. VOICE: the best narration voice options for long documentary narration in 2026 (ElevenLabs direct, Runway's speech on a paid plan, others), naturalness for 20+ minute narration, commercial and YouTube-monetization licence terms, cloning the owner's own voice vs a stock voice, cost per finished 25-minute episode, and YouTube's AI-disclosure rules for synthetic voices (read ${READ} https://support.google.com/youtube/answer/14328491).
2. FOOTAGE AND PHOTOS: where licensed archival and news footage comes from (AP Archive, Getty, Reuters, Pond5, Storyblocks and others), typical costs, and what is public domain (US federal government works such as court exhibits and agency photos; caveats).
3. MUSIC AND SOUND: licensed music libraries safe for monetized YouTube (Content ID behaviour), costs.
4. EDITING AND ASSEMBLY: what a small team uses to assemble 25-minute documentaries with maps, documents and motion graphics, and which parts AI can do well today vs badly.
5. A recommended minimum stack and monthly cost, building on Runway first.`, { label: 'tools', phase: 'Tools' })

const [channels, tools] = await Promise.all([channelWork, toolsWork])
const done = channels.filter(Boolean)

phase('Network')
const network = await agent(`This task has nothing to do with the website repository in the working directory; do not touch it or use git, and write no files.

You are the production architect for an investigative documentary network (channels 11-13, of which the ones planned here are live first) inside an existing 13-channel faceless YouTube portfolio run by one owner with AI assistance. Read the brief in ${BRIEF}.

WHAT ALREADY EXISTS (reuse it; do not duplicate it):
- ytscout.mjs: YouTube outlier scouting (views / subscribers) by query and period. thumbsheet.mjs: thumbnail contact sheets.
- ytcheck.mjs and brandcheck.mjs, run by the naming agent workflow (agents/naming-agent.js): name clearance on YouTube, .com and US trademarks.
- readpage.py: reads YouTube's rules pages, court records (CourtListener) and Wikipedia (as a lead only), refusing anything else.
- A fact-check workflow pattern: checker, then an adversarial second checker, and apply_factcheck.py, which applies corrections only when the wording matches exactly once and records each change's reason and sources in channels.json history.
- A YouTube rules review workflow: reviewer, then a skeptic that keeps only rules quoted from YouTube's own pages.
- A growth workflow: scout, then strategist, then skeptic per channel, then a portfolio lead.
- channels.json: the single source of truth for every channel's kit, with change history. build.mjs renders the kit page, logos and banners; handoff.mjs writes instructions for Claude in Chrome to create channels.
- Runway (free plan, images only until upgraded). Claude in Chrome (connected on the owner's computer, for channel setup in YouTube Studio).
- Not existing: any narration, video assembly, editing, publishing or analytics automation.

THE THREE CHANNELS' PLANS
${JSON.stringify(done.map(d => ({ channel: d.channel, label: d.label, first_five: d.stories?.first_five, series: (d.stories?.series || []).map(s => s.name), cadence: d.strategy?.cadence, verdicts: d.verified?.episode_verdicts })), null, 1)}

TOOLS RESEARCH
${tools || '(not available)'}

DELIVER, in markdown under these headings:
1. INTEGRATION: how these documentary channels fit the existing operation; what is reused as-is, what is extended, and the genuine gaps.
2. PIPELINE: the owner's 18 stages (case discovery, topic research, case selection, source collection, fact-checking, story development, scriptwriting, script review, narration, visual sourcing, assembly, editing, thumbnails, SEO and metadata, final QC, publishing, analytics, optimisation). For each: who or what does it (existing tool or agent, new tool, or a person), whether it can be fully automated, needs human approval, or needs a new tool, and why.
3. QUALITY GATE: a scored checklist covering every item in the brief's quality_gate, with pass thresholds, who signs off, and the rule that nothing publishes because a workflow finished.
4. CAPACITY: realistic hours per 25-minute documentary for a small human-led team with AI help, and what that means for cadence across 3 documentary channels plus the 10 existing channels.
5. 90-DAY PLAN: simultaneous vs staggered launch (decide, with reasons), a week-by-week calendar for brand setup, channel setup, production, publishing, Shorts, audience development, measurement and workflow tuning.
6. RISKS: legal (defamation, privacy), YouTube policy (violent criminal organisations, graphic content, ad suitability), copyright, and how the pipeline controls each.`, { label: 'network', phase: 'Network' })

phase('Critic')
const critic = await agent(`This task has nothing to do with the website repository in the working directory; do not touch it or use git, and write no files.

You are the completeness critic. The owner gave a 16-point brief for its investigative documentary channels (this run covers only the channels listed below); read it in ${BRIEF} and hold the work below to it, point by point: channel concepts; naming (handled separately by the naming agent, so only check nothing here invented names); storytelling engine; episode structure; multipart series; research and fact-checking; visual production; voice and audio; thumbnails and titles; AI production and automation; growth and returning viewers; monetization; initial content (30 topics, top 10, first five, three series, and for every proposed episode a title, summary, central mystery, hook, turning points, why watch, sequel potential); 90-day plan; quality control; integration audit.

THE WORK
${JSON.stringify({ channels: done.map(d => ({ channel: d.channel, cases: d.cases?.length, top10: d.stories?.top10?.length, first_five: d.stories?.first_five, series: (d.stories?.series || []).map(s => ({ name: s.name, parts: s.parts?.length })), beat_sheet_sections: d.stories?.beat_sheet_upload_one?.length, verdicts: d.verified?.episode_verdicts, unverified: d.verified?.unverified, strategy_fields: Object.keys(d.strategy || {}) })), tools_research: !!tools, network_plan: network }, null, 1)}

Return: for each of the 16 points, covered / partly / missing with a one-line reason; then the specific gaps that must be filled before this goes to the owner, most important first.`, { label: 'critic', phase: 'Critic' })

return { channels, tools, network, critic }
