import { buildThemeCss, themeToCssVariables } from './css-variables';
import { darkTheme, lightTheme } from './theme';

describe('light/dark parity', () => {
  it('light and dark expose exactly the same set of CSS variables', () => {
    const lightKeys = Object.keys(themeToCssVariables(lightTheme)).sort();
    const darkKeys = Object.keys(themeToCssVariables(darkTheme)).sort();
    expect(darkKeys).toEqual(lightKeys);
  });

  it('no token resolves to an empty value', () => {
    for (const value of Object.values(themeToCssVariables(darkTheme))) {
      expect(value.length).toBeGreaterThan(0);
    }
  });
});

describe('spacing', () => {
  it('resolves multipliers on the 4px grid', () => {
    expect(lightTheme.spacing(2)).toBe('8px');
    expect(lightTheme.spacing(2, 4)).toBe('8px 16px');
  });
});

describe('buildThemeCss', () => {
  it('emits a :root block and a dark override block', () => {
    const css = buildThemeCss();
    expect(css).toContain(':root {');
    expect(css).toContain("[data-theme='dark'] {");
    expect(css).toContain('--hrms-color-accent-accent9');
  });
});

describe('token contract', () => {
  // Locks the full set of variable families the component CSS depends on, so a
  // future change to the generator can't silently drop a token global.css uses.
  it('emits every variable family the design system relies on', () => {
    const vars = themeToCssVariables(lightTheme);
    expect(vars['--hrms-space-4']).toBe('16px');
    expect(vars['--hrms-between-siblings-gap']).toBe('2px');
    expect(vars['--hrms-layout-sidebar-width']).toBeDefined();
    expect(vars['--hrms-layout-top-bar-height']).toBeDefined();
    expect(vars['--hrms-layout-side-panel-width']).toBeDefined();
    expect(vars['--hrms-layout-table-checkbox-column-width']).toBeDefined();
    expect(vars['--hrms-font-family-ui']).toBeDefined();
    expect(vars['--hrms-line-height-md']).toBeDefined();
    expect(vars['--hrms-animation-clickable-background-transition']).toBeDefined();
  });
});
