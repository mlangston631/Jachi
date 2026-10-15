import { averages, insights, lowMoodStretch, symptomCounts, type Checkin } from '@/lib/insights';
import { addDays } from '@/lib/dates';

const today = '2026-10-15';
const now = new Date(2026, 9, 15, 18, 0);
let id = 0;
const ci = (day: string, mood: number, sleep: number | null, symptoms: string[] = []): Checkin => ({
  id: ++id, day, at: 0, mood, energy: 3, sleep, symptoms, note: '',
});

describe('insights', () => {
  test('none until there is enough data', () => {
    expect(insights({ checkins: [ci(today, 4, 7)], vitals: [], meds: [], doses: [] }, now)).toEqual([]);
  });

  test('sleep and mood week over week', () => {
    const checkins = [
      ...[0, 1, 2, 3].map(i => ci(addDays(today, -i), 4, 8)),
      ...[7, 8, 9, 10].map(i => ci(addDays(today, -i), 2, 6)),
    ];
    const found = insights({ checkins, vitals: [], meds: [], doses: [] }, now);
    expect(found).toContainEqual({ kind: 'sleepUp', delta: 2, now: 8 });
    expect(found).toContainEqual({ kind: 'moodUp', now: 4, before: 2 });
    expect(found.some(f => f.kind === 'sleepMood')).toBe(true);
  });

  test('a recurring symptom is pointed out', () => {
    const checkins = [0, 1, 2, 3].map(i => ci(addDays(today, -i), 3, 7, i < 3 ? ['headache'] : []));
    expect(insights({ checkins, vitals: [], meds: [], doses: [] }, now)).toContainEqual({ kind: 'symptom', symptom: 'headache', n: 3, total: 4 });
  });

  test('a hard stretch is noticed (3 of the last 4 at mood 2 or lower)', () => {
    const low = [0, 1, 2].map(i => ci(addDays(today, -i), 1, 5));
    expect(lowMoodStretch(low, today)).toBe(true);
    expect(lowMoodStretch([ci(today, 1, 5), ci(addDays(today, -1), 4, 7), ci(addDays(today, -2), 4, 7)], today)).toBe(false);
  });

  test('averages and symptom counts', () => {
    const list = [ci('2026-10-01', 2, 6, ['cough']), ci('2026-10-02', 4, null, ['cough', 'fever'])];
    expect(averages(list)).toEqual({ mood: 3, energy: 3, sleep: 6 });
    expect(symptomCounts(list)[0]).toEqual({ symptom: 'cough', n: 2, first: '2026-10-01', last: '2026-10-02' });
  });
});
