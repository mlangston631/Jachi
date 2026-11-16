#!/usr/bin/env node
// Turns ytscout.mjs output into one picture of the winning thumbnails, so a reviewer can study twenty of them at once.
//   node thumbsheet.mjs scout.json sheet.png [--top 20]
// Picks the videos with the highest outlier ratio across every query in the file (each video once), downloads each
// thumbnail from YouTube's image server, and lays them out in a grid captioned with outlier ratio, views, length and title.
// Thumbnails are only looked at, never reused: they belong to their creators.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const [src, outPng, ...rest] = process.argv.slice(2);
const top = Number(rest[rest.indexOf('--top') + 1]) || 20;
if (!src || !outPng) { console.error('usage: node thumbsheet.mjs scout.json sheet.png [--top 20]'); process.exit(2); }

const seen = new Set();
const picks = JSON.parse(fs.readFileSync(src, 'utf8')).flatMap(q => q.videos || [])
  .filter(v => v.outlier && !seen.has(v.id) && seen.add(v.id))
  .sort((a, b) => b.outlier - a.outlier).slice(0, top);
if (!picks.length) { console.error('no videos with an outlier ratio in ' + src); process.exit(3); }

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(n);
const cells = picks.map(v => {
  let img = '';
  try {
    const jpg = execFileSync('curl', ['-sf', '-m', '20', `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`], { maxBuffer: 8 << 20 });
    img = `<img src="data:image/jpeg;base64,${jpg.toString('base64')}">`;
  } catch { img = '<div class="miss">thumbnail unavailable</div>'; }
  return `<figure>${img}<figcaption><b>${v.outlier}x</b> · ${fmt(v.views)} views · ${Math.round((v.length_s || 0) / 60)} min · ${esc(v.channel)}<br>${esc(v.title)}</figcaption></figure>`;
}).join('');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.setContent(`<style>body{margin:0;padding:12px;background:#111;color:#eee;font:13px/1.35 Inter,sans-serif;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
figure{margin:0}img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;border-radius:6px}.miss{aspect-ratio:16/9;background:#333;display:grid;place-items:center}
figcaption{margin-top:4px}b{color:#7fe08a}</style>${cells}`);
await page.screenshot({ path: outPng, fullPage: true });
await browser.close();
console.log(`${picks.length} thumbnails -> ${outPng}`);
