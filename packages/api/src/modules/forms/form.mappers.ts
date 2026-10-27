import {
  FormDefinitionView,
  FormFieldView,
  FormSubmissionAnswerView,
  FormSubmissionFileView,
  FormSubmissionView,
  PublicFormFieldView,
  PublicFormView,
} from './dto/form.outputs';
import type { FormField } from './entities/form-field.entity';
import type { FormSubmission, FormSubmissionFile } from './entities/form-submission.entity';
import type { PublicForm } from './forms.service';

export const toFormFieldView = (field: FormField): FormFieldView => ({
  id: field.id,
  fieldKey: field.fieldKey,
  label: field.label,
  type: field.type,
  required: field.required,
  options: field.options,
  sortOrder: field.sortOrder,
  step: field.step,
  mapsTo: field.mapsTo,
  helpText: field.helpText,
});

export const toFormDefinitionView = (record: PublicForm): FormDefinitionView => ({
  id: record.form.id,
  name: record.form.name,
  slug: record.form.slug,
  status: record.form.status,
  target: record.form.target,
  createdAt: record.form.createdAt.toISOString(),
  fields: record.fields.map(toFormFieldView),
});

export const toPublicFormFieldView = (field: FormField): PublicFormFieldView => ({
  id: field.id,
  fieldKey: field.fieldKey,
  label: field.label,
  type: field.type,
  required: field.required,
  options: field.options,
  sortOrder: field.sortOrder,
  step: field.step,
  helpText: field.helpText,
});

export const toPublicFormView = (record: PublicForm): PublicFormView => ({
  id: record.form.id,
  name: record.form.name,
  target: record.form.target,
  fields: record.fields.map(toPublicFormFieldView),
});

const toFormSubmissionAnswerViews = (
  answers: Readonly<Record<string, string>>,
): FormSubmissionAnswerView[] =>
  Object.entries(answers).map(([fieldKey, value]) => ({ fieldKey, value }));

const toFormSubmissionFileViews = (
  files: readonly FormSubmissionFile[],
): FormSubmissionFileView[] =>
  files.map((file) => ({
    fieldKey: file.fieldKey,
    storageKey: file.storageKey,
    fileName: file.fileName,
    contentType: file.contentType,
    sizeBytes: file.sizeBytes,
  }));

export const toFormSubmissionView = (submission: FormSubmission): FormSubmissionView => ({
  id: submission.id,
  formId: submission.formId,
  submittedAt: submission.submittedAt.toISOString(),
  status: submission.status,
  statusReason: submission.statusReason,
  answers: toFormSubmissionAnswerViews(submission.answers),
  files: toFormSubmissionFileViews(submission.files),
  targetRefType: submission.targetRefType,
  targetRefId: submission.targetRefId,
});
