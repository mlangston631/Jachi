import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SafetyCard } from '@/components/feedback';
import { Icon } from '@/components/Icon';
import { Leaf } from '@/components/Leaf';
import { MAX_WIDTH, TAB_BAR } from '@/components/Screen';
import { Button, IconButton, Tag, Tap, Txt } from '@/components/ui';
import { useT } from '@/i18n';
import { ApiError, askGuide } from '@/lib/api';
import { SUPPORT_EMAIL } from '@/lib/content';
import { haptic } from '@/lib/haptics';
import { call, email } from '@/lib/links';
import { classify } from '@/lib/safety';
import { linkify } from '@/lib/text';
import { useGuide, type Message } from '@/state/guide';
import { radius, space, type, useTheme } from '@/theme';
import { NO_OUTLINE } from '@/theme/tokens';

function Dot({ delay }: { delay: number }) {
  const c = useTheme();
  const reduce = useReducedMotion();
  const o = useSharedValue(0.3);
  useEffect(() => {
    if (reduce) return;
    o.set(withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 380 }), withTiming(0.3, { duration: 380 })), -1)));
  }, [delay, o, reduce]);
  const style = useAnimatedStyle(() => ({ opacity: o.get() }));
  return <Animated.View style={[styles.dot, { backgroundColor: c.text3 }, style]} />;
}

function Bubble({ m }: { m: Message }) {
  const c = useTheme();
  const t = useT();
  if (m.kind === 'crisis' || m.kind === 'emergency') {
    return <Animated.View entering={FadeInUp.duration(240)}><SafetyCard kind={m.kind} body={m.text} /></Animated.View>;
  }
  const mine = m.role === 'user';
  return (
    <Animated.View entering={FadeInUp.duration(220)} style={[styles.bubbleRow, mine ? styles.mine : null]}>
      {!mine ? <View style={[styles.avatar, { backgroundColor: c.accentSoft }]}><Leaf size={18} color={c.primary} veins={false} /></View> : null}
      <View
        style={[styles.bubble, mine ? { backgroundColor: c.primary, borderBottomRightRadius: 6 } : { backgroundColor: c.surface, borderColor: c.line, borderWidth: StyleSheet.hairlineWidth, borderBottomLeftRadius: 6 }]}
        accessible
        accessibilityLabel={`${mine ? t('guide.you') : t('guide.assistant')}: ${m.text}`}>
        <Txt variant="callout" style={{ color: mine ? c.onPrimary : c.text }}>
          {linkify(m.text, SUPPORT_EMAIL).map((part, i) =>
            part.kind === 'text' ? (
              part.value
            ) : (
              <Txt
                key={i}
                variant="callout"
                style={[styles.link, { color: mine ? c.onPrimary : c.primary }]}
                onPress={() => (part.kind === 'email' ? email(part.value) : call(part.value))}
                accessibilityRole="link">
                {part.value}
              </Txt>
            ),
          )}
        </Txt>
        {m.kind === 'error' ? <Button label={t('guide.ticket')} variant="ghost" size="sm" icon="mail" onPress={() => router.push({ pathname: '/ticket', params: { chat: '1' } })} style={styles.ticketBtn} /> : null}
      </View>
    </Animated.View>
  );
}

export default function Guide() {
  const t = useT();
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const { messages, busy, add, setBusy, clear, turns } = useGuide();
  const [text, setText] = useState('');
  const [keyboard, setKeyboard] = useState(false);
  const list = useRef<FlatList<Message>>(null);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboard(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboard(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const send = async (raw: string) => {
    const message = raw.trim().slice(0, 800);
    if (!message || busy) return;
    haptic.light();
    setText('');
    add({ role: 'user', text: message, kind: 'normal' });
    const risk = classify(message);
    if (risk === 'crisis') {
      add({ role: 'assistant', text: t('site.c_crisis'), kind: 'crisis' });
      return;
    }
    if (risk === 'emergency') {
      add({ role: 'assistant', text: t('site.c_emergency'), kind: 'emergency' });
      return;
    }
    setBusy(true);
    try {
      const reply = await askGuide(turns());
      add({ role: 'assistant', text: reply, kind: 'normal' });
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'unavailable';
      add({ role: 'assistant', text: code === 'rate_limited' ? t('site.c_busy') : code === 'offline' || code === 'timeout' ? t('guide.offline') : t('site.c_down'), kind: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const bottom = keyboard ? space.sm : insets.bottom + TAB_BAR;
  const header = (
    <View style={styles.intro}>
      <View style={[styles.introCard, { backgroundColor: c.accentSoft }]}>
        <Leaf size={28} color={c.primary} />
        <Txt variant="callout" style={styles.flex}>{t('guide.intro')}</Txt>
      </View>
      {messages.length === 0 ? (
        <Animated.View entering={FadeIn.delay(200)} style={styles.suggestions}>
          {t.list('guide.suggestions').map(s => (
            <Tap key={s} onPress={() => void send(s)} style={[styles.suggestion, { borderColor: c.lineStrong, backgroundColor: c.surface }]} accessibilityLabel={s}>
              <Icon name="sparkles" size={16} color={c.accent} />
              <Txt variant="subhead">{s}</Txt>
            </Tap>
          ))}
        </Animated.View>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: c.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.head, { paddingTop: insets.top + space.md }]}>
        <View style={styles.flex}>
          <Txt variant="largeTitle" heading>{t('guide.title')}</Txt>
          <Tag label={t('guide.badge')} icon="sparkles" />
        </View>
        {messages.length ? <IconButton icon="refresh" label={t('guide.clear')} onPress={clear} filled /> : null}
      </View>
      <FlatList
        ref={list}
        data={messages}
        keyExtractor={m => String(m.id)}
        renderItem={({ item }) => <Bubble m={item} />}
        ListHeaderComponent={header}
        ListFooterComponent={
          busy ? (
            <View style={styles.bubbleRow} accessible accessibilityLabel={t('site.c_typing')}>
              <View style={[styles.avatar, { backgroundColor: c.accentSoft }]}><Leaf size={18} color={c.primary} veins={false} /></View>
              <View style={[styles.bubble, styles.typing, { backgroundColor: c.surface, borderColor: c.line }]}>
                <Dot delay={0} />
                <Dot delay={150} />
                <Dot delay={300} />
              </View>
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        style={styles.flex}
      />
      <View style={[styles.composer, { paddingBottom: bottom, borderTopColor: c.line, backgroundColor: c.bg }]}>
        <View style={styles.inner}>
          <View style={[styles.inputRow, { backgroundColor: c.surface, borderColor: c.lineStrong }]}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={t('guide.placeholder')}
              placeholderTextColor={c.text3}
              multiline
              maxLength={800}
              accessibilityLabel={t('guide.placeholder')}
              style={[type.body, NO_OUTLINE, styles.input, { color: c.text }]}
              maxFontSizeMultiplier={1.6}
              submitBehavior="blurAndSubmit"
              returnKeyType="send"
              onSubmitEditing={() => void send(text)}
            />
            <Tap
              onPress={() => void send(text)}
              disabled={!text.trim() || busy}
              accessibilityLabel={t('guide.send')}
              style={[styles.send, { backgroundColor: text.trim() && !busy ? c.primary : c.surface2 }]}>
              <Icon name="send" size={20} color={text.trim() && !busy ? c.onPrimary : c.text3} strokeWidth={2} />
            </Tap>
          </View>
          <Txt variant="caption" tone="text3" center>{t('guide.fine')}</Txt>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: space.xs },
  head: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: space.xl, paddingBottom: space.md, gap: space.md },
  intro: { gap: space.md, marginBottom: space.md },
  introCard: { flexDirection: 'row', gap: space.md, padding: space.lg, borderRadius: radius.lg, alignItems: 'flex-start' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: 14, minHeight: 40 },
  listContent: { paddingHorizontal: space.xl, paddingBottom: space.lg, gap: space.md, width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, maxWidth: '100%' },
  mine: { justifyContent: 'flex-end' },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '82%', paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: 20, gap: space.sm },
  link: { textDecorationLine: 'underline' },
  ticketBtn: { alignSelf: 'flex-start' },
  typing: { flexDirection: 'row', gap: 5, borderWidth: StyleSheet.hairlineWidth, paddingVertical: space.lg },
  dot: { width: 7, height: 7, borderRadius: 4 },
  composer: { paddingHorizontal: space.lg, paddingTop: space.sm, borderTopWidth: StyleSheet.hairlineWidth },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', borderWidth: 1.5, borderRadius: 26, paddingLeft: space.lg, paddingRight: 5, paddingVertical: 5, gap: space.sm },
  input: { flex: 1, maxHeight: 120, paddingTop: 10, paddingBottom: 10 },
  send: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
