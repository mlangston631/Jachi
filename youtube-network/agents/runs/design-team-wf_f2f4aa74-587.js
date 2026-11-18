export const meta = {
  name: 'design-team',
  description: 'A designer and a critic per channel create and refine each of the 13 profile pictures and banners at real YouTube sizes, then an art director checks all 13 together for clashes and gets them fixed',
  phases: [
    { title: 'Design', detail: 'one designer per channel, iterating on proof sheets' },
    { title: 'Critique', detail: 'one critic per channel at real sizes; revise if needed' },
    { title: 'Art direction', detail: 'all 13 side by side; fix clashes' },
  ],
}

const ROOT = '/home/user/Jachi/youtube-network'
const PREVIEW = `cd ${ROOT} && NODE_PATH=$(npm root -g) node preview.mjs`
const N = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

const RULES = `You are designing for a portfolio of 13 faceless YouTube channels that must each last for years and stand on its own. Work only in ${ROOT}. Do not touch anything outside it, do not use git, and do not edit channels.json or any other existing file: write only your channel's design file and run the preview.

Read first: ${ROOT}/art.mjs (how the picture and banner are drawn, and every design field), and your channel's entry in ${ROOT}/channels.json (name, tagline, niche, description). Channels 11-13 are a trio of investigative crime documentary channels: serious and cinematic, consistent in quality but each with its own identity. Channel 10 is for ADULTS (tiny characters, grown-up problems, deadpan, muted cinematic): nothing cute, toy-like or childish, which would make YouTube treat it as made for kids.

THE DESIGN FILE: ${ROOT}/design/ch-<n>.json with any of these fields: bg, fg, ac, font, nameWeight, nameSpacing, mark, markScale, logoBg, backdrop. Fonts installed: Inter, Inter Display, Bitstream Charter, Caladea, Carlito, DejaVu Sans, DejaVu Serif, FreeSans, FreeSerif, JetBrains Mono, Courier 10 Pitch.

THE PROOF SHEET: ${PREVIEW} <n> ${ROOT}/design/ch-<n>.json   (Bash timeout 180000). It prints the sheet's path; open it with Read and look at it properly. It shows the picture cropped to a circle at 176, 98, 48 and 32 px on YouTube's dark and light backgrounds, and the banner as TV, desktop and phone show it. Exit status 3 means the name overflows the phone-safe area: never leave it that way.

WHAT GOOD LOOKS LIKE
- The mark: one bold, simple, ownable idea that says something about the NAME (not just the topic), recognisable at 32 px. Thick strokes (8 units or more in the 100 box), at most three or four shapes, a strong silhouette, high contrast with the background, centred with breathing room inside the circle. No small text; a bold monogram is allowed only if it is the best idea. Original: nothing that resembles an existing brand's logo.
- Colour: a palette that is clearly this channel's and nobody else's in the portfolio, with the tagline (accent on background) at a contrast ratio of at least 4.5:1. Name in fg on bg at least 7:1.
- The banner: the name and mark sit in the phone-safe centre (art.mjs does this). Use the backdrop for a quiet, crafted texture or illustration that fills the TV view and says something about the channel (map lines, rain, ledger rules, a signature line, film grain bands...), kept well behind the text so the name always reads. No text in the backdrop.
- Valid SVG only: path, circle, ellipse, rect, line, polyline, polygon, g, with fill and stroke. Use currentColor for fg and var(--ac) for the accent.`

const DESIGN = { type: 'object', properties: {
  file: { type: 'string' }, idea: { type: 'string', description: 'The idea behind the mark and how it reads the name, in two sentences' },
  palette: { type: 'string' }, iterations: { type: 'integer' }, preview_exit: { type: 'integer' }, self_critique: { type: 'string' },
}, required: ['file', 'idea', 'iterations', 'preview_exit'] }

const CRIT = { type: 'object', properties: {
  scores: { type: 'object', properties: {
    small_size: { type: 'number' }, fit_to_name: { type: 'number' }, originality: { type: 'number' }, craft: { type: 'number' },
    banner: { type: 'number' }, contrast: { type: 'number' }, audience: { type: 'number' } } },
  verdict: { type: 'string', description: 'approve | revise' },
  required_changes: { type: 'array', items: { type: 'string' }, description: 'Specific, actionable changes; empty when approving' },
}, required: ['scores', 'verdict', 'required_changes'] }

const designPrompt = n => `${RULES}

YOUR CHANNEL: ${n}. Design its picture and banner. Explore at least three genuinely different mark ideas on paper first, pick the strongest, then build it and iterate on the proof sheet at least three times, each time fixing what the sheet shows (especially the 32 and 48 px circles and the TV view). Write ${ROOT}/design/ch-${n}.json and leave it in its best state, with the preview exiting 0.`

const critiquePrompt = (n, d) => `${RULES}

You are the critic for channel ${n}. The designer says: ${JSON.stringify(d || {})}
Run the proof sheet yourself (${PREVIEW} ${n} ${ROOT}/design/ch-${n}.json) and look hard. Also look at the files themselves for contrast: compute the contrast ratios of fg on bg and ac on bg. Score 1-10 each: small_size (32 and 48 px recognisable?), fit_to_name, originality (and no resemblance to known logos), craft, banner (TV, desktop and phone), contrast, audience (right for who the channel is for). Approve only if every score is 7 or more. Otherwise say exactly what must change. Do not edit the file yourself.`

const revisePrompt = (n, crit) => `${RULES}

You designed channel ${n}. The critic asks for these changes:
${JSON.stringify(crit, null, 1)}
Make them in ${ROOT}/design/ch-${n}.json (you may rethink the mark if the critique shows the idea itself is weak), check every change on the proof sheet, and leave the preview exiting 0.`

const perChannel = await pipeline(
  N,
  n => agent(designPrompt(n), { label: `design:${n}`, phase: 'Design', schema: DESIGN }),
  async (d, n) => {
    let crit = await agent(critiquePrompt(n, d), { label: `critic:${n}`, phase: 'Critique', schema: CRIT })
    let rounds = 0
    while (crit && crit.verdict !== 'approve' && rounds < 2) {
      rounds++
      const rev = await agent(revisePrompt(n, crit), { label: `revise:${n}.${rounds}`, phase: 'Critique', schema: DESIGN })
      crit = await agent(critiquePrompt(n, rev), { label: `critic:${n}.${rounds}`, phase: 'Critique', schema: CRIT })
    }
    return { channel: n, design: d, critique: crit, rounds }
  },
)

phase('Art direction')
const AD = { type: 'object', properties: {
  clashes: { type: 'array', items: { type: 'object', properties: {
    channels: { type: 'array', items: { type: 'integer' } }, problem: { type: 'string' },
    fix_channel: { type: 'integer' }, change: { type: 'string' } }, required: ['channels', 'problem', 'fix_channel', 'change'] } },
  notes: { type: 'string' },
}, required: ['clashes'] }
const review = await agent(`${RULES}

You are the art director. All 13 channels have designs in ${ROOT}/design/ch-1.json ... ch-13.json. Make a contact sheet of all 13: for each n run ${PREVIEW} n ${ROOT}/design/ch-n.json ${ROOT}/design/previews/ad-n.png, then write a small Node script in ${ROOT}/design/ that tiles the 13 logo PNGs (design/previews/ch-<n>-logo.png) as 96 px circles and the 13 banner PNGs (ch-<n>-banner.png, phone-safe centre) into one image, and look at it (Read). Judge them as a family of 13 separate brands: any two that could be mistaken for each other (palette, mark shape, mood), any that look weaker than the rest, and whether the documentary trio 11-13 reads as consistent quality but three distinct identities. For each real problem name one channel to change and say exactly what to change. Do not edit designs yourself.`,
  { label: 'art-director', phase: 'Art direction', schema: AD })

const fixes = (review?.clashes || [])
const fixed = await parallel(fixes.map(f => () => agent(`${RULES}

The art director reviewed all 13 channels together and asks you to change channel ${f.fix_channel}: ${f.change}
(Problem: ${f.problem}; channels involved: ${f.channels.join(', ')}.) Read the other channels' design files involved so your change truly separates them. Edit ${ROOT}/design/ch-${f.fix_channel}.json, check it on the proof sheet, and leave the preview exiting 0.`,
  { label: `ad-fix:${f.fix_channel}`, phase: 'Art direction', schema: DESIGN })))

return { perChannel, review, fixed }
