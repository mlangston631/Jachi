import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { StatusCard } from '@/components/feedback';
import { ChipGroup } from '@/components/forms';
import { Icon } from '@/components/Icon';
import { Page } from '@/components/Screen';
import { Button, Card, Row, Tag, Txt } from '@/components/ui';
import { useT } from '@/i18n';
import { CONTENT, conditionsFor, serviceByKey } from '@/lib/content';
import { openPage } from '@/lib/links';
import { radius, space, useTheme } from '@/theme';

export default function ServiceScreen() {
  const t = useT();
  const c = useTheme();
  const { key } = useLocalSearchParams<{ key: string }>();
  const s = serviceByKey(String(key));
  if (!s) {
    return (
      <Page>
        <Txt variant="title2">{t('error.notFound')}</Txt>
      </Page>
    );
  }
  const text = s[t.lang];
  const conditions = conditionsFor(s.key);
  return (
    <Page>
      <Stack.Screen options={{ title: text.name }} />
      <Animated.View entering={FadeInDown.duration(320)} style={styles.gapMd}>
        <View style={[styles.icon, { backgroundColor: c.accentSoft }]}><Icon name={s.icon} size={30} color={c.primary} /></View>
        <Txt variant="largeTitle" heading>{text.name}</Txt>
        <Row gap={space.sm}>
          <Tag label={text.tag} icon="steth" />
          {s.ongoing ? <Tag label={t('service.ongoing')} icon="refresh" /> : null}
        </Row>
        <Txt variant="body" tone="text2">{text.desc}</Txt>
      </Animated.View>

      <Card style={styles.gapSm}>
        <Txt variant="title3" heading>{t('service.includes')}</Txt>
        {text.items.map(item => (
          <Row key={item} center={false} gap={space.sm}>
            <Icon name="check" size={18} color={c.accent} strokeWidth={2.2} />
            <Txt variant="callout" style={styles.flex}>{item}</Txt>
          </Row>
        ))}
      </Card>

      {conditions.length ? (
        <View style={styles.gapSm}>
          <Txt variant="title3" heading>{t('service.conditions')}</Txt>
          <ChipGroup>
            {conditions.map(cond => (
              <View key={cond.en.name} style={[styles.condition, { backgroundColor: c.surface, borderColor: c.line }]}>
                <Txt variant="subhead">{cond[t.lang].name}</Txt>
              </View>
            ))}
          </ChipGroup>
        </View>
      ) : null}

      <Card tone="plain" style={styles.gapXs}>
        <Txt variant="headline">{t('service.price')}</Txt>
        <Txt variant="callout" tone="text2">{CONTENT.pricingNote[t.lang]}</Txt>
      </Card>

      <Card tone="warn" style={styles.gapSm}>
        <Row gap={space.sm}>
          <Icon name="clock" size={20} color={c.warn} />
          <Txt variant="headline" style={{ color: c.warn }}>{t('service.notYet')}</Txt>
        </Row>
        <Txt variant="callout">{t('service.notYetBody', { service: text.name.toLowerCase() })}</Txt>
      </Card>

      <StatusCard interest={s.interest} />

      <Button label={t('service.website')} variant="ghost" iconRight="external" onPress={() => void openPage(s.page)} />
    </Page>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gapXs: { gap: space.xs },
  gapSm: { gap: space.sm },
  gapMd: { gap: space.md },
  icon: { width: 64, height: 64, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  condition: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth },
});
