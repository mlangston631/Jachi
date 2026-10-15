import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Empty, useToast } from '@/components/feedback';
import { Icon } from '@/components/Icon';
import { TabScreen } from '@/components/Screen';
import { Button, Card, IconButton, Row, Tag, Tap, Txt } from '@/components/ui';
import { Ring } from '@/components/visuals';
import { useT } from '@/i18n';
import { addDays, nowTime } from '@/lib/dates';
import { allMeds, dosesBetween, logDose, undoDose } from '@/lib/db';
import { time } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useLoader, useToday } from '@/lib/hooks';
import { openSettings } from '@/lib/links';
import { permission, type Permission } from '@/lib/notify';
import { adherence, asNeeded, daysLeft, needsRefill, slotsForDay, type Med, type Slot } from '@/lib/schedule';
import { radius, space, useTheme } from '@/theme';

export default function Meds() {
  const t = useT();
  const c = useTheme();
  const today = useToday();
  const toast = useToast(s => s.show);
  const [perm, setPerm] = useState<Permission>('granted');

  const { data } = useLoader(async () => {
    const [meds, doses] = await Promise.all([allMeds(), dosesBetween(addDays(today, -6), today)]);
    return { meds, doses };
  }, [today]);

  useEffect(() => {
    void permission().then(setPerm);
  }, [data]);

  const meds = data?.meds ?? [];
  const doses = data?.doses ?? [];
  const slots = slotsForDay(meds, doses, today);
  const week = adherence(meds, doses, addDays(today, -6), today);
  const hasScheduled = meds.some(m => m.active && !asNeeded(m));

  const log = async (slot: Slot, status: 'taken' | 'skipped') => {
    await logDose(slot.med, slot.day, slot.time, status);
    if (status === 'taken') {
      haptic.success();
      toast(t('meds.doseTaken'));
    }
  };

  const logAsNeeded = async (med: Med) => {
    await logDose(med, today, nowTime(), 'taken');
    haptic.success();
    toast(t('meds.doseTaken'));
  };

  return (
    <TabScreen title={t('meds.title')} right={<IconButton icon="plus" label={t('meds.add')} onPress={() => router.push('/med')} filled />}>
      {meds.length === 0 ? (
        <Card>
          <Empty icon="pill" title={t('meds.emptyTitle')} body={t('meds.emptyBody')} action={<Button label={t('meds.add')} icon="plus" onPress={() => router.push('/med')} />} />
        </Card>
      ) : (
        <>
          {hasScheduled && perm === 'denied' ? (
            <Card tone="warn" style={styles.gapSm}>
              <Row>
                <Icon name="bell" size={20} color={c.warn} />
                <Txt variant="callout" style={styles.flex}>{t('meds.remindersOff')}</Txt>
              </Row>
              <Button label={t('meds.openSettings')} variant="ghost" size="sm" onPress={openSettings} style={styles.selfStart} />
            </Card>
          ) : null}

          {hasScheduled ? (
            <Card style={styles.adherence}>
              <Ring
                progress={week.rate ?? 0}
                size={84}
                label={t('meds.adherenceTitle')}
                value={week.due ? t('meds.adherence', { taken: week.taken, due: week.due }) : t('meds.adherenceNone')}>
                <Txt variant="numberSmall">{week.rate === null ? '–' : Math.round(week.rate * 100)}</Txt>
                {week.rate === null ? null : <Txt variant="caption" tone="text3">%</Txt>}
              </Ring>
              <View style={[styles.flex, styles.gapXs]}>
                <Txt variant="title3" heading>{t('meds.adherenceTitle')}</Txt>
                <Txt variant="callout" tone="text2">{week.due ? t('meds.adherence', { taken: week.taken, due: week.due }) : t('meds.adherenceNone')}</Txt>
              </View>
            </Card>
          ) : null}

          {slots.length ? (
            <View style={styles.gapMd}>
              <Txt variant="title3" heading>{t('meds.todayTitle')}</Txt>
              <View style={styles.timeline}>
                {slots.map((slot, i) => (
                  <Animated.View key={`${slot.med.id}-${slot.time}`} entering={FadeInDown.delay(i * 50).duration(280)} style={styles.tlRow}>
                    <View style={styles.tlRail}>
                      <View style={[styles.tlDot, slot.state === 'taken' ? { backgroundColor: c.primary } : slot.state === 'due' ? { backgroundColor: c.surface, borderColor: c.primary, borderWidth: 2.5 } : { backgroundColor: c.surface, borderColor: c.lineStrong, borderWidth: 2 }]}>
                        {slot.state === 'taken' ? <Icon name="check" size={12} color={c.onPrimary} strokeWidth={3} /> : null}
                      </View>
                      {i < slots.length - 1 ? <View style={[styles.tlLine, { backgroundColor: c.line }]} /> : null}
                    </View>
                    <Card style={[styles.flex, styles.slot]}>
                      <View style={styles.flex}>
                        <Txt variant="caption" tone={slot.state === 'due' ? 'primary' : 'text3'}>{time(t, slot.time)}</Txt>
                        <Txt variant="headline" numberOfLines={1}>{slot.med.name}</Txt>
                        {slot.med.dose ? <Txt variant="footnote" tone="text3" numberOfLines={1}>{slot.med.dose}</Txt> : null}
                      </View>
                      {slot.state === 'taken' || slot.state === 'skipped' ? (
                        <Tap onPress={() => void undoDose(slot.med, slot.day, slot.time)} accessibilityLabel={`${slot.state === 'taken' ? t('meds.taken', { time: time(t, nowTime(new Date(slot.dose?.at ?? Date.now()))) }) : t('meds.skipped')}. ${t('meds.undoLog')}`} style={[styles.logged, { backgroundColor: slot.state === 'taken' ? c.accentSoft : c.surface2 }]}>
                          <Txt variant="caption" tone={slot.state === 'taken' ? 'primary' : 'text3'}>
                            {slot.state === 'taken' ? t('meds.taken', { time: time(t, nowTime(new Date(slot.dose?.at ?? Date.now()))) }) : t('meds.skipped')}
                          </Txt>
                          <Icon name="undo" size={14} color={c.text3} />
                        </Tap>
                      ) : (
                        <Row gap={space.xs}>
                          <Button label={t('meds.skip')} variant="quiet" size="sm" onPress={() => void log(slot, 'skipped')} accessibilityLabel={`${t('meds.skip')} ${slot.med.name}`} />
                          <Button label={t('meds.take')} variant={slot.state === 'due' ? 'primary' : 'secondary'} size="sm" onPress={() => void log(slot, 'taken')} accessibilityLabel={`${t('meds.take')} ${slot.med.name}`} />
                        </Row>
                      )}
                    </Card>
                  </Animated.View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.gapMd}>
            <Txt variant="title3" heading>{t('meds.title')}</Txt>
            {meds.map(med => (
              <MedCard key={med.id} med={med} onLog={() => void logAsNeeded(med)} />
            ))}
          </View>

          <Card tone="plain" style={styles.note}>
            <Icon name="info" size={20} color={c.text2} />
            <Txt variant="footnote" tone="text2" style={styles.flex}>{t('meds.interactions')}</Txt>
          </Card>
        </>
      )}
    </TabScreen>
  );
}

function MedCard({ med, onLog }: { med: Med; onLog: () => void }) {
  const t = useT();
  const c = useTheme();
  const left = daysLeft(med);
  const refill = needsRefill(med);
  return (
    <Card onPress={() => router.push({ pathname: '/med', params: { id: String(med.id) } })} accessibilityLabel={`${med.name}${med.dose ? `, ${med.dose}` : ''}`} style={styles.gapSm}>
      <Row>
        <View style={[styles.medIcon, { backgroundColor: c.accentSoft }]}><Icon name="pill" size={20} color={c.primary} /></View>
        <View style={styles.flex}>
          <Txt variant="headline" numberOfLines={1}>{med.name}</Txt>
          <Txt variant="footnote" tone="text3" numberOfLines={1}>
            {[med.dose, asNeeded(med) ? t('meds.asNeeded') : med.times.map(x => time(t, x)).join(', ')].filter(Boolean).join(' · ')}
          </Txt>
        </View>
        <Icon name="chevron" size={18} color={c.text3} />
      </Row>
      <Row gap={space.sm} style={styles.wrap}>
        {!med.active ? <Tag label={t('meds.paused')} tone="neutral" /> : null}
        {refill ? <Tag label={t('meds.refillSoon')} tone="warn" icon="alert" /> : null}
        {left !== null ? <Tag label={left === 0 ? t('meds.supplyOut') : left === 1 ? t('meds.supplyOneDay') : t('meds.supplyLeft', { n: left })} tone={refill ? 'warn' : 'accent'} /> : null}
      </Row>
      {asNeeded(med) && med.active ? <Button label={t('meds.logDose')} variant="secondary" size="sm" icon="plus" onPress={onLog} style={styles.selfStart} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flexWrap: 'wrap' },
  gapXs: { gap: space.xs },
  gapSm: { gap: space.sm },
  gapMd: { gap: space.md },
  selfStart: { alignSelf: 'flex-start' },
  adherence: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  timeline: { gap: 0 },
  tlRow: { flexDirection: 'row', gap: space.md },
  tlRail: { width: 22, alignItems: 'center', paddingTop: space.xl },
  tlDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tlLine: { width: 2, flex: 1, marginTop: 4 },
  slot: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, marginBottom: space.md },
  logged: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.pill },
  medIcon: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  note: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
});
