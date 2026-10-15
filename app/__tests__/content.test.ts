import icons from '@/content/icons.json';
import { CONTENT, conditionsFor, stateName, statesFor } from '@/lib/content';
import { EXTRA_ICONS } from '@/components/icons-extra';

const ICONS = icons as unknown as Record<string, unknown>;
const has = (name: string) => name in ICONS || name in EXTRA_ICONS;

describe('content from the website', () => {
  test('every service and finder option has both languages and a known icon', () => {
    expect(CONTENT.services.length).toBeGreaterThanOrEqual(9);
    for (const s of CONTENT.services) {
      expect(s.en.name && s.es.name).toBeTruthy();
      expect(has(s.icon)).toBe(true);
      expect(s.page.startsWith('https://www.jachihealth.com/')).toBe(true);
    }
    for (const f of CONTENT.finder) expect(has(f.icon)).toBe(true);
  });

  test('no prices anywhere in the content', () => {
    expect(JSON.stringify(CONTENT)).not.toMatch(/\$\s?\d/);
  });

  test('states', () => {
    expect(stateName('TX', 'en')).toBe('Texas');
    expect(statesFor('es').length).toBe(CONTENT.states.length);
  });

  test('conditions map to services', () => {
    expect(conditionsFor('urgent').length).toBeGreaterThan(3);
  });
});
