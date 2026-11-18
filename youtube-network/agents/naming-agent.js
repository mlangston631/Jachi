export const meta = {
  name: 'naming-agent',
  description: 'The portfolio\'s naming agent: research competitors, invent names checked on YouTube as they go, score them with two independent judges, then clear the top three on YouTube, .com, US trademarks and the web, and recommend one per channel',
  whenToUse: 'Naming any new channel in the portfolio. Pass args: { channels: [{ n, label, briefFile }] }. The brief file must contain the channel\'s entry (concept, angle, tone, boundaries).',
  phases: [
    { title: 'Research', detail: 'competing channels and media brands in the niche, from YouTube itself' },
    { title: 'Invent', detail: 'candidates, each checked on YouTube while inventing' },
    { title: 'Judge', detail: 'two independent judges: brand and audience, language and risk' },
    { title: 'Clear', detail: 'YouTube, .com, US trademarks and web conflicts on the top three; recommend one' },
  ],
}

// History: this is the same namer -> skeptic/judges -> clearance method that named channels 1-10 (runs wf_bcc2df11-339
// and wf_09cf0248-f46), kept as one reusable file so every channel is named the same way. Changes since then: a research
// step first (the owner asked for competitor research), and clearance through brandcheck.mjs, which adds .com and US
// trademark checks on top of the unchanged YouTube checker.

// The project folder holding the tools. Pass args.root when the repository is checked out somewhere else.
const YT = (args && args.root) || '/home/user/Jachi/youtube-network'
const CHECK = `node ${YT}/ytcheck.mjs`
const BRAND = `node ${YT}/brandcheck.mjs`
const SCOUT = `node ${YT}/ytscout.mjs`

const CHANNELS = (args && args.channels) || []
if (!CHANNELS.length) throw new Error('naming-agent needs args.channels: [{ n, label, briefFile }]')

const COMMON = c => `This task has nothing to do with the website repository in the working directory. Do not read, edit or commit anything there and do not use git. Do not write files except under ${YT}/names/ch-${c.n}/.

You are naming channel ${c.n} (${c.label}) of a portfolio of faceless YouTube channels built to last for years. Read its full brief: the entry with "n": ${c.n} in ${c.briefFile}, plus the "network" section. Working labels like "A: blue-collar crime" are not names.

A strong name is: distinctive and ownable (not a generic phrase search results drown); typeable after hearing it once; a signal of the channel's world and tone; free of unfortunate meanings in English and Spanish; not confusable with a known brand, show, podcast, book or channel, especially in documentaries, true crime, news or finance; one to three words, handle 20 characters or fewer, no digits, no "TV/YT/HQ/Official/Channel". Sister channels in the network must each stand on their own, not read as sub-brands of one another.

Tools (Bash timeout 600000 for each; requests to YouTube are shared with other agents and queue):
  ${CHECK} "Name" ...       YouTube only: CLEAR / CROWDED / TAKEN / UNKNOWN. At most 6 names per call.
  ${BRAND} "Name" ...       full clearance: YouTube + .com (RDAP) + live US trademarks. CLEAR / CAUTION / BLOCKED / UNKNOWN.
  ${SCOUT} --top 20 "query" ... this year's most-viewed videos for a query, with channel names and subscriber counts.
Never report a verdict you did not see printed in your own run.`

const RESEARCH_SCHEMA = { type: 'object', properties: {
  competitors: { type: 'array', items: { type: 'object', properties: {
    channel: { type: 'string' }, subs: { type: 'number' }, naming_style: { type: 'string' } }, required: ['channel'] } },
  crowded_words: { type: 'array', items: { type: 'string' }, description: 'Words and patterns the niche has worn out' },
  open_territory: { type: 'string', description: 'Naming styles and imagery nobody in the niche owns yet' },
}, required: ['competitors', 'crowded_words', 'open_territory'] }

const CAND = { type: 'object', properties: { name: { type: 'string' }, why: { type: 'string' }, checker_verdict: { type: 'string' } }, required: ['name', 'why', 'checker_verdict'] }

const JUDGE_SCHEMA = { type: 'object', properties: { scores: { type: 'array', items: { type: 'object', properties: {
  name: { type: 'string' }, score: { type: 'number' }, reason: { type: 'string' } }, required: ['name', 'score', 'reason'] } } }, required: ['scores'] }

const LENSES = [
  { key: 'brand', brief: 'Judge as a brand strategist and as the target viewer scrolling past a thumbnail: would the right viewer trust and click; does it signal the channel\'s world and tone without explanation; memorable and distinctive; ownable in search; still right in ten years; clearly its own brand beside its sister channels.' },
  { key: 'language', brief: 'Judge as a linguist and risk reviewer: typeable after hearing it once (US and UK accents); misspellings and mishearings; unfortunate meanings, slang or jokes in English and Spanish; confusion with known brands, shows, podcasts, books, apps or channels; for crime channels, anything that reads as glamorising crime or as accusing real people.' },
]

const CLEAR_SCHEMA = { type: 'object', properties: {
  checked: { type: 'array', items: { type: 'object', properties: {
    name: { type: 'string' }, brandcheck: { type: 'string', description: 'Verdict printed by brandcheck in your own run, with its .com and trademark findings' },
    web_conflicts: { type: 'array', items: { type: 'string' } }, searches_run: { type: 'array', items: { type: 'string' } },
    verdict: { type: 'string', description: 'clean | minor | conflict | unverified' } },
    required: ['name', 'brandcheck', 'web_conflicts', 'verdict'] } },
  recommended: { type: 'string' }, reason: { type: 'string' },
  spare_handles: { type: 'array', items: { type: 'string' } },
  manual_checks: { type: 'array', items: { type: 'string' }, description: 'What the owner must still check by hand (social handles, non-US trademarks)' },
}, required: ['checked', 'recommended', 'reason'] }

const results = await pipeline(
  CHANNELS,
  c => agent(`${COMMON(c)}

RESEARCH FIRST. Map the competition before inventing anything: run the scout on 6-10 queries that this channel's audience types (for example the sub-genres in its brief), list the channels that dominate, note how they are named, which words and naming patterns are worn out, and what territory is open.`,
    { label: `research:${c.n}`, phase: 'Research', schema: RESEARCH_SCHEMA }),
  (research, c) => agent(`${COMMON(c)}

COMPETITOR RESEARCH (done by a colleague)
${JSON.stringify(research, null, 1)}

INVENT. Think from at least four different directions before checking anything (an unexpected pairing of real words, a rare or technical word that fits, an object or place metaphor, a coined word that is easy to say, an investigative or archival term turned sideways). Then check in batches with the YouTube checker and move away from whatever comes back taken. Keep going until you have at least 8 names that printed CLEAR and that you would score 8 or higher yourself, or about 45 checked. Return only those, best first.`,
    { label: `invent:${c.n}`, phase: 'Invent', schema: { type: 'object', properties: {
      candidates: { type: 'array', items: CAND }, checked_total: { type: 'integer' }, taken: { type: 'array', items: { type: 'string' } } }, required: ['candidates'] } })
    .then(inv => ({ research, candidates: (inv?.candidates || []).filter(x => /CLEAR/.test(x.checker_verdict)), taken: inv?.taken || [] })),
  async (pool, c) => {
    const list = pool.candidates.map(x => `- ${x.name}: ${x.why}`).join('\n')
    const votes = await parallel(LENSES.map(l => () => agent(`${COMMON(c)}

You are one of two independent judges; you will not see the other's scores. ${l.brief}
Score every candidate 0-10, using the whole scale: a merely available name with no spark is 5 or below.

CANDIDATES
${list}`, { label: `judge:${c.n}:${l.key}`, phase: 'Judge', schema: JUDGE_SCHEMA })))
    const table = pool.candidates.map(x => {
      const s = votes.map(v => (v?.scores || []).find(y => y.name.toLowerCase() === x.name.toLowerCase())).filter(Boolean)
      return { name: x.name, why: x.why, avg: s.length ? +(s.reduce((a, y) => a + y.score, 0) / s.length).toFixed(2) : 0,
        by_lens: s.map((y, i) => ({ lens: LENSES[i].key, score: y.score, reason: y.reason })) }
    }).sort((a, b) => b.avg - a.avg)
    return { ...pool, table }
  },
  (judged, c) => agent(`${COMMON(c)}

You are the last gate before this channel's name goes to the owner.

RANKED SHORTLIST (two-judge panel average)
${judged.table.slice(0, 3).map((r, i) => `${i + 1}. ${r.name} (${r.avg}): ${r.why}`).join('\n')}

FOR EACH, in order:
1. Run brandcheck on it. BLOCKED is out. CAUTION needs a reason it is still safe, or it is out.
2. Web search the exact name in quotes; then with "YouTube"; then with "documentary OR podcast OR series OR book". Record every existing user with its URL. A documentary, true-crime, news or finance brand, show, podcast or book using it is a conflict; a small unrelated business is minor. If web search refuses because a budget is used up, mark it unverified and do not work around the limit.
Recommend the highest-ranked name that brandcheck did not block and whose web verdict is clean or minor. For it, find two spare handles (for example "The" + name, or name + "Files" or "Docs"), run each through the YouTube checker as a name, and list two that print CLEAR. List the checks the owner must still do by hand (Instagram, TikTok and X handles; trademarks outside the US).`,
    { label: `clear:${c.n}`, phase: 'Clear', schema: CLEAR_SCHEMA })
    .then(cleared => ({ channel: c.n, label: c.label, research: judged.research, table: judged.table, taken: judged.taken, cleared })),
)
return results.map((r, i) => r || { channel: CHANNELS[i].n, failed: true })
