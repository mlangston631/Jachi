/** Check-in streaks, the weekly goal and milestones. Built to encourage, never to shame. */
import { addDays, dayKey, weekOf } from './dates';

export const MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365] as const;

/**
 * Current streak counts consecutive days with a check-in ending today, or ending yesterday when today's
 * check-in isn't done yet (so the streak isn't "lost" in the morning).
 */
export function streaks(days: Iterable<string>, today: string = dayKey()) {
  const set = new Set(days);
  const todayDone = set.has(today);
  let current = 0;
  let cursor = todayDone ? today : addDays(today, -1);
  while (set.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  let best = 0;
  const sorted = [...set].sort();
  let run = 0;
  let prev = '';
  for (const d of sorted) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return { current, best, todayDone };
}

/** The highest milestone reached that hasn't been celebrated yet. */
export function newMilestone(current: number, seen: readonly number[]): number | null {
  const reached = MILESTONES.filter(m => current >= m && !seen.includes(m));
  return reached.length ? reached[reached.length - 1]! : null;
}

export function weekProgress(days: Iterable<string>, today: string = dayKey()) {
  const set = new Set(days);
  const week = weekOf(today);
  return week.map(day => ({ day, done: set.has(day), future: day > today, today: day === today }));
}

/**
 * Weekly goal that adapts gently: one more than the average of the last two full weeks, between 3 and 7.
 * New users start at 5.
 */
export function adaptiveGoal(days: Iterable<string>, today: string = dayKey()): number {
  const set = new Set(days);
  const start = weekOf(today)[0]!;
  const counts = [1, 2].map(w => weekOf(addDays(start, -7 * w)).filter(d => set.has(d)).length);
  if (counts.every(c => c === 0)) return 5;
  const avg = (counts[0]! + counts[1]!) / 2;
  return Math.min(7, Math.max(3, Math.round(avg) + 1));
}
