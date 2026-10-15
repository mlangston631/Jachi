/** Core building blocks: text, pressables, buttons, cards, tags. */
import type { ReactNode } from 'react';
import {
  ActivityIndicator, Pressable, StyleSheet, Text, View,
  type GestureResponderEvent, type PressableProps, type StyleProp, type TextProps, type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { HIT, radius, space, type, useTheme, type Palette, type TypeVariant } from '@/theme';
import { Icon } from './Icon';

export type Tone = 'text' | 'text2' | 'text3' | 'primary' | 'accent' | 'danger' | 'warn' | 'success' | 'onHero' | 'onHero2' | 'onPrimary';

const MAX_SCALE: Partial<Record<TypeVariant, number>> = {
  hero: 1.3, largeTitle: 1.35, title: 1.4, number: 1.3, numberSmall: 1.4, eyebrow: 1.6, caption: 1.8, button: 1.6,
};

type TxtProps = TextProps & { variant?: TypeVariant; tone?: Tone; center?: boolean; heading?: boolean };

export function Txt({ variant = 'body', tone = 'text', center, heading, style, ...rest }: TxtProps) {
  const c = useTheme();
  return (
    <Text
      maxFontSizeMultiplier={MAX_SCALE[variant] ?? 2}
      accessibilityRole={heading ? 'header' : rest.accessibilityRole}
      {...rest}
      style={[type[variant], { color: c[tone] }, center ? styles.center : null, style]}
    />
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 18, stiffness: 320, mass: 0.6 };

type TapProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  feedback?: 'tap' | 'light' | 'medium' | 'success' | null;
  scaleTo?: number;
  children?: ReactNode;
};

/** A pressable that gives a soft spring and a light haptic. Respects Reduce Motion. */
export function Tap({ style, feedback = 'tap', scaleTo = 0.97, onPress, onPressIn, onPressOut, children, disabled, ...rest }: TapProps) {
  const reduce = useReducedMotion();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...rest}
      disabled={disabled}
      accessibilityState={{ disabled: !!disabled, ...rest.accessibilityState }}
      hitSlop={rest.hitSlop ?? 6}
      onPressIn={(e: GestureResponderEvent) => {
        if (!reduce) scale.set(withSpring(scaleTo, SPRING));
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        scale.set(withSpring(1, SPRING));
        onPressOut?.(e);
      }}
      onPress={(e: GestureResponderEvent) => {
        if (feedback) haptic[feedback]();
        onPress?.(e);
      }}
      style={[style, animated]}>
      {children}
    </AnimatedPressable>
  );
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'light' | 'quiet';

function buttonColors(c: Palette, v: ButtonVariant) {
  switch (v) {
    case 'primary': return { bg: c.primary, fg: c.onPrimary, border: 'transparent' };
    case 'secondary': return { bg: c.accentSoft, fg: c.primary, border: 'transparent' };
    case 'ghost': return { bg: 'transparent', fg: c.primary, border: c.lineStrong };
    case 'danger': return { bg: c.danger, fg: c.onDanger, border: 'transparent' };
    case 'light': return { bg: '#FFFFFF', fg: '#123328', border: 'transparent' };
    case 'quiet': return { bg: 'transparent', fg: c.primary, border: 'transparent' };
  }
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconRight?: string;
  full?: boolean;
  loading?: boolean;
  disabled?: boolean;
  hint?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
};

export function Button({ label, onPress, variant = 'primary', size = 'md', icon, iconRight, full, loading, disabled, hint, style, accessibilityLabel, testID }: ButtonProps) {
  const c = useTheme();
  const col = buttonColors(c, variant);
  const height = size === 'lg' ? 56 : size === 'sm' ? 40 : 50;
  const off = disabled || loading;
  return (
    <Tap
      testID={testID}
      onPress={onPress}
      disabled={off}
      feedback={variant === 'danger' ? 'medium' : 'light'}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      style={[
        styles.button,
        { minHeight: height, backgroundColor: col.bg, borderColor: col.border, paddingHorizontal: size === 'sm' ? space.lg : space.xl },
        variant === 'quiet' ? styles.quiet : null,
        full ? styles.full : null,
        off && !loading ? styles.disabled : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={col.fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={size === 'sm' ? 18 : 20} color={col.fg} strokeWidth={2} /> : null}
          <Txt variant="button" style={{ color: col.fg, fontSize: size === 'sm' ? 15 : 16 }} numberOfLines={2} center>
            {label}
          </Txt>
          {iconRight ? <Icon name={iconRight} size={size === 'sm' ? 18 : 20} color={col.fg} strokeWidth={2} /> : null}
        </>
      )}
    </Tap>
  );
}

export function IconButton({ icon, label, onPress, tone = 'primary', size = 44, filled }: { icon: string; label: string; onPress: () => void; tone?: 'primary' | 'text2' | 'onHero'; size?: number; filled?: boolean }) {
  const c = useTheme();
  return (
    <Tap
      onPress={onPress}
      accessibilityLabel={label}
      style={[styles.iconButton, { width: Math.max(size, HIT - 4), height: Math.max(size, HIT - 4) }, filled ? { backgroundColor: c.surface2 } : null]}>
      <Icon name={icon} size={22} color={c[tone]} strokeWidth={1.9} />
    </Tap>
  );
}

type CardTone = 'surface' | 'accent' | 'hero' | 'warn' | 'danger' | 'plain';

export function Card({ children, onPress, tone = 'surface', style, accessibilityLabel, accessibilityHint, padded = true }: {
  children: ReactNode; onPress?: () => void; tone?: CardTone; style?: StyleProp<ViewStyle>; accessibilityLabel?: string; accessibilityHint?: string; padded?: boolean;
}) {
  const c = useTheme();
  const bg: Record<CardTone, ViewStyle> = {
    surface: { backgroundColor: c.surface, borderColor: c.line, boxShadow: c.shadow },
    plain: { backgroundColor: c.surface2, borderColor: 'transparent' },
    accent: { backgroundColor: c.accentSoft, borderColor: 'transparent' },
    hero: { backgroundColor: c.hero, experimental_backgroundImage: c.heroGradient, borderColor: 'transparent', boxShadow: c.shadowStrong },
    warn: { backgroundColor: c.warnBg, borderColor: 'transparent' },
    danger: { backgroundColor: c.dangerBg, borderColor: 'transparent' },
  };
  const body = [styles.card, padded ? styles.cardPad : null, bg[tone], style];
  if (onPress) {
    return (
      <Tap onPress={onPress} style={body} scaleTo={0.985} accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint}>
        {children}
      </Tap>
    );
  }
  return (
    <View style={body} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}

export function Tag({ label, tone = 'accent', icon }: { label: string; tone?: 'accent' | 'warn' | 'danger' | 'hero' | 'neutral'; icon?: string }) {
  const c = useTheme();
  const map = {
    accent: { bg: c.accentSoft, fg: c.primary },
    warn: { bg: c.warnBg, fg: c.warn },
    danger: { bg: c.dangerBg, fg: c.danger },
    hero: { bg: 'rgba(255,255,255,0.14)', fg: '#FFFFFF' },
    neutral: { bg: c.surface2, fg: c.text2 },
  }[tone];
  return (
    <View style={[styles.tag, { backgroundColor: map.bg }]}>
      {icon ? <Icon name={icon} size={14} color={map.fg} strokeWidth={2} /> : null}
      <Txt variant="caption" style={{ color: map.fg }} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

export function Divider({ inset = 0 }: { inset?: number }) {
  const c = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.lineStrong, marginLeft: inset }} />;
}

export function Row({ children, gap = space.md, style, center = true }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle>; center?: boolean }) {
  return <View style={[{ flexDirection: 'row', alignItems: center ? 'center' : 'flex-start', gap }, style]}>{children}</View>;
}

export function Gap({ size = space.lg }: { size?: number }) {
  return <View style={{ height: size }} />;
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingVertical: space.sm,
  },
  quiet: { paddingHorizontal: space.sm },
  full: { alignSelf: 'stretch' },
  disabled: { opacity: 0.45 },
  iconButton: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  cardPad: { padding: space.xl },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
});
