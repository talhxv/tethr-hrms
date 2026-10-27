import { useMutation, useQuery } from '@apollo/client';
import { type FormEvent, type ReactElement, type ReactNode, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { uploadToSignedUrl } from '../../../app/upload';
import { useConfirm } from '../../../components/confirm/ConfirmProvider';
import {
  OnboardingCard,
  OnboardingFlow,
  useOnboardingSteps,
  type OnboardingStep,
} from '../../../components/onboarding/OnboardingFlow';
import { IntakeField } from '../components/IntakeField';
import { IntakeHeader } from '../components/IntakeHeader';
import { IntakeReview } from '../components/IntakeReview';
import { IntakeSuccess } from '../components/IntakeSuccess';
import { IntakeUnavailable } from '../components/IntakeUnavailable';
import { PREPARE_FORM_UPLOAD_MUTATION, SUBMIT_FORM_MUTATION } from '../graphql/forms.operations';
import {
  INTAKE_FORM_BY_LINK_QUERY,
  INTAKE_FORM_TARGET,
  type IntakeFormField,
  type IntakeFormRecord,
  type IntakeUploadedFile,
} from '../graphql/intake.operations';
import { buildIntakeReviewGroups, groupIntakeFields, isIntakeStepSatisfied } from '../intakeSteps';

type SubmitReceipt = {
  readonly id: string;
  readonly submittedAt: string;
};

// What prepareFormFileUpload returns (the apply page keeps this shape inline;
// typed here so the upload flow is checked end to end).
type PreparedUploadAccess = {
  readonly storageKey: string;
  readonly url: string;
  readonly method: string;
  readonly expiresAt: string;
  readonly headers: readonly { readonly name: string; readonly value: string }[];
};

// The public new-hire intake: a signed link opens a brand-skinned multi-step
// form (fields grouped by their `step`, a review step, then submitForm). The
// data flow mirrors the apply page — formByLink, prepareFormFileUpload +
// signed-URL upload, submitForm — reusing the OnboardingFlow chrome with this
// surface's own scoped styling.
export const EmployeeIntakePage = () => {
  const confirm = useConfirm();
  const { token = '' } = useParams<{ token: string }>();
  const { data, loading, error } = useQuery<{ readonly formByLink: IntakeFormRecord }>(
    INTAKE_FORM_BY_LINK_QUERY,
    { variables: { token }, skip: token.length === 0, fetchPolicy: 'network-only' },
  );
  const [prepareUpload] = useMutation<{
    readonly prepareFormFileUpload: PreparedUploadAccess;
  }>(PREPARE_FORM_UPLOAD_MUTATION);
  const [submitForm, { loading: submitting }] = useMutation<{
    readonly submitForm: SubmitReceipt;
  }>(SUBMIT_FORM_MUTATION);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, IntakeUploadedFile>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<SubmitReceipt | null>(null);

  const form = data?.formByLink ?? null;
  const fieldGroups = useMemo(() => (form === null ? [] : groupIntakeFields(form.fields)), [form]);
  const steps = useMemo<readonly OnboardingStep[]>(
    () => [
      ...fieldGroups.map((group) => ({ key: group.key, label: group.label, hint: group.hint })),
      { key: 'intake-review', label: 'Review', hint: 'Check your answers' },
    ],
    [fieldGroups],
  );
  const stepValidity = useMemo(
    () => [
      ...fieldGroups.map((group) => isIntakeStepSatisfied(group.fields, answers, files)),
      true,
    ],
    [fieldGroups, answers, files],
  );
  const { stepIndex, maxReachedIndex, stepValid, isLastStep, goToStep, goNext, goBack } =
    useOnboardingSteps(stepValidity);

  const onAnswerChange = (fieldKey: string, value: string): void =>
    setAnswers((current) => ({ ...current, [fieldKey]: value }));

  // Identical to the apply page's flow: the ticket is minted against the
  // link's token, the bytes go straight to object storage, and only the
  // descriptor is kept for submit.
  const onFileSelected = async (field: IntakeFormField, file: File | null): Promise<void> => {
    if (file === null) return;
    setUploadingField(field.fieldKey);
    setFormError(null);
    try {
      const contentType = file.type || 'application/octet-stream';
      const prepared = await prepareUpload({
        variables: {
          input: {
            token,
            fieldKey: field.fieldKey,
            fileName: file.name,
            contentType,
            sizeBytes: file.size,
          },
        },
      });
      const access = prepared.data?.prepareFormFileUpload;
      if (!access) throw new Error('Could not prepare the upload');
      await uploadToSignedUrl(access, file);
      setFiles((current) => ({
        ...current,
        [field.fieldKey]: {
          fieldKey: field.fieldKey,
          storageKey: access.storageKey,
          fileName: file.name,
          contentType,
          sizeBytes: file.size,
        },
      }));
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Could not upload the file');
    } finally {
      setUploadingField(null);
    }
  };

  // The step-0 "Cancel" affordance: destructive (it clears typed answers and
  // uploads), so it goes through the shared confirmation first.
  const onCancel = async (): Promise<void> => {
    const confirmed = await confirm({
      body: 'Everything you have entered so far will be removed.',
      cancelLabel: 'Keep editing',
      confirmLabel: 'Clear the form',
      title: 'Clear this form?',
      tone: 'danger',
    });
    if (!confirmed) return;
    setAnswers({});
    setFiles({});
    setFormError(null);
    goToStep(0);
  };

  const onFlowSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (form === null) return;
    if (!isLastStep) {
      goNext();
      return;
    }
    // Review was reached, but the rail lets a hire jump back to any reached
    // step and then forward again — so an earlier group can have gone
    // incomplete after the fact. Re-check every group before sending and land
    // the user on the first one that needs them.
    const incompleteIndex = fieldGroups.findIndex(
      (group) => !isIntakeStepSatisfied(group.fields, answers, files),
    );
    if (incompleteIndex >= 0) {
      setFormError('Some steps are incomplete — finish them before submitting.');
      goToStep(incompleteIndex);
      return;
    }
    setFormError(null);
    try {
      const result = await submitForm({
        variables: {
          input: {
            token,
            answers: Object.entries(answers)
              .filter(([, value]) => value.trim() !== '')
              .map(([fieldKey, value]) => ({ fieldKey, value })),
            files: Object.values(files).map((file) => ({ ...file })),
          },
        },
      });
      const submitted = result.data?.submitForm ?? null;
      if (submitted === null) throw new Error('Could not submit the form');
      setReceipt(submitted);
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Could not submit the form');
    }
  };

  const inCard = (children: ReactNode): ReactElement => (
    <main className="intake-page">
      <IntakeHeader />
      <section className="intake-card">{children}</section>
    </main>
  );

  if (loading) {
    return inCard(<p className="intake-page-copy">Loading the form…</p>);
  }
  if (error || form === null) {
    return inCard(
      <IntakeUnavailable
        description="Ask the person who sent it for a fresh link — they expire for security."
        title="This link is no longer valid"
      />,
    );
  }
  if (form.target !== INTAKE_FORM_TARGET) {
    return inCard(
      <IntakeUnavailable
        description="This link opens a different kind of form. Ask Tethr for the new-hire onboarding link."
        title="This is not a new-hire form"
      />,
    );
  }
  if (receipt !== null) {
    return inCard(<IntakeSuccess reference={receipt.id.slice(0, 8)} />);
  }

  return (
    <main className="intake-page">
      <IntakeHeader />
      <OnboardingFlow
        backLabel="Tethr"
        formError={formError}
        helpContent={
          <>
            <p>
              Stuck on a step, or a file will not upload? Email{' '}
              <a href="mailto:hr@tethrhq.com">hr@tethrhq.com</a> — we reply within one business day.
            </p>
            <p>Only the Tethr team setting up your employment record can see your answers.</p>
          </>
        }
        isLastStep={isLastStep}
        maxReachedIndex={maxReachedIndex}
        stepIndex={stepIndex}
        stepValid={stepValid}
        steps={steps}
        submitLabel="Submit"
        submitting={submitting}
        subtitle="A few details to set up your Tethr employment record."
        title={form.name}
        onBack={goBack}
        onCancel={() => void onCancel()}
        onStepSelect={goToStep}
        onSubmit={(event) => void onFlowSubmit(event)}
      >
        <div className="intake-card-head">
          <span aria-hidden="true" className="intake-card-rule" />
          <h1 className="intake-card-title">{form.name}</h1>
          <p className="intake-card-subtitle">
            A few details to set up your employment record. Fields marked{' '}
            <span aria-hidden="true">*</span> are required.
          </p>
        </div>

        {fieldGroups.map((group, index) =>
          stepIndex === index ? (
            <OnboardingCard key={group.key} note={group.hint} title={group.label}>
              {group.fields.map((field) => (
                <IntakeField
                  field={field}
                  key={field.id}
                  onChange={onAnswerChange}
                  onFileSelected={(fieldForFile, file) => void onFileSelected(fieldForFile, file)}
                  uploadedFile={files[field.fieldKey] ?? null}
                  uploading={uploadingField === field.fieldKey}
                  value={answers[field.fieldKey] ?? ''}
                />
              ))}
            </OnboardingCard>
          ) : null,
        )}

        {isLastStep ? (
          <IntakeReview
            groups={buildIntakeReviewGroups(fieldGroups, answers, files)}
            onEditGroup={(groupIndex) => goToStep(groupIndex)}
          />
        ) : null}
      </OnboardingFlow>
    </main>
  );
};
