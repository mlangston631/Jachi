export const meta = {
  name: 'fact-check-first-scripts',
  description: 'Verify every factual claim in eight channel scripts and their video titles against sources, then try to refute the result',
  phases: [
    { title: 'Verify', detail: 'one agent per channel: list every checkable claim and source it' },
    { title: 'Refute', detail: 'one skeptic per channel: hunt for missed claims and wrong confirmations' },
  ],
}

const DIR = '/tmp/claude-0/-home-user-Jachi/8146f71f-73d7-5544-b4d0-28b8048fbb36/scratchpad/yt/factcheck'
const CHANNELS = [
  { n: 1, topic: 'compound interest, with worked figures' },
  { n: 2, topic: 'Kodak and the first digital camera' },
  { n: 3, topic: 'how a language model chooses its next word' },
  { n: 4, topic: 'what a light-year is' },
  { n: 5, topic: 'how the Roman Empire came to be divided' },
  { n: 6, topic: 'a night in a medieval Benedictine monastery' },
  { n: 7, topic: 'the 1911 theft of the Mona Lisa' },
  { n: 8, topic: 'what an insurance deductible is' },
]

const CLAIM = { type: 'object', properties: {
  quote: { type: 'string', description: 'The exact words from the script or title that carry the claim' },
  where: { type: 'string', description: '"script" or "title"' },
  verdict: { type: 'string', description: 'confirmed | wrong | oversimplified | disputed | unverifiable' },
  evidence: { type: 'string', description: 'What the sources actually say, with the specific figures or dates' },
  sources: { type: 'array', items: { type: 'string' }, description: 'URLs' },
  fix: { type: 'string', description: 'Replacement wording if anything should change, else empty' },
}, required: ['quote', 'where', 'verdict', 'evidence'] }

const VERIFY_SCHEMA = { type: 'object', properties: {
  claims: { type: 'array', items: CLAIM },
  notes: { type: 'string' },
}, required: ['claims'] }

const REFUTE_SCHEMA = { type: 'object', properties: {
  edits: { type: 'array', description: 'Every change the text needs. Empty if none.', items: { type: 'object', properties: {
    where: { type: 'string', description: '"script" or "title"' },
    quote: { type: 'string', description: 'Exact current wording, copied character for character from the file' },
    replace_with: { type: 'string', description: 'New wording in the same plain voice' },
    reason: { type: 'string' },
    sources: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'string', description: 'high | medium | low' },
  }, required: ['where', 'quote', 'replace_with', 'reason'] } },
  confirmed_claims: { type: 'integer', description: 'How many claims you independently agree are accurate as written' },
  missed_by_first_pass: { type: 'array', items: { type: 'string' } },
  publish_sources: { type: 'array', description: 'The four to eight best sources to list under the video, most authoritative first', items: { type: 'object', properties: {
    title: { type: 'string' }, url: { type: 'string' }, supports: { type: 'string' },
  }, required: ['title', 'url'] } },
  remaining_doubts: { type: 'array', items: { type: 'string' }, description: 'Anything still uncertain that the owner should know before recording' },
}, required: ['edits', 'publish_sources'] }

const COMMON = `This task has nothing to do with the website repository in the working directory. Do not read, edit or commit anything there, do not use git, and do not write or change any files.

Use web search for evidence. In this session, fetching most web pages directly is blocked by the network settings, so a failed fetch is not evidence of anything; rely on what search returns, and run several differently worded searches for anything important. Prefer primary and authoritative sources: museums, archives, space agencies, encyclopedias, university pages, regulators, the company's own history pages, major newspapers. A blog repeating a figure is not confirmation. For arithmetic, compute it yourself in a shell with Python and report the exact result.

The scripts are written in a deliberately plain, spoken style and round their numbers on purpose. Rounding that a careful expert would accept ("about nine and a half trillion kilometres") is fine. What matters: a wrong date, name, number, order of events or cause; a "first", "only" or "most" that isn't true; a contested account stated as settled fact; a simplification that would make a knowledgeable viewer wince.`

function verifyPrompt(c) {
  return `You are fact-checking the script for the first video of a new educational YouTube channel, on ${c.topic}, plus the channel's first ten video titles. The owner will record this and put their name to it, so a single wrong fact is a real cost.

Read ${DIR}/ch-${c.n}.json. Check the "script" text and every entry in "titles". Lines in [square brackets] are picture directions; on-screen text inside them counts as a claim too.

${COMMON}

Go through the script sentence by sentence and list EVERY checkable claim, including the ones you are sure of: each date, name, number, measurement, sequence, attribution and causal statement. For each title, check its factual premise (for example, that the event happened, the figure is right, the superlative holds).

For each claim give the exact quote, a verdict, what the sources say with specifics, the source URLs, and replacement wording when something should change. Keep fixes minimal and in the same voice.`
}

function refutePrompt(c, first) {
  return `You are the second, adversarial fact-checker for the first video script of a new educational YouTube channel, on ${c.topic}, plus its first ten video titles. A first checker has already gone through it. Assume they were too generous. Your job is to find what is still wrong.

Read ${DIR}/ch-${c.n}.json for the text ("script" and "titles").

THE FIRST CHECKER'S FINDINGS
${JSON.stringify(first && first.claims ? first.claims : [], null, 1)}
${first && first.notes ? 'Their notes: ' + first.notes : ''}

${COMMON}

DO THREE THINGS
1. Attack the confirmations. For every claim marked confirmed that involves a number, date, name, superlative or cause, search again independently, in different words, and see whether you can find an authoritative source that contradicts it or shows it is contested.
2. Find what they missed. Reread the script and titles yourself and look for claims not on their list, including things implied by on-screen text and by the titles.
3. Judge their proposed fixes. A fix that introduces a new error is worse than the original.

Then return the final list of edits the text needs: each with the exact current wording copied character for character from the file, the replacement, the reason, sources and your confidence. Only include an edit when the current wording is wrong, contested, or misleading; do not rewrite for style. If the text is accurate, return no edits.

Also return publish_sources: the four to eight best sources to list under the video so viewers can check it, most authoritative first. And remaining_doubts: anything you could not settle.`
}

const results = await pipeline(
  CHANNELS,
  c => agent(verifyPrompt(c), { label: `verify:${c.n} ${c.topic}`, phase: 'Verify', schema: VERIFY_SCHEMA }),
  (first, c) => agent(refutePrompt(c, first), { label: `refute:${c.n} ${c.topic}`, phase: 'Refute', schema: REFUTE_SCHEMA })
    .then(final => ({ channel: c.n, topic: c.topic, first_pass_claims: first && first.claims ? first.claims.length : 0,
      first_pass_flagged: first && first.claims ? first.claims.filter(x => x.verdict !== 'confirmed') : [], final })),
)
const out = results.map((r, i) => r || { channel: CHANNELS[i].n, topic: CHANNELS[i].topic, final: null })
const failed = out.filter(r => !r.final).map(r => r.channel)
if (failed.length) log(`No fact-check result for channels: ${failed.join(', ')}`)
return out
