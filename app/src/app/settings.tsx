import * as Application from 'expo-application';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { useToast } from '@/components/feedback';
import { Group, ListRow, Segmented, TimeStepper, ToggleRow } from '@/components/forms';
import { Page } from '@/components/Screen';
import { Txt } from '@/components/ui';
import { useT } from '@/i18n';
import { dayKey } from '@/lib/dates';
import { eraseJournal, everything } from '@/lib/db';
import { journalCsv, journalJson } from '@/lib/exporter';
import { LINKS, SITE } from '@/lib/content';
import { openPage } from '@/lib/links';
import { canLock, lockMethod, unlock } from '@/lib/lock';
import { askPermission, cancelAll } from '@/lib/notify';
import { shareTextFile } from '@/lib/share';
import { usePrefs, type Appearance, type LangPref, type Units } from '@/state/prefs';
import { useSession } from '@/state/session';
import { space } from '@/theme';

export default function Settings() {
  const t = useT();
  const p = usePrefs();
  const session = useSession();
  const toast = useToast(s => s.show);
  const [lock, setLock] = useState<{ can: boolean; method: string }>({ can: false, method: '' });
  const [exporting, setExporting] = useState(false);
  const version = Application.nativeApplicationVersion ?? '1.0.0';
  const build = Application.nativeBuildVersion ?? '1';

  useEffect(() => {
    let alive = true;
    void Promise.all([canLock(), lockMethod(t)]).then(([can, method]) => alive && setLock({ can, method }));
    return () => {
      alive = false;
    };
  }, [t]);

  const toggleLock = async (on: boolean) => {
    if (!on) return p.set({ lock: false });
    if (await unlock(t)) p.set({ lock: true });
  };

  const toggleReminder = async (on: boolean) => {
    if (!on) return p.set({ checkinReminder: false });
    const ok = await askPermission();
    p.set({ checkinReminder: ok });
    if (!ok) toast(t('meds.remindersOff'), 'bell');
  };

  const exportAs = async (kind: 'csv' | 'json') => {
    if (exporting) return;
    setExporting(true);
    try {
      const data = await everything();
      const stamp = dayKey();
      if (kind === 'csv') {
        await shareTextFile(`jachi-journal-${stamp}.csv`, journalCsv(data), 'text/csv', 'public.comma-separated-values-text', t('settings.export'));
      } else {
        await shareTextFile(`jachi-journal-${stamp}.json`, journalJson(data, version), 'application/json', 'public.json', t('settings.export'));
      }
    } catch {
      toast(t('settings.exportFailed'), 'alert');
    } finally {
      setExporting(false);
    }
  };

  const wipe = () => {
    Alert.alert(t('settings.wipe'), t('settings.wipeConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await eraseJournal();
          await cancelAll();
          p.set({ milestonesSeen: [], checkinReminder: false });
          toast(t('settings.wipeDone'), 'trash');
        },
      },
    ]);
  };

  const appearance: { value: Appearance; label: string }[] = [
    { value: 'system', label: t('settings.appearanceSystem') },
    { value: 'light', label: t('settings.appearanceLight') },
    { value: 'dark', label: t('settings.appearanceDark') },
  ];
  const languages: { value: LangPref; label: string }[] = [
    { value: 'system', label: t('settings.languageSystem') },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
  ];
  const units: { value: Units; label: string }[] = [
    { value: 'us', label: 'US' },
    { value: 'metric', label: t.lang === 'es' ? 'Métricas' : 'Metric' },
  ];

  return (
    <Page>
      <Group title={t('settings.account')}>
        {session.status === 'signedIn' && session.user ? (
          <ListRow icon="user" label={t('settings.manage')} detail={session.user.email} onPress={() => router.push('/account')} />
        ) : (
          <ListRow icon="user" label={t('settings.accountSignedOut')} detail={t('settings.accountSignedOutBody')} onPress={() => router.push('/account')} />
        )}
      </Group>

      <Group title={t('settings.privacy')} footer={lock.can ? undefined : t('settings.lockUnavailable')}>
        <ToggleRow icon="face" label={t('settings.lock', { method: lock.method || 'Face ID' })} hint={t('settings.lockHint', { method: lock.method || 'Face ID' })} value={p.lock} onChange={v => void toggleLock(v)} disabled={!lock.can} />
        <ToggleRow icon="eye" label={t('settings.medNames')} hint={t('settings.medNamesHint')} value={p.medNames} onChange={v => p.set({ medNames: v })} />
      </Group>

      <Group title={t('settings.reminders')}>
        <ToggleRow icon="bell" label={t('settings.checkinReminder')} value={p.checkinReminder} onChange={v => void toggleReminder(v)} />
        {p.checkinReminder ? (
          <View style={styles.pad}>
            <Txt variant="subhead" tone="text2">{t('settings.reminderTime')}</Txt>
            <TimeStepper label={t('settings.reminderTime')} value={p.checkinTime} onChange={v => p.set({ checkinTime: v })} />
          </View>
        ) : null}
      </Group>

      <Group title={t('settings.display')}>
        <View style={styles.pad}>
          <Txt variant="subhead" tone="text2">{t('settings.appearance')}</Txt>
          <Segmented label={t('settings.appearance')} value={p.appearance} onChange={v => p.set({ appearance: v })} options={appearance} />
        </View>
        <View style={styles.pad}>
          <Txt variant="subhead" tone="text2">{t('settings.language')}</Txt>
          <Segmented label={t('settings.language')} value={p.language} onChange={v => p.set({ language: v })} options={languages} />
        </View>
        <View style={styles.pad}>
          <Txt variant="subhead" tone="text2">{t('settings.units')}</Txt>
          <Segmented label={t('settings.units')} value={p.units} onChange={v => p.set({ units: v })} options={units} />
          <Txt variant="footnote" tone="text3">{p.units === 'us' ? t('settings.unitsUS') : t('settings.unitsMetric')}</Txt>
        </View>
        <ToggleRow icon="sparkles" label={t('settings.haptics')} value={p.haptics} onChange={v => p.set({ haptics: v })} />
      </Group>

      <Group title={t('settings.data')} footer={t('settings.exportHint')}>
        <ListRow icon="download" label={`${t('settings.export')} (CSV)`} onPress={() => void exportAs('csv')} />
        <ListRow icon="file" label={`${t('settings.export')} (JSON)`} onPress={() => void exportAs('json')} />
        <ListRow icon="trash" label={t('settings.wipe')} detail={t('settings.wipeHint')} onPress={wipe} danger />
      </Group>

      <Group title={t('settings.help')}>
        <ListRow icon="mail" label={t('settings.contact')} onPress={() => router.push('/ticket')} />
        <ListRow icon="question" label={t('settings.faq')} onPress={() => router.navigate('/care')} />
        <ListRow icon="globe" label={t('settings.website')} external onPress={() => void openPage(t.lang === 'es' ? `${SITE}/es/` : `${SITE}/`)} />
      </Group>

      <Group title={t('settings.legal')}>
        <ListRow icon="shield" label={t('settings.privacyPolicy')} external onPress={() => void openPage(LINKS.privacy)} />
        <ListRow icon="file" label={t('settings.terms')} external onPress={() => void openPage(LINKS.terms)} />
        <ListRow icon="info" label={t('settings.tmb')} external onPress={() => void openPage(LINKS.tmb)} />
      </Group>

      <Group title={t('settings.about')} footer={t('settings.company')}>
        <ListRow icon="leaf" label={t('common.appName')} value={t('settings.version', { version, build })} />
        <ListRow icon="refresh" label={t('settings.replayIntro')} onPress={() => { p.set({ onboarded: false }); router.replace('/onboarding'); }} />
      </Group>
    </Page>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.sm },
});
