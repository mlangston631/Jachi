import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Chip, ChipGroup, Field, Select } from '@/components/forms';
import { Icon } from '@/components/Icon';
import { ModalScreen } from '@/components/Screen';
import { Button, Card, Row, Txt } from '@/components/ui';
import { useT } from '@/i18n';
import { SOURCE } from '@/lib/api';
import { CONTENT, LINKS, SITE, stateName, statesFor } from '@/lib/content';
import { sendOrQueue, waitlistFields } from '@/lib/forms';
import { haptic } from '@/lib/haptics';
import { openPage } from '@/lib/links';
import { clean, isEmail } from '@/lib/text';
import { usePrefs } from '@/state/prefs';
import { useSession } from '@/state/session';
import { radius, space, useTheme } from '@/theme';

export default function Waitlist() {
  const t = useT();
  const c = useTheme();
  const params = useLocalSearchParams<{ interest?: string }>();
  const prefs = usePrefs();
  const session = useSession();
  const preset = String(params.interest ?? '').split(',').map(s => s.trim()).filter(Boolean);
  const [emailValue, setEmail] = useState(prefs.lastEmail || session.user?.email || '');
  const [state, setState] = useState(prefs.waitlist?.state ?? 'TX');
  const [name, setName] = useState(prefs.name);
  const [interests, setInterests] = useState<string[]>(preset.length ? preset : prefs.focus.map(k => CONTENT.services.find(s => s.key === k)?.interest).filter((x): x is string => !!x));
  const [errors, setErrors] = useState<{ email?: string; state?: string }>({});
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | 'sent' | 'queued'>(null);

  const toggle = (v: string) => setInterests(list => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]));

  const submit = async () => {
    const e = emailValue.trim();
    const next: typeof errors = {};
    if (!e) next.email = t('site.enter_email');
    else if (!isEmail(e)) next.email = t('site.valid_email');
    if (!state) next.state = t('site.choose_state');
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
      const fields = waitlistFields({ email: e, state, name: clean(name, 60), interests, language: t.lang, source: SOURCE });
      const result = await sendOrQueue('waitlist', fields);
      prefs.set({ waitlist: { email: e, state, name: clean(name, 60), interests, at: Date.now(), queued: result === 'queued' }, lastEmail: e });
      haptic.success();
      setDone(result);
    } catch {
      setStatus(t('site.j_failed'));
      haptic.warning();
    } finally {
      setBusy(false);
    }
  };

  const share = () => {
    void Share.share({ message: t('waitlist.shareMessage', { url: t.lang === 'es' ? `${SITE}/es/` : `${SITE}/` }) });
  };

  if (done) {
    const placeName = stateName(state, t.lang);
    return (
      <ModalScreen title={t('waitlist.title')} footer={<Button label={t('common.done')} onPress={() => router.back()} size="lg" full />}>
        <Animated.View entering={FadeIn.duration(260)} style={styles.success}>
          <Animated.View entering={ZoomIn.springify().damping(12)} style={[styles.successIcon, { backgroundColor: c.primary }]}>
            <Icon name={done === 'sent' ? 'check' : 'clock'} size={34} color={c.onPrimary} strokeWidth={2.6} />
          </Animated.View>
          <Txt variant="title" center heading>
            {done === 'queued' ? t('waitlist.queuedTitle') : name.trim() ? t('waitlist.doneTitleName', { name: clean(name, 60) }) : t('waitlist.doneTitle')}
          </Txt>
          <Txt variant="body" tone="text2" center>
            {done === 'queued' ? t('waitlist.queuedBody', { state: placeName }) : t('waitlist.doneBody', { email: emailValue.trim(), state: placeName })}
          </Txt>
        </Animated.View>
        <Card tone="accent" style={styles.gapSm}>
          <Txt variant="headline">{t('waitlist.shareLead')}</Txt>
          <Button label={t('waitlist.shareCta')} icon="share" onPress={share} style={styles.selfStart} />
        </Card>
        {session.status !== 'signedIn' ? (
          <Card style={styles.gapSm}>
            <Txt variant="callout" tone="text2">{t('waitlist.accountLead')}</Txt>
            <Button label={t('waitlist.accountCta')} icon="user" variant="ghost" onPress={() => router.replace({ pathname: '/account', params: { mode: 'create', email: emailValue.trim() } })} style={styles.selfStart} />
          </Card>
        ) : null}
        <Button label={t('waitlist.another')} variant="quiet" onPress={() => { setDone(null); setEmail(''); }} />
      </ModalScreen>
    );
  }

  return (
    <ModalScreen
      title={t('waitlist.title')}
      footer={
        <View style={styles.gapSm}>
          {status ? <Txt variant="footnote" tone="danger" center accessibilityLiveRegion="polite">{status}</Txt> : null}
          <Button label={busy ? t('site.j_saving') : t('waitlist.submit')} onPress={() => void submit()} loading={busy} size="lg" full />
        </View>
      }>
      <Card tone="warn" style={styles.what}>
        <Icon name="info" size={22} color={c.warn} />
        <View style={[styles.flex, styles.gapXs]}>
          <Txt variant="headline" style={{ color: c.warn }}>{t('waitlist.whatTitle')}</Txt>
          <Txt variant="callout">{t('waitlist.whatBody')}</Txt>
        </View>
      </Card>
      <Field label={t('waitlist.email')} value={emailValue} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" textContentType="emailAddress" autoCapitalize="none" error={errors.email} maxLength={254} />
      <Select label={t('waitlist.state')} value={state} onChange={setState} options={statesFor(t.lang).map(s => ({ value: s.code, label: s.name }))} placeholder={t('waitlist.statePlaceholder')} error={errors.state} />
      <Field label={t('waitlist.name')} value={name} onChangeText={setName} optional autoComplete="given-name" textContentType="givenName" autoCapitalize="words" maxLength={60} />
      <View style={styles.gapSm}>
        <Txt variant="subhead">
          {t('waitlist.interests')} <Txt variant="subhead" tone="text3">{t('common.optional')}</Txt>
        </Txt>
        <ChipGroup>
          {CONTENT.services.map(s => (
            <Chip key={s.key} label={s[t.lang].chip} selected={interests.includes(s.interest)} onPress={() => toggle(s.interest)} />
          ))}
        </ChipGroup>
      </View>
      <View style={styles.gapXs}>
        <Txt variant="footnote" tone="text3">{t('waitlist.fine')}</Txt>
        <Row>
          <Button label={t('waitlist.privacy')} variant="quiet" size="sm" iconRight="external" onPress={() => void openPage(LINKS.privacy)} />
        </Row>
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gapXs: { gap: space.xs },
  gapSm: { gap: space.sm },
  selfStart: { alignSelf: 'flex-start' },
  what: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  success: { alignItems: 'center', gap: space.md, paddingVertical: space.lg },
  successIcon: { width: 76, height: 76, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
