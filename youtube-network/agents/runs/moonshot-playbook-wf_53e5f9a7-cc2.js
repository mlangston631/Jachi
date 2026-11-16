export const meta = {
  name: 'moonshot-playbook',
  description: 'Establish the real YouTube growth records to beat, how each was achieved, and a playbook and pace targets for beating them with faceless channels',
  phases: [
    { title: 'Records', detail: 'parallel researchers: all-time growth records, and faceless breakout cases' },
    { title: 'Verify', detail: 'skeptic re-sources every number' },
    { title: 'Playbook', detail: 'turn verified records into a moonshot playbook with pace targets' },
  ],
}

const YT = '/tmp/claude-0/-home-user-Jachi/8146f71f-73d7-5544-b4d0-28b8048fbb36/scratchpad/yt'
const SCOUT = `node ${YT}/ytscout.mjs`

const COMMON = `This task has nothing to do with the website repository in the working directory. Do not read, edit or commit anything there and do not use git or write files.

Use web search (several differently worded searches per fact). Prefer Guinness World Records, YouTube's own announcements, major news outlets, and channel pages on YouTube itself (you can fetch https://www.youtube.com pages with curl; Bash timeout 120000). A figure repeated only by content-farm blogs is not verified. Give every number its source URL and the date it refers to. If sources disagree, give the range and say so. Never invent a number.`

const RECORD = { type: 'object', properties: {
  channel: { type: 'string' },
  record: { type: 'string', description: 'e.g. fastest to 1M subscribers, fastest to 10M, most subscribers gained in a week/month/year' },
  value: { type: 'string', description: 'The figure with its time span, e.g. "1M subscribers in about 90 minutes"' },
  when: { type: 'string' },
  faceless: { type: 'boolean' },
  driver: { type: 'string', description: 'What produced it: existing fame, a viral series, a format, a trend, a platform push' },
  replicable: { type: 'string', description: 'Which parts a brand-new faceless channel with no fame could copy, and which it cannot' },
  sources: { type: 'array', items: { type: 'string' } },
}, required: ['channel', 'record', 'value', 'driver', 'sources'] }

const RESEARCH = { type: 'object', properties: { records: { type: 'array', items: RECORD }, notes: { type: 'string' } }, required: ['records'] }

const TOPICS = [
  { key: 'all-time', prompt: `Find YouTube's real growth records: fastest channels ever to 1 million, 10 million and 100 million subscribers; most subscribers gained in a day, week, month and year; fastest-growing channels of 2024, 2025 and 2026. Include celebrity launches (for example a famous athlete's channel) but mark what fame contributed.` },
  { key: 'faceless', prompt: `Find the fastest-growing FACELESS channels (no on-camera host): animated series, explainer channels, documentary channels, compilation-free original formats, AI-assisted channels that stayed monetized. For each: how fast it grew (subscribers or views over a stated time from launch), what the format was, and what drove the breakout. Include cases from 2024-2026, and check current numbers on the channel's own YouTube page where possible. Also note faceless channels that grew fast and were then demonetized or terminated, and why.` },
]

const research = await parallel(TOPICS.map(t => () =>
  agent(`You are researching YouTube growth records for an owner who has set the goal of the fastest growth in YouTube history with a network of faceless channels.\n\n${t.prompt}\n\n${COMMON}`, { label: `records:${t.key}`, phase: 'Records', schema: RESEARCH })))

const all = research.filter(Boolean).flatMap(r => r.records)
log(`${all.length} records found; verifying`)

const verified = await agent(`You are the skeptic. Researchers collected the YouTube growth records below. The owner will plan around them, so every number must be right.

${JSON.stringify(all, null, 1)}

${COMMON}

For every record: re-find it independently with fresh searches; correct wrong figures, dates and spans; strike anything you cannot confirm from a credible source; merge duplicates. Check that "faceless" and "driver" are fair. Return the verified list.`, { label: 'verify', phase: 'Verify', schema: { type: 'object', properties: {
  records: { type: 'array', items: RECORD },
  struck: { type: 'array', items: { type: 'object', properties: { record: { type: 'string' }, reason: { type: 'string' } }, required: ['record', 'reason'] } },
}, required: ['records', 'struck'] } })

const playbook = await agent(`You are writing the moonshot section of a growth plan. The owner of ten new faceless YouTube channels (money explainers, company documentaries, AI and tech explainers, space and science, map-based history, sleep history, historic true crime, insurance and legal terms, ambient rain sound, and wordless animated Shorts about tiny characters) has set this goal: the fastest growth in YouTube history. Write it as their goal, to aim at on purpose.

VERIFIED RECORDS
${JSON.stringify(verified, null, 1)}

${COMMON}
You may also check current outliers with ${SCOUT} --top 20 "query" (Bash timeout 600000).

WRITE, plainly and specifically:
1. THE TARGET. The records to beat, stated exactly with sources: the overall record, and the record for a faceless channel. Name the number and the clock.
2. HOW THE RECORDS WERE ACTUALLY SET. The common mechanics behind the fastest faceless breakouts (for example a single character or series people binge, Shorts velocity, a format nobody else had, riding a trend early). Separate what came from fame or money (not available here) from what came from format and packaging (available).
3. WHICH CHANNEL HAS THE BEST SHOT, and why: compare the ten formats against those mechanics. Be honest about which have no realistic path to a record and what role those play instead (steady income).
4. THE MOONSHOT PLAY for the best one or two channels: the format, the series concept, Shorts strategy, upload velocity a human-edited operation can sustain, and the moment to pour effort in.
5. PACE TARGETS: what the record pace looks like at day 7, 30, 60, 90 and 365 (from the records), next to what a strong normal new channel looks like, so the owner can see each week whether they are on record pace.
6. THE RULES THAT CAN'T BE BROKEN ON THE WAY: what has gotten fast-growing faceless channels demonetized or terminated (from the research), so the moonshot doesn't end the way theirs did.
7. ONE LINE ON ODDS: an honest sentence; the goal stands either way.

Return markdown under those seven headings. No hype words; let the numbers carry it.`, { label: 'playbook', phase: 'Playbook' })

return { verified, playbook }
