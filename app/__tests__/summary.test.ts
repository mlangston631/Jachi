import { makeT } from '@/i18n/core';
import { hasContent, summaryHtml, summaryModel } from '@/lib/summary';

const now = new Date(2026, 9, 15, 12, 0);

describe('visit summary', () => {
  const input = {
    days: 14,
    name: '<b>Ana</b>',
    includeNotes: true,
    checkins: [
      { id: 1, day: '2026-10-14', at: 0, mood: 2, energy: 2, sleep: 5, symptoms: ['headache'], note: '<script>alert(1)</script>' },
      { id: 2, day: '2026-10-15', at: 0, mood: 4, energy: 4, sleep: 8, symptoms: ['headache', 'cough'], note: '' },
      { id: 3, day: '2026-09-01', at: 0, mood: 1, energy: 1, sleep: 2, symptoms: [], note: 'outside the period' },
    ],
    vitals: [
      { id: 1, at: new Date(2026, 9, 14, 8).getTime(), kind: 'bp' as const, value: 130, value2: 85, note: '' },
      { id: 2, at: new Date(2026, 9, 15, 8).getTime(), kind: 'bp' as const, value: 124, value2: 80, note: '' },
    ],
    meds: [{ id: 1, name: 'Med & "Co"', dose: '5 mg', times: ['08:00'], supply: null, perDose: 1, refillDays: 7, notes: '', active: true, createdAt: new Date(2026, 9, 1).getTime(), updatedAt: 0 }],
    doses: [{ id: 1, medId: 1, day: '2026-10-15', time: '08:00', status: 'taken' as const, at: 0 }],
    questions: ['Why do I get <headaches>?'],
    units: 'us' as const,
    now,
  };

  test('the model covers only the chosen period', () => {
    const m = summaryModel(input);
    expect(m.checkinCount).toBe(2);
    expect(m.averages.mood).toBe(3);
    expect(m.symptoms[0]).toMatchObject({ symptom: 'headache', n: 2 });
    expect(m.vitals[0]).toMatchObject({ kind: 'bp', count: 2 });
    expect(m.notes).toHaveLength(1);
    expect(m.meds[0]).toMatchObject({ taken: 1 });
    expect(hasContent(m)).toBe(true);
  });

  test('everything typed by the person is escaped in the PDF', () => {
    const html = summaryHtml(summaryModel(input), makeT('en'), 'us', k => k);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;b&gt;Ana&lt;/b&gt;');
    expect(html).toContain('Med &amp; &quot;Co&quot;');
    expect(html).toContain('&lt;headaches&gt;');
    expect(html).toContain('Not a medical record');
  });

  test('notes stay out unless asked for, and Spanish works', () => {
    const html = summaryHtml(summaryModel({ ...input, includeNotes: false }), makeT('es'), 'metric', k => k);
    expect(html).not.toContain('alert(1)');
    expect(html).toContain('Resumen de salud');
    expect(html).toContain('lang="es"');
  });
});
