#!/usr/bin/env node
// Art director's contact sheet: all 13 pictures as 96 px circles (and at 32 px, on YouTube dark and light) and all 13
// banners as phones show them (centre 1546x423), in one image. Also prints each palette's contrast ratios.
//   NODE_PATH=$(npm root -g) node design/contact-sheet.mjs [out.png]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const prev = path.join(here, 'previews');
const out = process.argv[2] || path.join(prev, 'contact-sheet.png');
const channels = JSON.parse(fs.readFileSync(path.join(here, '..', 'channels.json'), 'utf8'));
const N = [...Array(13)].map((_, i) => i + 1);
const look = n => ({ ...channels.find(c => c.n === n), ...JSON.parse(fs.readFileSync(path.join(here, `ch-${n}.json`), 'utf8')) });
const b64 = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');

const lum = hex => { const v = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(x => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const [bw, bh, sw, sh] = [2560, 1440, 1546, 423], s = 0.36;
const rows = N.map(n => {
  const c = look(n), logo = b64(path.join(prev, `ch-${n}-logo.png`)), banner = b64(path.join(prev, `ch-${n}-banner.png`));
  const fgbg = ratio(c.fg, c.bg), acbg = ratio(c.ac, c.bg);
  console.log(`${String(n).padStart(2)} ${c.name.padEnd(22)} bg ${c.bg} fg ${c.fg} ac ${c.ac}  name ${fgbg.toFixed(1)}:1  tagline ${acbg.toFixed(1)}:1${fgbg < 7 || acbg < 4.5 ? '  <-- LOW' : ''}`);
  return `<div class="row"><div class="num">${n}</div>
    <div class="yt" style="background:#0f0f0f"><img src="${logo}" style="width:96px;height:96px"><img src="${logo}" style="width:32px;height:32px"></div>
    <div class="yt" style="background:#fff"><img src="${logo}" style="width:96px;height:96px"><img src="${logo}" style="width:32px;height:32px"></div>
    <div class="ban" style="width:${sw * s}px;height:${sh * s}px"><img src="${banner}" style="width:${bw * s}px;left:${-(bw - sw) / 2 * s}px;top:${-(bh - sh) / 2 * s}px"></div>
    <div class="meta"><b>${c.name}</b><br>${c.font} ${c.nameWeight || 800}<br><span class="sw" style="background:${c.bg}"></span><span class="sw" style="background:${c.fg}"></span><span class="sw" style="background:${c.ac}"></span><br>name ${fgbg.toFixed(1)} · tag ${acbg.toFixed(1)}</div></div>`;
}).join('');
const strip = (bgc, px = 96) => `<div class="strip" style="background:${bgc}">${N.map(n => `<div style="text-align:center"><img src="${b64(path.join(prev, `ch-${n}-logo.png`))}" style="width:${px}px;height:${px}px;border-radius:50%"><div style="color:${bgc === '#fff' ? '#333' : '#aaa'}">${n}</div></div>`).join('')}</div>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1600, height: 900 });
await page.setContent(`<style>
body{margin:0;padding:18px;background:#272727;color:#ddd;font:13px Inter;display:grid;gap:10px}
img{border-radius:50%}.ban img{border-radius:0;position:absolute}
.strip{display:flex;gap:14px;padding:12px;border-radius:8px;justify-content:space-between}
.row{display:flex;align-items:center;gap:12px}.num{width:22px;font:700 18px Inter;text-align:right}
.yt{display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px}
.ban{position:relative;overflow:hidden;border-radius:6px;flex:none}
.meta{line-height:1.5}.sw{display:inline-block;width:18px;height:12px;margin-right:3px;border:1px solid #666}
</style>${strip('#0f0f0f')}${strip('#fff')}<div style="display:flex;gap:10px">${strip('#0f0f0f', 32)}${strip('#fff', 32)}</div>${rows}`);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(out);
