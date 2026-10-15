import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Accordion, SafetyCard, StatusCard } from '@/components/feedback';
import { ListRow } from '@/components/forms';
import { Icon } from '@/components/Icon';
import { TabScreen } from '@/components/Screen';
import { Button, Card, Row, Tag, Tap, Txt } from '@/components/ui';
import { useT } from '@/i18n';
import { CONTENT, LINKS, serviceByKey } from '@/lib/content';
import { openPage } from '@/lib/links';
import { searchConditions } from '@/lib/search';
import { radius, space, type, useTheme } from '@/theme';
import { NO_OUTLINE } from '@/theme/tokens';

const STANDARD_ICONS = ['steth', 'shield', 'user', 'pill', 'alert', 'lock'];

export default function Care() {
  const t = useT();
  const c = useTheme();
  const [q, setQ] = useState('');
  const hits = searchConditions(q, t.lang);
  const standards = t.list('care.standards');
  const boards = t.list('care.boards');
  const how = t.list('care.how');

  return (
    <TabScreen title={t('care.title')}>
      <StatusCard compact />

      <Card onPress={() => router.push('/finder')} style={styles.finder} accessibilityLabel={`${t('care.finderTitle')}. ${t('care.finderBody')}`}>
        <View style={[styles.finderIcon, { backgroundColor: c.primary }]}><Icon name="search" size={24} color={c.onPrimary} strokeWidth={2} /></View>
        <View style={[styles.flex, styles.gapXs]}>
          <Txt variant="title3" heading>{t('care.finderTitle')}</Txt>
          <Txt variant="footnote" tone="text2">{t('care.finderBody')}</Txt>
        </View>
        <Icon name="arrow" size={22} color={c.primary} />
      </Card>

      <View style={styles.gapSm}>
        <Txt variant="subhead" nativeID="search-label">{t('care.searchLabel')}</Txt>
        <View style={[styles.search, { backgroundColor: c.surface, borderColor: c.lineStrong }]}>
          <Icon name="search" size={20} color={c.text3} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={t('care.searchPlaceholder')}
            placeholderTextColor={c.text3}
            accessibilityLabel={t('care.searchLabel')}
            autoCorrect={false}
            returnKeyType="search"
            style={[type.body, NO_OUTLINE, styles.searchInput, { color: c.text }]}
            maxFontSizeMultiplier={1.8}
          />
          {q ? (
            <Tap onPress={() => setQ('')} accessibilityLabel={t('care.searchClear')} style={styles.clear}>
              <Icon name="x" size={18} color={c.text2} />
            </Tap>
          ) : null}
        </View>
        {q.trim() ? (
          <Animated.View entering={FadeIn.duration(160)} style={styles.gapSm} accessibilityLiveRegion="polite">
            {hits.length === 0 ? <Txt variant="callout" tone="text2">{t('care.searchNone', { q: q.trim() })}</Txt> : null}
            {hits.map((h, i) => {
              if (h.kind === 'emergency') return <SafetyCard key={i} kind="emergency" title={h.name} body={h.text} />;
              if (h.kind === 'crisis') return <SafetyCard key={i} kind="crisis" title={h.name} body={h.text} />;
              if (h.kind === 'not_offered') {
                return (
                  <Card key={i} tone="plain" style={styles.gapXs}>
                    <Row><Txt variant="headline" style={styles.flex}>{h.name}</Txt><Tag label={t('care.notOffered')} tone="neutral" /></Row>
                    <Txt variant="callout" tone="text2">{h.text}</Txt>
                  </Card>
                );
              }
              const svc = serviceByKey(h.services[0] ?? '');
              return (
                <Card key={i} onPress={svc ? () => router.push({ pathname: '/service/[key]', params: { key: svc.key } }) : undefined} style={styles.gapXs}>
                  <Row>
                    <Txt variant="headline" style={styles.flex}>{h.name}</Txt>
                    {svc ? <Icon name="chevron" size={18} color={c.text3} /> : null}
                  </Row>
                  {h.note ? <Txt variant="footnote" tone="text2">{h.note}</Txt> : null}
                  <Txt variant="footnote" tone="accent">
                    {t('care.treatedBy', { service: h.services.map(k => serviceByKey(k)?.[t.lang].name ?? k).join(' · ') })}
                  </Txt>
                </Card>
              );
            })}
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.gapMd}>
        <Txt variant="title3" heading>{t('care.servicesTitle')}</Txt>
        <View style={styles.grid}>
          {CONTENT.services.map((s, i) => (
            <Animated.View key={s.key} entering={FadeInDown.delay(i * 40).duration(280)} style={styles.cell}>
              <Card onPress={() => router.push({ pathname: '/service/[key]', params: { key: s.key } })} style={styles.service} accessibilityLabel={`${s[t.lang].name}. ${s[t.lang].tag}`}>
                <View style={[styles.serviceIcon, { backgroundColor: c.accentSoft }]}><Icon name={s.icon} size={22} color={c.primary} /></View>
                <Txt variant="headline" numberOfLines={2}>{s[t.lang].name}</Txt>
                <Txt variant="caption" tone="text3" numberOfLines={1}>{s[t.lang].tag}</Txt>
              </Card>
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={styles.gapMd}>
        <Txt variant="title3" heading>{t('care.howTitle')}</Txt>
        <Txt variant="callout" tone="text2">{t('care.howLead')}</Txt>
        <Card padded={false}>
          {how.map(([title, body, status], i) => {
            const now = i === 0;
            return (
              <View key={title} style={[styles.howRow, i ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line } : null]}>
                <View style={[styles.howNum, { backgroundColor: now ? c.primary : c.surface2 }]}>
                  <Txt variant="subhead" style={{ color: now ? c.onPrimary : c.text2 }}>{i + 1}</Txt>
                </View>
                <View style={[styles.flex, styles.gapXs]}>
                  <Txt variant="headline">{title}</Txt>
                  <Txt variant="footnote" tone="text2">{body}</Txt>
                  <Tag label={status} tone={now ? 'accent' : i === 4 ? 'accent' : 'warn'} icon={now ? 'check' : 'clock'} />
                </View>
              </View>
            );
          })}
        </Card>
      </View>

      <Card tone="hero" style={styles.gapMd}>
        <Txt variant="eyebrow" tone="onHero2">{t('care.standardsEyebrow')}</Txt>
        <Txt variant="title2" tone="onHero" heading>{t('care.standardsTitle')}</Txt>
        <Txt variant="callout" tone="onHero2">{t('care.standardsLead')}</Txt>
        {standards.map(([title, body], i) => (
          <View key={title} style={styles.standard}>
            <View style={styles.standardIcon}><Icon name={STANDARD_ICONS[i] ?? 'check'} size={18} color="#FFFFFF" /></View>
            <View style={[styles.flex, styles.gapXs]}>
              <Txt variant="headline" tone="onHero">{title}</Txt>
              <Txt variant="footnote" tone="onHero2">{body}</Txt>
            </View>
          </View>
        ))}
      </Card>

      <View style={styles.gapSm}>
        <Txt variant="title3" heading>{t('care.verifyTitle')}</Txt>
        <Txt variant="callout" tone="text2">{t('care.verifyBody')}</Txt>
        <Card padded={false}>
          {boards.map(([name, detail], i) => (
            <View key={name} style={i ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line } : null}>
              <ListRow label={name} detail={detail} external onPress={() => void openPage(LINKS.boards[i]!)} />
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.gapSm}>
        <Txt variant="title3" heading>{t('care.notOfferedTitle')}</Txt>
        <Txt variant="callout" tone="text2">{t('care.notOfferedLead')}</Txt>
        <Card style={styles.gapSm}>
          {CONTENT.notOffered.map(n => (
            <Row key={n.en.name} center={false} gap={space.sm}>
              <Icon name="x" size={16} color={c.text3} strokeWidth={2} />
              <View style={styles.flex}>
                <Txt variant="subhead">{n[t.lang].name}</Txt>
                <Txt variant="footnote" tone="text3">{n[t.lang].text}</Txt>
              </View>
            </Row>
          ))}
        </Card>
      </View>

      <View style={styles.gapXs}>
        <Txt variant="title3" heading>{t('care.faqTitle')}</Txt>
        {CONTENT.faq[t.lang].map(f => <Accordion key={f.q} q={f.q} a={f.a} />)}
      </View>

      <Button label={t('guide.ticket')} icon="mail" variant="ghost" onPress={() => router.push('/ticket')} />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gapXs: { gap: space.xs },
  gapSm: { gap: space.sm },
  gapMd: { gap: space.md },
  finder: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  finderIcon: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: space.lg, minHeight: 52 },
  searchInput: { flex: 1, paddingVertical: 12 },
  clear: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  cell: { width: '47.5%', flexGrow: 1 },
  service: { gap: space.sm, minHeight: 150 },
  serviceIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  howRow: { flexDirection: 'row', gap: space.md, padding: space.lg },
  howNum: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  standard: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start', paddingTop: space.xs },
  standardIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
});
