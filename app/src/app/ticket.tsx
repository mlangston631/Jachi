import * as Application from 'expo-application';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Field, Select, ToggleRow } from '@/components/forms';
import { Icon } from '@/components/Icon';
import { ModalScreen } from '@/components/Screen';
import { Button, Card, Txt } from '@/components/ui';
import { useT } from '@/i18n';
import { SOURCE } from '@/lib/api';
import { SUPPORT_EMAIL } from '@/lib/content';
import { sendOrQueue, ticketFields } from '@/lib/forms';
import { haptic } from '@/lib/haptics';
import { clean, isEmail } from '@/lib/text';
import { useGuide } from '@/state/guide';
import { usePrefs } from '@/state/prefs';
import { useSession } from '@/state/session';
import { radius, space, useTheme } from '@/theme';

export default function Ticket() {
  const t = useT();
  const c = useTheme();
  const params = useLocalSearchParams<{ chat?: string; topic?: string }>();
  const prefs = usePrefs();
  const session = useSession();
  const transcript = useGuide(s => s.transcript);
  const hasChat = useGuide(s => s.messages.length > 0);
  const topics = t.list('ticket.topics');
  const [name, setName] = useState(prefs.name);
  const [emailValue, setEmail] = useState(prefs.lastEmail || session.user?.email || '');
  const [topic, setTopic] = useState(String(Math.min(5, Math.max(0, Number(params.topic) || 0))));
  const [message, setMessage] = useState('');
  const [includeChat, setIncludeChat] = useState(params.chat === '1' && hasChat);
  const [includeApp, setIncludeApp] = useState(topic === '3');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | 'sent' | 'queued'>(null);

  const submit = async () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = t('site.t_name');
    if (!emailValue.trim()) next.email = t('site.enter_email');
    else if (!isEmail(emailValue)) next.email = t('site.valid_email');
    if (message.trim().length < 10) next.message = t('site.t_msg');
    setErrors(next);
    const count = Object.keys(next).length;
    if (count) {
      setStatus(count === 1 ? t('site.fix_one') : t('site.fix_many', { n: count }));
      haptic.warning();
      return;
    }
    setStatus('');
    setBusy(true);
    try {
      const device = includeApp
        ? `Jachi app ${Application.nativeApplicationVersion ?? '?'} (${Application.nativeBuildVersion ?? '?'}), ${Platform.OS} ${String(Platform.Version)}`
        : '';
      const result = await sendOrQueue('ticket', ticketFields({
        name: clean(name, 80),
        email: emailValue.trim(),
        topic: Number(topic),
        message: message.trim().slice(0, 2000),
        transcript: includeChat ? transcript() : '',
        device,
        language: t.lang,
        source: SOURCE,
      }));
      prefs.set({ lastEmail: emailValue.trim() });
      haptic.success();
      setDone(result);
    } catch {
      setStatus(t('site.t_failed', { email: SUPPORT_EMAIL }));
      haptic.warning();
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <ModalScreen title={t('ticket.title')} footer={<Button label={t('common.done')} onPress={() => router.back()} size="lg" full />}>
        <Animated.View entering={FadeIn.duration(260)} style={styles.success}>
          <Animated.View entering={ZoomIn.springify().damping(12)} style={[styles.successIcon, { backgroundColor: c.primary }]}>
            <Icon name={done === 'sent' ? 'check' : 'clock'} size={34} color={c.onPrimary} strokeWidth={2.6} />
          </Animated.View>
          <Txt variant="title" center heading>{done === 'sent' ? t('ticket.doneTitle') : t('ticket.queuedTitle')}</Txt>
          <Txt variant="body" tone="text2" center>{done === 'sent' ? t('ticket.doneBody', { email: emailValue.trim() }) : t('ticket.queuedBody')}</Txt>
        </Animated.View>
      </ModalScreen>
    );
  }

  return (
    <ModalScreen
      title={t('ticket.title')}
      footer={
        <View style={styles.gapSm}>
          {status ? <Txt variant="footnote" tone="danger" center accessibilityLiveRegion="polite">{status}</Txt> : null}
          <Button label={busy ? t('site.t_sending') : t('site.t_send')} onPress={() => void submit()} loading={busy} size="lg" full />
        </View>
      }>
      <Card tone="plain" style={styles.lead}>
        <Icon name="mail" size={20} color={c.text2} />
        <Txt variant="callout" tone="text2" style={styles.flex}>{t('ticket.lead')}</Txt>
      </Card>
      <Field label={t('ticket.name')} value={name} onChangeText={setName} autoComplete="name" textContentType="name" autoCapitalize="words" error={errors.name} maxLength={80} />
      <Field label={t('ticket.email')} value={emailValue} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" textContentType="emailAddress" autoCapitalize="none" error={errors.email} maxLength={254} />
      <Select label={t('ticket.topic')} value={topic} onChange={v => { setTopic(v); if (v === '3') setIncludeApp(true); }} options={topics.map((label, i) => ({ value: String(i), label }))} placeholder={topics[0]} />
      <Field label={t('ticket.message')} hint={t('ticket.messageHint')} value={message} onChangeText={setMessage} multiline error={errors.message} maxLength={2000} />
      <Card padded={false}>
        {hasChat ? <ToggleRow label={t('ticket.includeChat')} value={includeChat} onChange={setIncludeChat} icon="chat" /> : null}
        <ToggleRow label={t('ticket.includeApp')} value={includeApp} onChange={setIncludeApp} icon="info" />
      </Card>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gapSm: { gap: space.sm },
  lead: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  success: { alignItems: 'center', gap: space.md, paddingVertical: space.lg },
  successIcon: { width: 76, height: 76, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
