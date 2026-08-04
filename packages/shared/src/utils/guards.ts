// Pure, dependency-free type guards. Shared by both sides of the wire.

export const isDefined = <TValue>(value: TValue | null | undefined): value is TValue =>
  value !== null && value !== undefined;

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
