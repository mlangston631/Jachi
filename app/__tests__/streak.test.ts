import { adaptiveGoal, newMilestone, streaks, weekProgress } from '@/lib/streak';

describe('streaks', () => {
  test('a streak survives until today is over', () => {
    expect(streaks(['2026-10-13', '2026-10-14'], '2026-10-15')).toEqual({ current: 2, best: 2, todayDone: false });
    expect(streaks(['2026-10-13', '2026-10-14', '2026-10-15'], '2026-10-15').current).toBe(3);
    expect(streaks(['2026-10-12', '2026-10-13'], '2026-10-15').current).toBe(0);
  });

  test('best streak', () => {
    expect(streaks(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-10'], '2026-10-15').best).toBe(3);
  });

  test('milestones are celebrated once, highest first', () => {
    expect(newMilestone(7, [])).toBe(7);
    expect(newMilestone(7, [3, 7])).toBeNull();
    expect(newMilestone(2, [])).toBeNull();
  });

  test('week progress and the adaptive goal', () => {
    const week = weekProgress(['2026-10-12'], '2026-10-15');
    expect(week).toHaveLength(7);
    expect(week.find(d => d.day === '2026-10-12')!.done).toBe(true);
    expect(week.find(d => d.day === '2026-10-16')!.future).toBe(true);
    expect(adaptiveGoal([], '2026-10-15')).toBe(5);
    const busy = ['2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03',
      '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10'];
    expect(adaptiveGoal(busy, '2026-10-15')).toBe(7);
    expect(adaptiveGoal(['2026-10-05'], '2026-10-15')).toBe(3);
  });
});
