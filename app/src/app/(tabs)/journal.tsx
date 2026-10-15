import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Empty } from '@/components/feedback';
import { Segmented } from '@/components/forms';
import { Icon } from '@/components/Icon';
import { TabScreen } from '@/components/Screen';
import { Button, Card, IconButton, Row, Tap, Txt } from '@/components/ui';
import { Bars, LineChart, MoodFace } from '@/components/visuals';
import { useT } from '@/i18n';
import { niceMax } from '@/lib/chart';
import { addDays, dayKey, formatDate, formatDay, lastDays, nowTime } from '@/lib/dates';
import { checkinsBetween, vitalsSince } from '@/lib/db';
import { hours, num, time } from '@/lib/format';
import { useLoader, useToday } from '@/lib/hooks';
import { averages } from '@/lib/insights';
import { formatVital, toDisplay, unitKey, VITAL_KINDS, type Vital, type VitalKind } from '@/lib/units';
import { usePrefs } from '@/state/prefs';
import { radius, space, useTheme } from '@/theme';

type View_ = 'checkins' | 'vitals';
type Range = '7' | '30' | '90';

const KIND_ICON: Record<VitalKind, string> = { bp: 'gauge', hr: 'heart', weight: 'scale', temp: 'thermo', glucose: 'drop' };

export default function Journal() {
  const t = useT();
  const c = useTheme();
  const today = useToday();
  const units = usePrefs(s => s.units);
  const [view, setView] = useState<View_>('checkins');
  const [range, setRange] = useState<Range>('30');
  const [width, setWidth] = useState(0);
  const days = Number(range);
  const from = addDays(today, -(days - 1));

  const { data } = useLoader(async () => {
    const [checkins, vitals] = await Promise.all([checkinsBetween(from, today), vitalsSince(new Date(`${from}T00:00:00`).getTime())]);
    return { checkins, vitals };
  }, [from, today]);

  const checkins = data?.checkins ?? [];
  const vitals = data?.vitals ?? [];
  const byDay = new Map(checkins.map(ci => [ci.day, ci]));
  const span = lastDays(days, today);
  const avg = averages(checkins);
  const chartW = Math.max(0, width - space.xl * 2);

  const ranges = [
    { value: '7' as const, label: t('journal.range7') },
    { value: '30' as const, label: t('journal.range30') },
    { value: '90' as const, label: t('journal.range90') },
  ];

  return (
    <TabScreen
      title={t('journal.title')}
      right={<IconButton icon="plus" label={view === 'checkins' ? t('today.checkinCta') : t('journal.addReading')} onPress={() => router.push(view === 'checkins' ? '/checkin' : '/vital')} filled />}>
      <View style={styles.gapMd}>
        <Segmented label={t('journal.title')} value={view} onChange={setView} options={[{ value: 'checkins', label: t('journal.checkins') }, { value: 'vitals', label: t('journal.vitals') }]} />
        <Segmented label={t('summary.range')} value={range} onChange={setRange} options={ranges} />
      </View>

      <View onLayout={e => setWidth(e.nativeEvent.layout.width)} style={styles.gapLg}>
        {!data ? null : view === 'checkins' ? (
          checkins.length === 0 ? (
            <Card>
              <Empty title={t('journal.emptyTitle')} body={t('journal.emptyBody')} action={<Button label={t('today.checkinCta')} onPress={() => router.push('/checkin')} />} />
            </Card>
          ) : (
            <>
              <ChartCard title={t('journal.moodChart')} value={avg.mood === null ? '–' : `${num(t, avg.mood)}/5`} icon="smile">
                {chartW > 0 ? <LineChart width={chartW} values={span.map(d => byDay.get(d)?.mood ?? null)} min={1} max={5} color={c.chart[0]} label={t('journal.chartLabel', { name: t('journal.moodChart'), count: checkins.length, avg: avg.mood ?? '–' })} /> : null}
              </ChartCard>
              <ChartCard title={t('journal.energyChart')} value={avg.energy === null ? '–' : `${num(t, avg.energy)}/5`} icon="bolt">
                {chartW > 0 ? <LineChart width={chartW} values={span.map(d => byDay.get(d)?.energy ?? null)} min={1} max={5} color={c.chart[2]} label={t('journal.chartLabel', { name: t('journal.energyChart'), count: checkins.length, avg: avg.energy ?? '–' })} /> : null}
              </ChartCard>
              <ChartCard title={t('journal.sleepChart')} value={avg.sleep === null ? '–' : hours(t, avg.sleep)} icon="moon">
                {chartW > 0 ? <Bars width={chartW} values={span.map(d => byDay.get(d)?.sleep ?? null)} max={12} color={c.chart[1]} label={t('journal.chartLabel', { name: t('journal.sleepChart'), count: checkins.length, avg: avg.sleep ?? '–' })} /> : null}
              </ChartCard>
              <View style={styles.gapSm}>
                <Txt variant="title3" heading>{t('journal.history')}</Txt>
                <Card padded={false}>
                  {[...checkins].reverse().map((ci, i) => (
                    <Tap
                      key={ci.day}
                      onPress={() => router.push({ pathname: '/checkin', params: { day: ci.day } })}
                      scaleTo={0.99}
                      accessibilityLabel={`${formatDay(ci.day, t.locale, { weekday: 'long', month: 'long', day: 'numeric' })}. ${t('today.mood')}: ${t.list('checkin.moods')[ci.mood - 1]}`}
                      style={[styles.entry, i ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line } : null]}>
                      <MoodFace level={ci.mood} size={34} color={c.mood[ci.mood - 1]!} filled />
                      <View style={styles.flex}>
                        <Txt variant="headline">{ci.day === dayKey() ? t('common.today') : formatDay(ci.day, t.locale, { weekday: 'short', month: 'short', day: 'numeric' })}</Txt>
                        <Txt variant="footnote" tone="text3" numberOfLines={1}>
                          {[
                            t.list('checkin.moods')[ci.mood - 1],
                            ci.sleep !== null ? hours(t, ci.sleep) : null,
                            ci.symptoms.length ? (ci.symptoms.length === 1 ? t('journal.symptomsOne') : t('journal.symptomsCount', { n: ci.symptoms.length })) : null,
                          ].filter(Boolean).join(' · ')}
                        </Txt>
                      </View>
                      {ci.note ? <Icon name="book" size={16} color={c.text3} /> : null}
                      <Icon name="chevron" size={18} color={c.text3} />
                    </Tap>
                  ))}
                </Card>
              </View>
            </>
          )
        ) : vitals.length === 0 ? (
          <Card>
            <Empty icon="pulse" title={t('journal.emptyVitalsTitle')} body={t('journal.emptyVitalsBody')} action={<Button label={t('journal.addReading')} icon="plus" onPress={() => router.push('/vital')} />} />
          </Card>
        ) : (
          <>
            {VITAL_KINDS.map(kind => {
              const list = vitals.filter(v => v.kind === kind);
              if (!list.length) return null;
              return <VitalCard key={kind} kind={kind} list={list} width={chartW} span={span} />;
            })}
            <Button label={t('journal.addReading')} icon="plus" variant="secondary" onPress={() => router.push('/vital')} />
          </>
        )}
      </View>
    </TabScreen>
  );
}

function VitalCard({ kind, list, width: w, span: s }: { kind: VitalKind; list: Vital[]; width: number; span: string[] }) {
  const t = useT();
  const c = useTheme();
  const units = usePrefs(st => st.units);
  const latest = list[list.length - 1]!;
  const unit = t(`vitals.units.${unitKey(kind, units)}`);
  const perDay = new Map<string, Vital>();
  for (const v of list) perDay.set(dayKey(v.at), v);
  const values = s.map(d => {
    const v = perDay.get(d);
    return v ? toDisplay(kind, v.value, units) : null;
  });
  const real = values.filter((x): x is number => x !== null);
  const min = kind === 'bp' ? 50 : Math.floor(Math.min(...real) * 0.95);
  const max = kind === 'bp' ? niceMax(list.map(v => v.value), 160) : Math.ceil(Math.max(...real) * 1.05);
  return (
    <Animated.View entering={FadeIn.duration(250)}>
      <Card style={styles.gapMd}>
        <Row>
          <View style={[styles.kindIcon, { backgroundColor: c.accentSoft }]}><Icon name={KIND_ICON[kind]} size={20} color={c.primary} /></View>
          <View style={styles.flex}>
            <Txt variant="headline">{t(`vitals.${kind}`)}</Txt>
            <Txt variant="footnote" tone="text3">{t('journal.latest', { value: `${formatVital(latest, units, t.locale)} ${unit}` })}</Txt>
          </View>
        </Row>
        {w > 0 && list.length > 1 ? (
          <LineChart width={w} values={values} min={min} max={max} color={c.chart[0]} label={`${t(`vitals.${kind}`)}: ${list.length}`} />
        ) : null}
        {kind === 'bp' && w > 0 && list.length > 1 ? (
          <LineChart width={w} height={60} values={s.map(d => perDay.get(d)?.value2 ?? null)} min={min} max={max} color={c.chart[1]} label={t('vitals.diastolic')} dots={false} />
        ) : null}
        <View>
          {[...list].reverse().slice(0, 5).map((v, i) => (
            <Tap
              key={v.id}
              onPress={() => router.push({ pathname: '/vital', params: { id: String(v.id) } })}
              scaleTo={0.99}
              style={[styles.reading, i ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line } : null]}
              accessibilityLabel={`${formatVital(v, units, t.locale)} ${unit}, ${formatDate(v.at, t.locale, { month: 'short', day: 'numeric' })} ${time(t, nowTime(new Date(v.at)))}`}>
              <Txt variant="callout" style={styles.flex}>{formatDate(v.at, t.locale, { weekday: 'short', month: 'short', day: 'numeric' })} · {time(t, nowTime(new Date(v.at)))}</Txt>
              <Txt variant="headline">{formatVital(v, units, t.locale)}</Txt>
              <Txt variant="footnote" tone="text3">{unit}</Txt>
            </Tap>
          ))}
        </View>
      </Card>
    </Animated.View>
  );
}

function ChartCard({ title, value, icon, children }: { title: string; value: string; icon: string; children: React.ReactNode }) {
  const c = useTheme();
  const t = useT();
  return (
    <Animated.View entering={FadeIn.duration(250)}>
      <Card style={styles.gapMd}>
        <Row>
          <View style={[styles.kindIcon, { backgroundColor: c.accentSoft }]}><Icon name={icon} size={20} color={c.primary} /></View>
          <Txt variant="headline" style={styles.flex}>{title}</Txt>
          <Txt variant="subhead" tone="text2">{t('journal.average', { value })}</Txt>
        </Row>
        {children}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gapSm: { gap: space.sm },
  gapMd: { gap: space.md },
  gapLg: { gap: space.lg },
  entry: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, minHeight: 64 },
  kindIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  reading: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.md, minHeight: 48 },
});
