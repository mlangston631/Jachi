/** Medication schedules: today's doses, adherence and refill estimates. Pure functions, easy to test. */
import { addDays, at, dayKey, daysBetween, minutesOf, sortTimes } from './dates';

export type Med = {
  id: number;
  name: string;
  dose: string;
  /** Daily reminder times, "HH:MM". Empty means "as needed". */
  times: string[];
  /** Doses on hand, or null when not tracked. */
  supply: number | null;
  perDose: number;
  refillDays: number;
  notes: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export type DoseStatus = 'taken' | 'skipped';
export type Dose = { id: number; medId: number; day: string; time: string; status: DoseStatus; at: number };

export type SlotState = 'taken' | 'skipped' | 'due' | 'upcoming' | 'missed';
export type Slot = { med: Med; day: string; time: string; dose: Dose | null; state: SlotState };

export const asNeeded = (med: Med) => med.times.length === 0;

const doseKey = (medId: number, day: string, time: string) => `${medId}|${day}|${time}`;

function indexDoses(doses: Dose[]): Map<string, Dose> {
  const map = new Map<string, Dose>();
  for (const d of doses) map.set(doseKey(d.medId, d.day, d.time), d);
  return map;
}

/** Scheduled doses for one day, in time order. Paused medications and days before a med was added are left out. */
export function slotsForDay(meds: Med[], doses: Dose[], day: string, now: Date = new Date()): Slot[] {
  const today = dayKey(now);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const byKey = indexDoses(doses);
  const slots: Slot[] = [];
  for (const med of meds) {
    if (!med.active || asNeeded(med)) continue;
    if (daysBetween(dayKey(med.createdAt), day) < 0) continue;
    for (const time of sortTimes(med.times)) {
      const dose = byKey.get(doseKey(med.id, day, time)) ?? null;
      let state: SlotState;
      if (dose) state = dose.status;
      else if (day < today) state = 'missed';
      else if (day > today) state = 'upcoming';
      else state = minutesOf(time) <= nowMins ? 'due' : 'upcoming';
      slots.push({ med, day, time, dose, state });
    }
  }
  return slots.sort((a, b) => minutesOf(a.time) - minutesOf(b.time) || a.med.name.localeCompare(b.med.name));
}

/** Doses that were due in [from, to] (inclusive day keys) and how many were taken. */
export function adherence(meds: Med[], doses: Dose[], from: string, to: string, now: Date = new Date()) {
  let due = 0;
  let taken = 0;
  let skipped = 0;
  const span = daysBetween(from, to);
  for (let i = 0; i <= span; i++) {
    const day = addDays(from, i);
    for (const s of slotsForDay(meds, doses, day, now)) {
      if (s.state === 'upcoming') continue;
      due += 1;
      if (s.state === 'taken') taken += 1;
      if (s.state === 'skipped') skipped += 1;
    }
  }
  return { due, taken, skipped, rate: due ? taken / due : null };
}

export function adherenceFor(med: Med, doses: Dose[], from: string, to: string, now: Date = new Date()) {
  return adherence([med], doses.filter(d => d.medId === med.id), from, to, now);
}

/** Doses used per day: one per reminder time. As-needed meds have no fixed use. */
export function dailyUse(med: Med): number {
  return med.times.length * Math.max(med.perDose, 0);
}

/** Whole days of supply left, or null when supply isn't tracked or use is unknown. */
export function daysLeft(med: Med): number | null {
  if (med.supply === null) return null;
  const use = dailyUse(med);
  if (use <= 0) return null;
  return Math.max(0, Math.floor(med.supply / use));
}

export function needsRefill(med: Med): boolean {
  const left = daysLeft(med);
  return med.active && left !== null && left <= med.refillDays;
}

/** When the refill reminder should fire: the morning (9:00) of the day supply reaches the threshold. */
export function refillAlertAt(med: Med, now: Date = new Date()): Date | null {
  const left = daysLeft(med);
  if (left === null || !med.active) return null;
  const inDays = left - med.refillDays;
  const when = at(addDays(dayKey(now), Math.max(inDays, 0)), '09:00');
  if (when.getTime() <= now.getTime()) {
    return inDays > 0 ? null : new Date(now.getTime() + 60_000);
  }
  return when;
}

/** Supply after logging (+1) or undoing (-1) a taken dose. */
export function supplyAfter(med: Med, change: 1 | -1): number | null {
  if (med.supply === null) return null;
  const next = med.supply - change * med.perDose;
  return Math.max(0, Math.round(next * 100) / 100);
}
