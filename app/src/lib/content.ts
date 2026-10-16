/** Typed access to the website's content (generated into content/content.json by tools/app_content.py). */
import raw from '@/content/content.json';
import type { Lang } from '@/i18n/core';

type Localized<T> = { en: T; es: T };

export type ServiceText = { name: string; chip: string; tag: string; desc: string; items: string[] };
/** What to expect from a service: the visit, tests and follow-up, in order. */
export type Expect = { title: string; lead: string; items: { icon: string; title: string; text: string }[] };
export type Service = { key: string; interest: string; icon: string; ongoing: boolean; page: string; expect: Localized<Expect> } & Localized<ServiceText>;
export type Condition = { key: string } & Localized<{ name: string; words: string; note: string }>;
export type FinderOption = { key: string; icon: string } & Localized<{ title: string; sub: string }>;
export type Notice = Localized<{ name: string; words: string; text: string }>;
export type Faq = { q: string; a: string };

/** How Jachi works: the steps on Jachi, the move to the medical group's portal, then the steps with the medical group. */
export type How = {
  lanes: { who: string; title: string; steps: { title: string; text: string }[] }[];
  handoff: { title: string; text: string };
};

/** A health guide's body. Text may hold <b>…</b> for bold words. */
export type GuideBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | {
      kind: 'callout';
      tone: 'alert' | 'note';
      title: string;
      parts: ({ kind: 'p'; text: string } | { kind: 'ul'; items: string[] })[];
      actions: { label: string; href: string; style: 'danger' | 'solid' | 'ghost' }[];
    };
export type GuideText = {
  title: string; topic: string; summary: string; minutes: number; lead: string; body: GuideBlock[];
  sources: { name: string; url: string }[];
  /** The box after the guide: a website page (a path like /uti-treatment/) and the service its waitlist link picks. */
  cta: { title: string; text: string; page: { label: string; href: string }; interest: string | null };
  url: string; updated: string;
};
export type Guide = { key: string; services: string[]; date: string } & Localized<GuideText>;
export type LearnWords = {
  title: string; lead: string; minutes: string; sources: string; sources_lead: string; note_title: string; note: string; more: string;
};

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
  how: Localized<How>;
  guides: Guide[];
  learn: Localized<LearnWords>;
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

export function guideByKey(key: string): Guide | undefined {
  return CONTENT.guides.find(g => g.key === key);
}

/** The guides that belong to a service (learn.py lists each guide's services). */
export function guidesFor(serviceKey: string): Guide[] {
  return CONTENT.guides.filter(g => g.services.includes(serviceKey));
}

/** Splits guide text into plain and bold runs: "<b>Face.</b> Ask them to smile." → [["Face.", true], [" Ask…", false]]. */
export function boldRuns(text: string): [string, boolean][] {
  return text.split(/(<b>.*?<\/b>)/).filter(Boolean).map((part): [string, boolean] =>
    part.startsWith('<b>') ? [part.slice(3, -4), true] : [part, false]);
}

/** Services whose conditions include this key ("mental+therapy" belongs to both). */
export function conditionsFor(serviceKey: string): Condition[] {
  return CONTENT.conditions.filter(c => c.key.split('+').includes(serviceKey));
}
