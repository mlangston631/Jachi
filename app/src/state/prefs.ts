/**
 * Settings and small app state, saved on this phone (expo-sqlite's key-value store, read synchronously at
 * launch so the first frame already has the right language, theme and onboarding state).
 * Nothing here is sent anywhere.
 */
import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

export type Appearance = 'system' | 'light' | 'dark';
export type LangPref = 'system' | 'en' | 'es';
export type Units = 'us' | 'metric';

export type WaitlistEntry = {
  email: string;
  state: string;
  name: string;
  interests: string[];
  at: number;
  /** True while the sign-up waits in the outbox to be sent. */
  queued: boolean;
};

export type PrefsData = {
  onboarded: boolean;
  adult: boolean;
  name: string;
  focus: string[];
  language: LangPref;
  appearance: Appearance;
  units: Units;
  haptics: boolean;
  lock: boolean;
  medNames: boolean;
  checkinReminder: boolean;
  checkinTime: string;
  weeklyGoal: number;
  milestonesSeen: number[];
  waitlist: WaitlistEntry | null;
  summaryName: string;
  summaryDays: number;
  dismissed: string[];
  lastEmail: string;
};

type PrefsState = PrefsData & {
  set: (patch: Partial<PrefsData>) => void;
  dismiss: (card: string) => void;
  reset: () => void;
};

export const DEFAULT_PREFS: PrefsData = {
  onboarded: false,
  adult: false,
  name: '',
  focus: [],
  language: 'system',
  appearance: 'system',
  units: 'us',
  haptics: true,
  lock: false,
  medNames: false,
  checkinReminder: false,
  checkinTime: '20:00',
  weeklyGoal: 5,
  milestonesSeen: [],
  waitlist: null,
  summaryName: '',
  summaryDays: 30,
  dismissed: [],
  lastEmail: '',
};

const syncStorage: StateStorage = {
  getItem: key => {
    try {
      return Storage.getItemSync(key) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      Storage.setItemSync(key, value);
    } catch {
      // Storage unavailable (very rare): settings last until the app closes.
    }
  },
  removeItem: key => {
    try {
      Storage.removeItemSync(key);
    } catch {
      // Nothing to remove.
    }
  },
};

export const usePrefs = create<PrefsState>()(
  persist(
    set => ({
      ...DEFAULT_PREFS,
      set: patch => set(patch),
      dismiss: card => set(s => (s.dismissed.includes(card) ? s : { dismissed: [...s.dismissed, card] })),
      reset: () => set({ ...DEFAULT_PREFS }),
    }),
    {
      name: 'jachi.prefs',
      version: 1,
      storage: createJSONStorage(() => syncStorage),
      partialize: ({ set: _set, dismiss: _dismiss, reset: _reset, ...data }) => data,
      merge: (persisted, current) => ({ ...current, ...sanitize(persisted) }),
    },
  ),
);

/** Keep only known settings with the right types, so an old or damaged save can't break the app. */
function sanitize(value: unknown): Partial<PrefsData> {
  if (!value || typeof value !== 'object') return {};
  const v = value as Record<string, unknown>;
  const out: Partial<PrefsData> = {};
  const bool = (k: keyof PrefsData) => {
    if (typeof v[k] === 'boolean') (out as Record<string, unknown>)[k] = v[k];
  };
  const str = (k: keyof PrefsData, max = 200) => {
    if (typeof v[k] === 'string') (out as Record<string, unknown>)[k] = (v[k] as string).slice(0, max);
  };
  const strList = (k: keyof PrefsData) => {
    if (Array.isArray(v[k])) (out as Record<string, unknown>)[k] = (v[k] as unknown[]).filter(x => typeof x === 'string').slice(0, 50);
  };
  (['onboarded', 'adult', 'haptics', 'lock', 'medNames', 'checkinReminder'] as const).forEach(bool);
  (['name', 'summaryName', 'lastEmail'] as const).forEach(k => str(k, 80));
  (['focus', 'dismissed'] as const).forEach(strList);
  if (v.language === 'system' || v.language === 'en' || v.language === 'es') out.language = v.language;
  if (v.appearance === 'system' || v.appearance === 'light' || v.appearance === 'dark') out.appearance = v.appearance;
  if (v.units === 'us' || v.units === 'metric') out.units = v.units;
  if (typeof v.checkinTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v.checkinTime)) out.checkinTime = v.checkinTime;
  if (typeof v.weeklyGoal === 'number' && v.weeklyGoal >= 1 && v.weeklyGoal <= 7) out.weeklyGoal = Math.round(v.weeklyGoal);
  if (typeof v.summaryDays === 'number' && [14, 30, 90].includes(v.summaryDays)) out.summaryDays = v.summaryDays;
  if (Array.isArray(v.milestonesSeen)) out.milestonesSeen = v.milestonesSeen.filter((n): n is number => typeof n === 'number');
  const w = v.waitlist as Record<string, unknown> | null | undefined;
  if (w && typeof w === 'object' && typeof w.email === 'string' && typeof w.state === 'string') {
    out.waitlist = {
      email: w.email,
      state: w.state,
      name: typeof w.name === 'string' ? w.name : '',
      interests: Array.isArray(w.interests) ? w.interests.filter((x): x is string => typeof x === 'string') : [],
      at: typeof w.at === 'number' ? w.at : Date.now(),
      queued: w.queued === true,
    };
  }
  return out;
}
