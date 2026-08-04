// Color token *shape* (the contract both modes must satisfy) and the
// mode-agnostic 24-hue tag palette. The actual light/dark bindings live in
// colors-light.ts / colors-dark.ts. Because both must be typed `ColorTokens`,
// the compiler guarantees light/dark parity — you cannot add a token to one mode
// without adding it to the other (design.md §1 "dual-mode parity").
//
// NOTE: values here are an sRGB starting palette modeled on Radix. The token
// *structure* is the foundation; exact Radix display-p3 values can be dropped in
// later without touching any consumer, since components read tokens by name.

type Ramp<TPrefix extends string> = Record<
  `${TPrefix}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`,
  string
>;

export type GrayScale = Ramp<'gray'>;
export type AccentRamp = Ramp<'accent'>;

export type TextTokens = {
  primary: string;
  secondary: string;
  tertiary: string;
  light: string;
  extraLight: string;
  inverted: string;
  danger: string;
};

export type BackgroundTokens = {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  invertedPrimary: string;
  invertedSecondary: string;
  danger: string;
  overlayPrimary: string;
  transparentLight: string;
  transparentMedium: string;
  transparentStrong: string;
};

export type BorderTokens = {
  strong: string;
  medium: string;
  light: string;
  inverted: string;
  danger: string;
  blue: string;
};

export type BoxShadowTokens = {
  light: string;
  strong: string;
  underline: string;
  superHeavy: string;
};

// The 24-hue palette for tags/chips/avatars/category coloring (design.md §4.3).
export type MainColorName =
  | 'red'
  | 'ruby'
  | 'crimson'
  | 'tomato'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'grass'
  | 'green'
  | 'jade'
  | 'mint'
  | 'turquoise'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'iris'
  | 'violet'
  | 'purple'
  | 'plum'
  | 'pink'
  | 'bronze'
  | 'gold'
  | 'brown'
  | 'gray';

export type TagPalette = Record<MainColorName, string>;

export type ColorTokens = {
  grayScale: GrayScale;
  accent: AccentRamp;
  text: TextTokens;
  background: BackgroundTokens;
  border: BorderTokens;
  boxShadow: BoxShadowTokens;
  tag: TagPalette;
};

// Shared across modes: the solid (Radix "9") step of each hue. Reused by both
// light and dark so the category color of an object is stable across themes.
export const tagPalette: TagPalette = {
  red: '#e5484d',
  ruby: '#e54666',
  crimson: '#e93d82',
  tomato: '#e54d2e',
  orange: '#f76b15',
  amber: '#ffc53d',
  yellow: '#ffe629',
  lime: '#bdee63',
  grass: '#46a758',
  green: '#30a46c',
  jade: '#29a383',
  mint: '#86ead4',
  turquoise: '#00bcc4',
  cyan: '#00a2c7',
  sky: '#7ce2fe',
  blue: '#0090ff',
  iris: '#5b5bd6',
  violet: '#6e56cf',
  purple: '#8e4ec6',
  plum: '#ab4aba',
  pink: '#d6409f',
  bronze: '#a18072',
  gold: '#978365',
  brown: '#ad7f58',
  gray: '#8d8d8d',
};
