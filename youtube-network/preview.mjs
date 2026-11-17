#!/usr/bin/env node
// A designer's proof sheet: how a channel's picture and banner will really look on YouTube.
//   NODE_PATH=$(npm root -g) node preview.mjs <channel number> [design.json] [out.png]
// design.json (optional) holds look fields to try (see art.mjs) on top of the channel's entry in channels.json, so a
// designer can iterate without touching the source of truth. The sheet shows the picture as YouTube crops it (a circle)
// at 176, 98, 48 and 32 px on YouTube's dark and light backgrounds, and the banner as a TV (whole), a desktop (centre
// 2560x423) and a phone (centre 1546x423) show it. Exit status 3 means the name doesn't fit the phone-safe area.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { render, SIZES } from './art.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const [nArg, designPath, outArg] = process.argv.slice(2);
const n = Number(nArg);
const base = JSON.parse(fs.readFileSync(path.join(here, 'channels.json'), 'utf8')).find(c => c.n === n);
if (!base) { console.error('usage: node preview.mjs <channel number> [design.json] [out.png]'); process.exit(2); }
const c = { ...base, ...(designPath ? JSON.parse(fs.readFileSync(designPath, 'utf8')) : {}) };
const outDir = path.join(here, 'design', 'previews');
fs.mkdirSync(outDir, { recursive: true });
const out = outArg || path.join(outDir, `ch-${n}-sheet.png`);

const browser = await chromium.launch();
const page = await browser.newPage();
const files = await render(page, c, outDir, `ch-${n}`);
const b64 = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const [bw, bh] = SIZES.banner, [sw, sh] = SIZES.safe, [dw, dh] = SIZES.desktop;
const crop = (w, h, scale) => `<div style="width:${w * scale}px;height:${h * scale}px;overflow:hidden;position:relative;border-radius:8px">
  <img src="${b64(files.banner)}" style="position:absolute;width:${bw * scale}px;left:${-(bw - w) / 2 * scale}px;top:${-(bh - h) / 2 * scale}px"></div>`;
const circles = bgc => `<div style="background:${bgc};padding:18px;border-radius:10px;display:flex;align-items:center;gap:22px">
  ${[176, 98, 48, 32].map(s => `<img src="${b64(files.logo)}" style="width:${s}px;height:${s}px;border-radius:50%">`).join('')}
  <span style="font:600 15px Inter;color:${bgc === '#0f0f0f' ? '#f1f1f1' : '#0f0f0f'}">${c.name}</span></div>`;
await page.setViewportSize({ width: 1400, height: 900 });
await page.setContent(`<body style="margin:0;padding:20px;background:#272727;color:#ddd;font:14px Inter;display:grid;gap:14px">
  <div>Channel ${n}: ${c.name}${files.overflow ? ' — <b style="color:#ff6b6b">NAME OVERFLOWS THE PHONE-SAFE AREA</b>' : ''}</div>
  <div style="display:flex;gap:14px">${circles('#0f0f0f')}${circles('#ffffff')}</div>
  <div>TV (whole banner)</div>${crop(bw, bh, 0.42)}
  <div>Desktop (centre ${dw}x${dh})</div>${crop(dw, dh, 0.5)}
  <div>Phone (centre ${sw}x${sh})</div>${crop(sw, sh, 0.5)}
</body>`);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(`${out}${files.overflow ? '  (name overflows the phone-safe area)' : ''}`);
process.exit(files.overflow ? 3 : 0);
