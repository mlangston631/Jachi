// Freezes each channel's checkable text into its own file, so fact-checkers read a copy that won't change under them.
import fs from 'node:fs';
// channels.json is the single source of truth; data.mjs holds only the first, unchecked drafts.
const channels = JSON.parse(fs.readFileSync(new URL('./channels.json', import.meta.url), 'utf8'));
for (const c of channels) fs.writeFileSync(`factcheck/ch-${c.n}.json`, JSON.stringify({
  channel: c.n, niche: c.niche, description: c.description, titles: c.titles, scriptTitle: c.scriptTitle, script: c.script,
}, null, 1));
