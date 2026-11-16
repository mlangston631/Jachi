#!/usr/bin/env node
// Checks channel names against YouTube itself.
//   node ytcheck.mjs "Stick Ledger" "Plain Circuit" ...
// For each name it reports:
//   handle  : does youtube.com/@<NameWithoutSpaces> exist?  (404 = nobody has it, 200 = taken)
//   search  : channels YouTube's own search returns for the name (channel filter), with how close each is
// Verdict is CLEAR only when the handle is a definite 404 AND no channel has the same or nearly the same name.
// Anything that can't be read (rate limit, consent page, changed markup) is reported as UNKNOWN, never as clear.
// Requests are serialised across every copy of this script by a lock directory, so parallel callers don't hammer YouTube.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const LOCK = path.join(here, '.ytcheck.lock');
const CACHE = path.join(here, 'ytcheck-cache.json');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function withLock(fn) {
  // Two slots: at most two requests to YouTube at once across every running copy.
  let held;
  for (let i = 0; !held; i++) {
    for (const slot of [LOCK + '0', LOCK + '1']) {
      try { fs.mkdirSync(slot); held = slot; break; } catch {
        try { if (Date.now() - fs.statSync(slot).mtimeMs > 90_000) fs.rmdirSync(slot); } catch {}
      }
    }
    if (!held) await sleep(200 + (i % 7) * 50);
  }
  try { return await fn(); } finally { try { fs.rmdirSync(held); } catch {} }
}

function curl(url) {
  // -w prints the status on the last line; body before it.
  try {
    const out = execFileSync('curl', ['-s', '-m', '30', '-A', UA, '-H', 'Accept-Language: en-US,en;q=0.9',
      '-H', 'Cookie: SOCS=CAI; CONSENT=YES+1', '-w', '\n%{http_code}', url], { maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' });
    const i = out.lastIndexOf('\n');
    return { status: Number(out.slice(i + 1)), body: out.slice(0, i) };
  } catch (e) { return { status: 0, body: '', err: String(e.message).slice(0, 120) }; }
}

async function get(url) {
  return withLock(async () => {
    let r;
    for (let a = 0; a < 3; a++) {
      r = curl(url);
      if (r.status === 200 || r.status === 404) break;
      await sleep(4000 * (a + 1));
    }
    await sleep(700);
    return r;
  });
}

const norm = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');
const strip = s => norm(s).replace(/^the/, '').replace(/(official|channel|tv|yt|hq)$/, '');
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
// same = identical once case, spaces, punctuation and a leading "The" are ignored; near = one or two letters apart, or one contains the other.
function closeness(want, got) {
  const a = strip(want), b = strip(got);
  if (!a || !b) return 'other';
  if (a === b) return 'same';
  const d = lev(a, b);
  if (d <= (a.length >= 10 ? 2 : 1)) return 'near';
  if ((b.includes(a) && a.length >= 6) || (a.includes(b) && b.length >= 6)) return 'contains';
  return 'other';
}

async function handleStatus(handle) {
  const r = await get('https://www.youtube.com/@' + encodeURIComponent(handle));
  if (r.status === 404) return { state: 'free' };
  if (r.status === 200) {
    if (!/ytInitialData/.test(r.body)) return { state: 'unknown', why: '200 without channel data (consent or bot page)' };
    const title = ((r.body.match(/<meta property="og:title" content="([^"]*)"/) || [])[1] || '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    return { state: 'taken', title };
  }
  return { state: 'unknown', why: 'HTTP ' + r.status + (r.err ? ' ' + r.err : '') };
}

function collect(node, out) {
  if (!node || typeof node !== 'object') return;
  if (node.channelRenderer) {
    const c = node.channelRenderer;
    const text = t => t ? (t.simpleText || (t.runs || []).map(x => x.text).join('')) : '';
    out.push({ title: text(c.title), a: text(c.subscriberCountText), b: text(c.videoCountText),
      handle: (c.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || '').replace(/^\//, '') });
  }
  for (const k in node) collect(node[k], out);
}

async function searchChannels(name) {
  // sp=EgIQAg%3D%3D is YouTube's "Type: Channel" filter. Quoted and unquoted, since each surfaces different channels.
  const found = new Map();
  let ok = false;
  for (const q of [`"${name}"`, name]) {
    const r = await get('https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=EgIQAg%253D%253D');
    if (r.status !== 200) continue;
    const m = r.body.match(/var ytInitialData = (\{.*?\});<\/script>/s);
    if (!m) continue;
    let data; try { data = JSON.parse(m[1]); } catch { continue; }
    ok = true;
    const list = []; collect(data, list);
    for (const c of list) found.set(c.handle || c.title, c);
  }
  return ok ? [...found.values()] : null;
}

async function check(name) {
  const handle = name.replace(/[^A-Za-z0-9]/g, '');
  const h = await handleStatus(handle);
  // "The<Name>" and the name as one lowercase word are what people type; if a channel already sits on either, the name isn't clean.
  const alt = /^the/i.test(handle) ? null : await handleStatus('The' + handle);
  const channels = await searchChannels(name);
  const hits = (channels || []).map(c => ({ ...c, match: closeness(name, c.title) === 'other' ? closeness(name, c.handle.replace(/^@/, '')) : closeness(name, c.title) }))
    .filter(c => c.match !== 'other');
  let verdict, reasons = [];
  if (h.state === 'taken') reasons.push(`handle @${handle} is taken by "${h.title}"`);
  if (alt && alt.state === 'taken') reasons.push(`@The${handle} is taken by "${alt.title}"`);
  for (const c of hits) reasons.push(`${c.match}-name channel: "${c.title}" ${c.handle} ${[c.a, c.b].filter(Boolean).join(', ')}`);
  const unknown = h.state === 'unknown' || channels === null || (alt && alt.state === 'unknown');
  if (h.state === 'taken' || hits.some(c => c.match === 'same' || c.match === 'near')) verdict = 'TAKEN';
  else if (unknown) { verdict = 'UNKNOWN'; reasons.push('could not read YouTube: ' + [h.why, channels === null && 'search unreadable', alt?.why].filter(Boolean).join('; ')); }
  else if (reasons.length) verdict = 'CROWDED';   // free, but shares a word-run with existing channels or "The…" variant is used
  else verdict = 'CLEAR';
  return { name, handle: '@' + handle, verdict, reasons, searched: channels ? channels.length : null };
}

const names = process.argv.slice(2).filter(a => !a.startsWith('--'));
const json = process.argv.includes('--json');
if (!names.length) { console.error('usage: node ytcheck.mjs [--json] "Name One" "Name Two" ...'); process.exit(2); }

// Controls first: if YouTube stops telling taken from free, say so and stop rather than report false "clear"s.
const c1 = await handleStatus('YouTube'), c2 = await handleStatus('zq9xkv7jw3nonexistent4471');
if (c1.state !== 'taken' || c2.state !== 'free') {
  console.log(json ? JSON.stringify({ error: 'controls failed', c1, c2 }) : `CONTROLS FAILED (known channel: ${c1.state}, made-up handle: ${c2.state}). Results would not be reliable. Stop and report this.`);
  process.exit(3);
}
const results = [];
for (const n of names) results.push(await check(n));
let cache = {}; try { cache = JSON.parse(fs.readFileSync(CACHE, 'utf8')); } catch {}
for (const r of results) cache[r.name] = r;
try { fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1)); } catch {}
if (json) console.log(JSON.stringify(results, null, 1));
else for (const r of results) {
  console.log(`${r.verdict.padEnd(8)} ${r.name}  (${r.handle}; search returned ${r.searched ?? '?'} channels)`);
  for (const x of r.reasons) console.log('           - ' + x);
}
