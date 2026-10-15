/** Keeps reminders and the outbox in step with the journal and settings, without the screens having to. */
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useSession } from '@/state/session';
import { usePrefs } from '@/state/prefs';
import { dayKey } from './dates';
import { allMeds, checkinOn, database, onJournalChange } from './db';
import { seedDemo, wantsDemo } from './demo';
import { loadFonts } from './fonts';
import { flushOutbox } from './forms';
import { configureNotifications, reschedule } from './notify';

export async function boot(): Promise<void> {
  configureNotifications();
  await Promise.all([database(), loadFonts()]);
  if (wantsDemo()) await seedDemo();
}

async function syncReminders() {
  try {
    const [meds, today] = await Promise.all([allMeds(), checkinOn(dayKey())]);
    await reschedule(meds, today !== null);
  } catch {
    // Tried again on the next change or app open.
  }
}

export function useBackgroundSync(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const soon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void syncReminders(), 400);
    };
    soon();
    void flushOutbox();
    void useSession.getState().refresh();
    const offJournal = onJournalChange(soon);
    const offPrefs = usePrefs.subscribe((s, prev) => {
      if (s.medNames !== prev.medNames || s.checkinReminder !== prev.checkinReminder || s.checkinTime !== prev.checkinTime || s.language !== prev.language) soon();
    });
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        soon();
        void flushOutbox();
      }
    });
    return () => {
      clearTimeout(timer);
      offJournal();
      offPrefs();
      sub.remove();
    };
  }, [ready]);
}
