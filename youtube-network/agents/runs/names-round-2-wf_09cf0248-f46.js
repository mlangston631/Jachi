export const meta = {
  name: 'names-round-2',
  description: 'Fresh names for the four weakest channels, a two-judge panel scoring every candidate, then a web conflict check and fresh YouTube check on each channel\'s top three',
  phases: [
    { title: 'Rename', detail: 'new namers for channels 1, 2, 7, 8, learning from the skeptics\' critiques' },
    { title: 'Judge', detail: 'two independent judges per channel: brand and audience, language and risk' },
    { title: 'Clear', detail: 'web conflict search plus a fresh YouTube check on the top three; pick one with two spare handles' },
  ],
}

const YT = '/tmp/claude-0/-home-user-Jachi/8146f71f-73d7-5544-b4d0-28b8048fbb36/scratchpad/yt'
const CHECK = `node ${YT}/ytcheck.mjs`
const INPUT = `${YT}/names/round2_input.json`
const WEAK = [1, 2, 7, 8]
const CHANNELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const COMMON = `This task has nothing to do with the website repository in the working directory. Do not read, edit or commit anything there, do not use git, and do not write files.

The owner is building ten faceless YouTube channels to last for years. A channel name has to be: distinctive and ownable (not a generic phrase that search results drown); typeable after hearing it once (no ambiguous spellings, no "and/&" doubt, no rare words people can't spell); a hint of the subject or feeling; free of unfortunate meanings in English and Spanish; not confusable with a known brand, especially in media, education, finance, law or the channel's own subject; one to three words, handle 20 characters or fewer, no digits, no "TV/YT/HQ/Official/Channel".

THE CHECKER (asks YouTube itself): ${CHECK} "Name One" "Name Two" ...  (at most 6 names per call; Bash timeout 600000)
  CLEAR = handle and "The"+handle free, and no same or near-same channel name in YouTube search. CROWDED, TAKEN or UNKNOWN = not clear.
  Never call a name clear unless the checker printed CLEAR for that exact name in your own run.

The full round-1 record for every channel (niche, tagline, candidates with why, skeptic scores and critiques, and names already found taken) is in ${INPUT}. Read your channel's entry.`

const CAND = { type: 'object', properties: { name: { type: 'string' }, why: { type: 'string' }, checker_verdict: { type: 'string' } }, required: ['name', 'why', 'checker_verdict'] }

function renamePrompt(n) {
  return `Round 1 of naming channel ${n} produced only middling names (the best scored 6 to 6.5 out of 10). You are round 2.

${COMMON}

Study the skeptic's critiques of round 1 in channel ${n}'s entry: they are the most useful thing in the file. The recurring failures were: names that read as a different niche (art shop, gardening, local history), names that only work once explained, puns that sound like a weaker version of a known phrase, generic phrases the channel could never own in search, and "X and Y" constructions.

Produce at least 6 names that the checker prints CLEAR for and that you would score 8 or higher yourself on the criteria above. Aim for names that instantly signal the channel's world AND are unmistakably its own. Check in batches; when names come back taken, move further from the obvious. Stop at about 40 checked. Return only CLEAR names you stand behind, best first.`
}

const JUDGE_SCHEMA = { type: 'object', properties: {
  scores: { type: 'array', items: { type: 'object', properties: {
    name: { type: 'string' }, score: { type: 'number', description: '0-10' }, reason: { type: 'string', description: 'One or two sentences: the decisive strength and weakness' },
  }, required: ['name', 'score', 'reason'] } },
}, required: ['scores'] }

const LENSES = [
  { key: 'brand', brief: 'You judge as a brand strategist and as the target viewer scrolling past a thumbnail. Weigh: would this name make the right viewer trust and click; does it signal the channel\'s world without explanation; is it memorable and distinctive; can the channel own it in search; will it still fit in ten years as the channel grows.' },
  { key: 'language', brief: 'You judge as a linguist and risk reviewer. Weigh: can someone type it after hearing it once (US and UK accents); misspellings and mishearings; unfortunate meanings, slang or jokes in English and Spanish; confusion with well-known brands, products, shows, apps or channels you know of; pronunciation for non-native speakers.' },
]

function judgePrompt(n, lens, candidates) {
  return `You are one of two independent judges scoring candidate names for channel ${n}. You will not see the other judge's scores.

${COMMON}

${lens.brief}

Score every candidate 0-10 on your lens. Be discriminating: use the whole scale, and a merely available name with no spark should score 5 or below. The round-1 skeptic scores in the file are context, not an anchor.

CANDIDATES
${candidates.map(c => `- ${c.name}: ${c.why}`).join('\n')}`
}

const CLEAR_SCHEMA = { type: 'object', properties: {
  checked: { type: 'array', items: { type: 'object', properties: {
    name: { type: 'string' },
    checker_verdict: { type: 'string', description: 'From your own fresh run' },
    web_conflicts: { type: 'array', items: { type: 'string' }, description: 'Each existing user of the name found by web search, with URL; empty if none found' },
    searches_run: { type: 'array', items: { type: 'string' } },
    verdict: { type: 'string', description: 'clean | minor (unrelated small business in another field) | conflict | unverified (search did not run)' },
  }, required: ['name', 'checker_verdict', 'web_conflicts', 'searches_run', 'verdict'] } },
  pick: { type: 'string', description: 'The highest-ranked name whose verdict is clean or minor and whose checker verdict is CLEAR; empty if none' },
  pick_reason: { type: 'string' },
  spare_handles: { type: 'array', items: { type: 'string' }, description: 'Two spare @handles for the pick, each confirmed free by the checker' },
}, required: ['checked', 'pick'] }

function clearPrompt(n, ranked) {
  return `You are the last gate before channel ${n}'s name is given to the owner. The names below are ranked best first by a two-judge panel.

${COMMON}

RANKED SHORTLIST
${ranked.map((r, i) => `${i + 1}. ${r.name} (panel average ${r.avg})`).join('\n')}

FOR EACH NAME, in order:
1. Run the checker on it yourself now. Not CLEAR means out.
2. Web search the exact name in quotes, then the name with "YouTube", and the name with "company OR brand OR podcast OR book OR app". Record every existing user with its URL. A known brand, show, podcast, book, app or channel in media, education or the channel's subject is a conflict. A small business in an unrelated field is minor.
3. If web search refuses because a budget is used up, mark the verdict unverified. Do not work around the limit with other tools.
Then pick the highest-ranked name that is CLEAR and clean or minor. For the pick, find two spare handles (for example "The" + name, or name + "Studio" or "Stories" or "Works"), run each through the checker as a name (e.g. "Errandlings Studio"), and list two that come back CLEAR as @handles.`
}

const fileCandidates = n => agent(`Read ${INPUT}. Return channel ${n}'s round-1 candidates exactly as listed there (name and why), with checker_verdict "CLEAR" for each, since every round-1 candidate in the file was printed CLEAR by the checker. Do not add, drop or rename any.`, {
  label: `load:${n}`, phase: 'Rename', effort: 'low',
  schema: { type: 'object', properties: { candidates: { type: 'array', items: CAND } }, required: ['candidates'] },
})

const results = await pipeline(
  CHANNELS,
  async n => {
    const r1 = (await fileCandidates(n))?.candidates || []
    if (!WEAK.includes(n)) return { r1, r2: [] }
    const r2 = await agent(renamePrompt(n), { label: `rename:${n}`, phase: 'Rename',
      schema: { type: 'object', properties: { candidates: { type: 'array', items: CAND }, checked_total: { type: 'integer' }, notes: { type: 'string' } }, required: ['candidates'] } })
    return { r1, r2: (r2?.candidates || []).filter(c => /CLEAR/.test(c.checker_verdict)), r2notes: r2?.notes }
  },
  async (pool, n) => {
    const seen = new Set()
    const candidates = [...pool.r2, ...pool.r1].filter(c => c?.name && !seen.has(c.name.toLowerCase()) && seen.add(c.name.toLowerCase()))
    const verdicts = await parallel(LENSES.map(l => () =>
      agent(judgePrompt(n, l, candidates), { label: `judge:${n}:${l.key}`, phase: 'Judge', schema: JUDGE_SCHEMA })))
    const table = candidates.map(c => {
      const s = verdicts.map(v => (v?.scores || []).find(x => x.name.toLowerCase() === c.name.toLowerCase())).filter(Boolean)
      const avg = s.length ? +(s.reduce((a, x) => a + x.score, 0) / s.length).toFixed(2) : 0
      return { name: c.name, why: c.why, round: pool.r2.includes(c) ? 2 : 1, avg, by_lens: s.map((x, i) => ({ lens: LENSES[i]?.key, score: x.score, reason: x.reason })) }
    }).sort((a, b) => b.avg - a.avg)
    return { table, r2notes: pool.r2notes }
  },
  async (judged, n) => {
    const top = judged.table.slice(0, 3)
    const cleared = await agent(clearPrompt(n, top), { label: `clear:${n}`, phase: 'Clear', schema: CLEAR_SCHEMA })
    return { channel: n, table: judged.table, cleared, r2notes: judged.r2notes }
  },
)
return results.map((r, i) => r || { channel: CHANNELS[i], failed: true })
