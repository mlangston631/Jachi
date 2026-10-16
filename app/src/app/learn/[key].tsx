import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GuideBody, GuideList, openGuidePage } from '@/components/care';
import { ListRow } from '@/components/forms';
import { Icon } from '@/components/Icon';
import { Page } from '@/components/Screen';
import { Button, Card, Row, Tag, Tap, Txt } from '@/components/ui';
import { useT } from '@/i18n';
import { CONTENT, guideByKey } from '@/lib/content';
import { call, openPage, text } from '@/lib/links';
import { space, useTheme } from '@/theme';

/** A health guide from the website (learn.py), with its sources, a waitlist box and the 911 and 988 numbers. */
export default function LearnScreen() {
  const t = useT();
  const c = useTheme();
  const { key } = useLocalSearchParams<{ key: string }>();
  const guide = guideByKey(String(key));
  if (!guide) {
    return (
      <Page>
        <Txt variant="title2">{t('error.notFound')}</Txt>
      </Page>
    );
  }
  const g = guide[t.lang];
  const words = CONTENT.learn[t.lang];
  const others = CONTENT.guides.filter(other => other.key !== guide.key);
  const join = () => router.push(g.cta.interest ? { pathname: '/waitlist', params: { interest: g.cta.interest } } : '/waitlist');
  return (
    <Page>
      <Stack.Screen options={{ title: g.topic }} />
      <Animated.View entering={FadeInDown.duration(320)} style={styles.gapMd}>
        <Row gap={space.sm} style={styles.wrap}>
          <Tag label={g.topic} />
          <Txt variant="caption" tone="text3">{words.minutes.replace('{n}', String(g.minutes))}</Txt>
        </Row>
        <Txt variant="largeTitle" heading>{g.title}</Txt>
        <Txt variant="body" tone="text2">{g.lead}</Txt>
        <Txt variant="caption" tone="text3">{g.updated}</Txt>
      </Animated.View>

      <View style={styles.gapLg}>
        {g.body.map((block, i) => <GuideBody key={i} block={block} />)}
      </View>

      <Card tone="hero" style={styles.gapMd}>
        <Txt variant="title2" tone="onHero" heading>{g.cta.title}</Txt>
        <Txt variant="callout" tone="onHero2">{g.cta.text}</Txt>
        <Button label={t('status.join')} onPress={join} variant="light" iconRight="arrow" style={styles.selfStart} />
        <Tap onPress={() => openGuidePage(g.cta.page.href)} style={styles.heroLink} accessibilityLabel={g.cta.page.label}>
          <Txt variant="headline" tone="onHero" style={styles.underline}>{g.cta.page.label}</Txt>
          <Icon name="arrow" size={18} color="#FFFFFF" strokeWidth={2} />
        </Tap>
      </Card>

      <Card tone="plain" style={styles.gapSm}>
        <Txt variant="headline">{words.note_title}</Txt>
        <Txt variant="callout" tone="text2">{words.note}</Txt>
        <View style={styles.actions}>
          <Button label={t('site.c_call_911')} icon="phone" onPress={() => call('911')} variant="danger" size="sm" accessibilityLabel={t('a11y.callButton', { number: '911' })} />
          <Button label={t('site.c_call_988')} icon="phone" onPress={() => call('988')} variant="ghost" size="sm" accessibilityLabel={t('a11y.callButton', { number: '988' })} />
          <Button label={t('site.c_text_988')} icon="msg" onPress={() => text('988', t.lang === 'es' ? 'AYUDA' : '')} variant="ghost" size="sm" accessibilityLabel={t('a11y.textButton', { number: '988' })} />
        </View>
      </Card>

      <View style={styles.gapSm}>
        <Txt variant="title3" heading>{words.sources}</Txt>
        <Txt variant="footnote" tone="text2">{words.sources_lead}</Txt>
        <Card padded={false}>
          {g.sources.map((s, i) => (
            <View key={s.url} style={i ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line } : null}>
              <ListRow label={s.name} external onPress={() => void openPage(s.url)} />
            </View>
          ))}
        </Card>
      </View>

      {others.length ? (
        <View style={styles.gapSm}>
          <Row gap={space.xs}>
            <Icon name="clip" size={20} color={c.accent} />
            <Txt variant="title3" heading>{words.more}</Txt>
          </Row>
          <GuideList guides={others} />
        </View>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  gapSm: { gap: space.sm },
  gapMd: { gap: space.md },
  gapLg: { gap: space.lg },
  wrap: { flexWrap: 'wrap' },
  selfStart: { alignSelf: 'flex-start' },
  heroLink: { flexDirection: 'row', alignItems: 'center', gap: space.sm, alignSelf: 'flex-start', minHeight: 44 },
  underline: { textDecorationLine: 'underline' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.xs },
});
