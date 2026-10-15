/** Form controls: text fields, chips, segmented choices, steppers, a time picker, switches and list rows. */
import { useState, type ReactNode } from 'react';
import {
  FlatList, Modal, Platform, StyleSheet, Switch, TextInput, View,
  type KeyboardTypeOptions, type ReturnKeyTypeOptions, type TextInputProps,
} from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { clock, minutesOf, timeFromMinutes } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { HIT, radius, space, type, useTheme } from '@/theme';
import { NO_OUTLINE } from '@/theme/tokens';
import { Icon } from './Icon';
import { Divider, Tap, Txt } from './ui';

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  secure?: boolean;
  maxLength?: number;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  suffix?: string;
  inputRef?: React.Ref<React.ComponentRef<typeof TextInput>>;
  testID?: string;
};

export function Field(p: FieldProps) {
  const c = useT();
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const border = p.error ? theme.danger : focused ? theme.focus : theme.lineStrong;
  return (
    <View style={styles.field}>
      <Txt variant="subhead" tone="text" nativeID={`${p.testID ?? p.label}-label`}>
        {p.label}
        {p.optional ? <Txt variant="subhead" tone="text3">{` ${c('common.optional')}`}</Txt> : null}
      </Txt>
      {p.hint ? <Txt variant="footnote" tone="text3">{p.hint}</Txt> : null}
      <View style={[styles.inputWrap, { borderColor: border, backgroundColor: theme.surface }, focused ? { borderWidth: 2 } : null]}>
        <TextInput
          ref={p.inputRef}
          testID={p.testID}
          value={p.value}
          onChangeText={p.onChangeText}
          placeholder={p.placeholder}
          placeholderTextColor={theme.text3}
          multiline={p.multiline}
          keyboardType={p.keyboardType}
          autoComplete={p.autoComplete}
          textContentType={p.textContentType}
          autoCapitalize={p.autoCapitalize}
          autoCorrect={p.secure || p.keyboardType === 'email-address' ? false : undefined}
          secureTextEntry={p.secure && !show}
          maxLength={p.maxLength}
          returnKeyType={p.returnKeyType}
          onSubmitEditing={p.onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={p.label}
          accessibilityHint={p.error ?? p.hint}
          style={[type.body, NO_OUTLINE, styles.input, { color: theme.text }, p.multiline ? styles.multiline : null]}
          selectionColor={theme.accent}
          maxFontSizeMultiplier={1.8}
        />
        {p.suffix ? <Txt variant="callout" tone="text3" style={styles.suffix}>{p.suffix}</Txt> : null}
        {p.secure ? (
          <Tap onPress={() => setShow(s => !s)} accessibilityLabel={show ? c('site.a_hide_password') : c('site.a_show_password')} style={styles.eye} feedback={null}>
            <Icon name={show ? 'eye-off' : 'eye'} size={20} color={theme.text2} />
          </Tap>
        ) : null}
      </View>
      {p.error ? (
        <Animated.View entering={FadeIn.duration(160)} style={styles.errorRow} accessibilityLiveRegion="polite">
          <Icon name="alert" size={16} color={theme.danger} strokeWidth={2} />
          <Txt variant="footnote" tone="danger" style={styles.flex}>{p.error}</Txt>
        </Animated.View>
      ) : null}
    </View>
  );
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected: boolean; onPress: () => void; icon?: string }) {
  const c = useTheme();
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      scaleTo={0.95}
      style={[
        styles.chip,
        selected ? { backgroundColor: c.primary, borderColor: c.primary } : { backgroundColor: c.surface, borderColor: c.lineStrong },
      ]}>
      {selected ? <Icon name="check" size={16} color={c.onPrimary} strokeWidth={2.2} /> : icon ? <Icon name={icon} size={16} color={c.text2} /> : null}
      <Txt variant="subhead" style={{ color: selected ? c.onPrimary : c.text }}>{label}</Txt>
    </Tap>
  );
}

export function ChipGroup({ children }: { children: ReactNode }) {
  return <View style={styles.chips}>{children}</View>;
}

type SegOption<V extends string> = { value: V; label: string };

/** A small set of mutually exclusive choices (radio group). */
export function Segmented<V extends string>({ options, value, onChange, label }: { options: SegOption<V>[]; value: V; onChange: (v: V) => void; label: string }) {
  const c = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={[styles.seg, { backgroundColor: c.surface2 }]}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <Tap
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on, checked: on }}
            accessibilityLabel={o.label}
            scaleTo={0.97}
            style={[styles.segItem, on ? { backgroundColor: c.surface, boxShadow: c.shadow } : null]}>
            <Txt variant="subhead" tone={on ? 'text' : 'text2'} numberOfLines={1} center>{o.label}</Txt>
          </Tap>
        );
      })}
    </View>
  );
}

/** Yes / No / Not sure choices as large buttons, for safety questions. */
export function Choices<V extends string>({ options, value, onChange, label }: { options: SegOption<V>[]; value: V | ''; onChange: (v: V) => void; label: string }) {
  const c = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.choices}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <Tap
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on, checked: on }}
            style={[styles.choice, { borderColor: on ? c.primary : c.lineStrong, backgroundColor: on ? c.accentSoft : c.surface }]}>
            <View style={[styles.radio, { borderColor: on ? c.primary : c.text3 }]}>{on ? <View style={[styles.radioDot, { backgroundColor: c.primary }]} /> : null}</View>
            <Txt variant="headline">{o.label}</Txt>
          </Tap>
        );
      })}
    </View>
  );
}

type StepperProps = { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; format: (v: number) => string };

/** − value + control, adjustable with screen readers (swipe up/down). */
export function Stepper({ label, value, onChange, min, max, step, format }: StepperProps) {
  const c = useTheme();
  const t = useT();
  const set = (v: number) => {
    const next = Math.min(max, Math.max(min, Math.round(v / step) * step));
    if (next !== value) {
      haptic.tap();
      onChange(Number(next.toFixed(2)));
    }
  };
  return (
    <View
      style={styles.stepper}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: format(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={e => set(e.nativeEvent.actionName === 'increment' ? value + step : value - step)}>
      <Tap onPress={() => set(value - step)} disabled={value <= min} accessibilityLabel={t('common.decrease')} style={[styles.stepBtn, { backgroundColor: c.surface2 }]} feedback={null}>
        <Icon name="minus" size={22} color={c.primary} strokeWidth={2.2} />
      </Tap>
      <Txt variant="numberSmall" style={styles.stepValue} center>{format(value)}</Txt>
      <Tap onPress={() => set(value + step)} disabled={value >= max} accessibilityLabel={t('common.increase')} style={[styles.stepBtn, { backgroundColor: c.surface2 }]} feedback={null}>
        <Icon name="plus" size={22} color={c.primary} strokeWidth={2.2} />
      </Tap>
    </View>
  );
}

/** A compact time picker: hours, minutes (5-minute steps) and AM/PM. */
export function TimeStepper({ label, value, onChange }: { label: string; value: string; onChange: (time: string) => void }) {
  const t = useT();
  const c = useTheme();
  const mins = minutesOf(value);
  const shift = (delta: number) => {
    haptic.tap();
    onChange(timeFromMinutes(mins + delta));
  };
  const text = clock(value, t('common.am'), t('common.pm'));
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={e => shift(e.nativeEvent.actionName === 'increment' ? 15 : -15)}
      style={[styles.time, { backgroundColor: c.surface2 }]}>
      <Tap onPress={() => shift(-60)} accessibilityLabel={`${t('common.decrease')} 1 h`} style={styles.timeBtn} feedback={null}>
        <Icon name="minus" size={18} color={c.primary} strokeWidth={2.2} />
      </Tap>
      <View style={styles.timeMid}>
        <Txt variant="numberSmall" center>{text}</Txt>
        <View style={styles.timeFine}>
          <Tap onPress={() => shift(-5)} accessibilityLabel={`${t('common.decrease')} 5 min`} style={styles.timeFineBtn} feedback={null}>
            <Txt variant="caption" tone="primary">−5 min</Txt>
          </Tap>
          <Tap onPress={() => shift(5)} accessibilityLabel={`${t('common.increase')} 5 min`} style={styles.timeFineBtn} feedback={null}>
            <Txt variant="caption" tone="primary">+5 min</Txt>
          </Tap>
        </View>
      </View>
      <Tap onPress={() => shift(60)} accessibilityLabel={`${t('common.increase')} 1 h`} style={styles.timeBtn} feedback={null}>
        <Icon name="plus" size={18} color={c.primary} strokeWidth={2.2} />
      </Tap>
    </View>
  );
}

export function ToggleRow({ label, hint, value, onChange, disabled, icon }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean; icon?: string }) {
  const c = useTheme();
  return (
    <View style={[styles.row, disabled ? styles.dim : null]}>
      {icon ? <View style={[styles.rowIcon, { backgroundColor: c.accentSoft }]}><Icon name={icon} size={19} color={c.primary} /></View> : null}
      <View style={styles.flex}>
        <Txt variant="body">{label}</Txt>
        {hint ? <Txt variant="footnote" tone="text3">{hint}</Txt> : null}
      </View>
      <Switch
        value={value}
        onValueChange={v => {
          haptic.tap();
          onChange(v);
        }}
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityHint={hint}
        trackColor={{ true: c.primary, false: c.lineStrong }}
        thumbColor={Platform.OS === 'android' ? (value ? c.onPrimary : c.surface) : undefined}
        ios_backgroundColor={c.lineStrong}
      />
    </View>
  );
}

export function ListRow({ icon, label, detail, value, onPress, danger, external }: { icon?: string; label: string; detail?: string; value?: string; onPress?: () => void; danger?: boolean; external?: boolean }) {
  const c = useT();
  const theme = useTheme();
  const content = (
    <>
      {icon ? <View style={[styles.rowIcon, { backgroundColor: danger ? theme.dangerBg : theme.accentSoft }]}><Icon name={icon} size={19} color={danger ? theme.danger : theme.primary} /></View> : null}
      <View style={styles.flex}>
        <Txt variant="body" tone={danger ? 'danger' : 'text'}>{label}</Txt>
        {detail ? <Txt variant="footnote" tone="text3">{detail}</Txt> : null}
      </View>
      {value ? <Txt variant="callout" tone="text2">{value}</Txt> : null}
      {onPress ? <Icon name={external ? 'external' : 'chevron'} size={18} color={theme.text3} /> : null}
    </>
  );
  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Tap onPress={onPress} scaleTo={0.99} style={styles.row} accessibilityLabel={external ? c('a11y.externalLink', { label }) : label} accessibilityHint={detail} accessibilityRole={external ? 'link' : 'button'}>
      {content}
    </Tap>
  );
}

export function Group({ children, title, footer }: { children: ReactNode; title?: string; footer?: string }) {
  const c = useTheme();
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean);
  return (
    <View style={styles.group}>
      {title ? <Txt variant="eyebrow" tone="text3" style={styles.groupTitle} heading>{title}</Txt> : null}
      <View style={[styles.groupBox, { backgroundColor: c.surface, borderColor: c.line }]}>
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 ? <Divider inset={space.lg} /> : null}
            {child}
          </View>
        ))}
      </View>
      {footer ? <Txt variant="footnote" tone="text3" style={styles.groupFooter}>{footer}</Txt> : null}
    </View>
  );
}

type SelectProps = { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; placeholder: string; error?: string };

/** A field that opens a searchable full-screen list (US states). */
export function Select({ label, value, options, onChange, placeholder, error }: SelectProps) {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const current = options.find(o => o.value === value);
  const filtered = q ? options.filter(o => o.label.toLowerCase().includes(q.toLowerCase())) : options;
  return (
    <View style={styles.field}>
      <Txt variant="subhead">{label}</Txt>
      <Tap
        onPress={() => setOpen(true)}
        accessibilityLabel={`${label}, ${current?.label ?? placeholder}`}
        accessibilityHint={error}
        scaleTo={0.99}
        style={[styles.inputWrap, styles.selectBox, { borderColor: error ? theme.danger : theme.lineStrong, backgroundColor: theme.surface }]}>
        <Txt variant="body" tone={current ? 'text' : 'text3'} style={styles.flex}>{current?.label ?? placeholder}</Txt>
        <Icon name="chevron-down" size={18} color={theme.text2} />
      </Tap>
      {error ? (
        <View style={styles.errorRow}>
          <Icon name="alert" size={16} color={theme.danger} strokeWidth={2} />
          <Txt variant="footnote" tone="danger" style={styles.flex}>{error}</Txt>
        </View>
      ) : null}
      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <View style={[styles.sheet, { backgroundColor: theme.bg, paddingTop: Platform.OS === 'android' ? insets.top + space.md : space.lg }]}>
          <View style={styles.sheetHead}>
            <Txt variant="title3" heading style={styles.flex}>{label}</Txt>
            <Tap onPress={() => setOpen(false)} accessibilityLabel={t('common.close')} style={styles.close}>
              <Icon name="x" size={22} color={theme.text} />
            </Tap>
          </View>
          <View style={[styles.inputWrap, { borderColor: theme.lineStrong, backgroundColor: theme.surface, marginHorizontal: space.xl }]}>
            <Icon name="search" size={18} color={theme.text3} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder={placeholder}
              placeholderTextColor={theme.text3}
              style={[type.body, NO_OUTLINE, styles.input, { color: theme.text }]}
              autoCorrect={false}
              accessibilityLabel={placeholder}
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={o => o.value}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + space.xl, paddingTop: space.sm }}
            renderItem={({ item }) => (
              <Tap
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                  setQ('');
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: item.value === value }}
                scaleTo={0.99}
                style={styles.option}>
                <Txt variant="body" style={styles.flex}>{item.label}</Txt>
                {item.value === value ? <Icon name="check" size={20} color={theme.primary} strokeWidth={2.2} /> : null}
              </Tap>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

/** An animated container that smoothly resizes as its content changes. */
export function Smooth({ children }: { children: ReactNode }) {
  return <Animated.View layout={LinearTransition.duration(220)} entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dim: { opacity: 0.5 },
  field: { gap: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: space.lg, minHeight: 52, gap: space.sm },
  input: { flex: 1, paddingVertical: 13, minHeight: 50 },
  multiline: { minHeight: 104, textAlignVertical: 'top' },
  suffix: { paddingLeft: 4 },
  eye: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  errorRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, minHeight: 40, borderRadius: radius.pill, borderWidth: 1.5 },
  seg: { flexDirection: 'row', padding: 4, borderRadius: radius.pill, gap: 4 },
  segItem: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, paddingHorizontal: space.sm },
  choices: { gap: space.sm },
  choice: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56, paddingHorizontal: space.lg, borderRadius: radius.md, borderWidth: 1.5 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 11, height: 11, borderRadius: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  stepBtn: { width: HIT, height: HIT, borderRadius: HIT / 2, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 96 },
  time: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, padding: space.sm },
  timeBtn: { width: HIT, height: HIT, alignItems: 'center', justifyContent: 'center' },
  timeMid: { flex: 1, alignItems: 'center', gap: 2 },
  timeFine: { flexDirection: 'row', gap: space.lg },
  timeFineBtn: { paddingHorizontal: space.sm, paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, minHeight: 56 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  group: { gap: space.sm },
  groupTitle: { paddingHorizontal: space.xs },
  groupBox: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  groupFooter: { paddingHorizontal: space.xs },
  selectBox: { paddingVertical: 13 },
  sheet: { flex: 1, gap: space.md },
  sheetHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.xl, paddingBottom: space.sm },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: space.xl, gap: space.md },
});
