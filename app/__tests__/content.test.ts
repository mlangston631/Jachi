import icons from '@/content/icons.json';
import { boldRuns, CONTENT, conditionsFor, guideByKey, guidesFor, stateName, statesFor } from '@/lib/content';
import { EXTRA_ICONS } from '@/components/icons-extra';

const ICONS = icons as unknown as Record<string, unknown>;
const has = (name: string) => name in ICONS || name in EXTRA_ICONS;

describe('content from the website', () => {
  test('every service and finder option has both languages and a known icon', () => {
    expect(CONTENT.services.length).toBeGreaterThanOrEqual(9);
    for (const s of CONTENT.services) {
      expect(s.en.name && s.es.name).toBeTruthy();
      expect(has(s.icon)).toBe(true);
      expect(s.page.startsWith('https://jachihealth.com/')).toBe(true);
    }
    for (const f of CONTENT.finder) expect(has(f.icon)).toBe(true);
  });

  test('no prices anywhere in the content', () => {
    expect(JSON.stringify(CONTENT)).not.toMatch(/\$\s?\d/);
  });

  test('no website markup the app would show as text (only the guides\' <b> for bold words)', () => {
    expect(JSON.stringify(CONTENT)).not.toMatch(/<(?!\/?b>)[a-z/]/i);
  });

  test('states', () => {
    expect(stateName('TX', 'en')).toBe('Texas');
    expect(statesFor('es').length).toBe(CONTENT.states.length);
  });

  test('conditions map to services', () => {
    expect(conditionsFor('urgent').length).toBeGreaterThan(3);
  });

  test('every service says what to expect (visit, tests, follow-up) in both languages, with known icons', () => {
    for (const s of CONTENT.services) {
      for (const lang of ['en', 'es'] as const) {
        const e = s.expect[lang];
        expect(e.title && e.lead).toBeTruthy();
        expect(e.items).toHaveLength(3);
        for (const item of e.items) {
          expect(has(item.icon)).toBe(true);
          expect(item.title && item.text).toBeTruthy();
        }
      }
    }
  });

  test('how Jachi works: seven steps in two lanes, in both languages', () => {
    for (const lang of ['en', 'es'] as const) {
      const how = CONTENT.how[lang];
      expect(how.lanes).toHaveLength(2);
      expect(how.lanes.reduce((n, lane) => n + lane.steps.length, 0)).toBe(7);
      expect(how.handoff.title && how.handoff.text).toBeTruthy();
    }
  });

  test('health guides: both languages, sources on https, only 911 and 988 to call or text', () => {
    expect(CONTENT.guides.length).toBeGreaterThanOrEqual(3);
    for (const g of CONTENT.guides) {
      for (const key of g.services) expect(CONTENT.services.some(s => s.key === key)).toBe(true);
      for (const lang of ['en', 'es'] as const) {
        const text = g[lang];
        expect(text.title && text.lead && text.summary).toBeTruthy();
        expect(text.body.length).toBeGreaterThan(3);
        expect(text.sources.length).toBeGreaterThanOrEqual(2);
        for (const source of text.sources) expect(source.url.startsWith('https://')).toBe(true);
        for (const block of text.body) {
          if (block.kind === 'callout') for (const a of block.actions) expect(a.href).toMatch(/^(tel|sms):(911|988)/);
        }
      }
    }
    expect(guidesFor('weight').map(g => g.key)).toEqual(['weight']);
    const where = guideByKey('where');
    expect(where?.es.body.some(b => b.kind === 'callout' && b.actions.some(a => a.href.includes('body=AYUDA')))).toBe(true);
  });

  test('guide text keeps its bold words', () => {
    expect(boldRuns('<b>Face.</b> Ask them to smile.')).toEqual([['Face.', true], [' Ask them to smile.', false]]);
    expect(boldRuns('No bold here')).toEqual([['No bold here', false]]);
  });
});
