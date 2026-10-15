/**
 * Condition search, matching the website's: every word typed must start a word in the condition's name or
 * search terms. Emergencies and crisis come first, then names that start with the query.
 */
import type { Lang } from '@/i18n/core';
import { CONTENT, serviceByKey } from './content';
import { plain } from './safety';

export type Hit =
  | { kind: 'emergency'; name: string; text: string }
  | { kind: 'crisis'; name: string; text: string }
  | { kind: 'treated'; name: string; note: string; services: string[] }
  | { kind: 'not_offered'; name: string; text: string };

const norm = (v: string) => plain(v).replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

type Row = { hit: Hit; name: string; words: string[]; urgent: number; order: number };

function rows(lang: Lang): Row[] {
  const out: Row[] = [];
  const add = (hit: Hit, name: string, terms: string[], urgent: number) =>
    out.push({ hit, name: norm(name), words: norm(terms.join(' ')).split(' ').filter(Boolean), urgent, order: out.length });
  for (const e of CONTENT.emergencies) {
    add({ kind: 'emergency', name: e[lang].name, text: e[lang].text }, e[lang].name,
      [e[lang].name, e[lang].words, e.en.name, e.en.words], 1);
  }
  const c = CONTENT.crisis;
  add({ kind: 'crisis', name: c[lang].name, text: c[lang].text }, c[lang].name, [c[lang].name, c[lang].words, c.en.words], 1);
  for (const cond of CONTENT.conditions) {
    const services = cond.key.split('+').filter(k => serviceByKey(k));
    add({ kind: 'treated', name: cond[lang].name, note: cond[lang].note, services }, cond[lang].name,
      [cond[lang].name, cond[lang].words, cond.en.name, cond.en.words], 0);
  }
  for (const n of CONTENT.notOffered) {
    add({ kind: 'not_offered', name: n[lang].name, text: n[lang].text }, n[lang].name,
      [n[lang].name, n[lang].words, n.en.name, n.en.words], 0);
  }
  return out;
}

const cache: Partial<Record<Lang, Row[]>> = {};

export function searchConditions(query: string, lang: Lang, limit = 12): Hit[] {
  const q = norm(query);
  if (!q) return [];
  const tokens = q.split(' ');
  const all = (cache[lang] ??= rows(lang));
  return all
    .filter(r => tokens.every(t => r.words.some(w => w.startsWith(t))))
    .sort((a, b) => b.urgent - a.urgent || Number(b.name.startsWith(q)) - Number(a.name.startsWith(q)) || a.order - b.order)
    .slice(0, limit)
    .map(r => r.hit);
}
