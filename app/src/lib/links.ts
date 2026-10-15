/** Opening links: web pages in an in-app browser, phone numbers, texts and email in the phone's own apps. */
import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform } from 'react-native';

import { brand } from '@/theme/tokens';
import { withSystemUI } from './system';

export async function openPage(url: string): Promise<void> {
  if (Platform.OS === 'web') {
    await Linking.openURL(url);
    return;
  }
  await withSystemUI(() =>
    WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
      controlsColor: brand.forest,
      toolbarColor: brand.mist,
    }).catch(() => Linking.openURL(url)),
  );
}

export function call(number: string): void {
  Linking.openURL(`tel:${number}`).catch(() => {});
}

export function text(number: string, body = ''): void {
  const sep = Platform.OS === 'ios' ? '&' : '?';
  Linking.openURL(body ? `sms:${number}${sep}body=${encodeURIComponent(body)}` : `sms:${number}`).catch(() => {});
}

export function email(address: string, subject = ''): void {
  Linking.openURL(`mailto:${address}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`).catch(() => {});
}

export function openSettings(): void {
  Linking.openSettings().catch(() => {});
}
