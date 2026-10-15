import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import { SafetyCard } from '@/components/feedback';
import { Choices } from '@/components/forms';
import { Icon } from '@/components/Icon';
import { ModalScreen } from '@/components/Screen';
import { Button, Card, Row, Tag, Tap, Txt } from '@/components/ui';
import { useT } from '@/i18n';
import { CONTENT, LINKS, serviceByKey } from '@/lib/content';
import { outcome, QUESTION, type Flag, type Need } from '@/lib/finder';
import { call, openPage } from '@/lib/links';
import { radius, space, useTheme } from '@/theme';

export default function Finder() {
  const t = useT();
  const c = useTheme();
  const [need, setNeed] = useState<Need | ''>('');
  const [flag, setFlag] = useState<Flag>('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState('');

  const next = () => {
    if (step === 1) {
      if (!need) return setError(t('site.f_need'));
      setError('');
      setStep(need === 'weight' ? 3 : 2);
      return;
    }
    if (step === 2) {
      if (!flag) return setError(t('site.choose_answer'));
      setError('');
      setStep(3);
    }
  };
  const restart = () => {
    setNeed('');
    setFlag('');
    setError('');
    setStep(1);
  };

  const result = need && step === 3 ? outcome(need, flag) : null;
  const question = need && need !== 'weight' ? QUESTION[need] : null;

  const footer =
    step < 3 ? (
      <View style={styles.footer}>
        {error ? <Txt variant="footnote" tone="danger" center accessibilityLiveRegion="polite">{error}</Txt> : null}
        <Row gap={space.sm}>
          {step === 2 ? <Button label={t('common.back')} variant="ghost" icon="arrow-left" onPress={() => { setStep(1); setFlag(''); }} /> : null}
          <Button label={step === 2 || need === 'weight' ? t('site.f_see_options') : t('site.continue')} iconRight="arrow" onPress={next} style={styles.flex} />
        </Row>
      </View>
    ) : (
      <Button label={t('finder.restart')} variant="ghost" icon="refresh" onPress={restart} full />
    );

  return (
    <ModalScreen title={t('finder.title')} footer={footer}>
      <Txt variant="caption" tone="text3">{step < 3 ? t('site.f_step', { n: step }) : t('site.f_your_options')}</Txt>
      <Animated.View key={step} entering={FadeInRight.duration(260)} exiting={FadeOutLeft.duration(160)} style={styles.gapLg}>
        {step === 1 ? (
          <>
            <Txt variant="title" heading>{t('finder.needQ')}</Txt>
            <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel={t('finder.needQ')}>
              {CONTENT.finder.map(f => {
                const on = need === f.key;
                return (
                  <Tap
                    key={f.key}
                    onPress={() => { setNeed(f.key as Need); setFlag(''); setError(''); }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on, checked: on }}
                    accessibilityLabel={`${f[t.lang].title}. ${f[t.lang].sub}`}
                    style={[styles.need, { backgroundColor: on ? c.accentSoft : c.surface, borderColor: on ? c.primary : c.line }]}>
                    <View style={[styles.needIcon, { backgroundColor: on ? c.primary : c.accentSoft }]}>
                      <Icon name={f.icon} size={20} color={on ? c.onPrimary : c.primary} />
                    </View>
                    <Txt variant="headline">{f[t.lang].title}</Txt>
                    <Txt variant="caption" tone="text3">{f[t.lang].sub}</Txt>
                  </Tap>
                );
              })}
            </View>
          </>
        ) : null}

        {step === 2 && question ? (
          <>
            <Txt variant="title" heading>{t('finder.safetyQ')}</Txt>
            <Txt variant="body">{t(question.q)}</Txt>
            {need === 'urgent' ? (
              <Card tone="plain" style={styles.gapXs}>
                {t.list('finder.urgentFlags').map(flagText => (
                  <Row key={flagText} gap={space.sm}>
                    <Icon name="alert" size={16} color={c.danger} />
                    <Txt variant="callout" style={styles.flex}>{flagText}</Txt>
                  </Row>
                ))}
              </Card>
            ) : null}
            <Choices
              label={t(question.q)}
              value={flag}
              onChange={v => { setFlag(v); setError(''); }}
              options={[
                { value: 'yes' as const, label: t('common.yes') },
                { value: 'no' as const, label: t('common.no') },
                ...(question.unsure ? [{ value: 'unsure' as const, label: t('common.notSure') }] : []),
              ]}
            />
          </>
        ) : null}

        {result ? (
          result.kind === 'crisis' ? (
            <SafetyCard kind="crisis" title={t(result.title)} body={t(result.body)} />
          ) : (
            <Card tone={result.kind === 'emergency' || result.kind === 'inperson' ? 'danger' : result.kind === 'caution' ? 'warn' : 'surface'} style={styles.gapMd}>
              <View style={[styles.resultIcon, { backgroundColor: result.kind === 'likely' ? c.accentSoft : 'rgba(255,255,255,0.5)' }]}>
                <Icon name={result.icon} size={24} color={result.kind === 'likely' ? c.primary : result.kind === 'caution' ? c.warn : c.danger} />
              </View>
              <Txt variant="title2" heading>{t(result.title)}</Txt>
              {result.chips || result.chipKeys ? (
                <Row gap={space.sm} style={styles.wrap}>
                  {(result.chips ?? []).flatMap(k => {
                    const s = serviceByKey(k);
                    return s ? [<Tag key={`${k}-n`} label={s[t.lang].name} />, <Tag key={`${k}-t`} label={s[t.lang].tag} tone="neutral" />] : [];
                  })}
                  {(result.chipKeys ?? []).map(k => <Tag key={k} label={t(k)} />)}
                </Row>
              ) : null}
              <Txt variant="body">{t(result.body)}{result.extra ? t(result.extra) : ''}</Txt>
              {result.launchNote ? (
                <View style={[styles.note, { backgroundColor: c.warnBg }]}>
                  <Icon name="clock" size={18} color={c.warn} />
                  <Txt variant="footnote" style={[styles.flex, { color: c.warn }]}>{t('status.launchNote')}</Txt>
                </View>
              ) : null}
              {result.cta?.type === 'call911' ? <Button label={t('site.f_call_911')} icon="phone" variant="danger" onPress={() => call('911')} /> : null}
              {result.cta?.type === 'join' ? (
                <Button label={t('status.join')} iconRight="arrow" onPress={() => router.replace({ pathname: '/waitlist', params: { interest: result.cta?.type === 'join' ? result.cta.interest : '' } })} />
              ) : null}
              {result.cta?.type === 'services' ? <Button label={t('site.f_see_services')} variant="ghost" onPress={() => router.back()} /> : null}
              {result.cta?.type === 'weight' ? <Button label={t('site.f_check_eligibility')} iconRight="external" onPress={() => void openPage(LINKS.weightCheck)} /> : null}
            </Card>
          )
        ) : null}
      </Animated.View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flexWrap: 'wrap' },
  gapXs: { gap: space.xs },
  gapMd: { gap: space.md },
  gapLg: { gap: space.lg },
  footer: { gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  need: { width: '48.5%', flexGrow: 1, padding: space.lg, borderRadius: radius.lg, borderWidth: 1.5, gap: 6, minHeight: 128 },
  needIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  resultIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  note: { flexDirection: 'row', gap: space.sm, padding: space.md, borderRadius: radius.md, alignItems: 'flex-start' },
});
