import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { Appearance, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { ErrorView } from '@/components/ErrorView';
import { ToastHost } from '@/components/feedback';
import { LockGate, PrivacyCover } from '@/components/Guard';
import { useT } from '@/i18n';
import { wantsPhoneFrame } from '@/lib/demo';
import { boot, useBackgroundSync } from '@/lib/sync';
import { usePrefs } from '@/state/prefs';
import { font, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: true, duration: 300 });

export { ErrorView as ErrorBoundary };

export default function RootLayout() {
  const c = useTheme();
  const t = useT();
  const appearance = usePrefs(s => s.appearance);
  const onboarded = usePrefs(s => s.onboarded);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Native only: the web preview follows the browser's setting.
    if (Platform.OS !== 'web' && typeof Appearance.setColorScheme === 'function') {
      Appearance.setColorScheme(appearance === 'system' ? 'unspecified' : appearance);
    }
  }, [appearance]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.bg).catch(() => {});
  }, [c.bg]);

  useEffect(() => {
    boot()
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useBackgroundSync(ready);

  if (!ready) return null;

  const base = c.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    dark: c.scheme === 'dark',
    colors: { ...base.colors, primary: c.primary, background: c.bg, card: c.bg, text: c.text, border: c.line, notification: c.danger },
    fonts: {
      regular: { fontFamily: font.body, fontWeight: '400' as const },
      medium: { fontFamily: font.medium, fontWeight: '500' as const },
      bold: { fontFamily: font.semibold, fontWeight: '600' as const },
      heavy: { fontFamily: font.semibold, fontWeight: '700' as const },
    },
  };
  const modal = { presentation: Platform.OS === 'ios' ? ('modal' as const) : ('card' as const), animation: Platform.OS === 'android' ? ('slide_from_bottom' as const) : undefined };
  const page = (title: string) => ({
    headerShown: true,
    title,
    headerTintColor: c.primary,
    headerTitleStyle: { fontFamily: font.semibold, color: c.text },
    headerStyle: { backgroundColor: c.bg },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal' as const,
  });

  const app = (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={navTheme}>
        <StatusBar style={c.scheme === 'dark' ? 'light' : 'dark'} />
        <View style={[styles.root, { backgroundColor: c.bg }]} onLayout={() => SplashScreen.hideAsync().catch(() => {})}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
            <Stack.Protected guard={!onboarded}>
              <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            </Stack.Protected>
            <Stack.Protected guard={onboarded}>
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen name="checkin" options={modal} />
              <Stack.Screen name="vital" options={modal} />
              <Stack.Screen name="med" options={modal} />
              <Stack.Screen name="finder" options={modal} />
              <Stack.Screen name="waitlist" options={modal} />
              <Stack.Screen name="ticket" options={modal} />
              <Stack.Screen name="summary" options={page(t('summary.title'))} />
              <Stack.Screen name="settings" options={page(t('settings.title'))} />
              <Stack.Screen name="account" options={page(t('account.title'))} />
              <Stack.Screen name="service/[key]" options={page('')} />
            </Stack.Protected>
            <Stack.Screen name="+not-found" options={page('')} />
          </Stack>
          {Platform.OS !== 'web' && onboarded ? <ReminderTaps /> : null}
          <LockGate />
          <PrivacyCover />
          <ToastHost />
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
  // Web preview screenshots: lay the screens out with an iPhone's safe areas (status bar and home indicator).
  return PHONE_INSETS ? <SafeAreaInsetsContext.Provider value={PHONE_INSETS}>{app}</SafeAreaInsetsContext.Provider> : app;
}

const PHONE_INSETS = wantsPhoneFrame() ? { top: 59, bottom: 34, left: 0, right: 0 } : null;

/** Tapping a reminder opens the right screen (medications or the check-in). Phones only. */
function ReminderTaps() {
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!response) return;
    const url = response.notification.request.content.data?.url;
    if (typeof url === 'string' && url.startsWith('/')) router.push(url);
    Notifications.clearLastNotificationResponse();
  }, [response]);
  return null;
}

const styles = StyleSheet.create({ root: { flex: 1 } });
