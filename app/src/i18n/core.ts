/** The translation core, with no React or device code (so it can run in tests and outside components). */
import siteStrings from '@/content/site-strings.json';
import { en } from './en';
import { es } from './es';
import type { ListKey, PathValue, Shape, TextKey } from './types';

export type Lang = 'en' | 'es';
type Dict = typeof en;
type SiteKey = keyof typeof siteStrings.en & string;
export type Key = TextKey<Dict> | `site.${SiteKey}`;
export type LKey = ListKey<Dict>;
export type Vars = Record<string, string | number>;

const DICTS: Record<Lang, Shape<Dict>> = { en, es };
const SITE = siteStrings as Record<Lang, Record<string, string>>;

function walk(node: unknown, key: string): unknown {
  let cur = node;
  for (const part of key.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function lookup(lang: Lang, key: string): string {
  if (key.startsWith('site.')) {
    const k = key.slice(5);
    return SITE[lang]?.[k] ?? SITE.en[k] ?? key;
  }
  const found = walk(DICTS[lang], key);
  if (typeof found === 'string') return found;
  return lang === 'en' ? key : lookup('en', key);
}

export function format(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

export type T = ((key: Key, vars?: Vars) => string) & {
  lang: Lang;
  /** Locale for dates and numbers. */
  locale: string;
  list: <K extends LKey>(key: K) => Shape<PathValue<Dict, K>>;
};

const cache = new Map<Lang, T>();

export function makeT(lang: Lang): T {
  const hit = cache.get(lang);
  if (hit) return hit;
  const t = ((key: Key, vars?: Vars) => format(lookup(lang, key), vars)) as T;
  t.lang = lang;
  t.locale = lang === 'es' ? 'es-US' : 'en-US';
  t.list = <K extends LKey>(key: K) => {
    const found = walk(DICTS[lang], key) ?? walk(DICTS.en, key);
    return found as Shape<PathValue<Dict, K>>;
  };
  cache.set(lang, t);
  return t;
}
