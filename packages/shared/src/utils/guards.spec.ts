import { assertDefined, assertNever } from './assert';
import { isDefined, isNonEmptyString, isRecord } from './guards';

describe('isDefined', () => {
  it('narrows out null and undefined', () => {
    expect(isDefined(0)).toBe(true);
    expect(isDefined('')).toBe(true);
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
  });
});

describe('isNonEmptyString', () => {
  it('rejects empty and whitespace-only strings', () => {
    expect(isNonEmptyString('x')).toBe(true);
    expect(isNonEmptyString('   ')).toBe(false);
    expect(isNonEmptyString(42)).toBe(false);
  });
});

describe('isRecord', () => {
  it('accepts plain objects only', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
  });
});

describe('assertDefined', () => {
  it('throws when the value is absent', () => {
    expect(() => assertDefined(null)).toThrow();
    expect(() => assertDefined(undefined, 'custom')).toThrow('custom');
  });

  it('passes through a defined value', () => {
    expect(() => assertDefined(0)).not.toThrow();
  });
});

describe('assertNever', () => {
  it('always throws — it should only be reached on an unhandled union case', () => {
    expect(() => assertNever('unexpected' as never)).toThrow();
  });
});
