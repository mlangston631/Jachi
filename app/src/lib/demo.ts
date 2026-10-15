/**
 * Sample entries for the web preview used to check screens and make store screenshots. Runs only in a web
 * browser when the address ends with ?demo; the phone apps never call it.
 */
import { Platform } from 'react-native';

import { usePrefs } from '@/state/prefs';
import { addDays, at, dayKey } from './dates';
import { addQuestion, allMeds, logDose, saveCheckin, saveMed, saveVital } from './db';

export function wantsDemo(): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined' && /[?&]demo\b/.test(window.location.search);
}

export async function seedDemo(): Promise<void> {
  if (!wantsDemo() || (await allMeds()).length) return;
  const today = dayKey();
  const moods = [3, 4, 4, 3, 5, 4, 2, 3, 4, 4, 5, 4, 3, 4, 4, 5, 4, 4, 3, 4];
  const sleeps = [6.5, 7, 7.5, 6, 8, 7.5, 5.5, 6.5, 7, 7.5, 8, 7, 6.5, 7.5, 7, 8, 7.5, 7, 6, 7.5];
  for (let i = 19; i >= 1; i--) {
    await saveCheckin({
      day: addDays(today, -i),
      mood: moods[i] ?? 4,
      energy: Math.max(1, Math.min(5, (moods[i] ?? 4) - (i % 3 === 0 ? 1 : 0))),
      sleep: sleeps[i] ?? 7,
      symptoms: i % 4 === 0 ? ['headache'] : i % 7 === 0 ? ['fatigue'] : [],
      note: '',
    });
  }
  const lis = await saveMed({ name: 'Lisinopril', dose: '10 mg', times: ['08:00'], supply: 24, perDose: 1, refillDays: 7, notes: 'With breakfast', active: true });
  const vitD = await saveMed({ name: 'Vitamin D', dose: '1,000 IU', times: ['08:00', '20:00'], supply: null, perDose: 1, refillDays: 7, notes: '', active: true });
  await saveMed({ name: 'Ibuprofen', dose: '200 mg', times: [], supply: null, perDose: 1, refillDays: 7, notes: 'As needed for headaches', active: true });
  const meds = await allMeds();
  const byId = new Map(meds.map(m => [m.id, m]));
  for (let i = 6; i >= 1; i--) {
    const day = addDays(today, -i);
    await logDose(byId.get(lis)!, day, '08:00', 'taken');
    await logDose(byId.get(vitD)!, day, '08:00', 'taken');
    if (i !== 3) await logDose(byId.get(vitD)!, day, '20:00', 'taken');
  }
  const bp = [[128, 84], [124, 82], [131, 85], [122, 80], [126, 81], [120, 79]];
  bp.forEach(([sys, dia], i) => void saveVital({ at: at(addDays(today, -(12 - i * 2)), '07:45').getTime(), kind: 'bp', value: sys!, value2: dia!, note: '' }));
  await saveVital({ at: at(addDays(today, -2), '07:30').getTime(), kind: 'weight', value: 84.2, value2: null, note: '' });
  await saveVital({ at: at(addDays(today, -9), '07:30').getTime(), kind: 'weight', value: 85.1, value2: null, note: '' });
  await addQuestion('Are my morning headaches related to my blood pressure?');
  await addQuestion('Should I keep taking vitamin D in the summer?');
  usePrefs.getState().set({ onboarded: true, adult: true, name: 'Maria', focus: ['urgent', 'refill'], waitlist: { email: 'maria@example.com', state: 'TX', name: 'Maria', interests: ['refills'], at: Date.now(), queued: false } });
}
