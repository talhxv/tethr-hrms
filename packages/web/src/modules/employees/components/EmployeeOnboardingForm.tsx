import { IconArrowLeft, IconArrowRight, IconCheck } from '@tabler/icons-react';
import { useState, type FormEvent } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';

export type EmployeeOnboardingFormValues = {
  readonly employeeNumber: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly salutation: string;
  readonly hireDate: string;
  readonly workEmail: string;
  readonly roleTitle: string;
  readonly dateOfBirth: string;
  readonly probationEndDate: string;
  readonly scheduledConfirmationDate: string;
  readonly finalConfirmationDate: string;
  readonly contractEndDate: string;
  readonly noticePeriodDays: string;
  readonly retirementDate: string;
  readonly holidayCalendarId: string;
  readonly workerType: string;
};

type EmployeeOnboardingFormProps = {
  readonly initialValues: EmployeeOnboardingFormValues;
  readonly workerTypeLabels: Record<string, string>;
  readonly submitting: boolean;
  readonly formError: string | null;
  readonly onSubmit: (values: EmployeeOnboardingFormValues) => void;
  readonly onCancel: () => void;
};

type StepKey = 'identity' | 'employment' | 'review';

const STEPS: ReadonlyArray<{ readonly key: StepKey; readonly label: string }> = [
  { key: 'identity', label: 'Identity' },
  { key: 'employment', label: 'Employment' },
  { key: 'review', label: 'Review' },
];

const formatReviewDate = (value: string): string => {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );
};

export const EmployeeOnboardingForm = ({
  initialValues,
  workerTypeLabels,
  submitting,
  formError,
  onSubmit,
  onCancel,
}: EmployeeOnboardingFormProps) => {
  const { theme } = useTheme();
  const [form, setForm] = useState<EmployeeOnboardingFormValues>(initialValues);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReachedIndex, setMaxReachedIndex] = useState(0);

  const setField = (key: keyof EmployeeOnboardingFormValues, value: string): void =>
    setForm((current) => ({ ...current, [key]: value }));

  const identityValid =
    form.employeeNumber.trim() !== '' && form.firstName.trim() !== '' && form.lastName.trim() !== '';
  const employmentValid = form.hireDate.trim() !== '';
  const stepValid = [identityValid, employmentValid, true][stepIndex] ?? false;
  const isLastStep = stepIndex === STEPS.length - 1;

  const goToStep = (index: number): void => {
    if (index <= maxReachedIndex) setStepIndex(index);
  };

  const goNext = (): void => {
    if (!stepValid) return;
    const next = Math.min(stepIndex + 1, STEPS.length - 1);
    setStepIndex(next);
    setMaxReachedIndex((current) => Math.max(current, next));
  };

  const goBack = (): void => setStepIndex((current) => Math.max(current - 1, 0));

  const onFormSubmit = (event: FormEvent): void => {
    event.preventDefault();
    if (!isLastStep) {
      goNext();
      return;
    }
    onSubmit(form);
  };

  return (
    <form
      className="table-shell onboarding-wizard"
      onSubmit={onFormSubmit}
      style={{ padding: theme.spacing(4), marginBottom: theme.spacing(4) }}
    >
      <div className="section-title-row">
        <div>
          <h2 className="section-title">Employee onboarding intake</h2>
          <p className="page-subtitle">
            Capture identity, role, joining date, probation, and worker type.
          </p>
        </div>
      </div>

      <ol className="stepper" aria-label="Onboarding steps">
        {STEPS.map((step, index) => (
          <li
            className={`stepper-step${index === stepIndex ? ' is-active' : ''}${
              index < stepIndex ? ' is-complete' : ''
            }`}
            key={step.key}
          >
            <button
              className="stepper-step-button"
              disabled={index > maxReachedIndex}
              type="button"
              onClick={() => goToStep(index)}
            >
              <span className="stepper-step-index">
                {index < stepIndex ? (
                  <IconCheck size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
                ) : (
                  index + 1
                )}
              </span>
              <span className="stepper-step-label">{step.label}</span>
            </button>
            {index < STEPS.length - 1 ? <span className="stepper-connector" aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>

      {formError ? (
        <p className="auth-error" role="alert">
          {formError}
        </p>
      ) : null}

      {stepIndex === 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing(3),
          }}
        >
          <div className="field">
            <label htmlFor="emp-number">Employee number</label>
            <input
              id="emp-number"
              required
              value={form.employeeNumber}
              onChange={(event) => setField('employeeNumber', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="emp-first">First name</label>
            <input
              id="emp-first"
              required
              value={form.firstName}
              onChange={(event) => setField('firstName', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="emp-middle">Middle name</label>
            <input
              id="emp-middle"
              value={form.middleName}
              onChange={(event) => setField('middleName', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="emp-last">Last name</label>
            <input
              id="emp-last"
              required
              value={form.lastName}
              onChange={(event) => setField('lastName', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="emp-salutation">Salutation</label>
            <select
              id="emp-salutation"
              value={form.salutation}
              onChange={(event) => setField('salutation', event.target.value)}
            >
              <option value="">Not set</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
              <option value="Mx">Mx</option>
              <option value="Dr">Dr</option>
              <option value="Prof">Prof</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="emp-dob">Date of birth</label>
            <input
              id="emp-dob"
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => setField('dateOfBirth', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="emp-email">Work email</label>
            <input
              id="emp-email"
              type="email"
              value={form.workEmail}
              onChange={(event) => setField('workEmail', event.target.value)}
            />
          </div>
        </div>
      ) : null}

      {stepIndex === 1 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing(3),
          }}
        >
          <div className="field">
            <label htmlFor="emp-hire">Hire date</label>
            <input
              id="emp-hire"
              required
              type="date"
              value={form.hireDate}
              onChange={(event) => setField('hireDate', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="emp-role">Role</label>
            <input
              id="emp-role"
              value={form.roleTitle}
              onChange={(event) => setField('roleTitle', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="emp-worker">Worker type</label>
            <select
              id="emp-worker"
              value={form.workerType}
              onChange={(event) => setField('workerType', event.target.value)}
            >
              {Object.entries(workerTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="emp-probation">Probation end</label>
            <input
              id="emp-probation"
              type="date"
              value={form.probationEndDate}
              onChange={(event) => setField('probationEndDate', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="emp-scheduled">Scheduled confirmation</label>
            <input
              id="emp-scheduled"
              type="date"
              value={form.scheduledConfirmationDate}
              onChange={(event) => setField('scheduledConfirmationDate', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="emp-contract">Contract end</label>
            <input
              id="emp-contract"
              type="date"
              value={form.contractEndDate}
              onChange={(event) => setField('contractEndDate', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="emp-notice">Notice period (days)</label>
            <input
              id="emp-notice"
              min={0}
              type="number"
              value={form.noticePeriodDays}
              onChange={(event) => setField('noticePeriodDays', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="emp-retirement">Retirement date</label>
            <input
              id="emp-retirement"
              type="date"
              value={form.retirementDate}
              onChange={(event) => setField('retirementDate', event.target.value)}
            />
          </div>
        </div>
      ) : null}

      {stepIndex === 2 ? (
        <div className="field-list onboarding-review">
          <div className="field-row">
            <span className="field-label">Name</span>
            <span className="field-value">
              {form.firstName || form.lastName ? `${form.firstName} ${form.lastName}`.trim() : 'Not set'}
            </span>
          </div>
          <div className="field-row">
            <span className="field-label">Employee number</span>
            <span className="field-value">{form.employeeNumber || 'Not set'}</span>
          </div>
          <div className="field-row">
            <span className="field-label">Date of birth</span>
            <span className="field-value">{formatReviewDate(form.dateOfBirth)}</span>
          </div>
          <div className="field-row">
            <span className="field-label">Work email</span>
            <span className="field-value">{form.workEmail || 'Not set'}</span>
          </div>
          <div className="field-row">
            <span className="field-label">Hire date</span>
            <span className="field-value">{formatReviewDate(form.hireDate)}</span>
          </div>
          <div className="field-row">
            <span className="field-label">Role</span>
            <span className="field-value">{form.roleTitle || 'Not set'}</span>
          </div>
          <div className="field-row">
            <span className="field-label">Worker type</span>
            <span className="field-value">{workerTypeLabels[form.workerType] ?? form.workerType}</span>
          </div>
          <div className="field-row">
            <span className="field-label">Probation end</span>
            <span className="field-value">{formatReviewDate(form.probationEndDate)}</span>
          </div>
        </div>
      ) : null}

      <div className="page-actions" style={{ marginTop: theme.spacing(3) }}>
        {stepIndex > 0 ? (
          <button className="button button-secondary" type="button" onClick={goBack}>
            <IconArrowLeft size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            Back
          </button>
        ) : (
          <button className="button button-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="button button-primary" disabled={!stepValid || submitting} type="submit">
          {isLastStep ? (
            submitting ? (
              'Saving...'
            ) : (
              'Create employee record'
            )
          ) : (
            <>
              Next
              <IconArrowRight size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
