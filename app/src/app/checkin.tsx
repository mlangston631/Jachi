import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useReducedMotion, withSpring } from 'react-native-reanimated';

import { Celebrate, SafetyCard, useToast } from '@/components/feedback';
import { Chip, ChipGroup, Field, Stepper } from '@/components/forms';
import { ModalScreen, Section } from '@/components/Screen';
import { Button, Tap, Txt } from '@/components/ui';
import { EnergyBars, MoodFace } from '@/components/visuals';
import { useT } from '@/i18n';
import { dayKey, formatDay } from '@/lib/dates';
import { checkinDays, checkinOn, deleteCheckin, saveCheckin } from '@/lib/db';
import { hours, SYMPTOM_KEYS } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { classify, RED_FLAG_SYMPTOMS, type Risk } from '@/lib/safety';
import { radius, space, useTheme } from '@/theme';

function Pick({ selected, onPress, label, children }: { selected: boolean; onPress: () => void; label: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const c = useTheme();
  const style = useAnimatedStyle(() => ({ transform: [{ scale: withSpring(selected && !reduce ? 1.08 : 1, { damping: 14, stiffness: 260 }) }] }));
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={label}
      feedback="light"
      scaleTo={0.9}
      style={[styles.pick, selected ? { backgroundColor: c.accentSoft, borderColor: c.primary } : { borderColor: 'transparent' }]}>
      <Animated.View style={style}>{children}</Animated.View>
    </Tap>
  );
}

export default function CheckIn() {
  const t = useT();
  const c = useTheme();
  const params = useLocalSearchParams<{ mood?: string; first?: string; day?: string }>();
  const day = params.day && /^\d{4}-\d{2}-\d{2}$/.test(params.day) ? params.day : dayKey();
  const preset = Number(params.mood);
  const [mood, setMood] = useState<number>(preset >= 1 && preset <= 5 ? preset : 0);
  const [energy, setEnergy] = useState<number>(0);
  const [sleep, setSleep] = useState(7);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [existing, setExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [risk, setRisk] = useState<Risk>(null);
  const [first, setFirst] = useState(false);
  const toast = useToast(s => s.show);
  const moods = t.list('checkin.moods');
  const energies = t.list('checkin.energies');

  useEffect(() => {
    let alive = true;
    void checkinOn(day).then(found => {
      if (!alive || !found) return;
      setExisting(true);
      if (!(preset >= 1 && preset <= 5)) setMood(found.mood);
      setEnergy(found.energy ?? 0);
      if (found.sleep !== null) setSleep(found.sleep);
      setSymptoms(found.symptoms);
      setNote(found.note);
    });
    return () => {
      alive = false;
    };
  }, [day, preset]);

  useEffect(() => {
    const timer = setTimeout(() => setRisk(note.trim() ? classify(note) : null), 350);
    return () => clearTimeout(timer);
  }, [note]);

  const redFlag = symptoms.some(s => (RED_FLAG_SYMPTOMS as readonly string[]).includes(s));
  const toggle = (key: string) => setSymptoms(list => (list.includes(key) ? list.filter(k => k !== key) : [...list, key]));

  const save = async () => {
    if (!mood) {
      setError(t('checkin.needMood'));
      haptic.warning();
      return;
    }
    setSaving(true);
    try {
      const before = await checkinDays();
      await saveCheckin({ day, mood, energy: energy || null, sleep, symptoms, note: note.trim().slice(0, 2000) });
      haptic.success();
      if (before.length === 0 || params.first === '1') {
        setFirst(true);
      } else {
        toast(t('checkin.savedToast'));
        router.back();
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    Alert.alert(t('checkin.deleteEntry'), t('checkin.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteCheckin(day);
          router.back();
        },
      },
    ]);
  };

  const dateLabel = day === dayKey() ? t('common.today') : formatDay(day, t.locale, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={styles.flex}>
      <ModalScreen
        title={`${t('checkin.title')} · ${dateLabel}`}
        footer={
          <View style={styles.gapSm}>
            {error && !mood ? <Txt variant="footnote" tone="danger" center accessibilityLiveRegion="polite">{error}</Txt> : null}
            <Button label={existing ? t('checkin.update') : t('checkin.save')} onPress={() => void save()} loading={saving} size="lg" full testID="save-checkin" />
          </View>
        }>
        <Section title={t('checkin.moodQ')}>
          <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={t('checkin.moodQ')}>
            {[1, 2, 3, 4, 5].map(level => (
              <View key={level} style={styles.col}>
                <Pick selected={mood === level} onPress={() => { setMood(level); setError(''); }} label={t('a11y.moodValue', { n: level, label: moods[level - 1]! })}>
                  <MoodFace level={level} size={46} color={c.mood[level - 1]!} filled={mood === level} />
                </Pick>
                <Txt variant="caption" tone={mood === level ? 'text' : 'text3'} center numberOfLines={2}>{moods[level - 1]}</Txt>
              </View>
            ))}
          </View>
        </Section>

        <Section title={t('checkin.energyQ')}>
          <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={t('checkin.energyQ')}>
            {[1, 2, 3, 4, 5].map(level => (
              <View key={level} style={styles.col}>
                <Pick selected={energy === level} onPress={() => setEnergy(level)} label={t('a11y.energyValue', { n: level, label: energies[level - 1]! })}>
                  <EnergyBars level={level} size={40} color={c.accent} track={c.lineStrong} />
                </Pick>
                <Txt variant="caption" tone={energy === level ? 'text' : 'text3'} center numberOfLines={2}>{energies[level - 1]}</Txt>
              </View>
            ))}
          </View>
        </Section>

        <Section title={t('checkin.sleepQ')}>
          <View style={styles.center}>
            <Stepper label={t('checkin.sleepQ')} value={sleep} onChange={setSleep} min={0} max={16} step={0.5} format={v => hours(t, v)} />
          </View>
        </Section>

        <Section title={t('checkin.symptomsQ')} gap={space.sm}>
          <Txt variant="footnote" tone="text3">{t('checkin.symptomsHint')}</Txt>
          <ChipGroup>
            {SYMPTOM_KEYS.map(key => (
              <Chip key={key} label={t(`symptoms.${key}`)} selected={symptoms.includes(key)} onPress={() => toggle(key)} />
            ))}
          </ChipGroup>
          {redFlag ? (
            <Animated.View entering={FadeIn.duration(200)}>
              <SafetyCard kind="emergency" body={t('checkin.redFlag')} />
            </Animated.View>
          ) : null}
        </Section>

        <Field label={t('checkin.noteQ')} value={note} onChangeText={setNote} placeholder={t('checkin.notePlaceholder')} multiline optional maxLength={2000} />
        {risk ? (
          <Animated.View entering={FadeIn.duration(200)}>
            <SafetyCard kind={risk} body={risk === 'crisis' ? t('site.c_crisis') : t('site.c_emergency')} />
          </Animated.View>
        ) : null}

        {existing ? <Button label={t('checkin.deleteEntry')} variant="quiet" icon="trash" onPress={remove} style={styles.center} /> : null}
      </ModalScreen>
      {first ? <Celebrate title={t('today.firstTitle')} body={t('today.firstBody')} onDone={() => router.back()} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gapSm: { gap: space.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space.xs },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  pick: { width: 60, height: 60, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  center: { alignSelf: 'center' },
});
