// One-time move: the channel drafts leave data.mjs and become channels.json, the single source of truth that every
// later step (fact-check corrections, final names, growth plans) edits in place, each change recorded in "history".
import fs from 'node:fs';
import { channels } from './data.mjs';
for (const c of channels) c.history = [{ step: 'draft', note: 'First drafts written from general knowledge, before any checking.' }];
fs.writeFileSync('channels.json', JSON.stringify(channels, null, 1));
console.log('wrote', channels.length, 'channels');
