# Twenty — Design Language

> A reference for the visual and interaction language used across Twenty. Source of truth: `packages/twenty-ui/src/theme/`.

---

## 1. Design Philosophy

Twenty's design ethos is **functional minimalism** — Linear- and Vercel-adjacent. The product is dense, table-and-sidebar-heavy, and prioritizes clarity over decoration.

Guiding principles:

- **Form follows function.** No gradients, illustrations-as-chrome, or decorative complexity. Visual weight is reserved for hierarchy.
- **Semantic over arbitrary.** Tokens are named for *what they mean* (`danger`, `success`, `accent`, `inverted`) rather than what they look like.
- **Dual-mode parity.** Every token has a Light and Dark counterpart. Dark mode is not an afterthought — it is co-designed.
- **Accessibility-conscious.** Strong focus rings, clear text-tier separation, semantic colors, P3-aware contrast.
- **Composable, not inherited.** Styles are tokenized and re-composed across components. No deep style inheritance.

---

## 2. Foundations

### 2.1 Spacing

A 4px-multiplier grid drives all spacing. `theme.spacing(2, 4)` resolves to `8px 16px`.

| Token | Value |
|---|---|
| `spacingMultiplicator` | `4` |
| `spacing(n)` | `n * 4px` |
| `betweenSiblingsGap` | `2px` |

`betweenSiblingsGap` of `2px` is the signature density choice — components sit tight against each other, giving Twenty its high-information-density feel.

### 2.2 Border Radius

Restrained rounding. Nothing here is "playful" — everything is functional.

| Token | Value | Usage |
|---|---|---|
| `xs` | `2px` | Inline pills, tag corners |
| `sm` | `4px` | Buttons, inputs, default radius |
| `md` | `8px` | Modals, cards, side panels |
| `xl` | `20px` | Large containers |
| `xxl` | `40px` | Hero / marketing surfaces |
| `pill` | `999px` | Capsule buttons, chips |
| `rounded` | `100%` | Avatars, dots |

Source: [BorderCommon.ts](packages/twenty-ui/src/theme/constants/BorderCommon.ts)

### 2.3 Animation

Fast and subtle. The default transition for clickable elements is `background 0.1s ease`.

| Duration | Value (s) | Usage |
|---|---|---|
| `instant` | `0.075` | Hover state flips |
| `fast` | `0.15` | Standard interactions |
| `normal` | `0.3` | Modal / panel transitions |
| `slow` | `1.5` | Marketing-style reveals (rare) |

`framer-motion` powers microinteractions where component-level easing is needed.

### 2.4 Z-index

`lastLayerZIndex: 2147483647` (`Int32.MaxValue`) is reserved for the top-most overlay layer — toasts, command bar, root portals.

---

## 3. Typography

| Token | Value |
|---|---|
| Font family (UI) | `Inter, sans-serif` |
| Font family (code) | `DM Mono` |
| Weights | `400` regular · `500` medium · `600` semiBold |

Three weights only — disciplined hierarchy.

### Size scale

| Token | Value | ~px |
|---|---|---|
| `xxs` | `0.625rem` | 10 |
| `xs` | `0.85rem` | 13.6 |
| `sm` | `0.92rem` | 14.7 |
| `md` | `1rem` | 16 |
| `lg` | `1.23rem` | 19.7 |
| `xl` | `1.54rem` | 24.6 |
| `xxl` | `1.85rem` | 29.6 |

### Line height

- `md`: `1.1` — tight, for UI labels and table cells
- `lg`: `1.5` — body copy, multi-line text

### Text color tiers (light theme)

| Token | Value | Use for |
|---|---|---|
| `primary` | `gray12` | Headings, primary body |
| `secondary` | `gray11` | Subdued labels |
| `tertiary` | `gray9` | Captions, metadata |
| `light` | `gray8` | Disabled-but-readable |
| `extraLight` | `gray7` | Placeholder text |
| `inverted` | `gray1` | Text on dark/inverted bg |
| `danger` | `red` | Error messaging |

Source: [FontLight.ts](packages/twenty-ui/src/theme/constants/FontLight.ts), [FontCommon.ts](packages/twenty-ui/src/theme/constants/FontCommon.ts)

---

## 4. Color System

Twenty is built on **Radix UI's P3 color tokens** — wide-gamut, accessibility-graded, and modeled around 12-step scales (1=lightest, 12=darkest). The use of `color(display-p3 …)` syntax means colors render with greater saturation on capable displays without sacrificing sRGB fallback.

### 4.1 Grayscale

A 12-step display-p3 ramp from pure white (`gray1`) to near-black (`gray12`). Used for backgrounds, borders, text, and shadows.

| Token | Value |
|---|---|
| `gray1` | `display-p3 1 1 1` (white) |
| `gray2` | `display-p3 0.988 0.988 0.988` |
| `gray4` | `display-p3 0.945 0.945 0.945` |
| `gray6` | `display-p3 0.839 0.839 0.839` |
| `gray9` | `display-p3 0.6 0.6 0.6` |
| `gray11` | `display-p3 0.4 0.4 0.4` |
| `gray12` | `display-p3 0.2 0.2 0.2` |

Source: [GrayScaleLight.ts](packages/twenty-ui/src/theme/constants/GrayScaleLight.ts)

### 4.2 Accent (Primary brand)

**Indigo** (Radix `indigoP3`) is Twenty's accent — a 12-step ramp from `accent1` to `accent12`. Used for primary buttons, focus rings, selection, links.

| Token | Source |
|---|---|
| `accent1`–`accent12` | `RadixColors.indigoP3.indigo1`–`indigo12` |
| `accent9` | Brand reference point |
| `accent11` | Secondary button text |

Source: [AccentLight.ts](packages/twenty-ui/src/theme/constants/AccentLight.ts)

### 4.3 Main color palette (24 hues)

Each named color maps to a Radix P3 `9`-step (the saturated mid-tone) and is used for tags, chips, avatars, and category coloring.

| Family | Colors |
|---|---|
| **Reds** | `red`, `ruby`, `crimson`, `tomato` |
| **Oranges / Yellows** | `orange`, `amber`, `yellow` |
| **Greens** | `lime`, `grass`, `green`, `jade`, `mint` |
| **Cyans / Blues** | `turquoise`, `cyan`, `sky`, `blue` (= indigoP3) |
| **Purples / Pinks** | `iris`, `violet`, `purple`, `plum`, `pink` |
| **Earth tones / Neutrals** | `bronze`, `gold`, `brown`, `gray` |

Source: [MainColorsLight.ts](packages/twenty-ui/src/theme/constants/MainColorsLight.ts)

### 4.4 Background hierarchy (light theme)

| Token | Maps to | Use |
|---|---|---|
| `primary` | `gray1` | Main canvas |
| `secondary` | `gray2` | Subtle row striping, panels |
| `tertiary` | `gray4` | Hover surfaces |
| `quaternary` | `gray5` | Pressed / heavy hover |
| `invertedPrimary` | `gray12` | Tooltips, dark chips |
| `invertedSecondary` | `gray11` | Inverted subtle |
| `danger` | `red3` | Destructive surfaces |
| `transparent.*` | alpha tints | Overlays, scrims |
| `overlayPrimary` | gray alpha | Modal scrims |
| `radialGradient` | gray9 → gray10 | Decorative auth/empty states |

Source: [BackgroundLight.ts](packages/twenty-ui/src/theme/constants/BackgroundLight.ts)

### 4.5 Border palette

| Token | Maps to | Use |
|---|---|---|
| `strong` | `gray6` | Dividers, separators |
| `medium` | `gray5` | Default input borders |
| `light` | `gray4` | Subtle separators |
| `inverted` | `gray12` | Dark surface borders |
| `danger` | `red5` | Error inputs |
| `blue` | `blue7` | Focus / selected |
| `transparentStrong` | gray4 alpha | Floating panel borders |

Source: [BorderLight.ts](packages/twenty-ui/src/theme/constants/BorderLight.ts)

### 4.6 Shadows

Built from layered gray-alpha tokens — no diffuse colored glows.

| Token | Recipe |
|---|---|
| `light` | `0 2px 4px gray2α, 0 0 4px gray5α` |
| `strong` | `2px 4px 16px gray7α, 0 2px 4px gray5α` |
| `underline` | `0 1px 0 gray9α` |
| `superHeavy` | three-layer (8px + 64px + 56px spreads) — modal lift |

Source: [BoxShadowLight.ts](packages/twenty-ui/src/theme/constants/BoxShadowLight.ts)

---

## 5. Iconography

Library: **[Tabler Icons](https://tabler.io/icons)** (`@tabler/icons-react`). Outline-only, geometric, variable stroke weight.

| Size | Value | Stroke |
|---|---|---|
| `sm` | `14px` | `1.6` |
| `md` | `16px` | `2` |
| `lg` | `20px` | `2.5` |
| `xl` | `24px` | (custom) |

Strokes get *heavier* as size scales up — small icons render lighter to avoid blockiness; large icons hold weight for hierarchy.

Source: [Icon.ts](packages/twenty-ui/src/theme/constants/Icon.ts)

---

## 6. Component Patterns

### 6.1 Buttons

Three variants × three accents × two sizes — a 3D matrix that covers every state without one-off variants.

| Axis | Values |
|---|---|
| **Variant** | `primary` (filled) · `secondary` (bordered) · `tertiary` (ghost) |
| **Accent** | `default` (neutral) · `blue` (primary action) · `danger` (destructive) |
| **Size** | `small` (24px tall) · `medium` (32px tall) |
| **Position** | `standalone` · `left` · `middle` · `right` (for grouped button bars) |

Additional toggles: `inverted`, `fullWidth`, `disabled`, `focus`, `isLoading`, `soon` (coming-soon stub), `hotkeys`.

Border radius is `sm` (4px). Focus state shows a 3px blue outline. Disabled state uses reduced opacity, not a color swap.

Source: [Button.tsx](packages/twenty-ui/src/input/button/components/Button/Button.tsx)

### 6.2 Modals

| Size | Width | Height |
|---|---|---|
| `sm` | `300px` | auto |
| `md` | `400px` | auto |
| `lg` | `53%` | auto |
| `xl` | `1200px` | `800px` |
| `fullscreen` | `100dvw` | `100dvh` |

- Border radius `md` (8px) on desktop; `0` on mobile (becomes fullscreen)
- `superHeavy` shadow for elevation
- Max-height `90dvh` with overflow scroll
- Scrim uses `overlayPrimary` (gray alpha)

Source: [Modal.ts](packages/twenty-ui/src/theme/constants/Modal.ts)

### 6.3 Side panels

Fixed width: `500px`. This is a hard convention — record detail panels, settings sub-panels, contextual editors all share this footprint.

### 6.4 Tables

| Property | Value |
|---|---|
| `horizontalCellMargin` | `8px` |
| `horizontalCellPadding` | `8px` |
| `checkboxColumnWidth` | `32px` |

Dense, spreadsheet-grade tables — Twenty's primary information surface.

### 6.5 Chips & Tags

Variants: `highlighted`, `regular`, `transparent`, `rounded`, `static`. Flex-based alignment. Color comes from the 24-hue main palette (§4.3) — chips are how object categories and statuses get color-coded.

---

## 7. Styling Engine

- **[Linaria](https://linaria.dev/)** — zero-runtime CSS-in-JS using the `styled` API. Styles compile to static CSS at build time, no runtime style injection cost.
- **CSS variables** — themes are exposed as CSS custom properties (`themeCssVariables`) so Linaria-compiled CSS can swap themes without re-rendering.
- **`framer-motion`** for animated components that need orchestration beyond CSS transitions.
- **No utility-class framework** (no Tailwind). Co-located styled components per file.

---

## 8. Theme Architecture

```
ThemeCommon ──────────────┐
                          ├─→ ThemeLight ──→ UI
ColorsLight, FontLight,   │
GrayScaleLight, …         │
                          ├─→ ThemeDark ──→ UI
ColorsDark, FontDark,     │
GrayScaleDark, …          │
```

Every visual concept has three files:

- `*Common.ts` — values shared across modes (sizes, radii, durations)
- `*Light.ts` — light-mode color bindings
- `*Dark.ts` — dark-mode color bindings

This shape makes adding a new color mode (e.g. high-contrast) a matter of authoring one new layer — the rest of the system is mode-agnostic.

Source: [packages/twenty-ui/src/theme/constants/](packages/twenty-ui/src/theme/constants)

---

## 9. Layout Conventions

- **Sidebar-primary navigation** on the left; main canvas to the right.
- **Side panel** (500px) for context-sensitive detail, slides in from the right.
- **Table-first** record views; board and kanban are alternates over the same data.
- **Top bar** is minimal — search, breadcrumb, account. Heavy chrome lives in the sidebar.
- **Empty states** use a single illustration token + a single CTA — never multi-step empty states.

---

## 10. Quick Reference

| Need | Token |
|---|---|
| Standard padding | `theme.spacing(2)` → 8px |
| Card / modal corner | `borderRadius.md` → 8px |
| Button corner | `borderRadius.sm` → 4px |
| Primary action color | `accent` (indigoP3) |
| Body text | `font.color.primary` |
| Subdued text | `font.color.secondary` |
| Default border | `border.color.medium` |
| Hover surface | `background.tertiary` |
| Default icon | `icon.size.md` (16px) · `stroke.md` (2) |
| Modal elevation | `boxShadow.superHeavy` |
| Standard transition | `clickableElementBackgroundTransition` |

---

## Files of interest

- [packages/twenty-ui/src/theme/constants/](packages/twenty-ui/src/theme/constants) — full token system
- [ThemeCommon.ts](packages/twenty-ui/src/theme/constants/ThemeCommon.ts) — root theme assembly
- [FontCommon.ts](packages/twenty-ui/src/theme/constants/FontCommon.ts) — typography scale
- [MainColorsLight.ts](packages/twenty-ui/src/theme/constants/MainColorsLight.ts) — 24-hue palette
- [BorderCommon.ts](packages/twenty-ui/src/theme/constants/BorderCommon.ts) — radii
- [Animation.ts](packages/twenty-ui/src/theme/constants/Animation.ts) — durations
- [Icon.ts](packages/twenty-ui/src/theme/constants/Icon.ts) — icon sizing
- [Button.tsx](packages/twenty-ui/src/input/button/components/Button/Button.tsx) — exemplary component
- [packages/twenty-front/index.html](packages/twenty-front/index.html) — font loading
