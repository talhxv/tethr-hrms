import { useState, type FormEvent } from 'react';

import {
  OnboardingCard,
  OnboardingEditButton,
  OnboardingFlow,
  OnboardingReviewRow,
  RequiredMark,
  useOnboardingSteps,
  type OnboardingStep,
} from '../../../components/onboarding/OnboardingFlow';

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

const STEPS: readonly OnboardingStep[] = [
  { key: 'identity', label: 'Personal details', hint: 'Who this person is' },
  { key: 'employment', label: 'Employment details', hint: 'Role, dates, and terms' },
  { key: 'review', label: 'Review and confirm', hint: 'Check before creating' },
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
  const [form, setForm] = useState<EmployeeOnboardingFormValues>(initialValues);

  const identityValid =
    form.employeeNumber.trim() !== '' && form.firstName.trim() !== '' && form.lastName.trim() !== '';
  const employmentValid = form.hireDate.trim() !== '';
  const { stepIndex, maxReachedIndex, stepValid, isLastStep, goToStep, goNext, goBack } =
    useOnboardingSteps([identityValid, employmentValid, true]);

  const setField = (key: keyof EmployeeOnboardingFormValues, value: string): void =>
    setForm((current) => ({ ...current, [key]: value }));

  const fullName = `${form.firstName} ${form.middleName} ${form.lastName}`
    .replace(/\s+/g, ' ')
    .trim();

  const onFormSubmit = (event: FormEvent): void => {
    event.preventDefault();
    if (!isLastStep) {
      goNext();
      return;
    }
    onSubmit(form);
  };

  return (
    <OnboardingFlow
      backLabel="Employees"
      formError={formError}
      isLastStep={isLastStep}
      maxReachedIndex={maxReachedIndex}
      stepIndex={stepIndex}
      stepValid={stepValid}
      steps={STEPS}
      submitLabel="Create employee record"
      submitting={submitting}
      subtitle="Create the employment record. You can complete documents, pay, and onboarding tasks once the record exists."
      title="Onboard employee"
      helpContent={
        <>
          <p>
            Only the name, employee number, and hire date are required. Everything else can be
            filled in later from the employee record.
          </p>
          <p>
            After you create the record you can attach documents, set pay, assign a manager, and run
            the onboarding checklist.
          </p>
        </>
      }
      onBack={goBack}
      onCancel={onCancel}
      onStepSelect={goToStep}
      onSubmit={onFormSubmit}
    >
      {stepIndex === 0 ? (
        <>
          <OnboardingCard
            note="Use the legal name exactly as it appears on identity documents."
            title="Personal details"
          >
            <div className="onboarding-field-pair">
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
            </div>
            <div className="field">
              <label htmlFor="emp-first">
                First name <RequiredMark />
              </label>
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
              <label htmlFor="emp-last">
                Last name <RequiredMark />
              </label>
              <input
                id="emp-last"
                required
                value={form.lastName}
                onChange={(event) => setField('lastName', event.target.value)}
              />
            </div>
          </OnboardingCard>

          <OnboardingCard
            note="How this person is identified inside the workspace."
            title="Work identity"
          >
            <div className="field">
              <label htmlFor="emp-number">
                Employee number <RequiredMark />
              </label>
              <input
                id="emp-number"
                required
                value={form.employeeNumber}
                onChange={(event) => setField('employeeNumber', event.target.value)}
              />
              <p className="field-hint">
                Must be unique in this workspace. It appears on payslips and documents.
              </p>
            </div>
            <div className="field">
              <label htmlFor="emp-email">Work email</label>
              <input
                id="emp-email"
                type="email"
                value={form.workEmail}
                onChange={(event) => setField('workEmail', event.target.value)}
              />
              <p className="field-hint">
                Used to invite this person to their employee portal later on.
              </p>
            </div>
          </OnboardingCard>
        </>
      ) : null}

      {stepIndex === 1 ? (
        <>
          <OnboardingCard
            note="The joining facts the rest of the record is dated from."
            title="Role and start date"
          >
            <div className="field">
              <label htmlFor="emp-role">Role</label>
              <input
                id="emp-role"
                value={form.roleTitle}
                onChange={(event) => setField('roleTitle', event.target.value)}
              />
            </div>
            <div className="onboarding-field-pair">
              <div className="field">
                <label htmlFor="emp-hire">
                  Hire date <RequiredMark />
                </label>
                <input
                  id="emp-hire"
                  required
                  type="date"
                  value={form.hireDate}
                  onChange={(event) => setField('hireDate', event.target.value)}
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
            </div>
            <p className="field-hint">
              Leave dates below empty if they do not apply — every one of them is optional.
            </p>
          </OnboardingCard>

          <OnboardingCard
            note="Optional. Drives probation reminders and confirmation tasks."
            title="Probation and confirmation"
          >
            <div className="onboarding-field-pair">
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
            </div>
            <div className="field">
              <label htmlFor="emp-final">Final confirmation</label>
              <input
                id="emp-final"
                type="date"
                value={form.finalConfirmationDate}
                onChange={(event) => setField('finalConfirmationDate', event.target.value)}
              />
            </div>
          </OnboardingCard>

          <OnboardingCard
            note="Optional. Set these now for fixed-term or notice-bound contracts."
            title="Contract and exit terms"
          >
            <div className="onboarding-field-pair">
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
          </OnboardingCard>
        </>
      ) : null}

      {stepIndex === 2 ? (
        <>
          <OnboardingCard action={<OnboardingEditButton onClick={() => goToStep(0)} />} title="Personal details">
            <div className="field-list onboarding-review">
              <OnboardingReviewRow label="Name" value={fullName || 'Not set'} />
              <OnboardingReviewRow label="Salutation" value={form.salutation || 'Not set'} />
              <OnboardingReviewRow
                label="Date of birth"
                value={formatReviewDate(form.dateOfBirth)}
              />
              <OnboardingReviewRow
                label="Employee number"
                value={form.employeeNumber || 'Not set'}
              />
              <OnboardingReviewRow label="Work email" value={form.workEmail || 'Not set'} />
            </div>
          </OnboardingCard>

          <OnboardingCard
            action={<OnboardingEditButton onClick={() => goToStep(1)} />}
            title="Employment details"
          >
            <div className="field-list onboarding-review">
              <OnboardingReviewRow label="Role" value={form.roleTitle || 'Not set'} />
              <OnboardingReviewRow label="Hire date" value={formatReviewDate(form.hireDate)} />
              <OnboardingReviewRow
                label="Worker type"
                value={workerTypeLabels[form.workerType] ?? form.workerType}
              />
              <OnboardingReviewRow
                label="Probation end"
                value={formatReviewDate(form.probationEndDate)}
              />
              <OnboardingReviewRow
                label="Scheduled confirmation"
                value={formatReviewDate(form.scheduledConfirmationDate)}
              />
              <OnboardingReviewRow
                label="Final confirmation"
                value={formatReviewDate(form.finalConfirmationDate)}
              />
              <OnboardingReviewRow
                label="Contract end"
                value={formatReviewDate(form.contractEndDate)}
              />
              <OnboardingReviewRow
                label="Notice period"
                value={form.noticePeriodDays ? `${form.noticePeriodDays} days` : 'Not set'}
              />
              <OnboardingReviewRow
                label="Retirement date"
                value={formatReviewDate(form.retirementDate)}
              />
            </div>
          </OnboardingCard>
        </>
      ) : null}
    </OnboardingFlow>
  );
};
