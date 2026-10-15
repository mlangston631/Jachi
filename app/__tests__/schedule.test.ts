import { adherence, daysLeft, needsRefill, refillAlertAt, slotsForDay, supplyAfter, type Dose, type Med } from '@/lib/schedule';

const created = new Date(2026, 9, 1, 9, 0).getTime();
const med = (over: Partial<Med> = {}): Med => ({
  id: 1, name: 'Lisinopril', dose: '10 mg', times: ['08:00', '20:00'], supply: 20, perDose: 1, refillDays: 7, notes: '',
  active: true, createdAt: created, updatedAt: created, ...over,
});
const dose = (over: Partial<Dose>): Dose => ({ id: 1, medId: 1, day: '2026-10-15', time: '08:00', status: 'taken', at: 0, ...over });

describe('medication schedule', () => {
  const noon = new Date(2026, 9, 15, 12, 0);

  test("today's slots: due, upcoming, taken", () => {
    const slots = slotsForDay([med()], [], '2026-10-15', noon);
    expect(slots.map(s => [s.time, s.state])).toEqual([['08:00', 'due'], ['20:00', 'upcoming']]);
    const taken = slotsForDay([med()], [dose({})], '2026-10-15', noon);
    expect(taken[0]!.state).toBe('taken');
  });

  test('past days without a log are missed; paused and as-needed meds are left out', () => {
    expect(slotsForDay([med()], [], '2026-10-14', noon).every(s => s.state === 'missed')).toBe(true);
    expect(slotsForDay([med({ active: false })], [], '2026-10-15', noon)).toHaveLength(0);
    expect(slotsForDay([med({ times: [] })], [], '2026-10-15', noon)).toHaveLength(0);
  });

  test('days before the medication was added are not counted', () => {
    expect(slotsForDay([med()], [], '2026-09-30', noon)).toHaveLength(0);
  });

  test('adherence counts only doses already due', () => {
    const doses = [dose({ day: '2026-10-14', time: '08:00' }), dose({ day: '2026-10-14', time: '20:00', status: 'skipped' }), dose({ day: '2026-10-15', time: '08:00' })];
    const a = adherence([med()], doses, '2026-10-14', '2026-10-15', noon);
    expect(a).toEqual({ due: 3, taken: 2, skipped: 1, rate: 2 / 3 });
  });

  test('supply and refills', () => {
    expect(daysLeft(med({ supply: 20 }))).toBe(10);
    expect(daysLeft(med({ supply: null }))).toBeNull();
    expect(daysLeft(med({ times: [] }))).toBeNull();
    expect(needsRefill(med({ supply: 14 }))).toBe(true);
    expect(needsRefill(med({ supply: 30 }))).toBe(false);
    expect(supplyAfter(med({ supply: 3, perDose: 2 }), 1)).toBe(1);
    expect(supplyAfter(med({ supply: 1, perDose: 2 }), 1)).toBe(0);
    expect(supplyAfter(med({ supply: 1 }), -1)).toBe(2);
  });

  test('refill alert is the morning the supply reaches the threshold', () => {
    const at = refillAlertAt(med({ supply: 30 }), noon);
    expect(at).not.toBeNull();
    expect(at!.getDate()).toBe(23);
    expect(at!.getHours()).toBe(9);
    const now = refillAlertAt(med({ supply: 10 }), noon);
    expect(now!.getTime()).toBeGreaterThan(noon.getTime());
    expect(refillAlertAt(med({ supply: null }), noon)).toBeNull();
  });
});
