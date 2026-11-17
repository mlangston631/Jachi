// Builds the channel kit: every channel's profile picture and banner (drawn by art.mjs, the same code the designers'
// proof sheets use) and one phone-friendly page with everything to paste into YouTube Studio.
//   CHECKED_ON="17 November 2026" NODE_PATH=$(npm root -g) node build.mjs
// Reads channels.json (the source of truth) and design/ch-<n>.json (each channel's approved look, if any).
// Refuses to build if any banner's name overflows the phone-safe area, or CHECKED_ON is missing: the page promises the
// names were checked on that date, so it must be stated, never assumed.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { render } from './art.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');

const CHECKED_ON = process.env.CHECKED_ON;
if (!CHECKED_ON) throw new Error('Set CHECKED_ON to the date the final names passed brandcheck.mjs, e.g. CHECKED_ON="17 November 2026"');
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'kit');
fs.mkdirSync(out, { recursive: true });

const look = n => { try { return JSON.parse(fs.readFileSync(path.join(here, 'design', `ch-${n}.json`), 'utf8')); } catch { return {}; } };
const channels = JSON.parse(fs.readFileSync(path.join(here, 'channels.json'), 'utf8')).map(c => ({ ...c, ...look(c.n) }));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const browser = await chromium.launch();
const page = await browser.newPage();
const overflowing = [];
for (const c of channels) {
  const stem = `${String(c.n).padStart(2, '0')}-${c.slug}`;
  const files = await render(page, c, out, stem);
  c.logo = path.basename(files.logo);
  c.banner = path.basename(files.banner);
  if (files.overflow) overflowing.push(c.name);
}
if (overflowing.length) { await browser.close(); throw new Error('Banner name overflows the phone-safe area: ' + overflowing.join(', ')); }

const b64 = f => 'data:image/png;base64,' + fs.readFileSync(path.join(out, f)).toString('base64');
const field = (label, text, cls = '') => `<div class="f"><div class="fh"><span>${label}</span><button type="button" class="cp">Copy</button></div><pre class="${cls}">${esc(text)}</pre></div>`;
const sections = channels.map(c => `
<section id="c${c.n}">
  <h2><span class="num">${c.n}</span> ${esc(c.name)}</h2>
  <p class="niche">${esc(c.niche)}</p>
  ${field('Channel name', c.name)}
  ${field('Handle (first choice)', c.handle)}
  ${field('If that handle is taken', c.alts.join('\n'))}
  ${field('Description', c.description)}
  ${field('Keywords (Settings, Channel, Basic info)', c.keywords)}
  <p class="set">Audience: <b>${c.audience === 'made for kids' ? 'Yes, made for kids' : 'No, not made for kids'}</b></p>
  <div class="f"><div class="fh"><span>Profile picture (press and hold to save)</span></div><img class="logo" alt="${esc(c.name)} profile picture" src="${b64(c.logo)}"></div>
  <div class="f"><div class="fh"><span>Banner (press and hold to save)</span></div><img class="banner" alt="${esc(c.name)} banner" src="${b64(c.banner)}"></div>
  ${c.titles?.length ? field('First video ideas', c.titles.map((t, i) => `${i + 1}. ${t}`).join('\n')) : ''}
  ${c.script ? `<details><summary>${esc(c.scriptTitle)}</summary>${field('First script', c.script, 'script')}
  ${c.sources?.length ? field('Sources (paste under the first video)', c.sources.map(s => `${s.title}\n${s.url}`).join('\n\n')) : ''}</details>` : ''}
</section>`).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${channels.length} YouTube channel kits</title>
<style>
:root{--bg:#f6f5f1;--card:#fff;--ink:#1c1c1a;--mute:#66665f;--line:#deddd6;--ac:#1e4a3b}
@media(prefers-color-scheme:dark){:root{--bg:#141513;--card:#1e201d;--ink:#eeeee8;--mute:#a5a59c;--line:#34362f;--ac:#9bc1a3}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 Inter,system-ui,-apple-system,sans-serif}
main{max-width:760px;margin:0 auto;padding:20px 16px 80px}
h1{font-size:1.6rem;line-height:1.2;margin:.4em 0 .3em}h2{font-size:1.3rem;margin:0 0 .1em;display:flex;align-items:center;gap:.5em}
h3{font-size:1.05rem;margin:1.2em 0 .3em}
.num{display:inline-grid;place-items:center;min-width:1.8em;height:1.8em;border-radius:50%;background:var(--ac);color:var(--bg);font-size:.85rem}
.niche{color:var(--mute);margin:0 0 .8em}.set{margin:10px 0;font-size:.95rem}
nav{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}
nav a{padding:6px 12px;border:1px solid var(--line);border-radius:999px;color:var(--ink);text-decoration:none;font-size:.9rem;background:var(--card)}
section,.box{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 16px;margin:18px 0}
.f{margin:14px 0}.fh{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:.82rem;color:var(--mute);margin-bottom:4px}
pre{margin:0;padding:12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}
pre.script{font-size:.95rem}
button.cp{font:inherit;font-size:.82rem;padding:6px 14px;border-radius:999px;border:1px solid var(--ac);background:transparent;color:var(--ac);cursor:pointer;min-height:36px}
button.cp:focus-visible,nav a:focus-visible,summary:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
img{display:block;max-width:100%;height:auto;border-radius:10px;border:1px solid var(--line)}img.logo{width:140px;border-radius:50%}
details{margin-top:14px}summary{cursor:pointer;font-weight:600;padding:8px 0}
ol,ul{padding-left:1.3em}li{margin:.35em 0}
</style></head><body><main>
<h1>${channels.length} YouTube channel kits</h1>
<p>Everything to paste in when you create each channel. Tap Copy beside any box. Press and hold a picture to save it.</p>
<div class="box">
<h3 style="margin-top:0">Before the first channel</h3>
<ol>
<li><b>Turn on 2-Step Verification with a passkey</b> on the Google account (myaccount.google.com, Security). All ${channels.length} channels hang off this one account. Add a recovery phone and email, and keep the backup codes on paper.</li>
<li><b>Check Feature eligibility</b> in YouTube Studio (Settings, Channel). YouTube lists "Add additional channels to your account" as an advanced feature. If it offers ID or video verification, use it. If YouTube won't let you add more channels yet, stop there: the first channel's history unlocks it later.</li>
</ol>
<h3>Creating each channel (about two minutes)</h3>
<ol>
<li>On youtube.com in a browser, open <b>Settings</b>, then <b>Add or manage your channel(s)</b>, then <b>Create a channel</b>. Paste the <b>channel name</b>.</li>
<li>In YouTube Studio, <b>Customization</b>, <b>Profile</b>: paste the handle and description, add the picture and banner.</li>
<li><b>Settings</b>, <b>Channel</b>, <b>Basic info</b>: paste the keywords. <b>Advanced settings</b>: set the audience shown in the kit.</li>
<li><b>Settings</b>, <b>Community</b>: hold comments with links, and block the words scam comments use (WhatsApp, Telegram, "account manager", "invest with", "DM me").</li>
</ol>
<h3>Good to know</h3>
<ul>
<li><b>Every name and both spare handles were checked on ${esc(CHECKED_ON)}</b>: free on YouTube, and no live US trademark. Anyone can claim a name at any time, so create the channels soon.</li>
<li><b>A phone number can verify only 2 channels a year.</b> Verification unlocks videos over 15 minutes and custom thumbnails, so verify the first two channels you launch. Later channels need another number you really own, or the next year. Never borrowed or bought numbers.</li>
<li><b>Launch two at a time, not ${channels.length}.</b> Create them all to secure the names, then build up a couple at a time.</li>
</ul>
</div>
<nav aria-label="Channels">${channels.map(c => `<a href="#c${c.n}">${c.n}. ${esc(c.name)}</a>`).join('')}</nav>
${sections}
</main>
<script>
document.addEventListener('click', async e => {
  const b = e.target.closest('button.cp'); if (!b) return;
  const text = b.closest('.f').querySelector('pre').textContent;
  try { await navigator.clipboard.writeText(text); }
  catch { const r = document.createRange(); r.selectNodeContents(b.closest('.f').querySelector('pre')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('copy'); }
  b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy', 1500);
});
</script></body></html>`;
fs.writeFileSync(path.join(out, 'index.html'), html);

// Checks: no sideways scrolling on a 360px phone, and one contact sheet of all the art to look over.
await page.setViewportSize({ width: 360, height: 800 });
await page.goto('file://' + path.join(out, 'index.html'));
const sideways = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
await page.setViewportSize({ width: 1500, height: 1500 });
await page.setContent(`<body style="margin:0;background:#888;display:grid;grid-template-columns:150px 1fr 150px 1fr;gap:6px;padding:6px">${channels.map(c => `<img src="${b64(c.logo)}" style="width:150px;border-radius:50%"><img src="${b64(c.banner)}" style="width:100%">`).join('')}</body>`);
await page.screenshot({ path: path.join(here, 'design', 'previews', 'kit-art.png'), fullPage: true });
await browser.close();
console.log(`built ${channels.length} channels; page ${Math.round(fs.statSync(path.join(out, 'index.html')).size / 1024)} KB; sideways scroll at 360px: ${sideways}px`);
if (sideways > 0) process.exit(4);
