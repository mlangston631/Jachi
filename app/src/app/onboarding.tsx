import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing, FadeIn, FadeInDown, FadeInRight, FadeOutLeft, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, ChipGroup, Field } from '@/components/forms';
import { Icon } from '@/components/Icon';
import { Leaf } from '@/components/Leaf';
import { Button, Txt } from '@/components/ui';
import { useT } from '@/i18n';
import { CONTENT } from '@/lib/content';
import { clean } from '@/lib/text';
import { usePrefs } from '@/state/prefs';
import { radius, space, useTheme } from '@/theme';

const STEPS = 4;

function FloatingLeaf() {
  const reduce = useReducedMotion();
  const y = useSharedValue(0);
  const grow = useSharedValue(reduce ? 1 : 0.6);
  useEffect(() => {
    if (reduce) return;
    grow.set(withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.4)) }));
    y.set(withRepeat(withSequence(withTiming(-8, { duration: 2200, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })), -1));
  }, [reduce, grow, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }, { scale: grow.get() }, { rotate: '-8deg' }] }));
  return (
    <Animated.View style={[styles.leafWrap, style]}>
      <Leaf size={132} color="#FFFFFF" />
    </Animated.View>
  );
}

function Progress({ step }: { step: number }) {
  const c = useTheme();
  const t = useT();
  return (
    <View style={styles.progress} accessible accessibilityLabel={t('onboarding.step', { n: step + 1, total: STEPS })}>
      {Array.from({ length: STEPS }, (_, i) => (
        <View key={i} style={[styles.bar, { backgroundColor: i <= step ? (step === 0 ? '#FFFFFF' : c.primary) : step === 0 ? 'rgba(255,255,255,0.25)' : c.line }]} />
      ))}
    </View>
  );
}

export default function Onboarding() {
  const t = useT();
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const set = usePrefs(s => s.set);
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [minor, setMinor] = useState(false);

  const toggle = (key: string) => setFocus(f => (f.includes(key) ? f.filter(k => k !== key) : [...f, key]));
  const finish = (next: 'checkin' | 'today') => {
    set({ onboarded: true, adult: true, focus, name: clean(name, 40) });
    router.replace('/');
    if (next === 'checkin') setTimeout(() => router.push({ pathname: '/checkin', params: { first: '1' } }), 450);
  };

  const hero = step === 0;
  return (
    <View style={[styles.flex, hero ? { backgroundColor: c.hero, experimental_backgroundImage: c.heroGradient } : { backgroundColor: c.bg }]}>
      <View style={[styles.top, { paddingTop: insets.top + space.md }]}>
        <Progress step={step} />
        {step > 0 && !minor ? (
          <Button label={t('common.back')} variant="quiet" size="sm" icon="arrow-left" onPress={() => setStep(s => s - 1)} />
        ) : null}
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + space.xxl }]} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <Animated.View key={`${step}-${minor}`} entering={step === 0 ? FadeIn.duration(500) : FadeInRight.duration(320)} exiting={FadeOutLeft.duration(200)} style={styles.step}>
          {step === 0 ? (
            <>
              <FloatingLeaf />
              <Animated.View entering={FadeInDown.delay(250).duration(600)} style={styles.gapMd}>
                <Txt variant="eyebrow" tone="onHero2">{t('onboarding.welcomeEyebrow')}</Txt>
                <Txt variant="hero" tone="onHero" heading>
                  {t('onboarding.welcomeTitle')}{'\n'}
                  <Txt variant="hero" style={styles.italic}>{t('onboarding.welcomeAccent')}</Txt>
                </Txt>
                <Txt variant="body" tone="onHero2">{t('onboarding.welcomeBody')}</Txt>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(500).duration(600)}>
                <Button label={t('onboarding.start')} variant="light" size="lg" iconRight="arrow" onPress={() => setStep(1)} full />
              </Animated.View>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Txt variant="largeTitle" heading>
                {t('onboarding.privacyTitle')} <Txt variant="largeTitle" tone="accent" style={styles.italic}>{t('onboarding.privacyAccent')}</Txt>
              </Txt>
              {([
                ['lock', 'privacy1Title', 'privacy1Body'],
                ['shield', 'privacy2Title', 'privacy2Body'],
                ['face', 'privacy3Title', 'privacy3Body'],
              ] as const).map(([icon, title, body], i) => (
                <Animated.View key={title} entering={FadeInDown.delay(120 + i * 110).duration(420)} style={[styles.promise, { backgroundColor: c.surface, borderColor: c.line }]}>
                  <View style={[styles.promiseIcon, { backgroundColor: c.accentSoft }]}><Icon name={icon} size={22} color={c.primary} /></View>
                  <View style={styles.flex}>
                    <Txt variant="headline">{t(`onboarding.${title}`)}</Txt>
                    <Txt variant="callout" tone="text2">{t(`onboarding.${body}`)}</Txt>
                  </View>
                </Animated.View>
              ))}
              <Button label={t('common.continue')} size="lg" iconRight="arrow" onPress={() => setStep(2)} full />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Txt variant="largeTitle" heading>
                {t('onboarding.focusTitle')} <Txt variant="largeTitle" tone="accent" style={styles.italic}>{t('onboarding.focusAccent')}</Txt>
              </Txt>
              <Txt variant="body" tone="text2">{t('onboarding.focusBody')}</Txt>
              <ChipGroup>
                {CONTENT.services.map(s => (
                  <Chip key={s.key} label={s[t.lang].chip} selected={focus.includes(s.key)} onPress={() => toggle(s.key)} />
                ))}
                <Chip label={t('onboarding.focusTracking')} selected={focus.includes('tracking')} onPress={() => toggle('tracking')} />
              </ChipGroup>
              <Field
                label={t('onboarding.nameLabel')}
                value={name}
                onChangeText={setName}
                placeholder={t('onboarding.namePlaceholder')}
                hint={t('onboarding.nameHint')}
                optional
                autoComplete="given-name"
                textContentType="givenName"
                autoCapitalize="words"
                maxLength={40}
                returnKeyType="done"
              />
              <Button label={t('common.continue')} size="lg" iconRight="arrow" onPress={() => setStep(3)} full />
            </>
          ) : null}

          {step === 3 && !minor ? (
            <>
              <View style={[styles.badge, { backgroundColor: c.accentSoft }]}><Leaf size={40} color={c.primary} /></View>
              <Txt variant="largeTitle" heading>{t('onboarding.adultTitle')}</Txt>
              <Txt variant="body" tone="text2">{t('onboarding.adultBody')}</Txt>
              <View style={styles.gapSm}>
                <Button label={t('onboarding.adultYes')} size="lg" onPress={() => finish('checkin')} full testID="adult-yes" />
                <Button label={t('onboarding.adultNo')} variant="ghost" onPress={() => setMinor(true)} full />
              </View>
            </>
          ) : null}

          {step === 3 && minor ? (
            <>
              <Txt variant="largeTitle" heading>{t('onboarding.minorTitle')}</Txt>
              <Txt variant="body" tone="text2">{t('onboarding.minorBody')}</Txt>
              <Button label={t('common.back')} variant="ghost" onPress={() => setMinor(false)} full />
            </>
          ) : null}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { paddingHorizontal: space.xl, gap: space.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56 },
  progress: { flexDirection: 'row', gap: 6, flex: 1, maxWidth: 160 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  body: { flexGrow: 1, paddingHorizontal: space.xl, paddingTop: space.lg },
  step: { flex: 1, gap: space.xl, justifyContent: 'center', width: '100%', maxWidth: 560, alignSelf: 'center' },
  leafWrap: { alignSelf: 'flex-start', marginBottom: space.md },
  italic: { fontFamily: 'Fraunces-DisplayItalic' },
  gapMd: { gap: space.md },
  gapSm: { gap: space.sm },
  promise: { flexDirection: 'row', gap: space.lg, padding: space.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, alignItems: 'flex-start' },
  promiseIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badge: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
