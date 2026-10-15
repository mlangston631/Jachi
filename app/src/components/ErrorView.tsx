import { router, type ErrorBoundaryProps } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useT } from '@/i18n';
import { space, useTheme } from '@/theme';
import { Leaf } from './Leaf';
import { Button, Txt } from './ui';

/** Shown if a screen crashes. The journal is untouched; the person can retry or tell us. */
export function ErrorView({ retry }: ErrorBoundaryProps) {
  const t = useT();
  const c = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]} accessibilityViewIsModal>
      <Leaf size={56} color={c.accent} />
      <Txt variant="title" center heading>{t('error.title')}</Txt>
      <Txt variant="body" tone="text2" center>{t('error.body')}</Txt>
      <View style={styles.actions}>
        <Button label={t('error.retry')} onPress={() => void retry()} full />
        <Button label={t('error.report')} variant="ghost" onPress={() => router.push({ pathname: '/ticket', params: { topic: '3' } })} full />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.x3, gap: space.md },
  actions: { alignSelf: 'stretch', gap: space.sm, marginTop: space.md },
});
