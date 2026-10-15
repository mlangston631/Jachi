/** The app lock (Face ID / fingerprint / passcode) and the cover that hides health data in the app switcher. */
import { useEffect, useState } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useT } from '@/i18n';
import { useAppState } from '@/lib/hooks';
import { unlock } from '@/lib/lock';
import { onSystemUI, systemUIOpen } from '@/lib/system';
import { usePrefs } from '@/state/prefs';
import { space, useTheme } from '@/theme';
import { Leaf } from './Leaf';
import { Button, Txt } from './ui';

export function LockGate() {
  const t = useT();
  const c = useTheme();
  const enabled = usePrefs(s => s.lock);
  const [locked, setLocked] = useState(() => Platform.OS !== 'web' && usePrefs.getState().lock);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const attempt = async () => {
    if (busy) return;
    setBusy(true);
    const ok = await unlock(t);
    setBusy(false);
    setFailed(!ok);
    if (ok) setLocked(false);
  };

  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'background' && usePrefs.getState().lock && !systemUIOpen()) setLocked(true);
    });
    return () => sub.remove();
  }, []);

  const state = useAppState();
  useEffect(() => {
    if (locked && enabled && state === 'active') void attempt();
    // Prompt once each time the app comes back while locked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, enabled, state]);

  if (!locked || !enabled) return null;
  return (
    <Animated.View entering={FadeIn.duration(120)} exiting={FadeOut.duration(220)} style={[StyleSheet.absoluteFill, styles.lock, { backgroundColor: c.hero, experimental_backgroundImage: c.heroGradient }]} accessibilityViewIsModal>
      <Leaf size={64} color="#FFFFFF" label={t('a11y.leaf')} />
      <Txt variant="title" tone="onHero" center heading>{t('lock.title')}</Txt>
      <Txt variant="body" tone="onHero2" center>{failed ? t('lock.failed') : t('lock.body')}</Txt>
      <Button label={t('lock.unlock')} icon="face" variant="light" onPress={() => void attempt()} loading={busy} style={styles.btn} />
    </Animated.View>
  );
}

export function PrivacyCover() {
  const c = useTheme();
  const state = useAppState();
  const [system, setSystem] = useState(systemUIOpen());
  useEffect(() => onSystemUI(() => setSystem(systemUIOpen())), []);
  if (Platform.OS === 'web' || state === 'active' || system) return null;
  return (
    <View style={[StyleSheet.absoluteFill, styles.cover, { backgroundColor: c.hero, experimental_backgroundImage: c.heroGradient }]} pointerEvents="none">
      <Leaf size={72} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  lock: { alignItems: 'center', justifyContent: 'center', padding: space.x3, gap: space.md, zIndex: 2000 },
  btn: { marginTop: space.lg, alignSelf: 'center', minWidth: 200 },
  cover: { alignItems: 'center', justifyContent: 'center', zIndex: 3000 },
});
