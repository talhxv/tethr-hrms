import { formatDate } from '@hrms/shared';

import type { IntakeFormField, IntakeSubmissionAnswer } from './graphql/intake.operations';

// Step grouping and per-field rules for the employee-intake form. Pure logic,
// no React: the public page, its review step and the admin submission panel
// all derive their structure from the same functions, so the three surfaces
// can never disagree about what a step is or what a valid answer looks like.

export type IntakeFieldStepGroup = {
  readonly key: string;
  readonly stepNumber: number;
  readonly label: string;
  readonly hint: string;
  readonly fields: readonly IntakeFormField[];
};

// The standard definition's four field steps, keyed by the 1-based `step` the
// API stamps on each field. Step numbers outside the map (or a definition
// where fields carry no step at all) still render — the label is then derived
// from the group's field keys below.
const STEP_LABELS: Readonly<Record<number, string>> = {
  1: 'Personal details',
  2: 'Residence',
  3: 'Emergency and bank',
  4: 'Documents',
};

const STEP_HINTS: Readonly<Record<string, string>> = {
  'Personal details': 'Who you are',
  Residence: 'Where you live',
  'Emergency and bank': 'How to reach you and pay you',
  Documents: 'Files for your record',
};

const FALLBACK_STEP_LABEL = 'Details';
const FALLBACK_STEP_HINT = 'Your details';

// Field-key heuristics for a group whose step number has no label above.
// Checks run most-specific-first so a step holding both an address and a bank
// field still lands on the more telling label.
const deriveStepLabel = (fields: readonly IntakeFormField[]): string => {
  const keys = fields.map((field) => field.fieldKey.toLowerCase()).join(' ');
  if (/emergency|bank|iban|account/.test(keys)) return 'Emergency and bank';
  if (/passport|document|degree|resume|diploma|certificate|idcard|cnic/.test(keys)) {
    return 'Documents';
  }
  if (fields.some((field) => field.type === 'file')) return 'Documents';
  if (/address|city|country|postal|region|province/.test(keys)) return 'Residence';
  if (/firstname|lastname|fullname|dateofbirth|email|phone/.test(keys)) return 'Personal details';
  return FALLBACK_STEP_LABEL;
};

/**
 * Groups a form's fields into ordered steps: `step` ascending, then the
 * definition's `sortOrder` inside each step. Fields without a `step` collapse
 * into one leading group (step 0), so a partially-configured definition still
 * renders every field instead of dropping them.
 */
export const groupIntakeFields = (
  fields: readonly IntakeFormField[],
): readonly IntakeFieldStepGroup[] => {
  const ordered = [...fields].sort(
    (left, right) => (left.step ?? 0) - (right.step ?? 0) || left.sortOrder - right.sortOrder,
  );
  const groups: IntakeFieldStepGroup[] = [];
  for (const field of ordered) {
    const stepNumber = field.step ?? 0;
    const existing = groups.find((group) => group.stepNumber === stepNumber);
    if (existing) {
      groups[groups.indexOf(existing)] = { ...existing, fields: [...existing.fields, field] };
      continue;
    }
    groups.push({
      key: `intake-step-${stepNumber}`,
      stepNumber,
      label: STEP_LABELS[stepNumber] ?? deriveStepLabel([field]),
      hint: '',
      fields: [field],
    });
  }
  return groups.map((group) => ({
    ...group,
    // The label may only be derivable once the whole group is known.
    label: STEP_LABELS[group.stepNumber] ?? deriveStepLabel(group.fields),
    hint:
      STEP_HINTS[STEP_LABELS[group.stepNumber] ?? deriveStepLabel(group.fields)] ??
      FALLBACK_STEP_HINT,
  }));
};

// Mirrors the API's own email rule (forms.service.ts) so the client blocks
// what the server would reject, instead of surfacing a generic submit error.
const EMAIL_PATTERN = /^[^\s@]+@(?=[^\s@][^\s@]*\.[^\s@])[^\s@]+$/;
const MAX_EMAIL_LENGTH = 320;

const isRealCalendarDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

/**
 * The per-field format check for a non-empty value (emptiness is handled as a
 * required-ness question separately). Null means the value is fine for its
 * type; a string is the message to show under the control.
 */
export const intakeFormatError = (field: IntakeFormField, value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  if (field.type === 'email') {
    if (trimmed.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(trimmed)) {
      return 'Enter a valid email address.';
    }
  }
  if (field.type === 'number' && !Number.isFinite(Number(trimmed))) {
    return 'Enter a number.';
  }
  if (field.type === 'date' && !isRealCalendarDate(trimmed)) {
    return 'Enter a valid date.';
  }
  return null;
};

/**
 * Autofill tokens for the personal fields a new hire recognises. Exact and
 * suffix matches only — a contains-match would autofill the hire's own name
 * into the emergency contact's name, or offer an organisation token for a
 * bank. Anything uncertain is 'off' (ISS-005's lesson: scope tightly).
 */
export const intakeAutocompleteToken = (field: IntakeFormField): string => {
  const key = field.fieldKey;
  const lower = key.toLowerCase();
  // Another person's details, or payment identifiers: never autofill these.
  if (lower.startsWith('emergency')) return 'off';
  if (lower.startsWith('bank') || lower.includes('iban') || lower.includes('account')) {
    return 'off';
  }
  if (field.type === 'file' || field.type === 'select') return 'off';
  if (key === 'firstName' || key.endsWith('FirstName')) return 'given-name';
  if (key === 'lastName' || key.endsWith('LastName')) return 'family-name';
  if (key === 'middleName' || key.endsWith('MiddleName')) return 'additional-name';
  if (key === 'fullName' || key.endsWith('FullName')) return 'name';
  if (field.type === 'email' || lower.endsWith('email')) return 'email';
  if (field.type === 'phone' || lower.endsWith('phone') || lower.endsWith('mobile')) {
    return 'tel';
  }
  if (lower.includes('dateofbirth') || lower === 'dob' || lower === 'birthday') return 'bday';
  if (key === 'addressLine1' || key.endsWith('AddressLine1')) return 'address-line1';
  if (key === 'addressLine2' || key.endsWith('AddressLine2')) return 'address-line2';
  if (key === 'city' || key.endsWith('City') || lower.endsWith('town')) return 'address-level2';
  if (
    key === 'region' ||
    key.endsWith('Region') ||
    lower.endsWith('state') ||
    lower.endsWith('province')
  ) {
    return 'address-level1';
  }
  if (key === 'country' || key.endsWith('Country') || key.endsWith('CountryCode')) {
    return 'country-name';
  }
  if (
    key === 'postalCode' ||
    key.endsWith('PostalCode') ||
    lower.endsWith('zipcode') ||
    lower === 'zip'
  ) {
    return 'postal-code';
  }
  return 'off';
};

/** The virtual-keyboard hint for the field's type; undefined lets the browser
 *  pick from the input type itself (dates and plain text need no override). */
export const intakeInputMode = (
  field: IntakeFormField,
): 'email' | 'tel' | 'decimal' | undefined => {
  if (field.type === 'email') return 'email';
  if (field.type === 'phone') return 'tel';
  if (field.type === 'number') return 'decimal';
  return undefined;
};

export type IntakeAnswerFile = {
  readonly fileName: string;
  readonly sizeBytes: number;
};

/** A review row's display value: dates as calendar facts, everything else as
 *  submitted, missing answers as an explicit "Not provided". */
export const formatIntakeAnswer = (field: IntakeFormField, value: string): string => {
  const trimmed = value.trim();
  if (trimmed === '') return 'Not provided';
  if (field.type === 'date' && isRealCalendarDate(trimmed)) return formatDate(trimmed);
  return trimmed;
};

export const formatIntakeFileSize = (sizeBytes: number): string => {
  if (sizeBytes >= 1024 * 1024) return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
};

/**
 * A step is satisfied when every required field on it is answered (file
 * fields need their upload) and every answered value passes its format check.
 * Folding format validity in is what keeps Continue from advancing past a
 * malformed email — the exact gap ISS-004 logged for the workspace flow.
 */
export const isIntakeStepSatisfied = (
  fields: readonly IntakeFormField[],
  answers: Readonly<Record<string, string>>,
  files: Readonly<Record<string, IntakeAnswerFile>>,
): boolean => {
  for (const field of fields) {
    if (field.type === 'file') {
      if (field.required && files[field.fieldKey] === undefined) return false;
      continue;
    }
    const value = (answers[field.fieldKey] ?? '').trim();
    if (field.required && value === '') return false;
    if (intakeFormatError(field, value) !== null) return false;
  }
  return true;
};

export type IntakeReviewEntry = {
  readonly label: string;
  readonly value: string;
};

export type IntakeReviewGroup = {
  readonly key: string;
  readonly title: string;
  readonly entries: readonly IntakeReviewEntry[];
};

/**
 * Label/value rows for every field, grouped by step — the shape both the
 * public review step and the admin submission panel render. File answers show
 * the stored file name and size; text answers show their display value.
 */
export const buildIntakeReviewGroups = (
  groups: readonly IntakeFieldStepGroup[],
  answers: Readonly<Record<string, string>>,
  files: Readonly<Record<string, IntakeAnswerFile>>,
): readonly IntakeReviewGroup[] =>
  groups.map((group) => ({
    key: group.key,
    title: group.label,
    entries: group.fields.map((field): IntakeReviewEntry => {
      if (field.type === 'file') {
        const file = files[field.fieldKey];
        return {
          label: field.label,
          value: file
            ? `${file.fileName} · ${formatIntakeFileSize(file.sizeBytes)}`
            : 'Not provided',
        };
      }
      return {
        label: field.label,
        value: formatIntakeAnswer(field, answers[field.fieldKey] ?? ''),
      };
    }),
  }));

/** Answers as the flat map the review builder wants. */
export const intakeAnswersByKey = (
  answers: readonly IntakeSubmissionAnswer[],
): Readonly<Record<string, string>> =>
  Object.fromEntries(answers.map((answer) => [answer.fieldKey, answer.value]));

export type IntakeNewHireSummary = {
  readonly name: string;
  readonly email: string;
};

/**
 * The new hire's name and email for the submissions table, read out of the
 * answers with the definition's field types as the guide (an `email`-typed
 * field before any string containing '@').
 */
export const intakeNewHireSummary = (
  answers: readonly IntakeSubmissionAnswer[],
  fields: readonly IntakeFormField[],
): IntakeNewHireSummary => {
  const byKey = intakeAnswersByKey(answers);
  const valueOf = (key: string): string => (byKey[key] ?? '').trim();
  const emailField = fields.find((field) => field.type === 'email');
  const email =
    emailField !== undefined
      ? valueOf(emailField.fieldKey)
      : (answers.find((answer) => answer.value.includes('@'))?.value.trim() ?? '');
  const name =
    valueOf('fullName') ||
    [valueOf('firstName'), valueOf('lastName')].filter((part) => part !== '').join(' ') ||
    valueOf('preferredName');
  return { name: name !== '' ? name : 'New hire', email };
};
