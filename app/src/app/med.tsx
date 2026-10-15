import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { useToast } from '@/components/feedback';
import { Field, Segmented, Stepper, TimeStepper, ToggleRow } from '@/components/forms';
import { Icon } from '@/components/Icon';
import { ModalScreen, Section } from '@/components/Screen';
import { Button, Card, IconButton, Row, Txt } from '@/components/ui';
import { useT } from '@/i18n';
import { minutesOf, sortTimes, timeFromMinutes } from '@/lib/dates';
import { deleteMed, medById, saveMed } from '@/lib/db';
import { num, time } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { askPermission } from '@/lib/notify';
import { clean } from '@/lib/text';
import { parseNumber } from '@/lib/units';
import { space, useTheme } from '@/theme';

export default function MedScreen() {
  const t = useT();
  const c = useTheme();
  const toast = useToast(s => s.show);
  const params = useLocalSearchParams<{ id?: string }>();
  const editId = Number(params.id) || 0;
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [mode, setMode] = useState<'scheduled' | 'asNeeded'>('scheduled');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [onHand, setOnHand] = useState('');
  const [perDose, setPerDose] = useState('1');
  const [refillDays, setRefillDays] = useState(7);
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; times?: string; onHand?: string; perDose?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editId) return;
    let alive = true;
    void medById(editId).then(m => {
      if (!alive || !m) return;
      setName(m.name);
      setDose(m.dose);
      setMode(m.times.length ? 'scheduled' : 'asNeeded');
      setTimes(m.times.length ? m.times : ['08:00']);
      setOnHand(m.supply === null ? '' : String(m.supply));
      setPerDose(String(m.perDose));
      setRefillDays(m.refillDays);
      setNotes(m.notes);
      setActive(m.active);
    });
    return () => {
      alive = false;
    };
  }, [editId]);

  const addTime = () => {
    const last = times[times.length - 1];
    let next = last ? timeFromMinutes(minutesOf(last) + 240) : '08:00';
    for (let i = 0; i < 48 && times.includes(next); i++) next = timeFromMinutes(minutesOf(next) + 30);
    setTimes(sortTimes([...times, next]));
    haptic.light();
  };

  const save = async () => {
    const next: typeof errors = {};
    const cleanName = clean(name, 80);
    if (!cleanName) next.name = t('medEdit.nameRequired');
    const scheduled = mode === 'scheduled' ? sortTimes(times) : [];
    if (mode === 'scheduled' && scheduled.length === 0) next.times = t('medEdit.needTime');
    const supply = onHand.trim() ? parseNumber(onHand) : null;
    if (onHand.trim() && (supply === null || supply > 9999)) next.onHand = t('medEdit.invalidNumber', { min: 0, max: 9999 });
    const per = parseNumber(perDose || '1');
    if (per === null || per <= 0 || per > 20) next.perDose = t('medEdit.invalidNumber', { min: num(t, 0.25, 2), max: 20 });
    setErrors(next);
    if (Object.keys(next).length) {
      haptic.warning();
      return;
    }
    setSaving(true);
    try {
      await saveMed({
        id: editId || undefined,
        name: cleanName,
        dose: clean(dose, 60),
        times: scheduled,
        supply,
        perDose: per ?? 1,
        refillDays,
        notes: notes.trim().slice(0, 300),
        active,
      });
      if (scheduled.length && active) await askPermission();
      haptic.success();
      toast(t('common.saved'));
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    Alert.alert(t('medEdit.remove'), t('medEdit.removeConfirm', { name }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => { await deleteMed(editId); router.back(); } },
    ]);
  };

  return (
    <ModalScreen
      title={editId ? t('medEdit.editTitle') : t('medEdit.newTitle')}
      footer={<Button label={t('medEdit.save')} onPress={() => void save()} loading={saving} size="lg" full />}>
      <Field label={t('medEdit.name')} value={name} onChangeText={setName} placeholder={t('medEdit.namePlaceholder')} error={errors.name} autoCapitalize="words" maxLength={80} />
      <Field label={t('medEdit.dose')} value={dose} onChangeText={setDose} placeholder={t('medEdit.dosePlaceholder')} optional maxLength={60} />

      <Section title={t('medEdit.schedule')} gap={space.sm}>
        <Segmented label={t('medEdit.schedule')} value={mode} onChange={setMode} options={[{ value: 'scheduled', label: t('medEdit.scheduled') }, { value: 'asNeeded', label: t('medEdit.asNeeded') }]} />
        {mode === 'asNeeded' ? (
          <Txt variant="footnote" tone="text3">{t('medEdit.asNeededHint')}</Txt>
        ) : (
          <Animated.View layout={LinearTransition.duration(200)} style={styles.gapSm}>
            {times.map((tm, i) => (
              <Animated.View key={`${i}-${tm}`} entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
                <Row gap={space.sm}>
                  <View style={styles.flex}>
                    <TimeStepper label={`${t('medEdit.timeLabel')} ${i + 1}`} value={tm} onChange={v => setTimes(list => list.map((x, j) => (j === i ? v : x)))} />
                  </View>
                  {times.length > 1 ? (
                    <IconButton icon="trash" label={t('medEdit.removeTime', { time: time(t, tm) })} onPress={() => setTimes(list => list.filter((_, j) => j !== i))} tone="text2" />
                  ) : null}
                </Row>
              </Animated.View>
            ))}
            {errors.times ? <Txt variant="footnote" tone="danger">{errors.times}</Txt> : null}
            {times.length < 8 ? <Button label={t('medEdit.addTime')} icon="plus" variant="secondary" size="sm" onPress={addTime} style={styles.selfStart} /> : null}
          </Animated.View>
        )}
      </Section>

      <Section title={t('medEdit.supply')} gap={space.sm}>
        <Txt variant="footnote" tone="text3">{t('medEdit.supplyHint')}</Txt>
        <View style={styles.pair}>
          <View style={styles.flex}>
            <Field label={t('medEdit.onHand')} value={onHand} onChangeText={setOnHand} keyboardType="decimal-pad" placeholder="30" error={errors.onHand} maxLength={6} />
          </View>
          <View style={styles.flex}>
            <Field label={t('medEdit.perDose')} value={perDose} onChangeText={setPerDose} keyboardType="decimal-pad" placeholder="1" error={errors.perDose} maxLength={5} />
          </View>
        </View>
        {onHand.trim() ? (
          <Card tone="plain" style={styles.gapSm}>
            <Txt variant="subhead">{t('medEdit.refillAt')}</Txt>
            <Stepper label={t('medEdit.refillAt')} value={refillDays} onChange={setRefillDays} min={1} max={30} step={1} format={v => (v === 1 ? t('common.day') : t('common.days', { n: v }))} />
          </Card>
        ) : null}
      </Section>

      <Field label={t('medEdit.notes')} value={notes} onChangeText={setNotes} placeholder={t('medEdit.notesPlaceholder')} optional multiline maxLength={300} />

      {editId ? (
        <Card padded={false}>
          <ToggleRow label={t('medEdit.active')} value={active} onChange={setActive} icon="bell" />
        </Card>
      ) : null}

      <Card tone="plain" style={styles.note}>
        <Icon name="info" size={18} color={c.text2} />
        <Txt variant="footnote" tone="text2" style={styles.flex}>{t('meds.interactions')}</Txt>
      </Card>

      {editId ? <Button label={t('medEdit.remove')} variant="quiet" icon="trash" onPress={remove} style={styles.center} /> : null}
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gapSm: { gap: space.sm },
  pair: { flexDirection: 'row', gap: space.md },
  selfStart: { alignSelf: 'flex-start' },
  center: { alignSelf: 'center' },
  note: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
});
