/**
 * Health readings. Stored in one unit each (kg, °C, mg/dL, mmHg, bpm) and shown in the person's units.
 * The "unusual" thresholds only trigger a general safety note; the app never interprets a reading.
 */
export type VitalKind = 'bp' | 'hr' | 'weight' | 'temp' | 'glucose';
export type UnitSystem = 'us' | 'metric';
export const VITAL_KINDS: VitalKind[] = ['bp', 'hr', 'weight', 'temp', 'glucose'];

export type Vital = { id: number; at: number; kind: VitalKind; value: number; value2: number | null; note: string };

const LB_PER_KG = 2.2046226218;
const MGDL_PER_MMOL = 18.016;

export function toDisplay(kind: VitalKind, value: number, units: UnitSystem): number {
  if (units === 'us') {
    if (kind === 'weight') return value * LB_PER_KG;
    if (kind === 'temp') return (value * 9) / 5 + 32;
  } else if (kind === 'glucose') {
    return value / MGDL_PER_MMOL;
  }
  return value;
}

export function fromDisplay(kind: VitalKind, value: number, units: UnitSystem): number {
  if (units === 'us') {
    if (kind === 'weight') return value / LB_PER_KG;
    if (kind === 'temp') return ((value - 32) * 5) / 9;
  } else if (kind === 'glucose') {
    return value * MGDL_PER_MMOL;
  }
  return value;
}

/** Unit label keys under vitals.units. */
export function unitKey(kind: VitalKind, units: UnitSystem): 'bp' | 'hr' | 'lb' | 'kg' | 'f' | 'c' | 'mgdl' | 'mmol' {
  switch (kind) {
    case 'bp': return 'bp';
    case 'hr': return 'hr';
    case 'weight': return units === 'us' ? 'lb' : 'kg';
    case 'temp': return units === 'us' ? 'f' : 'c';
    case 'glucose': return units === 'us' ? 'mgdl' : 'mmol';
  }
}

/** Decimal places shown and accepted for each reading. */
export function decimals(kind: VitalKind, units: UnitSystem): number {
  if (kind === 'weight' || kind === 'temp') return 1;
  if (kind === 'glucose' && units === 'metric') return 1;
  return 0;
}

/** Accepted input range, in display units. Second range is for the diastolic number. */
export function inputRange(kind: VitalKind, units: UnitSystem): { min: number; max: number; min2?: number; max2?: number } {
  switch (kind) {
    case 'bp': return { min: 60, max: 260, min2: 30, max2: 160 };
    case 'hr': return { min: 25, max: 250 };
    case 'weight': return units === 'us' ? { min: 50, max: 800 } : { min: 20, max: 365 };
    case 'temp': return units === 'us' ? { min: 90, max: 110 } : { min: 32, max: 43.5 };
    case 'glucose': return units === 'us' ? { min: 20, max: 700 } : { min: 1.1, max: 38.9 };
  }
}

/** Parse a typed number ("98,6" or "98.6"); null if it isn't one. */
export function parseNumber(text: string): number | null {
  const cleaned = text.trim().replace(',', '.');
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function round(value: number, places: number): number {
  const f = 10 ** places;
  return Math.round(value * f) / f;
}

export function formatNumber(value: number, places: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { minimumFractionDigits: places, maximumFractionDigits: places }).format(value);
  } catch {
    return value.toFixed(places);
  }
}

/** "128/82", "72", "182.4" in display units, without the unit label. */
export function formatVital(v: Pick<Vital, 'kind' | 'value' | 'value2'>, units: UnitSystem, locale: string): string {
  if (v.kind === 'bp') return `${Math.round(v.value)}/${Math.round(v.value2 ?? 0)}`;
  const places = decimals(v.kind, units);
  return formatNumber(round(toDisplay(v.kind, v.value, units), places), places, locale);
}

/** True when a reading is far enough outside the usual range to show the general safety note. */
export function isUnusual(v: Pick<Vital, 'kind' | 'value' | 'value2'>): boolean {
  switch (v.kind) {
    case 'bp': return v.value >= 180 || (v.value2 ?? 0) >= 120 || v.value < 80;
    case 'hr': return v.value >= 130 || v.value <= 40;
    case 'temp': return v.value >= 39.4 || v.value <= 35;
    case 'glucose': return v.value <= 54 || v.value >= 300;
    default: return false;
  }
}
