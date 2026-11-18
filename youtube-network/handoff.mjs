// Writes the instructions Claude in Chrome follows to create the channels in YouTube Studio, from channels.json.
//   node handoff.mjs > kit/paste-into-claude-in-chrome.txt
// The order below is the creation order: if YouTube stops allowing more channels on the account (adding channels is an
// "advanced feature"), the ones that matter most already exist. Change ORDER to change priorities.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const channels = JSON.parse(fs.readFileSync(path.join(here, 'channels.json'), 'utf8'));
const ORDER = [11, 12, 13, 1, 3, 5, 2, 4, 6, 7, 8, 9, 10];
const list = ORDER.map(n => channels.find(c => c.n === n)).filter(Boolean);
if (list.length !== channels.length) throw new Error('ORDER must list every channel in channels.json exactly once');

const head = `Create my YouTube channels in this Chrome, where I'm signed in. I'm asking you to do this and I approve creating them. There are ${list.length}, listed below in the order to create them.

BEFORE THE FIRST CHANNEL
A. Ask me to confirm that 2-Step Verification is on for this Google account. Don't change any Google account or security settings yourself.
B. Open studio.youtube.com, then Settings, Channel, Feature eligibility. Tell me what it shows for Standard, Intermediate and Advanced features. If it offers ID or video verification, tell me and let me do it myself. Don't start it.

FOR EACH CHANNEL, in order:
1. Search YouTube for the channel name. If a channel with the same or nearly the same name exists, skip it and tell me.
2. Open youtube.com/account, choose "Add or manage your channel(s)", then "Create a channel". Enter the name exactly as written.
3. Check the account switcher (top right) shows the new channel before changing anything.
4. YouTube Studio, Customization, Profile: set the handle to the first choice. If it's taken, try the spares in order. If all are taken, keep YouTube's suggestion and tell me. Paste the description exactly as written. Publish.
5. Settings, Channel, Basic info: paste the keywords. Advanced settings: set the audience as written. Save.
6. Settings, Community: turn on holding comments that contain links, and add these blocked words: WhatsApp, Telegram, account manager, invest with, DM me. Save.

RULES
- Don't touch my existing channel or any other Google account setting.
- Don't upload videos, post, comment, subscribe, or turn on monetization.
- Skip the profile picture and banner: I'll add them myself.
- Stop and ask me if YouTube asks for a phone number, a code, a password, ID, or payment details.
- If YouTube says I can't add more channels, or blocks a step, stop there. Don't retry and don't try another route.
- When you finish or stop, give me a table: channel, created or not, the handle it got, and its address.
`;

const body = list.map((c, i) => `
==================== CHANNEL ${i + 1} of ${list.length} (kit #${c.n}) ====================
Channel name: ${c.name}
Handle, first choice: ${c.handle}
Spare handles: ${c.alts.join(', ')}
Audience: ${c.audience === 'made for kids' ? 'Yes, set this channel as made for kids' : 'No, set this channel as not made for kids'}

Description:
${c.description}

Keywords:
${c.keywords}
`).join('');

process.stdout.write(head + body);
