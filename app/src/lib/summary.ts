/**
 * The visit summary: a one-page, clinician-friendly PDF made on the phone from the person's own entries.
 * Everything typed by the person is escaped before it goes into the HTML.
 */
import type { T } from '@/i18n/core';
import { linePath, linePoints } from './chart';
import { addDays, clock, dayKey, formatDay, formatDate, lastDays } from './dates';
import { esc } from './html';
import { averages, symptomCounts, type Checkin } from './insights';
import { adherenceFor, asNeeded, type Dose, type Med } from './schedule';
import { formatVital, type UnitSystem, type Vital, type VitalKind, VITAL_KINDS, unitKey } from './units';

export type SummaryInput = {
  days: number;
  name: string;
  includeNotes: boolean;
  checkins: Checkin[];
  vitals: Vital[];
  meds: Med[];
  doses: Dose[];
  questions: string[];
  units: UnitSystem;
  now?: Date;
};

export function summaryModel(input: SummaryInput) {
  const now = input.now ?? new Date();
  const to = dayKey(now);
  const from = addDays(to, -(input.days - 1));
  const days = lastDays(input.days, to);
  const checkins = input.checkins.filter(c => c.day >= from && c.day <= to);
  const byDay = new Map(checkins.map(c => [c.day, c]));
  const fromMs = new Date(`${from}T00:00:00`).getTime();
  const vitals = input.vitals.filter(v => dayKey(v.at) >= from && dayKey(v.at) <= to);
  const meds = input.meds.filter(m => m.active || input.doses.some(d => d.medId === m.id && d.day >= from));
  return {
    from,
    to,
    days: input.days,
    name: input.name.trim(),
    checkinCount: checkins.length,
    averages: averages(checkins),
    mood: days.map(d => byDay.get(d)?.mood ?? null),
    sleep: days.map(d => byDay.get(d)?.sleep ?? null),
    energy: days.map(d => byDay.get(d)?.energy ?? null),
    symptoms: symptomCounts(checkins),
    meds: meds.map(m => ({ med: m, ...adherenceFor(m, input.doses, from, to, now) })),
    vitals: VITAL_KINDS.map(kind => {
      const list = vitals.filter(v => v.kind === kind).sort((a, b) => a.at - b.at);
      if (!list.length) return null;
      const values = list.map(v => v.value);
      const lo = list[values.indexOf(Math.min(...values))]!;
      const hi = list[values.indexOf(Math.max(...values))]!;
      return { kind, latest: list[list.length - 1]!, low: lo, high: hi, count: list.length };
    }).filter((v): v is { kind: VitalKind; latest: Vital; low: Vital; high: Vital; count: number } => v !== null),
    notes: input.includeNotes ? checkins.filter(c => c.note.trim()).map(c => ({ day: c.day, note: c.note.trim() })) : [],
    questions: input.questions.map(q => q.trim()).filter(Boolean),
    since: fromMs,
    generatedAt: now.getTime(),
  };
}

export type SummaryModel = ReturnType<typeof summaryModel>;

export function hasContent(m: SummaryModel): boolean {
  return m.checkinCount > 0 || m.meds.length > 0 || m.vitals.length > 0 || m.questions.length > 0;
}

function chartSvg(values: (number | null)[], min: number, max: number, color: string, label: string): string {
  const w = 300;
  const h = 90;
  const grid = [0, 0.5, 1].map(f => `<line x1="0" x2="${w}" y1="${(4 + f * (h - 8)).toFixed(1)}" y2="${(4 + f * (h - 8)).toFixed(1)}" stroke="#E3E9E3" stroke-width="1"/>`).join('');
  const path = linePath(values, w, h, min, max, 4);
  const dots = linePoints(values, w, h, min, max, 4).map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.2" fill="${color}"/>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="${esc(label)}">${grid}<path d="${path}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>${dots}</svg>`;
}

export function summaryHtml(m: SummaryModel, t: T, units: UnitSystem, symptomName: (key: string) => string): string {
  const loc = t.locale;
  const longDay = (d: string) => formatDay(d, loc, { month: 'short', day: 'numeric', year: 'numeric' });
  const shortDay = (d: string) => formatDay(d, loc, { month: 'short', day: 'numeric' });
  const num = (n: number | null, places = 1) => (n === null ? '–' : n.toLocaleString(loc, { maximumFractionDigits: places, minimumFractionDigits: 0 }));
  const unit = (kind: VitalKind) => t(`vitals.units.${unitKey(kind, units)}`);
  const kindName = (kind: VitalKind) => t(`vitals.${kind}`);
  const none = `<p class="none">${esc(t('summary.pdf.none'))}</p>`;
  const am = t('common.am');
  const pm = t('common.pm');

  const stats = [
    [t('summary.checkins'), `${m.checkinCount}<small>/${m.days}</small>`],
    [t('summary.moodAvg'), m.averages.mood === null ? '–' : `${num(m.averages.mood)}<small>/5</small>`],
    [t('summary.energyAvg'), m.averages.energy === null ? '–' : `${num(m.averages.energy)}<small>/5</small>`],
    [t('summary.sleepAvg'), m.averages.sleep === null ? '–' : `${num(m.averages.sleep)}<small> h</small>`],
  ].map(([label, value]) => `<div class="stat"><span>${esc(label)}</span><b>${value}</b></div>`).join('');

  const charts = m.checkinCount
    ? `<div class="charts">
        <figure><figcaption>${esc(t('summary.pdf.moodScale'))}</figcaption>${chartSvg(m.mood, 1, 5, '#1E4A3B', t('summary.pdf.moodScale'))}</figure>
        <figure><figcaption>${esc(t('summary.pdf.sleepHours'))}</figcaption>${chartSvg(m.sleep, 0, 12, '#C98A3B', t('summary.pdf.sleepHours'))}</figure>
      </div>`
    : '';

  const symptoms = m.symptoms.length
    ? `<table><thead><tr><th>${esc(t('summary.pdf.symptoms'))}</th><th class="n">${esc(t('summary.pdf.symptomDays'))}</th><th>${esc(t('summary.pdf.firstLast'))}</th></tr></thead><tbody>${m.symptoms
        .slice(0, 10)
        .map(s => `<tr><td>${esc(symptomName(s.symptom))}</td><td class="n">${s.n}</td><td>${esc(shortDay(s.first))}${s.first === s.last ? '' : ` – ${esc(shortDay(s.last))}`}</td></tr>`)
        .join('')}</tbody></table>`
    : none;

  const meds = m.meds.length
    ? `<table><thead><tr><th>${esc(t('summary.pdf.medName'))}</th><th>${esc(t('summary.pdf.medDose'))}</th><th>${esc(t('summary.pdf.medSchedule'))}</th><th class="n">${esc(t('summary.pdf.medAdherence'))}</th></tr></thead><tbody>${m.meds
        .map(({ med, taken, due }) => {
          const schedule = asNeeded(med) ? t('meds.asNeeded') : med.times.map(x => clock(x, am, pm)).join(', ');
          const adh = due ? `${t('common.of', { a: taken, b: due })} (${Math.round((taken / due) * 100)}%)` : '–';
          return `<tr><td>${esc(med.name)}${med.active ? '' : ` <i>(${esc(t('meds.paused'))})</i>`}</td><td>${esc(med.dose || '–')}</td><td>${esc(schedule)}</td><td class="n">${esc(adh)}</td></tr>`;
        })
        .join('')}</tbody></table>`
    : none;

  const vitals = m.vitals.length
    ? `<table><thead><tr><th>${esc(t('summary.pdf.readingKind'))}</th><th>${esc(t('summary.pdf.readingLatest'))}</th><th>${esc(t('summary.pdf.readingRange'))}</th><th class="n">${esc(t('summary.pdf.readingCount'))}</th></tr></thead><tbody>${m.vitals
        .map(v => {
          const latest = `${formatVital(v.latest, units, loc)} ${unit(v.kind)} <small>(${esc(shortDay(dayKey(v.latest.at)))})</small>`;
          const range = v.count > 1 ? `${formatVital(v.low, units, loc)} – ${formatVital(v.high, units, loc)} ${unit(v.kind)}` : '–';
          return `<tr><td>${esc(kindName(v.kind))}</td><td>${latest}</td><td>${esc(range)}</td><td class="n">${v.count}</td></tr>`;
        })
        .join('')}</tbody></table>`
    : none;

  const questions = m.questions.length ? `<ol class="questions">${m.questions.map(q => `<li>${esc(q)}</li>`).join('')}</ol>` : none;
  const notes = m.notes.length
    ? `<section><h2>${esc(t('summary.pdf.notes'))}</h2><ul class="notes">${m.notes
        .slice(-20)
        .map(n => `<li><b>${esc(shortDay(n.day))}</b> ${esc(n.note)}</li>`)
        .join('')}</ul></section>`
    : '';

  return `<!doctype html><html lang="${t.lang}"><head><meta charset="utf-8"><title>${esc(t('summary.pdf.title'))}</title>
<style>
  @page { size: letter; margin: 0.55in 0.6in; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #10261E; font: 10.5pt/1.45 -apple-system, "Helvetica Neue", Roboto, Arial, sans-serif; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #1E4A3B; padding-bottom: 10px; margin-bottom: 12px; }
  .brand { display: flex; align-items: center; gap: 8px; color: #1E4A3B; font: 600 11pt Georgia, serif; }
  h1 { margin: 0; font: 500 21pt/1.1 Georgia, "Times New Roman", serif; color: #0D241C; letter-spacing: -0.3px; }
  .meta { text-align: right; font-size: 9.5pt; color: #3E5A4C; }
  .meta b { color: #10261E; font-size: 11pt; }
  .reported { margin: 0 0 14px; padding: 7px 10px; background: #FFF3DC; color: #5A3A00; border-radius: 6px; font-size: 9pt; }
  section { margin-bottom: 14px; page-break-inside: avoid; }
  h2 { font: 600 12.5pt Georgia, serif; color: #1E4A3B; margin: 0 0 6px; }
  .stats { display: flex; gap: 8px; margin-bottom: 10px; }
  .stat { flex: 1; border: 1px solid #DCE5DD; border-radius: 8px; padding: 7px 9px; }
  .stat span { display: block; font-size: 8.5pt; color: #5B7366; }
  .stat b { font: 500 17pt Georgia, serif; }
  .stat small { font-size: 9pt; color: #5B7366; }
  .charts { display: flex; gap: 14px; }
  figure { flex: 1; margin: 0; }
  figcaption { font-size: 8.5pt; color: #5B7366; margin-bottom: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  th { text-align: left; font-weight: 600; color: #3E5A4C; border-bottom: 1px solid #C9D6CB; padding: 4px 6px 4px 0; }
  td { border-bottom: 1px solid #EDF2EC; padding: 4px 6px 4px 0; vertical-align: top; }
  td small { color: #5B7366; }
  .n { text-align: right; white-space: nowrap; }
  .none { color: #5B7366; margin: 0; }
  .questions { margin: 0; padding-left: 18px; }
  .questions li { margin-bottom: 3px; }
  .notes { margin: 0; padding: 0; list-style: none; }
  .notes li { margin-bottom: 4px; }
  footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #C9D6CB; font-size: 8.5pt; color: #5B7366; display: flex; justify-content: space-between; }
</style></head><body>
<header>
  <div>
    <div class="brand"><svg width="18" height="18" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 4C40 16 58 34 32 52C6 34 24 16 32 4Z" fill="#1E4A3B"/><path d="M32 13V38C32 43.5 28.5 45 26.5 42" fill="none" stroke="#fff" stroke-width="4.8" stroke-linecap="round"/><path d="M32 52C32 56 31.5 58.5 29.5 61" fill="none" stroke="#1E4A3B" stroke-width="3" stroke-linecap="round"/></svg>Jachi Health</div>
    <h1>${esc(t('summary.pdf.title'))}</h1>
  </div>
  <div class="meta">${m.name ? `<b>${esc(m.name)}</b><br>` : ''}${esc(t('summary.pdf.period', { from: longDay(m.from), to: longDay(m.to) }))}<br>${esc(t('summary.pdf.prepared', { date: formatDate(m.generatedAt, loc, { month: 'long', day: 'numeric', year: 'numeric' }) }))}</div>
</header>
<p class="reported">${esc(t('summary.pdf.patientReported'))}</p>
<section><h2>${esc(t('summary.pdf.questions'))}</h2>${questions}</section>
<section><h2>${esc(t('summary.pdf.overview'))}</h2><div class="stats">${stats}</div>${charts}</section>
<section><h2>${esc(t('summary.pdf.medications'))}</h2>${meds}</section>
<section><h2>${esc(t('summary.pdf.symptoms'))}</h2>${symptoms}</section>
<section><h2>${esc(t('summary.pdf.readings'))}</h2>${vitals}</section>
${notes}
<footer><span>${esc(t('summary.pdf.footer'))}</span><span>jachihealth.com</span></footer>
</body></html>`;
}
