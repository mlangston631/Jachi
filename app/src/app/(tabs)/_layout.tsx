import { NativeTabs } from 'expo-router/native-tabs';

import { useT } from '@/i18n';
import { font, useTheme } from '@/theme';

/** Native tab bar: Liquid Glass on iOS 26, Material on Android. SF Symbols on iPhone, Material Symbols on Android. */
export default function TabsLayout() {
  const t = useT();
  const c = useTheme();
  return (
    <NativeTabs
      backgroundColor={c.bg}
      tintColor={c.primary}
      iconColor={{ default: c.text3, selected: c.primary }}
      indicatorColor={c.accentSoft}
      labelStyle={{ default: { fontFamily: font.medium, color: c.text3 }, selected: { fontFamily: font.semibold, color: c.primary } }}
      minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tabs.today')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'leaf', selected: 'leaf.fill' }} md="eco" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="journal">
        <NativeTabs.Trigger.Label>{t('tabs.journal')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book.closed', selected: 'book.closed.fill' }} md="menu_book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="meds">
        <NativeTabs.Trigger.Label>{t('tabs.meds')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'pills', selected: 'pills.fill' }} md="medication" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="care">
        <NativeTabs.Trigger.Label>{t('tabs.care')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="stethoscope" md="stethoscope" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="guide">
        <NativeTabs.Trigger.Label>{t('tabs.guide')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sparkles" md="auto_awesome" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
