/** Typed access to the website's content (generated into content/content.json by tools/app_content.py). */
import raw from '@/content/content.json';
import type { Lang } from '@/i18n/core';

type Localized<T> = { en: T; es: T };

export type ServiceText = { name: string; chip: string; tag: string; desc: string; items: string[] };
export type Service = { key: string; interest: string; icon: string; ongoing: boolean; page: string } & Localized<ServiceText>;
export type Condition = { key: string } & Localized<{ name: string; words: string; note: string }>;
export type FinderOption = { key: string; icon: string } & Localized<{ title: string; sub: string }>;
export type Notice = Localized<{ name: string; words: string; text: string }>;
export type Faq = { q: string; a: string };

export type Content = {
  site: string;
  email: string;
  pricingNote: Localized<string>;
  services: Service[];
  conditions: Condition[];
  finder: FinderOption[];
  emergencies: Notice[];
  crisis: Notice;
  notOffered: Notice[];
  faq: Localized<Faq[]>;
  states: [string, string][];
  statesEs: Record<string, string>;
};

export const CONTENT = raw as unknown as Content;
export const SITE = CONTENT.site;
export const SUPPORT_EMAIL = CONTENT.email;

export const LINKS = {
  privacy: `${SITE}/privacy/`,
  terms: `${SITE}/terms/`,
  tmb: `${SITE}/texas-medical-board/`,
  weightCheck: `${SITE}/#eligibility`,
  home: `${SITE}/`,
  homeEs: `${SITE}/es/`,
  boards: [
    'https://www.tmb.texas.gov/resources/for-the-public/look-up-a-license',
    'https://www.bon.texas.gov/',
    'https://bhec.texas.gov/verify-a-license/',
    `${SITE}/texas-medical-board/`,
  ],
} as const;

export function serviceByKey(key: string): Service | undefined {
  return CONTENT.services.find(s => s.key === key);
}

export function stateName(code: string, lang: Lang): string {
  if (lang === 'es' && CONTENT.statesEs[code]) return CONTENT.statesEs[code];
  return CONTENT.states.find(([c]) => c === code)?.[1] ?? code;
}

/** States sorted by their name in the language. */
export function statesFor(lang: Lang): { code: string; name: string }[] {
  return CONTENT.states
    .map(([code]) => ({ code, name: stateName(code, lang) }))
    .sort((a, b) => a.name.localeCompare(b.name, lang === 'es' ? 'es' : 'en'));
}

/** Services whose conditions include this key ("mental+therapy" belongs to both). */
export function conditionsFor(serviceKey: string): Condition[] {
  return CONTENT.conditions.filter(c => c.key.split('+').includes(serviceKey));
}
