import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('FormField')
export class FormFieldView {
  @Field(() => ID)
  id!: string;

  @Field()
  fieldKey!: string;

  @Field()
  label!: string;

  @Field()
  type!: string;

  @Field()
  required!: boolean;

  @Field(() => [String])
  options!: string[];

  @Field(() => Int)
  sortOrder!: number;

  @Field(() => Int, { nullable: true })
  step!: number | null;

  @Field(() => String, { nullable: true })
  mapsTo!: string | null;

  @Field(() => String, { nullable: true })
  helpText!: string | null;
}

@ObjectType('FormDefinition')
export class FormDefinitionView {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field()
  status!: string;

  @Field()
  target!: string;

  @Field()
  createdAt!: string;

  @Field(() => [FormFieldView])
  fields!: FormFieldView[];
}

// What the anonymous page renders. Narrower than the builder's view on
// purpose: no slug, status or `mapsTo` projection targets leak. `target` is
// exposed deliberately — the public page branches on it (an application form
// renders one page, an intake form renders its steps), and which engine a
// form feeds is not sensitive.
@ObjectType('PublicFormField')
export class PublicFormFieldView {
  @Field(() => ID)
  id!: string;

  @Field()
  fieldKey!: string;

  @Field()
  label!: string;

  @Field()
  type!: string;

  @Field()
  required!: boolean;

  @Field(() => [String])
  options!: string[];

  @Field(() => Int)
  sortOrder!: number;

  @Field(() => Int, { nullable: true })
  step!: number | null;

  @Field(() => String, { nullable: true })
  helpText!: string | null;
}

@ObjectType('PublicForm')
export class PublicFormView {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  target!: string;

  @Field(() => [PublicFormFieldView])
  fields!: PublicFormFieldView[];
}

@ObjectType('FormLink')
export class FormLinkView {
  @Field(() => ID)
  formDefinitionId!: string;

  @Field()
  token!: string;

  @Field()
  path!: string;
}

@ObjectType('FormUpload')
export class FormUploadView {
  @Field()
  storageKey!: string;

  @Field()
  url!: string;

  @Field()
  method!: string;

  @Field()
  expiresAt!: string;

  @Field(() => [FormUploadHeaderView])
  headers!: FormUploadHeaderView[];
}

@ObjectType('FormUploadHeader')
export class FormUploadHeaderView {
  @Field()
  name!: string;

  @Field()
  value!: string;
}

@ObjectType('FormSubmissionReceipt')
export class FormSubmissionReceiptView {
  @Field(() => ID)
  id!: string;

  @Field()
  submittedAt!: string;
}

// One answer of a stored submission. The jsonb record is surfaced as a typed
// list (the same shape SubmitFormAnswerInput uses) because the schema has no
// JSON scalar — and a list keeps the wire contract explicit.
@ObjectType('FormSubmissionAnswer')
export class FormSubmissionAnswerView {
  @Field()
  fieldKey!: string;

  @Field()
  value!: string;
}

@ObjectType('FormSubmissionFile')
export class FormSubmissionFileView {
  @Field()
  fieldKey!: string;

  @Field()
  storageKey!: string;

  @Field()
  fileName!: string;

  @Field()
  contentType!: string;

  @Field(() => Int)
  sizeBytes!: number;
}

// What a form manager sees in the submissions inbox. Generic across targets:
// `targetRefType`/`targetRefId` say what the projection produced (if anything),
// and the raw answers/files are passed through exactly as stored.
@ObjectType('FormSubmission')
export class FormSubmissionView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  formId!: string;

  @Field()
  submittedAt!: string;

  @Field()
  status!: string;

  @Field(() => String, { nullable: true })
  statusReason!: string | null;

  @Field(() => [FormSubmissionAnswerView])
  answers!: FormSubmissionAnswerView[];

  @Field(() => [FormSubmissionFileView])
  files!: FormSubmissionFileView[];

  @Field(() => String, { nullable: true })
  targetRefType!: string | null;

  @Field(() => ID, { nullable: true })
  targetRefId!: string | null;
}
