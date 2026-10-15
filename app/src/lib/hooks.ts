/** Small hooks shared by the screens. */
import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { dayKey } from './dates';
import { onJournalChange } from './db';

/**
 * Load data and keep it fresh: reloads when the journal changes, when the app comes back to the
 * foreground and when `deps` change. Keeps showing the previous data while reloading (no flicker).
 */
export function useLoader<T>(load: () => Promise<T>, deps: readonly unknown[]): { data: T | undefined; error: boolean; reload: () => void } {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let alive = true;
    loadRef
      .current()
      .then(value => {
        if (alive) {
          setData(value);
          setError(false);
        }
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  useEffect(() => {
    const off = onJournalChange(() => setTick(n => n + 1));
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') setTick(n => n + 1);
    });
    return () => {
      off();
      sub.remove();
    };
  }, []);

  return { data, error, reload: () => setTick(n => n + 1) };
}

/** Today's day key, updated when the app returns to the foreground and at midnight. */
export function useToday(): string {
  const [today, setToday] = useState(() => dayKey());
  useEffect(() => {
    const check = () => setToday(prev => (prev === dayKey() ? prev : dayKey()));
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') check();
    });
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5).getTime() - now.getTime();
    const timer = setTimeout(check, midnight);
    return () => {
      sub.remove();
      clearTimeout(timer);
    };
  }, [today]);
  return today;
}

export function useAppState(): AppStateStatus {
  const [state, setState] = useState<AppStateStatus>(() => (AppState.currentState as AppStateStatus | null) ?? 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', setState);
    return () => sub.remove();
  }, []);
  return state;
}
