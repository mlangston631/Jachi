import fs from 'node:fs';
const files = process.argv.slice(2);
const fmt = n => n==null?'-': n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(n);
for (const f of files) {
  for (const q of JSON.parse(fs.readFileSync(f,'utf8'))) {
    console.log(`\n=== [${q.period}] ${q.query} ${q.error||''}`);
    for (const v of (q.videos||[])) console.log(`${String(v.outlier??'-').padStart(7)} | ${fmt(v.views).padStart(6)} | subs ${fmt(v.subs).padStart(6)} | ${String(Math.round((v.length_s||0)/60)).padStart(3)}m | ${String(v.age_days??'-').padStart(4)}d | ${v.channel} | ${v.title}`);
  }
}
