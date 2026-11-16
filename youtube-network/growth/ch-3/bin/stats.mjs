import fs from 'node:fs';
const vids = [];
const seen = new Set();
for (const f of process.argv.slice(2)) for (const q of JSON.parse(fs.readFileSync(f,'utf8'))) for (const v of q.videos) if (!seen.has(v.id)) { seen.add(v.id); vids.push(v); }
const all = vids.filter(v => v.outlier != null);
const out = all.filter(v => v.outlier >= 5);
console.log('videos with ratio:', all.length, ' outliers >=5x:', out.length, ' channels:', new Set(out.map(v=>v.channel)).size);
const bands = [[0,4],[4,8],[8,12],[12,16],[16,25],[25,45],[45,1e9]];
const med = a => { const s=[...a].sort((x,y)=>x-y); return s.length? s[Math.floor(s.length/2)] : null; };
console.log('\nlength band | all w/ratio | >=5x | share | median ratio(all) | channels >=5x');
for (const [a,b] of bands) {
  const inb = all.filter(v => v.length_s/60 >= a && v.length_s/60 < b);
  const o = inb.filter(v => v.outlier >= 5);
  console.log(`${a}-${b===1e9?'+':b} min | ${inb.length} | ${o.length} | ${(o.length/Math.max(1,inb.length)*100).toFixed(0)}% | ${med(inb.map(v=>v.outlier))} | ${new Set(o.map(v=>v.channel)).size}`);
}
const shapes = {
  'starts How/how does': t => /^how\b/i.test(t),
  'Why ...': t => /^why\b/i.test(t),
  'Every X Explained': t => /\bevery\b.*explained/i.test(t),
  'in N minutes': t => /\bin (less than |under )?\d+ min/i.test(t),
  'Actually / REALLY': t => /\b(actually|really)\b/i.test(t),
  'question mark': t => /\?/.test(t),
  'contains a number': t => /\d/.test(t),
  'institution (MIT/Harvard/Stanford)': t => /\b(MIT|Harvard|Stanford|Researchers)\b/.test(t),
  'Quietly / not telling / secret': t => /quietly|not telling|secret|hidden|don.t want/i.test(t),
  'Just + verb (news claim)': t => /\bjust (found|discovered|proved|made|crossed|solved)/i.test(t),
  'I tried/I made/I built (first person)': t => /^(I|I'm|I've)\b|\bI (tried|made|built|gave|turned)\b/.test(t),
  'ALL CAPS word': t => /\b[A-Z]{4,}\b/.test(t.replace(/\b(MIT|GPU|CPU|NPU|LLM|LLMS|RAM|VRAM|USSR|ChatGPT|GPS|PHP|BBC|TSMC|NASA|AMD|AI)\b/g,'')),
};
console.log('\ntitle shape | >=5x count | channels | share of >=5x | share of <1x');
const low = all.filter(v => v.outlier < 1);
for (const [k, f] of Object.entries(shapes)) {
  const o = out.filter(v => f(v.title)); const l = low.filter(v => f(v.title));
  console.log(`${k} | ${o.length} | ${new Set(o.map(v=>v.channel)).size} | ${(o.length/out.length*100).toFixed(0)}% | ${(l.length/low.length*100).toFixed(0)}%`);
}
