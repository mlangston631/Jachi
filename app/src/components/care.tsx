/** Care content shared with the website: what to expect from a service, how Jachi works and the health guides. */
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useT } from '@/i18n';
import { boldRuns, CONTENT, SITE, type Expect, type Guide, type GuideBlock, type How } from '@/lib/content';
import { call, openPage, text } from '@/lib/links';
import { font, space, useTheme, type TypeVariant } from '@/theme';
import { Icon } from './Icon';
import { Button, Card, Tap, Txt, type ButtonVariant, type Tone } from './ui';

/** Text with the guides' bold runs (<b>…</b>) set in the semibold face. */
export function RichText({ value, variant = 'body', tone = 'text2' }: { value: string; variant?: TypeVariant; tone?: Tone }) {
  const c = useTheme();
  const runs = boldRuns(value);
  return (
    <Txt variant={variant} tone={tone}>
      {runs.map(([run, bold], i) => (bold ? <Txt key={i} variant={variant} style={[styles.bold, { color: c.text }]}>{run}</Txt> : run))}
    </Txt>
  );
}

/** The visit, tests and follow-up on one rail, in the order they happen. */
export function ExpectRail({ expect }: { expect: Expect }) {
  const c = useTheme();
  return (
    <View>
      {expect.items.map((item, i) => {
        const last = i === expect.items.length - 1;
        return (
          <View key={item.title} style={styles.railRow}>
            <View style={styles.railSide}>
              <View style={[styles.railIcon, { backgroundColor: c.surface, borderColor: c.accent }]}>
                <Icon name={item.icon} size={22} color={c.primary} />
              </View>
              {last ? null : <View style={[styles.railLine, { backgroundColor: c.accent }]} />}
            </View>
            <View style={[styles.flex, styles.railText, last ? null : styles.railGap]}>
              <Txt variant="title3" heading>{item.title}</Txt>
              <Txt variant="callout" tone="text2">{item.text}</Txt>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** How Jachi works: the steps on Jachi, the move to the medical group's portal, then the steps with the medical group. */
export function HowLanes({ how }: { how: How }) {
  const c = useTheme();
  const [jachi, care] = how.lanes;
  const lane = (data: How['lanes'][number], withGroup: boolean, before: number) => (
    <Card tone={withGroup ? 'accent' : 'surface'} style={styles.lane}>
      <View style={styles.gapXs}>
        <Txt variant="subhead" tone="accent">{data.who}</Txt>
        <Txt variant="title2" heading>{data.title}</Txt>
      </View>
      {data.steps.map((step, i) => (
        <View key={step.title} style={styles.step}>
          <View style={[styles.num, withGroup ? { backgroundColor: c.primary } : { borderWidth: 1.5, borderColor: c.primary }]}>
            <Txt variant="subhead" style={{ color: withGroup ? c.onPrimary : c.primary }}>{before + i + 1}</Txt>
          </View>
          <View style={[styles.flex, styles.gapXs]}>
            <Txt variant="headline">{step.title}</Txt>
            <Txt variant="footnote" tone="text2">{step.text}</Txt>
          </View>
        </View>
      ))}
    </Card>
  );
  return (
    <View style={styles.gapSm}>
      {jachi ? lane(jachi, false, 0) : null}
      <Card tone="hero" style={styles.handoff}>
        <View style={styles.handoffIcon}><Icon name="lock" size={20} color="#FFFFFF" /></View>
        <View style={[styles.flex, styles.gapXs]}>
          <Txt variant="headline" tone="onHero">{how.handoff.title}</Txt>
          <Txt variant="footnote" tone="onHero2">{how.handoff.text}</Txt>
        </View>
      </Card>
      {care ? lane(care, true, jachi?.steps.length ?? 0) : null}
    </View>
  );
}

/** The health guides as a reading list: topic, title, a one-line summary and how long each takes to read. */
export function GuideList({ guides }: { guides: Guide[] }) {
  const t = useT();
  const c = useTheme();
  const words = CONTENT.learn[t.lang];
  return (
    <Card padded={false}>
      {guides.map((guide, i) => {
        const g = guide[t.lang];
        const minutes = words.minutes.replace('{n}', String(g.minutes));
        return (
          <Tap
            key={guide.key}
            onPress={() => router.push({ pathname: '/learn/[key]', params: { key: guide.key } })}
            scaleTo={0.99}
            accessibilityLabel={`${g.title} ${minutes}`}
            accessibilityHint={g.summary}
            style={[styles.guide, i ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line } : null]}>
            <View style={[styles.flex, styles.gapXs]}>
              <Txt variant="caption" tone="accent">{g.topic}</Txt>
              <Txt variant="title3" heading>{g.title}</Txt>
              <Txt variant="footnote" tone="text2">{g.summary}</Txt>
              <Txt variant="caption" tone="text3">{minutes}</Txt>
            </View>
            <Icon name="chevron" size={20} color={c.text3} />
          </Tap>
        );
      })}
    </Card>
  );
}

const ACTION_VARIANT: Record<'danger' | 'solid' | 'ghost', ButtonVariant> = { danger: 'danger', solid: 'primary', ghost: 'ghost' };

/** Calls and texts from a guide (tel:911, tel:988, sms:988 and the Spanish sms:988?&body=AYUDA). */
function runAction(href: string) {
  const number = href.replace(/^(tel|sms):/, '').split(/[?&]/)[0] ?? '';
  if (href.startsWith('tel:')) return call(number);
  const body = /body=([^&]+)/.exec(href)?.[1];
  return text(number, body ? decodeURIComponent(body) : '');
}

/** One block of a guide: a paragraph, a heading, a list or a callout with its call and text buttons. */
export function GuideBody({ block }: { block: GuideBlock }) {
  const c = useTheme();
  if (block.kind === 'h2') return <Txt variant="title2" heading style={styles.h2}>{block.text}</Txt>;
  if (block.kind === 'p') return <RichText value={block.text} />;
  if (block.kind === 'ul' || block.kind === 'ol') return <Bullets items={block.items} numbered={block.kind === 'ol'} />;
  const alert = block.tone === 'alert';
  return (
    <Card tone={alert ? 'danger' : 'accent'} style={styles.gapMd}>
      <View style={styles.calloutHead}>
        <Icon name={alert ? 'alert' : 'heart'} size={22} color={alert ? c.danger : c.primary} strokeWidth={2} />
        <Txt variant="headline" tone={alert ? 'danger' : 'primary'} style={styles.flex} heading>{block.title}</Txt>
      </View>
      {block.parts.map((part, i) =>
        part.kind === 'p' ? <RichText key={i} value={part.text} tone="text" /> : <Bullets key={i} items={part.items} tone="text" />)}
      {block.actions.length ? (
        <View style={styles.actions}>
          {block.actions.map(a => (
            <Button key={a.href} label={a.label} icon={a.href.startsWith('sms:') ? 'msg' : 'phone'} variant={ACTION_VARIANT[a.style]} size="sm" onPress={() => runAction(a.href)} />
          ))}
        </View>
      ) : null}
    </Card>
  );
}

function Bullets({ items, numbered, tone = 'text2' }: { items: string[]; numbered?: boolean; tone?: Tone }) {
  const c = useTheme();
  return (
    <View style={styles.gapSm}>
      {items.map((item, i) => (
        <View key={item} style={styles.bullet}>
          {numbered ? (
            <Txt variant="subhead" tone="primary" style={styles.bulletNum}>{i + 1}.</Txt>
          ) : (
            <View style={[styles.dot, { backgroundColor: c.accent }]} />
          )}
          <View style={styles.flex}><RichText value={item} variant="callout" tone={tone} /></View>
        </View>
      ))}
    </View>
  );
}

/** Where a guide's page link goes: the care finder opens in the app; anything else opens on the website. */
export function openGuidePage(href: string) {
  if (href.endsWith('#care-finder')) {
    router.push('/finder');
    return;
  }
  void openPage(`${SITE}${href}`);
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gapXs: { gap: space.xs },
  gapSm: { gap: space.sm },
  gapMd: { gap: space.md },
  bold: { fontFamily: font.semibold },
  railRow: { flexDirection: 'row', gap: space.md },
  railSide: { width: 48, alignItems: 'center' },
  railIcon: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  railLine: { flex: 1, width: 1.5, marginVertical: 6, opacity: 0.55 },
  railText: { gap: space.xs, paddingTop: 11 },
  railGap: { paddingBottom: space.xl },
  lane: { gap: space.lg },
  step: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  num: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  handoff: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  handoffIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  guide: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  h2: { marginTop: space.sm },
  calloutHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  bullet: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  bulletNum: { minWidth: 18 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 9 },
});

