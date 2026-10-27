import { gql } from '@apollo/client';
import type { FormFieldType, FormTarget } from '@hrms/shared';

// The employee-intake contract, web side. The public link surface reuses the
// application form's flow (formByLink → prepareFormFileUpload → submitForm),
// so those three documents stay in forms.operations.ts untouched. This file
// owns what the intake adds: a public query that also reads `target` (so the
// page can refuse non-intake links) and the per-field `step` grouping, plus
// the Tethr-admin surface (definition ensure, link minting, submissions).

// The target union lives in @hrms/shared (it includes 'employeeIntake');
// aliased here so this module's documents and wrapper types keep one name.
export type IntakeFormTarget = FormTarget;

export const INTAKE_FORM_TARGET: IntakeFormTarget = 'employeeIntake';

export type IntakeFormField = {
  readonly id: string;
  readonly fieldKey: string;
  readonly label: string;
  readonly type: FormFieldType;
  readonly required: boolean;
  readonly options: readonly string[];
  readonly sortOrder: number;
  readonly step: number | null;
  readonly helpText: string | null;
};

export type IntakeFormRecord = {
  readonly id: string;
  readonly name: string;
  readonly target: IntakeFormTarget;
  readonly fields: readonly IntakeFormField[];
};

export type IntakeFormDefinitionRecord = IntakeFormRecord & {
  readonly slug: string;
  readonly status: string;
  readonly createdAt: string;
};

export type IntakeFormLink = {
  readonly formDefinitionId: string;
  readonly token: string;
  readonly path: string;
};

// One uploaded file answer, kept exactly in the shape submitForm expects
// (mirrors the apply page's local UploadedFile).
export type IntakeUploadedFile = {
  readonly fieldKey: string;
  readonly storageKey: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
};

// The manager submission view. `answers` arrives as key/value pairs the same
// way SubmitFormAnswerInput is sent — GraphQL has no scalar for the stored
// jsonb map, so the API flattens it.
export type IntakeSubmissionAnswer = {
  readonly fieldKey: string;
  readonly value: string;
};

export type IntakeSubmissionFile = {
  readonly fieldKey: string;
  readonly storageKey: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
};

export type IntakeSubmissionStatus = 'pending' | 'projected' | 'rejected';

export type IntakeSubmissionRecord = {
  readonly id: string;
  readonly submittedAt: string;
  readonly status: IntakeSubmissionStatus;
  readonly statusReason: string | null;
  readonly answers: readonly IntakeSubmissionAnswer[];
  readonly files: readonly IntakeSubmissionFile[];
  readonly targetRefType: string | null;
  readonly targetRefId: string | null;
};

// The builder's FormField view also carries `step` (it is the same entity the
// public view reads), so both surfaces can group fields identically.
const INTAKE_MANAGER_FORM_FIELDS = gql`
  fragment IntakeManagerFormFields on FormField {
    id
    fieldKey
    label
    type
    required
    options
    sortOrder
    step
    helpText
  }
`;

// Deliberately a separate document from PUBLIC_FORM_QUERY: a second selection
// over formByLink would change what the apply page's cache entry holds. The
// two extra fields are the intake's own (target for the link-type check, step
// for grouping); everything else mirrors the apply page's selection.
export const INTAKE_FORM_BY_LINK_QUERY = gql`
  query IntakeFormByLink($token: String!) {
    formByLink(token: $token) {
      id
      name
      target
      fields {
        id
        fieldKey
        label
        type
        required
        options
        sortOrder
        step
        helpText
      }
    }
  }
`;

export const INTAKE_FORM_DEFINITIONS_QUERY = gql`
  ${INTAKE_MANAGER_FORM_FIELDS}
  query IntakeFormDefinitions {
    formDefinitions {
      id
      name
      slug
      status
      target
      createdAt
      fields {
        ...IntakeManagerFormFields
      }
    }
  }
`;

// Idempotent server-side: seeds the standard new-hire form definition the
// first time an admin mints a link, returns the existing one afterwards.
export const ENSURE_EMPLOYEE_INTAKE_FORM_MUTATION = gql`
  ${INTAKE_MANAGER_FORM_FIELDS}
  mutation EnsureEmployeeIntakeFormDefinition {
    ensureEmployeeIntakeFormDefinition {
      id
      name
      slug
      status
      target
      createdAt
      fields {
        ...IntakeManagerFormFields
      }
    }
  }
`;

export const CREATE_INTAKE_FORM_LINK_MUTATION = gql`
  mutation CreateIntakeFormLink($input: FormLinkInput!) {
    createFormLink(input: $input) {
      formDefinitionId
      token
      path
    }
  }
`;

export const INTAKE_FORM_SUBMISSIONS_QUERY = gql`
  query IntakeFormSubmissions($formId: ID!) {
    formSubmissions(formId: $formId) {
      id
      submittedAt
      status
      statusReason
      answers {
        fieldKey
        value
      }
      files {
        fieldKey
        storageKey
        fileName
        contentType
        sizeBytes
      }
      targetRefType
      targetRefId
    }
  }
`;

export const INTAKE_FORM_SUBMISSION_QUERY = gql`
  query IntakeFormSubmission($id: ID!) {
    formSubmission(id: $id) {
      id
      submittedAt
      status
      statusReason
      answers {
        fieldKey
        value
      }
      files {
        fieldKey
        storageKey
        fileName
        contentType
        sizeBytes
      }
      targetRefType
      targetRefId
    }
  }
`;
