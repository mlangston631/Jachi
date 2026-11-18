export const meta = {
  name: 'design-team',
  description: 'The portfolio\'s design team: a designer and a critic per channel make and refine the profile picture and banner at real YouTube sizes, then an art director checks them against every other channel and gets clashes fixed',
  whenToUse: 'Designing or redesigning any channel\'s look. Pass args: { channels: [n, ...], briefs: { "<n>": "what this design must do or avoid" } }.',
  phases: [
    { title: 'Design', detail: 'one designer per channel, iterating on proof sheets' },
    { title: 'Critique', detail: 'one critic per channel at real sizes; up to two revision rounds' },
    { title: 'Art direction', detail: 'the new designs against all channels; fix clashes' },
  ],
}

// History: first run as agents/runs/design-team-wf_f2f4aa74-587.js, which designed all 13 channels (17 Nov 2026).
// Kept here as one reusable file so every channel's look is made the same way. Changes since: channel list and briefs
// come from args; bundled fonts (fonts/fonts.json) are available; the art director compares against all channels.

const ROOT = (args && args.root) || '/home/user/Jachi/youtube-network'
const PREVIEW = `cd ${ROOT} && NODE_PATH=$(npm root -g) node preview.mjs`
const N = (args && args.channels) || []
const BRIEFS = (args && args.briefs) || {}
if (!N.length) throw new Error('design-team needs args.channels: [n, ...]')

const RULES = `You are designing for a portfolio of faceless YouTube channels that must each last for years and stand on its own. Work only in ${ROOT}. Do not touch anything outside it, do not use git, and do not edit channels.json or any other channel's design file: write only your channel's design file and run the preview.

Read first: ${ROOT}/art.mjs (how the picture and banner are drawn, and every design field), your channel's entry in ${ROOT}/channels.json (name, tagline, niche, description), and the other channels' design files in ${ROOT}/design/ so yours is clearly different from all of them. Channels 11-13 are a trio of investigative crime documentary channels. Channel 10 is for ADULTS: nothing cute, toy-like or childish.

THE DESIGN FILE: ${ROOT}/design/ch-<n>.json with any of: bg, fg, ac, font, nameWeight, nameSpacing, mark, markScale, logoBg, backdrop.
Fonts: installed Inter, Inter Display, Caladea, Carlito, DejaVu Sans, DejaVu Serif, FreeSans, FreeSerif, JetBrains Mono, Courier 10 Pitch; bundled (fonts/fonts.json) Old Standard TT (400, 700), Libre Baskerville (400, 700), DM Serif Display (400), Space Grotesk (400, 700). Never Bitstream Charter: it does not render.

THE PROOF SHEET: ${PREVIEW} <n> ${ROOT}/design/ch-<n>.json   (Bash timeout 180000). Open the printed path with Read and look properly: the picture as YouTube's circle at 176, 98, 48 and 32 px on dark and light, and the banner as TV, desktop and phone show it. Exit 3 = name overflows the phone-safe area; exit 5 = the font is not rendering. Never leave either.

WHAT GOOD LOOKS LIKE
- The mark: one bold, simple, ownable idea that says something about the NAME, recognisable at 32 px. Thick strokes (8+ units in the 100 box), at most three or four shapes, strong silhouette, high contrast, centred with breathing room inside the circle. No small text. Original: nothing that resembles an existing brand's logo or another channel in this portfolio.
- Colour: clearly this channel's own. Tagline (accent on background) at least 4.5:1; name (fg on bg) at least 7:1.
- The banner backdrop: a quiet, crafted texture or illustration that fills the TV view and says something about the channel, well behind the text. No text in it.
- Valid SVG only: path, circle, ellipse, rect, line, polyline, polygon, g; currentColor for fg, var(--ac) for the accent.`

const DESIGN = { type: 'object', properties: {
  file: { type: 'string' }, idea: { type: 'string' }, palette: { type: 'string' }, iterations: { type: 'integer' },
  preview_exit: { type: 'integer' }, self_critique: { type: 'string' } }, required: ['file', 'idea', 'iterations', 'preview_exit'] }
const CRIT = { type: 'object', properties: {
  scores: { type: 'object', properties: { small_size: { type: 'number' }, fit_to_name: { type: 'number' }, originality: { type: 'number' },
    craft: { type: 'number' }, banner: { type: 'number' }, contrast: { type: 'number' }, audience: { type: 'number' } } },
  verdict: { type: 'string', description: 'approve | revise' }, required_changes: { type: 'array', items: { type: 'string' } } },
  required: ['scores', 'verdict', 'required_changes'] }

const brief = n => BRIEFS[n] || BRIEFS[String(n)] ? `\nTHIS CHANNEL'S BRIEF: ${BRIEFS[n] || BRIEFS[String(n)]}\n` : ''

const perChannel = await pipeline(
  N,
  n => agent(`${RULES}
${brief(n)}
YOUR CHANNEL: ${n}. Explore at least three genuinely different mark ideas first, pick the strongest, build it, and iterate on the proof sheet at least three times, fixing what the sheet shows (especially 32 and 48 px and the TV view). Write ${ROOT}/design/ch-${n}.json and leave the preview exiting 0.`,
    { label: `design:${n}`, phase: 'Design', schema: DESIGN }),
  async (d, n) => {
    const critique = dd => agent(`${RULES}
${brief(n)}
You are the critic for channel ${n}. The designer says: ${JSON.stringify(dd || {})}
Run the proof sheet yourself and look hard; compute fg/bg and ac/bg contrast. Score 1-10: small_size, fit_to_name, originality (including no resemblance to known logos or to any other channel's design in ${ROOT}/design/), craft, banner, contrast, audience. Approve only if every score is 7 or more and the brief is met; otherwise say exactly what must change. Do not edit the file.`,
      { label: `critic:${n}`, phase: 'Critique', schema: CRIT })
    let crit = await critique(d), rounds = 0
    while (crit && crit.verdict !== 'approve' && rounds < 2) {
      rounds++
      const rev = await agent(`${RULES}
${brief(n)}
You designed channel ${n}. The critic asks for: ${JSON.stringify(crit, null, 1)}
Make the changes in ${ROOT}/design/ch-${n}.json (rethink the mark if the idea itself is weak), check them on the proof sheet, and leave the preview exiting 0.`,
        { label: `revise:${n}.${rounds}`, phase: 'Critique', schema: DESIGN })
      crit = await critique(rev)
    }
    return { channel: n, design: d, critique: crit, rounds }
  },
)

phase('Art direction')
const review = await agent(`${RULES}

You are the art director. Channels ${N.join(', ')} were just (re)designed. Compare them with EVERY channel's design in ${ROOT}/design/: run the proof sheet for the new ones and for any channel they might resemble, and look at them side by side. Report any real clash (palette, mark shape or motif, type voice, mood) that would let a viewer mistake one channel for another, naming one of the NEW channels to change and exactly what to change. Report none if there is none. Do not edit designs.`,
  { label: 'art-director', phase: 'Art direction', schema: { type: 'object', properties: {
    clashes: { type: 'array', items: { type: 'object', properties: { channels: { type: 'array', items: { type: 'integer' } }, problem: { type: 'string' },
      fix_channel: { type: 'integer' }, change: { type: 'string' } }, required: ['channels', 'problem', 'fix_channel', 'change'] } },
    notes: { type: 'string' } }, required: ['clashes'] } })

const fixed = await parallel((review?.clashes || []).map(f => () => agent(`${RULES}

The art director asks you to change channel ${f.fix_channel}: ${f.change} (Problem: ${f.problem}; channels: ${f.channels.join(', ')}.) Edit ${ROOT}/design/ch-${f.fix_channel}.json, check it on the proof sheet, and leave the preview exiting 0.`,
  { label: `ad-fix:${f.fix_channel}`, phase: 'Art direction', schema: DESIGN })))

return { perChannel, review, fixed }
