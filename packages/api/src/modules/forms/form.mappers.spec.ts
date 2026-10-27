import { toId, type FormId, type OrganizationId } from '@hrms/shared';

import { FormDefinition } from './entities/form-definition.entity';
import { FormField } from './entities/form-field.entity';
import type { FormSubmission } from './entities/form-submission.entity';
import {
  toFormSubmissionView,
  toPublicFormView,
} from './form.mappers';

const ORGANIZATION = toId<OrganizationId>('org-1');
const FORM = toId<FormId>('form-1');

const intakeForm = (): FormDefinition =>
  ({
    id: FORM,
    organizationId: ORGANIZATION,
    name: 'Employee onboarding intake',
    slug: 'employee-intake',
    status: 'published',
    target: 'employeeIntake',
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as FormDefinition;

const intakeField = (overrides: Partial<FormField>): FormField =>
  ({
    id: `field-${overrides.fieldKey ?? 'x'}`,
    organizationId: ORGANIZATION,
    formId: FORM,
    fieldKey: 'firstName',
    label: 'First name',
    type: 'text',
    required: true,
    options: [],
    sortOrder: 0,
    step: 1,
    mapsTo: 'employee.firstName',
    helpText: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as FormField;

describe('form view mappers', () => {
  it('exposes the target and the step layout on the public form view', () => {
    const view = toPublicFormView({
      form: intakeForm(),
      fields: [
        intakeField({ fieldKey: 'firstName', step: 1 }),
        intakeField({ fieldKey: 'addressLine1', step: 2, required: true, mapsTo: null }),
      ],
    });

    // The intake page branches on target and renders the steps; neither is
    // sensitive, and `mapsTo` stays invisible on this surface.
    expect(view.target).toBe('employeeIntake');
    expect(view.fields[0]).toMatchObject({ fieldKey: 'firstName', step: 1 });
    expect(view.fields[1]).toMatchObject({ fieldKey: 'addressLine1', step: 2 });
    expect(view.fields[0]).not.toHaveProperty('mapsTo');
  });

  it('keeps single-step fields readable as null steps', () => {
    const view = toPublicFormView({
      form: {
        ...intakeForm(),
        target: 'application',
        slug: 'application',
      } as FormDefinition,
      fields: [intakeField({ fieldKey: 'fullName', step: null, mapsTo: 'candidate.fullName' })],
    });

    expect(view.target).toBe('application');
    expect(view.fields[0].step).toBeNull();
  });

  it('passes a stored submission through as the manager-facing view', () => {
    const submittedAt = new Date('2026-10-23T09:30:00.000Z');
    const submission = {
      id: 'submission-1',
      organizationId: ORGANIZATION,
      createdAt: submittedAt,
      updatedAt: submittedAt,
      formId: FORM,
      answers: { firstName: 'Ada', personalEmail: 'ada@example.com' },
      files: [
        {
          fieldKey: 'curriculumVitae',
          storageKey: 'form-submissions/form-1/cv.pdf',
          fileName: 'cv.pdf',
          contentType: 'application/pdf',
          sizeBytes: 2048,
        },
      ],
      status: 'projected',
      statusReason: null,
      submittedAt,
      metadata: { ip: '127.0.0.1' },
      targetRefType: 'employee',
      targetRefId: 'employee-1',
    } as FormSubmission;

    const view = toFormSubmissionView(submission);

    expect(view).toMatchObject({
      id: 'submission-1',
      formId: FORM,
      submittedAt: submittedAt.toISOString(),
      status: 'projected',
      statusReason: null,
      targetRefType: 'employee',
      targetRefId: 'employee-1',
    });
    expect(view.answers).toEqual([
      { fieldKey: 'firstName', value: 'Ada' },
      { fieldKey: 'personalEmail', value: 'ada@example.com' },
    ]);
    expect(view.files).toEqual([
      {
        fieldKey: 'curriculumVitae',
        storageKey: 'form-submissions/form-1/cv.pdf',
        fileName: 'cv.pdf',
        contentType: 'application/pdf',
        sizeBytes: 2048,
      },
    ]);
    // The submission's metadata is not part of the manager view.
    expect(view).not.toHaveProperty('metadata');
  });
});
