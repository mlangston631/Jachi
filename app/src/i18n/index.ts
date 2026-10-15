/**
 * Tiny typed translation layer. English and Spanish, chosen from the phone's language unless the person
 * picks one in Settings. Keys are checked at compile time, so a typo can't ship.
 */
import { getLocales } from 'expo-localization';
import { useMemo } from 'react';

import { usePrefs, type LangPref } from '@/state/prefs';
import { makeT, type Lang, type T } from './core';

export * from './core';

export function deviceLang(): Lang {
  try {
    return getLocales()[0]?.languageCode === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

export function resolveLang(pref: LangPref): Lang {
  return pref === 'system' ? deviceLang() : pref;
}

/** Translations for the current language; components re-render when it changes. */
export function useT(): T {
  const pref = usePrefs(s => s.language);
  const lang = resolveLang(pref);
  return useMemo(() => makeT(lang), [lang]);
}

/** Translations outside React (notifications). */
export function tNow(): T {
  return makeT(resolveLang(usePrefs.getState().language));
}
