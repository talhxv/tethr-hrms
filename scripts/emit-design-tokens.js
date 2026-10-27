#!/usr/bin/env node
// Emit @hrms/ui's theme as a Figma-shaped token document.
//
// The product kit is a PROJECTION of packages/ui, never the reverse. Nothing is
// hand-typed into Figma: this script is the only thing that decides what the kit
// contains, so regenerating is cheaper than repairing.
//
//   node scripts/emit-design-tokens.js            # write docs/design-tokens.json
//   node scripts/emit-design-tokens.js --stdout   # print instead
//
// It deliberately reuses `themeToCssVariables` from the package rather than
// walking the theme itself. A second walker could disagree with the first about
// what a token is called, and then the kit and the stylesheet would drift while
// both looked correct — the failure this whole doc set is written against.

const fs = require('fs');
const path = require('path');

const UI_DIST = path.join(__dirname, '..', 'packages', 'ui', 'dist', 'index.js');
const OUT = path.join(__dirname, '..', 'docs', 'design-tokens.json');

if (!fs.existsSync(UI_DIST)) {
  console.error('packages/ui is not built — run `npm run build` first.\n  looked for: ' + UI_DIST);
  process.exit(1);
}

// A stale dist is the dangerous case, not a missing one. A missing build fails
// loudly; a stale build emits a confident, complete-looking kit from last month's
// tokens. The first run of this emitter did exactly that — dist was 34 days behind
// source, 20 tokens were simply absent, and the output looked entirely plausible.
//
// The first fix compared mtimes and was wrong: tsconfig.base sets `incremental`,
// so tsc skips rewriting output whose content has not changed. Touch a source file
// and src is permanently newer than dist, the guard fires forever, and rebuilding
// cannot clear it. It was testing timestamps while meaning content.
//
// So build instead of checking. Staleness becomes impossible by construction rather
// than detected after the fact, which is the trade this project keeps preferring.
if (!process.argv.includes('--no-build')) {
  const { spawnSync } = require('child_process');
  const built = spawnSync('npm', ['run', 'build', '--workspace=@hrms/ui'], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (built.status !== 0) {
    console.error('packages/ui failed to build — not emitting a kit from whatever dist happens to hold.');
    console.error((built.stderr || built.stdout || '').trim().split('\n').slice(-12).join('\n'));
    process.exit(1);
  }
}

const ui = require(UI_DIST);
for (const required of ['lightTheme', 'darkTheme', 'themeToCssVariables']) {
  if (!ui[required]) {
    console.error(`@hrms/ui does not export ${required} — the emitter is out of step with the package.`);
    process.exit(1);
  }
}

const light = ui.themeToCssVariables(ui.lightTheme);
const dark = ui.themeToCssVariables(ui.darkTheme);

// Parity is guaranteed by the type system (both modes are typed ColorTokens), but
// assert it anyway: this is the one place where a silent gap would be published to
// designers as a complete kit.
const lightKeys = Object.keys(light).sort();
const darkKeys = Object.keys(dark).sort();
const onlyLight = lightKeys.filter((k) => !(k in dark));
const onlyDark = darkKeys.filter((k) => !(k in light));
if (onlyLight.length || onlyDark.length) {
  console.error('light/dark token sets differ — refusing to emit a kit with a hole in it');
  if (onlyLight.length) console.error('  light only: ' + onlyLight.join(', '));
  if (onlyDark.length) console.error('  dark only:  ' + onlyDark.join(', '));
  process.exit(1);
}
if (!lightKeys.length) {
  console.error('no tokens found — refusing to emit an empty kit');
  process.exit(1);
}

// --hrms-color-accent-accent1 -> color/accent/accent1 (Figma groups on "/")
const toVariableName = (cssVar) => cssVar.replace(/^--hrms-/, '').split('-').join('/');

// Figma variables are COLOR, FLOAT, STRING or BOOLEAN. Anything that is not a
// plain colour or a plain pixel number stays STRING: a shadow, a duration and a
// font stack are all strings to Figma, and pretending otherwise loses the value.
const byte = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');

const classify = (value) => {
  if (/^#[0-9a-f]{6}$/i.test(value) || /^#[0-9a-f]{8}$/i.test(value) || /^#[0-9a-f]{3,4}$/i.test(value)) {
    return { type: 'COLOR', resolve: (v) => v.toLowerCase() };
  }
  // rgb()/rgba() are colours too. Leaving them as STRING would publish four real
  // colour tokens — the modal overlay and the three transparent surfaces — into the
  // kit as text a designer cannot apply to a fill. Normalised to #rrggbbaa so every
  // COLOR in the document has one representation.
  const rgba = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(value);
  if (rgba) {
    return {
      type: 'COLOR',
      resolve: (v) => {
        const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(v);
        const alpha = m[4] === undefined ? 1 : Number.parseFloat(m[4]);
        const hex = '#' + byte(+m[1]) + byte(+m[2]) + byte(+m[3]);
        return alpha === 1 ? hex : hex + byte(alpha * 255);
      },
    };
  }
  if (/^-?\d+(\.\d+)?px$/.test(value)) {
    return { type: 'FLOAT', resolve: (v) => Number.parseFloat(v) };
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return { type: 'FLOAT', resolve: (v) => Number.parseFloat(v) };
  }
  return { type: 'STRING', resolve: (v) => v };
};

const themed = [];
const fixed = [];
const all = [];

for (const cssVar of lightKeys) {
  const lightValue = light[cssVar];
  const darkValue = dark[cssVar];
  const lightKind = classify(lightValue);
  const darkKind = classify(darkValue);

  // A token that is a colour in one mode and something else in the other cannot be
  // one Figma variable. It has never happened; if it does, say so rather than guess.
  const type = lightKind.type === darkKind.type ? lightKind.type : null;
  if (!type) {
    console.error(
      `token ${cssVar} is ${lightKind.type} in light but ${darkKind.type} in dark — cannot be a single variable`,
    );
    process.exit(1);
  }

  const record = {
    name: toVariableName(cssVar),
    cssVariable: cssVar,
    type,
    values: { Light: lightKind.resolve(lightValue), Dark: darkKind.resolve(darkValue) },
    varies: lightValue !== darkValue,
  };

  all.push(record);
}

// Group by FAMILY, not token by token: accent9 is identical in both modes on
// purpose — design.md calls it the brand reference point — and splitting it out of
// its own ramp to sit beside spacing tokens would be absurd. The 25 tag colours are
// the same case.
//
// But a family is themed when ANY member of it varies, which is not the same as
// "is it a colour". An earlier version used the `--hrms-color-` prefix and silently
// dropped the dark values of all four box-shadow tokens: css-variables.ts lifts them
// out of the colour prefix on purpose, so they fell into the single-mode collection
// and only their light value survived. box/shadow/underline is black in light and
// WHITE in dark — exactly the token least able to afford losing a mode.
const familyOf = (record) => record.name.split('/')[0];
const familyVaries = new Set(all.filter((r) => r.varies).map(familyOf));
for (const record of all) {
  (familyVaries.has(familyOf(record)) ? themed : fixed).push(record);
}

// The guard that would have caught the shadow bug: nothing in the single-mode
// collection may differ between modes, because that collection keeps one value and
// discards the other. A silent discard is the failure this emitter exists to avoid.
const wouldLoseItsDarkValue = fixed.filter((r) => r.varies);
if (wouldLoseItsDarkValue.length) {
  console.error('these tokens vary by mode but were filed as single-mode — their dark value would be discarded:');
  for (const r of wouldLoseItsDarkValue) console.error(`  ${r.name}\n    light ${r.values.Light}\n    dark  ${r.values.Dark}`);
  process.exit(1);
}

const collections = [
  {
    name: 'HRMS Theme',
    modes: ['Light', 'Dark'],
    note: 'Every colour token. Both modes always defined — a token present in one mode and absent in the other is a visible gap, not a bug found later on a dark screen.',
    variables: themed,
  },
  {
    name: 'HRMS Primitives',
    modes: ['Value'],
    note: 'Mode-agnostic tokens: spacing, radii, typography, layout, motion, z-index. Identical in light and dark by construction.',
    variables: fixed.map((v) => ({
      name: v.name,
      cssVariable: v.cssVariable,
      type: v.type,
      values: { Value: v.values.Light },
    })),
  },
];

const doc = {
  $schema: 'https://tethr.internal/design-tokens/v1',
  generatedBy: 'scripts/emit-design-tokens.js',
  source: '@hrms/ui (packages/ui/src/theme)',
  warning: 'Generated file. Edit packages/ui/src/theme, then re-run the emitter. Do not hand-edit, and do not edit the Figma kit and expect it to survive.',
  tokenCount: collections.reduce((n, c) => n + c.variables.length, 0),
  modeVaryingCount: themed.filter((v) => v.varies).length,
  collections,
};

const json = JSON.stringify(doc, null, 2) + '\n';

if (process.argv.includes('--stdout')) {
  process.stdout.write(json);
} else {
  fs.writeFileSync(OUT, json);
  console.log(`wrote ${path.relative(path.join(__dirname, '..'), OUT)}`);
}

console.log(`${lightKeys.length} tokens · ${themed.length} themed (${themed.filter((v) => v.varies).length} actually vary) · ${fixed.length} primitives`);
const byType = {};
for (const v of [...themed, ...fixed]) byType[v.type] = (byType[v.type] || 0) + 1;
console.log('types: ' + Object.entries(byType).map(([t, n]) => `${t} ${n}`).join(' · '));
