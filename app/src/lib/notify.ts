/**
 * Local reminders, scheduled on the phone (no push server, nothing sent anywhere): medication times,
 * refill alerts and an optional daily check-in nudge. Medication names stay off the lock screen unless the
 * person turns them on.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { tNow } from '@/i18n';
import { usePrefs } from '@/state/prefs';
import { plan } from './reminder-plan';
import type { Med } from './schedule';
import { withSystemUI } from './system';

let configured = false;

export function configureNotifications(): void {
  if (configured || Platform.OS === 'web') return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    const t = tNow();
    Notifications.setNotificationChannelAsync('meds', {
      name: t('notify.channelMeds'),
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#4F7A5F',
    }).catch(() => {});
    Notifications.setNotificationChannelAsync('checkin', {
      name: t('notify.channelCheckin'),
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => {});
  }
}

export type Permission = 'granted' | 'denied' | 'undetermined';

export async function permission(): Promise<Permission> {
  if (Platform.OS === 'web') return 'denied';
  try {
    const p = await Notifications.getPermissionsAsync();
    if (p.granted) return 'granted';
    return p.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'denied';
  }
}

/** Ask once, in context (when the person adds a reminder). */
export async function askPermission(): Promise<boolean> {
  const current = await permission();
  if (current === 'granted') return true;
  if (current === 'denied') return false;
  try {
    const p = await withSystemUI(() =>
      Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } }),
    );
    return p.granted;
  } catch {
    return false;
  }
}

let running: Promise<void> = Promise.resolve();

/** Replace every scheduled reminder with the current plan. Calls are queued so they never overlap. */
export function reschedule(meds: Med[], checkedInToday: boolean): Promise<void> {
  if (Platform.OS === 'web') return Promise.resolve();
  const p = usePrefs.getState();
  running = running.then(async () => {
    try {
      if ((await permission()) !== 'granted') return;
      await Notifications.cancelAllScheduledNotificationsAsync();
      const items = plan(meds, { medNames: p.medNames, checkin: p.checkinReminder, checkinTime: p.checkinTime, checkedInToday }, tNow());
      for (const item of items) {
        const trigger: Notifications.NotificationTriggerInput =
          item.trigger.type === 'daily'
            ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: item.trigger.hour, minute: item.trigger.minute, channelId: item.channel }
            : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.trigger.date, channelId: item.channel };
        await Notifications.scheduleNotificationAsync({
          identifier: item.id,
          content: { title: item.title, body: item.body, data: { url: item.url }, sound: 'default' },
          trigger,
        });
      }
    } catch {
      // Scheduling failed (rare); the next app open tries again.
    }
  });
  return running;
}

export async function cancelAll(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
}
