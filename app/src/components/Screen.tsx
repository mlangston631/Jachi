/** Screen containers: tab screens with the serif title, pages under a native header, and modal sheets. */
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type RefreshControlProps } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { space, useTheme } from '@/theme';
import { Icon } from './Icon';
import { Tap, Txt } from './ui';

export const TAB_BAR = Platform.select({ ios: 54, android: 84, default: 92 });
export const MAX_WIDTH = 640;

type TabScreenProps = {
  title: string;
  eyebrow?: string;
  right?: ReactNode;
  children: ReactNode;
  refresh?: React.ReactElement<RefreshControlProps>;
  scrollRef?: React.Ref<React.ComponentRef<typeof ScrollView>>;
};

export function TabScreen({ title, eyebrow, right, children, refresh, scrollRef }: TabScreenProps) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      ref={scrollRef}
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={[styles.tabContent, { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + TAB_BAR + space.x3 }]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={refresh}
      showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.flex}>
            {eyebrow ? <Txt variant="eyebrow" tone="accent">{eyebrow}</Txt> : null}
            <Txt variant="largeTitle" heading>{title}</Txt>
          </View>
          {right}
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

/** A page pushed on the stack (native header above). */
export function Page({ children, keyboard }: { children: ReactNode; keyboard?: boolean }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const body = (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + space.x4 }]}>
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
  if (!keyboard || Platform.OS !== 'android') return body;
  return <KeyboardAvoidingView style={styles.flex} behavior="height">{body}</KeyboardAvoidingView>;
}

type ModalProps = { title: string; children: ReactNode; footer?: ReactNode; onClose?: () => void; closeLabel?: string };

/** A sheet presented over the app, with its own header and a pinned footer for the main action. */
export function ModalScreen({ title, children, footer, onClose, closeLabel }: ModalProps) {
  const c = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const close = onClose ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  const top = Platform.OS === 'ios' ? space.sm : insets.top + space.xs;
  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: c.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {Platform.OS === 'ios' ? <View style={[styles.grabber, { backgroundColor: c.lineStrong }]} /> : null}
      <View style={[styles.modalHead, { paddingTop: top }]}>
        <Txt variant="title2" heading style={styles.flex} numberOfLines={2}>{title}</Txt>
        <Tap onPress={close} accessibilityLabel={closeLabel ?? t('common.close')} style={[styles.closeBtn, { backgroundColor: c.surface2 }]}>
          <Icon name="x" size={20} color={c.text} strokeWidth={2} />
        </Tap>
      </View>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.modalBody, { paddingBottom: footer ? space.xl : insets.bottom + space.x3 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={!footer}>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
      {footer ? (
        <Animated.View entering={FadeIn.duration(200)} style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.lg), borderTopColor: c.line, backgroundColor: c.bg }]}>
          <View style={styles.inner}>{footer}</View>
        </Animated.View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

export function Section({ title, action, children, gap = space.md }: { title?: string; action?: ReactNode; children: ReactNode; gap?: number }) {
  return (
    <View style={{ gap }}>
      {title || action ? (
        <View style={styles.sectionHead}>
          {title ? <Txt variant="title3" heading style={styles.flex}>{title}</Txt> : <View style={styles.flex} />}
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabContent: { paddingHorizontal: space.xl },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: space.xxl },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, marginBottom: -space.sm },
  page: { paddingHorizontal: space.xl, paddingTop: space.lg },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginTop: space.sm },
  modalHead: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.xl, paddingBottom: space.md },
  closeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  modalBody: { paddingHorizontal: space.xl, paddingTop: space.sm },
  footer: { paddingHorizontal: space.xl, paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
