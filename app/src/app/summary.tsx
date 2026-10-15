import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { useToast } from '@/components/feedback';
import { Field, Segmented, ToggleRow } from '@/components/forms';
import { Icon } from '@/components/Icon';
import { Leaf } from '@/components/Leaf';
import { Page } from '@/components/Screen';
import { Button, Card, IconButton, Row, Txt } from '@/components/ui';
import { Bars, LineChart, Stat } from '@/components/visuals';
import { useT } from '@/i18n';
import { addDays, dayKey, formatDay } from '@/lib/dates';
import { addQuestion, allMeds, checkinsBetween, deleteQuestion, dosesBetween, questions as loadQuestions, vitalsSince } from '@/lib/db';
import { hours, num, symptomLabel } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useLoader, useToday } from '@/lib/hooks';
import { printHtml, sharePdf } from '@/lib/share';
import { hasContent, summaryHtml, summaryModel } from '@/lib/summary';
import { formatVital, unitKey } from '@/lib/units';
import { usePrefs } from '@/state/prefs';
import { radius, space, type, useTheme } from '@/theme';
import { NO_OUTLINE } from '@/theme/tokens';

export default function Summary() {
  const t = useT();
  const c = useTheme();
  const today = useToday();
  const toast = useToast(s => s.show);
  const days = usePrefs(s => s.summaryDays);
  const name = usePrefs(s => s.summaryName);
  const units = usePrefs(s => s.units);
  const set = usePrefs(s => s.set);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState<'' | 'share' | 'print'>('');
  const [width, setWidth] = useState(0);
  const from = addDays(today, -(days - 1));

  const { data } = useLoader(async () => {
    const [checkins, vitals, meds, doses, qs] = await Promise.all([
      checkinsBetween(from, today),
      vitalsSince(new Date(`${from}T00:00:00`).getTime()),
      allMeds(),
      dosesBetween(from, today),
      loadQuestions(),
    ]);
    return { checkins, vitals, meds, doses, qs };
  }, [from, today]);

  const model = data
    ? summaryModel({ days, name, includeNotes, checkins: data.checkins, vitals: data.vitals, meds: data.meds, doses: data.doses, questions: data.qs.map(q => q.text), units })
    : null;

  const html = () => (model ? summaryHtml(model, t, units, key => symptomLabel(t, key)) : '');

  const share = async () => {
    if (!model) return;
    setBusy('share');
    try {
      await sharePdf(html(), `jachi-health-summary-${dayKey()}.pdf`, t('summary.title'));
      haptic.success();
    } catch {
      toast(t('summary.failed'), 'alert');
    } finally {
      setBusy('');
    }
  };

  const print = async () => {
    if (!model) return;
    setBusy('print');
    try {
      await printHtml(html());
    } catch {
      toast(t('summary.failed'), 'alert');
    } finally {
      setBusy('');
    }
  };

  const add = async () => {
    const text = question.trim().slice(0, 300);
    if (!text) return;
    await addQuestion(text);
    setQuestion('');
    haptic.light();
  };

  const chartW = Math.max(0, width - space.xl * 2);
  const ready = model && hasContent(model);

  return (
    <Page keyboard>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.gapSm}>
        <Txt variant="callout" tone="text2">{t('summary.lead')}</Txt>
      </Animated.View>

      <View style={styles.gapSm}>
        <Txt variant="subhead">{t('summary.range')}</Txt>
        <Segmented
          label={t('summary.range')}
          value={String(days) as '14' | '30' | '90'}
          onChange={v => set({ summaryDays: Number(v) })}
          options={[{ value: '14', label: t('common.days', { n: 14 }) }, { value: '30', label: t('common.days', { n: 30 }) }, { value: '90', label: t('common.days', { n: 90 }) }]}
        />
      </View>

      <Field label={t('summary.name')} value={name} onChangeText={v => set({ summaryName: v.slice(0, 80) })} placeholder={t('summary.namePlaceholder')} optional autoComplete="name" textContentType="name" autoCapitalize="words" maxLength={80} />

      <View style={styles.gapSm}>
        <Txt variant="title3" heading>{t('summary.questions')}</Txt>
        <Animated.View layout={LinearTransition.duration(200)} style={styles.gapSm}>
          {(data?.qs ?? []).map((q, i) => (
            <Animated.View key={q.id} entering={FadeIn.duration(180)} exiting={FadeOut.duration(140)}>
              <Card style={styles.question}>
                <Txt variant="subhead" tone="accent">{i + 1}.</Txt>
                <Txt variant="callout" style={styles.flex}>{q.text}</Txt>
                <IconButton icon="x" label={t('summary.removeQuestion')} onPress={() => void deleteQuestion(q.id)} tone="text2" size={36} />
              </Card>
            </Animated.View>
          ))}
        </Animated.View>
        <View style={[styles.addRow, { backgroundColor: c.surface, borderColor: c.lineStrong }]}>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder={t('summary.questionPlaceholder')}
            placeholderTextColor={c.text3}
            style={[type.body, NO_OUTLINE, styles.flex, styles.addInput, { color: c.text }]}
            accessibilityLabel={t('summary.questionPlaceholder')}
            returnKeyType="done"
            onSubmitEditing={() => void add()}
            maxLength={300}
            maxFontSizeMultiplier={1.8}
          />
          <IconButton icon="plus" label={t('summary.addQuestion')} onPress={() => void add()} filled />
        </View>
      </View>

      <Card padded={false}>
        <ToggleRow label={t('summary.includeNotes')} hint={t('summary.includeNotesHint')} value={includeNotes} onChange={setIncludeNotes} icon="book" />
      </Card>

      <View style={styles.gapSm} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        <Txt variant="title3" heading>{t('summary.preview')}</Txt>
        {model && ready ? (
          <Animated.View entering={FadeIn.duration(300)}>
            <Card style={[styles.paper, { borderColor: c.lineStrong }]}>
              <Row>
                <Leaf size={22} color={c.primary} veins={false} />
                <Txt variant="subhead" tone="primary" style={styles.flex}>Jachi Health</Txt>
                <Txt variant="caption" tone="text3">
                  {formatDay(model.from, t.locale, { month: 'short', day: 'numeric' })} – {formatDay(model.to, t.locale, { month: 'short', day: 'numeric' })}
                </Txt>
              </Row>
              <Txt variant="title2" heading>{t('summary.pdf.title')}{model.name ? ` · ${model.name}` : ''}</Txt>
              <View style={[styles.reported, { backgroundColor: c.warnBg }]}>
                <Txt variant="caption" style={{ color: c.warn }}>{t('summary.disclaimer')}</Txt>
              </View>
              <View style={styles.stats}>
                <Stat label={t('summary.checkins')} value={String(model.checkinCount)} unit={`/${model.days}`} />
                <Stat label={t('summary.moodAvg')} value={model.averages.mood === null ? '–' : num(t, model.averages.mood)} unit="/5" />
                <Stat label={t('summary.sleepAvg')} value={model.averages.sleep === null ? '–' : num(t, model.averages.sleep)} unit="h" />
              </View>
              {chartW > 0 && model.checkinCount > 1 ? (
                <View style={styles.gapSm}>
                  <Txt variant="caption" tone="text3">{t('summary.pdf.moodScale')}</Txt>
                  <LineChart width={chartW} height={70} values={model.mood} min={1} max={5} color={c.chart[0]} label={t('summary.pdf.moodScale')} dots={model.days <= 30} />
                  <Txt variant="caption" tone="text3">{t('summary.pdf.sleepHours')}</Txt>
                  <Bars width={chartW} height={56} values={model.sleep} max={12} color={c.chart[1]} label={t('summary.pdf.sleepHours')} />
                </View>
              ) : null}
              <View style={styles.gapXs}>
                <Txt variant="headline">{t('summary.topSymptoms')}</Txt>
                {model.symptoms.length ? (
                  model.symptoms.slice(0, 4).map(s => (
                    <Row key={s.symptom}>
                      <Txt variant="callout" style={styles.flex}>{symptomLabel(t, s.symptom)}</Txt>
                      <Txt variant="subhead" tone="text2">{t('common.days', { n: s.n })}</Txt>
                    </Row>
                  ))
                ) : (
                  <Txt variant="callout" tone="text3">{t('summary.noSymptoms')}</Txt>
                )}
              </View>
              <View style={styles.gapXs}>
                <Txt variant="headline">{t('summary.meds')}</Txt>
                {model.meds.length ? (
                  model.meds.map(m => (
                    <Row key={m.med.id}>
                      <Icon name="pill" size={16} color={c.accent} />
                      <Txt variant="callout" style={styles.flex} numberOfLines={1}>{m.med.name}{m.med.dose ? ` · ${m.med.dose}` : ''}</Txt>
                      <Txt variant="subhead" tone="text2">{m.due ? `${Math.round((m.taken / m.due) * 100)}%` : '–'}</Txt>
                    </Row>
                  ))
                ) : (
                  <Txt variant="callout" tone="text3">{t('summary.noMeds')}</Txt>
                )}
              </View>
              <View style={styles.gapXs}>
                <Txt variant="headline">{t('summary.vitals')}</Txt>
                {model.vitals.length ? (
                  model.vitals.map(v => (
                    <Row key={v.kind}>
                      <Txt variant="callout" style={styles.flex}>{t(`vitals.${v.kind}`)}</Txt>
                      <Txt variant="subhead" tone="text2">{formatVital(v.latest, units, t.locale)} {t(`vitals.units.${unitKey(v.kind, units)}`)}</Txt>
                    </Row>
                  ))
                ) : (
                  <Txt variant="callout" tone="text3">{t('summary.noVitals')}</Txt>
                )}
              </View>
              {model.averages.energy !== null ? <Txt variant="footnote" tone="text3">{t('summary.energyAvg')}: {num(t, model.averages.energy)}/5 · {t('summary.sleepAvg')}: {model.averages.sleep === null ? '–' : hours(t, model.averages.sleep)}</Txt> : null}
            </Card>
          </Animated.View>
        ) : (
          <Card tone="plain">
            <Txt variant="callout" tone="text2">{t('summary.empty')}</Txt>
          </Card>
        )}
      </View>

      <View style={styles.gapSm}>
        <Button label={busy === 'share' ? t('summary.working') : t('summary.share')} icon="share" onPress={() => void share()} loading={busy === 'share'} disabled={!ready || busy !== ''} size="lg" full />
        <Button label={t('summary.print')} icon="printer" variant="ghost" onPress={() => void print()} loading={busy === 'print'} disabled={!ready || busy !== ''} full />
      </View>
      <Txt variant="footnote" tone="text3" center>{t('summary.disclaimer')}</Txt>
    </Page>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gapXs: { gap: space.xs },
  gapSm: { gap: space.sm },
  question: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm, paddingLeft: space.lg, paddingRight: space.xs },
  addRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: radius.md, paddingLeft: space.lg, paddingRight: 4, gap: space.sm },
  addInput: { paddingVertical: 12 },
  paper: { gap: space.lg, borderWidth: 1 },
  reported: { borderRadius: radius.sm, paddingHorizontal: space.md, paddingVertical: space.sm },
  stats: { flexDirection: 'row', gap: space.md },
});
