/**
 * Web preview only (screenshots and design checks): a floating glass tab bar at the bottom, close to the phone
 * apps' native bars, with the same five tabs.
 */
import { router, usePathname } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT, type Key } from '@/i18n';
import { radius, useTheme } from '@/theme';
import { Icon } from './Icon';
import { Tap, Txt } from './ui';

const TABS: { name: string; href: string; label: Key; icon: string }[] = [
  { name: 'index', href: '/', label: 'tabs.today', icon: 'leaf' },
  { name: 'journal', href: '/journal', label: 'tabs.journal', icon: 'book' },
  { name: 'meds', href: '/meds', label: 'tabs.meds', icon: 'pill' },
  { name: 'care', href: '/care', label: 'tabs.care', icon: 'steth' },
  { name: 'guide', href: '/guide', label: 'tabs.guide', icon: 'sparkles' },
];

function GlassBar() {
  const t = useT();
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const path = usePathname();
  const dark = c.scheme === 'dark';
  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        {
          bottom: insets.bottom + 18,
          backgroundColor: dark ? 'rgba(29,44,36,0.78)' : 'rgba(255,255,255,0.78)',
          borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.9)',
          boxShadow: dark ? '0px 10px 30px rgba(0,0,0,0.45)' : '0px 10px 30px rgba(13,36,28,0.16), 0px 1px 2px rgba(13,36,28,0.08)',
        },
        // Frosted glass in the browser.
        { backdropFilter: 'blur(22px) saturate(180%)' } as object,
      ]}>
      {TABS.map(tab => {
        const on = tab.href === '/' ? path === '/' : path.startsWith(tab.href);
        return (
          <Tap
            key={tab.name}
            onPress={() => router.navigate(tab.href)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t(tab.label)}
            scaleTo={0.92}
            style={[styles.item, on ? { backgroundColor: dark ? 'rgba(155,193,163,0.16)' : 'rgba(30,74,59,0.08)' } : null]}>
            <Icon name={tab.icon} size={23} color={on ? c.primary : c.text3} strokeWidth={on ? 2.1 : 1.75} />
            <Txt variant="caption" style={{ color: on ? c.primary : c.text3, fontSize: 10.5 }}>{t(tab.label)}</Txt>
          </Tap>
        );
      })}
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={() => <GlassBar />}>
      {TABS.map(tab => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: 66,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  item: { flex: 1, height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', gap: 2 },
});
