/** Rings, charts, mood faces and the week strip. Drawn with SVG; animations respect Reduce Motion. */
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { linePath, linePoints } from '@/lib/chart';
import { radius, space, useTheme } from '@/theme';
import { Txt } from './ui';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type RingProps = { progress: number; size?: number; stroke?: number; color?: string; track?: string; children?: React.ReactNode; label: string; value: string };

/** A progress ring that fills smoothly. */
export const Ring = memo(function Ring({ progress, size = 92, stroke = 9, color, track, children, label, value }: RingProps) {
  const c = useTheme();
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const p = useSharedValue(reduce ? progress : 0);
  useEffect(() => {
    p.set(reduce ? progress : withTiming(Math.min(1, Math.max(0, progress)), { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [progress, reduce, p]);
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: len * (1 - p.get()) }));
  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ text: value }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={track ?? c.surface2} strokeWidth={stroke} fill="none" />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color ?? c.primary}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${len} ${len}`}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} importantForAccessibility="no-hide-descendants">{children}</View>
    </View>
  );
});

type LineChartProps = { values: (number | null)[]; min: number; max: number; color: string; height?: number; width: number; label: string; dots?: boolean };

export const LineChart = memo(function LineChart({ values, min, max, color, height = 96, width, label, dots = true }: LineChartProps) {
  const c = useTheme();
  const d = linePath(values, width, height, min, max, 6);
  const points = dots && values.length <= 31 ? linePoints(values, width, height, min, max, 6) : [];
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label}>
      <Svg width={width} height={height}>
        {[0, 0.5, 1].map(f => (
          <Line key={f} x1={0} x2={width} y1={6 + f * (height - 12)} y2={6 + f * (height - 12)} stroke={c.line} strokeWidth={1} />
        ))}
        <Path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.map(pt => (
          <Circle key={pt.i} cx={pt.x} cy={pt.y} r={3.2} fill={c.surface} stroke={color} strokeWidth={2} />
        ))}
      </Svg>
    </View>
  );
});

type BarsProps = { values: (number | null)[]; max: number; color: string; height?: number; width: number; label: string };

export const Bars = memo(function Bars({ values, max, color, height = 96, width, label }: BarsProps) {
  const c = useTheme();
  const n = Math.max(values.length, 1);
  const gap = n > 40 ? 1 : n > 14 ? 2 : 6;
  const w = Math.max(2, (width - gap * (n - 1)) / n);
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label}>
      <Svg width={width} height={height}>
        <Line x1={0} x2={width} y1={height - 1} y2={height - 1} stroke={c.line} strokeWidth={1} />
        {values.map((v, i) => {
          if (v === null) return null;
          const h = Math.max(3, (Math.min(v, max) / max) * (height - 6));
          const x = i * (w + gap);
          const rr = Math.min(w / 2, 5);
          return <Path key={i} d={`M${x} ${height}V${height - h + rr}a${rr} ${rr} 0 0 1 ${rr} ${-rr}h${w - 2 * rr}a${rr} ${rr} 0 0 1 ${rr} ${rr}V${height}z`} fill={color} />;
        })}
      </Svg>
    </View>
  );
});

/** A mood face from 1 (very low) to 5 (great): the mouth curves with the level. */
export const MoodFace = memo(function MoodFace({ level, size = 40, color, filled }: { level: number; size?: number; color: string; filled?: boolean }) {
  const k = (level - 3) * 2.4;
  const ink = filled ? '#FFFFFF' : color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false} importantForAccessibility="no-hide-descendants">
      <Circle cx={12} cy={12} r={10} fill={filled ? color : 'none'} stroke={color} strokeWidth={1.6} />
      <Circle cx={8.8} cy={10} r={1.15} fill={ink} />
      <Circle cx={15.2} cy={10} r={1.15} fill={ink} />
      <Path d={`M8 ${15.2 - k / 3}Q12 ${15.2 + k} 16 ${15.2 - k / 3}`} fill="none" stroke={ink} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
});

/** Energy as five rising bars, filled up to the level. */
export const EnergyBars = memo(function EnergyBars({ level, size = 40, color, track }: { level: number; size?: number; color: string; track: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false} importantForAccessibility="no-hide-descendants">
      {[0, 1, 2, 3, 4].map(i => (
        <Path key={i} d={`M${3.2 + i * 4.1} 20V${16 - i * 2.8}`} stroke={i < level ? color : track} strokeWidth={2.6} strokeLinecap="round" />
      ))}
    </Svg>
  );
});

type Day = { day: string; done: boolean; future: boolean; today: boolean };

export function WeekStrip({ days, labels, a11y }: { days: Day[]; labels: string[]; a11y: (d: Day, i: number) => string }) {
  const c = useTheme();
  return (
    <View style={styles.week}>
      {days.map((d, i) => (
        <View key={d.day} style={styles.weekDay} accessible accessibilityLabel={a11y(d, i)}>
          <Txt variant="caption" tone={d.today ? 'primary' : 'text3'}>{labels[i]}</Txt>
          <View
            style={[
              styles.weekDot,
              d.done ? { backgroundColor: c.primary } : { borderWidth: 1.5, borderColor: d.future ? c.line : c.lineStrong },
              d.today && !d.done ? { borderColor: c.primary, borderWidth: 2 } : null,
            ]}>
            {d.done ? (
              <Svg width={14} height={14} viewBox="0 0 24 24">
                <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={c.onPrimary} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

export function Stat({ label, value, unit, tone = 'text' }: { label: string; value: string; unit?: string; tone?: 'text' | 'onHero' }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}${unit ? ` ${unit}` : ''}`}>
      <Txt variant="caption" tone={tone === 'onHero' ? 'onHero2' : 'text3'}>{label}</Txt>
      <View style={styles.statRow}>
        <Txt variant="numberSmall" tone={tone}>{value}</Txt>
        {unit ? <Txt variant="footnote" tone={tone === 'onHero' ? 'onHero2' : 'text3'}>{unit}</Txt> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { alignItems: 'center', gap: 6, minWidth: 30 },
  weekDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stat: { gap: 2, flex: 1 },
  statRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
});

export const chartRadius = radius.md;
export const chartGap = space.md;
