#!/usr/bin/env node
// The naming agent's full clearance check: YouTube, the .com domain, and live US trademarks, for each name.
//   node brandcheck.mjs [--json] "Name One" "Name Two" ...
//
// It does not replace ytcheck.mjs; it runs it unchanged and adds two registries on top, so there is still exactly one
// definition of "free on YouTube". Verdicts, strictest first:
//   BLOCKED   YouTube says TAKEN, or a LIVE US trademark with the same wording covers media or entertainment
//             (classes 9, 38, 41: downloadable media, broadcasting, entertainment and education services)
//   CAUTION   YouTube CROWDED, or a live same-wording mark in another class, or the .com is registered
//   CLEAR     YouTube CLEAR, no live same-wording mark, and the .com is unregistered
//   UNKNOWN   any registry could not be read; never reported as clear
// What it cannot see, and the owner must check by hand before committing: Instagram, TikTok and X handles (those sites
// refuse automated lookups), state trademarks, unregistered common-law use, and trademarks outside the US. It is a
// screening tool, not legal clearance.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const MEDIA_CLASSES = new Set(['IC 009', 'IC 038', 'IC 041']);
const compact = s => s.replace(/[^A-Za-z0-9]/g, '');

function curl(args) {
  try { return execFileSync('curl', ['-s', '-m', '30', '-A', UA, ...args], { maxBuffer: 32 << 20, encoding: 'utf8' }); }
  catch { return null; }
}

// RDAP is the registries' own lookup: 200 = registered, 404 = nobody holds it. Anything else is UNKNOWN, not "free".
function dotCom(name) {
  const domain = compact(name).toLowerCase() + '.com';
  const out = curl(['-o', '/dev/null', '-w', '%{http_code}', `https://rdap.verisign.com/com/v1/domain/${domain}`]);
  return { domain, state: out === '404' ? 'available' : out === '200' ? 'registered' : 'unknown' };
}

// Live marks containing the name's wording, once case, spaces and punctuation are ignored. Containment, not equality:
// Kurzgesagt's own mark is "KURZGESAGT IN A NUTSHELL", and an exact-match rule waved "Kurzgesagt" through.
function trademarks(name) {
  const body = JSON.stringify({ query: { match_phrase: { WM: name.replace(/&/g, 'and') } }, size: 50 });
  const raw = curl(['-H', 'Content-Type: application/json', '-X', 'POST', '-d', body, 'https://tmsearch.uspto.gov/prod-stage-v1-0-0/tmsearch']);
  let hits;
  try { hits = JSON.parse(raw).hits.hits.map(h => h.source); } catch { return { state: 'unknown', live: [] }; }
  const want = compact(name.replace(/&/g, 'and')).toLowerCase().replace(/^the/, '');
  const live = hits.filter(s => s.alive && compact(s.wordmark || '').toLowerCase().includes(want))
    .map(s => ({ mark: s.wordmark, owner: (s.ownerName || [])[0] || '', classes: s.internationalClass || [], status: s.statusDescription }));
  return { state: 'ok', live, media: live.filter(m => m.classes.some(c => MEDIA_CLASSES.has(c))) };
}

function youtube(names) {
  try {
    return JSON.parse(execFileSync('node', [path.join(here, 'ytcheck.mjs'), '--json', ...names], { maxBuffer: 32 << 20, encoding: 'utf8', timeout: 590000 }));
  } catch (e) {
    const out = String(e.stdout || '');
    try { return JSON.parse(out); } catch { return names.map(n => ({ name: n, verdict: 'UNKNOWN', reasons: ['ytcheck failed: ' + (out || e.message).slice(0, 160)] })); }
  }
}

const args = process.argv.slice(2), json = args.includes('--json'), names = args.filter(a => !a.startsWith('--'));
if (!names.length) { console.error('usage: node brandcheck.mjs [--json] "Name One" ...'); process.exit(2); }

const yt = youtube(names);
const results = names.map((name, i) => {
  const y = Array.isArray(yt) ? yt.find(r => r.name === name) || yt[i] : { verdict: 'UNKNOWN', reasons: [yt?.error || 'ytcheck controls failed'] };
  const com = dotCom(name), tm = trademarks(name);
  const reasons = [...(y?.reasons || [])];
  if (com.state === 'registered') reasons.push(`${com.domain} is registered`);
  for (const m of tm.live || []) reasons.push(`live US trademark "${m.mark}" (${m.classes.join(', ')}) owned by ${m.owner}`);
  let verdict;
  if (y?.verdict === 'TAKEN' || tm.media?.length) verdict = 'BLOCKED';
  else if (y?.verdict === 'UNKNOWN' || com.state === 'unknown' || tm.state === 'unknown') verdict = 'UNKNOWN';
  else if (y?.verdict === 'CROWDED' || (tm.live || []).length || com.state === 'registered') verdict = 'CAUTION';
  else verdict = 'CLEAR';
  return { name, verdict, youtube: y?.verdict, handle: y?.handle, dot_com: com, trademarks: tm.live || [], reasons };
});

if (json) console.log(JSON.stringify(results, null, 1));
else for (const r of results) {
  console.log(`${r.verdict.padEnd(8)} ${r.name}  (YouTube ${r.youtube}; ${r.dot_com.domain} ${r.dot_com.state}; live same-name US marks: ${r.trademarks.length})`);
  for (const x of r.reasons) console.log('           - ' + x);
}
