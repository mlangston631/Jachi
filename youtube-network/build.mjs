import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// channels.json is the single source of truth; data.mjs holds only the first, unchecked drafts.
const channels = JSON.parse(fs.readFileSync(new URL('./channels.json', import.meta.url), 'utf8'));

// The date every name was last proven free on YouTube (by ytcheck.mjs). The page promises this, so it must be passed in, never assumed.
const CHECKED_ON = process.env.CHECKED_ON;
if (!CHECKED_ON) throw new Error('Set CHECKED_ON to the date the final names passed ytcheck.mjs, e.g. CHECKED_ON="16 November 2026"');
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'kit');
fs.mkdirSync(out, { recursive: true });
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const svg = (c, size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" style="color:${c.fg};--ac:${c.ac}">${c.mark}</svg>`;
const base = c => `<style>*{margin:0;box-sizing:border-box}body{background:${c.bg};color:${c.fg};font-family:'${c.font}',sans-serif;overflow:hidden}</style>`;

// Logo: 800x800, mark kept inside the circle YouTube crops to.
const logo = c => `<!doctype html>${base(c)}<body style="width:800px;height:800px;display:grid;place-items:center">${svg(c, 440)}</body>`;
// Banner: 2560x1440, everything inside the 1235x338 area that shows on every device.
const banner = c => `<!doctype html>${base(c)}<body style="width:2560px;height:1440px;display:grid;place-items:center">
<div style="width:1235px;height:338px;display:flex;align-items:center;justify-content:center;gap:56px">
${svg(c, 230)}
<div><div style="font-size:${c.name.length > 16 ? 96 : 116}px;font-weight:800;letter-spacing:-.02em;line-height:1.02;white-space:nowrap">${esc(c.name)}</div>
<div style="font-size:40px;margin-top:18px;color:${c.ac};font-weight:600;font-family:Inter,sans-serif;white-space:nowrap">${esc(c.tagline)}</div></div>
</div></body>`;

const browser = await chromium.launch();
const page = await browser.newPage();
for (const c of channels) {
  for (const [kind, html, w, h] of [['logo', logo(c), 800, 800], ['banner', banner(c), 2560, 1440]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(html);
    await page.evaluate(() => document.fonts.ready);
    c[kind] = `${String(c.n).padStart(2, '0')}-${c.slug}-${kind}.png`;
    await page.screenshot({ path: path.join(out, c[kind]) });
  }
}

// The kit page: one section per channel, every field with a Copy button, images embedded for long-press saving.
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
  <div class="f"><div class="fh"><span>Profile picture (press and hold to save)</span></div><img class="logo" alt="${esc(c.name)} profile picture" src="${b64(c.logo)}"></div>
  <div class="f"><div class="fh"><span>Banner (press and hold to save)</span></div><img class="banner" alt="${esc(c.name)} banner" src="${b64(c.banner)}"></div>
  ${field('First 10 video titles', c.titles.map((t, i) => `${i + 1}. ${t}`).join('\n'))}
  <details><summary>${esc(c.scriptTitle)}</summary>${field('First script', c.script, 'script')}
  ${c.sources?.length ? field('Sources (paste under the first video)', c.sources.map(s => `${s.title}\n${s.url}`).join('\n\n')) : ''}</details>
</section>`).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ten faceless YouTube channel kits</title>
<style>
:root{--bg:#f6f5f1;--card:#fff;--ink:#1c1c1a;--mute:#66665f;--line:#deddd6;--ac:#1e4a3b}
@media(prefers-color-scheme:dark){:root{--bg:#141513;--card:#1e201d;--ink:#eeeee8;--mute:#a5a59c;--line:#34362f;--ac:#9bc1a3}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 Inter,system-ui,-apple-system,sans-serif}
main{max-width:760px;margin:0 auto;padding:20px 16px 80px}
h1{font-size:1.6rem;line-height:1.2;margin:.4em 0 .3em}h2{font-size:1.3rem;margin:0 0 .1em;display:flex;align-items:center;gap:.5em}
h3{font-size:1.05rem;margin:1.2em 0 .3em}
.num{display:inline-grid;place-items:center;min-width:1.8em;height:1.8em;border-radius:50%;background:var(--ac);color:var(--bg);font-size:.85rem}
.niche{color:var(--mute);margin:0 0 .8em}
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
<h1>Ten faceless YouTube channel kits</h1>
<p>Everything to paste in when you create each channel. Tap Copy beside any box. Press and hold a picture to save it.</p>
<div class="box">
<h3 style="margin-top:0">Creating each channel (about two minutes)</h3>
<ol>
<li>On youtube.com in a browser, signed in to your Google account, open <b>Settings</b>, then <b>Add or manage your channel(s)</b>, then <b>Create a channel</b>.</li>
<li>Paste the <b>channel name</b> and create it. This makes a Brand Account under your one email.</li>
<li>In YouTube Studio, open <b>Customization</b>. Under <b>Profile</b>, paste the handle and description, then add the profile picture and banner.</li>
<li>In Studio <b>Settings</b>, <b>Channel</b>, <b>Basic info</b>, paste the keywords and choose your country.</li>
<li>Verify the channel with your phone number (<b>Settings</b>, <b>Channel</b>, <b>Feature eligibility</b>) so you can upload long videos and custom thumbnails.</li>
</ol>
<h3>Before you upload</h3>
<ul>
<li><b>Every name and handle was checked on YouTube on ${esc(CHECKED_ON)}.</b> Nobody had the handle, and YouTube's search showed no channel with the same or a nearly identical name. Names can be claimed by anyone at any time, so create the channels soon; each kit has two spare handles, also checked.</li>
<li><b>Start with three, not ten.</b> Creating all ten is fine. Uploading templated videos to ten at once is what YouTube's "inauthentic content" rule removes monetization for, and a serious violation on one channel can put the others on the account at risk.</li>
<li><b>Check the facts in each script</b> against a source before recording, and list your sources in the video description.</li>
<li><b>Tick "Altered or synthetic content"</b> when uploading anything with realistic AI-made people, voices or scenes.</li>
<li><b>Channel 8 (legal and insurance)</b> carries the most risk: AI personas giving advice on money, health or law are reported as not monetizable. Keep it to explaining terms, and consider narrating it yourself.</li>
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

// Check: no sideways scroll on a phone, and a contact sheet of the art to look over.
await page.setViewportSize({ width: 360, height: 800 });
await page.goto('file://' + path.join(out, 'index.html'));
console.log('phone overflow px:', await page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
await page.screenshot({ path: path.join(here, 'check-phone.png') });
await page.setViewportSize({ width: 1500, height: 1500 });
await page.setContent(`<body style="margin:0;background:#888;display:grid;grid-template-columns:150px 1fr 150px 1fr;gap:6px;padding:6px">${channels.map(c => `<img src="${b64(c.logo)}" style="width:150px;border-radius:50%"><img src="${b64(c.banner)}" style="width:100%">`).join('')}</body>`);
await page.screenshot({ path: path.join(here, 'check-art.png'), fullPage: true });
await browser.close();
console.log('kit size KB:', Math.round(fs.statSync(path.join(out, 'index.html')).size / 1024));
