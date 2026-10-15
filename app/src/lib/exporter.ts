/** Journal exports the person can keep or share: one CSV with every entry, and a full JSON copy. */
import { toCsv } from './csv';
import { clock, dayKey, nowTime } from './dates';
import type { Checkin } from './insights';
import type { Question } from './db';
import type { Dose, Med } from './schedule';
import type { Vital } from './units';

export type Journal = { checkins: Checkin[]; vitals: Vital[]; meds: Med[]; doses: Dose[]; questions: Question[] };

const HEADER = ['type', 'date', 'time', 'mood_1_to_5', 'energy_1_to_5', 'sleep_hours', 'symptoms', 'measure', 'value', 'value2', 'unit', 'medication', 'dose', 'status', 'note'];

const UNITS: Record<Vital['kind'], string> = { bp: 'mmHg', hr: 'bpm', weight: 'kg', temp: 'C', glucose: 'mg/dL' };

const timeOf = (ms: number) => nowTime(new Date(ms));

export function journalCsv(j: Journal): string {
  const medName = new Map(j.meds.map(m => [m.id, m]));
  const rows: (string | number | null)[][] = [HEADER];
  for (const c of j.checkins) {
    rows.push(['check-in', c.day, timeOf(c.at), c.mood, c.energy, c.sleep, c.symptoms.join('; '), '', '', '', '', '', '', '', c.note]);
  }
  for (const v of j.vitals) {
    rows.push(['reading', dayKey(v.at), timeOf(v.at), '', '', '', '', v.kind, v.value, v.value2, UNITS[v.kind], '', '', '', v.note]);
  }
  for (const m of j.meds) {
    rows.push(['medication', dayKey(m.createdAt), '', '', '', '', '', '', '', '', '', m.name, m.dose, m.active ? 'active' : 'paused',
      [m.times.length ? `times ${m.times.map(t => clock(t, 'AM', 'PM')).join(', ')}` : 'as needed', m.notes].filter(Boolean).join(' | ')]);
  }
  for (const d of j.doses) {
    const m = medName.get(d.medId);
    rows.push(['dose', d.day, d.time, '', '', '', '', '', '', '', '', m?.name ?? '', m?.dose ?? '', d.status, '']);
  }
  for (const q of j.questions) {
    rows.push(['question', dayKey(q.at), timeOf(q.at), '', '', '', '', '', '', '', '', '', '', '', q.text]);
  }
  return toCsv(rows);
}

export function journalJson(j: Journal, appVersion: string): string {
  return JSON.stringify(
    {
      format: 'jachi-journal',
      version: 1,
      exportedAt: new Date().toISOString(),
      app: appVersion,
      units: { weight: 'kg', temperature: 'C', glucose: 'mg/dL', bloodPressure: 'mmHg', heartRate: 'bpm' },
      ...j,
    },
    null,
    2,
  );
}
