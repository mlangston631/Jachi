/** Toasts, the milestone celebration, empty states, safety cards and the launch-status card. */
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing, FadeIn, FadeInDown, FadeOut, FadeOutUp, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { useT } from '@/i18n';
import { stateName } from '@/lib/content';
import { call, text } from '@/lib/links';
import { usePrefs } from '@/state/prefs';
import { radius, space, useTheme } from '@/theme';
import { Icon } from './Icon';
import { Leaf } from './Leaf';
import { Button, Card, Tag, Tap, Txt } from './ui';

/* ---------- Toast ---------- */

type ToastState = { message: string; icon: string; key: number; show: (message: string, icon?: string) => void; hide: () => void };

export const useToast = create<ToastState>()(set => ({
  message: '',
  icon: 'check',
  key: 0,
  show: (message, icon = 'check') => {
    set(s => ({ message, icon, key: s.key + 1 }));
    AccessibilityInfo.announceForAccessibility(message);
  },
  hide: () => set({ message: '' }),
}));

export function ToastHost() {
  const { message, icon, key, hide } = useToast();
  const c = useTheme();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, 2600);
    return () => clearTimeout(timer);
  }, [message, key, hide]);
  if (!message) return null;
  return (
    <Animated.View
      key={key}
      entering={FadeInDown.springify().damping(18)}
      exiting={FadeOutUp.duration(160)}
      pointerEvents="none"
      style={[styles.toast, { top: insets.top + (Platform.OS === 'ios' ? 6 : 12), backgroundColor: c.text, boxShadow: c.shadowStrong }]}>
      <Icon name={icon} size={18} color={c.bg} strokeWidth={2.2} />
      <Txt variant="subhead" style={{ color: c.bg }}>{message}</Txt>
    </Animated.View>
  );
}

/* ---------- Celebration: leaves drifting up from the center ---------- */

function Petal({ index, total, color }: { index: number; total: number; color: string }) {
  const p = useSharedValue(0);
  const angle = (index / total) * Math.PI * 2;
  const dist = 110 + (index % 3) * 26;
  useEffect(() => {
    p.set(withDelay(index * 18, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) })));
  }, [index, p]);
  const style = useAnimatedStyle(() => {
    const v = p.get();
    return {
      opacity: v < 0.75 ? 1 : 1 - (v - 0.75) * 4,
      transform: [
        { translateX: Math.cos(angle) * dist * v },
        { translateY: Math.sin(angle) * dist * v - 40 * v },
        { rotate: `${(angle * 180) / Math.PI + v * 140}deg` },
        { scale: 0.6 + v * 0.5 },
      ],
    };
  });
  return (
    <Animated.View style={[styles.petal, style]}>
      <Leaf size={22} color={color} veins={false} />
    </Animated.View>
  );
}

export function Celebrate({ title, body, onDone }: { title: string; body: string; onDone: () => void }) {
  const c = useTheme();
  const t = useT();
  const reduce = useReducedMotion();
  const colors = [c.primary, c.accent, '#C98A3B', c.mood[3]];
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`${title}. ${body}`);
  }, [title, body]);
  return (
    <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(200)} style={[StyleSheet.absoluteFill, styles.celebrate, { backgroundColor: c.scrim }]} accessibilityViewIsModal>
      <Tap onPress={onDone} feedback={null} style={StyleSheet.absoluteFill} accessibilityLabel={t('common.close')} />
      <View style={styles.burst} pointerEvents="none">
        {reduce ? null : Array.from({ length: 14 }, (_, i) => <Petal key={i} index={i} total={14} color={colors[i % colors.length]!} />)}
      </View>
      <Animated.View entering={FadeInDown.delay(120).springify().damping(16)} style={[styles.celebrateCard, { backgroundColor: c.surface, boxShadow: c.shadowStrong }]}>
        <View style={[styles.celebrateIcon, { backgroundColor: c.accentSoft }]}>
          <Leaf size={44} color={c.primary} />
        </View>
        <Txt variant="title" center heading>{title}</Txt>
        <Txt variant="body" tone="text2" center>{body}</Txt>
        <Button label={t('common.continue')} onPress={onDone} full />
      </Animated.View>
    </Animated.View>
  );
}

/* ---------- Empty state ---------- */

export function Empty({ title, body, action, icon = 'sprout' }: { title: string; body: string; action?: ReactNode; icon?: string }) {
  const c = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: c.accentSoft }]}>
        <Icon name={icon} size={30} color={c.primary} strokeWidth={1.6} />
      </View>
      <Txt variant="title3" center heading>{title}</Txt>
      <Txt variant="callout" tone="text2" center>{body}</Txt>
      {action}
    </View>
  );
}

/* ---------- Safety ---------- */

export function SafetyCard({ kind, title, body }: { kind: 'emergency' | 'crisis'; title?: string; body: string }) {
  const t = useT();
  const c = useTheme();
  return (
    <Card tone="danger" style={styles.safety}>
      <View style={styles.safetyHead}>
        <Icon name={kind === 'crisis' ? 'heart' : 'alert'} size={22} color={c.danger} strokeWidth={2} />
        {title ? <Txt variant="headline" tone="danger" style={styles.flex}>{title}</Txt> : null}
      </View>
      <Txt variant="callout" style={{ color: c.text }}>{body}</Txt>
      {kind === 'crisis' ? (
        <View style={styles.safetyRow}>
          <Button label={t('site.c_call_988')} icon="phone" onPress={() => call('988')} variant="danger" size="sm" accessibilityLabel={t('a11y.callButton', { number: '988' })} />
          <Button label={t('site.c_text_988')} icon="msg" onPress={() => text('988', t.lang === 'es' ? 'AYUDA' : '')} variant="ghost" size="sm" accessibilityLabel={t('a11y.textButton', { number: '988' })} />
          <Button label={t('site.c_call_911')} icon="phone" onPress={() => call('911')} variant="ghost" size="sm" accessibilityLabel={t('a11y.callButton', { number: '911' })} />
        </View>
      ) : (
        <View style={styles.safetyRow}>
          <Button label={t('site.c_call_911')} icon="phone" onPress={() => call('911')} variant="danger" size="sm" accessibilityLabel={t('a11y.callButton', { number: '911' })} />
        </View>
      )}
    </Card>
  );
}

/* ---------- Launch status (the review asked for this to be unmistakable) ---------- */

export function StatusCard({ compact, interest }: { compact?: boolean; interest?: string }) {
  const t = useT();
  const c = useTheme();
  const waitlist = usePrefs(s => s.waitlist);
  const join = () => router.push(interest ? { pathname: '/waitlist', params: { interest } } : '/waitlist');
  if (waitlist) {
    const state = stateName(waitlist.state, t.lang);
    return (
      <Card tone="accent" style={styles.status} accessibilityLabel={`${t('status.onList', { state })}. ${waitlist.queued ? t('status.pendingBody', { state }) : t('status.onListBody', { email: waitlist.email })}`}>
        <View style={styles.statusHead}>
          <View style={[styles.statusIcon, { backgroundColor: c.primary }]}>
            <Icon name={waitlist.queued ? 'clock' : 'check'} size={18} color={c.onPrimary} strokeWidth={2.4} />
          </View>
          <View style={styles.flex}>
            <Txt variant="headline">{t('status.onList', { state })}</Txt>
            <Txt variant="footnote" tone="text2">
              {waitlist.queued ? t('status.pendingBody', { state }) : t('status.onListBody', { email: waitlist.email })}
            </Txt>
          </View>
        </View>
      </Card>
    );
  }
  return (
    <Card tone="hero" style={styles.status}>
      <Tag label={t('status.badge')} tone="hero" icon="clock" />
      <Txt variant="title2" tone="onHero" heading>{t('status.title')}</Txt>
      {compact ? null : <Txt variant="callout" tone="onHero2">{t('status.body')}</Txt>}
      <Button label={t('status.join')} onPress={join} variant="light" iconRight="arrow" style={styles.statusBtn} />
    </Card>
  );
}

/* ---------- Accordion (FAQ) ---------- */

export function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const c = useTheme();
  const t = useT();
  return (
    <View style={[styles.faq, { borderColor: c.line }]}>
      <Tap
        onPress={() => setOpen(o => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityHint={open ? t('a11y.collapse') : t('a11y.expand')}
        scaleTo={0.99}
        style={styles.faqQ}>
        <Txt variant="headline" style={styles.flex}>{q}</Txt>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon name="chevron-down" size={20} color={c.text2} />
        </View>
      </Tap>
      {open ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.faqA}>
          <Txt variant="callout" tone="text2">{a}</Txt>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  toast: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.pill, zIndex: 1000 },
  celebrate: { alignItems: 'center', justifyContent: 'center', padding: space.xl, zIndex: 900 },
  burst: { position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 1, height: 1 },
  petal: { position: 'absolute' },
  celebrateCard: { width: '100%', maxWidth: 380, borderRadius: radius.xl, padding: space.xxl, gap: space.md, alignItems: 'center' },
  celebrateIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  empty: { alignItems: 'center', gap: space.sm, paddingVertical: space.xxl, paddingHorizontal: space.lg },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  safety: { gap: space.md },
  safetyHead: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  safetyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  status: { gap: space.md },
  statusHead: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  statusIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statusBtn: { alignSelf: 'flex-start', marginTop: space.xs },
  faq: { borderBottomWidth: StyleSheet.hairlineWidth },
  faqQ: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.lg },
  faqA: { paddingBottom: space.lg },
});
