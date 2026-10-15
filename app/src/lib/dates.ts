/** Local calendar days ("2026-10-15") and clock times ("08:30"). Days follow the phone's time zone. */

export const DAY_MS = 86_400_000;

const pad = (n: number) => String(n).padStart(2, '0');

export function dayKey(d: Date | number = new Date()): string {
  const date = typeof d === 'number' ? new Date(d) : d;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local midnight of a day key. */
export function parseDay(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function addDays(key: string, n: number): string {
  const d = parseDay(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

/** Whole days from a to b (b later is positive). Safe across daylight-saving changes. */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const ua = Date.UTC(ay ?? 1970, (am ?? 1) - 1, ad ?? 1);
  const ub = Date.UTC(by ?? 1970, (bm ?? 1) - 1, bd ?? 1);
  return Math.round((ub - ua) / DAY_MS);
}

/** The n day keys ending with `end`, oldest first. */
export function lastDays(n: number, end: string = dayKey()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - n + 1));
}

/** Sunday-first week (US calendars) containing the day. */
export function weekOf(key: string): string[] {
  const start = addDays(key, -parseDay(key).getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isTime(value: string): boolean {
  return TIME_RE.test(value);
}

export function minutesOf(time: string): number {
  const m = TIME_RE.exec(time);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

export function timeFromMinutes(total: number): string {
  const wrapped = ((Math.round(total) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
}

export function nowTime(d: Date = new Date()): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** The moment a day key + clock time happens, in local time. */
export function at(day: string, time: string): Date {
  const d = parseDay(day);
  const mins = minutesOf(time);
  d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
  return d;
}

/** "8:05 AM" style, with the AM/PM words passed in (Spanish uses "a. m." / "p. m."). */
export function clock(time: string, am: string, pm: string): string {
  const mins = minutesOf(time);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m)} ${h < 12 ? am : pm}`;
}

export function sortTimes(times: string[]): string[] {
  return [...new Set(times.filter(isTime))].sort((a, b) => minutesOf(a) - minutesOf(b));
}

export function formatDay(key: string, locale: string, opts: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(locale, opts).format(parseDay(key));
  } catch {
    return key;
  }
}

export function formatDate(ms: number, locale: string, opts: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(locale, opts).format(new Date(ms));
  } catch {
    return dayKey(ms);
  }
}

export function partOfDay(d: Date = new Date()): 'morning' | 'afternoon' | 'evening' {
  const h = d.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  return 'evening';
}
