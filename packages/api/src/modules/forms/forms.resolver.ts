import { toId, type FormFieldType, type FormId, type FormSubmissionId, type FormTarget } from '@hrms/shared';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PERMISSIONS } from '../../core/authz/permissions';
import { PermissionsGuard } from '../../core/authz/permissions.guard';
import { RequirePermissions } from '../../core/authz/require-permissions.decorator';

import { CreateFormDefinitionInput, FormLinkInput } from './dto/form.inputs';
import { FormDefinitionView, FormLinkView, FormSubmissionView } from './dto/form.outputs';
import { toFormDefinitionView, toFormSubmissionView } from './form.mappers';
import { FormsService } from './forms.service';

// Where the public web serves each form kind. Exhaustive over FormTarget, so a
// new target fails typecheck until it gets a path (the application form and
// anything unrecognized-by-a-reader default to the apply page).
const PUBLIC_FORM_LINK_PATHS: Readonly<Record<FormTarget, string>> = {
  generic: '/apply',
  application: '/apply',
  employeeIntake: '/onboarding',
};

// The builder's operator surface (Tethr-side). Publishing mints the signed
// public link the applicant opens; the anonymous surface lives in
// PublicFormsResolver.
@Resolver(() => FormDefinitionView)
export class FormsResolver {
  constructor(
    private readonly forms: FormsService,
  ) {}

  @Query(() => [FormDefinitionView])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.formManage)
  async formDefinitions(): Promise<FormDefinitionView[]> {
    return (await this.forms.listForms()).map(toFormDefinitionView);
  }

  @Query(() => [FormSubmissionView])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.formManage)
  async formSubmissions(
    @Args('formId', { type: () => ID }) formId: string,
  ): Promise<FormSubmissionView[]> {
    return (await this.forms.listSubmissions(toId<FormId>(formId))).map(toFormSubmissionView);
  }

  @Query(() => FormSubmissionView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.formManage)
  async formSubmission(@Args('id', { type: () => ID }) id: string): Promise<FormSubmissionView> {
    return toFormSubmissionView(await this.forms.getSubmissionById(toId<FormSubmissionId>(id)));
  }

  @Mutation(() => FormDefinitionView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.formManage)
  async createFormDefinition(
    @Args('input') input: CreateFormDefinitionInput,
  ): Promise<FormDefinitionView> {
    const record = await this.forms.createForm({
      name: input.name,
      slug: input.slug,
      target: input.target as 'generic' | 'application' | 'employeeIntake' | undefined,
      status: input.status as 'draft' | 'published' | undefined,
      fields: input.fields.map((field) => ({
        fieldKey: field.fieldKey,
        label: field.label,
        type: field.type as FormFieldType,
        required: field.required ?? false,
        options: field.options ?? [],
        mapsTo: field.mapsTo ?? null,
        helpText: field.helpText ?? null,
        step: field.step ?? null,
      })),
    });
    return toFormDefinitionView(record);
  }

  // Seeds the standard application form (the form builder's first consumer) in
  // the caller's workspace; idempotent, so a posting can call it every time.
  @Mutation(() => FormDefinitionView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.formManage)
  async ensureApplicationFormDefinition(): Promise<FormDefinitionView> {
    return toFormDefinitionView(await this.forms.ensureApplicationForm());
  }

  // Seeds the employee onboarding intake form the same way: idempotent, so the
  // web can ensure-then-link in one place before sending the hire their link.
  @Mutation(() => FormDefinitionView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.formManage)
  async ensureEmployeeIntakeFormDefinition(): Promise<FormDefinitionView> {
    return toFormDefinitionView(await this.forms.ensureEmployeeIntakeForm());
  }

  @Mutation(() => FormLinkView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.formManage)
  async createFormLink(@Args('input') input: FormLinkInput): Promise<FormLinkView> {
    const record = await this.forms.getPublicForm(toId<FormId>(input.formDefinitionId));
    const { slug } = await this.forms.mintLink(toId<FormId>(record.form.id));
    return {
      formDefinitionId: record.form.id,
      token: slug,
      path: `${PUBLIC_FORM_LINK_PATHS[record.form.target]}/${slug}`,
    };
  }
}
