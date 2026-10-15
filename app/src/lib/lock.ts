/** App lock with Face ID, Touch ID, fingerprint or the phone's passcode. */
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

import type { T } from '@/i18n';
import { withSystemUI } from './system';

export async function canLock(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    return level !== LocalAuthentication.SecurityLevel.NONE;
  } catch {
    return false;
  }
}

/** "Face ID", "Touch ID", "your fingerprint" or "your passcode", in the app's language. */
export async function lockMethod(t: T): Promise<string> {
  const es = t.lang === 'es';
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (enrolled && types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return Platform.OS === 'ios' ? 'Face ID' : es ? 'el desbloqueo facial' : 'face unlock';
    }
    if (enrolled && types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === 'ios' ? 'Touch ID' : es ? 'su huella' : 'your fingerprint';
    }
  } catch {
    // Fall through to the passcode wording.
  }
  return es ? 'el código de su teléfono' : 'your phone’s passcode';
}

export async function unlock(t: T): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  try {
    const result = await withSystemUI(() =>
      LocalAuthentication.authenticateAsync({
        promptMessage: t('lock.prompt'),
        cancelLabel: t('common.cancel'),
        disableDeviceFallback: false,
      }),
    );
    return result.success;
  } catch {
    return false;
  }
}
