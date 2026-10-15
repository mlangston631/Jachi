import { csvCell, toCsv } from '@/lib/csv';
import { journalCsv } from '@/lib/exporter';

describe('CSV export', () => {
  test('every cell is quoted and formulas are neutralised', () => {
    expect(csvCell('plain')).toBe('"plain"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell('+1')).toBe('"\'+1"');
    expect(csvCell('-2')).toBe('"\'-2"');
    expect(csvCell('@SUM')).toBe('"\'@SUM"');
    expect(csvCell(null)).toBe('""');
    expect(csvCell(3.5)).toBe('"3.5"');
    expect(toCsv([['a', 'b'], [1, 2]])).toBe('"a","b"\r\n"1","2"\r\n');
  });

  test('journal CSV has one row per entry', () => {
    const csv = journalCsv({
      checkins: [{ id: 1, day: '2026-10-15', at: 0, mood: 4, energy: 3, sleep: 7.5, symptoms: ['headache'], note: '=cmd' }],
      vitals: [{ id: 1, at: 0, kind: 'bp', value: 120, value2: 80, note: '' }],
      meds: [{ id: 1, name: 'Lisinopril', dose: '10 mg', times: ['08:00'], supply: null, perDose: 1, refillDays: 7, notes: '', active: true, createdAt: 0, updatedAt: 0 }],
      doses: [{ id: 1, medId: 1, day: '2026-10-15', time: '08:00', status: 'taken', at: 0 }],
      questions: [{ id: 1, text: 'Is this normal?', at: 0 }],
    });
    const lines = csv.trim().split('\r\n');
    expect(lines).toHaveLength(6);
    expect(lines[1]).toContain('"\'=cmd"');
    expect(lines[4]).toContain('"Lisinopril"');
  });
});
