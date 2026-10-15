import { memo } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import icons from '@/content/icons.json';
import { EXTRA_ICONS } from './icons-extra';

type Shape = [string, Record<string, string | number>];
const SITE_ICONS = icons as unknown as Record<string, Shape[]>;

export type IconName = string;

type Props = { name: IconName; size?: number; color: string; strokeWidth?: number };

/** The website's line icons (and a few app ones), drawn natively. Decorative: hidden from screen readers. */
export const Icon = memo(function Icon({ name, size = 22, color, strokeWidth = 1.75 }: Props) {
  const shapes = EXTRA_ICONS[name] ?? SITE_ICONS[name] ?? EXTRA_ICONS.dot!;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
      importantForAccessibility="no-hide-descendants">
      {shapes.map(([tag, a], i) => {
        if (tag === 'circle') return <Circle key={i} cx={Number(a.cx)} cy={Number(a.cy)} r={Number(a.r)} />;
        if (tag === 'rect') {
          return (
            <Rect key={i} x={Number(a.x)} y={Number(a.y)} width={Number(a.width)} height={Number(a.height)}
              rx={a.rx === undefined ? undefined : Number(a.rx)} transform={typeof a.transform === 'string' ? a.transform : undefined} />
          );
        }
        return <Path key={i} d={String(a.d)} />;
      })}
    </Svg>
  );
});
