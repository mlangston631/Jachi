export const meta = {
  name: 'verified-channel-names',
  description: 'Invent distinctive YouTube channel names for ten niches, test each against YouTube, then adversarially challenge the survivors',
  phases: [
    { title: 'Name', detail: 'one agent per channel: invent names, check each on YouTube, iterate until enough are clear' },
    { title: 'Challenge', detail: 'one skeptic per channel: re-check on YouTube and search the web for conflicts' },
  ],
}

const CHECK = 'node /tmp/claude-0/-home-user-Jachi/8146f71f-73d7-5544-b4d0-28b8048fbb36/scratchpad/yt/ytcheck.mjs'

const CHANNELS = [
  { n: 1, current: 'Stick Ledger', status: 'TAKEN: six channels already use "Stick Ledger" / "The Stick Ledger"',
    niche: 'Stick-figure money and economics explainers (compound interest, inflation, how banks work), drawn step by step. Education, never advice.',
    tone: 'friendly, clear, a bit playful; hand-drawn feel', mark: 'a stick figure holding a coin',
    avoid: 'ledger, stick + finance word, casual, simple, doodle money, penny, wealth, rich, wallet, cash' },
  { n: 2, current: 'Rise & Ruin Files', status: 'TAKEN: about a dozen channels use "Rise & Ruin"',
    niche: 'Documentaries about how real companies were built and how they collapsed (Kodak, Blockbuster, Nokia), told from public records.',
    tone: 'serious, cinematic, investigative', mark: 'a line that climbs to a peak, then drops',
    avoid: 'rise, ruin, fall, files, empire, collapse, boardroom, titans, business stories, case study' },
  { n: 3, current: 'Plain Circuit', status: 'TAKEN: five channels use "Plain Circuit"',
    niche: 'How AI and everyday technology actually work, in plain words with simple pictures. No hype.',
    tone: 'calm, precise, curious; modern', mark: 'a chip with four connections',
    avoid: 'plain, circuit, byte, bit, logic, neural, pixel, tech explained, simplified, decoded, AI in the name' },
  { n: 4, current: 'Farther Light', status: 'TAKEN: a channel named "Farther Light" owns @FartherLight',
    niche: 'Space and science, one question per video (How far is a light-year? Why is the night sky dark?), with real numbers and sources.',
    tone: 'wonder, quiet awe, accurate', mark: 'a ringed planet and a four-point star',
    avoid: 'light, cosmos, cosmic, orbit, astro, nova, stellar, galaxy, universe, void, beyond, infinite' },
  { n: 5, current: 'The Moving Border', status: 'CLEAR on YouTube in two runs. Keep it as candidate number one (re-check it yourself), and still find at least four other clear names as backups.',
    niche: 'History documentaries told through animated maps: why borders and empires grew, split and vanished.',
    tone: 'scholarly but gripping; old-map feel', mark: 'a folded map with a dashed route',
    avoid: 'atlas, empire, kings, chronicle, history explained, epic, maps + history, frontier, realm' },
  { n: 6, current: 'Candlelit Chronicle', status: 'TAKEN: several channels use "Candlelit Chronicle" (one has 2.1K subscribers)',
    niche: 'Sleep history: multi-hour, slow, softly narrated stories of ordinary life in the past (a night in a monastery, a Roman bakery) for falling asleep.',
    tone: 'warm, hushed, unhurried', mark: 'a single candle',
    avoid: 'candle, candlelit, chronicle, sleepy, sleepless, drowsy, boring history, slumber, bedtime, lullaby, historian, whisper' },
  { n: 7, current: 'Paper Trail Cases', status: 'TAKEN: more than a dozen channels use "Paper Trail"',
    niche: 'True crime told from the record: historic thefts, frauds, heists and hoaxes reconstructed from court files and newspapers. Respectful, no gore.',
    tone: 'sober, archival, exact', mark: 'a document with a red wax seal',
    avoid: 'paper trail, files, cases, case files, cold, dark, unsolved, crime + noun, evidence, docket, vault, shadows' },
  { n: 8, current: 'Fine Print, Plainly', status: 'CROWDED: "Fine Print" is a channel with 106K subscribers and "The Fine Print" is used by six more',
    niche: 'Plain-English explainers of legal, insurance and real-estate terms and documents (deductible, escrow, lien, lease). General education only, never advice.',
    tone: 'trustworthy, tidy, reassuring', mark: 'a magnifying glass over lines of text',
    avoid: 'fine print, plain, plainly, legal eagle, explained, simplified, clause, counsel, law + noun, advice, advisor, attorney, lawyer' },
  { n: 9, current: 'Rain on Slate', status: 'TAKEN: a channel named "Rain on Slate" exists',
    niche: 'Hours-long ambient sound for sleep, study and focus: rain, wind, distant thunder, fire, slow piano. No voice.',
    tone: 'still, cool, spacious', mark: 'a roof line with rain falling under it',
    avoid: 'rain + noun, calm, relax, zen, serene, sleep sounds, ambient, lofi, cozy, tranquil, drift, haven' },
  { n: 10, current: 'Tiny Brave Things', status: 'TAKEN: a channel named "Tiny Brave Things" owns @TinyBraveThings',
    niche: 'Wordless animated Shorts about very small original characters doing difficult things (a snail crossing a road, a raindrop getting home). Family friendly.',
    tone: 'warm, gentle, funny; storybook', mark: 'a small round creature with a little flag on its head',
    avoid: 'tiny, brave, little, mini, toons, tales, pocket, things, wee, small world, adventures' },
]

const NAMER_SCHEMA = {
  type: 'object',
  properties: {
    candidates: { type: 'array', items: { type: 'object', properties: {
      name: { type: 'string', description: 'Channel name exactly as it would be typed into YouTube' },
      handle: { type: 'string', description: 'The @handle the checker tested (name with spaces and punctuation removed)' },
      style: { type: 'string', description: 'coined word, rare real word, unexpected pairing, place or object metaphor, etc.' },
      why: { type: 'string', description: 'One or two sentences: what it means and why it fits this channel' },
      checker_verdict: { type: 'string', description: 'The verdict the checker printed for this exact name: CLEAR, CROWDED, TAKEN or UNKNOWN' },
    }, required: ['name', 'handle', 'why', 'checker_verdict'] } },
    checked_total: { type: 'integer' },
    taken_or_crowded: { type: 'array', items: { type: 'string' }, description: 'Names you tried that the checker did not clear' },
    notes: { type: 'string' },
  },
  required: ['candidates'],
}

const SKEPTIC_SCHEMA = {
  type: 'object',
  properties: {
    ranked: { type: 'array', description: 'Best first', items: { type: 'object', properties: {
      name: { type: 'string' },
      handle: { type: 'string' },
      survives: { type: 'boolean' },
      checker_verdict: { type: 'string', description: 'Verdict from YOUR OWN fresh run of the checker' },
      web_conflicts: { type: 'array', items: { type: 'string' }, description: 'Existing brands, companies, shows, podcasts, books, apps, channels on any platform using this name, with where you found each' },
      concerns: { type: 'array', items: { type: 'string' } },
      score: { type: 'number', description: '0 to 10 overall as a long-lived brand name for this channel' },
      why: { type: 'string' },
    }, required: ['name', 'survives', 'checker_verdict', 'score'] } },
    recommended: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['ranked'],
}

const COMMON = `This task has nothing to do with the website repository in the working directory. Do not read, edit or commit anything there, do not use git, and do not write any files. Use only the checker command below and web search.

THE CHECKER (it asks YouTube itself):
  ${CHECK} "Name One" "Name Two" ...
It prints one verdict per name:
  CLEAR    nobody has the handle @NameWithoutSpaces or @TheNameWithoutSpaces, and YouTube's channel search shows no channel with the same or a nearly identical name
  CROWDED  the handle is free but existing channels share the core of the name
  TAKEN    the handle exists or a same/near-same name channel exists
  UNKNOWN  YouTube could not be read; says nothing either way
Rules for using it:
- Pass at most 6 names per call and run the Bash call with timeout 600000, because calls from other agents queue behind each other.
- If it prints CONTROLS FAILED, or several UNKNOWNs in a row, wait a minute and try once more; if it still fails, stop and say so in notes. Never guess a verdict. Never report a name as CLEAR unless the checker printed CLEAR for that exact name in your own run.`

function namerPrompt(c) {
  return `You are naming a YouTube channel that its owner wants to build into a lasting brand. The last round of names failed: every "natural" name turned out to be in use already, often by several tiny channels at once, most likely because many people ask AI tools for names in this niche and get the same predictable answers. Your job is to get past that with names that are genuinely distinctive, and to prove each one against YouTube.

CHANNEL ${c.n}
What it is: ${c.niche}
Tone: ${c.tone}
Logo already drawn (nice if the name suits it, not required): ${c.mark}
Previous name: "${c.current}". Status: ${c.status}
Words and patterns that are worn out here, do not use them: ${c.avoid}

${COMMON}

WHAT A GOOD NAME IS
- Distinctive and ownable. Not "[adjective] [niche noun]". Prefer one of: an unexpected pairing of two real words that carries the idea sideways; a rare, old or technical real word with a fitting meaning; a place or object metaphor; a coined word that is still easy to say.
- Passes the radio test: someone who hears it once can type it. No odd spellings, no swapped letters, no digits, no underscores, no "HQ", "TV", "YT", "Official", "Channel".
- One to three words. The handle is the name with spaces and punctuation removed, 20 characters or fewer.
- Hints at the subject or the feeling, with room for the channel to grow. A short tagline will explain it, so it need not be literal.
- No real person's name, no existing famous brand, show, book or company, nothing that reads as medical, legal or financial advice, no unfortunate meaning in English or Spanish.

HOW TO WORK
1. Think of names from at least three different directions before checking anything.
2. Check them in batches of up to 6. Read what came back. When a name is taken, treat it as evidence about which directions are crowded, and move further from the obvious.
3. Keep going until you have at least 6 names with a CLEAR verdict that you would be proud to put on a channel for ten years, or until you have checked about 40 names. Quality matters more than count: drop any CLEAR name that is merely available but weak.
4. Return the CLEAR names you stand behind in candidates, best first, each with the verdict the checker printed. List the names that failed in taken_or_crowded.`
}

function skepticPrompt(c, found) {
  const list = (found.candidates || []).map((x, i) => `${i + 1}. ${x.name} (${x.handle}) : ${x.why}`).join('\n')
  return `You are the skeptic. Another agent proposed the names below for a YouTube channel that its owner wants to build into a lasting brand. Their last set of names turned out to be taken, so the owner needs to be able to trust these completely. Try to knock each name out. If you are unsure whether a name is safe, it does not survive.

CHANNEL ${c.n}
What it is: ${c.niche}
Tone: ${c.tone}

PROPOSED NAMES
${list || '(none were returned)'}

${COMMON}

FOR EACH NAME
1. Run the checker yourself. YouTube's search results vary from run to run, so a fresh run can catch what the first missed. If your run is not CLEAR, the name does not survive.
2. Search the web for the exact name in quotes, alone and with words like YouTube, podcast, company, brand, app, book, trademark. Look for anything already trading under it: a channel on any platform, a podcast, a company, a product, a show, a published book or game. Record each with where you found it. An established brand in media, education, finance, law or entertainment with the same name knocks it out. A small unrelated business in another field is a concern to record, not an automatic knock-out.
3. Judge it as a brand: can someone who hears it once type it? Could it be misheard, misspelled or confused with something well known? Any unfortunate meaning or slang sense in English or Spanish? Does it fit this channel and leave room to grow? Is it actually good, or merely available?

Return every name in ranked, best first, with survives true or false, the verdict from your own checker run, the conflicts and concerns you found, and a score from 0 to 10. Put the single best surviving name in recommended, or leave it empty if none deserves it.`
}

const results = await pipeline(
  CHANNELS,
  c => agent(namerPrompt(c), { label: `name:${c.n} ${c.current}`, phase: 'Name', schema: NAMER_SCHEMA }),
  (found, c) => {
    if (!found || !(found.candidates || []).length) return { channel: c.n, previous: c.current, named: found, challenged: null }
    return agent(skepticPrompt(c, found), { label: `challenge:${c.n} ${c.current}`, phase: 'Challenge', schema: SKEPTIC_SCHEMA })
      .then(v => ({ channel: c.n, previous: c.current, named: found, challenged: v }))
  },
)

const out = results.map((r, i) => r || { channel: CHANNELS[i].n, previous: CHANNELS[i].current, named: null, challenged: null })
const missing = out.filter(r => !r.challenged).map(r => r.channel)
if (missing.length) log(`No challenged result for channels: ${missing.join(', ')}`)
return out
