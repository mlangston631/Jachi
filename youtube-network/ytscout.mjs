#!/usr/bin/env node
// Finds what is working in a niche right now, from YouTube itself.
//   node ytscout.mjs [--period year|month] [--top 25] "query one" "query two" ...
//
// For each query it takes YouTube's own search, filtered to videos uploaded this year (or this month) and sorted by
// view count, then looks up each uploader's subscriber count. The number that matters is the OUTLIER RATIO:
// views divided by the channel's subscribers. A 2M-view video on a 5M-subscriber channel says little; a 2M-view video
// on a 20K-subscriber channel means YouTube pushed that title and topic to strangers. That is what a new channel can copy
// the lesson of (topic, angle, title shape, length), never the video itself.
//
// Output is JSON on stdout: { query, period, videos: [...] } per query, videos sorted by outlier ratio, highest first.
// Shares the two request slots with ytcheck.mjs, so however many copies run, YouTube sees at most two requests at a time.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const LOCK = path.join(here, '.ytcheck.lock');
const SUBS_CACHE = path.join(here, 'ytscout-subs.json');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
// YouTube's search filter codes: sort by view count + type video + upload date this year / this month.
const FILTER = { year: 'CAMSBAgFEAE%253D', month: 'CAMSBAgEEAE%253D' };

async function slot(fn) {
  let held;
  for (let i = 0; !held; i++) {
    for (const s of [LOCK + '0', LOCK + '1']) {
      try { fs.mkdirSync(s); held = s; break; } catch {
        try { if (Date.now() - fs.statSync(s).mtimeMs > 90_000) fs.rmdirSync(s); } catch {}
      }
    }
    if (!held) await sleep(200 + (i % 7) * 50);
  }
  try { return await fn(); } finally { try { fs.rmdirSync(held); } catch {} }
}

function curl(url) {
  try {
    const out = execFileSync('curl', ['-s', '-m', '30', '-A', UA, '-H', 'Accept-Language: en-US,en;q=0.9',
      '-H', 'Cookie: SOCS=CAI; CONSENT=YES+1', '-w', '\n%{http_code}', url], { maxBuffer: 64 << 20, encoding: 'utf8' });
    const i = out.lastIndexOf('\n');
    return { status: Number(out.slice(i + 1)), body: out.slice(0, i) };
  } catch { return { status: 0, body: '' }; }
}
const get = url => slot(async () => {
  let r;
  for (let a = 0; a < 3; a++) { r = curl(url); if (r.status === 200) break; await sleep(4000 * (a + 1)); }
  await sleep(700);
  return r;
});

// "1.2M" -> 1200000, "12,345" -> 12345. Returns null when there is no number, never 0, so a missing count can't look like a tiny channel.
function count(s) {
  const m = String(s || '').replace(/,/g, '').match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  return Math.round(parseFloat(m[1]) * ({ K: 1e3, M: 1e6, B: 1e9 }[(m[2] || '').toUpperCase()] || 1));
}
// "3 weeks ago" or YouTube's newer "3w ago" / "3mo ago" / "1y ago" -> days. Approximate by design: YouTube only gives this resolution.
// Order matters: "mo" and "min" must be tried before "m" could be misread.
const UNIT = [[/^(second|sec|s)/, 0], [/^(minute|min)/, 0], [/^(hour|hr|h)/, 0], [/^(day|d)/, 1], [/^(week|wk|w)/, 7], [/^(month|mo)/, 30], [/^(year|yr|y)/, 365]];
function ageDays(s) {
  const m = String(s || '').toLowerCase().match(/(\d+)\s*([a-z]+)/);
  if (!m) return null;
  const unit = UNIT.find(([re]) => re.test(m[2]));
  return unit ? Math.max(1, Number(m[1]) * unit[1]) : null;
}
const text = t => t ? (t.simpleText || (t.runs || []).map(x => x.text).join('')) : '';
const seconds = s => String(s || '').split(':').reduce((a, x) => a * 60 + Number(x), 0) || null;

function videos(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (node.videoRenderer) {
    const v = node.videoRenderer, owner = (v.ownerText?.runs || [])[0] || {};
    out.push({
      title: text(v.title), id: v.videoId, views: count(text(v.viewCountText)), age_days: ageDays(text(v.publishedTimeText)),
      length_s: seconds(text(v.lengthText)), channel: owner.text || '',
      channel_id: owner.navigationEndpoint?.browseEndpoint?.browseId || '',
    });
  }
  for (const k in node) videos(node[k], out);
  return out;
}

let subsCache = {};
try { subsCache = JSON.parse(fs.readFileSync(SUBS_CACHE, 'utf8')); } catch {}
// The count must come from the channel's own page header. A channel page also lists the subscriber counts of channels it
// features, so "the first number followed by 'subscribers'" is usually someone else's (it reported 2,080 for a 22M channel).
// The header is also tied back to the channel id we asked for, so a redirect or a layout change yields null, never a wrong number.
function ownSubscribers(body, channelId) {
  const m = body.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  if (!m) return null;
  let d; try { d = JSON.parse(m[1]); } catch { return null; }
  if (d.metadata?.channelMetadataRenderer?.externalId !== channelId) return null;
  const rows = d.header?.pageHeaderRenderer?.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];
  for (const row of rows) for (const part of row.metadataParts || []) {
    const t = part.text?.content || '';
    if (/subscribers?$/i.test(t.trim())) return count(t);
  }
  return null;
}
async function subscribers(channelId) {
  if (!channelId) return null;
  if (channelId in subsCache) return subsCache[channelId];
  const r = await get('https://www.youtube.com/channel/' + channelId);
  const n = r.status === 200 ? ownSubscribers(r.body, channelId) : null;
  if (n !== null) { subsCache[channelId] = n; try { fs.writeFileSync(SUBS_CACHE, JSON.stringify(subsCache)); } catch {} }
  return n;
}

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : d; };
// Below MIN_VIEWS a ratio is noise (122 views on a 3-subscriber channel is "40x" and means nothing), so those videos get no outlier score.
const period = opt('--period', 'year'), top = Number(opt('--top', '25')), MIN_VIEWS = Number(opt('--min-views', '10000'));
if (!FILTER[period] || !args.length) { console.error('usage: node ytscout.mjs [--period year|month] [--top 25] [--min-views 10000] "query" ...'); process.exit(2); }

const results = [];
for (const q of args) {
  const r = await get(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=${FILTER[period]}`);
  const m = r.status === 200 && r.body.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  if (!m) { results.push({ query: q, period, error: `could not read YouTube search (HTTP ${r.status})` }); continue; }
  const seen = new Set();
  const list = videos(JSON.parse(m[1])).filter(v => v.id && !seen.has(v.id) && seen.add(v.id)).slice(0, top);
  for (const v of list) {
    v.subs = await subscribers(v.channel_id);
    v.outlier = v.subs && v.views >= MIN_VIEWS ? +(v.views / v.subs).toFixed(2) : null;
    v.views_per_day = v.views && v.age_days ? Math.round(v.views / v.age_days) : null;
  }
  list.sort((a, b) => (b.outlier ?? -1) - (a.outlier ?? -1));
  results.push({ query: q, period, videos: list });
}
console.log(JSON.stringify(results, null, 1));
