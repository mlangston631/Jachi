/**
 * Design tokens: the website's palette (forest, moss, sage, mist) and type (Fraunces + Instrument Sans),
 * tuned for phones. Every colour pair used for text meets WCAG AA contrast in both light and dark mode.
 */
import type { TextStyle } from 'react-native';

export const brand = {
  forest: '#1E4A3B',
  forestDeep: '#123328',
  forestInk: '#0D241C',
  moss: '#4F7A5F',
  sage: '#9BC1A3',
  sage200: '#CFE3D4',
  sage100: '#E6F0E8',
  mist: '#F5F7F2',
  paper: '#FFFFFF',
} as const;

export type Palette = {
  scheme: 'light' | 'dark';
  bg: string;
  surface: string;
  surface2: string;
  raised: string;
  text: string;
  text2: string;
  text3: string;
  line: string;
  lineStrong: string;
  primary: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  hero: string;
  heroGradient: string;
  onHero: string;
  onHero2: string;
  danger: string;
  dangerBg: string;
  onDanger: string;
  warn: string;
  warnBg: string;
  success: string;
  focus: string;
  scrim: string;
  shadow: string;
  shadowStrong: string;
  /** Mood 1 (hardest day) to 5 (best day). */
  mood: readonly [string, string, string, string, string];
  chart: readonly [string, string, string, string];
};

export const light: Palette = {
  scheme: 'light',
  bg: brand.mist,
  surface: brand.paper,
  surface2: '#EDF2EC',
  raised: brand.paper,
  text: '#10261E',
  text2: '#3E5A4C',
  text3: '#5B7366',
  line: 'rgba(16,38,30,0.11)',
  lineStrong: 'rgba(16,38,30,0.22)',
  primary: brand.forest,
  onPrimary: '#FFFFFF',
  accent: brand.moss,
  accentSoft: brand.sage100,
  hero: brand.forestDeep,
  heroGradient: 'linear-gradient(160deg, #2A5E4B 0%, #1E4A3B 45%, #123328 100%)',
  onHero: '#FFFFFF',
  onHero2: '#B9D3BF',
  danger: '#B3261E',
  dangerBg: '#FCEDEC',
  onDanger: '#FFFFFF',
  warn: '#7A4D00',
  warnBg: '#FFF3DC',
  success: '#2F6B4A',
  focus: brand.moss,
  scrim: 'rgba(13,36,28,0.45)',
  shadow: '0px 1px 2px rgba(13,36,28,0.06), 0px 6px 16px -6px rgba(13,36,28,0.12)',
  shadowStrong: '0px 2px 6px rgba(13,36,28,0.06), 0px 22px 44px -18px rgba(13,36,28,0.32)',
  mood: ['#B4513F', '#C98A3B', '#8E9B5A', '#4F7A5F', '#1E4A3B'],
  chart: [brand.forest, '#C98A3B', brand.moss, '#7C93B8'],
};

export const dark: Palette = {
  scheme: 'dark',
  bg: '#0B1612',
  surface: '#13221B',
  surface2: '#1A2C23',
  raised: '#1D3128',
  text: '#EAF2EC',
  text2: '#BCD0C2',
  text3: '#93AA9C',
  line: 'rgba(234,242,236,0.10)',
  lineStrong: 'rgba(234,242,236,0.22)',
  primary: brand.sage,
  onPrimary: brand.forestInk,
  accent: brand.sage,
  accentSoft: '#1C3329',
  hero: '#0F2A20',
  heroGradient: 'linear-gradient(160deg, #1F4B3B 0%, #133528 50%, #0B1F17 100%)',
  onHero: '#FFFFFF',
  onHero2: '#B9D3BF',
  danger: '#F2B8B5',
  dangerBg: '#3A1614',
  onDanger: '#601410',
  warn: '#F5C36B',
  warnBg: '#33260A',
  success: '#9BC1A3',
  focus: brand.sage,
  scrim: 'rgba(0,0,0,0.6)',
  shadow: '0px 1px 2px rgba(0,0,0,0.3)',
  shadowStrong: '0px 18px 40px -16px rgba(0,0,0,0.6)',
  mood: ['#E08A78', '#E3B36B', '#C3CF8D', '#9BC1A3', '#CFE3D4'],
  chart: [brand.sage, '#E3B36B', '#CFE3D4', '#A9BCE0'],
};

export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, x3: 32, x4: 40, x5: 56 } as const;
export const radius = { sm: 12, md: 18, lg: 24, xl: 32, pill: 999 } as const;

export const font = {
  display: 'Fraunces-Display',
  displayItalic: 'Fraunces-DisplayItalic',
  heading: 'Fraunces-Heading',
  body: 'InstrumentSans-Regular',
  medium: 'InstrumentSans-Medium',
  semibold: 'InstrumentSans-SemiBold',
} as const;

export type TypeVariant =
  | 'hero' | 'largeTitle' | 'title' | 'title2' | 'title3' | 'headline' | 'body' | 'callout'
  | 'subhead' | 'footnote' | 'caption' | 'eyebrow' | 'number' | 'numberSmall' | 'button';

/** The type scale. Sizes grow with the phone's text-size setting (Dynamic Type / font scale). */
export const type: Record<TypeVariant, TextStyle> = {
  hero: { fontFamily: font.display, fontSize: 40, lineHeight: 44, letterSpacing: -1 },
  largeTitle: { fontFamily: font.display, fontSize: 34, lineHeight: 39, letterSpacing: -0.7 },
  title: { fontFamily: font.display, fontSize: 27, lineHeight: 32, letterSpacing: -0.4 },
  title2: { fontFamily: font.heading, fontSize: 21, lineHeight: 26, letterSpacing: -0.2 },
  title3: { fontFamily: font.heading, fontSize: 18, lineHeight: 23, letterSpacing: -0.1 },
  headline: { fontFamily: font.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: font.body, fontSize: 16, lineHeight: 23 },
  callout: { fontFamily: font.body, fontSize: 15, lineHeight: 21 },
  subhead: { fontFamily: font.medium, fontSize: 14, lineHeight: 19 },
  footnote: { fontFamily: font.body, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: font.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
  eyebrow: { fontFamily: font.semibold, fontSize: 11.5, lineHeight: 15, letterSpacing: 1.5, textTransform: 'uppercase' },
  number: { fontFamily: font.display, fontSize: 40, lineHeight: 44, letterSpacing: -1, fontVariant: ['tabular-nums', 'lining-nums'] },
  numberSmall: { fontFamily: font.display, fontSize: 26, lineHeight: 30, letterSpacing: -0.5, fontVariant: ['tabular-nums', 'lining-nums'] },
  button: { fontFamily: font.semibold, fontSize: 16, lineHeight: 20 },
};

/** Text fields: no browser focus outline in the web preview (the fields draw their own focus state). */
export const NO_OUTLINE = { outlineWidth: 0 } as const;

/** Smallest touch target (Apple HIG 44pt, Material 48dp). */
export const HIT = 48;
