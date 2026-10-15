import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { Celebrate, SafetyCard, StatusCard, useToast } from '@/components/feedback';
import { Icon } from '@/components/Icon';
import { TabScreen } from '@/components/Screen';
import { Button, Card, IconButton, Row, Tap, Txt } from '@/components/ui';
import { EnergyBars, MoodFace, Ring, WeekStrip } from '@/components/visuals';
import { useT } from '@/i18n';
import { addDays, formatDay, nowTime, partOfDay } from '@/lib/dates';
import { allMeds, checkinDays, checkinsBetween, dosesBetween, logDose, undoDose, vitalsSince } from '@/lib/db';
import { hours, insightView, time, weekdayLetters, weekdayNames } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useLoader, useToday } from '@/lib/hooks';
import { insights, lowMoodStretch } from '@/lib/insights';
import { canLock, lockMethod } from '@/lib/lock';
import { slotsForDay, type Slot } from '@/lib/schedule';
import { adaptiveGoal, newMilestone, streaks, weekProgress } from '@/lib/streak';
import { usePrefs } from '@/state/prefs';
import { radius, space, useTheme } from '@/theme';

export default function Today() {
  const t = useT();
  const c = useTheme();
  const today = useToday();
  const name = usePrefs(s => s.name);
  const lockOn = usePrefs(s => s.lock);
  const reminderOn = usePrefs(s => s.checkinReminder);
  const dismissed = usePrefs(s => s.dismissed);
  const seen = usePrefs(s => s.milestonesSeen);
  const prefs = usePrefs(s => s.set);
  const dismiss = usePrefs(s => s.dismiss);
  const toast = useToast(s => s.show);
  const [lockInfo, setLockInfo] = useState<{ can: boolean; method: string } | null>(null);
  const [celebrate, setCelebrate] = useState<number | null>(null);

  const { data } = useLoader(async () => {
    const [days, recent, meds, doses, vitals] = await Promise.all([
      checkinDays(),
      checkinsBetween(addDays(today, -29), today),
      allMeds(),
      dosesBetween(addDays(today, -13), today),
      vitalsSince(Date.now() - 31 * 86_400_000),
    ]);
    return { days, recent, meds, doses, vitals };
  }, [today]);

  useEffect(() => {
    let alive = true;
    void Promise.all([canLock(), lockMethod(t)]).then(([can, method]) => alive && setLockInfo({ can, method }));
    return () => {
      alive = false;
    };
  }, [t]);

  const s = data ? streaks(data.days, today) : { current: 0, best: 0, todayDone: false };
  const week = data ? weekProgress(data.days, today) : [];
  const goal = data ? adaptiveGoal(data.days, today) : 5;
  const doneThisWeek = week.filter(d => d.done).length;
  const todayCheckin = data?.recent.find(r => r.day === today) ?? null;
  const slots = data ? slotsForDay(data.meds, data.doses, today) : [];
  const found = data ? insights({ checkins: data.recent, vitals: data.vitals, meds: data.meds, doses: data.doses }) : [];
  const lowMood = data ? lowMoodStretch(data.recent, today) : false;

  useEffect(() => {
    if (!data) return;
    const m = newMilestone(s.current, seen);
    if (m !== null) setCelebrate(m);
    // Celebrate once per milestone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.current, data !== undefined]);

  const greeting = t(`today.${partOfDay()}`);
  const title = name ? t('today.greetingName', { greeting, name }) : greeting;
  const dateLine = formatDay(today, t.locale, { weekday: 'long', month: 'long', day: 'numeric' });
  const labels = weekdayLetters(t, week.map(d => d.day));
  const names = weekdayNames(t, week.map(d => d.day));

  const log = async (slot: Slot, status: 'taken' | 'skipped') => {
    await logDose(slot.med, slot.day, slot.time, status);
    if (status === 'taken') {
      haptic.success();
      toast(t('meds.doseTaken'));
    }
  };

  return (
    <View style={styles.flex}>
      <TabScreen
        title={title}
        eyebrow={dateLine}
        right={<IconButton icon="sliders" label={t('today.settings')} onPress={() => router.push('/settings')} filled />}>
        {lowMood ? <SafetyCard kind="crisis" title={t('today.supportTitle')} body={t('today.supportBody')} /> : null}

        {todayCheckin ? (
          <Animated.View entering={FadeInDown.duration(380)} layout={LinearTransition}>
            <Card onPress={() => router.push('/checkin')} accessibilityLabel={t('today.editCheckin')} style={styles.gapMd}>
              <Row>
                <View style={[styles.checkBadge, { backgroundColor: c.primary }]}>
                  <Icon name="check" size={16} color={c.onPrimary} strokeWidth={2.6} />
                </View>
                <Txt variant="headline" style={styles.flex}>{t('today.checkedIn')}</Txt>
                <Icon name="edit" size={18} color={c.text3} />
              </Row>
              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <MoodFace level={todayCheckin.mood} size={36} color={c.mood[todayCheckin.mood - 1]!} filled />
                  <Txt variant="caption" tone="text3">{t('today.mood')}</Txt>
                  <Txt variant="subhead">{t.list('checkin.moods')[todayCheckin.mood - 1]}</Txt>
                </View>
                {todayCheckin.energy ? (
                  <View style={styles.metric}>
                    <EnergyBars level={todayCheckin.energy} size={36} color={c.accent} track={c.line} />
                    <Txt variant="caption" tone="text3">{t('today.energy')}</Txt>
                    <Txt variant="subhead">{t.list('checkin.energies')[todayCheckin.energy - 1]}</Txt>
                  </View>
                ) : null}
                {todayCheckin.sleep !== null ? (
                  <View style={styles.metric}>
                    <View style={[styles.sleepIcon, { backgroundColor: c.accentSoft }]}><Icon name="moon" size={20} color={c.primary} /></View>
                    <Txt variant="caption" tone="text3">{t('today.sleep')}</Txt>
                    <Txt variant="subhead">{hours(t, todayCheckin.sleep)}</Txt>
                  </View>
                ) : null}
              </View>
            </Card>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(380)}>
            <Card tone="hero" style={styles.gapLg}>
              <View style={styles.gapXs}>
                <Txt variant="title" tone="onHero" heading>{t('today.checkinTitle')}</Txt>
                <Txt variant="callout" tone="onHero2">{t('today.checkinBody')}</Txt>
              </View>
              <View style={styles.faces} accessibilityRole="radiogroup" accessibilityLabel={t('checkin.moodQ')}>
                {[1, 2, 3, 4, 5].map(level => (
                  <Tap
                    key={level}
                    onPress={() => router.push({ pathname: '/checkin', params: { mood: String(level) } })}
                    accessibilityLabel={t('a11y.moodValue', { n: level, label: t.list('checkin.moods')[level - 1]! })}
                    scaleTo={0.88}
                    feedback="light"
                    style={styles.face}>
                    <MoodFace level={level} size={44} color="#FFFFFF" />
                  </Tap>
                ))}
              </View>
              <Button label={t('today.checkinCta')} variant="light" iconRight="arrow" onPress={() => router.push('/checkin')} style={styles.selfStart} />
            </Card>
          </Animated.View>
        )}

        <Card style={styles.gapLg}>
          <Row gap={space.lg}>
            <Ring
              progress={goal ? doneThisWeek / goal : 0}
              size={88}
              label={t('today.weekLabel')}
              value={t('today.weekGoal', { done: doneThisWeek, goal })}>
              <Txt variant="numberSmall">{doneThisWeek}</Txt>
              <Txt variant="caption" tone="text3">/{goal}</Txt>
            </Ring>
            <View style={[styles.flex, styles.gapXs]}>
              <Row gap={space.xs}>
                <Icon name="sprout" size={20} color={c.accent} />
                <Txt variant="title3" heading>
                  {s.current === 0 ? t('today.streakNone') : s.current === 1 ? t('today.streakOne') : t('today.streak', { n: s.current })}
                </Txt>
              </Row>
              <Txt variant="footnote" tone="text2">
                {doneThisWeek >= goal ? t('today.weekGoalMet') : t('today.weekGoal', { done: doneThisWeek, goal })}
              </Txt>
              {s.current > 0 && !s.todayDone ? <Txt variant="footnote" tone="accent">{t('today.streakHint')}</Txt> : null}
              {s.best > 1 ? <Txt variant="caption" tone="text3">{t('today.streakBest', { n: s.best })}</Txt> : null}
            </View>
          </Row>
          <WeekStrip
            days={week}
            labels={labels}
            a11y={(d, i) => (d.done ? t('a11y.dayDone', { day: names[i]! }) : t('a11y.dayMissed', { day: names[i]! }))}
          />
        </Card>

        <View style={styles.gapMd}>
          <Row>
            <Txt variant="title3" heading style={styles.flex}>{t('today.medsTitle')}</Txt>
            {slots.length ? <Button label={t('tabs.meds')} variant="quiet" size="sm" iconRight="chevron" onPress={() => router.push('/meds')} /> : null}
          </Row>
          {slots.length ? (
            <Card padded={false}>
              {slots.map((slot, i) => (
                <DoseRow key={`${slot.med.id}-${slot.time}`} slot={slot} first={i === 0} onLog={log} />
              ))}
              {slots.every(sl => sl.state === 'taken' || sl.state === 'skipped') ? (
                <View style={[styles.allDone, { backgroundColor: c.accentSoft }]}>
                  <Icon name="check-circle" size={18} color={c.primary} />
                  <Txt variant="subhead" tone="primary">{t('today.medsAllDone')}</Txt>
                </View>
              ) : null}
            </Card>
          ) : (
            <Card tone="plain" style={styles.gapSm}>
              <Txt variant="headline">{t('today.medsEmptyTitle')}</Txt>
              <Txt variant="callout" tone="text2">{t('today.medsEmptyBody')}</Txt>
              <Button label={t('today.medsEmptyCta')} variant="secondary" icon="plus" size="sm" onPress={() => router.push('/med')} style={styles.selfStart} />
            </Card>
          )}
        </View>

        <View style={styles.gapMd}>
          <Txt variant="title3" heading>{t('today.insightsTitle')}</Txt>
          {found.length ? (
            <>
              {found.slice(0, 4).map((ins, i) => {
                const v = insightView(t, ins);
                return (
                  <Animated.View key={`${ins.kind}-${i}`} entering={FadeInDown.delay(i * 70).duration(320)}>
                    <Card style={styles.insight}>
                      <View style={[styles.insightIcon, { backgroundColor: c.accentSoft }]}><Icon name={v.icon} size={20} color={c.primary} /></View>
                      <Txt variant="callout" style={styles.flex}>{v.text}</Txt>
                    </Card>
                  </Animated.View>
                );
              })}
              <Txt variant="caption" tone="text3">{t('insight.disclaimer')}</Txt>
            </>
          ) : (
            <Card tone="plain" style={styles.insight}>
              <Icon name="sparkles" size={22} color={c.accent} />
              <Txt variant="callout" tone="text2" style={styles.flex}>{t('today.insightsEmpty')}</Txt>
            </Card>
          )}
        </View>

        <Card tone="accent" onPress={() => router.push('/summary')} style={styles.summary} accessibilityLabel={`${t('today.summaryTitle')}. ${t('today.summaryBody')}`}>
          <View style={[styles.summaryIcon, { backgroundColor: c.surface }]}><Icon name="file" size={24} color={c.primary} /></View>
          <View style={[styles.flex, styles.gapXs]}>
            <Txt variant="headline">{t('today.summaryTitle')}</Txt>
            <Txt variant="footnote" tone="text2">{t('today.summaryBody')}</Txt>
          </View>
          <Icon name="chevron" size={20} color={c.primary} />
        </Card>

        <StatusCard />

        {!reminderOn && !dismissed.includes('reminder') ? (
          <Card style={styles.gapSm}>
            <Row>
              <Icon name="bell" size={20} color={c.accent} />
              <Txt variant="headline" style={styles.flex}>{t('today.reminderCard')}</Txt>
              <IconButton icon="x" label={t('common.close')} onPress={() => dismiss('reminder')} tone="text2" size={36} />
            </Row>
            <Txt variant="callout" tone="text2">{t('today.reminderBody')}</Txt>
            <Button label={t('today.reminderCta')} variant="secondary" size="sm" onPress={() => router.push('/settings')} style={styles.selfStart} />
          </Card>
        ) : null}

        {lockInfo?.can && !lockOn && !dismissed.includes('lock') ? (
          <Card style={styles.gapSm}>
            <Row>
              <Icon name="lock" size={20} color={c.accent} />
              <Txt variant="headline" style={styles.flex}>{t('today.lockTitle')}</Txt>
              <IconButton icon="x" label={t('common.close')} onPress={() => dismiss('lock')} tone="text2" size={36} />
            </Row>
            <Txt variant="callout" tone="text2">{t('today.lockBody', { method: lockInfo.method })}</Txt>
            <Button label={t('today.lockCta')} variant="secondary" size="sm" onPress={() => router.push('/settings')} style={styles.selfStart} />
          </Card>
        ) : null}
      </TabScreen>

      {celebrate !== null ? (
        <Celebrate
          title={t('today.milestoneTitle', { n: celebrate })}
          body={t('today.milestoneBody', { n: celebrate })}
          onDone={() => {
            prefs({ milestonesSeen: [...seen, celebrate] });
            setCelebrate(null);
          }}
        />
      ) : null}
    </View>
  );
}

function DoseRow({ slot, first, onLog }: { slot: Slot; first: boolean; onLog: (s: Slot, status: 'taken' | 'skipped') => void }) {
  const t = useT();
  const c = useTheme();
  const done = slot.state === 'taken' || slot.state === 'skipped';
  return (
    <View style={[styles.dose, first ? null : { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line }]}>
      <View style={styles.doseTime}>
        <Txt variant="subhead" tone={slot.state === 'due' ? 'primary' : 'text2'}>{time(t, slot.time)}</Txt>
      </View>
      <View style={styles.flex}>
        <Txt variant="headline" numberOfLines={1}>{slot.med.name}</Txt>
        {slot.med.dose ? <Txt variant="footnote" tone="text3" numberOfLines={1}>{slot.med.dose}</Txt> : null}
      </View>
      {done ? (
        <Tap
          onPress={() => void undoDose(slot.med, slot.day, slot.time)}
          accessibilityLabel={`${slot.state === 'taken' ? t('meds.taken', { time: time(t, slot.time) }) : t('meds.skipped')}. ${t('meds.undoLog')}`}
          style={[styles.doseDone, { backgroundColor: slot.state === 'taken' ? c.accentSoft : c.surface2 }]}>
          <Icon name={slot.state === 'taken' ? 'check' : 'skip'} size={16} color={slot.state === 'taken' ? c.primary : c.text3} strokeWidth={2.4} />
          <Txt variant="caption" tone={slot.state === 'taken' ? 'primary' : 'text3'}>
            {slot.state === 'taken' ? t('meds.taken', { time: time(t, slot.dose ? nowTime(new Date(slot.dose.at)) : slot.time) }) : t('meds.skipped')}
          </Txt>
        </Tap>
      ) : (
        <Row gap={space.xs}>
          <Button label={t('meds.skip')} variant="quiet" size="sm" onPress={() => onLog(slot, 'skipped')} accessibilityLabel={`${t('meds.skip')} ${slot.med.name}`} />
          <Button label={t('meds.take')} variant={slot.state === 'due' ? 'primary' : 'secondary'} size="sm" onPress={() => onLog(slot, 'taken')} accessibilityLabel={`${t('meds.take')} ${slot.med.name}`} />
        </Row>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gapXs: { gap: space.xs },
  gapSm: { gap: space.sm },
  gapMd: { gap: space.md },
  gapLg: { gap: space.lg },
  selfStart: { alignSelf: 'flex-start' },
  checkBadge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  metrics: { flexDirection: 'row', gap: space.md },
  metric: { flex: 1, alignItems: 'center', gap: 4 },
  sleepIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  faces: { flexDirection: 'row', justifyContent: 'space-between' },
  face: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  allDone: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md },
  insight: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  insightIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  summaryIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  dose: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, minHeight: 64 },
  doseTime: { width: 72 },
  doseDone: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.pill },
});
