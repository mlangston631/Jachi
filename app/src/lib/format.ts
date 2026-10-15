/** Number and label formatting for the screens, in the person's language. */
import type { T } from '@/i18n/core';
import { en } from '@/i18n/en';
import { clock, formatDay } from './dates';
import type { Insight } from './insights';

export function num(t: T, n: number, places = 1): string {
  try {
    return new Intl.NumberFormat(t.locale, { maximumFractionDigits: places }).format(n);
  } catch {
    return String(Math.round(n * 10 ** places) / 10 ** places);
  }
}

export function hours(t: T, n: number): string {
  return t('common.hours', { n: num(t, n, 1) });
}

export function time(t: T, hhmm: string): string {
  return clock(hhmm, t('common.am'), t('common.pm'));
}

export type SymptomKey = keyof typeof en.symptoms;
export const SYMPTOM_KEYS = Object.keys(en.symptoms) as SymptomKey[];

export function isSymptomKey(key: string): key is SymptomKey {
  return (SYMPTOM_KEYS as string[]).includes(key);
}

export function symptomLabel(t: T, key: string): string {
  return isSymptomKey(key) ? t(`symptoms.${key}`) : key;
}

export function weekdayLetters(t: T, days: string[]): string[] {
  return days.map(d => formatDay(d, t.locale, { weekday: 'narrow' }));
}

export function weekdayNames(t: T, days: string[]): string[] {
  return days.map(d => formatDay(d, t.locale, { weekday: 'long' }));
}

export function insightView(t: T, i: Insight): { icon: string; text: string } {
  switch (i.kind) {
    case 'sleepUp':
    case 'sleepDown':
      return { icon: 'moon', text: t(`insight.${i.kind}`, { delta: hours(t, i.delta), now: hours(t, i.now) }) };
    case 'moodUp':
    case 'moodDown':
      return { icon: 'smile', text: t(`insight.${i.kind}`, { now: num(t, i.now), before: num(t, i.before) }) };
    case 'sleepMood':
      return { icon: 'sparkles', text: t('insight.sleepMood', { hours: i.hours, high: num(t, i.high), low: num(t, i.low) }) };
    case 'symptom':
      return { icon: 'list', text: t('insight.symptom', { symptom: symptomLabel(t, i.symptom), n: i.n, total: i.total }) };
    case 'adherence':
      return { icon: 'pill', text: t('insight.adherence', { taken: i.taken, due: i.due }) };
    case 'refill':
      return { icon: 'pharmacy', text: t('insight.refill', { n: i.days, name: i.name }) };
    case 'bpTrend':
      return { icon: 'gauge', text: t('insight.bpTrend', { n: i.n, avg: `${i.sys}/${i.dia}` }) };
    case 'lowMood':
      return { icon: 'heart', text: t('today.supportBody') };
  }
}
