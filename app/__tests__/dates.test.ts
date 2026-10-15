import { addDays, at, clock, dayKey, daysBetween, lastDays, minutesOf, sortTimes, timeFromMinutes, weekOf } from '@/lib/dates';

describe('dates', () => {
  test('day keys use local time', () => {
    expect(dayKey(new Date(2026, 9, 15, 23, 59))).toBe('2026-10-15');
    expect(dayKey(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01');
  });

  test('adding days crosses months, years and daylight-saving changes', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
    expect(daysBetween('2026-03-01', '2026-04-01')).toBe(31);
    expect(daysBetween('2026-11-02', '2026-11-01')).toBe(-1);
  });

  test('lastDays and weekOf', () => {
    expect(lastDays(3, '2026-10-15')).toEqual(['2026-10-13', '2026-10-14', '2026-10-15']);
    const week = weekOf('2026-10-15');
    expect(week).toHaveLength(7);
    expect(week[0]).toBe('2026-10-11');
    expect(week[6]).toBe('2026-10-17');
  });

  test('times', () => {
    expect(minutesOf('08:30')).toBe(510);
    expect(timeFromMinutes(-30)).toBe('23:30');
    expect(timeFromMinutes(1500)).toBe('01:00');
    expect(clock('00:05', 'AM', 'PM')).toBe('12:05 AM');
    expect(clock('12:00', 'AM', 'PM')).toBe('12:00 PM');
    expect(clock('21:45', 'a. m.', 'p. m.')).toBe('9:45 p. m.');
    expect(sortTimes(['20:00', '08:00', 'bad', '08:00'])).toEqual(['08:00', '20:00']);
    const d = at('2026-10-15', '07:15');
    expect(d.getHours()).toBe(7);
    expect(d.getMinutes()).toBe(15);
  });
});
