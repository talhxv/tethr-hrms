import { isDefined } from './guards';

// Exhaustiveness check for discriminated unions. Put it in the `default` branch
// of a switch over a string-literal union — the compiler errors if a case is
// unhandled, and it throws at runtime if an unexpected value slips through.
export const assertNever = (value: never, message = 'Unexpected value'): never => {
  throw new Error(`${message}: ${JSON.stringify(value)}`);
};

// Narrow `T | null | undefined` to `T`, throwing if absent. For invariants the
// type system can't prove (e.g. a lookup that "must" exist by this point).
export function assertDefined<TValue>(
  value: TValue | null | undefined,
  message = 'Expected value to be defined',
): asserts value is TValue {
  if (!isDefined(value)) {
    throw new Error(message);
  }
}
