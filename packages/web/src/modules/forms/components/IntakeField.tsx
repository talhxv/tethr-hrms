import { IconFileText, IconLoader2, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';

import { RequiredMark } from '../../../components/onboarding/OnboardingFlow';
import { useTheme } from '../../../providers/theme/useTheme';
import type { IntakeFormField, IntakeUploadedFile } from '../graphql/intake.operations';
import { intakeAutocompleteToken, intakeFormatError, intakeInputMode } from '../intakeSteps';
import { IntakeDateInput } from './IntakeDateInput';

const FILE_ACCEPT = '.pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg';
const FILE_HINT = 'PDF, Word, or image, up to 10\u00A0MB';

type IntakeFieldProps = {
  readonly field: IntakeFormField;
  /** The current text answer (file fields keep their answer in `uploadedFile`). */
  readonly value: string;
  readonly uploadedFile: IntakeUploadedFile | null;
  readonly uploading: boolean;
  readonly onChange: (fieldKey: string, value: string) => void;
  readonly onFileSelected: (field: IntakeFormField, file: File | null) => void;
};

const controlType = (field: IntakeFormField): 'text' | 'email' | 'tel' | 'number' | 'date' =>
  field.type === 'email'
    ? 'email'
    : field.type === 'phone'
      ? 'tel'
      : field.type === 'number'
        ? 'number'
        : field.type === 'date'
          ? 'date'
          : 'text';

/**
 * One intake field, rendered by its definition's type. Errors appear after the
 * control is touched (blur), carry `role='alert'`, and mark the control with
 * `aria-invalid` + `aria-describedby`; the step machinery in OnboardingFlow
 * additionally blocks Continue and focuses the first invalid control, so a
 * malformed value can never be advanced past (the ISS-004 lesson).
 */
export const IntakeField = ({
  field,
  value,
  uploadedFile,
  uploading,
  onChange,
  onFileSelected,
}: IntakeFieldProps) => {
  const { theme } = useTheme();
  const [touched, setTouched] = useState(false);
  const controlId = `intake-${field.fieldKey}`;
  const helpId = `${controlId}-help`;
  const errorId = `${controlId}-error`;
  const autoComplete = intakeAutocompleteToken(field);
  const inputMode = intakeInputMode(field);

  const isMissing =
    field.required && (field.type === 'file' ? uploadedFile === null : value.trim() === '');
  const formatError = intakeFormatError(field, value);
  const errorText = touched ? (isMissing ? `${field.label} is required.` : formatError) : null;
  const describedBy =
    errorText !== null
      ? field.helpText !== null
        ? `${helpId} ${errorId}`
        : errorId
      : field.helpText !== null
        ? helpId
        : undefined;
  const invalidAttributes =
    errorText !== null
      ? { 'aria-describedby': describedBy, 'aria-invalid': true }
      : { 'aria-describedby': describedBy };
  const markTouched = (): void => setTouched(true);

  return (
    <div className="field intake-field">
      <label htmlFor={controlId}>
        {field.label}
        {field.required ? <RequiredMark /> : null}
      </label>

      {field.type === 'file' ? (
        <div className="file-input">
          <label className="file-input-trigger" htmlFor={controlId}>
            Choose file
          </label>
          <span className="file-input-name">
            {uploading ? (
              <>
                <IconLoader2
                  aria-hidden="true"
                  size={theme.icon.size.sm}
                  stroke={theme.icon.stroke.sm}
                />{' '}
                Uploading…
              </>
            ) : uploadedFile !== null ? (
              <>
                <IconFileText
                  aria-hidden="true"
                  size={theme.icon.size.sm}
                  stroke={theme.icon.stroke.sm}
                />{' '}
                {uploadedFile.fileName}
              </>
            ) : (
              <>
                <IconUpload
                  aria-hidden="true"
                  size={theme.icon.size.sm}
                  stroke={theme.icon.stroke.sm}
                />{' '}
                {FILE_HINT}
              </>
            )}
          </span>
          <input
            accept={FILE_ACCEPT}
            className="file-input-native"
            id={controlId}
            name={controlId}
            required={field.required}
            type="file"
            {...invalidAttributes}
            onBlur={markTouched}
            onChange={(event) => onFileSelected(field, event.target.files?.[0] ?? null)}
          />
        </div>
      ) : field.type === 'textarea' ? (
        <textarea
          id={controlId}
          name={controlId}
          required={field.required}
          value={value}
          {...invalidAttributes}
          onChange={(event) => onChange(field.fieldKey, event.target.value)}
          onBlur={markTouched}
        />
      ) : field.type === 'select' ? (
        <select
          id={controlId}
          name={controlId}
          required={field.required}
          value={value}
          {...invalidAttributes}
          onBlur={markTouched}
          onChange={(event) => onChange(field.fieldKey, event.target.value)}
        >
          <option value="">Select…</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === 'date' ? (
        <IntakeDateInput
          id={controlId}
          invalidAttributes={invalidAttributes}
          name={controlId}
          required={field.required}
          value={value}
          onBlur={markTouched}
          onChange={(isoValue) => onChange(field.fieldKey, isoValue)}
        />
      ) : (
        <input
          autoComplete={autoComplete}
          id={controlId}
          inputMode={inputMode}
          name={controlId}
          required={field.required}
          spellCheck={
            field.type === 'email' || field.type === 'number'
              ? false
              : undefined
          }
          type={controlType(field)}
          value={value}
          {...invalidAttributes}
          onChange={(event) => onChange(field.fieldKey, event.target.value)}
          onBlur={markTouched}
        />
      )}

      {field.helpText !== null ? (
        <span className="intake-field-help" id={helpId}>
          {field.helpText}
        </span>
      ) : null}
      {errorText !== null ? (
        <p className="intake-field-error" id={errorId} role="alert">
          {errorText}
        </p>
      ) : null}
    </div>
  );
};
