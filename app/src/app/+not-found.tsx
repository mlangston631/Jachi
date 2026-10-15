import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Leaf } from '@/components/Leaf';
import { Button, Txt } from '@/components/ui';
import { useT } from '@/i18n';
import { space, useTheme } from '@/theme';

export default function NotFound() {
  const t = useT();
  const c = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <Leaf size={56} color={c.accent} />
      <Txt variant="title2" center heading>{t('error.notFound')}</Txt>
      <Button label={t('error.home')} onPress={() => router.replace('/')} />
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: space.x3 } });
