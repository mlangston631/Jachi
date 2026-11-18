export const meta = {
  name: 'growth-engine',
  description: 'Scrape what is winning on YouTube in each niche, build an evidence-based growth and monetization plan per channel, strip anything misleading or risky, then plan the ten as one portfolio',
  phases: [
    { title: 'Scout', detail: 'one agent per channel: pull this year and this month winners, outlier ratios and thumbnails from YouTube' },
    { title: 'Strategy', detail: 'one strategist per channel: packaging, hooks, Shorts, cadence, monetization' },
    { title: 'Scrutiny', detail: 'one skeptic per plan: evidence, honesty, policy risk, feasibility' },
    { title: 'Portfolio', detail: 'launch order and shared production plan across all ten' },
  ],
}

const YT = '/tmp/claude-0/-home-user-Jachi/8146f71f-73d7-5544-b4d0-28b8048fbb36/scratchpad/yt'
const SCOUT = `node ${YT}/ytscout.mjs`
const SHEET = `NODE_PATH=$(npm root -g) node ${YT}/thumbsheet.mjs`
const READ = `python3 -I ${YT}/readpage.py`

const CH = [
  { n: 1, what: 'stick-figure money and economics explainers', seeds: ['economics explained', 'how money works', 'stick figure explained finance', 'inflation explained', 'why is everything so expensive', 'how banks make money'] },
  { n: 2, what: 'documentaries about how real companies rose and collapsed', seeds: ['rise and fall of company', 'business documentary', 'why company failed', 'what happened to brand', 'corporate collapse documentary', 'how company went bankrupt'] },
  { n: 3, what: 'plain-words explainers of how AI and everyday technology work', seeds: ['how AI works explained', 'how chatgpt works', 'how computers work', 'technology explained simply', 'how does the internet work', 'AI explained for beginners'] },
  { n: 4, what: 'space and science questions answered with real numbers', seeds: ['space documentary', 'how big is the universe', 'what if the sun disappeared', 'black hole explained', 'science explained', 'space facts'] },
  { n: 5, what: 'history documentaries told with animated maps', seeds: ['history explained map', 'animated history', 'why empire collapsed', 'history of every country', 'rise and fall of empire', 'geography explained'] },
  { n: 6, what: 'multi-hour calm history narration for falling asleep', seeds: ['history for sleep', 'boring history for sleep', 'fall asleep to history', 'sleep documentary', 'medieval life sleep', 'bedtime stories for adults history'] },
  { n: 7, what: 'historic true crime told from court records: heists, frauds, hoaxes', seeds: ['heist documentary', 'greatest heist', 'fraud documentary', 'art theft story', 'con man story', 'true crime history'] },
  { n: 8, what: 'plain-English explainers of insurance, legal and real-estate terms', seeds: ['insurance explained', 'how insurance works', 'escrow explained', 'legal terms explained', 'real estate closing explained', 'deductible explained'] },
  { n: 9, what: 'hours-long ambient rain and sleep sound, no voice', seeds: ['rain sounds for sleeping', 'rain sounds black screen', 'thunderstorm sounds sleep', 'rain on roof sleep', 'ambient sounds study', 'brown noise rain'] },
  { n: 10, what: 'wordless 3D-animated Shorts about tiny original characters', seeds: ['animated short film', '3d animation short', 'cute animation shorts', 'wholesome animation', 'pixar style short', 'no dialogue animation'] },
]

const EVIDENCE = { type: 'object', properties: {
  title: { type: 'string' }, channel: { type: 'string' }, views: { type: 'number' }, subs: { type: 'number' },
  outlier: { type: 'number' }, length_min: { type: 'number' }, age_days: { type: 'number' },
}, required: ['title', 'views'] }

const SCOUT_SCHEMA = { type: 'object', properties: {
  queries_run: { type: 'array', items: { type: 'string' } },
  videos_examined: { type: 'integer' },
  patterns: { type: 'array', items: { type: 'object', properties: {
    pattern: { type: 'string', description: 'A specific, repeatable lesson: a topic cluster, title shape, angle, length band, thumbnail trait' },
    kind: { type: 'string', description: 'topic | title | length | thumbnail | format | timing' },
    strength: { type: 'string', description: 'strong (5+ independent outliers on different channels) | medium (2-4) | weak (1)' },
    evidence: { type: 'array', items: EVIDENCE },
  }, required: ['pattern', 'kind', 'strength', 'evidence'] } },
  thumbnail_notes: { type: 'string', description: 'What the winning thumbnails in the contact sheets have in common, concretely' },
  saturation: { type: 'string', description: 'How crowded the niche is with big channels vs room for new ones, from the data' },
  gaps: { type: 'array', items: { type: 'string' }, description: 'Topics with demand (strong outliers) but few good videos' },
  files: { type: 'array', items: { type: 'string' } },
}, required: ['patterns', 'saturation'] }

const PLAN_SCHEMA = { type: 'object', properties: {
  promise: { type: 'string', description: 'One sentence a viewer would repeat: what this channel gives them that others do not' },
  format: { type: 'string', description: 'Length band, structure, visual style, and why the data supports it' },
  videos: { type: 'array', description: 'First 20 videos, in upload order', items: { type: 'object', properties: {
    title: { type: 'string' },
    thumbnail: { type: 'string', description: 'Concrete concept: 1-4 words of text if any, the single subject, colours, composition' },
    hook: { type: 'string', description: 'The first 10-15 seconds, as spoken or shown' },
    why: { type: 'string', description: 'Which scout pattern or gap it rides, with the evidence' },
    needs_fact_check: { type: 'boolean' },
  }, required: ['title', 'thumbnail', 'why'] } },
  shorts: { type: 'string', description: 'How Shorts feed the long videos (or, for a Shorts channel, how to build series and return viewers)' },
  cadence: { type: 'string', description: 'Uploads per week that one person could sustain alongside nine other channels, and the production steps per video' },
  monetization: { type: 'array', items: { type: 'object', properties: {
    stream: { type: 'string' }, when: { type: 'string', description: 'At what stage it becomes realistic' }, how: { type: 'string' }, caution: { type: 'string' },
  }, required: ['stream', 'when', 'how'] } },
  milestones: { type: 'string', description: 'What to measure at 30, 60 and 90 days and what to change if it is not working. No promised numbers.' },
  risks: { type: 'array', items: { type: 'string' } },
}, required: ['promise', 'format', 'videos', 'cadence', 'monetization'] }

const FINAL_SCHEMA = { type: 'object', properties: {
  plan: PLAN_SCHEMA,
  changes: { type: 'array', items: { type: 'string' }, description: 'What you changed in the strategist\'s plan and why' },
  struck_titles: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, reason: { type: 'string' } }, required: ['title', 'reason'] } },
  confidence: { type: 'string', description: 'How strong the evidence behind this plan is, plainly' },
}, required: ['plan', 'changes'] }

const COMMON = `This task has nothing to do with the website repository in the working directory. Do not read, edit or commit anything there and do not use git. You may write files ONLY inside ${YT}/growth/ (your channel's own folder).

The channel names are still being chosen, so never put a channel name in titles or thumbnails.

THE OWNER'S GOAL: channels that grow fast and earn well for years. What actually gets that on YouTube: viewers click (packaging: title plus thumbnail), stay (hook and retention), and come back (a clear promise and series). What destroys it: YouTube's "inauthentic content" rule (mass-produced or templated videos lose monetization on the whole channel), its reused content rule, misleading titles or thumbnails, and anything that reads as financial, legal or medical advice. One bad channel can also put the owner's other channels at risk. Fast and durable, never fast and fragile.`

function scoutPrompt(c) {
  return `You are the scout for a new faceless YouTube channel: ${c.what}. Find out, from YouTube's own data, what is winning in this niche right now.

${COMMON}

TOOLS
  ${SCOUT} [--period year|month] [--top 20] "query" "query" ...   > file.json
    YouTube search, filtered to videos uploaded this year (or this month), sorted by views, with each uploader's subscriber
    count and the outlier ratio (views / subscribers; only for videos with 10,000+ views). A high ratio means YouTube pushed
    that video to people who don't subscribe: the strongest signal of a topic, title and thumbnail that work.
  ${SHEET} file.json sheet.png [--top 20]
    One picture of the top outliers' thumbnails with their numbers. Open it with the Read tool and study it.
Run Bash calls with timeout 600000; requests are shared with other agents and queue.

DO THIS
1. Work in ${YT}/growth/ch-${c.n}/ (create it).
2. Run the seed queries for both periods: ${c.seeds.map(s => `"${s}"`).join(', ')}. Then run at least six more queries of your own, chosen from what the first results reveal (specific sub-topics, angles and phrasings that the outliers use).
3. Make contact sheets of the best outliers (at least two sheets: this year and this month) and look at them.
4. Extract the patterns: topics, title shapes (questions, numbers, "why", "how", claims), length bands, thumbnail traits, formats. Rate each pattern's strength by how many independent outliers on different channels support it, and attach the evidence (real titles and numbers from the files). Ignore videos from celebrity, news or brand channels whose reach comes from fame, not packaging.
5. Note saturation (how many huge channels own the niche) and gaps (topics with strong outliers but few good videos).
Report only what the data shows. Never invent a number.`
}

function strategyPrompt(c, scout) {
  return `You are the growth strategist for a new faceless YouTube channel: ${c.what}.

${COMMON}

The channel's current kit (description, ten draft titles, first script) is in ${YT}/factcheck/ch-${c.n}.json. Treat it as a starting point, not a constraint.

THE SCOUT'S FINDINGS (from YouTube's own data, this year and this month)
${JSON.stringify(scout, null, 1)}
The scout's files and contact sheets are in ${YT}/growth/ch-${c.n}/ (look at the sheets with the Read tool). You may run the scout tool yourself for more data: ${SCOUT} --top 20 "query" (Bash timeout 600000).

BUILD THE PLAN
- promise: one sentence a viewer would repeat.
- format: length band, structure and visual style, justified by the data.
- videos: the first 20, in upload order. Each title must be something the video truly delivers; curiosity is good, deception is not. Ride the strong patterns and gaps; lead with the ideas that have the strongest evidence. A thumbnail concept for each (few or no words, one subject, high contrast) and the hook (first 10-15 seconds) for each. Mark which titles carry factual claims needing a check.
- shorts: how Shorts feed the channel.
- cadence: realistic for one person running ten channels with AI-assisted production, but with a human writing or editing every video, because templated mass production is exactly what YouTube demonetizes. Say the production steps.
- monetization: every stream that fits this niche (YouTube Partner Program, memberships, affiliate, sponsorships, digital products, licensing), when each becomes realistic, how, and cautions. For Partner Program thresholds, quote YouTube's current official numbers using ${READ} https://support.google.com/youtube/answer/72851 (Bash timeout 120000).
- milestones: what to measure at 30, 60 and 90 days (click-through rate, average view duration, returning viewers) and what to change if it underperforms. Do not promise numbers.
- risks.`
}

function scrutinyPrompt(c, scout, plan) {
  return `You are the skeptic for a growth plan for a new faceless YouTube channel: ${c.what}. The owner will act on this plan for months, so anything weak, dishonest or risky in it is a real cost. Assume the strategist was too optimistic.

${COMMON}

THE SCOUT'S FINDINGS
${JSON.stringify(scout, null, 1)}

THE PLAN
${JSON.stringify(plan, null, 1)}

CHECK EVERYTHING
1. Evidence: does each "why" match what the scout data really shows? Re-run ${SCOUT} --top 20 "query" (Bash timeout 600000) on the three or four most important claims. Drop or rework ideas resting on weak or misread evidence.
2. Honesty: would a viewer feel tricked by any title or thumbnail after watching? Does any title promise more than the video can show? YouTube treats misleading metadata and thumbnails as a policy problem; read YouTube's own words with ${READ} on its spam, deceptive practices and scams policy (search for the page; Bash timeout 120000). Strike or rewrite offenders.
3. Facts: flag any title whose premise is shaky. Use web search on anything doubtful.
4. Policy risk: anything that reads as financial, legal or medical advice; anything templated enough to look mass-produced across 20 videos; reused-content risk; for kids-appeal content, the made-for-kids question.
5. Feasibility: can one person running ten channels actually make this at that cadence and quality? Correct it if not.
6. Monetization: quote-check the Partner Program thresholds against YouTube's page; cut streams that do not fit.
Return the corrected plan in full (same structure), what you changed, the titles you struck with reasons, and an honest confidence statement.`
}

function portfolioPrompt(finals) {
  return `You are the portfolio lead for ten new faceless YouTube channels owned by one person on one Google account. Each channel now has a scrutinised growth plan. Plan them as one business.

${COMMON}

THE TEN PLANS (channel numbers 1-10)
${JSON.stringify(finals, null, 1)}

DECIDE AND EXPLAIN
- launch_order: which channels to start first, second and later, using the scout evidence (outlier strength, saturation, gaps), earning potential, production cost per video and policy risk. Starting every channel at once usually means ten weak channels; say how many to run at once and when to add the next.
- weekly_schedule: a realistic week for one person with AI-assisted production, across the channels that are live.
- shared_pipeline: research, scripting, voice, visuals, editing and packaging steps that can be shared across channels without making the videos templated or alike.
- kill_or_double: the rules for deciding at 90 days which channels to double down on and which to pause.
- account_safety: how to keep one channel's problem from affecting the others (separate Brand Accounts, no cross-posting the same video, etc.).
Return plain prose under those five headings, specific and short.`
}

const finals = await pipeline(
  CH,
  c => agent(scoutPrompt(c), { label: `scout:${c.n}`, phase: 'Scout', schema: SCOUT_SCHEMA }),
  (scout, c) => agent(strategyPrompt(c, scout), { label: `strategy:${c.n}`, phase: 'Strategy', schema: PLAN_SCHEMA }).then(plan => ({ scout, plan })),
  (sp, c) => agent(scrutinyPrompt(c, sp.scout, sp.plan), { label: `scrutiny:${c.n}`, phase: 'Scrutiny', schema: FINAL_SCHEMA })
    .then(final => ({ channel: c.n, what: c.what, scout: sp.scout, final })),
)

const done = finals.filter(Boolean)
const missing = CH.filter((c, i) => !finals[i]).map(c => c.n)
if (missing.length) log(`No finished plan for channels: ${missing.join(', ')}`)

phase('Portfolio')
const summary = done.map(f => ({ channel: f.channel, what: f.what, saturation: f.scout?.saturation, gaps: f.scout?.gaps,
  strong_patterns: (f.scout?.patterns || []).filter(p => p.strength === 'strong').map(p => p.pattern),
  promise: f.final?.plan?.promise, format: f.final?.plan?.format, cadence: f.final?.plan?.cadence,
  monetization: f.final?.plan?.monetization, risks: f.final?.plan?.risks, confidence: f.final?.confidence }))
const portfolio = done.length ? await agent(portfolioPrompt(summary), { label: 'portfolio', phase: 'Portfolio' }) : null

return { channels: finals, portfolio }
