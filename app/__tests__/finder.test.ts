import { outcome, QUESTION } from '@/lib/finder';

describe('care finder outcomes match the website', () => {
  test('red flags send people to 911, 988 or in-person care', () => {
    expect(outcome('urgent', 'yes')).toMatchObject({ kind: 'emergency', cta: { type: 'call911' } });
    expect(outcome('mental', 'yes').kind).toBe('crisis');
    expect(outcome('sexual', 'yes').kind).toBe('inperson');
    expect(outcome('womens', 'yes').kind).toBe('inperson');
    expect(outcome('skin', 'yes').kind).toBe('inperson');
  });

  test('controlled substances and nitrates are cautions', () => {
    expect(outcome('refill', 'yes')).toMatchObject({ kind: 'caution', cta: { type: 'services' } });
    expect(outcome('mens', 'yes').kind).toBe('caution');
  });

  test('a good fit offers the waitlist with the right interest', () => {
    expect(outcome('urgent', 'no')).toMatchObject({ kind: 'likely', cta: { type: 'join', interest: 'urgent-care' }, launchNote: true });
    expect(outcome('mental', 'no').cta).toEqual({ type: 'join', interest: 'therapy,anxiety-depression' });
    expect(outcome('sexual', 'unsure').extra).toBe('site.f_sexual_unsure');
    expect(outcome('weight', '').cta).toEqual({ type: 'weight' });
  });

  test('"Not sure" is offered where the website offers it', () => {
    expect(QUESTION.refill.unsure).toBe(true);
    expect(QUESTION.urgent.unsure).toBe(false);
  });
});
