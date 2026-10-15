import { memo, useId } from 'react';
import Svg, { Defs, Mask, Path, Rect } from 'react-native-svg';

import icons from '@/content/icons.json';

const LEAF = (icons as unknown as { _leaf: { leaf: string; j: string; veins: string; stem: string } })._leaf;

type Props = { size?: number; color: string; veins?: boolean; label?: string };

/** The Jachi leaf logo, the same drawing as the website's (brand.py). */
export const Leaf = memo(function Leaf({ size = 40, color, veins = true, label }: Props) {
  const id = `leaf-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessible={!!label}
      accessibilityLabel={label}
      accessibilityRole={label ? 'image' : undefined}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}>
      <Defs>
        <Mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <Rect width="64" height="64" fill="#fff" />
          <Path d={LEAF.j} fill="none" stroke="#000" strokeWidth={veins ? 4.8 : 6.2} strokeLinecap="round" strokeLinejoin="round" />
          {veins ? <Path d={LEAF.veins} fill="none" stroke="#000" strokeWidth={2.2} strokeLinecap="round" /> : null}
        </Mask>
      </Defs>
      <Path d={LEAF.leaf} fill={color} mask={`url(#${id})`} />
      <Path d={LEAF.stem} fill="none" stroke={color} strokeWidth={veins ? 3 : 4} strokeLinecap="round" />
    </Svg>
  );
});

export const LEAF_PATHS = LEAF;
