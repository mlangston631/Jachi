import fs from 'node:fs';
for (const f of process.argv.slice(2)) {
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const q of data) {
    console.log(`\n=== [${q.period}] ${q.query} ${q.error||''}`);
    for (const v of q.videos || []) {
      const len = v.length_s ? (v.length_s/60).toFixed(1)+'m' : '?';
      const fmt = n => n==null?'?':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(n);
      console.log(`${String(v.outlier??'-').padStart(7)} | ${fmt(v.views).padStart(7)} v | ${fmt(v.subs).padStart(7)} s | ${String(v.age_days??'?').padStart(3)}d | ${len.padStart(6)} | ${v.channel.slice(0,24).padEnd(24)} | ${v.title}`);
    }
  }
}
