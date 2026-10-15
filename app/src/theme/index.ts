import { useColorScheme } from 'react-native';

import { dark, light, type Palette } from './tokens';

export * from './tokens';

/** Light or dark palette. Follows the phone, or the person's choice in Settings (applied app-wide in the root layout). */
export function useTheme(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}
