import siteStrings from '@/content/site-strings.json';
import { format, makeT } from '@/i18n/core';
import { en } from '@/i18n/en';
import { es } from '@/i18n/es';

type Tree = { [k: string]: string | readonly unknown[] | Tree };

function leaves(node: Tree, prefix = ''): [string, string][] {
  return Object.entries(node).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') return [[key, v] as [string, string]];
    if (Array.isArray(v)) return v.flatMap((x, i) => (typeof x === 'string' ? [[`${key}.${i}`, x] as [string, string]] : leaves(x as Tree, `${key}.${i}`)));
    return leaves(v as Tree, key);
  });
}

const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');

describe('English and Spanish wording', () => {
  const E = new Map(leaves(en as unknown as Tree));
  const S = new Map(leaves(es as unknown as Tree));

  test('the same keys in both languages', () => {
    expect([...S.keys()].sort()).toEqual([...E.keys()].sort());
  });

  test('no empty text, and the same placeholders', () => {
    for (const [k, v] of E) {
      expect(v.trim()).not.toBe('');
      expect(S.get(k)!.trim()).not.toBe('');
      expect(`${k}: ${vars(S.get(k)!)}`).toBe(`${k}: ${vars(v)}`);
    }
  });

  test('Spanish uses usted, not tú', () => {
    for (const [k, v] of S) {
      expect(`${k}: ${/\b(tú|tienes|puedes|quieres|necesitas|eres|estás)\b/i.test(v)}`).toBe(`${k}: false`);
    }
  });

  test('website strings exist in both languages', () => {
    expect(Object.keys(siteStrings.es).sort()).toEqual(Object.keys(siteStrings.en).sort());
  });

  test('lookup, fallback and formatting', () => {
    const t = makeT('es');
    expect(t('common.save')).toBe('Guardar');
    expect(t('site.c_call_988')).toBe('Llamar al 988');
    expect(t.list('checkin.moods')).toHaveLength(5);
    expect(format('Hi {name}, {n} left', { name: 'Ana', n: 3 })).toBe('Hi Ana, 3 left');
    expect(format('{missing}', {})).toBe('{missing}');
  });

  test('crisis wording keeps 988 in both languages', () => {
    expect(makeT('en')('site.c_crisis')).toContain('988');
    expect(makeT('es')('site.c_crisis')).toContain('988');
    expect(makeT('es')('site.c_crisis')).toContain('AYUDA');
  });
});
