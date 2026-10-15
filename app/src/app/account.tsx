import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useToast } from '@/components/feedback';
import { Chip, ChipGroup, Field, Segmented, Select, ToggleRow } from '@/components/forms';
import { Icon } from '@/components/Icon';
import { Page } from '@/components/Screen';
import { Button, Card, Row, Txt } from '@/components/ui';
import { useT } from '@/i18n';
import { CONTENT, LINKS, SUPPORT_EMAIL, statesFor } from '@/lib/content';
import { haptic } from '@/lib/haptics';
import {
  changePassword, deleteAccount, detailsOf, IdentityError, login, recover, signup, updateDetails, type Details,
} from '@/lib/identity';
import { openPage } from '@/lib/links';
import { isEmail } from '@/lib/text';
import { usePrefs } from '@/state/prefs';
import { useSession } from '@/state/session';
import { radius, space, useTheme } from '@/theme';

type Mode = 'login' | 'create' | 'forgot' | 'sent' | 'forgotSent' | 'profile' | 'deleted';

const MIN_PASSWORD = 8;

export default function Account() {
  const t = useT();
  const c = useTheme();
  const toast = useToast(s => s.show);
  const params = useLocalSearchParams<{ mode?: string; email?: string }>();
  const session = useSession();
  const prefs = usePrefs();
  const [mode, setMode] = useState<Mode>(params.mode === 'create' ? 'create' : 'login');
  const [emailValue, setEmail] = useState(String(params.email ?? prefs.lastEmail ?? ''));
  const [password, setPassword] = useState('');
  const [state, setState] = useState(prefs.waitlist?.state ?? 'TX');
  const [interests, setInterests] = useState<string[]>(prefs.waitlist?.interests ?? []);
  const [details, setDetails] = useState<Details | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [deletedNote, setDeletedNote] = useState('');

  useEffect(() => {
    if (session.status === 'signedIn' && session.user && mode !== 'deleted') {
      setMode('profile');
      setDetails(detailsOf(session.user));
    }
  }, [session.status, session.user, mode]);

  const explain = (err: unknown) => {
    const code = err instanceof IdentityError ? err.code : 'unknown';
    const map: Record<string, string> = {
      invalid_login: t('site.a_e_invalid_login'),
      unconfirmed: t('site.a_e_unconfirmed'),
      exists: t('site.a_e_exists'),
      signup_off: t('site.a_e_signup_off'),
      rate: t('site.a_e_rate'),
      network: t('site.a_e_network'),
      weak_password: t('site.a_e_weak'),
      bad_email: t('site.valid_email'),
    };
    return map[code] ?? t('site.a_e_unknown', { email: SUPPORT_EMAIL });
  };

  const check = (pairs: [string, string][]) => {
    const next: Record<string, string> = {};
    for (const [k, problem] of pairs) if (problem) next[k] = problem;
    setErrors(next);
    const n = Object.keys(next).length;
    if (n) {
      setStatus({ kind: 'error', text: n === 1 ? t('site.fix_one') : t('site.fix_many', { n }) });
      haptic.warning();
    }
    return n === 0;
  };
  const emailProblem = (v: string) => (!v.trim() ? t('site.enter_email') : isEmail(v) ? '' : t('site.valid_email'));
  const passwordProblem = (v: string, isNew: boolean) => (!v ? t('site.a_err_password') : isNew && v.length < MIN_PASSWORD ? t('site.a_err_password_short') : '');

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setStatus(null);
    try {
      await task();
    } catch (err) {
      setStatus({ kind: 'error', text: explain(err) });
      haptic.warning();
    } finally {
      setBusy(false);
    }
  };

  const doLogin = () => {
    if (!check([['email', emailProblem(emailValue)], ['password', passwordProblem(password, false)]])) return;
    void run(async () => {
      const user = await login(emailValue.trim(), password);
      setPassword('');
      session.setUser(user);
      prefs.set({ lastEmail: emailValue.trim() });
      haptic.success();
    });
  };

  const doCreate = () => {
    if (!check([['email', emailProblem(emailValue)], ['password', passwordProblem(password, true)], ['state', state ? '' : t('site.choose_state')]])) return;
    void run(async () => {
      const created = await signup(emailValue.trim(), password, { state, interests, language: t.lang, updates: true });
      prefs.set({ lastEmail: emailValue.trim() });
      if (created.confirmed_at) {
        const user = await login(emailValue.trim(), password);
        session.setUser(user);
        toast(t('site.a_welcome'));
      } else {
        setMode('sent');
      }
      setPassword('');
      haptic.success();
    });
  };

  const doForgot = () => {
    if (!check([['email', emailProblem(emailValue)]])) return;
    void run(async () => {
      await recover(emailValue.trim());
      setMode('forgotSent');
    });
  };

  const saveDetails = () => {
    if (!details) return;
    if (!check([['state', details.state ? '' : t('site.choose_state')]])) return;
    void run(async () => {
      const user = await updateDetails(details);
      session.setUser(user);
      setStatus({ kind: 'ok', text: t('site.a_saved') });
      haptic.success();
    });
  };

  const savePassword = () => {
    if (!check([['newPassword', passwordProblem(newPassword, true)]])) return;
    void run(async () => {
      await changePassword(newPassword);
      setNewPassword('');
      setStatus({ kind: 'ok', text: t('site.a_password_saved') });
      haptic.success();
    });
  };

  const confirmDelete = () => {
    Alert.alert(t('site.a_delete_title'), t('site.a_delete_warn'), [
      { text: t('site.a_cancel'), style: 'cancel' },
      {
        text: t('site.a_delete_confirm'),
        style: 'destructive',
        onPress: () =>
          void run(async () => {
            const result = await deleteAccount();
            session.setUser(null);
            setDeletedNote(result.forms === 'done' ? t('site.a_deleted_done') : t('site.a_deleted_partial', { email: SUPPORT_EMAIL }));
            setMode('deleted');
          }),
      },
    ]);
  };

  const statusLine = status ? (
    <Animated.View entering={FadeIn.duration(160)} style={[styles.status, { backgroundColor: status.kind === 'error' ? c.dangerBg : c.accentSoft }]} accessibilityLiveRegion="polite">
      <Icon name={status.kind === 'error' ? 'alert' : 'check'} size={18} color={status.kind === 'error' ? c.danger : c.primary} strokeWidth={2} />
      <Txt variant="callout" style={[styles.flex, { color: status.kind === 'error' ? c.danger : c.primary }]}>{status.text}</Txt>
    </Animated.View>
  ) : null;

  const facts = (
    <Row gap={space.sm} style={styles.wrap}>
      {[t('site.a_fact_free'), t('site.a_fact_nohealth'), t('site.a_fact_delete')].map(f => (
        <View key={f} style={[styles.fact, { backgroundColor: c.accentSoft }]}>
          <Icon name="check" size={14} color={c.primary} strokeWidth={2.4} />
          <Txt variant="caption" tone="primary">{f}</Txt>
        </View>
      ))}
    </Row>
  );

  const interestChips = (selected: string[], onToggle: (v: string) => void) => (
    <View style={styles.gapSm}>
      <Txt variant="subhead">{t('site.a_interests')} <Txt variant="subhead" tone="text3">{t('site.a_optional')}</Txt></Txt>
      <ChipGroup>
        {CONTENT.services.map(s => <Chip key={s.key} label={s[t.lang].chip} selected={selected.includes(s.interest)} onPress={() => onToggle(s.interest)} />)}
      </ChipGroup>
    </View>
  );
  const states = statesFor(t.lang).map(s => ({ value: s.code, label: s.name }));

  if (mode === 'profile' && session.user && details) {
    return (
      <Page keyboard>
        <View style={styles.gapSm}>
          <Txt variant="title" heading>{t('site.a_profile_title')}</Txt>
          <Txt variant="callout" tone="text2">{t('site.a_signed_in_as', { email: session.user.email })}</Txt>
          <Txt variant="footnote" tone="text3">{t('account.profileLead')}</Txt>
        </View>
        {statusLine}
        <Card style={styles.gapLg}>
          <Select label={t('site.a_state')} value={details.state} onChange={v => setDetails({ ...details, state: v })} options={states} placeholder={t('site.a_choose_state')} error={errors.state} />
          {interestChips(details.interests, v => setDetails({ ...details, interests: details.interests.includes(v) ? details.interests.filter(x => x !== v) : [...details.interests, v] }))}
          <View style={styles.gapSm}>
            <Txt variant="subhead">{t('site.a_language')}</Txt>
            <Segmented label={t('site.a_language')} value={details.language} onChange={v => setDetails({ ...details, language: v })} options={[{ value: 'en' as const, label: 'English' }, { value: 'es' as const, label: 'Español' }]} />
          </View>
          <View style={[styles.toggleBox, { borderColor: c.line }]}>
            <ToggleRow label={t('site.a_updates')} hint={t('site.a_updates_hint')} value={details.updates} onChange={v => setDetails({ ...details, updates: v })} />
          </View>
          <Button label={t('site.a_save')} onPress={saveDetails} loading={busy} full />
        </Card>
        <Card style={styles.gapMd}>
          <Txt variant="title3" heading>{t('site.a_password_title')}</Txt>
          <Field label={t('site.a_new_password')} hint={t('site.a_password_hint')} value={newPassword} onChangeText={setNewPassword} secure autoComplete="new-password" textContentType="newPassword" error={errors.newPassword} maxLength={128} />
          <Button label={t('site.a_save_password')} variant="secondary" onPress={savePassword} disabled={busy} style={styles.selfStart} />
        </Card>
        <Card tone="danger" style={styles.gapSm}>
          <Txt variant="title3" heading>{t('site.a_delete_title')}</Txt>
          <Txt variant="callout">{t('account.deleteLead')}</Txt>
          <Txt variant="footnote" tone="text2">{t('account.deleteJournalNote')}</Txt>
          <Button label={t('site.a_delete')} variant="danger" icon="trash" onPress={confirmDelete} disabled={busy} style={styles.selfStart} />
        </Card>
        <Button label={t('site.a_logout')} variant="ghost" icon="out" onPress={() => void session.logout().then(() => { setMode('login'); toast(t('site.a_logged_out')); })} />
      </Page>
    );
  }

  if (mode === 'deleted') {
    return (
      <Page>
        <View style={styles.center}>
          <View style={[styles.bigIcon, { backgroundColor: c.accentSoft }]}><Icon name="check" size={30} color={c.primary} strokeWidth={2.4} /></View>
          <Txt variant="title" center heading>{t('site.a_deleted_title')}</Txt>
          <Txt variant="body" tone="text2" center>{deletedNote}</Txt>
          <Txt variant="footnote" tone="text3" center>{t('account.deleteJournalNote')}</Txt>
          <Button label={t('common.done')} onPress={() => router.back()} />
        </View>
      </Page>
    );
  }

  if (mode === 'sent' || mode === 'forgotSent') {
    return (
      <Page>
        <View style={styles.center}>
          <View style={[styles.bigIcon, { backgroundColor: c.accentSoft }]}><Icon name="mail" size={30} color={c.primary} /></View>
          <Txt variant="title" center heading>{t('site.a_sent_title')}</Txt>
          <Txt variant="body" tone="text2" center>{mode === 'sent' ? t('site.a_sent_body', { email: emailValue.trim() }) : t('site.a_forgot_sent', { email: emailValue.trim() })}</Txt>
          <Txt variant="footnote" tone="text3" center>{t('site.a_sent_from')}</Txt>
          <Button label={t('site.a_back_login')} variant="ghost" onPress={() => { setMode('login'); setStatus(null); }} />
        </View>
      </Page>
    );
  }

  if (mode === 'forgot') {
    return (
      <Page keyboard>
        <Txt variant="title" heading>{t('site.a_forgot_title')}</Txt>
        <Txt variant="callout" tone="text2">{t('site.a_forgot_lead')}</Txt>
        {statusLine}
        <Field label={t('site.a_email')} value={emailValue} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" textContentType="emailAddress" autoCapitalize="none" error={errors.email} maxLength={254} />
        <Button label={t('site.a_send_link')} onPress={doForgot} loading={busy} full />
        <Button label={t('site.a_back_login')} variant="quiet" onPress={() => { setMode('login'); setStatus(null); }} />
      </Page>
    );
  }

  const creating = mode === 'create';
  return (
    <Page keyboard>
      <View style={styles.gapSm}>
        <Txt variant="eyebrow" tone="accent">{t('site.a_eyebrow')}</Txt>
        <Txt variant="title" heading>{creating ? t('account.createTitle') : t('account.loginTitle')}</Txt>
        <Txt variant="callout" tone="text2">{creating ? t('account.createLead') : t('site.a_lead')}</Txt>
      </View>
      {facts}
      <Segmented label={t('account.title')} value={creating ? 'create' : 'login'} onChange={v => { setMode(v); setStatus(null); setErrors({}); }} options={[{ value: 'login' as const, label: t('site.a_tab_login') }, { value: 'create' as const, label: t('site.a_tab_create') }]} />
      {statusLine}
      <Card style={styles.gapLg}>
        <Field label={t('site.a_email')} value={emailValue} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" textContentType={creating ? 'username' : 'emailAddress'} autoCapitalize="none" error={errors.email} maxLength={254} />
        <Field
          label={creating ? t('site.a_password') : t('site.a_password')}
          hint={creating ? t('site.a_password_hint') : undefined}
          value={password}
          onChangeText={setPassword}
          secure
          autoComplete={creating ? 'new-password' : 'current-password'}
          textContentType={creating ? 'newPassword' : 'password'}
          error={errors.password}
          maxLength={128}
          returnKeyType="go"
          onSubmitEditing={creating ? doCreate : doLogin}
        />
        {creating ? (
          <>
            <Select label={t('site.a_state')} value={state} onChange={setState} options={states} placeholder={t('site.a_choose_state')} error={errors.state} />
            {interestChips(interests, v => setInterests(list => (list.includes(v) ? list.filter(x => x !== v) : [...list, v])))}
            <Txt variant="footnote" tone="text3">{t('account.createNote')}</Txt>
            <Button label={t('waitlist.privacy')} variant="quiet" size="sm" iconRight="external" onPress={() => void openPage(LINKS.privacy)} style={styles.selfStart} />
          </>
        ) : null}
        <Button label={creating ? t('site.a_create') : t('site.a_login')} onPress={creating ? doCreate : doLogin} loading={busy} full />
        {!creating ? <Button label={t('site.a_forgot_link')} variant="quiet" onPress={() => { setMode('forgot'); setStatus(null); }} /> : null}
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flexWrap: 'wrap' },
  gapSm: { gap: space.sm },
  gapMd: { gap: space.md },
  gapLg: { gap: space.lg },
  selfStart: { alignSelf: 'flex-start' },
  status: { flexDirection: 'row', gap: space.sm, padding: space.md, borderRadius: radius.md, alignItems: 'flex-start' },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  toggleBox: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, overflow: 'hidden' },
  center: { alignItems: 'center', gap: space.md, paddingTop: space.x3 },
  bigIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
});
