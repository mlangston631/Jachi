/**
 * Insights from the person's own entries, computed on the phone. They describe; they never diagnose.
 * Each needs enough data to be meaningful, so early on there are none rather than misleading ones.
 */
import { addDays, dayKey, daysBetween, lastDays } from './dates';
import { adherence, daysLeft, needsRefill, type Dose, type Med } from './schedule';
import type { Vital } from './units';

export type Checkin = {
  id: number;
  day: string;
  at: number;
  mood: number;
  energy: number | null;
  sleep: number | null;
  symptoms: string[];
  note: string;
};

export type Insight =
  | { kind: 'sleepUp' | 'sleepDown'; delta: number; now: number }
  | { kind: 'moodUp' | 'moodDown'; now: number; before: number }
  | { kind: 'sleepMood'; hours: number; high: number; low: number }
  | { kind: 'symptom'; symptom: string; n: number; total: number }
  | { kind: 'adherence'; taken: number; due: number }
  | { kind: 'refill'; name: string; days: number }
  | { kind: 'bpTrend'; n: number; sys: number; dia: number }
  | { kind: 'lowMood' };

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const r1 = (n: number) => Math.round(n * 10) / 10;

function inRange(checkins: Checkin[], from: string, to: string) {
  return checkins.filter(c => c.day >= from && c.day <= to);
}

/** Three or more of the last four check-ins (within 6 days) at mood 2 or lower. */
export function lowMoodStretch(checkins: Checkin[], today: string = dayKey()): boolean {
  const recent = [...checkins]
    .filter(c => daysBetween(c.day, today) <= 6 && daysBetween(c.day, today) >= 0)
    .sort((a, b) => (a.day < b.day ? 1 : -1))
    .slice(0, 4);
  return recent.length >= 3 && recent.filter(c => c.mood <= 2).length >= 3;
}

export function insights(
  input: { checkins: Checkin[]; vitals: Vital[]; meds: Med[]; doses: Dose[] },
  now: Date = new Date(),
): Insight[] {
  const today = dayKey(now);
  const out: Insight[] = [];
  const { checkins, vitals, meds, doses } = input;

  // Week over week (last 7 days vs the 7 before), needs 3+ entries in each week.
  const thisWeek = inRange(checkins, addDays(today, -6), today);
  const lastWeek = inRange(checkins, addDays(today, -13), addDays(today, -7));
  const sleepNow = thisWeek.map(c => c.sleep).filter((s): s is number => s !== null);
  const sleepBefore = lastWeek.map(c => c.sleep).filter((s): s is number => s !== null);
  if (sleepNow.length >= 3 && sleepBefore.length >= 3) {
    const delta = avg(sleepNow) - avg(sleepBefore);
    if (Math.abs(delta) >= 0.5) out.push({ kind: delta > 0 ? 'sleepUp' : 'sleepDown', delta: r1(Math.abs(delta)), now: r1(avg(sleepNow)) });
  }
  if (thisWeek.length >= 3 && lastWeek.length >= 3) {
    const m1 = avg(thisWeek.map(c => c.mood));
    const m0 = avg(lastWeek.map(c => c.mood));
    if (Math.abs(m1 - m0) >= 0.5) out.push({ kind: m1 > m0 ? 'moodUp' : 'moodDown', now: r1(m1), before: r1(m0) });
  }

  // Sleep and mood over the last 30 days: 3+ days in each group and a real difference.
  const month = inRange(checkins, addDays(today, -29), today).filter(c => c.sleep !== null);
  const well = month.filter(c => (c.sleep ?? 0) >= 7);
  const short = month.filter(c => (c.sleep ?? 0) < 7);
  if (well.length >= 3 && short.length >= 3) {
    const high = avg(well.map(c => c.mood));
    const low = avg(short.map(c => c.mood));
    if (high - low >= 0.5) out.push({ kind: 'sleepMood', hours: 7, high: r1(high), low: r1(low) });
  }

  // Most frequent symptom in the last 14 check-ins (3+ times). Red-flag symptoms are handled elsewhere.
  const last14 = [...checkins].sort((a, b) => (a.day < b.day ? 1 : -1)).slice(0, 14);
  const counts = new Map<string, number>();
  for (const c of last14) for (const s of new Set(c.symptoms)) counts.set(s, (counts.get(s) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 3) out.push({ kind: 'symptom', symptom: top[0], n: top[1], total: last14.length });

  // Medications.
  const week = lastDays(7, today);
  const adh = adherence(meds, doses, week[0]!, today, now);
  if (adh.due >= 4) out.push({ kind: 'adherence', taken: adh.taken, due: adh.due });
  for (const med of meds) {
    const left = daysLeft(med);
    if (needsRefill(med) && left !== null) out.push({ kind: 'refill', name: med.name, days: left });
  }

  // Blood pressure: the average of the last 5 readings in 30 days.
  const bp = vitals
    .filter(v => v.kind === 'bp' && v.value2 !== null && daysBetween(dayKey(v.at), today) <= 30)
    .sort((a, b) => b.at - a.at)
    .slice(0, 5);
  if (bp.length >= 3) {
    out.push({ kind: 'bpTrend', n: bp.length, sys: Math.round(avg(bp.map(v => v.value))), dia: Math.round(avg(bp.map(v => v.value2 ?? 0))) });
  }
  return out;
}

export function averages(checkins: Checkin[]) {
  const moods = checkins.map(c => c.mood);
  const energies = checkins.map(c => c.energy).filter((e): e is number => e !== null);
  const sleeps = checkins.map(c => c.sleep).filter((s): s is number => s !== null);
  return {
    mood: moods.length ? r1(avg(moods)) : null,
    energy: energies.length ? r1(avg(energies)) : null,
    sleep: sleeps.length ? r1(avg(sleeps)) : null,
  };
}

export function symptomCounts(checkins: Checkin[]) {
  const map = new Map<string, { n: number; first: string; last: string }>();
  for (const c of [...checkins].sort((a, b) => (a.day < b.day ? -1 : 1))) {
    for (const s of new Set(c.symptoms)) {
      const cur = map.get(s);
      if (cur) {
        cur.n += 1;
        cur.last = c.day;
      } else {
        map.set(s, { n: 1, first: c.day, last: c.day });
      }
    }
  }
  return [...map.entries()].map(([symptom, v]) => ({ symptom, ...v })).sort((a, b) => b.n - a.n);
}
