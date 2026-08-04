import type { ColorTokens } from './colors';
import { darkColors } from './colors-dark';
import { lightColors } from './colors-light';
import {
  animation,
  betweenSiblingsGap,
  borderRadius,
  icon,
  layout,
  space,
  spacing,
  SPACING_MULTIPLIER,
  typography,
  zIndex,
} from './common';

export type ThemeName = 'light' | 'dark';

// The assembled theme a component consumes. Mode-agnostic tokens are shared by
// reference; only `name` and `color` differ between light and dark.
export type Theme = {
  readonly name: ThemeName;
  readonly spacing: (...multipliers: number[]) => string;
  readonly space: typeof space;
  readonly spacingMultiplier: number;
  readonly betweenSiblingsGap: string;
  readonly borderRadius: typeof borderRadius;
  readonly animation: typeof animation;
  readonly zIndex: typeof zIndex;
  readonly typography: typeof typography;
  readonly icon: typeof icon;
  readonly layout: typeof layout;
  readonly color: ColorTokens;
};

const commonTheme = {
  spacing,
  space,
  spacingMultiplier: SPACING_MULTIPLIER,
  betweenSiblingsGap,
  borderRadius,
  animation,
  zIndex,
  typography,
  icon,
  layout,
} as const;

export const lightTheme: Theme = {
  name: 'light',
  ...commonTheme,
  color: lightColors,
};

export const darkTheme: Theme = {
  name: 'dark',
  ...commonTheme,
  color: darkColors,
};

export const themes: Readonly<Record<ThemeName, Theme>> = {
  light: lightTheme,
  dark: darkTheme,
};
