export const meta = {
  name: 'youtube-rules-review',
  description: 'Check each channel kit and the ten-channels-on-one-account plan against YouTube\'s official rules, then have skeptics strike anything not in YouTube\'s own words',
  phases: [
    { title: 'Review', detail: 'one reviewer per channel plus one for the shared Google account' },
    { title: 'Prove', detail: 'one skeptic per review: keep only findings quoted from official YouTube pages' },
  ],
}

const YT = '/tmp/claude-0/-home-user-Jachi/8146f71f-73d7-5544-b4d0-28b8048fbb36/scratchpad/yt'
const READ = `python3 -I ${YT}/readpage.py`

const ITEMS = [
  { key: 'ch1', n: 1, focus: 'money and economics explainers drawn with stick figures. Watch: anything that reads as financial advice, YMYL/misinformation rules, AI voice or AI persona rules for finance topics, inauthentic (templated) content risk for a drawn-explainer format.' },
  { key: 'ch2', n: 2, focus: 'documentaries about real companies (Kodak, Nokia, Lehman Brothers). Watch: use of company logos, archive photos and news footage (copyright and reused content), naming real living people, sensitive events.' },
  { key: 'ch3', n: 3, focus: 'AI and technology explainers. Watch: disclosure of altered or synthetic content if AI visuals or voice are used, inauthentic content, claims about real products.' },
  { key: 'ch4', n: 4, focus: 'space and science explainers. Watch: use of NASA/ESA imagery and footage (licensing, reused content), misinformation rules, AI-generated realistic space imagery disclosure.' },
  { key: 'ch5', n: 5, focus: 'history documentaries with animated maps. Watch: graphic violence in historical war content, age restriction, educational/documentary context exceptions, map and borders sensitivity, reused archive material.' },
  { key: 'ch6', n: 6, focus: 'multi-hour sleep history narration. Watch: long videos (length limits, verification needed above 15 minutes), mid-roll ad placement on sleep content, AI narration voice, inauthentic content for long low-variation formats, made-for-kids classification of bedtime content.' },
  { key: 'ch7', n: 7, focus: 'historic true crime told from court records (art thefts, frauds, heists). Watch: violent or graphic content policy, harassment of real people and victims, advertiser-friendly guidelines for crime topics, use of real mugshots and newspaper scans.' },
  { key: 'ch8', n: 8, focus: 'plain-English explainers of legal, insurance and real-estate terms. Watch: financial and legal advice, AI personas giving advice on sensitive topics, required disclaimers, YMYL, anything implying licensed professional advice.' },
  { key: 'ch9', n: 9, focus: 'hours-long ambient rain and sleep sound with a still image or black screen and no voice. Watch: reused content, inauthentic/repetitive content, monetization eligibility of static-image long videos, music and sound licensing, Content ID, made-for-kids classification.' },
  { key: 'ch10', n: 10, focus: 'wordless 3D-animated Shorts about tiny original characters, family friendly. Watch: made-for-kids (COPPA) classification and its effects (personalised ads, comments, notifications, Shorts monetization), YouTube Kids, quality principles for kids content, AI-generated animation disclosure, inauthentic content for animated series.' },
  { key: 'account', n: 0, focus: 'ACCOUNT LEVEL, not a single channel: one person running ten channels from one Google account using Brand Accounts. Find YouTube\'s own words on: how many channels one account can have; phone verification (how many channels one phone number can verify, and over what period); YouTube Partner Program eligibility per channel and the current thresholds for long-form and Shorts; whether several channels can share one AdSense account; how a strike, a monetization removal or a termination on one channel affects other channels owned or managed by the same person ("related channels", circumvention); 2-Step Verification requirements for monetized channels; anything that treats many similar channels from one owner as spam or inauthentic.' },
]

const FINDING = { type: 'object', properties: {
  topic: { type: 'string', description: 'Short label, e.g. "Made for kids", "Reused content", "Phone verification limit"' },
  official_quote: { type: 'string', description: 'Exact words copied from the official page via the reader. Empty only if the finding is marked unofficial.' },
  source_url: { type: 'string' },
  status: { type: 'string', description: 'official (quoted from support.google.com or blog.youtube) | unofficial (only third-party sources say it)' },
  applies: { type: 'string', description: 'How it applies to this channel or plan, concretely' },
  severity: { type: 'string', description: 'blocker (would stop monetization or risk the channel/account) | change (the kit text must change) | setting (a choice to make during setup) | habit (a rule to follow when making videos)' },
  action: { type: 'string', description: 'Exactly what the owner should do, in one or two plain sentences' },
  kit_edit: { type: 'object', properties: {
    field: { type: 'string', description: 'description | titles | script' },
    quote: { type: 'string', description: 'Exact current wording from the kit file' },
    replace_with: { type: 'string' },
  } },
}, required: ['topic', 'status', 'applies', 'severity', 'action'] }

const REVIEW_SCHEMA = { type: 'object', properties: {
  audience_setting: { type: 'string', description: 'For channels: "made for kids" or "not made for kids", with the official reasoning in one sentence. For the account item: empty.' },
  findings: { type: 'array', items: FINDING },
  pages_read: { type: 'array', items: { type: 'string' } },
  notes: { type: 'string' },
}, required: ['findings'] }

const PROVE_SCHEMA = { type: 'object', properties: {
  audience_setting: { type: 'string' },
  kept: { type: 'array', items: FINDING, description: 'Findings you re-read and confirmed in YouTube\'s own words, corrected where needed' },
  struck: { type: 'array', items: { type: 'object', properties: {
    topic: { type: 'string' }, reason: { type: 'string' } }, required: ['topic', 'reason'] } },
  added: { type: 'array', items: FINDING, description: 'Important rules the reviewer missed, quoted from official pages' },
  notes: { type: 'string' },
}, required: ['kept', 'struck'] }

const COMMON = `This task has nothing to do with the website repository in the working directory. Do not read, edit or commit anything there, do not use git, and do not write or change any files.

WHY THIS MATTERS: the owner is setting up channels to build over many years. Blogs about "faceless YouTube" are full of invented or outdated rules. Only YouTube's own words count.

HOW TO READ OFFICIAL PAGES
  ${READ} URL                     prints a page's text
  ${READ} URL --find word word    prints only paragraphs containing any of the words
It reads only support.google.com (YouTube Help) and blog.youtube. Use web search to find the right official URLs (search for the topic plus "site:support.google.com youtube" or "YouTube Help"), then read them with this tool. Run Bash calls with timeout 120000. If the reader prints COULD NOT READ, say so; never fill the gap from memory.

Third-party sites may point you to a rule, but a finding is "official" only when you have read it on an official page and copied the words exactly. If only third parties say it, mark it "unofficial" and say so plainly in applies.`

function reviewPrompt(it) {
  const kit = it.n ? `The channel's kit (description, first ten video titles and first script) is in ${YT}/factcheck/ch-${it.n}.json. Read it. The channel name is about to change, so judge the content, not the name.` : 'There is no kit file for this item; it is about the account as a whole.'
  return `You are reviewing a planned YouTube channel setup against YouTube's current official rules.

SCOPE: ${it.focus}

${kit}

${COMMON}

DELIVER
- Every rule that genuinely affects this ${it.n ? 'channel' : 'plan'}, each with the exact official quote, the URL, how it applies, a severity and a concrete action. Prefer five rules that truly matter over twenty generic ones; skip rules that apply equally to every channel on YouTube unless this ${it.n ? 'channel' : 'plan'} is unusually exposed to them.
- ${it.n ? 'audience_setting: whether to set the channel as made for kids, with the official reasoning.' : 'Numbers wherever YouTube publishes them (channel limits, verification limits, thresholds), with the date or "last updated" note shown on the page if there is one.'}
- Where the kit's own wording conflicts with a rule, give kit_edit with the exact current words and the replacement.`
}

function provePrompt(it, review) {
  return `You are the skeptic for a review of a planned YouTube ${it.n ? 'channel' : 'account setup'} against YouTube's official rules. Your job is to make sure nothing the owner is told is invented, outdated, misquoted or overstated.

SCOPE: ${it.focus}
${it.n ? `The channel's kit is in ${YT}/factcheck/ch-${it.n}.json.` : ''}

THE REVIEW
${JSON.stringify(review || { findings: [] }, null, 1)}

${COMMON}

FOR EACH FINDING
1. Open its source_url with the reader (use --find with words from the quote). If the quote is not on the page, search for the right official page; if you still cannot find YouTube saying it, strike the finding or downgrade it to unofficial.
2. Check the finding does not overstate the rule (for example, "will be demonetized" when the page says "may"), and that the action follows from it. Correct it if needed.
3. Check any kit_edit quotes the kit file exactly.
Then look for anything important the reviewer missed within the scope, and add it, quoted from an official page.
Return kept (confirmed, corrected where needed), struck (with reasons) and added.`
}

const results = await pipeline(
  ITEMS,
  it => agent(reviewPrompt(it), { label: `review:${it.key}`, phase: 'Review', schema: REVIEW_SCHEMA }),
  (review, it) => agent(provePrompt(it, review), { label: `prove:${it.key}`, phase: 'Prove', schema: PROVE_SCHEMA })
    .then(proved => ({ key: it.key, channel: it.n, review, proved })),
)
const out = results.map((r, i) => r || { key: ITEMS[i].key, channel: ITEMS[i].n, review: null, proved: null })
const missing = out.filter(r => !r.proved).map(r => r.key)
if (missing.length) log(`No proved result for: ${missing.join(', ')}`)
return out
