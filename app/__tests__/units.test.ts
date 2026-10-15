import { formatVital, fromDisplay, inputRange, isUnusual, parseNumber, toDisplay } from '@/lib/units';

describe('readings and units', () => {
  test('conversions round-trip', () => {
    expect(toDisplay('weight', fromDisplay('weight', 180, 'us'), 'us')).toBeCloseTo(180, 6);
    expect(toDisplay('temp', 37, 'us')).toBeCloseTo(98.6, 1);
    expect(fromDisplay('temp', 98.6, 'us')).toBeCloseTo(37, 1);
    expect(toDisplay('glucose', 90, 'metric')).toBeCloseTo(5, 1);
    expect(toDisplay('hr', 72, 'metric')).toBe(72);
  });

  test('parsing accepts commas and rejects junk', () => {
    expect(parseNumber('98,6')).toBe(98.6);
    expect(parseNumber(' 120 ')).toBe(120);
    expect(parseNumber('12a')).toBeNull();
    expect(parseNumber('')).toBeNull();
  });

  test('formatting', () => {
    expect(formatVital({ kind: 'bp', value: 128, value2: 82 }, 'us', 'en-US')).toBe('128/82');
    expect(formatVital({ kind: 'weight', value: 81.6466, value2: null }, 'us', 'en-US')).toBe('180.0');
    expect(formatVital({ kind: 'temp', value: 37, value2: null }, 'metric', 'es-US')).toMatch(/^37[.,]0$/);
  });

  test('unusual readings get the safety note', () => {
    expect(isUnusual({ kind: 'bp', value: 185, value2: 100 })).toBe(true);
    expect(isUnusual({ kind: 'bp', value: 150, value2: 121 })).toBe(true);
    expect(isUnusual({ kind: 'bp', value: 122, value2: 78 })).toBe(false);
    expect(isUnusual({ kind: 'glucose', value: 50, value2: null })).toBe(true);
    expect(isUnusual({ kind: 'temp', value: 40, value2: null })).toBe(true);
    expect(isUnusual({ kind: 'weight', value: 300, value2: null })).toBe(false);
  });

  test('input ranges depend on units', () => {
    expect(inputRange('weight', 'us').max).toBe(800);
    expect(inputRange('weight', 'metric').max).toBe(365);
    expect(inputRange('bp', 'us').max2).toBe(160);
  });
});
