/** Which reminders should be scheduled right now. Pure: the notification layer turns this into OS reminders. */
import type { T } from '@/i18n/core';
import { addDays, at, clock, dayKey, minutesOf } from './dates';
import { asNeeded, daysLeft, refillAlertAt, type Med } from './schedule';

export const MAX_PENDING = 60; // iOS keeps at most 64 pending local notifications.

export type PlanTrigger = { type: 'daily'; hour: number; minute: number } | { type: 'date'; date: Date };
export type PlanItem = { id: string; title: string; body: string; url: string; channel: 'meds' | 'checkin'; trigger: PlanTrigger };
export type PlanOptions = { medNames: boolean; checkin: boolean; checkinTime: string; checkedInToday: boolean };

export function plan(meds: Med[], opts: PlanOptions, t: T, now: Date = new Date()): PlanItem[] {
  const out: PlanItem[] = [];
  for (const med of meds) {
    if (!med.active || asNeeded(med)) continue;
    for (const time of med.times) {
      const mins = minutesOf(time);
      out.push({
        id: `med-${med.id}-${time}`,
        title: t('notify.medTitle'),
        body: opts.medNames
          ? t('notify.medBody', { name: med.dose ? `${med.name} (${med.dose})` : med.name })
          : t('notify.medBodyPrivate', { time: clock(time, t('common.am'), t('common.pm')) }),
        url: '/meds',
        channel: 'meds',
        trigger: { type: 'daily', hour: Math.floor(mins / 60), minute: mins % 60 },
      });
    }
    const refill = refillAlertAt(med, now);
    const left = daysLeft(med);
    if (refill && left !== null) {
      out.push({
        id: `refill-${med.id}`,
        title: t('notify.refillTitle'),
        body: opts.medNames ? t('notify.refillBody', { n: Math.min(left, med.refillDays), name: med.name }) : t('notify.refillBodyPrivate'),
        url: '/meds',
        channel: 'meds',
        trigger: { type: 'date', date: refill },
      });
    }
  }
  if (opts.checkin) {
    const today = dayKey(now);
    for (let i = 0; i < 7; i++) {
      const day = addDays(today, i);
      if (i === 0 && opts.checkedInToday) continue;
      const when = at(day, opts.checkinTime);
      if (when.getTime() <= now.getTime() + 30_000) continue;
      out.push({ id: `checkin-${day}`, title: t('notify.checkinTitle'), body: t('notify.checkinBody'), url: '/checkin', channel: 'checkin', trigger: { type: 'date', date: when } });
    }
  }
  return out.slice(0, MAX_PENDING);
}
