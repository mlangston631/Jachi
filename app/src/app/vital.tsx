import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useToast } from '@/components/feedback';
import { Chip, ChipGroup, Field, Segmented, TimeStepper } from '@/components/forms';
import { Icon } from '@/components/Icon';
import { ModalScreen, Section } from '@/components/Screen';
import { Button, Card, Txt } from '@/components/ui';
import { useT } from '@/i18n';
import { addDays, at, dayKey, nowTime } from '@/lib/dates';
import { deleteVital, saveVital, vitalById } from '@/lib/db';
import { num } from '@/lib/format';
import { call } from '@/lib/links';
import { haptic } from '@/lib/haptics';
import {
  decimals, fromDisplay, inputRange, isUnusual, parseNumber, round, toDisplay, unitKey, VITAL_KINDS, type VitalKind,
} from '@/lib/units';
import { usePrefs } from '@/state/prefs';
import { space, useTheme } from '@/theme';

const ICON: Record<VitalKind, string> = { bp: 'gauge', hr: 'heart', weight: 'scale', temp: 'thermo', glucose: 'drop' };

export default function VitalScreen() {
  const t = useT();
  const c = useTheme();
  const units = usePrefs(s => s.units);
  const toast = useToast(s => s.show);
  const params = useLocalSearchParams<{ id?: string; kind?: string }>();
  const editId = Number(params.id) || 0;
  const [kind, setKind] = useState<VitalKind>((VITAL_KINDS as string[]).includes(params.kind ?? '') ? (params.kind as VitalKind) : 'bp');
  const [value, setValue] = useState('');
  const [value2, setValue2] = useState('');
  const [note, setNote] = useState('');
  const [when, setWhen] = useState<'now' | 'earlier'>('now');
  const [day, setDay] = useState<'today' | 'yesterday'>('today');
  const [clock, setClock] = useState(nowTime());
  const [errors, setErrors] = useState<{ v?: string; v2?: string }>({});
  const [saving, setSaving] = useState(false);
  const [warn, setWarn] = useState(false);

  useEffect(() => {
    if (!editId) return;
    let alive = true;
    void vitalById(editId).then(v => {
      if (!alive || !v) return;
      setKind(v.kind);
      const places = decimals(v.kind, units);
      setValue(v.kind === 'bp' ? String(Math.round(v.value)) : String(round(toDisplay(v.kind, v.value, units), places)));
      setValue2(v.value2 !== null ? String(Math.round(v.value2)) : '');
      setNote(v.note);
      setWhen('earlier');
      setDay(dayKey(v.at) === dayKey() ? 'today' : 'yesterday');
      setClock(nowTime(new Date(v.at)));
    });
    return () => {
      alive = false;
    };
  }, [editId, units]);

  const range = inputRange(kind, units);
  const unit = t(`vitals.units.${unitKey(kind, units)}`);

  const save = async () => {
    const v = parseNumber(value);
    const v2 = kind === 'bp' ? parseNumber(value2) : null;
    const next: { v?: string; v2?: string } = {};
    if (v === null || v < range.min || v > range.max) next.v = t('vitals.invalid', { min: num(t, range.min), max: num(t, range.max) });
    if (kind === 'bp' && (v2 === null || v2 < (range.min2 ?? 0) || v2 > (range.max2 ?? 0))) next.v2 = t('vitals.invalid', { min: range.min2 ?? 0, max: range.max2 ?? 0 });
    setErrors(next);
    if (next.v || next.v2 || v === null) {
      haptic.warning();
      return;
    }
    const canonical = kind === 'bp' ? v : fromDisplay(kind, v, units);
    const reading = { kind, value: round(canonical, 3), value2: kind === 'bp' ? v2 : null };
    const moment = when === 'now' && !editId ? Date.now() : at(day === 'today' ? dayKey() : addDays(dayKey(), -1), clock).getTime();
    setSaving(true);
    try {
      await saveVital({ id: editId || undefined, at: Math.min(moment, Date.now()), ...reading, note: note.trim().slice(0, 300) });
      haptic.success();
      if (isUnusual(reading) && !warn) {
        setWarn(true);
        return;
      }
      toast(t('common.saved'));
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    Alert.alert(t('vitals.deleteEntry'), t('vitals.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => { await deleteVital(editId); router.back(); } },
    ]);
  };

  return (
    <ModalScreen
      title={editId ? t('vitals.editTitle') : t('vitals.title')}
      footer={
        warn ? (
          <Button label={t('common.done')} onPress={() => router.back()} size="lg" full />
        ) : (
          <Button label={t('vitals.save')} onPress={() => void save()} loading={saving} size="lg" full />
        )
      }>
      {warn ? (
        <Animated.View entering={FadeIn.duration(220)}>
          <Card tone="warn" style={styles.gapMd}>
            <Icon name="alert" size={24} color={c.warn} strokeWidth={2} />
            <Txt variant="body">{t('vitals.outOfRange')}</Txt>
            <Button label={t('site.c_call_911')} icon="phone" variant="danger" size="sm" onPress={() => call('911')} style={styles.selfStart} />
          </Card>
        </Animated.View>
      ) : (
        <>
          <Section title={t('vitals.kind')}>
            <ChipGroup>
              {VITAL_KINDS.map(k => (
                <Chip key={k} label={t(`vitals.${k}`)} icon={ICON[k]} selected={kind === k} onPress={() => { setKind(k); setErrors({}); setValue(''); setValue2(''); }} />
              ))}
            </ChipGroup>
          </Section>
          {kind === 'bp' ? (
            <View style={styles.pair}>
              <View style={styles.flex}>
                <Field label={t('vitals.systolic')} value={value} onChangeText={setValue} keyboardType="number-pad" placeholder="120" error={errors.v} suffix={unit} maxLength={3} />
              </View>
              <View style={styles.flex}>
                <Field label={t('vitals.diastolic')} value={value2} onChangeText={setValue2} keyboardType="number-pad" placeholder="80" error={errors.v2} suffix={unit} maxLength={3} />
              </View>
            </View>
          ) : (
            <Field
              label={t(`vitals.${kind}`)}
              value={value}
              onChangeText={setValue}
              keyboardType={decimals(kind, units) ? 'decimal-pad' : 'number-pad'}
              placeholder={kind === 'hr' ? '72' : kind === 'weight' ? (units === 'us' ? '180' : '82') : kind === 'temp' ? (units === 'us' ? '98.6' : '37.0') : units === 'us' ? '100' : '5.6'}
              error={errors.v}
              suffix={unit}
              maxLength={6}
            />
          )}
          <Section title={t('vitals.when')} gap={space.sm}>
            <Segmented label={t('vitals.when')} value={when} onChange={setWhen} options={[{ value: 'now', label: t('vitals.now') }, { value: 'earlier', label: t('vitals.earlier') }]} />
            {when === 'earlier' ? (
              <Animated.View entering={FadeIn.duration(180)} style={styles.gapSm}>
                <Segmented label={t('vitals.when')} value={day} onChange={setDay} options={[{ value: 'today', label: t('common.today') }, { value: 'yesterday', label: t('common.yesterday') }]} />
                <TimeStepper label={t('vitals.when')} value={clock} onChange={setClock} />
              </Animated.View>
            ) : null}
          </Section>
          <Field label={t('vitals.note')} value={note} onChangeText={setNote} placeholder={t('vitals.notePlaceholder')} optional maxLength={300} />
          {editId ? <Button label={t('vitals.deleteEntry')} variant="quiet" icon="trash" onPress={remove} style={styles.center} /> : null}
        </>
      )}
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gapSm: { gap: space.sm },
  gapMd: { gap: space.md },
  pair: { flexDirection: 'row', gap: space.md },
  selfStart: { alignSelf: 'flex-start' },
  center: { alignSelf: 'center' },
});
