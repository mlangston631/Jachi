/** Haptic feedback that respects the person's setting and is skipped where unsupported. */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { usePrefs } from '@/state/prefs';

const on = () => Platform.OS !== 'web' && usePrefs.getState().haptics;

export const haptic = {
  tap() {
    if (on()) Haptics.selectionAsync().catch(() => {});
  },
  light() {
    if (on()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium() {
    if (on()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  success() {
    if (on()) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  warning() {
    if (on()) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
};
