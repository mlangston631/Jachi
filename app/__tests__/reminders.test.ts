import { makeT } from '@/i18n/core';
import { plan } from '@/lib/reminder-plan';
import type { Med } from '@/lib/schedule';

const med = (over: Partial<Med> = {}): Med => ({
  id: 7, name: 'Sertraline', dose: '50 mg', times: ['08:00', '21:30'], supply: null, perDose: 1, refillDays: 7, notes: '',
  active: true, createdAt: 0, updatedAt: 0, ...over,
});
const now = new Date(2026, 9, 15, 12, 0);
const t = makeT('en');

describe('reminder plan', () => {
  test('daily reminders per time, with names hidden by default', () => {
    const items = plan([med()], { medNames: false, checkin: false, checkinTime: '20:00', checkedInToday: false }, t, now);
    expect(items.map(i => i.trigger)).toEqual([{ type: 'daily', hour: 8, minute: 0 }, { type: 'daily', hour: 21, minute: 30 }]);
    expect(items[0]!.body).not.toContain('Sertraline');
    expect(items[1]!.body).toContain('9:30 PM');
  });

  test('names shown when the person opts in', () => {
    const items = plan([med()], { medNames: true, checkin: false, checkinTime: '20:00', checkedInToday: false }, t, now);
    expect(items[0]!.body).toContain('Sertraline (50 mg)');
  });

  test('paused and as-needed medications get no reminders', () => {
    expect(plan([med({ active: false }), med({ id: 8, times: [] })], { medNames: false, checkin: false, checkinTime: '20:00', checkedInToday: false }, t, now)).toEqual([]);
  });

  test('check-in reminders skip today once done, and never fire in the past', () => {
    const notDone = plan([], { medNames: false, checkin: true, checkinTime: '20:00', checkedInToday: false }, t, now);
    expect(notDone).toHaveLength(7);
    const done = plan([], { medNames: false, checkin: true, checkinTime: '20:00', checkedInToday: true }, t, now);
    expect(done).toHaveLength(6);
    const morning = plan([], { medNames: false, checkin: true, checkinTime: '09:00', checkedInToday: false }, t, now);
    expect(morning).toHaveLength(6);
  });

  test('refill alert when supply is tracked', () => {
    const items = plan([med({ supply: 10 })], { medNames: false, checkin: false, checkinTime: '20:00', checkedInToday: false }, t, now);
    expect(items.some(i => i.id === 'refill-7')).toBe(true);
  });

  test('never more than iOS allows', () => {
    const many = Array.from({ length: 40 }, (_, i) => med({ id: i + 1, times: ['08:00', '20:00'] }));
    expect(plan(many, { medNames: false, checkin: true, checkinTime: '20:00', checkedInToday: false }, t, now).length).toBeLessThanOrEqual(60);
  });
});
