import { searchConditions } from '@/lib/search';

describe('condition search', () => {
  test('finds treated conditions by prefix', () => {
    const hits = searchConditions('uti', 'en');
    expect(hits.some(h => h.kind === 'treated' && /uti/i.test(h.name))).toBe(true);
  });

  test('emergencies come first', () => {
    const hits = searchConditions('chest pain', 'en');
    expect(hits[0]!.kind).toBe('emergency');
  });

  test('crisis words show the crisis line', () => {
    expect(searchConditions('suicide', 'en')[0]!.kind).toBe('crisis');
    expect(searchConditions('suicidio', 'es')[0]!.kind).toBe('crisis');
  });

  test('not offered items say so', () => {
    expect(searchConditions('adderall', 'en')[0]!.kind).toBe('not_offered');
  });

  test('Spanish, with or without accents, and English words in Spanish', () => {
    expect(searchConditions('acne', 'es').length).toBeGreaterThan(0);
    expect(searchConditions('acné', 'es').length).toBeGreaterThan(0);
    expect(searchConditions('uti', 'es').length).toBeGreaterThan(0);
  });

  test('empty or unknown queries', () => {
    expect(searchConditions('', 'en')).toEqual([]);
    expect(searchConditions('zzzz', 'en')).toEqual([]);
  });
});
