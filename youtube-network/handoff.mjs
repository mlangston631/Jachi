import fs from 'node:fs';
// channels.json is the single source of truth; data.mjs holds only the first, unchecked drafts.
const channels = JSON.parse(fs.readFileSync(new URL('./channels.json', import.meta.url), 'utf8'));
const order = [1, 3, 5, 2, 4, 6, 7, 8, 9, 10].map(n => channels.find(c => c.n === n));
const head = `Create YouTube channels in this Chrome, where I'm signed in to YouTube. I'm asking you to do this and I approve creating them. There are ${order.length} channels below, in the order to create them.

For each channel:
1. Search YouTube for the channel name. If a channel with the same or nearly the same name already exists, skip this one and tell me.
2. Open youtube.com/account, choose "Add or manage your channel(s)", then "Create a channel". Enter the channel name exactly as written and create it.
3. Make sure you are now acting as the new channel (check the name at the top right) before changing anything.
4. In YouTube Studio open Customization, then the Profile (Basic info) tab. Set the handle to the first choice. If YouTube says it's taken, try the spare handles in order. If all are taken, leave YouTube's suggested handle and tell me.
5. Paste the description exactly as written, and publish.
6. In Studio open Settings, then Channel, then Basic info. Paste the keywords and save. Leave country alone if it's already set.

Rules:
- Don't touch my existing channel or any other setting on my Google account.
- Don't upload videos, post, comment, subscribe, or turn on monetization.
- Skip the profile picture and banner. I'll add those myself.
- Stop and ask me if YouTube asks for a phone number, a code, a password, or payment details.
- If YouTube says I've created too many channels or blocks a step, stop there. Don't retry and don't try another route.
- When you finish or stop, give me a list: each channel, created or not, the handle it ended up with, and its channel address.
`;
const body = order.map((c, i) => `
==================== CHANNEL ${i + 1} of ${order.length} ====================
Channel name: ${c.name}
Handle, first choice: ${c.handle}
Spare handles: ${c.alts.join(', ')}

Description:
${c.description}

Keywords:
${c.keywords}
`).join('');
fs.writeFileSync('paste-into-claude-in-chrome.txt', head + body);
console.log((head + body).length, 'chars');
